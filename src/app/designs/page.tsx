import type { Metadata } from "next";
import Link from "next/link";

import { MotifArt } from "@/components/brand/motif-art";
import { Media } from "@/components/ui/media";
import { Container, Eyebrow, Rule } from "@/components/ui/primitives";
import { productsByDesign } from "@/lib/catalog";
import { DESIGN_COLLECTIONS } from "@/lib/content/designs";
import { safeGetProducts } from "@/lib/shopify/safe";

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

export default async function DesignsPage() {
  const products = await safeGetProducts({ sort: "featured" });

  return (
    <Container width="wide" className="pt-16 pb-section md:pt-24">
      <header className="max-w-2xl">
        <Eyebrow>The house collections</Eyebrow>
        <h1 className="mt-5 text-display-lg text-balance">
          A collection is a motif, not a product
        </h1>
        <p className="mt-6 text-lede text-pretty text-espresso-soft">
          Each collection begins with a single botanical, engraved as a
          naturalist&rsquo;s plate, and is executed across categories in three
          permitted forms — never reinterpreted piece by piece.
        </p>
      </header>

      <Rule className="my-16" />

      <div className="space-y-24 lg:space-y-40">
        {DESIGN_COLLECTIONS.map((design, index) => {
          const designProducts = productsByDesign(products, design.handle);
          const image = designProducts[0]?.featuredImage ?? null;

          return (
            <article
              key={design.handle}
              className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-20 ${
                index % 2 === 1 ? "lg:[&>a]:order-2" : ""
              }`}
            >
              <Link
                href={`/designs/${design.handle}`}
                className="group relative block aspect-[5/4] overflow-hidden bg-stone/30"
              >
                <div className="absolute inset-0 transition-transform duration-[1600ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.04]">
                  {image ? (
                    <Media
                      image={image}
                      alt={`${design.name} collection`}
                      sizes="(min-width: 1024px) 48vw, 100vw"
                      priority={index === 0}
                    />
                  ) : (
                    <MotifArt
                      form="dense-field"
                      colorway="signature"
                      alt={`${design.name} — the engraved plate`}
                      loading={index === 0 ? "eager" : "lazy"}
                    />
                  )}
                </div>
              </Link>

              <div>
                <Eyebrow>Collection {design.reference}</Eyebrow>
                <h2 className="mt-4 text-display-md">
                  <Link
                    href={`/designs/${design.handle}`}
                    className="transition-colors duration-500 hover:text-gold"
                  >
                    {design.name}
                  </Link>
                </h2>
                <p className="mt-3 font-display text-xl italic text-espresso-soft">
                  {design.tagline}
                </p>
                <p className="mt-7 max-w-xl text-pretty text-espresso-soft">
                  {design.introduction}
                </p>

                <dl className="mt-9 flex flex-wrap items-baseline gap-3">
                  <dt className="eyebrow text-espresso-muted">Botanical</dt>
                  <dd className="text-espresso-soft">{design.botanical}</dd>
                </dl>

                <Link
                  href={`/designs/${design.handle}`}
                  className="eyebrow link-underline mt-9 inline-block text-gold"
                >
                  Enter {design.name}
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </Container>
  );
}
