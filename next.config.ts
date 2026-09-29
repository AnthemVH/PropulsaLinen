import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Content Security Policy. Scripts and styles may only come from this site;
// images also from Shopify's CDN. Inline scripts stay allowed because Next.js
// needs them, and the nonce-based alternative would stop every page being
// cached — a poor trade for a shop with no logins and no card details. It still
// blocks third-party scripts, framing, plugins and forms posting elsewhere.
// Development adds what hot reload needs.
const csp = [
  "default-src 'self'",
  // Vercel Analytics loads from this site in production; in development it
  // fetches a debug build from Vercel's script host.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval' https://va.vercel-scripts.com" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://cdn.shopify.com",
  "font-src 'self'",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Browsers only ever reach this site over HTTPS, for two years.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Older browsers that ignore frame-ancestors.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

const nextConfig: NextConfig = {
  // Don't advertise the framework in every response.
  poweredByHeader: false,
  headers() {
    return Promise.resolve([{ source: "/(.*)", headers: securityHeaders }]);
  },
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
