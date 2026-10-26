import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";

import { MotifArt } from "@/components/brand/motif-art";
import { Plate } from "@/components/brand/plate";
import { EmptyState, ProductGrid } from "@/components/product/product-grid";
import { ButtonLink, Container, Ornament, SectionHeading } from "@/components/ui/primitives";
import { buildRoomNav, productsByDesign } from "@/lib/catalog";
import { roomForType } from "@/lib/rooms";
import { DESIGN_COLLECTIONS, getDesign } from "@/lib/content/designs";
import { SITE } from "@/lib/content/site";
import { safeGetProducts } from "@/lib/shopify/safe";
import { toRoman } from "@/lib/utils";

type Params = { handle: string };

export function generateStaticParams(): Params[] {
  return DESIGN_COLLECTIONS.map((design) => ({ handle: design.handle }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { handle } = await params;
  const design = getDesign(handle);
  if (!design) return {};

  return {
    title: design.name,
    description: design.introduction,
    alternates: { canonical: `/designs/${design.handle}` },
    openGraph: {
      type: "article",
      title: `${design.name} — ${SITE.name}`,
      description: design.introduction,
      url: `${SITE.url}/designs/${design.handle}`,
    },
  };
}

const d = (ms: number) => ({ "--d": ms }) as CSSProperties;

/**
 * A design collection page: the plate, the source and the story, the three
 * colourways the plate is printed in, then the pieces room by room. This is
 * the page that has to keep working as one motif spreads across every
 * category the house opens.
 */
export default async function DesignPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { handle } = await params;
  const design = getDesign(handle);
  if (!design) notFound();

  const allProducts = await safeGetProducts({ sort: "featured" });
  const products = productsByDesign(allProducts, design.handle);
  const rooms = buildRoomNav(products);

  const [firstWord, ...restWords] = design.name.split(" ");
  const [firstParagraph, ...otherParagraphs] = design.story;

  return (
    <>
      {/* Frontispiece: the name either side of its own plate. */}
      <section className="relative -mt-[var(--header-h)] overflow-hidden bg-espresso text-ivory-light">
        <div className="mx-auto flex min-h-[100svh] max-w-[1760px] flex-col px-[var(--gutter)] pt-[calc(var(--header-h)+2rem)] pb-10">
          <p className="intro-fade flex items-center justify-center gap-4">
            <span aria-hidden className="h-px w-8 bg-gold-light/50" />
            <span className="numeral text-xl text-gold-light">
              <span className="sr-only">Collection </span>
              {design.reference}
            </span>
            <span aria-hidden className="h-px w-8 bg-gold-light/50" />
          </p>

          <div className="relative flex flex-1 flex-col justify-center py-6">
            <h1 className="relative z-10 text-display-xl text-ivory-light">
              <span className="intro-rise block" style={d(200)}>
                {firstWord}
              </span>
              {restWords.length ? (
                <span className="intro-rise block text-right text-ivory/90" style={d(450)}>
                  {restWords.join(" ")}
                </span>
              ) : null}
            </h1>
            {/* The plate sits behind and between the words; quieter on phones,
                where the words cross it. */}
            <div aria-hidden className="pointer-events-none absolute inset-x-0 inset-y-0 flex items-center justify-center">
              <div className="intro-unveil relative aspect-square h-[78%] max-h-[44rem] min-h-72" style={d(100)}>
                <div className="intro-settle absolute inset-0" style={d(100)}>
                  <div className="breathe absolute inset-0 opacity-45 md:opacity-80">
                    <MotifArt form="dense-field" colorway="signature" alt="" loading="eager" className="object-contain" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p
            className="intro-rise mx-auto max-w-xl text-center font-display text-display-sm italic text-pretty text-ivory/85"
            style={d(700)}
          >
            {design.tagline}
          </p>
        </div>
      </section>

      {/* The source */}
      <section className="py-section">
        <Container width="wide">
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            <aside className="lg:col-span-4">
              <SectionHeading title={`${design.botanical}, and only ${design.botanical.toLowerCase()}`} />
              <ul data-reveal className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6">
                {design.palette.map((colour) => (
                  <li key={colour.name}>
                    <span
                      aria-hidden
                      className="block aspect-[4/3] border border-espresso/15"
                      style={{ backgroundColor: colour.hex }}
                    />
                    <span className="mt-3 flex items-baseline justify-between gap-2">
                      <span className="font-display text-lg text-espresso">{colour.name}</span>
                      <span className="running-head text-espresso-muted">{colour.hex}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p data-reveal className="mt-8 max-w-xs text-sm text-espresso-soft">
                Gold is an accent only — a single leaf, a vein, or the hairline itself. Never a
                fill, never a ground.
              </p>
            </aside>

            <div className="lg:col-span-7 lg:col-start-6">
              <p
                data-reveal
                className="text-lede text-pretty text-espresso first-letter:float-left first-letter:mt-1 first-letter:mr-3 first-letter:font-display first-letter:text-[4.6em] first-letter:leading-[0.8] first-letter:text-gold-ink"
              >
                {design.introduction}
              </p>
              <div className="mt-10 space-y-6 text-espresso-soft md:columns-2 md:gap-12 md:space-y-0 [&>p]:break-inside-avoid md:[&>p+p]:mt-6">
                {[firstParagraph, ...otherParagraphs].filter(Boolean).map((paragraph, index) => (
                  <p key={paragraph.slice(0, 32)} data-reveal style={d(index * 100)} className="text-pretty">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* The colourways: the same plate on its three permitted grounds. */}
      <section className="pb-section">
        <Container width="wide">
          <Ornament className="mb-section" />
          <SectionHeading
            title="One plate, printed three ways"
            lede="The ground and linework pairs are fixed. Gold stays the accent in all three, rather than becoming a fourth colour."
          />
          <ol className="mt-14 grid gap-x-8 gap-y-14 md:mt-20 md:grid-cols-3 lg:gap-x-14">
            {design.colorways.map((colourway, index) => (
              <li key={colourway.slug}>
                <Plate
                  form="single-sprig"
                  colorway={colourway.slug}
                  alt={`${design.name} in ${colourway.name}: ${colourway.linework.name.toLowerCase()} linework on ${colourway.ground.name.toLowerCase()}`}
                  frameClassName="aspect-[10/13]"
                  artClassName="object-contain"
                  marks
                  reveal
                  delay={index * 140}
                />
                <div className="mt-7 flex items-baseline gap-4">
                  <span className="numeral text-xl text-gold-ink">{toRoman(index + 1)}</span>
                  <h3 className="font-display text-display-sm text-espresso">{colourway.name}</h3>
                </div>
                <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm">
                  {[
                    ["Ground", colourway.ground],
                    ["Linework", colourway.linework],
                    ["Accent", colourway.accent],
                  ].map(([label, colour]) => {
                    const c = colour as { name: string; hex: string };
                    return (
                      <div key={label as string} className="contents">
                        <dt className="eyebrow pt-1 text-espresso-muted">{label as string}</dt>
                        <dd className="flex items-center gap-2 text-espresso-soft">
                          <span aria-hidden className="size-3 border border-espresso/20" style={{ backgroundColor: c.hex }} />
                          {c.name}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
                <p className="mt-4 max-w-sm text-espresso-soft">{colourway.use}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* The pieces, room by room */}
      <section>
        <Container width="wide">
          <div aria-hidden className="relative mb-section h-16 overflow-hidden md:h-24">
            <MotifArt form="hairline-border" colorway="inverse" alt="" className="object-cover" />
          </div>

          {products.length ? (
            <div className="space-y-section">
              {rooms.map((nav) => {
                const roomProducts = products.filter(
                  (product) => roomForType(product.productType).slug === nav.room.slug,
                );

                return (
                  <section key={nav.room.slug} aria-labelledby={`room-${nav.room.slug}`}>
                    <div className="flex flex-wrap items-end justify-between gap-6">
                      <SectionHeading
                        title={<span id={`room-${nav.room.slug}`}>{nav.room.name}</span>}
                      />
                      <ButtonLink href={`/rooms/${nav.room.slug}`} variant="quiet" className="mb-2">
                        The whole room
                      </ButtonLink>
                    </div>
                    <div className="mt-12 md:mt-16">
                      <ProductGrid products={roomProducts} layout="folio" />
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="Being made"
              body={`${design.name} pieces are in production. They will appear here as they are published to the store.`}
            />
          )}
        </Container>
      </section>
    </>
  );
}
