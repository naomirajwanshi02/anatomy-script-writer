// Switching threshold as two taps (still sample): one board with a water rig. x runs right, y toward the viewer
// (front face +y), z up. Back left: a high supply tank on a four-leg stand (ROLLIN maker's plate on its front). A
// narrow fill pipe runs from it over to the fill tap and pours down into the glass output tank (on a plinth, half
// ring at 50 %). A wide drain pipe (2.5x) leaves the tank's front through the drain tap and pours into a drain basin.
// One handle at the left is linked by rods to both tap wheels.
import { boxCorners, cylinder, fitView, flatPath, flatRect, inset, pathD, prism, prismFill, project, rectCorners, translateTo, type Rect, type Vec2, type Vec3, type View } from "../../iso/iso-kit";
import { waterBox } from "../../iso/analogy/water";
import { DRAIN_OPEN, DRAIN_W, FILL_OPEN, FILL_W, HANDLE, LEVEL } from "./model";

export const STAGE_W = 600;
const AZIMUTH = 62;
const PAD = 6;

// Board.
export const BOARD: Rect = { x: -82, y: -66, w: 136, d: 130, r: 5 };
const SLAB_H = 6;

// Supply tank on its stand (back left).
const SUP: Rect = { x: -54, y: -62, w: 38, d: 22, r: 1.2 };
const STAND_H = 50;
const SUP_H = 16;
const SUP_LEVEL = 0.75;
// Glass output tank on a plinth (middle).
const OUT: Rect = { x: 8, y: -22, w: 30, d: 28, r: 1.2 };
const PLINTH_H = 14;
const OUT_H = 32;
const OUT_CX = OUT.x + OUT.w / 2;
// Fill pipe (narrow): out of the supply's right face, along x, then along y to a spout over the tank.
const FILL_Z = STAND_H + 4; // pipe centre
const FILL_Y0 = SUP.y + SUP.d / 2;
const FILL_TAP_Y = -34;
const SPOUT_Y = -12;
const SPOUT_Z = FILL_Z - 4;
// Drain pipe (wide): out of the tank's front face, along y, elbow down into the basin.
const DRAIN_Z = PLINTH_H + 0.5 + DRAIN_W / 2; // pipe centre
const DRAIN_TAP_Y = 20;
const ELBOW_Y = 44;
const ELBOW_Z = 8;
const BASIN: Rect = { x: 8, y: 36, w: 30, d: 22, r: 1.2 };
const BASIN_H = 4;
const BASIN_LEVEL = 0.4;
// Handle (lever) at the left.
const LEVER = { x: -66, y: -6, pivotZ: 7, len: 20 };

const corners: Vec3[] = [...boxCorners(BOARD, -SLAB_H, 0), ...boxCorners(SUP, 0, STAND_H + SUP_H + 1), [LEVER.x, FILL_TAP_Y, FILL_Z + 8]];
// Width-fitted view, then the stage height that the scene needs.
const unit: View = fitView(corners, STAGE_W, 10000, { pad: PAD, azimuth: AZIMUTH });
const ys = corners.map((p) => project(p, unit)[1]);
export const STAGE_H = Math.ceil(Math.max(...ys) - Math.min(...ys) + PAD * 2);
export const view = fitView(corners, STAGE_W, STAGE_H, { pad: PAD, azimuth: AZIMUTH });
const at = (p: Vec3) => project(p, view);
const P = (pts: Vec3[], close = false) => pathD(pts.map(at), close);
const K = Math.sqrt(1.6) * view.scale; // stage px per board unit (roughly)
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

const pipeX = (x0: number, x1: number, y: number, zc: number, d: number) => prism({ x: Math.min(x0, x1), y: y - d / 2, w: Math.abs(x1 - x0), d, r: 0.4 }, zc - d / 2, d, view, 2, 0.2);
const pipeY = (y0: number, y1: number, x: number, zc: number, d: number) => prism({ x: x - d / 2, y: Math.min(y0, y1), w: d, d: Math.abs(y1 - y0), r: 0.4 }, zc - d / 2, d, view, 2, 0.2);

