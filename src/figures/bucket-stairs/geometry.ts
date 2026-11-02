// Bucket stairs: one board (always on screen). x runs right, y toward the viewer (front face +y), z up.
// Analogy (square board): left, a four-floor building (plinth, a window band per floor, slab lines, flat roof with
// coping, a door with the ROLLIN name plate over it) with an outside staircase on its front face: one flight per floor,
// zig-zagging, a landing at every floor, a handrail. Touching its right wall: a clear glass tank exactly as tall as the
// building, marks 1-4 level with the floors, a spout from the roof edge over its rim, a drain tap at its foot. In front
// of the stair foot: Sam (flat 2D side profile) and a row of four buckets.
// Circuit (the board stretches long toward the front; the analogy fades out completely): a CMOS inverter drawn like
// the digital electronics boards. VDD rail at the back (tag "VDD 1.0 V"), GND rail at the front, the PMOS and NMOS
// valve blocks in one column with their control pins fed by the input lever, the output bus to the glass output
// tank C (four marks), and the slot for the dim full-voltage copy on the tank's right.
import { boxCorners, cylinder, faceMatrix, fitView, flatCircle, flatPath, flatRect, inset, pathD, prism, prismFill, project, rectCorners, translateTo, type Rect, type Vec2, type Vec3, type View } from "../../iso/iso-kit";
import { solidSvg } from "../../iso/iso-kit";
import { waterBox, waterSvg } from "../../iso/analogy/water";
import { FLOORS, type Trip, tripAt } from "./model";

export const STAGE_W = 600;
const AZIMUTH = 62;
const PAD = 6;

// Boards: square for the analogy, longer toward the front for the circuit.
const BOARD_A: Rect = { x: -68, y: -64, w: 134, d: 130, r: 5 };
const BOARD_C: Rect = { x: -70, y: -64, w: 136, d: 150, r: 5 };
const SLAB_H = 6;

// One floor of height (building and tank share it).
export const F = 24;
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
const SYM = (SY0 + SY1) / 2;
const LW = 13;
const RX0 = BX0 + LW; // -29
const RX1 = BX1 - LW; // 9
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
export const SAM = { x: -55, y: SY1 + 14, s: 1.68, sStairs: 1.34 };
const BUCKET_R = 5.6;
const BUCKET_H = 9;
const BUCKET_Y = SY1 + 26;
export const BUCKET_X = Array.from({ length: 4 }, (_, i) => -34 + i * 14);

const corners: Vec3[] = [...boxCorners(BOARD_A, -SLAB_H, 0), ...boxCorners(BOARD_C, -SLAB_H, 0), ...boxCorners(BLD, 0, TOP + 6), ...boxCorners(TANK, 0, TOP + 6)];
const unit: View = fitView(corners, STAGE_W, 10000, { pad: PAD, azimuth: AZIMUTH });
const ys = corners.map((p) => project(p, unit)[1]);
export const STAGE_H = Math.ceil(Math.max(...ys) - Math.min(...ys) + PAD * 2);
export const view = fitView(corners, STAGE_W, STAGE_H, { pad: PAD, azimuth: AZIMUTH });
export const at = (p: Vec3) => project(p, view);
const P = (pts: Vec3[], close = false) => pathD(pts.map(at), close);
const r3 = (v: number) => Math.round(v * 1e3) / 1e3;
const f1 = (v: number) => v.toFixed(1);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
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
export const shiftZ = (dz: number) => translateTo(view, [0, 0, dz]);
export const shift = (v: Vec3) => translateTo(view, v);
const textSvg = (transform: string, size: number, s: string, cls = "bs-label", anchor = "middle") =>
  `<g class="${cls}"><text class="iso-face-text" data-tone="hi" transform="${transform}" font-size="${size}" text-anchor="${anchor}">${s}</text></g>`;

export const ENGRAVE = "ROLLIN-रोलिन-ROLLIN-रोलिन";
export const ENGRAVE_SIZE = 3.6;

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
export const board = boardAt(0);

// ---------- Building ----------

const DOOR = { x0: BX0 + 3.5, x1: RX0 - 2.5, z1: 15 };
const PLATE = { x0: BX0 + 2, x1: RX0 - 1, z0: 16.6, z1: 21.8 };
export const BRAND_SIZE = 2.8;
const fy = FY + 0.05;

