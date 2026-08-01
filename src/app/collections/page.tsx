import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/product/product-grid";
import { Media } from "@/components/ui/media";
import { Container, Eyebrow, Rule } from "@/components/ui/primitives";
import { getCollections } from "@/lib/shopify";

export const metadata: Metadata = {
  title: "All collections",
  description:
    "Every Propulsa collection, as merchandised in the store.",
  alternates: { canonical: "/collections" },
};

/**
 * Index of Shopify collections. The editorial counterpart lives at `/designs`,
 * which is the house's own content model; this page is the store's own view.
 */
export default async function CollectionsIndexPage() {
  const collections = await getCollections();

  return (
    <Container width="wide" className="pt-16 pb-section md:pt-24">
      <header className="max-w-2xl">
        <Eyebrow>Index</Eyebrow>
        <h1 className="mt-5 text-display-lg">Collections</h1>
        <p className="mt-6 text-lede text-pretty text-espresso-soft">
          Each grouping as it is merchandised in the store. For the story behind
          a print, see{" "}
          <Link href="/designs" className="text-gold link-underline">
            the design collections
          </Link>
          .
        </p>
      </header>

      <Rule className="my-14" />

      {collections.length === 0 ? (
        <EmptyState
          title="No collections yet"
          body="Groupings created in Shopify will appear here. In the meantime, the house collections are the better way in."
        />
      ) : null}

      <ul className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-12">
        {collections.map((collection) => (
          <li key={collection.id}>
            <Link
              href={`/collections/${collection.handle}`}
              className="group block"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-stone/30">
                <div className="absolute inset-0 transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.035]">
                  <Media
                    image={collection.image}
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                  />
                </div>
              </div>
              <h2 className="mt-5 font-display text-display-sm transition-colors duration-500 group-hover:text-gold">
                {collection.title}
              </h2>
              {collection.description ? (
                <p className="mt-3 line-clamp-3 text-espresso-muted">
                  {collection.description}
                </p>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
