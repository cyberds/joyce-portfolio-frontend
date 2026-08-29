import data from "@/data/testimonials.json";

/**
 * The wall of voices. Add an entry to `src/data/testimonials.json` and it
 * appears — the column layout distributes whatever it is given, so nothing here
 * needs touching to add or remove someone.
 */
export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
  /** Country or city. Null when we don't have one. */
  location: string | null;
  /** Null falls back to a monogram tile. */
  photo: string | null;
  /** The one that gets the dark card. Exactly one should carry this. */
  featured: boolean;
};

export const testimonials = (data as { testimonials: Testimonial[] })
  .testimonials;

/** Initials for the monogram used when someone has no photograph. */
export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * The wall lays out with CSS multi-column, which balances the columns itself
 * and reflows from three to one without a second copy of the markup. Order in
 * the JSON is therefore the reading order: the featured entry comes first so it
 * lands at the top of the first column.
 */