// Floor k (0..3): body, window band, sill, slab line on the facade and on the right wall.
export const floors = Array.from({ length: FLOORS }, (_, k) => {
  const z0 = k * F + 7;
  const z1 = k * F + 18;
  const x0 = k === 0 ? RX0 + 2 : BX0 + 3;
  const x1 = BX1 - 3;
  const n = Math.max(2, Math.round((x1 - x0) / 6.5));
  const top = k === FLOORS - 1 ? TOP - COPING : (k + 1) * F;
  return {
    body: prism({ ...BLD }, k * F, top - k * F, view, 3, 0.3),
    frame: fRect(fy, x0, x1, z0, z1),
    glass: fRect(fy + 0.02, x0 + 1, x1 - 1, z0 + 1, z1 - 1),
    mullions: Array.from({ length: n - 1 }, (_, i) => fLine(fy + 0.04, [[x0 + ((x1 - x0) * (i + 1)) / n, z0 + 1], [x0 + ((x1 - x0) * (i + 1)) / n, z1 - 1]])).join(""),
    shine: fLine(fy + 0.06, [[x0 + 2.5, z1 - 2.5], [x0 + 4.5, z0 + 2.5]]),
    sill: prism({ x: x0 - 1, y: FY, w: x1 - x0 + 2, d: 1.6, r: 0.3 }, z0 - 1.2, 1.2, view, 2, 0.1),
    slab: k > 0 ? fRect(fy + 0.01, BX0, BX1, k * F - 0.8, k * F + 0.8) : "",
    sideSlab: k > 0 ? P([[BX1 + 0.05, BLD.y, k * F], [BX1 + 0.05, FY, k * F]]) : "",
  };
});
const coping = (z: number) => ({ solid: prism(inset(BLD, -1), z - COPING, COPING, view, 3, 0.3), roof: flatRect(inset(BLD, 1.6), z, view, 3) });
export const copings = { high: coping(TOP), low: coping(2 * F) };
export const building = {
  plinth: fRect(fy, BX0, BX1, 0, PLINTH),
  door: fRect(fy + 0.02, DOOR.x0, DOOR.x1, PLINTH, DOOR.z1),
  doorPanel: fRect(fy + 0.04, DOOR.x0 + 1.3, DOOR.x1 - 1.3, PLINTH + 1.3, DOOR.z1 - 1.3),
  knob: at([DOOR.x1 - 1.6, fy + 0.06, PLINTH + 5]),
  step: prism({ x: DOOR.x0 - 1, y: FY, w: DOOR.x1 - DOOR.x0 + 2, d: 3, r: 0.3 }, 0, PLINTH, view, 2, 0.2),
  plate: fRect(fy + 0.08, PLATE.x0, PLATE.x1, PLATE.z0, PLATE.z1),
  plateRivets: [PLATE.x0 + 1, PLATE.x1 - 1].map((x) => at([x, fy + 0.1, (PLATE.z0 + PLATE.z1) / 2])),
  brandAt: frontText((PLATE.x0 + PLATE.x1) / 2, fy + 0.12, (PLATE.z0 + PLATE.z1) / 2, BRAND_SIZE),
  // Pulse outline: the whole building.
  glow: prism(inset(BLD, -1.2), 0, TOP + 0.6, view, 3, 0.3).outline,
  roofGlow: flatRect(inset(BLD, -1), TOP, view, 3),
};

// ---------- Stairs ----------

const stairRect = (x0: number, x1: number): Rect => ({ x: x0, y: SY0, w: x1 - x0, d: SY1 - SY0, r: 0.3 });
const railY = SY1 - 0.6;
const flightRight = (k: number) => k % 2 === 1; // flight k (1..4)
export const stairs = Array.from({ length: FLOORS }, (_, j) => {
  const k = j + 1;
  const zb = j * F;
  const right = flightRight(k);
  const steps = Array.from({ length: STEPS }, (_, s) => {
    const i = s + 1;
    const x0 = right ? RX0 + (i - 1) * TREAD : RX1 - i * TREAD;
    const top = zb + i * RISE;
    return { x0, top, solid: prism(stairRect(x0, x0 + TREAD), top - RISE - 1.2, RISE + 1.2, view, 2, 0.2) };
  }).sort((a, b) => a.x0 - b.x0);
  const lx0 = right ? RX1 : BX0;
  const lx1 = right ? BX1 : RX0;
  const landing = prism(stairRect(lx0, lx1), k * F - 2.4, 2.4, view, 2, 0.2);
  const startX = right ? RX0 : RX1;
  const endX = right ? RX1 : RX0;
  const farX = right ? BX1 - 0.6 : BX0 + 0.6;
  const rail = fLine(railY, [[startX, zb + RAIL], [endX, k * F + RAIL], [farX, k * F + RAIL]]) + P([[farX, railY, k * F + RAIL], [farX, SY0, k * F + RAIL]]);
  const nose = (x: number) => zb + ((right ? x - startX : startX - x) / (RX1 - RX0)) * F;
  const posts = [startX, (startX + endX) / 2, endX].map((x) => fLine(railY, [[x, nose(x)], [x, nose(x) + RAIL]])).join("") + fLine(railY, [[farX, k * F], [farX, k * F + RAIL]]);
  // Saw-tooth profile of the step noses (for the flash), in the outer plane.
  const saw: [number, number][] = [];
  for (let s = 0; s < STEPS; s++) {
    const xa = right ? RX0 + s * TREAD : RX1 - s * TREAD;
    const xb = right ? xa + TREAD : xa - TREAD;
    saw.push([xa, zb + s * RISE], [xa, zb + (s + 1) * RISE], [xb, zb + (s + 1) * RISE]);
  }
  saw.push([endX, k * F], [right ? BX1 : BX0, k * F]);
  // Column pieces for this floor under the landings' outer corners: left up to landing 4, right up to landing 3.
  const columns = [
    cylinder(BX0 + 1.2, SY1 - 1.2, 0.8, zb, j === FLOORS - 1 ? F - 2.4 : F, view, 12),
    ...(j < 2 ? [cylinder(BX1 - 1.2, SY1 - 1.2, 0.8, zb, F, view, 12)] : j === 2 ? [cylinder(BX1 - 1.2, SY1 - 1.2, 0.8, zb, F - 2.4, view, 12)] : []),
  ];
  return { steps: steps.map((s) => s.solid), landing, rail, posts, flash: fLine(SY1 + 0.1, saw), columns };
});

