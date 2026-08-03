import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MotifArt } from "@/components/brand/motif-art";
import { EmptyState, ProductGrid } from "@/components/product/product-grid";
import {
  Container,
  Eyebrow,
  Rule,
  SectionHeading,
} from "@/components/ui/primitives";
import {
  deriveCategories,
  productsByDesign,
  productsInCategory,
} from "@/lib/catalog";
import { DESIGN_COLLECTIONS, getDesign } from "@/lib/content/designs";
import { SITE } from "@/lib/content/site";
import { safeGetProducts } from "@/lib/shopify/safe";

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

/**
 * A design collection page: the source and the story, then the pieces. The
 * brand's internal specification — the motif forms, the permitted colorways —
 * is not shown here; it governs what gets made, and the pieces are the
 * evidence. This is the page that has to keep working as one motif spreads
 * across every category the house opens.
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
  const categories = deriveCategories(products).filter(
    (category) => !category.planned,
  );

  return (
    <>
      <section className="relative -mt-20 flex min-h-[70vh] items-end overflow-hidden md:-mt-24">
        <div className="absolute inset-0 bg-espresso">
          <MotifArt
            form="dense-field"
            colorway="signature"
            alt=""
            loading="eager"
            className="opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso/85 via-espresso/45 to-espresso/55" />
        </div>

        {/* Clears the fixed header this hero is pulled under. */}
        <Container
          width="wide"
          className="relative pt-28 pb-16 md:pt-32 md:pb-24"
        >
          <div className="fade-up max-w-2xl">
            <Eyebrow className="text-gold-light">
              Collection {design.reference}
            </Eyebrow>
            <h1 className="mt-4 text-display-xl text-ivory-light">
              {design.name}
            </h1>
            <p className="mt-5 font-display text-display-sm italic text-ivory-light/85">
              {design.tagline}
            </p>
          </div>
        </Container>
      </section>

      <Container width="wide" className="py-section">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.3fr] lg:gap-24">
          <div>
            <Eyebrow>The source</Eyebrow>
            <Rule className="mt-6 max-w-24" />
            <dl className="mt-8 space-y-2">
              <dt className="eyebrow text-espresso-muted">Botanical</dt>
              <dd className="font-display text-display-sm">
                {design.botanical}
              </dd>
            </dl>
            <ul className="mt-10 space-y-4">
              {design.palette.map((colour) => (
                <li key={colour.name} className="flex items-center gap-4">
                  <span
                    className="size-8 rounded-full border border-espresso/15"
                    style={{ backgroundColor: colour.hex }}
                  />
                  <span className="eyebrow text-espresso-muted">
                    {colour.name}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-8 max-w-xs text-sm text-espresso-muted">
              Gold is an accent only — a single leaf, a vein, or the hairline
              itself. Never a fill, never a ground.
            </p>
          </div>

          <div className="space-y-7">
            <p className="text-lede text-pretty text-espresso-soft">
              {design.introduction}
            </p>
            {design.story.map((paragraph) => (
              <p key={paragraph.slice(0, 32)} className="text-espresso-soft">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </Container>

      <Container width="wide" className="pb-section">
        <Rule className="mb-16" />

        {products.length ? (
          <div className="space-y-24">
            {categories.map((category) => {
              const categoryProducts = productsInCategory(
                products,
                category.slug,
              );
              if (!categoryProducts.length) return null;

              return (
                <section key={category.slug}>
                  <SectionHeading
                    eyebrow={`${design.name} in`}
                    title={category.label}
                  />
                  <div className="mt-14">
                    <ProductGrid products={categoryProducts} stagger={false} />
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
    </>
  );
}
