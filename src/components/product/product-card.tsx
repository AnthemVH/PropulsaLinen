import Link from "next/link";

import { resolveDesign } from "@/lib/catalog";
import type { Product } from "@/lib/shopify/types";
import {
  cn,
  formatPriceRange,
  isColourOption,
  swatchColour,
} from "@/lib/utils";
import { Media } from "@/components/ui/media";

/**
 * Lookbook tile. Image-led, price understated, no badges or urgency devices.
 */
export function ProductCard({
  product,
  priority = false,
  sizes = "(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 90vw",
  className,
}: {
  product: Product;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const design = resolveDesign(product);
  const colours = product.options.find((option) =>
    isColourOption(option.name),
  )?.values;

  return (
    <article className={cn("group", className)}>
      <Link href={`/products/${product.handle}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-stone/30">
          <div className="absolute inset-0 transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.035]">
            <Media
              image={product.featuredImage}
              sizes={sizes}
              priority={priority}
            />
          </div>
          {!product.availableForSale ? (
            <span className="eyebrow absolute bottom-4 left-4 bg-ivory/90 px-3 py-2 text-espresso-muted">
              Made to order
            </span>
          ) : null}
        </div>

        <div className="mt-5 flex items-baseline justify-between gap-4">
          <h3 className="font-display text-xl text-espresso transition-colors duration-500 group-hover:text-gold">
            {product.title}
          </h3>
          <p className="shrink-0 text-sm text-espresso-muted tabular-nums">
            {formatPriceRange(
              product.priceRange.minVariantPrice,
              product.priceRange.maxVariantPrice,
            )}
          </p>
        </div>

        {design ? (
          <p className="eyebrow mt-2 text-espresso-muted">
            {design.reference} · {design.name}
          </p>
        ) : null}
      </Link>

      {colours?.length ? (
        <ul className="mt-4 flex items-center gap-2" aria-label="Available colours">
          {colours.map((colour) => (
            <li
              key={colour}
              title={colour}
              className="size-3 rounded-full border border-espresso/15"
              style={{ backgroundColor: swatchColour(colour) }}
            >
              <span className="sr-only">{colour}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
