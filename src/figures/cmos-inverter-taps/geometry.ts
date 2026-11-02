// CMOS inverter as two taps on one water pipe: a supply tank (VDD) on top, an output tank in the middle, a drain
// (GND) below; one handle turns both taps. The tanks fold into the rails and the glass output tank, the taps into
// the PMOS and NMOS valves, the pipes into straps. Every water part is a function of the morph m (0 = water, 1 = circuit).
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
import { waterBox } from "../../iso/analogy/water";
import { bulbParts } from "../../iso/react/bulb";

export const STAGE_W = 600;
export const STAGE_H = 330;

const BOARD: Rect = { x: -72, y: -62, w: 144, d: 124, r: 4 };
export const view = fitView([...boxCorners(BOARD, -5, 0), [24, 0, 24]], STAGE_W, STAGE_H, { pad: 26, azimuth: 62 });
const at = (p: Vec3) => project(p, view);
const trace = (pts: Vec2[], z = 0) => flatPath(pts, z, view);
const face = (x: number, y: number) => faceMatrix([x, y], 0, view, "x");

const VDD_Y = -50;
const GND_Y = 50;
const RAIL_D = 5;
const RAIL_X0 = 22; // rails start this far in from the board's left edge
const VALVE_X = -10;
const PIN_X = -27;
const VALVE = { w: 20, d: 8, h: 3 };
const P_Y = -26;
const N_Y = 26;
const TANK = { x: 24, y: 0, r: 9, z0: 1.4, h: 18 };
const LAMP: Vec2 = [54, 0];
const LEVER = { x: -52, y: 0, pivotZ: 6, len: 13 };
const BUS_END = TANK.x - TANK.r - 1.6;

const valveRect = (y: number): Rect => ({ x: VALVE_X - VALVE.w / 2, y: y - VALVE.d / 2, w: VALVE.w, d: VALVE.d, r: 1 });
const valve = (y: number, bubble: boolean) => {
  const body = valveRect(y);
  const gate: Rect = { x: body.x - 1, y: y - 1.2, w: body.w + 2, d: 2.4, r: 0.4 };
  const arm: Rect = { x: PIN_X, y: y - 0.9, w: body.x - PIN_X, d: 1.8, r: 0.3 };
  return {
    body: prism(body, 0, VALVE.h, view, 3, 0.4),
    gate: prism(gate, VALVE.h, 1.1, view, 2, 0.3),
    pin: cylinder(PIN_X, y, 1.4, 0, 7, view, 16),
    cap: cylinder(PIN_X, y, 2, 7, 1.2, view, 18, 0.3),
    arm: prism(arm, 4.2, 1.2, view, 2),
    bubble: bubble ? flatCircle(PIN_X, y, 3.1, 8.2, view, 20) + flatCircle(PIN_X, y, 3.1, 7.2, view, 20) : "",
    contacts: [at([body.x + 2, body.y + 1.6, VALVE.h]), at([body.x + body.w - 2, body.y + body.d - 1.6, VALVE.h])],
    name: faceMatrix([PIN_X - 19, y + 1.6], 0, view, "x"),
  };
};

// A strap (current path); `reverse` also draws it backwards for current flowing the other way.
const strap = (id: string, pts: Vec2[], reverse = false) => ({ id, d: trace(pts), dReverse: reverse ? trace([...pts].reverse()) : undefined });
const railRect = (y: number): Rect => ({ x: BOARD.x + RAIL_X0, y: y - RAIL_D / 2, w: BOARD.w - RAIL_X0 - 6, d: RAIL_D, r: 0.8 });

