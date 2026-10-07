import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";

/** The one ask on a case study page, placed after the benefits. */
export function StudyCta({ accent }: { accent: string }) {
  return (
    <div
      className="mt-16 flex flex-col gap-5 rounded-[var(--r-lg)] border p-8 sm:flex-row sm:items-center sm:justify-between md:p-10"
      style={{ borderColor: `${accent}33`, backgroundColor: `${accent}0d` }}
    >
      <div>
        <p className="display text-[clamp(1.35rem,2.6vw,1.85rem)] leading-tight text-ink">
          Let&rsquo;s build yours
        </p>
        <p className="mt-2 max-w-[26rem] text-[0.95rem] leading-relaxed text-ink-muted">
          Tell me where the manual work is and I&rsquo;ll show you what can come
          off your plate.
        </p>
      </div>
      <Link
        href="/#talk"
        className="inline-flex w-fit shrink-0 items-center gap-2 rounded-[var(--r-pill)] bg-ink px-6 py-3.5 text-[0.9rem] font-medium text-surface transition-transform duration-300 hover:-translate-y-0.5"
      >
        Start a conversation
        <ArrowRightIcon />
      </Link>
    </div>
  );
}
