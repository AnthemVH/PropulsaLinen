export const imageFragment = /* GraphQL */ `
  fragment ImageFields on Image {
    url
    altText
    width
    height
  }
`;

export const productFragment = /* GraphQL */ `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    descriptionHtml
    productType
    vendor
    tags
    availableForSale
    options {
      id
      name
      optionValues {
        name
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    seo {
      title
      description
    }
    featuredImage {
      ...ImageFields
    }
    images(first: 20) {
      nodes {
        ...ImageFields
      }
    }
    variants(first: 100) {
      nodes {
        id
        title
        availableForSale
        sku
        selectedOptions {
          name
          value
        }
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
        image {
          ...ImageFields
        }
      }
    }
    materialStory: metafield(namespace: "propulsa", key: "material_story") {
      value
    }
    careInstructions: metafield(namespace: "propulsa", key: "care") {
      value
    }
    design: metafield(namespace: "propulsa", key: "design") {
      value
    }
  }
  ${imageFragment}
`;

export const collectionFragment = /* GraphQL */ `
  fragment CollectionFields on Collection {
    id
    handle
    title
    description
    descriptionHtml
    updatedAt
    image {
      ...ImageFields
    }
    seo {
      title
      description
    }
  }
  ${imageFragment}
`;

export const cartFragment = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
      totalTaxAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      nodes {
        id
        quantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
        merchandise {
          ... on ProductVariant {
            id
            title
            selectedOptions {
              name
              value
            }
            image {
              ...ImageFields
            }
            product {
              id
              handle
              title
              productType
            }
          }
        }
      }
    }
  }
  ${imageFragment}
`;
