"use client";

import { useRef, useState } from "react";
import type { CaseStudy } from "@/lib/caseStudies";

/**
 * The demo on a case study page: the same video as the carousel card, but with
 * sound available and native controls once it has been started.
 */
export function CaseStudyPlayer({ study }: { study: CaseStudy }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [hasVideo, setHasVideo] = useState(true);

  const start = () => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = false;
    void el.play().catch(() => {
      // Autoplay policies can refuse an unmuted start; fall back to muted.
      el.muted = true;
      void el.play().catch(() => setHasVideo(false));
    });
    setStarted(true);
  };

  return (
    <div
      className="relative aspect-[16/9] w-full overflow-hidden rounded-[var(--r-lg)]"
      style={{ backgroundColor: "#140c10" }}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `radial-gradient(110% 90% at 25% 0%, ${study.accent}55, transparent 62%), linear-gradient(160deg, ${study.accent}22, #140c10 70%)`,
        }}
      />

      {hasVideo ? (
        <video
          ref={videoRef}
          className="relative h-full w-full object-cover"
          src={study.video}
          poster={study.poster}
          playsInline
          preload="metadata"
          controls={started}
          onError={() => setHasVideo(false)}
        />
      ) : (
        <p className="absolute inset-0 flex items-center justify-center px-6 text-center text-[0.9rem] text-white/50">
          Demo video coming shortly.
        </p>
      )}

      {!started && hasVideo ? (
        <button
          type="button"
          onClick={start}
          className="group absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/25 transition-colors duration-300 hover:bg-black/15"
        >
          <span
            className="flex size-20 items-center justify-center rounded-full text-black shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)] transition-transform duration-300 group-hover:scale-105"
            style={{ backgroundColor: study.accent }}
          >
            <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor" aria-hidden>
              <path d="M8.4 5.2a1 1 0 0 1 1.53-.85l8.4 5.3a1 1 0 0 1 0 1.7l-8.4 5.3a1 1 0 0 1-1.53-.85Z" />
            </svg>
          </span>
          <span className="text-[0.88rem] font-medium text-white">
            Watch the demo · {study.duration}
          </span>
        </button>
      ) : null}
    </div>
  );
}
