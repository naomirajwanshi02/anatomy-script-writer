// Full adder as paper columns: one long board, always on screen. Analogy: a sheet of squared paper lies on it with
// 58 over 67, a carry box above each column, a rule and the answer row, and a pencil (rust tip) hovering over it.
// Circuit: four columns of bit tiles (row A, row B), a full-adder block under each column, the carry tiles between
// the blocks (carry out of one = carry in of the next, passed left) and the sum row in front.
import {
  boxCorners,
  fitView,
  flatPath,
  flatRect,
  inset,
  pathD,
  prism,
  prismFill,
  project,
  rectCorners,
  type Rect,
  type Vec2,
  type Vec3,
} from "../../iso/iso-kit";

export const STAGE_W = 600;
const AZIMUTH = 62;
const PAD = 14;

// Board.
export const BOARD: Rect = { x: -86, y: -60, w: 172, d: 96, r: 7 };
const SLAB_H = 8;
const FOOT_H = 4;

// Columns: i = 0..3 left to right (bit 3 .. bit 0); paper uses columns 1..3 (hundreds, tens, units).
export const PITCH = 36;
export const colX = (i: number) => (i - 1.5) * PITCH;

// Circuit rows (board y): A tiles, B tiles, the adder blocks with the carry tiles between them, the sum tiles.
export const ROW = { a: -44, b: -26, fa: -2, s: 20 };
export const TILE = 15;
export const TILE_H = 5;
export const CHAR_SIZE = 12;
export const FA = { w: 20, d: 14, h: 6 };
export const CTILE = 9;
export const CTILE_H = 3;
export const C_CHAR = 7.5;
// Carry tile k sits right of block k - 1 and left of block k: k = 4 is block 3's carry in, k = 0 is block 0's carry out.
export const carryX = (k: number) => colX(k) - PITCH / 2;

// Paper rows (board y): carry boxes, the two numbers, the rule, the answer.
export const PAPER: Rect = { x: -40, y: -56, w: 110, d: 88, r: 1.5 };
export const PAPER_Z = 0.7;
export const PROW = { carry: -46, a: -31, b: -15, rule: -6, ans: 10 };
export const P_CHAR = 15;
export const P_CARRY_CHAR = 8;
export const CARRY_BOX = 10;

// Stage: the board and the tallest parts (with headroom for hops and the pencil) at 95 % of the frame width.
const PTS: Vec3[] = [...boxCorners(BOARD, -SLAB_H - FOOT_H, 0), ...boxCorners(BOARD, 0, 14)];
const unit = fitView(PTS, STAGE_W, 2000, { pad: PAD, azimuth: AZIMUTH });
const ys = PTS.map((p) => project(p, unit)[1]);
export const STAGE_H = Math.ceil(Math.max(...ys) - Math.min(...ys) + PAD * 2);
export const view = fitView(PTS, STAGE_W, STAGE_H, { pad: PAD, azimuth: AZIMUTH });

export const at = (p: Vec3) => project(p, view);
const r3 = (v: number) => Math.round(v * 1e3) / 1e3;

// Text lying flat on the board at (x, y, z), reading along +x, baseline centred for a char of size `size`.
export const flatText = (x: number, y: number, z: number, size: number) => {
  const o = at([x, y + size * 0.36, z]);
  const ax = at([x + 1, y + size * 0.36, z]);
  const ay = at([x, y + 1 + size * 0.36, z]);
  return `matrix(${r3(ax[0] - o[0])} ${r3(ax[1] - o[1])} ${r3(ay[0] - o[0])} ${r3(ay[1] - o[1])} ${r3(o[0])} ${r3(o[1])})`;
};

// Local 2D frame on a front face (+y plane): u along +x, v downward (-z), origin at p.
const frontMatrix = (p: Vec3) => {
  const o = at(p);
  const ax = at([p[0] + 1, p[1], p[2]]);
  const az = at([p[0], p[1], p[2] - 1]);
  return `matrix(${r3(ax[0] - o[0])} ${r3(ax[1] - o[1])} ${r3(az[0] - o[0])} ${r3(az[1] - o[1])} ${r3(o[0])} ${r3(o[1])})`;
};

// Board engraving on the front face, centred.
export const ENGRAVE = "ROLLIN-रोलिन-ROLLIN-रोलिन";
export const ENGRAVE_SIZE = 3.6;
export const engraveAt = frontMatrix([BOARD.x + BOARD.w / 2, BOARD.y + BOARD.d, -SLAB_H / 2 - ENGRAVE_SIZE * 0.36]);

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

