import type { MotifFormSlug } from "@/lib/content/designs";

import type { Colorway } from "./motif-art";

/**
 * The order the house turns through its plates wherever a list needs one per
 * entry (the rooms in the index, the room pages). Only the permitted forms and
 * colourways, never a new rendering.
 */
export const PLATE_SEQUENCE: { form: MotifFormSlug; colorway: Colorway }[] = [
  { form: "dense-field", colorway: "signature" },
  { form: "single-sprig", colorway: "inverse" },
  { form: "dense-field", colorway: "warm-stone" },
  { form: "single-sprig", colorway: "signature" },
  { form: "dense-field", colorway: "inverse" },
  { form: "single-sprig", colorway: "warm-stone" },
  { form: "dense-field", colorway: "signature" },
  { form: "single-sprig", colorway: "inverse" },
];

export function plateFor(index: number) {
  return PLATE_SEQUENCE[((index % PLATE_SEQUENCE.length) + PLATE_SEQUENCE.length) % PLATE_SEQUENCE.length];
}

export const GROUND_CLASS: Record<Colorway, string> = {
  signature: "bg-espresso",
  inverse: "bg-ivory",
  "warm-stone": "bg-stone",
};
