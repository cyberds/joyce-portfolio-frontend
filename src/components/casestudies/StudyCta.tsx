"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRightIcon, CloseIcon } from "@/components/ui/icons";

const HREF = "/#talk";

/**
 * The CTA in the sticky rail. It sits under the screenshots and the facts, so
 * on desktop it is in view for most of the scroll without ever interrupting
 * the writing.
 */
export function RailCta({ accent }: { accent: string }) {
  return (
    <div
      className="rounded-[var(--r-md)] border p-6"
      style={{ borderColor: `${accent}33`, backgroundColor: `${accent}0d` }}
    >
      <p className="display text-[1.15rem] leading-snug text-ink">
        Got a process that looks like this?
      </p>
      <p className="mt-3 text-[0.88rem] leading-relaxed text-ink-muted">
        A short call is usually enough to see where the hours are going.
      </p>
      <Link
        href={HREF}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[var(--r-pill)] bg-ink px-5 py-3 text-[0.88rem] font-medium text-surface transition-transform duration-300 hover:-translate-y-0.5"
      >
        Let&rsquo;s map it
        <ArrowRightIcon />
      </Link>
    </div>
  );
}

/**
 * The in-flow CTA, placed straight after "why this matters for you" — the
 * paragraph that is already doing the persuading.
 */
export function InlineCta({ accent, id }: { accent: string; id?: string }) {
  return (
    <div
      id={id}
      className="mt-10 flex flex-col gap-5 rounded-[var(--r-lg)] border p-8 sm:flex-row sm:items-center sm:justify-between md:p-10"
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
        href={HREF}
        className="inline-flex w-fit shrink-0 items-center gap-2 rounded-[var(--r-pill)] bg-ink px-6 py-3.5 text-[0.9rem] font-medium text-surface transition-transform duration-300 hover:-translate-y-0.5"
      >
        Start a conversation
        <ArrowRightIcon />
      </Link>
    </div>
  );
}

/**
 * Mobile only, because the rail card already covers desktop. It appears once
 * the reader has scrolled past the outcome — far enough in to be interested —
 * and steps aside when the inline CTA reaches the screen, so the two never
 * ask for the same click at the same time.
 */
export function MobileCtaBar({ hideWhenVisibleId }: { hideWhenVisibleId?: string }) {
  const sentinel = useRef<HTMLDivElement>(null);
  const [passed, setPassed] = useState(false);
  const [atInline, setAtInline] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // One measurement pass drives both halves, on a passive scroll listener
  // rather than an IntersectionObserver.
  //
  // The sentinel is a single pixel, so a fast flick, an anchor jump or a
  // restored scroll position can carry it from below the viewport to above it
  // without ever crossing an intersection threshold — an observer would then
  // never fire at all. Reading the rects directly is exact at any scroll speed,
  // and it keeps working when rAF is frozen (a hidden tab), which a deferred
  // callback would not.
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;

    const measure = () => {
      setPassed(el.getBoundingClientRect().top < 0);

      const target = hideWhenVisibleId
        ? document.getElementById(hideWhenVisibleId)
        : null;
      if (!target) {
        setAtInline(false);
        return;
      }
      const box = target.getBoundingClientRect();
      setAtInline(box.top < window.innerHeight && box.bottom > 0);
    };

    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [hideWhenVisibleId]);

  const shown = passed && !atInline && !dismissed;

  return (
    <>
      <div ref={sentinel} aria-hidden className="h-px w-full" />
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-hairline backdrop-blur-xl transition-all duration-300 lg:hidden ${
          shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"
        }`}
        style={{
          backgroundColor: "var(--c-glass-strong)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="flex items-center gap-3 px-[var(--shell-gutter)] py-3">
          <p className="min-w-0 flex-1 text-[0.85rem] leading-snug text-ink-muted">
            Want this for your business?
          </p>
          <Link
            href={HREF}
            tabIndex={shown ? undefined : -1}
            className="inline-flex shrink-0 items-center gap-2 rounded-[var(--r-pill)] bg-ink px-5 py-2.5 text-[0.85rem] font-medium text-surface"
          >
            Book a call
            <ArrowRightIcon />
          </Link>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            tabIndex={shown ? undefined : -1}
            aria-label="Dismiss"
            className="shrink-0 p-2 text-ink-faint transition-colors hover:text-ink"
          >
            <CloseIcon />
          </button>
        </div>
      </div>
    </>
  );
}
