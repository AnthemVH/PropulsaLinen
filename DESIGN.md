# Propulsa Linen: design direction

**Direction: "The Folio."** The storefront reads like a bound naturalist's folio, the kind a fragrance house might publish to go with a collection. It has ivory leaves, espresso night plates, roman plate numerals, running heads in small caps, and printer's plate marks in gold hairline. There is no photography yet, so the nine motif files are the imagery. They are mounted as engravings are mounted in a book: cropped, framed, captioned and turned, but never redrawn.

Single source of truth for every value: **`src/app/globals.css`** (`@theme` tokens plus the utilities below it).

---

## Why this direction

The brief asked for heritage luxury with fashion and fragrance-house energy, not a generic editorial template. The previous site had the right palette, but every section repeated the same eyebrow, heading and grid rhythm. "The Folio" gives the house its own vocabulary, drawn from the object the collection is based on, the engraved botanical plate:

- **Plates, not boxes.** Each motif SVG carries its own ground colour: espresso for signature, ivory for inverse, stone for warm-stone. When a plate sits on a matching page ground, the branch appears drawn on the page itself. Examples are the home frontispiece, the collection hero and empty states. On a contrasting ground it reads as a mounted plate. It gets gold L-corners (`plate-marks`) and a small caption, e.g. *Pl. I · The dense field*.
- **Numbered like a book.** Sections open with a roman numeral (`numeral`), a short gold rule and a small-caps eyebrow. Rooms are numbered I–VIII. Product cards carry a catalogue number (*N° 004*). Gallery views are counted *II / VIII*. A room page states *Room II of VIII* and ends with previous/next room "pagination".
- **Night and day chapters.** Long pages alternate ivory leaves with espresso "night" chapters (The making, Four principles, the product's plate). They end on an espresso-deep colophon edged with the hairline-border plate.
- **Gold stays a line.** Gold appears as hairlines, plate marks, outline lozenges, focus rings, swatch outlines and `gold-ink` text. It is never used as a fill or a ground.

## Tokens (summary)

| Group | Tokens |
| --- | --- |
| Grounds | `ivory #F5F0E8` (page) · `ivory-light #FBF8F3` (sheets, drawers, panels) · `stone #D9CFC1` · `espresso #2A211A` (night chapters) · `espresso-deep #1F1813` (colophon) |
| Ink | `espresso` (16:1 on ivory) · `espresso-soft #4A3E33` (body, 9:1) · `espresso-muted #6B5D50` (labels, 5.6:1 on ivory; **not** for small text on stone, use `espresso-soft`) · on night grounds: `ivory-light`, `ivory/80`, `ivory/70` minimum |
| Gold | `gold #A67C3D` lines and rings only · `gold-light #C9A15E` lines and small text on espresso (6.6:1) · `gold-ink #886632` small gold text on ivory (4.6:1; not on stone) · `gold-pale` selection |
| Lines | `hairline` (gold 30%) · `hairline-strong` (gold 60%, button borders) · `rule-gold` (fading gradient rule) |
| Type | Display: Cormorant Garamond 300 (italic for the second word of a name, *Nocturne*) · Body: EB Garamond with old-style figures; `tabular-nums` switches to lining tabular for prices · Script: Pinyon, **monogram only** |
| Scale | `folio` 4.5→13rem · `display-xl` 3.25→8.5rem (−0.025em) · `display-lg` 2.6→5.25rem · `display-md` 1.95→3.25rem · `display-sm` 1.4→1.9rem · `lede` · `eyebrow` 11px / 0.22em · `running-head` 10px / 0.32em · `numeral` (Cormorant italic, lining) |
| Space | `--gutter` 20 / 40 / 56px · `section` clamp(5rem, 10vw, 9rem) · `section-lg` clamp(7rem, 14vw, 13rem) · `--header-h` 64 / 80px |
| Shape | Square corners everywhere. Swatches are squares with a 1px outline offset 2–3px (gold when chosen). |
| Motion | `--ease-out (0.23,1,0.32,1)` · `--ease-in-out (0.77,0,0.175,1)` · `--ease-drawer (0.32,0.72,0,1)` · `--ease-editorial (0.22,0.61,0.36,1)` · press 160ms · UI 260–300ms · drawers 500ms in / 300ms out · folio reveals 1100–1500ms |

Tailwind v4 generates utilities from `@theme`, so `bg-espresso`, `text-gold-ink`, `ease-out`, `ease-drawer`, `text-display-lg` and so on all exist.

## Components

| Component | File | Notes |
| --- | --- | --- |
| `Plate` | `components/brand/plate.tsx` | Mounts one of the nine motif files. Props: `marks`, `mount` (inner gold rule), `reveal` (tissue-guard unveil on scroll, or `"intro"` above the fold), `drift` (scroll parallax), `breathe` (the one ambient loop), `vertical` (turns a hairline border to run down the plate) and `caption`. |
| `PLATE_SEQUENCE` / `plateFor` | `components/brand/plates.ts` | The fixed order the house turns through its plates, one per room. |
| `Container` / `PageHeader` / `SectionHeading` / `Ornament` / `Rule` / `Button` / `ButtonLink` / `Prose` | `components/ui/primitives.tsx` | `PageHeader` opens every interior page: running head, display title, lede and a gold rule that draws itself. `SectionHeading` takes a `numeral` and a `tone` (light/dark). Buttons have a hairline "leader" that lengthens on hover, and they press to 0.97. |
| Header + house index | `components/layout/header.tsx` | One row: Index · Shop · the collection · The House · monogram · search · cart. **Index** opens a full-height folio index, with rooms in large numbered type, the hovered room's pieces, and a plate that turns per room (cross-fade + settle). On phones the rooms open as an accordion. The header floats transparent over dark plates, tucks away while reading down and returns on scroll up. |
| `RoomIndex` | `components/home/room-index.tsx` | The home page's rooms: a sticky frame on the left turns to each room as the list is hovered or focused. When no rooms are live it lists them unlinked as *In preparation*. |
| `GroupCard` / `GroupGrid` / `ProductRail` / `EmptyState` | `components/product/*` | Cards gain plate marks and a slow 1.035 zoom on hover. Titles clamp to 3 lines, with the full title in `title`. `GroupGrid layout="folio"` makes the first piece a 2×2 lead. `ProductRail` is native scroll-snap for "new in". `EmptyState` is a mounted sprig plate with a label (*In preparation* / *No match*). |
| `ProductViewer` | `components/product/product-viewer.tsx` | Desktop: thumbnails column + mounted main view (keyed `view-in` cross-fade with a 3px blur). Phones: native snap carousel with a roman counter and hairline dots, kept in sync with colour choice. The sticky panel takes `heading` and `notes` from the page. Notes are native `<details>` ("The piece", "Sizes & prices", "Material & craft", "Care", "Making & delivery"). |
| Cart drawer / page | `components/cart/*` | Ivory-light sheet with a drawer curve, scrim, focus trap, Escape, safe-area padding. The duties note (`DUTIES_NOTE`) sits under the subtotal in the drawer and in the summary on the page. |
| Footer (colophon) | `components/layout/footer.tsx` | Espresso-deep, edged with the hairline-border plate. Registration number and telephone (ECTA s43) are in the bottom line. |

## Motion principles: "Turn the page, don't perform"

1. **Two speeds.** UI answers in 160–300ms (press, menus, sheets). The folio turns slowly, 1.1–1.5s for reveals, because those are reading moments, not controls.
2. **Entrances only, once.** `data-reveal` (`rise`, `fade`, `unveil`, `draw`) plays the first time an element enters, via one `IntersectionObserver` (`components/motion/reveal-observer.tsx`). It never re-plays on scroll-back.
3. **Above the fold is pure CSS.** The `intro-*` utilities (rise, fade, unveil, settle, draw) start at first paint, staggered with `--d`.
4. **The tissue guard.** Plates reveal with a `clip-path` wipe while the art inside settles from 1.12× scale, like lifting the tissue off an engraving. The observer watches the wrapper, because an element's own clip-path hides it from `IntersectionObserver`.
5. **Scroll choreography on the compositor.** `scroll-drift` (plates parallax inside their frame) and `scroll-recede` (the hero title fades as you leave) use CSS scroll-driven animations. They apply only under `@supports (animation-timeline: view())`, and elsewhere they sit still.
6. **Page turns.** `<ViewTransition default="page-turn">` (with `experimental.viewTransition`) cross-fades route content: old out in 220ms, new in 520ms from 14px below. The header has its own view-transition name and holds still.
7. **One ambient loop.** `breathe` (28s, ±2.5% scale) on hero plates only.
8. **Cheap.** Only `transform`, `opacity` and `clip-path` animate (plus a 3px blur on gallery swaps). Hover motion is gated by Tailwind v4's hover media query.
9. **Optional.** Under `prefers-reduced-motion`, reveals become 400ms fades, scroll-driven motion and the breathing loop are off, and view transitions are instant.
10. **Content is never hostage.** An inline script hides `data-reveal` elements before paint and un-hides everything after 3 seconds if the observer never boots.

## Mobile

- Header: monogram plus wordmark (wordmark hides below 380px), "Index" glyph, search, cart. Panels lock page scroll and use `overscroll-behavior: contain`.
- Filter & sort is a bottom sheet over a scrim, with a safe-area footer. The product page has a sticky add-to-cart bar until the main button scrolls into view.
- `viewport-fit=cover`, `100svh` heroes, `100dvh` panels, `env(safe-area-inset-*)` on bars and drawers, `-webkit-tap-highlight-color: transparent`, `touch-action: manipulation` on controls, 16px minimum inputs, 44px minimum tap targets on steppers, swatches and options.
- `fieldset { min-width: 0 }` and `grid-cols-1` on data-driven grids, so a long supplier option or an unbroken word cannot widen the page.

## Content rules this design holds to

- No urgency, discount, countdown or sale language. en-GB copy.
- Placeholders are labelled: the journal entries show *In preparation* and do not link. The next collection appears only as *N° II — In preparation*, with the reserved botanical not named.
- No invented specifications. Product notes show Shopify's own description, metafields and size/price table. The "Making & delivery" note repeats the lead time and duties wording already published on the shipping page.

## Routes

`/collections` redirects permanently to `/designs`, which is now the only collections index. It lists house collections first, then any Shopify groupings that aren't mirrors of a house collection. `/collections/[handle]` redirects to `/designs/[handle]` when the handle is a house collection, and otherwise renders the grouping. The sitemap follows the same rule.
