"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRightIcon } from "@/components/ui/icons";
import { caseStudies } from "@/lib/caseStudies";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { CaseStudyCard } from "./CaseStudyCard";

/** How long a card holds before the rail advances on its own. */
const AUTOPLAY_MS = 5200;
/** Quiet period after someone touches the rail before autoplay resumes. */
const RESUME_MS = 9000;

const COUNT = caseStudies.length;
/** Three identical sets. The middle one is home; the outer two are the runway. */
const SETS = 3;

function railAnchor(rail: HTMLElement) {
  const pad = parseFloat(getComputedStyle(rail).paddingLeft) || 0;
  return rail.getBoundingClientRect().left + pad;
}

function PlayGlyph({ paused }: { paused: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden>
      {paused ? (
        <path d="M8.4 5.2a1 1 0 0 1 1.53-.85l8.4 5.3a1 1 0 0 1 0 1.7l-8.4 5.3a1 1 0 0 1-1.53-.85Z" />
      ) : (
        <>
          <rect x="7" y="5" width="3.4" height="14" rx="1.1" />
          <rect x="13.6" y="5" width="3.4" height="14" rx="1.1" />
        </>
      )}
    </svg>
  );
}

/**
 * The big-card carousel: autoplaying, and endless in both directions.
 *
 * The loop is three copies of the list. The middle copy is what you look at;
 * whenever the scroll drifts into an outer copy it is shifted back by exactly
 * one set width. Because every set is identical, that shift lands on a pixel
 * showing the same thing, so it is invisible — there is no rewind and no seam.
 *
 * Native scroll-snap still does the actual scrolling, which keeps real momentum,
 * touch dragging and keyboard support for free.
 */
