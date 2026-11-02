// Decoder intercom: one board (always on screen). x runs right, y toward the viewer (front face +y), z up.
// Analogy: the apartment building at the back (wing A, the stair core with the ROLLIN sign, wing B; per wing two floors
// of a left and a right flat, each a window with its glass-bulb doorbell and a W/F/S check plate), the guard booth at
// the front left with three large-labelled levers, three cables on the board from the booth's right face to two
// junction boxes at the building's foot, and the key plate standing along the board's front.
// Circuit: the building's footprint becomes one memory wall; on its front face 8 rows (row 0 top .. row 7 bottom), each
// a checker block with three dots on the left, the word line, 8 cells and a glass-bulb lamp on the right; above them
// a lever header whose three address wires run straight down through every checker's dots.
// Visibility: the key plate (40 high) stands 64+ units in front of every cable, so it hides none of them (a part of
// height H hides the board about 1.53 H behind it at azimuth 62); parallel cables 12 apart, wall wires 24 apart.
import { boxCorners, fitView, flatPath, flatRect, heightPx, inset, pathD, prism, prismFill, project, rectCorners, type Rect, type Vec2, type Vec3 } from "../../iso/iso-kit";
import { bulbParts } from "../../iso/react/bulb";
import { BITS20, DENSE, FLATS, SIGS, type Flat, type Sig } from "./model";

export const STAGE_W = 600;
const AZIMUTH = 62;
const PAD = 14;

// Board.
export const BOARD: Rect = { x: -146, y: -96, w: 292, d: 244, r: 8 };
const SLAB_H = 8;
const FOOT_H = 4;

// Building.
export const FY = -48; // facade plane
const BY = -88;
const PLINTH = 14;
const FLOOR_H = 114;
const ROOF_Z = PLINTH + 2 * FLOOR_H; // parapet band above
const WING_H = ROOF_Z + 16;
const CORE_H = WING_H + 16;
const WING_A: Rect = { x: -134, y: BY, w: 120, d: 40, r: 1 };
const WING_B: Rect = { x: 14, y: BY, w: 120, d: 40, r: 1 };
const CORE: Rect = { x: -14, y: BY + 2, w: 28, d: 40, r: 1 }; // stands 2 proud of the wings
const CORE_FY = CORE.y + CORE.d;
const BAY_W = 60;

// Check dots and bell size.
export const DOT_R = 9.5;
export const DOT_TAG = 10;
const DOT_STEP = 21;
const BELL_K = 1.6;

// Booth with the intercom panel on its front face (wider than the sample so the lever names read at phone size).
const BOOTH: Rect = { x: -142, y: 30, w: 114, d: 44, r: 1 };
const BOOTH_H = 68;
const BOOTH_FY = BOOTH.y + BOOTH.d;
const BOOTH_X1 = BOOTH.x + BOOTH.w;
const LEVER_X: Record<Sig, number> = { w: -121, f: -85, s: -49 };
const PIVOT_Z = 34;
const TRAVEL = 11;
export const NAME_SIZE = 12.5;
export const VALUE_SIZE = 13;
export const KNOB_R = 6;

// Cables: exit rows on the booth's right face, turn columns, rows at the building's foot, junction boxes.
const EXIT_Y: Record<Sig, number> = { w: 40, f: 52, s: 64 };
const TURN_X: Record<Sig, number> = { w: -18, f: -6, s: 6 };
const ROW_Y: Record<Sig, number> = { w: FY + 6, f: FY + 18, s: FY + 30 };
const BOX_A: Rect = { x: 18, y: FY, w: 8, d: 36, r: 1 };
const BOX_B: Rect = { x: 78, y: FY, w: 8, d: 36, r: 1 };
const BOX_H = 8;

// Key plate standing along the board's front.
const KEY: Rect = { x: -112, y: 132, w: 254, d: 6, r: 1 };
const KEY_H = 40;
export const KEY_SIZE = 14;
export const KEY_SIZE2 = 13.5;

