// K-map egg carton still sample: a square board (always on screen) with a 2x4 moulded-pulp egg carton on it.
// Columns run along +x (BC in Gray order), rows along +y (A = 0 at the back, 1 in front). The lid is hinged at the
// tray's back top edge and folded open backwards, its far edge resting on the board, inside facing up.
import { boxCorners, cylinder, fitView, flatCircle, flatRect, inset, pathD, prism, prismFill, project, rectCorners, solidSvg, type Rect, type Vec2, type Vec3 } from "../../iso/iso-kit";
import { COLS, GROUP, hasEgg, ROWS } from "./model";

export const STAGE_W = 600;
const AZIMUTH = 62;
const PAD = 12;
const A = (AZIMUTH * Math.PI) / 180;
const E = (30 * Math.PI) / 180;

// Board.
const BOARD: Rect = { x: -63, y: -63, w: 126, d: 126, r: 7 };
const SLAB_H = 8;
const FOOT_H = 4;

// Carton tray: 4 columns x 2 rows of cups (about 3/4 of the board width with the lid), room on the left for the row labels.
const CELL = 21;
const X0 = -42;
const X1 = X0 + CELL * COLS.length;
const Y0 = 1; // carton + lid footprint centred on the board (the lid reaches back to about y = -42)
const Y1 = Y0 + CELL * ROWS.length;
const TRAY_H = 9; // top of the flat rim (cup depth about 45 % of the egg)
const RIM_T = 1.8; // rim slab thickness
const LIP = 1.1; // rim overhang past the cup bulges
const CUP_R = 8.7; // cup opening
const BULGE_R = CELL / 2 - 0.2; // outer cup walls at the top (the scallops)
const BULGE_FOOT = 0.68; // bulge radius at the bottom, as a share of the top
const TRAY: Rect = { x: X0 - LIP, y: Y0 - LIP, w: X1 - X0 + LIP * 2, d: Y1 - Y0 + LIP * 2, r: 7 };

// Eggs: plump ovals (width : height = 0.78), top slightly narrower, a quarter of the egg inside the cup.
const EGG_H = 20;
const EGG_R = (EGG_H * 0.78) / 2;
const EGG_Z = TRAY_H - EGG_H * 0.25;

// Tall tapered cone posts on the row seam between the cups.
const POST_R = 4.6;
const POST_H = EGG_Z + EGG_H / 2 - TRAY_H; // up to the eggs' mid-height

// Lid: a shallow moulded tray, folded open backwards from the hinge, far edge resting on the board.
const LID_L = CELL * ROWS.length + 2;
const LID_D = 5; // rim height above the inside panel
const LID_RIM = 2.6;
const PHI = Math.asin((TRAY_H - 1) / LID_L);
const pc = Math.cos(PHI);
const ps = Math.sin(PHI);
// Lid point: u away from the hinge along the panel (0..LID_L), x across, w up from the panel along its normal.
const lp = (u: number, x: number, w: number): Vec3 => [x, Y0 - u * pc - w * ps, TRAY_H - u * ps + w * pc];

// Stage: fit the board, lid, posts and eggs to the width, then size the height to match.
const PTS: Vec3[] = [
  ...boxCorners(BOARD, -SLAB_H - FOOT_H, 0),
  lp(LID_L, X0, LID_D),
  lp(LID_L, X1, LID_D),
  [X1, Y0, EGG_Z + EGG_H + 2],
  [X0, Y0, EGG_Z + EGG_H + 2],
];
const tall = fitView(PTS, STAGE_W, 4000, { pad: PAD, azimuth: AZIMUTH });
const ys = PTS.map((p) => project(p, tall)[1]);
export const STAGE_H = Math.ceil(Math.max(...ys) - Math.min(...ys) + PAD * 2);
export const view = fitView(PTS, STAGE_W, STAGE_H, { pad: PAD, azimuth: AZIMUTH });

const at = (p: Vec3) => project(p, view);
const r3 = (v: number) => Math.round(v * 1e3) / 1e3;
const depth = ([x, y]: Vec2) => (x * Math.cos(A) + y * Math.sin(A)) * Math.cos(E);

// Convex hull of screen points (monotone chain), for the egg and post silhouettes.
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

