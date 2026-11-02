// Water-locks board that folds into two D latches: a reservoir and two lock chambers in a row (Q1, Q2), two gates
// hung from one beam (the shared EN), D and EN levers on the left, Q lamps in front. Every part is a function of
// the morph m (0 = water, 1 = circuit) so the same solids fold from basins into latch blocks and wires.
import {
  boxCorners,
  cylinder,
  faceMatrix,
  fitView,
  flatCircle,
  flatPath,
  flatRect,
  heightPx,
  inset,
  pathD,
  prism,
  prismFill,
  project,
  rectCorners,
  rectFrontEdge,
  translateTo,
  type Rect,
  type Vec2,
  type Vec3,
} from "../../iso/iso-kit";
import { bulbParts } from "../../iso/react/bulb";

export const STAGE_W = 600;
export const STAGE_H = 300;

const BOARD: Rect = { x: -114, y: -34, w: 144, d: 80, r: 4 };
export const LEVERS = { d: [-100, 6] as Vec2, en: [-100, -22] as Vec2 };
const BASIN_H = 14;
const LATCH = { w: 26, d: 24, h: 5 };
const PIN_Y = 6; // D and Q pins at +PIN_Y, EN pin at -PIN_Y
const EN_Y = LEVERS.en[1];
const LATCH_X = [-43, -7];
const latchRect = (x: number): Rect => ({ x: x - LATCH.w / 2, y: -LATCH.d / 2, w: LATCH.w, d: LATCH.d, r: 1.6 });
const leftOf = (x: number) => x - LATCH.w / 2;
const rightOf = (x: number) => x + LATCH.w / 2;
const GATE_X = LATCH_X.map((x) => leftOf(x) - 5);
const D_START = LEVERS.d[0] + 7;

// Reservoir and the two chambers; each folds into the D wire or a latch block.
const BASINS: { from: Rect; to: Rect; h: number }[] = [
  { from: { x: -88, y: -12, w: 24, d: 24, r: 1.2 }, to: { x: D_START, y: PIN_Y - 0.4, w: leftOf(LATCH_X[0]) - D_START, d: 0.8, r: 0.3 }, h: 0.2 },
  { from: { x: -58, y: -12, w: 30, d: 24, r: 1.2 }, to: latchRect(LATCH_X[0]), h: LATCH.h },
  { from: { x: -22, y: -12, w: 30, d: 24, r: 1.2 }, to: latchRect(LATCH_X[1]), h: LATCH.h },
];
const SLAB = { w: 2.6, d: 28, h: BASIN_H + 1 };
const LIFT = 13;
const BEAM_Z = SLAB.h + 1.5;
const LAMPS: Vec2[] = [
  [(rightOf(LATCH_X[0]) + leftOf(LATCH_X[1])) / 2, 25],
  [rightOf(LATCH_X[1]) + 10, 25],
];

export const view = fitView(
  [...boxCorners(BOARD, -5, 0), [LEVERS.d[0], LEVERS.d[1], 18.5], [LEVERS.en[0], LEVERS.en[1], 18.5], [GATE_X[0], 0, BEAM_Z + LIFT + 3]],
  STAGE_W,
  STAGE_H,
  { pad: 18, azimuth: 62 },
);

const at = (p: Vec3) => project(p, view);
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const lerpRect = (a: Rect, b: Rect, u: number): Rect => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), w: lerp(a.w, b.w, u), d: lerp(a.d, b.d, u), r: lerp(a.r, b.r, u) });

export const basinAt = (i: number, m: number) => {
  const b = BASINS[i];
  return { rect: lerpRect(b.from, b.to, m), h: lerp(BASIN_H, b.h, m) };
};

export const basinSolid = (i: number, m: number) => {
  const { rect, h } = basinAt(i, m);
  return prism(rect, 0, h, view, 3, 0.4 * (1 - m) + 0.6 * m);
};

export const basinSeam = (i: number, m: number) => rectFrontEdge(basinAt(i, m).rect, 1.8, view, 3);

// Gates (lifted by `open`) on posts under one beam; they fold into the EN wire and its two branches.
export const gatesAt = (open: number, m: number) => {
  const lift = open * LIFT * (1 - m);
  const slab = (x: number) =>
    prism(
      lerpRect({ x: x - SLAB.w / 2, y: -SLAB.d / 2, w: SLAB.w, d: SLAB.d, r: 0.4 }, { x: x - 0.4, y: EN_Y, w: 0.8, d: -EN_Y - PIN_Y, r: 0.2 }, m),
      lift,
      lerp(SLAB.h, 0.2, m),
      view,
      2,
      0.2 * (1 - m),
    );
  const beam: Rect = { x: GATE_X[0] - 3, y: -2.2, w: GATE_X[1] - GATE_X[0] + 6, d: 4.4, r: 0.8 };
  const wire: Rect = { x: LEVERS.en[0] + 7, y: EN_Y - 0.4, w: GATE_X[1] - LEVERS.en[0] - 7, d: 0.8, r: 0.2 };
  return {
    slabs: GATE_X.map(slab),
    posts: m < 0.98 ? GATE_X.map((x) => prism({ x: x - 0.8, y: -0.8, w: 1.6, d: 1.6, r: 0.3 }, lift + SLAB.h * (1 - m), (BEAM_Z - SLAB.h) * (1 - m) + 0.05, view, 2, 0)) : [],
    beam: prism(lerpRect(beam, wire, m), lerp(lift + BEAM_Z, 0, m), lerp(2.4, 0.2, m), view, 3, 0.3 * (1 - m)),
  };
};

