import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Page gutter. `wide` is for full-bleed editorial rows. */
export function Container({
  children,
  className,
  width = "default",
}: {
  children: ReactNode;
  className?: string;
  width?: "default" | "wide" | "narrow";
}) {
  const widths = {
    narrow: "max-w-3xl",
    default: "max-w-[1400px]",
    wide: "max-w-[1760px]",
  };

  return (
    <div
      className={cn("mx-auto w-full px-6 md:px-10 lg:px-16", widths[width], className)}
    >
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
  as?: "p" | "span" | "div";
}) {
  return (
    <Tag className={cn("eyebrow text-espresso-muted", className)}>{children}</Tag>
  );
}

/** The recurring gold hairline. */
export function Rule({ className }: { className?: string }) {
  return <div aria-hidden className={cn("rule-gold w-full", className)} />;
}

export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="text-display-md text-balance">{title}</h2>
      {lede ? (
        <p
          className={cn(
            "text-lede text-espresso-soft text-pretty",
            align === "center" ? "max-w-2xl" : "max-w-xl",
          )}
        >
          {lede}
        </p>
      ) : null}
    </div>
  );
}

const buttonBase =
  "eyebrow inline-flex items-center justify-center gap-3 border px-8 py-4 transition-colors duration-500 disabled:cursor-not-allowed disabled:opacity-40";

const buttonVariants = {
  solid:
    "hairline border bg-espresso text-ivory hover:bg-gold disabled:hover:bg-espresso",
  outline:
    "hairline border text-espresso hover:border-gold hover:bg-gold/8 disabled:hover:bg-transparent",
  quiet:
    "border-transparent px-0 py-0 text-espresso hover:text-gold",
} as const;

export function Button({
  variant = "solid",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: keyof typeof buttonVariants }) {
  return (
    <button
      {...props}
      className={cn(buttonBase, buttonVariants[variant], className)}
    />
  );
}

export function ButtonLink({
  variant = "outline",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: keyof typeof buttonVariants }) {
  return (
    <Link
      {...props}
      className={cn(buttonBase, buttonVariants[variant], className)}
    />
  );
}

/** Editorial text link with the slow underline reveal. */
export function TextLink({
  className,
  ...props
}: ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      className={cn(
        "link-underline decoration-gold text-espresso hover:text-gold",
        className,
      )}
    />
  );
}

/** Long-form copy block for stories, FAQ answers and policy pages. */
export function Prose({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl space-y-6 text-espresso-soft [&_a]:text-gold [&_a:hover]:text-espresso [&_h3]:text-display-sm [&_h3]:mt-12 [&_h3]:mb-4 [&_li]:pl-1 [&_strong]:font-normal [&_strong]:text-espresso [&_ul]:list-none [&_ul]:space-y-3 [&_ul>li]:relative [&_ul>li]:pl-6 [&_ul>li]:before:absolute [&_ul>li]:before:left-0 [&_ul>li]:before:top-[0.85em] [&_ul>li]:before:h-px [&_ul>li]:before:w-3 [&_ul>li]:before:bg-gold",
        className,
      )}
    >
      {children}
    </div>
  );
}
