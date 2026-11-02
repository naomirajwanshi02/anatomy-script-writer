// Priority phone: one board (always on screen). x runs right, y toward the viewer (front face +y), z up.
// Analogy: the rank stand at the back left (four raised sound tiles, top to bottom call, alarm, music, ping) and, to
// its right, a speaker dock with a large woofer and a phone standing in the dock (backlit blue LCD).
// Circuit: the stand widens into one wall; on its face four levers (wires 3..0, top to bottom) with their number and
// sound icon, four wires running right into the encoder block, and on the block's right the output lamps "2" and "1"
// and, below them, the valid lamp.
// Visibility: the dock (56 high) stands in front of the wall's right half only while the wall is hidden; wires 52 apart.
import { boxCorners, fitView, flatPath, flatRect, heightPx, inset, pathD, prism, prismFill, project, rectCorners, type Rect, type Vec2, type Vec3 } from "../../iso/iso-kit";
import { bulbParts } from "../../iso/react/bulb";
import { ROWS, type Sound, SOUNDS } from "./model";

export const STAGE_W = 600;
const AZIMUTH = 62;
const PAD = 14;

// Board.
export const BOARD: Rect = { x: -156, y: -70, w: 312, d: 112, r: 8 };
const SLAB_H = 8;
const FOOT_H = 4;

// Stand (analogy) and wall (circuit): same depth and height, the wall wider.
const BY = -58;
export const FY = -24; // stand / wall face
const WALL_H = 240;
const STAND: Rect = { x: -146, y: BY, w: 96, d: FY - BY, r: 1 };
const WALL: Rect = { x: -146, y: BY, w: 292, d: FY - BY, r: 1 };
export const zc = (r: number) => 40 + r * 52; // row centre (wire 0 at the bottom)

// Tiles.
const TILE = { x0: -138, x1: -58, h: 42, d: 5 };
const TILE_ICON_X = -98;
export const ICON_S = 26;
// Circuit row: icon, number, lever, wire into the block.
const ROW_ICON_X = -132;
const NUM_X = -113;
const LEVER_X = -92;
const PIVOT_TRAVEL = 12;
export const NUM_SIZE = 17;
export const KNOB_R = 6;
export const ICON_SLIDE = ROW_ICON_X - TILE_ICON_X;
export const ICON_K = 0.72;

// Encoder block on the wall and its outputs.
const BLOCK: Rect = { x: -24, y: FY, w: 74, d: 18, r: 1.5 };
const BLOCK_Z0 = 16;
const BLOCK_H = 206;
const BX1 = BLOCK.x + BLOCK.w;
const LAMP_X = [86, 126];
const LAMP_Z = 150; // bracket bottom
const VALID_X = 106;
const VALID_Z = 56;
const LAMP_K = 1.55;
export const LABEL_SIZE = 15;

// Dock and phone (analogy).
const DOCK: Rect = { x: -30, y: -50, w: 172, d: 42, r: 3 };
const DOCK_H = 56;
const DOCK_FY = DOCK.y + DOCK.d;
const WOOF = { x: 56, z: 28, r: 19 };
const PHONE: Rect = { x: 2, y: -42, w: 108, d: 10, r: 4 };
const PHONE_Z0 = DOCK_H;
const PHONE_H = 222;
const PFY = PHONE.y + PHONE.d;
const SCR = { x0: 9, x1: 103, z0: 76, z1: 270 };
const PCX = (SCR.x0 + SCR.x1) / 2;

// Stage: board and wall (and phone) at 95 % of the frame width.
const PTS: Vec3[] = [...boxCorners(BOARD, -SLAB_H - FOOT_H, 0), ...boxCorners(WALL, 0, WALL_H), ...boxCorners(PHONE, PHONE_Z0, PHONE_Z0 + PHONE_H)];
const unit = fitView(PTS, STAGE_W, 4000, { pad: PAD, azimuth: AZIMUTH });
const ys = PTS.map((p) => project(p, unit)[1]);
export const STAGE_H = Math.ceil(Math.max(...ys) - Math.min(...ys) + PAD * 2);
export const view = fitView(PTS, STAGE_W, STAGE_H, { pad: PAD, azimuth: AZIMUTH });

export const at = (p: Vec3) => project(p, view);
const r3 = (v: number) => Math.round(v * 1e3) / 1e3;
const P = (pts: Vec3[], close = false) => pathD(pts.map(at), close);
export const liftPx = (dz: number) => heightPx(dz, view);
// Screen offset of a move by dx board units along x (icons sliding at the fold).
export const slidePx = (dx: number): Vec2 => {
  const a = at([0, 0, 0]);
  const b = at([dx, 0, 0]);
  return [b[0] - a[0], b[1] - a[1]];
};

