import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";

import { MotifArt } from "@/components/brand/motif-art";
import { GROUND_CLASS, plateFor } from "@/components/brand/plates";
import { EmptyState, ProductGrid } from "@/components/product/product-grid";
import { TypeChips } from "@/components/shop/type-chips";
import { JsonLd } from "@/components/ui/json-ld";
import { Media } from "@/components/ui/media";
import { ButtonLink, Container } from "@/components/ui/primitives";
import { buildRoomNav, typeSlug } from "@/lib/catalog";
import { SITE } from "@/lib/content/site";
import { getRoom, ROOMS, roomForType } from "@/lib/rooms";
import { safeGetProducts } from "@/lib/shopify/safe";
import { cn, isFetchableImage, toRoman } from "@/lib/utils";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return ROOMS.map((room) => ({ slug: room.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const room = getRoom(slug);
  if (!room) return {};

  return {
    title: room.name,
    description: room.description,
    alternates: { canonical: `/rooms/${room.slug}` },
  };
}

const d = (ms: number) => ({ "--d": ms }) as CSSProperties;

export default async function RoomPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const { type } = await searchParams;
  const room = getRoom(slug);
  if (!room) notFound();

  const products = await safeGetProducts({ sort: "featured" });
  const allNav = buildRoomNav(products);
  const nav = allNav.find((item) => item.room.slug === room.slug);
  const inRoom = products.filter(
    (product) => roomForType(product.productType).slug === room.slug,
  );

  // Ignore a type that isn't in this room rather than showing an empty page.
  const activeType =
    typeof type === "string" && nav?.types.some((item) => item.slug === type)
      ? type
      : null;
  const shown = activeType
    ? inRoom.filter((product) => typeSlug(product.productType) === activeType)
    : inRoom;

  // The room's place in the house: among published rooms when there are any,
  // otherwise among all of them.
  const sequence = allNav.length ? allNav.map((item) => item.room) : ROOMS;
  const position = Math.max(0, sequence.findIndex((item) => item.slug === room.slug));
  const previous = sequence.length > 1 ? sequence[(position - 1 + sequence.length) % sequence.length] : null;
  const next = sequence.length > 1 ? sequence[(position + 1) % sequence.length] : null;
  const roomImage = nav?.image ?? null;
  const plate = plateFor(ROOMS.findIndex((item) => item.slug === room.slug));

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Shop", item: `${SITE.url}/shop` },
            { "@type": "ListItem", position: 2, name: room.name, item: `${SITE.url}/rooms/${room.slug}` },
          ],
        }}
      />

      <Container width="wide">
        <div className="grid items-end gap-10 pt-10 pb-12 md:pt-16 lg:grid-cols-12 lg:gap-12 lg:pb-16">
          <header className="lg:col-span-7">
            <nav aria-label="Breadcrumb" className="intro-fade">
              <ol className="running-head flex flex-wrap items-center gap-3 text-espresso-muted">
                <li>
                  <Link href="/shop" className="hover:text-gold-ink">
                    Shop
                  </Link>
                </li>
                <li aria-hidden className="h-px w-5 bg-gold/50" />
                <li aria-current="page">Room {toRoman(position + 1)} of {toRoman(sequence.length)}</li>
              </ol>
            </nav>
            <h1 className="intro-rise mt-6 text-display-xl text-balance text-espresso" style={d(80)}>
              {room.name}
            </h1>
            <p className="intro-rise mt-6 max-w-xl text-lede text-pretty text-espresso-soft" style={d(200)}>
              {room.description}
            </p>
          </header>

          {/* The room's frame: its own photograph where there is one, else a plate. */}
          <div className="lg:col-span-4 lg:col-start-9">
            <div className="plate-marks intro-fade" style={d(300)}>
              <div
                className={cn(
                  "intro-unveil relative aspect-[16/10] overflow-hidden lg:aspect-[4/5]",
                  GROUND_CLASS[plate.colorway],
                )}
                style={d(200)}
              >
                <div className="intro-settle absolute inset-0" style={d(200)}>
                  {isFetchableImage(roomImage) ? (
                    <Media image={roomImage} alt={room.name} sizes="(min-width: 1024px) 30vw, 100vw" priority />
                  ) : (
                    <MotifArt form={plate.form} colorway={plate.colorway} alt="" loading="eager" className="object-contain" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rule-gold intro-draw" style={d(300)} />

        <div className="flex flex-col gap-6 py-6 md:flex-row md:items-center md:justify-between">
          {nav ? <TypeChips basePath={`/rooms/${room.slug}`} types={nav.types} active={activeType} /> : <span />}
          <p className="eyebrow shrink-0 text-espresso-muted">
            {shown.length} {shown.length === 1 ? "piece" : "pieces"}
          </p>
        </div>
      </Container>

      <Container width="wide" className="pt-6">
        {shown.length ? (
          <ProductGrid products={shown} />
        ) : (
          <EmptyState
            title={`${room.name} is being prepared`}
            body={`${room.name} pieces appear here as they are published to the store.`}
          >
            <ButtonLink href="/shop">Shop every room</ButtonLink>
          </EmptyState>
        )}

        {/* Folio pagination: the rooms either side */}
        {previous && next ? (
          <nav
            aria-label="Other rooms"
            className="mt-section grid grid-cols-2 border-y hairline"
          >
            <Link
              href={`/rooms/${previous.slug}`}
              className="group flex flex-col gap-2 border-r hairline py-8 pr-4 md:py-12"
            >
              <span className="eyebrow text-espresso-muted">Previous room</span>
              <span className="font-display text-2xl text-espresso transition-[color,transform] duration-500 ease-out group-hover:-translate-x-1 group-hover:text-gold-ink md:text-display-sm">
                {previous.name}
              </span>
            </Link>
            <Link
              href={`/rooms/${next.slug}`}
              className="group flex flex-col items-end gap-2 py-8 pl-4 text-right md:py-12"
            >
              <span className="eyebrow text-espresso-muted">Next room</span>
              <span className="font-display text-2xl text-espresso transition-[color,transform] duration-500 ease-out group-hover:translate-x-1 group-hover:text-gold-ink md:text-display-sm">
                {next.name}
              </span>
            </Link>
          </nav>
        ) : null}
      </Container>
    </>
  );
}
