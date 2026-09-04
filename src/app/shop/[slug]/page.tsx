import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRightIcon } from "@/components/ui/icons";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { ProductCard } from "@/components/shop/ProductCard";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { DownloadIcon, BoxIcon } from "@/components/shop/icons";
import {
  getPublicProductBySlug,
  listPublicProducts,
} from "@/lib/commerce/catalogue";
import { formatMoney } from "@/lib/commerce/money";
import { SHIPPING } from "@/lib/commerce/shipping";
import { hasDatabase } from "@/lib/commerce/env";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);
  if (!product) return { title: "Product not found" };

  return {
    title: `${product.title} | Joyce Wadawasina`,
    description: product.summary || undefined,
    openGraph: {
      title: product.title,
      description: product.summary || undefined,
      type: "website",
      ...(product.images[0] ? { images: [product.images[0].url] } : {}),
    },
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  if (!hasDatabase()) notFound();

  const product = await getPublicProductBySlug(slug);
  if (!product) notFound();

  const related = (
    await listPublicProducts({ category: product.category || undefined })
  )
    .filter((candidate) => candidate.id !== product.id)
    .slice(0, 3);

  const onSale =
    product.compareAtMinor !== null && product.compareAtMinor > product.priceMinor;
  const lowStock =
    product.kind === "physical" &&
    product.stock !== null &&
    product.stock > 0 &&
    product.stock <= 5;

  return (
    <main className="relative overflow-x-clip">
      <Nav />

      <div className="paper">
        <article className="relative z-10 shell pb-24 pt-36 md:pt-44">
          <Reveal>
            <Link
              href="/shop"
              className="eyebrow inline-flex items-center gap-2 text-ink-faint transition-colors hover:text-ink"
            >
              <ArrowRightIcon className="rotate-180" />
              All products
            </Link>
          </Reveal>

          <div className="mt-8 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <Reveal>
              <ProductGallery
                images={product.images}
                title={product.title}
                kind={product.kind}
              />
            </Reveal>

            <div>
              <Reveal delay={0.05}>
                <p className="eyebrow flex items-center gap-2 text-accent">
                  {product.kind === "digital" ? (
                    <>
                      <DownloadIcon /> Instant download
                    </>
                  ) : (
                    <>
                      <BoxIcon /> Shipped to you
                    </>
                  )}
                </p>
              </Reveal>

              <Reveal delay={0.1}>
                <h1 className="display mt-3 text-[clamp(2rem,4.4vw,3rem)]">
                  {product.title}
                </h1>
              </Reveal>

              {product.summary ? (
                <Reveal delay={0.15}>
                  <p className="mt-5 text-[1.02rem] leading-relaxed text-ink-muted">
                    {product.summary}
                  </p>
                </Reveal>
              ) : null}

              <Reveal delay={0.2}>
                <div className="mt-8 flex items-baseline gap-3">
                  <span className="display text-[2rem]">
                    {formatMoney(product.priceMinor, product.currency)}
                  </span>
                  {onSale ? (
                    <span className="text-[1rem] text-ink-faint line-through">
                      {formatMoney(product.compareAtMinor!, product.currency)}
                    </span>
                  ) : null}
                </div>

                {lowStock ? (
                  <p className="mt-2 text-[0.85rem] text-accent">
                    Only {product.stock} left.
                  </p>
                ) : null}
              </Reveal>

              <Reveal delay={0.25}>
                <div className="mt-8">
                  <AddToCartButton product={product} className="w-full sm:w-auto" />
                </div>
              </Reveal>

              <Reveal delay={0.3}>
                <ul className="mt-8 grid gap-3 border-t border-hairline pt-8 text-[0.88rem] text-ink-muted">
                  {product.kind === "digital" ? (
                    <>
                      <li className="flex gap-3">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                        Your download link arrives by email the moment payment clears.
                      </li>
                      <li className="flex gap-3">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                        It also lives in your account, so you can come back to it.
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex gap-3">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                        {SHIPPING.label}, tracked.
                      </li>
                      <li className="flex gap-3">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                        Free delivery on orders over{" "}
                        {formatMoney(SHIPPING.freeOverMinor, product.currency)}.
                      </li>
                    </>
                  )}
                  <li className="flex gap-3">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                    Secure payment by card, Apple Pay or Google Pay through Stripe.
                  </li>
                </ul>
              </Reveal>
            </div>
          </div>

          {product.description ? (
            <Reveal delay={0.1}>
              <div className="mt-20 max-w-[68ch] border-t border-hairline pt-12">
                <h2 className="display text-[1.6rem]">What you get</h2>
                <div className="mt-5 grid gap-4 text-[0.98rem] leading-relaxed text-ink-muted">
                  {product.description
                    .split(/\n{2,}/)
                    .map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                </div>
              </div>
            </Reveal>
          ) : null}

          {related.length ? (
            <section className="mt-24 border-t border-hairline pt-14">
              <Reveal>
                <h2 className="display text-[1.6rem]">You might also like</h2>
              </Reveal>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((item, index) => (
                  <Reveal key={item.id} delay={index * 0.05}>
                    <ProductCard product={item} />
                  </Reveal>
                ))}
              </div>
            </section>
          ) : null}
        </article>
      </div>

      <Footer />
    </main>
  );
}
