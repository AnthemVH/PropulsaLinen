import "server-only";

import { getShopifyConfig, shopifyFetch, TAGS } from "./client";
import {
  addToCartMutation,
  createCartMutation,
  getCartQuery,
  getCollectionProductsQuery,
  getCollectionQuery,
  getCollectionsQuery,
  getProductHandlesQuery,
  getProductQuery,
  getProductsQuery,
  removeFromCartMutation,
  updateCartMutation,
} from "./queries";
import type {
  Cart,
  Collection,
  Image,
  Product,
  ProductVariant,
  SortKey,
} from "./types";

export { isShopifyConfigured, ShopifyError } from "./client";
export type * from "./types";

const PRODUCT_LIMIT = 250;

/* -------------------------------------------------------------------------- */
/* Reshaping                                                                   */
/* -------------------------------------------------------------------------- */

type RawImage = {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
} | null;

function reshapeImage(image: RawImage, fallbackAlt: string): Image | null {
  if (!image?.url) return null;
  return {
    url: image.url,
    altText: image.altText ?? fallbackAlt,
    width: image.width ?? 1200,
    height: image.height ?? 1200,
  };
}

/**
 * Print-on-demand feeds (Contrado among them) append a stylesheet to the
 * plain-text `description` field. That text is what the product lede and the
 * fallback meta description are built from, so the CSS has to come off before
 * it reaches either.
 */
