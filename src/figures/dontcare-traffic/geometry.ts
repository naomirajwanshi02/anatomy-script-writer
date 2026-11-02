// Don't-care traffic light: a square board (always on screen). Analogy: a traffic light on a short pole on the left
// half; a dashed ghost light (red and green both lit) appears in the open space on the right. Fold: the light sinks
// into the board and its three lamps fly down into three bit tiles R Y G at the back; a flat 2x4 grid of boxes (rows
// R, columns YG in Gray order) with a little flat traffic light in each box; the go lamp (kit bulb) at the back right,
// wired from the G tile. x runs right, y toward the viewer (front face +y), z up.
import { boxCorners, cylinder, fitView, flatCircle, flatPath, flatRect, heightPx, inset, pathD, prism, prismFill, project, rectCorners, solidSvg, translateTo, type Rect, type Vec2, type Vec3 } from "../../iso/iso-kit";
import { bulbParts } from "../../iso/react/bulb";
import { bitsOf, cellCode, COLS, LAMPS, LOOPBOX, ROWS } from "./model";

export const STAGE_W = 600;
const AZIMUTH = 62;
const PAD = 6;

// Board.
// Board: deep (grown toward the back) so the grid boxes can be deep; narrow enough along x to keep the frame width.
const BOARD: Rect = { x: -64, y: -94, w: 128, d: 157, r: 7 };
const SLAB_H = 8;
const FOOT_H = 4;

// Traffic light: plinth, pole, backplate and housing, centred at (LX, LY).
const LX = -27;
const LY = -12;
const BASE: Rect = { x: LX - 13, y: LY - 13, w: 26, d: 26, r: 2.5 };
const BASE_H = 13;
const POLE_R = 4.2;
const HOUSE_Z = 40; // housing bottom = pole top
const HOUSE: Rect = { x: LX - 15, y: LY - 9, w: 30, d: 18, r: 3 };
const HOUSE_H = 74;
const BACK: Rect = { x: LX - 20, y: LY - 11.5, w: 40, d: 2.5, r: 1.2 };
const BACK_Z = HOUSE_Z - 4;
const BACK_H = HOUSE_H + 8;
const FRONT_Y = HOUSE.y + HOUSE.d;

// Lenses on the front face: radius, centre heights (top to bottom), visor size.
const LENS_R = 9.5;
const LENS_Z = LAMPS.map((_, i) => HOUSE_Z + HOUSE_H - 13 - i * 24);
const VISOR_R = 11;
const VISOR_L = 4.5;

// Stage: fit the board and the light to the width, then size the height to match.
const PTS: Vec3[] = [...boxCorners(BOARD, -SLAB_H - FOOT_H, 0), ...boxCorners(BACK, BACK_Z, BACK_Z + BACK_H), [LX, FRONT_Y + VISOR_L, LENS_Z[0] + VISOR_R]];
const tall = fitView(PTS, STAGE_W, 4000, { pad: PAD, azimuth: AZIMUTH });
const ys = PTS.map((p) => project(p, tall)[1]);
export const STAGE_H = Math.ceil(Math.max(...ys) - Math.min(...ys) + PAD * 2);
export const view = fitView(PTS, STAGE_W, STAGE_H, { pad: PAD, azimuth: AZIMUTH });

const at = (p: Vec3) => project(p, view);
const r3 = (v: number) => Math.round(v * 1e3) / 1e3;

// Convex hull of screen points (monotone chain), for the sink clip.
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

// Text on a front face (+y), reading along +x, upright along +z.
const frontMatrix = (p: Vec3) => {
  const o = at(p);
  const ax = at([p[0] + 1, p[1], p[2]]);
  const az = at([p[0], p[1], p[2] - 1]);
  return `matrix(${r3(ax[0] - o[0])} ${r3(ax[1] - o[1])} ${r3(az[0] - o[0])} ${r3(az[1] - o[1])} ${r3(o[0])} ${r3(o[1])})`;
};
// Text lying flat on the board top, reading along +x, its baseline toward +y.
const topMatrix = (p: Vec3) => {
  const o = at(p);
  const ax = at([p[0] + 1, p[1], p[2]]);
  const ay = at([p[0], p[1] + 1, p[2]]);
  return `matrix(${r3(ax[0] - o[0])} ${r3(ax[1] - o[1])} ${r3(ay[0] - o[0])} ${r3(ay[1] - o[1])} ${r3(o[0])} ${r3(o[1])})`;
};

