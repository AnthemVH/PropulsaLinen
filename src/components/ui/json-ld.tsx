// Structured data for search engines. Product text comes from Shopify and the
// supplier feed, so "<" is escaped: otherwise a description containing
// "</script>" would close this tag and the rest would run as page HTML.
export function JsonLd({ data }: { data: object }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
