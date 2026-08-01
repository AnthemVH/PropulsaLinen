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
};

export default nextConfig;
