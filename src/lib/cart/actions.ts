"use server";

import { revalidateTag } from "next/cache";

import {
  addCartLines,
  createCart,
  removeCartLines,
  updateCartLines,
} from "@/lib/shopify";
import { TAGS } from "@/lib/shopify/client";
import type { Cart } from "@/lib/shopify/types";

import { clearCartId, readCart, readCartId, writeCartId } from "./cookies";

/**
 * Cart mutations. Each returns the full updated cart so the client can replace
 * its state in one round trip rather than refetching.
 */

export type CartResult =
  | { ok: true; cart: Cart }
  | { ok: false; error: string; stale?: boolean };

/**
 * Shopify reports a variant that has been deleted, unpublished or renumbered
 * as "does not exist". The customer is not looking at a transient failure —
 * they are looking at a page built from cached data that is now wrong, so
 * "please try again" would be false. Detect it, say so plainly, and expire the
 * catalogue cache so the page corrects itself.
 */
function isMissingMerchandise(message: string): boolean {
  return (
    /does not exist/i.test(message) ||
    /merchandise/i.test(message) ||
    /invalid.*merchandise/i.test(message)
  );
}

function failure(error: unknown, fallback: string): CartResult {
  const message = error instanceof Error ? error.message : String(error);
  // Storefront messages are merchant-facing; keep them out of the UI.
  console.error("[cart]", message);

  if (isMissingMerchandise(message)) {
    revalidateTag(TAGS.products, "max");
    return {
      ok: false,
      stale: true,
      error:
        "This piece is no longer available. Refresh the page for the current range.",
    };
  }

  return { ok: false, error: fallback };
}

/**
 * Adds to the cart, replacing the stored cart when the id no longer works.
 *
 * A cart id in the cookie can stop being usable for several ordinary reasons:
 * Shopify expires carts after roughly ten days, the store can be re-pointed at
 * a different Shopify account, or the id can predate the store being connected
 * at all. None of those are the shopper's problem, so an unusable id is
 * discarded and the add is retried against a fresh cart rather than surfacing
 * an error.
 */
export async function addToCart(
  merchandiseId: string,
  quantity = 1,
): Promise<CartResult> {
  if (!merchandiseId) {
    return { ok: false, error: "Select a size and colour first." };
  }

  const lines = [{ merchandiseId, quantity }];

  try {
    const existing = await readCartId();

    if (existing) {
      try {
        return { ok: true, cart: await addCartLines(existing, lines) };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        // A missing variant is not the cart's fault, so starting a new cart
        // would fail identically. Report it instead of retrying.
        if (isMissingMerchandise(message)) return failure(error, "");

        console.warn("[cart] discarding unusable cart id", message);
      }
    }

    const cart = await createCart(lines);
    await writeCartId(cart.id);
    return { ok: true, cart };
  } catch (error) {
    return failure(error, "We could not add that piece. Please try again.");
  }
}

export async function updateCartLine(
  lineId: string,
  quantity: number,
): Promise<CartResult> {
  try {
    const cartId = await readCartId();
    if (!cartId) return { ok: false, error: "Your cart has expired." };

    const cart =
      quantity <= 0
        ? await removeCartLines(cartId, [lineId])
        : await updateCartLines(cartId, [{ id: lineId, quantity }]);

    return { ok: true, cart };
  } catch (error) {
    // The line belongs to a cart we can no longer address; drop the id so the
    // next add starts cleanly instead of failing the same way.
    await clearCartId();
    return failure(error, "Your cart has expired. Please add the piece again.");
  }
}

export async function removeCartLine(lineId: string): Promise<CartResult> {
  try {
    const cartId = await readCartId();
    if (!cartId) return { ok: false, error: "Your cart has expired." };

    const cart = await removeCartLines(cartId, [lineId]);
    return { ok: true, cart };
  } catch (error) {
    await clearCartId();
    return failure(error, "Your cart has expired. Please add the piece again.");
  }
}

/** Used by the client to resync after an expired or foreign cart id. */
export async function refreshCart(): Promise<Cart | null> {
  return readCart();
}
