import { stations } from "./journeyStations";

/**
 * The pipeline geometry is generated rather than hand-drawn so the nodes are
 * guaranteed to sit exactly on the path (they *are* the bezier anchors), and so
 * the phone layout can differ from the desktop one without a second hand-tuned
 * `d` string drifting out of sync.
 */
export type Point = { x: number; y: number };

export type JourneyLayout = {
  /** SVG user-space box. */
  vbW: number;
  vbH: number;
  /** Where the fluid head is held vertically in the frame, 0 = top, 1 = bottom. */
  bias: number;
  nodes: Point[];
  cards: Point[];
  pathD: string;
  /** How far a card travels on its fly-in, in SVG user units. */
  cardOffset: { x: number; y: number }[];
  /**
   * Wide layouts pin each card beside its node inside the scrolling stage.
   * Narrow ones can't: a card is most of the screen, so its position would
   * depend on viewport height and it gets cut off on a short phone. There the
   * cards leave the stage entirely and become a panel anchored to the bottom of
   * the frame, which is height-independent by construction.
   */
  cardsFollowPipe: boolean;
};

/**
 * Builds a serpentine spine through `nodes`. Every control point is offset
 * purely vertically, which forces a vertical tangent at each anchor — the line
 * always enters and leaves a station going down, never sideways, so the camera
 * (which tracks the head) never has to swing.
 */
function buildPath(nodes: Point[], entry: Point, exit: Point) {
  const first = nodes[0];
  let d = `M ${entry.x},${entry.y}`;
  const lead = (first.y - entry.y) * 0.5;
  d += ` C ${entry.x},${entry.y + lead} ${first.x},${first.y - lead} ${first.x},${first.y}`;

  for (let i = 1; i < nodes.length; i += 1) {
    const prev = nodes[i - 1];
    const cur = nodes[i];
    const bend = (cur.y - prev.y) * 0.45;
    d += ` C ${prev.x},${prev.y + bend} ${cur.x},${cur.y - bend} ${cur.x},${cur.y}`;
  }

  const last = nodes[nodes.length - 1];
  const tail = (exit.y - last.y) * 0.5;
  d += ` C ${last.x},${last.y + tail} ${exit.x},${exit.y - tail} ${exit.x},${exit.y}`;
  return d;
}

/** Wide: spine weaves gently, cards sit beside it, alternating sides. */
function desktopLayout(): JourneyLayout {
  const vbW = 1200;
  const START_Y = 380;
  const GAP = 620;
  const TAIL = 340;

  const nodes: Point[] = stations.map((_, i) => ({
    x: i % 2 === 0 ? 545 : 655,
    y: START_Y + i * GAP,
  }));

  // Card sits on the opposite side to the spine's lean, so the gap never closes.
  const cards: Point[] = nodes.map((n, i) => ({
    x: i % 2 === 0 ? 900 : 300,
    y: n.y,
  }));

  const cardOffset = nodes.map((_, i) => ({ x: i % 2 === 0 ? 240 : -240, y: 0 }));

  const last = nodes[nodes.length - 1];
  const vbH = last.y + TAIL + 60;
  const pathD = buildPath(nodes, { x: 600, y: 70 }, { x: 600, y: last.y + TAIL });

  return { vbW, vbH, bias: 0.5, nodes, cards, pathD, cardOffset, cardsFollowPipe: true };
}

/**
 * Narrow: a single centred column, with the card lifted out of the stage and
 * pinned to the bottom of the frame instead. The spine only has to carry the
 * eye between stations, so the gaps are shorter than the wide layout's and the
 * head rides high, leaving the lower half of the screen for the card.
 */
function mobileLayout(): JourneyLayout {
  const vbW = 600;
  const START_Y = 360;
  const GAP = 680;
  const TAIL = 280;

  const nodes: Point[] = stations.map((_, i) => ({
    x: i % 2 === 0 ? 255 : 345,
    y: START_Y + i * GAP,
  }));

  // Unused while `cardsFollowPipe` is false, but kept in shape so the two
  // layouts stay interchangeable.
  const cards: Point[] = nodes.map((n) => ({ x: 300, y: n.y }));
  const cardOffset = nodes.map(() => ({ x: 0, y: 0 }));

  const last = nodes[nodes.length - 1];
  const vbH = last.y + TAIL + 60;
  const pathD = buildPath(nodes, { x: 300, y: 80 }, { x: 300, y: last.y + TAIL });

  return { vbW, vbH, bias: 0.28, nodes, cards, pathD, cardOffset, cardsFollowPipe: false };
}

export const getJourneyLayout = (isNarrow: boolean) =>
  isNarrow ? mobileLayout() : desktopLayout();
