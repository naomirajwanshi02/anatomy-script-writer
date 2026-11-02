// Hex grouping: a board that is always on screen. Square for the analogy (a GSM desk phone and a callout plate
// stand on it), stretched long for the circuit (a row of 10 key tiles and two taller hex blocks behind the bit groups).
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
import { KEY_LABELS } from "./model";

export const STAGE_W = 600;
const AZIMUTH = 62;
const PAD = 14;
const A = (AZIMUTH * Math.PI) / 180;

// Board: square for the analogy, long for the circuit (the circuit board as designed).
const LONG: Rect = { x: -92, y: -30, w: 184, d: 46, r: 6 };
const SQUARE: Rect = { x: -63, y: -52, w: 126, d: 126, r: 7 };
const SLAB_H = 8;
const FOOT_H = 4;
export const boardRect = (s: number): Rect => ({
  x: SQUARE.x + (LONG.x - SQUARE.x) * s,
  y: SQUARE.y + (LONG.y - SQUARE.y) * s,
  w: SQUARE.w + (LONG.w - SQUARE.w) * s,
  d: SQUARE.d + (LONG.d - SQUARE.d) * s,
  r: SQUARE.r + (LONG.r - SQUARE.r) * s,
});

// Key tiles.
const TILE = 14;
const PITCH = 15.5;
const TILE_H = 5;
const TILE_Y = 4; // tile centre (toward the viewer)
const SPLIT_GAP = 9; // phone groups 3, 3, 4 (10 tiles + 2 gaps must stay on the board during the fold)
const NIB_GAP = 9; // two groups of 4 bits
export const CHAR_SIZE = 12;

// Hex blocks, behind the tiles.
const BLOCK_W = 48;
const BLOCK_D = 12;
const BLOCK_H = 22;
const BLOCK_Y = -24;
export const BLOCK_CHAR = 17;
const BLOCK_TRAVEL = 320; // stage units above the board when out of view

// Desk phone (board units): body footprint, sloped top from z 22 at the back to z 8 at the front.
const PHONE = { x0: -46, x1: 34, y0: -40, y1: 20, zBack: 22, zFront: 8 };
const PLINTH_H = 2;
const slopeZ = (y: number) => PHONE.zBack + ((PHONE.zFront - PHONE.zBack) * (y - PHONE.y0)) / (PHONE.y1 - PHONE.y0);
const SCREEN = { x0: 6, x1: 30, y0: -36, y1: -20 };
const DECK_Y = -50; // rounded rear deck behind the sloped key face, y -50..-40 at the back height
const ANTENNA: Vec2 = [29, -45.5];
const ANTENNA_TOP = 48;
const KEY_W = 14;
const KEY_D = 7;
const KEY_H = 1.6;
export const KEY_DIP = 1.2;
export const KEY_SIZE = 5.2;
const keyAt = (k: number): Vec2 => [-18 + (k % 3) * 19, -13 + Math.floor(k / 3) * 9];

// Callout plate on the board's front right, with a blue LCD strip.
const PLATE: Rect = { x: -38, y: 34, w: 92, d: 34, r: 3 };
const PLATE_H = 3.5;
const LCD: Rect = { x: -34, y: 37, w: 84, d: 28, r: 2 };
const LCD_Z = PLATE_H + 0.1;
const CALL_X = 8; // centre of the digit run
const CALL_Y = 54; // digit baseline
export const CALL_CHAR = 10;
const CALL_PITCH = 7.5;
const CALL_GAP = 4;
export const CALLING_SIZE = 4.6;
const SINK_DEPTH = ANTENNA_TOP + 4; // phone and callout sink fully into the board

