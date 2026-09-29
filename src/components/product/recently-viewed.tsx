"use client";

import Link from "next/link";
import { useEffect, useMemo, useSyncExternalStore } from "react";

import { Media } from "@/components/ui/media";
import { SectionHeading } from "@/components/ui/primitives";
import type { Image } from "@/lib/shopify/types";

const STORAGE_KEY = "propulsa:recently-viewed";
const MAX_SAVED = 12;

export type ViewedProduct = {
  handle: string;
  title: string;
  type: string;
  price: string;
  image: Image | null;
};

// localStorage can be missing or throw (private windows, blocked storage), so
// every read and write is wrapped and the row just stays empty if it fails.
function readSaved(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function parse(raw: string): ViewedProduct[] {
  try {
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

// Records this product as viewed, and shows the others viewed before it.
export function RecentlyViewed({ current }: { current: ViewedProduct }) {
  // Nothing on the server; the saved list once the browser has it.
  const raw = useSyncExternalStore(subscribe, readSaved, () => "[]");
  const others = useMemo(
    () => parse(raw).filter((item) => item.handle !== current.handle).slice(0, 4),
    [raw, current.handle],
  );

  useEffect(() => {
    try {
      const list = parse(readSaved()).filter((item) => item.handle !== current.handle);
      const next = [current, ...list].slice(0, MAX_SAVED);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage unavailable — nothing to remember, nothing to show.
    }
  }, [current]);

  if (!others.length) return null;

  return (
    <section>
      <SectionHeading eyebrow="Recently viewed" title="Where you have been" />
      <ul className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4 md:gap-x-8">
        {others.map((item) => (
          <li key={item.handle}>
            <Link href={`/products/${item.handle}`} className="group block">
              <div className="relative aspect-[4/5] overflow-hidden bg-stone/30">
                <Media image={item.image} sizes="(min-width: 768px) 23vw, 48vw" />
              </div>
              <p className="eyebrow mt-4 text-espresso-muted">{item.type}</p>
              <h3 className="mt-2 font-display text-lg leading-snug text-espresso transition-colors duration-500 group-hover:text-gold">
                {item.title}
              </h3>
              <p className="mt-1 text-sm text-espresso-muted tabular-nums">{item.price}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
