/**
 * What happens once Stripe says the money arrived.
 *
 * Called only from the Stripe webhook. Stripe retries a webhook it did not get
 * a 2xx for, and can deliver the same event more than once, so `fulfillOrder`
 * is idempotent: it claims the order with a conditional update that only
 * matches while the status is still `pending`. A second delivery loses the
 * race, finds nothing to update, and returns without re-sending the receipt or
 * decrementing stock twice.
 */

import crypto from "crypto";
import type Stripe from "stripe";
import { connectToDatabase } from "./db";
import { OrderModel } from "./models/Order";
import { ProductModel } from "./models/Product";
import { toOrder } from "./serialize";
import {
  adminNewOrderEmail,
  orderConfirmationEmail,
  sendEmail,
} from "./email";
import { commerceEnv } from "./env";

/** URL-safe, 32 chars of entropy — not guessable, not tied to the order id. */
export function generateDownloadToken() {
  return crypto.randomBytes(24).toString("base64url");
}

function addressFrom(
  session: Stripe.Checkout.Session
): Record<string, string> | null {
  const collected = session.collected_information?.shipping_details;
  const address = collected?.address;
  if (!address) return null;
  return {
    name: collected?.name ?? "",
    line1: address.line1 ?? "",
    line2: address.line2 ?? "",
    city: address.city ?? "",
    postalCode: address.postal_code ?? "",
    state: address.state ?? "",
    country: address.country ?? "",
  };
}

export async function fulfillOrder(session: Stripe.Checkout.Session) {
  await connectToDatabase();

  const orderId = session.metadata?.orderId;
  if (!orderId) {
    console.error("[stripe] checkout session without orderId metadata", session.id);
    return { handled: false as const, reason: "missing_metadata" };
  }

  // The claim. Only one delivery of this event can match `status: "pending"`.
  const claimed = await OrderModel.findOneAndUpdate(
    { _id: orderId, status: "pending" },
    { $set: { status: "paid", paidAt: new Date() } },
    { new: true }
  ).exec();

  if (!claimed) {
    return { handled: true as const, reason: "already_fulfilled" };
  }

  const email =
    session.customer_details?.email ?? claimed.email ?? "";
  const customerName =
    session.customer_details?.name ?? claimed.customerName ?? "";

  claimed.email = email.toLowerCase();
  claimed.customerName = customerName;
  claimed.stripePaymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? "");

  const address = addressFrom(session);
  if (address) claimed.shippingAddress = address as never;

  // Stripe is the authority on what was actually charged, including any
  // shipping rate the shopper picked at Checkout.
  if (typeof session.amount_total === "number") {
    claimed.totalMinor = session.amount_total;
    claimed.shippingMinor =
      session.total_details?.amount_shipping ?? claimed.shippingMinor;
    claimed.subtotalMinor = session.amount_subtotal ?? claimed.subtotalMinor;
  }

  /* ---- Digital goods: mint one download grant per line ---- */

  const digitalItems = claimed.items.filter((item) => item.kind === "digital");
  if (digitalItems.length > 0) {
    const products = await ProductModel.find({
      _id: { $in: digitalItems.map((item) => item.productId) },
    }).exec();

    const byId = new Map(products.map((product) => [String(product._id), product]));

    claimed.downloads = digitalItems.map((item) => {
      const product = byId.get(String(item.productId));
      const limit = product?.digital?.downloadLimit ?? 5;
      const hours = product?.digital?.expiryHours ?? 720;
      return {
        productId: item.productId,
        title: item.title,
        token: generateDownloadToken(),
        downloadCount: 0,
        maxDownloads: limit,
        expiresAt: new Date(Date.now() + hours * 60 * 60 * 1000),
      };
    }) as never;
  }

  /* ---- Physical goods: draw down tracked stock ---- */

  const physicalItems = claimed.items.filter((item) => item.kind === "physical");
  await Promise.all(
    physicalItems.map((item) =>
      ProductModel.updateOne(
        { _id: item.productId, stock: { $ne: null } },
        { $inc: { stock: -item.quantity } }
      ).exec()
    )
  );

  await claimed.save();

  /* ---- Email ---- */

  const order = toOrder(claimed);

  if (order.email) {
    const receipt = orderConfirmationEmail(order);
    const sent = await sendEmail({
      to: order.email,
      toName: order.customerName,
      subject: receipt.subject,
      html: receipt.html,
      replyTo: commerceEnv.supportEmail,
    });
    if (sent.ok) {
      claimed.receiptSentAt = new Date();
      await claimed.save();
    }
  }

  // Owner notification is best-effort and must never fail the webhook.
  const notify = commerceEnv.adminEmails[0] ?? commerceEnv.supportEmail;
  if (notify) {
    const alert = adminNewOrderEmail(order);
    await sendEmail({ to: notify, subject: alert.subject, html: alert.html });
  }

  return { handled: true as const, orderNumber: order.orderNumber };
}

/** `payment_intent.payment_failed` / expired session: release the pending order. */
export async function markOrderFailed(orderId: string, reason: "failed" | "cancelled") {
  await connectToDatabase();
  await OrderModel.updateOne(
    { _id: orderId, status: "pending" },
    { $set: { status: reason } }
  ).exec();
}

/** `charge.refunded`: flag the order and put tracked stock back. */
export async function markOrderRefunded(paymentIntentId: string) {
  await connectToDatabase();

  const order = await OrderModel.findOneAndUpdate(
    { stripePaymentIntentId: paymentIntentId, status: "paid" },
    { $set: { status: "refunded" } },
    { new: false }
  ).exec();

  if (!order) return;

  await Promise.all(
    order.items
      .filter((item) => item.kind === "physical")
      .map((item) =>
        ProductModel.updateOne(
          { _id: item.productId, stock: { $ne: null } },
          { $inc: { stock: item.quantity } }
        ).exec()
      )
  );
}
