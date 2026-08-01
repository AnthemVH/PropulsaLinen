import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EmptyState, ProductGrid } from "@/components/product/product-grid";
import { FilterBar } from "@/components/shop/filter-bar";
import { Container, Eyebrow, Rule } from "@/components/ui/primitives";
import {
  buildFacets,
  deriveCategories,
  findCategory,
  matchesFilters,
  productsInCategory,
  toArray,
} from "@/lib/catalog";
import { getProducts } from "@/lib/shopify";
import type { SortKey } from "@/lib/shopify/types";

type Params = { type: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { type } = await params;

  try {
    const categories = deriveCategories(await getProducts());
    const category = findCategory(categories, type);
    if (!category) return {};

    return {
      title: category.label,
      description: category.blurb ?? `${category.label} by Propulsa.`,
      alternates: { canonical: `/shop/${category.slug}` },
      openGraph: {
        title: `${category.label} — Propulsa`,
        description: category.blurb ?? `${category.label} by Propulsa.`,
      },
    };
  } catch {
    return {};
  }
}

export default async function ProductTypePage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ type }, query] = await Promise.all([params, searchParams]);

  const sortParam = typeof query.sort === "string" ? query.sort : "featured";
  const sort = (
    ["featured", "newest", "price-asc", "price-desc"] as SortKey[]
  ).includes(sortParam as SortKey)
    ? (sortParam as SortKey)
    : "featured";

  const all = await getProducts({ sort });
  const categories = deriveCategories(all);
  const category = findCategory(categories, type);
  if (!category) notFound();

  const inCategory = productsInCategory(all, category.slug);

  const filters = {
    design: toArray(query.design),
    size: toArray(query.size),
    colour: toArray(query.colour),
  };

  const products = inCategory.filter((product) =>
    matchesFilters(product, filters),
  );
  const facets = buildFacets(inCategory);

  return (
    <Container width="wide" className="pt-16 pb-section md:pt-24">
      <header className="max-w-2xl">
        <Eyebrow>By category</Eyebrow>
        <h1 className="mt-5 text-display-lg">{category.label}</h1>
        {category.blurb ? (
          <p className="mt-6 text-lede text-pretty text-espresso-soft">
            {category.blurb}
          </p>
        ) : null}
      </header>

      <Rule className="my-12" />

      {category.planned ? (
        <EmptyState
          title="In preparation"
          body={`${category.label} are not in the store yet. Pieces appear here as they are published.`}
        />
      ) : (
        <>
          <FilterBar
            facets={facets}
            total={products.length}
            showProductType={false}
          />
          <div className="mt-16">
            {products.length ? (
              <ProductGrid products={products} />
            ) : (
              <EmptyState
                title="Nothing matches that combination"
                body="Try removing a filter."
              />
            )}
          </div>
        </>
      )}
    </Container>
  );
}
