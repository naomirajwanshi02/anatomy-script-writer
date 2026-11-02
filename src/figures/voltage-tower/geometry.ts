// Lowering supply voltage as a water tower: one board (always on screen). x runs right, y toward the viewer (front face
// +y), z up. Analogy (square board): back left a water tower (open trough on a telescopic stand, marks 1-4, ladder,
// ROLLIN maker's plate on its plinth); front left a sump basin with a pump box, a riser climbing from the pump into the
// trough; right a tall glass tank (marks 1-4) fed by a top pipe and tap from the tower and drained by a bottom tap and
// pipe back to the sump; front right a clock dial on an upright plate.
// Circuit (the board stretches long toward the back): VDD rail along the back (tag behind it), GND rail along the front,
// PMOS and NMOS valves on one column at x = COL, the output node joined to the glass tank (which stays the output) by a
// bus, the input lever at the left with the clock beside it.
import { boxCorners, cylinder, faceMatrix, fitView, flatCircle, flatPath, flatRect, inset, pathD, prism, prismFill, project, rectCorners, translateTo, type Rect, type Vec2, type Vec3, type View } from "../../iso/iso-kit";
import { waterBox } from "../../iso/analogy/water";
import { MARKS } from "./model";

export const STAGE_W = 600;
const AZIMUTH = 62;
const PAD = 6;

// Boards: square for the analogy, long (deeper toward the back, narrower) for the circuit.
const BOARD_A: Rect = { x: -68, y: -64, w: 134, d: 130, r: 5 };
const BOARD_C: Rect = { x: -68, y: -96, w: 118, d: 162, r: 5 };
const SLAB_H = 6;

// One mark of height (tower stand and glass tank share it).
const MARK = 14;
export const TOP = MARK * MARKS; // 56

// Water tower.
const TW = { x: -39, y: -30 };
const PLINTH: Rect = { x: -54, y: -42, w: 30, d: 24, r: 1.2 };
const PLINTH_H = 4;
const HALF_W = [8, 6.5, 5, 3.6];
const TROUGH: Rect = { x: -57, y: -39, w: 36, d: 18, r: 1.2 };
const TROUGH_H = 12;
const TROUGH_LEVEL = 0.72;

// Sump basin with the pump box standing in it.
const SUMP: Rect = { x: -62, y: 20, w: 48, d: 34, r: 1.2 };
const SUMP_H = 7;
const SUMP_LEVEL = 0.55;
const PUMP: Rect = { x: -58, y: 24, w: 13, d: 11, r: 1 };
const PUMP_H = 15;
const PUMP_C: Vec2 = [PUMP.x + PUMP.w / 2, PUMP.y + PUMP.d / 2];

// Glass tank (shared: becomes the output tank).
const TANK: Rect = { x: 18, y: -40, w: 28, d: 24, r: 1.2 };
const TANK_CX = TANK.x + TANK.w / 2;
const TANK_CY = TANK.y + TANK.d / 2;
const TANK_FRONT = TANK.y + TANK.d;

// Pipes (built at the full tower height; the tower's upper parts shift down with it).
const RISER_D = 3.2;
const RISER_UP = TROUGH_H + 8; // run height above the trough floor
const FILL_D = 3.2;
const FILL_Y = -30;
const FILL_Z = TOP + 6;
const FILL_TAP_X = 2;
const DRAIN_D = 3.2;
const DRAIN_Z = 10;
const DRAIN_TAP_Y = 10;
const DRAIN_RUN_Y = 40;
const DRAIN_END_X = -22;

// Clock plate (analogy front right; slides to the lever in the circuit).
const CLOCK: Rect = { x: 44, y: 51, w: 20, d: 4, r: 0.8 };
const CLOCK_H = 21;
const CLOCK_C: Vec3 = [CLOCK.x + CLOCK.w / 2, CLOCK.y + CLOCK.d + 0.1, 11];
const DIAL_R = 7.4;
const CLOCK_TO: Vec2 = [-56, -22]; // circuit position of the plate's centre foot (behind the lever)

// Circuit.
const COL = -20; // left of the tank's line of sight, so no valve or strap hides behind it
const VDD_Y = -84;
const GND_Y = 52;
const RAIL_D = 5;
const RAIL_X0 = -50;
const RAIL_X1 = 44;
const VDD_X1 = -6; // VDD stops short of the tank (nothing behind it)
const VALVE = { unit: 10, d: 10, h: 5, w: 1.4 };
const PY = -58;
const NY = 4;
const NODE_Y = TANK_CY;
const PIN_X = -34;
const LEVER = { x: -50, y: 20, pivotZ: 5, len: 13 };

