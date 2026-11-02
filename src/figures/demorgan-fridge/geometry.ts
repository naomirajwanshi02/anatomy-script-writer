// De Morgan fridge: a square board (always on screen) with a French-door fridge; at the fold the fridge lifts away,
// the board stretches long and two parallel gate rows rise in: levers L and R (shared) -> OR with input bubbles ->
// lamp (back row, rule one) and -> AND with an output bubble (NAND) -> lamp (front row, rule two). Each gate's shape
// and bubbles are separate parts so the rows can build step by step; the OR row can turn into a NAND; a grid of
// small NAND tiles fills the board for the zoom-out.
import {
  boxCorners,
  cylinder,
  faceMatrix,
  fitView,
  flatCircle,
  flatPath,
  flatRect,
  heightPx,
  inset,
  pathD,
  prism,
  prismFill,
  project,
  rectCorners,
  solidSvg,
  translateTo,
  type Rect,
  type Vec2,
  type Vec3,
  type View,
} from "../../iso/iso-kit";
import { bulbParts } from "../../iso/react/bulb";

export const STAGE_W = 600;
const AZIMUTH = 62;
const PAD = 12;
const A = (AZIMUTH * Math.PI) / 180;
const E = (30 * Math.PI) / 180;
const VIEW_DIR: Vec2 = [Math.cos(A), Math.sin(A)]; // board-plane direction toward the camera

// Boards: square for the fridge, long for the circuit.
const SQUARE: Rect = { x: -63, y: -63, w: 126, d: 126, r: 7 };
const LONG: Rect = { x: -80, y: -36, w: 160, d: 72, r: 7 };
const SLAB_H = 8;
const FOOT_H = 4;

// Fridge body: tall box on short feet, set toward the back so the open doors have room on the board.
const FEET_H = 2;
const FX0 = -32;
const FX1 = 32;
const FB = -62;
const FY = -4; // body front plane (height 112 = 1.75 x width 64, depth 58 = 0.9 x width)
const BODY: Rect = { x: FX0, y: FB, w: FX1 - FX0, d: FY - FB, r: 5 };
const BODY_TOP = 112;
const T = 5; // door / drawer thickness, in front of the body
const DW = 31; // each French door's width (2-unit gap between the doors)
const DZ0 = 40;
const DZ1 = 111;
const DRAWER_Z0 = 8;
const DRAWER_Z1 = 38;
export const SWING = 80; // degrees, fully open

// Cavity behind the doors.
const WALL = 3;
const CX0 = FX0 + WALL;
const CX1 = FX1 - WALL;
const CY0 = FB + WALL;
const CZ0 = 42;
const CZ1 = BODY_TOP - WALL;
const SHELF_Z = [64, 86];
const SHELF_H = 1.2;

// Circuit rows.
const ROW_Y = { nand: 18, or: -18 };
const GATE_X0 = -16;
const GATE_W = 36;
const GATE_D = 22;
const GATE_Z = 3;
const GATE_H = 11;
const GATE_TOP = GATE_Z + GATE_H;
const ARM_Z = 6;
const LEAD = 7;
const LAMP_X = 60;
const LEVER = { l: [-66, 0] as Vec2, r: [-42, 0] as Vec2 };
const TRUNK = { l: -54, r: -29 };
// Input pins: L takes the outer pin of each row and R the inner one (back OR row: L at row - 4; front NAND row: L at
// row + 4), so no wires cross.
const PIN_Y = { orL: ROW_Y.or - 4, orR: ROW_Y.or + 4, nandR: ROW_Y.nand - 4, nandL: ROW_Y.nand + 4 };

