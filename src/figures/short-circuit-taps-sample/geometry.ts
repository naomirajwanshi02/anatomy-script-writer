// Short-circuit power as two linked taps (still sample): two boards, one per panel. x runs right, y toward the viewer
// (front face +y), z up.
// Panel 1 (water): back left a high tank on a four-leg stand (ROLLIN maker's plate). Its fill pipe drops from the tank's
// floor through a round water meter (needle dial + two-drum "cups" counter), runs over to the fill tap and pours down
// into the glass tank (on a plinth). A drain pipe of the same width leaves the tank's front through the drain tap and
// pours into a floor drain grate at the board's front edge. One handle at the left is linked by rods to both tap wheels.
// Panel 2 (circuit): VDD rail at the back, GND rail at the front, input lever left, PMOS and NMOS valves in one column,
// output node joined to a glass output tank, and a glass-bulb lamp right of the tank.
import { boxCorners, cylinder, faceMatrix, fitView, flatCircle, flatPath, flatRect, inset, pathD, prism, prismFill, project, rectCorners, translateTo, type Rect, type Vec2, type Vec3, type View } from "../../iso/iso-kit";
import { waterBox } from "../../iso/analogy/water";
import { bulbParts } from "../../iso/react/bulb";
import { DRAIN_OPEN, FILL_OPEN, HANDLE, LEVEL, NEEDLE, PIPE_W, VIN, VOUT } from "./model";

export const STAGE_W = 600;
const AZIMUTH = 62;
const PAD = 6;
const r3 = (v: number) => Math.round(v * 1e3) / 1e3;
const grow = (r: Rect, by: number): Rect => inset(r, -by);

