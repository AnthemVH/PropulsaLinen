import type { Metadata } from "next";

import { Container, Eyebrow, Rule } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Frequently asked",
  description:
    "Questions about Propulsa materials, sizing, care, made-to-order production and the wider catalogue.",
  alternates: { canonical: "/faq" },
};

const FAQS = [
  {
    question: "What is the motif?",
    answer:
      "A single olive branch, drawn as a nineteenth-century naturalist would have engraved it for a botanical plate. One family only — there is no second species in this collection.",
  },
  {
    question: "Why does the same design look different on each piece?",
    answer:
      "It does not, strictly. Every piece is built from one of three forms taken from the same plate: the dense field, a single-sprig emblem cropped straight out of it, or the hairline border that frames it. Nothing is redrawn for an individual product.",
  },
  {
    question: "How is the gold used?",
    answer:
      "Only ever as an accent — a single leaf, a vein within the linework, or the hairline itself. It is never a fill and never a background. That restraint is what keeps the collection reading as a record rather than as ornament.",
  },
  {
    question: "Which pieces can go in a dishwasher?",
    answer:
      "The mug only. Placemats, coasters, the tray and the chopping board should be wiped with a damp cloth and never immersed — the backings will lift. The tin should be kept dry entirely. Care notes are on each product page.",
  },
  {
    question: "Why is the chopping board's cutting face plain?",
    answer:
      "No artwork should sit under a knife. The board carries the hairline on its printed backer and edge, so it reads when stood up on the counter and survives being used properly.",
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
    <Container className="pt-16 pb-section md:pt-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header>
        <Eyebrow>Questions</Eyebrow>
        <h1 className="mt-5 text-display-lg">Frequently asked</h1>
      </header>

      <Rule className="my-12" />

      <dl className="divide-y divide-stone/60 border-y hairline">
        {FAQS.map((faq) => (
          <div key={faq.question} className="grid gap-4 py-9 md:grid-cols-[1fr_1.4fr] md:gap-12">
            <dt className="font-display text-display-sm text-balance">
              {faq.question}
            </dt>
            <dd className="text-pretty text-espresso-soft">{faq.answer}</dd>
          </div>
        ))}
      </dl>
    </Container>
  );
}
