// BCD clock still sample: a square board (always on screen) with a digital alarm clock standing on it and a
// callout plate on the board's front right.
import {
  boxCorners,
  cylinder,
  faceMatrix,
  fitView,
  flatCircle,
  flatRect,
  inset,
  pathD,
  prism,
  prismFill,
  project,
  rectCorners,
  solidSvg,
  type Rect,
  type SolidPaths,
  type Vec2,
  type Vec3,
} from "../../iso/iso-kit";
import { DIGITS, litSegments } from "./model";

export const STAGE_W = 600;
const AZIMUTH = 62;
const PAD = 12;
const A = (AZIMUTH * Math.PI) / 180;
const E = (30 * Math.PI) / 180;

// Board.
const BOARD: Rect = { x: -63, y: -63, w: 126, d: 126, r: 7 };
const SLAB_H = 8;
const FOOT_H = 4;

// Alarm clock (board units): wedge body extruded along x; side profile in (y, z).
const CLOCK = { x0: -46, x1: 46 };
const FEET_H = 2.6;
const BACK_Y = -46;
const TOP_FRONT_Y = -30;
const TOP_Z = 50;
const LIP_Y = 2;
const LIP_Z = 9;
// Sloped face from (TOP_FRONT_Y, TOP_Z) to (LIP_Y, LIP_Z): length and unit vectors.
const SLOPE_DY = LIP_Y - TOP_FRONT_Y;
const SLOPE_DZ = LIP_Z - TOP_Z;
const SLOPE_LEN = Math.hypot(SLOPE_DY, SLOPE_DZ);
const DOWN: [number, number] = [SLOPE_DY / SLOPE_LEN, SLOPE_DZ / SLOPE_LEN]; // down the slope (y, z)
const NORMAL: [number, number] = [-DOWN[1], DOWN[0]]; // outward (y, z): toward the viewer and up

// Point on the sloped face: x across, v down the slope from its top edge, lift along the outward normal.
const S = (x: number, v: number, lift = 0): Vec3 => [x, TOP_FRONT_Y + DOWN[0] * v + NORMAL[0] * lift, TOP_Z + DOWN[1] * v + NORMAL[1] * lift];

// Display window on the face, the four digit cells and the colon gap.
const WIN = { x0: -33, x1: 33, v0: 9, v1: 33 };
const DIG_W = 9;
const DIG_H = 16;
const SEG_T = 2;
const SEG_GAP = 0.4;
const CELL_W = 13.5;
const COLON_W = 6;
const CELL_X = [-COLON_W / 2 - CELL_W * 1.5, -COLON_W / 2 - CELL_W * 0.5, COLON_W / 2 + CELL_W * 0.5, COLON_W / 2 + CELL_W * 1.5];
const DIG_V = (WIN.v0 + WIN.v1) / 2 - DIG_H / 2;

// Callout plate on the board's front right, with a blue LCD strip.
const PLATE: Rect = { x: 0, y: 24, w: 58, d: 32, r: 3 };
const PLATE_H = 3.5;
const LCD: Rect = { x: 3, y: 27, w: 52, d: 26, r: 2 };
const LCD_Z = PLATE_H + 0.1;
const BOX_W = 10;
const BOX_D = 15;
const BOX_COLON = 5;
export const CALL_CHAR = 12.5;

// Stage: fit the board and clock to the width, then size the height to match.
const PTS: Vec3[] = [...boxCorners(BOARD, -SLAB_H - FOOT_H, 0), ...boxCorners({ x: CLOCK.x0, y: BACK_Y, w: CLOCK.x1 - CLOCK.x0, d: 10 }, 0, TOP_Z + FEET_H + 4)];
const tall = fitView(PTS, STAGE_W, 4000, { pad: PAD, azimuth: AZIMUTH });
const ys = PTS.map((p) => project(p, tall)[1]);
export const STAGE_H = Math.ceil(Math.max(...ys) - Math.min(...ys) + PAD * 2);
export const view = fitView(PTS, STAGE_W, STAGE_H, { pad: PAD, azimuth: AZIMUTH });

const at = (p: Vec3) => project(p, view);
const r3 = (v: number) => Math.round(v * 1e3) / 1e3;

