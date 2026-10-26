# Propulsa Linen — Site Map (pre-redesign)

Repo: `AnthemVH/PropulsaLinen` (Vercel project `propulsa-linen`), cloned to this folder.
Stack: Next.js 16.2 (App Router, **non-standard — read `node_modules/next/dist/docs/` before coding, see AGENTS.md**), React 19.2, Tailwind v4 (`@theme` tokens in `src/app/globals.css`), TypeScript. Headless Shopify (Storefront API) with Contrado print-on-demand products. Env: `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_ACCESS_TOKEN`, `NEXT_PUBLIC_SITE_URL`. `npm install` has not been run yet. Dev server config: `.claude/launch.json` (`npm run dev`, port 3000). Without Shopify env vars the site renders empty states via `src/lib/shopify/safe.ts`.

## Brand (do not break — see design-system/brand/guidelines.md)
"Propulsa": luxury heritage lifestyle brand, fashion/fragrance-house energy. One collection at a time: **Botanica Nocturne (N° I)** — an engraved olive branch drawn as a 19th-century naturalist's plate. Made to order, finished by hand, nothing discounted.
- Palette: ivory #f5f0e8 / ivory-light #fbf8f3, stone #d9cfc1 / #b9ab98, espresso #2a211a (soft #4a3e33, muted #6b5d50), gold #a67c3d (light #c9a15e, pale #e0cfae, ink #886632 for small text). Gold = hairlines/accents only, never fill/ground.
- Type: Cormorant Garamond (display, weight 300), EB Garamond (body), Pinyon Script (monogram only).
- Language: generous whitespace, editorial photography, thin gold hairlines (`rule-gold`, `hairline`), slow motion (550ms, `--ease-editorial`), 11px uppercase `eyebrow` labels at 0.22em, NO urgency/discount/countdown energy. Square corners, bordered buttons.
- Motif system: 3 forms (dense-field, single-sprig, hairline-border) x 3 colourways (signature=espresso ground, inverse=ivory ground, warm-stone). Assets in `public/motifs/*.svg` (also `design-system/assets/motifs/` with PNGs + `gen_motifs.py`). Rendered by `components/brand/motif-art.tsx`. Artwork is never reinterpreted.
- Product colourways: Alabaster, Ivory, Sand, Espresso, Deep Espresso (`src/lib/rooms.ts`).

## Routes (`src/app`)
| Route | File | What it does |
|---|---|---|
| `/` | page.tsx (261 ln) | 1 full-bleed hero over dark motif (header floats transparent) -> 2 promise strip (Made to order · Finished by hand · Shipped internationally) -> 3 Shop by room (RoomTiles) -> 4 The collection (one product per room, 8) -> 5 The making (3 HOUSE_STANDARDS cards) -> 6 New in (8) -> 7 Journal (3 "in preparation" placeholder entries) -> 8 Newsletter (mailto only). JSON-LD Organization + WebSite SearchAction. |
| `/shop` | shop/page.tsx | Full catalogue; server-side filters via query (`room`,`type`,`colour`,`price`,`sort`); `FilterSidebar` + `ShopToolbar` (shop-filters.tsx, client). |
| `/shop/[type]` | shop/[type]/page.tsx | Type landing (27 ln, likely redirect/thin). |
| `/rooms/[slug]` | rooms/[slug]/page.tsx | One of 8 rooms (Kitchen & Dining, Bedroom, Bathroom, Living, Décor & Scent, Accessories & Stationery, Leisure, More); `?type=` chip filter (type-chips.tsx). |
| `/products/[handle]` | products/[handle]/page.tsx (335 ln) | Breadcrumb, collection eyebrow, h1, `ProductViewer` (gallery + variant picker + add to cart, sticky purchase panel, colourway swatches that link between sibling products), then "lookbook" two-column story: description, Material & craft, Care, Sizes & prices table, About the collection; "Complete the set"; Recently viewed. Product + Breadcrumb JSON-LD. |
| `/designs`, `/designs/[handle]` | designs/... | Collection pages. `[handle]` = dark hero (header floats), "The source" (botanical, palette dots), story, products grouped by room. |
| `/collections`, `/collections/[handle]` | collections/... | Shopify-collection index/detail (138 ln); overlaps with `/designs` — candidate for consolidation. |
| `/search` + `/api/search` | search/page.tsx | Results page; header `SearchPanel` gives suggestions as you type. |
| `/cart` | cart/page.tsx | `CartPageContents`; cart also lives in `CartDrawer`. Checkout hands off to Shopify (`checkout-action.tsx`). Duties/tax note (`DUTIES_NOTE`) must stay. |
| `/about`, `/faq`, `/contact`, `/shipping-returns`, `/policies/[handle]` | respective | Content pages built on `Prose`. Policies come from Shopify. Contact is mailto-based. |
| `/api/revalidate`, `robots.ts`, `sitemap.ts`, opengraph/twitter images, `not-found.tsx` | | Infra — keep working. |