// Stage: fit the square board with the fridge and the long board with its lamps, then size the height to match.
const PTS: Vec3[] = [
  ...boxCorners(SQUARE, -SLAB_H - FOOT_H, 0),
  ...boxCorners(LONG, -SLAB_H - FOOT_H, 0),
  ...boxCorners(BODY, 0, BODY_TOP + 2),
  [FX0 + 8, FY + T + DW, DZ0],
  [FX1 - 8, FY + T + DW, DZ0],
];
const tall = fitView(PTS, STAGE_W, 4000, { pad: PAD, azimuth: AZIMUTH });
const ys = PTS.map((p) => project(p, tall)[1]);
export const STAGE_H = Math.ceil(Math.max(...ys) - Math.min(...ys) + PAD * 2);
export const view = fitView(PTS, STAGE_W, STAGE_H, { pad: PAD, azimuth: AZIMUTH });

const at = (p: Vec3) => project(p, view);
const r3 = (v: number) => Math.round(v * 1e3) / 1e3;
const poly = (pts: Vec3[]) => pathD(pts.map(at), true);
const line = (a: Vec3, b: Vec3) => pathD([at(a), at(b)]);
const trace = (pts: Vec2[], z = 0) => flatPath(pts, z, view);

// Text on a plane through p, reading along `along` (board units), upright along +z.
const planeMatrix = (p: Vec3, along: Vec2) => {
  const o = at(p);
  const ax = at([p[0] + along[0], p[1] + along[1], p[2]]);
  const az = at([p[0], p[1], p[2] - 1]);
  return `matrix(${r3(ax[0] - o[0])} ${r3(ax[1] - o[1])} ${r3(az[0] - o[0])} ${r3(az[1] - o[1])} ${r3(o[0])} ${r3(o[1])})`;
};
const frontMatrix = (p: Vec3) => planeMatrix(p, [1, 0]);
const frontRect = (x0: number, z0: number, x1: number, z1: number, y: number) =>
  poly([
    [x0, y, z0],
    [x1, y, z0],
    [x1, y, z1],
    [x0, y, z1],
  ]);

const depth = ([x, y, z]: Vec3) => (x * Math.cos(A) + y * Math.sin(A)) * Math.cos(E) + z * Math.sin(E);
const backToFront = (pts: Vec2[]) => [...pts].sort((p, q) => depth([p[0], p[1], 0]) - depth([q[0], q[1], 0]));

// Board at stretch k (0 square .. 1 long), rebuilt into its slot while it stretches.
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
export const boardRect = (k: number): Rect => ({
  x: mix(SQUARE.x, LONG.x, k),
  y: mix(SQUARE.y, LONG.y, k),
  w: mix(SQUARE.w, LONG.w, k),
  d: mix(SQUARE.d, LONG.d, k),
  r: 7,
});
export const boardSvg = (k: number) => {
  const b = boardRect(k);
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
};

// Engraving on the board's front face (+y), centred, upright; follows the board as it stretches.
export const ENGRAVE = "ROLLIN-रोलिन-ROLLIN-रोलिन";
export const ENGRAVE_SIZE = 3.6;
export const engraveAt = (k: number) => {
  const b = boardRect(k);
  return frontMatrix([b.x + b.w / 2, b.y + b.d, -SLAB_H / 2 - ENGRAVE_SIZE * 0.36]);
};

// ---------- Fridge ----------

// Board top of the square board (clip for the shade vignette and the light fans).
export const boardTop = flatRect(SQUARE, 0, view);
const shadeC = at([0, (FB + FY) / 2, 0]);
const far = at([FX1 + 50, FY + 50, 0]);
export const shade = { cx: shadeC[0], cy: shadeC[1], r: Math.hypot(far[0] - shadeC[0], far[1] - shadeC[1]) };
// White light fanning out of each half of the opening across the board.
const front = SQUARE.y + SQUARE.d;
export const fans = {
  left: poly([
    [CX0, FY, 0.05],
    [0, FY, 0.05],
    [24, front, 0.05],
    [-60, front, 0.05],
    [-48, FY + 30, 0.05],
  ]),
  right: poly([
    [0, FY, 0.05],
    [CX1, FY, 0.05],
    [48, FY + 30, 0.05],
    [60, front, 0.05],
    [-24, front, 0.05],
  ]),
};
const fanAt = (cx: number) => {
  const c = at([cx, FY, 0]);
  const e = at([cx - 2, front + 6, 0]);
  return { cx: c[0], cy: c[1], r: Math.hypot(e[0] - c[0], e[1] - c[1]) };
};
export const fanGlow = { left: fanAt(CX0 / 2), right: fanAt(CX1 / 2) };

