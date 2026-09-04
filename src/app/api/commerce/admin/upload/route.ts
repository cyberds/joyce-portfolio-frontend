/**
 * POST /api/commerce/admin/upload
 *
 * Hands the admin browser a short-lived Cloudinary signature so it can upload
 * straight to Cloudinary. The file itself never touches this server, which
 * keeps a 200MB course bundle from hitting a request body limit and keeps the
 * API secret on the server where it belongs.
 */

import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, fail } from "@/lib/commerce/api";
import { requireAdmin } from "@/lib/commerce/auth";
import { createUploadSignature } from "@/lib/commerce/cloudinary";
import { hasCloudinary } from "@/lib/commerce/env";

const BodySchema = z.object({
  kind: z.enum(["product-image", "digital-asset"]),
});

export async function POST(request: NextRequest) {
  return handle(async () => {
    await requireAdmin();

    if (!hasCloudinary()) {
      return fail(
        "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.",
        503
      );
    }

    const { kind } = BodySchema.parse(await request.json());
    return createUploadSignature(kind);
  });
}
