# Propulsa

Headless storefront for Propulsa — a heritage lifestyle house. Next.js App
Router on Vercel, Shopify Storefront API for commerce, Shopify-hosted checkout.

Currently carrying one collection: **Botanica Nocturne**, an engraved olive
branch drawn as a nineteenth-century naturalist's plate.

## Running it

```bash
npm install && npm run dev
```

Shopify credentials are required — see below. **There is no fallback
catalogue.** Every product, price, image, variant and category on the site
comes from the store; nothing is invented to fill a gap. A category with no
products says so, and a product with no image renders an empty tonal panel
rather than borrowing a stock photograph.

The one exception is the collection artwork in `public/motifs`, which is the
real Botanica Nocturne plate from `design-system/assets/motifs`.

## Connecting Shopify

Copy `.env.example` to `.env.local` and fill in:

| Variable | Notes |
| --- | --- |
| `SHOPIFY_STORE_DOMAIN` | The `*.myshopify.com` domain, not the customer-facing one |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Storefront API token. Server-side only — never prefix with `NEXT_PUBLIC_` |
| `SHOPIFY_API_VERSION` | Optional. Defaults to `2025-07`. This store serves `2026-07` — a version the store does not serve returns 404 on every request |
| `SHOPIFY_REVALIDATION_SECRET` | Shared secret for the cache-invalidation webhook |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for metadata, Open Graph and the sitemap |

Without credentials the site still builds and serves its brand pages; the
range simply renders empty and the reason is logged.

### Shopify-side setup

**Publishing.** Products *and collections* must be published to the sales
channel the Storefront token reads from, and a product must be Active rather
than Draft. A product created by hand does not inherit the publishing state of
one created by an app — an unpublished product is invisible to the storefront
with no error.

**Domains.** Shopify issues every `checkoutUrl` on the store's *primary*
domain, and redirects the `myshopify.com` one to it, so the primary domain must
be a domain Shopify actually serves. It cannot be the domain this storefront is
deployed on: checkout links would come back to Vercel and land the customer on
our 404 page at the moment they try to pay. Keep the primary domain as the
`myshopify.com` one — or a subdomain whose DNS points at Shopify — and serve the
storefront from the customer-facing name. `resolveCheckoutUrl` in
`src/lib/shopify/index.ts` detects the clash, drops the dead link and logs it.

Optional metafields under the `propulsa` namespace let merchandisers write
per-product editorial copy without a deploy:

- `propulsa.material_story` — the material and craft paragraph on the PDP
- `propulsa.care` — care instructions
- `propulsa.design` — the design collection handle (see below)

Point `products/*` and `collections/*` webhooks at `/api/revalidate?secret=…`
so catalogue changes invalidate the cache on publish rather than on a timer.

**Storefront API scopes.** The token does not need
`unauthenticated_read_product_inventory`; the catalogue queries deliberately
avoid `quantityAvailable`, because requesting a field the token lacks access to
fails the whole query, not just that field. `availableForSale` drives every
in-stock state in the UI.

**Product types.** Print suppliers set `productType` to their own product name
("Tea Towels", "Double Oven Glove") rather than to a merchandising category.
Each house category in `src/lib/content/designs.ts` lists the supplier values
it absorbs. Anything unrecognised still gets a category of its own, so no
product falls out of the navigation.

**Option naming.** Size and colour options are matched by substring, so
"Tea Towel Fabric" and "Trim Color" work as well as "Size" and "Colour".
Colour values map to swatches in `src/lib/utils.ts` — add a hex there for any
new value, or it falls back to neutral stone.

**Supplier descriptions.** Print-on-demand feeds append a stylesheet to the
plain-text description field. `cleanDescription` in `src/lib/shopify/index.ts`
strips it before the copy reaches the PDP or the meta description.

## Architecture

