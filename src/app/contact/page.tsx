import type { Metadata } from "next";

import { Container, Eyebrow, Rule } from "@/components/ui/primitives";
import { SITE } from "@/lib/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Write to the Propulsa atelier about an order, a return, a trade enquiry or a production question.",
  alternates: { canonical: "/contact" },
};

const ENQUIRIES = [
  {
    title: "Orders and returns",
    body: "Quote your order reference and we will answer within one working day.",
    address: SITE.contactEmail,
  },
  {
    title: "Trade and hospitality",
    body: "Larger quantities, bespoke sizing and property specification.",
    address: "trade@propulsa.com",
  },
  {
    title: "Press",
    body: "Imagery, samples and collection notes for editorial use.",
    address: "press@propulsa.com",
  },
];

export default function ContactPage() {
  return (
    <Container className="pt-16 pb-section md:pt-24">
      <header className="max-w-2xl">
        <Eyebrow>The atelier</Eyebrow>
        <h1 className="mt-5 text-display-lg">Contact</h1>
        <p className="mt-6 text-lede text-pretty text-espresso-soft">
          We answer letters ourselves. There is no chat widget and no ticket
          number.
        </p>
      </header>

      <Rule className="my-12" />

      <dl className="divide-y divide-stone/60 border-y hairline">
        {ENQUIRIES.map((enquiry) => (
          <div
            key={enquiry.title}
            className="grid gap-4 py-9 md:grid-cols-[1fr_1.4fr] md:gap-12"
          >
            <dt className="font-display text-display-sm">{enquiry.title}</dt>
            <dd>
              <p className="text-espresso-soft">{enquiry.body}</p>
              <a
                href={`mailto:${enquiry.address}`}
                className="eyebrow link-underline mt-4 inline-block text-gold"
              >
                {enquiry.address}
              </a>
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-12 max-w-xl text-espresso-muted">
        Correspondence is read Monday to Friday. Anything sent over a weekend is
        answered on the Monday.
      </p>
    </Container>
  );
}
