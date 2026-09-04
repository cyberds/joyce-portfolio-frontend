/**
 * Turns whatever URL a video was pasted in as into something that will actually
 * play on the page.
 *
 * The important case is Google Drive. A Drive file cannot be played through a
 * `<video src>` tag: the download URL redirects, sets cookies, sends no CORS
 * headers, and hands back an HTML virus-scan interstitial for anything large.
 * The only route that works for a visitor is the `/preview` iframe, and that
 * needs the file shared as "anyone with the link". Loom and YouTube are the
 * same shape of problem, so they go through the same iframe path.
 *
 * Cloudinary and anything served from our own `/videos` folder are real media
 * files and get a real `<video>` element with native controls.
 */

export type VideoSource =
  | { kind: "iframe"; provider: VideoProvider; src: string; watchUrl: string }
  | { kind: "file"; provider: VideoProvider; src: string };

export type VideoProvider = "drive" | "loom" | "youtube" | "cloudinary" | "file";

const DRIVE_ID = /\/file\/d\/([A-Za-z0-9_-]+)/;
const DRIVE_ID_QUERY = /[?&]id=([A-Za-z0-9_-]+)/;
const LOOM_ID = /loom\.com\/(?:share|embed)\/([A-Za-z0-9]+)/;
const YOUTUBE_LONG = /[?&]v=([A-Za-z0-9_-]{6,})/;
const YOUTUBE_SHORT = /youtu\.be\/([A-Za-z0-9_-]{6,})/;
const YOUTUBE_EMBED = /youtube(?:-nocookie)?\.com\/embed\/([A-Za-z0-9_-]{6,})/;

function match(url: string, ...patterns: RegExp[]) {
  for (const pattern of patterns) {
    const found = url.match(pattern);
    if (found) return found[1];
  }
  return null;
}

/**
 * `null` for a missing or unrecognisable URL — callers render the
 * "demo coming shortly" plate rather than an empty frame.
 */
export function resolveVideo(url?: string | null): VideoSource | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (trimmed.includes("drive.google.com")) {
    const id = match(trimmed, DRIVE_ID, DRIVE_ID_QUERY);
    if (!id) return null;
    return {
      kind: "iframe",
      provider: "drive",
      src: `https://drive.google.com/file/d/${id}/preview`,
      // Drive embeds fail silently when sharing is wrong, and the error is
      // cross-origin so we cannot see it. Every Drive embed gets an escape
      // hatch to the real file instead.
      watchUrl: `https://drive.google.com/file/d/${id}/view`,
    };
  }

  if (trimmed.includes("loom.com")) {
    const id = match(trimmed, LOOM_ID);
    if (!id) return null;
    return {
      kind: "iframe",
      provider: "loom",
      src: `https://www.loom.com/embed/${id}?hideEmbedTopBar=true`,
      watchUrl: `https://www.loom.com/share/${id}`,
    };
  }

  if (trimmed.includes("youtube.com") || trimmed.includes("youtu.be")) {
    const id = match(trimmed, YOUTUBE_LONG, YOUTUBE_SHORT, YOUTUBE_EMBED);
    if (!id) return null;
    return {
      kind: "iframe",
      provider: "youtube",
      src: `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`,
      watchUrl: `https://www.youtube.com/watch?v=${id}`,
    };
  }

  if (trimmed.includes("res.cloudinary.com")) {
    return { kind: "file", provider: "cloudinary", src: trimmed };
  }

  // A path into /public, or any direct media URL.
  return { kind: "file", provider: "file", src: trimmed };
}

/**
 * Appended on click so the facade's play button actually starts playback
 * rather than just revealing a paused player.
 */
export function withAutoplay(source: VideoSource) {
  if (source.kind !== "iframe") return source.src;
  const joiner = source.src.includes("?") ? "&" : "?";
  return source.provider === "drive"
    ? source.src // Drive's preview player ignores autoplay params; it starts on tap.
    : `${source.src}${joiner}autoplay=1`;
}