export function CaseStudies() {
  const reduced = usePrefersReducedMotion();

  const railRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // Reasons to hold the autoplay, tracked in refs so the ticker can read them
  // without the interval being torn down and restarted on every change.
  const hovering = useRef(false);
  const videoPlaying = useRef(false);
  const onScreen = useRef(false);
  const quietUntil = useRef(0);

  const cards = useCallback(
    () =>
      Array.from(
        railRef.current?.querySelectorAll<HTMLElement>("[data-card]") ?? [],
      ),
    [],
  );

  /** Width of one full set, measured from the live layout. */
  const setWidth = useCallback(() => {
    const all = cards();
    if (all.length < COUNT + 1) return 0;
    return all[COUNT].offsetLeft - all[0].offsetLeft;
  }, [cards]);

  /**
   * Bring the scroll position back onto the middle set. The jump is always a
   * whole number of set widths, so nothing appears to move.
   *
   * The window is exactly [w, 2w) rather than something looser: snap-mandatory
   * means a resting scrollLeft is always a whole number of cards, so that range
   * lands on the middle set's cards and no others. It matters because the outer
   * sets are clones that sit outside the tab order — coming to rest on one
   * would leave a keyboard user on a card they cannot reach.
   */
  const recentre = useCallback(() => {
    const rail = railRef.current;
    const width = setWidth();
    if (!rail || width <= 0) return;
    let next = rail.scrollLeft;
    while (next < width) next += width;
    while (next >= width * 2) next -= width;
    if (Math.abs(next - rail.scrollLeft) > 1) rail.scrollLeft = next;
  }, [setWidth]);

  const sync = useCallback(() => {
    const rail = railRef.current;
    const all = cards();
    if (!rail || !all.length) return;
    const anchor = railAnchor(rail);
    let nearest = 0;
    let dist = Infinity;
    all.forEach((card, i) => {
      const d = Math.abs(card.getBoundingClientRect().left - anchor);
      if (d < dist) {
        dist = d;
        nearest = i;
      }
    });
    setActive(nearest % COUNT);
  }, [cards]);

  /** Step by whole cards from wherever we are, looping through the clones. */
  const advance = useCallback(
    (step: number) => {
      const rail = railRef.current;
      if (!rail) return;
      // Normalise first: a smooth scroll started from an outer set would be
      // interrupted by the recentre landing mid-flight.
      recentre();
      const all = cards();
      const anchor = railAnchor(rail);
      let from = 0;
      let dist = Infinity;
      all.forEach((card, i) => {
        const d = Math.abs(card.getBoundingClientRect().left - anchor);
        if (d < dist) {
          dist = d;
          from = i;
        }
      });
      const target = all[from + step];
      if (!target) return;
      const delta = target.getBoundingClientRect().left - anchor;
      rail.scrollTo({ left: rail.scrollLeft + delta, behavior: "smooth" });
    },
    [cards, recentre],
  );

  /** Jump to a specific study, choosing whichever copy of it is nearest. */
  const goTo = useCallback(
    (index: number) => {
      const rail = railRef.current;
      if (!rail) return;
      recentre();
      const all = cards();
      const anchor = railAnchor(rail);
      let best: HTMLElement | null = null;
      let bestDist = Infinity;
      all.forEach((card, i) => {
        if (i % COUNT !== index) return;
        const d = Math.abs(card.getBoundingClientRect().left - anchor);
        if (d < bestDist) {
          bestDist = d;
          best = card;
        }
      });
      if (!best) return;
      const delta = (best as HTMLElement).getBoundingClientRect().left - anchor;
      rail.scrollTo({ left: rail.scrollLeft + delta, behavior: "smooth" });
    },
    [cards, recentre],
  );

  // ---- wiring -----------------------------------------------------------
  useEffect(() => {
    const rail = railRef.current;
    const section = sectionRef.current;
    if (!rail || !section) return;

    // The rail drives its own smoothness through scrollTo, so the inherited
    // `scroll-behavior: smooth` is switched off — otherwise the silent
    // recentring jump would animate, and the seam would be visible.
    rail.style.scrollBehavior = "auto";

    let idle = 0;
    const onScroll = () => {
      sync();
      // Normally the shift waits for the scrolling to stop, so a fling is never
      // cut short. But a long fling could otherwise run out of runway and hit
      // the hard end of the rail, so once it passes the outer sets, shift now.
      const width = setWidth();
      if (width > 0) {
        const at = rail.scrollLeft;
        if (at < width * 0.4 || at > width * 2.6) recentre();
      }
      window.clearTimeout(idle);
      idle = window.setTimeout(recentre, 140);
    };

    const start = () => {
      // Open on the first card of the middle set, so there is a full set of
      // runway in both directions.
      const width = setWidth();
      if (width > 0) rail.scrollLeft = width;
      sync();
    };

    const onResize = () => {
      start();
    };

    start();
    // Fonts and images settle after first paint and change the set width.
    const settle = window.setTimeout(start, 300);

    rail.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen.current = entry.isIntersecting;
      },
      { threshold: 0.25 },
    );
    observer.observe(section);

    return () => {
      window.clearTimeout(idle);
      window.clearTimeout(settle);
      rail.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      observer.disconnect();
    };
  }, [sync, recentre, setWidth]);

  // ---- autoplay ---------------------------------------------------------
  useEffect(() => {
    if (reduced || paused) return;

    const tick = window.setInterval(() => {
      if (
        hovering.current ||
        videoPlaying.current ||
        !onScreen.current ||
        document.hidden ||
        Date.now() < quietUntil.current
      ) {
        return;
      }
      advance(1);
    }, AUTOPLAY_MS);

    return () => window.clearInterval(tick);
  }, [reduced, paused, advance]);

  /** Any deliberate interaction buys a quiet period before autoplay resumes. */
  const nudge = () => {
    quietUntil.current = Date.now() + RESUME_MS;
  };

  return (
    <section
      ref={sectionRef}
      id="case-studies"
      className="relative z-10 overflow-hidden py-24 md:py-32"
    >
      {/* Header */}
      <div className="mx-auto flex shell flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="max-w-[42rem]">
          <Reveal>
            <p className="eyebrow flex items-center gap-3 text-ink-faint">
              <span className="h-px w-8 bg-ink-faint/60" aria-hidden />
              Our Projects
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="display mt-6 text-[clamp(2.1rem,4.4vw,3.4rem)] text-ink">
              Work we&rsquo;ve done, <em className="italic">running</em>.
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-6 text-[1.02rem] leading-[1.75] text-ink-muted">
              Short demos of automations we&rsquo;ve built for real businesses.
              The write-up behind each one has the client, the problem and what
              actually changed.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.18}>
          <div className="flex items-center gap-2">
            {reduced ? null : (
              <button
                type="button"
                onClick={() => setPaused((v) => !v)}
                aria-label={paused ? "Resume autoplay" : "Pause autoplay"}
                className="flex size-12 items-center justify-center rounded-[var(--r-pill)] border border-hairline bg-surface text-ink-muted transition-colors duration-300 hover:text-ink"
              >
                <PlayGlyph paused={paused} />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                nudge();
                advance(-1);
              }}
              aria-label="Previous case study"
              className="flex size-12 items-center justify-center rounded-[var(--r-pill)] border border-hairline bg-surface text-ink transition-transform duration-300 hover:-translate-y-0.5"
            >
              <ArrowRightIcon className="rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => {
                nudge();
                advance(1);
              }}
              aria-label="Next case study"
              className="flex size-12 items-center justify-center rounded-[var(--r-pill)] border border-hairline bg-surface text-ink transition-transform duration-300 hover:-translate-y-0.5"
            >
              <ArrowRightIcon />
            </button>
          </div>
        </Reveal>
      </div>

      {/* Rail. The gutter is measured against the rail's own width rather than
          100vw, so it lands on the same line as the heading above — vw counts
          the scrollbar and would sit half a scrollbar too wide. */}
      <div
        ref={railRef}
        className="no-scrollbar mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain pb-4 md:gap-7"
        onPointerDown={nudge}
        onWheel={nudge}
        onMouseEnter={() => {
          hovering.current = true;
        }}
        onMouseLeave={() => {
          hovering.current = false;
        }}
        onFocusCapture={() => {
          hovering.current = true;
        }}
        onBlurCapture={() => {
          hovering.current = false;
        }}
        style={{
          // Same gutter the `.shell` bands use, so the first card starts on the
          // heading's left edge. Snap-start aligns a card to the scrollport
          // edge, so the scroll padding has to match or snap would pull the
          // first card flush against the window and cancel the gutter out.
          paddingInline:
            "max(var(--shell-gutter), calc((100% - var(--shell-max)) / 2))",
          scrollPaddingInline:
            "max(var(--shell-gutter), calc((100% - var(--shell-max)) / 2))",
        }}
      >
        {Array.from({ length: SETS }).flatMap((_, set) =>
          caseStudies.map((study) => (
            <div
              key={`${set}-${study.slug}`}
              data-card
              className="w-[min(86vw,760px)] shrink-0 snap-start md:w-[min(72vw,860px)]"
            >
              <CaseStudyCard
                study={study}
                decorative={set !== 1}
                onPlayingChange={(playing) => {
                  videoPlaying.current = playing;
                }}
              />
            </div>
          )),
        )}
      </div>

      {/* Position indicator + the way to everything else */}
      <div className="mx-auto mt-6 flex shell items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          {caseStudies.map((study, i) => (
            <button
              key={study.slug}
              type="button"
              onClick={() => {
                nudge();
                goTo(i);
              }}
              aria-label={`Go to ${study.client}`}
              aria-current={active === i}
              className="h-1 rounded-full transition-all duration-500"
              style={{
                width: active === i ? 34 : 14,
                backgroundColor:
                  active === i ? study.accent : "var(--c-hairline)",
              }}
            />
          ))}
        </div>

        <Link
          href="/case-studies"
          className="group inline-flex shrink-0 items-center gap-2 text-[0.9rem] font-medium text-accent"
        >
          See every case study
          <ArrowRightIcon className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