// Text on a front face (+y), reading along +x, upright along +z.
const frontMatrix = (p: Vec3) => {
  const o = at(p);
  const ax = at([p[0] + 1, p[1], p[2]]);
  const az = at([p[0], p[1], p[2] - 1]);
  return `matrix(${r3(ax[0] - o[0])} ${r3(ax[1] - o[1])} ${r3(az[0] - o[0])} ${r3(az[1] - o[1])} ${r3(o[0])} ${r3(o[1])})`;
};

// Text laid on the sloped face at (x, v), reading along +x, its baseline down the slope.
const slopeMatrix = (x: number, v: number, lift = 0) => {
  const o = at(S(x, v, lift));
  const a = at(S(x + 1, v, lift));
  const b = at(S(x, v + 1, lift));
  return `matrix(${r3(a[0] - o[0])} ${r3(a[1] - o[1])} ${r3(b[0] - o[0])} ${r3(b[1] - o[1])} ${r3(o[0])} ${r3(o[1])})`;
};
const slopePoly = (pts: Vec2[], lift = 0) => pathD(pts.map(([x, v]) => at(S(x, v, lift))), true);

// Engraving on the board's front face (+y), centred, upright.
export const ENGRAVE = "ROLLIN-रोलिन-ROLLIN-रोलिन";
export const ENGRAVE_SIZE = 3.6;
export const boardEngrave = frontMatrix([BOARD.x + BOARD.w / 2, BOARD.y + BOARD.d, -SLAB_H / 2 - ENGRAVE_SIZE * 0.36]);

const depth = ([x, y, z]: Vec3) => (x * Math.cos(A) + y * Math.sin(A)) * Math.cos(E) + z * Math.sin(E);
const backToFront = (pts: Vec2[]) => [...pts].sort((p, q) => depth([p[0], p[1], 0]) - depth([q[0], q[1], 0]));

export const boardSvg = (() => {
  const b = BOARD;
  const feet = backToFront(rectCorners(b, 14))
    .map(([x, y]) => solidSvg(cylinder(x, y, 5, -SLAB_H - FOOT_H, FOOT_H, view, 24, 0.4), { tone: "lo" }))
    .join("");
  const rings = rectCorners(b, 7)
    .map(([x, y]) => flatCircle(x, y, 1.8, 0, view, 14))
    .join("");
  const screws = rectCorners(b, 7)
    .map(([x, y]) => {
      const [sx, sy] = at([x, y, 0]);
      return `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="0.5"/>`;
    })
    .join("");
  return (
    `<path class="iso-halo" d="${prismFill(b, -SLAB_H - FOOT_H, SLAB_H, view)}"/>` +
    feet +
    solidSvg(prism(b, -SLAB_H, SLAB_H, view, 6, 1.2), { tone: "mid" }) +
    `<path class="iso-line" data-tone="lo" d="${flatRect(inset(b, 3.5), 0, view)}"/>` +
    `<path class="iso-line" data-tone="lo" d="${rings}"/>` +
    `<g class="iso-dots" data-tone="mid">${screws}</g>`
  );
})();

// Round the corners of a convex polygon (2D) with radius r[i] per corner.
function roundPoly(poly: Vec2[], r: number[], seg = 6): Vec2[] {
  const n = poly.length;
  const out: Vec2[] = [];
  for (let i = 0; i < n; i++) {
    const p = poly[i];
    const a = poly[(i + n - 1) % n];
    const b = poly[(i + 1) % n];
    const ua = norm([a[0] - p[0], a[1] - p[1]]);
    const ub = norm([b[0] - p[0], b[1] - p[1]]);
    const half = Math.acos(Math.max(-1, Math.min(1, ua[0] * ub[0] + ua[1] * ub[1]))) / 2;
    const t = r[i] / Math.tan(half);
    const pa: Vec2 = [p[0] + ua[0] * t, p[1] + ua[1] * t];
    const pb: Vec2 = [p[0] + ub[0] * t, p[1] + ub[1] * t];
    const bis = norm([ua[0] + ub[0], ua[1] + ub[1]]);
    const dc = r[i] / Math.sin(half);
    const c: Vec2 = [p[0] + bis[0] * dc, p[1] + bis[1] * dc];
    const a0 = Math.atan2(pa[1] - c[1], pa[0] - c[0]);
    let a1 = Math.atan2(pb[1] - c[1], pb[0] - c[0]);
    while (a1 - a0 > Math.PI) a1 -= Math.PI * 2;
    while (a0 - a1 > Math.PI) a1 += Math.PI * 2;
    for (let k = 0; k <= seg; k++) {
      const th = a0 + ((a1 - a0) * k) / seg;
      out.push([c[0] + r[i] * Math.cos(th), c[1] + r[i] * Math.sin(th)]);
    }
  }
  return out;
}
function norm([x, y]: Vec2): Vec2 {
  const l = Math.hypot(x, y) || 1;
  return [x / l, y / l];
}