// Convex hull of screen points (monotone chain), for the meter body's silhouette.
function hull(pts: Vec2[]): Vec2[] {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: Vec2, a: Vec2, b: Vec2) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: Vec2[] = [];
  for (const q of p) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop();
    lower.push(q);
  }
  const upper: Vec2[] = [];
  for (const q of [...p].reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop();
    upper.push(q);
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

// Helpers bound to one view.
function kit(view: View) {
  const at = (p: Vec3) => project(p, view);
  const P = (pts: Vec3[], close = false) => pathD(pts.map(at), close);
  // Text standing in a front plane (constant y), reading along +x, baseline centred at height z.
  const frontText = (x: number, y: number, z: number, size: number) => {
    const p: Vec3 = [x, y, z - size * 0.36];
    const o = at(p);
    const ax = at([p[0] + 1, p[1], p[2]]);
    const az = at([p[0], p[1], p[2] - 1]);
    return `matrix(${r3(ax[0] - o[0])} ${r3(ax[1] - o[1])} ${r3(az[0] - o[0])} ${r3(az[1] - o[1])} ${r3(o[0])} ${r3(o[1])})`;
  };
  const fRect = (y: number, x0: number, x1: number, z0: number, z1: number) => P([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], true);
  const pipeX = (x0: number, x1: number, y: number, zc: number, d: number) => prism({ x: Math.min(x0, x1), y: y - d / 2, w: Math.abs(x1 - x0), d, r: 0.4 }, zc - d / 2, d, view, 2, 0.2);
  const pipeY = (y0: number, y1: number, x: number, zc: number, d: number) => prism({ x: x - d / 2, y: Math.min(y0, y1), w: d, d: Math.abs(y1 - y0), r: 0.4 }, zc - d / 2, d, view, 2, 0.2);
  const pipeZ = (x: number, y: number, z0: number, z1: number, d: number) => cylinder(x, y, d / 2, z0, z1 - z0, view, 16, 0.2);
  // Circle standing in a front plane (constant y).
  const frontCircle = (cx: number, y: number, cz: number, r: number, seg = 40) =>
    Array.from({ length: seg }, (_, i) => {
      const a = (i / seg) * Math.PI * 2;
      return at([cx + r * Math.cos(a), y, cz + r * Math.sin(a)]);
    });
  return { at, P, frontText, fRect, pipeX, pipeY, pipeZ, frontCircle };
}

export const ENGRAVE = "ROLLIN-रोलिन-ROLLIN-रोलिन";
export const ENGRAVE_SIZE = 3.6;

function boardParts(B: Rect, slab: number, view: View) {
  const { at, frontText } = kit(view);
  return {
    halo: prismFill(B, -slab, slab, view),
    slab: prism(B, -slab, slab, view, 5, 0.8),
    groove: flatRect(inset(B, 3), 0, view),
    screws: rectCorners(B, 5).map(([x, y]) => at([x, y, 0])),
    engraveAt: frontText(B.x + B.w / 2, B.y + B.d, -slab / 2, ENGRAVE_SIZE),
  };
}

// =====================================================================================================================
// Panel 1: water
// =====================================================================================================================

export const BOARD: Rect = { x: -82, y: -66, w: 136, d: 130, r: 5 };
const SLAB_H = 6;

// High tank on its stand (back left).
const SUP: Rect = { x: -58, y: -62, w: 40, d: 22, r: 1.2 };
const STAND_H = 76;
const SUP_H = 15;
const SUP_LEVEL = 0.75;
// Glass tank on a plinth (middle).
const OUT: Rect = { x: 8, y: -22, w: 30, d: 28, r: 1.2 };
const PLINTH_H = 14;
const OUT_H = 32;
const OUT_CX = OUT.x + OUT.w / 2;
// Fill pipe: drops from the tank floor at (DROP_X, DROP_Y) through the meter, runs along x at FILL_Z, then along y.
const FILL_Z = 54;
const DROP_X = -42;
const DROP_Y = -46.5;
const FILL_TAP_Y = -34;
const SPOUT_Y = -12;
const SPOUT_Z = FILL_Z - 4;
// Water meter on the drop: round body (axis along y), dial at the front, counter box to its right.
const MZ = (STAND_H + FILL_Z) / 2;
const M_R = 8.5;
const M_Y0 = DROP_Y - 1.5;
const M_Y1 = -39; // dial plane, in front of the stand's front legs
const CBOX = { x0: DROP_X + 7, x1: DROP_X + 22, z0: MZ - 7.4, z1: MZ + 4.6 };
// Drain pipe: out of the tank's front face, along y, elbow down into the grate.
const DRAIN_Z = PLINTH_H + 0.5 + PIPE_W / 2;
const DRAIN_TAP_Y = 20;
const ELBOW_Y = 51;
const ELBOW_Z = 8;
const GRATE: Rect = { x: OUT_CX - 12, y: 43, w: 24, d: 16, r: 1 };
// Handle (lever) at the left.
const LEVER = { x: -66, y: -6, pivotZ: 7, len: 20 };

const corners: Vec3[] = [...boxCorners(BOARD, -SLAB_H, 0), ...boxCorners(SUP, 0, STAND_H + SUP_H + 1)];
const unit: View = fitView(corners, STAGE_W, 10000, { pad: PAD, azimuth: AZIMUTH });
const ys = corners.map((p) => project(p, unit)[1]);
export const STAGE_H = Math.ceil(Math.max(...ys) - Math.min(...ys) + PAD * 2);
export const view = fitView(corners, STAGE_W, STAGE_H, { pad: PAD, azimuth: AZIMUTH });
const { at, P, frontText, fRect, pipeX, pipeY, pipeZ, frontCircle } = kit(view);
const K = Math.sqrt(1.6) * view.scale; // stage px per board unit (roughly)

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

const fillTap = tap(OUT_CX, FILL_TAP_Y, FILL_Z, 7, 3.8, FILL_OPEN);
const drainTap = tap(OUT_CX, DRAIN_TAP_Y, DRAIN_Z, PIPE_W + 4, 4.2, DRAIN_OPEN);

export const board = boardParts(BOARD, SLAB_H, view);

const legs = rectCorners(SUP, 2.2);
export const supply = {
  backLegs: legs.slice(0, 2).map(([x, y]) => cylinder(x, y, 1.4, 0, STAND_H - 2, view, 14)),
  frontLegs: legs.slice(2).map(([x, y]) => cylinder(x, y, 1.4, 0, STAND_H - 2, view, 14)),
  feet: legs.map(([x, y]) => cylinder(x, y, 2.4, 0, 1, view, 18, 0.2)),
  brace: fRect(SUP.y + SUP.d - 2.2, legs[2][0], legs[3][0], STAND_H * 0.36, STAND_H * 0.36 + 1.4),
  braceBack: fRect(SUP.y + 2.2, legs[0][0], legs[1][0], STAND_H * 0.36, STAND_H * 0.36 + 1.4),
  platform: prism(grow(SUP, 1), STAND_H - 2, 2, view, 3, 0.3),
  glass: prism(SUP, STAND_H, SUP_H, view, 4, 0.3),
  // Maker's plate on the front face of the tank.
  plate: fRect(SUP.y + SUP.d + 0.1, SUP.x + 10, SUP.x + SUP.w - 10, STAND_H + 3, STAND_H + 10),
  plateRivets: [SUP.x + 11.2, SUP.x + SUP.w - 11.2].map((x) => at([x, SUP.y + SUP.d + 0.1, STAND_H + 6.5])),
  brandAt: frontText(SUP.x + SUP.w / 2, SUP.y + SUP.d + 0.15, STAND_H + 6.5, 4.6),
};
export const BRAND_SIZE = 4.6;

export const fill = {
  // Drop above and below the meter, then the run (drawn behind the stand's front legs).
  dropTop: pipeZ(DROP_X, DROP_Y, MZ + M_R - 1, STAND_H, PIPE_W),
  dropLow: pipeZ(DROP_X, DROP_Y, FILL_Z - PIPE_W / 2, MZ - M_R + 1, PIPE_W),
  run: pipeX(DROP_X - PIPE_W / 2, OUT_CX + PIPE_W / 2, DROP_Y, FILL_Z, PIPE_W),
  down: [pipeY(DROP_Y + PIPE_W / 2, FILL_TAP_Y - 3.5, OUT_CX, FILL_Z, PIPE_W), pipeY(FILL_TAP_Y + 3.5, SPOUT_Y + PIPE_W / 2, OUT_CX, FILL_Z, PIPE_W)],
  spout: cylinder(OUT_CX, SPOUT_Y, PIPE_W / 2 + 0.3, SPOUT_Z, FILL_Z - SPOUT_Z, view, 16, 0.2),
  tap: fillTap,
  tagArm: P([[OUT_CX - 3.5, FILL_TAP_Y + 3.6, FILL_Z + 1], [OUT_CX - 6.5, FILL_TAP_Y + 3.6, FILL_Z + 1]]),
  tag: fRect(FILL_TAP_Y + 3.6, OUT_CX - 23.5, OUT_CX - 6.5, FILL_Z - 2.6, FILL_Z + 4.6),
  tagText: frontText(OUT_CX - 15, FILL_TAP_Y + 3.65, FILL_Z + 1, 5),
};

// Water meter: body silhouette (hull of back and front rims), dial disc, ticks, needle, hub; counter box with 2 drums.
const pd = (pts: Vec2[]) => pathD(pts, true);
const dialPoint = (u: number, r: number, turn = 0): Vec3 => {
  const a = ((225 - u * 270 + turn) * Math.PI) / 180;
  return [DROP_X + r * Math.cos(a), M_Y1 + 0.05, MZ + r * Math.sin(a)];
};
const cell = (i: number) => {
  const w = (CBOX.x1 - CBOX.x0 - 3) / 2;
  const x0 = CBOX.x0 + 1.5 + i * w;
  return { x0, x1: x0 + w, cx: x0 + w / 2 };
};
const DRUM_Z0 = MZ - 2.2;
const DRUM_Z1 = MZ + 3.4;
export const meter = {
  body: pd(hull([...frontCircle(DROP_X, M_Y0, MZ, M_R), ...frontCircle(DROP_X, M_Y1, MZ, M_R)])),
  rim: pd(frontCircle(DROP_X, M_Y1, MZ, M_R)),
  dial: pd(frontCircle(DROP_X, M_Y1 + 0.02, MZ, M_R - 1.3)),
  ticks: Array.from({ length: 9 }, (_, i) => P([dialPoint(i / 8, M_R - 2), dialPoint(i / 8, M_R - (i % 4 === 0 ? 4 : 3.1))])).join(""),
  needle: P([dialPoint(NEEDLE, 1.8, 180), dialPoint(NEEDLE, M_R - 2.6)]),
  hub: pd(frontCircle(DROP_X, M_Y1 + 0.1, MZ, 1.1, 16)),
  // Counter box: a block on the meter's right side (front plane = dial plane).
  box: prism({ x: CBOX.x0, y: M_Y0 + 1, w: CBOX.x1 - CBOX.x0, d: M_Y1 - M_Y0 - 1, r: 0.6 }, CBOX.z0, CBOX.z1 - CBOX.z0, view, 3, 0.3),
  window: fRect(M_Y1 + 0.05, cell(0).x0, cell(1).x1, DRUM_Z0, DRUM_Z1),
  drums: [0, 1].map((i) => fRect(M_Y1 + 0.08, cell(i).x0 + 0.25, cell(i).x1 - 0.25, DRUM_Z0 + 0.25, DRUM_Z1 - 0.25)),
  digitAt: [0, 1].map((i) => frontText(cell(i).cx, M_Y1 + 0.12, (DRUM_Z0 + DRUM_Z1) / 2, 4.4)),
  cupsAt: frontText((CBOX.x0 + CBOX.x1) / 2, M_Y1 + 0.1, MZ - 5, 3.4),
};
export const DIGIT_SIZE = 4.4;
export const CUPS_SIZE = 3.4;

export const out = {
  plinth: prism(grow(OUT, 1.6), 0, PLINTH_H, view, 3, 0.4),
  glass: prism(OUT, PLINTH_H, OUT_H, view, 10, 0.4),
};

export const drain = {
  run: [pipeY(OUT.y + OUT.d - 0.5, DRAIN_TAP_Y - 3.5, OUT_CX, DRAIN_Z, PIPE_W), pipeY(DRAIN_TAP_Y + 3.5, ELBOW_Y + PIPE_W / 2, OUT_CX, DRAIN_Z, PIPE_W)],
  elbow: cylinder(OUT_CX, ELBOW_Y, PIPE_W / 2, ELBOW_Z, DRAIN_Z - PIPE_W / 2 - ELBOW_Z + 0.2, view, 20, 0.2),
  tap: drainTap,
  tagArm: P([[OUT_CX - 3.5, DRAIN_TAP_Y + 3.6, DRAIN_Z - 2], [OUT_CX - 6.5, DRAIN_TAP_Y + 3.6, DRAIN_Z - 2]]),
  tag: fRect(DRAIN_TAP_Y + 3.6, OUT_CX - 27.5, OUT_CX - 6.5, DRAIN_Z - 5.6, DRAIN_Z + 1.6),
  tagText: frontText(OUT_CX - 17, DRAIN_TAP_Y + 3.65, DRAIN_Z - 2, 5),
};

// Floor drain grate at the board's front edge: a low frame with slots; a blue splash where the stream lands.
export const grate = {
  frame: prism(GRATE, 0, 0.9, view, 3, 0.2),
  slots: Array.from({ length: 6 }, (_, i) => {
    const x = GRATE.x + 3.5 + (i * (GRATE.w - 7)) / 5;
    return flatRect({ x: x - 0.8, y: GRATE.y + 3, w: 1.6, d: GRATE.d - 6, r: 0.6 }, 0.92, view, 2);
  }),
  splash: flatCircle(OUT_CX, ELBOW_Y, 3.2, 0.95, view, 24),
  splashRing: flatCircle(OUT_CX, ELBOW_Y, 5, 0.95, view, 28),
};

// Falling streams: a blue column (width follows the pipe) with drops running down it.
export const OUT_Z_WATER = PLINTH_H + LEVEL * OUT_H;
export const streams = {
  fill: { d: P([[OUT_CX, SPOUT_Y, SPOUT_Z], [OUT_CX, SPOUT_Y, OUT_Z_WATER + 0.3]]), w: PIPE_W * K * 0.9 },
  drain: { d: P([[OUT_CX, ELBOW_Y, ELBOW_Z], [OUT_CX, ELBOW_Y, 1]]), w: PIPE_W * K * 0.9 },
};

// Water boxes (raised by their floor height with a translate).
export type Box = "supply" | "out";
export const BOXES: Record<Box, { rect: Rect; level: number; shift: string }> = {
  supply: { rect: SUP, level: SUP_LEVEL * SUP_H, shift: translateTo(view, [0, 0, STAND_H]) },
  out: { rect: OUT, level: LEVEL * OUT_H, shift: translateTo(view, [0, 0, PLINTH_H]) },
};
export const boxWater = (b: Box, amp: number, phase: number) => waterBox(BOXES[b].rect, BOXES[b].level, amp, 0, phase, view);

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
  midTick: tick(0.5, 6.2),
  pivot: cylinder(LEVER.x, LEVER.y, 2, 4, 2, view, 18, 0.3),
  rod: P([[LEVER.x, LEVER.y, LEVER.pivotZ], knob3]),
  knob: cylinder(0, 0, 2.6, -1.3, 3, view, 20, 0.6),
  knobAt: translateTo(view, knob3),
};

