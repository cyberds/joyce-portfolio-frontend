"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { stations, Station } from "./journeyStations";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** Crisp vector icons inside the station points */
function StationGlyph({ type }: { type: Station["icon"] }) {
  const props = {
    viewBox: "0 0 24 24",
    width: "15",
    height: "15",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (type) {
    case "mail":
      return (
        <svg {...props}>
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      );
    case "send":
      return (
        <svg {...props}>
          <path d="m22 2-7 20-4-9-9-4Z" />
          <path d="M22 2 11 13" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...props}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
          <path d="m9 16 2 2 4-4" />
        </svg>
      );
    case "database":
      return (
        <svg {...props}>
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
        </svg>
      );
    case "sync":
      return (
        <svg {...props}>
          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.19" />
        </svg>
      );
    case "chart":
      return (
        <svg {...props}>
          <path d="M3 3v18h18" />
          <path d="m19 9-5 5-4-4-3 3" />
        </svg>
      );
    default:
      return null;
  }
}

export function JourneyChapter() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const fluidPathRef = useRef<SVGPathElement>(null);
  const headCircleRef = useRef<SVGCircleElement>(null);
  const nodeRefs = useRef<(SVGGElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Exact coordinates on the SVG coordinate system (viewBox 0 0 1200 3300)
  const stationCoords = [
    { x: 600, y: 320, side: "left", cardX: 250, cardY: 320 },    // 01 Capture (Card on Left)
    { x: 600, y: 780, side: "right", cardX: 950, cardY: 780 },   // 02 Reply (Card on Right)
    { x: 600, y: 1240, side: "left", cardX: 250, cardY: 1240 },  // 03 Booking (Card on Left)
    { x: 820, y: 1700, side: "under", cardX: 820, cardY: 1940 }, // 04 CRM (Under horizontal pipe)
    { x: 380, y: 1700, side: "under", cardX: 380, cardY: 1940 }, // 05 Follow-up (Under horizontal pipe)
    { x: 600, y: 2600, side: "right", cardX: 950, cardY: 2600 }, // 06 Clarity (Card on Right)
  ];

  // SVG Pipeline Path with generous breathing room
  const pipePathD = `
    M 600,60
    L 600,1320
    Q 600,1440 720,1440
    L 1020,1440
    Q 1120,1440 1120,1540
    L 1120,1600
    Q 1120,1700 1020,1700
    L 180,1700
    Q 80,1700 80,1800
    L 80,2150
    Q 80,2250 180,2250
    L 500,2250
    Q 600,2250 600,2350
    L 600,3100
  `;

  useEffect(() => {
    if (!containerRef.current || !pinRef.current || !fluidPathRef.current || !stageRef.current) return;

    const ctx = gsap.context(() => {
      const fluidPath = fluidPathRef.current!;
      let totalLen = 4200;
      try {
        totalLen = fluidPath.getTotalLength() || 4200;
      } catch {
        totalLen = 4200;
      }

      // Sample exact path lengths for stations
      const stationLengths = stationCoords.map((coord) => {
        let bestLen = 0;
        let bestDist = Infinity;
        for (let len = 0; len <= totalLen; len += 4) {
          const pt = fluidPath.getPointAtLength(len);
          const dist = Math.hypot(pt.x - coord.x, pt.y - coord.y);
          if (dist < bestDist) {
            bestDist = dist;
            bestLen = len;
          }
        }
        return bestLen;
      });

      const DURATION = 12;

      // Set initial SVG presentation attributes & CSS
      fluidPath.style.strokeDasharray = `${totalLen}`;
      fluidPath.style.strokeDashoffset = `${totalLen}`;
      gsap.set(fluidPath, {
        stroke: stations[0].color,
        strokeDashoffset: totalLen,
      });

      // Master Timeline driven by ScrollTrigger with continuous camera tracking
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          pin: pinRef.current,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const currentLen = totalLen * self.progress;
            try {
              const pt = fluidPath.getPointAtLength(Math.min(totalLen, Math.max(0, currentLen)));
              
              // 1. Move fluid head droplet
              if (headCircleRef.current) {
                headCircleRef.current.setAttribute("cx", String(pt.x));
                headCircleRef.current.setAttribute("cy", String(pt.y));
              }

              // 2. Real-time continuous camera tracking (always keeps active fluid & card framed)
              if (stageRef.current) {
                const stageH = stageRef.current.offsetHeight || 1600;
                const stageW = stageRef.current.offsetWidth || 900;

                // Calculate intelligent focal target:
                // During the horizontal segment (y between 1440 and 2150), lock Y comfortably to 1750
                // so the horizontal pipe and cards underneath stay centered without drifting into the navbar!
                let focalY = pt.y;
                let focalX = pt.x;

                if (pt.y >= 1440 && pt.y <= 2150) {
                  focalY = 1750; // Lock vertical camera to keep horizontal pipe & cards in center
                }

                // Convert focal point to stage translation
                const targetY = -((focalY - 460) / 3300) * stageH;
                const targetX = -((focalX - 600) / 1200) * (stageW * 0.32);

                gsap.set(stageRef.current, {
                  y: targetY,
                  x: targetX,
                });
              }
            } catch {
              // fallback
            }
          },
        },
      });

      // 1. Header slides out gently at start of scroll
      if (headerRef.current) {
        tl.to(
          headerRef.current,
          {
            y: -50,
            opacity: 0,
            duration: 0.8,
            ease: "power1.out",
          },
          0,
        );
      }

      // 2. Fluid fills along the pipeline directly
      tl.to(
        fluidPath,
        {
          strokeDashoffset: 0,
          duration: DURATION,
          ease: "none",
        },
        0,
      );

      // 3. Synchronize Station Nodes, Color Shifts & Card Fly-Ins exactly at contact time
      stationLengths.forEach((len, i) => {
        const exactTime = (len / totalLen) * DURATION;
        const station = stations[i];

        // Fluid color shift
        tl.to(
          fluidPath,
          {
            stroke: station.color,
            duration: 0.4,
            ease: "power1.out",
          },
          exactTime,
        );

        if (headCircleRef.current) {
          tl.to(
            headCircleRef.current,
            {
              fill: station.color,
              duration: 0.3,
            },
            exactTime,
          );
        }

        // Node Activation
        const node = nodeRefs.current[i];
        if (node) {
          const circle = node.querySelector(".node-circle");
          const glyph = node.querySelector(".node-glyph");
          const pulse = node.querySelector(".node-pulse");

          tl.to(
            circle,
            {
              fill: station.color,
              stroke: station.color,
              duration: 0.3,
              ease: "back.out(2)",
            },
            exactTime,
          );

          if (glyph) {
            tl.to(
              glyph,
              {
                color: "#ffffff",
                duration: 0.25,
              },
              exactTime,
            );
          }

          if (pulse) {
            tl.fromTo(
              pulse,
              { scale: 1, opacity: 0.9, stroke: station.color },
              { scale: 2, opacity: 0, duration: 0.7, ease: "power2.out" },
              exactTime,
            );
          }
        }

        // Card Fly-In Animation
        const card = cardRefs.current[i];
        if (card) {
          const coord = stationCoords[i];
          let startX = 0;
          let startY = 0;
          if (coord.side === "left") startX = -280;
          if (coord.side === "right") startX = 280;
          if (coord.side === "under") startY = 200;

          // Card flies in the exact moment fluid activates the node
          tl.fromTo(
            card,
            {
              x: startX,
              y: startY,
              opacity: 0,
              scale: 0.85,
            },
            {
              x: 0,
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.65,
              ease: "back.out(1.7)",
            },
            exactTime,
          );

          // Previous card dims cleanly to prevent visual clutter
          if (i > 0) {
            const prevCard = cardRefs.current[i - 1];
            if (prevCard) {
              tl.to(
                prevCard,
                {
                  opacity: 0.25,
                  scale: 0.94,
                  duration: 0.5,
                },
                exactTime,
              );
            }
          }
        }
      });
    }, containerRef);

    // Refresh ScrollTrigger after DOM settle
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, []);

  return (
    <section
      id="journey"
      ref={containerRef}
      className="relative bg-white text-stone-900 border-t border-stone-200/80"
      style={{ height: "500vh" }}
      suppressHydrationWarning
    >
      {/* Pinned Viewport */}
      <div
        ref={pinRef}
        className="h-screen w-full overflow-hidden flex flex-col justify-between items-center relative"
      >
        {/* Intro Header — Slides out smoothly on scroll */}
        <div ref={headerRef} className="pt-10 pb-4 text-center px-4 max-w-3xl pointer-events-none z-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3.5 py-1 text-[11px] font-medium tracking-wider text-stone-600 uppercase">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Connected Journey
          </div>
          <h2 className="display mt-3 text-[clamp(1.8rem,3.4vw,2.8rem)] font-normal text-stone-950 leading-tight">
            Let&rsquo;s follow one enquiry, from the moment it arrives.
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-stone-500 max-w-lg mx-auto">
            Nothing here is exotic. It&rsquo;s the same enquiry you already get —
            connected into a clean pipeline so nobody has to hold it in their head.
          </p>
        </div>

        {/* 2D Pipeline Stage (Panned by GSAP camera) */}
        <div className="relative w-full max-w-5xl flex-1 flex items-center justify-center">
          <div
            ref={stageRef}
            className="relative w-full aspect-[1200/3300] max-h-[3300px] will-change-transform"
          >
            {/* SVG Pipeline Canvas */}
            <svg
              className="h-full w-full"
              viewBox="0 0 1200 3300"
              fill="none"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <filter id="nodeShadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.08" />
                </filter>
              </defs>

              {/* 1. Off-white / Light Grey Outer Pipe */}
              <path
                d={pipePathD}
                stroke="#eae6df"
                strokeWidth="14"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={pipePathD}
                stroke="#dfdad0"
                strokeWidth="16"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity="0.4"
                fill="none"
              />

              {/* 2. Dynamic Colored Fluid Filling inside the Pipe */}
              <path
                ref={fluidPathRef}
                d={pipePathD}
                stroke="#f59e0b"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />

              {/* 3. Fluid Head Glow Droplet */}
              <circle
                ref={headCircleRef}
                cx="600"
                cy="40"
                r="6"
                fill="#f59e0b"
                className="transition-colors duration-300"
              />

              {/* 4. Small Sleek Station Points along Pipeline */}
              {stations.map((s, i) => {
                const coord = stationCoords[i];
                return (
                  <g
                    key={s.id}
                    ref={(el) => {
                      nodeRefs.current[i] = el;
                    }}
                    transform={`translate(${coord.x}, ${coord.y})`}
                    className="cursor-default"
                  >
                    {/* Ripple Ring */}
                    <circle
                      className="node-pulse"
                      r="16"
                      fill="none"
                      stroke={s.color}
                      strokeWidth="2"
                      opacity="0"
                      style={{ transformOrigin: "center" }}
                    />

                    {/* Small Point Circle (Sleek 32px diameter) */}
                    <circle
                      className="node-circle"
                      r="16"
                      fill="#ffffff"
                      stroke="#d1cbbf"
                      strokeWidth="2.5"
                      filter="url(#nodeShadow)"
                    />

                    {/* Icon ForeignObject centered precisely */}
                    <foreignObject x="-9" y="-9" width="18" height="18" className="pointer-events-none">
                      <div className="node-glyph flex size-full items-center justify-center text-stone-400">
                        <StationGlyph type={s.icon} />
                      </div>
                    </foreignObject>
                  </g>
                );
              })}
            </svg>

            {/* HTML Fly-in Flat White Cards Layer */}
            <div className="absolute inset-0 pointer-events-none">
              {stations.map((s, i) => {
                const coord = stationCoords[i];
                const leftPercent = (coord.cardX / 1200) * 100;
                const topPercent = (coord.cardY / 3300) * 100;

                return (
                  <div
                    key={s.id}
                    ref={(el) => {
                      cardRefs.current[i] = el;
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 will-change-transform pointer-events-auto"
                    style={{
                      left: `${leftPercent}%`,
                      top: `${topPercent}%`,
                    }}
                  >
                    {/* Flat White Card (Compact, clean, no overlapping) */}
                    <div
                      className="w-[260px] sm:w-[290px] rounded-xl bg-white p-4 border border-stone-200/90 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.06),0_8px_20px_-4px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04]"
                      style={{
                        borderTop: `3px solid ${s.color}`,
                      }}
                    >
                      {/* Step Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase">
                          <span
                            className="size-2 rounded-full"
                            style={{ backgroundColor: s.color }}
                          />
                          <span className="text-stone-900">{s.tag}</span>
                        </div>
                        <span className="text-[11px] font-mono text-stone-400">
                          {s.index}/06
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="display mt-2 text-[0.95rem] font-medium text-stone-900 leading-snug">
                        {s.title}
                      </h3>

                      {/* Normally / Status Quo */}
                      <div className="mt-2.5 rounded-lg bg-stone-50 p-2.5 text-[11.5px] leading-relaxed text-stone-500 border border-stone-100">
                        <div className="flex items-center gap-1 text-[9.5px] uppercase tracking-wider font-semibold text-stone-400 mb-0.5">
                          <span className="size-1 rounded-full bg-stone-400" />
                          Normally
                        </div>
                        {s.before}
                      </div>

                      {/* Connected Pipeline */}
                      <div
                        className="mt-1.5 rounded-lg p-2.5 text-[11.5px] leading-relaxed text-stone-900 border"
                        style={{
                          backgroundColor: `${s.color}0a`,
                          borderColor: `${s.color}25`,
                        }}
                      >
                        <div
                          className="flex items-center gap-1 text-[9.5px] uppercase tracking-wider font-semibold mb-0.5"
                          style={{ color: s.color }}
                        >
                          <span
                            className="size-1 rounded-full"
                            style={{ backgroundColor: s.color }}
                          />
                          With Joyce
                        </div>
                        {s.after}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Outro Summary Statement where the pipe terminates */}
        <div className="py-6 text-center px-4 max-w-2xl z-20">
          <p className="text-sm sm:text-base font-normal text-stone-800 leading-relaxed">
            No new team members. No twelve new subscriptions. Just the tools you
            already pay for,{" "}
            <em className="display font-semibold italic text-stone-950 underline decoration-amber-500/60 decoration-2 underline-offset-4">
              finally talking to each other
            </em>.
          </p>
        </div>
      </div>
    </section>
  );
}
