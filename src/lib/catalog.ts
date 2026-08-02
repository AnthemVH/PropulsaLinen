import {
  DESIGN_COLLECTIONS,
  getProductTypeByShopifyType,
  PRODUCT_TYPES,
  type DesignCollection,
} from "@/lib/content/designs";
import type { Product } from "@/lib/shopify/types";
import { isColourOption, isSizeOption } from "@/lib/utils";

/**
 * Catalogue-level helpers that sit between Shopify data and the UI: resolving a
 * product's design, and deriving filter facets from whatever is actually in the
 * catalogue rather than a hardcoded list.
 */

export function resolveDesign(product: Product): DesignCollection | undefined {
  if (product.designHandle) {
    const byHandle = DESIGN_COLLECTIONS.find(
      (design) => design.handle === product.designHandle,
    );
    if (byHandle) return byHandle;
  }

  const byName = DESIGN_COLLECTIONS.find((design) =>
    product.title.toLowerCase().includes(design.name.toLowerCase()),
  );
  if (byName) return byName;

  // While the house runs a single collection, an untagged product belongs to
  // it by definition. Once a second collection exists this stops guessing and
  // the metafield or tag becomes required.
  return DESIGN_COLLECTIONS.length === 1 ? DESIGN_COLLECTIONS[0] : undefined;
}

/**
 * The motif forms are no longer surfaced anywhere in the UI — the colorways
 * carry the collection's visual system on their own. `MOTIF_FORMS` and
 * `PRODUCT_BLUEPRINTS` stay in the content layer as brand specification, but
 * nothing resolves them onto a product any more, so the helpers that did are
 * gone rather than left as dead code.
 */

export function productsByDesign(
  products: Product[],
  designHandle: string,
): Product[] {
  return products.filter(
    (product) => resolveDesign(product)?.handle === designHandle,
  );
}

export function productTypeSlug(product: Product): string | null {
  const planned = getProductTypeByShopifyType(product.productType);
  if (planned) return planned.slug;
  // A product whose type is not one of the planned house categories still gets
  // a category of its own, derived from Shopify. Nothing in the store is
  // allowed to fall out of the navigation.
  return product.productType ? slugify(product.productType) : null;
}

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export type Category = {
  slug: string;
  label: string;
  blurb: string | null;
  count: number;
  /** True when this category exists in the house plan but not yet in Shopify. */
  planned: boolean;
};

/**
 * The category list, built from the live catalogue first and the house plan
 * second. Categories with products are real and browsable; planned categories
 * with none are shown as "in preparation" so the intended shape of the range
 * is legible without inventing products to fill it.
 */
export function deriveCategories(products: Product[]): Category[] {
  const counts = new Map<string, number>();
  const labels = new Map<string, string>();

  for (const product of products) {
    const slug = productTypeSlug(product);
    if (!slug) continue;

    counts.set(slug, (counts.get(slug) ?? 0) + 1);
    if (!labels.has(slug)) {
      labels.set(
        slug,
        getProductTypeByShopifyType(product.productType)?.plural ??
          product.productType,
      );
    }
  }

  const live: Category[] = [...counts.entries()].map(([slug, count]) => ({
    slug,
    label: labels.get(slug) ?? slug,
    blurb: PRODUCT_TYPES.find((type) => type.slug === slug)?.blurb ?? null,
    count,
    planned: false,
  }));

  const planned: Category[] = PRODUCT_TYPES.filter(
    (type) => !counts.has(type.slug),
  ).map((type) => ({
    slug: type.slug,
    label: type.plural,
    blurb: type.blurb,
    count: 0,
    planned: true,
  }));

  return [...live, ...planned];
}

export function findCategory(
  categories: Category[],
  slug: string,
): Category | undefined {
  return categories.find((category) => category.slug === slug);
}

export function productsInCategory(
  products: Product[],
  slug: string,
): Product[] {
  return products.filter((product) => productTypeSlug(product) === slug);
}

export type Facets = {
  productTypes: { slug: string; label: string; count: number }[];
  designs: { handle: string; label: string; count: number }[];
  sizes: string[];
  colours: string[];
};

/** Derives the filter sidebar from the products on the page. */
export function buildFacets(products: Product[]): Facets {
  const typeCounts = new Map<string, number>();
  const typeLabels = new Map<string, string>();
  const designCounts = new Map<string, number>();
  const sizes = new Set<string>();
  const colours = new Set<string>();

  for (const product of products) {
    const slug = productTypeSlug(product);
    if (slug) {
      typeCounts.set(slug, (typeCounts.get(slug) ?? 0) + 1);
      if (!typeLabels.has(slug)) {
        typeLabels.set(
          slug,
          getProductTypeByShopifyType(product.productType)?.plural ??
            product.productType,
        );
      }
    }

    const design = resolveDesign(product);
    if (design) {
      designCounts.set(
        design.handle,
        (designCounts.get(design.handle) ?? 0) + 1,
      );
    }

    for (const option of product.options) {
      if (isSizeOption(option.name)) {
        option.values.forEach((value) => sizes.add(value));
      }
      if (isColourOption(option.name)) {
        option.values.forEach((value) => colours.add(value));
      }
    }
  }

  return {
    productTypes: [...typeCounts.entries()].map(([slug, count]) => ({
      slug,
      label: typeLabels.get(slug) ?? slug,
      count,
    })),
    designs: [...designCounts.entries()].map(([handle, count]) => ({
      handle,
      label:
        DESIGN_COLLECTIONS.find((design) => design.handle === handle)?.name ??
        handle,
      count,
    })),
    sizes: [...sizes],
    colours: [...colours],
  };
}

export type CatalogFilters = {
  type?: string[];
  design?: string[];
  size?: string[];
  colour?: string[];
};

/** True when the product has at least one variant matching every active facet. */
export function matchesFilters(
  product: Product,
  filters: CatalogFilters,
): boolean {
  const { type, design, size, colour } = filters;

  if (type?.length) {
    const slug = productTypeSlug(product);
    if (!slug || !type.includes(slug)) return false;
  }

  if (design?.length) {
    const handle = resolveDesign(product)?.handle;
    if (!handle || !design.includes(handle)) return false;
  }

  // Size and colour are variant-level: a product qualifies if any single
  // variant satisfies all of the selected variant facets at once.
  if (size?.length || colour?.length) {
    const hasMatchingVariant = product.variants.some((variant) => {
      const value = (matches: (name: string) => boolean) =>
        variant.selectedOptions.find((option) => matches(option.name))?.value;

      const variantSize = value(isSizeOption);
      const variantColour = value(isColourOption);

      if (size?.length && (!variantSize || !size.includes(variantSize))) {
        return false;
      }
      if (colour?.length && (!variantColour || !colour.includes(variantColour))) {
        return false;
      }
      return true;
    });

    if (!hasMatchingVariant) return false;
  }

  return true;
}

/** Normalises a `searchParams` value into a string array. */
export function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : value.split(",").filter(Boolean);
}