// Engraving on the board's front face (+y), centred, upright.
export const ENGRAVE = "ROLLIN-रोलिन-ROLLIN-रोलिन";
export const ENGRAVE_SIZE = 3.6;
export const boardEngrave = frontMatrix([BOARD.x + BOARD.w / 2, BOARD.y + BOARD.d, -SLAB_H / 2 - ENGRAVE_SIZE * 0.36]);

export const boardSvg = (() => {
  const b = BOARD;
  const feet = rectCorners(b, 14)
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

// Circle in the front plane (x-z) at depth y.
const ring = (cx: number, y: number, cz: number, r: number, a0 = 0, a1 = Math.PI * 2, seg = 40): Vec2[] =>
  Array.from({ length: seg + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / seg;
    return at([cx + Math.cos(a) * r, y, cz + Math.sin(a) * r]);
  });

// Visor: a hood over the upper half of the lens, longest at the top, cut back to nothing at the sides.
const visorArc = (cx: number, cz: number, k: number): Vec2[] =>
  Array.from({ length: 41 }, (_, i) => {
    const a = (Math.PI * i) / 40;
    return at([cx + Math.cos(a) * VISOR_R, FRONT_Y + VISOR_L * Math.sin(a) * k, cz + Math.sin(a) * VISOR_R]);
  });

// Lamps of a light standing dx right of the real one (dx = 0: the real light; GHOST_DX: the ghost).
const lampSet = (dx: number) =>
  LAMPS.map((lamp, i) => {
    const cz = LENS_Z[i];
    const cx = LX + dx;
    return {
      lamp,
      bezel: pathD(ring(cx, FRONT_Y + 0.05, cz, LENS_R + 1.4), true),
      lens: pathD(ring(cx, FRONT_Y + 0.1, cz, LENS_R), true),
      shine: pathD(ring(cx, FRONT_Y + 0.15, cz, LENS_R * 0.68, Math.PI * 0.58, Math.PI * 0.9, 10)),
      halo: pathD(ring(cx, FRONT_Y + 0.2, cz, LENS_R * 1.45), true),
      visor: pathD([...visorArc(cx, cz, 1), ...visorArc(cx, cz, 0).reverse()], true),
      visorRim: pathD(visorArc(cx, cz, 1)),
    };
  });
export const lamps = lampSet(0);

// Light pool on the board in front of the light (tinted by the lit lamp).
export const pool = flatCircle(LX + 1, FRONT_Y + 15, 21, 0.05, view, 48);

const lightSet = (dx: number) => {
  const mv = (r: Rect): Rect => ({ ...r, x: r.x + dx });
  return {
    base: prism(mv(BASE), 0, BASE_H, view, 6, 0.8),
    collar: cylinder(LX + dx, LY, POLE_R + 1.6, BASE_H, 2.5, view, 28, 0.3),
    pole: cylinder(LX + dx, LY, POLE_R, BASE_H + 2.5, HOUSE_Z - BASE_H - 2.5, view, 28),
    back: prism(mv(BACK), BACK_Z, BACK_H, view, 6, 0.4),
    house: prism(mv(HOUSE), HOUSE_Z, HOUSE_H, view, 8, 0.8),
  };
};
export const light = lightSet(0);

// Ghost light in the open space on the right (dashed outlines; red and green both lit).
const GHOST_DX = 56;
export const ghost = { ...lightSet(GHOST_DX), lamps: lampSet(GHOST_DX) };

// Fold: the light sinks into the board (clipped at the board top) while its lamps fly to the tiles.
const SINK_H = HOUSE_Z + HOUSE_H + 12;
const FOOT: Rect = { x: LX - 21, y: LY - 13, w: 42, d: 27, r: 0 };
export const sinkClip = (() => {
  const c = rectCorners(FOOT).map(([x, y]) => at([x, y, 0]));
  return pathD(hull([...c, ...c.map(([x, y]): Vec2 => [x, y - 4000])]), true);
})();
export const sinkAt = (u: number) => translateTo(view, [0, 0, -u * SINK_H]);

// Maker's plate on the plinth's front face, with four rivets and the ROLLIN print.
const PLATE = { x0: LX - 11, x1: LX + 11, z0: 2.8, z1: BASE_H - 2.8 };
const PY = BASE.y + BASE.d + 0.1;
export const plate = {
  d: pathD([at([PLATE.x0, PY, PLATE.z0]), at([PLATE.x1, PY, PLATE.z0]), at([PLATE.x1, PY, PLATE.z1]), at([PLATE.x0, PY, PLATE.z1])], true),
  rivets: [
    [PLATE.x0 + 1.4, PLATE.z0 + 1.2],
    [PLATE.x1 - 1.4, PLATE.z0 + 1.2],
    [PLATE.x0 + 1.4, PLATE.z1 - 1.2],
    [PLATE.x1 - 1.4, PLATE.z1 - 1.2],
  ].map(([x, z]) => at([x, PY + 0.05, z])),
};
export const BRAND_SIZE = 4.6;
export const brand = frontMatrix([LX, PY + 0.1, (PLATE.z0 + PLATE.z1) / 2 - BRAND_SIZE * 0.36]);

// ---------- Circuit half ----------

// Bit tiles R Y G at the back left (the lamps land on them), letters engraved on the board in front of each tile.
const TILE = 15;
const TILE_H = 5;
const TILE_Y = -70;
const TILE_X = [-44, -24, -4];
const TILE_LENS_R = 5;
export const TILE_SIZE = 8;
export const LETTER_SIZE = 8;
export const tiles = LAMPS.map((lamp, i) => {
  const x = TILE_X[i];
  return {
    lamp,
    body: prism({ x: x - TILE / 2, y: TILE_Y - TILE / 2, w: TILE, d: TILE, r: 2 }, 0, TILE_H, view, 4, 0.6),
    lens: flatCircle(x, TILE_Y, TILE_LENS_R, TILE_H + 0.05, view, 32),
    halo: flatCircle(x, TILE_Y, TILE_LENS_R * 1.6, TILE_H + 0.05, view, 32),
    digit: topMatrix([x, TILE_Y + TILE_SIZE * 0.36, TILE_H + 0.1]),
    letter: topMatrix([x, TILE_Y + TILE / 2 + 3 + LETTER_SIZE * 0.72, 0.05]),
  };
});

// Lamp flight at the fold: from each lens on the housing down onto its tile (u = 0..1), with a small arc;
// screen centre and radius.
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const UNIT = heightPx(1, view) / Math.cos((30 * Math.PI) / 180); // screen px per board unit (about)
export const flyAt = (i: number, u: number) => {
  const p: Vec3 = [lerp(LX, TILE_X[i], u), lerp(FRONT_Y + 1, TILE_Y, u), lerp(LENS_Z[i], TILE_H + 0.1, u) + 18 * Math.sin(Math.PI * u)];
  const [x, y] = at(p);
  return { x, y, r: lerp(LENS_R, TILE_LENS_R, u) * UNIT * 0.92 };
};

// Grid of boxes: rows R (0 back, 1 front), columns YG in Gray order.
// Boxes are deeper (y) than wide (x): depth is cheap in frame width at this camera, so the grid reads bigger.
const CELL_W = 26;
const CELL_D = 44;
const GX0 = -46;
const GY0 = -43;
const GY1 = GY0 + CELL_D * ROWS.length;
const colX = (c: number) => GX0 + CELL_W * (c + 0.5);
const rowY = (r: number) => GY0 + CELL_D * (r + 0.5);
const cellRect = (r: number, c: number): Rect => ({ x: GX0 + CELL_W * c, y: GY0 + CELL_D * r, w: CELL_W, d: CELL_D, r: 0 });
const MINI_R = 3.5;
const MINI_DX = [-7.6, 0, 7.6];
export const grid = ROWS.flatMap((_, r) =>
  COLS.map((_, c) => {
    const cx = colX(c);
    const cy = rowY(r);
    const code = cellCode(r, c);
    const my = cy - 11;
    return {
      code,
      bits: bitsOf(code),
      cell: flatRect(inset(cellRect(r, c), 0.8), 0.05, view, 2),
      plate: flatRect({ x: cx - 12, y: my - 5, w: 24, d: 10, r: 2.6 }, 0.1, view, 4),
      lenses: MINI_DX.map((dx) => flatCircle(cx + dx, my, MINI_R, 0.15, view, 24)),
      halos: MINI_DX.map((dx) => flatCircle(cx + dx, my, MINI_R * 1.9, 0.15, view, 24)),
      x: flatPath([[cx - 10, cy - 18], [cx + 10, cy + 18]], 0.2, view) + flatPath([[cx + 10, cy - 18], [cx - 10, cy + 18]], 0.2, view),
      tick: flatPath([[cx - 8, cy + 5], [cx - 2, cy + 14], [cx + 9.5, cy - 1]], 0.25, view),
    };
  }),
);

// Row and column labels engraved flat on the board: "R" above the row values, "YG" in front-left, the Gray-order
// column values in front of each column.
export const LABEL_SIZE = 10;
const LBX = GX0 - 7.5;
const FRONT_LABEL = GY1 + 3.5 + LABEL_SIZE * 0.72;
export const labels = {
  r: topMatrix([LBX, GY0 - 4 + LABEL_SIZE * 0.36, 0.05]),
  rows: ROWS.map((t, r) => ({ t, m: topMatrix([LBX, rowY(r) + LABEL_SIZE * 0.36, 0.05]) })),
  yg: topMatrix([LBX, FRONT_LABEL, 0.05]),
  cols: COLS.map((t, c) => ({ t, m: topMatrix([colX(c), FRONT_LABEL, 0.05]) })),
};

// Hand-drawn rust loop round the group: a rounded rectangle with a slight wobble, starting at its top-left and running
// on a little past the start so it closes like a pen stroke.
export const loopPath = (() => {
  const x0 = GX0 + CELL_W * LOOPBOX.c0 + 1.6;
  const x1 = GX0 + CELL_W * (LOOPBOX.c1 + 1) - 1.6;
  const y0 = GY0 + CELL_D * LOOPBOX.r0 + 1.6;
  const y1 = GY0 + CELL_D * (LOOPBOX.r1 + 1) - 1.6;
  const rr = 10;
  const corners: [number, number, number][] = [
    [x0 + rr, y0 + rr, Math.PI],
    [x1 - rr, y0 + rr, -Math.PI / 2],
    [x1 - rr, y1 - rr, 0],
    [x0 + rr, y1 - rr, Math.PI / 2],
  ];
  const poly: Vec2[] = corners.flatMap(([cx, cy, a0]) =>
    Array.from({ length: 13 }, (_, i) => {
      const a = a0 + (i / 12) * (Math.PI / 2);
      return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr] as Vec2;
    }),
  );
  const dense: Vec2[] = poly.flatMap((a, i) => {
    const b = poly[(i + 1) % poly.length];
    const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 2));
    return Array.from({ length: n }, (_, k) => [a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n] as Vec2);
  });
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const n = dense.length;
  const run = [...dense, ...dense.slice(0, Math.round(n * 0.07))];
  const pts = run.map(([x, y], i) => {
    const t = i / n;
    const w = 0.9 * Math.sin(t * Math.PI * 2 * 3 + 0.7) + 0.5 * Math.sin(t * Math.PI * 2 * 5) + (i >= n ? 1.4 * ((i - n) / (run.length - n)) : 0);
    const dx = x - cx;
    const dy = y - cy;
    const l = Math.hypot(dx, dy) || 1;
    return at([x + (dx / l) * w, y + (dy / l) * w, 0.3]);
  });
  return pathD(pts);
})();

// Go lamp (kit glass bulb) at the back right, wired straight from the G tile.
const LAMP_AT: Vec2 = [38, TILE_Y];
export const goLamp = bulbParts(LAMP_AT, view);
const WIRE_PTS: Vec2[] = [
  [TILE_X[2] + TILE / 2 + 1.5, TILE_Y],
  [LAMP_AT[0] - 7.5, TILE_Y],
];
export const wire = flatPath(WIRE_PTS, 0, view);
export const wirePads = flatCircle(WIRE_PTS[0][0], TILE_Y, 1.8, 0, view, 14) + flatCircle(WIRE_PTS[1][0], TILE_Y, 1.8, 0, view, 14);

// Entrance spark points: the plinth corners.
export const contacts = rectCorners(BASE, 1).map(([x, y]) => at([x, y, 0]));
