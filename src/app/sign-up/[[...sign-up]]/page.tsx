import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { Nav } from "@/components/site/Nav";
import { SetupNotice } from "@/components/shop/SetupNotice";
import { missingCommerceEnv } from "@/lib/commerce/env";

export const metadata: Metadata = {
  title: "Create an account | Joyce Wadawasina",
  robots: { index: false },
};

/**
 * An account is optional for buying — checkout works as a guest. It exists so
 * downloads and order history have somewhere permanent to live.
 */
export default function SignUpPage() {
  const missing = missingCommerceEnv("auth");

  return (
    <main className="relative overflow-x-clip">
      <Nav />
      <div className="paper flex min-h-screen items-center justify-center">
        <div className="relative z-10 shell py-36">
          {missing.length ? (
            <SetupNotice title="Sign-up is not switched on yet" missing={missing}>
              Add your Clerk keys and this page becomes a working sign-up form.
            </SetupNotice>
          ) : (
            <div className="flex justify-center">
              <SignUp path="/sign-up" />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
