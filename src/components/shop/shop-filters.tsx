"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

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
      <FilterGroups facets={facets} />
    </aside>
  );
}

// Above the grid: piece count, active filters, sort, and on phones the button
// that opens the filter drawer.
export function ShopToolbar({ facets, total }: { facets: ShopFacets; total: number }) {
  const { selected, toggle, setSort, clearAll, sort } = useFilterUrl();
  const [drawerOpen, setDrawerOpen] = useState(false);

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
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen]);

  const pieces = `${total} ${total === 1 ? "piece" : "pieces"}`;

  return (
    <div>
      <div className="flex items-center justify-between gap-4 border-y hairline py-4">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="eyebrow text-espresso transition-colors duration-500 hover:text-gold lg:hidden"
        >
          Filter & sort{active.length ? <span className="ml-2 text-gold">({active.length})</span> : null}
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
                className="eyebrow flex items-center gap-2 border hairline px-3 py-2 text-espresso transition-colors duration-500 hover:border-gold hover:text-gold"
              >
                {filter.label}
                <span aria-hidden className="text-gold">×</span>
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={clearAll}
              className="eyebrow px-2 py-2 text-espresso-muted transition-colors duration-500 hover:text-gold"
            >
              Clear all
            </button>
          </li>
        </ul>
      ) : null}

      {/* Phone drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filter and sort"
        className={cn(
          "fixed inset-0 z-50 flex flex-col bg-ivory transition-[opacity,visibility] duration-500 lg:hidden",
          drawerOpen ? "visible opacity-100" : "invisible opacity-0",
        )}
      >
        <div className="flex items-center justify-between border-b hairline px-6 py-5">
          <p className="eyebrow text-espresso">Filter & sort</p>
          <button type="button" onClick={() => setDrawerOpen(false)} className="eyebrow text-espresso-muted">
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <SortSelect value={sort} onChange={setSort} className="mb-8 flex" />
          <FilterGroups facets={facets} />
        </div>

        <div className="flex gap-3 border-t hairline px-6 py-4">
          {active.length ? (
            <button type="button" onClick={clearAll} className="eyebrow border hairline px-5 py-4 text-espresso">
              Clear
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="eyebrow flex-1 bg-espresso px-5 py-4 text-ivory"
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
        className="eyebrow cursor-pointer border-0 bg-transparent text-espresso focus:outline-none"
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
    <div className="space-y-9">
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
      <legend className="eyebrow text-espresso-muted">{label}</legend>
      <ul className="mt-4 space-y-1">
        {visible.map((option) => {
          const isOn = chosen.includes(option.value);
          return (
            <li key={option.value}>
              <button
                type="button"
                onClick={() => toggle(filterKey, option.value)}
                aria-pressed={isOn}
                className="group flex w-full items-center gap-3 py-1.5 text-left"
              >
                {option.swatch ? (
                  <span
                    aria-hidden
                    className={cn(
                      "size-4 shrink-0 rounded-full border border-espresso/20 ring-offset-2 ring-offset-ivory",
                      isOn && "ring-1 ring-gold",
                    )}
                    style={{ backgroundColor: option.swatch }}
                  />
                ) : (
                  <span
                    aria-hidden
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center border text-[0.6rem] leading-none",
                      isOn ? "border-espresso bg-espresso text-ivory" : "border-espresso/30",
                    )}
                  >
                    {isOn ? "✓" : ""}
                  </span>
                )}
                <span className={cn("flex-1 text-espresso-soft transition-colors duration-500 group-hover:text-gold", isOn && "text-espresso")}>
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
          className="eyebrow mt-3 text-gold"
        >
          {showAll ? "Show fewer" : `Show all ${options.length}`}
        </button>
      ) : null}
    </fieldset>
  );
}