const corners: Vec3[] = [
  ...boxCorners(BOARD_A, -SLAB_H, 0),
  ...boxCorners(BOARD_C, -SLAB_H, 0),
  ...boxCorners(TROUGH, 0, TOP + RISER_UP + 3),
  ...boxCorners(SUMP, 0, TOP + RISER_UP + 3),
];
const unit: View = fitView(corners, STAGE_W, 10000, { pad: PAD, azimuth: AZIMUTH });
const ys = corners.map((p) => project(p, unit)[1]);
export const STAGE_H = Math.ceil(Math.max(...ys) - Math.min(...ys) + PAD * 2);
export const view = fitView(corners, STAGE_W, STAGE_H, { pad: PAD, azimuth: AZIMUTH });
export const at = (p: Vec3) => project(p, view);
const P = (pts: Vec3[], close = false) => pathD(pts.map(at), close);
export const K = Math.sqrt(1.6) * view.scale; // stage px per board unit (roughly)
const r3 = (v: number) => Math.round(v * 1e3) / 1e3;
// Text standing in a front plane (constant y), reading along +x, baseline centred at height z.
const frontText = (x: number, y: number, z: number, size: number) => {
  const p: Vec3 = [x, y, z - size * 0.36];
  const o = at(p);
  const ax = at([p[0] + 1, p[1], p[2]]);
  const az = at([p[0], p[1], p[2] - 1]);
  return `matrix(${r3(ax[0] - o[0])} ${r3(ax[1] - o[1])} ${r3(az[0] - o[0])} ${r3(az[1] - o[1])} ${r3(o[0])} ${r3(o[1])})`;
};
const fRect = (y: number, x0: number, x1: number, z0: number, z1: number) => P([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], true);
const grow = (r: Rect, by: number): Rect => inset(r, -by);
const sq = (cx: number, cy: number, hw: number): Rect => ({ x: cx - hw, y: cy - hw, w: hw * 2, d: hw * 2, r: 0.6 });
const face = (x: number, y: number) => faceMatrix([x, y], 0, view, "x");
const pipeX = (x0: number, x1: number, y: number, zc: number, d: number) => prism({ x: Math.min(x0, x1), y: y - d / 2, w: Math.abs(x1 - x0), d, r: 0.4 }, zc - d / 2, d, view, 2, 0.2);
const pipeY = (y0: number, y1: number, x: number, zc: number, d: number) => prism({ x: x - d / 2, y: Math.min(y0, y1), w: d, d: Math.abs(y1 - y0), r: 0.4 }, zc - d / 2, d, view, 2, 0.2);
// Screen shift for a lift dz (the tower's upper parts follow its height).
export const shiftZ = (dz: number) => translateTo(view, [0, 0, dz]);

// A tap on a pipe: body block round the pipe, stem, wheel and a handle bar (rebuilt as it turns). Closed = across.
function tapParts(x: number, y: number, zc: number, axis: "x" | "y") {
  const size = 6;
  const wheelR = 4;
  const top = zc + size / 2;
  const z = top + 4.2;
  const L = wheelR + 1.6;
  const bar = (open: number) => {
    const b = (axis === "x" ? Math.PI / 2 : 0) - (open * Math.PI) / 2;
    return P([[x - Math.cos(b) * L, y - Math.sin(b) * L, z], [x + Math.cos(b) * L, y + Math.sin(b) * L, z]]);
  };
  return {
    body: prism({ x: x - size / 2, y: y - size / 2, w: size, d: size, r: 0.8 }, zc - size / 2, size, view, 3, 0.4),
    stem: cylinder(x, y, 0.8, top, 2.4, view, 12),
    wheel: cylinder(x, y, wheelR, top + 2.4, 1.2, view, 28, 0.3),
    bar,
    at: [x, y, zc] as Vec3,
  };
}

export const ENGRAVE = "ROLLIN-रोलिन-ROLLIN-रोलिन";
export const ENGRAVE_SIZE = 3.6;

