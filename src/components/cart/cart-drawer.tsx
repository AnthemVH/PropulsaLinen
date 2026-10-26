"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { removeCartLine, updateCartLine } from "@/lib/cart/actions";
import { DUTIES_NOTE } from "@/lib/content/site";
import type { CartLine } from "@/lib/shopify/types";
import { cn, formatPrice } from "@/lib/utils";
import { MotifArt } from "@/components/brand/motif-art";
import { Media } from "@/components/ui/media";

import { CheckoutAction } from "./checkout-action";
import { useCart } from "./cart-context";

/**
 * Slide-over cart. Hands off to Shopify's hosted checkout — the storefront
 * never sees payment details.
 */
export function CartDrawer({ shopifyConfigured }: { shopifyConfigured: boolean }) {
  const { cart, isOpen, closeCart, pending, error, run } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);

  // Modal behaviour: lock the page behind the drawer, close on Escape, keep
  // Tab inside the panel, and hand focus back to whatever opened it.
  useEffect(() => {
    if (!isOpen) return;

    const panel = panelRef.current;
    const opener = document.activeElement as HTMLElement | null;

    const focusable = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => element.offsetParent !== null);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeCart();
        return;
      }

      if (event.key !== "Tab") return;

      const elements = focusable();
      if (!elements.length) return;

      const first = elements[0];
      const last = elements[elements.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    panel?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      // Only pull focus back if it is still inside the closing panel.
      if (panel?.contains(document.activeElement)) opener?.focus?.();
    };
  }, [isOpen, closeCart]);

  const lines = cart?.lines ?? [];
  const isEmpty = lines.length === 0;

  return (
    <div
      className={cn("fixed inset-0 z-50", !isOpen && "pointer-events-none")}
      aria-hidden={!isOpen}
      // Keeps the closed drawer out of the tab order and the accessibility
      // tree — `aria-hidden` alone still leaves its links focusable.
      inert={!isOpen}
    >
      <button
        type="button"
        tabIndex={isOpen ? 0 : -1}
        aria-label="Close cart"
        onClick={closeCart}
        className={cn(
          "absolute inset-0 bg-espresso/45 transition-opacity",
          isOpen ? "duration-500" : "duration-300",
          isOpen ? "opacity-100" : "opacity-0",
        )}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal={isOpen}
        aria-label="Your selection"
        tabIndex={-1}
        className={cn(
          "absolute top-0 right-0 flex h-full w-full max-w-[28rem] flex-col border-l hairline bg-ivory-light shadow-[0_0_80px_rgba(42,33,26,0.18)] transition-transform ease-drawer focus:outline-none",
          // Enters at drawer speed, leaves faster than it came.
          isOpen ? "translate-x-0 duration-500" : "translate-x-full duration-300",
        )}
      >
        <header className="flex items-center justify-between border-b hairline px-6 pt-[max(1.25rem,env(safe-area-inset-top,0px))] pb-5 sm:px-8">
          <h2 className="flex items-baseline gap-3 font-display text-2xl text-espresso">
            Your selection
            {cart?.totalQuantity ? (
              <span className="numeral text-lg text-gold-ink">{cart.totalQuantity}</span>
            ) : null}
          </h2>
          <button
            type="button"
            onClick={closeCart}
            className="eyebrow press -mr-3 p-3 text-espresso-muted hover:text-gold-ink"
          >
            Close
          </button>
        </header>

        {isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-10 text-center">
            <div aria-hidden className="plate-marks relative mb-4 h-40 w-32">
              <div className="absolute inset-0 bg-ivory-light">
                <MotifArt form="single-sprig" colorway="inverse" alt="" className="object-contain" />
              </div>
            </div>
            <p className="font-display text-display-sm text-espresso">Nothing selected yet</p>
            <p className="max-w-xs text-espresso-soft">Pieces you choose will be held here.</p>
            <Link
              href="/shop"
              onClick={closeCart}
              className="eyebrow link-ruled mt-2 py-1 text-espresso"
            >
              Browse the house
            </Link>
          </div>
        ) : (
          <ul className="flex-1 divide-y divide-stone overflow-y-auto overscroll-contain px-6 sm:px-8">
            {lines.map((line) => (
              <CartLineRow
                key={line.id}
                line={line}
                pending={pending}
                onChange={(quantity) =>
                  run(() => updateCartLine(line.id, quantity))
                }
                onRemove={() => run(() => removeCartLine(line.id))}
                onNavigate={closeCart}
              />
            ))}
          </ul>
        )}

        {error ? (
          <p className="px-6 pb-3 text-sm text-gold-ink sm:px-8" role="alert">
            {error}
          </p>
        ) : null}

        {!isEmpty && cart ? (
          <footer className="border-t hairline bg-ivory px-6 pt-6 pb-[max(2rem,env(safe-area-inset-bottom,0px))] sm:px-8">
            <dl className="flex items-baseline justify-between">
              <dt className="eyebrow text-espresso-muted">Subtotal</dt>
              <dd className="font-display text-3xl text-espresso tabular-nums">
                {formatPrice(cart.cost.subtotalAmount)}
              </dd>
            </dl>
            <p className="mt-3 text-sm text-pretty text-espresso-soft">
              {DUTIES_NOTE.short}
            </p>

            <CheckoutAction
              checkoutUrl={cart.checkoutUrl}
              shopifyConfigured={shopifyConfigured}
              className="mt-6 px-6 py-4"
            />
          </footer>
        ) : null}
      </div>
    </div>
  );
}

