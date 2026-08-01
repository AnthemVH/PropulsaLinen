/**
 * The house content model.
 *
 * Three layers, deliberately separate:
 *
 *   1. `MOTIF_FORMS` — the three permitted renderings of the house artwork.
 *      Artwork is *never* reinterpreted per product; every piece is built from
 *      one of these three forms. This is a hard brand constraint, so it is
 *      modelled explicitly rather than left to a design brief.
 *
 *   2. `DESIGN_COLLECTIONS` — a collection is a motif, not a product. It
 *      outlives any single category, which is why it cannot live in a Shopify
 *      collection alone.
 *
 *   3. `PRODUCT_BLUEPRINTS` — the pieces the collection is executed on, each
 *      declaring which motif form(s) it carries and where.
 *
 * Shopify is referenced by handle from here; it never owns this layer.
 */

/* -------------------------------------------------------------------------- */
/* 1. Motif forms                                                              */
/* -------------------------------------------------------------------------- */

export type MotifFormSlug = "dense-field" | "single-sprig" | "hairline-border";

export type MotifForm = {
  slug: MotifFormSlug;
  name: string;
  /** One line, used on product pages next to the piece. */
  summary: string;
  /** The full definition, used on the collection page. */
  description: string;
  /** Where this form is appropriate — guidance for adding future pieces. */
  appliedTo: string;
};

export const MOTIF_FORMS: MotifForm[] = [
  {
    slug: "dense-field",
    name: "Dense field",
    summary: "The full engraved repeat, carrying the whole plate.",
    description:
      "The complete engraved botanical repeat. Used where a large flat surface can carry the whole story — as a border treatment, or as a full or reduced-scale repeat.",
    appliedTo:
      "Large flat surfaces: borders on linen, full repeats on cushions, throws, wall hangings and canvas prints.",
  },
  {
    slug: "single-sprig",
    name: "Single-sprig emblem",
    summary: "One branch, cropped from the plate and set alone.",
    description:
      "One isolated branch or leaf cluster pulled directly out of the dense field and used as a standalone mark. It is a crop, never a redrawn simplification — the line weight and engraving of the plate are preserved exactly.",
    appliedTo:
      "Placement marks and smaller pieces where a dense print would be too loud, or too costly to execute well: mugs, coasters, tins, chest and cuff placements.",
  },
  {
    slug: "hairline-border",
    name: "Hairline border",
    summary: "The thin edging line, used alone as a minimal trim.",
    description:
      "The thin gold or ivory linework that edges the dense field, used alone as a minimal trim. It is the same line that frames the plate — and the same hairline that runs through the rest of the house's visual language.",
    appliedTo:
      "Edges and trims: hems, napkin and glove borders, board edges, bag piping.",
  },
];

export function getMotifForm(slug: MotifFormSlug): MotifForm | undefined {
  return MOTIF_FORMS.find((form) => form.slug === slug);
}

/* -------------------------------------------------------------------------- */
/* 2. Product categories                                                       */
/* -------------------------------------------------------------------------- */

export type ProductTypeSlug =
  | "kitchen-linen"
  | "table"
  | "serving"
  | "storage";

export type ProductTypeDefinition = {
  slug: ProductTypeSlug;
  /** Matched against Shopify's `productType`, singular/plural tolerant. */
  shopifyProductType: string;
  name: string;
  plural: string;
  blurb: string;
};

export const PRODUCT_TYPES: ProductTypeDefinition[] = [
  {
    slug: "kitchen-linen",
    shopifyProductType: "Kitchen Linen",
    name: "Kitchen linen",
    plural: "Kitchen Linen",
    blurb:
      "Cloth for the working end of the house — tea towels, aprons and the things that meet a hot pan.",
  },
  {
    slug: "table",
    shopifyProductType: "Table",
    name: "Table",
    plural: "The Table",
    blurb:
      "What is set down before anyone sits: mats, coasters and the cup in your hand.",
  },
  {
    slug: "serving",
    shopifyProductType: "Serving",
    name: "Serving",
    plural: "Serving",
    blurb: "Boards and trays — the pieces that carry something to the table.",
  },
  {
    slug: "storage",
    shopifyProductType: "Storage",
    name: "Storage",
    plural: "Storage",
    blurb: "Tins and vessels for the shelf that stays on show.",
  },
];

