// RTL board, one data row left to right: lever A -> flip-flop r1 -> AND -> flip-flop q -> lamp q. Lever B (front)
// feeds the AND's lower pin; the clk lever's wire runs along the front and turns up into both clock pins (no
// crossings). The code lives in the readout below the board.
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
import type { Net, Part } from "./model";

export const STAGE_W = 600;
export const STAGE_H = 360;

const BOARD: Rect = { x: -94, y: -50, w: 162, d: 114, r: 4 };
const ROW = { d: -24, pin: -12, clk: 40 }; // data row, clock-pin row, clk wire row
export const LEVERS = { a: [-80, ROW.d] as Vec2, b: [-50, 20] as Vec2, clk: [-80, ROW.clk] as Vec2 };
export type LeverId = keyof typeof LEVERS;
const out = (id: LeverId) => LEVERS[id][0] + 7; // lever output stub
const FF_W = 24;
const FF_D = 36;
const FF_H = 7;
const ffRect = (x: number): Rect => ({ x, y: -42, w: FF_W, d: FF_D, r: 1.6 });
const R1 = ffRect(-64);
const QF = ffRect(12);
const AND = { x: -26, w: 18, d: 20, h: 6 };
const PIN = 4; // AND input pins at row -PIN (r1) and row +PIN (B)
const LAMP: Vec2 = [52, ROW.d];
const LAMP_R = 6.2;
const CLK_UP = { r1: R1.x - 6, q: QF.x - 8 }; // where each clk branch turns up to its clock pin

export const view = fitView(
  [...boxCorners(BOARD, -5, 0), ...Object.values(LEVERS).map(([x, y]) => [x, y, 18.5] as Vec3), [LAMP[0], LAMP[1], 19]],
  STAGE_W,
  STAGE_H,
  { pad: 18, azimuth: 62 },
);

const at = (p: Vec3) => project(p, view);

// Wires in signal direction; each appears when its part lands.
type Wire = { id: string; net: Net; part: Part; pts: Vec2[]; junction?: Vec2 };
const andRight = AND.x + AND.w;
export const WIRES: Wire[] = [
  { id: "a", net: "a", part: "r1", pts: [[out("a"), ROW.d], [R1.x, ROW.d]] },
  {
    id: "clk-r1",
    net: "clk",
    part: "r1",
    pts: [
      [out("clk"), ROW.clk],
      [CLK_UP.r1, ROW.clk],
      [CLK_UP.r1, ROW.pin],
      [R1.x, ROW.pin],
    ],
  },
  {
    id: "r1",
    net: "r1",
    part: "and",
    pts: [
      [R1.x + FF_W, ROW.d],
      [AND.x - 7, ROW.d],
      [AND.x - 7, ROW.d - PIN],
      [AND.x, ROW.d - PIN],
    ],
  },
  {
    id: "b",
    net: "b",
    part: "and",
    pts: [
      [out("b"), LEVERS.b[1]],
      [AND.x - 4, LEVERS.b[1]],
      [AND.x - 4, ROW.d + PIN],
      [AND.x, ROW.d + PIN],
    ],
  },
  { id: "and", net: "and", part: "q", pts: [[andRight, ROW.d], [QF.x, ROW.d]] },
  {
    id: "clk-q",
    net: "clk",
    part: "q",
    junction: [CLK_UP.r1, ROW.clk],
    pts: [
      [CLK_UP.r1, ROW.clk],
      [CLK_UP.q, ROW.clk],
      [CLK_UP.q, ROW.pin],
      [QF.x, ROW.pin],
    ],
  },
  { id: "q", net: "q", part: "q", pts: [[QF.x + FF_W, ROW.d], [LAMP[0] - LAMP_R, ROW.d]] },
];
export const wirePath = (w: Wire) => flatPath(w.pts, 0, view);
export const junctionAt = (w: Wire) => (w.junction ? at([w.junction[0], w.junction[1], 0]) : null);

// AND block with its symbol engraved on top.
const andRect: Rect = { x: AND.x, y: ROW.d - AND.d / 2, w: AND.w, d: AND.d, r: 1.4 };
const arc = (cx: number, cy: number, r: number, a0: number, a1: number, n = 12): Vec2[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
const SX = AND.x + 3; // symbol left edge
const SR = 7; // symbol half-height
const andSymbol = flatPath([[SX, ROW.d + SR], [SX, ROW.d - SR], [SX + 5, ROW.d - SR], ...arc(SX + 5, ROW.d, SR, -90, 90).slice(1), [SX, ROW.d + SR]], AND.h, view, true);

// D flip-flop: standard box on top, name tag at the back, D and Q at the data row, clock triangle and "clk" at the pin row.
const ff = (r: Rect) => ({
  solid: prism(r, 0, FF_H, view, 3, 0.6),
  symbol:
    flatRect(inset(r, 2.5), FF_H, view, 3) +
    flatPath(
      [
        [r.x + 2.5, ROW.pin - 5],
        [r.x + 9, ROW.pin],
        [r.x + 2.5, ROW.pin + 5],
      ],
      FF_H,
      view,
    ),
  labels: {
    tag: faceMatrix([r.x + 4, r.y + 9], FF_H, view, "x"),
    d: faceMatrix([r.x + 3.5, ROW.d + 4], FF_H, view, "x"),
    q: faceMatrix([r.x + FF_W - 10, ROW.d + 4], FF_H, view, "x"),
    clk: faceMatrix([r.x + 10, ROW.pin + 2.2], FF_H, view, "x"),
  },
});

export const parts = {
  r1: ff(R1),
  and: { solid: prism(andRect, 0, AND.h, view, 3, 0.5), symbol: andSymbol },
  q: ff(QF),
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

const face = (x: number, y: number, z = 0) => faceMatrix([x, y], z, view, "x");

export const board = {
  halo: prismFill(BOARD, -5, 5, view),
  slab: prism(BOARD, -5, 5, view, 5, 0.8),
  groove: flatRect(inset(BOARD, 3), 0, view),
  screws: rectCorners(BOARD, 5).map(([x, y]) => at([x, y, 0])),
  levers: { a: lever(LEVERS.a), b: lever(LEVERS.b), clk: lever(LEVERS.clk) },
  lamp: { ...bulbParts(LAMP, view, { baseR: LAMP_R, h: 6 }), ring: flatCircle(LAMP[0], LAMP[1], 9.5, 0, view, 40) },
  labels: {
    a: face(LEVERS.a[0] - 3, LEVERS.a[1] + 15),
    b: face(LEVERS.b[0] - 3, LEVERS.b[1] + 15),
    clk: face(LEVERS.clk[0] - 8, LEVERS.clk[1] + 17),
    q: face(LAMP[0] - 3, LAMP[1] + 19),
  },
};

// Entrance spark points: lever base corners and the lamp base.
export const contacts = [...Object.values(LEVERS).flatMap(([x, y]) => rectCorners({ x: x - 7, y: y - 6, w: 14, d: 12 })), LAMP].map(([x, y]) => at([x, y, 0]));
// Spark points when a part lands mid-loop.
export const landPoints = {
  r1: rectCorners(R1).map(([x, y]) => at([x, y, 0])),
  and: rectCorners(andRect).map(([x, y]) => at([x, y, 0])),
  q: rectCorners(QF).map(([x, y]) => at([x, y, 0])),
};