// LED strips: a bar on the front lip of the ceiling and a vertical strip on each side wall near the front.
const LED = 2.2;
const CEIL = LED * 2;
export const leds = {
  ceiling: frontRect(CX0, CZ1 - CEIL, CX1, CZ1, FY - 0.3),
  left: poly([
    [CX0 + 0.05, FY - 4, CZ0 + 4],
    [CX0 + 0.05, FY - 4 + LED, CZ0 + 4],
    [CX0 + 0.05, FY - 4 + LED, CZ1 - 4],
    [CX0 + 0.05, FY - 4, CZ1 - 4],
  ]),
  right: poly([
    [CX1 - 0.05, FY - 4, CZ0 + 4],
    [CX1 - 0.05, FY - 4 + LED, CZ0 + 4],
    [CX1 - 0.05, FY - 4 + LED, CZ1 - 4],
    [CX1 - 0.05, FY - 4, CZ1 - 4],
  ]),
};
export const shelfEdges = SHELF_Z.map((z) => line([CX0, FY - 1, z + SHELF_H], [CX1, FY - 1, z + SHELF_H])).join("");
const glowC = at([0, FY - 4, CZ1 - 10]);
export const innerGlow = { cx: glowC[0], cy: glowC[1], r: heightPx(60, view) };

const RD = FY + T + 0.05; // drawer front plane
export const BRAND_SIZE = 3.6;

export const fridge = {
  halo: prismFill({ x: FX0 - 2, y: FB - 2, w: FX1 - FX0 + 4, d: FY - FB + T + 4, r: 4 }, 0, 0.1, view),
  feet: backToFront(rectCorners(BODY, 4)).map(([x, y]) => cylinder(x, y, 2.4, 0, FEET_H, view, 16, 0.4)),
  body: prism(BODY, FEET_H, BODY_TOP - FEET_H, view, 8, 1.6),
  // Dark gasket band behind the doors and drawer: shows in the gaps between them.
  gasketBand: frontRect(FX0 + 1.5, DRAWER_Z0 - 0.8, FX1 - 1.5, DZ1 + 0.4, FY + 0.04),
  // Toe-kick vent grille under the drawer.
  toeKick: frontRect(FX0 + 5, FEET_H + 1.2, FX1 - 5, DRAWER_Z0 - 1.6, FY + 0.06),
  toeSlots: Array.from({ length: 11 }, (_, i) => line([FX0 + 8 + i * 4.8, FY + 0.08, FEET_H + 2], [FX0 + 8 + i * 4.8, FY + 0.08, DRAWER_Z0 - 2.4])).join(""),
  // Cavity: opening on the body front, then back wall, left wall and floor (the only inner faces the camera sees).
  opening: frontRect(CX0, CZ0, CX1, CZ1, FY + 0.05),
  back: frontRect(CX0, CZ0, CX1, CZ1, CY0),
  left: poly([
    [CX0, CY0, CZ0],
    [CX0, FY, CZ0],
    [CX0, FY, CZ1],
    [CX0, CY0, CZ1],
  ]),
  floor: poly([
    [CX0, CY0, CZ0],
    [CX1, CY0, CZ0],
    [CX1, FY, CZ0],
    [CX0, FY, CZ0],
  ]),
  shelves: SHELF_Z.map((z) => prism({ x: CX0, y: CY0, w: CX1 - CX0, d: FY - 1 - CY0, r: 0 }, z, SHELF_H, view, 2, 0)),
  // A carton on the floor, a bottle on the lower shelf (left), a jar on the upper shelf (right).
  carton: prism({ x: CX0 + 16, y: FY - 18, w: 10, d: 10, r: 0.6 }, CZ0, 14, view, 2, 0.4),
  bottle: cylinder(CX0 + 7, FY - 12, 3.2, SHELF_Z[0] + SHELF_H, 16, view, 20, 0.4),
  bottleNeck: cylinder(CX0 + 7, FY - 12, 1.3, SHELF_Z[0] + SHELF_H + 16, 4, view, 14, 0.2),
  jar: cylinder(CX1 - 12, FY - 14, 4.5, SHELF_Z[1] + SHELF_H, 9, view, 22, 0.4),
  drawer: prism({ x: FX0, y: FY, w: FX1 - FX0, d: T, r: 2.4 }, DRAWER_Z0, DRAWER_Z1 - DRAWER_Z0, view, 6, 0.6),
  drawerHandle: line([-20, RD + 3.4, 33], [20, RD + 3.4, 33]),
  drawerStand: line([-17, RD, 33], [-17, RD + 3.4, 33]) + line([17, RD, 33], [17, RD + 3.4, 33]),
};

