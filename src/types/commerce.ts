/**
 * The plain, JSON-safe shapes that cross the server/client boundary.
 *
 * Mongoose documents cannot be passed to client components, so every server
 * component serialises through these. Money is always an integer in the minor
 * unit (pence for GBP, cents for USD) — floats and currency do not mix.
 */

export type ProductKind = "physical" | "digital";
export type ProductStatus = "draft" | "active" | "archived";

export type ProductImage = {
  url: string;
  publicId: string;
  alt: string;
};

export type DigitalAsset = {
  /** Cloudinary public id of the privately-stored file. Never sent to clients. */
  publicId: string;
  fileName: string;
  format: string;
  bytes: number;
  resourceType: string;
  /** Downloads allowed per order line. */
  downloadLimit: number;
  /** Hours the download link stays live after purchase. */
  expiryHours: number;
};

export type Product = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  kind: ProductKind;
  status: ProductStatus;
  featured: boolean;
  priceMinor: number;
  compareAtMinor: number | null;
  currency: string;
  images: ProductImage[];
  category: string;
  tags: string[];
  /** `null` means stock is not tracked. Physical goods only. */
  stock: number | null;
  weightGrams: number | null;
  /** Present on digital products only, and only on the server. */
  digital: DigitalAsset | null;
  createdAt: string;
  updatedAt: string;
};

/** What a shopper is allowed to see. Strips the Cloudinary asset id. */
export type PublicProduct = Omit<Product, "digital"> & {
  hasDigitalAsset: boolean;
};

export type OrderStatus =
  | "pending"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded";

export type FulfillmentStatus =
  | "not_required"
  | "unfulfilled"
  | "fulfilled"
  | "shipped"
  | "delivered";

export type OrderItem = {
  productId: string;
  slug: string;
  title: string;
  kind: ProductKind;
  unitPriceMinor: number;
  quantity: number;
  imageUrl: string;
};

export type OrderDownload = {
  productId: string;
  title: string;
  token: string;
  downloadCount: number;
  maxDownloads: number;
  expiresAt: string;
};

export type ShippingAddress = {
  name: string;
  line1: string;
  line2: string;
  city: string;
  postalCode: string;
  state: string;
  country: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  userId: string | null;
  email: string;
  customerName: string;
  items: OrderItem[];
  subtotalMinor: number;
  shippingMinor: number;
  totalMinor: number;
  currency: string;
  status: OrderStatus;
  fulfillmentStatus: FulfillmentStatus;
  shippingAddress: ShippingAddress | null;
  trackingCarrier: string;
  trackingNumber: string;
  downloads: OrderDownload[];
  notes: string;
  receiptSentAt: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/** One line of the shopper's cart, as held in localStorage. */
export type CartLine = {
  productId: string;
  quantity: number;
};
