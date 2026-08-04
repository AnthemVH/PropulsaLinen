"use client";

import { useMemo, useState } from "react";

import { addToCart } from "@/lib/cart/actions";
import type { Product, ProductVariant } from "@/lib/shopify/types";
import { cn, formatPrice, isColourOption, swatchColour } from "@/lib/utils";
import { useCart } from "@/components/cart/cart-context";
import { Media } from "@/components/ui/media";
import { Eyebrow, Rule } from "@/components/ui/primitives";

/**
 * The interactive half of a product page: gallery, variant selection and
 * add-to-cart, which share one piece of state — the current selection.
 *
 * Selection is tracked per option name rather than per variant, so a shopper
 * can change colour while holding their size. Combinations that do not exist
 * or are out of stock stay visible but disabled: the range should read as a
 * range, not shrink as you click through it.
 */
export function ProductViewer({
  product,
  initialVariantId,
}: {
  product: Product;
  initialVariantId?: string;
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
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-20">
      <Gallery
        images={gallery}
        activeIndex={shownIndex}
        onSelect={setActiveImage}
        title={product.title}
      />

      <div className="lg:sticky lg:top-32 lg:self-start">
        <PurchasePanel
          product={product}
          selection={selection}
          onSelect={(name, value) =>
            setSelection((current) => ({ ...current, [name]: value }))
          }
          selectedVariant={selectedVariant}
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

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

  return (
    <div className="flex flex-col gap-5">
      <div className="relative aspect-[4/5] overflow-hidden bg-stone/30">
        <Media
          image={active}
          alt={`${title} — view ${activeIndex + 1}`}
          sizes="(min-width: 1024px) 55vw, 100vw"
          priority
          quality={92}
        />
      </div>

      {images.length > 1 ? (
        <ul className="flex flex-wrap gap-3">
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
                  "relative aspect-square w-20 overflow-hidden border transition-colors duration-500",
                  index === activeIndex
                    ? "border-gold"
                    : "border-transparent hover:border-stone-dark",
                )}
              >
                <Media image={image} sizes="80px" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function PurchasePanel({
  product,
  selection,
  onSelect,
  selectedVariant,
}: {
  product: Product;
  selection: Record<string, string>;
  onSelect: (name: string, value: string) => void;
  selectedVariant: ProductVariant | undefined;
}) {
  const { run, pending, error } = useCart();

  const price = selectedVariant?.price ?? product.priceRange.minVariantPrice;
  const unavailable = Boolean(selectedVariant && !selectedVariant.availableForSale);
  const incomplete = !selectedVariant;

  return (
    <div>
      <p className="font-display text-3xl tabular-nums">{formatPrice(price)}</p>

      <div className="mt-8 space-y-9">
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

      <Rule className="my-9" />

      <button
        type="button"
        disabled={pending || incomplete || unavailable}
        onClick={() => {
          if (!selectedVariant) return;
          run(() => addToCart(selectedVariant.id, 1), { open: true });
        }}
        className="eyebrow flex w-full items-center justify-center border hairline bg-espresso px-8 py-5 text-ivory transition-colors duration-500 hover:bg-gold disabled:cursor-not-allowed disabled:bg-stone-dark disabled:text-ivory-light"
      >
        {pending
          ? "Adding…"
          : incomplete
            ? "Select size and colour"
            : unavailable
              ? "Unavailable in this combination"
              : "Add to cart"}
      </button>

      {error ? (
        <p role="alert" className="mt-4 text-sm text-gold">
          {error}
        </p>
      ) : null}

      {selectedVariant?.sku ? (
        <p className="eyebrow mt-6 text-espresso-muted">
          Reference {selectedVariant.sku}
        </p>
      ) : null}
    </div>
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
        <Eyebrow as="span">{option.name}</Eyebrow>
        {selected ? (
          <span className="text-sm text-espresso-muted">{selected}</span>
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
                "relative size-10 rounded-full border transition-all duration-500",
                isSelected
                  ? "border-gold ring-1 ring-gold ring-offset-4 ring-offset-ivory"
                  : "border-espresso/15 hover:border-stone-dark",
                !available && "opacity-35",
              )}
              style={{ backgroundColor: swatchColour(value) }}
            >
              {!available ? (
                <span
                  aria-hidden
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <span className="h-px w-8 rotate-45 bg-espresso/50" />
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
                "eyebrow border px-5 py-3 transition-colors duration-500",
                isSelected
                  ? "border-gold bg-gold/10 text-espresso"
                  : "hairline text-espresso-soft hover:border-gold",
                !available &&
                  "text-espresso-muted/50 line-through decoration-espresso-muted/40",
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