// 2D convex hull (screen points), for silhouettes.
function hull(points: Vec2[]): Vec2[] {
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: Vec2, a: Vec2, b: Vec2) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list: Vec2[]) => {
    const h: Vec2[] = [];
    for (const p of list) {
      while (h.length >= 2 && cross(h[h.length - 2], h[h.length - 1], p) <= 0) h.pop();
      h.push(p);
    }
    return h;
  };
  const lower = half(pts);
  const upper = half([...pts].reverse());
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

// Clock body: rounded side profile (y, z) extruded along x. Faces facing up go in "top", the rest are shaded by facing;
// creases only between faces that meet at a sharp angle (none here, all corners rounded) plus the right end cap rim.
const VIEW_DIR: Vec3 = [Math.cos(A) * Math.cos(E), Math.sin(A) * Math.cos(E), Math.sin(E)];
const LIGHT = (() => {
  const l: Vec3 = [-Math.sin(A), Math.cos(A), 1.1];
  const m = Math.hypot(...l);
  return l.map((v) => v / m) as Vec3;
})();
function extrudeX(profile: Vec2[], x0: number, x1: number): SolidPaths {
  const n = profile.length;
  const cy = profile.reduce((s, p) => s + p[0], 0) / n;
  const cz = profile.reduce((s, p) => s + p[1], 0) / n;
  const L = profile.map(([y, z]) => at([x0, y, z]));
  const R = profile.map(([y, z]) => at([x1, y, z]));
  const shades: string[][] = [[], [], [], []];
  const tops: string[] = [];
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const [y0, z0] = profile[i];
    const [y1, z1] = profile[j];
    let ny = z1 - z0;
    let nz = -(y1 - y0);
    const mid = [(y0 + y1) / 2 - cy, (z0 + z1) / 2 - cz];
    if (ny * mid[0] + nz * mid[1] < 0) [ny, nz] = [-ny, -nz];
    const len = Math.hypot(ny, nz) || 1;
    ny /= len;
    nz /= len;
    if (ny * VIEW_DIR[1] + nz * VIEW_DIR[2] <= 1e-6) continue;
    const quad = pathD([L[i], L[j], R[j], R[i]], true);
    if (nz > 0.9) tops.push(quad);
    else {
      const f = (ny * LIGHT[1] + nz * LIGHT[2] + 1) / 2;
      shades[f > 0.8 ? 2 : f > 0.6 ? 1 : f > 0.4 ? 3 : 0].push(quad);
    }
  }
  const cap = pathD(R, true);
  shades[0].push(cap);
  const outline = pathD(hull([...L, ...R]), true);
  return { fill: outline, outline, crease: cap, top: tops.join(""), shades: shades.map((s) => s.join("")) };
}

const PROFILE = roundPoly(
  [
    [BACK_Y, FEET_H],
    [BACK_Y, TOP_Z],
    [TOP_FRONT_Y, TOP_Z],
    [LIP_Y, LIP_Z],
    [LIP_Y, FEET_H],
  ],
  [2, 5, 5, 3, 2],
  7,
);

