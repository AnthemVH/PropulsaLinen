import { DESIGN_COLLECTIONS } from "./designs";

export const SITE = {
  name: "Propulsa",
  tagline: "Heritage goods for the modern house",
  description:
    "Botanica Nocturne by Propulsa — an engraved olive branch drawn as a nineteenth-century naturalist's plate, executed across the kitchen and table in three forms and three colorways. Made to order, finished by hand.",
  /** Used for canonical URLs and Open Graph. Override per environment. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://propulsa.com",
  locale: "en_GB",
  contactEmail: "atelier@propulsa.com",
} as const;

export type NavItem = {
  label: string;
  href: string;
  /** Rendered muted, with no link, until the category is live. */
  disabled?: boolean;
  description?: string;
};

/**
 * Browsing model 1 — by product type. Built at request time from the live
 * catalogue (see `deriveCategories`), so the nav can never advertise a
 * category the store cannot fill.
 */

/** Browsing model 2 — by design collection, which spans product types. */
export const DESIGN_NAV: NavItem[] = DESIGN_COLLECTIONS.map((design) => ({
  label: design.name,
  href: `/designs/${design.handle}`,
  description: design.tagline,
}));

/**
 * The house runs one collection at a time, so the nav points at that
 * collection rather than at an index of one.
 */
export const PRIMARY_NAV: NavItem[] = [
  { label: "Shop", href: "/shop" },
  { label: DESIGN_COLLECTIONS[0]?.name ?? "Collections", href: DESIGN_COLLECTIONS[0] ? `/designs/${DESIGN_COLLECTIONS[0].handle}` : "/designs" },
  { label: "The House", href: "/about" },
];

export const FOOTER_NAV: { title: string; items: NavItem[] }[] = [
  {
    title: "Shop",
    items: [
      { label: "All pieces", href: "/shop" },
      { label: "By collection", href: "/collections" },
    ],
  },
  {
    title: "Collections",
    items: DESIGN_NAV,
  },
  {
    title: "The House",
    items: [
      { label: "Our story", href: "/about" },
      { label: "Shipping & returns", href: "/shipping-returns" },
      { label: "Frequently asked", href: "/faq" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export const HOUSE_NOTE =
  "Every piece is made to order and finished by hand. Nothing is warehoused, and nothing is discounted.";

/**
 * What the customer pays, and where.
 *
 * The store does not collect import duty or local tax at checkout, so an
 * order can arrive with a charge attached that the storefront never quoted.
 * Saying so before payment is the only honest option — a customer who learns
 * it from a courier learns it too late — so the wording lives here and is
 * used everywhere money is discussed, rather than being written twice and
 * drifting apart.
 */
export const DUTIES_NOTE = {
  /** One line, for the cart drawer and anywhere else space is short. */
  short:
    "Shipping is calculated at checkout. Import duty and local tax are not — where they apply, they are charged on delivery.",
  /** The summary row on the cart page. */
  summaryLabel: "Duty and local tax",
  summaryValue: "Charged on delivery, if due",
} as const;

/**
 * How the house makes things.
 *
 * Deliberately about process and policy rather than specification: fabric
 * weights, compositions and care are facts about an individual product and
 * belong on that product's page, where they come from Shopify. Nothing here
 * asserts a material claim the storefront cannot stand behind.
 */
export const HOUSE_STANDARDS: {
  title: string;
  body: string;
}[] = [
  {
    title: "Made to order",
    body: "Nothing is warehoused. Each piece is made after it is bought — slower, and better: no surplus, no clearance, and no season that ends in a sale.",
  },
  {
    title: "Finished by hand",
    body: "Every piece is made and finished by hand to order, then checked before it is packed. Where a hem, an edge or a seam is involved, a person has handled it.",
  },
  {
    title: "Built for daily use",
    body: "These are working objects, not display pieces. The tray gets carried and the tea towel goes in the wash, and they are made to be treated that way.",
  },
];