// Board for fold progress m (0 square, 1 long).
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export function boardAt(m: number) {
  const r: Rect = { x: lerp(BOARD_A.x, BOARD_C.x, m), y: lerp(BOARD_A.y, BOARD_C.y, m), w: lerp(BOARD_A.w, BOARD_C.w, m), d: lerp(BOARD_A.d, BOARD_C.d, m), r: 5 };
  return {
    halo: prismFill(r, -SLAB_H, SLAB_H, view),
    slab: prism(r, -SLAB_H, SLAB_H, view, 5, 0.8),
    groove: flatRect(inset(r, 3), 0, view),
    screws: rectCorners(r, 5).map(([x, y]) => at([x, y, 0])),
    engraveAt: frontText(r.x + r.w / 2, r.y + r.d, -SLAB_H / 2, ENGRAVE_SIZE),
  };
}

// ---------- Water tower ----------

// Stand at top height T: section k runs up to min(k marks, T); sections nested inside a wider one are not drawn.
export function standAt(T: number) {
  const tops = HALF_W.map((_, i) => Math.min((i + 1) * MARK, T));
  return HALF_W.map((hw, i) => {
    const z0 = i === 0 ? PLINTH_H : tops[i - 1];
    const z1 = tops[i];
    const h = z1 - z0;
    return {
      body: h > 0.3 ? prism(sq(TW.x, TW.y, hw), z0, h, view, 3, 0.3) : null,
      collar: h > 0.3 ? prism(sq(TW.x, TW.y, hw + 1.2), z1 - 1.2, 1.2, view, 3, 0.2) : null,
      markAt: frontText(TW.x, TW.y + hw + 0.1, z1 - 6.5, 4.4),
      markShow: Math.min(1, Math.max(0, (h - 7) / 3)),
    };
  });
}
const LAD_X = TW.x + HALF_W[0] + 3;
export function ladderAt(T: number) {
  const rails = P([[LAD_X, TW.y - 3, PLINTH_H], [LAD_X, TW.y - 3, T]]) + P([[LAD_X, TW.y + 3, PLINTH_H], [LAD_X, TW.y + 3, T]]);
  const rungs: string[] = [];
  for (let z = PLINTH_H + 3; z < T - 1; z += 4) rungs.push(P([[LAD_X, TW.y - 3, z], [LAD_X, TW.y + 3, z]]));
  const arms = P([[LAD_X, TW.y, T - 6], [TW.x + HALF_W[0], TW.y, T - 6]]) + P([[LAD_X, TW.y, Math.min(T - 12, MARK * 2 - 4)], [TW.x + HALF_W[0], TW.y, Math.min(T - 12, MARK * 2 - 4)]]);
  return { rails: rails + arms, rungs: rungs.join("") };
}
export const tower = {
  plinth: prism(PLINTH, 0, PLINTH_H, view, 3, 0.4),
  plate: fRect(PLINTH.y + PLINTH.d + 0.1, PLINTH.x + 5, PLINTH.x + PLINTH.w - 5, 0.5, PLINTH_H - 0.5),
  plateRivets: [PLINTH.x + 6.2, PLINTH.x + PLINTH.w - 6.2].map((x) => at([x, PLINTH.y + PLINTH.d + 0.1, PLINTH_H / 2])),
  brandAt: frontText(PLINTH.x + PLINTH.w / 2, PLINTH.y + PLINTH.d + 0.15, PLINTH_H / 2, 3),
  // Upper parts at full height (shifted by shiftZ(T - TOP)).
  struts: P([[TW.x - HALF_W[3], TW.y + HALF_W[3], TOP - 9], [TROUGH.x + 2, TROUGH.y + TROUGH.d - 1, TOP]]) + P([[TW.x + HALF_W[3], TW.y + HALF_W[3], TOP - 9], [TROUGH.x + TROUGH.w - 2, TROUGH.y + TROUGH.d - 1, TOP]]),
  floor: prism(grow(TROUGH, 0.8), TOP - 1.4, 1.4, view, 3, 0.2),
  trough: prism(TROUGH, TOP, TROUGH_H, view, 4, 0.3),
  rim: flatRect(TROUGH, TOP + TROUGH_H, view, 4),
  glow: prism(grow(TROUGH, 1), TOP - 1.4, TROUGH_H + 2.4, view, 4, 0.3).outline,
};
export const BRAND_SIZE = 3;
export const TROUGH_BOX = { rect: TROUGH, level: TROUGH_LEVEL * TROUGH_H, shift: translateTo(view, [0, 0, TOP]) };

