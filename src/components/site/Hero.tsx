"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowDownIcon,
  ArrowRightIcon,
  LinkedInIcon,
  MailIcon,
  WhatsAppIcon,
} from "@/components/ui/icons";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const socials = [
  { name: "LinkedIn", href: "https://www.linkedin.com/in/joyce-wadawasina/", icon: LinkedInIcon },
  { name: "WhatsApp", href: "https://wa.me/447436836888", icon: WhatsAppIcon },
  { name: "Email", href: "mailto:hello@joycewadawasina.com", icon: MailIcon },
];

/** Per-word masks so each word can swing up from below its own baseline. */
function Words({ text, wordClass = "" }: { text: string; wordClass?: string }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="inline-block overflow-hidden pb-[0.12em] align-bottom"
        >
          <span className={`hero-word inline-block ${wordClass}`}>
            {word}&nbsp;
          </span>
        </span>
      ))}
    </>
  );
}

/**
 * Fluid grey gradient waves: broad translucent bands in ~80% grey, drawn on a
 * canvas and heavily blurred so they read as slow-moving silk on black.
 */
function useWaves(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  still: boolean,
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const ribbons = [
      { amp: 0.1, freq: 0.7, speed: 0.05, y: 0.55, band: 0.22, a: 0.2 },
      { amp: 0.13, freq: 0.5, speed: -0.035, y: 0.68, band: 0.3, a: 0.14 },
      { amp: 0.08, freq: 1.1, speed: 0.04, y: 0.35, band: 0.14, a: 0.1 },
      { amp: 0.06, freq: 1.4, speed: -0.06, y: 0.8, band: 0.08, a: 0.16 },
    ];

    // Drawn at a fraction of the display size and stretched by the browser:
    // the upscale supplies the softness for free, where a CSS blur on a
    // full-screen canvas redrawn every frame stalls the main thread (and with
    // it every GSAP entrance on the page).
    const SCALE = 0.12;
    let w = 0;
    let h = 0;
    const resize = () => {
      w = Math.max(1, Math.round(canvas.clientWidth * SCALE));
      h = Math.max(1, Math.round(canvas.clientHeight * SCALE));
      canvas.width = w;
      canvas.height = h;
      ctx.filter = "blur(3px)";
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      const time = t / 1000;
      for (const r of ribbons) {
        const wave = (x: number, off: number) =>
          h * r.y +
          Math.sin((x / w) * Math.PI * 2 * r.freq + time * r.speed * 6 + off) * h * r.amp +
          Math.sin((x / w) * Math.PI * r.freq * 0.7 - time * r.speed * 4) * h * r.amp * 0.7;
        ctx.beginPath();
        for (let x = -4; x <= w + 4; x += 2) ctx.lineTo(x, wave(x, 0));
        for (let x = w + 4; x >= -4; x -= 2) ctx.lineTo(x, wave(x, 1.1) + h * r.band);
        ctx.closePath();
        const g = ctx.createLinearGradient(0, h * (r.y - r.amp), 0, h * (r.y + r.band + r.amp));
        g.addColorStop(0, "rgba(204,204,204,0)");
        g.addColorStop(0.5, `rgba(204,204,204,${r.a})`);
        g.addColorStop(1, "rgba(204,204,204,0)");
        ctx.fillStyle = g;
        ctx.fill();
      }
    };

    // The waves move slowly, so ~30fps is indistinguishable and halves the work.
    let lastDraw = 0;
    const loop = (t: number) => {
      if (visible && t - lastDraw > 32) {
        draw(t);
        lastDraw = t;
      }
      raf = requestAnimationFrame(loop);
    };
    if (still) draw(0);
    else raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [canvasRef, still]);
}