export function getProductType(slug: string): ProductTypeDefinition | undefined {
  return PRODUCT_TYPES.find((type) => type.slug === slug);
}

/**
 * Matches Shopify's `productType` to a category, tolerating singular/plural.
 * Merchandisers type this field by hand, and an exact match would drop a
 * product out of its own category listing with no visible error.
 */
export function getProductTypeByShopifyType(
  shopifyProductType: string,
): ProductTypeDefinition | undefined {
  const normalise = (value: string) =>
    value.trim().toLowerCase().replace(/[\s_-]+/g, " ").replace(/s$/, "");
  const needle = normalise(shopifyProductType);
  if (!needle) return undefined;

  return PRODUCT_TYPES.find(
    (type) =>
      normalise(type.shopifyProductType) === needle ||
      normalise(type.plural) === needle ||
      normalise(type.slug) === needle,
  );
}

/* -------------------------------------------------------------------------- */
/* 3. Design collections                                                       */
/* -------------------------------------------------------------------------- */

export type DesignCollection = {
  handle: string;
  name: string;
  reference: string;
  tagline: string;
  introduction: string;
  story: string[];
  /** The single botanical family. One collection, one species — no blending. */
  botanical: string;
  /**
   * Motifs drawn but held back for a later drop. Recorded so the decision is
   * documented in code and cannot be picked up by accident; never rendered.
   */
  reservedBotanicals: string[];
  palette: { name: string; hex: string }[];
  /**
   * The permitted colorways. Ground and linework pairs are fixed — a Signature
   * ground is never combined with Inverse linework — and gold is the accent in
   * all three rather than a fourth colour relationship.
   */
  colorways: Colorway[];
  shopifyCollectionHandle: string | null;
  featured: boolean;
};

export type ColorwaySlug = "signature" | "inverse" | "warm-stone";

export type Colorway = {
  slug: ColorwaySlug;
  name: string;
  ground: { name: string; hex: string };
  linework: { name: string; hex: string };
  accent: { name: string; hex: string };
  /** When this colorway is the right choice. */
  use: string;
};

export const DESIGN_COLLECTIONS: DesignCollection[] = [
  {
    handle: "botanica-nocturne",
    name: "Botanica Nocturne",
    reference: "N° I",
    tagline: "An olive branch, engraved as a naturalist's plate",
    introduction:
      "A dense engraved botanical drawn in the manner of a nineteenth-century naturalist plate — one olive branch, rendered in linework fine enough to read as an apothecary label at arm's length and as botany up close.",
    story: [
      "The engraved botanical plate was a working document before it was a decorative one: a record made to identify a species precisely, at a time when getting it wrong had consequences.",
      "Botanica Nocturne keeps that discipline. One family only — olive — drawn as a single continuous plate, with the leaf undersides, the node joins and the fruit set all rendered in the same line weight the engravers used.",
      "Gold appears once, and only as an accent: a single leaf, a vein within the linework, or the hairline that frames the plate. It is never a fill and never a ground. The restraint is the point — a gilded field would make it ornament, and this is meant to read as a record.",
    ],
    botanical: "Olive",
    reservedBotanicals: ["Fig — held for a second drop"],
    palette: [
      { name: "Ivory", hex: "#F5F0E8" },
      { name: "Ecru", hex: "#E4DACA" },
      { name: "Espresso", hex: "#2A211A" },
      { name: "Antique Gold", hex: "#A67C3D" },
    ],
    colorways: [
      {
        slug: "signature",
        name: "Signature",
        ground: { name: "Espresso", hex: "#2a211a" },
        linework: { name: "Ivory", hex: "#f5f0e8" },
        accent: { name: "Gold", hex: "#a67c3d" },
        use: "The hero colorway. Default for lead imagery and the pieces the collection is judged on.",
      },
      {
        slug: "inverse",
        name: "Inverse",
        ground: { name: "Ivory", hex: "#f5f0e8" },
        linework: { name: "Espresso", hex: "#2a211a" },
        accent: { name: "Gold", hex: "#a67c3d" },
        use: "The same logic on a light ground, for pieces where a dark ground is impractical.",
      },
      {
        slug: "warm-stone",
        name: "Warm Stone",
        ground: { name: "Stone", hex: "#d9cfc1" },
        linework: { name: "Espresso", hex: "#2a211a" },
        accent: { name: "Gold", hex: "#a67c3d" },
        use: "A quieter third option — softer contrast than either Signature or Inverse.",
      },
    ],
    shopifyCollectionHandle: "botanica-nocturne",
    featured: true,
  },
];

