import type { Metadata } from "next";

import { Monogram } from "@/components/brand/logo";
import { MotifArt } from "@/components/brand/motif-art";
import {
  ButtonLink,
  Container,
  Eyebrow,
  Rule,
  SectionHeading,
} from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "The house",
  description:
    "Propulsa makes heritage goods for houses that keep their things. An engraved botanical, three permitted forms, made to order.",
  alternates: { canonical: "/about" },
  openGraph: {
    type: "article",
    title: "The house — Propulsa",
    description:
      "An engraved botanical, three permitted forms, made to order.",
  },
};

const PRINCIPLES = [
  {
    title: "One botanical, one collection",
    body: "A collection is drawn from a single species — Botanica Nocturne is olive, and only olive. We do not blend families, and we do not draw motifs from nothing.",
  },
  {
    title: "Three forms, never more",
    body: "Every piece is built from one of three forms taken from the same engraved plate: the dense field, a single-sprig emblem, or the hairline border. Nothing is reinterpreted per product.",
  },
  {
    title: "Made to order",
    body: "Nothing is warehoused. Each piece is printed and finished after it is bought, which is slower and better, and means no season ends in a sale.",
  },
  {
    title: "Built for use",
    body: "A piece too good to use is a failed piece. These are made for a working kitchen — the tray gets carried, the tea towel goes in the wash.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Container width="wide" className="pt-16 md:pt-24">
        <header className="mx-auto max-w-3xl text-center">
          <Monogram size={64} className="mx-auto" />
          <Eyebrow className="mt-6">The house</Eyebrow>
          <h1 className="mt-5 text-display-lg text-balance">
            A house is made of the things it keeps
          </h1>
          <p className="mt-8 text-lede text-pretty text-espresso-soft">
            Propulsa began with an observation: the objects a house uses most
            are the ones it thinks about least. We started in the kitchen and
            intend to work outward from there, slowly.
          </p>
        </header>

        {/* The house's own plate, not a photograph of an atelier we have not
            photographed yet. */}
        <div className="relative mt-16 aspect-[16/8] overflow-hidden bg-espresso md:mt-24">
          <MotifArt
            form="dense-field"
            colorway="signature"
            alt=""
            loading="eager"
          />
        </div>
      </Container>

      <Container className="py-section">
        <div className="mx-auto max-w-2xl space-y-7 text-espresso-soft">
          <p className="text-lede text-pretty">
            The name comes from the idea of forward motion held in check — the
            push of a thing that has somewhere to be, and the discipline to
            arrive slowly.
          </p>
          <p>
            We work from the engraved botanical plate — the working document a
            nineteenth-century naturalist made to identify a species precisely,
            at a time when getting it wrong had consequences. What we take from
            it is the discipline, not the decoration.
          </p>
          <p>
            The first collection is olive, drawn as one continuous plate: leaf
            undersides, node joins and fruit set all rendered at the same line
            weight. Gold appears once, as an accent — a single leaf, a vein, or
            the hairline that frames the plate. A gilded field would make it
            ornament, and this is meant to read as a record.
          </p>
          <p>
            The catalogue will grow, but a collection will always be a motif
            first and a product second. That is the order the house works in,
            and it is why the same plate can carry a mug and a serving tray
            without either looking borrowed from the other.
          </p>
        </div>
      </Container>

      <Container width="wide" className="pb-section">
        <Rule />
        <div className="py-16 md:py-24">
          <SectionHeading eyebrow="How we work" title="Four principles" />
          <ul className="mt-14 grid gap-x-12 gap-y-14 md:grid-cols-2">
            {PRINCIPLES.map((principle, index) => (
              <li key={principle.title}>
                <Eyebrow>{String(index + 1).padStart(2, "0")}</Eyebrow>
                <h3 className="mt-4 font-display text-display-sm">
                  {principle.title}
                </h3>
                <p className="mt-4 max-w-md text-espresso-soft">
                  {principle.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <Rule />

        <div className="flex flex-col items-center gap-8 py-16 text-center md:py-24">
          <p className="max-w-xl font-display text-display-md text-balance">
            Begin where we began.
          </p>
          <ButtonLink href="/designs/botanica-nocturne">
            Botanica Nocturne
          </ButtonLink>
        </div>
      </Container>
    </>
  );
}
