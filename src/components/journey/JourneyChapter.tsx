"use client";

import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { stations } from "./journeyStations";
import { getJourneyLayout } from "./journeyLayout";
import { StationCard, StationGlyph } from "./StationCard";
import { useMediaQuery, usePrefersReducedMotion } from "@/hooks/useMediaQuery";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** Timeline units spent moving between stations, split by distance travelled. */
const TRAVEL_TOTAL = 6;
/**
 * Timeline units the camera holds still at a station. The card is at full
 * opacity for all of it, so this is literally the reading time.
 */
const DWELL = 2.2;

/** How strongly the background picks up the active station's colour. */
const TINT_STRENGTH = 0.085;

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function JourneyChapter() {
  const isNarrow = useMediaQuery("(max-width: 767px)");
  const reduced = usePrefersReducedMotion();

  const containerRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const outroRef = useRef<HTMLDivElement>(null);
  const fluidPathRef = useRef<SVGPathElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const nodeRefs = useRef<(SVGGElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const tintRef = useRef<HTMLDivElement>(null);

  const layout = useMemo(() => getJourneyLayout(isNarrow), [isNarrow]);

  useEffect(() => {
    if (reduced) return;
    const container = containerRef.current;
    const pin = pinRef.current;
    const frame = frameRef.current;
    const stage = stageRef.current;
    const fluidPath = fluidPathRef.current;
    if (!container || !pin || !frame || !stage || !fluidPath) return;

    const ctx = gsap.context(() => {
      const totalLen = fluidPath.getTotalLength();
      if (!totalLen) return;

      // --- station times -------------------------------------------------
      // Nodes are bezier anchors on this exact path, so a single sampling pass
      // locates every one of them to within half a step.
      const best = layout.nodes.map(() => ({ len: 0, dist: Infinity }));
      for (let len = 0; len <= totalLen; len += 6) {
        const pt = fluidPath.getPointAtLength(len);
        for (let i = 0; i < layout.nodes.length; i += 1) {
          const n = layout.nodes[i];
          const dist = Math.hypot(pt.x - n.x, pt.y - n.y);
          if (dist < best[i].dist) best[i] = { len, dist };
        }
      }
      const stationLengths = best.map((b) => b.len);

      // --- camera --------------------------------------------------------
      // The stage is absolutely positioned with its TOP edge on the frame's
      // vertical midpoint, so a point at SVG y renders at
      //   frameY = frameH / 2 + (y / vbH) * stageH + translateY
      // Solving for the translate that parks that point `bias` down the frame:
      let frameH = 0;
      let stageH = 0;
      const measure = () => {
        frameH = frame.clientHeight;
        stageH = stage.offsetHeight;
      };
      const cameraY = (y: number) =>
        frameH * layout.bias - frameH / 2 - (y / layout.vbH) * stageH;

      measure();

      // --- initial state -------------------------------------------------
      gsap.set(fluidPath, {
        strokeDasharray: totalLen,
        strokeDashoffset: totalLen,
        stroke: stations[0].color,
      });
      gsap.set(headRef.current, { autoAlpha: 0 });

      // One number drives the whole chapter: how far the fluid has travelled.
      // The fill, the droplet and the camera are all read off it, so they can
      // never drift apart.
      const head = { len: 0 };

      const syncHead = () => {
        const len = gsap.utils.clamp(0, totalLen, head.len);
        const pt = fluidPath.getPointAtLength(len);
        fluidPath.style.strokeDashoffset = String(totalLen - len);
        headRef.current?.setAttribute(
          "transform",
          `translate(${pt.x}, ${pt.y})`,
        );
        // No X translate on purpose: the stage is always exactly as wide as the
        // frame, so the full width is already on screen and any horizontal pan
        // could only push content out of view.
        gsap.set(stage, { x: 0, y: cameraY(pt.y) });
      };

      syncHead();

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "bottom bottom",
          pin,
          // The container already reserves the scroll room. Letting GSAP add
          // its own spacer on top is what leaves a blank screen-height gap
          // underneath a pinned section.
          pinSpacing: false,
          scrub: 0.7,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: () => {
            measure();
            syncHead();
          },
        },
      });

      // The fluid moves in hops: travel to a station, then hold there while its
      // card lands and can actually be read, then move on. A single constant-
      // speed sweep is what leaves every card sliding off the top of the frame
      // before the reader reaches the end of the sentence.
      const marks = [0, ...stationLengths, totalLen];
      // Travel time tracks distance, so the fluid keeps one apparent speed.
      // segment 0 is the lead-in, segment i is the run out of station i-1, and
      // the last is the tail after the final station.
      const segment = marks
        .slice(1)
        .map((mark, i) =>
          Math.max(0.3, TRAVEL_TOTAL * ((mark - marks[i]) / totalLen)),
        );

      const stationTimes: number[] = [];
      let cursor = 0;

      segment.forEach((duration, i) => {
        tl.to(
          head,
          {
            len: marks[i + 1],
            duration,
            ease: i === 0 ? "power1.in" : "power1.inOut",
            onUpdate: syncHead,
          },
          cursor,
        );
        cursor += duration;

        if (i < stations.length) {
          stationTimes.push(cursor);
          cursor += DWELL;
        }
      });

      tl.to(headRef.current, { autoAlpha: 1, duration: 0.25 }, 0);

      // The intro clears out of the way as the first station approaches.
      if (headerRef.current) {
        tl.to(
          headerRef.current,
          {
            y: -28,
            autoAlpha: 0,
            duration: Math.max(0.4, stationTimes[0] * 0.7),
            ease: "power1.in",
          },
          0,
        );
      }

      // --- per-station beats ---------------------------------------------
      const stageScale = () => stage.offsetWidth / layout.vbW;

      // The background carries a whisper of whatever colour the fluid is
      // currently running. Tweened as plain numbers on an object rather than as
      // a CSS colour string, so the interpolation is predictable.
      const tint = hexToRgb(stations[0].color);
      const applyTint = () => {
        tintRef.current?.style.setProperty(
          "--journey-tint",
          `rgb(${Math.round(tint.r)} ${Math.round(tint.g)} ${Math.round(tint.b)})`,
        );
      };
      applyTint();

      stationTimes.forEach((time, i) => {
        const station = stations[i];

        tl.to(
          fluidPath,
          { stroke: station.color, duration: 0.5, ease: "power1.out" },
          time,
        );

        tl.to(
          tint,
          {
            ...hexToRgb(station.color),
            duration: 0.7,
            ease: "power1.out",
            onUpdate: applyTint,
          },
          time,
        );

        const glow = headRef.current?.querySelector(".head-glow");
        const core = headRef.current?.querySelector(".head-core");
        if (core) tl.to(core, { fill: station.color, duration: 0.35 }, time);
        if (glow) tl.to(glow, { fill: station.color, duration: 0.35 }, time);

        const node = nodeRefs.current[i];
        if (node) {
          const circle = node.querySelector(".node-circle");
          const glyph = node.querySelector(".node-glyph");
          const pulse = node.querySelector(".node-pulse");

          if (circle) {
            tl.to(
              circle,
              {
                fill: station.color,
                stroke: station.color,
                duration: 0.35,
                ease: "back.out(2)",
              },
              time,
            );
          }
          if (glyph) tl.to(glyph, { color: "#ffffff", duration: 0.25 }, time);
          if (pulse) {
            tl.fromTo(
              pulse,
              { scale: 1, opacity: 0.85 },
              {
                scale: 2.4,
                opacity: 0,
                duration: 0.8,
                ease: "power2.out",
                // Without this, fromTo writes its start values the moment the
                // timeline is built and every ripple sits visible on the page.
                immediateRender: false,
              },
              time,
            );
          }
        }

        const dot = dotRefs.current[i];
        if (dot) {
          tl.to(
            dot,
            {
              backgroundColor: station.color,
              scaleX: 2.4,
              opacity: 1,
              duration: 0.3,
            },
            time,
          );
        }

        const card = cardRefs.current[i];
        if (card) {
          const off = layout.cardOffset[i];
          // Wide layouts throw the card in from its side, in SVG units scaled
          // to rendered pixels so the distance reads the same at any width.
          // The phone panel rises from the bottom edge instead.
          const from = layout.cardsFollowPipe
            ? { x: off.x * stageScale(), y: off.y * stageScale() }
            : { x: 0, y: 46 };

          tl.fromTo(
            card,
            { ...from, autoAlpha: 0, scale: 0.94 },
            {
              x: 0,
              y: 0,
              autoAlpha: 1,
              scale: 1,
              duration: Math.min(0.9, DWELL * 0.42),
              ease: "back.out(1.5)",
            },
            time,
          );

          // The card holds for the whole dwell and only starts leaving once the
          // fluid moves off, so it is readable for every frame the camera is
          // actually still. Fading it inside the dwell is what made cards feel
          // like they vanished early.
          tl.to(
            card,
            {
              autoAlpha: 0,
              scale: 0.97,
              duration: segment[i + 1] * 0.6,
              ease: "power1.in",
            },
            time + DWELL,
          );
        }
      });

      if (outroRef.current) {
        gsap.set(outroRef.current, { autoAlpha: 0, y: 14 });
        tl.to(
          outroRef.current,
          { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" },
          Math.max(0, tl.duration() - 1.1),
        );
      }
    }, containerRef);

    const refresh = () => ScrollTrigger.refresh();
    const timer = window.setTimeout(refresh, 200);
    window.addEventListener("load", refresh);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("load", refresh);
      ctx.revert();
    };
  }, [layout, reduced]);

  // ---- reduced motion: the same content, simply stacked -------------------
  if (reduced) {
    return (
      <section
        id="journey"
        className="relative border-y border-stone-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#ffffff_38%,var(--c-canvas)_100%)] text-stone-900"
      >
        <div className="mx-auto w-[min(760px,92vw)] py-24 text-center">
          <JourneyHeading />
          <ol className="mt-12 space-y-8 text-left">
            {stations.map((s) => (
              <li key={s.id} className="flex gap-4">
                <span
                  className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: s.color }}
                >
                  <StationGlyph type={s.icon} size={16} />
                </span>
                <StationCard station={s} />
              </li>
            ))}
          </ol>
          <JourneyOutro className="mt-14" />
        </div>
      </section>
    );
  }

  return (
    <section
      id="journey"
      ref={containerRef}
      className="relative border-y border-stone-200/80 bg-white text-stone-900"
      style={{ height: isNarrow ? "760svh" : "700svh" }}
      suppressHydrationWarning
    >
      <div ref={pinRef} className="relative h-[100svh] w-full overflow-hidden">
        {/* Background, in three restrained layers. It stays white — the wash
            only leans towards the paper the rest of the site is printed on,
            the grid is the same one `.paper` uses, and the tint is a few
            percent of the colour the fluid is currently carrying. All of it
            sits under white cards, which it separates rather than muddies. */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#ffffff_38%,var(--c-canvas)_100%)]" />
          <div
            ref={tintRef}
            className="absolute inset-0"
            style={{
              opacity: TINT_STRENGTH,
              background:
                "radial-gradient(120% 72% at 50% 44%, var(--journey-tint, transparent) 0%, transparent 62%)",
            }}
          />
          <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,var(--c-grid)_1px,transparent_1px),linear-gradient(to_bottom,var(--c-grid)_1px,transparent_1px)] [background-size:88px_88px] [mask-image:radial-gradient(110%_75%_at_50%_45%,#000_5%,transparent_78%)]" />
        </div>

        {/* Camera frame. The stage is taller than this and slides behind it. */}
        <div ref={frameRef} className="absolute inset-0 overflow-hidden">
          <div
            ref={stageRef}
            className="absolute left-0 top-1/2 w-full will-change-transform"
            style={{ aspectRatio: `${layout.vbW} / ${layout.vbH}` }}
          >
            <svg
              className="h-full w-full"
              viewBox={`0 0 ${layout.vbW} ${layout.vbH}`}
              fill="none"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden
            >
              <defs>
                <filter
                  id="journeyNodeShadow"
                  x="-40%"
                  y="-40%"
                  width="180%"
                  height="180%"
                >
                  <feDropShadow
                    dx="0"
                    dy="2"
                    stdDeviation="3"
                    floodColor="#241319"
                    floodOpacity="0.1"
                  />
                </filter>
              </defs>

              {/* Empty pipe */}
              <path
                d={layout.pathD}
                stroke="#eae6df"
                strokeWidth="16"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Fluid */}
              <path
                ref={fluidPathRef}
                d={layout.pathD}
                stroke={stations[0].color}
                strokeWidth="9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Leading droplet */}
              <g ref={headRef}>
                <circle
                  className="head-glow"
                  r="18"
                  fill={stations[0].color}
                  opacity="0.18"
                />
                <circle className="head-core" r="7" fill={stations[0].color} />
              </g>

              {/* Stations */}
              {stations.map((s, i) => {
                const n = layout.nodes[i];
                return (
                  <g
                    key={s.id}
                    ref={(el) => {
                      nodeRefs.current[i] = el;
                    }}
                    transform={`translate(${n.x}, ${n.y})`}
                  >
                    <circle
                      className="node-pulse"
                      r="17"
                      fill="none"
                      stroke={s.color}
                      strokeWidth="2"
                      opacity="0"
                      style={{ transformOrigin: "center" }}
                    />
                    <circle
                      className="node-circle"
                      r="17"
                      fill="#ffffff"
                      stroke="#d9d2c6"
                      strokeWidth="2.5"
                      filter="url(#journeyNodeShadow)"
                    />
                    <foreignObject x="-9" y="-9" width="18" height="18">
                      <div className="node-glyph flex size-full items-center justify-center text-stone-400">
                        <StationGlyph type={s.icon} />
                      </div>
                    </foreignObject>
                  </g>
                );
              })}
            </svg>

            {/* Wide only: cards ride the same coordinate system as the SVG. */}
            {layout.cardsFollowPipe ? (
              <div className="pointer-events-none absolute inset-0">
                {stations.map((s, i) => {
                  const c = layout.cards[i];
                  return (
                    <div
                      key={s.id}
                      ref={(el) => {
                        cardRefs.current[i] = el;
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 will-change-transform"
                      style={{
                        left: `${(c.x / layout.vbW) * 100}%`,
                        top: `${(c.y / layout.vbH) * 100}%`,
                        visibility: "hidden",
                      }}
                    >
                      <StationCard station={s} />
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>

        {/* Narrow only: the card is a panel pinned to the bottom of the frame,
            outside the moving stage. Its position depends on the frame, not on
            the pipeline, so a short screen can never crop it. */}
        {layout.cardsFollowPipe ? null : (
          <div className="pointer-events-none absolute inset-x-0 bottom-9 z-10 px-4">
            <div className="relative mx-auto w-full max-w-[26rem]">
              {stations.map((s, i) => (
                <div
                  key={s.id}
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  className="absolute inset-x-0 bottom-0 will-change-transform"
                  style={{ visibility: "hidden" }}
                >
                  <StationCard station={s} fluid />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Intro — an overlay, so it costs the camera no height */}
        <div
          ref={headerRef}
          className="pointer-events-none absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-white via-white/95 to-transparent px-5 pb-14 pt-[max(5rem,11svh)] text-center"
        >
          <JourneyHeading />
        </div>

        {/* Progress rail */}
        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center gap-2">
          {stations.map((s, i) => (
            <span
              key={s.id}
              ref={(el) => {
                dotRefs.current[i] = el;
              }}
              className="h-1 w-3 rounded-full bg-stone-300 opacity-60"
            />
          ))}
        </div>

        {/* Outro — arrives once the pipe has filled */}
        <div
          ref={outroRef}
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-canvas via-canvas/95 to-transparent px-5 pb-12 pt-0"
        >
          <JourneyOutro />
        </div>
      </div>
    </section>
  );
}

function JourneyHeading() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="hidden inline-flex items-center gap-2 rounded-[var(--r-pill)] border border-stone-200 bg-stone-50 px-3.5 py-1 text-[11px] font-medium uppercase tracking-wider text-stone-600">
        <span className="size-1.5 rounded-full bg-accent" />
        Connected journey
      </div>
      <h2 className="display mt-4 text-[clamp(1.7rem,3.4vw,2.7rem)] leading-tight text-stone-950">
        Let&rsquo;s follow one enquiry, from the moment it arrives.
      </h2>
      <p className="mx-auto mt-3 max-w-lg text-[0.85rem] leading-relaxed text-stone-500 sm:text-sm">
        Nothing here is exotic. It&rsquo;s the same enquiry you already get —
        connected into a clean pipeline so nobody has to hold it in their head.
      </p>
    </div>
  );
}

function JourneyOutro({ className = "" }: { className?: string }) {
  return (
    <p
      className={`mx-auto max-w-2xl text-center leading-relaxed text-stone-800 sm:text-base ${className}`}
    >
      No new team members. No twelve new subscriptions. Just the tools you
      already pay for,{" "}
      <em className="display font-semibold italic text-stone-950 underline decoration-accent/60 decoration-2 underline-offset-4">
        finally talking to each other
      </em>
      .
    </p>
  );
}
