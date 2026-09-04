"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRightIcon,
  LinkedInIcon,
  LocationIcon,
  MailIcon,
  WhatsAppIcon,
} from "@/components/ui/icons";
import { Tooltip } from "@/components/ui/Tooltip";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** Root-relative, because the footer also runs on /about and /case-studies. */
const siteLinks = [
  { label: "How it works", href: "/journey" },
  { label: "Our Projects", href: "/case-studies" },
  { label: "About Joyce", href: "/about" },
  { label: "What we help with", href: "/#help" },
  { label: "Shop", href: "/shop" },
];

/** The label is what you read; `value` is what the tooltip reveals. */
const contacts = [
  {
    label: "Email",
    value: "hello@joycewadawasina.com",
    href: "mailto:hello@joycewadawasina.com",
    icon: MailIcon,
    external: false,
  },
  {
    label: "LinkedIn",
    value: "in/joyce-wadawasina",
    href: "https://www.linkedin.com/in/joyce-wadawasina/",
    icon: LinkedInIcon,
    external: true,
  },
  {
    label: "WhatsApp",
    value: "+44 7436 836888",
    href: "https://wa.me/447436836888",
    icon: WhatsAppIcon,
    external: true,
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
        },
      );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
      className="relative z-10 overflow-hidden border-t border-hairline bg-white/40"
    >
      {/* Top Grid */}
      <div className="mx-auto grid shell gap-12 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-[26rem]">
          <p className="text-[0.96rem] leading-[1.7] text-ink-muted">
            AI and automation, explained simply. Simpler systems that give you
            back the time to run your business.
          </p>
          <Link
            href="https://wa.me/447436836888"
            className="mt-6 inline-flex items-center gap-2 text-[0.88rem] font-medium text-ink transition-transform duration-200 hover:translate-x-1"
          >
            Talk to Joyce
            <ArrowRightIcon className="text-accent" />
          </Link>

          <p className="mt-5 flex items-start gap-2.5 text-[0.88rem] leading-[1.5] text-ink-muted">
            <LocationIcon className="mt-0.5 shrink-0 text-accent" />
            <span>Falkirk, Scotland, United Kingdom</span>
          </p>
        </div>

        <div>
          <p className="eyebrow text-ink-faint">The site</p>
          <ul className="mt-5 space-y-3">
            {siteLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-[0.92rem] text-ink-muted transition-colors hover:text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow text-ink-faint">Elsewhere</p>
          <ul className="mt-5 space-y-3">
            {contacts.map((contact) => {
              const Icon = contact.icon;
              return (
                <li key={contact.label}>
                  <Tooltip value={contact.value}>
                    {(describedBy) => (
                      <a
                        href={contact.href}
                        aria-describedby={describedBy}
                        target={contact.external ? "_blank" : undefined}
                        rel={
                          contact.external ? "noopener noreferrer" : undefined
                        }
                        className="group/link inline-flex items-center gap-2.5 text-[0.92rem] text-ink-muted transition-colors hover:text-ink focus-visible:text-ink"
                      >
                        <Icon className="shrink-0 text-accent transition-colors duration-300 group-hover/link:text-accent" />
                        {contact.label}
                      </a>
                    )}
                  </Tooltip>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Huge Monumental Ultra-Bold Brand Name Banner */}
      <div className="hidden relative flex w-full select-none items-center justify-center overflow-hidden pb-12 pt-6">
        <h2
          ref={bigNameRef}
          className="w-full whitespace-nowrap text-center text-[clamp(1.2rem,10.2vw,13.5rem)] font-[900] leading-[0.78] tracking-tight text-ink/90 will-change-transform"
          style={{ fontFamily: "var(--font-display)" }}
        >
          JOYCE WADAWASINA
        </h2>
      </div>

      {/* Bottom Copyright Line */}
      <div className="mx-auto flex shell flex-col gap-2 border-t border-hairline py-7 text-[0.78rem] text-ink-faint md:flex-row md:items-center md:justify-between">
        <p>
          &copy; {new Date().getFullYear()} Joyce Wadawasina. All rights
          reserved.
        </p>
        <p>
          Business automation · AI training · Software engineering &amp; branding
        </p>
      </div>
    </footer>
  );
}