export function Hero() {
  const reduced = usePrefersReducedMotion();
  const outerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);

  useWaves(canvasRef, reduced);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || reduced) return;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(panel);

      // Explicit start and end states on every tween, so a re-run (Strict
      // Mode, Fast Refresh) can never leave an element parked mid-entrance.
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.fromTo(canvasRef.current, { autoAlpha: 0, scale: 1.15 }, { autoAlpha: 1, scale: 1, duration: 2.6, ease: "power2.out" }, 0)
        .fromTo(q(".hero-word"), { yPercent: 120, rotate: 7 }, { yPercent: 0, rotate: 0, duration: 1.1, stagger: 0.06 }, 0.25)
        .fromTo(
          q(".hero-mark"),
          { backgroundSize: "0% 0.3em" },
          { backgroundSize: "100% 0.3em", duration: 0.9, ease: "power2.inOut" },
          1.05,
        )
        .fromTo(
          q(".hero-para"),
          { autoAlpha: 0, y: 24, filter: "blur(8px)" },
          { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1.1 },
          0.85,
        )
        .fromTo(
          q(".hero-action"),
          { autoAlpha: 0, y: 26, scale: 0.9 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.12, ease: "back.out(1.8)" },
          1.05,
        )
        .fromTo(
          portraitRef.current,
          { clipPath: "inset(100% 0% 0% 0%)", yPercent: 10, scale: 1.06 },
          { clipPath: "inset(0% 0% 0% 0%)", yPercent: 0, scale: 1, duration: 1.6, ease: "expo.out" },
          0.35,
        )
        .fromTo(
          q(".hero-social"),
          { x: 90, autoAlpha: 0 },
          { x: 0, autoAlpha: 1, duration: 0.8, stagger: 0.1, ease: "back.out(1.6)" },
          1.4,
        )
        .fromTo(q(".hero-cue"), { autoAlpha: 0, y: -12 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 1.6);

      // Shrink the whole black panel as it leaves, revealing white around it.
      const scrub = {
        trigger: outerRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      };
      gsap.to(panel, { scale: 0.86, borderRadius: 38, ease: "none", scrollTrigger: scrub });
      gsap.to(contentRef.current, { yPercent: -8, opacity: 0.35, ease: "none", scrollTrigger: { ...scrub } });

      // Failsafe: the headline is the first thing anyone reads, so if a slow
      // device or a background tab ever stalls the entrance, snap it to done.
      const failsafe = window.setTimeout(() => {
        if (tl.progress() < 1) tl.progress(1);
      }, 4500);
      return () => window.clearTimeout(failsafe);
    }, panel);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <div ref={outerRef} className="relative bg-white">
      <section
        id="top"
        ref={panelRef}
        className="dark-zone relative h-[100svh] min-h-[36rem] w-full origin-[50%_85%] overflow-hidden bg-black text-white will-change-transform"
      >
        <canvas
          ref={canvasRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full"
        />

        {/* Portrait: large, anchored to the section's right and bottom edges. */}
        <div
          ref={portraitRef}
          className="absolute bottom-0 right-0 md:right-20 h-[48svh] w-full md:h-full md:w-[42vw]"
        >
          <Image
            src="/images/joyce-hero.png"
            alt="Joyce Wadawasina"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 58vw"
            className="object-contain object-[center_bottom] md:object-[right_bottom]"
          />
        </div>

        <div ref={contentRef} className="relative mx-auto h-full shell">
          <div className="relative z-10 flex h-full flex-col justify-start pt-[clamp(6rem,15svh,9rem)] md:justify-center md:pt-16">
            <div className="max-w-[38rem] md:max-w-[46%]">
              <h1 className="display text-balance text-[clamp(2rem,min(5vw,7.2svh),4.4rem)] leading-[1.05] text-white">
                <Words text="Your business is growing." />{" "}
                <Words text="Your workload" />{" "}
                <em className="italic">
                  <Words text="doesn’t have to" wordClass="hero-mark marked" />
                </em>{" "}
                <Words text="grow with it." />
              </h1>

              <p className="hero-para mt-[clamp(1rem,2.6svh,1.75rem)] max-w-[30rem] text-[clamp(0.92rem,2svh,1.05rem)] leading-[1.7] text-white/65">
                I&rsquo;m an automation and AI consultant. With my team, I help
                businesses find where time and effort are being lost, cut the
                repetitive workload, and bring AI into the way they work —
                safely, and with their people on board.{" "}
                <span className="text-white">More done, without more overhead.</span>
              </p>

              <div className="mt-[clamp(1.25rem,3.4svh,2.25rem)] flex flex-wrap items-center gap-3">
                <span className="hero-action inline-block">
                  <a
                    href="#help"
                    className="group flex items-center gap-2 rounded-[var(--r-pill)] bg-white px-6 py-3.5 text-[0.92rem] font-medium text-black transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    See how we help
                    <ArrowRightIcon className="transition-transform duration-300 group-hover:translate-x-1" />
                  </a>
                </span>
                <span className="hero-action inline-block">
                  <a
                    href="#talk"
                    className="block rounded-[var(--r-pill)] border border-white/25 bg-black/30 px-6 py-3.5 text-[0.92rem] font-medium text-white backdrop-blur-sm transition-colors duration-300 hover:border-white/60"
                  >
                    Talk to Joyce
                  </a>
                </span>
              </div>
            </div>
          </div>

          <a
            href="#familiar"
            className="hero-cue absolute bottom-6 left-0 z-10 hidden items-center gap-2.5 text-[0.8rem] text-white/55 transition-colors hover:text-white md:flex"
          >
            <span className="flex size-8 items-center justify-center rounded-full border border-white/20">
              <ArrowDownIcon />
            </span>
            Does any of this sound familiar?
          </a>
        </div>

        {/* Floating socials on the right edge: glass tabs that stretch left on hover. */}
        <ul className="absolute right-0 top-1/2 z-20 flex -translate-y-1/2 flex-col items-end gap-2">
          {socials.map(({ name, href, icon: Icon }) => (
            <li key={name} className="hero-social">
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Click to open ${name}`}
                className="group flex h-12 items-center rounded-l-2xl border border-r-0 border-white/20 bg-white/10 text-white shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-colors duration-300 hover:bg-white/20"
              >
                <span className="grid max-w-0 overflow-hidden whitespace-nowrap text-[0.82rem] opacity-0 transition-[max-width,opacity,padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:max-w-[12rem] group-hover:pl-4 group-hover:opacity-100 group-focus-visible:max-w-[12rem] group-focus-visible:pl-4 group-focus-visible:opacity-100">
                  Click to open {name}
                </span>
                <span className="flex size-12 shrink-0 items-center justify-center">
                  <Icon className="size-5" />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
