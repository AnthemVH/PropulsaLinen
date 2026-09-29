"use client";

// Every next/image goes through this. Shopify's CDN resizes images itself when
// given a width, so product photos are served straight from it rather than
// through the Next.js image optimiser — which timed out when a grid asked it
// for fifty images at once. Local files in /public are served as they are.
export default function imageLoader({
  src,
  width,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (src.startsWith("https://cdn.shopify.com/")) {
    const url = new URL(src);
    url.searchParams.set("width", String(width));
    return url.toString();
  }

  return `${src}${src.includes("?") ? "&" : "?"}w=${width}`;
}
