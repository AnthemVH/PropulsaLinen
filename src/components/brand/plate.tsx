import type { CSSProperties, ReactNode } from "react";

import type { MotifFormSlug } from "@/lib/content/designs";
import { cn } from "@/lib/utils";

import { MotifArt, type Colorway } from "./motif-art";

/**
 * The house plate: one of the nine permitted motif files, mounted the way an
 * engraving is mounted in a folio — a ground in the colourway's own colour,
 * an optional inner gold rule (the passe-partout), printer's plate marks at
 * the corners, and a small caption beneath.
 *
 * The artwork itself is never altered: it is cropped, scaled and framed, the
 * way a plate is cropped by its mount, and nothing more.
 */

const GROUNDS: Record<Colorway, string> = {
  signature: "bg-espresso",
  inverse: "bg-ivory",
  "warm-stone": "bg-stone",
};

export function Plate({
  form,
  colorway = "signature",
  alt = "",
  className,
  frameClassName,
  artClassName,
  marks = false,
  mount = false,
  reveal = false,
  drift = false,
  breathe = false,
  priority = false,
  caption,
  delay,
  vertical = false,
  children,
}: {
  form: MotifFormSlug;
  colorway?: Colorway;
  /** Empty marks the plate as decorative. */
  alt?: string;
  className?: string;
  /** Sizing of the frame itself — usually an aspect ratio. */
  frameClassName?: string;
  artClassName?: string;
  /** Gold L-corners outside the frame. */
  marks?: boolean;
  /** Inner gold rule inside the frame. */
  mount?: boolean;
  /** Lift the tissue guard on entry (clip-path reveal + slow settle). */
  reveal?: boolean | "intro";
  /** Parallax the artwork within its frame as the page scrolls. */
  drift?: boolean;
  /** The one ambient loop: an almost imperceptible breathing. */
  breathe?: boolean;
  priority?: boolean;
  caption?: ReactNode;
  delay?: number;
  /**
   * Run a hairline border down the plate instead of across it, the way a
   * border runs down the side of a towel. The strip is turned, never redrawn;
   * it assumes a 10:13 frame.
   */
  vertical?: boolean;
  /** Overlaid content (gradients, text). */
  children?: ReactNode;
}) {
  const delayStyle = delay ? ({ "--d": delay } as CSSProperties) : undefined;

  return (
    <figure
      data-reveal={reveal === true ? "unveil" : undefined}
      style={delayStyle}
      className={cn(marks && "plate-marks", className)}
    >
      <div
        data-unveil={reveal === true ? "" : undefined}
        style={delayStyle}
        className={cn(
          "relative overflow-hidden",
          GROUNDS[colorway],
          mount && "mount",
          reveal === "intro" && "intro-unveil",
          frameClassName,
        )}
      >
        <div
          data-settle={reveal === true ? "" : undefined}
          style={delayStyle}
          className={cn("absolute inset-0", reveal === "intro" && "intro-settle")}
        >
          <div className={cn("absolute inset-0", drift && "scroll-drift")}>
            <div className={cn("absolute inset-0", breathe && "breathe")}>
              {vertical ? (
                <div className="absolute top-1/2 left-1/2 aspect-[8/1] w-[130%] -translate-x-1/2 -translate-y-1/2 rotate-90">
                  <MotifArt
                    form={form}
                    colorway={colorway}
                    alt={alt}
                    loading={priority ? "eager" : "lazy"}
                    className="object-contain"
                  />
                </div>
              ) : (
                <MotifArt
                  form={form}
                  colorway={colorway}
                  alt={alt}
                  loading={priority ? "eager" : "lazy"}
                  className={artClassName}
                />
              )}
            </div>
          </div>
        </div>
        {children}
      </div>
      {caption ? (
        <figcaption className="running-head mt-4 flex items-baseline justify-between gap-4 text-espresso-muted">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