// Link rods from the handle's knob to both tap wheels (axis-aligned runs, in open space).
const [kx, ky, kz] = knob3;
export const links = {
  fill: P([[kx, ky, kz], [kx + 12, ky, kz], [kx + 12, ky, fillTap.z], [OUT_CX, ky, fillTap.z], [OUT_CX, FILL_TAP_Y + 3.8, fillTap.z]]),
  drain: P([[kx, ky, kz], [kx, DRAIN_TAP_Y, kz], [kx, DRAIN_TAP_Y, drainTap.z], [OUT_CX - 4.2, DRAIN_TAP_Y, drainTap.z]]),
  joints: [at([kx, ky, kz]), at([kx + 12, ky, kz]), at([kx + 12, ky, fillTap.z]), at([OUT_CX, ky, fillTap.z]), at([kx, DRAIN_TAP_Y, kz]), at([kx, DRAIN_TAP_Y, drainTap.z]), fillTap.hub, drainTap.hub],
};

// Entrance spark points: handle base, stand feet, tank plinth, grate.
export const contacts: Vec2[] = [
  ...rectCorners({ x: LEVER.x - 8, y: LEVER.y - 9, w: 16, d: 18 }),
  ...legs,
  ...rectCorners(grow(OUT, 1.6)),
  ...rectCorners(GRATE),
].map(([x, y]) => at([x, y, 0]));

