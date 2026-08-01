import "server-only";

import { cookies } from "next/headers";

import { getCart } from "@/lib/shopify";
import type { Cart } from "@/lib/shopify/types";

export const CART_COOKIE = "propulsa_cart_id";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

export async function readCartId(): Promise<string | null> {
  const store = await cookies();
  return store.get(CART_COOKIE)?.value ?? null;
}

/** Only callable from a Server Action or Route Handler. */
export async function writeCartId(cartId: string): Promise<void> {
  const store = await cookies();
  store.set(CART_COOKIE, cartId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: THIRTY_DAYS,
  });
}

export async function clearCartId(): Promise<void> {
  const store = await cookies();
  store.delete(CART_COOKIE);
}

/**
 * Reads the current cart without creating one. Returns `null` for a visitor
 * who has not added anything yet, and for an expired cart id — Shopify drops
 * carts after roughly ten days of inactivity.
 */
export async function readCart(): Promise<Cart | null> {
  const cartId = await readCartId();
  if (!cartId) return null;

  try {
    return await getCart(cartId);
  } catch {
    // A malformed or foreign cart id should never break page render.
    return null;
  }
}