// Text on a front face (+y plane at depth y), upright, centred on height z for a char of size `size`.
export const frontText = (x: number, y: number, z: number, size: number) => {
  const p: Vec3 = [x, y, z - size * 0.36];
  const o = at(p);
  const ax = at([p[0] + 1, p[1], p[2]]);
  const az = at([p[0], p[1], p[2] - 1]);
  return `matrix(${r3(ax[0] - o[0])} ${r3(ax[1] - o[1])} ${r3(az[0] - o[0])} ${r3(az[1] - o[1])} ${r3(o[0])} ${r3(o[1])})`;
};
const fRect = (y: number, x0: number, x1: number, z0: number, z1: number) => P([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], true);
const fLine = (y: number, pts: [number, number][]) => P(pts.map(([x, z]) => [x, y, z] as Vec3));
const fArc = (y: number, cx: number, cz: number, r: number, a0: number, a1: number, seg = 40): Vec2[] =>
  Array.from({ length: seg + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / seg;
    return at([cx + Math.cos(a) * r, y, cz + Math.sin(a) * r]);
  });
const fCircle = (y: number, cx: number, cz: number, r: number, seg = 32) => pathD(fArc(y, cx, cz, r, 0, Math.PI * 2, seg), true);
const fPoly = (y: number, pts: [number, number][]) => P(pts.map(([x, z]) => [x, y, z] as Vec3), true);

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

// ---------- Sound icons (front plane, centre cx/cz, size s): fill paths and line paths ----------

export function icon(kind: Sound, y: number, cx: number, cz: number, s: number) {
  const k = s / 2;
  const pt = (u: number, v: number): [number, number] => [cx + u * k, cz + v * k];
  const poly = (pts: [number, number][]) => fPoly(y, pts.map(([u, v]) => pt(u, v)));
  const line = (pts: [number, number][]) => fLine(y, pts.map(([u, v]) => pt(u, v)));
  const dot = (u: number, v: number, r: number) => fCircle(y, cx + u * k, cz + v * k, r * k, 20);
  const arc = (u: number, v: number, r: number, a0: number, a1: number) =>
    pathD(fArc(y, cx + u * k, cz + v * k, r * k, a0, a1, 18));
  if (kind === "call") {
    // Handset: a thick arc with an ear cup and a mouth cup.
    return {
      fill: dot(-0.3, 0.72, 0.26) + dot(0.72, -0.3, 0.26),
      line: "",
      thick: arc(0.3, 0.3, 0.74, Math.PI * 0.75, Math.PI * 1.75),
    };
  }
  if (kind === "alarm") {
    return {
      fill:
        poly([[-0.78, -0.42], [0.78, -0.42], [0.62, -0.26], [0.52, 0.28], [0.32, 0.58], [0, 0.68], [-0.32, 0.58], [-0.52, 0.28], [-0.62, -0.26]]) +
        dot(0, -0.62, 0.17) +
        dot(0, 0.8, 0.1),
      line: "",
      thick: "",
    };
  }
  if (kind === "music") {
    return {
      fill: dot(-0.5, -0.58, 0.24) + dot(0.42, -0.42, 0.24) + poly([[-0.29, 0.62], [0.63, 0.8], [0.63, 0.52], [-0.29, 0.34]]),
      line: line([[-0.29, -0.56], [-0.29, 0.62]]) + line([[0.63, -0.4], [0.63, 0.8]]),
      thick: "",
    };
  }
  // Ping: a speech bubble with three dots.
  return {
    fill: dot(-0.36, 0.22, 0.1) + dot(0, 0.22, 0.1) + dot(0.36, 0.22, 0.1),
    line: poly([[-0.8, -0.22], [-0.42, -0.22], [-0.62, -0.72], [-0.04, -0.22], [0.8, -0.22], [0.8, 0.68], [-0.8, 0.68]]),
    thick: "",
  };
}

// ---------- Stand with tiles (analogy) ----------

