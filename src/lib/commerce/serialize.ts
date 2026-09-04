/**
 * Mongoose documents -> plain objects for React.
 *
 * Server components may only hand serialisable values to client components,
 * and `toPublicProduct` doubles as the security boundary: it drops the
 * `digital` sub-document so a Cloudinary asset id can never be read out of a
 * page's flight payload by someone who has not paid.
 */

import type { ProductDoc } from "./models/Product";
import type { OrderDoc } from "./models/Order";
import type { Order, Product, PublicProduct } from "@/types/commerce";

export function toProduct(doc: ProductDoc): Product {
  return {
    id: String(doc._id),
    title: doc.title,
    slug: doc.slug,
    summary: doc.summary ?? "",
    description: doc.description ?? "",
    kind: doc.kind as Product["kind"],
    status: doc.status as Product["status"],
    featured: Boolean(doc.featured),
    priceMinor: doc.priceMinor,
    compareAtMinor: doc.compareAtMinor ?? null,
    currency: doc.currency,
    images: (doc.images ?? []).map((image) => ({
      url: image.url,
      publicId: image.publicId,
      alt: image.alt ?? "",
    })),
    category: doc.category ?? "",
    tags: doc.tags ?? [],
    stock: doc.stock ?? null,
    weightGrams: doc.weightGrams ?? null,
    digital: doc.digital
      ? {
          publicId: doc.digital.publicId,
          fileName: doc.digital.fileName ?? "",
          format: doc.digital.format ?? "",
          bytes: doc.digital.bytes ?? 0,
          resourceType: doc.digital.resourceType ?? "raw",
          downloadLimit: doc.digital.downloadLimit ?? 5,
          expiryHours: doc.digital.expiryHours ?? 720,
        }
      : null,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export function toPublicProduct(doc: ProductDoc): PublicProduct {
  const { digital, ...rest } = toProduct(doc);
  return { ...rest, hasDigitalAsset: Boolean(digital) };
}

export function toOrder(doc: OrderDoc): Order {
  return {
    id: String(doc._id),
    orderNumber: doc.orderNumber,
    userId: doc.userId ?? null,
    email: doc.email ?? "",
    customerName: doc.customerName ?? "",
    items: (doc.items ?? []).map((item) => ({
      productId: String(item.productId),
      slug: item.slug ?? "",
      title: item.title,
      kind: item.kind as Order["items"][number]["kind"],
      unitPriceMinor: item.unitPriceMinor,
      quantity: item.quantity,
      imageUrl: item.imageUrl ?? "",
    })),
    subtotalMinor: doc.subtotalMinor,
    shippingMinor: doc.shippingMinor ?? 0,
    totalMinor: doc.totalMinor,
    currency: doc.currency,
    status: doc.status as Order["status"],
    fulfillmentStatus: doc.fulfillmentStatus as Order["fulfillmentStatus"],
    shippingAddress: doc.shippingAddress
      ? {
          name: doc.shippingAddress.name ?? "",
          line1: doc.shippingAddress.line1 ?? "",
          line2: doc.shippingAddress.line2 ?? "",
          city: doc.shippingAddress.city ?? "",
          postalCode: doc.shippingAddress.postalCode ?? "",
          state: doc.shippingAddress.state ?? "",
          country: doc.shippingAddress.country ?? "",
        }
      : null,
    trackingCarrier: doc.trackingCarrier ?? "",
    trackingNumber: doc.trackingNumber ?? "",
    downloads: (doc.downloads ?? []).map((grant) => ({
      productId: String(grant.productId),
      title: grant.title ?? "",
      token: grant.token,
      downloadCount: grant.downloadCount ?? 0,
      maxDownloads: grant.maxDownloads ?? 5,
      expiresAt: grant.expiresAt.toISOString(),
    })),
    notes: doc.notes ?? "",
    receiptSentAt: doc.receiptSentAt ? doc.receiptSentAt.toISOString() : null,
    paidAt: doc.paidAt ? doc.paidAt.toISOString() : null,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}
