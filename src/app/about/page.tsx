import type { Metadata } from "next";
import type { CSSProperties } from "react";

import { Monogram } from "@/components/brand/logo";
import { MotifArt } from "@/components/brand/motif-art";
import { Plate } from "@/components/brand/plate";
import { ButtonLink, Container, Ornament, SectionHeading } from "@/components/ui/primitives";
import { DESIGN_NAV } from "@/lib/content/site";
import { toRoman } from "@/lib/utils";

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

const d = (ms: number) => ({ "--d": ms }) as CSSProperties;

export default function AboutPage() {
  const collection = DESIGN_NAV[0];

  return (
    <>
      <Container width="wide">
        <header className="mx-auto max-w-4xl pt-14 pb-14 text-center md:pt-24 md:pb-20">
          <Monogram size={72} className="intro-fade mx-auto" />
          <p className="eyebrow intro-fade mt-8 text-espresso-muted" style={d(150)}>
            The house
          </p>
          <h1 className="intro-rise mt-6 text-display-lg text-balance text-espresso" style={d(200)}>
            A house is made of the things it <em className="text-espresso-soft">keeps</em>
          </h1>
          <p className="intro-rise mx-auto mt-8 max-w-2xl text-lede text-pretty text-espresso-soft" style={d(350)}>
            Propulsa began with an observation: the objects a house uses most are the ones it thinks
            about least. We started in the kitchen and intend to work outward from there, slowly.
          </p>
        </header>
      </Container>

      {/* The house's own plate, not a photograph of an atelier we have not
          photographed yet. It drifts a little as the page scrolls past. */}
      <div className="relative h-[60svh] min-h-80 overflow-hidden bg-espresso md:h-[78svh]">
        <div className="intro-unveil absolute inset-0" style={d(300)}>
          <div className="scroll-drift absolute inset-0">
            <MotifArt form="dense-field" colorway="signature" alt="" loading="eager" className="object-contain" />
          </div>
        </div>
        <p className="running-head absolute right-[var(--gutter)] bottom-5 text-ivory/65">
          <span className="numeral mr-2 text-sm normal-case tracking-normal text-gold-light">Pl. I</span>
          Olive, engraved
        </p>
      </div>

      <Container width="text" className="py-section">
        <div className="space-y-7 text-espresso-soft">
          <p
            data-reveal
            className="text-lede text-pretty text-espresso first-letter:float-left first-letter:mt-1 first-letter:mr-3 first-letter:font-display first-letter:text-[4.6em] first-letter:leading-[0.8] first-letter:text-gold-ink"
          >
            The name comes from the idea of forward motion held in check — the push of a thing
            that has somewhere to be, and the discipline to arrive slowly.
          </p>
          <p data-reveal className="text-pretty">
            We work from the engraved botanical plate — the working document a nineteenth-century
            naturalist made to identify a species precisely, at a time when getting it wrong had
            consequences. What we take from it is the discipline, not the decoration.
          </p>
        </div>

        <blockquote data-reveal className="my-16 border-y hairline py-12 text-center md:my-20">
          <p className="font-display text-display-md text-balance text-espresso">
            A gilded field would make it ornament. This is meant to read as a{" "}
            <em className="text-gold-ink">record</em>.
          </p>
        </blockquote>

        <div className="space-y-7 text-espresso-soft">
          <p data-reveal className="text-pretty">
            The first collection is olive, drawn as one continuous plate: leaf undersides, node
            joins and fruit set all rendered at the same line weight. Gold appears once, as an
            accent — a single leaf, a vein, or the hairline that frames the plate.
          </p>
          <p data-reveal className="text-pretty">
            The catalogue will grow, but a collection will always be a motif first and a product
            second. That is the order the house works in, and it is why the same plate can carry a
            mug and a serving tray without either looking borrowed from the other.
          </p>
        </div>
      </Container>

      <section className="bg-espresso py-section text-ivory-light">
        <Container width="wide">
          <SectionHeading numeral="I" tone="dark" eyebrow="How we work" title="Four principles" />
          <ol className="mt-14 grid gap-px bg-gold-light/20 md:mt-20 md:grid-cols-2">
            {PRINCIPLES.map((principle, index) => (
              <li
                key={principle.title}
                data-reveal
                style={d((index % 2) * 120)}
                className="bg-espresso py-10 md:p-12 lg:p-16"
              >
                <span className="numeral text-5xl leading-none text-gold-light">{toRoman(index + 1)}</span>
                <h3 className="mt-6 font-display text-display-sm text-ivory-light">{principle.title}</h3>
                <p className="mt-4 max-w-md text-pretty text-ivory/75">{principle.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <Container width="wide" className="pt-section">
        <div className="grid items-center gap-12 md:grid-cols-12">
          <Plate
            form="single-sprig"
            colorway="inverse"
            alt=""
            className="mx-auto w-48 md:col-span-3 md:col-start-3 md:w-full"
            frameClassName="aspect-[10/13]"
            artClassName="object-contain"
            marks
            reveal
          />
          <div className="text-center md:col-span-5 md:col-start-7 md:text-left">
            <Ornament className="mb-8 md:justify-start" />
            <p data-reveal className="font-display text-display-md text-balance text-espresso">
              Begin where we began.
            </p>
            {collection ? (
              <ButtonLink href={collection.href} className="mt-10">
                {collection.label}
              </ButtonLink>
            ) : null}
          </div>
        </div>
      </Container>
    </>
  );
}
