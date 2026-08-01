# Propulsa

Headless storefront for Propulsa — a heritage lifestyle house. Next.js App
Router on Vercel, Shopify Storefront API for commerce, Shopify-hosted checkout.

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

Nothing else needs to change: the same data functions serve mock and live data,
and the cart switches from the in-memory mock to real Storefront Cart mutations
with a live `checkoutUrl`.

### Shopify-side setup

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

**Option naming.** Size and colour options are matched by substring, so
"Towel Size" and "Edge color" work as well as "Size" and "Colour". Colour
values map to swatches in `src/lib/utils.ts` — add a hex there for any new
value, or it falls back to neutral stone.

**Supplier descriptions.** Print-on-demand feeds append a stylesheet to the
plain-text description field. `cleanDescription` in `src/lib/shopify/index.ts`
strips it before the copy reaches the PDP or the meta description.

## Architecture

```
src/
  app/                      routes
    page.tsx                homepage
    shop/                   all products, and /shop/[type] per category
    products/[handle]/      product detail — variants, add to cart
    collections/            Shopify collections (the store's own view)
    designs/                design collections (the house's content model)
    cart/                   full-page mirror of the drawer
    api/revalidate/         Shopify webhook target
  components/
    brand/                  monogram and wordmark
    cart/                   context, drawer, page contents
    layout/                 header, footer
    product/                card, grid, viewer (gallery + variants)
    shop/                   URL-driven filter bar
    ui/                     primitives and the image surface
  lib/
    cart/                   cookie handling and Server Actions
    content/                designs, product types, site copy
    shopify/                Storefront API client, queries, normalisation, mock
    catalog.ts              facets, filtering, design resolution
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
cannot be picked up by accident. It is never rendered.

**Product blueprints** — the planned range: ten pieces, each declaring its
category and which motif form it carries *and where*. This is a specification,
not a catalogue: it never produces a product on the site. It labels a real
product's motif once that product exists (matched by Shopify handle), and lists
the intended range on the collection page as work in preparation.

It deliberately carries no prices, options, imagery or material claims. Those
are facts about a physical product, and asserting them here would put
unverified specifications in front of a customer.

### Two browsing models

**By product type** (`/shop/[type]`) is derived from the `productType` values
actually present in the store, matched against the house's planned categories
singular/plural tolerantly. A product whose type matches no planned category
still gets a category of its own — nothing in the store can fall out of the
navigation. Planned categories with no products show as "in preparation".

**By design collection** (`/designs/[handle]`) is the editorial route: the
story, then the motif system, then the pieces grouped by category. It is built
to keep working as one motif spreads across every category the house opens.

A product resolves to its design by, in order: the `propulsa.design` metafield,
a `design:<handle>` tag, a name match, and — while the house runs a single
collection — that collection by default.

### Data flow

Everything above `src/lib/shopify` speaks normalised domain types, never raw
Storefront API shapes — connection nesting and nullable fields are handled in
one place, which is also what lets the mock satisfy the same contract.

The Storefront client is `server-only` by construction, so importing it into a
Client Component is a build error rather than a leaked token. The Admin API is
never used.

Cart mutations are Server Actions. The cart id lives in an httpOnly cookie; the
client holds the last known cart so the header count and drawer update without
re-rendering the tree, and every mutation returns the authoritative cart.
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
