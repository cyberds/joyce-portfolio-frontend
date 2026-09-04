/**
 * POST /api/commerce/checkout
 *
 * Takes the browser's cart, re-prices it server-side, writes a pending order
 * and returns the Stripe Checkout URL to redirect to. Signing in is optional:
 * a signed-in shopper gets the order attached to their Clerk id so it shows up
 * in /account, a guest gets it attached to the email Stripe collects.
 */

import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, fail } from "@/lib/commerce/api";
import { createCheckoutSession } from "@/lib/commerce/checkout";
import { getViewer } from "@/lib/commerce/auth";
import { hasDatabase, hasStripe } from "@/lib/commerce/env";

const BodySchema = z.object({
  cart: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(20),
      })
    )
    .min(1, "Your basket is empty."),
});

export async function POST(request: NextRequest) {
  return handle(async () => {
    if (!hasDatabase() || !hasStripe()) {
      return fail(
        "The shop is not finished being set up yet. Please try again shortly.",
        503
      );
    }

    const body = BodySchema.parse(await request.json());
    const viewer = await getViewer();

    const session = await createCheckoutSession({
      cart: body.cart,
      userId: viewer?.userId ?? null,
      email: viewer?.email ?? null,
      name: viewer?.name ?? null,
    });

    return { url: session.url, orderNumber: session.orderNumber };
  });
}
