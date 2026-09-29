// Rooms, product type names and colourways.
//
// Contrado sets `productType` on every product and leaves tags empty, so the
// product type is what the shop groups by. To add a new type, add it to
// TYPE_ROOMS below (and to TYPE_NAMES if Contrado's name reads awkwardly).

export type RoomSlug =
  | "kitchen-dining"
  | "bedroom"
  | "bathroom"
  | "living"
  | "decor-scent"
  | "accessories-stationery"
  | "leisure"
  | "more";

export type Room = {
  slug: RoomSlug;
  name: string;
  description: string;
  // Path to a photo in /public, e.g. "/rooms/bedroom.jpg". Until one is set,
  // the room uses an image from one of its own products.
  image: string | null;
};

export const ROOMS: Room[] = [
  {
    slug: "kitchen-dining",
    name: "Kitchen & Dining",
    description: "Linen, glass and china for the table that gets used every day.",
    image: null,
  },
  {
    slug: "bedroom",
    name: "Bedroom",
    description: "Bedding and throws, cut and printed after you order them.",
    image: null,
  },
  {
    slug: "bathroom",
    name: "Bathroom",
    description: "Towels, robes and the quieter pieces of the morning.",
    image: null,
  },
  {
    slug: "living",
    name: "Living",
    description: "Cushions, rugs and hangings for the rooms you sit in.",
    image: null,
  },
  {
    slug: "decor-scent",
    name: "Décor & Scent",
    description: "Vases, candles and small trays that finish a room.",
    image: null,
  },
  {
    slug: "accessories-stationery",
    name: "Accessories & Stationery",
    description: "Notebooks, pouches and scarves that leave the house with you.",
    image: null,
  },
  {
    slug: "leisure",
    name: "Leisure",
    description: "For the afternoons away from the table.",
    image: null,
  },
  {
    slug: "more",
    name: "More",
    description: "Pieces still finding their place in the house.",
    image: null,
  },
];

// Exact Shopify productType values. Where the brief's name and Contrado's
// differ (Apron / Aprons), both are listed.
export const TYPE_ROOMS: Record<string, RoomSlug> = {
  // Kitchen & Dining
  Tablecloth: "kitchen-dining",
  "Table Runner": "kitchen-dining",
  Napkins: "kitchen-dining",
  Placemats: "kitchen-dining",
  "Fabric Placemats": "kitchen-dining",
  "Large Placemats": "kitchen-dining",
  "Bar Runner": "kitchen-dining",
  Coasters: "kitchen-dining",
  "Vinyl Coasters": "kitchen-dining",
  "Ceramic Coasters": "kitchen-dining",
  "Round Coaster Trays": "kitchen-dining",
  "Serving Platter": "kitchen-dining",
  "Cutting Boards": "kitchen-dining",
  "China Plates": "kitchen-dining",
  "Ceramic Bowls": "kitchen-dining",
  "Cup and Saucer": "kitchen-dining",
  "Bone China Mug": "kitchen-dining",
  "Travel Mug": "kitchen-dining",
  "Water Glass": "kitchen-dining",
  "Whisky Glass": "kitchen-dining",
  "Beer Glass": "kitchen-dining",
  "Wine Bottle Cooler": "kitchen-dining",
  "Tea Towel": "kitchen-dining",
  "Tea Towels": "kitchen-dining",
  "Kitchen Towels": "kitchen-dining",
  Apron: "kitchen-dining",
  Aprons: "kitchen-dining",
  "Double Oven Glove": "kitchen-dining",

  // Bedroom
  "Duvet Covers USA": "bedroom",
  "Fitted Sheets USA": "bedroom",
  "Pillow Case": "bedroom",
  "Pillow Sham": "bedroom",
  Quilts: "bedroom",
  "Bed Runner": "bedroom",
  Blanket: "bedroom",
  "Single Layer Blankets": "bedroom",
  Throw: "bedroom",
  "Luxury Cotton Throw": "bedroom",

  // Bathroom
  Towel: "bathroom",
  "Bath Mat": "bathroom",
  "Shower Curtain": "bathroom",
  "Laundry Bag": "bathroom",
  "Dressing Gown": "bathroom",
  "Waterproof Changing Robe": "bathroom",

  // Living
  Cushions: "living",
  "Cushion Covers": "living",
  "Pillow Covers": "living",
  "Lumbar Cushion": "living",
  "Bolster Pillow": "living",
  "Floor Pillows": "living",
  "Round Floor Cushions": "living",
  "Seat Pad": "living",
  Rugs: "living",
  Curtains: "living",
  "Voile Curtains": "living",
  "Wall Hanging": "living",
  Tapestry: "living",
  "Drum Lamp Shade": "living",
  "Wall Clock": "living",

  // Décor & Scent
  "Glass Vase": "decor-scent",
  "Personalised Plant Pot": "decor-scent",
  "Ornamental Bowl": "decor-scent",
  "Set Candle in Jar": "decor-scent",
  "Glass Tealight Candle Holder": "decor-scent",
  "Leather Trinket Tray": "decor-scent",
  "Trinket Tray": "decor-scent",

  // Accessories & Stationery
  "Pocket Note Book": "accessories-stationery",
  "Zip Top Pouch": "accessories-stationery",
  "Scarf Wrap or Shawl": "accessories-stationery",

  // Leisure
  "Picnic Blanket": "leisure",
  "Mahjong Mat": "leisure",
};

