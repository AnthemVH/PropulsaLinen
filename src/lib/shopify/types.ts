/**
 * Normalised domain types.
 *
 * Everything above `lib/shopify` speaks these types, never raw Storefront API
 * shapes. That keeps edge-cases (connection/edges/node nesting, nullable
 * fields) contained in one place, and lets the mock catalogue satisfy the same
 * contract as live Shopify data.
 */

export type Money = {
  amount: string;
  currencyCode: string;
};

export type Image = {
  url: string;
  altText: string;
  width: number;
  height: number;
};

export type SelectedOption = {
  name: string;
  value: string;
};

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: SelectedOption[];
  price: Money;
  compareAtPrice: Money | null;
  image: Image | null;
  sku: string | null;
};

export type ProductOption = {
  id: string;
  name: string;
  values: string[];
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  productType: string;
  vendor: string;
  tags: string[];
  availableForSale: boolean;
  options: ProductOption[];
  variants: ProductVariant[];
  images: Image[];
  featuredImage: Image | null;
  priceRange: { minVariantPrice: Money; maxVariantPrice: Money };
  seo: { title: string | null; description: string | null };
  /**
   * Shopify metafields under the `propulsa` namespace. Optional editorial copy
   * that lets merchandisers write per-product craft/care stories without a
   * code change.
   */
  materialStory: string | null;
  careInstructions: string | null;
  /** Handle of the design collection this product belongs to, if tagged. */
  designHandle: string | null;
};

export type Collection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  image: Image | null;
  seo: { title: string | null; description: string | null };
  updatedAt: string;
};

export type CartLine = {
  id: string;
  quantity: number;
  cost: { totalAmount: Money };
  merchandise: {
    id: string;
    title: string;
    selectedOptions: SelectedOption[];
    image: Image | null;
    product: {
      id: string;
      handle: string;
      title: string;
      productType: string;
    };
  };
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount: Money | null;
  };
  lines: CartLine[];
};

/** Sort keys we expose in the shop UI, mapped to Storefront API values. */
export type SortKey = "featured" | "newest" | "price-asc" | "price-desc";