// Seven-segment polygons for one digit, in (u, w) digit units: u across, w down; segments a..g.
const hSeg = (x0: number, x1: number, y: number): Vec2[] => {
  const t = SEG_T / 2;
  return [[x0, y], [x0 + t, y - t], [x1 - t, y - t], [x1, y], [x1 - t, y + t], [x0 + t, y + t]];
};
const vSeg = (x: number, y0: number, y1: number): Vec2[] => {
  const t = SEG_T / 2;
  return [[x, y0], [x + t, y0 + t], [x + t, y1 - t], [x, y1], [x - t, y1 - t], [x - t, y0 + t]];
};
const g = SEG_GAP;
const W = DIG_W;
const H = DIG_H;
const SEG_SHAPES: Vec2[][] = [
  hSeg(g, W - g, 0), // a
  vSeg(W, g, H / 2 - g), // b
  vSeg(W, H / 2 + g, H - g), // c
  hSeg(g, W - g, H), // d
  vSeg(0, H / 2 + g, H - g), // e
  vSeg(0, g, H / 2 - g), // f
  hSeg(g, W - g, H / 2), // g
];
// Slight forward slant, as on real clock digits.
const SLANT = 0.08;
const DISPLAY_LIFT = -0.3; // the window is recessed into the face

export const digits = DIGITS.map((d, k) => {
  const lit = litSegments(d);
  return SEG_SHAPES.map((shape, s) => ({
    on: lit[s],
    d: slopePoly(
      shape.map(([u, w]): Vec2 => [CELL_X[k] - W / 2 + u + SLANT * (H - w), DIG_V + w]),
      DISPLAY_LIFT + 0.1,
    ),
  }));
});

const ring = (cx: number, cv: number, r: number, seg = 18): Vec2[] => Array.from({ length: seg }, (_, i) => [cx + r * Math.cos((i / seg) * Math.PI * 2), cv + r * Math.sin((i / seg) * Math.PI * 2)]);
const rectPts = (x0: number, v0: number, x1: number, v1: number): Vec2[] => [[x0, v0], [x1, v0], [x1, v1], [x0, v1]];
const rrect = (x0: number, v0: number, x1: number, v1: number, r: number) => roundPoly(rectPts(x0, v0, x1, v1), [r, r, r, r], 4);

// Bell icon (alarm on): dome, flared rim and clapper, in slope units around (cx, cv).
const bellPts = (cx: number, cv: number): Vec2[] => {
  const pts: Vec2[] = [];
  for (let i = 0; i <= 10; i++) {
    const th = Math.PI + (Math.PI * i) / 10;
    pts.push([cx + 2.3 * Math.cos(th), cv - 1 + 2.6 * Math.sin(th)]);
  }
  pts.push([cx + 2.4, cv + 1.6], [cx + 3.4, cv + 2.6], [cx - 3.4, cv + 2.6], [cx - 2.4, cv + 1.6]);
  return pts;
};

