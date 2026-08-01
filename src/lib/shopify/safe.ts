import "server-only";

import {
  getCollection,
  getCollectionProducts,
  getCollections,
  getProduct,
  getProducts,
  isShopifyConfigured,
} from "./index";
import type { Collection, Product, SortKey } from "./types";

/**
 * Read helpers that survive a catalogue failure.
 *
 * A storefront should not return 500 because Shopify is unreachable — the
 * brand pages are worth serving on their own, and an empty range reads far
 * better than an error. Writes are deliberately *not* wrapped: a cart mutation
 * that silently does nothing would be worse than one that reports failure.
 *
 * The two failure modes are kept distinct in the logs. A configuration error
 * is a deployment mistake and should be fixed; a request error is the store
 * having a bad minute.
 */

function note(operation: string, error: unknown): void {
  if (!isShopifyConfigured()) {
    console.error(
      `[shopify] ${operation} skipped — store is not configured. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN.`,
    );
    return;
  }
  console.error(`[shopify] ${operation} failed`, error);
}

export async function safeGetProducts(
  options: { query?: string; sort?: SortKey; first?: number } = {},
): Promise<Product[]> {
  try {
    return await getProducts(options);
  } catch (error) {
    note("getProducts", error);
    return [];
  }
}

export async function safeGetProduct(handle: string): Promise<Product | null> {
  try {
    return await getProduct(handle);
  } catch (error) {
    note("getProduct", error);
    return null;
  }
}

export async function safeGetCollections(): Promise<Collection[]> {
  try {
    return await getCollections();
  } catch (error) {
    note("getCollections", error);
    return [];
  }
}

export async function safeGetCollection(
  handle: string,
): Promise<Collection | null> {
  try {
    return await getCollection(handle);
  } catch (error) {
    note("getCollection", error);
    return null;
  }
}

export async function safeGetCollectionProducts(
  handle: string,
  sort: SortKey = "featured",
): Promise<Product[]> {
  try {
    return await getCollectionProducts(handle, sort);
  } catch (error) {
    note("getCollectionProducts", error);
    return [];
  }
}