```
src/
  app/                      routes
    page.tsx                homepage — the collection
    shop/                   all products, and /shop/[type] per category
    products/[handle]/      product detail — variants, add to cart
    collections/            Shopify collections (the store's own view)
    designs/                design collections (the house's content model)
    cart/                   full-page mirror of the drawer
    api/revalidate/         Shopify webhook target
  components/
    brand/                  monogram, motif artwork, colorways
    cart/                   context, drawer, page contents
    layout/                 header, footer
    product/                card, grid, viewer (gallery + variants)
    shop/                   URL-driven filter bar
    ui/                     primitives and the image surface
  lib/
    cart/                   cookie handling and Server Actions
    content/                motif forms, collections, planned range, site copy
    shopify/                Storefront client, queries, normalisation, safe reads
    catalog.ts              categories, facets, filtering, design resolution
```

### The content model

`src/lib/content/designs.ts` holds three separate layers.

**Motif forms** — the three permitted renderings of the house artwork: the
dense field, the single-sprig emblem, and the hairline border. Artwork is never
reinterpreted per product; every piece is built from one of these three. That
is a hard brand constraint, so it is modelled explicitly rather than left to a
design brief. A product resolves its form(s) from a `motif:<form>` tag, then
its blueprint.

**Design collections** — a collection is a motif, not a product. Botanica
Nocturne is one botanical family (olive) and nothing else; a second botanical
is recorded in `reservedBotanicals` so the decision is documented in code and
cannot be picked up by accident. It is never rendered. Each collection also
carries its permitted colorways, in which gold is always an accent and never a
ground or a fill.

**Product blueprints** — the planned range, each piece declaring its category
and which motif form it carries *and where*. This is a specification, not a
catalogue: it never produces a product on the site. Its job is to label a real
product's motif once that product exists, matched by Shopify handle.

It deliberately carries no prices, options, imagery or material claims. Those
are facts about a physical product, and asserting them here would put
unverified specifications in front of a customer.

### Two browsing models

**By product type** (`/shop/[type]`) is derived from the `productType` values
actually present in the store, matched against the house's planned categories.
Planned categories with no products show as "in preparation".

**By design collection** (`/designs/[handle]`) is the editorial route: the
story, the motif system, the colorways, then the pieces grouped by category. It
is built to keep working as one motif spreads across every category the house
opens.

A product resolves to its design by, in order: the `propulsa.design` metafield,
a `design:<handle>` tag, a name match, and — while the house runs a single
collection — that collection by default.

### Data flow

Everything above `src/lib/shopify` speaks normalised domain types, never raw
Storefront API shapes, so connection nesting and nullable fields are handled in
one place.

The Storefront client is `server-only` by construction, so importing it into a
Client Component is a build error rather than a leaked token. The Admin API is
never used.

Reads in pages go through `lib/shopify/safe.ts`, which logs and returns empty
on failure: a Shopify outage should not turn the brand pages into a 500. Writes
are deliberately *not* wrapped — a cart mutation that silently does nothing is
worse than one that reports failure.

Cart mutations are Server Actions. The cart id lives in an httpOnly cookie; the
client holds the last known cart so the header count and drawer update without
re-rendering the tree, and every mutation returns the authoritative cart. A
cart id that Shopify rejects is discarded and the add retried against a fresh
cart; a variant that no longer exists expires the catalogue cache and refreshes
the page rather than asking the customer to retry something that is gone.

Checkout is a plain link to Shopify's hosted `checkoutUrl` — the storefront
never touches payment details.

## Design system

Tokens live in `src/app/globals.css` as a Tailwind v4 `@theme` block: ivory and
stone neutrals, espresso ink, and a warm gold used only as a hairline, a hover
state and the monogram. Motion is slow by default (550ms, editorial easing).

Three faces: Cormorant Garamond for display, EB Garamond for body, and Pinyon
Script reserved for the monogram — never body or UI copy.

## Not in this build

Custom upload and personalisation are a deliberate later phase. Fulfilment runs
through Contrado's Shopify app, so the storefront has nothing to do with it.
