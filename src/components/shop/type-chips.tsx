import Link from "next/link";

import type { TypeLink } from "@/lib/catalog";
import { cn } from "@/lib/utils";

// A row of product-type filters. Each chip is a plain link, so the filter
// lives in the URL and the page works without JavaScript.
export function TypeChips({
  basePath,
  types,
  active,
}: {
  basePath: string;
  types: TypeLink[];
  active: string | null;
}) {
  const chipClass = (isActive: boolean) =>
    cn(
      "eyebrow shrink-0 border px-4 py-2.5 transition-colors duration-500",
      isActive
        ? "border-espresso bg-espresso text-ivory"
        : "hairline text-espresso hover:border-gold hover:text-gold-ink",
    );

  return (
    <nav aria-label="Filter by type" className="-mx-6 overflow-x-auto px-6 md:mx-0 md:px-0">
      <ul className="flex gap-2 md:flex-wrap">
        <li>
          <Link href={basePath} className={chipClass(active === null)} aria-current={active === null ? "page" : undefined}>
            All
          </Link>
        </li>
        {types.map((type) => (
          <li key={type.slug}>
            <Link
              href={`${basePath}?type=${type.slug}`}
              className={chipClass(active === type.slug)}
              aria-current={active === type.slug ? "page" : undefined}
            >
              {type.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
