/**
 * /api/commerce/admin/products/[id]
 *
 * PATCH  — partial update from the edit form.
 * DELETE — archive, or hard-delete when `?purge=1` and the product has never
 *          been ordered. A product that appears on an order is never really
 *          deleted: the order references it for downloads and for history.
 */

import type { NextRequest } from "next/server";
import { handle, fail } from "@/lib/commerce/api";
import { requireAdmin } from "@/lib/commerce/auth";
import { connectToDatabase } from "@/lib/commerce/db";
import { ProductModel } from "@/lib/commerce/models/Product";
import { OrderModel } from "@/lib/commerce/models/Order";
import { toProduct } from "@/lib/commerce/serialize";
import { uniqueSlug } from "@/lib/commerce/catalogue";
import { ProductPatch } from "@/lib/commerce/productInput";
import { destroyAsset } from "@/lib/commerce/cloudinary";
import { hasCloudinary, hasDatabase } from "@/lib/commerce/env";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Context) {
  return handle(async () => {
    await requireAdmin();
    if (!hasDatabase()) return fail("MONGODB_URI is not set.", 503);

    const { id } = await params;
    const input = ProductPatch.parse(await request.json());

    await connectToDatabase();
    const doc = await ProductModel.findById(id).exec();
    if (!doc) return fail("Product not found.", 404);

    const kind = input.kind ?? doc.kind;

    if (input.title !== undefined) doc.title = input.title;
    if (input.slug !== undefined && input.slug !== doc.slug) {
      doc.slug = await uniqueSlug(input.slug || doc.title, id);
    }
    if (input.summary !== undefined) doc.summary = input.summary;
    if (input.description !== undefined) doc.description = input.description;
    if (input.status !== undefined) doc.status = input.status;
    if (input.featured !== undefined) doc.featured = input.featured;
    if (input.price !== undefined) doc.priceMinor = input.price;
    if (input.compareAt !== undefined) doc.compareAtMinor = input.compareAt;
    if (input.category !== undefined) doc.category = input.category;
    if (input.tags !== undefined) doc.tags = input.tags;

    if (input.images !== undefined) {
      // Images the admin removed in the form are gone from Cloudinary too,
      // otherwise the account fills with orphans nobody can see or delete.
      const keptIds = new Set(input.images.map((image) => image.publicId));
      const dropped = (doc.images ?? []).filter(
        (image) => !keptIds.has(image.publicId)
      );
      doc.images = input.images as never;
      if (hasCloudinary()) {
        await Promise.all(dropped.map((image) => destroyAsset(image.publicId)));
      }
    }

    doc.kind = kind;
    if (kind === "physical") {
      if (input.stock !== undefined) doc.stock = input.stock;
      if (input.weightGrams !== undefined) doc.weightGrams = input.weightGrams;
      doc.digital = null;
    } else {
      if (input.digital !== undefined) doc.digital = input.digital as never;
      doc.stock = null;
      doc.weightGrams = null;
    }

    if (kind === "digital" && doc.status === "active" && !doc.digital) {
      return fail("Upload the file before making a digital product active.", 400);
    }

    await doc.save();
    return { product: toProduct(doc) };
  });
}

export async function DELETE(request: NextRequest, { params }: Context) {
  return handle(async () => {
    await requireAdmin();
    if (!hasDatabase()) return fail("MONGODB_URI is not set.", 503);

    const { id } = await params;
    await connectToDatabase();

    const doc = await ProductModel.findById(id).exec();
    if (!doc) return fail("Product not found.", 404);

    const purge = request.nextUrl.searchParams.get("purge") === "1";
    const orderCount = await OrderModel.countDocuments({ "items.productId": id });

    if (!purge || orderCount > 0) {
      doc.status = "archived";
      await doc.save();
      return {
        archived: true,
        reason:
          orderCount > 0
            ? "This product appears on existing orders, so it was archived rather than deleted."
            : undefined,
      };
    }

    if (hasCloudinary()) {
      await Promise.all([
        ...(doc.images ?? []).map((image) => destroyAsset(image.publicId)),
        ...(doc.digital
          ? [
              destroyAsset(
                doc.digital.publicId,
                doc.digital.resourceType || "raw",
                "private"
              ),
            ]
          : []),
      ]);
    }

    await doc.deleteOne();
    return { deleted: true };
  });
}