export const sump = {
  basin: prism(SUMP, 0, SUMP_H, view, 4, 0.3),
  pump: prism(PUMP, 0, PUMP_H, view, 3, 0.5),
  motor: cylinder(PUMP_C[0], PUMP_C[1], 3.4, PUMP_H, 4, view, 22, 0.4),
  fins: [PUMP.x + 3, PUMP.x + 6.5, PUMP.x + 10].map((x) => P([[x, PUMP.y + PUMP.d + 0.1, PUMP_H - 9], [x, PUMP.y + PUMP.d + 0.1, PUMP_H - 3]])).join(""),
};
export const SUMP_BOX = { rect: SUMP, level: SUMP_LEVEL * SUMP_H };

// Riser: up from the pump's motor (rebuilt with the height), back along -y over the trough, down a short spout.
export const riserUp = (T: number) => cylinder(PUMP_C[0], PUMP_C[1], RISER_D / 2, PUMP_H + 4, T + RISER_UP - PUMP_H - 4 + RISER_D / 2, view, 16, 0.2);
export const riser = {
  run: pipeY(PUMP_C[1] + RISER_D / 2, TW.y - RISER_D / 2, PUMP_C[0], TOP + RISER_UP, RISER_D),
  spout: cylinder(PUMP_C[0], TW.y, RISER_D / 2 + 0.3, TOP + TROUGH_H - 2, RISER_UP - TROUGH_H + 2, view, 16, 0.2),
};
// Pump flow: up the riser, back over the trough, down into it.
export const riserFlow = (T: number) => P([[PUMP_C[0], PUMP_C[1], PUMP_H + 4], [PUMP_C[0], PUMP_C[1], T + RISER_UP], [PUMP_C[0], TW.y, T + RISER_UP], [PUMP_C[0], TW.y, T + TROUGH_H - 2]]);
// Height bracket beside the riser: 0 to T with a tick at every mark reached.
export function heightBracket(T: number) {
  const x = PUMP.x - 4;
  const y = PUMP_C[1];
  let d = P([[x + 2, y, 0.3], [x, y, 0.3], [x, y, T], [x + 2, y, T]]);
  for (let z = MARK; z < T - 0.5; z += MARK) d += P([[x, y, z], [x + 1.4, y, z]]);
  return d;
}

// ---------- Glass tank, top and bottom taps ----------

const topTap = tapParts(FILL_TAP_X, FILL_Y, FILL_Z, "x");
const bottomTap = tapParts(TANK_CX, DRAIN_TAP_Y, DRAIN_Z, "y");
export const taps = { top: topTap, bottom: bottomTap };

export const fill = {
  run: [pipeX(TROUGH.x + TROUGH.w, FILL_TAP_X - 3, FILL_Y, FILL_Z, FILL_D), pipeX(FILL_TAP_X + 3, TANK_CX + FILL_D / 2, FILL_Y, FILL_Z, FILL_D)],
  spout: cylinder(TANK_CX, FILL_Y, FILL_D / 2 + 0.3, TOP + 1, FILL_Z - TOP - 1, view, 16, 0.2),
  flow: P([[TROUGH.x + TROUGH.w, FILL_Y, FILL_Z], [TANK_CX, FILL_Y, FILL_Z], [TANK_CX, FILL_Y, TOP + 1]]),
};
// Falling stream from the spout (at tower height T) to the tank's water surface.
export const fillStream = (T: number, level: number) => P([[TANK_CX, FILL_Y, T + 1], [TANK_CX, FILL_Y, Math.min(T + 0.5, level * TOP + 0.3)]]);

