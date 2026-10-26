import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState, ProductGrid } from "@/components/product/product-grid";
import { FilterSidebar, ShopToolbar } from "@/components/shop/shop-filters";
import { ButtonLink, Container, PageHeader } from "@/components/ui/primitives";
import {
  buildRoomNav,
  buildShopFacets,
  matchesShopFilters,
  toArray,
  type ShopFilters,
} from "@/lib/catalog";
import { DESIGN_NAV } from "@/lib/content/site";
import { safeGetProducts } from "@/lib/shopify/safe";
import type { SortKey } from "@/lib/shopify/types";
import { toRoman } from "@/lib/utils";

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
  const rooms = buildRoomNav(all);

  return (
    <Container width="wide" className="pb-section">
      <PageHeader
        runningHead="The full range"
        title="Shop"
        lede="Everything the house makes, printed and finished after you order it."
      >
        {rooms.length ? (
          <nav aria-label="Rooms" className="intro-fade mt-10 -mx-[var(--gutter)] overflow-x-auto px-[var(--gutter)] no-scrollbar">
            <ul className="flex gap-x-8 gap-y-3 whitespace-nowrap md:flex-wrap">
              {rooms.map((nav, index) => (
                <li key={nav.room.slug}>
                  <Link
                    href={`/rooms/${nav.room.slug}`}
                    className="group inline-flex items-baseline gap-2 py-1"
                  >
                    <span className="numeral text-sm text-gold-ink">{toRoman(index + 1)}</span>
                    <span className="font-display text-xl text-espresso-soft transition-colors group-hover:text-gold-ink">
                      {nav.room.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </PageHeader>

      <div className="grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16">
        <FilterSidebar facets={facets} />

        <div>
          <ShopToolbar facets={facets} total={products.length} />
          <div className="mt-10">
            {products.length ? (
              <ProductGrid products={products} />
            ) : all.length ? (
              <EmptyState
                label="No match"
                title="Nothing matches that combination"
                body="Try removing a filter — not every piece comes in every colourway yet."
              />
            ) : (
              <EmptyState
                title="The range is being prepared"
                body="Pieces appear here as they are published to the store. In the meantime, the collection itself is open to read."
              >
                <ButtonLink href={DESIGN_NAV[0]?.href ?? "/designs"}>{DESIGN_NAV[0]?.label ?? "The collections"}</ButtonLink>
              </EmptyState>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
