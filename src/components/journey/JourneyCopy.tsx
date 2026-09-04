/**
 * The words that introduce and close the journey.
 *
 * Both variants of the chapter — the pinned roadmap and the cascading stack —
 * and the standalone /journey page render these, so the story is written once
 * and an edit to it can never leave one A/B arm saying something different.
 */

export function JourneyHeading() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="hidden inline-flex items-center gap-2 rounded-[var(--r-pill)] border border-stone-200 bg-stone-50 px-3.5 py-1 text-[11px] font-medium uppercase tracking-wider text-stone-600">
        <span className="size-1.5 rounded-full bg-accent" />
        Example of a Connected journey
      </div>
      <h2 className="display mt-4 text-[clamp(1.7rem,3.4vw,2.7rem)] leading-tight text-stone-950">
        Let&rsquo;s follow one enquiry, from the moment it arrives.
      </h2>
      <p className="mx-auto mt-3 max-w-lg text-[0.85rem] leading-relaxed text-stone-500 sm:text-sm">
        Nothing here is exotic. It&rsquo;s the same enquiry you already get —
        connected into a clean pipeline so nobody has to hold it in their head.
      </p>
    </div>
  );
}

export function JourneyOutro({ className = "" }: { className?: string }) {
  return (
    <p
      className={`mx-auto max-w-2xl text-center leading-relaxed text-stone-800 sm:text-base ${className}`}
    >
      No new team members. No twelve new subscriptions. Just the tools you
      already pay for,{" "}
      <em className="display font-semibold italic text-stone-950 underline decoration-accent/60 decoration-2 underline-offset-4">
        finally talking to each other
      </em>
      .
    </p>
  );
}
