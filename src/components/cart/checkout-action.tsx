import { SITE } from "@/lib/content/site";
import { cn } from "@/lib/utils";

/**
 * Hand-off to Shopify's hosted checkout, shared by the drawer and the cart
 * page so the two can never disagree about whether checkout is open.
 *
 * A missing url has two causes and the customer is owed a different sentence
 * for each: the store is not connected at all (a build with no credentials),
 * or the store is connected but its checkout domain is pointed somewhere that
 * cannot serve checkout. Neither is worth sending someone to a dead page for.
 */
export function CheckoutAction({
  checkoutUrl,
  shopifyConfigured,
  className,
}: {
  checkoutUrl: string | null;
  shopifyConfigured: boolean;
  className?: string;
}) {
  if (shopifyConfigured && checkoutUrl) {
    return (
      <a
        href={checkoutUrl}
        className={cn(
          "eyebrow flex w-full items-center justify-center border hairline bg-espresso text-ivory transition-colors duration-500 hover:bg-gold",
          className,
        )}
      >
        Proceed to checkout
      </a>
    );
  }

  return (
    <p
      className={cn(
        "border hairline text-center text-sm text-espresso-muted",
        className,
      )}
    >
      {shopifyConfigured ? (
        <>
          Checkout is unavailable just now. Your selection is held — please try
          again shortly, or write to{" "}
          <a href={`mailto:${SITE.contactEmail}`} className="link-underline">
            {SITE.contactEmail}
          </a>
          .
        </>
      ) : (
        "Checkout opens once the Shopify store is connected."
      )}
    </p>
  );
}
