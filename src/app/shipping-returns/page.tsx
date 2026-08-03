import type { Metadata } from "next";

import { Container, Eyebrow, Prose, Rule } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Shipping & returns",
  description:
    "How Propulsa orders are made, dispatched and returned. Made-to-order lead times, delivery, duties and the returns window.",
  alternates: { canonical: "/shipping-returns" },
};

const SECTIONS = [
  {
    title: "Lead times",
    body: [
      "Every piece is printed and finished after you order it. Allow 7–10 working days for production before dispatch.",
      "If an order contains pieces from more than one collection, it ships complete rather than in parts, unless you ask otherwise.",
    ],
  },
  {
    title: "Delivery",
    body: [
      "United Kingdom — tracked, 2–3 working days from dispatch. Complimentary on orders over £150.",
      "European Union — tracked, 3–6 working days from dispatch.",
      "Rest of world — tracked, 5–10 working days from dispatch.",
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
    title: "Returns",
    body: [
      "Unused pieces may be returned within 30 days of delivery for a full refund. Linen must be unwashed and hard goods unmarked, with the house tag intact.",
      "Write to the atelier before sending anything back and we will issue a return reference.",
      "Because every piece is made to order, we cannot accept returns on items that have been laundered.",
    ],
  },
  {
    title: "If something is wrong",
    body: [
      "A fault in the weave, the print or the finish is our error, whenever you find it. Write to us with a photograph and we will replace the piece.",
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
