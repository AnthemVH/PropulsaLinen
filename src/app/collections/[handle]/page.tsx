import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EmptyState, ProductGrid } from "@/components/product/product-grid";
import { Media } from "@/components/ui/media";
import {
  Container,
  Eyebrow,
  Rule,
  TextLink,
} from "@/components/ui/primitives";
import { getDesign } from "@/lib/content/designs";
import { SITE } from "@/lib/content/site";
import { getCollections } from "@/lib/shopify";
import {
  safeGetCollection,
  safeGetCollectionProducts,
} from "@/lib/shopify/safe";
import type { SortKey } from "@/lib/shopify/types";
import { isFetchableImage } from "@/lib/utils";

type Params = { handle: string };

export async function generateStaticParams(): Promise<Params[]> {
  try {
    const collections = await getCollections();
    return collections.map((collection) => ({ handle: collection.handle }));
  } catch (error) {
    console.error("[build] could not prerender collection pages", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { handle } = await params;
  const collection = await safeGetCollection(handle);
  if (!collection) return {};

  const title = collection.seo.title ?? collection.title;
  const description = collection.seo.description ?? collection.description;

  return {
    // A merchandiser-authored SEO title already carries the house name.
    title: collection.seo.title ? { absolute: collection.seo.title } : title,
    description,
    alternates: { canonical: `/collections/${collection.handle}` },
    openGraph: {
      title: `${title} — ${SITE.name}`,
      description,
      url: `${SITE.url}/collections/${collection.handle}`,
      images: isFetchableImage(collection.image)
        ? [{ url: collection.image.url, alt: collection.image.altText }]
        : undefined,
    },
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { handle } = await params;
  const [collection, query] = await Promise.all([
    safeGetCollection(handle),
    searchParams,
  ]);

  if (!collection) notFound();

  const sortParam = typeof query.sort === "string" ? query.sort : "featured";
  const sort = (
    ["featured", "newest", "price-asc", "price-desc"] as SortKey[]
  ).includes(sortParam as SortKey)
    ? (sortParam as SortKey)
    : "featured";

  const products = await safeGetCollectionProducts(collection.handle, sort);

  // A Shopify collection that mirrors a design collection links across to the
  // editorial page rather than duplicating its story.
  const design = getDesign(collection.handle);

  return (
    <>
      {collection.image ? (
        <section className="relative aspect-[16/7] w-full overflow-hidden bg-stone/30">
          <Media
            image={collection.image}
            sizes="100vw"
            priority
            quality={92}
          />
          <div className="absolute inset-0 bg-espresso/15" />
        </section>
      ) : null}

      <Container width="wide" className="pt-14 pb-section">
        <header className="max-w-2xl">
          <Eyebrow>Collection</Eyebrow>
          <h1 className="mt-5 text-display-lg text-balance">
            {collection.title}
          </h1>
          {collection.description ? (
            <p className="mt-6 text-lede text-pretty text-espresso-soft">
              {collection.description}
            </p>
          ) : null}
          {design ? (
            <TextLink
              href={`/designs/${design.handle}`}
              className="eyebrow mt-7 inline-block"
            >
              Read the {design.name} story
            </TextLink>
          ) : null}
        </header>

        <Rule className="my-14" />

        {products.length ? (
          <ProductGrid products={products} />
        ) : (
          <EmptyState
            title="This collection is being prepared"
            body="Pieces will appear here as they are finished."
          />
        )}
      </Container>
    </>
  );
}
