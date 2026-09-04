import type { Screenshot } from "@/lib/caseStudies";

/**
 * The screenshots, in two shapes.
 *
 * On desktop they live in the sticky right column, stacked, so they stay
 * beside whichever part of the write-up is being read. On mobile there is no
 * room for a rail, so the same images render as a snap-scrolling strip placed
 * directly under the summary — seen before the reader commits to the writing.
 */
export function ScreenshotStack({ shots }: { shots: Screenshot[] }) {
  return (
    <div className="space-y-6">
      {shots.map((shot) => (
        <figure key={shot.src} className="m-0">
          <div className="overflow-hidden rounded-[var(--r-md)] border border-hairline bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={shot.src}
              alt={shot.alt}
              loading="lazy"
              className="block w-full"
            />
          </div>
          {shot.caption ? (
            <figcaption className="mt-3 text-[0.82rem] leading-relaxed text-ink-faint">
              {shot.caption}
            </figcaption>
          ) : null}
        </figure>
      ))}
    </div>
  );
}

export function ScreenshotStrip({ shots }: { shots: Screenshot[] }) {
  return (
    <div className="-mx-[var(--shell-gutter)] overflow-x-auto px-[var(--shell-gutter)] pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <ul className="flex snap-x snap-mandatory gap-4">
        {shots.map((shot) => (
          <li
            key={shot.src}
            className="w-[min(78vw,22rem)] shrink-0 snap-start"
          >
            <figure className="m-0">
              <div className="overflow-hidden rounded-[var(--r-md)] border border-hairline bg-surface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={shot.src}
                  alt={shot.alt}
                  loading="lazy"
                  className="block w-full"
                />
              </div>
              {shot.caption ? (
                <figcaption className="mt-3 text-[0.82rem] text-ink-faint">
                  {shot.caption}
                </figcaption>
              ) : null}
            </figure>
          </li>
        ))}
      </ul>
    </div>
  );
}
