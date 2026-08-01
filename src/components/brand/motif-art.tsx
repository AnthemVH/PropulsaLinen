import type { MotifFormSlug } from "@/lib/content/designs";
import { cn } from "@/lib/utils";

/**
 * The collection artwork itself, from `design-system/assets/motifs`.
 *
 * These are the real plates — vector, self-contained, and already drawn in the
 * brand colours (espresso ground, ivory linework, one gold leaf). They are
 * rendered as plain `<img>` rather than through next/image: they are vector so
 * there is nothing to optimise, and serving SVG through the image optimiser
 * would mean enabling `dangerouslyAllowSVG` for the whole site.
 */

export type Colorway = "signature" | "inverse" | "warm-stone";

export function motifArtSrc(
  form: MotifFormSlug,
  colorway: Colorway = "signature",
): string {
  return `/motifs/${form}--${colorway}.svg`;
}

export function MotifArt({
  form,
  colorway = "signature",
  alt,
  className,
  loading = "lazy",
}: {
  form: MotifFormSlug;
  colorway?: Colorway;
  /** Empty string marks the art as decorative. */
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={motifArtSrc(form, colorway)}
      alt={alt}
      loading={loading}
      decoding="async"
      aria-hidden={alt === "" ? true : undefined}
      className={cn("h-full w-full object-cover", className)}
    />
  );
}