// A climber's position: home -> stair foot -> flights -> roof -> spout.
const FOOT: Vec3 = [RX0 - 3, SYM, 0];
const flightEnds = (k: number): [Vec3, Vec3] => {
  const r = flightRight(k);
  return [
    [r ? RX0 : RX1, SYM, (k - 1) * F],
    [r ? RX1 : RX0, SYM, k * F],
  ];
};
const SPOUT_X = TANK.x + 9;
const pourSpot = (floors: number): Vec3 => [BX1 - 7, TANK_CY, floors * F];
export function climberAt(home: Vec3, r: Trip, t: number): { p: Vec3; dir: number; phase: string; u: number } {
  const a = tripAt(r, t);
  const L = (p: Vec3, q: Vec3, u: number): Vec3 => [lerp(p[0], q[0], u), lerp(p[1], q[1], u), lerp(p[2], q[2], u)];
  if (a.phase === "wait") return { p: home, dir: 1, phase: a.phase, u: 0 };
  if (a.phase === "walk") return { p: L(home, FOOT, a.u), dir: 1, phase: a.phase, u: a.u };
  if (a.phase === "climb") {
    const [s, e] = flightEnds(a.floor);
    const from = a.floor === 1 ? FOOT : s;
    return { p: L(from, e, a.u), dir: flightRight(a.floor) ? 1 : -1, phase: a.phase, u: a.u };
  }
  const top = flightEnds(r.floors)[1];
  if (a.phase === "roof") return { p: L(top, pourSpot(r.floors), a.u), dir: 1, phase: a.phase, u: a.u };
  return { p: pourSpot(r.floors), dir: 1, phase: a.phase, u: a.u };
}
export const landingPoint = (floor: number): Vec3 => flightEnds(floor)[1];

// ---------- Tank ----------

