import Link from "next/link";
import type { CSSProperties } from "react";

import { Monogram } from "@/components/brand/logo";
import { MotifArt } from "@/components/brand/motif-art";
import { Plate } from "@/components/brand/plate";
import { RoomIndex } from "@/components/home/room-index";
import { GroupGrid } from "@/components/product/product-grid";
import { ProductRail } from "@/components/product/product-rail";
import { JsonLd } from "@/components/ui/json-ld";
import {
  ButtonLink,
  Container,
  Ornament,
  Rule,
  SectionHeading,
  TextLink,
} from "@/components/ui/primitives";
import { buildRoomNav, groupProducts, type ProductGroup } from "@/lib/catalog";
import { getFeaturedDesigns, MOTIF_FORMS } from "@/lib/content/designs";
import { HOUSE_STANDARDS, JOURNAL, PROMISES, SITE } from "@/lib/content/site";
import { safeGetProducts } from "@/lib/shopify/safe";
import { cn, toRoman } from "@/lib/utils";

// One group from each room, best sellers first, so the row shows the range
// rather than eight of the same thing.
function onePerRoom(groups: ProductGroup[], limit: number): ProductGroup[] {
  const picked: ProductGroup[] = [];
  const seenRooms = new Set<string>();

  for (const group of groups) {
    if (seenRooms.has(group.room.slug)) continue;
    seenRooms.add(group.room.slug);
    picked.push(group);
  }

  // Fill any spare places with the next best sellers.
  for (const group of groups) {
    if (picked.length >= limit) break;
    if (!picked.includes(group)) picked.push(group);
  }

  return picked.slice(0, limit);
}

const d = (ms: number) => ({ "--d": ms }) as CSSProperties;

// How each of the three forms is shown on the home page.
const FORM_PLATES = {
  "dense-field": { colorway: "signature", frame: "aspect-square" },
  "single-sprig": { colorway: "inverse", frame: "aspect-[10/13]" },
  "hairline-border": { colorway: "warm-stone", frame: "aspect-[10/13]" },
} as const;

