import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { ProductCard } from "@/components/shop/ProductCard";
import { SetupNotice } from "@/components/shop/SetupNotice";
import { listCategories, listPublicProducts } from "@/lib/commerce/catalogue";
import { missingCommerceEnv } from "@/lib/commerce/env";

export const metadata: Metadata = {
  title: "Shop — templates, toolkits and playbooks | Joyce Wadawasina",
  description:
    "Automation templates, workflow toolkits and printed playbooks — the systems Joyce builds for clients, packaged so you can run them yourself.",
};

// Stock and prices change from the admin dashboard; the shop should show that
// on the next request, not on the next deploy.
export const dynamic = "force-dynamic";

type Search = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    kind?: string;
    sort?: string;
  }>;
};

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

const KINDS = [
  { value: "", label: "Everything" },
  { value: "digital", label: "Downloads" },
  { value: "physical", label: "Physical" },
];

export default async function ShopPage({ searchParams }: Search) {
  const params = await searchParams;
  const missing = missingCommerceEnv("catalogue");

  const [products, categories] = missing.length
    ? [[], []]
    : await Promise.all([
        listPublicProducts({
          search: params.q,
          category: params.category,
          kind: params.kind === "physical" || params.kind === "digital"
            ? params.kind
            : undefined,
          sort: (params.sort as "newest" | "price-asc" | "price-desc") ?? "newest",
        }),
        listCategories(),
      ]);

  /** Rebuilds the current URL with one filter changed. */
  const linkWith = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const merged = { ...params, ...patch };
    for (const [key, value] of Object.entries(merged)) {
      if (value) next.set(key, value);
    }
    const query = next.toString();
    return query ? `/shop?${query}` : "/shop";
  };

  return (
    <main className="relative overflow-x-clip">
      <Nav />

      <div className="paper min-h-screen">
        <div className="relative z-10 shell pb-28 pt-36 md:pt-44">
          <Reveal>
            <p className="eyebrow text-accent">The shop</p>
          </Reveal>

          <Reveal delay={0.05} className="hidden">
            <h1 className="display mt-4 max-w-[16ch] text-[clamp(2.4rem,6vw,4rem)]">
              The systems, <span className="marked">packaged</span>.
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-6 max-w-[52ch] text-[1.02rem] leading-relaxed text-ink-muted">
              Templates, toolkits and playbooks built from the work Joyce does with
              clients. Downloads arrive the moment you pay; physical goods ship
              within a few working days.
            </p>
          </Reveal>

          {missing.length ? (
            <div className="mt-14">
              <SetupNotice missing={missing}>
                Once the database is connected, products added from the admin
                dashboard appear here automatically.
              </SetupNotice>
            </div>
          ) : (
            <>
              {/* ---- Filters ---- */}
              <Reveal delay={0.15}>
                <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4 border-y border-hairline py-4">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {KINDS.map((kind) => {
                      const active = (params.kind ?? "") === kind.value;
                      return (
                        <Link
                          key={kind.label}
                          href={linkWith({ kind: kind.value || undefined })}
                          className={`rounded-[var(--r-pill)] px-4 py-2 text-[0.83rem] transition-colors ${
                            active
                              ? "bg-ink text-surface"
                              : "text-ink-muted hover:bg-surface hover:text-ink"
                          }`}
                        >
                          {kind.label}
                        </Link>
                      );
                    })}
                  </div>

                  {categories.length ? (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Link
                        href={linkWith({ category: undefined })}
                        className={`rounded-[var(--r-pill)] px-4 py-2 text-[0.83rem] transition-colors ${
                          !params.category
                            ? "bg-accent-soft text-ink"
                            : "text-ink-muted hover:bg-surface hover:text-ink"
                        }`}
                      >
                        All topics
                      </Link>
                      {categories.map((category) => (
                        <Link
                          key={category}
                          href={linkWith({ category })}
                          className={`rounded-[var(--r-pill)] px-4 py-2 text-[0.83rem] transition-colors ${
                            params.category === category
                              ? "bg-accent-soft text-ink"
                              : "text-ink-muted hover:bg-surface hover:text-ink"
                          }`}
                        >
                          {category}
                        </Link>
                      ))}
                    </div>
                  ) : null}

                  <div className="ml-auto flex items-center gap-1.5">
                    {SORTS.map((sort) => (
                      <Link
                        key={sort.value}
                        href={linkWith({ sort: sort.value })}
                        className={`rounded-[var(--r-pill)] px-3.5 py-2 text-[0.8rem] transition-colors ${
                          (params.sort ?? "newest") === sort.value
                            ? "text-ink underline underline-offset-4"
                            : "text-ink-faint hover:text-ink"
                        }`}
                      >
                        {sort.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </Reveal>

              {/* ---- Grid ---- */}
              {products.length === 0 ? (
                <Reveal delay={0.2}>
                  <div className="mt-16 rounded-[var(--r-lg)] border border-dashed border-hairline bg-surface/60 p-14 text-center">
                    <p className="display text-[1.5rem]">Nothing here just yet</p>
                    <p className="mt-3 text-[0.92rem] text-ink-muted">
                      {params.q || params.category || params.kind
                        ? "No products match those filters."
                        : "The first products are on their way."}
                    </p>
                    {params.q || params.category || params.kind ? (
                      <Link
                        href="/shop"
                        className="mt-6 inline-block rounded-[var(--r-pill)] bg-ink px-6 py-3 text-[0.88rem] text-surface"
                      >
                        Clear filters
                      </Link>
                    ) : null}
                  </div>
                </Reveal>
              ) : (
                <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((product, index) => (
                    <Reveal key={product.id} delay={Math.min(index * 0.05, 0.3)}>
                      <ProductCard product={product} />
                    </Reveal>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
