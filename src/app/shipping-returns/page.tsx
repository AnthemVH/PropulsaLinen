import type { Metadata } from "next";

import { Container, Eyebrow, Prose, Rule } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Shipping & returns",
  description:
    "How Propulsa orders are made and dispatched. Made-to-order lead times, delivery, duties, the cancellation window, and what happens if a piece arrives faulty.",
  alternates: { canonical: "/shipping-returns" },
};

const SECTIONS = [
  {
    title: "Lead times",
    body: [
      "Every piece is printed and finished after you order it. Most leave the workshop within one to two working days. Weekends and public holidays are not counted.",
      "If an order contains pieces from more than one collection, it ships complete rather than in parts, unless you ask otherwise.",
    ],
  },
  {
    title: "Delivery",
    body: [
      "Tracked, wherever it is going. Most orders arrive three to five days after dispatch; remote addresses can take a few days longer.",
      "Shipping is calculated at checkout. It varies by destination and by the piece, so the amount is shown in full before you pay — there is no flat rate to quote here and no threshold that makes it free.",
      "We do not currently ship to the United Kingdom.",
    ],
  },
  {
    title: "Duties and taxes",
    body: [
      "Import duty and local tax are not collected at checkout. Where a shipment attracts them, they are charged on delivery and are payable by the recipient.",
      "What you pay us is the price shown plus shipping. Any charge beyond that is levied by the destination country and collected by the carrier, and the amount is set by that country rather than by us.",
      "Whether anything is due depends on where the order is going and what it is worth. Many shipments attract nothing at all.",
    ],
  },
  {
    title: "Changing your mind",
    body: [
      "There is a thirty minute window after ordering in which a piece can be cancelled in full. Write to the atelier and we will refund you.",
      "After that the piece is in production. Because nothing is made until it is bought, there is no stock for it to return to and no second customer waiting for it, so we cannot take it back simply because it is not wanted. Please order at the size and colourway you mean.",
    ],
  },
  {
    title: "If something is wrong",
    body: [
      "A piece that arrives damaged, faulty or not what you ordered is our error and we will put it right. Write to us within fourteen days of delivery with a photograph and we will replace it or refund you in full.",
      "That covers a fault in the weave, the print or the finish, damage in transit, and anything sent in the wrong size or colourway.",
      "Nothing here affects the rights you have by law.",
    ],
  },
];

export default function ShippingReturnsPage() {
  return (
    <Container className="pt-16 pb-section md:pt-24">
      <header>
        <Eyebrow>Practicalities</Eyebrow>
        <h1 className="mt-5 text-display-lg">Shipping & returns</h1>
      </header>

      <Rule className="my-12" />

      <div className="space-y-14">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="font-display text-display-sm">{section.title}</h2>
            <Prose className="mt-5">
              {section.body.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </Prose>
          </section>
        ))}
      </div>
    </Container>
  );
}