// Doors: a slab swinging about its outer hinge corner. u runs from the hinge to the free edge, v across the
// thickness (-T inner .. 0 outer). Rebuilt as markup while it swings; faces are drawn only when they face the camera.
const dot = (a: Vec2, b: Vec2) => a[0] * b[0] + a[1] * b[1];
export function doorSvg(side: "left" | "right", open: number) {
  const th = ((open * SWING) * Math.PI) / 180;
  const c = Math.cos(th);
  const s = Math.sin(th);
  const H: Vec2 = side === "left" ? [FX0, FY + T] : [FX1, FY + T];
  const ud: Vec2 = side === "left" ? [c, s] : [-c, s];
  const n: Vec2 = side === "left" ? [-s, c] : [s, c];
  const P = (u: number, v: number, z: number): Vec3 => [H[0] + u * ud[0] + v * n[0], H[1] + u * ud[1] + v * n[1], z];
  const quad = (a: Vec3, b: Vec3, cc: Vec3, d: Vec3) => poly([a, b, cc, d]);
  const vis = (nn: Vec2) => dot(nn, VIEW_DIR) > 0;
  const outerVis = vis(n);
  const innerVis = vis([-n[0], -n[1]]);
  const out: string[] = [];
  // Handle near the free edge on the outer face: bar on two standoffs.
  const hu = DW - 4.5;
  const handle = line(P(hu, 3.4, 52), P(hu, 3.4, 98));
  const stand = line(P(hu, 0, 56), P(hu, 3.4, 56)) + line(P(hu, 0, 94), P(hu, 3.4, 94));
  const handleSvg = `<path class="df-handle" d="${stand + handle}"/><path class="df-handle-hi" d="${handle}"/>`;
  const badge = () => {
    // Maker's badge on the right door (reads along the closed door's +x).
    const o = 0.05;
    out.push(`<path class="df-plate" d="${quad(P(4, o, 101), P(22, o, 101), P(22, o, 107), P(4, o, 107))}"/>`);
    const m = planeMatrix(P(13, 0.1, 104 - BRAND_SIZE * 0.36), [-ud[0], -ud[1]]);
    out.push(`<g class="df-brand"><text class="iso-face-text" data-tone="hi" transform="${m}" font-size="${BRAND_SIZE}" text-anchor="middle">ROLLIN</text></g>`);
  };
  // Shut: a solid slab with soft rounded vertical corners.
  if (open <= 0) {
    const rect: Rect = { x: side === "left" ? FX0 : FX1 - DW, y: FY, w: DW, d: T, r: 2.4 };
    out.push(solidSvg(prism(rect, DZ0, DZ1 - DZ0, view, 6, 0.6), { tone: "mid", crease: "lo", className: "df-door-solid" }));
    out.push(handleSvg);
    if (side === "right") badge();
    return out.join("");
  }
  if (!outerVis) out.push(handleSvg);
  if (outerVis) out.push(`<path class="df-door-out" d="${quad(P(0, 0, DZ0), P(DW, 0, DZ0), P(DW, 0, DZ1), P(0, 0, DZ1))}"/>`);
  if (innerVis) {
    const inner = quad(P(0, -T, DZ0), P(DW, -T, DZ0), P(DW, -T, DZ1), P(0, -T, DZ1));
    out.push(`<path class="df-door-inner" d="${inner}"/>`);
    out.push(`<path class="df-wash" d="${inner}" fill="url(#df-wash-r)"/>`);
    const g = -T - 0.05;
    out.push(`<path class="df-gasket" d="${quad(P(2.5, g, DZ0 + 2.5), P(DW - 2.5, g, DZ0 + 2.5), P(DW - 2.5, g, DZ1 - 2.5), P(2.5, g, DZ1 - 2.5))}"/>`);
    // Two door bins on the inner face: open top (dark), end cap, front lip.
    for (const z of [56, 82]) {
      const u0 = 4;
      const u1 = DW - 4;
      const o = -T - 4;
      out.push(`<path class="df-bin-hollow" d="${quad(P(u0, -T, z + 6), P(u1, -T, z + 6), P(u1, o, z + 6), P(u0, o, z + 6))}"/>`);
      out.push(`<path class="df-bin-cap" d="${quad(P(u1, -T, z), P(u1, o, z), P(u1, o, z + 6), P(u1, -T, z + 6))}"/>`);
      out.push(`<path class="df-bin-lip" d="${quad(P(u0, o, z), P(u1, o, z), P(u1, o, z + 6), P(u0, o, z + 6))}"/>`);
    }
  }
  if (vis(ud)) out.push(`<path class="df-door-edge" d="${quad(P(DW, -T, DZ0), P(DW, 0, DZ0), P(DW, 0, DZ1), P(DW, -T, DZ1))}"/>`);
  if (vis([-ud[0], -ud[1]])) out.push(`<path class="df-door-edge" d="${quad(P(0, -T, DZ0), P(0, 0, DZ0), P(0, 0, DZ1), P(0, -T, DZ1))}"/>`);
  out.push(`<path class="df-door-top" d="${quad(P(0, -T, DZ1), P(DW, -T, DZ1), P(DW, 0, DZ1), P(0, 0, DZ1))}"/>`);
  if (outerVis) {
    out.push(handleSvg);
    if (side === "right") badge();
  }
  return out.join("");
}

