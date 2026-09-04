/**
 * Stripe client.
 *
 * Lazily constructed so that importing anything from the commerce module in a
 * project without keys does not throw at module-evaluation time — which would
 * take down the whole route, not just the shop.
 *
 * `apiVersion` is deliberately not pinned here: stripe-node 22 already pins
 * itself to the version its types were generated from, and overriding it is
 * how you end up with types that disagree with the wire format.
 */

import Stripe from "stripe";
import { commerceEnv } from "./env";

let client: Stripe | null = null;

export function getStripe(): Stripe {
  if (!commerceEnv.stripeSecretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to .env.local to enable checkout."
    );
  }
  if (!client) {
    client = new Stripe(commerceEnv.stripeSecretKey, {
      appInfo: { name: "Joyce Wadawasina Shop" },
    });
  }
  return client;
}
