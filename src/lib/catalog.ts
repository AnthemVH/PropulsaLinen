import { DESIGN_COLLECTIONS, type DesignCollection } from "@/lib/content/designs";
import {
  COLOURWAYS,
  colourwayFromTitle,
  ROOMS,
  roomForType,
  swatchRank,
  titleWithoutColourway,
  typeName,
  type Colourway,
  type Room,
} from "@/lib/rooms";
import type { Image, Money, Product } from "@/lib/shopify/types";

export function resolveDesign(product: Product): DesignCollection | undefined {
  if (product.designHandle) {
    const byHandle = DESIGN_COLLECTIONS.find(
      (design) => design.handle === product.designHandle,
    );
    if (byHandle) return byHandle;
  }

  const byName = DESIGN_COLLECTIONS.find((design) =>
    product.title.toLowerCase().includes(design.name.toLowerCase()),
  );
  if (byName) return byName;

  // While the house runs a single collection, an untagged product belongs to
  // it by definition. Once a second collection exists this stops guessing and
  // the metafield or tag becomes required.
  return DESIGN_COLLECTIONS.length === 1 ? DESIGN_COLLECTIONS[0] : undefined;
}

export function productsByDesign(
  products: Product[],
  designHandle: string,
): Product[] {
  return products.filter(
    (product) => resolveDesign(product)?.handle === designHandle,
  );
}

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Normalises a `searchParams` value into a string array. */
export function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : value.split(",").filter(Boolean);
}

// Shop filters. Everything lives in the URL, e.g.
// /shop?room=bedroom&colour=sand&price=50-100&sort=newest

export const PRICE_BANDS = [
  { slug: "under-50", label: "Under US$50", min: 0, max: 50 },
  { slug: "50-100", label: "US$50 – US$100", min: 50, max: 100 },
  { slug: "100-200", label: "US$100 – US$200", min: 100, max: 200 },
  { slug: "200-plus", label: "US$200 and over", min: 200, max: Infinity },
];

export type ShopFilters = {
  room: string[];
  type: string[];
  colour: string[];
  price: string[];
};

export type FilterOption = {
  value: string;
  label: string;
  count: number;
  swatch?: string;
};

export type ShopFacets = {
  room: FilterOption[];
  type: FilterOption[];
  colour: FilterOption[];
  price: FilterOption[];
};

export function colourSlug(colourway: Colourway): string {
  return slugify(colourway.name);
}

export function priceBandFor(product: Product): string | undefined {
  const price = Number(product.priceRange.minVariantPrice.amount);
  return PRICE_BANDS.find((band) => price >= band.min && price < band.max)?.slug;
}

export function matchesShopFilters(product: Product, filters: ShopFilters): boolean {
  const room = roomForType(product.productType).slug;
  const colourway = colourwayFromTitle(product.title);

  if (filters.room.length && !filters.room.includes(room)) return false;
  if (filters.type.length && !filters.type.includes(typeSlug(product.productType))) return false;
  if (filters.colour.length && (!colourway || !filters.colour.includes(colourSlug(colourway)))) return false;
  if (filters.price.length && !filters.price.includes(priceBandFor(product) ?? "")) return false;

  return true;
}

