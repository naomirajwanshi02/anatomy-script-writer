// BCD alarm clock: a board that is always on screen. Square for the analogy (a digital alarm clock and a callout plate
// stand on it), stretched long for the circuit (four trays of 4 bit tiles, hours at the back, minutes at the front).
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
  translateTo,
  type Rect,
  type SolidPaths,
  type Vec2,
  type Vec3,
} from "../../iso/iso-kit";
import { DIGITS } from "./model";

export const STAGE_W = 600;
const AZIMUTH = 62;
const PAD = 14;
const A = (AZIMUTH * Math.PI) / 180;
const E = (30 * Math.PI) / 180;

// Board: square for the analogy, long for the circuit.
const SQUARE: Rect = { x: -63, y: -63, w: 126, d: 126, r: 7 };
const LONG: Rect = { x: -92, y: -64, w: 184, d: 108, r: 6 }; // deep enough for a window behind every tray
const SLAB_H = 8;
const FOOT_H = 4;
export const boardRect = (s: number): Rect => ({
  x: SQUARE.x + (LONG.x - SQUARE.x) * s,
  y: SQUARE.y + (LONG.y - SQUARE.y) * s,
  w: SQUARE.w + (LONG.w - SQUARE.w) * s,
  d: SQUARE.d + (LONG.d - SQUARE.d) * s,
  r: SQUARE.r + (LONG.r - SQUARE.r) * s,
});

// Alarm clock (board units): wedge body extruded along x; side profile in (y, z).
const CLOCK = { x0: -46, x1: 46 };
const FEET_H = 2.6;
const BACK_Y = -46;
const TOP_FRONT_Y = -30;
const TOP_Z = 50;
const LIP_Y = 2;
const LIP_Z = 9;
const SLOPE_DY = LIP_Y - TOP_FRONT_Y;
const SLOPE_DZ = LIP_Z - TOP_Z;
const SLOPE_LEN = Math.hypot(SLOPE_DY, SLOPE_DZ);
const DOWN: [number, number] = [SLOPE_DY / SLOPE_LEN, SLOPE_DZ / SLOPE_LEN]; // down the slope (y, z)
const NORMAL: [number, number] = [-DOWN[1], DOWN[0]]; // outward (y, z): toward the viewer and up
const SINK_DEPTH = TOP_Z + 10; // clock and callout sink fully into the board

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

// Circuit: four trays of 4 tiles; hours (k 0, 1) at the back, minutes (k 2, 3) at the front; labels behind each tray.
const TILE = 13;
const PITCH = 15;
const TILE_H = 5;
const TILE_TRAVEL = 80; // board units above the tray when out of view
export const TILE_CHAR = 10.5;
const TRAY_W = 3 * PITCH + TILE + 6;
const TRAY_D = TILE + 6;
const TRAY_H = 1.2;
const TRAY_X = [-40, 40, -40, 40];
const TRAY_Y = [-26, -26, 26, 26];
export const LABEL_SIZE = 12;
const LABEL_GAP = 11; // label baseline this far behind the tray (clear of the tiles in front)

// Stage: the circuit fits the width; the analogy is drawn in the same view and zoomed in by a camera transform so the
// square board also spans the width; the zoom eases out as the board stretches long.
const CIRCUIT_PTS: Vec3[] = boxCorners(LONG, -SLAB_H - FOOT_H, 0);
const ANALOGY_PTS: Vec3[] = [...boxCorners(SQUARE, -SLAB_H - FOOT_H, 0), ...boxCorners({ x: CLOCK.x0, y: BACK_Y, w: CLOCK.x1 - CLOCK.x0, d: 10 }, 0, TOP_Z + 6)];
const unitView = { origin: [0, 0] as Vec2, scale: 1, azimuth: AZIMUTH, elevation: 30 };
const spanOf = (pts: Vec3[], c: 0 | 1) => {
  const v = pts.map((p) => project(p, unitView)[c]);
  return Math.max(...v) - Math.min(...v);
};
const circuitScale = (STAGE_W - PAD * 2) / spanOf(CIRCUIT_PTS, 0);
const ZOOM_PAD = 12;
const ZOOM = (STAGE_W - ZOOM_PAD * 2) / (spanOf(ANALOGY_PTS, 0) * circuitScale);
export const STAGE_H = Math.ceil(Math.max(spanOf(CIRCUIT_PTS, 1) * circuitScale + PAD * 2, spanOf(ANALOGY_PTS, 1) * circuitScale * ZOOM + ZOOM_PAD * 2));
export const view = fitView(CIRCUIT_PTS, STAGE_W, STAGE_H, { pad: PAD, azimuth: AZIMUTH });

