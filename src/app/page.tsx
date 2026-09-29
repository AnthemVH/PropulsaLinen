import Link from "next/link";

import { Monogram } from "@/components/brand/logo";
import { MotifArt } from "@/components/brand/motif-art";
import { RoomTiles } from "@/components/home/room-tiles";
import { EmptyState, GroupGrid } from "@/components/product/product-grid";
import {
  ButtonLink,
  Container,
  Eyebrow,
  Rule,
  SectionHeading,
  TextLink,
} from "@/components/ui/primitives";
import { buildRoomNav, groupProducts, type ProductGroup } from "@/lib/catalog";
import { getFeaturedDesigns } from "@/lib/content/designs";
import { HOUSE_STANDARDS, JOURNAL, PROMISES, SITE } from "@/lib/content/site";
import { safeGetProducts } from "@/lib/shopify/safe";

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

export default async function HomePage() {
  const [featured, newest] = await Promise.all([
    safeGetProducts({ sort: "featured" }),
    safeGetProducts({ sort: "newest" }),
  ]);
  const collection = getFeaturedDesigns()[0];

  if (!collection) return null;

  const rooms = buildRoomNav(featured);
  const curated = onePerRoom(groupProducts(featured), 8);
  const newIn = groupProducts(newest).slice(0, 8);

  return (
    <>
      {/* 1. Hero — the current collection, under a floating header */}
      <section className="relative -mt-16 flex min-h-[64vh] items-end overflow-hidden md:-mt-20 lg:-mt-32 lg:min-h-[72vh]">
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

        <Container width="wide" className="relative pt-28 pb-14 md:pt-32 md:pb-20 lg:pt-44">
          <div className="fade-up max-w-2xl">
            <Monogram size={56} className="text-gold-light" />
            <Eyebrow className="mt-5 text-gold-light">
              Collection {collection.reference} · {collection.botanical}
            </Eyebrow>
            <h1 className="mt-3 text-display-lg text-balance text-ivory-light">
              {collection.name}
            </h1>
            <p className="mt-5 max-w-lg text-lede text-pretty text-ivory-light/85">
              {collection.tagline}. Made to order, finished by hand.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-8">
              <ButtonLink
                href={`/designs/${collection.handle}`}
                className="border-ivory-light/50 text-ivory-light hover:border-gold-light hover:bg-gold/20"
              >
                Enter the collection
              </ButtonLink>
              <Link href="/shop" className="eyebrow link-underline text-ivory-light">
                Shop all
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. Promise strip */}
      <div className="border-b hairline">
        <Container width="wide">
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 py-4 sm:gap-x-10 sm:py-5">
            {PROMISES.map((promise, index) => (
              <li key={promise} className="eyebrow flex items-center gap-3 text-[0.625rem] text-espresso-muted sm:gap-10 sm:text-xs">
                {index > 0 ? <span aria-hidden className="hidden text-gold sm:inline">·</span> : null}
                {promise}
              </li>
            ))}
          </ul>
        </Container>
      </div>

      {/* 3. Shop by room */}
      <section className="pt-section">
        <Container width="wide">
          <div className="flex items-end justify-between gap-6">
            <SectionHeading eyebrow="Shop by room" title="Every room in the house" />
            <TextLink href="/shop" className="eyebrow hidden shrink-0 sm:inline">
              Shop all
            </TextLink>
          </div>
          <div className="mt-12">
            {rooms.length ? (
              <RoomTiles rooms={rooms} />
            ) : (
              <EmptyState
                title="The rooms are being prepared"
                body="Pieces appear here as they are published to the store."
              />
            )}
          </div>
        </Container>
      </section>

      {/* 4. The collection */}
      {curated.length ? (
        <section className="pt-section">
          <Container width="wide">
            <div className="flex items-end justify-between gap-6">
              <SectionHeading
                eyebrow={`Collection ${collection.reference}`}
                title="The collection"
                lede={collection.tagline + "."}
              />
              <TextLink href={`/designs/${collection.handle}`} className="eyebrow hidden shrink-0 sm:inline">
                See the collection
              </TextLink>
            </div>
            <GroupGrid groups={curated} className="mt-12" />
          </Container>
        </section>
      ) : null}

      {/* 5. The making */}
      <section className="pt-section">
        <Container width="wide">
          <SectionHeading
            eyebrow="The making"
            title="Made to be used"
            lede="Not a print run. Each piece is made after it is ordered, to a standard set for daily use rather than for display."
          />
          <ol className="mt-12 grid gap-px border hairline bg-stone/40 md:grid-cols-3">
            {HOUSE_STANDARDS.map((standard, index) => (
              <li key={standard.title} className="bg-ivory p-8 lg:p-10">
                <Eyebrow>{String(index + 1).padStart(2, "0")}</Eyebrow>
                <h3 className="mt-4 font-display text-display-sm">{standard.title}</h3>
                <Rule className="my-5 max-w-16" />
                <p className="text-espresso-soft">{standard.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* 6. New in */}
      {newIn.length ? (
        <section className="pt-section">
          <Container width="wide">
            <div className="flex items-end justify-between gap-6">
              <SectionHeading eyebrow="New in" title="Lately from the workshop" />
              <TextLink href="/shop?sort=newest" className="eyebrow hidden shrink-0 sm:inline">
                All new pieces
              </TextLink>
            </div>
            <GroupGrid groups={newIn} className="mt-12" />
          </Container>
        </section>
      ) : null}

      {/* 7. Journal */}
      <section className="pt-section">
        <Container width="wide">
          <SectionHeading eyebrow="Journal" title="Notes from the house" />
          <ul className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            {JOURNAL.map((entry) => (
              <li key={entry.title}>
                <div className="relative aspect-[3/2] overflow-hidden bg-espresso">
                  <MotifArt form={entry.art} colorway="signature" alt="" className="opacity-80" />
                </div>
                <Eyebrow className="mt-4 text-gold">In preparation</Eyebrow>
                <h3 className="mt-2 font-display text-xl text-espresso">{entry.title}</h3>
                <p className="mt-1 text-espresso-muted">{entry.summary}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* 8. Newsletter (the footer follows from the layout) */}
      <section className="pt-section">
        <Container width="wide">
          <div className="border-y hairline py-14 text-center md:py-20">
            <Eyebrow>Letters from the house</Eyebrow>
            <p className="mx-auto mt-5 max-w-xl font-display text-display-sm text-balance">
              A note when a new collection opens, and nothing more often than that.
            </p>
            <a
              href={`mailto:${SITE.contactEmail}?subject=${encodeURIComponent("Add me to the letters")}`}
              className="eyebrow mt-8 inline-flex items-center justify-center border hairline px-8 py-4 text-espresso transition-colors duration-500 hover:border-gold hover:text-gold"
            >
              Write to join
            </a>
          </div>
        </Container>
      </section>
    </>
  );
}
