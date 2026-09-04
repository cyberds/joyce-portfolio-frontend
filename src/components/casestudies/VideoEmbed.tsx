"use client";

import { useRef, useState } from "react";
import { resolveVideo, withAutoplay } from "@/lib/video";

/**
 * Every video on a case study page, whatever it is hosted on.
 *
 * Loom, YouTube and Google Drive can only be embedded as iframes, which means
 * no poster and no shared styling — so they sit behind a facade: our own play
 * button over the study's poster art, with the iframe injected on click. That
 * keeps three heavy third-party players off the initial load and makes a Drive
 * video look identical to a Loom one.
 *
 * With no URL at all, the same frame renders the "demo coming shortly" plate,
 * so the layout never collapses around a missing video.
 */
export function VideoEmbed({
  url,
  poster,
  accent,
  label = "Watch the demo",
  duration,
  pendingLabel = "Demo video coming shortly",
}: {
  url?: string | null;
  poster?: string | null;
  accent: string;
  label?: string;
  duration?: string | null;
  pendingLabel?: string;
}) {
  const source = resolveVideo(url);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);

  const wash = (
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        background: `radial-gradient(110% 90% at 25% 0%, ${accent}55, transparent 62%), linear-gradient(160deg, ${accent}22, #140c10 70%)`,
      }}
    />
  );

  const frame =
    "relative aspect-video w-full overflow-hidden rounded-[var(--r-lg)] bg-[#140c10]";

  // Nothing to play, or a URL we could not make sense of.
  if (!source || failed) {
    return (
      <div className={frame}>
        {wash}
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
        ) : null}
        <p className="absolute inset-0 flex items-center justify-center px-6 text-center text-[0.9rem] text-white/60">
          {pendingLabel}
        </p>
      </div>
    );
  }

  const start = () => {
    setStarted(true);
    if (source.kind === "file") {
      const el = videoRef.current;
      if (!el) return;
      el.muted = false;
      void el.play().catch(() => {
        // Autoplay policy can refuse an unmuted start; fall back to muted.
        el.muted = true;
        void el.play().catch(() => setFailed(true));
      });
    }
  };

  return (
    <figure className="m-0">
      <div className={frame}>
        {wash}

        {source.kind === "file" ? (
          <video
            ref={videoRef}
            className="relative h-full w-full object-cover"
            src={source.src}
            poster={poster ?? undefined}
            playsInline
            preload="metadata"
            controls={started}
            onError={() => setFailed(true)}
          />
        ) : started ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={withAutoplay(source)}
            title={label}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}

        {!started ? (
          <button
            type="button"
            onClick={start}
            className="group absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/30 transition-colors duration-300 hover:bg-black/15 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white"
          >
            <span
              className="flex size-16 items-center justify-center rounded-full text-black shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)] transition-transform duration-300 group-hover:scale-105 sm:size-20"
              style={{ backgroundColor: accent }}
            >
              <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden>
                <path d="M8.4 5.2a1 1 0 0 1 1.53-.85l8.4 5.3a1 1 0 0 1 0 1.7l-8.4 5.3a1 1 0 0 1-1.53-.85Z" />
              </svg>
            </span>
            <span className="px-6 text-center text-[0.88rem] font-medium text-white">
              {label}
              {duration ? ` · ${duration}` : ""}
            </span>
          </button>
        ) : null}
      </div>

      {/*
        A Drive file shared to the wrong audience shows Google's own
        "request access" screen inside the iframe, and being cross-origin we
        cannot detect that. The link is the honest fallback.
      */}
      {source.kind === "iframe" ? (
        <figcaption className="mt-3 text-[0.82rem] text-ink-faint">
          Trouble playing?{" "}
          <a
            href={source.watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-hairline underline-offset-4 transition-colors hover:text-ink"
          >
            Open it in a new tab
          </a>
          .
        </figcaption>
      ) : null}
    </figure>
  );
}