const markText = (k: number) => frontText(TANK.x + 4.2, TANK_FRONT + 0.15, (k + 1) * F - 5, 5.6);
// Glass, back edges, rim, shine, ticks and marks up to height h (units); ghost part above h to TOP.
export function tankSvg(h: number, ghostA: number): string {
  const glass = prism(TANK, 0, h, view, 10, 0.4);
  const back = P([[TANK.x + TANK.w, TANK.y, h], [TANK.x + TANK.w, TANK.y, 0], [TANK.x, TANK.y, 0]]) + P([[TANK.x, TANK.y, 0], [TANK.x, TANK_FRONT, 0]]);
  const shine = P([[TANK.x + 12, TANK_FRONT + 0.1, h - 8], [TANK.x + 15, TANK_FRONT + 0.1, Math.max(4, h - 28)]]) + P([[TANK.x + 17, TANK_FRONT + 0.1, h - 10], [TANK.x + 18.4, TANK_FRONT + 0.1, Math.max(4, h - 18)]]);
  let out = `<path class="bs-glass-back" d="${back}"/>`;
  out += `<g class="an-glass bs-glass">${solidSvg(glass, { tone: "mid", crease: "lo" })}</g>`;
  out += `<path class="bs-rim" d="${flatRect(TANK, h, view, 10)}"/><path class="bs-shine" d="${shine}"/>`;
  for (let k = 0; k < FLOORS; k++) {
    const z = (k + 1) * F;
    const vis = z <= h + 0.2 ? 1 : ghostA;
    if (vis < 0.02) continue;
    const tick = P([[TANK.x + 0.5, TANK_FRONT + 0.1, z], [TANK.x + 8, TANK_FRONT + 0.1, z]]) + P([[TANK.x + TANK.w - 8, TANK_FRONT + 0.1, z], [TANK.x + TANK.w - 0.5, TANK_FRONT + 0.1, z]]);
    out += `<g opacity="${vis.toFixed(3)}"><path class="bs-tick" d="${tick}"/>${textSvg(markText(k), 5.6, String(k + 1))}</g>`;
  }
  if (ghostA > 0.02 && h < TOP - 0.2) {
    const g = prism({ ...TANK, y: TANK.y }, h, TOP - h, view, 10, 0.4);
    out += `<g class="an-glass bs-glass" opacity="${ghostA.toFixed(3)}">${solidSvg(g, { tone: "mid", crease: "lo" })}</g>`;
  }
  return out;
}
// Water at level (units) with a ripple phase.
export const tankWater = (level: number, phase: number) => (level < 0.25 ? "" : waterSvg(waterBox(TANK, level, Math.min(0.5, level * 0.2), 0, phase, view)));
export const tankRimGlow = flatRect(inset(TANK, -0.6), TOP, view, 10);
// Dashed full mark on the glass at the roof line (h units).
export const tankFullMark = (h: number) => flatRect(inset(TANK, -0.8), Math.max(0.3, h), view, 10);
// Building melt toward its small ghost (circuit, back left): slide and shrink about its foot.
const MELT_FROM: Vec3 = [(BX0 + BX1) / 2, FY, 0];
const MELT_TO: Vec3 = [-61.5, -47, 0];
export function meltBuilding(k: number) {
  const a = at(MELT_FROM);
  const b = at(MELT_TO);
  const sc = 1 - 0.82 * k;
  return `translate(${r3(a[0] + (b[0] - a[0]) * k)} ${r3(a[1] + (b[1] - a[1]) * k)}) scale(${r3(sc)}) translate(${r3(-a[0])} ${r3(-a[1])})`;
}

// Spout: from the roof edge out over the tank rim, then a short drop into the tank (one per roof height).
const SPOUT_D = 3.2;
const spoutAt = (roof: number) => {
  const z = roof + 2.6;
  return {
    mount: prism({ x: BX1 - 7, y: TANK_CY - 2.6, w: 4, d: 5.2, r: 0.4 }, roof, z + SPOUT_D / 2 - roof, view, 2, 0.2),
    drop: cylinder(SPOUT_X, TANK_CY, SPOUT_D / 2 + 0.3, roof - 4, z - roof + 4, view, 16, 0.2),
    run: pipeX(BX1 - 5, SPOUT_X + SPOUT_D / 2, TANK_CY, z, SPOUT_D),
  };
};
export const spouts = { high: spoutAt(TOP), low: spoutAt(2 * F) };
// Pour stream from the spout down to the water level.
export const pourStream = (roof: number, level: number) => P([[SPOUT_X, TANK_CY, roof - 4], [SPOUT_X, TANK_CY, Math.max(0.6, level + 0.3)]]);

// Drain tap at the tank's foot (closed: handle across the pipe); its stream falls onto the board.
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
  stream: P([[DRAIN_X, TANK_FRONT + 8, DRAIN_Z - 3.6], [DRAIN_X, TANK_FRONT + 8, 0.2]]),
  puddle: flatPath(Array.from({ length: 24 }, (_, i): Vec2 => [DRAIN_X + 4 * Math.cos((i / 24) * 2 * Math.PI), TANK_FRONT + 8 + 2.4 * Math.sin((i / 24) * 2 * Math.PI)]), 0.05, view, true),
};

// Floor lines (10.2): along the facade's right end, round the corner, across the tank front at each floor.
export const floorLines = Array.from({ length: FLOORS }, (_, k) => {
  const z = (k + 1) * F;
  return P([[BX1 - 9, SY1 + 0.2, z], [BX1, SY1 + 0.2, z], [BX1, TANK_FRONT + 0.2, z], [TANK.x + TANK.w, TANK_FRONT + 0.2, z]]);
});

// ---------- Sam ----------

