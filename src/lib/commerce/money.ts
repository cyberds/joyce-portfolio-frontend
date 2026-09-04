/**
 * Money helpers.
 *
 * Everything is stored and passed around as an integer in the currency's minor
 * unit. These are the only two places a value is allowed to become a float or
 * a string, and both are boundaries: parsing admin input, and printing.
 */

const ZERO_DECIMAL = new Set(["JPY", "KRW", "VND", "CLP", "ISK", "UGX", "XAF"]);

export function minorUnitFactor(currency: string) {
  return ZERO_DECIMAL.has(currency.toUpperCase()) ? 1 : 100;
}

/** "24.99" -> 2499. Returns null when the input is not a sane amount. */
export function parseMajorToMinor(
  input: string | number,
  currency: string
): number | null {
  const raw = typeof input === "number" ? input : Number(String(input).replace(/[^0-9.\-]/g, ""));
  if (!Number.isFinite(raw) || raw < 0) return null;
  return Math.round(raw * minorUnitFactor(currency));
}

/** 2499 -> "24.99", for pre-filling a number input in the admin forms. */
export function minorToMajorString(minor: number, currency: string) {
  const factor = minorUnitFactor(currency);
  return factor === 1 ? String(minor) : (minor / factor).toFixed(2);
}

/** 2499 -> "£24.99". */
export function formatMoney(minor: number, currency: string, locale = "en-GB") {
  const factor = minorUnitFactor(currency);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: factor === 1 ? 0 : 2,
  }).format(minor / factor);
}