export const board = {
  halo: prismFill(BOARD, -5, 5, view),
  slab: prism(BOARD, -5, 5, view, 5, 0.8),
  groove: flatRect(inset(BOARD, 3), 0, view),
  screws: rectCorners(BOARD, 5).map(([x, y]) => at([x, y, 0])),
  vdd: prism(railRect(VDD_Y), 0, 1.6, view, 2, 0.3),
  gnd: prism(railRect(GND_Y), 0, 1.6, view, 2, 0.3),
  vddLabel: face(BOARD.x + 6, VDD_Y + 1.6),
  gndLabel: face(BOARD.x + 6, GND_Y + 1.6),
  bus: prism({ x: VALVE_X - 2, y: -1.6, w: BUS_END - VALVE_X + 3, d: 3.2, r: 0.6 }, 0, 1, view, 2, 0.2),
  charge: [
    strap("vdd-p", [[VALVE_X, VDD_Y + RAIL_D / 2], [VALVE_X, P_Y - VALVE.d / 2]]),
    strap("p-bus", [[VALVE_X, P_Y + VALVE.d / 2], [VALVE_X, -1.6]]),
    strap("bus-tank", [[VALVE_X + 4, 0], [BUS_END, 0]], true),
  ],
  discharge: [strap("bus-n", [[VALVE_X, 1.6], [VALVE_X, N_Y - VALVE.d / 2]]), strap("n-gnd", [[VALVE_X, N_Y + VALVE.d / 2], [VALVE_X, GND_Y]])],
  vin: [strap("lever-pins", [[LEVER.x + 7, 0], [PIN_X, 0]]), strap("pin-p", [[PIN_X, 0], [PIN_X, P_Y]]), strap("pin-n", [[PIN_X, 0], [PIN_X, N_Y]])],
  vinJunction: at([PIN_X, 0, 0]),
  bit1: face(LEVER.x - 1.6, LEVER.y - 16),
  bit0: face(LEVER.x - 1.6, LEVER.y + 11.6),
  sense: trace([[TANK.x + TANK.r + 1.6, 0], [LAMP[0] - 6.2, 0]]),
  pmos: valve(P_Y, true),
  nmos: valve(N_Y, false),
  tank: {
    base: cylinder(TANK.x, TANK.y, TANK.r + 1.6, 0, TANK.z0, view, 32, 0.3),
    shell: cylinder(TANK.x, TANK.y, TANK.r, TANK.z0, TANK.h, view, 36),
    lid: cylinder(TANK.x, TANK.y, TANK.r + 1, TANK.z0 + TANK.h, 1.4, view, 32, 0.3),
    ticks: [0.25, 0.5, 0.75].map((f) => flatCircle(TANK.x, TANK.y, TANK.r + 0.05, TANK.z0 + TANK.h * f, view, 24)).join(""),
  },
  lamp: bulbParts(LAMP, view, { baseR: 6.2, h: 6 }),
  lever: {
    base: prism({ x: LEVER.x - 7, y: -6, w: 14, d: 12, r: 1.2 }, 0, 4, view, 3, 0.4),
    slot: flatRect({ x: LEVER.x - 1.2, y: -5, w: 2.4, d: 10, r: 1 }, 4, view, 3),
    pivot: cylinder(LEVER.x, 0, 2, 4, 2, view, 18, 0.3),
  },
};

// Lever position v: 1 = up (logic 0), -1 = pulled (logic 1).
export const knobAt = (v: number): Vec3 => [LEVER.x, Math.sin(v * 0.6) * LEVER.len, LEVER.pivotZ + Math.cos(v * 0.6) * LEVER.len];
export const rodPath = (v: number) => pathD([at([LEVER.x, 0, LEVER.pivotZ]), at(knobAt(v))]);
export const knob = cylinder(0, 0, 2.4, -1.2, 2.8, view, 20, 0.6);
export const knobTransform = (p: Vec3) => translateTo(view, p);
// Liquid in the circuit's glass tank, level 0..1.
export const fluidSolid = (level: number) => cylinder(TANK.x, TANK.y, TANK.r - 0.8, TANK.z0 + 0.2, Math.max(0.05, level * (TANK.h - 0.6)), view, 32);

const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const lerpRect = (a: Rect, b: Rect, u: number): Rect => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), w: lerp(a.w, b.w, u), d: lerp(a.d, b.d, u), r: lerp(a.r, b.r, u) });

// Water boxes: the supply folds into the VDD rail, the output tank into the glass tank, the drain into the GND rail.
const OUT_X = 12;
export type Box = "supply" | "out" | "drain";
const BOXES: Record<Box, { from: Rect; to: Rect; h: number; toH: number }> = {
  supply: { from: { x: -34, y: -60, w: 48, d: 16, r: 1.2 }, to: railRect(VDD_Y), h: 13, toH: 1.6 },
  out: { from: { x: OUT_X, y: -12, w: 26, d: 24, r: 1.2 }, to: { x: TANK.x - TANK.r, y: -TANK.r, w: TANK.r * 2, d: TANK.r * 2, r: TANK.r }, h: 19, toH: TANK.z0 + TANK.h },
  drain: { from: { x: -34, y: 44, w: 48, d: 14, r: 1.2 }, to: railRect(GND_Y), h: 5, toH: 1.6 },
};
export const boxAt = (b: Box, m: number) => ({ rect: lerpRect(BOXES[b].from, BOXES[b].to, m), h: lerp(BOXES[b].h, BOXES[b].toH, m) });
export const boxSolid = (b: Box, m: number) => {
  const { rect, h } = boxAt(b, m);
  return prism(rect, 0, h, view, b === "out" ? 10 : 3, 0.4 * (1 - m));
};
export const boxWater = (b: Box, m: number, level: number, amp: number, t: number, phase: number) => waterBox(boxAt(b, m).rect, level, amp, t, phase, view);