const at = (p: Vec3) => project(p, view);
const r3 = (v: number) => Math.round(v * 1e3) / 1e3;

const ANALOGY_BOX = (() => {
  const p = ANALOGY_PTS.map(at);
  const xs = p.map(([x]) => x);
  const ys = p.map(([, y]) => y);
  return { cx: (Math.min(...xs) + Math.max(...xs)) / 2, cy: (Math.min(...ys) + Math.max(...ys)) / 2 };
})();
const sm = (u: number) => u * u * (3 - 2 * u);
// Camera for stretch s (analogy -> circuit).
export const zoomTransform = (s: number) => {
  const k = sm(s);
  const z = ZOOM + (1 - ZOOM) * k;
  const tx = (1 - k) * (STAGE_W / 2 - ZOOM * ANALOGY_BOX.cx);
  const ty = (1 - k) * (STAGE_H / 2 - ZOOM * ANALOGY_BOX.cy);
  return `translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${z.toFixed(4)})`;
};

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

// Engraving on the board's front face (+y), centred, upright; it follows the board as it stretches.
export const ENGRAVE = "ROLLIN-रोलिन-ROLLIN-रोलिन";
export const ENGRAVE_SIZE = 3.6;
export const boardEngrave = (s: number) => {
  const b = boardRect(s);
  return frontMatrix([b.x + b.w / 2, b.y + b.d, -SLAB_H / 2 - ENGRAVE_SIZE * 0.36]);
};

const depth = ([x, y, z]: Vec3) => (x * Math.cos(A) + y * Math.sin(A)) * Math.cos(E) + z * Math.sin(E);
const backToFront = (pts: Vec2[]) => [...pts].sort((p, q) => depth([p[0], p[1], 0]) - depth([q[0], q[1], 0]));

// Board markup for stretch s (rebuilt by the loop while it changes).
export function boardSvg(s: number) {
  const b = boardRect(s);
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
}

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

// 2D convex hull (screen points), for silhouettes and sink clips.
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

// Clip for a part sinking into the board: its footprint at board level and everything straight above it.
function columnClip(r: Rect) {
  const c = rectCorners(r).map(([x, y]) => at([x, y, 0]));
  const up = c.map(([x, y]): Vec2 => [x, y - 4000]);
  return pathD(hull([...c, ...up]), true);
}

// Clock body: rounded side profile (y, z) extruded along x. Faces facing up go in "top", the rest are shaded by facing.
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
const SLANT = 0.08; // slight forward slant, as on real clock digits
const DISPLAY_LIFT = -0.3; // the window is recessed into the face

// Segment paths per display cell (all 7, the loop marks which are lit).
export const segPaths = CELL_X.map((cx) => SEG_SHAPES.map((shape) => slopePoly(shape.map(([u, w]): Vec2 => [cx - W / 2 + u + SLANT * (H - w), DIG_V + w]), DISPLAY_LIFT + 0.1)));

const ring = (cx: number, cv: number, r: number, seg = 18): Vec2[] => Array.from({ length: seg }, (_, i) => [cx + r * Math.cos((i / seg) * Math.PI * 2), cv + r * Math.sin((i / seg) * Math.PI * 2)]);
const rectPts = (x0: number, v0: number, x1: number, v1: number): Vec2[] => [[x0, v0], [x1, v0], [x1, v1], [x0, v1]];
const rrect = (x0: number, v0: number, x1: number, v1: number, r: number) => roundPoly(rectPts(x0, v0, x1, v1), [r, r, r, r], 4);

// Bell icon (alarm on): dome, flared rim, in slope units around (cx, cv).
const bellPts = (cx: number, cv: number): Vec2[] => {
  const pts: Vec2[] = [];
  for (let i = 0; i <= 10; i++) {
    const th = Math.PI + (Math.PI * i) / 10;
    pts.push([cx + 2.3 * Math.cos(th), cv - 1 + 2.6 * Math.sin(th)]);
  }
  pts.push([cx + 2.4, cv + 1.6], [cx + 3.4, cv + 2.6], [cx - 3.4, cv + 2.6], [cx - 2.4, cv + 1.6]);
  return pts;
};
// Sound arc round the bell: an open arc of radius r on the slope, centred on "up" (-v) at side sign (+1 right, -1 left).
const arcPts = (cx: number, cv: number, r: number, side: number): Vec2[] =>
  Array.from({ length: 9 }, (_, i) => {
    const th = -Math.PI / 2 + side * (Math.PI * (0.18 + (0.3 * i) / 8));
    return [cx + r * Math.cos(th), cv + r * Math.sin(th)];
  });

