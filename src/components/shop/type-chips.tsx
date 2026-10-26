import Link from "next/link";

import type { TypeLink } from "@/lib/catalog";
import { cn } from "@/lib/utils";

// A row of product-type filters, set as a contents line: the chosen one is
// underlined in gold. Each is a plain link, so the filter lives in the URL and
// the page works without JavaScript. On phones the row scrolls sideways.
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
      "relative block shrink-0 py-2.5 font-display text-lg whitespace-nowrap transition-colors duration-300",
      "after:absolute after:inset-x-0 after:bottom-1 after:h-px after:origin-left after:bg-gold after:transition-transform after:duration-500 after:ease-out",
      isActive
        ? "text-espresso after:scale-x-100"
        : "text-espresso-muted after:scale-x-0 hover:text-espresso hover:after:scale-x-100",
    );

  return (
    <nav
      aria-label="Filter by type"
      className="no-scrollbar -mx-[var(--gutter)] overflow-x-auto overscroll-x-contain px-[var(--gutter)] md:mx-0 md:px-0"
    >
      <ul className="flex gap-x-7 md:flex-wrap">
        <li>
          <Link
            href={basePath}
            scroll={false}
            className={chipClass(active === null)}
            aria-current={active === null ? "page" : undefined}
          >
            All
          </Link>
        </li>
        {types.map((type) => (
          <li key={type.slug}>
            <Link
              href={`${basePath}?type=${type.slug}`}
              scroll={false}
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
