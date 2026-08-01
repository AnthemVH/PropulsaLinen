import type { Metadata } from "next";

import { EmptyState, ProductGrid } from "@/components/product/product-grid";
import { FilterBar } from "@/components/shop/filter-bar";
import { Container, Eyebrow, Rule } from "@/components/ui/primitives";
import { buildFacets, matchesFilters, toArray } from "@/lib/catalog";
import { getProducts } from "@/lib/shopify";
import type { SortKey } from "@/lib/shopify/types";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Every Propulsa piece, filterable by category, collection, size and colour.",
  openGraph: {
    title: "Shop — Propulsa",
    description: "Every Propulsa piece, in one place.",
  },
};

const SORT_KEYS: SortKey[] = ["featured", "newest", "price-asc", "price-desc"];

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const sortParam = typeof params.sort === "string" ? params.sort : "featured";
  const sort = SORT_KEYS.includes(sortParam as SortKey)
    ? (sortParam as SortKey)
    : "featured";

  const all = await getProducts({ sort });

  const filters = {
    type: toArray(params.type),
    design: toArray(params.design),
    size: toArray(params.size),
    colour: toArray(params.colour),
  };

  const products = all.filter((product) => matchesFilters(product, filters));
  // Facets come from the unfiltered set, so a filter never removes its own
  // sibling options from the panel.
  const facets = buildFacets(all);

  return (
    <Container width="wide" className="pt-16 pb-section md:pt-24">
      <header className="max-w-2xl">
        <Eyebrow>The full range</Eyebrow>
        <h1 className="mt-5 text-display-lg">Shop</h1>
        <p className="mt-6 text-lede text-pretty text-espresso-soft">
          Everything the house currently makes. Filter by category, collection,
          size or colour — the range is small on purpose.
        </p>
      </header>

      <Rule className="my-12" />

      <FilterBar facets={facets} total={products.length} />

      <div className="mt-16">
        {products.length ? (
          <ProductGrid products={products} />
        ) : (
          <EmptyState
            title="Nothing matches that combination"
            body="Try removing a filter. The range is deliberately narrow, so not every pairing exists yet."
          />
        )}
      </div>
    </Container>
  );
}
