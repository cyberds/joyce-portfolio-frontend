/**
 * Reading the catalogue.
 *
 * Storefront callers use the `public*` helpers, which only ever return `active`
 * products and strip the digital asset id. Admin callers use the `admin*`
 * helpers, which see drafts and archived rows too.
 *
 * Every function tolerates a missing database and returns empty rather than
 * throwing, so the shop degrades to "nothing here yet" instead of a 500 while
 * MONGODB_URI is still blank.
 */

import { Types } from "mongoose";
import { connectToDatabase } from "./db";
import { ProductModel } from "./models/Product";
import { toProduct, toPublicProduct } from "./serialize";
import { hasDatabase } from "./env";
import type { Product, PublicProduct } from "@/types/commerce";

export type CatalogueQuery = {
  search?: string;
  category?: string;
  kind?: "physical" | "digital";
  sort?: "newest" | "price-asc" | "price-desc";
};

const SORTS: Record<string, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  "price-asc": { priceMinor: 1 },
  "price-desc": { priceMinor: -1 },
};

function buildFilter(query: CatalogueQuery, includeInactive: boolean) {
  const filter: Record<string, unknown> = includeInactive
    ? {}
    : { status: "active" };

  if (query.kind) filter.kind = query.kind;
  if (query.category) filter.category = query.category;
  if (query.search) {
    // A regex beats $text here: it matches partial words as the admin types.
    const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(escaped, "i");
    filter.$or = [{ title: pattern }, { summary: pattern }, { tags: pattern }];
  }
  return filter;
}

export async function listPublicProducts(
  query: CatalogueQuery = {}
): Promise<PublicProduct[]> {
  if (!hasDatabase()) return [];
  await connectToDatabase();
  const docs = await ProductModel.find(buildFilter(query, false))
    .sort(SORTS[query.sort ?? "newest"] ?? SORTS.newest)
    .limit(200)
    .exec();
  return docs.map(toPublicProduct);
}

export async function getPublicProductBySlug(
  slug: string
): Promise<PublicProduct | null> {
  if (!hasDatabase()) return null;
  await connectToDatabase();
  const doc = await ProductModel.findOne({ slug, status: "active" }).exec();
  return doc ? toPublicProduct(doc) : null;
}

/** Distinct categories across the live catalogue, for the storefront filter. */
export async function listCategories(): Promise<string[]> {
  if (!hasDatabase()) return [];
  await connectToDatabase();
  const values = await ProductModel.distinct("category", {
    status: "active",
    category: { $nin: ["", null] },
  }).exec();
  return (values as string[]).sort((a, b) => a.localeCompare(b));
}

export async function listAdminProducts(
  query: CatalogueQuery & { status?: string } = {}
): Promise<Product[]> {
  if (!hasDatabase()) return [];
  await connectToDatabase();
  const filter = buildFilter(query, true);
  if (query.status) filter.status = query.status;
  const docs = await ProductModel.find(filter)
    .sort(SORTS[query.sort ?? "newest"] ?? SORTS.newest)
    .limit(500)
    .exec();
  return docs.map(toProduct);
}

export async function getAdminProduct(id: string): Promise<Product | null> {
  if (!hasDatabase() || !Types.ObjectId.isValid(id)) return null;
  await connectToDatabase();
  const doc = await ProductModel.findById(id).exec();
  return doc ? toProduct(doc) : null;
}

/** Turns a title into a URL-safe slug, then makes it unique in the collection. */
export async function uniqueSlug(title: string, excludeId?: string) {
  const base =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "product";

  await connectToDatabase();

  let candidate = base;
  let suffix = 2;
  // Bounded so a pathological collection cannot spin here forever.
  while (suffix < 500) {
    const clash = await ProductModel.findOne({
      slug: candidate,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })
      .select("_id")
      .lean()
      .exec();
    if (!clash) return candidate;
    candidate = `${base}-${suffix++}`;
  }
  return `${base}-${Date.now()}`;
}
