"use client";

import { cn } from "@/lib/utils";

import { useCart } from "./cart-context";

export function CartTrigger({ className }: { className?: string }) {
  const { cart, openCart } = useCart();
  const count = cart?.totalQuantity ?? 0;

  return (
    <button
      type="button"
      onClick={openCart}
      className={cn("inline-flex items-baseline gap-1.5", className)}
      aria-label={
        count === 0 ? "Open cart, empty" : `Open cart, ${count} ${count === 1 ? "item" : "items"}`
      }
    >
      Cart
      {/* Keyed on the count so a change re-plays the small entrance. */}
      <span
        key={count}
        className={cn(
          "numeral min-w-[1.1em] text-center text-[0.95rem] leading-none tracking-normal normal-case",
          count > 0 ? "sheet-in text-gold-ink" : "text-espresso-muted",
        )}
      >
        {count > 99 ? "99+" : count}
      </span>
    </button>
  );
}