// A tap on a pipe: body block round the pipe, stem, wheel, and a handle bar turned by `open` (0 across, 1 along).
function tap(x: number, y: number, zc: number, size: number, wheelR: number, open: number) {
  const body = prism({ x: x - size / 2, y: y - size / 2, w: size, d: size, r: 0.8 }, zc - size / 2, size, view, 3, 0.4);
  const top = zc + size / 2;
  const stem = cylinder(x, y, 0.8, top, 2, view, 12);
  const wheel = cylinder(x, y, wheelR, top + 2, 1, view, 28, 0.3);
  const z = top + 3.6;
  const a = (open * Math.PI) / 2;
  const bar = (b: number) => P([[x - Math.cos(b) * (wheelR + 1.4), y - Math.sin(b) * (wheelR + 1.4), z], [x + Math.cos(b) * (wheelR + 1.4), y + Math.sin(b) * (wheelR + 1.4), z]]);
  return { body, stem, wheel, handle: bar(Math.PI / 2 - a), hub: at([x, y, z]), z };
}

const fillTap = tap(OUT_CX, FILL_TAP_Y, FILL_Z, 6, 3.6, FILL_OPEN);
const drainTap = tap(OUT_CX, DRAIN_TAP_Y, DRAIN_Z, DRAIN_W + 3, 4.2, DRAIN_OPEN);

export const ENGRAVE = "ROLLIN-रोलिन-ROLLIN-रोलिन";
export const ENGRAVE_SIZE = 3.6;

export const board = {
  halo: prismFill(BOARD, -SLAB_H, SLAB_H, view),
  slab: prism(BOARD, -SLAB_H, SLAB_H, view, 5, 0.8),
  groove: flatRect(inset(BOARD, 3), 0, view),
  screws: rectCorners(BOARD, 5).map(([x, y]) => at([x, y, 0])),
  engraveAt: frontText(BOARD.x + BOARD.w / 2, BOARD.y + BOARD.d, -SLAB_H / 2, ENGRAVE_SIZE),
};

const legs = rectCorners(SUP, 2.2);
export const supply = {
  backLegs: legs.slice(0, 2).map(([x, y]) => cylinder(x, y, 1.4, 0, STAND_H - 2, view, 14)),
  frontLegs: legs.slice(2).map(([x, y]) => cylinder(x, y, 1.4, 0, STAND_H - 2, view, 14)),
  feet: legs.map(([x, y]) => cylinder(x, y, 2.4, 0, 1, view, 18, 0.2)),
  brace: fRect(SUP.y + SUP.d - 2.2, legs[2][0], legs[3][0], STAND_H * 0.42, STAND_H * 0.42 + 1.4),
  braceBack: fRect(SUP.y + 2.2, legs[0][0], legs[1][0], STAND_H * 0.42, STAND_H * 0.42 + 1.4),
  platform: prism(grow(SUP, 1), STAND_H - 2, 2, view, 3, 0.3),
  glass: prism(SUP, STAND_H, SUP_H, view, 4, 0.3),
  // Maker's plate on the front face, low on the tank.
  plate: fRect(SUP.y + SUP.d + 0.1, SUP.x + 9, SUP.x + SUP.w - 9, STAND_H + 2, STAND_H + 8),
  plateRivets: [SUP.x + 10.2, SUP.x + SUP.w - 10.2].map((x) => at([x, SUP.y + SUP.d + 0.1, STAND_H + 5])),
  brandAt: frontText(SUP.x + SUP.w / 2, SUP.y + SUP.d + 0.15, STAND_H + 5, 4.2),
};
export const BRAND_SIZE = 4.2;

