/**
 * Browser-side Cloudinary upload.
 *
 * Two hops: ask our server to sign the upload, then POST the file straight to
 * Cloudinary. The file never passes through the Next server, so a 300MB course
 * bundle is not bounded by a request body limit, and the API secret stays on
 * the server.
 *
 * XHR rather than `fetch` purely for `upload.onprogress` — `fetch` still has
 * no upload progress event, and a silent progress bar on a large file feels
 * broken.
 */

export type UploadedAsset = {
  publicId: string;
  url: string;
  format: string;
  bytes: number;
  resourceType: string;
  originalFilename: string;
};

type Signature = {
  signature: string;
  timestamp: number;
  folder: string;
  apiKey: string;
  cloudName: string;
  resourceType: string;
  deliveryType: string;
  uploadUrl: string;
};

export async function uploadToCloudinary(
  file: File,
  kind: "product-image" | "digital-asset",
  onProgress?: (percent: number) => void
): Promise<UploadedAsset> {
  const signatureResponse = await fetch("/api/commerce/admin/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind }),
  });

  const signature: Signature & { error?: string } =
    await signatureResponse.json();
  if (!signatureResponse.ok) {
    throw new Error(signature.error ?? "Could not authorise the upload.");
  }

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", signature.apiKey);
  form.append("timestamp", String(signature.timestamp));
  form.append("folder", signature.folder);
  // Must exactly match the fields the server signed, or Cloudinary rejects it.
  if (kind === "digital-asset") form.append("type", "private");
  form.append("signature", signature.signature);

  const result = await new Promise<Record<string, unknown>>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", signature.uploadUrl);

    request.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    request.onload = () => {
      try {
        const payload = JSON.parse(request.responseText);
        if (request.status >= 200 && request.status < 300) resolve(payload);
        else reject(new Error(payload?.error?.message ?? "Upload failed."));
      } catch {
        reject(new Error("Cloudinary returned an unreadable response."));
      }
    };
    request.onerror = () => reject(new Error("Upload failed — check your connection."));
    request.send(form);
  });

  return {
    publicId: String(result.public_id),
    url: String(result.secure_url ?? ""),
    format: String(result.format ?? ""),
    bytes: Number(result.bytes ?? 0),
    resourceType: String(result.resource_type ?? "raw"),
    originalFilename: String(result.original_filename ?? file.name),
  };
}

/** "1.4 MB" — for showing an admin what they just uploaded. */
export function formatBytes(bytes: number) {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024))
  );
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}
