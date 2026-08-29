# joyce-portfolio-frontend

Landing page for Joyce Wadawasina — AI, automation and software engineering for
small businesses.

## The idea

The page is written as a conversation, in the order one would actually go:

1. **Hero** — their world first. "Your business is growing. Your workload
   doesn't have to grow with it."
2. **Recognition** (`#familiar`) — six things they've said this week, as cards.
   No selling, just recognition, closing on "you may just need a better way of
   connecting what you already have".
3. **The journey** (`#journey`) — one enquiry followed through six stations
   while the pipeline fills underneath it.
4. **Case studies** (`#case-studies`) — autoplaying, endless carousel of demo
   videos, each leading to its own write-up.
5. **Meet Joyce** (`#joyce`) — the warm photograph and the promise that you
   don't need to arrive knowing what should be automated.
6. **What we help with** (`#help`) — consultancy, team training, engineering and
   branding.
7. **Close** (`#talk`) — "Start with a sentence. Not a brief."

## Stack

- Next.js 16 (App Router, Turbopack) + React 19
- GSAP ScrollTrigger — the pinned journey chapter
- Framer Motion — one entrance signature, used everywhere (`ui/Reveal`)
- Tailwind CSS v4 — utilities mapped onto brand tokens

## Design system (single source of truth)

- `src/design/tokens.ts` — colours, radii, motion. The root layout injects them
  as CSS custom properties (`--c-*`, `--r-*`), `globals.css` maps Tailwind's
  theme onto them, and the Three.js scene imports the hex values directly.
  Change a colour once, everything follows.
- `src/design/fonts.ts` — Instrument Serif for the things Joyce would say out
  loud, Inter for everything structural.
- `globals.css` holds only the composed surfaces: `.paper` (warm wash + grid),
  `.glass`, `.display`, `.eyebrow`, `.marked`, `.nav-dark`.

The palette is drawn from the photography: warm paper, warm near-black ink, and
the red Joyce actually wears as the single accent.

## The journey chapter

`src/components/journey/`:

- `journeyStations.ts` — the six stations, each written as what normally happens
  vs. what happens instead.
- `journeyLayout.ts` — generates the pipeline. The station points *are* the
  bezier anchors, so nothing can drift out of alignment, and every control point
  is offset purely vertically so the line always enters and leaves a station
  going down. Two layouts: wide (cards beside the spine, alternating sides) and
  narrow (one centred column, card underneath).
- `StationCard.tsx` — the card and the station glyphs, shared by the animated
  chapter and the reduced-motion fallback.
- `JourneyChapter.tsx` — the pinned section, the camera and the timeline.

Three things are worth knowing before changing it:

**One number drives everything.** `head.len` is how far the fluid has travelled
along the path. The pipe fill, the droplet and the camera are all read off it in
`syncHead`, so they cannot fall out of step.

**The camera is pure arithmetic, not a guess.** The stage sits absolutely
positioned with its top edge on the frame's vertical midpoint, so a point at SVG
`y` renders at `frameH / 2 + (y / vbH) * stageH + translateY`. `cameraY` solves
that for the translate that parks the point `bias` of the way down the frame —
centre on desktop, 30% on mobile so the card underneath has room. There is no
horizontal pan: the stage is always exactly as wide as the frame, so the whole
width is already on screen.

**The fluid moves in hops, not a sweep.** It travels to a station, holds there
for `DWELL` while the card lands and can be read, then moves on. Travel time
tracks distance so the apparent speed stays constant. A constant-speed sweep is
what leaves every card sliding off the top of the frame before you reach the end
of the sentence.

`pinSpacing` is `false` — the section reserves its own scroll room, so letting
GSAP add a spacer on top would leave a blank screen underneath. Reduced-motion
visitors get the same six cards, simply stacked, with no pin at all.

## Case studies

`src/data/caseStudies.json` is the single source. `src/lib/caseStudies.ts` types
it and exposes `caseStudies` / `getCaseStudy`. Three things read it:

- `components/casestudies/CaseStudies.tsx` — the landing-page carousel:
  autoplaying, and endless in both directions. Native scroll-snap still does the
  scrolling (real momentum, touch and trackpad for free); the arrows just nudge
  it one card. The rail's gutter and `scroll-padding` are both
  `calc((100% - min(1200px, 94vw)) / 2)` so cards line up with the page grid,
  and `scroll-padding` is what stops snap pulling the first card flush against
  the window.

  The loop is three identical copies of the list. The middle copy is what you
  look at; when the scroll drifts off it, `recentre()` shifts by exactly one set
  width, which lands on a pixel showing the same thing — no rewind, no seam. The
  window is exactly `[w, 2w)`: snap-mandatory means a resting `scrollLeft` is a
  whole number of cards, so that range lands on the middle set and no other.
  That matters because the outer sets are clones marked `decorative` — kept
  clickable, but out of the tab order and the accessibility tree, so the list is
  announced once instead of three times, and coming to rest on one would strand
  a keyboard user on a card they cannot reach.

  Autoplay holds while you hover or focus the rail, while a demo video is
  playing, while the section is off screen, while the tab is hidden, for nine
  seconds after any deliberate interaction, and entirely under reduced motion.
  There is also a pause button, because content that moves on its own has to be
  stoppable.
- `app/case-studies/page.tsx` — the index.
- `app/case-studies/[slug]/page.tsx` — the write-up, statically generated per
  slug via `generateStaticParams`.

Adding a study means adding one object to the JSON. Demo videos live in
`public/videos/case-studies/` — see the README there for filenames; a missing
file degrades to the study's accent gradient rather than a broken frame.

## Testimonials

`src/data/testimonials.json` is the single source, typed by
`src/lib/testimonials.ts`. `components/testimonials/` renders it as a wall
rather than another carousel — the case studies above already rotate, and social
proof reads stronger all at once than one at a time.

Layout is CSS multi-column, which balances the columns itself and reflows three
→ two → one without a second copy of the markup, so quotes can be anything from
one line to a full paragraph. Order in the JSON is the reading order; the
`featured` entry comes first and gets the one dark card that anchors the wall.
Anyone without a `photo` gets a monogram built from their initials.

Note the featured card deliberately does *not* carry `.dark-zone`: that class
tells the nav to flip to light-on-dark, which is only correct for a full-width
dark band, not a third-width card.

## Develop

```bash
npm run dev
npm run build
```
