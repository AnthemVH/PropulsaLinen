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
