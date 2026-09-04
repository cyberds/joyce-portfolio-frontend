/**
 * GET /api/commerce/download/[token]
 *
 * Redeems one download grant. The token is the whole credential — it is minted
 * only by the Stripe webhook, only onto a paid order — so this route checks
 * three things and then streams the file:
 *
 *   1. the grant exists on a `paid` order,
 *   2. it has not expired,
 *   3. it has downloads left.
 *
 * The file is proxied rather than redirected to. Cloudinary stores digital
 * goods as `type: "private"`, and even the short-lived signed URL is never
 * shown to the browser: a redirect would put a working (if brief) direct link
 * in the address bar and in history, which is exactly what the paywall is for.
 *
 * The counter is incremented with a conditional `$inc` *before* the file is
 * fetched, so two tabs racing on the last remaining download cannot both win.
 */

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/commerce/db";
import { OrderModel } from "@/lib/commerce/models/Order";
import { ProductModel } from "@/lib/commerce/models/Product";
import { signedAssetUrl } from "@/lib/commerce/cloudinary";
import { hasCloudinary, hasDatabase } from "@/lib/commerce/env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const problem = (message: string, status: number) =>
  new NextResponse(message, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!hasDatabase() || !hasCloudinary()) {
    return problem("Downloads are not available right now.", 503);
  }

  await connectToDatabase();

  const order = await OrderModel.findOne({
    "downloads.token": token,
    status: "paid",
  }).exec();

  if (!order) return problem("This download link is not valid.", 404);

  const grant = order.downloads.find((entry) => entry.token === token);
  if (!grant) return problem("This download link is not valid.", 404);

  if (grant.expiresAt.getTime() < Date.now()) {
    return problem(
      "This download link has expired. Contact us and we will refresh it.",
      410
    );
  }

  if (grant.downloadCount >= grant.maxDownloads) {
    return problem(
      `This link has been used its maximum of ${grant.maxDownloads} times. Contact us if you need it again.`,
      429
    );
  }

  // Claim the slot first. If the conditional update finds no match, another
  // request took the last one between our read and this write.
  const claimed = await OrderModel.updateOne(
    {
      _id: order._id,
      downloads: {
        $elemMatch: { token, downloadCount: { $lt: grant.maxDownloads } },
      },
    },
    { $inc: { "downloads.$.downloadCount": 1 } }
  ).exec();

  if (claimed.modifiedCount === 0) {
    return problem("This link has been used its maximum number of times.", 429);
  }

  const product = await ProductModel.findById(grant.productId).exec();
  if (!product?.digital?.publicId) {
    return problem("The file for this product is missing. Please contact us.", 404);
  }

  const asset = product.digital;

  try {
    const url = signedAssetUrl(
      asset.publicId,
      asset.format || "zip",
      asset.resourceType || "raw"
    );

    const upstream = await fetch(url);
    if (!upstream.ok || !upstream.body) {
      throw new Error(`Cloudinary responded ${upstream.status}`);
    }

    const fileName =
      asset.fileName ||
      `${product.slug}.${asset.format || "zip"}`.replace(/[^\w.\-]/g, "_");

    return new NextResponse(upstream.body, {
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") ?? "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        ...(upstream.headers.get("content-length")
          ? { "Content-Length": upstream.headers.get("content-length")! }
          : {}),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    // The slot was already claimed, so hand it back rather than charging the
    // customer a download for our own failure.
    await OrderModel.updateOne(
      { _id: order._id, "downloads.token": token },
      { $inc: { "downloads.$.downloadCount": -1 } }
    ).exec();

    console.error("[download] failed to stream asset", error);
    return problem("We could not fetch your file. Please try again.", 502);
  }
}