// Paper sheet: a thin slab with faint squares, the carry boxes, the plus sign and the rule.
const GRID = 6;
export const paper = (() => {
  const p = PAPER;
  const lines: string[] = [];
  for (let x = p.x + GRID; x < p.x + p.w - 1; x += GRID) lines.push(pathD([at([x, p.y + 1, PAPER_Z]), at([x, p.y + p.d - 1, PAPER_Z])]));
  for (let y = p.y + GRID; y < p.y + p.d - 1; y += GRID) lines.push(pathD([at([p.x + 1, y, PAPER_Z]), at([p.x + p.w - 1, y, PAPER_Z])]));
  const boxes = [1, 2, 3].map((i) => flatRect({ x: colX(i) - CARRY_BOX / 2, y: PROW.carry - CARRY_BOX / 2, w: CARRY_BOX, d: CARRY_BOX, r: 0.6 }, PAPER_Z, view, 2));
  return {
    sheet: prism(p, 0, PAPER_Z, view, 2, 0),
    halo: prismFill({ ...p, x: p.x - 2, y: p.y - 2, w: p.w + 4, d: p.d + 4 }, 0, 0.1, view),
    grid: lines.join(""),
    boxes,
    rule: pathD([at([colX(1) - 13, PROW.rule, PAPER_Z]), at([colX(3) + 13, PROW.rule, PAPER_Z])]),
    plus: flatText(colX(1) - 3, PROW.b, PAPER_Z, P_CHAR),
    // Hint outlines round the tens column's three slots (carry box, top digit, bottom digit).
    slots: [PROW.carry, PROW.a, PROW.b].map((y, k) => {
      const s = k === 0 ? CARRY_BOX + 3 : P_CHAR + 2;
      return flatRect({ x: colX(2) - s / 2, y: y - s / 2, w: s, d: s, r: 1 }, PAPER_Z + 0.05, view, 3);
    }),
  };
})();

// Bit tile and carry tile solids at (x, y), dropped by z and grown by grow (0..1).
export function tileSolid(x: number, y: number, size: number, h: number, z: number, grow: number) {
  const hh = Math.max(0.05, h * grow);
  const rect: Rect = { x: x - size / 2, y: y - size / 2, w: size, d: size, r: 1.2 };
  return { paths: prism(rect, z, hh, view, 3, Math.min(0.6, hh / 4)), top: z + hh };
}

// Full-adder block under column i, grown by grow (0..1).
export function faSolid(i: number, grow: number) {
  const h = Math.max(0.05, FA.h * grow);
  const rect: Rect = { x: colX(i) - FA.w / 2, y: ROW.fa - FA.d / 2, w: FA.w, d: FA.d, r: 1.5 };
  return { paths: prism(rect, 0, h, view, 3, Math.min(0.8, h / 4)), top: h };
}

// Carry wire segment from block k (its left side) to carry tile k to block k - 1 (its right side), at board level.
export const carryWire = (k: number) => {
  const pts: Vec3[] = [];
  if (k <= 3) pts.push([colX(k) - FA.w / 2, ROW.fa, 0.3]);
  else pts.push([carryX(k) + CTILE / 2 + 0.5, ROW.fa, 0.3]);
  if (k >= 1) pts.push([colX(k - 1) + FA.w / 2, ROW.fa, 0.3]);
  else pts.push([carryX(k) - CTILE / 2 - 0.5, ROW.fa, 0.3]);
  return pathD(pts.map(at));
};
// Short wires from the A and B tiles down into each block, and from each block to its sum tile, passing beside the tiles.
export const columnWire = (i: number) =>
  pathD([at([colX(i) + TILE / 2 + 1.5, ROW.a, 0.3]), at([colX(i) + TILE / 2 + 1.5, ROW.fa - FA.d / 2, 0.3])]) +
  pathD([at([colX(i) - TILE / 2 - 1.5, ROW.b, 0.3]), at([colX(i) - TILE / 2 - 1.5, ROW.fa - FA.d / 2, 0.3])]) +
  pathD([at([colX(i), ROW.fa + FA.d / 2, 0.3]), at([colX(i), ROW.s - TILE / 2, 0.3])]);

// Engraved row labels left of the tiles.
export const LABEL_SIZE = 6;
export const rowLabel = (y: number) => flatText(colX(0) - 19, y, 0.02, LABEL_SIZE);
export const faLabel = (i: number) => (h: number) => flatText(colX(i), ROW.fa, h + 0.02, 5.5);

// Readout position: just below the board's front edge, as a fraction of the stage height.
export const TABLE_TOP = (Math.max(...boxCorners(BOARD, -SLAB_H - FOOT_H, 0).map((q) => at(q)[1])) + 4) / STAGE_H;

// Pencil, drawn in screen space from its tip: a hexagonal body up and to the right, a wood cone and a rust lead.
export const PENCIL_DIR: Vec2 = [0.55, -0.84];
export const PENCIL_LEN = 92;
export const PENCIL_W = 7;

// Entrance spark points: the paper's corners.
export const contacts = rectCorners(PAPER).map(([x, y]) => at([x, y, 0]));

// Camera: the analogy is zoomed in on the paper (k = 0) and eases out to the whole board for the circuit (k = 1).
const ZOOM = 1.38;
const PAPER_C = at([PAPER.x + PAPER.w / 2, PAPER.y + PAPER.d / 2 - 4, 4]);
export const zoomTransform = (k: number) => {
  const e = k * k * (3 - 2 * k);
  const z = ZOOM + (1 - ZOOM) * e;
  const tx = (1 - e) * (STAGE_W / 2 - ZOOM * PAPER_C[0]);
  const ty = (1 - e) * (STAGE_H / 2 - ZOOM * PAPER_C[1]);
  return `translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${z.toFixed(4)})`;
};