// Stage: board, building and booth at 95 % of the frame width.
const PTS: Vec3[] = [...boxCorners(BOARD, -SLAB_H - FOOT_H, 0), ...boxCorners(WING_A, 0, WING_H), ...boxCorners(WING_B, 0, WING_H), ...boxCorners(CORE, 0, CORE_H)];
const unit = fitView(PTS, STAGE_W, 4000, { pad: PAD, azimuth: AZIMUTH });
const ys = PTS.map((p) => project(p, unit)[1]);
export const STAGE_H = Math.ceil(Math.max(...ys) - Math.min(...ys) + PAD * 2);
export const view = fitView(PTS, STAGE_W, STAGE_H, { pad: PAD, azimuth: AZIMUTH });

export const at = (p: Vec3) => project(p, view);
const r3 = (v: number) => Math.round(v * 1e3) / 1e3;
const P = (pts: Vec3[], close = false) => pathD(pts.map(at), close);
// Screen offset of a lift by dz board units (for sinking and lifting groups).
export const liftPx = (dz: number) => heightPx(dz, view);

// Text on a front face (+y plane at depth y), upright, centred on height z for a char of size `size`.
export const frontText = (x: number, y: number, z: number, size: number) => {
  const p: Vec3 = [x, y, z - size * 0.36];
  const o = at(p);
  const ax = at([p[0] + 1, p[1], p[2]]);
  const az = at([p[0], p[1], p[2] - 1]);
  return `matrix(${r3(ax[0] - o[0])} ${r3(ax[1] - o[1])} ${r3(az[0] - o[0])} ${r3(az[1] - o[1])} ${r3(o[0])} ${r3(o[1])})`;
};
// Shapes in a front plane at depth y.
const fRect = (y: number, x0: number, x1: number, z0: number, z1: number) => P([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], true);
const fLine = (y: number, pts: [number, number][]) => P(pts.map(([x, z]) => [x, y, z] as Vec3));
const fArc = (y: number, cx: number, cz: number, r: number, a0: number, a1: number, seg = 40): Vec2[] =>
  Array.from({ length: seg + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / seg;
    return at([cx + Math.cos(a) * r, y, cz + Math.sin(a) * r]);
  });
const fCircle = (y: number, cx: number, cz: number, r: number, seg = 32) => pathD(fArc(y, cx, cz, r, 0, Math.PI * 2, seg), true);

// Board engraving on the front face, centred.
export const ENGRAVE = "ROLLIN-रोलिन-ROLLIN-रोलिन";
export const ENGRAVE_SIZE = 3.6;
export const engraveAt = frontText(BOARD.x + BOARD.w / 2, BOARD.y + BOARD.d, -SLAB_H / 2, ENGRAVE_SIZE);

export function boardSvg() {
  const b = BOARD;
  const rings = rectCorners(b, 7)
    .map(([x, y]) => flatPath(Array.from({ length: 14 }, (_, k): Vec2 => [x + 1.8 * Math.cos((k * Math.PI) / 7), y + 1.8 * Math.sin((k * Math.PI) / 7)]), 0, view, true))
    .join("");
  return {
    halo: prismFill(b, -SLAB_H - FOOT_H, SLAB_H, view),
    feet: rectCorners(b, 14).map(([x, y]) => prism({ x: x - 5, y: y - 5, w: 10, d: 10, r: 5 }, -SLAB_H - FOOT_H, FOOT_H, view, 6, 0.4)),
    slab: prism(b, -SLAB_H, SLAB_H, view, 6, 1.2),
    inset: flatRect(inset(b, 3.5), 0, view),
    rings,
  };
}

// ---------- Building ----------

