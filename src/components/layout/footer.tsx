import Link from "next/link";

import { Monogram, Wordmark } from "@/components/brand/logo";
import { Container, Rule } from "@/components/ui/primitives";
import { FOOTER_NAV, HOUSE_NOTE, SITE } from "@/lib/content/site";

export function Footer() {
  return (
    <footer className="mt-section-lg bg-ivory">
      <Rule />
      <Container width="wide">
        <div className="grid gap-14 py-16 md:grid-cols-[1.2fr_2fr] md:py-20">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <Monogram size={44} />
              <Wordmark />
            </div>
            <p className="mt-7 text-espresso-soft">{HOUSE_NOTE}</p>
            <a
              href={`mailto:${SITE.contactEmail}`}
              className="eyebrow mt-7 inline-block text-gold link-underline"
            >
              {SITE.contactEmail}
            </a>
          </div>

          <nav className="grid gap-10 sm:grid-cols-3">
            {FOOTER_NAV.map((group) => (
              <div key={group.title}>
                <p className="eyebrow text-espresso-muted">{group.title}</p>
                <ul className="mt-5 space-y-3">
                  {group.items.map((item) => (
                    <li key={`${group.title}-${item.href}`}>
                      {item.disabled ? (
                        <span className="text-espresso-muted/70">
                          {item.label}
                        </span>
                      ) : (
                        <Link
                          href={item.href}
                          className="text-espresso-soft transition-colors duration-500 hover:text-gold"
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

        <Rule />

        <div className="flex flex-col gap-3 py-8 text-sm text-espresso-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <p className="eyebrow">{SITE.tagline}</p>
        </div>
      </Container>
    </footer>
  );
}
