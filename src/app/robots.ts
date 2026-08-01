import type { MetadataRoute } from "next";

import { SITE } from "@/lib/content/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/cart"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
