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
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
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

  return NextResponse.json({ products, links: links.slice(0, 4) });
}
