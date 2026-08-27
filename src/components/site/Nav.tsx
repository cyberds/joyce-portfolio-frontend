"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { easeCurve } from "@/design/tokens";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";

const links = [
  { label: "Sound familiar?", href: "#familiar" },
  { label: "How it works", href: "#journey" },
  { label: "About Joyce", href: "#joyce" },
  { label: "What we help with", href: "#help" },
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
      <div
        className={`mx-auto mt-3 flex w-[min(1200px,94vw)] items-center justify-between rounded-[var(--r-pill)] border px-2 py-2 transition-all duration-500 ${
          scrolled ? "glass" : "border-transparent"
        } ${onDark ? "nav-dark" : ""}`}
      >
        <a
          href="#top"
          className="flex items-center gap-2.5 rounded-[var(--r-pill)] py-1.5 pl-3 pr-4"
        >
          <span className="size-2 rounded-full bg-accent" aria-hidden />
          <span className="display text-[1.25rem] leading-none">Joyce Wadawasina</span>
        </a>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`rounded-[var(--r-pill)] px-3.5 py-2 text-[0.86rem] transition-colors ${
                onDark
                  ? "text-deep-muted hover:text-deep-ink"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="#talk"
            className={`rounded-[var(--r-pill)] px-4 py-2.5 text-[0.86rem] font-medium transition-transform duration-300 hover:-translate-y-0.5 ${
              onDark ? "bg-deep-ink text-deep" : "bg-ink text-surface"
            }`}
          >
            Talk to Joyce
          </a>
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

      {open ? (
        <motion.nav
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: easeCurve }}
          className="glass mx-auto mt-2 flex w-[min(1200px,94vw)] flex-col rounded-[var(--r-lg)] p-2 lg:hidden"
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-[var(--r-md)] px-4 py-3 text-[0.95rem] text-ink-muted transition-colors hover:bg-surface hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </motion.nav>
      ) : null}
    </motion.header>
  );
}
