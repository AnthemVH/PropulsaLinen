import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container, Eyebrow, Prose, Rule } from "@/components/ui/primitives";
import { SITE } from "@/lib/content/site";
import { safeGetShopPolicies } from "@/lib/shopify/safe";

// The same handles Shopify uses, so these URLs match the ones checkout links to.
const HANDLES = ["privacy-policy", "refund-policy", "shipping-policy", "terms-of-service"];

type Params = { handle: string };

export function generateStaticParams(): Params[] {
  return HANDLES.map((handle) => ({ handle }));
}

async function findPolicy(handle: string) {
  if (!HANDLES.includes(handle)) return undefined;
  const policies = await safeGetShopPolicies();
  return policies.find((policy) => policy.handle === handle);
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { handle } = await params;
  const policy = await findPolicy(handle);
  if (!policy) return {};

  return {
    title: policy.title,
    description: `${SITE.name}'s ${policy.title.toLowerCase()}.`,
    alternates: { canonical: `/policies/${handle}` },
  };
}

export default async function PolicyPage({ params }: { params: Promise<Params> }) {
  const { handle } = await params;
  const policy = await findPolicy(handle);
  if (!policy) notFound();

  return (
    <Container className="pt-12 pb-section md:pt-16">
      <header>
        <Eyebrow>Policies</Eyebrow>
        <h1 className="mt-4 text-display-lg">{policy.title}</h1>
      </header>

      <Rule className="my-10 md:my-12" />

      {/* Written by the store in Shopify admin, not by customers, so it is
          trusted HTML. The site's Content Security Policy still blocks any
          script from another origin. */}
      <Prose>
        <div dangerouslySetInnerHTML={{ __html: policy.body }} />
      </Prose>

      {handle === "privacy-policy" ? <OnThisWebsite /> : null}
    </Container>
  );
}

// Shopify's policy covers orders and checkout. This covers the storefront itself.
function OnThisWebsite() {
  const requestLink = `mailto:${SITE.contactEmail}?subject=${encodeURIComponent("Personal information request")}`;

  return (
    <section className="mt-16">
      <Rule className="mb-12" />
      <h2 className="text-display-sm">On this website</h2>
      <Prose className="mt-6">
        <p>
          This website sets one cookie of its own, <strong>propulsa_cart_id</strong>, which remembers
          what is in your cart. It is needed for the cart to work, holds no personal information, and
          expires after thirty days. We do not use analytics, advertising or tracking cookies.
        </p>
        <p>
          It also remembers the pieces you have recently looked at, in your own browser&apos;s storage.
          That list never leaves your device, and clearing your browser&apos;s site data removes it.
        </p>
        <p>
          Checkout takes place on Shopify&apos;s secure pages at checkout.propulsa.co.za, which set their
          own cookies to process your order and payment, as described above.
        </p>
        <h3>Your information</h3>
        <p>
          You can ask us what personal information we hold about you, and ask us to correct or delete
          it, by writing to <a href={requestLink}>{SITE.contactEmail}</a>. We will answer within thirty
          days. If you are not satisfied with how we handle your information, you can complain to the
          Information Regulator of South Africa at{" "}
          <a href="https://inforegulator.org.za" rel="noopener noreferrer">inforegulator.org.za</a>.
        </p>
      </Prose>
    </section>
  );
}
