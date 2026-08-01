import Link from "next/link";

import { Colorways } from "@/components/brand/colorways";
import { Monogram } from "@/components/brand/logo";
import { MotifArt } from "@/components/brand/motif-art";
import { EmptyState, ProductGrid } from "@/components/product/product-grid";
import {
  ButtonLink,
  Container,
  Eyebrow,
  Rule,
  SectionHeading,
  TextLink,
} from "@/components/ui/primitives";
import { pendingBlueprints } from "@/lib/catalog";
import {
  getFeaturedDesigns,
  getMotifForm,
  MOTIF_FORMS,
} from "@/lib/content/designs";
import { getProducts } from "@/lib/shopify";

/**
 * The homepage is the collection.
 *
 * The house runs one collection at a time, so there is nothing to gain from a
 * generic storefront that treats Botanica Nocturne as one option among many.
 * The page follows the collection's own logic: the plate, the three forms it
 * may take, the three colorways it may take, then the pieces.
 */
export default async function HomePage() {
  const products = await getProducts({ sort: "featured" });
  const collection = getFeaturedDesigns()[0];
  const pending = pendingBlueprints(products);

  if (!collection) return null;

  return (
    <>
      {/* Hero — the plate itself, under a floating header. */}
      <section className="relative -mt-20 flex min-h-[92vh] items-end overflow-hidden md:-mt-24">
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

        {/* Top padding clears the fixed header the hero is pulled under, so
            short viewports (mobile landscape) cannot collide with it. */}
        <Container
          width="wide"
          className="relative pt-28 pb-20 md:pt-32 md:pb-28"
        >
          <div className="fade-up max-w-3xl">
            <Monogram size={68} className="text-gold-light" />
            <Eyebrow className="mt-6 text-gold-light">
              Collection {collection.reference} · {collection.botanical}
            </Eyebrow>
            <h1 className="mt-4 text-display-xl text-balance text-ivory-light">
              {collection.name}
            </h1>
            <p className="mt-6 max-w-xl text-lede text-pretty text-ivory-light/85">
              {collection.tagline}. Made to order, finished by hand.
            </p>
            <div className="mt-11 flex flex-wrap items-center gap-8">
              <ButtonLink
                href={`/designs/${collection.handle}`}
                className="border-ivory-light/50 text-ivory-light hover:border-gold-light hover:bg-gold/20"
              >
                Enter the collection
              </ButtonLink>
              <Link
                href="/shop"
                className="eyebrow link-underline text-ivory-light"
              >
                What is available
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* The plate */}
      <section className="py-section">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow>The plate</Eyebrow>
            <p className="mt-8 font-display text-display-md text-balance">
              A record, not an ornament.
            </p>
            <p className="mt-8 text-lede text-pretty text-espresso-soft">
              {collection.introduction}
            </p>
            <div className="mt-10 flex justify-center">
              <TextLink
                href={`/designs/${collection.handle}`}
                className="eyebrow"
              >
                Read the collection story
              </TextLink>
            </div>
          </div>
        </Container>
      </section>

      {/* Three forms */}
      <section className="py-section">
        <Container width="wide">
          <SectionHeading
            eyebrow="The motif system"
            title="Three forms, one plate"
            lede="Every piece is built from one of these three. Nothing is redrawn per product — which is what keeps a mug and a serving tray recognisably the same collection."
          />
          <ol className="mt-14 grid gap-px border hairline bg-stone/40 md:grid-cols-3">
            {MOTIF_FORMS.map((form, index) => (
              <li key={form.slug} className="bg-ivory">
                <div className="aspect-[4/3] overflow-hidden">
                  <MotifArt form={form.slug} colorway="signature" alt="" />
                </div>
                <div className="p-9 lg:p-11">
                  <Eyebrow>{String(index + 1).padStart(2, "0")}</Eyebrow>
                  <h3 className="mt-4 font-display text-display-sm">
                    {form.name}
                  </h3>
                  <Rule className="my-6 max-w-16" />
                  <p className="text-espresso-soft">{form.summary}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Three colorways */}
      <section className="py-section">
        <Container width="wide">
          <SectionHeading
            eyebrow="The colorways"
            title="Three grounds, one accent"
            lede="Gold is an accent in all three — a single leaf, a vein, or the hairline itself. It is never a fill and never a ground."
          />
          <div className="mt-14">
            <Colorways colorways={collection.colorways} />
          </div>
        </Container>
      </section>

      {/* The pieces */}
      <section className="py-section">
        <Container width="wide">
          <SectionHeading
            eyebrow="The pieces"
            title="Available now"
            lede="Everything published to the store, printed to order."
          />
          <div className="mt-16">
            {products.length ? (
              <ProductGrid products={products} />
            ) : (
              <EmptyState
                title="The first pieces are being prepared"
                body="Botanica Nocturne is being executed across the range below. Pieces appear here as they are published to the store."
              />
            )}
          </div>
          {products.length ? (
            <div className="mt-20 flex justify-center">
              <ButtonLink href="/shop">See everything</ButtonLink>
            </div>
          ) : null}
        </Container>
      </section>

      {/* The range in preparation */}
      {pending.length ? (
        <section className="pb-section">
          <Container width="wide">
            <Rule />
            <div className="pt-16 md:pt-24">
              <SectionHeading
                eyebrow="In preparation"
                title="The range"
                lede="Each piece is listed with the motif form it will carry."
              />
              <ul className="mt-14 divide-y divide-stone/60 border-y hairline">
                {pending.map((blueprint) => (
                  <li
                    key={blueprint.handle}
                    className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 py-5"
                  >
                    <span className="font-display text-xl text-espresso-soft">
                      {blueprint.title}
                    </span>
                    <span className="eyebrow text-espresso-muted">
                      {blueprint.motifs
                        .map(
                          (motif) =>
                            `${getMotifForm(motif.form)?.name ?? motif.form} — ${motif.placement}`,
                        )
                        .join(" · ")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </section>
      ) : null}
    </>
  );
}