// Screen lit area for a CRT-style power state (width, open 0..1).
export function screenLit(width: number, open: number) {
  if (width <= 0.01) return "";
  const cv = (WIN.v0 + WIN.v1) / 2;
  const hw = Math.max(0.35, ((WIN.x1 - WIN.x0) / 2 - 0.8) * width);
  const hd = Math.max(0.3, ((WIN.v1 - WIN.v0) / 2 - 0.8) * open);
  return slopePoly(rectPts(-hw, cv - hd, hw, cv + hd), DISPLAY_LIFT + 0.05);
}

const LAMP_X = -40;
const BELL_V = WIN.v0 + 6;
const CLOCK_FOOT: Rect = { x: CLOCK.x0 - 1, y: BACK_Y - 1, w: CLOCK.x1 - CLOCK.x0 + 2, d: LIP_Y - BACK_Y + 2, r: 3 };
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
  // Recessed display window: bezel, glass, inner shadow along the top and left edges, thin cell dividers.
  bezel: slopePoly(rrect(WIN.x0 - 2.2, WIN.v0 - 2.2, WIN.x1 + 2.2, WIN.v1 + 2.2, 2.6), 0.05),
  glass: slopePoly(rrect(WIN.x0, WIN.v0, WIN.x1, WIN.v1, 1.4), DISPLAY_LIFT),
  shadow: slopePoly([[WIN.x0, WIN.v0], [WIN.x1, WIN.v0], [WIN.x1 - 1.2, WIN.v0 + 1.2], [WIN.x0 + 1.2, WIN.v0 + 1.2], [WIN.x0 + 1.2, WIN.v1 - 1.2], [WIN.x0, WIN.v1]], DISPLAY_LIFT + 0.05),
  dividers: [CELL_X[0] + CELL_W / 2, -COLON_W / 2, COLON_W / 2, CELL_X[3] - CELL_W / 2]
    .map((x) => pathD([at(S(x, WIN.v0 + 1.6, DISPLAY_LIFT + 0.08)), at(S(x, WIN.v1 - 1.6, DISPLAY_LIFT + 0.08))]))
    .join(""),
  colon: [0.32, 0.72].map((f) => slopePoly(ring(SLANT * H * (1 - f), DIG_V + DIG_H * f, 1.15, 14), DISPLAY_LIFT + 0.1)),
  // Lamps left of the display: yellow bell (alarm on) above a red PM dot; sound arcs round the bell.
  bell: slopePoly(bellPts(LAMP_X, BELL_V), 0.2),
  clapper: slopePoly(ring(LAMP_X, BELL_V + 3.4, 0.8, 10), 0.2),
  bellCentre: at(S(LAMP_X, BELL_V - 2.4, 0.2)),
  arcs: [3.9, 5.4].map((r) => pathD(arcPts(LAMP_X, BELL_V, r, 1).map(([x, v]) => at(S(x, v, 0.2)))) + pathD(arcPts(LAMP_X, BELL_V, r, -1).map(([x, v]) => at(S(x, v, 0.2))))),
  pm: slopePoly(ring(LAMP_X, WIN.v1 - 7, 1.7, 18), 0.2),
  pmText: slopeMatrix(LAMP_X, WIN.v1 - 1.2, 0.1),
  bellText: slopeMatrix(LAMP_X, BELL_V + 8.2, 0.1),
  brand: slopeMatrix(0, WIN.v1 + 8.2, 0.05),
  // Soft blue glow pool on the board in front of the clock.
  pool: flatCircle(0, 4, 62, 0.05, view, 56),
  clip: columnClip(CLOCK_FOOT),
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
const calloutDigit = (k: number): Vec3 => [boxX(k) + BOX_W / 2, BOX_Y + BOX_D / 2 + CALL_CHAR * 0.36, LCD_Z + 0.1];
const leaderEnd = at(S(26, WIN.v1 + 2.2, 0.1));
const leaderStart = at([PLATE.x + PLATE.w - 8, PLATE.y + 2.5, PLATE_H]);
export const callout = {
  plate: prism(PLATE, 0, PLATE_H, view, 4, 0.8),
  lcd: flatRect(LCD, LCD_Z, view, 4),
  boxes: DIGITS.map((_, k) => flatRect({ x: boxX(k), y: BOX_Y, w: BOX_W, d: BOX_D, r: 1 }, LCD_Z + 0.05, view, 3)),
  text: DIGITS.map((_, k) => {
    const p = calloutDigit(k);
    return faceMatrix([p[0], p[1]], p[2], view, "x");
  }),
  colon: faceMatrix([(boxX(1) + BOX_W + boxX(2)) / 2, BOX_Y + BOX_D / 2 + CALL_CHAR * 0.33], LCD_Z + 0.1, view, "x"),
  // Leader from the plate's back edge straight up to the display's lower edge, left of the clock's side panel.
  leader: pathD([leaderStart, leaderEnd]),
  leaderEnds: [leaderStart, leaderEnd] as [number, number][],
  clip: columnClip(PLATE),
};

