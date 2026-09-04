/**
 * /api/commerce/admin/products
 *
 * GET  — list, with the same search/filter params the admin table uses.
 * POST — create.
 *
 * `requireAdmin()` runs first in both. proxy.ts also blocks /admin, but that
 * only covers page navigations; a route handler has to defend itself.
 */

import type { NextRequest } from "next/server";
import { handle, fail } from "@/lib/commerce/api";
import { requireAdmin } from "@/lib/commerce/auth";
import { connectToDatabase } from "@/lib/commerce/db";
import { ProductModel } from "@/lib/commerce/models/Product";
import { toProduct } from "@/lib/commerce/serialize";
import { listAdminProducts, uniqueSlug } from "@/lib/commerce/catalogue";
import { ProductInput } from "@/lib/commerce/productInput";
import { commerceEnv, hasDatabase } from "@/lib/commerce/env";

export async function GET(request: NextRequest) {
  return handle(async () => {
    await requireAdmin();
    const params = request.nextUrl.searchParams;

    const products = await listAdminProducts({
      search: params.get("search") ?? undefined,
      status: params.get("status") ?? undefined,
      kind: (params.get("kind") as "physical" | "digital" | null) ?? undefined,
      sort: (params.get("sort") as "newest" | null) ?? undefined,
    });

    return { products };
  });
}

export async function POST(request: NextRequest) {
  return handle(async () => {
    await requireAdmin();
    if (!hasDatabase()) return fail("MONGODB_URI is not set.", 503);

    const input = ProductInput.parse(await request.json());
    await connectToDatabase();

    const slug = input.slug
      ? await uniqueSlug(input.slug)
      : await uniqueSlug(input.title);

    const doc = await ProductModel.create({
      title: input.title,
      slug,
      summary: input.summary,
      description: input.description,
      kind: input.kind,
      status: input.status,
      featured: input.featured,
      priceMinor: input.price,
      compareAtMinor: input.compareAt ?? null,
      currency: commerceEnv.currency,
      images: input.images,
      category: input.category,
      tags: input.tags,
      // Only the relevant half of the schema is written, so a product that
      // changes kind later cannot carry stale stock or a stale file with it.
      stock: input.kind === "physical" ? input.stock : null,
      weightGrams: input.kind === "physical" ? input.weightGrams : null,
      digital: input.kind === "digital" ? input.digital : null,
    });

    return { product: toProduct(doc) };
  });
}
