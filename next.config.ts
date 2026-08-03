import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Shopify serves all Storefront API images from cdn.shopify.com,
    // regardless of the store's custom domain.
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com", pathname: "/**" },
    ],
    // Large editorial photography benefits from a couple of quality steps.
    qualities: [70, 82, 92],
    formats: ["image/avif", "image/webp"],
  },
  // `/products/[handle]` has no index of its own — the range lives at /shop.
  // Guessing at the parent of a product URL is a reasonable thing for a
  // customer or a crawler to do, and should not end at the 404 page.
  redirects() {
    return Promise.resolve([
      { source: "/products", destination: "/shop", permanent: true },
    ]);
  },
};

export default nextConfig;
