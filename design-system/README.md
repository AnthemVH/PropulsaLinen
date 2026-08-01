# Propulsa — Design Package

Design package for the **Botanica Nocturne** collection (first Propulsa collection), structured for import into a design-sync workflow to generate artwork against Contrado product templates.

## Contents

- `brand/guidelines.md` — brand identity reference (positioning, typography, color, visual language)
- `brand/palette.json` — machine-readable hex values for all brand and collection colors
- `collection/brief.md` — Botanica Nocturne concept: motif, colorway logic, rationale
- `collection/motif-system.md` — the 3 reusable forms of the botanical motif and where each applies
- `collection/colorway-spec.md` — the 3 colorways with hex codes and usage rules
- `collection/product-roadmap.md` — phased rollout across Contrado's catalog (towels → flat accessories → homeware → apparel)
- `products/towels.md` — Phase 1 spec: the towel range (24 variants), Contrado technical requirements
- `products/collection-expansion.md` — 50 additional products (Phase 2–4), each tagged with motif form and phase
- `products/phase2-media-map.md` — which asset file to use for each of the first 10 products
- `assets/motifs/` — the actual artwork: 9 files (3 motif forms × 3 colorways) as both `.svg` (vector source) and `.png` (upload-ready), plus `gen_motifs.py` to regenerate/tweak them
- `claude-web-brief.md` — standalone, self-contained brief to paste into a fresh Claude web conversation before it uses the Chrome extension to design products in Contrado's tool

## How to use

1. Read `brand/guidelines.md` and `collection/brief.md` first for context on positioning and the design direction.
2. Use `collection/motif-system.md` + `collection/colorway-spec.md` as the constraint set for any artwork generation — every product's design should be built from these 3 motif forms and 3 colorways, not invented fresh per product.
3. `products/towels.md` is the active work order — start here.
4. Exact print-area pixel dimensions per Contrado product are NOT included here (Contrado doesn't publish these outside their design tool). Pull actual dimensions from the Contrado template on import and reconcile against the "Technical requirements" section in `products/towels.md` before finalizing artwork.

## Status

Phase 1 (towels) spec'd. Phases 2–4 are directional only (see `collection/product-roadmap.md`) and need their own per-product spec files once towels are finalized.