// Stage: the circuit keeps its 600 x 300 scale (long board at 95 % width). The analogy is drawn in the same view and
// zoomed in by a camera transform so the square board also spans about 95 % of the width; the zoom eases out as the
// board stretches long.
const CIRCUIT_PTS: Vec3[] = [...boxCorners(LONG, -SLAB_H - FOOT_H, 0), ...boxCorners({ x: -60, y: BLOCK_Y, w: 120, d: BLOCK_D }, 0, BLOCK_H)];
const ANALOGY_PTS: Vec3[] = [...boxCorners(SQUARE, -SLAB_H - FOOT_H, 0), [ANTENNA[0], ANTENNA[1], ANTENNA_TOP + 3]];
const circuitScale = fitView(CIRCUIT_PTS, STAGE_W, 300, { pad: PAD, azimuth: AZIMUTH }).scale;
const K = Math.sqrt(1.6);
const unitX = ([x, y]: Vec3) => (x * Math.sin(A) - y * Math.cos(A)) * K;
const unitY = ([x, y, z]: Vec3) => ((x * Math.cos(A) + y * Math.sin(A)) * 0.5 - z * Math.cos(Math.PI / 6)) * K;
const span = (pts: Vec3[], f: (p: Vec3) => number) => Math.max(...pts.map(f)) - Math.min(...pts.map(f));
const ZOOM_PAD = 6;
const ZOOM = (STAGE_W - ZOOM_PAD * 2) / (span(ANALOGY_PTS, unitX) * circuitScale);
export const STAGE_H = Math.ceil(Math.max(300, span(ANALOGY_PTS, unitY) * circuitScale * ZOOM + ZOOM_PAD * 2));
export const view = fitView(CIRCUIT_PTS, STAGE_W, STAGE_H, { pad: PAD, azimuth: AZIMUTH });

const at = (p: Vec3) => project(p, view);

// Camera zoom for board stretch s (eased): analogy bounding box centred and enlarged at s = 0, identity at s = 1.
const ANALOGY_BOX = (() => {
  const p = ANALOGY_PTS.map(at);
  const xs = p.map(([x]) => x);
  const ys = p.map(([, y]) => y);
  return { cx: (Math.min(...xs) + Math.max(...xs)) / 2, cy: (Math.min(...ys) + Math.max(...ys)) / 2 };
})();
// Analogy camera (s = 0) as numbers, for the desk scene's camera fit.
export const ANALOGY_ZOOM = { k: ZOOM, tx: STAGE_W / 2 - ZOOM * ANALOGY_BOX.cx, ty: STAGE_H / 2 - ZOOM * ANALOGY_BOX.cy };
export const zoomTransform = (s: number) => {
  const k = s * s * (3 - 2 * s);
  const z = ZOOM + (1 - ZOOM) * k;
  const tx = (1 - k) * (STAGE_W / 2 - ZOOM * ANALOGY_BOX.cx);
  const ty = (1 - k) * (STAGE_H / 2 - ZOOM * ANALOGY_BOX.cy);
  return `translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${z.toFixed(4)})`;
};

const depth = ([x, y, z]: Vec3) => {
  const e = (30 * Math.PI) / 180;
  return (x * Math.cos(A) + y * Math.sin(A)) * Math.cos(e) + z * Math.sin(e);
};
const backToFront = (pts: Vec2[]) => [...pts].sort((p, q) => depth([p[0], p[1], 0]) - depth([q[0], q[1], 0]));

// Text on a front face (+y), reading along +x, upright along +z.
const frontMatrix = (p: Vec3) => {
  const o = at(p);
  const ax = at([p[0] + 1, p[1], p[2]]);
  const az = at([p[0], p[1], p[2] - 1]);
  const r = (v: number) => Math.round(v * 1e3) / 1e3;
  return `matrix(${r(ax[0] - o[0])} ${r(ax[1] - o[1])} ${r(az[0] - o[0])} ${r(az[1] - o[1])} ${r(o[0])} ${r(o[1])})`;
};

// Engraving on the board's front face (+y), centred, upright; it follows the board as it stretches.
export const ENGRAVE = "ROLLIN-रोलिन-ROLLIN-रोलिन";
export const ENGRAVE_SIZE = 3.6;
export const boardEngrave = (s: number, dx = 0) => {
  const b = boardRect(s);
  return frontMatrix([b.x + b.w / 2 + dx, b.y + b.d, -SLAB_H / 2 - ENGRAVE_SIZE * 0.36]);
};

