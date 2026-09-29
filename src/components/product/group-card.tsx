"use client";

import Link from "next/link";
import { useState } from "react";

import { Media } from "@/components/ui/media";
import type { ProductGroup } from "@/lib/catalog";
import { typeName } from "@/lib/rooms";
import { cn, formatPrice } from "@/lib/utils";

// A product card that stands for a whole colourway group. Hovering a swatch
// shows that colourway; clicking it goes to that colourway's page.
export function GroupCard({
  group,
  priority = false,
  sizes = "(min-width: 1280px) 23vw, (min-width: 768px) 32vw, 48vw",
  className,
}: {
  group: ProductGroup;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const [active, setActive] = useState(0);
  // The second photo only loads once the card is hovered, so a grid of fifty
  // cards doesn't download a hundred images up front.
  const [hovered, setHovered] = useState(false);
  const product = group.items[active].product;
  const hoverImage = product.images[1] ?? null;
  const price = formatPrice(group.minPrice);
  const hasSwatches = group.items.some((item) => item.colourway);

  return (
    <article className={cn("group", className)} onMouseEnter={() => setHovered(true)}>
      <Link href={`/products/${product.handle}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-stone/30">
          <Media image={product.featuredImage} sizes={sizes} priority={priority} />
          {hovered && hoverImage ? (
            <div aria-hidden className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
              {/* A second view of the same piece: decorative, so it isn't read out twice. */}
              <Media image={hoverImage} sizes={sizes} alt="" />
            </div>
          ) : null}
        </div>

        <p className="eyebrow mt-4 text-espresso-muted">
          {typeName(group.productType)}
        </p>
        <h3 className="mt-2 font-display text-lg leading-snug text-espresso transition-colors duration-500 group-hover:text-gold-ink md:text-xl">
          {group.title}
        </h3>
        <p className="mt-1 text-sm text-espresso-muted tabular-nums">
          {group.hasPriceRange ? `From ${price}` : price}
        </p>
      </Link>

      {hasSwatches ? (
        <ul className="mt-3 flex items-center gap-2.5" aria-label="Colourways">
          {group.items.map((item, index) =>
            item.colourway ? (
              <li key={item.product.handle}>
                <Link
                  href={`/products/${item.product.handle}`}
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                  aria-label={item.colourway.name}
                  title={item.colourway.name}
                  className={cn(
                    "block size-4 rounded-full border border-espresso/20 ring-offset-2 ring-offset-ivory transition-shadow duration-300",
                    index === active && "ring-1 ring-gold",
                  )}
                  style={{ backgroundColor: item.colourway.hex }}
                />
              </li>
            ) : null,
          )}
        </ul>
      ) : null}
    </article>
  );
}
