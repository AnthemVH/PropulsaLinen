"use client";

import Link from "next/link";
import { useState } from "react";

import { Media } from "@/components/ui/media";
import type { ProductGroup } from "@/lib/catalog";
import { typeName } from "@/lib/rooms";
import { catalogueNumber, cn, formatPrice } from "@/lib/utils";

// A product card that stands for a whole colourway group. Hovering a swatch
// shows that colourway; clicking it goes to that colourway's page.
export function GroupCard({
  group,
  index,
  priority = false,
  sizes = "(min-width: 1280px) 23vw, (min-width: 768px) 32vw, 48vw",
  className,
  frameClassName = "aspect-[4/5]",
}: {
  group: ProductGroup;
  /** Position in its listing, shown as a catalogue number. */
  index?: number;
  priority?: boolean;
  sizes?: string;
  className?: string;
  frameClassName?: string;
}) {
  const [active, setActive] = useState(0);
  // The second photo only loads once the card is hovered, so a grid of fifty
  // cards doesn't download a hundred images up front.
  const [hovered, setHovered] = useState(false);
  const product = group.items[active].product;
  const hoverImage = product.images[1] ?? null;
  const price = formatPrice(group.minPrice);
  const swatches = group.items.filter((item) => item.colourway);
  const activeColourway = group.items[active].colourway;

  return (
    <article
      className={cn("group/card flex flex-col", className)}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setHovered(true);
      }}
    >
      <Link href={`/products/${product.handle}`} className="block">
        <div className="plate-marks [--mark-inset:-7px] before:opacity-0 after:opacity-0 before:transition-opacity after:transition-opacity before:duration-500 after:duration-500 group-hover/card:before:opacity-100 group-hover/card:after:opacity-100">
          <div className={cn("relative overflow-hidden bg-stone/45", frameClassName)}>
            <div className="absolute inset-0 transition-transform duration-[1400ms] ease-out group-hover/card:scale-[1.035]">
              <Media image={product.featuredImage} sizes={sizes} priority={priority} />
            </div>
            {hovered && hoverImage ? (
              <div
                aria-hidden
                className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover/card:opacity-100"
              >
                {/* A second view of the same piece: decorative, so it isn't read out twice. */}
                <Media image={hoverImage} sizes={sizes} alt="" />
              </div>
            ) : null}
            {!product.availableForSale ? (
              <span className="eyebrow absolute top-3 left-3 bg-ivory-light/90 px-2.5 py-1.5 text-espresso-soft">
                Not available
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex items-baseline justify-between gap-3">
          <p className="eyebrow min-w-0 truncate text-espresso-muted">
            {typeName(group.productType)}
          </p>
          {typeof index === "number" ? (
            <span aria-hidden className="numeral shrink-0 text-sm text-gold-ink">
              N° {catalogueNumber(index + 1)}
            </span>
          ) : null}
        </div>
        <h3 className="mt-2 font-display text-lg leading-snug text-pretty text-espresso [overflow-wrap:anywhere] transition-colors duration-300 group-hover/card:text-gold-ink md:text-[1.375rem]">
          {group.title}
        </h3>
        <p className="mt-1.5 text-sm text-espresso-soft tabular-nums">
          {group.hasPriceRange ? `From ${price}` : price}
        </p>
      </Link>

      {swatches.length ? (
        <div className="mt-3 flex items-center gap-3">
          <ul className="flex flex-wrap items-center gap-2" aria-label="Colourways">
            {group.items.map((item, itemIndex) =>
              item.colourway ? (
                <li key={item.product.handle}>
                  <Link
                    href={`/products/${item.product.handle}`}
                    onMouseEnter={() => setActive(itemIndex)}
                    onFocus={() => setActive(itemIndex)}
                    aria-label={item.colourway.name}
                    title={item.colourway.name}
                    className="press -m-1.5 block p-1.5"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "block size-3.5 border border-espresso/25 outline-offset-2 transition-[outline-color] duration-300",
                        itemIndex === active ? "outline outline-1 outline-gold" : "outline outline-1 outline-transparent",
                      )}
                      style={{ backgroundColor: item.colourway.hex }}
                    />
                  </Link>
                </li>
              ) : null,
            )}
          </ul>
          {activeColourway && swatches.length > 1 ? (
            <span className="truncate text-xs text-espresso-muted">{activeColourway.name}</span>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