export const tank = {
  glass: prism(TANK, 0, TOP, view, 10, 0.4),
  back: P([[TANK.x, TANK.y, TOP], [TANK.x, TANK.y, 0], [TANK.x + TANK.w, TANK.y, 0]]) + P([[TANK.x, TANK.y, 0], [TANK.x, TANK_FRONT, 0]]),
  shine: P([[TANK.x + 10, TANK_FRONT + 0.1, TOP - 6], [TANK.x + 13, TANK_FRONT + 0.1, TOP - 22]]) + P([[TANK.x + 14.5, TANK_FRONT + 0.1, TOP - 8], [TANK.x + 15.8, TANK_FRONT + 0.1, TOP - 15]]),
  ticks: Array.from({ length: MARKS }, (_, i) => (i + 1) * MARK)
    .map((z) => P([[TANK.x + 0.5, TANK_FRONT + 0.1, z], [TANK.x + 7, TANK_FRONT + 0.1, z]]) + P([[TANK.x + TANK.w - 7, TANK_FRONT + 0.1, z], [TANK.x + TANK.w - 0.5, TANK_FRONT + 0.1, z]]))
    .join(""),
  marks: Array.from({ length: MARKS }, (_, i) => ({ n: i + 1, at: frontText(TANK.x + 3.6, TANK_FRONT + 0.15, (i + 1) * MARK - 4, 4.4) })),
  outline: prism(TANK, 0, TOP, view, 10, 0.4).outline,
  glow: prism(grow(TANK, 1), 0, TOP + 1, view, 10, 0.4).outline,
};
export const TANK_BOX = { rect: TANK, h: TOP };
// Supply line on the tank (dashed ring at height v) and a bracket on its front face, 0 to v.
export const tankLine = (v: number) => flatRect(grow(TANK, 0.8), Math.max(0.3, v * TOP), view, 10);
export const tankBracket = (v: number) => {
  const x = TANK.x + TANK.w + 2;
  const z = Math.max(0.5, v * TOP);
  return P([[x - 1.6, TANK_FRONT, 0.3], [x, TANK_FRONT, 0.3], [x, TANK_FRONT, z], [x - 1.6, TANK_FRONT, z]]);
};
// Analogy level line: tower trough floor (mark 4) to the tank's mark 4.
export const levelLine = P([[TROUGH.x + TROUGH.w, TROUGH.y + TROUGH.d, TOP], [TANK.x, TANK_FRONT, TOP]]);

export const drain = {
  out: [pipeY(TANK_FRONT - 0.5, DRAIN_TAP_Y - 3, TANK_CX, DRAIN_Z, DRAIN_D), pipeY(DRAIN_TAP_Y + 3, DRAIN_RUN_Y + DRAIN_D / 2, TANK_CX, DRAIN_Z, DRAIN_D)],
  run: pipeX(TANK_CX + DRAIN_D / 2, DRAIN_END_X, DRAIN_RUN_Y, DRAIN_Z, DRAIN_D),
  spout: cylinder(DRAIN_END_X, DRAIN_RUN_Y, DRAIN_D / 2 + 0.3, SUMP_H - 1, DRAIN_Z - SUMP_H + 1, view, 16, 0.2),
  flow: P([[TANK_CX, TANK_FRONT, DRAIN_Z], [TANK_CX, DRAIN_RUN_Y, DRAIN_Z], [DRAIN_END_X, DRAIN_RUN_Y, DRAIN_Z], [DRAIN_END_X, DRAIN_RUN_Y, SUMP_H - 1]]),
  stream: P([[DRAIN_END_X, DRAIN_RUN_Y, SUMP_H - 1], [DRAIN_END_X, DRAIN_RUN_Y, SUMP_LEVEL * SUMP_H + 0.2]]),
};

// ---------- Clock ----------

const dialPt = (a: number, r: number): Vec3 => [CLOCK_C[0] + Math.sin(a) * r, CLOCK_C[1], CLOCK_C[2] + Math.cos(a) * r];
const circle = (r: number) => P(Array.from({ length: 48 }, (_, i) => dialPt((i / 48) * Math.PI * 2, r)), true);
export const clock = {
  foot: prism(grow({ ...CLOCK, y: CLOCK.y - 2, d: CLOCK.d + 4 }, 0.6), 0, 2, view, 3, 0.3),
  plate: prism(CLOCK, 2, CLOCK_H - 2, view, 3, 0.4),
  dial: circle(DIAL_R),
  bezel: circle(DIAL_R + 1.2),
  glow: circle(DIAL_R + 2.8),
  ticks: Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return P([dialPt(a, DIAL_R - (i % 3 === 0 ? 2 : 1.1)), dialPt(a, DIAL_R - 0.3)]);
  }).join(""),
  hub: at(CLOCK_C),
};
export const clockHand = (a: number) => P([dialPt(a + Math.PI, 1.4), dialPt(a, DIAL_R - 2)]);
const CLOCK_FOOT: Vec3 = [CLOCK.x + CLOCK.w / 2, CLOCK.y + CLOCK.d / 2, 0];
export const clockMove = (m: number) => {
  const a = at(CLOCK_FOOT);
  const b = at([CLOCK_TO[0], CLOCK_TO[1], 0]);
  return `translate(${r3((b[0] - a[0]) * m)} ${r3((b[1] - a[1]) * m)})`;
};

