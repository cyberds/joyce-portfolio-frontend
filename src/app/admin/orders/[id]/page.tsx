import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminViewer } from "@/lib/commerce/auth";
import { getOrder } from "@/lib/commerce/orders";
import { formatMoney } from "@/lib/commerce/money";
import { OrderActions } from "@/components/admin/OrderActions";
import { ArrowRightIcon } from "@/components/ui/icons";
import { describeDownloads } from "@/lib/commerce/downloads";

export const dynamic = "force-dynamic";

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // The layout renders the denial screen; returning null here just keeps
  // this page from producing anything for someone who should not see it.
  if (!(await getAdminViewer())) return null;

  const { id } = await params;
  // No `restrictTo` — an admin may read every order, and the guard above is
  // what earns that. The customer-facing /account passes its own identity in.
  const order = await getOrder(id);
  if (!order) notFound();

  // Judged once, against a single instant, outside the render path.
  const downloads = describeDownloads(order.downloads);

  const placed = new Date(order.createdAt).toLocaleString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="grid gap-7">
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-[0.82rem] text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowRightIcon className="rotate-180" />
          All orders
        </Link>

        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <h1 className="display text-[1.9rem]">{order.orderNumber}</h1>
            <p className="mt-1.5 text-[0.85rem] text-ink-muted">
              Placed {placed}
              {order.paidAt
                ? ` · paid ${new Date(order.paidAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                  })}`
                : ""}
            </p>
          </div>
          <span
            className={`rounded-[var(--r-pill)] px-4 py-2 text-[0.82rem] ${
              order.status === "paid"
                ? "bg-apple/25"
                : order.status === "pending"
                  ? "bg-canvas-deep text-ink-muted"
                  : "bg-accent-soft"
            }`}
          >
            {order.status}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr] lg:items-start">
        <div className="grid gap-6">
          {/* ---- Items ---- */}
          <section className="rounded-[var(--r-md)] border border-hairline bg-surface">
            <h2 className="border-b border-hairline px-5 py-4 text-[0.95rem] font-medium">
              Items
            </h2>
            <ul className="divide-y divide-hairline">
              {order.items.map((item) => (
                <li
                  key={item.productId}
                  className="flex items-baseline justify-between gap-4 px-5 py-3.5"
                >
                  <span className="min-w-0">
                    <span className="block text-[0.89rem]">{item.title}</span>
                    <span className="mt-0.5 block text-[0.74rem] text-ink-faint">
                      {item.kind === "digital" ? "Download" : "Physical"} ·{" "}
                      {formatMoney(item.unitPriceMinor, order.currency)} ×{" "}
                      {item.quantity}
                    </span>
                  </span>
                  <span className="shrink-0 text-[0.89rem]">
                    {formatMoney(
                      item.unitPriceMinor * item.quantity,
                      order.currency
                    )}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="grid gap-2 border-t border-hairline px-5 py-4 text-[0.85rem]">
              <div className="flex justify-between">
                <dt className="text-ink-muted">Subtotal</dt>
                <dd>{formatMoney(order.subtotalMinor, order.currency)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-muted">Shipping</dt>
                <dd>
                  {order.shippingMinor === 0
                    ? "—"
                    : formatMoney(order.shippingMinor, order.currency)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-hairline pt-2.5 text-[0.98rem] font-medium">
                <dt>Total</dt>
                <dd>{formatMoney(order.totalMinor, order.currency)}</dd>
              </div>
            </dl>
          </section>

          {/* ---- Downloads ---- */}
          {downloads.length ? (
            <section className="rounded-[var(--r-md)] border border-hairline bg-surface">
              <h2 className="border-b border-hairline px-5 py-4 text-[0.95rem] font-medium">
                Download links
              </h2>
              <ul className="divide-y divide-hairline">
                {downloads.map((grant) => (
                  <li key={grant.token} className="px-5 py-3.5">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-[0.88rem]">{grant.title}</span>
                      <span
                        className={`shrink-0 text-[0.76rem] ${
                          grant.expired || grant.spent
                            ? "text-accent"
                            : "text-ink-faint"
                        }`}
                      >
                        {grant.expired
                          ? "Expired"
                          : grant.spent
                            ? "All used"
                            : `${grant.downloadCount}/${grant.maxDownloads} used`}
                      </span>
                    </div>
                    <p className="mt-1 text-[0.73rem] text-ink-faint">
                      Expires{" "}
                      {new Date(grant.expiresAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* ---- Customer ---- */}
          <section className="rounded-[var(--r-md)] border border-hairline bg-surface p-5">
            <h2 className="text-[0.95rem] font-medium">Customer</h2>
            <dl className="mt-4 grid gap-3 text-[0.85rem]">
              <Row label="Name" value={order.customerName || "—"} />
              <Row
                label="Email"
                value={
                  order.email ? (
                    <a
                      href={`mailto:${order.email}`}
                      className="text-accent underline underline-offset-4"
                    >
                      {order.email}
                    </a>
                  ) : (
                    "—"
                  )
                }
              />
              <Row
                label="Account"
                value={order.userId ? "Signed in" : "Guest checkout"}
              />
              <Row
                label="Receipt"
                value={
                  order.receiptSentAt
                    ? `Sent ${new Date(order.receiptSentAt).toLocaleDateString("en-GB")}`
                    : "Not sent"
                }
              />
            </dl>

            {order.shippingAddress ? (
              <>
                <h3 className="mt-6 text-[0.85rem] font-medium">Ship to</h3>
                <p className="mt-2 text-[0.85rem] leading-relaxed text-ink-muted">
                  {[
                    order.shippingAddress.name,
                    order.shippingAddress.line1,
                    order.shippingAddress.line2,
                    order.shippingAddress.city,
                    order.shippingAddress.postalCode,
                    order.shippingAddress.state,
                    order.shippingAddress.country,
                  ]
                    .filter(Boolean)
                    .map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                </p>
              </>
            ) : null}
          </section>
        </div>

        <OrderActions order={order} />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}
