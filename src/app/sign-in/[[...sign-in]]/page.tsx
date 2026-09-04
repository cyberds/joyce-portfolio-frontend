import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { Nav } from "@/components/site/Nav";
import { SetupNotice } from "@/components/shop/SetupNotice";
import { missingCommerceEnv } from "@/lib/commerce/env";

export const metadata: Metadata = {
  title: "Sign in | Joyce Wadawasina",
  robots: { index: false },
};

/**
 * Clerk's own component, on a catch-all route so it can own its sub-steps
 * (verification, MFA, password reset) as real URLs rather than modal state.
 */
export default function SignInPage() {
  const missing = missingCommerceEnv("auth");

  return (
    <main className="relative overflow-x-clip">
      <Nav />
      <div className="paper flex min-h-screen items-center justify-center">
        <div className="relative z-10 shell py-36">
          {missing.length ? (
            <SetupNotice title="Sign-in is not switched on yet" missing={missing}>
              Add your Clerk keys and this page becomes a working sign-in form.
            </SetupNotice>
          ) : (
            <div className="flex justify-center">
              <SignIn path="/sign-in" />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