const wing = (r: Rect) => {
  const y = FY + 0.05;
  const x0 = r.x;
  const x1 = r.x + r.w;
  return {
    body: prism(r, 0, WING_H, view, 3, 0.5),
    coping: prism({ x: r.x - 1.2, y: r.y - 1.2, w: r.w + 2.4, d: r.d + 2.4, r: 1 }, WING_H, 2.5, view, 3, 0.3),
    plinth: fRect(y, x0, x1, 0, PLINTH),
    slab: fRect(y + 0.02, x0, x1, PLINTH + FLOOR_H - 1.5, PLINTH + FLOOR_H + 1.5),
    parapet: fLine(y, [[x0, ROOF_Z + 1], [x1, ROOF_Z + 1]]),
  };
};
export const wings = [wing(WING_A), wing(WING_B)];
export const WING_SIZE = 15;
export const wingText = {
  A: frontText(WING_A.x + WING_A.w / 2, FY + 0.15, ROOF_Z + 8.5, WING_SIZE),
  B: frontText(WING_B.x + WING_B.w / 2, FY + 0.15, ROOF_Z + 8.5, WING_SIZE),
};

const cy = CORE_FY + 0.05;
const cx0 = CORE.x;
const cx1 = CORE.x + CORE.w;
export const core = {
  body: prism(CORE, 0, CORE_H, view, 3, 0.5),
  coping: prism({ x: CORE.x - 1.2, y: CORE.y - 1.2, w: CORE.w + 2.4, d: CORE.d + 2.4, r: 1 }, CORE_H, 2.5, view, 3, 0.3),
  step: prism({ x: cx0 + 5, y: CORE_FY, w: CORE.w - 10, d: 5, r: 0.5 }, 0, 2.5, view, 2, 0.2),
  door: fRect(cy, cx0 + 7, cx1 - 7, 2.5, 40),
  doorSplit: fLine(cy + 0.02, [[0, 2.5], [0, 40]]),
  sign: fRect(cy + 0.05, cx0 + 3, cx1 - 3, 45, 56),
  stairs: [86, 150, 205].map((z) => fRect(cy, -4.5, 4.5, z, z + 30)).join(""),
  stairBars: [86, 150, 205].map((z) => fLine(cy + 0.02, [[-4.5, z + 15], [4.5, z + 15]])).join(""),
};
export const BRAND_SIZE = 6;
export const brandAt = frontText(0, cy + 0.15, 50.5, BRAND_SIZE);

