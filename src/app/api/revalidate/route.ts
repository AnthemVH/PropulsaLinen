import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

import { TAGS } from "@/lib/shopify/client";

/**
 * Shopify webhook target. Point product and collection update webhooks here so
 * the catalogue cache is invalidated on publish rather than on a timer.
 *
 * Authenticated with a shared secret in the query string, which is what
 * Shopify's webhook UI can carry without extra middleware. Rotate it by
 * changing SHOPIFY_REVALIDATION_SECRET and re-saving the webhook.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SHOPIFY_REVALIDATION_SECRET;

  if (!secret) {
    return NextResponse.json(
      { revalidated: false, reason: "not configured" },
      { status: 501 },
    );
  }

  if (request.nextUrl.searchParams.get("secret") !== secret) {
    return NextResponse.json(
      { revalidated: false, reason: "invalid secret" },
      { status: 401 },
    );
  }

  const topic = request.headers.get("x-shopify-topic") ?? "";

  if (topic.startsWith("collections/")) {
    revalidateTag(TAGS.collections, "max");
  } else if (topic.startsWith("products/")) {
    revalidateTag(TAGS.products, "max");
  } else {
    // Unrecognised topic: refresh both rather than silently doing nothing.
    revalidateTag(TAGS.collections, "max");
    revalidateTag(TAGS.products, "max");
  }

  return NextResponse.json({ revalidated: true, topic });
}
