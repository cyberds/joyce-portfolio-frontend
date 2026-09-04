import type { Metadata } from "next";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { CartView } from "@/components/shop/CartView";

export const metadata: Metadata = {
  title: "Your basket | Joyce Wadawasina",
  robots: { index: false },
};

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<{ cancelled?: string }>;
}) {
  const { cancelled } = await searchParams;

  return (
    <main className="relative overflow-x-clip">
      <Nav />

      <div className="paper min-h-screen">
        <div className="relative z-10 shell pb-28 pt-36 md:pt-44">
          <p className="eyebrow text-accent">Checkout</p>
          <h1 className="display mt-4 text-[clamp(2.2rem,5vw,3.2rem)]">
            Your basket
          </h1>

          {cancelled ? (
            <p className="mt-6 max-w-[52ch] rounded-[var(--r-md)] border border-hairline bg-surface px-5 py-4 text-[0.9rem] text-ink-muted">
              No payment was taken — your basket is exactly as you left it.
            </p>
          ) : null}

          <div className="mt-12">
            <CartView />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
