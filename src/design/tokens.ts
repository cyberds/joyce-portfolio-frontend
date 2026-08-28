/**
 * Single source of truth for the brand palette.
 *
 * The root layout injects `brandCssVariables` as custom properties, globals.css
 * maps Tailwind's theme onto them, and the Three.js scene imports the hex
 * values directly. Change a colour once and the whole site follows.
 *
 * The palette is the "candy" set: five confectionery hues — tangerine, lemon,
 * raspberry, apple, plum — over a soft cream paper so the colour pops.
 * Raspberry is the single working accent; the other four are available as
 * named tokens (tangerine / lemon / apple / plum) for playful moments.
 */

export const colors = {
  // Light surfaces — soft cream paper, not screen-grey
  canvas: "#fdf8f2",
  canvasDeep: "#f6ebdd",
  surface: "#ffffff",
  grid: "#efe2d2",

  // Ink — deep plum-black (from the plum family, warmed)
  ink: "#241319",
  inkMuted: "#7c5a66",
  inkFaint: "#ac909b",
  hairline: "#ecdde3",

  // Accent — raspberry
  accent: "#df0f57",
  accentDeep: "#b00b45",
  accentSoft: "#fbd7e4",

  // The candy set (from the palette card)
  tangerine: "#ef8000",
  lemon: "#e4bf28",
  raspberry: "#df0f57",
  apple: "#94cc96",
  plum: "#c18d9a",

  // The dark chapter (the journey) — rich deep evergreen / forest
  deep: "#0c231c",
  deepSoft: "#133329",
  deepInk: "#f5faf7",
  deepMuted: "#8faea1",

  // Glass
  glass: "rgba(255,255,255,0.62)",
  glassStrong: "rgba(255,255,255,0.84)",
  glassLine: "rgba(255,255,255,0.75)",
  glassShadow: "rgba(40,30,22,0.14)",
} as const;

export const radii = {
  sm: "10px",
  md: "16px",
  lg: "26px",
  xl: "38px",
  pill: "999px",
} as const;

export const motion = {
  ease: "cubic-bezier(0.22, 1, 0.36, 1)",
  fast: "0.2s",
  base: "0.45s",
  slow: "0.9s",
} as const;

const entries = (prefix: string, record: Record<string, string>) =>
  Object.entries(record)
    .map(([key, value]) => `  --${prefix}-${kebab(key)}: ${value};`)
    .join("\n");

function kebab(value: string) {
  return value.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}

export const brandCssVariables = `:root{
${entries("c", colors)}
${entries("r", radii)}
${entries("motion", motion)}
}`;

/** The single easing curve every entrance animation uses (matches motion.ease). */
export const easeCurve: [number, number, number, number] = [0.22, 1, 0.36, 1];