function CartLineRow({
  line,
  pending,
  onChange,
  onRemove,
  onNavigate,
}: {
  line: CartLine;
  pending: boolean;
  onChange: (quantity: number) => void;
  onRemove: () => void;
  onNavigate: () => void;
}) {
  const options = line.merchandise.selectedOptions
    .map((option) => option.value)
    .join(" · ");

  return (
    <li className={cn("flex gap-5 py-6 transition-opacity duration-300", pending && "opacity-50")}>
      <Link
        href={`/products/${line.merchandise.product.handle}`}
        onClick={onNavigate}
        className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden bg-stone/45"
      >
        <Media image={line.merchandise.image} sizes="96px" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <Link
          href={`/products/${line.merchandise.product.handle}`}
          onClick={onNavigate}
          className="font-display text-lg leading-snug text-espresso [overflow-wrap:anywhere] hover:text-gold-ink"
        >
          {line.merchandise.product.title}
        </Link>
        <p className="mt-1 text-sm text-espresso-soft [overflow-wrap:anywhere]">{options}</p>

        <div className="mt-auto flex items-center justify-between gap-4 pt-4">
          <div className="flex items-center border hairline">
            <QuantityButton
              label="Decrease quantity"
              disabled={pending}
              onClick={() => onChange(line.quantity - 1)}
            >
              –
            </QuantityButton>
            <span className="min-w-8 text-center text-sm tabular-nums">
              {line.quantity}
            </span>
            <QuantityButton
              label="Increase quantity"
              disabled={pending}
              onClick={() => onChange(line.quantity + 1)}
            >
              +
            </QuantityButton>
          </div>

          <span className="text-espresso tabular-nums">
            {formatPrice(line.cost.totalAmount)}
          </span>
        </div>

        <button
          type="button"
          onClick={onRemove}
          disabled={pending}
          className="eyebrow link-underline press mt-3 self-start py-1 text-espresso-muted hover:text-gold-ink disabled:opacity-40"
        >
          Remove
        </button>
      </div>
    </li>
  );
}

function QuantityButton({
  children,
  label,
  disabled,
  onClick,
}: {
  children: string;
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="press flex size-10 items-center justify-center text-espresso-soft hover:text-gold-ink disabled:opacity-40"
    >
      {children}
    </button>
  );
}
