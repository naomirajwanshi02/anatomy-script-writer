// C vs Verilog board: lever A on the left splits into two parallel rows. Back row: A and B=1 -> AND -> lamp Y.
// Front row: A -> NOT -> lamp Z. In the C phase one CPU block covers both gate sites and the same wires end on it.
// The code lives in the readout below the board.
import {
  boxCorners,
  cylinder,
  faceMatrix,
  fitView,
  flatCircle,
  flatPath,
  flatRect,
  inset,
  pathD,
  prism,
  prismFill,
  project,
  rectCorners,
  translateTo,
  type Rect,
  type Vec2,
  type Vec3,
} from "../../iso/iso-kit";
import { bulbParts } from "../../iso/react/bulb";
import type { Net, WireGroup } from "./model";

export const STAGE_W = 600;
export const STAGE_H = 380;

const BOARD: Rect = { x: -64, y: -48, w: 98, d: 106, r: 4 };
export const LEVER_A: Vec2 = [-50, 0];
const ROW = { and: -32, not: 32 };
const GATE = { x: -20, w: 20, d: 20, h: 6 };
const PIN = 4; // AND input pins at row -PIN (B) and row +PIN (A)
const SPLIT_X = -34;
const A_START = LEVER_A[0] + 7;
const LAMP_X = 18;
const LAMP_R = 6.2;
const LAMPS: Vec2[] = [
  [LAMP_X, ROW.and],
  [LAMP_X, ROW.not],
];


export const view = fitView(
  [...boxCorners(BOARD, -5, 0), [LEVER_A[0], LEVER_A[1], 18.5], [LAMP_X, ROW.and, 19], [LAMP_X, ROW.not, 19]],
  STAGE_W,
  STAGE_H,
  { pad: 18, azimuth: 62 },
);

const at = (p: Vec3) => project(p, view);

// Wires in signal direction; the junction dot marks the A split.
type Wire = { id: string; net: Net; group: WireGroup; pts: Vec2[]; junction?: Vec2 };
const andIn = GATE.x;
const gateOut = GATE.x + GATE.w;
export const WIRES: Wire[] = [
  {
    id: "a-and",
    net: "a",
    group: "and",
    pts: [
      [A_START, 0],
      [SPLIT_X, 0],
      [SPLIT_X, ROW.and + PIN],
      [andIn, ROW.and + PIN],
    ],
    junction: [SPLIT_X, 0],
  },
  {
    id: "a-not",
    net: "a",
    group: "not",
    pts: [
      [A_START, 0],
      [SPLIT_X, 0],
      [SPLIT_X, ROW.not],
      [andIn, ROW.not],
    ],
  },
  {
    id: "b",
    net: "b",
    group: "and",
    pts: [
      [-25, ROW.and - PIN],
      [andIn, ROW.and - PIN],
    ],
  },
  { id: "y", net: "y", group: "and", pts: [[gateOut, ROW.and], [LAMP_X - LAMP_R, ROW.and]] },
  { id: "z", net: "z", group: "not", pts: [[gateOut, ROW.not], [LAMP_X - LAMP_R, ROW.not]] },
];

export const wirePath = (w: Wire) => flatPath(w.pts, 0, view);
export const junctionAt = (w: Wire) => (w.junction ? at([w.junction[0], w.junction[1], 0]) : null);

// Gate blocks with their symbols engraved on top.
const gateRect = (row: number): Rect => ({ x: GATE.x, y: row - GATE.d / 2, w: GATE.w, d: GATE.d, r: 1.4 });
const arc = (cx: number, cy: number, r: number, a0: number, a1: number, n = 12): Vec2[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
const SX = GATE.x + 3.5; // symbol left edge
const SR = 7; // symbol half-height
const andSymbol = flatPath([[SX, ROW.and + SR], [SX, ROW.and - SR], [SX + 5, ROW.and - SR], ...arc(SX + 5, ROW.and, SR, -90, 90).slice(1), [SX, ROW.and + SR]], GATE.h, view, true);
const notSymbol =
  flatPath([[SX, ROW.not - SR], [SX, ROW.not + SR], [SX + 9, ROW.not]], GATE.h, view, true) + flatCircle(SX + 11, ROW.not, 2, GATE.h, view, 16);
// CPU (C phase): one block over both gate sites, so the gate wires end on its left and right faces.
const CPU_RECT: Rect = { x: GATE.x, y: ROW.and - GATE.d / 2, w: GATE.w, d: ROW.not - ROW.and + GATE.d, r: 1.6 };
const CPU_H = 8;
export const cpu = { solid: prism(CPU_RECT, 0, CPU_H, view, 3, 0.6), label: faceMatrix([GATE.x + 2.2, 4], CPU_H, view, "x") };

export const gates = {
  and: { solid: prism(gateRect(ROW.and), 0, GATE.h, view, 3, 0.5), symbol: andSymbol },
  not: { solid: prism(gateRect(ROW.not), 0, GATE.h, view, 3, 0.5), symbol: notSymbol },
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

const lamp = ([x, y]: Vec2) => ({
  ...bulbParts([x, y], view, { baseR: LAMP_R, h: 6 }),
  ring: flatCircle(x, y, 9.5, 0, view, 40),
});

const face = (x: number, y: number, z = 0) => faceMatrix([x, y], z, view, "x");


export const board = {
  halo: prismFill(BOARD, -5, 5, view),
  slab: prism(BOARD, -5, 5, view, 5, 0.8),
  groove: flatRect(inset(BOARD, 3), 0, view),
  screws: rectCorners(BOARD, 5).map(([x, y]) => at([x, y, 0])),
  lever: lever(LEVER_A),
  lamps: LAMPS.map(lamp),
  labels: {
    a: face(LEVER_A[0] - 3.3, LEVER_A[1] + 17),
    b: face(-42, ROW.and - 1),
    lamps: LAMPS.map(([x, y]) => face(x - 3.3, y + 19)),
  },
};

// Entrance spark points: CPU corners, lever base corners and lamp bases.
export const contacts = [...rectCorners(CPU_RECT), ...rectCorners({ x: LEVER_A[0] - 7, y: LEVER_A[1] - 6, w: 14, d: 12 }), ...LAMPS].map(([x, y]) => at([x, y, 0]));
// Spark points when a part lands mid-loop.
export const landPoints = {
  cpu: rectCorners(CPU_RECT).map(([x, y]) => at([x, y, 0])),
  and: rectCorners(gateRect(ROW.and)).map(([x, y]) => at([x, y, 0])),
  not: rectCorners(gateRect(ROW.not)).map(([x, y]) => at([x, y, 0])),
};
