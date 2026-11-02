// Lowering supply voltage as a water tower (still sample): one square board with a water rig. x runs right, y toward
// the viewer (front face +y), z up. Back left: a water tower (open trough on a telescopic stand, marks 1-4, ladder,
// ROLLIN maker's plate on its plinth). Front left: a low sump basin with a pump box; a riser pipe climbs from the pump
// and pours into the trough. Right: a tall glass tank (marks 1-4), fed by a top pipe and tap from the tower, drained by
// a bottom tap and pipe back to the sump. Front right: a clock dial on an upright plate.
import { boxCorners, cylinder, fitView, flatRect, inset, pathD, prism, prismFill, project, rectCorners, translateTo, type Rect, type Vec2, type Vec3, type View } from "../../iso/iso-kit";
import { waterBox } from "../../iso/analogy/water";
import { BOTTOM_OPEN, CLOCK_TICKS, MARKS, TOP_OPEN } from "./model";

export const STAGE_W = 600;
const AZIMUTH = 62;
const PAD = 6;

// Board (square).
export const BOARD: Rect = { x: -68, y: -64, w: 134, d: 130, r: 5 };
const SLAB_H = 6;
const BOARD_FRONT = BOARD.y + BOARD.d;

// One mark of height (tower stand and glass tank share it).
const MARK = 14;
const TOP = MARK * MARKS; // 56

// Water tower (back left): plinth, four telescopic sections, a collar at every mark, trough on top.
const TW = { x: -39, y: -30 };
const PLINTH: Rect = { x: -54, y: -42, w: 30, d: 24, r: 1.2 };
const PLINTH_H = 4;
const HALF_W = [8, 6.5, 5, 3.6];
const TROUGH: Rect = { x: -57, y: -39, w: 36, d: 18, r: 1.2 };
const TROUGH_H = 12;
const TROUGH_LEVEL = 0.72;

// Sump basin (front left) with the pump box standing in it.
const SUMP: Rect = { x: -62, y: 20, w: 48, d: 34, r: 1.2 };
const SUMP_H = 7;
const SUMP_LEVEL = 0.55;
const PUMP: Rect = { x: -58, y: 24, w: 13, d: 11, r: 1 };
const PUMP_H = 15;
const PUMP_C: Vec2 = [PUMP.x + PUMP.w / 2, PUMP.y + PUMP.d / 2];

// Glass tank (right), standing on the board.
const TANK: Rect = { x: 18, y: -40, w: 28, d: 24, r: 1.2 };
const TANK_CX = TANK.x + TANK.w / 2;
const TANK_FRONT = TANK.y + TANK.d;

// Pipes.
const RISER_D = 3.2;
const RISER_TOP = TOP + TROUGH_H + 8; // run height above the trough rim
const FILL_D = 3.2;
const FILL_Y = -30;
const FILL_Z = TOP + 6; // pipe centre, out of the trough's right face
const FILL_TAP_X = 2;
const DRAIN_D = 3.2;
const DRAIN_Z = 10; // pipe centre, out of the tank's front face
const DRAIN_TAP_Y = 10;
const DRAIN_RUN_Y = 40;
const DRAIN_END_X = -22;

// Clock plate (front right).
const CLOCK: Rect = { x: 44, y: 51, w: 20, d: 4, r: 0.8 };
const CLOCK_H = 21;
const CLOCK_C: Vec3 = [CLOCK.x + CLOCK.w / 2, CLOCK.y + CLOCK.d + 0.1, 11];
const DIAL_R = 7.4;

const corners: Vec3[] = [...boxCorners(BOARD, -SLAB_H, 0), ...boxCorners(TROUGH, 0, RISER_TOP + 3), ...boxCorners(SUMP, 0, RISER_TOP + 3)];
// Width-fitted view, then the stage height that the scene needs.
const unit: View = fitView(corners, STAGE_W, 10000, { pad: PAD, azimuth: AZIMUTH });
const ys = corners.map((p) => project(p, unit)[1]);
export const STAGE_H = Math.ceil(Math.max(...ys) - Math.min(...ys) + PAD * 2);
export const view = fitView(corners, STAGE_W, STAGE_H, { pad: PAD, azimuth: AZIMUTH });
const at = (p: Vec3) => project(p, view);
const P = (pts: Vec3[], close = false) => pathD(pts.map(at), close);
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

