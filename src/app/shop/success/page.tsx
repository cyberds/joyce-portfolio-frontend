import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { ClearCartOnSuccess } from "@/components/shop/ClearCartOnSuccess";
import { CheckIcon, DownloadIcon } from "@/components/shop/icons";
import { getOrderByStripeSession } from "@/lib/commerce/orders";
import { formatMoney } from "@/lib/commerce/money";

export const metadata: Metadata = {
  title: "Thank you for your order | Joyce Wadawasina",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

/**
 * The page Stripe returns the shopper to.
 *
 * It reads the order and shows it, but it grants nothing: the order only
 * becomes `paid`, and download tokens only exist, once the Stripe webhook has
 * run. A shopper who arrives before the webhook has landed sees the "still
 * confirming" state rather than a wrong one, so the two possible truths are
 * both handled honestly.
 */
export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  const order = sessionId ? await getOrderByStripeSession(sessionId) : null;

  const confirmed = order?.status === "paid";

  return (
    <main className="relative overflow-x-clip">
      <Nav />
      <ClearCartOnSuccess />

      <div className="paper min-h-screen">
        <div className="relative z-10 mx-auto max-w-2xl shell pb-28 pt-36 md:pt-44">
          <div className="rounded-[var(--r-lg)] border border-hairline bg-surface p-8 sm:p-12">
            <span
              className={`flex size-12 items-center justify-center rounded-full ${
                confirmed ? "bg-apple text-ink" : "bg-accent-soft text-accent"
              }`}
            >
              <CheckIcon className="size-6" />
            </span>

            <h1 className="display mt-6 text-[clamp(1.9rem,4vw,2.6rem)]">
              {confirmed ? "Thank you — you're all set." : "Payment received"}
            </h1>

            {order ? (
              <>
                <p className="mt-4 text-[0.98rem] leading-relaxed text-ink-muted">
                  Order{" "}
                  <strong className="text-ink">{order.orderNumber}</strong> for{" "}
                  {formatMoney(order.totalMinor, order.currency)}.
                  {confirmed
                    ? " A receipt is on its way to your inbox."
                    : " We're just confirming it with Stripe — this page will be right in a moment, and your receipt will follow by email."}
                </p>

                <ul className="mt-8 grid gap-3 border-t border-hairline pt-8">
                  {order.items.map((item) => (
                    <li
                      key={item.productId}
                      className="flex items-baseline justify-between gap-4 text-[0.92rem]"
                    >
                      <span>
                        {item.title}
                        {item.quantity > 1 ? (
                          <span className="text-ink-faint"> × {item.quantity}</span>
                        ) : null}
                      </span>
                      <span className="shrink-0 text-ink-muted">
                        {formatMoney(
                          item.unitPriceMinor * item.quantity,
                          order.currency
                        )}
                      </span>
                    </li>
                  ))}
                </ul>

                {order.downloads.length ? (
                  <div className="mt-8 rounded-[var(--r-md)] bg-accent-soft p-5">
                    <p className="text-[0.88rem] font-medium">Your downloads</p>
                    <div className="mt-3 grid gap-2">
                      {order.downloads.map((grant) => (
                        <a
                          key={grant.token}
                          href={`/api/commerce/download/${grant.token}`}
                          className="inline-flex w-fit items-center gap-2 rounded-[var(--r-pill)] bg-accent px-5 py-2.5 text-[0.85rem] font-medium text-surface transition-transform duration-300 hover:-translate-y-0.5"
                        >
                          <DownloadIcon />
                          {grant.title}
                        </a>
                      ))}
                    </div>
                    <p className="mt-3 text-[0.78rem] text-ink-muted">
                      Also saved to your account, and emailed to you.
                    </p>
                  </div>
                ) : null}
              </>
            ) : (
              <p className="mt-4 text-[0.98rem] leading-relaxed text-ink-muted">
                Your payment went through. Your receipt — and any download links —
                are on their way to your inbox.
              </p>
            )}

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/account"
                className="rounded-[var(--r-pill)] bg-ink px-6 py-3.5 text-[0.9rem] text-surface transition-transform duration-300 hover:-translate-y-0.5"
              >
                View my orders
              </Link>
              <Link
                href="/shop"
                className="rounded-[var(--r-pill)] border border-hairline px-6 py-3.5 text-[0.9rem] transition-colors hover:bg-canvas-deep"
              >
                Keep shopping
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
