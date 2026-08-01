import "server-only";

/**
 * Storefront API transport.
 *
 * Server-only by construction: the access token is read from a non-public env
 * var and `server-only` makes an accidental client import a build error. The
 * Admin API is never used here — Storefront API is the whole surface.
 */

const DEFAULT_API_VERSION = "2025-07";

export type ShopifyConfig = {
  domain: string;
  token: string;
  apiVersion: string;
};

export class ShopifyError extends Error {
  constructor(
    message: string,
    readonly detail?: unknown,
  ) {
    super(message);
    this.name = "ShopifyError";
  }
}

/**
 * Returns the Shopify config, or `null` when the store is not wired up.
 * There is no fallback catalogue: the storefront shows what the store returns
 * and nothing else, so a missing config is a hard configuration error rather
 * than a quietly-degraded page of invented products.
 */
export function getShopifyConfig(): ShopifyConfig | null {
  const domain = process.env.SHOPIFY_STORE_DOMAIN?.trim();
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN?.trim();

  if (!domain || !token) return null;

  return {
    domain: domain.replace(/^https?:\/\//, "").replace(/\/$/, ""),
    token,
    apiVersion: process.env.SHOPIFY_API_VERSION?.trim() || DEFAULT_API_VERSION,
  };
}

export function isShopifyConfigured(): boolean {
  return getShopifyConfig() !== null;
}

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string; path?: string[] }>;
};

type FetchOptions = {
  query: string;
  variables?: Record<string, unknown>;
  /** Cache tags for on-demand revalidation via a Shopify webhook. */
  tags?: string[];
  /** Seconds. Omit for mutations, which must never be cached. */
  revalidate?: number | false;
};

/**
 * Catalogue cache lifetime.
 *
 * Kept short because a stale catalogue is not merely out of date — it offers
 * variants that may no longer exist, and add-to-cart fails on them. The
 * `/api/revalidate` webhook is the precise mechanism; this is the backstop for
 * changes that arrive without one, which is the normal case for a
 * print-on-demand app republishing its catalogue.
 */
const CATALOGUE_REVALIDATE_SECONDS = 60;

export async function shopifyFetch<T>({
  query,
  variables,
  tags,
  revalidate = CATALOGUE_REVALIDATE_SECONDS,
}: FetchOptions): Promise<T> {
  const config = getShopifyConfig();

  if (!config) {
    throw new ShopifyError(
      "Shopify is not configured. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN.",
    );
  }

  const endpoint = `https://${config.domain}/api/${config.apiVersion}/graphql.json`;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": config.token,
      },
      body: JSON.stringify({ query, variables }),
      ...(revalidate === false
        ? { cache: "no-store" as const }
        : { next: { revalidate, tags } }),
    });
  } catch (error) {
    throw new ShopifyError("Storefront API request failed", error);
  }

  if (!response.ok) {
    throw new ShopifyError(
      `Storefront API returned ${response.status} ${response.statusText}`,
      await response.text().catch(() => undefined),
    );
  }

  const body = (await response.json()) as GraphQLResponse<T>;

  if (body.errors?.length) {
    throw new ShopifyError(
      body.errors.map((e) => e.message).join("; "),
      body.errors,
    );
  }

  if (!body.data) {
    throw new ShopifyError("Storefront API returned no data");
  }

  return body.data;
}

/** Cache tags, so a Shopify webhook can revalidate precisely. */
export const TAGS = {
  products: "shopify:products",
  collections: "shopify:collections",
} as const;
