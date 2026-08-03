import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/product/product-card";
import { ProductViewer } from "@/components/product/product-viewer";
import {
  Container,
  Eyebrow,
  Rule,
  SectionHeading,
  TextLink,
} from "@/components/ui/primitives";
import { productsByDesign, resolveDesign } from "@/lib/catalog";
import { SITE } from "@/lib/content/site";
import { getProduct, getProductHandles } from "@/lib/shopify";
import { safeGetProduct, safeGetProducts } from "@/lib/shopify/safe";
import { formatPrice, isFetchableImage, isSizeOption } from "@/lib/utils";

type Params = { handle: string };

export async function generateStaticParams(): Promise<Params[]> {
  // A catalogue outage — or a deployment whose Shopify credentials are not set
  // yet — must not fail the build. Pages then render on demand instead of
  // being prerendered.
  try {
    const handles = await getProductHandles();
    return handles.map((handle) => ({ handle }));
  } catch (error) {
    console.error("[build] could not prerender product pages", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { handle } = await params;
  const product = await safeGetProduct(handle);
  if (!product) return {};

  const title = product.seo.title ?? product.title;
  const description = product.seo.description ?? product.description;
  const image = product.featuredImage;

  return {
    // A merchandiser-authored SEO title is already complete; only a fallback
    // to the product name should pick up the "— Propulsa" template.
    title: product.seo.title ? { absolute: product.seo.title } : title,
    description,
    alternates: { canonical: `/products/${product.handle}` },
    openGraph: {
      type: "website",
      title: `${title} — ${SITE.name}`,
      description,
      url: `${SITE.url}/products/${product.handle}`,
      // Only advertise imagery a scraper can actually fetch.
      images:
        isFetchableImage(image)
          ? [
              {
                url: image.url,
                width: image.width,
                height: image.height,
                alt: image.altText,
              },
            ]
          : undefined,
    },
  };
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { handle } = await params;
  const [product, query] = await Promise.all([
    safeGetProduct(handle),
    searchParams,
  ]);

  if (!product) notFound();

  const design = resolveDesign(product);
  const initialVariantId =
    typeof query.variant === "string" ? query.variant : undefined;

  // Material and care copy is a factual claim about a physical product, so it
  // comes from Shopify or it does not appear at all.
  const materialStory = product.materialStory;
  const careInstructions = product.careInstructions;

  const allProducts = await safeGetProducts({ sort: "featured" });
  const related = design
    ? productsByDesign(allProducts, design.handle).filter(
        (candidate) => candidate.id !== product.id,
      )
    : [];
  const alsoConsider = (related.length ? related : allProducts)
    .filter((candidate) => candidate.id !== product.id)
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    sku: product.variants[0]?.sku ?? undefined,
    // Always the house, never the print supplier that Shopify records as vendor.
    brand: { "@type": "Brand", name: SITE.name },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: product.priceRange.minVariantPrice.currencyCode,
      lowPrice: product.priceRange.minVariantPrice.amount,
      highPrice: product.priceRange.maxVariantPrice.amount,
      offerCount: product.variants.length,
      availability: product.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/PreOrder",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Product structured data — this brand leans on organic discovery.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Container width="wide" className="pt-10 pb-section md:pt-16">
        <nav aria-label="Breadcrumb" className="eyebrow text-espresso-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/shop" className="hover:text-gold">
                Shop
              </Link>
            </li>
            <li aria-hidden>/</li>
            {design ? (
              <>
                <li>
                  <Link
                    href={`/designs/${design.handle}`}
                    className="hover:text-gold"
                  >
                    {design.name}
                  </Link>
                </li>
                <li aria-hidden>/</li>
              </>
            ) : null}
            <li aria-current="page" className="text-espresso">
              {product.title}
            </li>
          </ol>
        </nav>

        <header className="mt-10 max-w-3xl">
          {design ? (
            <Eyebrow>
              Collection {design.reference} · {design.name}
            </Eyebrow>
          ) : null}
          <h1 className="mt-4 text-display-lg text-balance">{product.title}</h1>
        </header>

        <div className="mt-14">
          <ProductViewer product={product} initialVariantId={initialVariantId} />
        </div>
      </Container>

      {/* The lookbook half: story before specification. */}
      <Container width="wide" className="pb-section">
        <Rule />
        <div className="grid gap-14 py-16 lg:grid-cols-[1fr_1.4fr] lg:gap-24 lg:py-24">
          <div>
            <Eyebrow>The piece</Eyebrow>
            <h2 className="mt-5 text-display-md text-balance">
              {design?.tagline ?? "Made to be used"}
            </h2>
          </div>

          <div className="space-y-12">
            {product.description ? (
              <section>
                <p className="text-lede text-pretty text-espresso-soft">
                  {product.description}
                </p>
              </section>
            ) : null}

            {materialStory ? (
              <section>
                <h3 className="eyebrow text-espresso-muted">Material & craft</h3>
                <Rule className="my-5 max-w-24" />
                <p className="text-espresso-soft">{materialStory}</p>
              </section>
            ) : null}

            {careInstructions ? (
              <section>
                <h3 className="eyebrow text-espresso-muted">Care</h3>
                <Rule className="my-5 max-w-24" />
                <p className="text-espresso-soft">{careInstructions}</p>
              </section>
            ) : null}

            <section>
              <h3 className="eyebrow text-espresso-muted">Sizes & prices</h3>
              <Rule className="my-5 max-w-24" />
              <dl className="divide-y divide-stone/60">
                {sizeSummary(product).map((row) => (
                  <div
                    key={row.size}
                    className="flex items-baseline justify-between gap-6 py-3"
                  >
                    <dt className="text-espresso-soft">{row.size}</dt>
                    <dd className="tabular-nums text-espresso-muted">
                      {row.price}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            {design ? (
              <section>
                <h3 className="eyebrow text-espresso-muted">
                  On the {design.name} collection
                </h3>
                <Rule className="my-5 max-w-24" />
                <p className="text-espresso-soft">{design.introduction}</p>
                <TextLink
                  href={`/designs/${design.handle}`}
                  className="eyebrow mt-6 inline-block"
                >
                  See the whole collection
                </TextLink>
              </section>
            ) : null}
          </div>
        </div>
        <Rule />
      </Container>

      {alsoConsider.length ? (
        <Container width="wide" className="pb-section">
          <SectionHeading
            eyebrow="Alongside"
            title={design ? `More from ${design.name}` : "Also in the house"}
          />
          <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-12">
            {alsoConsider.map((candidate) => (
              <ProductCard key={candidate.id} product={candidate} />
            ))}
          </div>
        </Container>
      ) : null}
    </>
  );
}

/** One row per size, priced from the cheapest variant at that size. */
function sizeSummary(product: Awaited<ReturnType<typeof getProduct>>) {
  if (!product) return [];

  const sizeOption = product.options.find((option) =>
    isSizeOption(option.name),
  );
  if (!sizeOption) return [];

  return sizeOption.values.map((size) => {
    const variants = product.variants.filter((variant) =>
      variant.selectedOptions.some(
        (option) => isSizeOption(option.name) && option.value === size,
      ),
    );
    const cheapest = variants.reduce<(typeof variants)[number] | undefined>(
      (lowest, variant) =>
        !lowest || Number(variant.price.amount) < Number(lowest.price.amount)
          ? variant
          : lowest,
      undefined,
    );

    return {
      size,
      price: cheapest ? formatPrice(cheapest.price) : "—",
    };
  });
}