export const fill = {
  run: [pipeX(SUP.x + SUP.w, OUT_CX + FILL_W / 2, FILL_Y0, FILL_Z, FILL_W)],
  down: [pipeY(FILL_Y0 - FILL_W / 2, FILL_TAP_Y - 2, OUT_CX, FILL_Z, FILL_W), pipeY(FILL_TAP_Y + 2, SPOUT_Y + FILL_W / 2, OUT_CX, FILL_Z, FILL_W)],
  spout: cylinder(OUT_CX, SPOUT_Y, FILL_W / 2 + 0.3, SPOUT_Z, FILL_Z - SPOUT_Z, view, 16, 0.2),
  tap: fillTap,
  // FILL tag: a small plate on a short arm left of the tap, in the tap body's front plane.
  tagArm: P([[OUT_CX - 3, FILL_TAP_Y + 3.1, FILL_Z + 1], [OUT_CX - 6, FILL_TAP_Y + 3.1, FILL_Z + 1]]),
  tag: fRect(FILL_TAP_Y + 3.1, OUT_CX - 23, OUT_CX - 6, FILL_Z - 2.6, FILL_Z + 4.6),
  tagText: frontText(OUT_CX - 14.5, FILL_TAP_Y + 3.15, FILL_Z + 1, 5),
};

export const out = {
  plinth: prism(grow(OUT, 1.6), 0, PLINTH_H, view, 3, 0.4),
  glass: prism(OUT, PLINTH_H, OUT_H, view, 10, 0.4),
  half: flatRect(OUT, PLINTH_H + OUT_H / 2, view, 10),
  halfTicks: [OUT.x + 3, OUT.x + OUT.w - 3].map((x) => P([[x, OUT.y + OUT.d, PLINTH_H + OUT_H / 2 - 1.4], [x, OUT.y + OUT.d, PLINTH_H + OUT_H / 2 + 1.4]])).join(""),
  halfText: frontText(OUT.x + 2.5, OUT.y + OUT.d + 0.1, PLINTH_H + OUT_H / 2 + 3.6, 4.2),
};

export const drain = {
  run: [pipeY(OUT.y + OUT.d - 0.5, DRAIN_TAP_Y - 4, OUT_CX, DRAIN_Z, DRAIN_W), pipeY(DRAIN_TAP_Y + 4, ELBOW_Y + DRAIN_W / 2, OUT_CX, DRAIN_Z, DRAIN_W)],
  elbow: cylinder(OUT_CX, ELBOW_Y, DRAIN_W / 2, ELBOW_Z, DRAIN_Z - DRAIN_W / 2 - ELBOW_Z + 0.2, view, 20, 0.2),
  tap: drainTap,
  basin: prism(BASIN, 0, BASIN_H, view, 4, 0.3),
  // DRAIN tag: a small plate on a short arm left of the tap, in the tap body's front plane.
  tagArm: P([[OUT_CX - 4, DRAIN_TAP_Y + 4.1, DRAIN_Z - 2], [OUT_CX - 7, DRAIN_TAP_Y + 4.1, DRAIN_Z - 2]]),
  tag: fRect(DRAIN_TAP_Y + 4.1, OUT_CX - 28, OUT_CX - 7, DRAIN_Z - 5.6, DRAIN_Z + 1.6),
  tagText: frontText(OUT_CX - 17.5, DRAIN_TAP_Y + 4.15, DRAIN_Z - 2, 5),
};

// Falling streams: a blue column (width follows the pipe) with drops running down it.
const SUP_Z_WATER = STAND_H + SUP_LEVEL * SUP_H;
export const OUT_Z_WATER = PLINTH_H + LEVEL * OUT_H;
export const streams = {
  fill: { d: P([[OUT_CX, SPOUT_Y, SPOUT_Z], [OUT_CX, SPOUT_Y, OUT_Z_WATER + 0.3]]), w: FILL_W * K * 0.9 },
  drain: { d: P([[OUT_CX, ELBOW_Y, ELBOW_Z], [OUT_CX, ELBOW_Y, BASIN_LEVEL * BASIN_H + 0.3]]), w: DRAIN_W * K * 0.9 },
};

