"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";
import { BagIcon, CheckIcon } from "./icons";
import type { PublicProduct } from "@/types/commerce";

/**
 * Adds a product to the cart and says so.
 *
 * The confirmation is inline and brief rather than a toast: the shopper is
 * looking at the button they just pressed, and a message that appears
 * somewhere else asks them to look for it.
 */
export function AddToCartButton({
  product,
  quantity = 1,
  compact = false,
  className = "",
}: {
  product: PublicProduct;
  quantity?: number;
  compact?: boolean;
  className?: string;
}) {
  const { add, lines } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const soldOut = product.kind === "physical" && product.stock === 0;
  const inCart = lines.find((line) => line.productId === product.id)?.quantity ?? 0;
  // A digital product is a single licence — once it is in, it is in.
  const alreadyOwned = product.kind === "digital" && inCart > 0;

  const handleAdd = () => {
    add(product.id, quantity);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1800);
  };

  if (soldOut) {
    return (
      <span
        className={`inline-flex items-center rounded-[var(--r-pill)] border border-hairline px-4 py-2.5 text-[0.85rem] text-ink-faint ${className}`}
      >
        Sold out
      </span>
    );
  }

  const label = alreadyOwned
    ? "In your basket"
    : justAdded
      ? "Added"
      : compact
        ? "Add"
        : "Add to basket";

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={alreadyOwned}
      aria-label={compact ? `Add ${product.title} to basket` : undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-[var(--r-pill)] font-medium transition-all duration-300 disabled:cursor-default disabled:opacity-55 ${
        compact ? "px-4 py-2.5 text-[0.82rem]" : "px-6 py-3.5 text-[0.92rem]"
      } ${
        justAdded
          ? "bg-apple text-ink"
          : "bg-ink text-surface hover:-translate-y-0.5 disabled:hover:translate-y-0"
      } ${className}`}
    >
      {justAdded ? <CheckIcon /> : <BagIcon />}
      {label}
    </button>
  );
}
