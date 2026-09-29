import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EmptyState, ProductGrid } from "@/components/product/product-grid";
import { TypeChips } from "@/components/shop/type-chips";
import { JsonLd } from "@/components/ui/json-ld";
import { Media } from "@/components/ui/media";
import { Container, Eyebrow, Rule } from "@/components/ui/primitives";
import { buildRoomNav, typeSlug } from "@/lib/catalog";
import { SITE } from "@/lib/content/site";
import { getRoom, ROOMS, roomForType } from "@/lib/rooms";
import { safeGetProducts } from "@/lib/shopify/safe";

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
  const nav = buildRoomNav(products).find((item) => item.room.slug === room.slug);
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
      <Container width="wide" className="pt-12 md:pt-16">
        <div className="grid items-end gap-10 lg:grid-cols-[1fr_minmax(0,28rem)] lg:gap-20">
          <header className="max-w-2xl">
            <Eyebrow>Shop by room</Eyebrow>
            <h1 className="mt-4 text-display-lg">{room.name}</h1>
            <p className="mt-5 text-lede text-pretty text-espresso-soft">
              {room.description}
            </p>
          </header>
          {nav?.image ? (
            <div className="relative hidden aspect-[4/3] overflow-hidden bg-stone/30 lg:block">
              <Media image={nav.image} alt={room.name} sizes="28rem" priority />
            </div>
          ) : null}
        </div>

        <Rule className="my-10 md:my-12" />

        {nav ? (
          <TypeChips basePath={`/rooms/${room.slug}`} types={nav.types} active={activeType} />
        ) : null}
        <p className="eyebrow mt-6 text-espresso-muted">
          {shown.length} {shown.length === 1 ? "piece" : "pieces"}
        </p>
      </Container>

      <Container width="wide" className="pt-10 pb-section">
        {shown.length ? (
          <ProductGrid products={shown} />
        ) : (
          <EmptyState
            title="Nothing here yet"
            body={`${room.name} pieces appear here as they are published to the store.`}
          />
        )}
      </Container>
    </>
  );
}