const pipeX = (x0: number, x1: number, y: number, zc: number, d: number) => prism({ x: Math.min(x0, x1), y: y - d / 2, w: Math.abs(x1 - x0), d, r: 0.4 }, zc - d / 2, d, view, 2, 0.2);
const pipeY = (y0: number, y1: number, x: number, zc: number, d: number) => prism({ x: x - d / 2, y: Math.min(y0, y1), w: d, d: Math.abs(y1 - y0), r: 0.4 }, zc - d / 2, d, view, 2, 0.2);

// A tap on a pipe: body block round the pipe, stem, wheel and a handle bar. Closed = bar across the pipe.
function tap(x: number, y: number, zc: number, size: number, wheelR: number, open: number, axis: "x" | "y") {
  const body = prism({ x: x - size / 2, y: y - size / 2, w: size, d: size, r: 0.8 }, zc - size / 2, size, view, 3, 0.4);
  const top = zc + size / 2;
  const stem = cylinder(x, y, 0.8, top, 2.4, view, 12);
  const wheel = cylinder(x, y, wheelR, top + 2.4, 1.2, view, 28, 0.3);
  const z = top + 4.2;
  const b = (axis === "x" ? Math.PI / 2 : 0) - (open * Math.PI) / 2;
  const L = wheelR + 1.6;
  const handle = P([[x - Math.cos(b) * L, y - Math.sin(b) * L, z], [x + Math.cos(b) * L, y + Math.sin(b) * L, z]]);
  return { body, stem, wheel, handle, hub: at([x, y, z]), z };
}

export const ENGRAVE = "ROLLIN-रोलिन-ROLLIN-रोलिन";
export const ENGRAVE_SIZE = 3.6;

export const board = {
  halo: prismFill(BOARD, -SLAB_H, SLAB_H, view),
  slab: prism(BOARD, -SLAB_H, SLAB_H, view, 5, 0.8),
  groove: flatRect(inset(BOARD, 3), 0, view),
  screws: rectCorners(BOARD, 5).map(([x, y]) => at([x, y, 0])),
  engraveAt: frontText(BOARD.x + BOARD.w / 2, BOARD_FRONT, -SLAB_H / 2, ENGRAVE_SIZE),
};

// Tower stand: section k (1..4) runs from mark k-1 (or the plinth) up to mark k.
const sections = HALF_W.map((hw, i) => {
  const z0 = i === 0 ? PLINTH_H : i * MARK;
  return prism(sq(TW.x, TW.y, hw), z0, (i + 1) * MARK - z0, view, 3, 0.3);
});
const collars = HALF_W.map((hw, i) => prism(sq(TW.x, TW.y, hw + 1.2), (i + 1) * MARK - 1.2, 1.2, view, 3, 0.2));
// Ladder in the plane x = LAD_X (the visible +x side), rails at two y, rungs every 4 units.
const LAD_X = TW.x + HALF_W[0] + 3;
const LAD_Y0 = TW.y - 3;
const LAD_Y1 = TW.y + 3;
const rungs = Array.from({ length: Math.floor((TOP - PLINTH_H - 2) / 4) }, (_, i) => PLINTH_H + 3 + i * 4);
export const tower = {
  plinth: prism(PLINTH, 0, PLINTH_H, view, 3, 0.4),
  sections,
  collars,
  // Mark digits on each section's front face, just under its collar.
  marks: HALF_W.map((hw, i) => ({ n: i + 1, at: frontText(TW.x, TW.y + hw + 0.1, (i + 1) * MARK - 6.5, 4.4) })),
  ladder: P([[LAD_X, LAD_Y0, PLINTH_H], [LAD_X, LAD_Y0, TOP]]) + P([[LAD_X, LAD_Y1, PLINTH_H], [LAD_X, LAD_Y1, TOP]]),
  rungs: rungs.map((z) => P([[LAD_X, LAD_Y0, z], [LAD_X, LAD_Y1, z]])).join(""),
  ladderArms: P([[LAD_X, TW.y, TOP - 6], [TW.x + HALF_W[3], TW.y, TOP - 6]]) + P([[LAD_X, TW.y, MARK * 2 - 4], [TW.x + HALF_W[1], TW.y, MARK * 2 - 4]]),
  // Struts from the top section out to the trough's front corners.
  struts: P([[TW.x - HALF_W[3], TW.y + HALF_W[3], TOP - 9], [TROUGH.x + 2, TROUGH.y + TROUGH.d - 1, TOP]]) + P([[TW.x + HALF_W[3], TW.y + HALF_W[3], TOP - 9], [TROUGH.x + TROUGH.w - 2, TROUGH.y + TROUGH.d - 1, TOP]]),
  floor: prism(grow(TROUGH, 0.8), TOP - 1.4, 1.4, view, 3, 0.2),
  trough: prism(TROUGH, TOP, TROUGH_H, view, 4, 0.3),
  rim: flatRect(TROUGH, TOP + TROUGH_H, view, 4),
  // Maker's plate on the plinth front face.
  plate: fRect(PLINTH.y + PLINTH.d + 0.1, PLINTH.x + 5, PLINTH.x + PLINTH.w - 5, 0.5, PLINTH_H - 0.5),
  plateRivets: [PLINTH.x + 6.2, PLINTH.x + PLINTH.w - 6.2].map((x) => at([x, PLINTH.y + PLINTH.d + 0.1, PLINTH_H / 2])),
  brandAt: frontText(PLINTH.x + PLINTH.w / 2, PLINTH.y + PLINTH.d + 0.15, PLINTH_H / 2, 3),
};
export const BRAND_SIZE = 3;