// Fridge lift at the fold: up and away (stage px).
export const fridgeLift = (k: number) => `translate(0 ${(-k * 70).toFixed(2)})`;

// ---------- Circuit ----------

// Circuit rise at the fold: from below into place (stage px).
export const circuitRise = (k: number) => `translate(0 ${((1 - k) * 40).toFixed(2)})`;

type Row = "nand" | "or";
const gateRect = (row: Row): Rect => ({ x: GATE_X0, y: ROW_Y[row] - GATE_D / 2, w: GATE_W, d: GATE_D, r: 2 });
const GX = GATE_X0 + GATE_W / 2; // symbol centre x
const SC = 1.25; // symbol scale

// Gate pin: an arm out of the block and a drop down to the board pad.
const pinPart = (x: number, y: number, out: boolean) => {
  const pad = out ? x + LEAD : x - LEAD;
  const arm: Rect = { x: out ? x : x - LEAD + 1, y: y - 1.4, w: LEAD - 1, d: 2.8, r: 0.3 };
  const drop: Rect = { x: pad - 1.2, y: y - 1.4, w: 2.4, d: 2.8, r: 0.3 };
  return { arm: prism(arm, ARM_Z, 1, view, 2), drop: prism(drop, 0, ARM_Z + 1, view, 2) };
};

