import Link from "next/link";
import Image from "next/image";
import { getAdminViewer } from "@/lib/commerce/auth";
import { listAdminProducts } from "@/lib/commerce/catalogue";
import { formatMoney } from "@/lib/commerce/money";
import { PlusIcon, DownloadIcon, BoxIcon } from "@/components/shop/icons";
import { ProductSearch } from "@/components/admin/ProductSearch";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  active: "bg-apple/25 text-ink",
  draft: "bg-canvas-deep text-ink-muted",
  archived: "bg-hairline text-ink-faint",
};

const FILTERS = [
  { value: "", label: "All" },
  { value: "active", label: "Live" },
  { value: "draft", label: "Drafts" },
  { value: "archived", label: "Archived" },
];

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>;
}) {
  // The layout renders the denial screen; returning null here just keeps
  // this page from producing anything for someone who should not see it.
  if (!(await getAdminViewer())) return null;
  const params = await searchParams;

  const products = await listAdminProducts({
    search: params.search,
    status: params.status,
  });

  return (
    <div className="grid gap-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-[1.9rem]">Products</h1>
          <p className="mt-1.5 text-[0.88rem] text-ink-muted">
            {products.length} product{products.length === 1 ? "" : "s"}
            {params.status ? ` · ${params.status}` : ""}
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

      <div className="flex flex-wrap items-center gap-4">
        <ProductSearch initial={params.search ?? ""} status={params.status ?? ""} />
        <div className="flex items-center gap-1">
          {FILTERS.map((filter) => {
            const active = (params.status ?? "") === filter.value;
            const query = new URLSearchParams();
            if (filter.value) query.set("status", filter.value);
            if (params.search) query.set("search", params.search);
            const href = query.toString()
              ? `/admin/products?${query}`
              : "/admin/products";
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
      </div>

      {products.length === 0 ? (
        <div className="rounded-[var(--r-md)] border border-dashed border-hairline bg-surface p-14 text-center">
          <p className="text-[0.95rem]">
            {params.search || params.status
              ? "Nothing matches that."
              : "No products yet."}
          </p>
          <Link
            href="/admin/products/new"
            className="mt-6 inline-flex items-center gap-2 rounded-[var(--r-pill)] bg-ink px-5 py-3 text-[0.87rem] text-surface"
          >
            <PlusIcon />
            Add the first one
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[var(--r-md)] border border-hairline bg-surface">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-hairline text-[0.75rem] uppercase tracking-wider text-ink-faint">
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Stock</th>
                <th className="px-5 py-3 text-right font-medium">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {products.map((product) => (
                <tr key={product.id} className="transition-colors hover:bg-canvas">
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="flex items-center gap-3.5"
                    >
                      <span className="relative size-11 shrink-0 overflow-hidden rounded-[var(--r-sm)] bg-canvas-deep">
                        {product.images[0] ? (
                          <Image
                            src={product.images[0].url}
                            alt=""
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="flex h-full items-center justify-center text-ink-faint">
                            {product.kind === "digital" ? (
                              <DownloadIcon />
                            ) : (
                              <BoxIcon />
                            )}
                          </span>
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[0.9rem]">
                          {product.title}
                        </span>
                        <span className="mt-0.5 block truncate font-mono text-[0.72rem] text-ink-faint">
                          /{product.slug}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-[0.83rem] text-ink-muted">
                    {product.kind === "digital" ? "Download" : "Physical"}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block rounded-[var(--r-pill)] px-2.5 py-1 text-[0.72rem] ${
                        STATUS_STYLE[product.status]
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[0.83rem]">
                    {product.kind === "digital" ? (
                      <span className="text-ink-faint">—</span>
                    ) : product.stock === null ? (
                      <span className="text-ink-faint">Untracked</span>
                    ) : (
                      <span
                        className={
                          product.stock === 0
                            ? "text-accent"
                            : product.stock <= 5
                              ? "text-tangerine"
                              : ""
                        }
                      >
                        {product.stock}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right text-[0.88rem]">
                    {formatMoney(product.priceMinor, product.currency)}
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
