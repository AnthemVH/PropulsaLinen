"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";

import { Logo } from "@/components/brand/logo";
import { MotifArt } from "@/components/brand/motif-art";
import { GROUND_CLASS, PLATE_SEQUENCE as PLATES } from "@/components/brand/plates";
import { CartTrigger } from "@/components/cart/cart-trigger";
import type { RoomNav } from "@/lib/catalog";
import { DESIGN_NAV } from "@/lib/content/site";
import { cn, toRoman } from "@/lib/utils";

import { SearchPanel } from "./search-panel";

const collection = DESIGN_NAV[0];



export function Header({ rooms }: { rooms: RoomNav[] }) {
  const pathname = usePathname();

  // Pages that open on a full-bleed dark plate the header floats over.
  const overHero = pathname === "/" || /^\/designs\/[^/]+$/.test(pathname);

  const [scrolled, setScrolled] = useState(false);
  const [tucked, setTucked] = useState(false);

  // Panels remember the page they were opened on, so moving to another page
  // closes them without needing an effect.
  const [index, setIndex] = useState({ path: pathname, open: false });
  const [search, setSearch] = useState({ path: pathname, open: false });
  const indexOpen = index.open && index.path === pathname;
  const searchOpen = search.open && search.path === pathname;

  const setIndexOpen = (open: boolean) => {
    setIndex({ path: pathname, open });
    if (open) setSearch({ path: pathname, open: false });
  };
  const setSearchOpen = (open: boolean) => {
    setSearch({ path: pathname, open });
    if (open) setIndex({ path: pathname, open: false });
  };

  // Solid once the page moves; tucked away while reading down, back the moment
  // the reader scrolls up.
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      if (Math.abs(y - last) > 6) {
        setTucked(y > last && y > 320);
        last = y;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const indexButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIndex((current) => {
        if (current.open) indexButton.current?.focus();
        return { ...current, open: false };
      });
      setSearch((current) => ({ ...current, open: false }));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const panelOpen = indexOpen || searchOpen;
  const floating = overHero && !scrolled && !panelOpen;
  const hidden = tucked && !panelOpen;

  return (
    <header
      // `data-floating` turns the text light over a dark plate; the rule is in
      // globals.css so it wins over Tailwind utilities.
      data-floating={floating}
      style={{ viewTransitionName: "site-header" } as CSSProperties}
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-[transform,background-color] duration-500 ease-out",
        hidden ? "-translate-y-full" : "translate-y-0",
        floating
          ? "bg-transparent"
          : panelOpen
            ? "bg-ivory-light backdrop-blur-md"
            : "bg-ivory/92 backdrop-blur-md backdrop-saturate-150",
      )}
    >
      <div
        className={cn(
          "border-b transition-colors duration-500",
          floating ? "border-ivory-light/15" : "hairline",
        )}
      >
        <div className="mx-auto grid h-[var(--header-h)] max-w-[1760px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-[var(--gutter)]">
          <div className="flex items-center gap-8">
            <button
              ref={indexButton}
              type="button"
              onClick={() => setIndexOpen(!indexOpen)}
              aria-expanded={indexOpen}
              aria-controls="house-index"
              className="eyebrow press group -m-3 flex items-center gap-3 p-3 text-espresso hover:text-gold-ink"
            >
              <MenuGlyph open={indexOpen} />
              <span className="max-sm:sr-only">{indexOpen ? "Close" : "Index"}</span>
            </button>
            <nav aria-label="Primary" className="hidden items-center gap-8 xl:flex">
              <HeaderLink href="/shop" current={pathname === "/shop"}>
                Shop
              </HeaderLink>
              <HeaderLink href={collection.href} current={pathname === collection.href}>
                {collection.label}
              </HeaderLink>
              <HeaderLink href="/about" current={pathname === "/about"}>
                The House
              </HeaderLink>
            </nav>
          </div>

          <Logo monogramSize={30} compact />

          <div className="flex items-center justify-end gap-5 md:gap-8">
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label={searchOpen ? "Close search" : "Search"}
              aria-expanded={searchOpen}
              className="press -m-3 p-3 text-espresso hover:text-gold-ink"
            >
              <SearchIcon />
            </button>
            <CartTrigger className="eyebrow press -m-3 p-3 text-espresso hover:text-gold-ink" />
          </div>
        </div>
      </div>

      {searchOpen ? <SearchPanel onClose={() => setSearchOpen(false)} /> : null}

      <HouseIndex
        open={indexOpen}
        rooms={rooms}
        pathname={pathname}
        onClose={() => setIndexOpen(false)}
      />
    </header>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * The house index: every room as a numbered entry in large type, the hovered
 * room's pieces beside it, and a plate that turns as you move down the list.
 * On phones the rooms open as an accordion and the plate is left out.
 */
function HouseIndex({
  open,
  rooms,
  pathname,
  onClose,
}: {
  open: boolean;
  rooms: RoomNav[];
  pathname: string;
  onClose: () => void;
}) {
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const activeRoom = rooms[active] ?? null;

  // Lock the page behind the open index and move focus into it.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // The first link in the index: a room, or the house links when no rooms
    // are published yet.
    panelRef.current?.querySelector<HTMLAnchorElement>("a[href]")?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <div
      ref={panelRef}
      id="house-index"
      inert={!open}
      aria-hidden={!open}
      // Absolute, not fixed: the header's backdrop blur makes it the
      // containing block, so "fixed" would be sized to the header.
      className={cn(
        "absolute inset-x-0 top-full h-[calc(100dvh-var(--header-h))] overflow-y-auto overscroll-contain bg-ivory-light",
        "ease-drawer",
        // Visible at once when opening (so focus can move in on the same
        // frame); hidden only after the wipe when closing.
        open
          ? "visible transition-[clip-path] duration-500 [clip-path:inset(0_0_0_0)]"
          : "invisible transition-[clip-path,visibility] duration-300 [clip-path:inset(0_0_100%_0)]",
      )}
    >
      <div className="mx-auto grid min-h-full max-w-[1760px] gap-10 px-[var(--gutter)] py-8 md:py-12 lg:grid-cols-12 lg:gap-12 lg:py-16">
        {/* Rooms */}
        <div className="lg:col-span-5">
          <p className="eyebrow text-espresso-muted">The rooms of the house</p>
          <ol className="mt-6 border-t hairline lg:mt-8">
            {rooms.map((nav, index) => {
              const isExpanded = expanded === nav.room.slug;
              const isActive = active === index;
              return (
                <li
                  key={nav.room.slug}
                  className={cn(
                    "border-b hairline transition-[opacity,transform] duration-700 ease-out",
                    open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
                  )}
                  style={{ transitionDelay: open ? `${120 + index * 45}ms` : "0ms" }}
                >
                  <div className="flex items-center">
                    <Link
                      href={`/rooms/${nav.room.slug}`}
                      onClick={onClose}
                      onMouseEnter={() => setActive(index)}
                      onFocus={() => setActive(index)}
                      aria-current={pathname === `/rooms/${nav.room.slug}` ? "page" : undefined}
                      className="group flex flex-1 items-baseline gap-4 py-3.5 md:gap-6 md:py-4"
                    >
                      <span
                        className={cn(
                          "numeral w-8 shrink-0 text-base transition-colors duration-300 md:text-lg",
                          isActive ? "text-gold-ink" : "text-espresso-muted",
                        )}
                      >
                        {toRoman(index + 1)}
                      </span>
                      <span
                        className={cn(
                          "font-display text-[1.75rem] leading-tight transition-[color,transform] duration-500 ease-out md:text-4xl",
                          isActive ? "text-espresso lg:translate-x-2" : "text-espresso-soft",
                          "group-hover:text-gold-ink",
                        )}
                      >
                        {nav.room.name}
                      </span>
                    </Link>
                    {/* Phones: open the room's pieces in place. */}
                    <button
                      type="button"
                      onClick={() => setExpanded(isExpanded ? null : nav.room.slug)}
                      aria-expanded={isExpanded}
                      aria-label={`${isExpanded ? "Hide" : "Show"} pieces in ${nav.room.name}`}
                      className="press -mr-3 flex size-12 items-center justify-center text-gold-ink lg:hidden"
                    >
                      <span aria-hidden className="relative block size-3">
                        <span className="absolute inset-x-0 top-1/2 h-px bg-current" />
                        <span
                          className={cn(
                            "absolute inset-y-0 left-1/2 w-px bg-current transition-transform duration-300 ease-out",
                            isExpanded && "scale-y-0",
                          )}
                        />
                      </span>
                    </button>
                  </div>
                  {isExpanded ? (
                    <ul className="grid grid-cols-2 gap-x-6 gap-y-3 pb-6 pl-12 lg:hidden">
                      {nav.types.map((type) => (
                        <li key={type.slug}>
                          <Link
                            href={`/rooms/${nav.room.slug}?type=${type.slug}`}
                            onClick={onClose}
                            className="text-espresso-soft hover:text-gold-ink"
                          >
                            {type.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ol>
          {rooms.length === 0 ? (
            <p className="mt-6 max-w-sm text-espresso-muted">
              The rooms open as pieces are published to the store.
            </p>
          ) : null}
        </div>

        {/* Desktop: the active room's pieces */}
        <div
          className={cn(
            "hidden transition-opacity duration-700 lg:col-span-3 lg:block",
            open ? "opacity-100 delay-300" : "opacity-0",
          )}
        >
          {activeRoom ? (
            <div key={activeRoom.room.slug} className="intro-fade lg:pt-[3.25rem]">
              <p className="eyebrow text-gold-ink">{activeRoom.room.name}</p>
              <p className="mt-4 max-w-xs text-espresso-soft">{activeRoom.room.description}</p>
              <ul className="mt-8 space-y-2.5">
                {activeRoom.types.map((type) => (
                  <li key={type.slug}>
                    <Link
                      href={`/rooms/${activeRoom.room.slug}?type=${type.slug}`}
                      onClick={onClose}
                      className="link-underline text-espresso-soft hover:text-gold-ink"
                    >
                      {type.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={`/rooms/${activeRoom.room.slug}`}
                onClick={onClose}
                className="eyebrow link-ruled mt-8 inline-block text-espresso"
              >
                All of {activeRoom.room.name}
              </Link>
            </div>
          ) : null}
        </div>

        {/* Desktop: the turning plate */}
        <div className="hidden lg:col-span-4 lg:block">
          <div className="plate-marks lg:mt-[3.25rem]">
            <div className="relative aspect-[4/5] overflow-hidden bg-espresso">
              {PLATES.map((plate, index) => (
                <div
                  key={index}
                  aria-hidden
                  className={cn(
                    "absolute inset-0 transition-[opacity,transform] duration-[900ms] ease-out",
                    GROUND_CLASS[plate.colorway],
                    index === active % PLATES.length ? "scale-100 opacity-100" : "scale-[1.04] opacity-0",
                  )}
                >
                  {open ? (
                    <MotifArt form={plate.form} colorway={plate.colorway} alt="" className="object-contain" />
                  ) : null}
                </div>
              ))}
            </div>
          </div>
          <p className="running-head mt-5 flex justify-between text-espresso-muted">
            <span>{collection.label}</span>
            <span className="numeral text-sm normal-case tracking-normal">
              Pl. {toRoman((active % PLATES.length) + 1)}
            </span>
          </p>
        </div>

        {/* The house, below the rooms */}
        <div
          className={cn(
            "grid gap-8 border-t hairline pt-8 transition-opacity duration-700 sm:grid-cols-3 lg:col-span-12 lg:mt-4",
            open ? "opacity-100 delay-500" : "opacity-0",
          )}
        >
          <IndexGroup
            title="Shop"
            links={[
              { href: "/shop", label: "All pieces" },
              { href: "/shop?sort=newest", label: "Lately from the workshop" },
              { href: "/search", label: "Search" },
            ]}
            onClose={onClose}
          />
          <IndexGroup
            title="The collection"
            links={[
              { href: collection.href, label: collection.label },
              { href: "/designs", label: "The house collections" },
            ]}
            onClose={onClose}
          />
          <IndexGroup
            title="The house"
            links={[
              { href: "/about", label: "Our story" },
              { href: "/shipping-returns", label: "Shipping & returns" },
              { href: "/faq", label: "Frequently asked" },
              { href: "/contact", label: "Contact" },
            ]}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
}

function IndexGroup({
  title,
  links,
  onClose,
}: {
  title: string;
  links: { href: string; label: string }[];
  onClose: () => void;
}) {
  return (
    <div>
      <p className="eyebrow text-espresso-muted">{title}</p>
      <ul className="mt-4 space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              onClick={onClose}
              className="font-display text-xl text-espresso hover:text-gold-ink"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function HeaderLink({
  href,
  children,
  current,
}: {
  href: string;
  children: React.ReactNode;
  current?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={cn(
        "eyebrow link-underline py-2 text-espresso hover:text-gold-ink",
        current && "[background-size:100%_1px]",
      )}
    >
      {children}
    </Link>
  );
}

/** Two hairlines that become a cross. */
function MenuGlyph({ open }: { open: boolean }) {
  return (
    <span aria-hidden className="relative block h-3 w-6">
      <span
        className={cn(
          "absolute left-0 h-px w-6 bg-current transition-transform duration-300 ease-out",
          open ? "top-1/2 rotate-[20deg]" : "top-0.5",
        )}
      />
      <span
        className={cn(
          "absolute left-0 h-px bg-current transition-[transform,width] duration-300 ease-out",
          open ? "top-1/2 w-6 -rotate-[20deg]" : "bottom-0.5 w-4",
        )}
      />
    </span>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M15.5 15.5L20.5 20.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
