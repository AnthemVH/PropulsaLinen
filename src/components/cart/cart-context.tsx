"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";

import type { CartResult } from "@/lib/cart/actions";
import type { Cart } from "@/lib/shopify/types";

/**
 * Client-side cart state.
 *
 * The server owns the cart; this holds the last known copy so the header count
 * and drawer update without a round trip to re-render the whole tree. Every
 * mutation returns the authoritative cart, which replaces state wholesale.
 */

type CartContextValue = {
  cart: Cart | null;
  isOpen: boolean;
  pending: boolean;
  error: string | null;
  openCart: () => void;
  closeCart: () => void;
  /** Runs a cart Server Action and reconciles the result. */
  run: (action: () => Promise<CartResult>, options?: { open?: boolean }) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  initialCart,
  children,
}: {
  initialCart: Cart | null;
  children: ReactNode;
}) {
  const [cart, setCart] = useState<Cart | null>(initialCart);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => {
    setIsOpen(false);
    setError(null);
  }, []);

  const run = useCallback<CartContextValue["run"]>((action, options) => {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        setCart(result.cart);
        if (options?.open) setIsOpen(true);
      } else {
        setError(result.error);
      }
    });
  }, []);

  const value = useMemo(
    () => ({ cart, isOpen, pending, error, openCart, closeCart, run }),
    [cart, isOpen, pending, error, openCart, closeCart, run],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside <CartProvider>");
  }
  return context;
}
