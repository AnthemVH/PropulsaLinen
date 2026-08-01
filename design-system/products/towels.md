# Product Spec — Towels (Phase 1)

Status: **active work order.** Contrado syncs this as 1 product with 24 variants (size × colour).

## Motif form

All-over/dense field (see `collection/motif-system.md`) applied as a bordered treatment — dense botanical border framing the towel field, not a full all-over repeat across the entire surface.

## Proposed 24-variant breakdown

24 = 4 sizes × 6 colours. Colours = 3 grounds × 2 accent finishes (not 6 separate grounds) — keeps the variant grid manageable while still giving customers real choice.

**Sizes (4):**
1. Guest Towel
2. Hand Towel
3. Bath Towel
4. Bath Sheet

**Colours (6) — ground × accent finish:**
1. Signature / Gold
2. Signature / Gold Light
3. Inverse / Gold
4. Inverse / Gold Light
5. Warm Stone / Gold
6. Warm Stone / Gold Light

> This breakdown is a proposal, not confirmed against Contrado's actual towel product configuration. When you open the real Contrado towel template, check whether their size options match the 4 listed above (they may offer different or additional sizes, e.g. Beach Towel, Bath Mat) and adjust the colour count accordingly to keep 24 total. Update this file once confirmed.

## Technical requirements (Contrado)

- Minimum 200 DPI at final print size.
- File format: PNG preferred (lossless, supports transparency); JPEG/TIFF also accepted.
- Fill bleed area completely — do not leave the bleed transparent or white, or the finished edge will show unprinted strips.
- Exact print-area pixel dimensions per size are not published outside Contrado's own design tool — pull these from the live template on import rather than assuming a fixed canvas size, and confirm bleed/safety margins there too.

## Design direction for this SKU specifically

- Border motif frames the towel edge on all 4 sides (or at minimum the two short ends, if Contrado's template only exposes an end-print area — confirm on import).
- Ground fills the towel body; linework and single gold accent sit in the border.
- Keep the accent (gold or gold-light) to one leaf/vein per repeat unit in the border — do not let it become a secondary fill color.

## Open questions to confirm on import

1. Does Contrado's towel template print on all 4 edges, 2 edges, or a single corner/panel?
2. Do their actual size options match Guest/Hand/Bath/Bath Sheet, or differ?
3. Repeat scale of the border motif relative to each size (a Guest Towel border likely needs a tighter repeat than a Bath Sheet).
