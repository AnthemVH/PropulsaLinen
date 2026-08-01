import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * The house marks.
 *
 * `Monogram` is the ornate script "P" — the only place the script face is
 * permitted. `Wordmark` is the small-caps serif lockup. `Logo` is the two
 * together, used in the header and footer.
 */

export function Monogram({
  className,
  size = 40,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <span
      aria-hidden
      data-mark="monogram"
      className={cn(
        "inline-flex items-center justify-center leading-none text-gold select-none",
        className,
      )}
      style={{
        fontFamily: "var(--font-script)",
        fontSize: size,
        // Optical centering: the script P sits high on its baseline.
        lineHeight: 1,
        paddingTop: size * 0.12,
      }}
    >
      P
    </span>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "eyebrow font-display text-espresso",
        className,
      )}
      style={{ letterSpacing: "0.34em", fontSize: "0.8125rem" }}
    >
      PROPULSA
    </span>
  );
}

export function Logo({
  className,
  monogramSize = 34,
  stacked = false,
}: {
  className?: string;
  monogramSize?: number;
  stacked?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label="Propulsa — home"
      className={cn(
        "group inline-flex items-center gap-3",
        stacked && "flex-col gap-1",
        className,
      )}
    >
      <Monogram
        size={monogramSize}
        className="transition-opacity duration-500 group-hover:opacity-70"
      />
      <Wordmark className="transition-colors duration-500 group-hover:text-gold" />
    </Link>
  );
}
