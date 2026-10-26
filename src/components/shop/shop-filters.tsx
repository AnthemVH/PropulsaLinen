"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import type { FilterOption, ShopFacets } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const FILTER_KEYS = ["room", "type", "colour", "price"] as const;
type FilterKey = (typeof FILTER_KEYS)[number];

const GROUP_LABELS: Record<FilterKey, string> = {
  room: "Room",
  type: "Product",
  colour: "Colourway",
  price: "Price",
};

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
];

// Reads and writes the filters in the URL, so a filtered shop can be shared
// and the back button works.
function useFilterUrl() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selected = (key: string) =>
    searchParams.get(key)?.split(",").filter(Boolean) ?? [];

  const go = (params: URLSearchParams) => {
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const toggle = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = selected(key);
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];

    if (next.length) params.set(key, next.join(","));
    else params.delete(key);
    go(params);
  };

  const setSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "featured") params.delete("sort");
    else params.set("sort", value);
    go(params);
  };

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    FILTER_KEYS.forEach((key) => params.delete(key));
    go(params);
  };

  return { selected, toggle, setSort, clearAll, sort: searchParams.get("sort") ?? "featured" };
}

// Desktop: the filters in a column beside the grid.
export function FilterSidebar({ facets }: { facets: ShopFacets }) {
  return (
    <aside aria-label="Filters" className="hidden lg:block">
      <div className="sticky top-[calc(var(--header-h)+1.5rem)] max-h-[calc(100dvh-var(--header-h)-3rem)] overflow-y-auto overscroll-contain pr-2 no-scrollbar">
      <FilterGroups facets={facets} />
      </div>
    </aside>
  );
}