// Per flat: window with sill (and a balcony on the first floor), bell on a bracket, plate with the three dots.
const flatWindow = (f: Flat) => {
  const b = (f.bits.w ? WING_B.x : WING_A.x) + 2 + f.bits.s * BAY_W;
  const f0 = PLINTH + f.bits.f * FLOOR_H;
  return { b, f0, w0: b + 5, w1: b + 31, wz0: f0 + 14, wz1: f0 + 92 };
};
const windowPaths = (y: number, w0: number, w1: number, wz0: number, wz1: number, transom: number) => ({
  frame: fRect(y, w0, w1, wz0, wz1),
  glass: fRect(y + 0.02, w0 + 2.2, w1 - 2.2, wz0 + 2.2, wz1 - 2.2),
  mullion: fLine(y + 0.04, [[(w0 + w1) / 2, wz0 + 2.2], [(w0 + w1) / 2, wz1 - 2.2]]) + fLine(y + 0.04, [[w0 + 2.2, wz1 - transom], [w1 - 2.2, wz1 - transom]]),
});
export const flats = FLATS.map((f: Flat) => {
  const { b, f0, w0, w1, wz0, wz1 } = flatWindow(f);
  const y = FY + 0.05;
  const px = b + 45; // plate and bell centre x
  const lz = f0 + 82; // bracket bottom
  const bz = lz + 2; // bulb base
  const base = at([px, FY + 7, bz]);
  const globeZ = bz + BELL_K * (1.6 + 3 + 4.8);
  const balcony = f.bits.f === 1;
  const g = at([px, FY + 7, 0]);
  return {
    flat: f,
    ...windowPaths(y, w0, w1, wz0, wz1, 16),
    shine: fLine(y + 0.06, [[w0 + 5, wz1 - 22], [w0 + 9, wz1 - 30]]),
    sill: prism({ x: w0 - 2, y: FY, w: w1 - w0 + 4, d: 3.5, r: 0.4 }, wz0 - 2.5, 2.5, view, 2, 0.2),
    balcony: balcony
      ? {
          slab: prism({ x: w0 - 4, y: FY, w: w1 - w0 + 8, d: 11, r: 0.6 }, wz0 - 3, 3, view, 2, 0.3),
          rail:
            fLine(FY + 11, [[w0 - 4, wz0 + 12], [w1 + 4, wz0 + 12]]) +
            Array.from({ length: 9 }, (_, i) => fLine(FY + 11, [[w0 - 4 + (i * (w1 - w0 + 8)) / 8, wz0], [w0 - 4 + (i * (w1 - w0 + 8)) / 8, wz0 + 12]])).join("") +
            P([[w0 - 4, FY, wz0 + 12], [w0 - 4, FY + 11, wz0 + 12]]) +
            P([[w1 + 4, FY, wz0 + 12], [w1 + 4, FY + 11, wz0 + 12]]),
        }
      : null,
    bracket: prism({ x: px - 8, y: FY, w: 16, d: 14, r: 0.8 }, lz, 2, view, 2, 0.3),
    bulb: bulbParts([px, FY + 7], view, { baseR: 4.2, h: 3 }),
    // Bulb drawn at board level, then lifted onto the bracket and scaled about its base.
    bulbTransform: `translate(${r3(base[0])} ${r3(base[1])}) scale(${BELL_K}) translate(${r3(-g[0])} ${r3(-g[1])})`,
    plate: fRect(y + 0.1, px - DOT_R - 2.5, px + DOT_R + 2.5, f0 + 4, f0 + 4 + 2 * DOT_STEP + 2 * DOT_R + 5),
    dots: SIGS.map((k, i) => {
      const z = f0 + 4 + 2.5 + DOT_R + (2 - i) * DOT_STEP; // W top, F middle, S bottom
      return { k, d: fCircle(y + 0.3, px, z, DOT_R, 40), label: frontText(px, y + 0.4, z, DOT_TAG) };
    }),
    // Sound: ( o ) pairs of arcs either side of the globe, in the front plane through the globe.
    arcs: [15, 21, 27].map((r) => pathD(fArc(FY + 7, px, globeZ, r, -0.6, 0.6, 16)) + pathD(fArc(FY + 7, px, globeZ, r, Math.PI - 0.6, Math.PI + 0.6, 16))),
    wallGlow: fCircle(y + 0.08, px, globeZ, 30, 48),
  };
});

// Cables on the board: booth's right face, turn back toward the building, run along its foot through box A to box B.
export const cables = SIGS.map((k) => ({
  k,
  d: P([
    [BOOTH_X1, EXIT_Y[k], 0.3],
    [TURN_X[k], EXIT_Y[k], 0.3],
    [TURN_X[k], ROW_Y[k], 0.3],
    [BOX_B.x + BOX_B.w / 2, ROW_Y[k], 0.3],
  ]),
}));
export const boxes = [BOX_A, BOX_B].map((r) => ({
  body: prism(r, 0, BOX_H, view, 2, 0.5),
  lid: flatRect(inset(r, 2), BOX_H + 0.05, view, 2),
}));

// ---------- Levers (booth and wall share the drawing) ----------

export type LeverGeo = { x: number; y: number; pivot: number; travel: number };
export const leverTip = (l: LeverGeo, pos: number) => at([l.x, l.y + 12, l.pivot - pos * l.travel]); // pos +1 = down
export const leverRod = (l: LeverGeo, pos: number) => pathD([at([l.x, l.y + 0.2, l.pivot]), leverTip(l, pos)]);
const leverStatic = (l: LeverGeo, slotW: number) => ({
  slot: fRect(l.y + 0.03, l.x - slotW, l.x + slotW, l.pivot - l.travel - 1, l.pivot + l.travel + 1),
  boss: fCircle(l.y + 0.05, l.x, l.pivot, slotW + 1.8, 24),
});

