import { Monogram } from "@/components/brand/logo";
import { ButtonLink, Container, Eyebrow } from "@/components/ui/primitives";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-section text-center">
      <Monogram size={64} />
      <Eyebrow className="mt-6">Error 404</Eyebrow>
      <h1 className="mt-5 text-display-md text-balance">
        This page is not in the house
      </h1>
      <p className="mt-6 max-w-md text-espresso-soft">
        The address may have changed, or the piece may have been withdrawn.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-6">
        <ButtonLink href="/shop">Shop everything</ButtonLink>
        <ButtonLink href="/designs">The collections</ButtonLink>
      </div>
    </Container>
  );
}
