"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRightIcon } from "@/components/ui/icons";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const columns = [
  {
    title: "The site",
    links: [
      { label: "Sound familiar?", href: "#familiar" },
      { label: "How it works", href: "#journey" },
      { label: "Case studies", href: "#case-studies" },
      { label: "About Joyce", href: "#joyce" },
      { label: "What we help with", href: "#help" },
    ],
  },
  {
    title: "Elsewhere",
    links: [
      {
        label: "WhatsApp",
        href: "https://wa.me/447436836888",
        external: true,
      },
      { label: "LinkedIn", href: "#" },
      { label: "Email", href: "mailto:hello@joycewadawasina.com" },
    ],
  },
];

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const bigNameRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!bigNameRef.current) return;

    const ctx = gsap.context(() => {
      // Kerning animation: starts wide and smoothly draws together as it scrolls into view
      gsap.fromTo(
        bigNameRef.current,
        {
          letterSpacing: "0.14em",
          opacity: 0.85,
        },
        {
          letterSpacing: "-0.035em",
          opacity: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 85%",
            end: "bottom bottom",
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        }
      );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="relative z-10 border-t border-hairline overflow-hidden bg-white/40">
      {/* Top Grid */}
      <div className="mx-auto grid w-[min(1200px,94vw)] gap-12 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-[26rem]">
          <p className="text-[0.96rem] leading-[1.7] text-ink-muted">
            AI and automation, explained simply. Simpler systems that give you
            back the time to run your business.
          </p>
          <a
            href="#talk"
            className="mt-6 inline-flex items-center gap-2 text-[0.88rem] font-medium text-ink transition-transform duration-200 hover:translate-x-1"
          >
            Talk to Joyce
            <ArrowRightIcon className="text-accent" />
          </a>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <p className="eyebrow text-ink-faint">{column.title}</p>
            <ul className="mt-5 space-y-3">
              {column.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className="text-[0.92rem] text-ink-muted transition-colors hover:text-ink"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Huge Monumental Ultra-Bold Brand Name Banner */}
      <div className="relative w-full overflow-hidden select-none pt-6 pb-12 flex items-center justify-center">
        <h2
          ref={bigNameRef}
          className="w-full text-center font-[900] text-ink/90 leading-[0.78] tracking-tight whitespace-nowrap text-[clamp(1.2rem,10.2vw,13.5rem)] will-change-transform"
          style={{ fontFamily: "var(--font-display)" }}
        >
          JOYCE WADAWASINA
        </h2>
      </div>

      {/* Bottom Copyright Line */}
      <div className="mx-auto flex w-[min(1200px,94vw)] flex-col gap-2 border-t border-hairline py-7 text-[0.78rem] text-ink-faint md:flex-row md:items-center md:justify-between">
        <p>&copy; {new Date().getFullYear()} Joyce Wadawasina. All rights reserved.</p>
        <p>Business automation · AI training · Software engineering &amp; branding</p>
      </div>
    </footer>
  );
}