// Guard booth: body, overhanging roof, window on the right face, panel on the front face with three levers.
const rx = BOOTH_X1 + 0.05;
const by = BOOTH_FY + 0.05;
export const booth = {
  body: prism(BOOTH, 0, BOOTH_H, view, 3, 0.5),
  roof: prism({ x: BOOTH.x - 4, y: BOOTH.y - 4, w: BOOTH.w + 8, d: BOOTH.d + 8, r: 1 }, BOOTH_H, 4, view, 3, 0.4),
  window: P([[rx, BOOTH.y + 7, 30], [rx, BOOTH.y + BOOTH.d - 7, 30], [rx, BOOTH.y + BOOTH.d - 7, 56], [rx, BOOTH.y + 7, 56]], true),
  windowBar: P([[rx + 0.02, BOOTH.y + BOOTH.d / 2, 30], [rx + 0.02, BOOTH.y + BOOTH.d / 2, 56]]),
  panel: fRect(by, BOOTH.x + 3, BOOTH_X1 - 3, 8, 64),
  levers: SIGS.map((k) => {
    const x = LEVER_X[k];
    const geo: LeverGeo = { x, y: by, pivot: PIVOT_Z, travel: TRAVEL };
    return {
      k,
      geo,
      ...leverStatic(geo, 3),
      name: frontText(x, by + 0.1, 56, NAME_SIZE),
      v0: frontText(x + 12.5, by + 0.1, PIVOT_Z + 7, VALUE_SIZE),
      v1: frontText(x + 12.5, by + 0.1, PIVOT_Z - 7, VALUE_SIZE),
    };
  }),
};

// ---------- Key plate ----------

const ky = KEY.y + KEY.d + 0.05;
export const keyPlate = {
  body: prism(KEY, 0, KEY_H, view, 3, 0.4),
  face: fRect(ky, KEY.x + 3, KEY.x + KEY.w - 3, 3, KEY_H - 3),
  // Line 1: three entries; line 2: the filled-dot meaning.
  lines: SIGS.map((k, i) => ({ k, at: frontText(KEY.x + 8 + i * 82, ky + 0.1, 28, KEY_SIZE) })),
  match: frontText(KEY.x + 26, ky + 0.1, 12, KEY_SIZE2),
  matchDot: fCircle(ky + 0.1, KEY.x + 15, 12, 5, 24),
};

// ---------- Memory wall (circuit) ----------

const WALL: Rect = { x: -134, y: BY, w: 268, d: 40, r: 1 };
const wy = FY + 0.05;
const ROW_Z0 = 12;
export const ROW_P = 25.5;
const zb = (r: number) => ROW_Z0 + (7 - r) * ROW_P; // row bottom
const zc = (r: number) => zb(r) + ROW_P / 2;
const WIRE_X: Record<Sig, number> = { w: -114, f: -90, s: -66 };
const CHECK = { x0: -126, x1: -54 };
const CDOT_R = 8.5;
export const CDOT_TAG = 9;
const CELL0 = -36;
const CELL_P = 16;
const CELL_W = 13;
const LAMP_X = 106;
const LAMP_K = 1.1;
const LINE_Z = 5; // word line height above the row bottom
const HEAD = { z0: 222, z1: 256 };
const WALL_PIVOT = 239;
export const ROWNUM_SIZE = 10;
export const CELL_SIZE = 10;
export const WVALUE_SIZE = 10;