// Matrix for Sam's local frame (u forward, v down, feet at 0) standing at p, facing dir (+1 = +x), scale s.
export function samMatrix(p: Vec3, dir: number, s: number) {
  const o = at(p);
  const u = at([p[0] + s * dir, p[1], p[2]]);
  const w = at([p[0], p[1], p[2] - s]);
  return `matrix(${r3(u[0] - o[0])} ${r3(u[1] - o[1])} ${r3(w[0] - o[0])} ${r3(w[1] - o[1])} ${r3(o[0])} ${r3(o[1])})`;
}
export const samShadow = (p: Vec3, s: number) =>
  flatPath(
    Array.from({ length: 32 }, (_, i): Vec2 => {
      const t = (i / 32) * 2 * Math.PI;
      return [p[0] + 0.6 * s + 5.4 * (s / 1.12) * Math.cos(t), p[1] + 2.6 * (s / 1.12) * Math.sin(t)];
    }),
    p[2] + 0.05,
    view,
    true,
  );
export const SAM_HOME: Vec3 = [SAM.x, SAM.y, 0];

// ---------- Buckets and drops ----------

export const buckets = BUCKET_X.map((x) => {
  const c = Array.from({ length: 40 }, (_, i): Vec2 => {
    const a = (i / 40) * Math.PI * 2;
    return [Math.cos(a), Math.sin(a)];
  });
  const ring = (r: number, z: number) => flatPath(c.map(([px, py]): Vec2 => [x + px * r, BUCKET_Y + py * r]), z, view, true);
  return {
    home: [x, BUCKET_Y, 0] as Vec3,
    base: at([x, BUCKET_Y, 0]),
    body: cylinder(x, BUCKET_Y, BUCKET_R, 0, BUCKET_H, view, 28, 0.2),
    hoop: P(Array.from({ length: 21 }, (_, i): Vec3 => {
      const a = Math.PI * (i / 20);
      return [x + BUCKET_R * 1.005 * Math.cos(a), BUCKET_Y + BUCKET_R * 1.005 * Math.sin(a), BUCKET_H * 0.42];
    })),
    water: ring(BUCKET_R - 0.7, BUCKET_H - 1.2),
    ripple: ring((BUCKET_R - 0.7) * 0.5, BUCKET_H - 1.18),
    rim: ring(BUCKET_R, BUCKET_H),
    bail: P(Array.from({ length: 17 }, (_, i): Vec3 => {
      const a = Math.PI * (i / 16);
      return [x - BUCKET_R * Math.cos(a), BUCKET_Y, BUCKET_H + 0.4 + 5 * Math.sin(a)];
    })),
    ears: [at([x - BUCKET_R, BUCKET_Y, BUCKET_H + 0.4]), at([x + BUCKET_R, BUCKET_Y, BUCKET_H + 0.4])],
  };
});
// Bucket transform: slide (board units along y), then scale about its base.
export const bucketTransform = (i: number, dy: number, k: number) => {
  const b = buckets[i].base;
  return `${shift([0, dy, 0])} translate(${f1(b[0])} ${f1(b[1])}) scale(${k.toFixed(3)}) translate(${f1(-b[0])} ${f1(-b[1])})`;
};
// A drop of charge (teardrop, rust) standing at p, scale k.
const DROP_R = (() => {
  const a = at([0, 0, 0]);
  const b = at([0, 0, 3]);
  return Math.abs(b[1] - a[1]);
})();
export function dropSvg(p: Vec3, k: number, a: number, pulse = 0) {
  const c = at([p[0], p[1], p[2] + 3.2 * k]);
  const r = DROP_R * k * (1 + 0.25 * pulse);
  if (r < 0.2 || a < 0.02) return "";
  const d = `M${f1(c[0])} ${f1(c[1] - 1.7 * r)}Q${f1(c[0] + 0.95 * r)} ${f1(c[1] - 0.55 * r)} ${f1(c[0] + 0.95 * r)} ${f1(c[1] + 0.15 * r)}A${f1(0.95 * r)} ${f1(0.95 * r)} 0 1 1 ${f1(c[0] - 0.95 * r)} ${f1(c[1] + 0.15 * r)}Q${f1(c[0] - 0.95 * r)} ${f1(c[1] - 0.55 * r)} ${f1(c[0])} ${f1(c[1] - 1.7 * r)}Z`;
  const sh = flatPath(Array.from({ length: 20 }, (_, i): Vec2 => [p[0] + 2.4 * k * Math.cos((i / 20) * 2 * Math.PI), p[1] + 1.4 * k * Math.sin((i / 20) * 2 * Math.PI)]), p[2] + 0.05, view, true);
  return `<g opacity="${a.toFixed(3)}"><path class="bs-drop-shadow" d="${sh}"/><path class="bs-drop" d="${d}"/><path class="bs-drop-shine" d="M${f1(c[0] - 0.4 * r)} ${f1(c[1] - 0.2 * r)}Q${f1(c[0] - 0.5 * r)} ${f1(c[1] + 0.4 * r)} ${f1(c[0] - 0.1 * r)} ${f1(c[1] + 0.6 * r)}"/></g>`;
}
// Effort puff (sepia ink) above Sam's head, or a spark puff (light rust) at a step; age 0..1.
export function puffSvg(p: Vec3, age: number, kind: "sam" | "drop") {
  const c = at(p);
  const a = (1 - age).toFixed(3);
  if (kind === "sam") {
    const rise = 10 * age;
    return [
      [-4, 0, 2.4],
      [0, -2, 3],
      [4, 0, 2.2],
    ]
      .map(([dx, dy, r]) => `<circle class="bs-puff" cx="${f1(c[0] + dx * (1 + age))}" cy="${f1(c[1] + dy - rise)}" r="${f1(r * (0.8 + 0.6 * age))}" opacity="${a}"/>`)
      .join("");
  }
  const out: string[] = [];
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2 + 0.3;
    const r0 = 3 + 6 * age;
    const r1 = r0 + 4;
    out.push(`<line class="bs-spark" x1="${f1(c[0] + Math.cos(ang) * r0)}" y1="${f1(c[1] + Math.sin(ang) * r0)}" x2="${f1(c[0] + Math.cos(ang) * r1)}" y2="${f1(c[1] + Math.sin(ang) * r1)}" opacity="${a}"/>`);
  }
  return out.join("");
}