export const sump = {
  basin: prism(SUMP, 0, SUMP_H, view, 4, 0.3),
  pump: prism(PUMP, 0, PUMP_H, view, 3, 0.5),
  motor: cylinder(PUMP_C[0], PUMP_C[1], 3.4, PUMP_H, 4, view, 22, 0.4),
  fins: [PUMP.x + 3, PUMP.x + 6.5, PUMP.x + 10].map((x) => P([[x, PUMP.y + PUMP.d + 0.1, PUMP_H - 9], [x, PUMP.y + PUMP.d + 0.1, PUMP_H - 3]])).join(""),
};

// Riser: up from the pump's motor, back along -y over the trough, then down a short spout.
export const riser = {
  up: cylinder(PUMP_C[0], PUMP_C[1], RISER_D / 2, PUMP_H + 4, RISER_TOP - PUMP_H - 4 + RISER_D / 2, view, 16, 0.2),
  run: pipeY(PUMP_C[1] + RISER_D / 2, TW.y - RISER_D / 2, PUMP_C[0], RISER_TOP, RISER_D),
  spout: cylinder(PUMP_C[0], TW.y, RISER_D / 2 + 0.3, TOP + TROUGH_H - 2, RISER_TOP - (TOP + TROUGH_H - 2), view, 16, 0.2),
};

const topTap = tap(FILL_TAP_X, FILL_Y, FILL_Z, 6, 4, TOP_OPEN, "x");
const bottomTap = tap(TANK_CX, DRAIN_TAP_Y, DRAIN_Z, 6, 4, BOTTOM_OPEN, "y");

// Top pipe: out of the trough's right face, along x over the tank, spout down into its open top.
export const fill = {
  run: [pipeX(TROUGH.x + TROUGH.w, FILL_TAP_X - 3, FILL_Y, FILL_Z, FILL_D), pipeX(FILL_TAP_X + 3, TANK_CX + FILL_D / 2, FILL_Y, FILL_Z, FILL_D)],
  spout: cylinder(TANK_CX, FILL_Y, FILL_D / 2 + 0.3, TOP + 1, FILL_Z - TOP - 1, view, 16, 0.2),
  tap: topTap,
};

