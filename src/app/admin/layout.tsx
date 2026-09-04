import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { SetupNotice } from "@/components/shop/SetupNotice";
import { getViewer } from "@/lib/commerce/auth";
import { missingCommerceEnv, commerceEnv } from "@/lib/commerce/env";

export const metadata: Metadata = {
  title: "Shop dashboard | Joyce Wadawasina",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * The gate for everything under /admin.
 *
 * proxy.ts already turns anonymous visitors away, but it cannot tell an admin
 * from an ordinary signed-in customer without a Clerk API call — middleware is
 * the wrong place for that. So the actual authorisation decision lives here,
 * where every admin page inherits it, and again inside each admin route
 * handler, which is reachable without ever rendering a page.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const missing = missingCommerceEnv("auth", "catalogue");

  if (missing.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas p-6">
        <SetupNotice title="The dashboard needs its keys" missing={missing}>
          Clerk secures the dashboard and MongoDB stores what it shows. Add
          both, then set <code>ADMIN_EMAILS</code> to your own address so you
          can get in.
        </SetupNotice>
      </div>
    );
  }

  const viewer = await getViewer();

  if (!viewer) {
    return (
      <Denied
        title="Please sign in"
        body="This area is for the shop owner."
        action={{ href: "/sign-in", label: "Sign in" }}
      />
    );
  }

  if (!viewer.isAdmin) {
    return (
      <Denied
        title="Not your dashboard"
        body={
          commerceEnv.adminEmails.length === 0
            ? `You're signed in as ${viewer.email}, but no admins have been named yet. Add that address to ADMIN_EMAILS in .env.local, or set publicMetadata.role = "admin" on the user in the Clerk dashboard.`
            : `You're signed in as ${viewer.email}, which isn't an admin account.`
        }
        action={{ href: "/", label: "Back to the site" }}
      />
    );
  }

  return <AdminShell email={viewer.email}>{children}</AdminShell>;
}

function Denied({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action: { href: string; label: string };
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-6">
      <div className="max-w-md rounded-[var(--r-lg)] border border-hairline bg-surface p-9 text-center">
        <h1 className="display text-[1.6rem]">{title}</h1>
        <p className="mt-4 text-[0.92rem] leading-relaxed text-ink-muted">{body}</p>
        <Link
          href={action.href}
          className="mt-7 inline-block rounded-[var(--r-pill)] bg-ink px-6 py-3.5 text-[0.9rem] text-surface"
        >
          {action.label}
        </Link>
      </div>
    </div>
  );
}
