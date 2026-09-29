import { permanentRedirect } from "next/navigation";

import { slugify, typeSlug } from "@/lib/catalog";
import { getRoom, roomForType, TYPE_ROOMS } from "@/lib/rooms";

// The shop used to have a page per product category at /shop/[type]. Rooms
// replaced it, so old links are sent to the matching room instead.
export default async function OldCategoryPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;

  if (type === "kitchen-linen") permanentRedirect("/rooms/kitchen-dining");
  if (getRoom(type)) permanentRedirect(`/rooms/${type}`);

  const productType = Object.keys(TYPE_ROOMS).find(
    (name) => slugify(name) === type || typeSlug(name) === type,
  );
  if (productType) {
    const room = roomForType(productType);
    permanentRedirect(`/rooms/${room.slug}?type=${typeSlug(productType)}`);
  }

  permanentRedirect("/shop");
}
