import { groupProducts, type ProductGroup } from "@/lib/catalog";
import type { Product } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

import { GroupCard } from "./group-card";

// Groups the products into colourway cards, then lays them out.
export function ProductGrid({
  products,
  className,
}: {
  products: Product[];
  className?: string;
}) {
  return <GroupGrid groups={groupProducts(products)} className={className} />;
}

export function GroupGrid({
  groups,
  className,
}: {
  groups: ProductGroup[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 md:gap-x-8 xl:grid-cols-4 xl:gap-y-16",
        className,
      )}
    >
      {groups.map((group, index) => (
        <GroupCard key={group.key} group={group} priority={index < 4} />
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