// =====================================================================================================================
// Panel 2: circuit (DE CMOS design language)
// =====================================================================================================================

export const BOARD2: Rect = { x: -72, y: -42, w: 150, d: 86, r: 5 };
const COL = -2; // valve column / straps
const VDD_Y = -32;
const GND_Y = 34;
const RAIL_D = 5;
const RAIL_X0 = BOARD2.x + 36;
const RAIL_X1 = BOARD2.x + BOARD2.w - 6;
const VALVE = { w: 20, d: 10, h: 5 };
const P_Y = -14;
const N_Y = 14;
const NODE_Y = 0;
const PIN_X = -22;
const LEV2 = { x: -52, y: 0, pivotZ: 7.5, len: 22 };
const OUT2: Rect = { x: 36, y: -8, w: 16, d: 16, r: 1.2 };
const PL2 = grow(OUT2, 1.6);
const PLINTH2_H = 4;
const OUT2_H = 26;
const LAMP_XY: Vec2 = [65, 0];

const corners2: Vec3[] = [...boxCorners(BOARD2, -SLAB_H, 0), [OUT2.x, OUT2.y, PLINTH2_H + OUT2_H + 1], [LAMP_XY[0], LAMP_XY[1], 24], [LEV2.x, LEV2.y, LEV2.pivotZ + LEV2.len + 3]];
const unit2: View = fitView(corners2, STAGE_W, 10000, { pad: PAD, azimuth: AZIMUTH });
const ys2 = corners2.map((p) => project(p, unit2)[1]);
export const STAGE2_H = Math.ceil(Math.max(...ys2) - Math.min(...ys2) + PAD * 2);
export const view2 = fitView(corners2, STAGE_W, STAGE2_H, { pad: PAD, azimuth: AZIMUTH });
const c = kit(view2);
const face2 = (x: number, y: number) => faceMatrix([x, y], 0, view2, "x");