function cleanDescription(raw: string): string {
  if (!raw) return "";

  const firstRule = raw.indexOf("{");
  if (firstRule === -1) return raw.replace(/\s+/g, " ").trim();

  return raw
    .slice(0, firstRule)
    // Drop the dangling selector that preceded the brace.
    .replace(/[.#][A-Za-z0-9_-][^\s]*\s*$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

/* eslint-disable @typescript-eslint/no-explicit-any */

function reshapeProduct(raw: any): Product {
  const title: string = raw.title ?? "";

  const variants: ProductVariant[] = (raw.variants?.nodes ?? []).map(
    (variant: any) => ({
      id: variant.id,
      title: variant.title,
      availableForSale: Boolean(variant.availableForSale),
      selectedOptions: variant.selectedOptions ?? [],
      price: variant.price,
      compareAtPrice: variant.compareAtPrice ?? null,
      image: reshapeImage(variant.image, title),
      sku: variant.sku ?? null,
    }),
  );

  const tags: string[] = raw.tags ?? [];
  const designTag = tags.find((tag) => tag.startsWith("design:"));

  return {
    id: raw.id,
    handle: raw.handle,
    title,
    description: cleanDescription(raw.description ?? ""),
    descriptionHtml: raw.descriptionHtml ?? "",
    productType: raw.productType ?? "",
    vendor: raw.vendor ?? "",
    tags,
    availableForSale: Boolean(raw.availableForSale),
    options: (raw.options ?? []).map((option: any) => ({
      id: option.id,
      name: option.name,
      // Storefront API 2025-01+ returns `optionValues`; older versions return
      // a plain `values` array. Accept both.
      values:
        option.optionValues?.map((value: any) => value.name) ??
        option.values ??
        [],
    })),
    variants,
    images: (raw.images?.nodes ?? [])
      .map((image: RawImage) => reshapeImage(image, title))
      .filter(Boolean) as Image[],
    featuredImage: reshapeImage(raw.featuredImage, title),
    priceRange: raw.priceRange,
    seo: {
      title: raw.seo?.title ?? null,
      description: raw.seo?.description ?? null,
    },
    materialStory: raw.materialStory?.value ?? null,
    careInstructions: raw.careInstructions?.value ?? null,
    designHandle: raw.design?.value ?? designTag?.slice("design:".length) ?? null,
  };
}

function reshapeCollection(raw: any): Collection {
  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    description: raw.description ?? "",
    descriptionHtml: raw.descriptionHtml ?? "",
    image: reshapeImage(raw.image, raw.title),
    seo: {
      title: raw.seo?.title ?? null,
      description: raw.seo?.description ?? null,
    },
    updatedAt: raw.updatedAt ?? "",
  };
}

/**
 * Shopify issues `checkoutUrl` on the store's *primary* domain, whatever that
 * domain is currently serving. When the house's own name has been repointed at
 * this storefront — the usual step when a store goes headless — checkout links
 * lead back here, and the customer meets our 404 at the moment they try to pay.
 *
 * There is no client-side repair for it: the myshopify domain 301s straight
 * back to the primary domain, so rewriting the host only lengthens the trip to
 * the same dead page. Drop the url instead, so the cart states plainly that
 * checkout is unavailable, and log what has to change in the Shopify admin.
 */
let checkoutDomainReported = false;

function resolveCheckoutUrl(raw: string | null | undefined): string | null {
  const storefront = process.env.NEXT_PUBLIC_SITE_URL;
  if (!raw || !storefront) return raw ?? null;

  let checkoutHost: string;
  try {
    checkoutHost = new URL(raw).hostname.replace(/^www\./, "");
    if (checkoutHost !== new URL(storefront).hostname.replace(/^www\./, "")) {
      return raw;
    }
  } catch {
    return raw;
  }

  // Every cart read hits this, so say it once per process rather than burying
  // the rest of the log under it.
  if (!checkoutDomainReported) {
    checkoutDomainReported = true;
    console.error(
      `[shopify] checkoutUrl is on ${checkoutHost}, which this storefront serves — ` +
        "checkout would 404. Shopify's primary domain must be one Shopify itself " +
        "serves: set it to the myshopify domain, or to a subdomain whose DNS " +
        "points at Shopify, under Settings → Domains.",
    );
  }

  return null;
}

function reshapeCart(raw: any): Cart {
  return {
    id: raw.id,
    checkoutUrl: resolveCheckoutUrl(raw.checkoutUrl),
    totalQuantity: raw.totalQuantity ?? 0,
    cost: {
      subtotalAmount: raw.cost.subtotalAmount,
      totalAmount: raw.cost.totalAmount,
      totalTaxAmount: raw.cost.totalTaxAmount ?? null,
    },
    lines: (raw.lines?.nodes ?? []).map((line: any) => ({
      id: line.id,
      quantity: line.quantity,
      cost: line.cost,
      merchandise: {
        id: line.merchandise.id,
        title: line.merchandise.title,
        selectedOptions: line.merchandise.selectedOptions ?? [],
        image: reshapeImage(
          line.merchandise.image,
          line.merchandise.product.title,
        ),
        product: line.merchandise.product,
      },
    })),
  };
}

type CartUserError = { field?: string[] | null; message: string };

/**
 * A cart mutation Shopify rejected, carrying the errors as it reported them.
 *
 * The messages alone cannot be told apart: an expired cart and a withdrawn
 * variant both come back as "... does not exist", and only `field` says which
 * — `["cartId"]` against `["input","lines","0","merchandiseId"]`. Those two
 * need opposite handling, so the structure is kept rather than flattened into
 * a string for the caller to guess at.
 */
export class CartMutationError extends Error {
  constructor(
    message: string,
    readonly userErrors: CartUserError[] = [],
  ) {
    super(message);
    this.name = "CartMutationError";
  }

  /** Whether Shopify blamed the named input, e.g. `cartId`, `merchandiseId`. */
  blames(field: string): boolean {
    return this.userErrors.some((error) => error.field?.includes(field));
  }
}

function unwrapCartMutation(payload: any, operation: string): Cart {
  const errors: CartUserError[] = payload?.userErrors ?? [];
  if (errors.length) {
    throw new CartMutationError(
      `${operation} failed: ${errors.map((e) => e.message).join("; ")}`,
      errors,
    );
  }
  if (!payload?.cart) {
    throw new CartMutationError(`${operation} returned no cart`);
  }
  return reshapeCart(payload.cart);
}

/* eslint-enable @typescript-eslint/no-explicit-any */

/* -------------------------------------------------------------------------- */
/* Sorting                                                                     */
/* -------------------------------------------------------------------------- */

/** `products` root query uses ProductSortKeys. */
const PRODUCT_SORT: Record<SortKey, { sortKey: string; reverse: boolean }> = {
  featured: { sortKey: "BEST_SELLING", reverse: false },
  newest: { sortKey: "CREATED_AT", reverse: true },
  "price-asc": { sortKey: "PRICE", reverse: false },
  "price-desc": { sortKey: "PRICE", reverse: true },
};

/** Collection products use ProductCollectionSortKeys — different enum names. */
const COLLECTION_SORT: Record<SortKey, { sortKey: string; reverse: boolean }> = {
  featured: { sortKey: "COLLECTION_DEFAULT", reverse: false },
  newest: { sortKey: "CREATED", reverse: true },
  "price-asc": { sortKey: "PRICE", reverse: false },
  "price-desc": { sortKey: "PRICE", reverse: true },
};

/* -------------------------------------------------------------------------- */
/* Products                                                                    */
/* -------------------------------------------------------------------------- */

export async function getProduct(handle: string): Promise<Product | null> {
  const data = await shopifyFetch<{ product: unknown }>({
    query: getProductQuery,
    variables: { handle },
    tags: [TAGS.products],
  });

  return data.product ? reshapeProduct(data.product) : null;
}

export async function getProducts(
  options: { query?: string; sort?: SortKey; first?: number } = {},
): Promise<Product[]> {
  const { query, sort = "featured", first = PRODUCT_LIMIT } = options;
  const { sortKey, reverse } = PRODUCT_SORT[sort];

  const data = await shopifyFetch<{ products: { nodes: unknown[] } }>({
    query: getProductsQuery,
    variables: { first, query, sortKey, reverse },
    tags: [TAGS.products],
  });

  return data.products.nodes.map(reshapeProduct);
}

export async function getProductHandles(): Promise<string[]> {
  const data = await shopifyFetch<{
    products: { nodes: { handle: string }[] };
  }>({
    query: getProductHandlesQuery,
    variables: { first: PRODUCT_LIMIT },
    tags: [TAGS.products],
  });

  return data.products.nodes.map((node) => node.handle);
}

/* -------------------------------------------------------------------------- */
/* Collections                                                                 */
/* -------------------------------------------------------------------------- */

export async function getCollection(
  handle: string,
): Promise<Collection | null> {
  const data = await shopifyFetch<{ collection: unknown }>({
    query: getCollectionQuery,
    variables: { handle },
    tags: [TAGS.collections],
  });

  return data.collection ? reshapeCollection(data.collection) : null;
}

export async function getCollections(): Promise<Collection[]> {
  const data = await shopifyFetch<{ collections: { nodes: unknown[] } }>({
    query: getCollectionsQuery,
    variables: { first: 100 },
    tags: [TAGS.collections],
  });

  return data.collections.nodes
    .map(reshapeCollection)
    // Shopify auto-creates a `frontpage` collection that we merchandise
    // through the homepage instead.
    .filter((collection) => collection.handle !== "frontpage");
}

export async function getCollectionProducts(
  handle: string,
  sort: SortKey = "featured",
): Promise<Product[]> {
  const { sortKey, reverse } = COLLECTION_SORT[sort];

  const data = await shopifyFetch<{
    collection: { products: { nodes: unknown[] } } | null;
  }>({
    query: getCollectionProductsQuery,
    variables: { handle, first: PRODUCT_LIMIT, sortKey, reverse },
    tags: [TAGS.collections, TAGS.products],
  });

  return (data.collection?.products.nodes ?? []).map(reshapeProduct);
}

/* -------------------------------------------------------------------------- */
/* Cart                                                                        */
/* -------------------------------------------------------------------------- */

export async function createCart(
  lines: { merchandiseId: string; quantity: number }[] = [],
): Promise<Cart> {
  const data = await shopifyFetch<{ cartCreate: unknown }>({
    query: createCartMutation,
    variables: { lines },
    revalidate: false,
  });

  return unwrapCartMutation(data.cartCreate, "cartCreate");
}

export async function getCart(cartId: string): Promise<Cart | null> {
  const data = await shopifyFetch<{ cart: unknown }>({
    query: getCartQuery,
    variables: { cartId },
    revalidate: false,
  });

  // Shopify expires carts after ~10 days; a stale cookie resolves to null.
  return data.cart ? reshapeCart(data.cart) : null;
}

export async function addCartLines(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[],
): Promise<Cart> {
  const data = await shopifyFetch<{ cartLinesAdd: unknown }>({
    query: addToCartMutation,
    variables: { cartId, lines },
    revalidate: false,
  });

  return unwrapCartMutation(data.cartLinesAdd, "cartLinesAdd");
}

export async function updateCartLines(
  cartId: string,
  lines: { id: string; quantity: number }[],
): Promise<Cart> {
  const data = await shopifyFetch<{ cartLinesUpdate: unknown }>({
    query: updateCartMutation,
    variables: { cartId, lines },
    revalidate: false,
  });

  return unwrapCartMutation(data.cartLinesUpdate, "cartLinesUpdate");
}

export async function removeCartLines(
  cartId: string,
  lineIds: string[],
): Promise<Cart> {
  const data = await shopifyFetch<{ cartLinesRemove: unknown }>({
    query: removeFromCartMutation,
    variables: { cartId, lineIds },
    revalidate: false,
  });

  return unwrapCartMutation(data.cartLinesRemove, "cartLinesRemove");
}

/** Surfaced in the UI so an unconfigured deployment is obvious. */
export function storeStatus() {
  const config = getShopifyConfig();
  return {
    configured: config !== null,
    domain: config?.domain ?? null,
    apiVersion: config?.apiVersion ?? null,
  };
}
