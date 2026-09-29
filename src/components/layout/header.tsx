"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Logo } from "@/components/brand/logo";
import { CartTrigger } from "@/components/cart/cart-trigger";
import { Media } from "@/components/ui/media";
import { Container } from "@/components/ui/primitives";
import type { RoomNav } from "@/lib/catalog";
import { DESIGN_NAV } from "@/lib/content/site";
import { cn } from "@/lib/utils";

import { SearchPanel } from "./search-panel";

const collection = DESIGN_NAV[0];

export function Header({ rooms }: { rooms: RoomNav[] }) {
  const pathname = usePathname();

  // Pages with a full-bleed dark hero the header floats over.
  const overHero = pathname === "/" || /^\/designs\/[^/]+$/.test(pathname);

  const [scrolled, setScrolled] = useState(false);

  // Menus remember the page they were opened on, so moving to another page
  // closes them without needing an effect.
  const [panel, setPanel] = useState({ path: pathname, room: null as string | null });
  const [drawer, setDrawer] = useState({ path: pathname, open: false });
  const [search, setSearch] = useState({ path: pathname, open: false });
  const [expanded, setExpanded] = useState<string | null>(null);

  const openRoom = panel.path === pathname ? panel.room : null;
  const drawerOpen = drawer.open && drawer.path === pathname;
  const searchOpen = search.open && search.path === pathname;

  const showRoom = (room: string | null) => setPanel({ path: pathname, room });
  const setDrawerOpen = (open: boolean) => setDrawer({ path: pathname, open });
  const setSearchOpen = (open: boolean) => {
    setSearch({ path: pathname, open });
    if (open) setDrawerOpen(false);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPanel((current) => ({ ...current, room: null }));
        setDrawer((current) => ({ ...current, open: false }));
        setSearch((current) => ({ ...current, open: false }));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Stop the page scrolling behind the open mobile drawer, and move keyboard
  // focus into it.
  const drawerFirstLink = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawerFirstLink.current?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  const floating = overHero && !scrolled && !openRoom && !drawerOpen && !searchOpen;
  const featured = rooms.find((nav) => nav.room.slug === openRoom) ?? null;

  return (
    <header
      // `data-floating` turns the text light over a dark hero; the rule is in
      // globals.css so it wins over Tailwind utilities.
      data-floating={floating}
      onMouseLeave={() => showRoom(null)}
      // Close the menu when keyboard focus moves out of the header.
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) showRoom(null);
      }}
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-colors duration-700",
        floating ? "bg-transparent" : "bg-ivory/95 backdrop-blur-sm",
      )}
    >
      <div
        className={cn(
          "border-b transition-colors duration-700",
          scrolled || openRoom || drawerOpen || searchOpen ? "hairline" : "border-transparent",
        )}
      >
        <Container width="wide">
          {/* Top row: links, logo, search and cart */}
          <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-4 md:h-20">
            <div className="flex items-center gap-8">
              <button
                type="button"
                onClick={() => setDrawerOpen(!drawerOpen)}
                aria-expanded={drawerOpen}
                aria-controls="mobile-nav"
                className="eyebrow text-espresso lg:hidden"
              >
                {drawerOpen ? "Close" : "Menu"}
              </button>
              <HeaderLink href={collection.href} className="hidden lg:inline-flex">
                {collection.label}
              </HeaderLink>
              <HeaderLink href="/about" className="hidden lg:inline-flex">
                The House
              </HeaderLink>
            </div>

            <Logo monogramSize={30} />

            <div className="flex items-center justify-end gap-6 md:gap-8">
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label={searchOpen ? "Close search" : "Search"}
                aria-expanded={searchOpen}
                className="text-espresso transition-colors duration-500 hover:text-gold-ink"
              >
                <SearchIcon />
              </button>
              <CartTrigger className="eyebrow text-espresso transition-colors duration-500 hover:text-gold-ink" />
            </div>
          </div>

          {/* Second row, desktop only: the rooms */}
          <nav aria-label="Shop by room" className="hidden h-12 items-center justify-center gap-9 lg:flex">
            <HeaderLink href="/shop" onMouseEnter={() => showRoom(null)}>
              Shop all
            </HeaderLink>
            {rooms.map((nav) => (
              <Link
                key={nav.room.slug}
                href={`/rooms/${nav.room.slug}`}
                onMouseEnter={() => showRoom(nav.room.slug)}
                onFocus={() => showRoom(nav.room.slug)}
                aria-expanded={openRoom === nav.room.slug}
                className={cn(
                  "eyebrow transition-colors duration-500",
                  openRoom === nav.room.slug ? "text-gold-ink" : "text-espresso hover:text-gold-ink",
                )}
              >
                {nav.room.name}
              </Link>
            ))}
          </nav>
        </Container>
      </div>

      {searchOpen ? <SearchPanel onClose={() => setSearchOpen(false)} /> : null}

      {/* Desktop mega menu: every room as a column, with the hovered room's picture */}
      <div
        // While closed, its links are out of the tab order and hidden from
        // screen readers, not just invisible.
        inert={!openRoom}
        className={cn(
          "hidden overflow-hidden bg-ivory transition-[max-height,opacity] duration-500 lg:block",
          openRoom
            ? "max-h-[calc(100vh-8rem)] overflow-y-auto border-b opacity-100 hairline"
            : "max-h-0 opacity-0",
        )}
      >
        <Container width="wide">
          <div className="flex gap-10 py-10">
            <div className="grid flex-1 grid-cols-4 gap-x-8 gap-y-10 xl:grid-cols-8">
              {rooms.map((nav) => (
                // Rooms with a long list of types take two columns.
                <div key={nav.room.slug} className={cn(nav.types.length > 10 && "col-span-2")}>
                  <Link
                    href={`/rooms/${nav.room.slug}`}
                    onMouseEnter={() => showRoom(nav.room.slug)}
                    className={cn(
                      "font-display text-lg transition-colors duration-500",
                      openRoom === nav.room.slug ? "text-gold-ink" : "text-espresso hover:text-gold-ink",
                    )}
                  >
                    {nav.room.name}
                  </Link>
                  <ul className={cn("mt-4", nav.types.length > 10 && "columns-2 gap-8")}>
                    {nav.types.map((type) => (
                      <li key={type.slug} className="mb-2 break-inside-avoid">
                        <Link
                          href={`/rooms/${nav.room.slug}?type=${type.slug}`}
                          onMouseEnter={() => showRoom(nav.room.slug)}
                          className="text-sm text-espresso-soft transition-colors duration-500 hover:text-gold-ink"
                        >
                          {type.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {featured ? (
              <Link href={`/rooms/${featured.room.slug}`} className="group hidden w-64 shrink-0 xl:block">
                <div className="relative aspect-[4/5] overflow-hidden bg-stone/30">
                  <Media image={featured.image} sizes="256px" />
                </div>
                <p className="mt-3 font-display text-lg text-espresso group-hover:text-gold-ink">
                  {featured.room.name}
                </p>
                <p className="mt-1 text-sm text-espresso-muted">{featured.room.description}</p>
              </Link>
            ) : null}
          </div>
        </Container>
      </div>

      {/* Mobile drawer: rooms as an accordion */}
      <div
        id="mobile-nav"
        className={cn(
          // Absolute, not fixed: the header's backdrop blur makes it the
          // containing block, so "fixed" would be sized to the header.
          "absolute inset-x-0 top-full h-[calc(100dvh-4rem)] overflow-y-auto bg-ivory duration-500 md:h-[calc(100dvh-5rem)] lg:hidden",
          // Visible at once when opening, so focus can move in straight away;
          // hidden only after the fade when closing.
          drawerOpen ? "visible opacity-100 transition-opacity" : "invisible opacity-0 transition-[opacity,visibility]",
        )}
      >
        <Container>
          <div className="py-8">
            <Link ref={drawerFirstLink} href="/shop" className="block py-3 font-display text-2xl text-espresso">
              Shop all
            </Link>

            <ul className="border-y hairline">
              {rooms.map((nav) => {
                const isOpen = expanded === nav.room.slug;
                return (
                  <li key={nav.room.slug} className="border-b hairline last:border-b-0">
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : nav.room.slug)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between py-4 text-left font-display text-xl text-espresso"
                    >
                      {nav.room.name}
                      <span aria-hidden className="text-gold-ink">{isOpen ? "–" : "+"}</span>
                    </button>
                    {isOpen ? (
                      <ul className="space-y-3 pb-5 pl-1">
                        <li>
                          <Link href={`/rooms/${nav.room.slug}`} className="eyebrow text-gold-ink">
                            All {nav.room.name}
                          </Link>
                        </li>
                        {nav.types.map((type) => (
                          <li key={type.slug}>
                            <Link
                              href={`/rooms/${nav.room.slug}?type=${type.slug}`}
                              className="text-espresso-soft"
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
            </ul>

            <ul className="mt-8 space-y-4">
              <li>
                <Link href={collection.href} className="eyebrow text-espresso">
                  {collection.label}
                </Link>
              </li>
              <li>
                <Link href="/about" className="eyebrow text-espresso">
                  The House
                </Link>
              </li>
              <li>
                <Link href="/contact" className="eyebrow text-espresso-muted">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </Container>
      </div>
    </header>
  );
}

function HeaderLink({
  href,
  children,
  className,
  onMouseEnter,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  onMouseEnter?: () => void;
}) {
  return (
    <Link
      href={href}
      onMouseEnter={onMouseEnter}
      className={cn(
        "eyebrow text-espresso transition-colors duration-500 hover:text-gold-ink",
        className,
      )}
    >
      {children}
    </Link>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M15.5 15.5L20.5 20.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
