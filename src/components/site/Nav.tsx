"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { easeCurve } from "@/design/tokens";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";

const links = [
  { label: "Sound familiar?", href: "/#familiar" },
  { label: "How it works", href: "/#journey" },
  { label: "Case studies", href: "/case-studies" },
  { label: "About Joyce", href: "/about" },
  { label: "What we help with", href: "/#help" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [onDark, setOnDark] = useState(false);
  const [open, setOpen] = useState(false);

  // The bar sits over both paper and the dark chapter, so it has to know which.
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      const zones = document.querySelectorAll<HTMLElement>(".dark-zone");
      let dark = false;
      zones.forEach((zone) => {
        const rect = zone.getBoundingClientRect();
        if (rect.top <= 72 && rect.bottom >= 72) dark = true;
      });
      setOnDark(dark);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: easeCurve }}
      className="fixed inset-x-0 top-0 z-50"
    >
      {/* The shell owns the width; the pill owns the look. Keeping them on
          separate elements means the bar's colour transition can never end up
          animating its width when the viewport resizes. */}
      <div className="shell mt-3">
        <div
          className={`flex w-full items-center justify-between rounded-[var(--r-pill)] border px-2 py-2 transition-colors duration-500 ${
            scrolled ? "glass" : "border-transparent"
          } ${onDark ? "nav-dark" : ""}`}
        >
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-[var(--r-pill)] py-1.5 pl-3 pr-4"
        >
          <span className="size-2 rounded-full bg-accent" aria-hidden />
          <span className="display text-[1.25rem] leading-none">Joyce Wadawasina</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-[var(--r-pill)] px-3.5 py-2 text-[0.86rem] transition-colors ${
                onDark
                  ? "text-deep-muted hover:text-deep-ink"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="https://wa.me/447436836888"
            className={`rounded-[var(--r-pill)] px-4 py-2.5 !text-[10px] !md:text-[0.86rem] font-medium transition-transform duration-300 hover:-translate-y-0.5 ${
              onDark ? "bg-deep-ink text-deep" : "bg-ink text-surface"
            }`}
          >
            Talk to Joyce
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className={`flex size-10 items-center justify-center rounded-[var(--r-pill)] border lg:hidden ${
              onDark
                ? "border-deep-ink/20 bg-transparent text-deep-ink"
                : "border-hairline bg-surface text-ink"
            }`}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
          </div>
        </div>
      </div>

      {open ? (
        <motion.nav
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: easeCurve }}
          className="glass mx-auto mt-2 flex shell flex-col rounded-[var(--r-lg)] p-2 lg:hidden"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-[var(--r-md)] px-4 py-3 text-[0.95rem] text-ink-muted transition-colors hover:bg-surface hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </motion.nav>
      ) : null}
    </motion.header>
  );
}