function countBy(products: Product[], keyFor: (product: Product) => string | undefined) {
  const counts = new Map<string, number>();
  for (const product of products) {
    const key = keyFor(product);
    if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

// The options for each filter, with how many products each one has. Product
// types are narrowed to the chosen rooms, so the list stays short.
export function buildShopFacets(products: Product[], filters: ShopFilters): ShopFacets {
  const rooms = countBy(products, (product) => roomForType(product.productType).slug);

  const typeSource = filters.room.length
    ? products.filter((product) => filters.room.includes(roomForType(product.productType).slug))
    : products;
  const types = countBy(typeSource, (product) => typeSlug(product.productType));
  const typeLabels = new Map(
    typeSource.map((product) => [typeSlug(product.productType), typeName(product.productType)]),
  );

  const colours = countBy(products, (product) => {
    const colourway = colourwayFromTitle(product.title);
    return colourway ? colourSlug(colourway) : undefined;
  });
  const prices = countBy(products, priceBandFor);

  return {
    room: ROOMS.filter((room) => rooms.has(room.slug)).map((room) => ({
      value: room.slug,
      label: room.name,
      count: rooms.get(room.slug) ?? 0,
    })),
    type: [...types.keys()]
      .map((slug) => ({ value: slug, label: typeLabels.get(slug) ?? slug, count: types.get(slug) ?? 0 }))
      .sort((a, b) => a.label.localeCompare(b.label)),
    colour: [...COLOURWAYS]
      .sort((a, b) => swatchRank(a) - swatchRank(b))
      .filter((colourway) => colours.has(colourSlug(colourway)))
      .map((colourway) => ({
        value: colourSlug(colourway),
        label: colourway.name,
        count: colours.get(colourSlug(colourway)) ?? 0,
        swatch: colourway.hex,
      })),
    price: PRICE_BANDS.filter((band) => prices.has(band.slug)).map((band) => ({
      value: band.slug,
      label: band.label,
      count: prices.get(band.slug) ?? 0,
    })),
  };
}

export type GroupItem = {
  product: Product;
  colourway: Colourway | null;
};

// One card on a listing page: a product and its colourway siblings.
export type ProductGroup = {
  key: string;
  title: string;
  productType: string;
  room: Room;
  items: GroupItem[];
  minPrice: Money;
  hasPriceRange: boolean;
};

// Groups colourway siblings into one card. Two products are siblings when they
// share a design, a product type and a title once the colourway is taken out,
// so "Ivory Water Glass" and "Sand Water Glass" group, but a Single-Sprig and
// a Dense Field placemat stay apart. Products with no colourway in the title,
// or a second product in a colourway the group already has, get their own card.
export function groupProducts(products: Product[]): ProductGroup[] {
  const groups: ProductGroup[] = [];
  const openGroups = new Map<string, ProductGroup>();

  for (const product of products) {
    const colourway = colourwayFromTitle(product.title);
    const baseTitle = titleWithoutColourway(product.title);
    const key = [
      resolveDesign(product)?.handle ?? "",
      product.productType,
      baseTitle.toLowerCase(),
    ].join("|");

    const existing = colourway ? openGroups.get(key) : undefined;
    const alreadyHasColourway = existing?.items.some(
      (item) => item.colourway?.name === colourway?.name,
    );

    if (existing && !alreadyHasColourway) {
      existing.items.push({ product, colourway });
      continue;
    }

    const group: ProductGroup = {
      key: product.handle,
      title: colourway ? baseTitle : product.title,
      productType: product.productType,
      room: roomForType(product.productType),
      items: [{ product, colourway }],
      minPrice: product.priceRange.minVariantPrice,
      hasPriceRange: false,
    };
    groups.push(group);
    if (colourway && !existing) openGroups.set(key, group);
  }

  for (const group of groups) {
    group.items.sort(
      (a, b) => swatchRank(a.colourway) - swatchRank(b.colourway),
    );

    const prices = group.items.flatMap((item) => [
      Number(item.product.priceRange.minVariantPrice.amount),
      Number(item.product.priceRange.maxVariantPrice.amount),
    ]);
    const lowest = Math.min(...prices);
    const cheapest = group.items.find(
      (item) =>
        Number(item.product.priceRange.minVariantPrice.amount) === lowest,
    )!;
    group.minPrice = cheapest.product.priceRange.minVariantPrice;
    group.hasPriceRange = Math.max(...prices) > lowest;
  }

  return groups;
}

// The group a product belongs to, found among the whole catalogue.
export function findGroupFor(
  product: Product,
  catalogue: Product[],
): ProductGroup | undefined {
  return groupProducts(catalogue).find((group) =>
    group.items.some((item) => item.product.handle === product.handle),
  );
}

export type TypeLink = {
  name: string;
  slug: string;
};

export type RoomNav = {
  room: Room;
  types: TypeLink[];
  image: Image | null;
};

export function typeSlug(productType: string): string {
  return slugify(typeName(productType));
}

// The rooms that have products, each with the product types it actually
// holds. Used by the header menu and the homepage room tiles.
export function buildRoomNav(products: Product[]): RoomNav[] {
  return ROOMS.map((room) => {
    const inRoom = products.filter(
      (product) => roomForType(product.productType).slug === room.slug,
    );

    const types = new Map<string, TypeLink>();
    for (const product of inRoom) {
      const slug = typeSlug(product.productType);
      if (!types.has(slug)) {
        types.set(slug, { name: typeName(product.productType), slug });
      }
    }

    const photo = room.image
      ? { url: room.image, altText: room.name, width: 1600, height: 2000 }
      : null;
    const productPhoto = inRoom.find((product) => product.featuredImage)
      ?.featuredImage;

    return {
      room,
      types: [...types.values()].sort((a, b) => a.name.localeCompare(b.name)),
      image: photo ?? productPhoto ?? null,
    };
  }).filter((nav) => nav.types.length > 0);
}

export type SearchLink = {
  label: string;
  detail: string;
  href: string;
};

// Rooms and product types whose names match a search, e.g. "duvet" or "bedroom".
export function matchRoomsAndTypes(products: Product[], query: string): SearchLink[] {
  const lower = query.trim().toLowerCase();
  if (!lower) return [];

  const links: SearchLink[] = [];
  for (const nav of buildRoomNav(products)) {
    if (nav.room.name.toLowerCase().includes(lower)) {
      links.push({ label: nav.room.name, detail: "Room", href: `/rooms/${nav.room.slug}` });
    }
    for (const type of nav.types) {
      if (type.name.toLowerCase().includes(lower)) {
        links.push({
          label: type.name,
          detail: nav.room.name,
          href: `/rooms/${nav.room.slug}?type=${type.slug}`,
        });
      }
    }
  }
  return links;
}
