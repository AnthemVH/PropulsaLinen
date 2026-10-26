import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/ui/json-ld";
import { notFound } from "next/navigation";

import { GroupGrid } from "@/components/product/product-grid";
import { ProductViewer, type ColourwayLink } from "@/components/product/product-viewer";
import { RecentlyViewed } from "@/components/product/recently-viewed";
import { Plate } from "@/components/brand/plate";
import { ButtonLink, Container, SectionHeading } from "@/components/ui/primitives";
import { findGroupFor, groupProducts, resolveDesign } from "@/lib/catalog";
import { colourwayFromTitle, roomForType, typeName } from "@/lib/rooms";
import { getBlueprint, getMotifForm } from "@/lib/content/designs";
import { DUTIES_NOTE, SITE } from "@/lib/content/site";
import { getProduct, getProductHandles } from "@/lib/shopify";
import { safeGetProduct, safeGetProducts } from "@/lib/shopify/safe";
import { cn, formatPrice, isFetchableImage, isSizeOption } from "@/lib/utils";

type Params = { handle: string };

// Every page here reads the cart cookie through the root layout, so it is
// rendered per request in any case. Saying so explicitly matters when the
// build runs without Shopify credentials: generateStaticParams then returns
// nothing, the route stays "static", and the first visit failed with a 500
// ("static to dynamic at runtime") instead of rendering or returning 404.
export const dynamic = "force-dynamic";

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
  const room = roomForType(product.productType);
  const colourway = colourwayFromTitle(product.title);

  // The other colourways of this piece, each its own Shopify product.
  const group = findGroupFor(product, allProducts);
  const colourways: ColourwayLink[] = (group?.items ?? [])
    .filter((item) => item.colourway)
    .map((item) => ({
      name: item.colourway!.name,
      hex: item.colourway!.hex,
      handle: item.product.handle,
      current: item.product.handle === product.handle,
    }));

  // Complete the set: other kinds of piece in the same colourway, same room
  // first. A piece with no colourway falls back to its room.
  const matchesSet = (candidate: (typeof allProducts)[number]) =>
    candidate.productType !== product.productType &&
    (colourway
      ? colourwayFromTitle(candidate.title)?.name === colourway.name
      : roomForType(candidate.productType).slug === room.slug);
  const setCandidates = allProducts.filter(matchesSet);
  const completeTheSet = groupProducts([
    ...setCandidates.filter((candidate) => roomForType(candidate.productType).slug === room.slug),
    ...setCandidates.filter((candidate) => roomForType(candidate.productType).slug !== room.slug),
  ]).slice(0, 4);

  const minPrice = formatPrice(product.priceRange.minVariantPrice);
  const hasRange =
    product.priceRange.minVariantPrice.amount !== product.priceRange.maxVariantPrice.amount;
  const viewed = {
    handle: product.handle,
    title: product.title,
    type: typeName(product.productType),
    price: hasRange ? `From ${minPrice}` : minPrice,
    image: product.featuredImage,
  };

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

  // Which of the three forms this piece carries, where the house has said so.
  // Unlabelled pieces carry no claim.
  const blueprint = getBlueprint(product.handle);
  const forms = (blueprint?.motifs ?? [])
    .map((motif) => ({ motif, form: getMotifForm(motif.form) }))
    .filter((entry) => entry.form);
  const sizes = sizeSummary(product);

  const heading = (
    <header>
      {design ? (
        <p className="eyebrow flex items-center gap-3 text-gold-ink">
          <span className="numeral text-base normal-case tracking-normal">{design.reference}</span>
          <span aria-hidden className="h-px w-6 bg-gold/50" />
          <Link href={`/designs/${design.handle}`} className="link-underline">
            {design.name}
          </Link>
        </p>
      ) : null}
      {/* Supplier-length titles step down a size rather than fill the panel. */}
      <h1
        className={cn(
          "mt-4 font-display text-balance text-espresso [overflow-wrap:anywhere]",
          product.title.length > 60 ? "text-display-sm" : "text-display-md",
        )}
      >
        {product.title}
      </h1>
      <p className="eyebrow mt-3 text-espresso-muted">{typeName(product.productType)}</p>
    </header>
  );

  const notes = (
    <div className="mt-10 border-t hairline">
      {product.description ? (
        <Note title="The piece" open>
          <p className="text-pretty [overflow-wrap:anywhere]">{product.description}</p>
        </Note>
      ) : null}
      {sizes.length ? (
        <Note title="Sizes & prices">
          <dl className="divide-y divide-stone">
            {sizes.map((row) => (
              <div key={row.size} className="flex items-baseline justify-between gap-6 py-2.5">
                <dt className="min-w-0 [overflow-wrap:anywhere]">{row.size}</dt>
                <dd className="shrink-0 text-espresso tabular-nums">{row.price}</dd>
              </div>
            ))}
          </dl>
        </Note>
      ) : null}
      {materialStory ? (
        <Note title="Material & craft">
          <p className="text-pretty">{materialStory}</p>
        </Note>
      ) : null}
      {careInstructions ? (
        <Note title="Care">
          <p className="text-pretty">{careInstructions}</p>
        </Note>
      ) : null}
      <Note title="Making & delivery">
        <p className="text-pretty">
          Made and finished by hand after you order, usually within one to two working days, then
          sent tracked. {DUTIES_NOTE.short}
        </p>
        <Link href="/shipping-returns" className="eyebrow link-ruled mt-4 inline-block text-espresso">
          Shipping &amp; returns
        </Link>
      </Note>
    </div>
  );

  return (
    <>
      <JsonLd data={jsonLd} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Shop", item: `${SITE.url}/shop` },
            { "@type": "ListItem", position: 2, name: room.name, item: `${SITE.url}/rooms/${room.slug}` },
            { "@type": "ListItem", position: 3, name: product.title, item: `${SITE.url}/products/${product.handle}` },
          ],
        }}
      />

      <Container width="wide" className="pt-6 md:pt-10">
        <nav aria-label="Breadcrumb" className="mb-6 md:mb-10">
          <ol className="flex flex-wrap items-center gap-3 text-sm text-espresso-muted">
            <li>
              <Link href="/shop" className="hover:text-gold-ink">
                Shop
              </Link>
            </li>
            <li aria-hidden className="h-px w-5 bg-gold/50" />
            <li>
              <Link href={`/rooms/${room.slug}`} className="hover:text-gold-ink">
                {room.name}
              </Link>
            </li>
            <li aria-hidden className="h-px w-5 bg-gold/50" />
            <li aria-current="page" className="max-w-[20ch] truncate text-espresso sm:max-w-none">
              {product.title}
            </li>
          </ol>
        </nav>

        <ProductViewer
          product={product}
          initialVariantId={initialVariantId}
          colourways={colourways}
          heading={heading}
          notes={notes}
        />
      </Container>

      {/* The plate this piece is printed from — a night chapter. */}
      {design ? (
        <section className="relative mt-section overflow-hidden bg-espresso py-section text-ivory-light">
          <Container width="wide">
            <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-5">
                <Plate
                  form={forms[0]?.form?.slug ?? "dense-field"}
                  colorway="signature"
                  alt=""
                  frameClassName="aspect-square"
                  artClassName="object-contain"
                  reveal
                />
              </div>
              <div className="lg:col-span-6 lg:col-start-7">
                <SectionHeading tone="dark" title={design.name} lede={design.introduction} />
                {forms.length ? (
                  <dl data-reveal className="mt-10 border-t border-gold-light/25">
                    {forms.map(({ motif, form }) => (
                      <div
                        key={`${motif.form}-${motif.placement}`}
                        className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-gold-light/25 py-4"
                      >
                        <dt className="font-display text-xl text-ivory-light">{form!.name}</dt>
                        <dd className="eyebrow text-ivory/70">{motif.placement}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
                <ButtonLink href={`/designs/${design.handle}`} variant="light" className="mt-10">
                  The whole collection
                </ButtonLink>
              </div>
            </div>
          </Container>
        </section>
      ) : null}

      {completeTheSet.length ? (
        <Container width="wide" className="pt-section">
          <SectionHeading
            title={colourway ? `Complete the set in ${colourway.name}` : `More from ${room.name}`}
          />
          <GroupGrid groups={completeTheSet} className="mt-12 md:mt-16" />
        </Container>
      ) : null}

      <Container width="wide">
        <RecentlyViewed current={viewed} />
      </Container>
    </>
  );
}

/** A folded note under the purchase panel. Native <details>: no script needed. */
function Note({ title, open = false, children }: { title: string; open?: boolean; children: React.ReactNode }) {
  return (
    <details open={open} className="group/note border-b hairline">
      <summary className="press flex min-h-14 items-center justify-between gap-4 py-4 font-display text-xl text-espresso transition-colors hover:text-gold-ink">
        {title}
        <span aria-hidden className="relative block size-3 shrink-0 text-gold-ink">
          <span className="absolute inset-x-0 top-1/2 h-px bg-current" />
          <span className="absolute inset-y-0 left-1/2 w-px bg-current transition-transform duration-300 ease-out group-open/note:scale-y-0" />
        </span>
      </summary>
      <div className="pb-6 text-espresso-soft">{children}</div>
    </details>
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
