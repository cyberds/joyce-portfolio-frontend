/**
 * The one place the app decides whether Clerk is switched on.
 *
 * `<ClerkProvider>` throws at render time without a publishable key. Wrapping
 * the whole site in it unconditionally would mean a missing env var takes down
 * the portfolio — the case studies, the hero, everything — rather than just
 * the shop. So the provider is only mounted when the keys are present, and the
 * commerce pages render a setup checklist when they are not.
 */

import { ClerkProvider } from "@clerk/nextjs";
import { CartProvider } from "./CartProvider";
import { hasClerk } from "@/lib/commerce/env";

export function Providers({ children }: { children: React.ReactNode }) {
  const cart = <CartProvider>{children}</CartProvider>;

  if (!hasClerk()) return cart;

  return (
    <ClerkProvider
      // Core 3 moved the post-sign-out destination off <UserButton> and onto
      // the provider, so it is configured once for every Clerk surface.
      afterSignOutUrl="/"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      appearance={{
        variables: {
          colorPrimary: "#df0f57",
          colorBackground: "#ffffff",
          // Core 3 renamed these from colorText / colorTextSecondary.
          colorForeground: "#241319",
          colorMutedForeground: "#7c5a66",
          borderRadius: "0.75rem",
          fontFamily: "var(--font-body), system-ui, sans-serif",
        },
      }}
    >
      {cart}
    </ClerkProvider>
  );
}
