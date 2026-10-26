"use client";

import Link from "next/link";

import { removeCartLine, updateCartLine } from "@/lib/cart/actions";
import { DUTIES_NOTE } from "@/lib/content/site";
import { cn, formatPrice } from "@/lib/utils";
import { MotifArt } from "@/components/brand/motif-art";
import { Media } from "@/components/ui/media";
import { ButtonLink } from "@/components/ui/primitives";

import { CheckoutAction } from "./checkout-action";
import { useCart } from "./cart-context";

export function CartPageContents({
  shopifyConfigured,
}: {
  shopifyConfigured: boolean;
}) {
  const { cart, pending, error, run } = useCart();
  const lines = cart?.lines ?? [];

  if (!lines.length) {
    return (
      <div className="flex flex-col items-center py-16 text-center md:py-24">
        <div aria-hidden className="plate-marks relative mb-10 h-52 w-40">
          <div className="absolute inset-0">
            <MotifArt form="single-sprig" colorway="inverse" alt="" className="object-contain" />
          </div>
        </div>
        <p className="font-display text-display-sm text-espresso">Nothing selected yet</p>
        <p className="mx-auto mt-4 max-w-md text-espresso-soft">
          Pieces you choose will be held here for thirty days.
        </p>
        <ButtonLink href="/shop" className="mt-10">
          Browse the house
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
      <ul className="divide-y divide-stone border-y hairline lg:col-span-7">
        {lines.map((line) => (
          <li
            key={line.id}
            className={cn(
              "flex gap-5 py-8 transition-opacity duration-300 sm:gap-8",
              pending && "opacity-50",
            )}
          >
            <Link
              href={`/products/${line.merchandise.product.handle}`}
              className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden bg-stone/45 sm:w-36"
            >
              <Media image={line.merchandise.image} sizes="144px" />
            </Link>

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <Link
                  href={`/products/${line.merchandise.product.handle}`}
                  className="min-w-0 font-display text-xl leading-snug text-espresso [overflow-wrap:anywhere] hover:text-gold-ink md:text-display-sm"
                >
                  {line.merchandise.product.title}
                </Link>
                <span className="text-espresso tabular-nums">
                  {formatPrice(line.cost.totalAmount)}
                </span>
              </div>

              <p className="mt-2 text-sm text-espresso-soft [overflow-wrap:anywhere] md:text-base">
                {line.merchandise.selectedOptions
                  .map((option) => `${option.name}: ${option.value}`)
                  .join(" · ")}
              </p>

              <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-3 pt-6">
                <div className="flex items-center border hairline">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    disabled={pending}
                    onClick={() =>
                      run(() => updateCartLine(line.id, line.quantity - 1))
                    }
                    className="press flex size-11 items-center justify-center text-espresso-soft hover:text-gold-ink disabled:opacity-40"
                  >
                    –
                  </button>
                  <span className="min-w-8 text-center tabular-nums">
                    {line.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    disabled={pending}
                    onClick={() =>
                      run(() => updateCartLine(line.id, line.quantity + 1))
                    }
                    className="press flex size-11 items-center justify-center text-espresso-soft hover:text-gold-ink disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(() => removeCartLine(line.id))}
                  className="eyebrow link-underline press py-1 text-espresso-muted hover:text-gold-ink disabled:opacity-40"
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="border hairline bg-ivory-light p-6 sm:p-8 lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:col-span-5 lg:self-start">
        <h2 className="font-display text-2xl text-espresso">Summary</h2>
        <div aria-hidden className="rule-gold my-6" />

        <dl className="space-y-4">
          <div className="flex items-baseline justify-between">
            <dt className="text-espresso-soft">Subtotal</dt>
            <dd className="font-display text-3xl text-espresso tabular-nums">
              {cart ? formatPrice(cart.cost.subtotalAmount) : "—"}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-6 text-espresso-soft">
            <dt>Shipping</dt>
            <dd>Calculated at checkout</dd>
          </div>
          {/* Named in the summary rather than only in the small print: it is a
              cost of the order, and the one the customer cannot see coming. */}
          <div className="flex items-baseline justify-between gap-6 text-espresso-soft">
            <dt>{DUTIES_NOTE.summaryLabel}</dt>
            <dd className="text-right">{DUTIES_NOTE.summaryValue}</dd>
          </div>
        </dl>

        <p className="mt-6 text-sm text-pretty text-espresso-soft">
          {DUTIES_NOTE.short}{" "}
          <Link href="/shipping-returns" className="text-espresso underline decoration-gold/50 underline-offset-4 hover:text-gold-ink">
            Shipping &amp; returns
          </Link>
        </p>

        {error ? (
          <p role="alert" className="mt-6 text-sm text-gold-ink">
            {error}
          </p>
        ) : null}

        <CheckoutAction
          checkoutUrl={cart?.checkoutUrl ?? null}
          shopifyConfigured={shopifyConfigured}
          className="mt-9 px-6 py-5"
        />

        <p className="mt-6 text-sm text-pretty text-espresso-soft">
          Payment is taken by Shopify on a secure hosted page. We never see your
          card details.
        </p>
      </aside>
    </div>
  );
}