## Shared UI (`src/components`)
- `layout/header.tsx` (client, 336 ln): fixed, 2-row (utility row: collection link / The House · centred Logo · search icon + cart; second row: Shop all + rooms). Transparent+light text over dark hero on `/` and `/designs/[handle]` until scrolled (`data-floating` CSS rule in globals.css). Desktop mega-menu of all rooms+types with featured room image; mobile accordion drawer; Esc closes; focus handling. `layout/search-panel.tsx`, `layout/footer.tsx` (brand note, email, 4 link columns, registration no. + phone — legally required ECTA s43 details, keep).
- `ui/primitives.tsx`: Container (default/wide/narrow), Eyebrow, Rule, SectionHeading, Button/ButtonLink (solid/outline/quiet), TextLink, Prose. `ui/media.tsx`, `ui/json-ld.tsx`.
- `product/`: `product-grid.tsx`, `group-card.tsx` (client; groups colourway siblings with swatches), `product-viewer.tsx` (463 ln), `recently-viewed.tsx`.
- `shop/`: `shop-filters.tsx` (310 ln), `type-chips.tsx`. `home/room-tiles.tsx`. `cart/*` (context, drawer, trigger, page contents, checkout). `brand/logo.tsx` (Monogram + Wordmark), `brand/motif-art.tsx`.

## Data layer (`src/lib`) — DO NOT change behaviour
`shopify/*` (client, queries, fragments, types, `safe.ts` fault-tolerant wrappers), `catalog.ts` (grouping products by colourway, room nav, shop facets/filters), `rooms.ts` (productType -> room map, colourways), `content/site.ts` (SITE, nav, HOUSE_STANDARDS, PROMISES, JOURNAL, DUTIES_NOTE), `content/designs.ts` (collection, motif forms, blueprints), `cart/*` server actions + cookies, `image-loader.ts`, `utils.ts`.

## Observations / weak spots a redesign should address
- Visual identity is correct but safe/generic-editorial: every section is the same eyebrow + heading + grid rhythm; hero is just the motif at 70% opacity under a gradient; no real photography (rooms have `image: null`, tiles borrow product images).
- Homepage repeats two product grids (curated + new in) back-to-back with little differentiation; Journal is three non-linking placeholders; newsletter is a mailto link.
- Header is dense (two rows + mega-menu + floating/solid states); `/collections` vs `/designs` duplicate each other.
- Content pages are plain `Prose`; product page's lower half is long text columns; product card/swatch UX is understated.
- Motion is limited to `fade-up` and underline reveals; no scroll/entrance choreography, no image reveal, no page transitions.
- Legal/commerce must-keeps: registration no. + phone in footer, duties-on-delivery note in cart, "no urgency/discounts" tone, en-GB copy, a11y (skip link, focus rings, reduced motion, 4.5:1 text — gold-ink for small gold text).
