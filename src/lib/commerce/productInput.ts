/**
 * Validation for the admin product form.
 *
 * The shape is shared by create (POST) and edit (PATCH); edit reuses it via
 * `.partial()`. Prices arrive as major-unit strings from a number input and
 * are converted here, once, so nothing downstream ever sees a float.
 */

import { z } from "zod";
import { parseMajorToMinor } from "./money";
import { commerceEnv } from "./env";

const priceField = z
  .union([z.string(), z.number()])
  .transform((value, ctx) => {
    const minor = parseMajorToMinor(value, commerceEnv.currency);
    if (minor === null) {
      ctx.addIssue({ code: "custom", message: "Enter a valid price." });
      return z.NEVER;
    }
    return minor;
  });

export const ImageInput = z.object({
  url: z.string().url(),
  publicId: z.string().min(1),
  alt: z.string().max(200).default(""),
});

export const DigitalInput = z.object({
  publicId: z.string().min(1),
  fileName: z.string().default(""),
  format: z.string().default(""),
  bytes: z.number().int().min(0).default(0),
  resourceType: z.string().default("raw"),
  downloadLimit: z.number().int().min(1).max(100).default(5),
  expiryHours: z.number().int().min(1).max(8760).default(720),
});

/**
 * The bare object, kept separate from the refinements below: `.superRefine`
 * returns a schema that no longer has `.partial()`, and PATCH needs it.
 */
export const ProductBase = z.object({
    title: z.string().min(2, "Give the product a title.").max(160),
    slug: z
      .string()
      .regex(/^[a-z0-9-]*$/, "Slugs use lowercase letters, numbers and dashes.")
      .max(80)
      .optional()
      .default(""),
    summary: z.string().max(300).default(""),
    description: z.string().max(20_000).default(""),
    kind: z.enum(["physical", "digital"]),
    status: z.enum(["draft", "active", "archived"]).default("draft"),
    featured: z.boolean().default(false),
    price: priceField,
    compareAt: z.union([priceField, z.null()]).optional().default(null),
    images: z.array(ImageInput).max(8).default([]),
    category: z.string().max(80).default(""),
    tags: z.array(z.string().max(40)).max(20).default([]),
    stock: z.number().int().min(0).nullable().default(null),
    weightGrams: z.number().int().min(0).nullable().default(null),
  digital: DigitalInput.nullable().default(null),
});

export const ProductInput = ProductBase.superRefine((value, ctx) => {
    // The two kinds have genuinely different requirements, and letting a
    // digital product be saved without a file is the one mistake that would
    // take money for nothing.
    if (value.kind === "digital" && value.status === "active" && !value.digital) {
      ctx.addIssue({
        code: "custom",
        path: ["digital"],
        message: "Upload the file before making a digital product active.",
      });
    }
    if (
      value.compareAt !== null &&
      value.compareAt !== undefined &&
      value.compareAt <= value.price
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["compareAt"],
        message: "The 'was' price must be higher than the price.",
      });
    }
});

/** Every field optional, for PATCH. Cross-field rules are re-checked in-route. */
export const ProductPatch = ProductBase.partial();

export type ProductInputValue = z.infer<typeof ProductInput>;