const ty = FY + TILE.d;
export const stand = {
  body: prism(STAND, 0, WALL_H, view, 3, 0.5),
  coping: prism({ x: STAND.x - 1.2, y: STAND.y - 1.2, w: STAND.w + 2.4, d: STAND.d + 2.4, r: 1 }, WALL_H, 2.5, view, 3, 0.3),
  tiles: ROWS.map((r) => ({
    r,
    body: prism({ x: TILE.x0, y: FY, w: TILE.x1 - TILE.x0, d: TILE.d, r: 1.5 }, zc(r) - TILE.h / 2, TILE.h, view, 3, 0.4),
    face: fRect(ty + 0.05, TILE.x0 + 1, TILE.x1 - 1, zc(r) - TILE.h / 2 + 1, zc(r) + TILE.h / 2 - 1),
  })),
  // "1st" tag beside the music tile.
  first: frontText(TILE.x1 + 6, FY + 0.1, zc(1) + 13, 11),
};
// Icons: drawn at the tile position; slid left to the row position in the circuit (same plane as the tile face).
export const icons = ROWS.map((r) => ({ r, kind: SOUNDS[r], ...icon(SOUNDS[r], ty + 0.2, TILE_ICON_X, zc(r), ICON_S) }));
// Icon scale about its own centre (screen point) for the circuit size.
export const iconCentre = (r: number) => at([TILE_ICON_X, ty + 0.2, zc(r)]);

// ---------- Dock and phone (analogy) ----------

const dy = DOCK_FY + 0.05;
const py = PFY + 0.05;
export const dock = {
  body: prism(DOCK, 0, DOCK_H, view, 6, 0.8),
  grille: fCircle(dy, WOOF.x, WOOF.z, WOOF.r + 4, 48),
  cone: fCircle(dy + 0.05, WOOF.x, WOOF.z, WOOF.r, 48),
  ring: fCircle(dy + 0.1, WOOF.x, WOOF.z, WOOF.r * 0.62, 40),
  cap: fCircle(dy + 0.15, WOOF.x, WOOF.z, WOOF.r * 0.26, 24),
  tweet: [fCircle(dy + 0.05, 112, 28, 7, 24), fCircle(dy + 0.05, 0, 28, 7, 24)],
  slot: flatRect({ x: PHONE.x - 3, y: PHONE.y - 3, w: PHONE.w + 6, d: PHONE.d + 6, r: 2 }, DOCK_H + 0.05, view, 4),
  // ( o ) arc pairs round the woofer, in the dock's front plane, each pair further out.
  arcs: [28, 38, 48].map((r) => pathD(fArc(dy + 1, WOOF.x, WOOF.z, r, -0.55, 0.55, 16)) + pathD(fArc(dy + 1, WOOF.x, WOOF.z, r, Math.PI - 0.55, Math.PI + 0.55, 16))),
  ringArcs: [30, 42, 54].map((r) => pathD(fArc(dy + 1, WOOF.x, WOOF.z, r, -0.7, 0.7, 16)) + pathD(fArc(dy + 1, WOOF.x, WOOF.z, r, Math.PI - 0.7, Math.PI + 0.7, 16))),
  woofer: at([WOOF.x, dy, WOOF.z]),
};
export const phone = {
  body: prism(PHONE, PHONE_Z0, PHONE_H, view, 6, 0.8),
  bezel: fRect(py, PHONE.x + 3, PHONE.x + PHONE.w - 3, PHONE_Z0 + 4, PHONE_Z0 + PHONE_H - 4),
  glass: fRect(py + 0.05, SCR.x0, SCR.x1, SCR.z0, SCR.z1),
  // Bright line for the screen opening (centre row).
  line: (u: number) => fRect(py + 0.1, SCR.x0, SCR.x1, (SCR.z0 + SCR.z1) / 2 - Math.max(0.6, u * (SCR.z1 - SCR.z0) / 2), (SCR.z0 + SCR.z1) / 2 + Math.max(0.6, u * (SCR.z1 - SCR.z0) / 2)),
  home: fRect(py + 0.05, PCX - 16, PCX + 16, PHONE_Z0 + 9, PHONE_Z0 + 12),
  cam: fCircle(py + 0.05, PCX, SCR.z1 + 3.4, 1.6, 12),
  shine: fLine(py + 0.12, [[SCR.x0 + 8, SCR.z1 - 30], [SCR.x0 + 22, SCR.z1 - 56]]),
};
// Screens: music player and incoming call.
const sy = py + 0.15;
export const LCD = { title: 11, big: 19, small: 10 };
export const music = {
  note: icon("music", sy, PCX, 222, 50),
  title: frontText(PCX, sy, 178, LCD.title),
  bar: fRect(sy, SCR.x0 + 10, SCR.x1 - 10, 158, 161),
  knob: fCircle(sy, SCR.x0 + 46, 159.5, 4, 16),
  eq: Array.from({ length: 7 }, (_, i) => (h: number) => fRect(sy, PCX - 33 + i * 10, PCX - 27 + i * 10, 100, 100 + h)),
  play: fPoly(sy, [[PCX - 6, 84], [PCX - 6, 96], [PCX + 6, 90]]),
};
export const call = {
  icon: icon("call", sy, PCX, 228, 36),
  name: frontText(PCX, sy, 186, LCD.big),
  sub: frontText(PCX, sy, 166, LCD.small),
  decline: fCircle(sy, PCX - 26, 100, 11, 28),
  accept: fCircle(sy, PCX + 26, 100, 11, 28),
  ringIcon: [icon("call", sy + 0.05, PCX - 26, 100, 13), icon("call", sy + 0.05, PCX + 26, 100, 13)],
};

