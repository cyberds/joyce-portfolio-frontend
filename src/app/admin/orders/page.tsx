import Link from "next/link";
import { getAdminViewer } from "@/lib/commerce/auth";
import { listOrders } from "@/lib/commerce/orders";
import { formatMoney } from "@/lib/commerce/money";
import type { Order } from "@/types/commerce";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<Order["status"], string> = {
  paid: "bg-apple/25 text-ink",
  pending: "bg-canvas-deep text-ink-muted",
  failed: "bg-accent-soft text-accent-deep",
  cancelled: "bg-hairline text-ink-faint",
  refunded: "bg-lemon/25 text-ink",
};

const FULFILMENT_LABEL: Record<Order["fulfillmentStatus"], string> = {
  not_required: "Digital",
  unfulfilled: "To pack",
  fulfilled: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
};

const FILTERS = [
  { value: "", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "refunded", label: "Refunded" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  // The layout renders the denial screen; returning null here just keeps
  // this page from producing anything for someone who should not see it.
  if (!(await getAdminViewer())) return null;
  const params = await searchParams;

  const orders = await listOrders({
    status: params.status,
    search: params.search,
  });

  const revenue = orders
    .filter((order) => order.status === "paid")
    .reduce((sum, order) => sum + order.totalMinor, 0);

  return (
    <div className="grid gap-7">
      <div>
        <h1 className="display text-[1.9rem]">Orders</h1>
        <p className="mt-1.5 text-[0.88rem] text-ink-muted">
          {orders.length} order{orders.length === 1 ? "" : "s"}
          {revenue > 0
            ? ` · ${formatMoney(revenue, orders[0]?.currency ?? "GBP")} paid`
            : ""}
        </p>
      </div>

      <div className="flex items-center gap-1">
        {FILTERS.map((filter) => {
          const active = (params.status ?? "") === filter.value;
          const query = new URLSearchParams();
          if (filter.value) query.set("status", filter.value);
          if (params.search) query.set("search", params.search);
          const href = query.toString() ? `/admin/orders?${query}` : "/admin/orders";
          return (
            <Link
              key={filter.label}
              href={href}
              className={`rounded-[var(--r-pill)] px-3.5 py-2 text-[0.82rem] transition-colors ${
                active
                  ? "bg-ink text-surface"
                  : "text-ink-muted hover:bg-canvas-deep hover:text-ink"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <div className="rounded-[var(--r-md)] border border-dashed border-hairline bg-surface p-14 text-center text-[0.9rem] text-ink-muted">
          No orders here yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[var(--r-md)] border border-hairline bg-surface">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-hairline text-[0.75rem] uppercase tracking-wider text-ink-faint">
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Items</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Fulfilment</th>
                <th className="px-5 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {orders.map((order) => (
                <tr key={order.id} className="transition-colors hover:bg-canvas">
                  <td className="px-5 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="block">
                      <span className="block text-[0.88rem]">
                        {order.orderNumber}
                      </span>
                      <span className="mt-0.5 block text-[0.73rem] text-ink-faint">
                        {new Date(order.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </Link>
                  </td>
                  <td className="max-w-[220px] px-5 py-3">
                    <span className="block truncate text-[0.85rem]">
                      {order.customerName || "—"}
                    </span>
                    <span className="mt-0.5 block truncate text-[0.73rem] text-ink-faint">
                      {order.email || "No email"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[0.83rem] text-ink-muted">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block rounded-[var(--r-pill)] px-2.5 py-1 text-[0.72rem] ${
                        STATUS_STYLE[order.status]
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[0.83rem] text-ink-muted">
                    {FULFILMENT_LABEL[order.fulfillmentStatus]}
                  </td>
                  <td className="px-5 py-3 text-right text-[0.88rem]">
                    {formatMoney(order.totalMinor, order.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
