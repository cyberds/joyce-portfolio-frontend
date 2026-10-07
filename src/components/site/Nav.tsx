"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { caseStudies } from "@/lib/caseStudies";
import { motion } from "framer-motion";
import { easeCurve } from "@/design/tokens";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";
import { CartButton } from "@/components/shop/CartButton";

const links = [
  // { label: "Sound familiar?", href: "/#familiar" },
  { label: "Our Projects", href: "/case-studies" },
  { label: "About Joyce", href: "/about" },
  { label: "Shop", href: "/shop" },
  // { label: "What we help with", href: "/#help" },
];

const PROJECTS_HREF = "/case-studies";

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden
      className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
    >
      <path d="M2 3.75 5 6.75l3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Desktop: opens on hover or keyboard focus. The panel sits flush under the
    trigger (padding, not margin) so the pointer never crosses a dead gap. */
function ProjectsDropdown({ label, onDark }: { label: string; onDark: boolean }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hide = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  return (
    <div
      className="relative"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) hide();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
    >
      <Link
        href={PROJECTS_HREF}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen(false)}
        className={`flex items-center gap-1.5 rounded-[var(--r-pill)] px-3.5 py-2 text-[0.86rem] transition-colors ${
          onDark ? "text-deep-muted hover:text-deep-ink" : "text-ink-muted hover:text-ink"
        }`}
      >
        {label}
        <Chevron open={open} />
      </Link>

      <div
        className={`absolute left-1/2 top-full w-[22rem] -translate-x-1/2 pt-3 ${
          open ? "" : "pointer-events-none"
        }`}
      >
        {/* Fade the panel itself: opacity on a wrapper would cut the panel
            off from the page behind it and kill the blur mid-transition. */}
        <div
          className={`glass-menu rounded-[var(--r-sm)] p-1.5 transition-[opacity,translate] duration-200 ${
            onDark ? "glass-menu-dark" : ""
          } ${open ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"}`}
        >
          {caseStudies.map((study) => (
            <Link
              key={study.slug}
              href={`/case-studies/${study.slug}`}
              onClick={() => setOpen(false)}
              tabIndex={open ? 0 : -1}
              className={`group flex items-start gap-3 rounded-[var(--r-sm)] px-3 py-2.5 transition-colors ${
                onDark ? "hover:bg-white/10" : "hover:bg-white/60"
              }`}
            >
              <span
                className="mt-1.5 size-2 shrink-0 rounded-full"
                style={{ backgroundColor: study.accent }}
                aria-hidden
              />
              <span className="min-w-0">
                <span
                  className={`block text-[0.88rem] leading-snug ${onDark ? "text-deep-ink" : "text-ink"}`}
                >
                  {study.cardHeading}
                </span>
                <span
                  className={`block text-[0.75rem] ${onDark ? "text-deep-muted" : "text-ink-faint"}`}
                >
                  {study.client}
                </span>
              </span>
            </Link>
          ))}
          <Link
            href={PROJECTS_HREF}
            onClick={() => setOpen(false)}
            tabIndex={open ? 0 : -1}
            className={`mt-1 block rounded-[var(--r-sm)] px-3 py-2.5 text-[0.82rem] font-medium transition-colors ${
              onDark ? "text-deep-ink hover:bg-white/10" : "text-ink hover:bg-white/60"
            }`}
          >
            View all projects →
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Mobile: tap the chevron to expand; the label itself still navigates. */
function MobileProjects({ label, onNavigate }: { label: string; onNavigate: () => void }) {
  const [open, setOpen] = useState(false);
  const rowClass =
    "rounded-[var(--r-md)] px-4 py-3 text-[0.95rem] text-ink-muted transition-colors hover:bg-surface hover:text-ink";

  return (
    <div>
      <div className="flex items-center">
        <Link href={PROJECTS_HREF} onClick={onNavigate} className={`${rowClass} flex-1`}>
          {label}
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Hide projects" : "Show projects"}
          aria-expanded={open}
          className="flex size-11 shrink-0 items-center justify-center rounded-[var(--r-md)] text-ink-muted hover:bg-surface hover:text-ink"
        >
          <Chevron open={open} />
        </button>
      </div>
      {open ? (
        <div className="mb-1 ml-4 flex max-h-[50vh] flex-col overflow-y-auto border-l border-hairline pl-2">
          {caseStudies.map((study) => (
            <Link
              key={study.slug}
              href={`/case-studies/${study.slug}`}
              onClick={onNavigate}
              className="flex items-start gap-3 rounded-[var(--r-md)] px-3 py-2.5 hover:bg-surface"
            >
              <span
                className="mt-1.5 size-2 shrink-0 rounded-full"
                style={{ backgroundColor: study.accent }}
                aria-hidden
              />
              <span className="min-w-0">
                <span className="block text-[0.9rem] leading-snug text-ink">{study.cardHeading}</span>
                <span className="block text-[0.75rem] text-ink-faint">{study.client}</span>
              </span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

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
          className={`relative isolate flex w-full items-center justify-between rounded-[var(--r-pill)] border border-transparent px-2 py-2 ${
            onDark ? "text-deep-ink" : ""
          }`}
        >
          {/* The bar's glass lives on its own layer, not on the pill. A
              backdrop-filter on the pill would make it the backdrop root for
              everything inside, and the dropdown's own blur would then have
              nothing behind it to blur. */}
          <div
            aria-hidden
            className={`absolute -inset-px -z-10 rounded-[var(--r-pill)] border transition-colors duration-500 ${
              scrolled ? "glass" : "border-transparent"
            } ${onDark ? "nav-dark" : ""}`}
          />
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-[var(--r-pill)] py-1.5 pl-3 pr-4"
        >
          <span className="size-2 rounded-full bg-accent" aria-hidden />
          <span className="display text-[1.1rem] leading-none">Joyce Wadawasina</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) =>
            link.href === PROJECTS_HREF ? (
              <ProjectsDropdown key={link.href} label={link.label} onDark={onDark} />
            ) : (
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
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          <CartButton onDark={onDark} />
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
          {links.map((link) =>
            link.href === PROJECTS_HREF ? (
              <MobileProjects
                key={link.href}
                label={link.label}
                onNavigate={() => setOpen(false)}
              />
            ) : (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-[var(--r-md)] px-4 py-3 text-[0.95rem] text-ink-muted transition-colors hover:bg-surface hover:text-ink"
              >
                {link.label}
              </Link>
            ),
          )}
          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="rounded-[var(--r-md)] px-4 py-3 text-[0.95rem] text-ink-muted transition-colors hover:bg-surface hover:text-ink"
          >
            My orders
          </Link>
        </motion.nav>
      ) : null}
    </motion.header>
  );
}
