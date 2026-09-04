"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import { BagIcon } from "./icons";

/**
 * The basket in the top bar.
 *
 * The count only appears once the cart has been read from localStorage
 * (`ready`), because rendering it on the server as 0 and then as 3 on the
 * client is a hydration mismatch — and a visible flicker.
 */
export function CartButton({ onDark = false }: { onDark?: boolean }) {
  const { count, ready } = useCart();

  return (
    <Link
      href="/cart"
      aria-label={
        ready && count > 0 ? `Basket, ${count} item${count === 1 ? "" : "s"}` : "Basket"
      }
      className={`relative flex size-10 items-center justify-center rounded-[var(--r-pill)] border transition-colors ${
        onDark
          ? "border-deep-ink/20 text-deep-ink hover:bg-deep-ink/10"
          : "border-hairline bg-surface text-ink hover:bg-canvas-deep"
      }`}
    >
      <BagIcon className="size-[18px]" />
      {ready && count > 0 ? (
        <span className="absolute -right-1 -top-1 flex min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[0.65rem] font-semibold leading-[18px] text-surface">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
