import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState, ProductGrid } from "@/components/product/product-grid";
import { Container } from "@/components/ui/primitives";
import { buildRoomNav, matchRoomsAndTypes } from "@/lib/catalog";
import { safeGetProducts, safeSearchProducts } from "@/lib/shopify/safe";
import { toRoman } from "@/lib/utils";

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
    <Container width="wide" className="pb-section">
      <header className="pt-12 pb-10 md:pt-20 md:pb-14">
        <p className="eyebrow intro-fade text-espresso-muted">Search the house</p>
        {/* A plain GET form, so search works before JavaScript loads. */}
        <form action="/search" role="search" className="intro-rise mt-6 flex items-end gap-4 md:gap-8">
          <label htmlFor="search-page-input" className="sr-only">
            Search the shop
          </label>
          <input
            id="search-page-input"
            type="search"
            name="q"
            defaultValue={query}
            maxLength={80}
            enterKeyHint="search"
            placeholder="A glass, a throw, a room…"
            className="min-w-0 flex-1 rounded-none border-0 border-b hairline-strong bg-transparent py-3 font-display text-[2rem] font-light text-espresso placeholder:text-espresso-muted/70 focus:border-gold focus:outline-none md:text-display-lg"
          />
          <button
            type="submit"
            className="eyebrow press mb-2 min-h-12 shrink-0 border hairline-strong px-5 py-3 text-espresso hover:border-gold hover:text-gold-ink md:px-8"
          >
            Search
          </button>
        </form>
      </header>

      {query ? (
        <>
          <p className="eyebrow text-espresso-muted" aria-live="polite">
            <span className="numeral mr-2 text-base normal-case tracking-normal text-gold-ink">
              {results.length}
            </span>
            {results.length === 1 ? "piece" : "pieces"} for “<span className="[overflow-wrap:anywhere]">{query}</span>”
          </p>

          {links.length ? (
            <ul className="mt-6 flex flex-wrap gap-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="eyebrow press inline-flex items-center gap-2 border hairline bg-ivory-light px-4 py-2.5 text-espresso hover:border-gold hover:text-gold-ink"
                  >
                    {link.label}
                    <span className="text-espresso-muted">· {link.detail}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-12">
            {results.length ? (
              <ProductGrid products={results} />
            ) : !catalogue.length ? (
              <EmptyState
                title="The range is being prepared"
                body="There is nothing to search yet. Pieces appear here as they are published to the store."
              />
            ) : (
              <EmptyState
                label="No match"
                title={`Nothing matches “${query}”`}
                body="Try a kind of piece, like a throw or a glass, or browse by room below."
              />
            )}
          </div>
        </>
      ) : null}

      {(!query || !results.length) && rooms.length ? (
        <div className="mt-16">
          <p className="eyebrow text-espresso-muted">Or browse by room</p>
          <ol className="mt-6 grid border-t hairline sm:grid-cols-2 lg:grid-cols-4">
            {rooms.map((nav, index) => (
              <li key={nav.room.slug} className="border-b hairline">
                <Link
                  href={`/rooms/${nav.room.slug}`}
                  className="group flex items-baseline gap-4 py-5 pr-4"
                >
                  <span className="numeral text-gold-ink">{toRoman(index + 1)}</span>
                  <span className="font-display text-2xl text-espresso transition-colors group-hover:text-gold-ink">
                    {nav.room.name}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </Container>
  );
}
