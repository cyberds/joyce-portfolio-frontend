"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRightIcon } from "@/components/ui/icons";
import { caseStudies } from "@/lib/caseStudies";
import { CaseStudyCard } from "./CaseStudyCard";

/**
 * Where a card's left edge lands when it is the one in view: the rail's left
 * edge plus the gutter. Read from layout rather than recomputed, because
 * `scroll-padding` is reported unresolved by getComputedStyle.
 */
function railAnchor(rail: HTMLElement) {
  const pad = parseFloat(getComputedStyle(rail).paddingLeft) || 0;
  return rail.getBoundingClientRect().left + pad;
}

/**
 * The big-card carousel. Native scroll-snap does the work — it gives real
 * momentum, trackpad and touch dragging, and keyboard scrolling for free — and
 * the arrows just nudge it by one card.
 */
export function CaseStudies() {
  const railRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const cards = Array.from(
      rail.querySelectorAll<HTMLElement>("[data-card]"),
    );
    if (!cards.length) return;

    // Whichever card's left edge sits nearest the rail's gutter is "active".
    const anchor = railAnchor(rail);
    let nearest = 0;
    let nearestDist = Infinity;
    cards.forEach((card, i) => {
      const dist = Math.abs(card.getBoundingClientRect().left - anchor);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = i;
      }
    });
    setActive(nearest);

    // The rail's resting scrollLeft is the gutter, not zero — snap-start aligns
    // the first card's edge to the scrollport — so "at the start" has to be
    // asked of the active card, not of the scroll offset.
    setAtStart(nearest === 0);
    setAtEnd(rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 8);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    sync();
    rail.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      rail.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  const scrollToCard = (index: number) => {
    const rail = railRef.current;
    if (!rail) return;
    const cards = rail.querySelectorAll<HTMLElement>("[data-card]");
    const target = cards[Math.max(0, Math.min(cards.length - 1, index))];
    if (!target) return;
    // Measured as a delta from where the card is now, so it stays correct
    // whatever the gutter and scroll-padding resolve to at this width.
    const delta = target.getBoundingClientRect().left - railAnchor(rail);
    rail.scrollTo({ left: rail.scrollLeft + delta, behavior: "smooth" });
  };

  return (
    <section id="case-studies" className="relative z-10 overflow-hidden py-24 md:py-32">
      {/* Header */}
      <div className="mx-auto flex w-[min(1200px,94vw)] flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="max-w-[42rem]">
          <Reveal>
            <p className="eyebrow flex items-center gap-3 text-ink-faint">
              <span className="h-px w-8 bg-ink-faint/60" aria-hidden />
              Case studies
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
            <button
              type="button"
              onClick={() => scrollToCard(active - 1)}
              disabled={atStart}
              aria-label="Previous case study"
              className="flex size-12 items-center justify-center rounded-[var(--r-pill)] border border-hairline bg-surface text-ink transition-all duration-300 hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-35"
            >
              <ArrowRightIcon className="rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => scrollToCard(active + 1)}
              disabled={atEnd}
              aria-label="Next case study"
              className="flex size-12 items-center justify-center rounded-[var(--r-pill)] border border-hairline bg-surface text-ink transition-all duration-300 hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-35"
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
        className="no-scrollbar mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain scroll-smooth pb-4 md:gap-7"
        style={{
          paddingInline: "calc((100% - min(1200px, 94vw)) / 2)",
          // Snap-start aligns a card to the scrollport edge, which would pull
          // the first card flush against the window and cancel the gutter out.
          scrollPaddingInline: "calc((100% - min(1200px, 94vw)) / 2)",
        }}
      >
        {caseStudies.map((study) => (
          <div
            key={study.slug}
            data-card
            className="w-[min(86vw,760px)] shrink-0 snap-start md:w-[min(72vw,860px)]"
          >
            <CaseStudyCard study={study} />
          </div>
        ))}

        {/* Tail card: the way to everything else */}
        <div
          data-card
          className="flex w-[min(70vw,380px)] shrink-0 snap-start items-center"
        >
          <Link
            href="/case-studies"
            className="group flex h-full w-full flex-col justify-end gap-4 rounded-[var(--r-lg)] border border-hairline bg-surface p-8 transition-colors duration-500 hover:bg-canvas"
          >
            <span className="display text-[1.6rem] leading-[1.15] text-ink">
              See every case study
            </span>
            <span className="inline-flex items-center gap-2 text-[0.9rem] font-medium text-accent">
              All work
              <ArrowRightIcon className="transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </div>

      {/* Position indicator */}
      <div className="mx-auto mt-6 flex w-[min(1200px,94vw)] items-center gap-2">
        {caseStudies.map((study, i) => (
          <button
            key={study.slug}
            type="button"
            onClick={() => scrollToCard(i)}
            aria-label={`Go to ${study.client}`}
            aria-current={active === i}
            className="h-1 rounded-full transition-all duration-500"
            style={{
              width: active === i ? 34 : 14,
              backgroundColor: active === i ? study.accent : "var(--c-hairline)",
            }}
          />
        ))}
      </div>
    </section>
  );
}
