// NAND gate board: one gate block, input levers A and B on the left, output bulb Y on the right.
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
  prism,
  pathD,
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
export const STAGE_H = 270;
const AZIMUTH = 62;

const BOARD: Rect = { x: -88, y: -34, w: 176, d: 68, r: 6 };
const SLAB_H = 8;
const FOOT_H = 4;

const GATE: Rect = { x: -24, y: -17, w: 48, d: 34, r: 2 };
const GATE_Z = 3;
const GATE_H = 11;
const GATE_TOP = GATE_Z + GATE_H;
const ARM_Z = 6;
const LEAD = 7;

type Pin = "a" | "b" | "y";
const PINS: Record<Pin, Vec2> = { a: [GATE.x, -8], b: [GATE.x, 8], y: [GATE.x + GATE.w, 0] };
const PADS: Record<Pin, Vec2> = { a: [GATE.x - LEAD, -8], b: [GATE.x - LEAD, 8], y: [GATE.x + GATE.w + LEAD, 0] };
const ENDS: Record<Pin, Vec2> = { a: [-62, -8], b: [-62, 8], y: [58, 0] };

export const view = fitView([...boxCorners(BOARD, -SLAB_H - FOOT_H, 0), [0, 0, GATE_TOP + 2], [ENDS.y[0], 0, 16]], STAGE_W, STAGE_H, { pad: 18, azimuth: AZIMUTH });

const at = (p: Vec3) => project(p, view);

// Depth along the camera: feet are drawn back to front.
const depth = ([x, y, z]: Vec3) => {
  const a = (AZIMUTH * Math.PI) / 180;
  const e = (30 * Math.PI) / 180;
  return (x * Math.cos(a) + y * Math.sin(a)) * Math.cos(e) + z * Math.sin(e);
};
const backToFront = (pts: Vec2[]) => [...pts].sort((p, q) => depth([p[0], p[1], 0]) - depth([q[0], q[1], 0]));

const trace = (pts: Vec2[], z = 0) => flatPath(pts, z, view);
const label = (x: number, y: number) => faceMatrix([x, y], 0, view, "x");

export const board = {
  halo: prismFill(BOARD, -SLAB_H - FOOT_H, SLAB_H, view),
  feet: backToFront(rectCorners(BOARD, 14)).map(([x, y]) => cylinder(x, y, 5, -SLAB_H - FOOT_H, FOOT_H, view, 24, 0.4)),
  slab: prism(BOARD, -SLAB_H, SLAB_H, view, 6, 1.2),
  groove: flatRect(inset(BOARD, 3.5), 0, view),
  screwRings: rectCorners(BOARD, 7)
    .map(([x, y]) => flatCircle(x, y, 1.8, 0, view, 14))
    .join(""),
  screws: rectCorners(BOARD, 7).map(([x, y]) => at([x, y, 0])),
  labels: {
    a: label(ENDS.a[0] - 21, ENDS.a[1] + 2.8),
    b: label(ENDS.b[0] - 21, ENDS.b[1] + 2.8),
    y: label(ENDS.y[0] + 10, ENDS.y[1] + 2.8),
  },
};

// Gate pin: an arm out of the block and a drop down to the board pad.
const pinPart = (pin: Pin) => {
  const [x, y] = PINS[pin];
  const arm: Rect = { x: pin === "y" ? x : x - LEAD + 1, y: y - 1.4, w: LEAD - 1, d: 2.8, r: 0.3 };
  const drop: Rect = { x: PADS[pin][0] - 1.2, y: y - 1.4, w: 2.4, d: 2.8, r: 0.3 };
  return { arm: prism(arm, ARM_Z, 1, view, 2), drop: prism(drop, 0, ARM_Z + 1, view, 2) };
};
export const pins = { a: pinPart("a"), b: pinPart("b"), y: pinPart("y") };

