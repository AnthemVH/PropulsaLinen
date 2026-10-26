"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import type { SearchLink, SearchSuggestion } from "@/app/api/search/route";
import { Media } from "@/components/ui/media";
import { Container } from "@/components/ui/primitives";

type Results = {
  query: string;
  products: SearchSuggestion[];
  links: SearchLink[];
};

// The search box that opens under the header, with suggestions as you type.
export function SearchPanel({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  // Results remember which query they answer, so a slow reply for "gla" can
  // never replace the results for "glass".
  const [results, setResults] = useState<Results>({ query: "", products: [], links: [] });

  const trimmed = query.trim();
  const ready = trimmed.length >= 2;
  const current = ready && results.query === trimmed ? results : null;
  const loading = ready && !current;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!ready) return;

    const controller = new AbortController();
    // Wait for a pause in typing before asking.
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal })
        .then((response) => response.json())
        .then((data) => setResults({ query: trimmed, products: data.products, links: data.links }))
        .catch(() => {
          // Aborted or offline — the full search page still works on Enter.
        });
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed, ready]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!trimmed) return;
    onClose();
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const nothingFound = current && !current.products.length && !current.links.length;

  return (
    <div className="sheet-in border-b hairline bg-ivory-light shadow-[0_24px_60px_-30px_rgba(42,33,26,0.25)]">
      <Container width="wide">
        <p className="eyebrow pt-6 text-espresso-muted md:pt-8">Search the house</p>
        <form onSubmit={submit} role="search" className="flex items-end gap-4 pt-2 pb-6">
          <label htmlFor="site-search" className="sr-only">
            Search the shop
          </label>
          <input
            ref={inputRef}
            id="site-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search for a glass, a throw, a room…"
            autoComplete="off"
            maxLength={80}
            enterKeyHint="search"
            className="min-w-0 flex-1 rounded-none border-0 border-b hairline-strong bg-transparent py-2 font-display text-[1.75rem] font-light text-espresso placeholder:text-espresso-muted/70 focus:border-gold focus:outline-none md:text-5xl"
          />
          <button type="button" onClick={onClose} className="eyebrow press shrink-0 py-3 text-espresso-muted hover:text-gold-ink">
            Close
          </button>
        </form>

        {ready ? (
          <div className="max-h-[60dvh] overflow-y-auto overscroll-contain pb-8">
            {loading ? <p className="eyebrow text-espresso-muted">Searching…</p> : null}
            {nothingFound ? (
              <p className="text-espresso-muted">Nothing matches “{trimmed}”. Try a room or a kind of piece.</p>
            ) : null}

            {current?.links.length ? (
              <ul className="mb-6 flex flex-wrap gap-2">
                {current.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className="eyebrow press inline-flex items-center gap-2 border hairline px-4 py-2.5 text-espresso hover:border-gold hover:text-gold-ink"
                    >
                      {link.label}
                      <span className="text-espresso-muted">· {link.detail}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}

            {current?.products.length ? (
              <ul className="grid gap-x-10 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
                {current.products.map((product) => (
                  <li key={product.key}>
                    <Link href={`/products/${product.handle}`} onClick={onClose} className="group flex items-center gap-4">
                      <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-stone/40">
                        <Media image={product.image} sizes="64px" />
                      </div>
                      <div className="min-w-0">
                        <p className="eyebrow text-espresso-muted">{product.type}</p>
                        <p className="truncate font-display text-lg text-espresso group-hover:text-gold-ink">{product.title}</p>
                        <p className="flex items-center gap-2 text-sm text-espresso-muted">
                          {product.price}
                          {product.swatches.map((swatch) => (
                            <span
                              key={swatch.name}
                              title={swatch.name}
                              className="size-2.5 border border-espresso/25"
                              style={{ backgroundColor: swatch.hex }}
                            />
                          ))}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}

            {current && !nothingFound ? (
              <Link
                href={`/search?q=${encodeURIComponent(trimmed)}`}
                onClick={onClose}
                className="eyebrow mt-6 inline-block text-gold-ink link-underline"
              >
                See all results for “{trimmed}”
              </Link>
            ) : null}
          </div>
        ) : null}
      </Container>
    </div>
  );
}