export const board2 = boardParts(BOARD2, SLAB_H, view2);

const railRect = (y: number): Rect => ({ x: RAIL_X0, y: y - RAIL_D / 2, w: RAIL_X1 - RAIL_X0, d: RAIL_D, r: 0.8 });
const strap = (y0: number, y1: number) => flatPath([[COL, y0], [COL, y1]], 0, view2);
const valveParts = (y: number) => {
  const body: Rect = { x: COL - VALVE.w / 2, y: y - VALVE.d / 2, w: VALVE.w, d: VALVE.d, r: 0.4 };
  const gate: Rect = { x: body.x - 1, y: y - 1.3, w: VALVE.w + 2, d: 2.6, r: 0.4 };
  const arm: Rect = { x: PIN_X, y: y - 0.9, w: body.x - PIN_X, d: 1.8, r: 0.3 };
  return { body: prism(body, 0, VALVE.h, view2, 3, 0.4), gate: prism(gate, VALVE.h, 1.2, view2, 2, 0.3), arm: prism(arm, 4.2, 1.2, view2, 2) };
};
// Short-circuit path, VDD -> PMOS -> node -> NMOS -> GND (straps between the parts).
export const circuit = {
  vdd: prism(railRect(VDD_Y), 0, 1.6, view2, 2, 0.3),
  gnd: prism(railRect(GND_Y), 0, 1.6, view2, 2, 0.3),
  vddLabel: face2(BOARD2.x + 5, VDD_Y + 2.4),
  gndLabel: face2(BOARD2.x + 5, GND_Y + 2.4),
  pLabel: face2(COL + VALVE.w / 2 + 2.5, P_Y + 2.4),
  nLabel: face2(COL + VALVE.w / 2 + 2.5, N_Y + 2.4),
  path: [strap(VDD_Y + RAIL_D / 2, P_Y - VALVE.d / 2), strap(P_Y + VALVE.d / 2, NODE_Y), strap(NODE_Y, N_Y - VALVE.d / 2), strap(N_Y + VALVE.d / 2, GND_Y - RAIL_D / 2)],
  bus: flatPath([[COL, NODE_Y], [PL2.x, NODE_Y]], 0, view2),
  lampWire: flatPath([[PL2.x + PL2.w, NODE_Y], [LAMP_XY[0] - 6.2, NODE_Y]], 0, view2),
  node: c.at([COL, NODE_Y, 0]),
  gate: flatPath([[LEV2.x + 10, LEV2.y], [PIN_X, LEV2.y]], 0, view2) + flatPath([[PIN_X, P_Y], [PIN_X, N_Y]], 0, view2),
  gateJunction: c.at([PIN_X, LEV2.y, 0]),
  pins: [P_Y, N_Y].map((y) => ({ pin: cylinder(PIN_X, y, 1.4, 0, 7, view2, 16), cap: cylinder(PIN_X, y, 2, 7, 1.2, view2, 18, 0.3) })),
  bubble: flatCircle(PIN_X, P_Y, 3.1, 8.2, view2, 20) + flatCircle(PIN_X, P_Y, 3.1, 7.2, view2, 20),
  p: valveParts(P_Y),
  n: valveParts(N_Y),
};

