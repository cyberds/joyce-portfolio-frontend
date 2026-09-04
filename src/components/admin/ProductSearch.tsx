"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Search box for the product table.
 *
 * Debounced and pushed into the URL rather than held in component state, so a
 * search is a link Joyce can bookmark, share or reload — and the server does
 * the filtering with the index it already has.
 */
export function ProductSearch({
  initial,
  status,
}: {
  initial: string;
  status: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initial);

  useEffect(() => {
    // Don't navigate on mount, only on a real change from what the URL says.
    if (value === initial) return;

    const timer = window.setTimeout(() => {
      const query = new URLSearchParams();
      if (value.trim()) query.set("search", value.trim());
      if (status) query.set("status", status);
      router.replace(
        query.toString() ? `/admin/products?${query}` : "/admin/products"
      );
    }, 300);

    return () => window.clearTimeout(timer);
  }, [value, initial, status, router]);

  return (
    <input
      type="search"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      placeholder="Search products…"
      aria-label="Search products"
      className="w-full max-w-xs rounded-[var(--r-pill)] border border-hairline bg-surface px-5 py-2.5 text-[0.87rem] outline-none transition-colors placeholder:text-ink-faint focus:border-ink-faint"
    />
  );
}