// ---------- Circuit: a CMOS inverter drawn like the digital electronics boards (DE 05, DE 08) ----------
// Flat board: VDD rail along the back, GND rail along the front, one valve column (PMOS above the output node, NMOS
// below it) with control pins on the left fed by the input lever, the output bus to the glass output tank C on the
// right (four marks: one per packet of charge at 1.0 V). The dim full-voltage copy slides in to the tank's right.
const VDD_Y = -50;
const GND_Y = 72;
const NODE_Y = 14;
const P_Y = -22;
const N_Y = 46;
const RAIL_D = 5;
const RAIL_X0 = -50;
const VDD_X1 = 24;
const GND_X1 = 60;
const VALVE_X = -20;
const PIN_X = -37;
const VALVE = { w: 22, d: 9, h: 3.4 };
export const OT = { x: 26, y: NODE_Y, r: 9.5, z0: 1.4, h: 32 };
export const MARK = OT.h / FLOORS; // one packet of charge = one mark = one step of voltage
export const COPY_DX = 25;
const LEV = { x: -57, y: NODE_Y, pivotZ: 6, len: 13 };
const BUS_END = OT.x - OT.r - 1.6;
const TAG: Rect = { x: 26, y: VDD_Y - 0.8, w: 24, d: 1.6, r: 0.3 };
const OUT_TAG: Rect = { x: -6, y: NODE_Y - 8, w: 14, d: 1.6, r: 0.3 };

const strapAt = (pts: Vec2[], z = 0.05) => flatPath(pts, z, view);
const grow = (r: Rect, by: number): Rect => inset(r, -by);
const railRect = (y: number, x1: number): Rect => ({ x: RAIL_X0, y: y - RAIL_D / 2, w: x1 - RAIL_X0, d: RAIL_D, r: 0.8 });
const vRect = (y: number): Rect => ({ x: VALVE_X - VALVE.w / 2, y: y - VALVE.d / 2, w: VALVE.w, d: VALVE.d, r: 1 });
const valveAt = (y: number, bubble: boolean) => {
  const body = vRect(y);
  return {
    body: prism(body, 0, VALVE.h, view, 3, 0.4),
    gate: prism({ x: body.x - 1, y: y - 1.2, w: body.w + 2, d: 2.4, r: 0.4 }, VALVE.h, 1.1, view, 2, 0.3),
    pin: cylinder(PIN_X, y, 1.4, 0, 7, view, 16),
    cap: cylinder(PIN_X, y, 2, 7, 1.2, view, 18, 0.3),
    arm: prism({ x: PIN_X, y: y - 0.9, w: body.x - PIN_X, d: 1.8, r: 0.3 }, 4.2, 1.2, view, 2),
    bubble: bubble ? flatCircle(PIN_X, y, 3.1, 8.2, view, 20) + flatCircle(PIN_X, y, 3.1, 7.2, view, 20) : "",
    contacts: [at([body.x + 2, body.y + 1.6, VALVE.h]), at([body.x + body.w - 2, body.y + body.d - 1.6, VALVE.h])] as Vec2[],
    glow: prism(grow(body, 1.2), 0, VALVE.h + 1.6, view, 3, 0.4).outline,
    name: faceMatrix([PIN_X - 21, y + 1.6], 0, view, "x"),
  };
};
const SY = (y0: number, y1: number): Vec2[] => [
  [VALVE_X, y0],
  [VALVE_X, y1],
];