const symPts = (row: Row, pts: Vec2[]) => pts.map(([x, y]) => [GX + x * SC, ROW_Y[row] + y * SC] as Vec2);
const leadsFor = (row: Row, inX: number, outX: number) => {
  const y0 = ROW_Y[row];
  return (
    trace([[GATE_X0, y0 - 4], [inX, y0 - 4]], GATE_TOP) +
    trace([[GATE_X0, y0 + 4], [inX, y0 + 4]], GATE_TOP) +
    trace([[outX, y0], [GATE_X0 + GATE_W - 0.8, y0]], GATE_TOP)
  );
};

// NAND: flat back, half-round front, output bubble.
const nandSymbol = (row: Row = "nand") => {
  const pts: Vec2[] = [
    [-9, -7],
    [-9, 7],
  ];
  for (let i = 0; i <= 20; i++) {
    const a = Math.PI / 2 - (i / 20) * Math.PI;
    pts.push([1 + Math.cos(a) * 7, Math.sin(a) * 7]);
  }
  return {
    body: flatPath(symPts(row, pts), GATE_TOP, view, true),
    bubbles: flatCircle(GX + 10.4 * SC, ROW_Y[row], 2.4 * SC, GATE_TOP, view, 20),
    leads: leadsFor(row, GX - 9 * SC, GX + 12.8 * SC),
  };
};
// OR: curved back, pointed front, a bubble on each input.
const orSymbol = () => {
  const pts: Vec2[] = [];
  for (let i = 0; i <= 16; i++) {
    const u = i / 16;
    pts.push([-9 + 20 * u, -7 * Math.sqrt(1 - u * u)]);
  }
  for (let i = 16; i >= 0; i--) {
    const u = i / 16;
    pts.push([-9 + 20 * u, 7 * Math.sqrt(1 - u * u)]);
  }
  for (let i = 1; i < 12; i++) {
    const y = 7 - (14 * i) / 12;
    pts.push([-9 + 3 * (1 - (y / 7) ** 2), y]);
  }
  const back = (y: number) => -9 + 3 * (1 - (y / 7) ** 2);
  const yl = 4 / SC; // input pins sit at row -4 / +4 in board units
  const bx = back(yl) - 2.2; // bubble centre, just behind the curved back
  return {
    body: flatPath(symPts("or", pts), GATE_TOP, view, true),
    bubbles: [-4, 4].map((y) => flatCircle(GX + bx * SC, ROW_Y.or + y, 2 * SC, GATE_TOP, view, 18)).join(""),
    leads:
      trace([[GATE_X0, ROW_Y.or - 4], [GX + (bx - 2) * SC, ROW_Y.or - 4]], GATE_TOP) +
      trace([[GATE_X0, ROW_Y.or + 4], [GX + (bx - 2) * SC, ROW_Y.or + 4]], GATE_TOP) +
      trace([[GX + 11 * SC, ROW_Y.or], [GATE_X0 + GATE_W - 0.8, ROW_Y.or]], GATE_TOP),
  };
};

const gatePart = (row: Row) => {
  const g = gateRect(row);
  return {
    halo: prismFill(inset(g, 2), 0.1, 0.1, view),
    body: prism(g, GATE_Z, GATE_TOP - GATE_Z, view, 4, 0.8),
    symbol: row === "nand" ? nandSymbol() : orSymbol(),
    // The OR row's NAND form, crossfaded in when row 1 turns into a NAND.
    asNand: nandSymbol(row),
    pins: [
      pinPart(GATE_X0, row === "nand" ? PIN_Y.nandL : PIN_Y.orR, false),
      pinPart(GATE_X0, row === "nand" ? PIN_Y.nandR : PIN_Y.orL, false),
      pinPart(GATE_X0 + GATE_W, ROW_Y[row], true),
    ],
  };
};
export const gates = { nand: gatePart("nand"), or: gatePart("or") };