// ---------- Fold and ghost transforms ----------

// Melt a group drawn around `from` toward `to`: slide, shrink and (flat) squash to a thin strip.
export function melt(from: Vec3, to: Vec3, k: number, flat: boolean) {
  const a = at(from);
  const b = at(to);
  const sx = 1 - 0.25 * k;
  const sy = flat ? 1 - 0.92 * k : 1 - 0.25 * k;
  const tx = a[0] + (b[0] - a[0]) * k;
  const ty = a[1] + (b[1] - a[1]) * k;
  return `translate(${r3(tx)} ${r3(ty)}) scale(${r3(sx)} ${r3(sy)}) translate(${r3(-a[0])} ${r3(-a[1])})`;
}
export const FOLD_POINTS = {
  tower: { from: [TW.x, TW.y, 0] as Vec3, to: [TW.x, VDD_Y, 0] as Vec3 },
  sump: { from: [SUMP.x + SUMP.w / 2, SUMP.y + SUMP.d, 0] as Vec3, to: [SUMP.x + SUMP.w / 2, GND_Y + RAIL_D / 2, 0] as Vec3 },
  tank: { from: [TANK_CX, TANK_CY, 0] as Vec3, to: [TANK_CX, TANK_CY, 0] as Vec3 },
  top: { from: topTap.at, to: [COL, PY, 0] as Vec3 },
  bottom: { from: bottomTap.at, to: [COL, NY, 0] as Vec3 },
};
// Ghost outlines in the analogy positions (full tower height).
const fullStand = standAt(TOP);
export const ghosts = {
  tower: [tower.plinth.outline, ...fullStand.map((s) => s.body?.outline ?? ""), tower.trough.outline, sump.pump.outline, riserUp(TOP).outline, riser.run.outline].join(""),
  tank: prism(grow(TANK, 1.5), 0, TOP + 2, view, 10, 0.4).outline,
  top: [topTap.body.outline, topTap.wheel.outline].join(""),
  bottom: [bottomTap.body.outline, bottomTap.wheel.outline].join(""),
};

// ---------- Circuit ----------

