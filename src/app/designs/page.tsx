import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";

import { Plate } from "@/components/brand/plate";
import { Media } from "@/components/ui/media";
import { ButtonLink, Container, PageHeader, SectionHeading } from "@/components/ui/primitives";
import { productsByDesign } from "@/lib/catalog";
import { DESIGN_COLLECTIONS, getDesign } from "@/lib/content/designs";
import { safeGetCollections, safeGetProducts } from "@/lib/shopify/safe";
import { isFetchableImage, toRoman } from "@/lib/utils";

export const metadata: Metadata = {
  title: "The collections",
  description:
    "The house collections. A collection is a motif, not a product — it crosses categories as the house grows.",
  alternates: { canonical: "/designs" },
  openGraph: {
    title: "The collections — Propulsa",
    description:
      "The house collections, each drawn from a single botanical and executed across categories in three permitted forms.",
  },
};

/**
 * The one index of collections. It used to have a twin at /collections (the
 * store's own groupings); that address now redirects here, and any Shopify
 * collection that is not simply a mirror of a house collection is listed
 * below the house collections as a grouping.
 */
export default async function DesignsPage() {
  const [products, storeCollections] = await Promise.all([
    safeGetProducts({ sort: "featured" }),
    safeGetCollections(),
  ]);
  const groupings = storeCollections.filter((collection) => !getDesign(collection.handle));

  return (
    <>
      <Container width="wide">
        <PageHeader
          title="A collection is a motif, not a product"
          lede="Each collection begins with a single botanical, engraved as a naturalist's plate, and is executed across categories in three permitted forms — never reinterpreted piece by piece."
        />
      </Container>

      <Container width="wide" className="py-section">
        <div className="space-y-section">
          {DESIGN_COLLECTIONS.map((design, index) => {
            const count = productsByDesign(products, design.handle).length;
            return (
              <article key={design.handle} className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
                <Link
                  href={`/designs/${design.handle}`}
                  className={index % 2 ? "lg:order-2 lg:col-span-6 lg:col-start-7" : "lg:col-span-6"}
                  aria-label={`${design.name} — enter the collection`}
                >
                  <Plate
                    form="dense-field"
                    colorway="signature"
                    alt=""
                    frameClassName="aspect-square"
                    artClassName="object-contain transition-transform duration-[1600ms] ease-out hover:scale-[1.04]"
                    marks
                    reveal
                    priority={index === 0}
                  />
                </Link>
                <div className={index % 2 ? "lg:col-span-5" : "lg:col-span-5 lg:col-start-8"}>
                  <p data-reveal className="flex items-center gap-4">
                    <span className="numeral text-3xl text-gold-ink">{design.reference}</span>
                    <span aria-hidden className="h-px w-10 bg-gold/50" />
                    <span className="eyebrow text-espresso-muted">{design.botanical}</span>
                  </p>
                  <h2 data-reveal style={{ "--d": 80 } as CSSProperties} className="mt-6 text-display-lg text-balance">
                    <Link href={`/designs/${design.handle}`} className="transition-colors hover:text-gold-ink">
                      {design.name}
                    </Link>
                  </h2>
                  <p data-reveal style={{ "--d": 160 } as CSSProperties} className="mt-4 font-display text-display-sm italic text-balance text-espresso-soft">
                    {design.tagline}
                  </p>
                  <p data-reveal style={{ "--d": 220 } as CSSProperties} className="mt-7 max-w-xl text-pretty text-espresso-soft">
                    {design.introduction}
                  </p>
                  <div data-reveal style={{ "--d": 280 } as CSSProperties} className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                    <ButtonLink href={`/designs/${design.handle}`}>Enter {design.name}</ButtonLink>
                    {count ? (
                      <span className="eyebrow text-espresso-muted">
                        {count} {count === 1 ? "piece" : "pieces"}
                      </span>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}

          {/* What comes next is recorded but never shown by name. */}
          <div data-reveal className="border-y hairline py-12 text-center md:py-16">
            <p className="numeral text-3xl text-gold-ink">N° {toRoman(DESIGN_COLLECTIONS.length + 1)}</p>
            <p className="mt-4 font-display text-display-sm text-espresso-soft">In preparation</p>
            <p className="mx-auto mt-3 max-w-md text-espresso-muted">
              A second botanical is drawn and held back. A collection is released whole, or not at all.
            </p>
          </div>
        </div>
      </Container>

      {groupings.length ? (
        <Container width="wide" className="pb-section">
          <SectionHeading
            title="Groupings"
            lede="Pieces gathered as they are merchandised in the store."
          />
          <ul className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-12">
            {groupings.map((collection, index) => (
              <li key={collection.id} data-reveal style={{ "--d": (index % 3) * 80 } as CSSProperties}>
                <Link href={`/collections/${collection.handle}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden bg-stone/45">
                    <div className="absolute inset-0 transition-transform duration-[1400ms] ease-out group-hover:scale-[1.035]">
                      {isFetchableImage(collection.image) ? (
                        <Media
                          image={collection.image}
                          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                        />
                      ) : (
                        <Plate form="single-sprig" colorway="inverse" alt="" frameClassName="absolute inset-0" artClassName="object-contain" />
                      )}
                    </div>
                  </div>
                  <h3 className="mt-5 font-display text-display-sm text-pretty transition-colors group-hover:text-gold-ink [overflow-wrap:anywhere]">
                    {collection.title}
                  </h3>
                  {collection.description ? (
                    <p className="mt-2 line-clamp-3 text-espresso-muted">{collection.description}</p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      ) : null}
    </>
  );
}
