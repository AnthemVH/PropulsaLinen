Propulsa — Botanica Nocturne collection brief (for design work on Contrado)

Paste this whole document into the conversation before asking Claude to design products in Contrado's browser design tool via the Chrome extension.

=== BRAND ===

Propulsa is a luxury heritage lifestyle brand selling print-on-demand goods via Contrado, fulfilled through Shopify. Positioning is old-world/heritage luxury — fashion or fragrance house energy — targeting customers willing to pay premium prices. This is not a discount-driven print-on-demand look, and nothing designed for it should read that way: no urgency tactics, no discount energy, no "fun/cute" execution.

Logo: ornate gold/bronze script "P" monogram with a refined small-caps serif wordmark.

Brand colors (hex values match the live site's CSS tokens exactly — do not substitute other shades):
- Ivory: #f5f0e8 (also ivory-light #fbf8f3)
- Warm stone: #d9cfc1 (also stone-dark #b9ab98)
- Deep espresso brown/near-black: #2a211a (also espresso-soft #4a3e33, espresso-muted #6b5d50)
- Gold/bronze accent: #a67c3d (also gold-light #c9a15e, gold-pale #e0cfae)

Typography on the live site: Cormorant (display/headings), EB Garamond (body), Pinyon Script (logo mark only). No rounded or geometric "friendly" fonts anywhere.

Visual language: generous whitespace, editorial photography, thin gold hairline details, slow/elegant motion. Avoid anything that reads mass-produced.

=== COLLECTION: BOTANICA NOCTURNE ===

Concept: a dense, engraved-style botanical illustration — olive branch as the primary motif — drawn in the manner of a 19th-century naturalist plate or apothecary label. A secondary motif (fig branch) is reserved for a future second drop and should NOT be used yet.

Why this direction: it's the most editorial of the directions considered for this brand — strongest on hero photography, reads as intentional and collected rather than mass-produced, which is what justifies premium pricing on a print-on-demand product.

Hard constraints — do not deviate from these:
- One botanical family only: olive. No other plant species.
- Gold is always an accent (a single leaf or vein within the linework, or the hairline border itself) — never a fill color, never a ground color, never used decoratively beyond that.
- Rendering is engraved/linework in the style of a naturalist illustration or apothecary label — not flat, not rounded, not "cute" or illustrative in a modern/friendly way.
- Every product's artwork must be built from one of the 3 motif forms below. Do not invent a new interpretation per product.

=== MOTIF SYSTEM — 3 FORMS, ALL FROM THE SAME OLIVE BRANCH ===

1. Dense field / all-over: the full engraved botanical repeat. Used where a large flat surface needs to carry the whole story — as a border treatment on towels, or as a full/reduced-scale repeat on cushions, throws, wallpaper, wall hangings, canvas prints.

2. Single-sprig emblem: one isolated branch or leaf cluster pulled out of the dense pattern, used as a standalone mark. This should look like a detail cropped directly from the dense field, not a separately redrawn simplification. Used for apparel placement (chest, cuff, hem), and smaller accessories/homeware items where a dense print would be too loud or too costly to execute well (mugs, coasters, wallets, notebook covers, pocket squares, ties).

3. Hairline border/frame: the thin gold or ivory line-work that edges the dense field, usable alone as a minimal trim — matches the brand's existing "gold hairline" visual signature. Used for scarf edges, napkin borders, wallpaper borders, oven gloves/pot holders, bag piping.

=== COLORWAY SYSTEM ===

Signature (hero colorway — default for most products):
- Ground: espresso #2a211a
- Linework: ivory #f5f0e8
- Accent: gold #a67c3d

Inverse (lighter alternative):
- Ground: ivory #f5f0e8
- Linework: espresso #2a211a
- Accent: gold #a67c3d

Warm Stone (quieter, softer contrast):
- Ground: stone #d9cfc1
- Linework: espresso #2a211a
- Accent: gold #a67c3d

Where a product needs more than 3 color options (e.g. the towel range's 24 variants = 4 sizes × 6 colours), vary the accent metal between gold #a67c3d and gold-light #c9a15e rather than inventing new ground colors.

Rules: ground + linework pairs above are fixed — never mix a Signature ground with Inverse linework, etc. Gold/gold-light never functions as a ground or fill.

=== ARTWORK ASSETS — READ BEFORE STARTING BROWSER WORK ===

Contrado's design tool takes uploaded image files (PNG preferred, JPEG/TIFF also accepted, minimum 200 DPI at final print size, bleed area must be fully filled). It does not generate artwork from a text description on its own.

Before any product can actually be created in Contrado's tool, the 3 motif forms need to exist as real image files in each of the 3 colorways (9 base assets minimum: dense field × 3 colorways, single-sprig emblem × 3 colorways, hairline border × 3 colorways), each at sufficient resolution/DPI for the largest product that will use it. If those assets don't exist yet, generate or otherwise produce them first — don't attempt to operate Contrado's uploader without real files ready to upload; there is no artwork to place if this step is skipped.

Exact print-area pixel dimensions per Contrado product are not published outside their own design tool — open each product's actual template in the browser to read its real canvas size and bleed/safety margins, rather than assuming a fixed size.

=== PRODUCT LIST (50 products, Phase 2–4) ===

Full list with per-product motif form assignment is in `products/collection-expansion.md` in this package — attach or paste that file alongside this brief. Summary by phase:

Phase 2 (20 products) — kitchen & dining, dining linens, bathroom, stationery: tea towel, apron, oven glove, pot holder, placemat set, coaster set, chopping board, serving tray, storage tin, mug, table runner, tablecloth, napkin set, bath robe, bath mat, shower curtain, notebook cover, greeting card set, desk mat, drawstring gift pouch.

Phase 3 (15 products) — home furnishings, wall art & wallpaper: cushion cover (square), cushion cover (lumbar), throw blanket, duvet cover, pillowcase set, curtain panel, roller blind, rug, door mat, fabric wall hanging, canvas print, framed art print, wallpaper panel, wallpaper border, decorative wall plate.

Phase 4 (11 products) — travel, accessories, apparel: weekend holdall bag, wash bag, eye mask, travel pillow cover, silk-effect scarf, tote bag, clutch bag, wallet, pocket square, tie, socks, silk-effect robe/kimono, pyjama set, button-up shirt, wrap dress.

(Towels — the 24-variant Phase 1 range — are already spec'd separately in `products/towels.md` and should be treated as done/in progress, not redesigned here.)

=== WORKFLOW FOR CONTRADO'S BROWSER DESIGN TOOL ===

For each product:
1. Confirm the correct motif form and colorway per the tables above (don't guess — check `products/collection-expansion.md`).
2. Open the product's actual page/template in Contrado's design tool and read its real print area, DPI requirement, and bleed margin — these vary per product and aren't public outside the tool.
3. Upload the matching pre-made artwork asset for that motif form + colorway. If the asset doesn't exist yet at the right resolution for this product's print area, stop and flag it rather than uploading a low-resolution placeholder.
4. Position/scale so the bleed area is fully filled (no unprinted edge strips) and the gold accent remains a single small detail, not a dominant fill.
5. Save/preview and compare against the Signature colorway reference before moving to the next product.
6. Work through products in phase order (Phase 2 → 3 → 4) — later phases reuse earlier artwork, so doing them out of order creates rework.

Flag anything that doesn't fit this system (a product category that doesn't cleanly map to one of the 3 motif forms, a print area too small/oddly shaped for any of them) rather than improvising a new visual treatment.
