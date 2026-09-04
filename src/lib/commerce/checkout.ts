/**
 * Turning a cart into a Stripe Checkout Session.
 *
 * The cart the browser posts is treated as a list of *intentions*, never as
 * facts: only the product ids and quantities are read, and every price, title
 * and stock check is loaded fresh from Mongo. That is the whole reason the
 * client cannot set its own price.
 *
 * The order row is written as `pending` before the redirect so that the Stripe
 * webhook has something to promote, and so an abandoned checkout leaves a
 * visible trail in the admin rather than vanishing.
 */

import crypto from "crypto";
import type Stripe from "stripe";
import { connectToDatabase } from "./db";
import { ProductModel, type ProductDoc } from "./models/Product";
import { OrderModel } from "./models/Order";
import { getStripe } from "./stripe";
import { commerceEnv } from "./env";
import { calculateShipping, needsShipping, SHIPPING } from "./shipping";
import { minorUnitFactor } from "./money";
import type { CartLine, ProductKind } from "@/types/commerce";

const MAX_QUANTITY_PER_LINE = 20;

export class CheckoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CheckoutError";
  }
}

/** `JW-7K3P-4821`: short enough to read down the phone, unique enough to index. */
export function generateOrderNumber() {
  const block = () =>
    crypto.randomBytes(3).toString("hex").toUpperCase().slice(0, 4);
  return `JW-${block()}-${block()}`;
}

type PricedLine = {
  product: ProductDoc;
  quantity: number;
  lineTotalMinor: number;
};

/**
 * Re-prices a cart against the database.
 *
 * Digital goods are forced to quantity 1 — buying the same file twice is not a
 * thing, and letting it through would double-charge for one download grant.
 */
export async function priceCart(lines: CartLine[]): Promise<{
  lines: PricedLine[];
  subtotalMinor: number;
  shippingMinor: number;
  totalMinor: number;
  kinds: ProductKind[];
  currency: string;
}> {
  await connectToDatabase();

  const wanted = new Map<string, number>();
  for (const line of lines) {
    const quantity = Math.floor(Number(line.quantity));
    if (!line.productId || !Number.isFinite(quantity) || quantity < 1) continue;
    wanted.set(
      line.productId,
      Math.min(
        MAX_QUANTITY_PER_LINE,
        (wanted.get(line.productId) ?? 0) + quantity
      )
    );
  }

  if (wanted.size === 0) throw new CheckoutError("Your basket is empty.");

  const products = await ProductModel.find({
    _id: { $in: [...wanted.keys()] },
    status: "active",
  }).exec();

  if (products.length === 0) {
    throw new CheckoutError("Nothing in your basket is available any more.");
  }

  const priced: PricedLine[] = [];

  for (const product of products) {
    const requested = wanted.get(String(product._id)) ?? 0;
    const quantity = product.kind === "digital" ? 1 : requested;

    // `stock` is nullable in the schema, so Mongoose types it as
    // `number | null | undefined`; both empty cases mean "untracked".
    const stock = product.stock ?? null;
    if (product.kind === "physical" && stock !== null) {
      if (stock <= 0) {
        throw new CheckoutError(`"${product.title}" is sold out.`);
      }
      if (quantity > stock) {
        throw new CheckoutError(`Only ${stock} left of "${product.title}".`);
      }
    }

    priced.push({
      product,
      quantity,
      lineTotalMinor: product.priceMinor * quantity,
    });
  }

  const subtotalMinor = priced.reduce((sum, line) => sum + line.lineTotalMinor, 0);
  const kinds = priced.map((line) => line.product.kind as ProductKind);
  const shippingMinor = calculateShipping(subtotalMinor, kinds);

  return {
    lines: priced,
    subtotalMinor,
    shippingMinor,
    totalMinor: subtotalMinor + shippingMinor,
    kinds,
    currency: priced[0]?.product.currency ?? commerceEnv.currency,
  };
}

/**
 * Creates the pending order and the Stripe session, and returns the URL to
 * send the browser to.
 */
export async function createCheckoutSession(options: {
  cart: CartLine[];
  userId: string | null;
  email: string | null;
  name: string | null;
}) {
  const stripe = getStripe();
  const priced = await priceCart(options.cart);
  const orderNumber = generateOrderNumber();

  const order = await OrderModel.create({
    orderNumber,
    userId: options.userId,
    email: options.email ?? "",
    customerName: options.name ?? "",
    items: priced.lines.map((line) => ({
      productId: line.product._id,
      slug: line.product.slug,
      title: line.product.title,
      kind: line.product.kind,
      unitPriceMinor: line.product.priceMinor,
      quantity: line.quantity,
      imageUrl: line.product.images?.[0]?.url ?? "",
    })),
    subtotalMinor: priced.subtotalMinor,
    shippingMinor: priced.shippingMinor,
    totalMinor: priced.totalMinor,
    currency: priced.currency,
    status: "pending",
    // A download-only order has nothing to pack, and should not sit in the
    // admin's "needs fulfilling" queue forever.
    fulfillmentStatus: needsShipping(priced.kinds) ? "unfulfilled" : "not_required",
  });

  const factor = minorUnitFactor(priced.currency);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    // `price_data` rather than stored Stripe Prices: the catalogue lives in
    // Mongo, and mirroring every edit into Stripe is a sync problem nobody
    // needs for a shop this size.
    line_items: priced.lines.map((line) => ({
      quantity: line.quantity,
      price_data: {
        currency: priced.currency.toLowerCase(),
        unit_amount: line.product.priceMinor,
        product_data: {
          name: line.product.title,
          ...(line.product.summary ? { description: line.product.summary } : {}),
          ...(line.product.images?.[0]?.url
            ? { images: [line.product.images[0].url] }
            : {}),
          metadata: { productId: String(line.product._id) },
        },
      },
    })),

    ...(needsShipping(priced.kinds)
      ? {
          shipping_address_collection: {
            allowed_countries:
              SHIPPING.countries as unknown as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[],
          },
          shipping_options: [
            {
              shipping_rate_data: {
                type: "fixed_amount" as const,
                display_name:
                  priced.shippingMinor === 0
                    ? "Free delivery"
                    : SHIPPING.label,
                fixed_amount: {
                  amount: priced.shippingMinor,
                  currency: priced.currency.toLowerCase(),
                },
                delivery_estimate: {
                  minimum: {
                    unit: "business_day" as const,
                    value: SHIPPING.estimateDays.min,
                  },
                  maximum: {
                    unit: "business_day" as const,
                    value: SHIPPING.estimateDays.max,
                  },
                },
              },
            },
          ],
        }
      : {}),

    ...(options.email ? { customer_email: options.email } : {}),

    // The webhook trusts this, and only this, to find its order.
    metadata: { orderId: String(order._id), orderNumber },
    payment_intent_data: {
      metadata: { orderId: String(order._id), orderNumber },
    },

    success_url: `${commerceEnv.siteUrl}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${commerceEnv.siteUrl}/cart?cancelled=1`,
    // Abandoned sessions expire and stop holding a pending order open.
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
  });

  order.stripeSessionId = session.id;
  await order.save();

  if (!session.url) {
    throw new CheckoutError("Stripe did not return a checkout URL.");
  }

  return {
    url: session.url,
    orderId: String(order._id),
    orderNumber,
    totalMajor: priced.totalMinor / factor,
  };
}
