/**
 * Order documents.
 *
 * An order is written as `pending` before the shopper is sent to Stripe, and
 * is only promoted to `paid` by the Stripe webhook — never by the browser
 * coming back to the success page, which is trivially forged. Line prices are
 * copied in at checkout time so a later price edit cannot rewrite history.
 *
 * Download grants live inside the order rather than in their own collection:
 * a grant has no meaning apart from the order that paid for it, and embedding
 * makes "show me this customer's downloads" a single document read.
 */

import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const ItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    slug: { type: String, default: "" },
    title: { type: String, required: true },
    kind: { type: String, enum: ["physical", "digital"], required: true },
    unitPriceMinor: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    imageUrl: { type: String, default: "" },
  },
  { _id: false }
);

const DownloadSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    title: { type: String, default: "" },
    token: { type: String, required: true },
    downloadCount: { type: Number, default: 0 },
    maxDownloads: { type: Number, default: 5 },
    expiresAt: { type: Date, required: true },
  },
  { _id: false }
);

const AddressSchema = new Schema(
  {
    name: { type: String, default: "" },
    line1: { type: String, default: "" },
    line2: { type: String, default: "" },
    city: { type: String, default: "" },
    postalCode: { type: String, default: "" },
    state: { type: String, default: "" },
    country: { type: String, default: "" },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },

    stripeSessionId: { type: String, default: "", index: true },
    stripePaymentIntentId: { type: String, default: "" },

    // Null for guest checkout — the shop does not force an account to buy.
    userId: { type: String, default: null, index: true },
    email: { type: String, default: "", lowercase: true, trim: true, index: true },
    customerName: { type: String, default: "" },

    items: { type: [ItemSchema], default: [] },

    subtotalMinor: { type: Number, required: true, min: 0 },
    shippingMinor: { type: Number, default: 0, min: 0 },
    totalMinor: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "GBP", uppercase: true },

    status: {
      type: String,
      enum: ["pending", "paid", "failed", "cancelled", "refunded"],
      default: "pending",
      index: true,
    },
    fulfillmentStatus: {
      type: String,
      enum: ["not_required", "unfulfilled", "fulfilled", "shipped", "delivered"],
      default: "unfulfilled",
      index: true,
    },

    shippingAddress: { type: AddressSchema, default: null },
    trackingCarrier: { type: String, default: "" },
    trackingNumber: { type: String, default: "" },

    downloads: { type: [DownloadSchema], default: [] },

    notes: { type: String, default: "" },
    receiptSentAt: { type: Date, default: null },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// The download route looks an order up by grant token alone.
OrderSchema.index({ "downloads.token": 1 });
// Admin list and the customer's account page are both "newest first".
OrderSchema.index({ createdAt: -1 });

export type OrderDoc = InferSchemaType<typeof OrderSchema> & {
  _id: import("mongoose").Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const OrderModel: Model<OrderDoc> =
  (models.Order as Model<OrderDoc>) ?? model<OrderDoc>("Order", OrderSchema);
