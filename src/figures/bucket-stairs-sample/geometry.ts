// Bucket stairs (still sample): one square board. x runs right, y toward the viewer (front face +y), z up.
// Left: a four-floor building (plinth, a window band per floor, slab lines, flat roof with coping, a door with the
// ROLLIN name plate beside it) with an outside staircase on its front face: one flight per floor, zig-zagging, with a
// landing at every floor and a handrail. Touching its right wall: a clear glass tank exactly as tall as the building,
// open at the top, marks 1-4 level with the floors, a spout from the roof edge over its rim and a drain tap at its
// foot. In front of the stair foot: Sam (flat 2D side profile, facing the stairs) and a row of four water buckets.
import { boxCorners, cylinder, fitView, flatPath, flatRect, inset, pathD, prism, prismFill, project, rectCorners, type Rect, type Vec2, type Vec3, type View } from "../../iso/iso-kit";
import { BUCKETS, FLOORS } from "./model";

export const STAGE_W = 600;
const AZIMUTH = 62;
const PAD = 6;

// Board (square).
export const BOARD: Rect = { x: -68, y: -64, w: 134, d: 130, r: 5 };
const SLAB_H = 6;
const BOARD_FRONT = BOARD.y + BOARD.d;

// One floor of height (building and tank share it).
const F = 24;
const TOP = F * FLOORS; // 96: roof top = tank rim

// Building.
const BLD: Rect = { x: -42, y: -28, w: 64, d: 34, r: 0.8 };
const BX0 = BLD.x;
const BX1 = BLD.x + BLD.w;
const FY = BLD.y + BLD.d; // facade plane
const COPING = 2.2;
const PLINTH = 3;

// Outside stairs: a band in front of the facade; landings at both ends, flights in between.
const SY0 = FY;
const SY1 = FY + 8;
const LW = 13;
const RX0 = BX0 + LW; // -29
const RX1 = BX1 - LW; // 1
const STEPS = 6; // steps per flight; the landing is the seventh rise
const RISE = F / (STEPS + 1);
const TREAD = (RX1 - RX0) / STEPS;
const RAIL = 7;

// Glass tank touching the building's right wall.
const TANK: Rect = { x: BX1, y: -24, w: 30, d: 26, r: 1.2 };
const TANK_FRONT = TANK.y + TANK.d;
const TANK_CX = TANK.x + TANK.w / 2;
const TANK_CY = TANK.y + TANK.d / 2;

// Sam and the buckets, in front of the stair foot.
export const SAM = { x: -55, y: SY1 + 14, s: 1.68 };
const BUCKET_R = 5.6;
const BUCKET_H = 9;
const BUCKET_Y = SY1 + 26;
const BUCKET_X = Array.from({ length: BUCKETS }, (_, i) => -34 + i * 14);

const corners: Vec3[] = [...boxCorners(BOARD, -SLAB_H, 0), ...boxCorners(BLD, 0, TOP + 6), ...boxCorners(TANK, 0, TOP + 6)];
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
const fLine = (y: number, pts: [number, number][]) => P(pts.map(([x, z]) => [x, y, z] as Vec3));
const pipeX = (x0: number, x1: number, y: number, zc: number, d: number) => prism({ x: Math.min(x0, x1), y: y - d / 2, w: Math.abs(x1 - x0), d, r: 0.4 }, zc - d / 2, d, view, 2, 0.2);
const pipeY = (y0: number, y1: number, x: number, zc: number, d: number) => prism({ x: x - d / 2, y: Math.min(y0, y1), w: d, d: Math.abs(y1 - y0), r: 0.4 }, zc - d / 2, d, view, 2, 0.2);

export const ENGRAVE = "ROLLIN-रोलिन-ROLLIN-रोलिन";
export const ENGRAVE_SIZE = 3.6;

export const board = {
  halo: prismFill(BOARD, -SLAB_H, SLAB_H, view),
  slab: prism(BOARD, -SLAB_H, SLAB_H, view, 5, 0.8),
  groove: flatRect(inset(BOARD, 3), 0, view),
  screws: rectCorners(BOARD, 5).map(([x, y]) => at([x, y, 0])),
  engraveAt: frontText(BOARD.x + BOARD.w / 2, BOARD_FRONT, -SLAB_H / 2, ENGRAVE_SIZE),
};

