/**
 * POST /api/commerce/cart
 *
 * The cart in localStorage is only ids and quantities. This hydrates it into
 * real products, with today's prices and today's stock — so a basket left open
 * overnight shows the current truth rather than a stale snapshot, and the
 * totals on the cart page match what checkout will actually charge.
 *
 * Ids that no longer resolve to an active product come back in `removed`, and
 * the cart page tells the shopper rather than silently dropping the line.
 */

import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle } from "@/lib/commerce/api";
import { connectToDatabase } from "@/lib/commerce/db";
import { ProductModel } from "@/lib/commerce/models/Product";
import { toPublicProduct } from "@/lib/commerce/serialize";
import { calculateShipping } from "@/lib/commerce/shipping";
import { commerceEnv, hasDatabase } from "@/lib/commerce/env";
import type { ProductKind } from "@/types/commerce";

const BodySchema = z.object({
  cart: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().min(1).max(20),
    })
  ),
});

export async function POST(request: NextRequest) {
  return handle(async () => {
    const { cart } = BodySchema.parse(await request.json());

    const emptyResponse = {
      lines: [],
      removed: [] as string[],
      subtotalMinor: 0,
      shippingMinor: 0,
      totalMinor: 0,
      currency: commerceEnv.currency,
    };

    if (!hasDatabase() || cart.length === 0) return emptyResponse;

    await connectToDatabase();

    const ids = cart
      .map((line) => line.productId)
      .filter((id) => /^[a-f0-9]{24}$/i.test(id));

    const docs = await ProductModel.find({
      _id: { $in: ids },
      status: "active",
    }).exec();

    const byId = new Map(docs.map((doc) => [String(doc._id), doc]));

    const lines = [];
    const removed: string[] = [];

    for (const line of cart) {
      const doc = byId.get(line.productId);
      if (!doc) {
        removed.push(line.productId);
        continue;
      }
      const product = toPublicProduct(doc);
      // Digital goods are always a quantity of one; stock caps the rest.
      const cap =
        product.kind === "digital"
          ? 1
          : product.stock === null
            ? 20
            : Math.min(20, product.stock);
      const quantity = Math.max(0, Math.min(line.quantity, cap));

      if (quantity === 0) {
        removed.push(line.productId);
        continue;
      }

      lines.push({
        product,
        quantity,
        lineTotalMinor: product.priceMinor * quantity,
      });
    }

    const subtotalMinor = lines.reduce((sum, line) => sum + line.lineTotalMinor, 0);
    const kinds = lines.map((line) => line.product.kind as ProductKind);
    const shippingMinor = calculateShipping(subtotalMinor, kinds);

    return {
      lines,
      removed,
      subtotalMinor,
      shippingMinor,
      totalMinor: subtotalMinor + shippingMinor,
      currency: lines[0]?.product.currency ?? commerceEnv.currency,
    };
  });
}
