"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { addToCart } from "@/lib/cart/actions";
import type { Product, ProductVariant } from "@/lib/shopify/types";
import { cn, formatPrice, isColourOption, swatchColour, toRoman } from "@/lib/utils";
import { useCart } from "@/components/cart/cart-context";
import { Media } from "@/components/ui/media";

/**
 * The interactive half of a product page: gallery, variant selection and
 * add-to-cart, which share one piece of state — the current selection.
 *
 * Selection is tracked per option name rather than per variant, so a shopper
 * can change colour while holding their size. Combinations that do not exist
 * or are out of stock stay visible but disabled: the range should read as a
 * range, not shrink as you click through it.
 */
// A colourway of this product that is sold as its own Shopify product.
export type ColourwayLink = {
  name: string;
  hex: string;
  handle: string;
  current: boolean;
};

export function ProductViewer({
  product,
  initialVariantId,
  colourways = [],
  heading,
  notes,
}: {
  product: Product;
  initialVariantId?: string;
  colourways?: ColourwayLink[];
  /** The title block, rendered by the page (it owns the h1). */
  heading?: ReactNode;
  /** The folded notes under the purchase button (description, care…). */
  notes?: ReactNode;
}) {
  const initial = useMemo(
    () => resolveInitialSelection(product, initialVariantId),
    [product, initialVariantId],
  );

  const [selection, setSelection] = useState<Record<string, string>>(initial);
  const [activeImage, setActiveImage] = useState(0);

  const selectedVariant = useMemo(
    () => findVariant(product, selection),
    [product, selection],
  );

  const gallery = product.images.length
    ? product.images
    : product.featuredImage
      ? [product.featuredImage]
      : [];

  /**
   * A colour change should move the gallery to that colour's shot; a size
   * change should leave the gallery alone.
   *
   * This follows the variant image *changing* rather than reading it every
   * render. Deriving the shown image from the variant on each render made the
   * thumbnails inert: the Storefront API answers `variant.image` with the
   * product's featured image when a variant has none of its own — which is
   * true of every variant in this catalogue — so there was always a variant
   * image to prefer, and the click was computed and then discarded.
   *
   * As a side effect it also does the right thing for that fallback: an image
   * that never changes never steals the gallery back.
   */
  const variantImage = selectedVariant?.image?.url ?? null;
  const [syncedVariantImage, setSyncedVariantImage] = useState<string | null>(
    null,
  );

  if (variantImage !== syncedVariantImage) {
    setSyncedVariantImage(variantImage);
    const index = variantImage
      ? gallery.findIndex((image) => image.url === variantImage)
      : -1;
    if (index >= 0) setActiveImage(index);
  }

  // Guards against a catalogue change shrinking the gallery under a stored index.
  const shownIndex = Math.min(activeImage, Math.max(gallery.length - 1, 0));

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12 xl:gap-16">
      <div className="lg:col-span-7">
        <Gallery
          images={gallery}
          activeIndex={shownIndex}
          onSelect={setActiveImage}
          title={product.title}
        />
      </div>

      <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:col-span-5 lg:self-start">
        {heading}
        <PurchasePanel
          product={product}
          colourways={colourways}
          selection={selection}
          onSelect={(name, value) =>
            setSelection((current) => ({ ...current, [name]: value }))
          }
          selectedVariant={selectedVariant}
        />
        {notes}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Desktop: one large mounted frame with a column of thumbnails beside it, the
 * chosen view cross-fading in. Phones: the views as a native, snapping
 * carousel with a plate counter, so a swipe carries the phone's own momentum.
 * Both read and write the same active index.
 */
function Gallery({
  images,
  activeIndex,
  onSelect,
  title,
}: {
  images: Product["images"];
  activeIndex: number;
  onSelect: (index: number) => void;
  title: string;
}) {
  const active = images[activeIndex] ?? images[0] ?? null;
  const rail = useRef<HTMLUListElement>(null);
  const settling = useRef(false);

  // Keep the phone carousel on the active view when it changes from outside
  // (a colour choice), without fighting a swipe in progress.
  useEffect(() => {
    const element = rail.current;
    if (!element || element.offsetParent === null) return;
    const target = element.children[activeIndex] as HTMLElement | undefined;
    if (!target) return;
    if (Math.abs(element.scrollLeft - target.offsetLeft) < 4) return;
    settling.current = true;
    element.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
    const timer = window.setTimeout(() => (settling.current = false), 600);
    return () => window.clearTimeout(timer);
  }, [activeIndex]);

  const onRailScroll = () => {
    const element = rail.current;
    if (!element || settling.current) return;
    const index = Math.round(element.scrollLeft / Math.max(element.clientWidth, 1));
    if (index !== activeIndex && index >= 0 && index < images.length) onSelect(index);
  };

  return (
    <div>
      {/* Phones and tablets */}
      <div className="lg:hidden">
        <div className="relative -mx-[var(--gutter)]">
          <ul
            ref={rail}
            onScroll={onRailScroll}
            className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
            aria-label={`${title} — views`}
          >
            {(images.length ? images : [null]).map((image, index) => (
              <li key={`${image?.url ?? "empty"}-${index}`} className="relative aspect-[4/5] w-full shrink-0 snap-center bg-stone/45">
                <Media
                  image={image}
                  alt={`${title} — view ${index + 1}`}
                  sizes="100vw"
                  priority={index === 0}
                  quality={92}
                />
              </li>
            ))}
          </ul>
          {images.length > 1 ? (
            <p className="running-head absolute right-[var(--gutter)] bottom-4 bg-ivory-light/90 px-2.5 py-1.5 text-espresso-soft">
              <span className="numeral text-sm normal-case tracking-normal text-gold-ink">
                {toRoman(activeIndex + 1)}
              </span>{" "}
              / {toRoman(images.length)}
            </p>
          ) : null}
        </div>
        {images.length > 1 ? (
          <div aria-hidden className="mt-4 flex justify-center gap-2">
            {images.map((image, index) => (
              <span
                key={`${image.url}-dot-${index}`}
                className={cn(
                  "h-px transition-[width,background-color] duration-500 ease-out",
                  index === activeIndex ? "w-8 bg-gold" : "w-3 bg-espresso/25",
                )}
              />
            ))}
          </div>
        ) : null}
      </div>

      {/* Desktop */}
      <div className="hidden gap-6 lg:flex">
        {images.length > 1 ? (
          <ul className="flex w-20 shrink-0 flex-col gap-3">
            {images.map((image, index) => (
              <li key={`${image.url}-${index}`}>
                <button
                  type="button"
                  onClick={() => onSelect(index)}
                  aria-label={`View image ${index + 1} of ${images.length}`}
                  // Absent rather than "false": aria-current="false" is announced
                  // by some screen readers as a state the control has.
                  aria-current={index === activeIndex ? "true" : undefined}
                  className={cn(
                    "press relative block aspect-[4/5] w-full overflow-hidden bg-stone/45 outline outline-1 outline-offset-2 transition-[outline-color,opacity] duration-300",
                    index === activeIndex
                      ? "outline-gold"
                      : "opacity-80 outline-transparent hover:opacity-100 hover:outline-stone-dark",
                  )}
                >
                  <Media image={image} sizes="80px" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="plate-marks relative aspect-[4/5] bg-stone/45">
           <div className="absolute inset-0 overflow-hidden">
            {/* Keyed on the view so each change fades in afresh. */}
            <div key={active?.url ?? "empty"} className="view-in absolute inset-0">
              <Media
                image={active}
                alt={`${title} — view ${activeIndex + 1}`}
                sizes="(min-width: 1024px) 50vw, 100vw"
                priority
                quality={92}
              />
            </div>
           </div>
          </div>
          {images.length > 1 ? (
            <p className="running-head mt-5 flex justify-between gap-6 text-espresso-muted">
              <span className="min-w-0 truncate">{title}</span>
              <span className="numeral shrink-0 text-sm whitespace-nowrap normal-case tracking-normal text-gold-ink">
                {toRoman(activeIndex + 1)} / {toRoman(images.length)}
              </span>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function PurchasePanel({
  product,
  colourways,
  selection,
  onSelect,
  selectedVariant,
}: {
  product: Product;
  colourways: ColourwayLink[];
  selection: Record<string, string>;
  onSelect: (name: string, value: string) => void;
  selectedVariant: ProductVariant | undefined;
}) {
  const { run, pending, error } = useCart();

  const price = selectedVariant?.price ?? product.priceRange.minVariantPrice;
  const unavailable = Boolean(selectedVariant && !selectedVariant.availableForSale);
  const incomplete = !selectedVariant;

  const addToCartNow = () => {
    if (!selectedVariant) return;
    run(() => addToCart(selectedVariant.id, 1), { open: true });
  };

  // On phones the gallery fills the first screen, so the add-to-cart button
  // starts out of sight. A slim bar stands in for it until it scrolls into view.
  const mainButton = useRef<HTMLButtonElement>(null);
  const [mainButtonVisible, setMainButtonVisible] = useState(true);
  useEffect(() => {
    const button = mainButton.current;
    if (!button) return;
    const observer = new IntersectionObserver(([entry]) => setMainButtonVisible(entry.isIntersecting));
    observer.observe(button);
    return () => observer.disconnect();
  }, []);

  const label = pending
    ? "Adding…"
    : incomplete
      ? "Select size and colour"
      : unavailable
        ? "Unavailable in this combination"
        : "Add to cart";

  return (
    <div>
      <p className="mt-6 font-display text-3xl text-espresso tabular-nums">{formatPrice(price)}</p>

      <div className="mt-8 space-y-8 border-t hairline pt-8">
        {colourways.length > 1 ? <ColourwayGroup colourways={colourways} /> : null}
        {product.options.map((option) => (
          <OptionGroup
            key={option.id}
            product={product}
            option={option}
            selection={selection}
            onSelect={onSelect}
          />
        ))}
      </div>

      <button
        ref={mainButton}
        type="button"
        disabled={pending || incomplete || unavailable}
        onClick={addToCartNow}
        className="eyebrow press group/button mt-9 flex min-h-14 w-full items-center justify-center gap-4 border border-espresso bg-espresso px-8 py-5 text-ivory-light hover:bg-espresso-soft disabled:cursor-not-allowed disabled:border-stone-dark disabled:bg-stone-dark disabled:text-ivory-light"
      >
        <span className={cn("transition-[opacity,filter] duration-200", pending && "opacity-70 blur-[1px]")}>
          {label}
        </span>
        {!incomplete && !unavailable && !pending ? (
          <span
            aria-hidden
            className="h-px w-5 origin-left bg-current transition-transform duration-500 ease-out group-hover/button:scale-x-[1.8]"
          />
        ) : null}
      </button>

      {error ? (
        <p role="alert" className="mt-4 text-sm text-gold-ink">
          {error}
        </p>
      ) : null}

      <ul className="running-head mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-espresso-muted">
        <li>Made to order</li>
        <li aria-hidden className="size-[5px] rotate-45 border border-gold" />
        <li>Finished by hand</li>
        {selectedVariant?.sku ? (
          <>
            <li aria-hidden className="size-[5px] rotate-45 border border-gold" />
            <li>Ref. {selectedVariant.sku}</li>
          </>
        ) : null}
      </ul>

      {/* Phone-only bar. With options still to choose, it takes you to them
          rather than adding something you didn't pick. */}
      <div
        aria-hidden={mainButtonVisible}
        inert={mainButtonVisible}
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 border-t hairline bg-ivory/92 backdrop-blur-md transition-transform duration-500 ease-drawer lg:hidden",
          mainButtonVisible ? "translate-y-full" : "translate-y-0",
        )}
      >
        <div className="flex items-center gap-4 px-[var(--gutter)] pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-lg leading-tight text-espresso">{product.title}</p>
            <p className="text-sm text-espresso-soft tabular-nums">{formatPrice(price)}</p>
          </div>
          <button
            type="button"
            disabled={pending || unavailable}
            onClick={() =>
              incomplete
                ? mainButton.current?.scrollIntoView({ behavior: "smooth", block: "center" })
                : addToCartNow()
            }
            className="eyebrow press min-h-12 shrink-0 bg-espresso px-5 py-3.5 text-ivory-light hover:bg-espresso-soft disabled:bg-stone-dark"
          >
            {pending ? "Adding…" : incomplete ? "Choose options" : unavailable ? "Unavailable" : "Add to cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Each colourway is a separate Shopify product, so these are links rather than
// options — but they sit and look like a colour choice. scroll={false} keeps
// the page where it is, so it feels like switching a variant.
function ColourwayGroup({ colourways }: { colourways: ColourwayLink[] }) {
  const current = colourways.find((colourway) => colourway.current);

  return (
    <fieldset>
      <legend className="flex w-full items-baseline justify-between gap-4">
        <span className="eyebrow text-espresso-muted">Colourway</span>
        {current ? <span className="font-display text-lg italic text-espresso">{current.name}</span> : null}
      </legend>

      <div className="mt-4 flex flex-wrap gap-3">
        {colourways.map((colourway) => (
          <Link
            key={colourway.handle}
            href={`/products/${colourway.handle}`}
            scroll={false}
            title={colourway.name}
            aria-label={colourway.name}
            aria-current={colourway.current ? "page" : undefined}
            className={cn(
              "press size-11 border outline outline-1 outline-offset-[3px] transition-[outline-color,border-color] duration-300",
              colourway.current
                ? "border-espresso/20 outline-gold"
                : "border-espresso/20 outline-transparent hover:outline-stone-dark",
            )}
            style={{ backgroundColor: colourway.hex }}
          />
        ))}
      </div>
    </fieldset>
  );
}

function OptionGroup({
  product,
  option,
  selection,
  onSelect,
}: {
  product: Product;
  option: Product["options"][number];
  selection: Record<string, string>;
  onSelect: (name: string, value: string) => void;
}) {
  const isColour = isColourOption(option.name);
  const selected = selection[option.name];

  return (
    <fieldset>
      <legend className="flex w-full items-baseline justify-between gap-4">
        <span className="eyebrow text-espresso-muted">{option.name}</span>
        {selected ? (
          <span className="min-w-0 truncate font-display text-lg italic text-espresso">{selected}</span>
        ) : null}
      </legend>

      <div className={cn("mt-4 flex flex-wrap", isColour ? "gap-3" : "gap-2")}>
        {option.values.map((value) => {
          const available = isValueAvailable(product, option.name, value, selection);
          const isSelected = selected === value;

          return isColour ? (
            <button
              key={value}
              type="button"
              title={available ? value : `${value} — unavailable`}
              aria-label={value}
              aria-pressed={isSelected}
              onClick={() => onSelect(option.name, value)}
              className={cn(
                "press relative size-11 border outline outline-1 outline-offset-[3px] transition-[outline-color] duration-300",
                isSelected
                  ? "border-espresso/20 outline-gold"
                  : "border-espresso/20 outline-transparent hover:outline-stone-dark",
                !available && "opacity-35",
              )}
              style={{ backgroundColor: swatchColour(value) }}
            >
              {!available ? (
                <span
                  aria-hidden
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <span className="h-px w-12 -rotate-45 bg-espresso/50" />
                </span>
              ) : null}
              <span className="sr-only">
                {value}
                {available ? "" : " — unavailable"}
              </span>
            </button>
          ) : (
            <button
              key={value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(option.name, value)}
              className={cn(
                "press min-h-11 max-w-full border px-5 py-2.5 text-left text-[0.95rem] [overflow-wrap:anywhere] transition-[border-color,background-color,color] duration-300",
                isSelected
                  ? "border-espresso bg-espresso text-ivory-light"
                  : "hairline-strong text-espresso-soft hover:border-gold hover:text-espresso",
                !available &&
                  !isSelected &&
                  "text-espresso-muted/70 line-through decoration-espresso-muted/50",
              )}
            >
              {value}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/* -------------------------------------------------------------------------- */
/* Selection logic                                                             */
/* -------------------------------------------------------------------------- */

function optionsOf(variant: ProductVariant): Record<string, string> {
  return Object.fromEntries(
    variant.selectedOptions.map((option) => [option.name, option.value]),
  );
}

function findVariant(
  product: Product,
  selection: Record<string, string>,
): ProductVariant | undefined {
  const names = product.options.map((option) => option.name);
  if (names.some((name) => !selection[name])) return undefined;

  return product.variants.find((variant) => {
    const values = optionsOf(variant);
    return names.every((name) => values[name] === selection[name]);
  });
}

/**
 * A value is offered when at least one purchasable variant carries it
 * *alongside the other options already chosen*. Choosing "Espresso" when only
 * the large size is sold out still leaves the colour selectable at other sizes.
 */
function isValueAvailable(
  product: Product,
  optionName: string,
  value: string,
  selection: Record<string, string>,
): boolean {
  return product.variants.some((variant) => {
    const values = optionsOf(variant);
    if (values[optionName] !== value) return false;

    for (const [name, chosen] of Object.entries(selection)) {
      if (name === optionName) continue;
      if (values[name] !== chosen) return false;
    }

    return variant.availableForSale;
  });
}

/** Opens on the requested variant, else the first purchasable one. */
function resolveInitialSelection(
  product: Product,
  initialVariantId?: string,
): Record<string, string> {
  const requested = initialVariantId
    ? product.variants.find((variant) => variant.id === initialVariantId)
    : undefined;

  const variant =
    requested ??
    product.variants.find((candidate) => candidate.availableForSale) ??
    product.variants[0];

  return variant ? optionsOf(variant) : {};
}
