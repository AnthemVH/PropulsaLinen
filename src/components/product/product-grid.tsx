import type { Product } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

import { ProductCard } from "./product-card";

/**
 * Lookbook grid. Deliberately loose: three across at most, with every third
 * tile dropped down so the grid reads as a spread rather than a catalogue.
 */
export function ProductGrid({
  products,
  className,
  stagger = true,
}: {
  products: Product[];
  className?: string;
  stagger?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-12 lg:gap-y-24",
        className,
      )}
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < 3}
          className={cn(
            stagger && index % 3 === 1 && "lg:mt-20",
            stagger && index % 3 === 2 && "lg:mt-10",
          )}
        />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="border-y hairline py-24 text-center">
      <p className="font-display text-display-sm">{title}</p>
      <p className="mx-auto mt-4 max-w-md text-espresso-muted">{body}</p>
    </div>
  );
}
