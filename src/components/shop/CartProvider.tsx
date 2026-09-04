"use client";

/**
 * The cart.
 *
 * Only ids and quantities live in localStorage — never prices or titles. The
 * cart page and the checkout endpoint both re-read the catalogue from Mongo,
 * so a basket left open across a price change shows and charges the new price,
 * and a tampered localStorage buys nothing it should not.
 *
 * localStorage is an external store, so it is read through
 * `useSyncExternalStore` rather than copied into state inside an effect. That
 * is what makes the server render (an empty cart) and the first client render
 * agree without a hydration warning, and it keeps two open tabs in step for
 * free — the `storage` event is just another way the store changes.
 */

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import type { CartLine } from "@/types/commerce";

const STORAGE_KEY = "joyce-shop-cart";

/* ---- The store ---------------------------------------------------------- */

const listeners = new Set<() => void>();

/**
 * `useSyncExternalStore` compares snapshots by identity and re-renders when
 * they differ, so parsing the JSON afresh on every call would loop forever.
 * The parsed value is cached against the raw string it came from and only
 * rebuilt when that string actually changes.
 */
let cachedRaw: string | null = null;
let cachedLines: CartLine[] = [];

/** Stable identity for the server and for a browser with no cart yet. */
const EMPTY: CartLine[] = [];

function parse(raw: string | null): CartLine[] {
  if (!raw) return EMPTY;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    const lines = parsed
      .filter(
        (line): line is CartLine =>
          typeof line === "object" &&
          line !== null &&
          typeof (line as CartLine).productId === "string" &&
          Number.isFinite((line as CartLine).quantity)
      )
      .map((line) => ({
        productId: line.productId,
        quantity: Math.max(1, Math.min(20, Math.floor(line.quantity))),
      }));
    return lines.length ? lines : EMPTY;
  } catch {
    // Corrupt JSON — an empty cart is the right answer.
    return EMPTY;
  }
}

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Private mode, or storage disabled entirely.
    return null;
  }
}

function getSnapshot(): CartLine[] {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedLines = parse(raw);
  }
  return cachedLines;
}

function getServerSnapshot(): CartLine[] {
  return EMPTY;
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // Another tab writing the same key.
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function write(next: CartLine[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Quota or private mode. Nothing useful to do, and the snapshot below
    // still reflects whatever did persist.
  }
  // `storage` does not fire in the tab that wrote, so tell our own subscribers.
  for (const listener of listeners) listener();
}

/* ---- The hook ----------------------------------------------------------- */

type CartContextValue = {
  lines: CartLine[];
  count: number;
  /** False during SSR and the first paint; true once the browser store is live. */
  ready: boolean;
  add: (productId: string, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const alwaysTrue = () => true;
const alwaysFalse = () => false;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const lines = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // The same store subscription, asked a different question: "am I on the
  // client yet?". Cheaper and safer than a mounted flag set in an effect.
  const ready = useSyncExternalStore(subscribe, alwaysTrue, alwaysFalse);

  const add = useCallback((productId: string, quantity = 1) => {
    const current = getSnapshot();
    const existing = current.find((line) => line.productId === productId);
    write(
      existing
        ? current.map((line) =>
            line.productId === productId
              ? { ...line, quantity: Math.min(20, line.quantity + quantity) }
              : line
          )
        : [...current, { productId, quantity: Math.min(20, quantity) }]
    );
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    const current = getSnapshot();
    write(
      quantity <= 0
        ? current.filter((line) => line.productId !== productId)
        : current.map((line) =>
            line.productId === productId
              ? { ...line, quantity: Math.min(20, quantity) }
              : line
          )
    );
  }, []);

  const remove = useCallback((productId: string) => {
    write(getSnapshot().filter((line) => line.productId !== productId));
  }, []);

  const clear = useCallback(() => write([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count: lines.reduce((sum, line) => sum + line.quantity, 0),
      ready,
      add,
      setQuantity,
      remove,
      clear,
    }),
    [lines, ready, add, setQuantity, remove, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside <CartProvider>.");
  }
  return context;
}
