import type { MetadataRoute } from "next";

import { deriveCategories } from "@/lib/catalog";
import { DESIGN_COLLECTIONS } from "@/lib/content/designs";
import { SITE } from "@/lib/content/site";
import { getCollections, getProductHandles, getProducts } from "@/lib/shopify";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // The static routes below are always valid; catalogue entries are added only
  // if the store answers, so a Shopify outage yields a smaller sitemap rather
  // than a failed build.
  const [handles, collections, products] = await Promise.all([
    getProductHandles().catch(() => [] as string[]),
    getCollections().catch(() => []),
    getProducts().catch(() => []),
  ]);

  // Only categories the store can actually fill belong in a sitemap.
  const categories = deriveCategories(products).filter(
    (category) => !category.planned,
  );

  const url = (path: string) => `${SITE.url}${path}`;

  const statics: MetadataRoute.Sitemap = [
    { url: url("/"), priority: 1 },
    { url: url("/shop"), priority: 0.9 },
    { url: url("/designs"), priority: 0.9 },
    { url: url("/collections"), priority: 0.7 },
    { url: url("/about"), priority: 0.7 },
    { url: url("/shipping-returns"), priority: 0.4 },
    { url: url("/faq"), priority: 0.4 },
    { url: url("/contact"), priority: 0.4 },
  ];

  return [
    ...statics,
    ...categories.map((category) => ({
      url: url(`/shop/${category.slug}`),
      priority: 0.8,
    })),
    ...DESIGN_COLLECTIONS.map((design) => ({
      url: url(`/designs/${design.handle}`),
      priority: 0.8,
    })),
    ...collections.map((collection) => ({
      url: url(`/collections/${collection.handle}`),
      lastModified: collection.updatedAt || undefined,
      priority: 0.7,
    })),
    ...handles.map((handle) => ({
      url: url(`/products/${handle}`),
      priority: 0.8,
    })),
  ];
}