export const wall = {
  body: prism(WALL, 0, WING_H, view, 3, 0.5),
  coping: prism({ x: WALL.x - 1.2, y: WALL.y - 1.2, w: WALL.w + 2.4, d: WALL.d + 2.4, r: 1 }, WING_H, 2.5, view, 3, 0.3),
  plinth: fRect(wy, WALL.x, WALL.x + WALL.w, 0, 8),
  header: fRect(wy + 0.05, CHECK.x0 - 4, CHECK.x1 + 8, HEAD.z0, HEAD.z1),
  levers: SIGS.map((k) => {
    const geo: LeverGeo = { x: WIRE_X[k], y: wy + 0.1, pivot: WALL_PIVOT, travel: 10 };
    return {
      k,
      geo,
      ...leverStatic(geo, 2.6),
      v0: frontText(WIRE_X[k] + 9.5, wy + 0.2, WALL_PIVOT + 6, WVALUE_SIZE),
      v1: frontText(WIRE_X[k] + 9.5, wy + 0.2, WALL_PIVOT - 6, WVALUE_SIZE),
    };
  }),
  // Address wires: from each lever's pivot straight down through every checker's dot.
  wires: SIGS.map((k) => ({ k, d: fLine(wy + 0.12, [[WIRE_X[k], WALL_PIVOT - 4], [WIRE_X[k], ROW_Z0 - 4]]) })),
  column: fRect(wy + 0.4, CHECK.x0 - 3, CHECK.x1 + 3, zb(7) - 1, zb(0) + ROW_P + 1),
  rows: FLATS.map((f) => {
    const r = f.row;
    const lz = zc(r) - 1.6 - LAMP_K * 9.4; // globe centre level with the row's middle (the word line)
    const base = at([LAMP_X, FY + 4, lz + 1.6]);
    const g = at([LAMP_X, FY + 4, 0]);
    const globeZ = lz + 1.6 + LAMP_K * (1.6 + 3 + 4.8);
    return {
      flat: f,
      checker: fRect(wy + 0.08, CHECK.x0, CHECK.x1, zc(r) - 10.5, zc(r) + 10.5),
      dots: SIGS.map((k) => ({ k, d: fCircle(wy + 0.3, WIRE_X[k], zc(r), CDOT_R, 32), label: frontText(WIRE_X[k], wy + 0.4, zc(r), CDOT_TAG) })),
      num: frontText(-45, wy + 0.2, zb(r) + 15, ROWNUM_SIZE),
      band: fRect(wy + 0.06, CELL0 - 3, CELL0 + 7 * CELL_P + CELL_W + 3, zb(r) + 1.5, zb(r) + ROW_P - 1.5),
      cells: Array.from({ length: 8 }, (_, i) => fRect(wy + 0.1, CELL0 + i * CELL_P, CELL0 + i * CELL_P + CELL_W, zb(r) + 9, zb(r) + 22)),
      cellText: Array.from({ length: 8 }, (_, i) => ({ x: CELL0 + i * CELL_P + CELL_W / 2, y: wy + 0.3, z: zb(r) + 15.5 })),
      lineFrom: CHECK.x1,
      lineTo: LAMP_X - 6,
      lineZ: zc(r),
      bracket: prism({ x: LAMP_X - 7, y: FY, w: 14, d: 8, r: 0.8 }, lz, 1.6, view, 2, 0.3),
      bulb: bulbParts([LAMP_X, FY + 4], view, { baseR: 4.2, h: 3 }),
      bulbTransform: `translate(${r3(base[0])} ${r3(base[1])}) scale(${LAMP_K}) translate(${r3(-g[0])} ${r3(-g[1])})`,
      ghostBell: fCircle(FY + 4, LAMP_X, globeZ, 11, 32),
    };
  }),
  // "Each flat becomes one row": a ghost of the flat's window laid over row 5.
  ghostWindow: windowPaths(wy + 0.5, CELL0 - 3, CELL0 + 7 * CELL_P + CELL_W + 3, zb(5) + 1.5, zb(5) + ROW_P - 1.5, 9),
  rowOutline: (r: number) => fRect(wy + 0.5, CELL0 - 4, CELL0 + 7 * CELL_P + CELL_W + 4, zb(r) + 0.5, zb(r) + ROW_P - 0.5),
};
// Address plate (circuit): stands on the board under the levers, Oxanium digits for bit 2, bit 1, bit 0.
const ADDR: Rect = { x: -130, y: 26, w: 100, d: 6, r: 1 };
const ADDR_H = 40;
const ay = ADDR.y + ADDR.d + 0.05;
export const ADDR_TAG = 9;
export const ADDR_SIZE = 24;
export const addrPlate = {
  body: prism(ADDR, 0, ADDR_H, view, 3, 0.4),
  face: fRect(ay, ADDR.x + 3, ADDR.x + ADDR.w - 3, 3, ADDR_H - 3),
  tag: frontText(ADDR.x + ADDR.w / 2, ay + 0.1, 30.5, ADDR_TAG),
  digits: SIGS.map((k, i) => ({ k, at: frontText(ADDR.x + 22 + i * 28, ay + 0.1, 13.5, ADDR_SIZE) })),
};

