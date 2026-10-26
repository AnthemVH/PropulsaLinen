import { Plate } from "@/components/brand/plate";
import { ButtonLink, Container } from "@/components/ui/primitives";

export default function NotFound() {
  return (
    <Container width="wide" className="py-section">
      <div className="grid items-center gap-12 md:grid-cols-12">
        <Plate
          form="single-sprig"
          colorway="inverse"
          alt=""
          className="mx-auto w-44 md:col-span-4 md:col-start-2 md:w-full"
          frameClassName="aspect-[10/13]"
          artClassName="object-contain"
          marks
          reveal="intro"
          caption={
            <>
              <span>Plate wanting</span>
              <span className="numeral text-sm normal-case tracking-normal text-gold-ink">N° 404</span>
            </>
          }
        />
        <div className="text-center md:col-span-6 md:col-start-7 md:text-left">
          <p className="eyebrow intro-fade text-espresso-muted">Error 404</p>
          <h1 className="intro-rise mt-6 text-display-lg text-balance text-espresso">
            This page is not in the house
          </h1>
          <p className="intro-rise mt-6 max-w-md text-lede text-pretty text-espresso-soft md:max-w-lg">
            The address may have changed, or the piece may have been withdrawn — the way a folio
            sometimes turns up with a plate missing.
          </p>
          <div className="intro-rise mt-10 flex flex-wrap justify-center gap-4 md:justify-start">
            <ButtonLink href="/shop" variant="solid">
              Shop everything
            </ButtonLink>
            <ButtonLink href="/designs">The collections</ButtonLink>
          </div>
        </div>
      </div>
    </Container>
  );
}
