import Image from "next/image";
import { initials, type Testimonial } from "@/lib/testimonials";
import { QuoteIcon } from "@/components/ui/icons";

/**
 * One voice. Long quotes get the serif display face and a larger card; the
 * one-liners stay in body text so the wall has a rhythm rather than seven
 * identical bricks. The featured card is the dark anchor.
 */
export function TestimonialCard({ item }: { item: Testimonial }) {
  const long = item.quote.length > 150;
  const dark = item.featured;

  return (
    <figure
      className={`testimonial-card group relative overflow-hidden rounded-[var(--r-lg)] p-7 transition-transform duration-500 ease-[var(--motion-ease)] hover:-translate-y-1 md:p-8 ${
        dark
          ? "bg-deep text-deep-ink"
          : "border border-hairline bg-surface text-ink"
      }`}
    >
      {dark ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-90 [background:radial-gradient(90%_70%_at_85%_0%,rgba(223,15,87,0.30),transparent_62%)]"
        />
      ) : null}

      <div className="relative">
        <QuoteIcon
          className={dark ? "text-accent" : "text-accent/45"}
          aria-hidden
        />

        <blockquote
          className={`mt-4 ${
            long
              ? "display text-[1.12rem] leading-[1.45] md:text-[1.22rem]"
              : "text-[0.98rem] leading-[1.7]"
          } ${dark ? "text-deep-ink" : "text-ink"}`}
        >
          {item.quote}
        </blockquote>

        <figcaption className="mt-6 flex items-center gap-3">
          {item.photo ? (
            <Image
              src={item.photo}
              alt=""
              width={44}
              height={44}
              className="size-11 shrink-0 rounded-full object-cover ring-1 ring-black/10"
            />
          ) : (
            <span
              aria-hidden
              className={`flex size-11 shrink-0 items-center justify-center rounded-full text-[0.8rem] font-medium tracking-wide ${
                dark
                  ? "bg-deep-ink/12 text-deep-ink"
                  : "bg-accent-soft text-accent-deep"
              }`}
            >
              {initials(item.name)}
            </span>
          )}

          <span className="min-w-0">
            <span
              className={`block truncate text-[0.92rem] font-medium ${
                dark ? "text-deep-ink" : "text-ink"
              }`}
            >
              {item.name}
            </span>
            <span
              className={`block text-[0.8rem] leading-snug ${
                dark ? "text-deep-muted" : "text-ink-faint"
              }`}
            >
              {item.role}
              {item.location ? ` · ${item.location}` : ""}
            </span>
          </span>
        </figcaption>
      </div>
    </figure>
  );
}
