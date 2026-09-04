/**
 * Proxy — what Next.js called Middleware before 16.
 *
 * Two jobs, in this order:
 *
 * 1. When Clerk has no keys yet, export a no-op. `clerkMiddleware()` throws
 *    without a publishable key, and that would take the whole portfolio down,
 *    not just the shop.
 * 2. Otherwise, run Clerk on every request — which is what makes `auth()` work
 *    inside server components — and send anonymous visitors to sign in rather
 *    than showing them an empty /account or /admin.
 *
 * The redirect here is a *convenience*, not the security boundary. Clerk Core 3
 * deprecated `createRouteMatcher` for exactly this reason: path matching in
 * middleware can diverge from how Next actually routes a request, so anything
 * that matters has to be checked where the data is read. It is — every admin
 * page inherits `requireAdmin()` from `src/app/admin/layout.tsx`, every admin
 * route handler calls it directly, and `/account` resolves the viewer itself.
 * Deleting this file would cost some polish and no safety.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";

const PROTECTED_PREFIXES = ["/account", "/admin", "/api/commerce/admin"];

function needsSignIn(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

const clerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
);

const passthrough = () => NextResponse.next();

export const proxy = clerkConfigured
  ? clerkMiddleware(async (auth, request: NextRequest) => {
      if (!needsSignIn(request.nextUrl.pathname)) return;

      const session = await auth();
      if (session.userId) return;

      // Route handlers want a status they can render; pages want a redirect.
      if (request.nextUrl.pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
      }
      return session.redirectToSignIn({ returnBackUrl: request.url });
    })
  : passthrough;

export default proxy;

export const config = {
  matcher: [
    // Everything except Next internals and static files with an extension,
    // unless the path carries a search param.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};