export default async function HomePage() {
  const [featured, newest] = await Promise.all([
    safeGetProducts({ sort: "featured" }),
    safeGetProducts({ sort: "newest" }),
  ]);
  const collection = getFeaturedDesigns()[0];

  if (!collection) return null;

  const rooms = buildRoomNav(featured);
  // Nine: the lead piece takes four cells, so nine fill a 4- or 3-column grid.
  const curated = onePerRoom(groupProducts(featured), 9);
  // "Lately" should not repeat the curated pieces just above it.
  const curatedKeys = new Set(curated.map((group) => group.key));
  const newIn = groupProducts(newest)
    .filter((group) => !curatedKeys.has(group.key))
    .slice(0, 10);

  const [firstWord, ...restWords] = collection.name.split(" ");

  // Tells search engines who runs the site and that it has a search box. An
  // Organization, not a LocalBusiness: there is no shop to walk into.
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: SITE.name,
        legalName: SITE.legalName,
        url: SITE.url,
        logo: `${SITE.url}/apple-icon.png`,
        email: SITE.contactEmail,
        telephone: SITE.phone,
        contactPoint: {
          "@type": "ContactPoint",
          email: SITE.contactEmail,
          telephone: SITE.phone,
          contactType: "customer service",
        },
      },
      {
        "@type": "WebSite",
        name: SITE.name,
        url: SITE.url,
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE.url}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />

      {/* I. Frontispiece — the collection's plate on its own night ground,
          under the floating header. The plate's ground is the page's ground,
          so the branch sits on the page rather than in a box. */}
      <section className="relative -mt-[var(--header-h)] overflow-hidden bg-espresso text-ivory-light">
        <div className="mx-auto grid min-h-[100svh] max-w-[1760px] grid-rows-[auto_1fr_auto] px-[var(--gutter)] pt-[calc(var(--header-h)+1.5rem)] pb-8 lg:grid-cols-12 lg:grid-rows-[1fr_auto] lg:gap-x-12 lg:pt-[var(--header-h)] lg:pb-10">
          {/* The plate */}
          <div className="relative order-1 -mx-[var(--gutter)] h-[46svh] min-h-72 lg:order-2 lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:mx-0 lg:h-auto">
            <div className="absolute inset-0 intro-unveil" style={d(150)}>
              <div className="absolute inset-0 intro-settle" style={d(150)}>
                <div className="absolute inset-0 breathe">
                  <MotifArt
                    form="dense-field"
                    colorway="signature"
                    alt={`${collection.name} — the engraved olive plate`}
                    loading="eager"
                    className="object-contain lg:scale-[1.18]"
                  />
                </div>
              </div>
            </div>
            <p
              className="running-head intro-fade absolute right-[var(--gutter)] bottom-2 text-ivory/65 lg:right-0 lg:bottom-6"
              style={d(1400)}
            >
              <span className="numeral mr-2 text-sm normal-case tracking-normal text-gold-light">Pl. I</span>
              The dense field
            </p>
          </div>

          {/* The title */}
          <div className="scroll-recede relative z-10 order-2 flex flex-col justify-end pt-8 lg:order-1 lg:col-span-6 lg:row-span-1 lg:pb-16">
            <div className="flex items-center gap-4">
              <Monogram size={40} className="intro-fade text-gold-light" />
              <span aria-hidden className="intro-draw h-px w-10 bg-gold-light/60" style={d(300)} />
              <p className="numeral intro-fade text-xl text-gold-light" style={d(300)}>
                <span className="sr-only">Collection </span>
                {collection.reference}
              </p>
            </div>
            <h1 className="mt-6 text-display-xl text-ivory-light">
              <span className="intro-rise block" style={d(250)}>
                {firstWord}
              </span>
              {restWords.length ? (
                <span className="intro-rise block pl-[0.6em] text-ivory/90" style={d(420)}>
                  {restWords.join(" ")}
                </span>
              ) : null}
            </h1>
            <p
              className="intro-rise mt-7 max-w-md text-lede text-pretty text-ivory/80"
              style={d(600)}
            >
              {collection.tagline}. Made to order, and finished by hand.
            </p>
            <div className="intro-rise mt-9 flex flex-wrap items-center gap-x-8 gap-y-5" style={d(750)}>
              <ButtonLink href={`/designs/${collection.handle}`} variant="light">
                Enter the collection
              </ButtonLink>
              <Link href="/shop" className="eyebrow link-underline py-2 text-ivory-light">
                Shop the house
              </Link>
            </div>
          </div>

          {/* The promises, as a running foot */}
          <ul
            className="intro-fade order-3 mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-ivory-light/15 pt-5 lg:col-span-6 lg:mt-0"
            style={d(1100)}
          >
            {PROMISES.map((promise, index) => (
              <li key={promise} className="running-head flex items-center gap-5 text-ivory/70">
                {index > 0 ? (
                  <span aria-hidden className="size-[5px] rotate-45 border border-gold-light/80" />
                ) : null}
                {promise}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* II. The premise */}
      <section className="py-section">
        <Container width="narrow" className="text-center">
          <Ornament className="mb-10" />
          <p data-reveal className="font-display text-display-md font-light text-balance text-espresso">
            One olive branch, drawn as a naturalist once drew it, and nothing added that the plate
            did not already hold.
          </p>
          <p
            data-reveal
            style={d(120)}
            className="mx-auto mt-8 max-w-xl text-lede text-pretty text-espresso-soft"
          >
            {collection.introduction}
          </p>
        </Container>
      </section>

      {/* III. The three forms — the motif system shown as an exhibition of
          plates, staggered like prints hung on a wall. */}
      <section className="pb-section">
        <Container width="wide">
          <div className="grid items-end gap-8 lg:grid-cols-12">
            <SectionHeading
              title="Every piece carries one of three forms, never a fourth"
              className="lg:col-span-7"
            />
            <p data-reveal style={d(120)} className="max-w-md text-pretty text-espresso-soft lg:col-span-4 lg:col-start-9">
              Nothing is redrawn for a product. The plate is cropped, edged or set
              alone, and the linework stays exactly as it was engraved.
            </p>
          </div>

          <ol className="mt-16 grid gap-x-8 gap-y-16 sm:grid-cols-2 md:mt-24 lg:grid-cols-3 lg:gap-x-14">
            {MOTIF_FORMS.map((form, index) => {
              const plate = FORM_PLATES[form.slug];
              return (
                <li
                  key={form.slug}
                  className={cn(index === 1 && "sm:mt-24", index === 2 && "lg:mt-48")}
                >
                  <Plate
                    form={form.slug}
                    colorway={plate.colorway}
                    alt={`${form.name} — ${form.summary}`}
                    frameClassName={plate.frame}
                    artClassName="object-contain"
                    vertical={form.slug === "hairline-border"}
                    marks
                    reveal
                    delay={index * 140}
                  />
                  <div className="mt-8 flex items-baseline gap-4">
                    <span className="numeral text-2xl text-gold-ink">Pl. {toRoman(index + 1)}</span>
                    <h3 className="font-display text-display-sm text-espresso">{form.name}</h3>
                  </div>
                  <p className="mt-3 max-w-sm text-espresso-soft">{form.description}</p>
                  <p className="mt-4 max-w-sm text-sm italic text-pretty text-espresso-muted">
                    {form.appliedTo}
                  </p>
                </li>
              );
            })}
          </ol>
        </Container>
      </section>

      {/* IV. The rooms */}
      <section className="pb-section">
        <Container width="wide">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              title="The rooms of the house"
              lede="The house began at the table and works outward from there, slowly."
            />
            <TextLink href="/shop" className="eyebrow mb-2">
              Shop every room
            </TextLink>
          </div>
          <div className="mt-14 md:mt-20">
            <RoomIndex rooms={rooms} />
          </div>
        </Container>
      </section>

      {/* V. The collection — a short, curated folio spread */}
      {curated.length ? (
        <section className="pb-section">
          <Container width="wide">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading
                title="A piece from every room"
                lede={`${collection.tagline}.`}
              />
              <TextLink href={`/designs/${collection.handle}`} className="eyebrow mb-2">
                The whole collection
              </TextLink>
            </div>
            <GroupGrid groups={curated} layout="folio" className="mt-14 md:mt-20" />
          </Container>
        </section>
      ) : null}

      {/* VI. The making — a night chapter */}
      <section className="relative overflow-hidden bg-espresso py-section text-ivory-light">
        <div aria-hidden className="absolute inset-y-0 right-0 hidden w-[42%] lg:block">
          <div className="absolute inset-0 scroll-drift">
            <MotifArt form="single-sprig" colorway="signature" alt="" className="object-contain" />
          </div>
        </div>
        <Container width="wide" className="relative">
          <div className="lg:w-[58%]">
            <SectionHeading
              tone="dark"
              title="Made after it is ordered, and made to be used"
              lede="Not a print run. Each piece is made once it is bought, to a standard set for daily use rather than for display."
            />
            <ol className="mt-14 md:mt-20">
              {HOUSE_STANDARDS.map((standard, index) => (
                <li
                  key={standard.title}
                  data-reveal
                  style={d(index * 120)}
                  className="border-t border-gold-light/25 py-9 md:py-11"
                >
                  <div>
                    <h3 className="font-display text-display-sm text-ivory-light">{standard.title}</h3>
                    <p className="mt-3 max-w-lg text-pretty text-ivory/75">{standard.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      {/* VII. Lately from the workshop — a shelf, not a second grid */}
      {newIn.length ? (
        <section className="pt-section">
          <Container width="wide">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading title="New from the workshop" />
              <TextLink href="/shop?sort=newest" className="eyebrow mb-2">
                All new pieces
              </TextLink>
            </div>
            <div className="mt-12 md:mt-16">
              <ProductRail groups={newIn} label="New pieces" />
            </div>
          </Container>
        </section>
      ) : null}

      {/* VIII. The journal — forthcoming, and marked as such */}
      <section className="pt-section">
        <Container width="wide">
          <SectionHeading
            title="Notes from the house"
            lede="Three essays are being written. They are listed here so you know what is coming, and will link once they are published."
          />
          <ul className="mt-14 grid gap-12 md:mt-20 md:grid-cols-3 md:gap-8 lg:gap-14">
            {JOURNAL.map((entry, index) => (
              <li key={entry.title} aria-label={`${entry.title} — in preparation`}>
                <Plate
                  form={entry.art}
                  colorway={index === 1 ? "warm-stone" : "signature"}
                  frameClassName="aspect-[3/2]"
                  artClassName={entry.art === "hairline-border" ? "object-cover" : "object-contain"}
                  reveal
                  delay={index * 120}
                />
                <p className="eyebrow mt-6 flex items-center gap-3 text-gold-ink">
                  <span aria-hidden className="size-[5px] rotate-45 border border-gold" />
                  In preparation
                </p>
                <h3 className="mt-3 font-display text-display-sm text-espresso-soft">{entry.title}</h3>
                <p className="mt-2 text-pretty text-espresso-muted">{entry.summary}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* IX. Letters */}
      <section className="pt-section">
        <Container width="wide">
          <div className="relative overflow-hidden border hairline bg-ivory px-6 py-16 text-center md:py-24">
            <div aria-hidden className="absolute inset-x-0 top-0 h-16 opacity-90 md:h-24">
              <MotifArt form="hairline-border" colorway="inverse" alt="" className="object-cover" />
            </div>
            <div className="relative pt-10 md:pt-14">
              <h2
                data-reveal
                className="mx-auto max-w-2xl font-display text-display-md text-balance text-espresso"
              >
                Letters from the house
              </h2>
              <p
                data-reveal
                style={d(100)}
                className="mx-auto mt-5 max-w-md text-lede text-pretty text-espresso-soft"
              >
                A note when a new collection opens, and nothing more often than that.
              </p>
              <Rule className="mx-auto mt-10 max-w-40" draw delay={200} />
              <a
                href={`mailto:${SITE.contactEmail}?subject=${encodeURIComponent("Add me to the letters")}`}
                className="eyebrow press group/button mt-10 inline-flex min-h-12 items-center gap-4 border hairline-strong px-8 py-4 text-espresso hover:border-gold hover:text-gold-ink"
              >
                Write to join
                <span
                  aria-hidden
                  className="h-px w-5 origin-left bg-current transition-transform duration-500 ease-out group-hover/button:scale-x-[1.8]"
                />
              </a>
              <p className="mt-6 text-sm text-espresso-muted">
                Opens your email. We reply from {SITE.contactEmail}.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
