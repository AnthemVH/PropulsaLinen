import Link from "next/link";
import type { ComponentProps, CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Page gutter. `wide` is for full-bleed editorial rows. */
export function Container({
  children,
  className,
  width = "default",
}: {
  children: ReactNode;
  className?: string;
  width?: "default" | "wide" | "narrow" | "text";
}) {
  const widths = {
    text: "max-w-[44rem]",
    narrow: "max-w-[64rem]",
    default: "max-w-[1400px]",
    wide: "max-w-[1760px]",
  };

  return (
    <div className={cn("mx-auto w-full px-[var(--gutter)]", widths[width], className)}>
      {children}
    </div>
  );
}

export function Eyebrow({
  children,
  className,
  as: Tag = "p",
}: {
  children: ReactNode;
  className?: string;
  as?: "p" | "span" | "div" | "h2" | "h3";
}) {
  return <Tag className={cn("eyebrow text-espresso-muted", className)}>{children}</Tag>;
}

/** The recurring gold hairline. `draw` sweeps it in from the left on entry. */
export function Rule({
  className,
  draw = false,
  delay,
}: {
  className?: string;
  draw?: boolean;
  delay?: number;
}) {
  return (
    <div
      aria-hidden
      data-reveal={draw ? "draw" : undefined}
      style={delay ? ({ "--d": delay } as CSSProperties) : undefined}
      className={cn("rule-gold w-full", className)}
    />
  );
}

/**
 * A printer's ornament between passages: two hairlines and an open lozenge.
 * The lozenge is a gold outline, never a filled shape.
 */
export function Ornament({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  return (
    <div aria-hidden className={cn("flex items-center justify-center gap-4", className)}>
      <span className={cn("h-px w-12 sm:w-20", tone === "dark" ? "bg-gold-light/50" : "bg-gold/45")} />
      <span
        className={cn(
          "size-[7px] rotate-45 border",
          tone === "dark" ? "border-gold-light/80" : "border-gold/80",
        )}
      />
      <span className={cn("h-px w-12 sm:w-20", tone === "dark" ? "bg-gold-light/50" : "bg-gold/45")} />
    </div>
  );
}

/**
 * Section opener. A plate numeral (I, II…) sits to the left like a folio
 * chapter mark; the eyebrow, title and lede follow.
 */
export function SectionHeading({
  eyebrow,
  title,
  lede,
  numeral,
  align = "left",
  tone = "light",
  className,
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  numeral?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
  as?: "h1" | "h2";
}) {
  const dark = tone === "dark";

  return (
    <div
      data-reveal
      className={cn(
        "flex flex-col gap-5",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow || numeral ? (
        <p
          className={cn(
            "flex items-center gap-4",
            align === "center" && "justify-center",
          )}
        >
          {numeral ? (
            <span
              className={cn(
                "numeral text-2xl leading-none",
                dark ? "text-gold-light" : "text-gold-ink",
              )}
            >
              {numeral}
            </span>
          ) : null}
          {numeral && eyebrow ? (
            <span aria-hidden className={cn("h-px w-8", dark ? "bg-gold-light/50" : "bg-gold/50")} />
          ) : null}
          {eyebrow ? (
            <span className={cn("eyebrow", dark ? "text-ivory/75" : "text-espresso-muted")}>
              {eyebrow}
            </span>
          ) : null}
        </p>
      ) : null}
      <Tag className={cn("text-display-md text-balance", dark ? "text-ivory-light" : "text-espresso")}>
        {title}
      </Tag>
      {lede ? (
        <p
          className={cn(
            "text-lede text-pretty",
            dark ? "text-ivory/80" : "text-espresso-soft",
            align === "center" ? "max-w-2xl" : "max-w-xl",
          )}
        >
          {lede}
        </p>
      ) : null}
    </div>
  );
}

/**
 * The opening of an interior page: a running head, a large title, a lede, and
 * a gold rule that draws itself in. Above the fold, so it uses the CSS intro
 * classes rather than the scroll observer.
 */
export function PageHeader({
  runningHead,
  title,
  lede,
  numeral,
  align = "left",
  children,
  className,
}: {
  runningHead: string;
  title: ReactNode;
  lede?: ReactNode;
  numeral?: string;
  align?: "left" | "center";
  children?: ReactNode;
  className?: string;
}) {
  const centred = align === "center";

  return (
    <header className={cn("pt-12 pb-10 md:pt-20 md:pb-14", className)}>
      <div className={cn("flex items-center gap-4", centred && "justify-center")}>
        {numeral ? (
          <span className="numeral intro-fade text-2xl leading-none text-gold-ink">{numeral}</span>
        ) : null}
        {numeral ? <span aria-hidden className="intro-fade h-px w-8 bg-gold/50" /> : null}
        <p className="eyebrow intro-fade text-espresso-muted">{runningHead}</p>
      </div>
      <h1
        className={cn(
          "intro-rise mt-6 text-display-lg text-balance text-espresso md:mt-8",
          centred ? "mx-auto max-w-4xl text-center" : "max-w-5xl",
        )}
        style={{ "--d": 80 } as CSSProperties}
      >
        {title}
      </h1>
      {lede ? (
        <p
          className={cn(
            "intro-rise mt-6 text-lede text-pretty text-espresso-soft md:mt-8",
            centred ? "mx-auto max-w-2xl text-center" : "max-w-2xl",
          )}
          style={{ "--d": 200 } as CSSProperties}
        >
          {lede}
        </p>
      ) : null}
      {children}
      <div
        aria-hidden
        className="rule-gold intro-draw mt-10 w-full md:mt-14"
        style={{ "--d": 300 } as CSSProperties}
      />
    </header>
  );
}

const buttonBase =
  "eyebrow press group/button relative inline-flex min-h-12 items-center justify-center gap-4 border px-8 py-4 duration-300 disabled:cursor-not-allowed disabled:opacity-40";

const buttonVariants = {
  solid:
    "border-espresso bg-espresso text-ivory-light hover:bg-espresso-soft disabled:hover:bg-espresso",
  outline:
    "hairline-strong text-espresso hover:border-gold hover:text-gold-ink disabled:hover:border-current",
  light:
    "border-ivory-light/45 text-ivory-light hover:border-gold-light hover:text-gold-light",
  quiet: "min-h-0 border-transparent px-0 py-0 text-espresso hover:text-gold-ink",
} as const;

/** A hairline that lengthens on hover: the house's arrow. */
function Leader() {
  return (
    <span
      aria-hidden
      className="h-px w-5 origin-left bg-current transition-transform duration-500 ease-out group-hover/button:scale-x-[1.8]"
    />
  );
}

export function Button({
  variant = "solid",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: keyof typeof buttonVariants }) {
  return <button {...props} className={cn(buttonBase, buttonVariants[variant], className)} />;
}

export function ButtonLink({
  variant = "outline",
  className,
  children,
  leader = true,
  ...props
}: ComponentProps<typeof Link> & { variant?: keyof typeof buttonVariants; leader?: boolean }) {
  return (
    <Link {...props} className={cn(buttonBase, buttonVariants[variant], className)}>
      {children}
      {leader ? <Leader /> : null}
    </Link>
  );
}

/** Editorial text link with the slow underline reveal. */
export function TextLink({ className, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      className={cn("link-underline text-espresso transition-colors hover:text-gold-ink", className)}
    />
  );
}

/** Long-form copy block for stories, FAQ answers and policy pages. */
export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "max-w-[40rem] space-y-6 text-espresso-soft [overflow-wrap:anywhere] [&_a]:text-gold-ink [&_a]:underline [&_a]:decoration-gold/40 [&_a]:underline-offset-4 [&_a:hover]:text-espresso [&_h2]:mt-14 [&_h2]:mb-4 [&_h2]:font-display [&_h2]:text-display-sm [&_h2]:text-espresso [&_h3]:mt-12 [&_h3]:mb-4 [&_h3]:font-display [&_h3]:text-display-sm [&_h3]:text-espresso [&_li]:pl-1 [&_ol]:list-decimal [&_ol]:space-y-3 [&_ol]:pl-6 [&_strong]:font-normal [&_strong]:text-espresso [&_table]:w-full [&_table]:text-sm [&_td]:border-b [&_td]:border-stone [&_td]:py-2 [&_ul]:list-none [&_ul]:space-y-3 [&_ul>li]:relative [&_ul>li]:pl-6 [&_ul>li]:before:absolute [&_ul>li]:before:left-0 [&_ul>li]:before:top-[0.85em] [&_ul>li]:before:h-px [&_ul>li]:before:w-3 [&_ul>li]:before:bg-gold",
        className,
      )}
    >
      {children}
    </div>
  );
}
