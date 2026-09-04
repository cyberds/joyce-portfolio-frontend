/**
 * PATCH /api/commerce/admin/orders/[id]
 *
 * The admin's controls on a single order: fulfilment status, tracking, notes,
 * and re-issuing a download that a customer has exhausted or let expire.
 *
 * Moving an order to `shipped` emails the customer — but only on the
 * transition, so re-saving the notes on an already-shipped order does not
 * send a second "your order is on its way".
 */

import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, fail } from "@/lib/commerce/api";
import { requireAdmin } from "@/lib/commerce/auth";
import { connectToDatabase } from "@/lib/commerce/db";
import { OrderModel } from "@/lib/commerce/models/Order";
import { ProductModel } from "@/lib/commerce/models/Product";
import { toOrder } from "@/lib/commerce/serialize";
import { generateDownloadToken } from "@/lib/commerce/fulfillment";
import {
  orderConfirmationEmail,
  sendEmail,
  shippingNotificationEmail,
} from "@/lib/commerce/email";
import { commerceEnv, hasDatabase } from "@/lib/commerce/env";

type Context = { params: Promise<{ id: string }> };

const BodySchema = z.object({
  fulfillmentStatus: z
    .enum(["not_required", "unfulfilled", "fulfilled", "shipped", "delivered"])
    .optional(),
  trackingCarrier: z.string().max(80).optional(),
  trackingNumber: z.string().max(120).optional(),
  notes: z.string().max(4000).optional(),
  /** Mint fresh tokens for every digital line and email them again. */
  reissueDownloads: z.boolean().optional(),
  /** Send the receipt again, unchanged. */
  resendReceipt: z.boolean().optional(),
});

export async function PATCH(request: NextRequest, { params }: Context) {
  return handle(async () => {
    await requireAdmin();
    if (!hasDatabase()) return fail("MONGODB_URI is not set.", 503);

    const { id } = await params;
    const input = BodySchema.parse(await request.json());

    await connectToDatabase();
    const doc = await OrderModel.findById(id).exec();
    if (!doc) return fail("Order not found.", 404);

    const wasShipped = doc.fulfillmentStatus === "shipped";

    if (input.fulfillmentStatus) doc.fulfillmentStatus = input.fulfillmentStatus;
    if (input.trackingCarrier !== undefined) doc.trackingCarrier = input.trackingCarrier;
    if (input.trackingNumber !== undefined) doc.trackingNumber = input.trackingNumber;
    if (input.notes !== undefined) doc.notes = input.notes;

    if (input.reissueDownloads) {
      if (doc.status !== "paid") {
        return fail("Only paid orders have downloads.", 400);
      }
      const digitalItems = doc.items.filter((item) => item.kind === "digital");
      if (digitalItems.length === 0) {
        return fail("This order has no digital items.", 400);
      }

      const products = await ProductModel.find({
        _id: { $in: digitalItems.map((item) => item.productId) },
      }).exec();
      const byId = new Map(products.map((product) => [String(product._id), product]));

      doc.downloads = digitalItems.map((item) => {
        const product = byId.get(String(item.productId));
        return {
          productId: item.productId,
          title: item.title,
          // New tokens, so the exhausted ones stop working.
          token: generateDownloadToken(),
          downloadCount: 0,
          maxDownloads: product?.digital?.downloadLimit ?? 5,
          expiresAt: new Date(
            Date.now() + (product?.digital?.expiryHours ?? 720) * 60 * 60 * 1000
          ),
        };
      }) as never;
    }

    await doc.save();
    const order = toOrder(doc);

    /* ---- Email, after the write, so a send failure cannot lose the edit ---- */

    if (order.email) {
      if (input.reissueDownloads || input.resendReceipt) {
        const receipt = orderConfirmationEmail(order);
        const sent = await sendEmail({
          to: order.email,
          toName: order.customerName,
          subject: receipt.subject,
          html: receipt.html,
          replyTo: commerceEnv.supportEmail,
        });
        if (sent.ok) {
          doc.receiptSentAt = new Date();
          await doc.save();
        }
      } else if (!wasShipped && doc.fulfillmentStatus === "shipped") {
        const notice = shippingNotificationEmail(order);
        await sendEmail({
          to: order.email,
          toName: order.customerName,
          subject: notice.subject,
          html: notice.html,
          replyTo: commerceEnv.supportEmail,
        });
      }
    }

    return { order: toOrder(doc) };
  });
}
