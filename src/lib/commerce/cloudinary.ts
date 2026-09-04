/**
 * Cloudinary media storage.
 *
 * Two very different jobs share one account:
 *
 * - Product images are public `image` uploads; their URLs go straight into the
 *   page.
 * - Digital goods are uploaded as `type: "private"`, which means Cloudinary
 *   will not serve them from a plain URL at all. The only way to read one is a
 *   short-lived signed URL, which `signedAssetUrl` mints server-side and the
 *   download route consumes without ever showing it to the browser.
 *
 * Uploads happen browser -> Cloudinary directly using a signature from
 * /api/commerce/admin/upload, so large files never pass through the Next
 * server (and never hit a serverless body-size limit).
 */

import { v2 as cloudinary } from "cloudinary";
import { commerceEnv, hasCloudinary } from "./env";

let configured = false;

function configure() {
  if (!hasCloudinary()) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET."
    );
  }
  if (!configured) {
    cloudinary.config({
      cloud_name: commerceEnv.cloudinaryCloudName,
      api_key: commerceEnv.cloudinaryApiKey,
      api_secret: commerceEnv.cloudinaryApiSecret,
      secure: true,
    });
    configured = true;
  }
  return cloudinary;
}

export type UploadKind = "product-image" | "digital-asset";

/**
 * Parameters the browser must send to Cloudinary, plus the signature over
 * them. Every field signed here is one the client can no longer change, which
 * is what stops a signature for a product image being reused to write a
 * publicly-readable copy of a paid download.
 */
export function createUploadSignature(kind: UploadKind) {
  const api = configure();
  const timestamp = Math.round(Date.now() / 1000);

  const folder =
    kind === "digital-asset" ? "joyce-shop/digital" : "joyce-shop/products";

  const paramsToSign: Record<string, string | number> = {
    timestamp,
    folder,
    // Private delivery type is what makes a paid file unreadable by URL.
    ...(kind === "digital-asset" ? { type: "private" } : {}),
  };

  const signature = api.utils.api_sign_request(
    paramsToSign,
    commerceEnv.cloudinaryApiSecret
  );

  return {
    signature,
    timestamp,
    folder,
    apiKey: commerceEnv.cloudinaryApiKey,
    cloudName: commerceEnv.cloudinaryCloudName,
    // "auto" lets Cloudinary sort image/video/raw out for digital goods.
    resourceType: kind === "digital-asset" ? "auto" : "image",
    deliveryType: kind === "digital-asset" ? "private" : "upload",
    uploadUrl: `https://api.cloudinary.com/v1_1/${commerceEnv.cloudinaryCloudName}/${
      kind === "digital-asset" ? "auto" : "image"
    }/upload`,
  };
}

/** A signed URL for a private asset, valid for `ttlSeconds`. Server use only. */
export function signedAssetUrl(
  publicId: string,
  format: string,
  resourceType: string,
  ttlSeconds = 120
) {
  const api = configure();
  return api.utils.private_download_url(publicId, format, {
    resource_type: (resourceType || "raw") as "image" | "video" | "raw",
    type: "private",
    expires_at: Math.round(Date.now() / 1000) + ttlSeconds,
    attachment: true,
  });
}

/** Best-effort cleanup when a product or an image is removed. */
export async function destroyAsset(
  publicId: string,
  resourceType = "image",
  deliveryType = "upload"
) {
  try {
    const api = configure();
    await api.uploader.destroy(publicId, {
      resource_type: resourceType,
      type: deliveryType,
      invalidate: true,
    });
  } catch (error) {
    // Losing an orphaned file is not worth failing the admin's delete on.
    console.error("[cloudinary] failed to destroy", publicId, error);
  }
}
