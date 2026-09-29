import Link from "next/link";

import { Media } from "@/components/ui/media";
import type { RoomNav } from "@/lib/catalog";
import { cn } from "@/lib/utils";

// Big picture tiles, one per room. The first four sit in a row of four and the
// rest in a row of three, so seven rooms fill the grid with no gap.
export function RoomTiles({ rooms }: { rooms: RoomNav[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-12 lg:gap-x-8">
      {rooms.map((nav, index) => (
        <li
          key={nav.room.slug}
          className={cn(
            index === 0 && "col-span-2 lg:col-span-3",
            index > 0 && index < 4 && "lg:col-span-3",
            index >= 4 && "lg:col-span-4",
          )}
        >
          <Link href={`/rooms/${nav.room.slug}`} className="group block">
            <div
              className={cn(
                "relative overflow-hidden bg-stone/30",
                index === 0 ? "aspect-[4/3] lg:aspect-[4/5]" : "aspect-[4/5]",
                index >= 4 && "lg:aspect-[5/4]",
              )}
            >
              <div className="absolute inset-0 transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.04]">
                <Media
                  image={nav.image}
                  alt={nav.room.name}
                  sizes="(min-width: 1024px) 33vw, 50vw"
                />
              </div>
            </div>
            <h3 className="mt-4 font-display text-xl text-espresso transition-colors duration-500 group-hover:text-gold-ink md:text-2xl">
              {nav.room.name}
            </h3>
            <p className="mt-1 hidden text-sm text-espresso-muted sm:block">
              {nav.room.description}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
