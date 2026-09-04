"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "./CartProvider";
import { DownloadIcon, BoxIcon, TrashIcon, SpinnerIcon } from "./icons";
import { formatMoney } from "@/lib/commerce/money";
import type { PublicProduct } from "@/types/commerce";

type HydratedLine = {
  product: PublicProduct;
  quantity: number;
  lineTotalMinor: number;
};

type CartResponse = {
  lines: HydratedLine[];
  removed: string[];
  subtotalMinor: number;
  shippingMinor: number;
  totalMinor: number;
  currency: string;
};

/**
 * The basket.
 *
 * Titles, prices and stock are fetched from the server on every change rather
 * than cached in localStorage — so the number the shopper agrees to here is
 * the number checkout will re-derive a moment later, and a sold-out item is
 * caught before Stripe rather than after.
 */
export function CartView() {
  const { lines, setQuantity, remove, ready } = useCart();
  const [data, setData] = useState<CartResponse | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;

    // `cancelled` guards the state writes: editing a quantity re-runs this
    // effect, and an earlier, slower response must not overwrite a later one.
    let cancelled = false;

    // Every setState below happens after an await, never synchronously while
    // the effect body runs — that is what keeps this out of a render cascade.
    void (async () => {
      try {
        const response = await fetch("/api/commerce/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cart: lines }),
        });
        const payload = await response.json();
        if (cancelled) return;

        if (!response.ok) {
          throw new Error(payload.error ?? "Could not load your basket.");
        }

        setData(payload as CartResponse);
        setError(null);

        // Anything the server dropped (unpublished, deleted, sold out) has to
        // leave localStorage too, or it reappears on the next render.
        for (const productId of payload.removed ?? []) remove(productId);
      } catch (caught) {
        if (cancelled) return;
        setError(
          caught instanceof Error ? caught.message : "Could not load your basket."
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, lines, remove]);

  const checkout = async () => {
    setCheckingOut(true);
    setError(null);
    try {
      const response = await fetch("/api/commerce/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart: lines }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Checkout is unavailable.");
      // Deliberately not clearing the cart here: if Stripe is unreachable or
      // the shopper backs out, an emptied basket would be a worse bug than a
      // duplicate. It is cleared on the success page instead.
      window.location.href = payload.url;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Checkout is unavailable.");
      setCheckingOut(false);
    }
  };

  // A failed first load must not spin forever — say so, and offer the way out.
  if (!data && error) {
    return (
      <div className="rounded-[var(--r-lg)] border border-hairline bg-surface p-10 text-center">
        <p className="text-[0.95rem]">{error}</p>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-[var(--r-pill)] bg-ink px-6 py-3.5 text-[0.9rem] text-surface"
        >
          Back to the shop
        </Link>
      </div>
    );
  }

  if (!ready || !data) {
    return (
      <div className="flex items-center gap-3 py-20 text-ink-muted">
        <SpinnerIcon /> Loading your basket…
      </div>
    );
  }

  if (data.lines.length === 0) {
    return (
      <div className="rounded-[var(--r-lg)] border border-dashed border-hairline bg-surface/60 p-14 text-center">
        <p className="display text-[1.5rem]">Your basket is empty</p>
        <p className="mt-3 text-[0.92rem] text-ink-muted">
          Templates, toolkits and playbooks are waiting in the shop.
        </p>
        <Link
          href="/shop"
          className="mt-7 inline-block rounded-[var(--r-pill)] bg-ink px-6 py-3.5 text-[0.9rem] text-surface transition-transform duration-300 hover:-translate-y-0.5"
        >
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.5fr_0.8fr] lg:gap-14">
      <ul className="grid gap-4">
        {data.lines.map((line) => {
          const image = line.product.images[0];
          const max =
            line.product.kind === "digital"
              ? 1
              : line.product.stock === null
                ? 20
                : Math.min(20, line.product.stock);

          return (
            <li
              key={line.product.id}
              className="flex gap-5 rounded-[var(--r-lg)] border border-hairline bg-surface p-4 sm:p-5"
            >
              <Link
                href={`/shop/${line.product.slug}`}
                className="relative size-24 shrink-0 overflow-hidden rounded-[var(--r-sm)] bg-canvas-deep"
              >
                {image ? (
                  <Image
                    src={image.url}
                    alt={image.alt || line.product.title}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-ink-faint">
                    {line.product.kind === "digital" ? <DownloadIcon /> : <BoxIcon />}
                  </span>
                )}
              </Link>

              <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                <div>
                  <Link
                    href={`/shop/${line.product.slug}`}
                    className="display text-[1.1rem] leading-tight hover:text-accent"
                  >
                    {line.product.title}
                  </Link>
                  <p className="mt-1 text-[0.78rem] text-ink-faint">
                    {line.product.kind === "digital"
                      ? "Instant download"
                      : "Physical item"}
                    {" · "}
                    {formatMoney(line.product.priceMinor, data.currency)} each
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  {line.product.kind === "digital" ? (
                    <span className="text-[0.82rem] text-ink-faint">Quantity 1</span>
                  ) : (
                    <div className="flex items-center rounded-[var(--r-pill)] border border-hairline">
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity(line.product.id, line.quantity - 1)
                        }
                        aria-label={`Reduce quantity of ${line.product.title}`}
                        className="px-3.5 py-1.5 text-ink-muted transition-colors hover:text-ink"
                      >
                        −
                      </button>
                      <span className="min-w-6 text-center text-[0.85rem]">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        disabled={line.quantity >= max}
                        onClick={() =>
                          setQuantity(line.product.id, line.quantity + 1)
                        }
                        aria-label={`Increase quantity of ${line.product.title}`}
                        className="px-3.5 py-1.5 text-ink-muted transition-colors hover:text-ink disabled:opacity-35"
                      >
                        +
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => remove(line.product.id)}
                    className="inline-flex items-center gap-1.5 text-[0.8rem] text-ink-faint transition-colors hover:text-accent"
                  >
                    <TrashIcon /> Remove
                  </button>
                </div>
              </div>

              <p className="shrink-0 self-center text-[0.98rem] font-medium">
                {formatMoney(line.lineTotalMinor, data.currency)}
              </p>
            </li>
          );
        })}
      </ul>

      <aside className="h-fit rounded-[var(--r-lg)] border border-hairline bg-surface p-6 lg:sticky lg:top-28">
        <h2 className="display text-[1.35rem]">Summary</h2>

        <dl className="mt-6 grid gap-3 text-[0.9rem]">
          <div className="flex justify-between">
            <dt className="text-ink-muted">Subtotal</dt>
            <dd>{formatMoney(data.subtotalMinor, data.currency)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-muted">Shipping</dt>
            <dd>
              {data.shippingMinor === 0
                ? data.lines.every((line) => line.product.kind === "digital")
                  ? "Not needed"
                  : "Free"
                : formatMoney(data.shippingMinor, data.currency)}
            </dd>
          </div>
          <div className="mt-2 flex justify-between border-t border-hairline pt-4 text-[1.05rem] font-medium">
            <dt>Total</dt>
            <dd>{formatMoney(data.totalMinor, data.currency)}</dd>
          </div>
        </dl>

        {error ? (
          <p className="mt-5 rounded-[var(--r-sm)] bg-accent-soft px-4 py-3 text-[0.85rem] text-ink">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={checkout}
          disabled={checkingOut}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[var(--r-pill)] bg-accent px-6 py-4 text-[0.95rem] font-medium text-surface transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0"
        >
          {checkingOut ? <SpinnerIcon /> : null}
          {checkingOut ? "Taking you to Stripe…" : "Checkout securely"}
        </button>

        <p className="mt-4 text-center text-[0.78rem] leading-relaxed text-ink-faint">
          Payment is handled by Stripe. Your card details never touch this site.
        </p>

        <Link
          href="/shop"
          className="mt-5 block text-center text-[0.85rem] text-ink-muted underline underline-offset-4 hover:text-ink"
        >
          Keep shopping
        </Link>
      </aside>
    </div>
  );
}