const lever = ([x, y]: Vec2) => ({
  base: prism({ x: x - 7, y: y - 6, w: 14, d: 12, r: 1.2 }, 0, 4, view, 3, 0.4),
  slot: flatRect({ x: x - 1.2, y: y - 5, w: 2.4, d: 10, r: 1 }, 4, view, 3),
  pivot: cylinder(x, y, 2, 4, 2, view, 18, 0.3),
});

// Lever position v: 1 = up (logic 0), -1 = pulled (logic 1).
export const knobAt = ([x, y]: Vec2, v: number): Vec3 => [x, y + Math.sin(v * 0.6) * 12, 6 + Math.cos(v * 0.6) * 12];
export const rodPath = (p: Vec2, v: number) => pathD([at([p[0], p[1], 6]), at(knobAt(p, v))]);
export const knob = cylinder(0, 0, 2.4, -1.2, 2.8, view, 20, 0.6);
export const knobTransform = (p: Vec3) => translateTo(view, p);

// Drop overlays through each gate, at two heights.
export const streams = GATE_X.map((x) =>
  [2.5, 6].map((z) =>
    flatPath(
      [
        [x - 9, 0],
        [x + 9, 0],
      ],
      z,
      view,
    ),
  ),
);

const trace = (pts: Vec2[]) => flatPath(pts, 0, view);
const LAMP_R = 6.2;
const lampFoot = (p: Vec2): Vec2 => [p[0], p[1] - LAMP_R];

export type Net = "d" | "en" | "q1" | "q2";
export const WIRES: { id: string; net: Net; junction?: Vec2; d: string }[] = [
  {
    id: "d",
    net: "d",
    d: trace([
      [D_START, PIN_Y],
      [leftOf(LATCH_X[0]), PIN_Y],
    ]),
  },
  {
    id: "en-1",
    net: "en",
    junction: at([GATE_X[0], EN_Y, 0]),
    d: trace([
      [LEVERS.en[0] + 7, EN_Y],
      [GATE_X[0], EN_Y],
      [GATE_X[0], -PIN_Y],
      [leftOf(LATCH_X[0]), -PIN_Y],
    ]),
  },
  {
    id: "en-2",
    net: "en",
    d: trace([
      [GATE_X[0], EN_Y],
      [GATE_X[1], EN_Y],
      [GATE_X[1], -PIN_Y],
      [leftOf(LATCH_X[1]), -PIN_Y],
    ]),
  },
  {
    id: "q1",
    net: "q1",
    junction: at([LAMPS[0][0], PIN_Y, 0]),
    d: trace([
      [rightOf(LATCH_X[0]), PIN_Y],
      [leftOf(LATCH_X[1]), PIN_Y],
    ]),
  },
  { id: "q1-lamp", net: "q1", d: trace([[LAMPS[0][0], PIN_Y], lampFoot(LAMPS[0])]) },
  { id: "q2", net: "q2", d: trace([[rightOf(LATCH_X[1]), PIN_Y], [LAMPS[1][0], PIN_Y], lampFoot(LAMPS[1])]) },
];

const lamp = ([x, y]: Vec2) => ({
  ...bulbParts([x, y], view, { baseR: LAMP_R, h: 6 }),
  ring: flatCircle(x, y, 9.5, 0, view, 40),
});

const face = (x: number, y: number, z = 0) => faceMatrix([x, y], z, view, "x");

const pinLabels = (x: number) => ({
  title: face(x - 6.4, 1.4, LATCH.h),
  en: face(x - 11.4, -PIN_Y + 1.2, LATCH.h),
  d: face(x - 11.4, PIN_Y + 1.2, LATCH.h),
  q: face(x + 8.6, PIN_Y + 1.2, LATCH.h),
});

export const board = {
  halo: prismFill(BOARD, -5, 5, view),
  slab: prism(BOARD, -5, 5, view, 5, 0.8),
  groove: flatRect(inset(BOARD, 3), 0, view),
  screws: rectCorners(BOARD, 5).map(([x, y]) => at([x, y, 0])),
  basinHalo: BASINS.map((b) => prismFill(inset(b.from, 1), 0.1, 0.1, view)),
  levers: { d: lever(LEVERS.d), en: lever(LEVERS.en) },
  lamps: LAMPS.map(lamp),
  pins: LATCH_X.map(pinLabels),
  labels: {
    d: face(LEVERS.d[0] - 3, LEVERS.d[1] + 11.5),
    en: face(LEVERS.en[0] - 4.4, EN_Y + 12.5),
    chambers: BASINS.slice(1).map((b) => face(b.from.x + b.from.w / 2 - 3.4, 20)),
    lamps: LAMPS.map(([x, y]) => face(x - 3.4, y + 13)),
    tag: face(-70, 42),
  },
};

// Entrance spark points: basin corners and lever bases.
export const contacts = [
  ...BASINS.flatMap((b) => rectCorners(b.from)),
  ...[LEVERS.d, LEVERS.en].flatMap(([x, y]) => rectCorners({ x: x - 7, y: y - 6, w: 14, d: 12, r: 0 })),
].map(([x, y]) => at([x, y, 0]));