const SWING2 = 0.6;
const angle2 = (h: number) => (2 * h - 1) * SWING2;
// Lever: h = Vin / VDD; 0 = knob pulled toward the viewer (front), 1 = pushed back. The knob sits part way.
const lev2Point = (h: number): Vec3 => [LEV2.x, LEV2.y - Math.sin(angle2(h)) * LEV2.len, LEV2.pivotZ + Math.cos(angle2(h)) * LEV2.len];
const tick2 = (h: number, half: number) => {
  const y = LEV2.y - Math.sin(angle2(h)) * 11;
  return flatPath([[LEV2.x - half, y], [LEV2.x + half, y]], 5.05, view2);
};
const knob2 = lev2Point(VIN);
export const lever2 = {
  base: prism({ x: LEV2.x - 10, y: LEV2.y - 13, w: 20, d: 26, r: 1.4 }, 0, 5, view2, 3, 0.4),
  slot: flatRect({ x: LEV2.x - 1.4, y: LEV2.y - 11, w: 2.8, d: 22, r: 1.2 }, 5, view2, 3),
  ticks: tick2(0, 6) + tick2(1, 6),
  pivot: cylinder(LEV2.x, LEV2.y, 2.8, 5, 2.5, view2, 18, 0.3),
  rod: c.P([[LEV2.x, LEV2.y, LEV2.pivotZ], knob2]),
  knob: cylinder(0, 0, 3.6, -1.8, 4, view2, 22, 0.6),
  knobAt: translateTo(view2, knob2),
  mark0: faceMatrix([LEV2.x + 6.6, LEV2.y + 9.4], 5.05, view2, "x"),
  mark1: faceMatrix([LEV2.x + 6.6, LEV2.y - 4], 5.05, view2, "x"),
  vinAt: face2(LEV2.x - 8, LEV2.y + 20),
};

export const out2 = {
  plinth: prism(PL2, 0, PLINTH2_H, view2, 3, 0.4),
  glass: prism(OUT2, PLINTH2_H, OUT2_H, view2, 10, 0.4),
  shift: translateTo(view2, [0, 0, PLINTH2_H]),
  water: (amp: number, phase: number) => waterBox(OUT2, VOUT * OUT2_H, amp, 0, phase, view2),
  voutAt: face2(OUT2.x - 1, OUT2.y + OUT2.d + 7),
};

export const lamp2 = bulbParts(LAMP_XY, view2, { baseR: 6.2, h: 6 });

export const contacts2: Vec2[] = [
  ...rectCorners({ x: LEV2.x - 10, y: LEV2.y - 13, w: 20, d: 26 }),
  ...rectCorners(PL2),
  LAMP_XY,
].map(([x, y]) => c.at([x, y, 0]));
