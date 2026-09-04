# Case study media

Videos are no longer stored in this folder. They live on Loom, YouTube, Google
Drive or Cloudinary, and each study points at one by URL in
`src/data/caseStudies.json`:

- `demoVideo` — the walkthrough of the build
- `testimonialVideo` — the client speaking
- `poster` — a still, used as the play button's backdrop and as the card art

Paste the ordinary share URL into either video field. `src/lib/video.ts` works
out the provider and rewrites it into something embeddable:

| Pasted                                        | Played as                          |
| --------------------------------------------- | ---------------------------------- |
| `loom.com/share/ID`                            | `loom.com/embed/ID`                |
| `youtube.com/watch?v=ID` or `youtu.be/ID`      | `youtube-nocookie.com/embed/ID`    |
| `drive.google.com/file/d/ID/view`              | `drive.google.com/file/d/ID/preview` |
| `res.cloudinary.com/…` or a path in `/public`  | a real `<video>` element           |

## Google Drive

**The file must be shared as "Anyone with the link → Viewer."** A Drive video
cannot be played through a `<video>` tag at all — the download URL redirects,
sets cookies, sends no CORS headers, and returns an HTML virus-scan page for
large files — so the `/preview` iframe is the only route that works, and it
shows a "request access" screen to visitors when sharing is restricted. That
failure is cross-origin, so the page cannot detect it; every Drive embed
carries an "open in a new tab" link underneath as the fallback.

## Missing videos

Leave `demoVideo` or `testimonialVideo` as `null` and the slot renders a
"coming shortly" plate over the study's accent wash. Nothing breaks and the
layout does not move, so studies are safe to ship before their video exists.

## Posters

Any web image works; put project stills in `public/images/projects/`. Use
16:9 and keep it under ~400 KB. With no poster the play button sits on the
accent gradient instead.
