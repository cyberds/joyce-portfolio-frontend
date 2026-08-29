"use client";

import { useId, type ReactNode } from "react";

/**
 * A hover/focus tooltip that reveals the value behind a label — the actual
 * address behind "Email", the actual number behind "WhatsApp".
 *
 * Built from CSS state rather than React state so it costs no renders and
 * cannot get stuck open. It answers to focus as well as hover, so it is
 * reachable by keyboard, and `aria-describedby` means screen readers get the
 * value read out with the link instead of having to guess at it.
 */
export function Tooltip({
  value,
  children,
  className = "",
}: {
  /** The thing being revealed: an address, a username, a number. */
  value: string;
  /** The trigger. Must accept `aria-describedby` via the render argument. */
  children: (describedBy: string) => ReactNode;
  className?: string;
}) {
  const id = useId();

  return (
    <span className={`group/tt relative inline-flex ${className}`}>
      {children(id)}

      <span
        role="tooltip"
        id={id}
        // Tailwind v4 writes the separate `translate` and `scale` properties,
        // not `transform`, so those are what the transition has to name.
        className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2.5 -translate-x-1/2 translate-y-1 scale-[0.96] whitespace-nowrap rounded-[var(--r-pill)] bg-ink px-3.5 py-2 text-[0.78rem] font-medium tracking-wide text-canvas opacity-0 shadow-[0_10px_30px_-12px_rgba(36,19,25,0.7)] transition-[opacity,translate,scale] duration-200 ease-[var(--motion-ease)] group-hover/tt:translate-y-0 group-hover/tt:scale-100 group-hover/tt:opacity-100 group-focus-within/tt:translate-y-0 group-focus-within/tt:scale-100 group-focus-within/tt:opacity-100 motion-reduce:transition-none"
      >
        {value}
        {/* The little pointer, a rotated corner of the same pill. */}
        <span
          aria-hidden
          className="absolute left-1/2 top-full size-2 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[2px] bg-ink"
        />
      </span>
    </span>
  );
}