export const circuit = {
  vdd: prism(railRect(VDD_Y, VDD_X1), 0, 1.6, view, 2, 0.3),
  gnd: prism(railRect(GND_Y, GND_X1), 0, 1.6, view, 2, 0.3),
  vddLabel: faceMatrix([BOARD_C.x + 5, VDD_Y + 1.6], 0, view, "x"),
  gndLabel: faceMatrix([BOARD_C.x + 5, GND_Y + 1.6], 0, view, "x"),
  railGlow: prism(grow(railRect(VDD_Y, VDD_X1), 1), 0, 2.4, view, 2, 0.3).outline,
  tag: prism(TAG, 0, 7, view, 2, 0.3),
  tagText: frontText(TAG.x + TAG.w / 2, TAG.y + TAG.d + 0.1, 3.5, 4.4),
  tagGlow: prism(grow(TAG, 1), 0, 8, view, 2, 0.3).outline,
  // Straps: VDD -> PMOS -> node -> tank; node -> NMOS -> GND.
  vddp: strapAt(SY(VDD_Y + RAIL_D / 2, P_Y - VALVE.d / 2)),
  pbus: strapAt(SY(P_Y + VALVE.d / 2, NODE_Y - 1.6)),
  bus: strapAt([[VALVE_X + 2, NODE_Y], [BUS_END, NODE_Y]], 1.05),
  busRev: strapAt([[BUS_END, NODE_Y], [VALVE_X + 2, NODE_Y]], 1.05),
  busn: strapAt(SY(NODE_Y + 1.6, N_Y - VALVE.d / 2)),
  ngnd: strapAt(SY(N_Y + VALVE.d / 2, GND_Y - RAIL_D / 2)),
  busBar: prism({ x: VALVE_X - 2, y: NODE_Y - 1.6, w: BUS_END - VALVE_X + 3, d: 3.2, r: 0.6 }, 0, 1, view, 2, 0.2),
  pad: flatCircle(OT.x, OT.y, OT.r + 2.4, 0.05, view, 40),
  // Input: lever -> pins (both gates).
  vin: strapAt([[LEV.x + 7, NODE_Y], [PIN_X, NODE_Y]]) + strapAt([[PIN_X, NODE_Y], [PIN_X, P_Y]]) + strapAt([[PIN_X, NODE_Y], [PIN_X, N_Y]]),
  vinJunction: at([PIN_X, NODE_Y, 0]),
  bit1: faceMatrix([LEV.x - 1.6, LEV.y - 16], 0, view, "x"),
  bit0: faceMatrix([LEV.x - 1.6, LEV.y + 11.6], 0, view, "x"),
  outTag: prism(OUT_TAG, 0, 6, view, 2, 0.3),
  outText: frontText(OUT_TAG.x + OUT_TAG.w / 2, OUT_TAG.y + OUT_TAG.d + 0.1, 3, 4.2),
  // Flash along the output wire (30.9): node to tank.
  wireFlash: strapAt([[VALVE_X, NODE_Y], [BUS_END, NODE_Y]], 1.1),
  // Thin through-current stream VDD -> PMOS -> NMOS -> GND (both half open), over the valve tops.
  stream: P([
    [VALVE_X + 3.5, VDD_Y + 2.5, 0.2],
    [VALVE_X + 3.5, P_Y - 5, 0.2],
    [VALVE_X + 3.5, P_Y - 4.5, VALVE.h + 1.4],
    [VALVE_X + 3.5, P_Y + 4.5, VALVE.h + 1.4],
    [VALVE_X + 3.5, P_Y + 5, 0.2],
    [VALVE_X + 3.5, N_Y - 5, 0.2],
    [VALVE_X + 3.5, N_Y - 4.5, VALVE.h + 1.4],
    [VALVE_X + 3.5, N_Y + 4.5, VALVE.h + 1.4],
    [VALVE_X + 3.5, N_Y + 5, 0.2],
    [VALVE_X + 3.5, GND_Y - 2.5, 0.2],
  ]),
};
export const pmos = valveAt(P_Y, true);
export const nmos = valveAt(N_Y, false);

