"use client";

import Link from "next/link";

import { removeCartLine, updateCartLine } from "@/lib/cart/actions";
import { cn, formatPrice } from "@/lib/utils";
import { Media } from "@/components/ui/media";
import { Rule } from "@/components/ui/primitives";

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
      <div className="py-24 text-center">
        <p className="font-display text-display-sm">Nothing selected yet</p>
        <p className="mx-auto mt-4 max-w-md text-espresso-muted">
          Pieces you choose will be held here for thirty days.
        </p>
        <Link
          href="/shop"
          className="eyebrow link-underline mt-8 inline-block text-gold"
        >
          Browse the collections
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-16 lg:grid-cols-[1.6fr_1fr] lg:gap-24">
      <ul className="divide-y divide-stone/60 border-y hairline">
        {lines.map((line) => (
          <li
            key={line.id}
            className={cn(
              "flex gap-6 py-8 transition-opacity",
              pending && "opacity-50",
            )}
          >
            <Link
              href={`/products/${line.merchandise.product.handle}`}
              className="relative aspect-[4/5] w-28 shrink-0 overflow-hidden bg-stone/40 sm:w-36"
            >
              <Media image={line.merchandise.image} sizes="144px" />
            </Link>

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <Link
                  href={`/products/${line.merchandise.product.handle}`}
                  className="font-display text-display-sm transition-colors duration-500 hover:text-gold"
                >
                  {line.merchandise.product.title}
                </Link>
                <span className="tabular-nums text-espresso-soft">
                  {formatPrice(line.cost.totalAmount)}
                </span>
              </div>

              <p className="mt-2 text-espresso-muted">
                {line.merchandise.selectedOptions
                  .map((option) => `${option.name}: ${option.value}`)
                  .join(" · ")}
              </p>

              <div className="mt-auto flex items-center gap-6 pt-6">
                <div className="flex items-center border hairline">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    disabled={pending}
                    onClick={() =>
                      run(() => updateCartLine(line.id, line.quantity - 1))
                    }
                    className="px-4 py-2.5 text-espresso-muted transition-colors duration-500 hover:text-gold disabled:opacity-40"
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
                    className="px-4 py-2.5 text-espresso-muted transition-colors duration-500 hover:text-gold disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(() => removeCartLine(line.id))}
                  className="eyebrow text-espresso-muted transition-colors duration-500 hover:text-gold disabled:opacity-40"
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="lg:sticky lg:top-32 lg:self-start">
        <h2 className="eyebrow text-espresso-muted">Summary</h2>
        <Rule className="my-6" />

        <dl className="space-y-4">
          <div className="flex items-baseline justify-between">
            <dt className="text-espresso-soft">Subtotal</dt>
            <dd className="font-display text-2xl tabular-nums">
              {cart ? formatPrice(cart.cost.subtotalAmount) : "—"}
            </dd>
          </div>
          <div className="flex items-baseline justify-between text-espresso-muted">
            <dt>Shipping</dt>
            <dd>Calculated at checkout</dd>
          </div>
        </dl>

        {error ? (
          <p role="alert" className="mt-6 text-sm text-gold">
            {error}
          </p>
        ) : null}

        <CheckoutAction
          checkoutUrl={cart?.checkoutUrl ?? null}
          shopifyConfigured={shopifyConfigured}
          className="mt-9 px-6 py-5"
        />

        <p className="mt-6 text-sm text-espresso-muted">
          Payment is taken by Shopify on a secure hosted page. We never see your
          card details.
        </p>
      </aside>
    </div>
  );
}
