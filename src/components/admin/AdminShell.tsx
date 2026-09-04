"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { ChartIcon, BoxIcon, ReceiptIcon } from "@/components/shop/icons";

/**
 * The dashboard chrome.
 *
 * Deliberately quieter than the marketing site — no paper texture, no reveal
 * animations, no display face on the data. This is a tool Joyce will look at
 * every day, and a working surface should get out of the way.
 */

const NAV = [
  { href: "/admin", label: "Overview", icon: ChartIcon, exact: true },
  { href: "/admin/products", label: "Products", icon: BoxIcon },
  { href: "/admin/orders", label: "Orders", icon: ReceiptIcon },
];

export function AdminShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email: string;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-40 border-b border-hairline bg-surface/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-6 px-5 sm:px-8">
          <Link href="/admin" className="flex shrink-0 items-center gap-2.5">
            <span className="size-2 rounded-full bg-accent" aria-hidden />
            <span className="display text-[1.05rem] leading-none">
              Shop dashboard
            </span>
          </Link>

          <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {NAV.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-[var(--r-pill)] px-3.5 py-2 text-[0.85rem] transition-colors ${
                    active
                      ? "bg-ink text-surface"
                      : "text-ink-muted hover:bg-canvas-deep hover:text-ink"
                  }`}
                >
                  <Icon />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-4">
            <Link
              href="/shop"
              className="hidden text-[0.82rem] text-ink-muted underline underline-offset-4 hover:text-ink sm:block"
            >
              View shop
            </Link>
            <span className="hidden text-[0.8rem] text-ink-faint lg:block">
              {email}
            </span>
            <UserButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8">{children}</main>
    </div>
  );
}
