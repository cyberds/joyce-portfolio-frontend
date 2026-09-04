/**
 * MongoDB Atlas connection.
 *
 * Next dev reloads modules on every edit, so a naive `mongoose.connect()` per
 * import opens a new pool each time until Atlas refuses connections. The
 * promise is cached on `globalThis` — the standard workaround — so the whole
 * app shares exactly one pool across hot reloads and across route handlers.
 */

import mongoose from "mongoose";
import { commerceEnv } from "./env";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as typeof globalThis & {
  __joyceMongoose?: MongooseCache;
};

const cache: MongooseCache =
  globalForMongoose.__joyceMongoose ??
  (globalForMongoose.__joyceMongoose = { conn: null, promise: null });

export async function connectToDatabase() {
  if (!commerceEnv.mongodbUri) {
    throw new Error(
      "MONGODB_URI is not set. Add it to .env.local to enable the shop."
    );
  }

  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose.connect(commerceEnv.mongodbUri, {
      dbName: commerceEnv.mongodbDb,
      // Atlas is remote; fail fast rather than hanging a request for 30s.
      serverSelectionTimeoutMS: 10_000,
      maxPoolSize: 10,
    });
  }

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    // A failed promise stays rejected forever, so drop it and let the next
    // request retry instead of serving the same error until redeploy.
    cache.promise = null;
    throw error;
  }

  return cache.conn;
}
