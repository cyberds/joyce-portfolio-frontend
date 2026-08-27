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
3. **The journey** (`#journey`) — the dark chapter. One enquiry followed through
   six stations while a 3D line runs underneath.
4. **Meet Joyce** (`#joyce`) — the warm photograph and the promise that you
   don't need to arrive knowing what should be automated.
5. **What we help with** (`#help`) — consultancy, team training, engineering and
   branding.
6. **Close** (`#talk`) — "Start with a sentence. Not a brief."

## Stack

- Next.js 16 (App Router, Turbopack) + React 19
- Three.js via @react-three/fiber and @react-three/drei — the journey line
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
- `JourneyScene.tsx` — the 3D: a `CatmullRomCurve3` path drawn as a thin tube
  receding into exponential fog, billboarded station markers, signals travelling
  the line, and a camera rig that rides above the path looking down it. All
  geometry, no baked text — words live in the DOM.
- `JourneyChapter.tsx` — the tall section with a sticky frame, the copy overlay,
  and the scroll handler.
- `scrollState.ts` — scroll progress kept outside React so scrolling never
  re-renders; only the active station index is state.

Any block that passes under the fixed nav and is dark carries `.dark-zone`; the
nav watches for it and flips to light-on-dark. Reduced-motion visitors get the
scene without damping or pointer parallax.

## Develop

```bash
npm run dev
npm run build
```
