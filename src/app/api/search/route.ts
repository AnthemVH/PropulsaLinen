import { NextResponse, type NextRequest } from "next/server";

import { groupProducts, matchRoomsAndTypes, type SearchLink } from "@/lib/catalog";
import { typeName } from "@/lib/rooms";
import { safeGetProducts, safePredictiveSearch } from "@/lib/shopify/safe";
import { formatPrice } from "@/lib/utils";

export type SearchSuggestion = {
  key: string;
  title: string;
  type: string;
  handle: string;
  price: string;
  image: { url: string; altText: string; width: number; height: number } | null;
  swatches: { name: string; hex: string }[];
};

export type { SearchLink };

// Suggestions for the header search box, as you type.
export async function GET(request: NextRequest) {
  // Nobody types more than a few words into a shop search; cap it so the
  // route can't be used to push long strings at Shopify.
  const query = (request.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 80);
  if (query.length < 2) {
    return NextResponse.json({ products: [], links: [] });
  }

  const [matches, catalogue] = await Promise.all([
    safePredictiveSearch(query),
    safeGetProducts(),
  ]);

  const products: SearchSuggestion[] = groupProducts(matches)
    .slice(0, 5)
    .map((group) => {
      const lead = group.items[0].product;
      const price = formatPrice(group.minPrice);
      return {
        key: group.key,
        title: group.title,
        type: typeName(group.productType),
        handle: lead.handle,
        price: group.hasPriceRange ? `From ${price}` : price,
        image: lead.featuredImage,
        swatches: group.items
          .filter((item) => item.colourway)
          .map((item) => ({ name: item.colourway!.name, hex: item.colourway!.hex })),
      };
    });

  const links = matchRoomsAndTypes(catalogue, query);

  // Identical searches are answered from Vercel's cache for five minutes
  // rather than each one reaching Shopify.
  return NextResponse.json(
    { products, links: links.slice(0, 4) },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
  );
}
