import type { Metadata } from "next";

import { Plate } from "@/components/brand/plate";
import { Container, PageHeader } from "@/components/ui/primitives";
import { SITE } from "@/lib/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Write to the Propulsa atelier about an order, a return, a trade enquiry or a production question.",
  alternates: { canonical: "/contact" },
};

// One inbox for everything; the subject line tells us which kind of letter it is.
const ENQUIRIES = [
  {
    title: "Orders and returns",
    body: "Quote your order reference and we will answer within one working day.",
    subject: "Order enquiry",
  },
  {
    title: "Trade and hospitality",
    body: "Larger quantities, bespoke sizing and property specification.",
    subject: "Trade enquiry",
  },
  {
    title: "Press",
    body: "Imagery, samples and collection notes for editorial use.",
    subject: "Press enquiry",
  },
];

export default function ContactPage() {
  return (
    <Container width="wide" className="pb-section">
      <PageHeader
        title="Contact"
        lede="We answer letters ourselves. There is no chat widget and no ticket number."
      />

      <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
        <ol className="border-t hairline lg:col-span-7">
          {ENQUIRIES.map((enquiry) => (
            <li key={enquiry.title} data-reveal className="border-b hairline">
              <a
                href={`mailto:${SITE.contactEmail}?subject=${encodeURIComponent(enquiry.subject)}`}
                className="group grid gap-x-6 gap-y-2 py-8 sm:grid-cols-[1fr_auto] sm:items-baseline md:py-10"
              >
                <span>
                  <span className="block font-display text-display-sm text-espresso transition-colors group-hover:text-gold-ink">
                    {enquiry.title}
                  </span>
                  <span className="mt-2 block max-w-md text-espresso-soft">{enquiry.body}</span>
                </span>
                <span className="eyebrow mt-3 inline-flex items-center gap-3 text-espresso sm:mt-0">
                  Write
                  <span aria-hidden className="h-px w-5 origin-left bg-current transition-transform duration-500 ease-out group-hover:scale-x-[1.8]" />
                </span>
              </a>
            </li>
          ))}
        </ol>

        <aside className="lg:col-span-4 lg:col-start-9">
          <Plate
            form="single-sprig"
            colorway="warm-stone"
            alt=""
            className="hidden lg:block"
            frameClassName="aspect-[4/3]"
            artClassName="object-contain"
            marks
          />
          <dl className="grid gap-x-8 gap-y-5 text-espresso-soft lg:mt-12">
            <div>
              <dt className="eyebrow text-espresso-muted">Write</dt>
              <dd className="mt-2">
                <a href={`mailto:${SITE.contactEmail}`} className="font-display text-2xl text-espresso hover:text-gold-ink [overflow-wrap:anywhere]">
                  {SITE.contactEmail}
                </a>
              </dd>
            </div>
            <div>
              <dt className="eyebrow text-espresso-muted">Telephone</dt>
              <dd className="mt-2">
                <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="font-display text-2xl text-espresso hover:text-gold-ink">
                  {SITE.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="eyebrow text-espresso-muted">Hours</dt>
              <dd className="mt-2 text-pretty">
                Correspondence is read Monday to Friday. Anything sent over a weekend is answered on
                the Monday.
              </dd>
            </div>
            <div>
              <dt className="eyebrow text-espresso-muted">Company</dt>
              <dd className="mt-2">
                {SITE.legalName}, registered in South Africa, no. {SITE.registrationNumber}
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </Container>
  );
}
