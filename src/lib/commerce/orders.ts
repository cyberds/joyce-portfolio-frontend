/**
 * Reading orders, and the numbers on the dashboard.
 *
 * Writes live next to the thing that causes them — checkout creates orders,
 * the Stripe webhook promotes them — so this module is queries only.
 */

import { Types } from "mongoose";
import { connectToDatabase } from "./db";
import { OrderModel } from "./models/Order";
import { ProductModel } from "./models/Product";
import { toOrder } from "./serialize";
import { hasDatabase } from "./env";
import type { Order } from "@/types/commerce";

export async function listOrders(options: {
  userId?: string;
  email?: string;
  status?: string;
  search?: string;
  limit?: number;
} = {}): Promise<Order[]> {
  if (!hasDatabase()) return [];
  await connectToDatabase();

  const filter: Record<string, unknown> = {};
  if (options.userId) filter.userId = options.userId;
  if (options.email) filter.email = options.email.toLowerCase();
  if (options.status) filter.status = options.status;
  if (options.search) {
    const escaped = options.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(escaped, "i");
    filter.$or = [
      { orderNumber: pattern },
      { email: pattern },
      { customerName: pattern },
    ];
  }

  const docs = await OrderModel.find(filter)
    .sort({ createdAt: -1 })
    .limit(options.limit ?? 200)
    .exec();
  return docs.map(toOrder);
}

/**
 * One order. `restrictTo` is the caller's identity: pass it for the customer's
 * own account page so a guessed id cannot read someone else's order, and omit
 * it in the admin, which has already passed `requireAdmin`.
 */
export async function getOrder(
  id: string,
  restrictTo?: { userId?: string | null; email?: string | null }
): Promise<Order | null> {
  if (!hasDatabase() || !Types.ObjectId.isValid(id)) return null;
  await connectToDatabase();

  const doc = await OrderModel.findById(id).exec();
  if (!doc) return null;

  if (restrictTo) {
    const ownsByUser = Boolean(restrictTo.userId) && doc.userId === restrictTo.userId;
    const ownsByEmail =
      Boolean(restrictTo.email) &&
      doc.email === restrictTo.email!.toLowerCase();
    if (!ownsByUser && !ownsByEmail) return null;
  }

  return toOrder(doc);
}

/** Looked up by Stripe session id on the success page, where that is all we have. */
export async function getOrderByStripeSession(
  sessionId: string
): Promise<Order | null> {
  if (!hasDatabase() || !sessionId) return null;
  await connectToDatabase();
  const doc = await OrderModel.findOne({ stripeSessionId: sessionId }).exec();
  return doc ? toOrder(doc) : null;
}

export type DashboardStats = {
  currency: string;
  revenueMinor: number;
  revenue30dMinor: number;
  paidOrders: number;
  pendingOrders: number;
  unfulfilledOrders: number;
  averageOrderMinor: number;
  productCount: number;
  activeProductCount: number;
  lowStock: { id: string; title: string; stock: number }[];
  topProducts: { title: string; quantity: number; revenueMinor: number }[];
  revenueByDay: { date: string; revenueMinor: number; orders: number }[];
};

const LOW_STOCK_THRESHOLD = 5;

export async function getDashboardStats(
  currency: string
): Promise<DashboardStats> {
  const empty: DashboardStats = {
    currency,
    revenueMinor: 0,
    revenue30dMinor: 0,
    paidOrders: 0,
    pendingOrders: 0,
    unfulfilledOrders: 0,
    averageOrderMinor: 0,
    productCount: 0,
    activeProductCount: 0,
    lowStock: [],
    topProducts: [],
    revenueByDay: [],
  };
  if (!hasDatabase()) return empty;

  await connectToDatabase();

  const since = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);
  since.setHours(0, 0, 0, 0);

  const [
    totals,
    recent,
    pendingOrders,
    unfulfilledOrders,
    productCount,
    activeProductCount,
    lowStockDocs,
    topProducts,
    byDay,
  ] = await Promise.all([
    OrderModel.aggregate<{ revenue: number; count: number }>([
      { $match: { status: "paid" } },
      { $group: { _id: null, revenue: { $sum: "$totalMinor" }, count: { $sum: 1 } } },
    ]),
    OrderModel.aggregate<{ revenue: number }>([
      { $match: { status: "paid", paidAt: { $gte: since } } },
      { $group: { _id: null, revenue: { $sum: "$totalMinor" } } },
    ]),
    OrderModel.countDocuments({ status: "pending" }),
    OrderModel.countDocuments({ status: "paid", fulfillmentStatus: "unfulfilled" }),
    ProductModel.countDocuments({}),
    ProductModel.countDocuments({ status: "active" }),
    ProductModel.find({
      kind: "physical",
      stock: { $ne: null, $lte: LOW_STOCK_THRESHOLD },
    })
      .select("title stock")
      .limit(8)
      .exec(),
    OrderModel.aggregate<{ _id: string; quantity: number; revenue: number }>([
      { $match: { status: "paid" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.title",
          quantity: { $sum: "$items.quantity" },
          revenue: {
            $sum: { $multiply: ["$items.unitPriceMinor", "$items.quantity"] },
          },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]),
    OrderModel.aggregate<{ _id: string; revenue: number; orders: number }>([
      { $match: { status: "paid", paidAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$paidAt" } },
          revenue: { $sum: "$totalMinor" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const revenueMinor = totals[0]?.revenue ?? 0;
  const paidOrders = totals[0]?.count ?? 0;

  // Fill the gaps so the sparkline has one point per day, not one per sale.
  const daily = new Map(byDay.map((row) => [row._id, row]));
  const revenueByDay: DashboardStats["revenueByDay"] = [];
  for (let offset = 29; offset >= 0; offset -= 1) {
    const day = new Date(Date.now() - offset * 24 * 60 * 60 * 1000);
    const key = day.toISOString().slice(0, 10);
    const row = daily.get(key);
    revenueByDay.push({
      date: key,
      revenueMinor: row?.revenue ?? 0,
      orders: row?.orders ?? 0,
    });
  }

  return {
    currency,
    revenueMinor,
    revenue30dMinor: recent[0]?.revenue ?? 0,
    paidOrders,
    pendingOrders,
    unfulfilledOrders,
    averageOrderMinor: paidOrders ? Math.round(revenueMinor / paidOrders) : 0,
    productCount,
    activeProductCount,
    lowStock: lowStockDocs.map((doc) => ({
      id: String(doc._id),
      title: doc.title,
      stock: doc.stock ?? 0,
    })),
    topProducts: topProducts.map((row) => ({
      title: row._id,
      quantity: row.quantity,
      revenueMinor: row.revenue,
    })),
    revenueByDay,
  };
}
