/**
 * Whether a download grant is still good for anything.
 *
 * Two pages ask the same question — the customer's account page, to decide
 * which links to offer, and the admin order page, to label each one — so the
 * two rules (not expired, uses remaining) live here rather than being written
 * out twice and drifting apart.
 *
 * Reading the clock is also the reason this is not inlined into either page:
 * `Date.now()` inside a component body makes render impure, and the whole
 * point is that every grant in one list is judged against the same instant.
 */

import type { OrderDownload } from "@/types/commerce";

export type DownloadState = OrderDownload & {
  expired: boolean;
  /** Every permitted download has been used. */
  spent: boolean;
  /** Neither expired nor spent — safe to offer a link for. */
  usable: boolean;
  remaining: number;
};

export function describeDownloads(
  downloads: OrderDownload[],
  now: number = Date.now()
): DownloadState[] {
  return downloads.map((grant) => {
    const expired = new Date(grant.expiresAt).getTime() < now;
    const spent = grant.downloadCount >= grant.maxDownloads;
    return {
      ...grant,
      expired,
      spent,
      usable: !expired && !spent,
      remaining: Math.max(0, grant.maxDownloads - grant.downloadCount),
    };
  });
}
