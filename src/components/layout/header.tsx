"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { CartTrigger } from "@/components/cart/cart-trigger";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/ui/primitives";
import type { Category } from "@/lib/catalog";
import { DESIGN_NAV, PRIMARY_NAV, type NavItem } from "@/lib/content/site";
import { cn } from "@/lib/utils";

/**
 * Header. Transparent over the homepage hero, solid everywhere else, and
 * solid once scrolled — the transition is deliberately slow.
 */
export function Header({ categories }: { categories: Category[] }) {
  // With one house collection the nav names it rather than offering an index
  // of one. PRIMARY_NAV holds the same resolution for the mobile drawer.
  const collectionNav = PRIMARY_NAV.find((item) =>
    item.href.startsWith("/designs"),
  ) ?? { label: "Collections", href: "/designs" };

  const productTypeNav: NavItem[] = categories.map((category) => ({
    label: category.label,
    href: `/shop/${category.slug}`,
    disabled: category.planned,
    description: category.blurb ?? undefined,
  }));

  const pathname = usePathname();
  // Pages with a full-bleed hero for the header to float over.
  const transparent = pathname === "/" || /^\/designs\/[^/]+$/.test(pathname);
  const [scrolled, setScrolled] = useState(false);

  // Both menus are scoped to the route they were opened on, so navigating —
  // by link or by back button — closes them without an effect.
  const [menu, setMenu] = useState({ path: pathname, open: false });
  const [panel, setPanel] = useState<{
    path: string;
    value: "shop" | "designs" | null;
  }>({ path: pathname, value: null });

  const menuOpen = menu.open && menu.path === pathname;
  const openPanel = panel.path === pathname ? panel.value : null;

  const setMenuOpen = (open: boolean) => setMenu({ path: pathname, open });
  const setOpenPanel = (value: "shop" | "designs" | null) =>
    setPanel({ path: pathname, value });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const floating = transparent && !scrolled && !openPanel && !menuOpen;

  return (
    <header
      // `data-floating` flips the chrome to light type over a dark hero;
      // the rule lives unlayered in globals.css so it beats Tailwind utilities.
      data-floating={floating}
      onMouseLeave={() => setOpenPanel(null)}
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-colors duration-700",
        floating ? "bg-transparent" : "bg-ivory/95 backdrop-blur-sm",
      )}
    >
      <div
        className={cn(
          "border-b transition-colors duration-700",
          floating ? "border-transparent" : "hairline",
        )}
      >
        <Container width="wide">
          <div className="grid h-20 grid-cols-[1fr_auto_1fr] items-center gap-4 md:h-24">
            {/* Left — desktop nav, mobile menu button */}
            <nav className="hidden items-center gap-9 lg:flex">
              <NavTrigger
                label="Shop"
                href="/shop"
                open={openPanel === "shop"}
                onOpen={() => setOpenPanel("shop")}
              />
              <NavTrigger
                label={collectionNav.label}
                href={collectionNav.href}
                open={openPanel === "designs"}
                onOpen={() => setOpenPanel("designs")}
              />
              <HeaderLink href="/about">The House</HeaderLink>
            </nav>

            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              className="eyebrow justify-self-start text-espresso lg:hidden"
            >
              {menuOpen ? "Close" : "Menu"}
            </button>

            {/* Centre — the mark */}
            <Logo monogramSize={32} />

            {/* Right — cart */}
            <div className="flex items-center justify-end gap-8">
              <HeaderLink href="/contact" className="hidden lg:inline-flex">
                Contact
              </HeaderLink>
              <CartTrigger className="eyebrow text-espresso transition-colors duration-500 hover:text-gold" />
            </div>
          </div>
        </Container>
      </div>

      {/* Desktop mega-panel: both browsing models, side by side. */}
      <div
        className={cn(
          "hidden overflow-hidden border-b bg-ivory transition-[max-height,opacity] duration-700 lg:block",
          openPanel ? "max-h-[32rem] opacity-100 hairline" : "max-h-0 border-transparent opacity-0",
        )}
      >
        <Container width="wide">
          <div className="grid grid-cols-2 gap-16 py-12">
            <NavPanelColumn
              title="By product"
              items={productTypeNav}
              highlight={openPanel === "shop"}
            />
            <NavPanelColumn
              title="By collection"
              items={DESIGN_NAV}
              highlight={openPanel === "designs"}
            />
          </div>
        </Container>
      </div>

      {/* Mobile drawer */}
      <div
        id="mobile-nav"
        className={cn(
          "overflow-hidden border-b bg-ivory transition-[max-height] duration-700 lg:hidden",
          menuOpen ? "max-h-[46rem] hairline" : "max-h-0 border-transparent",
        )}
      >
        <Container>
          <div className="space-y-10 py-10">
            <ul className="space-y-4">
              {PRIMARY_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="font-display text-display-sm text-espresso"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <NavPanelColumn title="By product" items={productTypeNav} highlight />
            <NavPanelColumn title="By collection" items={DESIGN_NAV} highlight />
            <Link href="/contact" className="eyebrow inline-block text-espresso-muted">
              Contact
            </Link>
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
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "eyebrow text-espresso transition-colors duration-500 hover:text-gold",
        className,
      )}
    >
      {children}
    </Link>
  );
}

function NavTrigger({
  label,
  href,
  open,
  onOpen,
}: {
  label: string;
  href: string;
  open: boolean;
  onOpen: () => void;
}) {
  return (
    <Link
      href={href}
      onMouseEnter={onOpen}
      onFocus={onOpen}
      className={cn(
        "eyebrow transition-colors duration-500",
        open ? "text-gold" : "text-espresso hover:text-gold",
      )}
    >
      {label}
    </Link>
  );
}

function NavPanelColumn({
  title,
  items,
  highlight = false,
}: {
  title: string;
  items: NavItem[];
  highlight?: boolean;
}) {
  return (
    <div className={cn("transition-opacity duration-700", highlight ? "opacity-100" : "opacity-45")}>
      <p className="eyebrow text-espresso-muted">{title}</p>
      <ul className="mt-6 space-y-5">
        {items.map((item) => (
          <li key={item.href}>
            {item.disabled ? (
              <span className="block cursor-default">
                <span className="font-display text-xl text-espresso-muted">
                  {item.label}
                </span>
                <span className="eyebrow ml-3 text-gold/70">In preparation</span>
              </span>
            ) : (
              <Link href={item.href} className="group block">
                <span className="font-display text-xl text-espresso transition-colors duration-500 group-hover:text-gold">
                  {item.label}
                </span>
                {item.description ? (
                  <span className="mt-1 block max-w-md text-sm text-espresso-muted">
                    {item.description}
                  </span>
                ) : null}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
