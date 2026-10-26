import type { CSSProperties } from "react";

import type { ProductGroup } from "@/lib/catalog";

import { GroupCard } from "./group-card";

/**
 * A horizontal shelf of pieces, using the browser's own scroll and snap so a
 * flick on a phone carries native momentum. Bleeds to the right edge of the
 * page to show there is more; the gutter is kept on the left.
 */
export function ProductRail({ groups, label }: { groups: ProductGroup[]; label: string }) {
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className="no-scrollbar -mr-[var(--gutter)] snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-pl-[var(--gutter)] outline-offset-8 [touch-action:pan-x_pan-y]"
    >
      <ul className="flex gap-4 pr-[var(--gutter)] sm:gap-6 md:gap-8">
        {groups.map((group, index) => (
          <li
            key={group.key}
            data-reveal
            style={{ "--d": Math.min(index, 4) * 70 } as CSSProperties}
            className="w-[68vw] shrink-0 snap-start sm:w-[42vw] md:w-[30vw] lg:w-[22vw] 3xl:w-[19rem]"
          >
            <GroupCard group={group} index={index} sizes="(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 68vw" />
          </li>
        ))}
      </ul>
    </div>
  );
}
