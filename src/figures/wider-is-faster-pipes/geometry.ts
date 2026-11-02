// Wider is faster as water pipes: the episode 8 board (supply tank at the back, one pipe with two taps down to a
// drain at the front, the glass output tank teed in between). Pipe width follows W (4 per unit, height fixed), so W=2
// doubles the pipe's cross-section; the tap housings widen with it. The supply folds into the VDD rail, the drain into
// GND, the taps into the PMOS and NMOS valves (block width 12 W), the pipes into straps. Water parts take the morph m.
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
export const STAGE_H = 350;

const BOARD: Rect = { x: -72, y: -62, w: 144, d: 124, r: 4 };
const SUPPLY: Rect = { x: -32, y: -60, w: 44, d: 10.5, r: 1.2 };
// Supply water stands at the full-tank height, so the tank fills up to it and never higher.
const SUPPLY_H = 22;
export const view = fitView([...boxCorners(BOARD, -5, 0), [24, 0, 24], ...boxCorners(SUPPLY, 0, SUPPLY_H)], STAGE_W, STAGE_H, { pad: 26, azimuth: 62 });
const at = (p: Vec3) => project(p, view);
const trace = (pts: Vec2[], z = 0) => flatPath(pts, z, view);
const face = (x: number, y: number) => faceMatrix([x, y], 0, view, "x");

const VDD_Y = -50;
const GND_Y = 50;
const RAIL_D = 5;
const RAIL_X0 = 22;
const VALVE_X = -10;
const PIN_X = -27;
const VALVE = { w: 12, d: 8, h: 3 }; // width per unit of W
const P_Y = -26;
const N_Y = 26;
const TANK = { x: 24, y: 0, r: 9, z0: 1.4, h: 18 };
const LAMP: Vec2 = [54, 0];
const LEVER = { x: -52, y: 0, pivotZ: 6, len: 13 };
const BUS_END = TANK.x - TANK.r - 1.6;

const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const lerpRect = (a: Rect, b: Rect, u: number): Rect => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), w: lerp(a.w, b.w, u), d: lerp(a.d, b.d, u), r: lerp(a.r, b.r, u) });

const valveRect = (y: number, w: number): Rect => ({ x: VALVE_X - (VALVE.w * w) / 2, y: y - VALVE.d / 2, w: VALVE.w * w, d: VALVE.d, r: 1 });
// Valve parts that follow W: body, gate bar and the arm from the control pin.
export const valveAt = (y: number, w: number) => {
  const body = valveRect(y, w);
  const gate: Rect = { x: body.x - 1, y: y - 1.2, w: body.w + 2, d: 2.4, r: 0.4 };
  const arm: Rect = { x: PIN_X, y: y - 0.9, w: body.x - PIN_X, d: 1.8, r: 0.3 };
  return { body: prism(body, 0, VALVE.h, view, 3, 0.4), gate: prism(gate, VALVE.h, 1.1, view, 2, 0.3), arm: prism(arm, 4.2, 1.2, view, 2) };
};
const pinParts = (y: number, bubble: boolean) => ({
  pin: cylinder(PIN_X, y, 1.4, 0, 7, view, 16),
  cap: cylinder(PIN_X, y, 2, 7, 1.2, view, 18, 0.3),
  bubble: bubble ? flatCircle(PIN_X, y, 3.1, 8.2, view, 20) + flatCircle(PIN_X, y, 3.1, 7.2, view, 20) : "",
  name: faceMatrix([PIN_X - 19, y + 1.6], 0, view, "x"),
});

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
  wLabel: face(BOARD.x + 8, -31),
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
  pmos: pinParts(P_Y, true),
  nmos: pinParts(N_Y, false),
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
// Liquid in the glass tank (both halves), level 0..1.
export const fluidSolid = (level: number) => cylinder(TANK.x, TANK.y, TANK.r - 0.8, TANK.z0 + 0.2, Math.max(0.05, level * (TANK.h - 0.6)), view, 32);
// Water level of a full tank, in board units; the supply water stands here.
const FULL_Z = TANK.z0 + 0.2 + (TANK.h - 0.6);

// Water boxes: the supply folds into the VDD rail, the drain into the GND rail.
export type Box = "supply" | "drain";
const BOXES: Record<Box, { from: Rect; to: Rect; h: number; toH: number; level: number }> = {
  supply: { from: SUPPLY, to: railRect(VDD_Y), h: SUPPLY_H, toH: 1.6, level: FULL_Z / SUPPLY_H },
  drain: { from: { x: -32, y: 50, w: 44, d: 10, r: 1.2 }, to: railRect(GND_Y), h: 4, toH: 1.6, level: 0.3 },
};
export const boxLevel = (b: Box) => BOXES[b].level;
export const boxAt = (b: Box, m: number) => ({ rect: lerpRect(BOXES[b].from, BOXES[b].to, m), h: lerp(BOXES[b].h, BOXES[b].toH, m) });
export const boxSolid = (b: Box, m: number) => {
  const { rect, h } = boxAt(b, m);
  return prism(rect, 0, h, view, 3, 0.4 * (1 - m));
};
export const boxWater = (b: Box, m: number, level: number, amp: number, t: number, phase: number) => waterBox(boxAt(b, m).rect, level, amp, t, phase, view);