export const sinkTransform = (u: number) => translateTo(view, [0, 0, -u * SINK_DEPTH]);

// Circuit trays, tiles and labels.
export const trays = DIGITS.map((_, k) => {
  const rect: Rect = { x: TRAY_X[k] - TRAY_W / 2, y: TRAY_Y[k] - TRAY_D / 2, w: TRAY_W, d: TRAY_D, r: 2 };
  const body = prism(rect, 0, TRAY_H, view, 4, 0.4);
  return { body, accent: flatRect(inset(rect, 0.6), TRAY_H + 0.02, view, 4) };
});
const labelAt = (k: number): Vec3 => [TRAY_X[k], TRAY_Y[k] - TRAY_D / 2 - LABEL_GAP, 0.05];
// Callout digit k flying to its tray label (u 0..1), arcing up; font size eases with it.
export function labelFlight(k: number, u: number) {
  const a = calloutDigit(k);
  const b = labelAt(k);
  const p = a.map((v, i) => v + (b[i] - v) * u) as Vec3;
  return { transform: faceMatrix([p[0], p[1]], p[2] + 22 * Math.sin(Math.PI * u), view, "x"), size: CALL_CHAR + (LABEL_SIZE - CALL_CHAR) * u };
}
const tileXY = (k: number, i: number): Vec2 => [TRAY_X[k] + (i - 1.5) * PITCH, TRAY_Y[k]];
export function tileSolid(k: number, i: number, up: number, grow: number) {
  const [x, y] = tileXY(k, i);
  const z = TRAY_H + up * TILE_TRAVEL;
  const h = Math.max(0.05, TILE_H * grow);
  return { paths: prism({ x: x - TILE / 2, y: y - TILE / 2, w: TILE, d: TILE, r: 1.2 }, z, h, view, 3, Math.min(0.6, h / 4)), text: faceMatrix([x, y + TILE_CHAR * 0.36], z + h, view, "x") };
}
// Tiles in back-to-front draw order: back row first, and within a row left to right.
export const TILE_ORDER = DIGITS.flatMap((_, k) => [0, 1, 2, 3].map((i) => ({ k, i, d: depth([...tileXY(k, i), 0]) }))).sort((p, q) => p.d - q.d);

// Entrance spark points: the clock feet and the callout plate corners.
export const contacts = [...rectCorners({ x: CLOCK.x0 + 4, y: BACK_Y + 2, w: CLOCK.x1 - CLOCK.x0 - 8, d: LIP_Y - BACK_Y - 4 }), ...rectCorners(PLATE)].map(([x, y]) => at([x, y, 0]));

// Table position: just below the long board's front edge, as a fraction of the stage height.
export const TABLE_TOP = (Math.max(...boxCorners(LONG, -SLAB_H - FOOT_H, 0).map((p) => at(p)[1])) + 10) / STAGE_H;

// Why four bits: red dashed outline round the 3-bit box (its tray top).
export const threeWarn = (k: number) => flatRect(inset({ x: TRAY_X[k] - TRAY_W / 2, y: TRAY_Y[k] - TRAY_D / 2, w: TRAY_W, d: TRAY_D, r: 2 }, -1.2), TRAY_H + 0.05, view, 4);

