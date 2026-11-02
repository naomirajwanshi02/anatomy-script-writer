// Decoder intercom still sample: one board (always on screen) with an apartment building at the back and the guard
// booth at the front left. x runs right, y toward the viewer (front face +y), z up.
// Building, left to right: wing A, the entrance/stair core (taller, ROLLIN sign over the door), wing B. Each wing has a
// plinth band, two floors split by a slab line, a flat roof with parapet and coping, and per floor a left and a right
// flat. A flat is a tall window (frame, glass, mullion, transom, sill; first floor adds a balcony with railing) with
// its doorbell on a bracket to the right and the check plate (dots W, F, S stacked) right under the bell.
// The three cables run on the board from the booth's side to the junction box at wing A's foot, then on to the box at
// wing B's foot; parallel runs are 14 units apart across y and 10 units apart across x (both >= 25 frame px).
import { boxCorners, fitView, flatPath, flatRect, inset, pathD, prism, prismFill, project, rectCorners, type Rect, type Vec2, type Vec3 } from "../../iso/iso-kit";
import { bulbParts } from "../../iso/react/bulb";
import { FLATS, LEVERS, SIGS, type Flat, type Sig } from "./model";

export const STAGE_W = 600;
const AZIMUTH = 62;
const PAD = 14;

// Board.
export const BOARD: Rect = { x: -146, y: -96, w: 292, d: 188, r: 8 };
const SLAB_H = 8;
const FOOT_H = 4;

// Building.
const FY = -48; // facade plane
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

// Booth with the intercom panel on its front face.
const BOOTH: Rect = { x: -142, y: 34, w: 86, d: 40, r: 1 };
const BOOTH_H = 58;
const BOOTH_FY = BOOTH.y + BOOTH.d;
const BOOTH_X1 = BOOTH.x + BOOTH.w;
const LEVER_X: Record<Sig, number> = { w: -127, f: -101, s: -75 };
const PIVOT_Z = 28;
export const NAME_SIZE = 8.5;
export const VALUE_SIZE = 10;
export const KNOB_R = 5.5;

// Cables: exit rows on the booth's right face, turn columns, rows at the building's foot, junction boxes.
const EXIT_Y: Record<Sig, number> = { w: 40, f: 54, s: 68 };
const TURN_X: Record<Sig, number> = { w: -48, f: -38, s: -28 };
const ROW_Y: Record<Sig, number> = { w: FY + 10, f: FY + 24, s: FY + 38 };
const BOX_A: Rect = { x: -24, y: FY, w: 8, d: 46, r: 1 };
const BOX_B: Rect = { x: 18, y: FY, w: 8, d: 46, r: 1 };
const BOX_H = 8;

// Stage: board, building and booth at 95 % of the frame width.
const PTS: Vec3[] = [...boxCorners(BOARD, -SLAB_H - FOOT_H, 0), ...boxCorners(WING_A, 0, WING_H), ...boxCorners(WING_B, 0, WING_H), ...boxCorners(CORE, 0, CORE_H)];
const unit = fitView(PTS, STAGE_W, 4000, { pad: PAD, azimuth: AZIMUTH });
const ys = PTS.map((p) => project(p, unit)[1]);
export const STAGE_H = Math.ceil(Math.max(...ys) - Math.min(...ys) + PAD * 2);
export const view = fitView(PTS, STAGE_W, STAGE_H, { pad: PAD, azimuth: AZIMUTH });

export const at = (p: Vec3) => project(p, view);
const r3 = (v: number) => Math.round(v * 1e3) / 1e3;
const P = (pts: Vec3[], close = false) => pathD(pts.map(at), close);

