import type { Metadata } from "next";

import { EmptyState, ProductGrid } from "@/components/product/product-grid";
import { FilterSidebar, ShopToolbar } from "@/components/shop/shop-filters";
import { Container, Eyebrow } from "@/components/ui/primitives";
import {
  buildShopFacets,
  matchesShopFilters,
  toArray,
  type ShopFilters,
} from "@/lib/catalog";
import { safeGetProducts } from "@/lib/shopify/safe";
import type { SortKey } from "@/lib/shopify/types";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Every Propulsa piece, by room, product, colourway and price. Made to order and finished by hand.",
  alternates: { canonical: "/shop" },
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
  const sort = SORT_KEYS.find((key) => key === params.sort) ?? "featured";

  const filters: ShopFilters = {
    room: toArray(params.room),
    type: toArray(params.type),
    colour: toArray(params.colour),
    price: toArray(params.price),
  };

  const all = await safeGetProducts({ sort });
  const products = all.filter((product) => matchesShopFilters(product, filters));
  // Options come from the whole catalogue, so choosing one filter never
  // hides the others it could be combined with.
  const facets = buildShopFacets(all, filters);

  return (
    <Container width="wide" className="pt-12 pb-section md:pt-16">
      <header className="max-w-2xl">
        <Eyebrow>The full range</Eyebrow>
        <h1 className="mt-4 text-display-lg">Shop</h1>
        <p className="mt-5 text-lede text-pretty text-espresso-soft">
          Everything the house makes, printed and finished after you order it.
        </p>
      </header>

      <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14">
        <FilterSidebar facets={facets} />

        <div>
          <ShopToolbar facets={facets} total={products.length} />
          <div className="mt-8">
            {products.length ? (
              <ProductGrid products={products} />
            ) : (
              <EmptyState
                title="Nothing matches that combination"
                body="Try removing a filter — not every piece comes in every colourway yet."
              />
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