// Door (ground floor, at the stair foot) and the name plate over it.
const DOOR = { x0: BX0 + 3.5, x1: RX0 - 2.5, z1: 15 };
const PLATE = { x0: BX0 + 2, x1: RX0 - 1, z0: 16.6, z1: 21.8 };
export const BRAND_SIZE = 2.8;

// Window band per floor: frame, glass, mullions every ~6 units, a sill. The ground floor stops short of the plate.
const fy = FY + 0.05;
const bands = Array.from({ length: FLOORS }, (_, k) => {
  const z0 = k * F + 7;
  const z1 = k * F + 18;
  const x0 = k === 0 ? RX0 + 2 : BX0 + 3;
  const x1 = BX1 - 3;
  const n = Math.max(2, Math.round((x1 - x0) / 6.5));
  return {
    frame: fRect(fy, x0, x1, z0, z1),
    glass: fRect(fy + 0.02, x0 + 1, x1 - 1, z0 + 1, z1 - 1),
    mullions: Array.from({ length: n - 1 }, (_, i) => fLine(fy + 0.04, [[x0 + ((x1 - x0) * (i + 1)) / n, z0 + 1], [x0 + ((x1 - x0) * (i + 1)) / n, z1 - 1]])).join(""),
    shine: fLine(fy + 0.06, [[x0 + 2.5, z1 - 2.5], [x0 + 4.5, z0 + 2.5]]),
    sill: prism({ x: x0 - 1, y: FY, w: x1 - x0 + 2, d: 1.6, r: 0.3 }, z0 - 1.2, 1.2, view, 2, 0.1),
  };
});

export const building = {
  body: prism(BLD, 0, TOP - COPING, view, 3, 0.5),
  coping: prism(inset(BLD, -1), TOP - COPING, COPING, view, 3, 0.3),
  roof: flatRect(inset(BLD, 1.6), TOP, view, 3),
  plinth: fRect(fy, BX0, BX1, 0, PLINTH),
  // Floor slab lines on the facade and on the right wall (seen through the glass).
  slabs: Array.from({ length: FLOORS - 1 }, (_, k) => fRect(fy + 0.01, BX0, BX1, (k + 1) * F - 0.8, (k + 1) * F + 0.8)).join(""),
  sideSlabs: Array.from({ length: FLOORS - 1 }, (_, k) => P([[BX1 + 0.05, BLD.y, (k + 1) * F], [BX1 + 0.05, FY, (k + 1) * F]])).join(""),
  bands,
  door: fRect(fy + 0.02, DOOR.x0, DOOR.x1, PLINTH, DOOR.z1),
  doorPanel: fRect(fy + 0.04, DOOR.x0 + 1.3, DOOR.x1 - 1.3, PLINTH + 1.3, DOOR.z1 - 1.3),
  knob: at([DOOR.x0 + 1.6, fy + 0.06, PLINTH + 5]),
  step: prism({ x: DOOR.x0 - 1, y: FY, w: DOOR.x1 - DOOR.x0 + 2, d: 3, r: 0.3 }, 0, PLINTH, view, 2, 0.2),
  plate: fRect(fy + 0.08, PLATE.x0, PLATE.x1, PLATE.z0, PLATE.z1),
  plateRivets: [PLATE.x0 + 1, PLATE.x1 - 1].map((x) => at([x, fy + 0.1, (PLATE.z0 + PLATE.z1) / 2])),
  brandAt: frontText((PLATE.x0 + PLATE.x1) / 2, fy + 0.12, (PLATE.z0 + PLATE.z1) / 2, BRAND_SIZE),
};

