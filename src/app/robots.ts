import type { MetadataRoute } from "next";

import { SITE } from "@/lib/content/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Personal or endless pages: a cart, search results, and the API.
      disallow: ["/cart", "/search", "/api/"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