// Cleaner names for types where Contrado's reads awkwardly. Anything not
// listed shows its Shopify name as-is.
export const TYPE_NAMES: Record<string, string> = {
  Aprons: "Apron",
  "Tea Towels": "Tea Towel",
  "Double Oven Glove": "Oven Glove",
  "Large Placemats": "Placemats",
  "Fabric Placemats": "Placemats",
  "Vinyl Coasters": "Coasters",
  "Round Coaster Trays": "Coaster Tray",
  "Cutting Boards": "Cutting Board",
  "China Plates": "China Plate",
  "Ceramic Bowls": "Ceramic Bowl",
  "Whisky Glass": "Whiskey Glass",
  "Duvet Covers USA": "Duvet Cover",
  "Fitted Sheets USA": "Fitted Sheet",
  "Pillow Case": "Pillowcases",
  Quilts: "Quilt",
  "Single Layer Blankets": "Blanket",
  "Luxury Cotton Throw": "Cotton Throw",
  "Dressing Gown": "Bathrobe",
  "Waterproof Changing Robe": "Changing Robe",
  Cushions: "Cushion",
  "Cushion Covers": "Cushion Cover",
  "Pillow Covers": "Cushion Cover",
  "Floor Pillows": "Floor Cushion",
  "Round Floor Cushions": "Floor Cushion",
  Rugs: "Rug",
  "Glass Vase": "Vase",
  "Personalised Plant Pot": "Plant Pot",
  "Set Candle in Jar": "Candle",
  "Glass Tealight Candle Holder": "Tealight Holder",
  "Leather Trinket Tray": "Trinket Tray",
  "Pocket Note Book": "Pocket Notebook",
  "Zip Top Pouch": "Zip Pouch",
  "Scarf Wrap or Shawl": "Scarf",
};

export type Colourway = {
  name: string;
  hex: string;
};

// Checked in this order, so "Deep Espresso" is found before "Espresso".
export const COLOURWAYS: Colourway[] = [
  { name: "Deep Espresso", hex: "#261B12" },
  { name: "Ivory", hex: "#C8C0B0" },
  { name: "Sand", hex: "#DACFC1" },
  { name: "Alabaster", hex: "#F6F1EA" },
  { name: "Espresso", hex: "#2A211A" },
];

// The order swatches appear in on a card, light to dark.
const SWATCH_ORDER = ["Alabaster", "Ivory", "Sand", "Espresso", "Deep Espresso"];

export function swatchRank(colourway: Colourway | null): number {
  return colourway ? SWATCH_ORDER.indexOf(colourway.name) : -1;
}

const warnedTypes = new Set<string>();

export function getRoom(slug: string): Room | undefined {
  return ROOMS.find((room) => room.slug === slug);
}

export function roomForType(productType: string): Room {
  const slug = TYPE_ROOMS[productType];

  if (!slug) {
    if (!warnedTypes.has(productType)) {
      warnedTypes.add(productType);
      console.warn(`[rooms] No room for product type "${productType}" — add it to TYPE_ROOMS in src/lib/rooms.ts`);
    }
    return ROOMS[ROOMS.length - 1];
  }

  return ROOMS.find((room) => room.slug === slug)!;
}

export function typeName(productType: string): string {
  return TYPE_NAMES[productType] ?? productType;
}

export function colourwayFromTitle(title: string): Colourway | null {
  const lower = title.toLowerCase();
  return (
    COLOURWAYS.find((colourway) =>
      new RegExp(`\\b${colourway.name.toLowerCase()}\\b`).test(lower),
    ) ?? null
  );
}

export function getColourway(name: string): Colourway | undefined {
  return COLOURWAYS.find((colourway) => colourway.name === name);
}

// The title with its colourway taken out, tidied up.
// "Ivory Water Glass" -> "Water Glass"
// "Botanica Nocturne Rug — Ivory Hairline Vine" -> "Botanica Nocturne Rug — Hairline Vine"
export function titleWithoutColourway(title: string): string {
  const colourway = colourwayFromTitle(title);
  if (!colourway) return title;

  return title
    .replace(new RegExp(`\\b${colourway.name}\\b`, "i"), "")
    .replace(/\s{2,}/g, " ")
    .replace(/(—|-)\s*$/, "")
    .replace(/^\s*(—|-)\s*/, "")
    .replace(/(—|-)\s+(—|-)/, "$1")
    .trim();
}