// Text on a front face (+y plane at depth y), upright, centred on height z for a char of size `size`.
const frontText = (x: number, y: number, z: number, size: number) => {
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

// Wings: body, coping, plinth band, floor slab line, parapet line, wing letter.
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

// Core: body, coping, double door with steps, ROLLIN sign over it, a narrow stair window per floor.
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
export const flats = FLATS.map((f: Flat) => {
  const b = (f.bits.w ? WING_B.x : WING_A.x) + 2 + f.bits.s * BAY_W;
  const f0 = PLINTH + f.bits.f * FLOOR_H;
  const y = FY + 0.05;
  const w0 = b + 5;
  const w1 = b + 31;
  const wz0 = f0 + 14;
  const wz1 = f0 + 92;
  const px = b + 45; // plate and bell centre x
  const lz = f0 + 82; // bracket bottom
  const bz = lz + 2; // bulb base
  const base = at([px, FY + 7, bz]);
  const globeZ = bz + BELL_K * (1.6 + 3 + 4.8);
  const balcony = f.bits.f === 1;
  return {
    flat: f,
    frame: fRect(y, w0, w1, wz0, wz1),
    glass: fRect(y + 0.02, w0 + 2.2, w1 - 2.2, wz0 + 2.2, wz1 - 2.2),
    mullion: fLine(y + 0.04, [[(w0 + w1) / 2, wz0 + 2.2], [(w0 + w1) / 2, wz1 - 2.2]]) + fLine(y + 0.04, [[w0 + 2.2, wz1 - 16], [w1 - 2.2, wz1 - 16]]),
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
    bulbTransform: (() => {
      const g = at([px, FY + 7, 0]);
      return `translate(${r3(base[0])} ${r3(base[1])}) scale(${BELL_K}) translate(${r3(-g[0])} ${r3(-g[1])})`;
    })(),
    plate: fRect(y + 0.1, px - DOT_R - 2.5, px + DOT_R + 2.5, f0 + 4, f0 + 4 + 2 * DOT_STEP + 2 * DOT_R + 5),
    dots: SIGS.map((k, i) => {
      const z = f0 + 4 + 2.5 + DOT_R + (2 - i) * DOT_STEP; // W top, F middle, S bottom
      return { k, d: pathD(fArc(y + 0.3, px, z, DOT_R, 0, Math.PI * 2), true), label: frontText(px, y + 0.4, z, DOT_TAG) };
    }),
    // Sound: ( o ) pairs of arcs either side of the globe, in the front plane through the globe.
    arcs: [15, 21, 27].map((r) => pathD(fArc(FY + 7, px, globeZ, r, -0.6, 0.6, 16)) + pathD(fArc(FY + 7, px, globeZ, r, Math.PI - 0.6, Math.PI + 0.6, 16))),
    wallGlow: pathD(fArc(y + 0.08, px, globeZ, 30, 0, Math.PI * 2, 48), true),
  };
});

// Cables on the board: booth side, turn back toward the building, run along its foot through box A to box B.
export const cables = SIGS.map((k) => ({
  k,
  d: P([
    [BOOTH_X1, EXIT_Y[k], 0.3],
    [TURN_X[k], EXIT_Y[k], 0.3],
    [TURN_X[k], ROW_Y[k], 0.3],
    [BOX_B.x, ROW_Y[k], 0.3],
  ]),
}));
export const boxes = [BOX_A, BOX_B].map((r) => ({
  body: prism(r, 0, BOX_H, view, 2, 0.5),
  lid: flatRect(inset(r, 2), BOX_H + 0.05, view, 2),
}));

// Guard booth: body, overhanging roof, window on the right face, panel on the front face with three levers.
const rx = BOOTH_X1 + 0.05;
const by = BOOTH_FY + 0.05;
export const booth = {
  body: prism(BOOTH, 0, BOOTH_H, view, 3, 0.5),
  roof: prism({ x: BOOTH.x - 4, y: BOOTH.y - 4, w: BOOTH.w + 8, d: BOOTH.d + 8, r: 1 }, BOOTH_H, 4, view, 3, 0.4),
  window: P([[rx, BOOTH.y + 7, 26], [rx, BOOTH.y + BOOTH.d - 7, 26], [rx, BOOTH.y + BOOTH.d - 7, 48], [rx, BOOTH.y + 7, 48]], true),
  windowBar: P([[rx + 0.02, BOOTH.y + BOOTH.d / 2, 26], [rx + 0.02, BOOTH.y + BOOTH.d / 2, 48]]),
  panel: fRect(by, BOOTH.x + 3, BOOTH_X1 - 3, 6, 55),
  levers: SIGS.map((k) => {
    const x = LEVER_X[k];
    const down = LEVERS[k] === 1; // second value (B, 1, R) = lever down
    const tip = at([x, by + 12, PIVOT_Z + (down ? -12 : 12)]);
    return {
      k,
      slot: fRect(by + 0.03, x - 2.8, x + 2.8, PIVOT_Z - 12, PIVOT_Z + 12),
      boss: pathD(fArc(by + 0.05, x, PIVOT_Z, 4.5, 0, Math.PI * 2, 24), true),
      rod: pathD([at([x, by + 0.2, PIVOT_Z]), tip]),
      tip,
      name: frontText(x, by + 0.1, 48, NAME_SIZE),
      v0: frontText(x + 9, by + 0.1, PIVOT_Z + 8, VALUE_SIZE),
      v1: frontText(x + 9, by + 0.1, PIVOT_Z - 8, VALUE_SIZE),
    };
  }),
};

// Entrance spark points: the building's and the booth's front corners.
export const contacts: Vec2[] = [
  at([WING_A.x, FY, 0]),
  at([WING_B.x + WING_B.w, FY, 0]),
  at([WING_B.x + WING_B.w, BY, 0]),
  at([BOOTH.x, BOOTH_FY, 0]),
  at([BOOTH_X1, BOOTH_FY, 0]),
];
