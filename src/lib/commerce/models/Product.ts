/**
 * Product documents.
 *
 * One collection covers both kinds of goods. `kind: "physical"` uses `stock`
 * and `weightGrams`; `kind: "digital"` uses the `digital` sub-document, which
 * holds the Cloudinary id of a privately-stored file. The two never overlap,
 * and `toPublicProduct` in ../serialize.ts makes sure the digital asset id
 * never reaches a browser.
 */

import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const ImageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    alt: { type: String, default: "" },
  },
  { _id: false }
);

const DigitalSchema = new Schema(
  {
    publicId: { type: String, required: true },
    fileName: { type: String, default: "" },
    format: { type: String, default: "" },
    bytes: { type: Number, default: 0 },
    resourceType: { type: String, default: "raw" },
    downloadLimit: { type: Number, default: 5, min: 1 },
    expiryHours: { type: Number, default: 720, min: 1 },
  },
  { _id: false }
);

const ProductSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    summary: { type: String, default: "" },
    description: { type: String, default: "" },
    kind: {
      type: String,
      enum: ["physical", "digital"],
      required: true,
      default: "digital",
    },
    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "draft",
      index: true,
    },
    featured: { type: Boolean, default: false },

    priceMinor: { type: Number, required: true, min: 0 },
    compareAtMinor: { type: Number, default: null },
    currency: { type: String, default: "GBP", uppercase: true },

    images: { type: [ImageSchema], default: [] },
    category: { type: String, default: "", trim: true },
    tags: { type: [String], default: [] },

    // null = untracked stock, so "unlimited" and "sold out" stay distinct.
    stock: { type: Number, default: null },
    weightGrams: { type: Number, default: null },

    digital: { type: DigitalSchema, default: null },
  },
  { timestamps: true }
);

// The storefront always filters on status and sorts by recency.
ProductSchema.index({ status: 1, createdAt: -1 });
// Powers the admin search box and the storefront's search param.
ProductSchema.index({ title: "text", summary: "text", tags: "text" });

export type ProductDoc = InferSchemaType<typeof ProductSchema> & {
  _id: import("mongoose").Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const ProductModel: Model<ProductDoc> =
  (models.Product as Model<ProductDoc>) ??
  model<ProductDoc>("Product", ProductSchema);
