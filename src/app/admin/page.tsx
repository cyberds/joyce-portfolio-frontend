import Link from "next/link";
import { StatCard } from "@/components/admin/StatCard";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { PlusIcon } from "@/components/shop/icons";
import { getAdminViewer } from "@/lib/commerce/auth";
import { getDashboardStats, listOrders } from "@/lib/commerce/orders";
import { formatMoney } from "@/lib/commerce/money";
import { commerceEnv, hasEmail, hasStripe, hasCloudinary } from "@/lib/commerce/env";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  // The layout renders the denial screen; returning null here just keeps
  // this page from producing anything for someone who should not see it.
  if (!(await getAdminViewer())) return null;

  const [stats, recentOrders] = await Promise.all([
    getDashboardStats(commerceEnv.currency),
    listOrders({ limit: 8 }),
  ]);

  // Integrations that are optional to *render* the dashboard but required to
  // actually trade. Surfaced here rather than failing silently at 2am.
  const gaps = [
    !hasStripe() && "Stripe — no payments can be taken",
    !hasCloudinary() && "Cloudinary — images and files cannot be uploaded",
    !hasEmail() && "ZeptoMail — receipts and download links will not send",
  ].filter(Boolean) as string[];

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-[1.9rem]">Overview</h1>
          <p className="mt-1.5 text-[0.88rem] text-ink-muted">
            Everything the shop has done, at a glance.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-[var(--r-pill)] bg-accent px-5 py-3 text-[0.87rem] font-medium text-surface transition-transform duration-300 hover:-translate-y-0.5"
        >
          <PlusIcon />
          New product
        </Link>
      </div>

      {gaps.length ? (
        <div className="rounded-[var(--r-md)] border border-tangerine/40 bg-lemon/10 p-5">
          <p className="text-[0.87rem] font-medium">
            The shop is not fully live yet
          </p>
          <ul className="mt-2.5 grid gap-1.5 text-[0.83rem] text-ink-muted">
            {gaps.map((gap) => (
              <li key={gap} className="flex gap-2.5">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-tangerine" />
                {gap}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[0.78rem] text-ink-faint">
            Add the missing values to <code>.env.local</code> — see{" "}
            <code>SHOP-SETUP.md</code>.
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue, all time"
          value={formatMoney(stats.revenueMinor, stats.currency)}
          hint={`${stats.paidOrders} paid order${stats.paidOrders === 1 ? "" : "s"}`}
        />
        <StatCard
          label="Last 30 days"
          value={formatMoney(stats.revenue30dMinor, stats.currency)}
          tone="accent"
        />
        <StatCard
          label="Average order"
          value={formatMoney(stats.averageOrderMinor, stats.currency)}
        />
        <StatCard
          label="Needs packing"
          value={String(stats.unfulfilledOrders)}
          hint={
            stats.pendingOrders
              ? `${stats.pendingOrders} also awaiting payment`
              : "Paid orders not yet shipped"
          }
          href="/admin/orders?status=paid"
          tone={stats.unfulfilledOrders > 0 ? "warn" : "neutral"}
        />
      </div>

      <RevenueChart data={stats.revenueByDay} currency={stats.currency} />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        {/* ---- Recent orders ---- */}
        <section className="rounded-[var(--r-md)] border border-hairline bg-surface">
          <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
            <h2 className="text-[0.95rem] font-medium">Recent orders</h2>
            <Link
              href="/admin/orders"
              className="text-[0.8rem] text-ink-muted underline underline-offset-4 hover:text-ink"
            >
              All orders
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="px-5 py-10 text-center text-[0.85rem] text-ink-faint">
              No orders yet.
            </p>
          ) : (
            <ul className="divide-y divide-hairline">
              {recentOrders.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-canvas"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[0.88rem]">
                        {order.orderNumber}
                      </span>
                      <span className="mt-0.5 block truncate text-[0.76rem] text-ink-faint">
                        {order.email || "No email yet"} ·{" "}
                        {new Date(order.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-[0.88rem]">
                        {formatMoney(order.totalMinor, order.currency)}
                      </span>
                      <span
                        className={`mt-0.5 block text-[0.72rem] ${
                          order.status === "paid"
                            ? "text-apple"
                            : order.status === "pending"
                              ? "text-ink-faint"
                              : "text-accent"
                        }`}
                      >
                        {order.status}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="grid gap-6">
          {/* ---- Best sellers ---- */}
          <section className="rounded-[var(--r-md)] border border-hairline bg-surface">
            <h2 className="border-b border-hairline px-5 py-4 text-[0.95rem] font-medium">
              Best sellers
            </h2>
            {stats.topProducts.length === 0 ? (
              <p className="px-5 py-8 text-center text-[0.85rem] text-ink-faint">
                Nothing sold yet.
              </p>
            ) : (
              <ul className="divide-y divide-hairline">
                {stats.topProducts.map((product) => (
                  <li
                    key={product.title}
                    className="flex items-baseline justify-between gap-4 px-5 py-3"
                  >
                    <span className="min-w-0 truncate text-[0.85rem]">
                      {product.title}
                    </span>
                    <span className="shrink-0 text-right text-[0.8rem] text-ink-muted">
                      {product.quantity} ·{" "}
                      {formatMoney(product.revenueMinor, stats.currency)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* ---- Low stock ---- */}
          <section className="rounded-[var(--r-md)] border border-hairline bg-surface">
            <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
              <h2 className="text-[0.95rem] font-medium">Running low</h2>
              <span className="text-[0.78rem] text-ink-faint">
                {stats.activeProductCount}/{stats.productCount} live
              </span>
            </div>
            {stats.lowStock.length === 0 ? (
              <p className="px-5 py-8 text-center text-[0.85rem] text-ink-faint">
                Nothing is running low.
              </p>
            ) : (
              <ul className="divide-y divide-hairline">
                {stats.lowStock.map((product) => (
                  <li key={product.id}>
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="flex items-baseline justify-between gap-4 px-5 py-3 transition-colors hover:bg-canvas"
                    >
                      <span className="min-w-0 truncate text-[0.85rem]">
                        {product.title}
                      </span>
                      <span
                        className={`shrink-0 text-[0.8rem] ${
                          product.stock === 0 ? "text-accent" : "text-tangerine"
                        }`}
                      >
                        {product.stock === 0 ? "Sold out" : `${product.stock} left`}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
