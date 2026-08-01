"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { removeCartLine, updateCartLine } from "@/lib/cart/actions";
import type { CartLine } from "@/lib/shopify/types";
import { cn, formatPrice } from "@/lib/utils";
import { Media } from "@/components/ui/media";
import { Rule } from "@/components/ui/primitives";

import { useCart } from "./cart-context";

/**
 * Slide-over cart. Hands off to Shopify's hosted checkout — the storefront
 * never sees payment details.
 */
export function CartDrawer({ shopifyConfigured }: { shopifyConfigured: boolean }) {
  const { cart, isOpen, closeCart, pending, error, run } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape, and lock the page behind the drawer.
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, closeCart]);

  const lines = cart?.lines ?? [];
  const isEmpty = lines.length === 0;

  return (
    <div
      className={cn("fixed inset-0 z-50", !isOpen && "pointer-events-none")}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        tabIndex={isOpen ? 0 : -1}
        aria-label="Close cart"
        onClick={closeCart}
        className={cn(
          "absolute inset-0 bg-espresso/35 backdrop-blur-[2px] transition-opacity duration-700",
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
          "absolute right-0 top-0 flex h-full w-full max-w-[27rem] flex-col bg-ivory-light shadow-[0_0_60px_rgba(42,33,26,0.14)] transition-transform duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)] focus:outline-none",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex items-baseline justify-between px-7 pt-8 pb-5">
          <h2 className="eyebrow text-espresso-muted">Your selection</h2>
          <button
            type="button"
            onClick={closeCart}
            className="eyebrow text-espresso-muted transition-colors duration-500 hover:text-gold"
          >
            Close
          </button>
        </header>
        <Rule />

        {isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-10 text-center">
            <p className="text-display-sm">Nothing selected yet</p>
            <p className="text-espresso-muted">
              Pieces you choose will be held here.
            </p>
            <Link
              href="/products"
              onClick={closeCart}
              className="eyebrow mt-2 text-gold link-underline"
            >
              Browse the collections
            </Link>
          </div>
        ) : (
          <ul className="flex-1 divide-y divide-stone/60 overflow-y-auto px-7">
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
          <p className="px-7 pb-3 text-sm text-gold" role="alert">
            {error}
          </p>
        ) : null}

        {!isEmpty && cart ? (
          <footer className="border-t hairline px-7 pt-6 pb-8">
            <dl className="flex items-baseline justify-between">
              <dt className="eyebrow text-espresso-muted">Subtotal</dt>
              <dd className="font-display text-2xl">
                {formatPrice(cart.cost.subtotalAmount)}
              </dd>
            </dl>
            <p className="mt-2 text-sm text-espresso-muted">
              Shipping and any duties are calculated at checkout.
            </p>

            {shopifyConfigured && cart.checkoutUrl ? (
              <a
                href={cart.checkoutUrl}
                className="eyebrow mt-6 flex w-full items-center justify-center border hairline bg-espresso px-8 py-4 text-ivory transition-colors duration-500 hover:bg-gold"
              >
                Proceed to checkout
              </a>
            ) : (
              <p className="mt-6 border hairline px-6 py-4 text-center text-sm text-espresso-muted">
                Checkout opens once the Shopify store is connected.
              </p>
            )}
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
    <li className={cn("flex gap-5 py-6 transition-opacity", pending && "opacity-50")}>
      <Link
        href={`/products/${line.merchandise.product.handle}`}
        onClick={onNavigate}
        className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden bg-stone/40"
      >
        <Media image={line.merchandise.image} sizes="96px" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <Link
          href={`/products/${line.merchandise.product.handle}`}
          onClick={onNavigate}
          className="font-display text-lg transition-colors duration-500 hover:text-gold"
        >
          {line.merchandise.product.title}
        </Link>
        <p className="mt-1 text-sm text-espresso-muted">{options}</p>

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

          <span className="text-sm tabular-nums">
            {formatPrice(line.cost.totalAmount)}
          </span>
        </div>

        <button
          type="button"
          onClick={onRemove}
          disabled={pending}
          className="eyebrow mt-3 self-start text-espresso-muted transition-colors duration-500 hover:text-gold disabled:opacity-40"
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
      className="px-3 py-2 text-sm text-espresso-muted transition-colors duration-500 hover:text-gold disabled:opacity-40"
    >
      {children}
    </button>
  );
}