export const tank = {
  glass: prism(TANK, 0, TOP, view, 10, 0.4),
  // Hidden edges seen through the glass: back vertical and the two back bottom edges.
  back: P([[TANK.x, TANK.y, TOP], [TANK.x, TANK.y, 0], [TANK.x + TANK.w, TANK.y, 0]]) + P([[TANK.x, TANK.y, 0], [TANK.x, TANK_FRONT, 0]]),
  // Shine: two slanted streaks on the front glass, right of the marks.
  shine: P([[TANK.x + 10, TANK_FRONT + 0.1, TOP - 6], [TANK.x + 13, TANK_FRONT + 0.1, TOP - 22]]) + P([[TANK.x + 14.5, TANK_FRONT + 0.1, TOP - 8], [TANK.x + 15.8, TANK_FRONT + 0.1, TOP - 15]]),
  ticks: Array.from({ length: MARKS }, (_, i) => (i + 1) * MARK)
    .map((z) => P([[TANK.x + 0.5, TANK_FRONT + 0.1, z], [TANK.x + 7, TANK_FRONT + 0.1, z]]) + P([[TANK.x + TANK.w - 7, TANK_FRONT + 0.1, z], [TANK.x + TANK.w - 0.5, TANK_FRONT + 0.1, z]]))
    .join(""),
  marks: Array.from({ length: MARKS }, (_, i) => ({ n: i + 1, at: frontText(TANK.x + 3.6, TANK_FRONT + 0.15, (i + 1) * MARK - 4, 4.4) })),
};

// Bottom pipe: out of the tank's front face, along y through the bottom tap, then along -x to the sump.
export const drain = {
  out: [pipeY(TANK_FRONT - 0.5, DRAIN_TAP_Y - 3, TANK_CX, DRAIN_Z, DRAIN_D), pipeY(DRAIN_TAP_Y + 3, DRAIN_RUN_Y + DRAIN_D / 2, TANK_CX, DRAIN_Z, DRAIN_D)],
  run: pipeX(TANK_CX + DRAIN_D / 2, DRAIN_END_X, DRAIN_RUN_Y, DRAIN_Z, DRAIN_D),
  spout: cylinder(DRAIN_END_X, DRAIN_RUN_Y, DRAIN_D / 2 + 0.3, SUMP_H - 1, DRAIN_Z - SUMP_H + 1, view, 16, 0.2),
  tap: bottomTap,
};

// Clock: upright plate on a foot, round dial on its front face, one hand.
const dialPt = (a: number, r: number): Vec3 => [CLOCK_C[0] + Math.sin(a) * r, CLOCK_C[1], CLOCK_C[2] + Math.cos(a) * r];
const circle = (r: number) => P(Array.from({ length: 48 }, (_, i) => dialPt((i / 48) * Math.PI * 2, r)), true);
const handA = (CLOCK_TICKS / 12) * Math.PI * 2;
export const clock = {
  foot: prism(grow({ ...CLOCK, y: CLOCK.y - 2, d: CLOCK.d + 4 }, 0.6), 0, 2, view, 3, 0.3),
  plate: prism(CLOCK, 2, CLOCK_H - 2, view, 3, 0.4),
  dial: circle(DIAL_R),
  bezel: circle(DIAL_R + 1.2),
  ticks: Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return P([dialPt(a, DIAL_R - (i % 3 === 0 ? 2 : 1.1)), dialPt(a, DIAL_R - 0.3)]);
  }).join(""),
  hand: P([dialPt(handA + Math.PI, 1.4), dialPt(handA, DIAL_R - 2)]),
  hub: at(CLOCK_C),
};

// Water boxes (raised by their floor height with a translate).
export type Box = "trough" | "sump";
export const BOXES: Record<Box, { rect: Rect; level: number; shift: string }> = {
  trough: { rect: TROUGH, level: TROUGH_LEVEL * TROUGH_H, shift: translateTo(view, [0, 0, TOP]) },
  sump: { rect: SUMP, level: SUMP_LEVEL * SUMP_H, shift: "" },
};
export const boxWater = (b: Box, amp: number, phase: number) => waterBox(BOXES[b].rect, BOXES[b].level, amp, 0, phase, view);

// Entrance spark points: tower plinth, sump, tank, clock foot.
export const contacts: Vec2[] = [...rectCorners(PLINTH), ...rectCorners(SUMP), ...rectCorners(TANK), ...rectCorners(CLOCK)].map(([x, y]) => at([x, y, 0]));
