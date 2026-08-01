# Motif Assets — Botanica Nocturne

9 base artwork files: 3 motif forms × 3 colorways, covering everything needed for `products/collection-expansion.md` items 1–10 (and reusable across the rest of Phase 2).

| File | Motif form | Colorway |
|---|---|---|
| `single-sprig--signature.svg/png` | Single-sprig emblem | Signature (espresso ground) |
| `single-sprig--inverse.svg/png` | Single-sprig emblem | Inverse (ivory ground) |
| `single-sprig--warm-stone.svg/png` | Single-sprig emblem | Warm Stone |
| `dense-field--signature.svg/png` | Dense field | Signature |
| `dense-field--inverse.svg/png` | Dense field | Inverse |
| `dense-field--warm-stone.svg/png` | Dense field | Warm Stone |
| `hairline-border--signature.svg/png` | Hairline border | Signature |
| `hairline-border--inverse.svg/png` | Hairline border | Inverse |
| `hairline-border--warm-stone.svg/png` | Hairline border | Warm Stone |

## What these are

Code-generated vector line art (built procedurally from bezier-curve geometry, not AI-rendered photography or illustration) — an olive branch drawn in engraved/naturalist-plate style per the collection brief: single-weight linework, cross-hatched leaf veins, one gold accent leaf, olives on distinct pedicels. Colors are exact hex matches to `brand/palette.json`.

Treat these as first-draft production assets, not final art. They're clean enough to place on Contrado products now, but worth a design pass (by hand, or regenerated with adjusted parameters in `gen_motifs.py` if you want denser/looser/more organic linework) before they're the permanent collection assets.

## File formats

- `.svg` — vector source, infinitely scalable, editable (open in Illustrator/Figma/Inkscape to refine).
- `.png` — rasterized at 200+ DPI-equivalent resolution for direct upload to Contrado (single-sprig: 2000×2600px, dense-field: 2400×2400px, hairline-border: 4800×600px). Transparent background — flatten onto the correct ground color if a product's upload field doesn't support transparency, or use the ground-filled version as-is (ground color is already baked into these PNGs, so they're ready to use directly).

## Known limitations

- `dense-field` is a hero/panel composition (main stem + 2 branches filling a square), not a mathematically seamless tileable repeat. Fine for cushions, wall art, framed prints, single-panel placements. For wallpaper/true all-over yardage printing, this needs proper repeat-tile engineering as a follow-up.
- `hairline-border` repeats a fixed-width unit 8 times across a wide strip — visually continuous but not edge-matched for infinite tiling. Fine for napkin/scarf/edge trim at this fixed length; would need adjustment if a product needs a different aspect ratio.
- Exact print-area pixel dimensions per Contrado product haven't been confirmed (see caveat in `products/towels.md`) — check each product's real canvas size in Contrado's tool and scale/crop these accordingly before finalizing.

Regenerate or tweak via `gen_motifs.py` (included in this folder) — it's plain Python + the `convert` (ImageMagick/librsvg) CLI for rasterizing, no external services required.