// Pipes (4 wide per unit of W, 3 high) between the boxes, through the tap housings, folding into straps.
const PIPE = 4; // width per unit of W
const PIPE_H = 3;
const HOUSING = { s: 8, h: 5, wheelR: 3.6 };
const STEM_TOP = HOUSING.h + 2.6;
const SUPPLY_FRONT = SUPPLY.y + SUPPLY.d;
const DRAIN_BACK = BOXES.drain.from.y + 1;
const pipeY = (y0: number, y1: number, x: number, s: number, h: number, r: number) => prism({ x: x - s / 2, y: Math.min(y0, y1), w: s, d: Math.abs(y1 - y0), r }, 0, h, view, 2, 0.2 * r);
const pipeX = (x0: number, x1: number, y: number, s: number, h: number) => prism({ x: Math.min(x0, x1), y: y - s / 2, w: Math.abs(x1 - x0), d: s, r: 0.4 }, 0, h, view, 2, 0.2);
export const pipesAt = (m: number, w: number) => {
  const s = lerp(PIPE * w, 0.6, m);
  const h = lerp(PIPE_H, 0.1, m);
  const r = 0.4 * (1 - m);
  const half = HOUSING.s / 2;
  return {
    top: [pipeY(SUPPLY_FRONT, P_Y - half, VALVE_X, s, h, r)],
    mid: [pipeY(P_Y + half, N_Y - half, VALVE_X, s, h, r), pipeX(VALVE_X + s / 2, lerp(BUS_END + 1.2, BUS_END, m), 0, lerp(PIPE * w, 3.2, m), lerp(PIPE_H, 1, m))],
    bottom: [pipeY(N_Y + half, DRAIN_BACK, VALVE_X, s, h, r)],
  };
};

// Tap housings on the pipe (fold into the valve bodies): housing, stem, handwheel; the handle bar lies along the pipe
// when open and across it when shut.
export const TAP_Y = { p: P_Y, n: N_Y };
const housingRect = (y: number, w: number): Rect => {
  const s = HOUSING.s + PIPE * (w - 1);
  return { x: VALVE_X - s / 2, y: y - HOUSING.s / 2, w: s, d: HOUSING.s, r: 1 };
};
export function tapAt(y: number, m: number, open: number, w: number) {
  const body = valveRect(y, w);
  const h = lerp(HOUSING.h, VALVE.h, m);
  const top = lerp(STEM_TOP, VALVE.h, m);
  const solids = [prism(lerpRect(housingRect(y, w), body, m), 0, h, view, 3, 0.4)];
  if (m < 0.98) solids.push(cylinder(VALVE_X, y, 0.8, h, Math.max(0.05, top - h), view, 12, 0));
  const wheel: Rect = { x: VALVE_X - HOUSING.wheelR, y: y - HOUSING.wheelR, w: HOUSING.wheelR * 2, d: HOUSING.wheelR * 2, r: HOUSING.wheelR };
  const gate: Rect = { x: body.x - 1, y: y - 1.2, w: body.w + 2, d: 2.4, r: 0.4 };
  solids.push(prism(lerpRect(wheel, gate, m), top, 1.1, view, 8, 0.3));
  const a = (open * Math.PI) / 2;
  const z = STEM_TOP + 1.15;
  const r = HOUSING.wheelR + 1.4;
  const handle = m < 0.98 ? pathD([at([VALVE_X - Math.cos(a) * r, y - Math.sin(a) * r, z]), at([VALVE_X + Math.cos(a) * r, y + Math.sin(a) * r, z])]) : "";
  return { solids, handle };
}
// Soft paper halo under each tap (water half), as in episode 8.
export const tapHalo = (y: number, w: number) => prismFill(inset(housingRect(y, w), -1), 0.1, 0.1, view);

// Flow lines on top of the pipes: one lane at W=1, two lanes (side by side) at W=2.
const DROP_Z = PIPE_H + 0.05;
export const LANES = 2;
const lanePts: Record<string, (o: number) => Vec2[]> = {
  supply: (o) => [[VALVE_X + o, SUPPLY_FRONT], [VALVE_X + o, P_Y - HOUSING.s / 2]],
  fill: (o) => [[VALVE_X + o, P_Y + HOUSING.s / 2], [VALVE_X + o, o], [BUS_END + 1.2, o]],
  drainMid: (o) => [[BUS_END + 1.2, o], [VALVE_X + o, o], [VALVE_X + o, N_Y - HOUSING.s / 2]],
  drain: (o) => [[VALVE_X + o, N_Y + HOUSING.s / 2], [VALVE_X + o, DRAIN_BACK]],
};
export const STREAMS = Object.keys(lanePts);
// Lane k of a stream at width w: lanes sit at ±(w-1)·PIPE/2 and merge at W=1.
export const streamPath = (id: string, k: number, w: number) => trace(lanePts[id]((k === 0 ? -1 : 1) * ((w - 1) * PIPE) / 2), DROP_Z);

// Entrance spark points: the boxes, the tank base and the two taps.
export const contacts = [
  ...rectCorners(SUPPLY),
  ...rectCorners(BOXES.drain.from),
  ...[0, 1, 2, 3].map((i): Vec2 => [TANK.x + (TANK.r + 1.6) * Math.cos((i * Math.PI) / 2), TANK.y + (TANK.r + 1.6) * Math.sin((i * Math.PI) / 2)]),
  ...[P_Y, N_Y].flatMap((y) => rectCorners(housingRect(y, 1)).slice(0, 2)),
].map(([x, y]) => at([x, y, 0]));
