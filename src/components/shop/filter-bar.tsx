"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import type { Facets } from "@/lib/catalog";
import type { SortKey } from "@/lib/shopify/types";
import { cn, swatchColour } from "@/lib/utils";
import { Eyebrow } from "@/components/ui/primitives";

/**
 * Filters live in the URL, so a filtered view is shareable, back-navigable and
 * server-rendered. Multi-value facets are comma-joined.
 */

const SORTS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "House order" },
  { value: "newest", label: "Most recent" },
  { value: "price-asc", label: "Price, ascending" },
  { value: "price-desc", label: "Price, descending" },
];

export function FilterBar({
  facets,
  total,
  showProductType = true,
  showDesign = true,
}: {
  facets: Facets;
  total: number;
  showProductType?: boolean;
  showDesign?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [expanded, setExpanded] = useState(false);

  const selected = (key: string) =>
    searchParams.get(key)?.split(",").filter(Boolean) ?? [];

  const activeCount = ["type", "design", "size", "colour"].reduce(
    (count, key) => count + selected(key).length,
    0,
  );

  const commit = (params: URLSearchParams) => {
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

    commit(params);
  };

  const setSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "featured") params.delete("sort");
    else params.set("sort", value);
    commit(params);
  };

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    ["type", "design", "size", "colour"].forEach((key) => params.delete(key));
    commit(params);
  };

  const groups = [
    showProductType && facets.productTypes.length > 1
      ? {
          key: "type",
          label: "Product",
          values: facets.productTypes.map((type) => ({
            value: type.slug,
            label: type.label,
          })),
        }
      : null,
    showDesign && facets.designs.length > 1
      ? {
          key: "design",
          label: "Collection",
          values: facets.designs.map((design) => ({
            value: design.handle,
            label: design.label,
          })),
        }
      : null,
    facets.sizes.length
      ? {
          key: "size",
          label: "Size",
          values: facets.sizes.map((size) => ({ value: size, label: size })),
        }
      : null,
  ].filter(Boolean) as {
    key: string;
    label: string;
    values: { value: string; label: string }[];
  }[];

  return (
    <div className="border-y hairline">
      <div className="flex flex-wrap items-center justify-between gap-6 py-5">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => setExpanded((open) => !open)}
            aria-expanded={expanded}
            className="eyebrow text-espresso transition-colors duration-500 hover:text-gold"
          >
            {expanded ? "Hide filters" : "Filter"}
            {activeCount > 0 ? (
              <span className="ml-2 text-gold">({activeCount})</span>
            ) : null}
          </button>

          {activeCount > 0 ? (
            <button
              type="button"
              onClick={clearAll}
              className="eyebrow text-espresso-muted transition-colors duration-500 hover:text-gold"
            >
              Clear
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-6">
          <Eyebrow className="hidden sm:block">
            {total} {total === 1 ? "piece" : "pieces"}
          </Eyebrow>

          <label className="flex items-center gap-3">
            <span className="eyebrow text-espresso-muted">Order</span>
            <select
              value={searchParams.get("sort") ?? "featured"}
              onChange={(event) => setSort(event.target.value)}
              className="eyebrow cursor-pointer border-0 bg-transparent text-espresso focus:outline-none"
            >
              {SORTS.map((sort) => (
                <option key={sort.value} value={sort.value}>
                  {sort.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden transition-[max-height,opacity] duration-700",
          expanded ? "max-h-[40rem] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="grid gap-10 border-t hairline py-9 sm:grid-cols-2 lg:grid-cols-4">
          {groups.map((group) => (
            <fieldset key={group.key}>
              <legend className="eyebrow text-espresso-muted">
                {group.label}
              </legend>
              <div className="mt-4 flex flex-wrap gap-2">
                {group.values.map((item) => (
                  <FilterChip
                    key={item.value}
                    active={selected(group.key).includes(item.value)}
                    onClick={() => toggle(group.key, item.value)}
                  >
                    {item.label}
                  </FilterChip>
                ))}
              </div>
            </fieldset>
          ))}

          {facets.colours.length ? (
            <fieldset>
              <legend className="eyebrow text-espresso-muted">Colour</legend>
              <div className="mt-4 flex flex-wrap gap-3">
                {facets.colours.map((colour) => {
                  const active = selected("colour").includes(colour);
                  return (
                    <button
                      key={colour}
                      type="button"
                      aria-pressed={active}
                      title={colour}
                      onClick={() => toggle("colour", colour)}
                      className={cn(
                        "size-8 rounded-full border transition-all duration-500",
                        active
                          ? "border-gold ring-1 ring-gold ring-offset-4 ring-offset-ivory"
                          : "border-espresso/15 hover:border-stone-dark",
                      )}
                      style={{ backgroundColor: swatchColour(colour) }}
                    >
                      <span className="sr-only">{colour}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "eyebrow border px-4 py-2.5 transition-colors duration-500",
        active
          ? "border-gold bg-gold/10 text-espresso"
          : "hairline text-espresso-soft hover:border-gold",
      )}
    >
      {children}
    </button>
  );
}
