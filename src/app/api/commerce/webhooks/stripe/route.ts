/**
 * POST /api/commerce/webhooks/stripe
 *
 * The only place an order is allowed to become `paid`. The success page the
 * shopper lands on is just a URL — anyone can visit it — so nothing there may
 * grant anything.
 *
 * The signature is checked against the *raw* body, so this route must read
 * `request.text()` and never `request.json()`: parsing and re-serialising
 * changes the bytes and invalidates the signature.
 *
 * Local testing:
 *   stripe listen --forward-to localhost:3000/api/commerce/webhooks/stripe
 */

import type { NextRequest } from "next/server";
import type Stripe from "stripe";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/commerce/stripe";
import { commerceEnv, hasStripe } from "@/lib/commerce/env";
import {
  fulfillOrder,
  markOrderFailed,
  markOrderRefunded,
} from "@/lib/commerce/fulfillment";

// Stripe needs the unbuffered body; this route must never be statically
// evaluated or cached.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!hasStripe() || !commerceEnv.stripeWebhookSecret) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const stripe = getStripe();
  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      payload,
      signature,
      commerceEnv.stripeWebhookSecret
    );
  } catch (error) {
    console.error("[stripe] signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        // A session can complete before an async method (bank debit) settles.
        if (session.payment_status === "paid") {
          await fulfillOrder(session);
        }
        break;
      }

      case "checkout.session.async_payment_succeeded":
        await fulfillOrder(event.data.object);
        break;

      case "checkout.session.async_payment_failed": {
        const orderId = event.data.object.metadata?.orderId;
        if (orderId) await markOrderFailed(orderId, "failed");
        break;
      }

      case "checkout.session.expired": {
        const orderId = event.data.object.metadata?.orderId;
        if (orderId) await markOrderFailed(orderId, "cancelled");
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object;
        const intent =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent?.id;
        if (intent) await markOrderRefunded(intent);
        break;
      }

      default:
        // Everything else is deliberately ignored, with a 200 so Stripe stops
        // retrying it.
        break;
    }
  } catch (error) {
    // A 500 makes Stripe retry, which is what we want for a transient Mongo or
    // ZeptoMail blip — `fulfillOrder` is idempotent, so a retry is safe.
    console.error(`[stripe] handler failed for ${event.type}`, error);
    return NextResponse.json({ error: "Handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
