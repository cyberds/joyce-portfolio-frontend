"use client";

import Link from "next/link";
import type { CaseStudy } from "@/lib/caseStudies";
import { ArrowRightIcon } from "@/components/ui/icons";

/**
 * One card: a heading and the way through to the write-up, on a wash of the
 * study's accent. No media — the detail page carries the client, the problem
 * and any video.
 */
export function CaseStudyCard({
  study,
  decorative = false,
}: {
  study: CaseStudy;
  /**
   * One of the carousel's cloned copies. It stays clickable — it points at the
   * same study — but leaves the tab order and the accessibility tree, so the
   * list is announced once rather than three times.
   */
  decorative?: boolean;
}) {
  const tab = decorative ? -1 : undefined;

  return (
    <article
      aria-hidden={decorative || undefined}
      className="relative flex h-full min-h-[18rem] flex-col justify-between gap-10 overflow-hidden rounded-[var(--r-lg)] p-7 shadow-[0_30px_80px_-50px_rgba(36,19,25,0.8)] sm:min-h-[20rem] sm:p-10"
      style={{
        background: `radial-gradient(120% 100% at 30% 0%, ${study.accent}55, transparent 62%), linear-gradient(160deg, ${study.accent}22, #140c10 70%), #140c10`,
      }}
    >
      <h3 className="display max-w-[22ch] text-[clamp(1.6rem,3.4vw,2.6rem)] leading-[1.12] text-white">
        {study.cardHeading}
      </h3>

      <Link
        href={`/case-studies/${study.slug}`}
        tabIndex={tab}
        className="inline-flex w-fit items-center gap-2 rounded-[var(--r-pill)] bg-white px-5 py-3 text-[0.88rem] font-medium text-ink transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        View case study
        <ArrowRightIcon />
      </Link>
    </article>
  );
}
