"use client";

import { useEffect, useState } from "react";

/**
 * Media query as state. Starts `false` on the server and on the first client
 * render so markup matches, then settles after mount — anything that depends on
 * it should be keyed on the value so it rebuilds when the answer changes.
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [query]);

  return matches;
}

export const usePrefersReducedMotion = () =>
  useMediaQuery("(prefers-reduced-motion: reduce)");