// Wires (input to output): L and R each split to both rows; outputs run to the lamps.
const PAD_IN = GATE_X0 - LEAD;
const PAD_OUT = GATE_X0 + GATE_W + LEAD;
export const wires = {
  l:
    trace([[LEVER.l[0] + 7, 0], [TRUNK.l, 0]]) +
    trace([[TRUNK.l, 0], [TRUNK.l, PIN_Y.nandL], [PAD_IN, PIN_Y.nandL]]) +
    trace([[TRUNK.l, 0], [TRUNK.l, PIN_Y.orL], [PAD_IN, PIN_Y.orL]]),
  r:
    trace([[LEVER.r[0] + 7, 0], [TRUNK.r, 0]]) +
    trace([[TRUNK.r, 0], [TRUNK.r, PIN_Y.nandR], [PAD_IN, PIN_Y.nandR]]) +
    trace([[TRUNK.r, 0], [TRUNK.r, PIN_Y.orR], [PAD_IN, PIN_Y.orR]]),
  nand: trace([[PAD_OUT, ROW_Y.nand], [LAMP_X - 6, ROW_Y.nand]]),
  or: trace([[PAD_OUT, ROW_Y.or], [LAMP_X - 6, ROW_Y.or]]),
};
const PADS: Vec2[] = [
  [PAD_IN, PIN_Y.nandL],
  [PAD_IN, PIN_Y.nandR],
  [PAD_IN, PIN_Y.orR],
  [PAD_IN, PIN_Y.orL],
  [PAD_OUT, ROW_Y.nand],
  [PAD_OUT, ROW_Y.or],
];
export const padRings = PADS.map(([x, y]) => flatCircle(x, y, 2.4, 0, view, 16)).join("");
export const padDots = PADS.map(([x, y]) => at([x, y, 0]));
export const joints = [at([TRUNK.l, 0, 0]), at([TRUNK.r, 0, 0])];

// Levers: knob up (nearly upright) = 1 (shut), knob tilted forward and down = 0 (open).
const lever = ([x, y]: Vec2) => ({
  base: prism({ x: x - 7, y: y - 6, w: 14, d: 12, r: 1.2 }, 0, 4, view, 3, 0.4),
  slot: flatRect({ x: x - 1.2, y: y - 5, w: 2.4, d: 10, r: 1 }, 4, view, 3),
  pivot: cylinder(x, y, 2, 4, 2, view, 18, 0.3),
});
export const levers = { l: lever(LEVER.l), r: lever(LEVER.r) };
export const leverAt = LEVER;
// v = 1 up, 0 down.
const leverAngle = (v: number) => -0.15 + (1 - v) * 1.25;
export const knobAt = ([x, y]: Vec2, v: number): Vec3 => [x, y + Math.sin(leverAngle(v)) * 12, 6 + Math.cos(leverAngle(v)) * 12];
export const rodPath = (p: Vec2, v: number) => pathD([at([p[0], p[1], 6]), at(knobAt(p, v))]);
export const knob = cylinder(0, 0, 2.4, -1.2, 2.8, view, 20, 0.6);
export const knobTransform = (p: Vec3) => translateTo(view, p);

// Lamps.
export const lamps = { nand: bulbParts([LAMP_X, ROW_Y.nand], view), or: bulbParts([LAMP_X, ROW_Y.or], view) };

// Engraved labels (flat on the board): lever names in front of the levers, gate names beside each gate.
export const LABEL_SIZE = 6;
export const GATE_LABEL_SIZE = 4.2;
export const labels = {
  l: faceMatrix([LEVER.l[0] - 2, LEVER.l[1] + 13], 0, view, "x"),
  r: faceMatrix([LEVER.r[0] - 2, LEVER.r[1] + 13], 0, view, "x"),
  nand: faceMatrix([PAD_OUT + 3, ROW_Y.nand + 8], 0, view, "x"),
  or: faceMatrix([PAD_OUT + 3, ROW_Y.or + 8], 0, view, "x"),
};

// Entrance spark points: the fridge corners.
export const contacts = rectCorners(BODY, 2).map(([x, y]) => at([x, y, 0]));

