import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/ui/json-ld";

import { Container, PageHeader } from "@/components/ui/primitives";
import { SITE } from "@/lib/content/site";

export const metadata: Metadata = {
  title: "Frequently asked",
  description:
    "Delivery times, shipping costs, import duty, cancellations and faults, sizing and materials — the practical questions about ordering from Propulsa.",
  alternates: { canonical: "/faq" },
};

/**
 * The questions a shopper actually arrives with, then the ones about the house.
 *
 * Ordering is first because that is what someone mid-purchase is looking for;
 * the collection answers itself on the pages that carry the work. Nothing here
 * describes a piece the store does not sell, and nothing states a material or
 * care fact the catalogue cannot back — sizes and fabrics below are the options
 * Shopify actually offers.
 */
const FAQS: {
  question: string;
  answer: string;
  link?: { href: string; label: string };
}[] = [
  {
    question: "How long will my order take?",
    answer:
      "Every piece is printed and finished after you order it, which usually takes one to two working days. Delivery is tracked, and most orders arrive three to five days after they are dispatched.",
    link: { href: "/shipping-returns", label: "Shipping & returns" },
  },
  {
    question: "What does shipping cost?",
    answer:
      "It depends on where the order is going and which pieces are in it, so the exact amount is shown at checkout before you pay. There is no flat rate, and no order value that makes it free.",
  },
  {
    question: "Where do you ship?",
    answer:
      "South Africa, Namibia, the United States, Canada, the European Union, the Middle East, Australia, New Zealand and Japan, among others. We do not currently ship to the United Kingdom.",
  },
  {
    question: "Will I be charged customs or import duty?",
    answer:
      "You might be, depending on where you are. Import duty and local tax are not collected at checkout — where a country charges them, the carrier collects them on delivery. Many shipments attract nothing at all.",
    link: { href: "/shipping-returns", label: "Duties and taxes" },
  },
  {
    question: "Why are prices in dollars?",
    answer:
      "The house prices in US dollars everywhere, so a piece costs the same whoever is buying it. Your bank converts at its own rate on the day.",
  },
  {
    question: "Can I cancel an order?",
    answer:
      "Within thirty minutes of placing it, yes, in full — write to the atelier and we will refund you. After that the piece is already in production and cannot be cancelled.",
  },
  {
    question: "Can I return a piece I have changed my mind about?",
    answer:
      "No. Nothing is made until it is bought, so a returned piece has no stock to go back to. If a piece arrives damaged, faulty or not what you ordered, that is a different matter: write to us within fourteen days of delivery with a photograph and we will replace it or refund you in full.",
    link: { href: "/shipping-returns", label: "The full policy" },
  },
  {
    question: "Which apron size should I choose?",
    answer:
      "Medium is 32 inches long and 26 wide, and Large is 36 by 26. There is also a Kids size at 20 by 16. The measurement is of the apron itself rather than of the wearer.",
  },
  {
    question: "What are the pieces made from?",
    answer:
      "The tea towel comes in a cotton-linen blend or a 100% cotton panama. The apron and the oven glove come in a 300 gsm cotton panama or a 250 gsm polyester suede. You choose the fabric on the product page, and the price follows it.",
  },
  {
    question: "Why is there no sale?",
    answer:
      "Everything is made to order, so there is no surplus stock to clear. We price a piece once and leave it there.",
  },
  {
    question: "Can I order a custom or personalised piece?",
    answer:
      "Not yet. Personalisation is being developed and will open as its own service rather than as an option at checkout.",
  },
  {
    question: "What is the motif?",
    answer:
      "A single olive branch, drawn as a nineteenth-century naturalist would have engraved it for a botanical plate. One family only — there is no second species in this collection. Gold appears only as an accent within it: a leaf, a vein, or the hairline that frames the plate, never a fill and never a ground.",
  },
  {
    question: "Will there be a second collection?",
    answer:
      "Yes. A second botanical is drawn and held back deliberately — a collection is released whole or not at all.",
  },
];

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <Container width="wide" className="pb-section">
      <JsonLd data={jsonLd} />

      <PageHeader
        title="Frequently asked"
        lede="Ordering first, because that is what most letters are about; then the house and its collection."
      />

      <div className="max-w-[52rem]">
          <div className="border-t hairline">
            {FAQS.map((faq, index) => (
              <details key={faq.question} className="group/faq border-b hairline" open={index === 0}>
                <summary className="press flex min-h-16 items-baseline justify-between gap-6 py-6">
                  <span className="flex-1 font-display text-xl text-pretty text-espresso transition-colors group-hover/faq:text-gold-ink md:text-display-sm">
                    {faq.question}
                  </span>
                  <span aria-hidden className="relative mt-2 block size-3 shrink-0 self-start text-gold-ink md:mt-3">
                    <span className="absolute inset-x-0 top-1/2 h-px bg-current" />
                    <span className="absolute inset-y-0 left-1/2 w-px bg-current transition-transform duration-300 ease-out group-open/faq:scale-y-0" />
                  </span>
                </summary>
                <div className="pb-8">
                  <p className="max-w-[32rem] text-pretty text-espresso-soft">
                    {faq.answer}
                    {faq.link ? (
                      <>
                        {" "}
                        <Link href={faq.link.href} className="text-espresso underline decoration-gold/50 underline-offset-4 hover:text-gold-ink">
                          {faq.link.label}
                        </Link>
                      </>
                    ) : null}
                  </p>
                </div>
              </details>
            ))}
          </div>
        <aside className="mt-16 border-t hairline pt-10 md:mt-20">
            <p className="font-display text-display-sm text-espresso">Not answered here?</p>
            <p className="mt-3 max-w-sm text-espresso-soft">
              Write to the atelier. Letters are read and answered by a person, Monday to Friday.
            </p>
            <a
              href={`mailto:${SITE.contactEmail}`}
              className="eyebrow link-ruled mt-6 inline-block py-1 text-espresso"
            >
              {SITE.contactEmail}
            </a>
        </aside>
      </div>
    </Container>
  );
}
