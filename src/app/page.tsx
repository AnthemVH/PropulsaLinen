import Link from "next/link";

import { Monogram } from "@/components/brand/logo";
import { ProductGrid } from "@/components/product/product-grid";
import { EmptyState } from "@/components/product/product-grid";
import { Media } from "@/components/ui/media";
import {
  ButtonLink,
  Container,
  Eyebrow,
  Rule,
  SectionHeading,
  TextLink,
} from "@/components/ui/primitives";
import { deriveCategories } from "@/lib/catalog";
import { getFeaturedDesigns, MOTIF_FORMS } from "@/lib/content/designs";
import { HOUSE_NOTE } from "@/lib/content/site";
import { getProducts } from "@/lib/shopify";

export default async function HomePage() {
  const products = await getProducts({ sort: "featured" });
  const categories = deriveCategories(products);
  const lead = getFeaturedDesigns()[0];

  // All imagery is real catalogue imagery. With nothing in the store there is
  // no hero photograph, and the hero renders as a plain tonal panel rather
  // than borrowing a stock image.
  const heroImage = products[0]?.featuredImage ?? null;
  const secondaryImage =
    products[0]?.images[1] ?? products[1]?.featuredImage ?? null;

  return (
    <>
      {/* Hero — the header floats over this. */}
      <section className="relative -mt-20 flex min-h-[92vh] items-end overflow-hidden md:-mt-24">
        <div className="absolute inset-0">
          <Media
            image={heroImage}
            alt="Propulsa"
            sizes="100vw"
            priority
            quality={92}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso/75 via-espresso/35 to-espresso/40" />
        </div>

        <Container width="wide" className="relative pb-20 md:pb-28">
          <div className="fade-up max-w-3xl">
            <Monogram size={68} className="text-gold-light" />
            <h1 className="mt-5 text-display-xl text-balance text-ivory-light">
              Goods for a house
              <span className="block font-display italic">
                that keeps its things
              </span>
            </h1>
            <p className="mt-8 max-w-xl text-lede text-pretty text-ivory-light/85">
              An engraved olive branch, drawn as a naturalist&rsquo;s plate and
              set across the pieces a kitchen uses every day. Made to order,
              finished by hand.
            </p>
            <div className="mt-11 flex flex-wrap items-center gap-8">
              <ButtonLink
                href="/shop"
                className="border-ivory-light/50 text-ivory-light hover:border-gold-light hover:bg-gold/20"
              >
                The collection
              </ButtonLink>
              <Link
                href="/designs"
                className="eyebrow link-underline text-ivory-light"
              >
                The motif
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* House statement */}
      <section className="py-section">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow>Est. Anno MMXXVI</Eyebrow>
            <p className="mt-8 font-display text-display-md text-balance">
              We began in the kitchen, because it is the room a house uses most
              and decorates least.
            </p>
            <p className="mt-8 text-lede text-pretty text-espresso-soft">
              {HOUSE_NOTE}
            </p>
            <div className="mt-10 flex justify-center">
              <TextLink href="/about" className="eyebrow">
                Read the house story
              </TextLink>
            </div>
          </div>
        </Container>
      </section>

      {/* The collection */}
      {lead ? (
        <section className="py-section">
          <Container width="wide">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
              <Link
                href={`/designs/${lead.handle}`}
                className="group relative block aspect-[4/5] overflow-hidden bg-stone/30"
              >
                <div className="absolute inset-0 transition-transform duration-[1600ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.04]">
                  <Media
                    image={secondaryImage}
                    alt={`${lead.name} — the engraved plate`}
                    sizes="(min-width: 1024px) 45vw, 100vw"
                  />
                </div>
              </Link>

              <div>
                <Eyebrow>Collection {lead.reference}</Eyebrow>
                <h2 className="mt-5 text-display-lg">{lead.name}</h2>
                <p className="mt-3 font-display text-display-sm italic text-espresso-soft">
                  {lead.tagline}
                </p>
                <Rule className="my-9 max-w-xs" />
                <p className="text-lede text-pretty text-espresso-soft">
                  {lead.introduction}
                </p>

                <ul className="mt-9 flex flex-wrap gap-3">
                  {lead.palette.map((colour) => (
                    <li key={colour.name} className="flex items-center gap-2.5">
                      <span
                        className="size-4 rounded-full border border-espresso/15"
                        style={{ backgroundColor: colour.hex }}
                      />
                      <span className="eyebrow text-espresso-muted">
                        {colour.name}
                      </span>
                    </li>
                  ))}
                </ul>

                <ButtonLink href={`/designs/${lead.handle}`} className="mt-11">
                  Enter the collection
                </ButtonLink>
              </div>
            </div>
          </Container>
        </section>
      ) : null}

      {/* The motif system */}
      <section className="py-section">
        <Container width="wide">
          <SectionHeading
            eyebrow="The motif system"
            title="Three forms, one plate"
            lede="Every piece is built from one of three forms taken from the same engraved plate. Nothing is redrawn per product."
          />
          <ol className="mt-14 grid gap-px border hairline bg-stone/40 md:grid-cols-3">
            {MOTIF_FORMS.map((form, index) => (
              <li key={form.slug} className="bg-ivory p-9 lg:p-11">
                <Eyebrow>{String(index + 1).padStart(2, "0")}</Eyebrow>
                <h3 className="mt-4 font-display text-display-sm">
                  {form.name}
                </h3>
                <Rule className="my-6 max-w-16" />
                <p className="text-espresso-soft">{form.summary}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Everything currently in the store */}
      <section className="py-section">
        <Container width="wide">
          <SectionHeading
            eyebrow="The current range"
            title="Pieces in the house"
            lede="Everything the house makes today. Each is printed to order."
          />
          <div className="mt-16">
            {products.length ? (
              <ProductGrid products={products} />
            ) : (
              <EmptyState
                title="The range is being prepared"
                body="Pieces will appear here as they are published to the store."
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

      {/* Categories */}
      <section className="py-section">
        <Container width="wide">
          <SectionHeading
            eyebrow="By category"
            title="Where it goes in the house"
            align="center"
            className="mx-auto items-center"
          />
          <ul className="mt-16 grid gap-px border hairline bg-stone/40 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <li key={category.slug} className="bg-ivory p-10">
                {category.planned ? (
                  <div>
                    <h3 className="font-display text-display-sm text-espresso-muted">
                      {category.label}
                    </h3>
                    {category.blurb ? (
                      <p className="mt-4 text-espresso-muted/80">
                        {category.blurb}
                      </p>
                    ) : null}
                    <span className="eyebrow mt-7 inline-block text-espresso-muted/60">
                      In preparation
                    </span>
                  </div>
                ) : (
                  <Link href={`/shop/${category.slug}`} className="group block">
                    <h3 className="font-display text-display-sm transition-colors duration-500 group-hover:text-gold">
                      {category.label}
                    </h3>
                    {category.blurb ? (
                      <p className="mt-4 text-espresso-muted">
                        {category.blurb}
                      </p>
                    ) : null}
                    <span className="eyebrow mt-7 inline-block text-gold">
                      {category.count}{" "}
                      {category.count === 1 ? "piece" : "pieces"}
                    </span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