// Above the grid: piece count, active filters, sort, and on phones the button
// that opens the filter drawer.
export function ShopToolbar({ facets, total }: { facets: ShopFacets; total: number }) {
  const { selected, toggle, setSort, clearAll, sort } = useFilterUrl();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openButton = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  const active = FILTER_KEYS.flatMap((key) =>
    selected(key).map((value) => ({
      key,
      value,
      label: facets[key].find((option) => option.value === value)?.label ?? value,
    })),
  );

  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    // Move keyboard focus into the drawer, and back to the button that opened
    // it when it closes.
    closeButton.current?.focus();
    const opener = openButton.current;
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, [drawerOpen]);

  const pieces = `${total} ${total === 1 ? "piece" : "pieces"}`;

  return (
    <div>
      <div className="flex items-center justify-between gap-4 border-y hairline py-3.5">
        <button
          ref={openButton}
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="eyebrow press -my-2 flex items-center gap-3 py-2 text-espresso hover:text-gold-ink lg:hidden"
        >
          <span aria-hidden className="flex flex-col gap-[3px]">
            <span className="h-px w-4 bg-current" />
            <span className="ml-1 h-px w-3 bg-current" />
            <span className="ml-0.5 h-px w-3.5 bg-current" />
          </span>
          Filter & sort{active.length ? <span className="numeral text-base normal-case tracking-normal text-gold-ink">{active.length}</span> : null}
        </button>
        <p className="eyebrow hidden text-espresso-muted lg:block">{pieces}</p>

        <SortSelect value={sort} onChange={setSort} className="hidden lg:flex" />
        <p className="eyebrow text-espresso-muted lg:hidden">{pieces}</p>
      </div>

      {active.length ? (
        <ul className="mt-4 flex flex-wrap items-center gap-2">
          {active.map((filter) => (
            <li key={`${filter.key}-${filter.value}`}>
              <button
                type="button"
                onClick={() => toggle(filter.key, filter.value)}
                aria-label={`Remove ${filter.label}`}
                className="eyebrow press flex items-center gap-2.5 border hairline bg-ivory-light px-3 py-2.5 text-espresso hover:border-gold hover:text-gold-ink"
              >
                {filter.label}
                <span aria-hidden className="text-gold-ink">×</span>
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={clearAll}
              className="eyebrow link-underline press mx-2 py-2 text-espresso-muted hover:text-gold-ink"
            >
              Clear all
            </button>
          </li>
        </ul>
      ) : null}

      {/* Phone drawer, over a dimmed page */}
      <div
        aria-hidden
        onClick={() => setDrawerOpen(false)}
        className={cn(
          "fixed inset-0 z-50 bg-espresso/40 transition-opacity duration-500 lg:hidden",
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filter and sort"
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col border-t hairline bg-ivory-light shadow-[0_-30px_80px_-20px_rgba(42,33,26,0.35)] ease-drawer lg:hidden",
          // A sheet from the bottom edge, where the thumb already is. Visible
          // at once when opening, so focus can move in straight away; hidden
          // only after the slide when closing.
          drawerOpen
            ? "visible translate-y-0 transition-transform duration-500"
            : "invisible translate-y-full transition-[transform,visibility] duration-300",
        )}
      >
        <div className="flex items-center justify-between border-b hairline px-6 py-4">
          <p className="font-display text-2xl text-espresso">Filter &amp; sort</p>
          <button ref={closeButton} type="button" onClick={() => setDrawerOpen(false)} className="eyebrow press -mr-3 p-3 text-espresso-muted">
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-6">
          <SortSelect value={sort} onChange={setSort} className="mb-8 flex" />
          <FilterGroups facets={facets} />
        </div>

        <div className="flex gap-3 border-t hairline px-6 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
          {active.length ? (
            <button type="button" onClick={clearAll} className="eyebrow press border hairline-strong px-5 py-4 text-espresso">
              Clear
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="eyebrow press flex-1 bg-espresso px-5 py-4 text-ivory-light"
          >
            Show {pieces}
          </button>
        </div>
      </div>
    </div>
  );
}

function SortSelect({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <label className={cn("items-center gap-3", className)}>
      <span className="eyebrow text-espresso-muted">Sort</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="eyebrow cursor-pointer rounded-none border-0 border-b hairline bg-transparent py-1 pr-1 text-espresso focus:border-gold"
      >
        {SORTS.map((sort) => (
          <option key={sort.value} value={sort.value}>
            {sort.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function FilterGroups({ facets }: { facets: ShopFacets }) {
  return (
    <div className="space-y-10">
      {FILTER_KEYS.map((key) =>
        facets[key].length ? (
          <FilterGroup key={key} filterKey={key} label={GROUP_LABELS[key]} options={facets[key]} />
        ) : null,
      )}
    </div>
  );
}

// Long lists (product types) show the first eight until opened.
function FilterGroup({
  filterKey,
  label,
  options,
}: {
  filterKey: FilterKey;
  label: string;
  options: FilterOption[];
}) {
  const { selected, toggle } = useFilterUrl();
  const [showAll, setShowAll] = useState(false);
  const chosen = selected(filterKey);
  const visible = showAll ? options : options.slice(0, 8);

  return (
    <fieldset>
      <legend className="flex w-full items-center gap-3 font-display text-xl text-espresso">
        {label}
        {chosen.length ? <span className="numeral text-sm text-gold-ink">{chosen.length}</span> : null}
      </legend>
      <div aria-hidden className="rule-gold mt-3" />
      <ul className="mt-4 space-y-1">
        {visible.map((option) => {
          const isOn = chosen.includes(option.value);
          return (
            <li key={option.value}>
              <button
                type="button"
                onClick={() => toggle(filterKey, option.value)}
                aria-pressed={isOn}
                className="group press flex w-full items-center gap-3 py-2 text-left lg:py-1.5"
              >
                {option.swatch ? (
                  <span
                    aria-hidden
                    className={cn(
                      "size-4 shrink-0 border border-espresso/25 outline outline-1 outline-offset-2 transition-[outline-color] duration-300",
                      isOn ? "outline-gold" : "outline-transparent",
                    )}
                    style={{ backgroundColor: option.swatch }}
                  />
                ) : (
                  <span
                    aria-hidden
                    className={cn(
                      "relative flex size-4 shrink-0 items-center justify-center border transition-colors duration-300",
                      isOn ? "border-gold" : "border-espresso/30 group-hover:border-gold",
                    )}
                  >
                    <span
                      className={cn(
                        "size-2 bg-espresso transition-[opacity,transform] duration-300 ease-out",
                        isOn ? "scale-100 opacity-100" : "scale-50 opacity-0",
                      )}
                    />
                  </span>
                )}
                <span className={cn("flex-1 text-espresso-soft transition-colors duration-500 group-hover:text-gold-ink", isOn && "text-espresso")}>
                  {option.label}
                </span>
                <span className="text-sm tabular-nums text-espresso-muted">{option.count}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {options.length > 8 ? (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="eyebrow link-underline mt-4 py-1 text-gold-ink"
        >
          {showAll ? "Show fewer" : `Show all ${options.length}`}
        </button>
      ) : null}
    </fieldset>
  );
}