// Board markup for stretch s (rebuilt by the loop while it changes); feet fade out while the desk legs grow.
export function boardSvg(s: number, feetIn = 1) {
  const b = boardRect(s);
  const feetSvg = backToFront(rectCorners(b, 14))
    .map(([x, y]) => solidSvg(cylinder(x, y, 5, -SLAB_H - FOOT_H, FOOT_H, view, 24, 0.4), { tone: "lo" }))
    .join("");
  const feet = feetIn >= 1 ? feetSvg : feetIn > 0.01 ? `<g opacity="${feetIn.toFixed(3)}">${feetSvg}</g>` : "";
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

// Tile centre x from the model channels: split (3,3,4 gaps), centre (row of 10 -> row of 8), nib (4 | 4 gap).
export function tileX(i: number, s: { split: number; centre: number; nib: number }) {
  const c = 4.5 - s.centre; // middle of 10 tiles, or of the first 8
  const split = s.split * SPLIT_GAP * ((i > 2 ? 1 : 0) + (i > 5 ? 1 : 0) - 1);
  const nib = s.nib * NIB_GAP * (i > 3 ? 0.5 : -0.5);
  return (i - c) * PITCH + split + nib;
}

const tileRect = (x: number, y: number): Rect => ({ x: x - TILE / 2, y: y - TILE / 2, w: TILE, d: TILE, r: 1.2 });

// Tile solid centred at (x, y) on height z, with height factor grow 0..1 (sinking into the board, or growing off the callout).
export function tileSolid(x: number, grow: number, y = TILE_Y, z = 0) {
  const h = TILE_H * grow;
  return { paths: prism(tileRect(x, y), z, Math.max(h, 0.05), view, 3, Math.min(0.6, h / 4)), h: z + h };
}

export const tileText = (x: number, h: number, y = TILE_Y) => faceMatrix([x, y + CHAR_SIZE * 0.36], h, view, "x");

// Floating readout text in the front plane of the tiles: place values just above each tile, the sum higher up.
export const WEIGHT_SIZE = 9;
export const SUM_SIZE = 12;
export const weightText = (x: number) => frontMatrix([x, TILE_Y + TILE / 2, TILE_H + 11]);
export const sumText = (x: number) => frontMatrix([x, TILE_Y + TILE / 2, TILE_H + 26]);

// Callout digit i: tight run, then grouped 3, 3, 4.
export const calloutX = (i: number, split: number) => CALL_X + (i - 4.5) * CALL_PITCH + split * CALL_GAP * ((i > 2 ? 1 : 0) + (i > 5 ? 1 : 0) - 1);
export const calloutText = (i: number, split: number) => faceMatrix([calloutX(i, split), CALL_Y], LCD_Z, view, "x");

// Tile in flight between its callout digit (u = 0) and its board place (u = 1), arcing up.
export function tileFlight(i: number, u: number, boardX: number, split: number) {
  const sx = calloutX(i, split);
  const sy = CALL_Y - CALL_CHAR * 0.35;
  const x = sx + (boardX - sx) * u;
  const y = sy + (TILE_Y - sy) * u;
  const z = LCD_Z + (0 - LCD_Z) * u + 18 * Math.sin(Math.PI * u);
  return { x, y, z };
}

// Extruded polygon (board coords) built like the kit's prisms, on a base height zAt(x, y) (flat or the phone's slope).
// The kit only exports rect and circle prisms on flat ground; the phone needs parts on a sloped face.
function polySolid(poly: Vec2[], zAt: (p: Vec2) => number, h: number): SolidPaths {
  const n = poly.length;
  const signed = (pts: Vec2[]) => pts.reduce((s, p, i) => s + p[0] * pts[(i + 1) % pts.length][1] - pts[(i + 1) % pts.length][0] * p[1], 0);
  const cw = (pts: Vec2[]) => (signed(pts) < 0 ? [...pts].reverse() : pts);
  const ccw = signed(poly) > 0;
  const normals = poly.map(([x, y], i): Vec2 => {
    const [x1, y1] = poly[(i + 1) % n];
    const len = Math.hypot(x1 - x, y1 - y) || 1;
    return ccw ? [(y1 - y) / len, -(x1 - x) / len] : [-(y1 - y) / len, (x1 - x) / len];
  });
  const visible = normals.map(([nx, ny]) => nx * Math.cos(A) + ny * Math.sin(A) > 1e-9);
  const top = poly.map((p) => at([p[0], p[1], zAt(p) + h]));
  const bottom = poly.map((p) => at([p[0], p[1], zAt(p)]));
  const fill = [pathD(cw(top), true)];
  const shades: string[][] = [[], [], [], []];
  const outline: string[] = [pathD(top, true)];
  const [lx, ly] = [-Math.sin(A), Math.cos(A)];
  for (let i = 0; i < n; i++) {
    if (!visible[i]) continue;
    const j = (i + 1) % n;
    const quad = pathD(cw([top[i], top[j], bottom[j], bottom[i]]), true);
    fill.push(quad);
    const facing = (normals[i][0] * lx + normals[i][1] * ly + 1) / 2;
    shades[Math.min(3, Math.max(0, Math.floor(facing * 4)))].push(quad);
    outline.push(pathD([bottom[i], bottom[j]]));
    if (!visible[(i + n - 1) % n]) outline.push(pathD([top[i], bottom[i]]));
    if (!visible[j]) outline.push(pathD([top[j], bottom[j]]));
  }
  return { fill: fill.join(""), outline: outline.join(""), crease: "", top: pathD(cw(top), true), shades: shades.map((s) => s.join("")) };
}

// Handset grip: a slim bar between the cups, bowed slightly outward.
const gripOutline = (): Vec2[] => {
  const ys = Array.from({ length: 17 }, (_, i) => -28 + (36 * i) / 16);
  const bow = (y: number) => -38 - 1.6 * Math.sin((Math.PI * (y + 28)) / 36);
  return [...ys.map((y): Vec2 => [bow(y) + 2.3, y]), ...[...ys].reverse().map((y): Vec2 => [bow(y) - 2.3, y])];
};
const roundRect = (cx: number, cy: number, w: number, d: number, r: number, seg = 6): Vec2[] => {
  const out: Vec2[] = [];
  const corners: [number, number, number][] = [
    [cx + w / 2 - r, cy - d / 2 + r, -90],
    [cx + w / 2 - r, cy + d / 2 - r, 0],
    [cx - w / 2 + r, cy + d / 2 - r, 90],
    [cx - w / 2 + r, cy - d / 2 + r, 180],
  ];
  for (const [x, y, s] of corners)
    for (let i = 0; i <= seg; i++) {
      const a = ((s + (seg ? (90 * i) / seg : 45)) * Math.PI) / 180;
      out.push([x + r * Math.cos(a), y + r * Math.sin(a)]);
    }
  return out;
};
const circle = (cx: number, cy: number, r: number, seg = 28): Vec2[] => Array.from({ length: seg }, (_, i) => [cx + r * Math.cos((i / seg) * Math.PI * 2), cy + r * Math.sin((i / seg) * Math.PI * 2)]);
const onSlope = (lift = 0) => (p: Vec2) => slopeZ(p[1]) + lift;
const slopeFlat = (pts: Vec2[], lift = 0) => pathD(pts.map((p) => at([p[0], p[1], slopeZ(p[1]) + lift])), true);

// Text laid on the sloped face at (x, y), reading along +x.
const slopeMatrix = (x: number, y: number, lift = 0) => {
  const z = (yy: number) => slopeZ(yy) + lift;
  const o = at([x, y, z(y)]);
  const a = at([x + 1, y, z(y)]);
  const b = at([x, y + 1, z(y + 1)]);
  const r = (w: number) => Math.round(w * 1e3) / 1e3;
  return `matrix(${r(a[0] - o[0])} ${r(a[1] - o[1])} ${r(b[0] - o[0])} ${r(b[1] - o[1])} ${r(o[0])} ${r(o[1])})`;
};

// Sloped body: a wedge with the sloped top, the front face and the right side visible.
function wedge(): SolidPaths {
  const { x0, x1, y0, y1, zBack, zFront } = PHONE;
  const z0 = PLINTH_H;
  const P = (x: number, y: number, z: number) => at([x, y, z]);
  const top = pathD([P(x0, y0, zBack), P(x1, y0, zBack), P(x1, y1, zFront), P(x0, y1, zFront)], true);
  const front = pathD([P(x0, y1, zFront), P(x1, y1, zFront), P(x1, y1, z0), P(x0, y1, z0)], true);
  const side = pathD([P(x1, y0, zBack), P(x1, y1, zFront), P(x1, y1, z0), P(x1, y0, z0)], true);
  const outline = pathD([P(x0, y0, zBack), P(x1, y0, zBack), P(x1, y0, z0), P(x1, y1, z0), P(x0, y1, z0), P(x0, y1, zFront)], true);
  const crease = pathD([P(x0, y1, zFront), P(x1, y1, zFront), P(x1, y0, zBack)]) + pathD([P(x1, y1, zFront), P(x1, y1, z0)]);
  return { fill: top + front + side, outline, crease, top, shades: [side, "", front, ""] };
}

// Screen glass corners in slope coordinates; the lit area for a CRT-style power state (width, open 0..1).
const SCREEN_LIFT = 0.4;
export const SCREEN_CHAR = 3.4;
export const SCREEN_CALL_SIZE = 1.95;
export function screenLit(width: number, open: number) {
  if (width <= 0.01) return "";
  const cx = (SCREEN.x0 + SCREEN.x1) / 2;
  const cy = (SCREEN.y0 + SCREEN.y1) / 2;
  const hw = Math.max(0.35, ((SCREEN.x1 - SCREEN.x0) / 2 - 0.8) * width);
  const hd = Math.max(0.3, ((SCREEN.y1 - SCREEN.y0) / 2 - 0.8) * open);
  return slopeFlat(
    [
      [cx - hw, cy - hd],
      [cx + hw, cy - hd],
      [cx + hw, cy + hd],
      [cx - hw, cy + hd],
    ],
    SCREEN_LIFT + 0.05,
  );
}
export const screenDigit = (i: number) => slopeMatrix(SCREEN.x0 + 2.5 + i * 2.15, SCREEN.y0 + 7.2, SCREEN_LIFT + 0.1);
export const screenCalling = slopeMatrix(SCREEN.x0 + 1.6, SCREEN.y0 + 12.6, SCREEN_LIFT + 0.1);

export const phone = {
  halo: prismFill({ x: PHONE.x0 - 2, y: DECK_Y - 2, w: PHONE.x1 - PHONE.x0 + 4, d: PHONE.y1 - DECK_Y + 4, r: 5 }, 0, 0.1, view),
  plinth: prism({ x: PHONE.x0 - 1.5, y: DECK_Y - 1.5, w: PHONE.x1 - PHONE.x0 + 3, d: PHONE.y1 - DECK_Y + 3, r: 5 }, 0, PLINTH_H, view, 5, 0.6),
  body: wedge(),
  deck: polySolid(roundRect((PHONE.x0 + PHONE.x1) / 2, (DECK_Y + PHONE.y0) / 2 + 1, PHONE.x1 - PHONE.x0, PHONE.y0 - DECK_Y + 2, 5), () => PLINTH_H, PHONE.zBack - PLINTH_H),
  grille: [0, 1, 2, 3, 4].map((i) => pathD([at([7 + i * 3.6, -47.5, PHONE.zBack]), at([7 + i * 3.6, -42.5, PHONE.zBack])])).join(""),
  // Slight lip round the key face.
  lip: slopeFlat(roundRect(1, -11, 62, 56, 3), 0.05),
  // Handset: cradle recess with two raised saddles and a hook switch; slim curved grip; flared ear and mouth cups.
  cradle: slopeFlat(roundRect(-38, -10, 15, 56, 5), 0.05),
  saddles: [-22, 2].map((y) => polySolid(roundRect(-38, y, 11, 5, 2), onSlope(0), 3)),
  hook: polySolid(roundRect(-31.5, -10, 3.5, 4, 1), onSlope(0), 2.2),
  grip: polySolid(gripOutline(), onSlope(3), 2.6),
  cups: [-31, 11].map((y) => ({
    base: polySolid(circle(-38, y, 6.9), onSlope(0.3), 2.8),
    bowl: polySolid(circle(-38, y, 5.6), onSlope(3.1), 2.3),
    holes: [[0, 0], [-1.8, 0], [1.8, 0], [-0.9, -1.6], [0.9, -1.6], [-0.9, 1.6], [0.9, 1.6]].map(([dx, dy]) => at([-38 + dx, y + dy, slopeZ(y + dy) + 5.4])) as [number, number][],
  })),
  antennaBase: cylinder(ANTENNA[0], ANTENNA[1], 2.4, PHONE.zBack, 2, view, 18, 0.4),
  antenna: cylinder(ANTENNA[0], ANTENNA[1], 0.9, PHONE.zBack + 2, ANTENNA_TOP - PHONE.zBack - 2, view, 14, 0),
  antennaTip: cylinder(ANTENNA[0], ANTENNA[1], 1.8, ANTENNA_TOP, 2.6, view, 16, 0.5),
  screenBezel: polySolid(roundRect((SCREEN.x0 + SCREEN.x1) / 2, (SCREEN.y0 + SCREEN.y1) / 2, SCREEN.x1 - SCREEN.x0 + 3, SCREEN.y1 - SCREEN.y0 + 3, 1.8), onSlope(0), SCREEN_LIFT),
  navRing: slopeFlat(circle(-12, -28, 6.5), 0.05),
  ok: polySolid(circle(-12, -28, 3), onSlope(0), 1.2),
  keys: KEY_LABELS.map((label, k) => {
    const [x, y] = keyAt(k);
    const body = polySolid(roundRect(x, y, KEY_W, KEY_D, 3.3), onSlope(0), KEY_H);
    return { k, label, body, top: body.top, text: slopeMatrix(x, y + KEY_SIZE * 0.36, KEY_H), depth: depth([x, y, 0]) };
  }).sort((a, b) => a.depth - b.depth),
  // Soft blue glow pool on the board round the phone while its screen is on.
  pool: flatCircle(-6, -8, 72, 0.05, view, 56),
  clip: columnClip({ x: PHONE.x0 - 1.5, y: DECK_Y - 1.5, w: PHONE.x1 - PHONE.x0 + 3, d: PHONE.y1 - DECK_Y + 3 }),
};
// Coiled cord: about 9 loops from the mouth cup down to the board beside the phone, then into its left side.
export const cord = (() => {
  const path: Vec3[] = [
    [-43, 14, slopeZ(14) + 1.5],
    [-53, 12, 1.5],
    [-50, -2, 1.5],
    [-46.5, -8, 5],
  ];
  const seg = path.slice(1).map((p, i) => Math.hypot(p[0] - path[i][0], p[1] - path[i][1], p[2] - path[i][2]));
  const total = seg.reduce((a, b) => a + b, 0);
  const pts: Vec2[] = [];
  const N = 220;
  for (let k = 0; k <= N; k++) {
    let d = (k / N) * total;
    let i = 0;
    while (i < seg.length - 1 && d > seg[i]) d -= seg[i++];
    const u = d / seg[i];
    const p = path[i].map((v, c) => v + (path[i + 1][c] - v) * u);
    const th = (k / N) * Math.PI * 2 * 9;
    const r = 1.5 * Math.min(1, k / 12, (N - k) / 12);
    pts.push(at([p[0] + Math.cos(th) * r, p[1], p[2] + Math.sin(th) * r]));
  }
  return pathD(pts);
})();

export const keyDip = (dip: number) => translateTo(view, [0, 0, -dip * KEY_DIP]);
export const sinkTransform = (u: number) => translateTo(view, [0, 0, -u * SINK_DEPTH]);

// Clip for a part sinking into the board: its footprint at board level and everything straight above it.
function columnClip(r: Rect) {
  const c = rectCorners(r).map(([x, y]) => at([x, y, 0]));
  const up = c.map(([x, y]): [number, number] => [x, y - 4000]);
  const pts = [...c, ...up].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: number[], a: number[], b: number[]) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list: [number, number][]) => {
    const h: [number, number][] = [];
    for (const p of list) {
      while (h.length >= 2 && cross(h[h.length - 2], h[h.length - 1], p) <= 0) h.pop();
      h.push(p);
    }
    return h;
  };
  const lower = half(pts);
  const upper = half([...pts].reverse());
  return pathD([...lower.slice(0, -1), ...upper.slice(0, -1)], true);
}

