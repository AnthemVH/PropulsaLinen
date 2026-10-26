import Link from "next/link";

import { Monogram } from "@/components/brand/logo";
import { MotifArt } from "@/components/brand/motif-art";
import { Ornament } from "@/components/ui/primitives";
import { FOOTER_NAV, HOUSE_NOTE, SITE } from "@/lib/content/site";

/**
 * The colophon: the last leaf of the folio. A strip of the hairline border
 * plate, the house note, the index, and the details South African law asks an
 * online shop to show (ECTA s43) — registration number and telephone.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-section-lg bg-espresso-deep text-ivory/80">
      {/* The plate's own edge, as the top of the colophon. */}
      <div aria-hidden className="relative h-14 overflow-hidden border-b border-gold-light/20 md:h-20">
        <MotifArt form="hairline-border" colorway="signature" alt="" className="scale-x-[1.02]" />
      </div>

      <div className="mx-auto max-w-[1760px] px-[var(--gutter)]">
        <div className="grid gap-14 py-16 md:py-24 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5" data-reveal>
            <Monogram size={72} className="text-gold-light" />
            <p className="mt-8 max-w-md font-display text-display-sm text-balance text-ivory-light">
              {HOUSE_NOTE}
            </p>
            <a
              href={`mailto:${SITE.contactEmail}`}
              className="eyebrow link-ruled mt-10 inline-block text-gold-light"
            >
              {SITE.contactEmail}
            </a>
          </div>

          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-4 lg:col-span-7"
          >
            {FOOTER_NAV.map((group, index) => (
              <div key={group.title} data-reveal style={{ "--d": index * 70 } as React.CSSProperties}>
                <p className="eyebrow text-gold-light">{group.title}</p>
                <ul className="mt-6 space-y-3">
                  {group.items.map((item) => (
                    <li key={`${group.title}-${item.href}`}>
                      {item.disabled ? (
                        <span className="text-ivory/55">{item.label}</span>
                      ) : (
                        <Link
                          href={item.href}
                          className="link-underline text-ivory/80 transition-colors hover:text-ivory-light"
                        >
                          {item.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <Ornament tone="dark" />

        <div className="flex flex-col gap-4 py-10 text-sm text-ivory/70 md:flex-row md:items-baseline md:justify-between">
          <p className="max-w-xl">
            © {year} {SITE.legalName}. Registered in South Africa, registration no.{" "}
            <span className="whitespace-nowrap">{SITE.registrationNumber}</span>. Telephone{" "}
            <a
              href={`tel:${SITE.phone.replace(/\s/g, "")}`}
              className="whitespace-nowrap text-ivory/85 hover:text-gold-light"
            >
              {SITE.phone}
            </a>
            .
          </p>
          <p className="running-head text-ivory/65 md:text-right">
            {SITE.tagline}
            <span className="mt-1 block normal-case tracking-normal italic">Set in Cormorant and EB Garamond</span>
          </p>
        </div>
        {/* Clears the phone's home indicator. */}
        <div className="h-[env(safe-area-inset-bottom,0px)]" />
      </div>
    </footer>
  );
}
