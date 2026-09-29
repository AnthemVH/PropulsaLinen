import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState, ProductGrid } from "@/components/product/product-grid";
import { Container, Eyebrow, Rule } from "@/components/ui/primitives";
import { buildRoomNav, matchRoomsAndTypes } from "@/lib/catalog";
import { safeGetProducts, safeSearchProducts } from "@/lib/shopify/safe";

export const metadata: Metadata = {
  title: "Search",
  // Result pages are endless variations of the shop; keep them out of search engines.
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim().slice(0, 80) : "";

  const [results, catalogue] = await Promise.all([
    query ? safeSearchProducts(query) : Promise.resolve([]),
    safeGetProducts(),
  ]);
  const links = query ? matchRoomsAndTypes(catalogue, query) : [];
  const rooms = buildRoomNav(catalogue);

  return (
    <Container width="wide" className="pt-12 pb-section md:pt-16">
      <header className="max-w-3xl">
        <Eyebrow>Search</Eyebrow>
        {/* A plain GET form, so search works before JavaScript loads. */}
        <form action="/search" role="search" className="mt-5 flex items-end gap-4">
          <label htmlFor="search-page-input" className="sr-only">
            Search the shop
          </label>
          <input
            id="search-page-input"
            type="search"
            name="q"
            defaultValue={query}
            maxLength={80}
            placeholder="Search the shop"
            className="min-w-0 flex-1 border-0 border-b hairline bg-transparent py-2 font-display text-display-sm text-espresso placeholder:text-espresso-muted/60 focus:border-gold focus:outline-none"
          />
          <button type="submit" className="eyebrow shrink-0 border hairline px-6 py-3 text-espresso hover:border-gold hover:text-gold-ink">
            Search
          </button>
        </form>
      </header>

      <Rule className="my-10 md:my-12" />

      {query ? (
        <>
          <p className="eyebrow text-espresso-muted">
            {results.length} {results.length === 1 ? "piece" : "pieces"} for “{query}”
          </p>

          {links.length ? (
            <ul className="mt-6 flex flex-wrap gap-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="eyebrow inline-flex items-center gap-2 border hairline px-4 py-2.5 text-espresso hover:border-gold hover:text-gold-ink"
                  >
                    {link.label}
                    <span className="text-espresso-muted">· {link.detail}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-10">
            {results.length ? (
              <ProductGrid products={results} />
            ) : (
              <EmptyState
                title={`Nothing matches “${query}”`}
                body="Try a kind of piece, like a throw or a glass, or browse by room below."
              />
            )}
          </div>
        </>
      ) : null}

      {!query || !results.length ? (
        <div className="mt-12">
          <Eyebrow>Browse by room</Eyebrow>
          <ul className="mt-5 flex flex-wrap gap-2">
            {rooms.map((nav) => (
              <li key={nav.room.slug}>
                <Link
                  href={`/rooms/${nav.room.slug}`}
                  className="eyebrow inline-block border hairline px-4 py-2.5 text-espresso hover:border-gold hover:text-gold-ink"
                >
                  {nav.room.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Container>
  );
}