export const callout = {
  plate: prism(PLATE, 0, PLATE_H, view, 4, 0.8),
  lcd: flatRect(LCD, LCD_Z, view, 4),
  // Leader from the plate's back edge up to the phone screen.
  clip: columnClip(PLATE),
  // Leader from the plate's top-right corner up the right side of the phone to the screen's lower-right corner.
  leader: pathD([at([PLATE.x + PLATE.w - 2, PLATE.y + 2, PLATE_H]), at([40, 10, 26]), at([SCREEN.x1, SCREEN.y1, slopeZ(SCREEN.y1) + 0.5])]),
  leaderEnds: [at([PLATE.x + PLATE.w - 2, PLATE.y + 2, PLATE_H]), at([SCREEN.x1, SCREEN.y1, slopeZ(SCREEN.y1) + 0.5])] as [number, number][],
  calling: faceMatrix([CALL_X, CALL_Y + 8], LCD_Z, view, "x"),
  // "Hard to read" warning box round the tight digit run.
  warn: flatRect({ x: calloutX(0, 0) - 5, y: CALL_Y - CALL_CHAR * 0.85, w: calloutX(9, 0) - calloutX(0, 0) + 10, d: CALL_CHAR * 1.2, r: 1.2 }, LCD_Z + 0.05, view, 3),
  // The two new gaps of the grouped number (981 | 234 | 5670): a thin rust bar centred in each, on the glass.
  gaps: [2, 5]
    .map((i) => {
      const mid = (calloutX(i, 1) + calloutX(i + 1, 1)) / 2;
      return flatRect({ x: mid - 0.5, y: CALL_Y - CALL_CHAR * 0.8, w: 1, d: CALL_CHAR * 1.05, r: 0.45 }, LCD_Z + 0.06, view, 2);
    })
    .join(""),
};

