"use client";

import Link from "next/link";
import Image from "next/image";
import { formatMoney } from "@/lib/commerce/money";
import { AddToCartButton } from "./AddToCartButton";
import { DownloadIcon, BoxIcon } from "./icons";
import type { PublicProduct } from "@/types/commerce";

/**
 * One product in the grid.
 *
 * The whole card is a link to the detail page, with the add-to-cart button
 * layered on top — nesting a button inside an anchor is invalid HTML and
 * breaks keyboard use, so the link is an absolutely-positioned overlay and the
 * button sits above it on the z axis.
 */
export function ProductCard({ product }: { product: PublicProduct }) {
  const image = product.images[0];
  const soldOut = product.kind === "physical" && product.stock === 0;
  const onSale =
    product.compareAtMinor !== null && product.compareAtMinor > product.priceMinor;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[var(--r-lg)] border border-hairline bg-surface transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-40px_rgba(36,19,25,0.45)]">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-canvas-deep">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt || product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-faint">
            {product.kind === "digital" ? (
              <DownloadIcon className="size-8" />
            ) : (
              <BoxIcon className="size-8" />
            )}
          </div>
        )}

        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-[var(--r-pill)] bg-surface/90 px-3 py-1.5 text-[0.7rem] font-medium backdrop-blur-sm">
          {product.kind === "digital" ? (
            <>
              <DownloadIcon /> Instant download
            </>
          ) : (
            <>
              <BoxIcon /> Shipped
            </>
          )}
        </span>

        {onSale && !soldOut ? (
          <span className="absolute right-4 top-4 rounded-[var(--r-pill)] bg-accent px-3 py-1.5 text-[0.7rem] font-medium text-surface">
            Save{" "}
            {formatMoney(
              product.compareAtMinor! - product.priceMinor,
              product.currency
            )}
          </span>
        ) : null}

        {soldOut ? (
          <span className="absolute right-4 top-4 rounded-[var(--r-pill)] bg-ink px-3 py-1.5 text-[0.7rem] font-medium text-surface">
            Sold out
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-6">
        {product.category ? (
          <p className="eyebrow text-ink-faint">{product.category}</p>
        ) : null}

        <h3 className="display mt-2 text-[1.3rem] leading-tight">
          {/* The card's click target. Everything else sits above it. */}
          <Link href={`/shop/${product.slug}`} className="after:absolute after:inset-0">
            {product.title}
          </Link>
        </h3>

        {product.summary ? (
          <p className="mt-2.5 line-clamp-2 text-[0.88rem] leading-relaxed text-ink-muted">
            {product.summary}
          </p>
        ) : null}

        <div className="mt-5 flex items-end justify-between gap-4 pt-1">
          <p className="flex items-baseline gap-2">
            <span className="text-[1.15rem] font-medium">
              {formatMoney(product.priceMinor, product.currency)}
            </span>
            {onSale ? (
              <span className="text-[0.85rem] text-ink-faint line-through">
                {formatMoney(product.compareAtMinor!, product.currency)}
              </span>
            ) : null}
          </p>

          <div className="relative z-10">
            <AddToCartButton product={product} compact />
          </div>
        </div>
      </div>
    </article>
  );
}
