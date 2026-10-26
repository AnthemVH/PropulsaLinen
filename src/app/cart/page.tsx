import type { Metadata } from "next";

import { CartPageContents } from "@/components/cart/cart-page-contents";
import { Container, PageHeader } from "@/components/ui/primitives";
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
    <Container width="wide" className="pb-section">
      <PageHeader title="Your selection" className="mb-10 md:mb-14" />

      <CartPageContents shopifyConfigured={isShopifyConfigured()} />
    </Container>
  );
}