// Word line from the checker to the lamp; `u` (0..1) is how far it has run.
export const wordLine = (r: number, u: number) => {
  const w = wall.rows[r];
  return fLine(wy + 0.14, [[w.lineFrom, w.lineZ], [w.lineFrom + (w.lineTo - w.lineFrom) * Math.max(0.001, u), w.lineZ]]);
};
export const cellTextAt = (x: number, y: number, z: number) => frontText(x, y, z, CELL_SIZE);

// Scale-up sketches on the wall face: a fourth lever and 16 rows; 20 small levers and a dense block of thin rows.
const X4 = -42;
export const lever4 = (() => {
  const geo: LeverGeo = { x: X4, y: wy + 0.1, pivot: WALL_PIVOT, travel: 10 };
  return { geo, ...leverStatic(geo, 2.6), rod: leverRod(geo, -1), tip: leverTip(geo, -1), slide: at([X4 + 40, wy, WALL_PIVOT]), home: at([X4, wy, WALL_PIVOT]) };
})();
export const scale16 = (() => {
  const p = (ROW_P * 8) / 16;
  const z = (r: number) => ROW_Z0 + (15 - r) * p;
  const xs = [WIRE_X.w, WIRE_X.f, WIRE_X.s, X4];
  return {
    wires: xs.map((x) => fLine(wy + 0.12, [[x, WALL_PIVOT - 4], [x, ROW_Z0 - 4]])).join(""),
    rows: Array.from({ length: 16 }, (_, r) => ({
      checker: fRect(wy + 0.08, CHECK.x0, X4 + 8, z(r) + 1.2, z(r) + p - 1.2),
      dots: xs.map((x) => fCircle(wy + 0.3, x, z(r) + p / 2, 3.6, 16)).join(""),
      band: fRect(wy + 0.1, CELL0 + 10, CELL0 + 7 * CELL_P + CELL_W, z(r) + 2, z(r) + p - 2),
      line: fLine(wy + 0.14, [[X4 + 8, z(r) + p / 2], [LAMP_X - 5, z(r) + p / 2]]),
      lamp: fCircle(wy + 0.3, LAMP_X, z(r) + p / 2, 4, 20),
    })),
  };
})();
export const scale20 = (() => {
  const xs = Array.from({ length: 20 }, (_, i) => CHECK.x0 + 2 + i * 8.6);
  const p = (ROW_P * 8) / DENSE;
  return {
    header: fRect(wy + 0.08, CHECK.x0 - 4, xs[19] + 6, HEAD.z0, HEAD.z1),
    levers: xs.map((x, i) => ({
      slot: fRect(wy + 0.12, x - 1.4, x + 1.4, WALL_PIVOT - 9, WALL_PIVOT + 9),
      rod: fLine(wy + 4, [[x, WALL_PIVOT], [x, WALL_PIVOT + (BITS20[i] ? -8 : 8)]]),
      tip: at([x, wy + 4, WALL_PIVOT + (BITS20[i] ? -8 : 8)]),
    })),
    wires: xs.map((x) => fLine(wy + 0.12, [[x, WALL_PIVOT - 9], [x, ROW_Z0 - 4]])).join(""),
    rows: Array.from({ length: DENSE }, (_, r) => fLine(wy + 0.2, [[CHECK.x0, ROW_Z0 + (DENSE - 1 - r) * p + p / 2], [LAMP_X + 6, ROW_Z0 + (DENSE - 1 - r) * p + p / 2]])),
  };
})();

// Entrance spark points: the building's and the booth's front corners, the key plate's ends.
export const contacts: Vec2[] = [
  at([WING_A.x, FY, 0]),
  at([WING_B.x + WING_B.w, FY, 0]),
  at([WING_B.x + WING_B.w, BY, 0]),
  at([BOOTH.x, BOOTH_FY, 0]),
  at([BOOTH_X1, BOOTH_FY, 0]),
  at([KEY.x, KEY.y + KEY.d, 0]),
  at([KEY.x + KEY.w, KEY.y + KEY.d, 0]),
];