// Water boxes (raised by their floor height with a translate).
export type Box = "supply" | "out" | "basin";
export const BOXES: Record<Box, { rect: Rect; z0: number; level: number; shift: string }> = {
  supply: { rect: SUP, z0: STAND_H, level: SUP_LEVEL * SUP_H, shift: translateTo(view, [0, 0, STAND_H]) },
  out: { rect: OUT, z0: PLINTH_H, level: LEVEL * OUT_H, shift: translateTo(view, [0, 0, PLINTH_H]) },
  basin: { rect: BASIN, z0: 0, level: BASIN_LEVEL * BASIN_H, shift: "" },
};
export const boxWater = (b: Box, amp: number, phase: number) => waterBox(BOXES[b].rect, BOXES[b].level, amp, 0, phase, view);
export const SUPPLY_TOP = SUP_Z_WATER;

// Handle: swings in y about its pivot. HANDLE 0 = back mark, 0.5 = middle (straight up), 1 = front mark.
const SWING = 0.6;
const angle = (h: number) => (2 * h - 1) * SWING;
const knobAt = (h: number): Vec3 => [LEVER.x, LEVER.y + Math.sin(angle(h)) * LEVER.len, LEVER.pivotZ + Math.cos(angle(h)) * LEVER.len];
const knob3 = knobAt(HANDLE);
const tick = (h: number, half: number) => {
  const y = LEVER.y + Math.sin(angle(h)) * 12;
  return flatPath([[LEVER.x - half, y], [LEVER.x + half, y]], 4.05, view);
};
export const lever = {
  base: prism({ x: LEVER.x - 8, y: LEVER.y - 9, w: 16, d: 18, r: 1.2 }, 0, 4, view, 3, 0.4),
  slot: flatRect({ x: LEVER.x - 1.2, y: LEVER.y - 7.5, w: 2.4, d: 15, r: 1 }, 4, view, 3),
  ticks: tick(0, 4.4) + tick(1, 4.4),
  midTick: tick(0.5, 5.6),
  pivot: cylinder(LEVER.x, LEVER.y, 2, 4, 2, view, 18, 0.3),
  rod: P([[LEVER.x, LEVER.y, LEVER.pivotZ], knob3]),
  knob: cylinder(0, 0, 2.6, -1.3, 3, view, 20, 0.6),
  knobAt: translateTo(view, knob3),
  };

// Link rods from the handle's knob to both tap wheels (axis-aligned runs, in open space).
const [kx, ky, kz] = knob3;
export const links = {
  fill: P([[kx, ky, kz], [kx + 12, ky, kz], [kx + 12, ky, fillTap.z], [OUT_CX, ky, fillTap.z], [OUT_CX, FILL_TAP_Y + 3.6, fillTap.z]]),
  drain: P([[kx, ky, kz], [kx, DRAIN_TAP_Y, kz], [kx, DRAIN_TAP_Y, drainTap.z], [OUT_CX - 4.2, DRAIN_TAP_Y, drainTap.z]]),
  joints: [at([kx, ky, kz]), at([kx + 12, ky, kz]), at([kx + 12, ky, fillTap.z]), at([OUT_CX, ky, fillTap.z]), at([kx, DRAIN_TAP_Y, kz]), at([kx, DRAIN_TAP_Y, drainTap.z]), fillTap.hub, drainTap.hub],
};

// Entrance spark points: handle base, stand feet, tank plinth, drain basin.
export const contacts: Vec2[] = [
  ...rectCorners({ x: LEVER.x - 8, y: LEVER.y - 9, w: 16, d: 18 }),
  ...legs,
  ...rectCorners(grow(OUT, 1.6)),
  ...rectCorners(BASIN),
].map(([x, y]) => at([x, y, 0]));