// ---------- Wall (circuit) ----------

const wy = FY + 0.05;
export type LeverGeo = { x: number; y: number; pivot: number; travel: number };
export const leverTip = (l: LeverGeo, up: number) => at([l.x, l.y + 12, l.pivot + (2 * up - 1) * l.travel]);
export const leverRod = (l: LeverGeo, up: number) => pathD([at([l.x, l.y + 0.2, l.pivot]), leverTip(l, up)]);
export const wall = {
  body: prism(WALL, 0, WALL_H, view, 3, 0.5),
  coping: prism({ x: WALL.x - 1.2, y: WALL.y - 1.2, w: WALL.w + 2.4, d: WALL.d + 2.4, r: 1 }, WALL_H, 2.5, view, 3, 0.3),
  plinth: fRect(wy, WALL.x, WALL.x + WALL.w, 0, 8),
  rows: ROWS.map((r) => {
    const geo: LeverGeo = { x: LEVER_X, y: wy + 0.1, pivot: zc(r), travel: PIVOT_TRAVEL };
    return {
      r,
      geo,
      slot: fRect(wy + 0.03, LEVER_X - 3, LEVER_X + 3, zc(r) - PIVOT_TRAVEL - 1, zc(r) + PIVOT_TRAVEL + 1),
      boss: fCircle(wy + 0.05, LEVER_X, zc(r), 4.8, 24),
      num: frontText(NUM_X, wy + 0.1, zc(r), NUM_SIZE),
      first: frontText(LEVER_X + 12, wy + 0.1, zc(r) + 16, 11),
      // Wire from the lever pivot into the block; `u` (0..1) is how far it is drawn.
      wire: (u: number) => fLine(wy + 0.12, [[LEVER_X, zc(r)], [LEVER_X + (BLOCK.x + 4 - LEVER_X) * Math.max(0.001, u), zc(r)]]),
    };
  }),
  block: prism(BLOCK, BLOCK_Z0, BLOCK_H, view, 3, 0.6),
  // Output wires: Y1 to lamp "2", Y0 to lamp "1", V to the valid lamp (along the wall, then up to the bracket).
  outs: [
    fLine(wy + 0.12, [[BX1, 112], [LAMP_X[0], 112], [LAMP_X[0], LAMP_Z]]),
    fLine(wy + 0.12, [[BX1, 96], [LAMP_X[1], 96], [LAMP_X[1], LAMP_Z]]),
    fLine(wy + 0.12, [[BX1, 36], [VALID_X, 36], [VALID_X, VALID_Z]]),
  ],
  labels: [frontText(LAMP_X[0] - 11, wy + 0.1, 130, LABEL_SIZE), frontText(LAMP_X[1] - 11, wy + 0.1, 130, LABEL_SIZE)],
  validLabel: frontText(VALID_X + 10, wy + 0.1, 46, 12),
  lamps: [...LAMP_X.map((x) => [x, LAMP_Z] as const), [VALID_X, VALID_Z] as const].map(([x, z]) => {
    const base = at([x, FY + 5, z + 1.6]);
    const g = at([x, FY + 5, 0]);
    const globeZ = z + 1.6 + LAMP_K * (1.6 + 3 + 4.8);
    return {
      bracket: prism({ x: x - 7, y: FY, w: 14, d: 10, r: 0.8 }, z, 1.6, view, 2, 0.3),
      bulb: bulbParts([x, FY + 5], view, { baseR: 4.2, h: 3 }),
      bulbTransform: `translate(${r3(base[0])} ${r3(base[1])}) scale(${LAMP_K}) translate(${r3(-g[0])} ${r3(-g[1])})`,
      ring: fCircle(FY + 5, x, globeZ, 16, 32),
      pool: fCircle(wy + 0.08, x, globeZ, 26, 40),
    };
  }),
};
// Scan dot path (screen): from the music tile's right edge into the woofer.
export const beamFrom = at([TILE.x1, ty, zc(1)]);
export const beamTo = dock.woofer;

// Entrance spark points: the stand's and the dock's front corners.
export const contacts: Vec2[] = [at([STAND.x, FY, 0]), at([STAND.x + STAND.w, FY, 0]), at([DOCK.x, DOCK_FY, 0]), at([DOCK.x + DOCK.w, DOCK_FY, 0]), at([DOCK.x + DOCK.w, DOCK.y, 0])];
