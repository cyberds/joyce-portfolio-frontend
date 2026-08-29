# Case study demo videos

Filenames here are referenced from `src/data/caseStudies.json` — the `video` and
`poster` fields of each study. Both the carousel on the landing page and the
case study detail page read the same two paths.

Expected for the current five studies:

| Study slug                  | Video                          | Poster                         |
| --------------------------- | ------------------------------ | ------------------------------ |
| riverside-dental-enquiries  | `riverside-dental.mp4`         | `riverside-dental.jpg`         |
| halloway-quote-builder      | `halloway-quote-builder.mp4`   | `halloway-quote-builder.jpg`   |
| northgate-onboarding        | `northgate-onboarding.mp4`     | `northgate-onboarding.jpg`     |
| sable-stock-sync            | `sable-stock-sync.mp4`         | `sable-stock-sync.jpg`         |
| brightpath-ai-training      | `brightpath-ai-training.mp4`   | `brightpath-ai-training.jpg`   |

Until a file exists, the card falls back to the study's accent gradient rather
than showing a broken frame, so the section is safe to ship half-filled.

Encode 16:9, H.264, no audio track needed for the card loop (the card plays
muted). Keep each under ~8 MB so the rail stays quick on mobile.
