"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";

import { MotifArt } from "@/components/brand/motif-art";
import { GROUND_CLASS, plateFor } from "@/components/brand/plates";
import { Media } from "@/components/ui/media";
import type { RoomNav } from "@/lib/catalog";
import { ROOMS } from "@/lib/rooms";
import { cn, isFetchableImage, toRoman } from "@/lib/utils";

/**
 * The rooms of the house as a folio index: numbered entries in large type on
 * the right, and on the left a single frame that turns to each room as the
 * pointer (or keyboard focus) moves down the list — the room's own photograph
 * where the catalogue has one, otherwise one of the plates.
 *
 * With no rooms published yet, the same index is shown unlinked and marked
 * as in preparation rather than left empty.
 */
export function RoomIndex({ rooms }: { rooms: RoomNav[] }) {
  const [active, setActive] = useState(0);
  const live = rooms.length > 0;
  const entries = live
    ? rooms.map((nav) => ({ room: nav.room, image: nav.image, kinds: nav.types.length }))
    : ROOMS.filter((room) => room.slug !== "more").map((room) => ({ room, image: null, kinds: 0 }));

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
      {/* The turning frame (desktop) */}
      <div className="hidden lg:col-span-5 lg:block">
        <div className="sticky top-[calc(var(--header-h)+2.5rem)]">
          <div className="plate-marks">
            <div className="relative aspect-[4/5] overflow-hidden bg-espresso">
              {entries.map((entry, index) => {
                const plate = plateFor(index);
                const shown = index === active;
                return (
                  <div
                    key={entry.room.slug}
                    aria-hidden
                    className={cn(
                      "absolute inset-0 transition-[opacity,transform] duration-[1100ms] ease-out",
                      shown ? "scale-100 opacity-100" : "scale-[1.05] opacity-0",
                    )}
                  >
                    {isFetchableImage(entry.image) ? (
                      <Media image={entry.image} sizes="40vw" alt="" />
                    ) : (
                      <div className={cn("absolute inset-0", GROUND_CLASS[plate.colorway])}>
                        <MotifArt
                          form={plate.form}
                          colorway={plate.colorway}
                          alt=""
                          className="object-contain"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <p className="running-head mt-5 flex items-baseline justify-between text-espresso-muted">
            <span>{entries[active]?.room.name}</span>
            <span className="numeral text-sm normal-case tracking-normal text-gold-ink">
              {toRoman(active + 1)} / {toRoman(entries.length)}
            </span>
          </p>
        </div>
      </div>

      {/* The index */}
      <ol className="border-t hairline lg:col-span-7">
        {entries.map((entry, index) => {
          const isActive = index === active;
          const plate = plateFor(index);
          const body = (
            <>
              <span
                className={cn(
                  "numeral w-10 shrink-0 pt-2 text-lg transition-colors duration-300 md:w-14 md:text-xl",
                  isActive ? "text-gold-ink" : "text-espresso-muted",
                )}
              >
                {toRoman(index + 1)}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block font-display text-[2rem] leading-[1.05] text-pretty transition-[color,transform] duration-700 ease-out md:text-display-md",
                    live && "group-hover/room:text-gold-ink lg:group-hover/room:translate-x-3",
                    live ? "text-espresso" : "text-espresso-soft",
                  )}
                >
                  {entry.room.name}
                </span>
                <span className="mt-2 block max-w-md text-pretty text-espresso-soft">
                  {entry.room.description}
                </span>
                <span className="eyebrow mt-3 block text-espresso-muted">
                  {live
                    ? `${entry.kinds} ${entry.kinds === 1 ? "kind of piece" : "kinds of piece"}`
                    : "In preparation"}
                </span>
              </span>
              {/* Phones: a small plate beside each entry */}
              <span
                aria-hidden
                className={cn(
                  "relative mt-2 h-20 w-16 shrink-0 overflow-hidden lg:hidden",
                  GROUND_CLASS[plate.colorway],
                )}
              >
                {isFetchableImage(entry.image) ? (
                  <Media image={entry.image} sizes="64px" alt="" />
                ) : (
                  <MotifArt form={plate.form} colorway={plate.colorway} alt="" className="object-contain" />
                )}
              </span>
            </>
          );

          return (
            <li
              key={entry.room.slug}
              data-reveal
              style={{ "--d": index * 60 } as CSSProperties}
              className="border-b hairline"
            >
              {live ? (
                <Link
                  href={`/rooms/${entry.room.slug}`}
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                  className="group/room flex items-start gap-4 py-6 md:gap-6 md:py-8"
                >
                  {body}
                </Link>
              ) : (
                <div
                  onMouseEnter={() => setActive(index)}
                  className="flex items-start gap-4 py-6 md:gap-6 md:py-8"
                >
                  {body}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
