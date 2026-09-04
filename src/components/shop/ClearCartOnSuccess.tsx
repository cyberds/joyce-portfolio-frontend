"use client";

import { useEffect } from "react";
import { useCart } from "./CartProvider";

/**
 * Empties the basket once the shopper actually lands on the success page.
 *
 * Clearing at the moment of redirect would lose the basket of anyone who
 * abandoned Stripe or hit a card decline. This is the first point where the
 * purchase is genuinely over.
 */
export function ClearCartOnSuccess() {
  const { clear, ready } = useCart();

  useEffect(() => {
    if (ready) clear();
  }, [ready, clear]);

  return null;
}