export function getDesign(handle: string): DesignCollection | undefined {
  return DESIGN_COLLECTIONS.find((design) => design.handle === handle);
}

export function getFeaturedDesigns(): DesignCollection[] {
  return DESIGN_COLLECTIONS.filter((design) => design.featured);
}

/* -------------------------------------------------------------------------- */
/* 4. Product blueprints                                                       */
/* -------------------------------------------------------------------------- */

export type MotifApplication = {
  form: MotifFormSlug;
  /** Exactly where the form sits on this piece. */
  placement: string;
};

/**
 * The planned range: which motif form each piece carries, and where.
 *
 * This is a *specification*, not a catalogue. It never produces a product on
 * the site — products come from Shopify and nowhere else. Its two jobs are to
 * label a real product's motif once that product exists (matched by handle),
 * and to state the intended range on the collection page as plainly listed
 * work in preparation.
 *
 * Deliberately carries no prices, options, imagery or material claims: those
 * are facts about a physical product, and inventing them here would put
 * unverified specifications in front of a customer.
 */
export type ProductBlueprint = {
  /** Intended Shopify handle. The join between this layer and the store. */
  handle: string;
  title: string;
  type: ProductTypeSlug;
  /** Order within the collection listing. */
  position: number;
  motifs: MotifApplication[];
};

export const PRODUCT_BLUEPRINTS: ProductBlueprint[] = [
  {
    handle: "botanica-tea-towel",
    title: "Tea Towel",
    type: "kitchen-linen",
    position: 1,
    motifs: [
      { form: "hairline-border", placement: "Border" },
      { form: "single-sprig", placement: "Corner" },
    ],
  },
  {
    handle: "botanica-apron",
    title: "Apron",
    type: "kitchen-linen",
    position: 2,
    motifs: [
      { form: "single-sprig", placement: "Chest and pocket" },
      { form: "hairline-border", placement: "Hem" },
    ],
  },
  {
    handle: "botanica-oven-glove",
    title: "Oven Glove",
    type: "kitchen-linen",
    position: 3,
    motifs: [{ form: "hairline-border", placement: "Border" }],
  },
  {
    handle: "botanica-pot-holder",
    title: "Pot Holder",
    type: "kitchen-linen",
    position: 4,
    motifs: [{ form: "hairline-border", placement: "Border" }],
  },
  {
    handle: "botanica-placemats",
    title: "Placemats, Set of Four",
    type: "table",
    position: 5,
    motifs: [{ form: "dense-field", placement: "Dense border" }],
  },
  {
    handle: "botanica-coasters",
    title: "Coaster Set",
    type: "table",
    position: 6,
    motifs: [{ form: "single-sprig", placement: "Emblem" }],
  },
  {
    handle: "botanica-chopping-board",
    title: "Chopping Board",
    type: "serving",
    position: 7,
    motifs: [
      { form: "hairline-border", placement: "Printed backer and edge" },
    ],
  },
  {
    handle: "botanica-serving-tray",
    title: "Serving Tray",
    type: "serving",
    position: 8,
    motifs: [
      { form: "dense-field", placement: "Centre field" },
      { form: "hairline-border", placement: "Edge" },
    ],
  },
  {
    handle: "botanica-storage-tin",
    title: "Storage Tin",
    type: "storage",
    position: 9,
    motifs: [{ form: "single-sprig", placement: "Emblem" }],
  },
  {
    handle: "botanica-mug",
    title: "Mug",
    type: "table",
    position: 10,
    motifs: [{ form: "single-sprig", placement: "Emblem" }],
  },
];

export function getBlueprint(handle: string): ProductBlueprint | undefined {
  return PRODUCT_BLUEPRINTS.find((blueprint) => blueprint.handle === handle);
}

export function blueprintsForType(type: ProductTypeSlug): ProductBlueprint[] {
  return PRODUCT_BLUEPRINTS.filter((blueprint) => blueprint.type === type).sort(
    (a, b) => a.position - b.position,
  );
}