const LAMP_X = -39.5;
export const clock = {
  halo: prismFill({ x: CLOCK.x0 - 2, y: BACK_Y - 2, w: CLOCK.x1 - CLOCK.x0 + 4, d: LIP_Y - BACK_Y + 4, r: 5 }, 0, 0.1, view),
  feet: backToFront([
    [CLOCK.x0 + 7, BACK_Y + 5],
    [CLOCK.x1 - 7, BACK_Y + 5],
    [CLOCK.x0 + 7, LIP_Y - 5],
    [CLOCK.x1 - 7, LIP_Y - 5],
  ]).map(([x, y]) => cylinder(x, y, 3, 0, FEET_H, view, 16, 0.4)),
  body: extrudeX(PROFILE, CLOCK.x0, CLOCK.x1),
  // Snooze bar along the top, two small buttons beside it.
  snooze: prism({ x: -30, y: BACK_Y + 3.5, w: 60, d: TOP_FRONT_Y - BACK_Y - 9, r: 2.5 }, TOP_Z, 3.4, view, 5, 0.8),
  snoozeRidge: [0, 1, 2].map((i) => pathD([at([-24, BACK_Y + 6 + i * 2.2, TOP_Z + 3.4]), at([24, BACK_Y + 6 + i * 2.2, TOP_Z + 3.4])])).join(""),
  buttons: [-38, 38].map((x) => cylinder(x, (BACK_Y + TOP_FRONT_Y) / 2 - 1, 2.6, TOP_Z, 2.2, view, 18, 0.4)),
  // Recessed display window: bezel, blue glass, inner shadow along the top and left edges.
  bezel: slopePoly(rrect(WIN.x0 - 2.2, WIN.v0 - 2.2, WIN.x1 + 2.2, WIN.v1 + 2.2, 2.6), 0.05),
  glass: slopePoly(rrect(WIN.x0, WIN.v0, WIN.x1, WIN.v1, 1.4), DISPLAY_LIFT),
  shadow: slopePoly([[WIN.x0, WIN.v0], [WIN.x1, WIN.v0], [WIN.x1 - 1.2, WIN.v0 + 1.2], [WIN.x0 + 1.2, WIN.v0 + 1.2], [WIN.x0 + 1.2, WIN.v1 - 1.2], [WIN.x0, WIN.v1]], DISPLAY_LIFT + 0.05),
  // Thin dividers between the digit cells (and either side of the colon).
  dividers: [CELL_X[0] + CELL_W / 2, -COLON_W / 2, COLON_W / 2, CELL_X[3] - CELL_W / 2]
    .map((x) => pathD([at(S(x, WIN.v0 + 1.6, DISPLAY_LIFT + 0.08)), at(S(x, WIN.v1 - 1.6, DISPLAY_LIFT + 0.08))]))
    .join(""),
  colon: [0.32, 0.72].map((f) => slopePoly(ring(SLANT * H * (1 - f), DIG_V + DIG_H * f, 1.15, 14), DISPLAY_LIFT + 0.1)),
  // Lamps left of the display: yellow bell (alarm on) above a red PM dot.
  bell: slopePoly(bellPts(LAMP_X, WIN.v0 + 6), 0.2),
  clapper: slopePoly(ring(LAMP_X, WIN.v0 + 9.4, 0.8, 10), 0.2),
  pm: slopePoly(ring(LAMP_X, WIN.v1 - 7, 1.7, 18), 0.2),
  pmText: slopeMatrix(LAMP_X, WIN.v1 - 1.2, 0.1),
  bellText: slopeMatrix(LAMP_X, WIN.v0 + 14.2, 0.1),
  brand: slopeMatrix(0, WIN.v1 + 8.2, 0.05),
  // Soft blue glow pool on the board in front of the clock.
  pool: flatCircle(0, 4, 62, 0.05, view, 56),
};
export const LAMP_TEXT = 2.6;
export const BRAND_SIZE = 5.6;

// Callout: plate, blue LCD strip, four digit boxes and a colon between the second and third.
const boxX = (k: number) => {
  const total = BOX_W * 4 + 3 * 2 + BOX_COLON;
  const left = LCD.x + LCD.w / 2 - total / 2;
  return left + k * (BOX_W + 2) + (k > 1 ? BOX_COLON : 0);
};
const BOX_Y = LCD.y + (LCD.d - BOX_D) / 2;
export const callout = {
  plate: prism(PLATE, 0, PLATE_H, view, 4, 0.8),
  lcd: flatRect(LCD, LCD_Z, view, 4),
  boxes: DIGITS.map((_, k) => flatRect({ x: boxX(k), y: BOX_Y, w: BOX_W, d: BOX_D, r: 1 }, LCD_Z + 0.05, view, 3)),
  text: DIGITS.map((_, k) => faceMatrix([boxX(k) + BOX_W / 2, BOX_Y + BOX_D / 2 + CALL_CHAR * 0.36], LCD_Z + 0.1, view, "x")),
  colon: faceMatrix([(boxX(1) + BOX_W + boxX(2)) / 2, BOX_Y + BOX_D / 2 + CALL_CHAR * 0.33], LCD_Z + 0.1, view, "x"),
  // Leader from the plate's back-right corner, up past the clock's right end, to the window's right edge.
  leader: pathD([at([PLATE.x + PLATE.w - 3, PLATE.y + 3, PLATE_H]), at([CLOCK.x1 + 8, LIP_Y - 4, 24]), at(S(WIN.x1 + 2.2, (WIN.v0 + WIN.v1) / 2, 0.1))]),
  leaderEnds: [at([PLATE.x + PLATE.w - 3, PLATE.y + 3, PLATE_H]), at(S(WIN.x1 + 2.2, (WIN.v0 + WIN.v1) / 2, 0.1))] as [number, number][],
};

// Entrance spark points: the clock feet and the callout plate corners.
export const contacts = [
  ...rectCorners({ x: CLOCK.x0 + 4, y: BACK_Y + 2, w: CLOCK.x1 - CLOCK.x0 - 8, d: LIP_Y - BACK_Y - 4 }),
  ...rectCorners(PLATE),
].map(([x, y]) => at([x, y, 0]));
