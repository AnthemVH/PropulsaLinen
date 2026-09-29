import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Shopify's CDN does the resizing; see src/lib/image-loader.ts.
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    // Shopify serves all Storefront API images from cdn.shopify.com,
    // regardless of the store's custom domain.
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com", pathname: "/**" },
    ],
    qualities: [70, 82, 92],
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
