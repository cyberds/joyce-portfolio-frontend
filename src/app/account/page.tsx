import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { SetupNotice } from "@/components/shop/SetupNotice";
import { DownloadIcon } from "@/components/shop/icons";
import { getViewer } from "@/lib/commerce/auth";
import { listOrders } from "@/lib/commerce/orders";
import { formatMoney } from "@/lib/commerce/money";
import { missingCommerceEnv } from "@/lib/commerce/env";
import { describeDownloads } from "@/lib/commerce/downloads";
import type { Order } from "@/types/commerce";

export const metadata: Metadata = {
  title: "Your orders | Joyce Wadawasina",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<Order["status"], string> = {
  pending: "Awaiting payment",
  paid: "Paid",
  failed: "Payment failed",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

const FULFILMENT_LABEL: Record<Order["fulfillmentStatus"], string> = {
  not_required: "Digital",
  unfulfilled: "Being prepared",
  fulfilled: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
};

export default async function AccountPage() {
  const missing = missingCommerceEnv("auth", "catalogue");
  if (missing.length) {
    return (
      <Shell>
        <SetupNotice title="Accounts are not switched on yet" missing={missing}>
          Clerk handles sign-in, and MongoDB stores the orders. Once both are
          configured, this page lists a customer&apos;s purchases and downloads.
        </SetupNotice>
      </Shell>
    );
  }

  const viewer = await getViewer();
  if (!viewer) {
    // proxy.ts redirects anonymous visitors before this renders; this is the
    // belt to that braces, for the case where the matcher ever changes.
    return (
      <Shell>
        <div className="rounded-[var(--r-lg)] border border-hairline bg-surface p-10 text-center">
          <p className="display text-[1.5rem]">Please sign in</p>
          <Link
            href="/sign-in"
            className="mt-6 inline-block rounded-[var(--r-pill)] bg-ink px-6 py-3.5 text-[0.9rem] text-surface"
          >
            Sign in
          </Link>
        </div>
      </Shell>
    );
  }

  // Orders bought before signing up are matched on email, so a guest checkout
  // followed by a sign-up still finds its history.
  const [byUser, byEmail] = await Promise.all([
    listOrders({ userId: viewer.userId }),
    viewer.email ? listOrders({ email: viewer.email }) : Promise.resolve([]),
  ]);

  const orders = [...byUser, ...byEmail]
    .filter(
      (order, index, all) => all.findIndex((other) => other.id === order.id) === index
    )
    .filter((order) => order.status !== "pending")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const liveDownloads = orders.flatMap((order) =>
    order.status === "paid"
      ? describeDownloads(order.downloads)
          .filter((grant) => grant.usable)
          .map((grant) => ({ grant, order }))
      : []
  );

  return (
    <Shell>
      <div className="grid gap-14">
        {liveDownloads.length ? (
          <section>
            <h2 className="display text-[1.5rem]">Your downloads</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {liveDownloads.map(({ grant, order }) => (
                <a
                  key={grant.token}
                  href={`/api/commerce/download/${grant.token}`}
                  className="group flex items-center justify-between gap-4 rounded-[var(--r-md)] border border-hairline bg-surface px-5 py-4 transition-colors hover:border-accent"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[0.95rem]">
                      {grant.title}
                    </span>
                    <span className="mt-1 block text-[0.75rem] text-ink-faint">
                      {order.orderNumber} · {grant.remaining} of{" "}
                      {grant.maxDownloads} downloads left
                    </span>
                  </span>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-canvas-deep text-ink transition-colors group-hover:bg-accent group-hover:text-surface">
                    <DownloadIcon />
                  </span>
                </a>
              ))}
            </div>
          </section>
        ) : null}

        <section>
          <h2 className="display text-[1.5rem]">Order history</h2>

          {orders.length === 0 ? (
            <div className="mt-5 rounded-[var(--r-lg)] border border-dashed border-hairline bg-surface/60 p-12 text-center">
              <p className="text-[0.95rem] text-ink-muted">
                You haven&apos;t ordered anything yet.
              </p>
              <Link
                href="/shop"
                className="mt-6 inline-block rounded-[var(--r-pill)] bg-ink px-6 py-3.5 text-[0.9rem] text-surface"
              >
                Visit the shop
              </Link>
            </div>
          ) : (
            <ul className="mt-5 grid gap-4">
              {orders.map((order) => (
                <li
                  key={order.id}
                  className="rounded-[var(--r-lg)] border border-hairline bg-surface p-6"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <div>
                      <p className="text-[1rem] font-medium">{order.orderNumber}</p>
                      <p className="mt-1 text-[0.8rem] text-ink-faint">
                        {new Date(order.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[1rem]">
                        {formatMoney(order.totalMinor, order.currency)}
                      </p>
                      <p className="mt-1 text-[0.75rem] text-ink-faint">
                        {STATUS_LABEL[order.status]}
                        {order.status === "paid" &&
                        order.fulfillmentStatus !== "not_required"
                          ? ` · ${FULFILMENT_LABEL[order.fulfillmentStatus]}`
                          : ""}
                      </p>
                    </div>
                  </div>

                  <ul className="mt-5 grid gap-2 border-t border-hairline pt-5">
                    {order.items.map((item) => (
                      <li
                        key={item.productId}
                        className="flex items-baseline justify-between gap-4 text-[0.88rem] text-ink-muted"
                      >
                        <span>
                          {item.title}
                          {item.quantity > 1 ? ` × ${item.quantity}` : ""}
                        </span>
                        <span className="shrink-0">
                          {formatMoney(
                            item.unitPriceMinor * item.quantity,
                            order.currency
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {order.trackingNumber ? (
                    <p className="mt-5 border-t border-hairline pt-4 text-[0.82rem] text-ink-muted">
                      Tracking: <strong>{order.trackingNumber}</strong>
                      {order.trackingCarrier ? ` (${order.trackingCarrier})` : ""}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative overflow-x-clip">
      <Nav />
      <div className="paper min-h-screen">
        <div className="relative z-10 shell pb-28 pt-36 md:pt-44">
          <p className="eyebrow text-accent">Your account</p>
          <h1 className="display mt-4 text-[clamp(2.2rem,5vw,3.2rem)]">
            Orders &amp; downloads
          </h1>
          <div className="mt-12">{children}</div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
