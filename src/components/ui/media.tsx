import NextImage from "next/image";

import type { Image } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

/**
 * Image surface for the storefront.
 *
 * Every image comes from the Shopify CDN and goes through next/image with a
 * responsive `sizes` hint. When a product has no image, the slot renders as a
 * plain tonal panel rather than inventing artwork — an empty frame is honest
 * about a gap in the catalogue in a way a stock placeholder is not.
 *
 * Always fills its parent, so the caller owns the aspect ratio.
 */

type MediaProps = {
  image: Image | null;
  sizes: string;
  className?: string;
  priority?: boolean;
  quality?: 70 | 82 | 92;
  /** Overrides the alt text; falls back to the image's own. */
  alt?: string;
};

export function Media({
  image,
  sizes,
  className,
  priority = false,
  quality = 82,
  alt,
}: MediaProps) {
  if (!image?.url) {
    return (
      <div
        aria-hidden
        className={cn("absolute inset-0 bg-stone/40", className)}
      />
    );
  }

  return (
    <NextImage
      src={image.url}
      alt={alt ?? image.altText}
      fill
      sizes={sizes}
      priority={priority}
      quality={quality}
      className={cn("object-cover", className)}
    />
  );
}