// Rounded rectangle outline in plan (x0..x1, y0..y1, corner radius r), counter-clockwise from the back-right corner.
function roundRect(x0: number, y0: number, x1: number, y1: number, r: number, seg = 8): Vec2[] {
  const corners: [number, number, number][] = [
    [x1 - r, y0 + r, -Math.PI / 2],
    [x1 - r, y1 - r, 0],
    [x0 + r, y1 - r, Math.PI / 2],
    [x0 + r, y0 + r, Math.PI],
  ];
  return corners.flatMap(([cx, cy, a0]) =>
    Array.from({ length: seg + 1 }, (_, i) => {
      const a = a0 + (i / seg) * (Math.PI / 2);
      return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as Vec2;
    }),
  );
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

// Axis labels engraved flat on the board, left of and in front of the carton: "A" above the row values 0 / 1,
// "BC" at the front-left corner, the Gray-order column values in front of each column.
export const LABEL_SIZE = 9.5;
const rowY = (r: number) => Y0 + CELL * (r + 0.5);
const colX = (c: number) => X0 + CELL * (c + 0.5);
const LX = X0 - 10.5;
const FRONT = Y1 + 4 + LABEL_SIZE * 0.72;
export const labels = {
  a: topMatrix([LX, Y0 - 9 + LABEL_SIZE * 0.36, 0.05]),
  rows: ROWS.map((t, r) => ({ t, m: topMatrix([LX, rowY(r) + LABEL_SIZE * 0.36, 0.05]) })),
  bc: topMatrix([LX, FRONT, 0.05]),
  cols: COLS.map((t, c) => ({ t, m: topMatrix([colX(c), FRONT, 0.05]) })),
};

// Carton parts.
const circ = (cx: number, cy: number, r: number, z: number, seg = 36): Vec2[] =>
  Array.from({ length: seg }, (_, i) => {
    const a = (i / seg) * Math.PI * 2;
    return at([cx + Math.cos(a) * r, cy + Math.sin(a) * r, z]);
  });

// One egg: hull of the whole shell (the cup's front lip is drawn over its bottom), top slightly narrower.
const eggPath = (cx: number, cy: number) => {
  const pts: Vec2[] = [];
  const hh = EGG_H / 2;
  for (let i = 0; i <= 32; i++) {
    const th = (i / 32) * Math.PI; // 0 = bottom, PI = top
    const z = EGG_Z + hh - Math.cos(th) * hh;
    const rr = EGG_R * Math.sin(th) * (1 + 0.05 * Math.cos(th));
    for (let j = 0; j < 40; j++) {
      const a = (j / 40) * Math.PI * 2;
      pts.push(at([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, z]));
    }
  }
  return pathD(hull(pts), true);
};

// Front arc of a cup opening (left extreme, through the nearest point, to the right extreme), in screen points.
const frontArc = (cx: number, cy: number, r: number, z: number): Vec2[] => {
  const pts = circ(cx, cy, r, z, 72);
  const n = pts.length;
  let li = 0;
  let ri = 0;
  pts.forEach((p, i) => {
    if (p[0] < pts[li][0]) li = i;
    if (p[0] > pts[ri][0]) ri = i;
  });
  const walk = (from: number, to: number, step: number) => {
    const out: Vec2[] = [];
    for (let i = from; ; i = (i + step + n) % n) {
      out.push(pts[i]);
      if (i === to) break;
    }
    return out;
  };
  const one = walk(li, ri, 1);
  const two = walk(li, ri, -1);
  const lowest = (arc: Vec2[]) => Math.max(...arc.map((p) => p[1]));
  return lowest(one) > lowest(two) ? one : two;
};
// Clip for an egg: everything above the cup's front arc (so the front lip hides the egg's bottom).
const eggClip = (cx: number, cy: number) => {
  const arc = frontArc(cx, cy, CUP_R, TRAY_H);
  const l = arc[0];
  const r = arc[arc.length - 1];
  return pathD([[l[0] - 0.2, l[1]], ...arc, [r[0] + 0.2, r[1]], [r[0] + 0.2, -1000], [l[0] - 0.2, -1000]], true);
};

// Cone post: short, wide at the base, round tip (hull of rings with a domed profile).
const POST_RINGS = [
  [0, 1],
  [0.35, 0.72],
  [0.65, 0.52],
  [0.85, 0.36],
  [1, 0.14],
];
const postPath = (x: number, y: number) => pathD(hull(POST_RINGS.flatMap(([f, k]) => circ(x, y, POST_R * k, TRAY_H + POST_H * f, 24))), true);
const postTip = (x: number, y: number) => {
  const [tx, ty] = at([x, y, TRAY_H + POST_H * 0.86]);
  return { cx: tx, cy: ty };
};

// Cup bulge: a rounded bump under the rim, narrower at the bottom (hull of rings with a bowl profile).
const bulgePath = (x: number, y: number) =>
  pathD(
    hull(
      Array.from({ length: 9 }, (_, i) => {
        const f = i / 8; // 0 = bottom, 1 = under the rim
        const r = BULGE_R * (BULGE_FOOT + (1 - BULGE_FOOT) * Math.sin((f * Math.PI) / 2));
        return circ(x, y, r, (TRAY_H - RIM_T) * f, 40);
      }).flat(),
    ),
    true,
  );

type Cell = { id: string; row: number; col: number; ring: string; well: string; wall: string; lip: string; egg: string | null; clip: string };
const cells: Cell[] = ROWS.flatMap((_, row) =>
  COLS.map((_, col) => ({
    id: `ke-cup-${row}-${col}`,
    row,
    col,
    lip: pathD(frontArc(colX(col), rowY(row), CUP_R, TRAY_H)),
    clip: eggClip(colX(col), rowY(row)),
    ring: pathD(circ(colX(col), rowY(row), CUP_R + 1.3, TRAY_H), true),
    well: pathD(circ(colX(col), rowY(row), CUP_R, TRAY_H), true),
    wall: pathD(circ(colX(col), rowY(row) - 1.8, CUP_R - 2.2, TRAY_H - 2.6), true),
    egg: hasEgg(row, col) ? eggPath(colX(col), rowY(row)) : null,
  })),
);

// Cup bulges, drawn back to front so the scallops show on the front and side.
const bulges: string[] = ROWS.flatMap((_, r) => COLS.map((_, c) => [colX(c), rowY(r)] as Vec2))
  .sort((p, q) => depth(p) - depth(q))
  .map(([x, y]) => bulgePath(x, y));

// Lid outlines at a given rim height w, inset from the lid's outer edge.
const lidRing = (by: number, w: number) => roundRect(X0 + by, by, X1 - by, LID_L - by, Math.max(1, 6 - by)).map(([x, u]) => at(lp(u, x, w)));
const lidFar = LID_L - 5;
const hole = (xc: number) =>
  pathD(
    roundRect(xc - 3, lidFar - 7, xc + 3, lidFar - 1, 1.6).map(([x, u]) => at(lp(u, x, 0.05))),
    true,
  );
export const BRAND_SIZE = 9;
const brandU = LID_L * 0.66;
const brandMatrix = (() => {
  const xc = X0 + 17; // over the empty columns, clear of the eggs
  const base = brandU - BRAND_SIZE * 0.36;
  const o = at(lp(base, xc, 0.08));
  const ax = at(lp(base, xc + 1, 0.08));
  const dn = at(lp(base - 1, xc, 0.08));
  return `matrix(${r3(ax[0] - o[0])} ${r3(ax[1] - o[1])} ${r3(dn[0] - o[0])} ${r3(dn[1] - o[1])} ${r3(o[0])} ${r3(o[1])})`;
})();

export const lid = {
  outer: pathD(hull([...lidRing(0, -1), ...lidRing(0, LID_D)]), true),
  rimTop: pathD(lidRing(0, LID_D), true),
  wall: pathD(lidRing(LID_RIM, LID_D), true),
  panel: pathD(lidRing(LID_RIM + 2, 0), true),
  holes: hole(X0 + (X1 - X0) * 0.6) + hole(X0 + (X1 - X0) * 0.86),
  brand: brandMatrix,
};

export const carton = {
  halo: pathD(hull([...rectCorners(TRAY).map(([x, y]) => at([x, y, 0])), at(lp(LID_L, X0, -1)), at(lp(LID_L, X1, -1))]), true),
  bulges,
  rim: prism(TRAY, TRAY_H - RIM_T, RIM_T, view, 8, 0.4),
  back: cells.filter((c) => c.row === 0),
  front: cells.filter((c) => c.row === 1),
  posts: COLS.slice(1).map((_, i) => ({ d: postPath(X0 + CELL * (i + 1), Y0 + CELL), tip: postTip(X0 + CELL * (i + 1), Y0 + CELL) })),
};

// Rust group band: a rounded rectangle at the eggs' waist around the grouped cells. The whole loop is drawn before
// the back eggs, the front part again after the front eggs, so it passes behind the back eggs and in front of the front ones.
const BAND_Z = EGG_Z + EGG_H * 0.45; // the eggs' waist
const bandPoly = roundRect(
  X0 + CELL * GROUP.c0 + 1.2,
  Y0 + CELL * GROUP.r0 + 1.2,
  X0 + CELL * (GROUP.c1 + 1) - 1.2,
  Y0 + CELL * (GROUP.r1 + 1) - 1.2,
  9.5,
  12,
);
export const bandAll = pathD(bandPoly.map(([x, y]) => at([x, y, BAND_Z])), true);
// Front part: densify the outline (so the cut lands mid-edge), then keep the points in front of the front row's centre.
const dense: Vec2[] = bandPoly.flatMap((a, i) => {
  const b = bandPoly[(i + 1) % bandPoly.length];
  const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 1.5));
  return Array.from({ length: n }, (_, k) => [a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n] as Vec2);
});
const frontCut = Y0 + CELL * (GROUP.r1 + 0.5);
export const bandFront = pathD(dense.filter(([, y]) => y >= frontCut).map(([x, y]) => at([x, y, BAND_Z])));

// Entrance spark points: the carton corners.
export const contacts = rectCorners(TRAY, 2).map(([x, y]) => at([x, y, 0]));