// NAND symbol on the block top: flat back, half-round front, output bubble, input and output leads.
const symbol = () => {
  const pts: Vec2[] = [
    [-9, -7],
    [-9, 7],
  ];
  for (let i = 0; i <= 20; i++) {
    const a = Math.PI / 2 - (i / 20) * Math.PI;
    pts.push([1 + Math.cos(a) * 7, Math.sin(a) * 7]);
  }
  return {
    body: flatPath(pts, GATE_TOP, view, true),
    bubble: flatCircle(10.4, 0, 2.4, GATE_TOP, view, 20),
    leads:
      trace(
        [
          [GATE.x, -4],
          [-9, -4],
        ],
        GATE_TOP,
      ) +
      trace(
        [
          [GATE.x, 4],
          [-9, 4],
        ],
        GATE_TOP,
      ) +
      trace(
        [
          [12.8, 0],
          [GATE.x + GATE.w - 0.8, 0],
        ],
        GATE_TOP,
      ),
  };
};

export const gate = {
  halo: prismFill(inset(GATE, 2), 0.1, 0.1, view),
  body: prism(GATE, GATE_Z, GATE_TOP - GATE_Z, view, 4, 0.8),
  seam: rectFrontEdge(GATE, GATE_Z + 3.5, view, 4),
  symbol: symbol(),
  notch: at([GATE.x + 4, GATE.y + 4, GATE_TOP]),
  notchRing: flatCircle(GATE.x + 4, GATE.y + 4, 1.6, GATE_TOP, view, 14),
};

export const wires = {
  a: trace([[ENDS.a[0] + 7, ENDS.a[1]], PADS.a]),
  b: trace([[ENDS.b[0] + 7, ENDS.b[1]], PADS.b]),
  y: trace([PADS.y, ENDS.y]),
};

export const padRings = Object.values(PADS)
  .map(([x, y]) => flatCircle(x, y, 2.4, 0, view, 16))
  .join("");
export const padDots = Object.values(PADS).map(([x, y]) => at([x, y, 0]));

// Input levers (as in episodes 01 and 03): knob down = 1.
const lever = ([x, y]: Vec2) => ({
  base: prism({ x: x - 7, y: y - 6, w: 14, d: 12, r: 1.2 }, 0, 4, view, 3, 0.4),
  slot: flatRect({ x: x - 1.2, y: y - 5, w: 2.4, d: 10, r: 1 }, 4, view, 3),
  pivot: cylinder(x, y, 2, 4, 2, view, 18, 0.3),
});
export const levers = { a: lever(ENDS.a), b: lever(ENDS.b) };
export const leverAt = { a: ENDS.a, b: ENDS.b };
export const knobAt = ([x, y]: Vec2, v: number): Vec3 => [x, y + Math.sin(v * 0.6) * 12, 6 + Math.cos(v * 0.6) * 12];
export const rodPath = (p: Vec2, v: number) => pathD([at([p[0], p[1], 6]), at(knobAt(p, v))]);
export const knob = cylinder(0, 0, 2.4, -1.2, 2.8, view, 20, 0.6);
export const knobTransform = (p: Vec3) => translateTo(view, p);

// Output bulb Y.
export const bulb = bulbParts(ENDS.y, view, { baseR: 6.2, h: 7 });

export const glowR = heightPx(22, view);

// Entrance spark points: gate corners and the lamp rims where they land.
const ring = (x: number, y: number, r: number, n: number): Vec2[] => Array.from({ length: n }, (_, i) => [x + r * Math.cos((i / n) * Math.PI * 2), y + r * Math.sin((i / n) * Math.PI * 2)]);
export const contacts = [...rectCorners(GATE), ...ring(ENDS.a[0], ENDS.a[1], 4.6, 3), ...ring(ENDS.b[0], ENDS.b[1], 4.6, 3), ...ring(ENDS.y[0], ENDS.y[1], 6.2, 4)].map(([x, y]) => at([x, y, 0]));
