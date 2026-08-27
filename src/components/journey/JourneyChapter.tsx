"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { easeCurve } from "@/design/tokens";
import { clamp01, journeyScroll } from "./scrollState";
import { stations } from "./journeyStations";

const JourneyScene = dynamic(() => import("./JourneyScene"), { ssr: false });

/**
 * The dark chapter. One tall section, one sticky frame: the 3D line runs
 * underneath while the station copy changes above it. Scroll progress is
 * written to a plain object (never state) so the scene can read it every frame
 * without re-rendering React; only the active station index is stateful.
 */
export function JourneyChapter() {
  const section = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion() ?? false;

  useEffect(() => {
    const el = section.current;
    if (!el) return;

    let frame = 0;
    let last = -1;

    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const progress = clamp01(travel > 0 ? -rect.top / travel : 0);
      journeyScroll.progress = progress;

      const index = Math.min(
        stations.length - 1,
        Math.round(progress * (stations.length - 1)),
      );
      if (index !== last) {
        last = index;
        setActive(index);
      }
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const station = stations[active];

  return (
    <div className="dark-zone relative bg-deep text-deep-ink">
      {/* Paper folds into the dark. */}
      <div
        aria-hidden
        className="h-32 bg-gradient-to-b from-canvas-deep to-deep md:h-40"
      />

      <div className="mx-auto w-[min(1200px,94vw)] pb-16 md:pb-24">
        <p className="eyebrow flex items-center gap-3 text-deep-muted">
          <span className="h-px w-8 bg-deep-muted/50" aria-hidden />
          What it looks like when it works
        </p>
        <h2 className="display mt-6 max-w-[24ch] text-[clamp(2.1rem,4.6vw,3.6rem)] text-deep-ink">
          Let&rsquo;s follow one enquiry, from the moment it arrives.
        </h2>
        <p className="mt-6 max-w-[38rem] text-[1.02rem] leading-[1.75] text-deep-muted">
          Nothing here is exotic. It&rsquo;s the same enquiry you already get —
          just connected, so nobody has to hold it in their head.
        </p>
      </div>

      <section
        id="journey"
        ref={section}
        style={{ height: `${(stations.length + 1) * 90}vh` }}
        className="relative"
      >
        <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
          <div className="absolute inset-0">
            <JourneyScene reduced={reduced} />
          </div>

          {/* Legibility: darken the left third where the copy sits. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(100deg,rgba(16,13,11,0.94)_0%,rgba(16,13,11,0.78)_34%,rgba(16,13,11,0)_62%)]"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-deep to-transparent"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-deep to-transparent"
          />

          <div className="relative mx-auto flex h-full w-[min(1200px,94vw)] items-center">
            <div className="w-full max-w-[34rem]">
              <div className="flex items-center gap-4">
                <span className="display text-[0.95rem] tracking-[0.2em] text-accent">
                  {station.index}
                </span>
                <span className="h-px flex-1 bg-deep-muted/25" aria-hidden />
                <span className="text-[0.72rem] tracking-[0.18em] text-deep-muted uppercase">
                  {String(stations.length).padStart(2, "0")} steps
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={station.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.55, ease: easeCurve }}
                >
                  <h3 className="display mt-7 text-[clamp(2rem,4.2vw,3.1rem)] text-deep-ink">
                    {station.title}
                  </h3>
                  <p className="mt-6 flex gap-3 text-[0.95rem] leading-[1.65] text-deep-muted">
                    <span
                      aria-hidden
                      className="mt-2.5 h-px w-5 shrink-0 bg-deep-muted/60"
                    />
                    {station.before}
                  </p>
                  <p className="mt-4 flex gap-3 text-[1.05rem] leading-[1.7] text-deep-ink">
                    <span
                      aria-hidden
                      className="mt-2.5 h-px w-5 shrink-0 bg-accent"
                    />
                    {station.after}
                  </p>
                </motion.div>
              </AnimatePresence>

              <ol className="mt-12 flex items-center gap-2">
                {stations.map((s, i) => (
                  <li key={s.id} className="flex-1">
                    <span
                      className={`block h-px transition-all duration-700 ${
                        i <= active ? "bg-accent" : "bg-deep-muted/25"
                      }`}
                    />
                    <span className="sr-only">{s.title}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-[min(1200px,94vw)] pb-24 pt-8 md:pb-32">
        <p className="mx-auto max-w-[44rem] text-center text-[clamp(1.2rem,2.3vw,1.65rem)] leading-[1.5] text-deep-ink">
          No new team members. No twelve new subscriptions. Just the tools you
          already pay for,{" "}
          <em className="display italic text-accent">finally talking to each other</em>.
        </p>
      </div>

      {/* Back out into the paper. */}
      <div
        aria-hidden
        className="h-32 bg-gradient-to-b from-deep to-canvas md:h-40"
      />
    </div>
  );
}
