"use client";

import { useCart } from "./cart-context";

export function CartTrigger({ className }: { className?: string }) {
  const { cart, openCart } = useCart();
  const count = cart?.totalQuantity ?? 0;

  return (
    <button
      type="button"
      onClick={openCart}
      className={className}
      aria-label={
        count === 0
          ? "Open cart, empty"
          : `Open cart, ${count} ${count === 1 ? "item" : "items"}`
      }
    >
      Cart
      <span className="ml-2 tabular-nums text-espresso-muted">
        ({count})
      </span>
    </button>
  );
}