// Stairs: flight k (1..4) rises from floor k-1 to floor k; odd flights run right, even ones left; the landing at the
// flight's top end sits at floor k. Steps are drawn in +x order so nearer steps cover farther ones.
const stairRect = (x0: number, x1: number): Rect => ({ x: x0, y: SY0, w: x1 - x0, d: SY1 - SY0, r: 0.3 });
const railY = SY1 - 0.6;
export const stairs = Array.from({ length: FLOORS }, (_, j) => {
  const k = j + 1;
  const zb = j * F;
  const right = k % 2 === 1;
  const steps = Array.from({ length: STEPS }, (_, s) => {
    const i = s + 1;
    const x0 = right ? RX0 + (i - 1) * TREAD : RX1 - i * TREAD;
    const top = zb + i * RISE;
    return { x0, solid: prism(stairRect(x0, x0 + TREAD), top - RISE - 1.2, RISE + 1.2, view, 2, 0.2) };
  }).sort((a, b) => a.x0 - b.x0);
  const lx0 = right ? RX1 : BX0;
  const lx1 = right ? BX1 : RX0;
  const landing = prism(stairRect(lx0, lx1), k * F - 2.4, 2.4, view, 2, 0.2);
  // Handrail along the outer edge: up the flight, then along the landing's front and out to the wall.
  const startX = right ? RX0 : RX1;
  const endX = right ? RX1 : RX0;
  const farX = right ? BX1 - 0.6 : BX0 + 0.6;
  const rail =
    fLine(railY, [[startX, zb + RAIL], [endX, k * F + RAIL], [farX, k * F + RAIL]]) + P([[farX, railY, k * F + RAIL], [farX, SY0, k * F + RAIL]]);
  // Posts: the rail's height above the line of the step noses (linear from the flight's foot to its landing).
  const nose = (x: number) => zb + ((right ? x - startX : startX - x) / (RX1 - RX0)) * F;
  const posts = [startX, (startX + endX) / 2, endX].map((x) => fLine(railY, [[x, nose(x)], [x, nose(x) + RAIL]])).join("") + fLine(railY, [[farX, k * F], [farX, k * F + RAIL]]);
  return { steps: steps.map((s) => s.solid), landing, rail, posts };
});
// Thin columns under the outer corners of the landings, down to the board.
export const columns = [
  cylinder(BX1 - 1.2, SY1 - 1.2, 0.8, 0, 3 * F - 2.4, view, 12),
  cylinder(BX0 + 1.2, SY1 - 1.2, 0.8, 0, 4 * F - 2.4, view, 12),
];

// Glass tank: open at the top, marks 1-4 at the floor heights.
export const tank = {
  glass: prism(TANK, 0, TOP, view, 10, 0.4),
  back: P([[TANK.x + TANK.w, TANK.y, TOP], [TANK.x + TANK.w, TANK.y, 0], [TANK.x, TANK.y, 0]]) + P([[TANK.x, TANK.y, 0], [TANK.x, TANK_FRONT, 0]]),
  rim: flatRect(TANK, TOP, view, 10),
  shine: P([[TANK.x + 12, TANK_FRONT + 0.1, TOP - 8], [TANK.x + 15, TANK_FRONT + 0.1, TOP - 28]]) + P([[TANK.x + 17, TANK_FRONT + 0.1, TOP - 10], [TANK.x + 18.4, TANK_FRONT + 0.1, TOP - 18]]),
  ticks: Array.from({ length: FLOORS }, (_, i) => (i + 1) * F)
    .map((z) => P([[TANK.x + 0.5, TANK_FRONT + 0.1, z], [TANK.x + 8, TANK_FRONT + 0.1, z]]) + P([[TANK.x + TANK.w - 8, TANK_FRONT + 0.1, z], [TANK.x + TANK.w - 0.5, TANK_FRONT + 0.1, z]]))
    .join(""),
  marks: Array.from({ length: FLOORS }, (_, i) => ({ n: i + 1, at: frontText(TANK.x + 4.2, TANK_FRONT + 0.15, (i + 1) * F - 5, 5.6) })),
};
export const MARK_SIZE = 5.6;

// Spout: from the roof edge out over the tank rim, then a short drop into the tank.
const SPOUT_D = 3.2;
const SPOUT_Z = TOP + 2.6;
const SPOUT_X = TANK.x + 9;
export const spout = {
  run: pipeX(BX1 - 5, SPOUT_X + SPOUT_D / 2, TANK_CY, SPOUT_Z, SPOUT_D),
  drop: cylinder(SPOUT_X, TANK_CY, SPOUT_D / 2 + 0.3, TOP - 4, SPOUT_Z - TOP + 4, view, 16, 0.2),
  mount: prism({ x: BX1 - 7, y: TANK_CY - 2.6, w: 4, d: 5.2, r: 0.4 }, TOP, SPOUT_Z + SPOUT_D / 2 - TOP, view, 2, 0.2),
};