// Input lever (DE style): v = 1 up (logic 0), -1 pulled (logic 1).
const knobPoint = (v: number): Vec3 => [LEV.x, LEV.y + Math.sin(v * 0.6) * LEV.len, LEV.pivotZ + Math.cos(v * 0.6) * LEV.len];
export const lever = {
  base: prism({ x: LEV.x - 7, y: LEV.y - 6, w: 14, d: 12, r: 1.2 }, 0, 4, view, 3, 0.4),
  slot: flatRect({ x: LEV.x - 1.2, y: LEV.y - 5, w: 2.4, d: 10, r: 1 }, 4, view, 3),
  pivot: cylinder(LEV.x, LEV.y, 2, 4, 2, view, 18, 0.3),
  knob: cylinder(0, 0, 2.6, -1.2, 3, view, 20, 0.6),
};
// Input 0..1 -> lever position.
export const leverRod = (input: number) => P([[LEV.x, LEV.y, LEV.pivotZ], knobPoint(1 - 2 * input)]);
export const knobAt = (input: number) => translateTo(view, knobPoint(1 - 2 * input));

// Glass output tank C (DE style: base, clear shell, lid), four mark rings with numbers, engraved C.
const ring = (z: number, by = 0.05) => flatCircle(OT.x, OT.y, OT.r + by, z, view, 32);
const onShell = (deg: number, z: number, size: number) => {
  const a = (deg * Math.PI) / 180;
  return frontText(OT.x + OT.r * Math.cos(a), OT.y + OT.r * Math.sin(a) + 0.2, z, size);
};
export const ctank = {
  base: cylinder(OT.x, OT.y, OT.r + 1.6, 0, OT.z0, view, 32, 0.3),
  shell: cylinder(OT.x, OT.y, OT.r, OT.z0, OT.h, view, 36),
  lid: cylinder(OT.x, OT.y, OT.r + 0.8, OT.z0 + OT.h, 1.2, view, 32, 0.3),
  rings: Array.from({ length: FLOORS }, (_, k) => ring(OT.z0 + (k + 1) * MARK)).join(""),
  marks: Array.from({ length: FLOORS }, (_, k) => ({ n: k + 1, at: onShell(112, OT.z0 + (k + 1) * MARK - 4.2, 4.4) })),
  cAt: onShell(45, OT.z0 + 3.4, 6.4),
  glow: cylinder(OT.x, OT.y, OT.r + 1.2, 0, OT.z0 + OT.h + 2, view, 32).outline,
  ghost: cylinder(OT.x, OT.y, OT.r + 1.8, 0, OT.z0 + OT.h + 2.4, view, 32).outline,
  // Labels flat on the board in front of the tank (two lines).
  label: (line: 0 | 1, dx = 0) => faceMatrix([OT.x + dx, OT.y + OT.r + 7 + line * 7], 0, view, "x"),
};
export const fluidSvg = (steps: number) =>
  steps < 0.03 ? "" : solidSvg(cylinder(OT.x, OT.y, OT.r - 0.8, OT.z0 + 0.2, Math.max(0.05, steps * MARK - 0.2), view, 32), { tone: "hi", crease: "none" });
export const copyShift = (k: number) => shift([COPY_DX * k, 0, 0]);
export const levelLineAt = (v: number) => ring(OT.z0 + v * MARK, 0.3);

// Packets of charge: wait on the VDD rail right of the strap, slide to it, run down through the PMOS (over its gate),
// along the output bus and into the tank.
export const PACKET_HOMES = [0, 1, 2, 3].map((k): Vec3 => [VALVE_X + 9 + 7 * k, VDD_Y, 1.6]);
const along = (pts: Vec3[], u: number): Vec3 => {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1], p[2] - pts[i][2]));
  const total = seg.reduce((a, b) => a + b, 0);
  let d = Math.min(1, Math.max(0, u)) * total;
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i] || i === seg.length - 1) {
      const k = seg[i] ? Math.min(1, d / seg[i]) : 0;
      const a = pts[i];
      const b = pts[i + 1];
      return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
    }
    d -= seg[i];
  }
  return pts[pts.length - 1];
};
export const packetAt = (home: Vec3, u: number): Vec3 =>
  along(
    [
      home,
      [VALVE_X, VDD_Y, 1.6],
      [VALVE_X, VDD_Y + 3, 0.1],
      [VALVE_X, P_Y - 5, 0.1],
      [VALVE_X, P_Y - 4, VALVE.h + 1.2],
      [VALVE_X, P_Y + 4, VALVE.h + 1.2],
      [VALVE_X, P_Y + 5, 0.1],
      [VALVE_X, NODE_Y, 1.1],
      [BUS_END, NODE_Y, 1.1],
      [OT.x - 3, NODE_Y, OT.z0 + 0.4],
    ],
    u,
  );
// Entrance spark points: building and tank corners, the buckets and Sam's feet.
export const contacts: Vec2[] = [...rectCorners(BLD), ...rectCorners(TANK), ...BUCKET_X.map((x): Vec2 => [x, BUCKET_Y + BUCKET_R]), [SAM.x, SAM.y]].map(([x, y]) => at([x, y, 0]));
export const TOP_Z = TOP;
