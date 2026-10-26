import type { CSSProperties, ReactNode } from "react";

import { Plate } from "@/components/brand/plate";
import { groupProducts, type ProductGroup } from "@/lib/catalog";
import type { Product } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

import { GroupCard } from "./group-card";

// Groups the products into colourway cards, then lays them out.
export function ProductGrid({
  products,
  className,
  layout,
}: {
  products: Product[];
  className?: string;
  layout?: "grid" | "folio";
}) {
  return <GroupGrid groups={groupProducts(products)} className={className} layout={layout} />;
}

/**
 * `grid` is the plain catalogue. `folio` sets the first piece as a large plate
 * across two columns and rows, the way a catalogue opens a section on its
 * lead piece — used where a listing is short and curated.
 */
export function GroupGrid({
  groups,
  className,
  layout = "grid",
}: {
  groups: ProductGroup[];
  className?: string;
  layout?: "grid" | "folio";
}) {
  const folio = layout === "folio" && groups.length >= 5;

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 md:grid-cols-3 md:gap-x-8 md:gap-y-16 xl:grid-cols-4",
        className,
      )}
    >
      {groups.map((group, index) => {
        const lead = folio && index === 0;
        return (
          <div
            key={group.key}
            data-reveal
            style={{ "--d": Math.min(index % 4, 3) * 70 } as CSSProperties}
            className={cn(lead && "col-span-2 md:row-span-2")}
          >
            <GroupCard
              group={group}
              index={index}
              priority={index < 4}
              sizes={
                lead
                  ? "(min-width: 1280px) 46vw, (min-width: 768px) 64vw, 96vw"
                  : undefined
              }
              frameClassName={lead ? "aspect-[4/5] md:aspect-auto md:h-full md:min-h-[32rem]" : undefined}
              className={cn(lead && "h-full")}
            />
          </div>
        );
      })}
    </div>
  );
}

/**
 * An empty listing, set as a mounted plate rather than an apology: a single
 * sprig on ivory, the message, and where to go instead.
 */
export function EmptyState({
  title,
  body,
  label = "In preparation",
  children,
  className,
}: {
  title: string;
  /** The small line above the title. */
  label?: string;
  body: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      data-reveal
      className={cn(
        "grid items-center gap-10 border-y hairline py-14 md:grid-cols-[minmax(0,14rem)_1fr] md:gap-16 md:py-20",
        className,
      )}
    >
      <Plate
        form="single-sprig"
        colorway="inverse"
        className="mx-auto w-36 md:w-full"
        frameClassName="aspect-[10/13]"
        artClassName="object-contain"
        marks
      />
      <div className="text-center md:text-left">
        <p className="eyebrow text-gold-ink">{label}</p>
        <p className="mt-4 font-display text-display-sm text-balance text-espresso">{title}</p>
        <p className="mx-auto mt-4 max-w-md text-pretty text-espresso-soft md:mx-0">{body}</p>
        {children ? <div className="mt-8 flex flex-wrap justify-center gap-6 md:justify-start">{children}</div> : null}
      </div>
    </div>
  );
}
