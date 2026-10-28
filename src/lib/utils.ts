import type { Money } from "@/lib/shopify/types";

/** Minimal class-name joiner — avoids a dependency for the one thing we need. */
export function cn(
  ...values: Array<string | false | null | undefined>
): string {
  return values.filter(Boolean).join(" ");
}

/**
 * Whether an image url can actually be fetched — by next/image, or by whatever
 * scrapes an Open Graph tag. Anything else is a placeholder standing in for a
 * gap in the catalogue, and must be treated as no image at all.
 */
export function isFetchableImage<T extends { url: string }>(
  image: T | null | undefined,
): image is T {
  // Remote images, or files in /public (room photos).
  return /^(https?:\/\/|\/[^/])/.test(image?.url ?? "");
}

export function formatPrice(
  money: Money,
  options: { locale?: string } = {},
): string {
  const amount = Number(money.amount);
  return new Intl.NumberFormat(options.locale ?? "en-GB", {
    style: "currency",
    currency: money.currencyCode,
    // Whole prices read cleaner in an editorial layout; keep pence when present.
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPriceRange(
  min: Money,
  max: Money,
  options: { locale?: string } = {},
): string {
  if (min.amount === max.amount) return formatPrice(min, options);
  return `${formatPrice(min, options)} – ${formatPrice(max, options)}`;
}

/**
 * Colour names → swatch hex. Shopify has no colour-swatch primitive on the
 * Storefront API, so the mapping lives here. Unknown names fall back to a
 * neutral stone rather than disappearing.
 *
 * Includes the plain colour words the print supplier uses ("Off White",
 * "Black") alongside the house palette, muted slightly so a swatch row never
 * fights the ivory ground.
 */
const COLOUR_SWATCHES: Record<string, string> = {
  // House palette
  ivory: "#F5F0E8",
  ecru: "#E4DACA",
  "warm stone": "#D9CFC1",
  stone: "#D9CFC1",
  sable: "#8A7761",
  "antique gold": "#A67C3D",
  gold: "#A67C3D",
  bronze: "#8E6A34",
  espresso: "#2A211A",
  alabaster: "#EFEAE1",
  linen: "#E8E0D2",
  // Supplier colour names
  "off white": "#F2EDE4",
  white: "#FBF8F3",
  black: "#211C18",
  blue: "#5A6B7D",
  pink: "#D8B5AE",
  grey: "#9A9186",
  gray: "#9A9186",
  natural: "#E4DACA",
  navy: "#2C3646",
  green: "#6B7360",
  red: "#8E4238",
};

export function swatchColour(name: string): string {
  return COLOUR_SWATCHES[name.trim().toLowerCase()] ?? "#D9CFC1";
}

/**
 * Option-name matching is substring-based, not exact. Shopify option names are
 * merchandiser-authored and rarely the bare word: this store ships "Towel Size"
 * and "Edge color", and a future category will bring "Garment Size". Anchoring
 * on `^size$` silently drops the swatch UI and the size facet.
 */
export function isColourOption(name: string): boolean {
  return /colou?r/i.test(name);
}

export function isSizeOption(name: string): boolean {
  return /size/i.test(name);
}

/** 1 → "I", 14 → "XIV". Plate and chapter numerals across the folio. */
export function toRoman(value: number): string {
  const numerals: [number, string][] = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
    [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let remaining = Math.max(0, Math.floor(value));
  let out = "";
  for (const [amount, numeral] of numerals) {
    while (remaining >= amount) {
      out += numeral;
      remaining -= amount;
    }
  }
  return out;
}

/** 7 → "007". Catalogue numbers on cards. */
export function catalogueNumber(value: number, width = 3): string {
  return String(Math.max(0, Math.floor(value))).padStart(width, "0");
}

/**
 * Shopify gives a product with no real options a single "Title" option whose
 * only value is "Default Title". It is not a choice, so it is never shown.
 */
export function isPlaceholderOption(option: { name: string; value?: string; values?: string[] }): boolean {
  const values = option.values ?? (option.value !== undefined ? [option.value] : []);
  return values.length === 1 && /^default title$/i.test(values[0].trim());
}
