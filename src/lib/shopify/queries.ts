import {
  cartFragment,
  collectionFragment,
  productFragment,
} from "./fragments";

export const getProductQuery = /* GraphQL */ `
  query getProduct($handle: String!) {
    product(handle: $handle) {
      ...ProductFields
    }
  }
  ${productFragment}
`;

export const getProductsQuery = /* GraphQL */ `
  query getProducts(
    $first: Int!
    $query: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
  ) {
    products(
      first: $first
      query: $query
      sortKey: $sortKey
      reverse: $reverse
    ) {
      nodes {
        ...ProductFields
      }
    }
  }
  ${productFragment}
`;

export const getProductHandlesQuery = /* GraphQL */ `
  query getProductHandles($first: Int!) {
    products(first: $first) {
      nodes {
        handle
      }
    }
  }
`;

export const getCollectionQuery = /* GraphQL */ `
  query getCollection($handle: String!) {
    collection(handle: $handle) {
      ...CollectionFields
    }
  }
  ${collectionFragment}
`;

export const getCollectionProductsQuery = /* GraphQL */ `
  query getCollectionProducts(
    $handle: String!
    $first: Int!
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
  ) {
    collection(handle: $handle) {
      products(first: $first, sortKey: $sortKey, reverse: $reverse) {
        nodes {
          ...ProductFields
        }
      }
    }
  }
  ${productFragment}
`;

export const getCollectionsQuery = /* GraphQL */ `
  query getCollections($first: Int!) {
    collections(first: $first) {
      nodes {
        ...CollectionFields
      }
    }
  }
  ${collectionFragment}
`;

export const getCartQuery = /* GraphQL */ `
  query getCart($cartId: ID!) {
    cart(id: $cartId) {
      ...CartFields
    }
  }
  ${cartFragment}
`;

export const createCartMutation = /* GraphQL */ `
  mutation createCart($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
  ${cartFragment}
`;

export const addToCartMutation = /* GraphQL */ `
  mutation addToCart($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
  ${cartFragment}
`;

export const updateCartMutation = /* GraphQL */ `
  mutation updateCart($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
  ${cartFragment}
`;

export const removeFromCartMutation = /* GraphQL */ `
  mutation removeFromCart($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
  ${cartFragment}
`;
