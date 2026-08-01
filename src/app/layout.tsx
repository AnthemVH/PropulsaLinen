import type { Metadata } from "next";
import { Cormorant_Garamond, EB_Garamond, Pinyon_Script } from "next/font/google";

import { CartProvider } from "@/components/cart/cart-context";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { readCart } from "@/lib/cart/cookies";
import { deriveCategories, type Category } from "@/lib/catalog";
import { SITE } from "@/lib/content/site";
import { getProducts, isShopifyConfigured } from "@/lib/shopify";

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

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cart = await readCart();
  const shopifyConfigured = isShopifyConfigured();

  // The nav lists the categories the store can actually fill. A catalogue
  // failure must not take the whole shell down — the header falls back to the
  // house's planned categories, all marked as in preparation.
  let categories: Category[] = [];
  try {
    categories = deriveCategories(await getProducts());
  } catch (error) {
    console.error("[layout] could not load catalogue for navigation", error);
    categories = deriveCategories([]);
  }

  return (
    <html
      lang="en-GB"
      data-scroll-behavior="smooth"
      className={`${cormorant.variable} ${ebGaramond.variable} ${pinyon.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <CartProvider initialCart={cart}>
          <Header categories={categories} />
          <main className="flex-1 pt-20 md:pt-24">{children}</main>
          <Footer />
          <CartDrawer shopifyConfigured={shopifyConfigured} />
        </CartProvider>
      </body>
    </html>
  );
}