// ---------- Zoom-out: a grid of NAND tiles filling the board ----------
// The two NAND rows shrink into the centre tile of a 9 x 5 grid of identical NAND tiles (tiles plain, no labels).
const GRID = { cols: 9, rows: 5, w: 14, d: 10, gap: 3, h: 3 };
const gridX = (c: number) => -74 + c * (GRID.w + GRID.gap);
const gridY = (r: number) => -31 + r * (GRID.d + GRID.gap);
const CENTRE = { c: 4, r: 2 };
const arcPts = (cx: number, cy: number, r: number, a0: number, a1: number, n = 14) =>
  Array.from({ length: n + 1 }, (_, i) => [cx + r * Math.cos(a0 + ((a1 - a0) * i) / n), cy + r * Math.sin(a0 + ((a1 - a0) * i) / n)] as Vec2);
// NAND symbol in tile units (x -1..1 along the signal): AND body, two input leads, output lead, output bubble.
const andBody = (): Vec2[] => [[-0.6, 0.55], [-0.6, -0.55], [-0.05, -0.55], ...arcPts(-0.05, 0, 0.55, -Math.PI / 2, Math.PI / 2)];
const NAND_TILE = {
  closed: [andBody()],
  open: [
    [[-1, -0.28], [-0.6, -0.28]],
    [[-1, 0.28], [-0.6, 0.28]],
    [[0.74, 0], [1, 0]],
  ] as Vec2[][],
  bubble: { c: [0.62, 0] as Vec2, r: 0.12 },
};
function gridTile(c: number, r: number) {
  const rect: Rect = { x: gridX(c), y: gridY(r), w: GRID.w, d: GRID.d, r: 0.8 };
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.d / 2;
  const unit = Math.min(rect.w * 0.42, rect.d * 0.62);
  const sp = ([x, y]: Vec2) => at([cx + x * unit, cy + y * unit, GRID.h + 0.05]);
  const sym =
    NAND_TILE.closed.map((pts) => pathD(pts.map(sp), true)).join("") +
    NAND_TILE.open.map((pts) => pathD(pts.map(sp))).join("") +
    pathD(arcPts(NAND_TILE.bubble.c[0], NAND_TILE.bubble.c[1], NAND_TILE.bubble.r, 0, Math.PI * 2, 16).map(sp), true);
  return solidSvg(prism(rect, 0, GRID.h, view, 3, 0.4), { tone: "mid", crease: "lo", className: "df-grid-tile" }) + `<path class="df-tile-sym" d="${sym}"/>`;
}
// Every tile but the centre one (the shrunken circuit sits there), back to front.
export const gridSvg = Array.from({ length: GRID.rows }, (_, r) => Array.from({ length: GRID.cols }, (_, c) => ({ c, r })))
  .flat()
  .filter(({ c, r }) => c !== CENTRE.c || r !== CENTRE.r)
  .sort((p, q) => depth([gridX(p.c), gridY(p.r), 0]) - depth([gridX(q.c), gridY(q.r), 0]))
  .map(({ c, r }) => gridTile(c, r))
  .join("");
// Circuit shrink (k 0 full size .. 1 tile size): its centre moves onto the centre tile, scaled to the tile's width.
const CIRC_C = at([-3, 0, 6]);
const TILE_C = at([gridX(CENTRE.c) + GRID.w / 2, gridY(CENTRE.r) + GRID.d / 2, GRID.h]);
const CIRC_W = at([66, -36, 0])[0] - at([-72, 36, 0])[0];
const TILE_W = at([GRID.w, -GRID.d, 0])[0] - at([0, 0, 0])[0];
const SHRINK = (TILE_W / CIRC_W) * 1.15;
export const circuitShrink = (k: number) => {
  const e = k * k * (3 - 2 * k);
  const sc = 1 + (SHRINK - 1) * e;
  const tx = CIRC_C[0] + (TILE_C[0] - CIRC_C[0]) * e;
  const ty = CIRC_C[1] + (TILE_C[1] - CIRC_C[1]) * e;
  return `translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${sc.toFixed(4)}) translate(${(-CIRC_C[0]).toFixed(2)} ${(-CIRC_C[1]).toFixed(2)})`;
};