// Plain binary: a 5-tile row in the minutes' place feeds a divide-by-ten gear block on its right; two meshing gears on
// the block's front face (+y) clunk round once per subtraction; a counter engraved on its top.
const BIN_Y = TRAY_Y[2];
const binX = (i: number) => -62 + i * PITCH;
export function binSolid(i: number, up: number, grow: number) {
  const x = binX(i);
  const z = up * TILE_TRAVEL;
  const h = Math.max(0.05, TILE_H * grow);
  return { paths: prism({ x: x - TILE / 2, y: BIN_Y - TILE / 2, w: TILE, d: TILE, r: 1.2 }, z, h, view, 3, Math.min(0.6, h / 4)), text: faceMatrix([x, BIN_Y + TILE_CHAR * 0.36], z + h, view, "x") };
}
const GB: Rect = { x: 22, y: BIN_Y - 13, w: 50, d: 26, r: 2 };
const GB_H = 12;
const GB_FRONT = GB.y + GB.d + 0.1;
const fx = (x: number, z: number) => at([x, GB_FRONT, z]);
const GEARS = [
  { x: GB.x + 16, z: 6, r: 4.8, teeth: 12, dir: 1, phase: 0 },
  { x: GB.x + 23.8, z: 7.2, r: 3.3, teeth: 8, dir: -12 / 8, phase: 22.5 },
];
const gearPts = (g: (typeof GEARS)[number], deg: number) => {
  const out: Vec2[] = [];
  const n = g.teeth * 4;
  for (let i = 0; i < n; i++) {
    const a = ((deg * g.dir + g.phase) * Math.PI) / 180 + (i / n) * Math.PI * 2;
    const rr = i % 4 < 2 ? g.r : g.r - 1.2;
    out.push([g.x + rr * Math.cos(a), g.z + rr * Math.sin(a)]);
  }
  return out;
};
export const gearPaths = (deg: number) => GEARS.map((g) => pathD(gearPts(g, deg).map(([x, z]) => fx(x, z)), true));
export const COUNTER_SIZE = 9;
export const gearbox = {
  body: prism(GB, 0, GB_H, view, 3, 0.8),
  hubs: GEARS.map((g) => pathD(Array.from({ length: 16 }, (_, i): Vec2 => fx(g.x + 1.4 * Math.cos((i / 16) * Math.PI * 2), g.z + 1.4 * Math.sin((i / 16) * Math.PI * 2))), true)),
  bolts: [
    [3, 3],
    [GB.w - 3, 3],
    [3, GB_H - 3],
    [GB.w - 3, GB_H - 3],
  ].map(([x, z]) => fx(GB.x + x, z)),
  // Engraved on the top: the divide sign at the back, the live counter at the front.
  div: faceMatrix([GB.x + GB.w / 2, GB.y + 8 + COUNTER_SIZE * 0.36], GB_H + 0.05, view, "x"),
  counter: faceMatrix([GB.x + GB.w / 2, GB.y + GB.d - 6 + COUNTER_SIZE * 0.36], GB_H + 0.05, view, "x"),
  // Feed from the row's right end into the block's left side.
  feed: pathD([at([binX(4) + TILE / 2 + 0.5, BIN_Y, 0.05]), at([GB.x - 0.2, BIN_Y, 0.05])]),
};
export const gearSinkTransform = (u: number) => translateTo(view, [0, 0, -u * (GB_H + 6)]);

// Key state: each box drives its own small window (blue LCD plate) just behind it, joined by a short wire.
const WIN_W = 20;
const WIN_D = 13;
const WIN_H = 1.6;
export const WIN_CHAR = 11;
// Each window 9 units behind its tray, so the wire between them reads at phone size.
const winY = (k: number) => TRAY_Y[k] - TRAY_D / 2 - 9 - WIN_D / 2;
export const windows = DIGITS.map((_, k) => {
  const r: Rect = { x: TRAY_X[k] - WIN_W / 2, y: winY(k) - WIN_D / 2, w: WIN_W, d: WIN_D, r: 1.5 };
  return {
    plate: prism(r, 0, WIN_H, view, 3, 0.4),
    lcd: flatRect(inset(r, 1.4), WIN_H + 0.05, view, 3),
    text: faceMatrix([TRAY_X[k], winY(k) + WIN_CHAR * 0.36], WIN_H + 0.1, view, "x"),
    wire: pathD([at([TRAY_X[k], TRAY_Y[k] - TRAY_D / 2 - 0.2, 0.05]), at([TRAY_X[k], r.y + r.d + 0.2, 0.05])]),
  };
});
