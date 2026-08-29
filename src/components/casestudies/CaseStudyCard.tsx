"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CaseStudy } from "@/lib/caseStudies";
import { ArrowRightIcon } from "@/components/ui/icons";

function PlayGlyph({ playing }: { playing: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
      {playing ? (
        <>
          <rect x="7" y="5" width="3.6" height="14" rx="1.2" />
          <rect x="13.4" y="5" width="3.6" height="14" rx="1.2" />
        </>
      ) : (
        <path d="M8.4 5.2a1 1 0 0 1 1.53-.85l8.4 5.3a1 1 0 0 1 0 1.7l-8.4 5.3a1 1 0 0 1-1.53-.85Z" />
      )}
    </svg>
  );
}

/**
 * One card: the video, a play control, a short heading and the way through to
 * the write-up. Deliberately almost wordless — the detail page carries the
 * client, the problem and the numbers.
 */
export function CaseStudyCard({
  study,
  onPlayingChange,
  decorative = false,
}: {
  study: CaseStudy;
  /** Lets the carousel hold its autoplay while a demo is actually playing. */
  onPlayingChange?: (playing: boolean) => void;
  /**
   * One of the carousel's cloned copies. It stays clickable — it points at the
   * same study — but leaves the tab order and the accessibility tree, so the
   * list is announced once rather than three times.
   */
  decorative?: boolean;
}) {
  const tab = decorative ? -1 : undefined;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [hasVideo, setHasVideo] = useState(true);

  // Never leave a card playing once it has been scrolled past.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && !el.paused) {
          el.pause();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play().catch(() => setHasVideo(false));
    } else {
      el.pause();
    }
  };

  return (
    <article
      aria-hidden={decorative || undefined}
      className="group relative flex h-full flex-col overflow-hidden rounded-[var(--r-lg)] bg-deep text-deep-ink shadow-[0_30px_80px_-50px_rgba(36,19,25,0.8)]"
      style={{ backgroundColor: "#140c10" }}
    >
      {/* Media */}
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `radial-gradient(120% 100% at 30% 0%, ${study.accent}55, transparent 62%), linear-gradient(160deg, ${study.accent}22, #140c10 70%)`,
          }}
        />

        {hasVideo ? (
          <video
            ref={videoRef}
            className="relative h-full w-full object-cover"
            src={study.video}
            poster={study.poster}
            muted
            loop
            playsInline
            preload="metadata"
            onPlay={() => {
              setPlaying(true);
              onPlayingChange?.(true);
            }}
            onPause={() => {
              setPlaying(false);
              onPlayingChange?.(false);
            }}
            onEnded={() => onPlayingChange?.(false)}
            onError={() => setHasVideo(false)}
          />
        ) : null}

        {/* Scrim so the control and duration stay legible over any frame */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-black/20"
        />

        <button
          type="button"
          onClick={toggle}
          tabIndex={tab}
          aria-label={`${playing ? "Pause" : "Play"} the ${study.client} demo`}
          className="absolute bottom-4 left-4 flex items-center gap-2.5 rounded-[var(--r-pill)] border border-white/20 bg-black/45 py-2 pl-2 pr-4 text-[0.82rem] font-medium text-white backdrop-blur-md transition-all duration-300 hover:bg-black/65 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <span
            className="flex size-9 items-center justify-center rounded-full text-black transition-transform duration-300 group-hover:scale-105"
            style={{ backgroundColor: study.accent }}
          >
            <PlayGlyph playing={playing} />
          </span>
          {playing ? "Pause" : "Watch the demo"}
        </button>

        <span className="absolute bottom-6 right-5 font-mono text-[0.72rem] text-white/60">
          {study.duration}
        </span>
      </div>

      {/* Words — as few as the card can get away with */}
      <div className="flex flex-1 flex-col justify-between gap-6 p-6 sm:p-8">
        <div>
          <p className="eyebrow flex items-center gap-2.5 text-white/45">
            <span
              className="size-1.5 rounded-full"
              style={{ backgroundColor: study.accent }}
            />
            {study.industry}
          </p>
          <h3 className="display mt-4 text-[clamp(1.35rem,2.4vw,1.85rem)] leading-[1.15] text-white">
            {study.cardHeading}
          </h3>
        </div>

        <Link
          href={`/case-studies/${study.slug}`}
          tabIndex={tab}
          className="inline-flex w-fit items-center gap-2 rounded-[var(--r-pill)] bg-white px-5 py-3 text-[0.88rem] font-medium text-ink transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          View case study
          <ArrowRightIcon />
        </Link>
      </div>
    </article>
  );
}