// Pipes between the boxes (folding into straps): x-runs and y-runs of square section s.
const PIPE_S = 3;
const pipeX = (x0: number, x1: number, y: number, z: number, s: number) => prism({ x: Math.min(x0, x1), y: y - s / 2, w: Math.abs(x1 - x0), d: s, r: 0.4 }, z, s, view, 2, 0.2);
const pipeY = (y0: number, y1: number, x: number, z: number, s: number) => prism({ x: x - s / 2, y: Math.min(y0, y1), w: s, d: Math.abs(y1 - y0), r: 0.4 }, z, s, view, 2, 0.2);
const SUPPLY_BOTTOM = BOXES.supply.from.y + BOXES.supply.from.d;
const DRAIN_TOP = BOXES.drain.from.y;
export const pipesAt = (m: number) => {
  const s = lerp(PIPE_S, 0.6, m);
  return {
    top: [pipeY(SUPPLY_BOTTOM, P_Y - 3, VALVE_X, 0, s)],
    mid: [pipeY(P_Y + 3, N_Y - 3, VALVE_X, 0, s), pipeX(VALVE_X + s / 2, lerp(OUT_X, BUS_END, m), 0, 0, s)],
    bottom: [pipeY(N_Y + 3, DRAIN_TOP, VALVE_X, 0, s)],
  };
};

// Taps on the pipe (fold into the valve bodies); the handle bar lies along the pipe when open, across when shut.
export const TAP_Y = { p: P_Y, n: N_Y };
export function tapAt(y: number, m: number, open: number) {
  const h = lerp(6, VALVE.h, m);
  const stem = 3 * (1 - m);
  const top = h + stem;
  const solids = [prism(lerpRect({ x: VALVE_X - 3, y: y - 3, w: 6, d: 6, r: 0.8 }, valveRect(y), m), 0, h, view, 3, 0.4)];
  if (m < 0.98) {
    solids.push(cylinder(VALVE_X, y, 0.8, h, Math.max(0.05, stem), view, 12, 0));
    solids.push(cylinder(VALVE_X, y, lerp(3.6, 1.6, m), top, 1, view, 28, 0.3));
  }
  const a = (open * Math.PI) / 2;
  const z = top + 1.05;
  const dx = Math.cos(a) * 5.4;
  const dy = Math.sin(a) * 5.4;
  return { solids, handle: m < 0.98 ? pathD([at([VALVE_X - dx, y - dy, z]), at([VALVE_X + dx, y + dy, z])]) : "" };
}

// The handle's link to both taps in the water half.
export const tapLink = trace([[PIN_X, P_Y], [VALVE_X - 3, P_Y]]) + trace([[PIN_X, N_Y], [VALVE_X - 3, N_Y]]);
const DROP_Z = PIPE_S + 0.2;
export const streams = {
  supply: trace([[VALVE_X, SUPPLY_BOTTOM - 1], [VALVE_X, P_Y - 3]], DROP_Z),
  fill: trace([[VALVE_X, P_Y + 3], [VALVE_X, 0], [OUT_X + 1, 0]], DROP_Z),
  drainMid: trace([[OUT_X + 1, 0], [VALVE_X, 0], [VALVE_X, N_Y - 3]], DROP_Z),
  drain: trace([[VALVE_X, N_Y + 3], [VALVE_X, DRAIN_TOP + 2]], DROP_Z),
};

// Entrance spark points: lever base, the three boxes and the two taps.
export const contacts = [
  ...rectCorners({ x: LEVER.x - 7, y: -6, w: 14, d: 12, r: 0 }),
  ...rectCorners(BOXES.supply.from),
  ...rectCorners(BOXES.out.from),
  ...rectCorners(BOXES.drain.from),
  ...[P_Y, N_Y].flatMap((y) => rectCorners({ x: VALVE_X - 3, y: y - 3, w: 6, d: 6, r: 0 }).slice(0, 2)),
].map(([x, y]) => at([x, y, 0]));
