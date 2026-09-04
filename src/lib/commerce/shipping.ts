/**
 * Shipping rules.
 *
 * Deliberately simple and in code rather than in the database: one flat rate,
 * free over a threshold, nothing at all when the basket is entirely digital.
 * When Joyce needs zones or weight bands, this is the one file to grow — every
 * caller goes through `calculateShipping`.
 *
 * Rates are in the store currency's minor unit.
 */

import type { ProductKind } from "@/types/commerce";

export const SHIPPING = {
  /** Flat rate applied to any basket containing a physical item. */
  flatRateMinor: 495,
  /** Subtotal at or above which shipping is free. */
  freeOverMinor: 5000,
  /** Countries Stripe Checkout will collect an address for. */
  countries: ["GB", "IE", "US", "CA", "AU", "NZ", "DE", "FR", "NL", "ES", "IT"],
  label: "Standard delivery (3–5 working days)",
  estimateDays: { min: 3, max: 5 },
} as const;

export function needsShipping(kinds: ProductKind[]) {
  return kinds.some((kind) => kind === "physical");
}

/** Shipping cost for a basket, in minor units. */
export function calculateShipping(subtotalMinor: number, kinds: ProductKind[]) {
  if (!needsShipping(kinds)) return 0;
  if (subtotalMinor >= SHIPPING.freeOverMinor) return 0;
  return SHIPPING.flatRateMinor;
}
