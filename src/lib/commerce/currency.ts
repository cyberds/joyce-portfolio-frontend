/**
 * The symbol for a currency code, for form labels like "Price (£)".
 *
 * `Intl.NumberFormat` has no "just the symbol" mode, so it formats zero and
 * strips the digits — which is how you get the right symbol for every locale
 * without shipping a lookup table that goes stale.
 */
export function currencySymbol(currency: string, locale = "en-GB") {
  try {
    return (
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency.toUpperCase(),
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
        .format(0)
        .replace(/[\d\s.,\u00a0]/g, "") || currency.toUpperCase()
    );
  } catch {
    return currency.toUpperCase();
  }
}