// Hex blocks rest centred over each nibble of the 8-bit row with the gap open.
const KEY = { split: 0, centre: 1, nib: 1 };
const blockCentre = (k: number) => (tileX(k * 4, KEY) + tileX(k * 4 + 3, KEY)) / 2;

export const blocks = [0, 1].map((k) => {
  const cx = blockCentre(k);
  const rect: Rect = { x: cx - BLOCK_W / 2, y: BLOCK_Y, w: BLOCK_W, d: BLOCK_D, r: 1.5 };
  return {
    body: prism(rect, 0, BLOCK_H, view, 4, 0.8),
    halo: prismFill(inset(rect, 2), 0.1, 0.1, view),
    text: frontMatrix([cx, BLOCK_Y + BLOCK_D, BLOCK_H / 2 - BLOCK_CHAR * 0.36]),
  };
});

export const blockOffset = (up: number) => `translate(0 ${(-up * BLOCK_TRAVEL).toFixed(2)})`;

// Entrance spark points: the phone plinth and callout plate corners.
export const contacts = [
  ...rectCorners({ x: PHONE.x0 - 1.5, y: DECK_Y - 1.5, w: PHONE.x1 - PHONE.x0 + 3, d: PHONE.y1 - DECK_Y + 3 }),
  ...rectCorners(PLATE),
].map(([x, y]) => at([x, y, 0]));

// Hex table position: just below the long board's front edge, as a fraction of the stage height.
export const TABLE_TOP = (Math.max(...boxCorners(LONG, -SLAB_H - FOOT_H, 0).map((p) => at(p)[1])) + 12) / STAGE_H;