// Drain tap at the tank's foot: pipe out of the front face, tap body, wheel, handle across the pipe (closed).
const DRAIN_X = TANK_CX + 5;
const DRAIN_Z = 5;
const TAP_Y = TANK_FRONT + 5;
const tapTop = DRAIN_Z + 3;
export const drain = {
  pipe: pipeY(TANK_FRONT - 0.5, TANK_FRONT + 9, DRAIN_X, DRAIN_Z, 3.2),
  nozzle: cylinder(DRAIN_X, TANK_FRONT + 8, 1.9, DRAIN_Z - 3.6, 3.6, view, 16, 0.2),
  body: prism({ x: DRAIN_X - 3, y: TAP_Y - 3, w: 6, d: 6, r: 0.8 }, DRAIN_Z - 3, 6, view, 3, 0.4),
  stem: cylinder(DRAIN_X, TAP_Y, 0.8, tapTop, 2.4, view, 12),
  wheel: cylinder(DRAIN_X, TAP_Y, 4, tapTop + 2.4, 1.2, view, 28, 0.3),
  handle: P([[DRAIN_X - 5.6, TAP_Y, tapTop + 4.2], [DRAIN_X + 5.6, TAP_Y, tapTop + 4.2]]),
  hub: at([DRAIN_X, TAP_Y, tapTop + 4.2]),
};

// Sam: a flat 2D side profile in the front plane y = SAM.y, facing +x (the stairs). Local u right, v down, feet at v = 0.
export const samMatrix = (() => {
  const o = at([SAM.x, SAM.y, 0]);
  const u = at([SAM.x + SAM.s, SAM.y, 0]);
  const w = at([SAM.x, SAM.y, -SAM.s]);
  return `matrix(${r3(u[0] - o[0])} ${r3(u[1] - o[1])} ${r3(w[0] - o[0])} ${r3(w[1] - o[1])} ${r3(o[0])} ${r3(o[1])})`;
})();
export const samShadow = flatPath(
  Array.from({ length: 32 }, (_, i): Vec2 => {
    const t = (i / 32) * 2 * Math.PI;
    return [SAM.x + (0.6 + 5.4 * Math.cos(t)) * (SAM.s / 1.12), SAM.y + 2.6 * (SAM.s / 1.12) * Math.sin(t)];
  }),
  0.04,
  view,
  true,
);

// Buckets: tapered-looking pail (cylinder), blue water just under the rim, a rim ring and a wire bail.
export const buckets = BUCKET_X.map((x) => {
  const c = Array.from({ length: 40 }, (_, i): Vec2 => {
    const a = (i / 40) * Math.PI * 2;
    return [x + Math.cos(a), BUCKET_Y + Math.sin(a)];
  });
  const ring = (r: number, z: number) => flatPath(c.map(([px, py]): Vec2 => [x + (px - x) * r, BUCKET_Y + (py - BUCKET_Y) * r]), z, view, true);
  const bail = Array.from({ length: 17 }, (_, i): Vec3 => {
    const a = Math.PI * (i / 16);
    return [x - BUCKET_R * Math.cos(a), BUCKET_Y, BUCKET_H + 0.4 + 5 * Math.sin(a)];
  });
  return {
    body: cylinder(x, BUCKET_Y, BUCKET_R, 0, BUCKET_H, view, 28, 0.2),
    hoop: P(Array.from({ length: 21 }, (_, i): Vec3 => {
      const a = Math.PI * (i / 20);
      return [x + BUCKET_R * 1.005 * Math.cos(a), BUCKET_Y + BUCKET_R * 1.005 * Math.sin(a), BUCKET_H * 0.42];
    })),
    water: ring(BUCKET_R - 0.7, BUCKET_H - 1.2),
    ripple: ring((BUCKET_R - 0.7) * 0.5, BUCKET_H - 1.18),
    rim: ring(BUCKET_R, BUCKET_H),
    bail: P(bail),
    ears: [at([x - BUCKET_R, BUCKET_Y, BUCKET_H + 0.4]), at([x + BUCKET_R, BUCKET_Y, BUCKET_H + 0.4])],
  };
});

// Entrance spark points: building and tank corners, the buckets and Sam's feet.
export const contacts: Vec2[] = [
  ...rectCorners(BLD),
  ...rectCorners(TANK),
  ...BUCKET_X.map((x): Vec2 => [x, BUCKET_Y + BUCKET_R]),
  [SAM.x, SAM.y],
].map(([x, y]) => at([x, y, 0]));
