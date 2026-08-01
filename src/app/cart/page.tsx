import type { Metadata } from "next";

import { CartPageContents } from "@/components/cart/cart-page-contents";
import { Container, Eyebrow, Rule } from "@/components/ui/primitives";
import { isShopifyConfigured } from "@/lib/shopify";

export const metadata: Metadata = {
  title: "Your selection",
  description: "The pieces you have chosen.",
  robots: { index: false, follow: true },
};

/**
 * A full page mirror of the drawer, for shoppers who navigate here directly or
 * return via a bookmark. Both read the same client cart state.
 */
export default function CartPage() {
  return (
    <Container className="pt-16 pb-section md:pt-24">
      <header>
        <Eyebrow>Cart</Eyebrow>
        <h1 className="mt-5 text-display-lg">Your selection</h1>
      </header>

      <Rule className="my-12" />

      <CartPageContents shopifyConfigured={isShopifyConfigured()} />
    </Container>
  );
}
