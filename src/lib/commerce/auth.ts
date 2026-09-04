/**
 * Who is signed in, and who is allowed into /admin.
 *
 * Admin is granted two ways, either of which is enough:
 *
 * 1. `publicMetadata.role === "admin"` on the Clerk user — the durable answer,
 *    set from the Clerk dashboard.
 * 2. The user's primary email appears in the `ADMIN_EMAILS` env list — the
 *    bootstrap answer, so the first admin can get in before any metadata has
 *    been set on anyone.
 *
 * Every admin route handler and every admin page calls `requireAdmin()`.
 * `proxy.ts` also gates /admin, but middleware is a convenience, not the
 * security boundary: a route that is reachable directly must check for itself.
 */

import { auth, currentUser } from "@clerk/nextjs/server";
import { commerceEnv, hasClerk } from "./env";

export type Viewer = {
  userId: string;
  email: string;
  name: string;
  isAdmin: boolean;
};

/** The signed-in user, or null. Never throws when Clerk is unconfigured. */
export async function getViewer(): Promise<Viewer | null> {
  if (!hasClerk()) return null;

  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  if (!user) return null;

  const email =
    user.emailAddresses.find((address) => address.id === user.primaryEmailAddressId)
      ?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    "";

  const role = (user.publicMetadata as { role?: string } | null)?.role;

  return {
    userId,
    email,
    name: [user.firstName, user.lastName].filter(Boolean).join(" ").trim(),
    isAdmin:
      role === "admin" ||
      (Boolean(email) && commerceEnv.adminEmails.includes(email.toLowerCase())),
  };
}

/** The signed-in user's id, or null. Cheaper than `getViewer` — no BAPI call. */
export async function getUserId(): Promise<string | null> {
  if (!hasClerk()) return null;
  const { userId } = await auth();
  return userId ?? null;
}

export class NotAuthorizedError extends Error {
  constructor(
    message: string,
    readonly status: 401 | 403
  ) {
    super(message);
    this.name = "NotAuthorizedError";
  }
}

/**
 * The admin viewer, or null.
 *
 * For *pages*. A layout and the page inside it render in parallel, so a page
 * that threw here would throw even when the layout has already decided to
 * render its denial screen instead — an uncaught error in the log on every
 * unauthorised visit. Admin pages therefore ask, and return `null` when the
 * answer is no; `src/app/admin/layout.tsx` owns the message the visitor sees.
 *
 * Route handlers have no such layout, so they use `requireAdmin()` below.
 */
export async function getAdminViewer(): Promise<Viewer | null> {
  const viewer = await getViewer();
  return viewer?.isAdmin ? viewer : null;
}

/**
 * Throws `NotAuthorizedError` unless the caller is an admin.
 *
 * For *route handlers*, where `handle()` turns the throw into a 401/403.
 */
export async function requireAdmin(): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) throw new NotAuthorizedError("Sign in to continue.", 401);
  if (!viewer.isAdmin) {
    throw new NotAuthorizedError("You do not have access to this area.", 403);
  }
  return viewer;
}