const railRect = (y: number, x1 = RAIL_X1): Rect => ({ x: RAIL_X0, y: y - RAIL_D / 2, w: x1 - RAIL_X0, d: RAIL_D, r: 0.8 });
const strap = (y0: number, y1: number) => flatPath([[COL, y0], [COL, y1]], 0, view);
const TAG: Rect = { x: -53, y: VDD_Y - 7, w: 24, d: 1.6, r: 0.3 }; // left along the rail, clear of the tank
const OUT_TAG: Rect = { x: 2, y: TANK_FRONT + 6.4, w: 15, d: 1.6, r: 0.3 };
export const circuit = {
  vdd: prism(railRect(VDD_Y, VDD_X1), 0, 1.6, view, 2, 0.3),
  gnd: prism(railRect(GND_Y), 0, 1.6, view, 2, 0.3),
  vddGlow: prism(grow(railRect(VDD_Y, VDD_X1), 1.2), 0, 2.6, view, 2, 0.3).outline,
  vddLabel: face(BOARD_C.x + 3.5, VDD_Y + 2.4),
  gndLabel: face(BOARD_C.x + 3.5, GND_Y + 2.4),
  pLabel: face(-63, PY + 2.4),
  nLabel: face(-63, GND_Y - 7.5),
  tag: prism(TAG, 0, 10, view, 2, 0.3),
  tagGlow: prism(grow(TAG, 1), 0, 11, view, 2, 0.3).outline,
  tagText: frontText(TAG.x + TAG.w / 2, TAG.y + TAG.d + 0.1, 5, 6),
  outTag: prism(OUT_TAG, 0, 6, view, 2, 0.3),
  outText: frontText(OUT_TAG.x + OUT_TAG.w / 2, OUT_TAG.y + OUT_TAG.d + 0.1, 3, 4.2),
  charge: [strap(VDD_Y + RAIL_D / 2, PY - VALVE.d / 2), strap(PY + VALVE.d / 2, NODE_Y)],
  discharge: [strap(NODE_Y, NY - VALVE.d / 2), strap(NY + VALVE.d / 2, GND_Y - RAIL_D / 2)],
  bus: flatPath([[COL, NODE_Y], [TANK.x, NODE_Y]], 0, view),
  busRev: flatPath([[TANK.x, NODE_Y], [COL, NODE_Y]], 0, view),
  node: at([COL, NODE_Y, 0]),
  gate: flatPath([[LEVER.x + 8, LEVER.y], [PIN_X, LEVER.y]], 0, view) + flatPath([[PIN_X, PY], [PIN_X, LEVER.y]], 0, view),
  gateJunction: at([PIN_X, LEVER.y, 0]),
  clockLink: flatPath([[LEVER.x - 2, CLOCK_TO[1] + CLOCK.d / 2 + 2.6], [LEVER.x - 2, LEVER.y - 10]], 0, view),
  pins: [PY, NY].map((y) => ({ pin: cylinder(PIN_X, y, 1.4, 0, 7, view, 16), cap: cylinder(PIN_X, y, 2, 7, 1.2, view, 18, 0.3) })),
  bubble: flatCircle(PIN_X, PY, 3.1, 8.2, view, 20) + flatCircle(PIN_X, PY, 3.1, 7.2, view, 20),
};
// Valve on the column (body x-extent = VALVE.w * unit).
function valve(y: number) {
  const bw = VALVE.w * VALVE.unit;
  const body: Rect = { x: COL - bw / 2, y: y - VALVE.d / 2, w: bw, d: VALVE.d, r: 0.4 };
  const gate: Rect = { x: body.x - 1, y: y - 1.2, w: bw + 2, d: 2.4, r: 0.4 };
  const arm: Rect = { x: PIN_X, y: y - 0.9, w: body.x - PIN_X, d: 1.8, r: 0.3 };
  return {
    body: prism(body, 0, VALVE.h, view, 3, 0.4),
    gate: prism(gate, VALVE.h, 1.1, view, 2, 0.3),
    arm: prism(arm, 4.2, 1.2, view, 2),
    glow: prism(grow(body, 1.2), 0, VALVE.h + 1.4, view, 3, 0.4).outline,
  };
}
export const valves = { p: valve(PY), n: valve(NY) };

// Input lever: swings in y about its pivot; v = 0 back (mark 0), 1 front (mark 1).
const SWING = 0.6;
const angle = (v: number) => (2 * v - 1) * SWING;
const leverPoint = (v: number): Vec3 => [LEVER.x, LEVER.y + Math.sin(angle(v)) * LEVER.len, LEVER.pivotZ + Math.cos(angle(v)) * LEVER.len];
const tick = (v: number) => {
  const y = LEVER.y + Math.sin(angle(v)) * 7;
  return flatPath([[LEVER.x - 4.5, y], [LEVER.x + 4.5, y]], 4.05, view);
};
export const lever = {
  base: prism({ x: LEVER.x - 8, y: LEVER.y - 10, w: 16, d: 20, r: 1.2 }, 0, 4, view, 3, 0.4),
  slot: flatRect({ x: LEVER.x - 1.2, y: LEVER.y - 8.5, w: 2.4, d: 17, r: 1 }, 4, view, 3),
  ticks: tick(0) + tick(1),
  pivot: cylinder(LEVER.x, LEVER.y, 2.2, 4, 2, view, 18, 0.3),
  knob: cylinder(0, 0, 3, -1.5, 3.4, view, 22, 0.6),
  mark0: faceMatrix([LEVER.x + 5.2, LEVER.y - 3.6], 4.05, view, "x"),
  mark1: faceMatrix([LEVER.x + 5.2, LEVER.y + 8.2], 4.05, view, "x"),
};
export const leverRod = (v: number) => P([[LEVER.x, LEVER.y, LEVER.pivotZ], leverPoint(v)]);
export const knobAt = (v: number) => translateTo(view, leverPoint(v));

// Entrance spark points: tower plinth, sump, tank, clock foot.
export const contacts: Vec2[] = [...rectCorners(PLINTH), ...rectCorners(SUMP), ...rectCorners(TANK), ...rectCorners(CLOCK)].map(([x, y]) => at([x, y, 0]));

export const boxWater = (rect: Rect, level: number, amp: number, phase: number) => waterBox(rect, level, amp, 0, phase, view);
