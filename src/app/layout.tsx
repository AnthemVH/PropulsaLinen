import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { ViewTransition } from "react";
import { Cormorant_Garamond, EB_Garamond, Pinyon_Script } from "next/font/google";

import { CartProvider } from "@/components/cart/cart-context";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { RevealObserver } from "@/components/motion/reveal-observer";
import { readCart } from "@/lib/cart/cookies";
import { buildRoomNav } from "@/lib/catalog";
import { SITE } from "@/lib/content/site";
import { isShopifyConfigured } from "@/lib/shopify";
import { safeGetProducts } from "@/lib/shopify/safe";

import "./globals.css";

/** Display face — headings and the wordmark. */
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

/** Body face — a humanist serif that holds up at small sizes. */
const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  display: "swap",
});

/** Reserved for the monogram and hero moments. Never body or UI copy. */
const pinyon = Pinyon_Script({
  variable: "--font-pinyon",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Botanica Nocturne`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: SITE.locale,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    url: SITE.url,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // The status bar takes the ivory of the page; the site has no dark scheme.
  themeColor: "#f5f0e8",
  colorScheme: "light",
};

// Runs before first paint: marks the document so `data-reveal` elements start
// hidden, and un-hides them after three seconds if the reveal observer never
// boots (a failed script must not leave the page blank).
const MOTION_BOOT = `(function(){var d=document.documentElement;d.setAttribute('data-motion','');setTimeout(function(){if(!window.__folio){d.removeAttribute('data-motion')}},3000)})();`;

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cart = await readCart();
  const shopifyConfigured = isShopifyConfigured();

  // The menu lists only rooms and types that have products in them.
  const rooms = buildRoomNav(await safeGetProducts());

  return (
    <html
      lang="en-GB"
      data-scroll-behavior="smooth"
      className={`${cormorant.variable} ${ebGaramond.variable} ${pinyon.variable} h-full`}
      // The boot script adds data-motion before React hydrates.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: MOTION_BOOT }} />
      </head>
      <body className="flex min-h-full flex-col">
        <CartProvider initialCart={cart}>
          {/* First thing a keyboard reaches: jump past the header and menu. */}
          <a
            href="#main"
            className="eyebrow sr-only z-50 bg-espresso px-5 py-3 text-ivory focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
          >
            Skip to content
          </a>
          <Header rooms={rooms} />
          <main id="main" tabIndex={-1} className="flex-1 pt-[var(--header-h)] outline-none">
            {/* Route changes turn the page: the content cross-fades while the
                header (named in its own view transition) holds still. */}
            <ViewTransition default="page-turn">{children}</ViewTransition>
          </main>
          <Footer />
          <CartDrawer shopifyConfigured={shopifyConfigured} />
          <RevealObserver />
          {/* Cookieless page-view counts; see the privacy policy's "On this website". */}
          <Analytics />
        </CartProvider>
      </body>
    </html>
  );
}
