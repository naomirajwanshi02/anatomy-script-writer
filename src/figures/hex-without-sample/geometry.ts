// Hex "without it": the board has become a desk (same square footprint, thicker slab on two end panels and a
// modesty panel). On it a monitor with a blue LCD wall of bits and a keyboard on the monitor's centre line; an
// engineer on an office chair on the same line, facing the monitor, back to the camera; a thought bubble drawn in
// stage space above the head.
//
// Reusable builders (copy into other figures): deskParts, keyboardParts, chairParts, engineerParts. Each takes the
// view and its placement and returns ready-to-draw paths; nothing depends on module state.
import { cylinder, flatCircle, flatRect, inset, pathD, prism, prismFill, project, rectCorners, type Rect, type Vec2, type Vec3, type View } from "../../iso/iso-kit";
import { WALL_ROWS } from "./model";

export const STAGE_W = 600;
const CONTENT_H = 720; // content band; the extra stage height below keeps the bottom 20 % of the frame free
export const STAGE_H = 780;
const AZIMUTH = 62;
const PAD = 8;

// ---------- Shared helpers ----------

const r1 = (v: number) => v.toFixed(1);
// Screen length of one board unit (horizontal, across the view).
const unitLen = (v: View) => {
  const a = (v.azimuth * Math.PI) / 180;
  const p = project([Math.sin(a), -Math.cos(a), 0], v);
  const o = project([0, 0, 0], v);
  return Math.hypot(p[0] - o[0], p[1] - o[1]);
};
// Convex hull (monotone chain) of screen points, as a closed path.
const hullPath = (pts: Vec2[]) => {
  const s = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: Vec2, a: Vec2, b: Vec2) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list: Vec2[]) => {
    const h: Vec2[] = [];
    for (const p of list) {
      while (h.length >= 2 && cross(h[h.length - 2], h[h.length - 1], p) <= 0) h.pop();
      h.push(p);
    }
    return h;
  };
  return pathD([...half(s).slice(0, -1), ...half([...s].reverse()).slice(0, -1)], true);
};
// Horizontal ellipse ring (board units).
const ring = (cx: number, cy: number, z: number, hw: number, hd: number, n = 24): Vec3[] =>
  Array.from({ length: n }, (_, i) => [cx + hw * Math.cos((i / n) * Math.PI * 2), cy + hd * Math.sin((i / n) * Math.PI * 2), z]);
// Text on a front face (+y), reading along +x, upright along +z.
const frontMatrixIn = (v: View, p: Vec3) => {
  const o = project(p, v);
  const ax = project([p[0] + 1, p[1], p[2]], v);
  const az = project([p[0], p[1], p[2] - 1], v);
  const r = (n: number) => Math.round(n * 1e3) / 1e3;
  return `matrix(${r(ax[0] - o[0])} ${r(ax[1] - o[1])} ${r(az[0] - o[0])} ${r(az[1] - o[1])} ${r(o[0])} ${r(o[1])})`;
};
// Limb tube through 3D points with radius r: drawn as an ink stroke (w + outline) under a fill stroke (w).
export type Tube = { d: string; w: number };
const tube = (v: View, pts: Vec3[], r: number): Tube => ({ d: pathD(pts.map((p) => project(p, v))), w: 2 * r * unitLen(v) });

// ---------- Desk ----------

export type DeskSpec = { rect: Rect; slabH: number; legH: number };
export function deskParts(v: View, { rect, slabH, legH }: DeskSpec) {
  const floor = -(slabH + legH);
  const legL: Rect = { x: rect.x + 3, y: rect.y + 6, w: 5, d: rect.d - 12, r: 1 };
  const legR: Rect = { x: rect.x + rect.w - 8, y: rect.y + 6, w: 5, d: rect.d - 12, r: 1 };
  const modesty: Rect = { x: rect.x + 8, y: rect.y + 12, w: rect.w - 16, d: 3, r: 0.5 };
  return {
    floor,
    halo: prismFill(rect, floor, -floor, v),
    modesty: prism(modesty, -slabH - 26, 26, v, 2, 0.3),
    legs: [prism(legL, floor, legH, v, 2, 0.4), prism(legR, floor, legH, v, 2, 0.4)],
    slab: prism(rect, -slabH, slabH, v, 6, 1.2),
    inset: flatRect(inset(rect, 3.5), 0, v),
    rings: rectCorners(rect, 7).map(([x, y]) => flatCircle(x, y, 1.8, 0, v, 14)).join(""),
    screws: rectCorners(rect, 7).map(([x, y]) => project([x, y, 0], v)),
    // Engraving transform on the front face, centred at x.
    engrave: (x: number, size: number) => frontMatrixIn(v, [x, rect.y + rect.d, -slabH / 2 - size * 0.36]),
  };
}

// ---------- Keyboard (46 x 13, 4 rows of 13 keys), centred at (cx, cy) on the desk top ----------

export function keyboardParts(v: View, cx: number, cy: number) {
  const kb: Rect = { x: cx - 23, y: cy - 6.5, w: 46, d: 13, r: 1.5 };
  const h = 2.5;
  const kw = (kb.w - 3) / 13;
  const kd = (kb.d - 3) / 4;
  return {
    rect: kb,
    body: prism(kb, 0, h, v, 3, 0.5),
    keys: Array.from({ length: 52 }, (_, i) =>
      flatRect({ x: kb.x + 1.5 + (i % 13) * kw + 0.3, y: kb.y + 1.5 + Math.floor(i / 13) * kd + 0.3, w: kw - 0.6, d: kd - 0.6, r: 0.3 }, h + 0.05, v, 1),
    ).join(""),
  };
}

// ---------- Office chair, centred at (cx, cy) on the floor, facing -y (backrest toward +y) ----------

export const CHAIR_SEAT_H = 36; // seat top above the floor
export function chairParts(v: View, cx: number, cy: number, floor: number) {
  const seat = floor + CHAIR_SEAT_H;
  const a = (v.azimuth * Math.PI) / 180;
  const depth = ([x, y]: Vec2) => x * Math.cos(a) + y * Math.sin(a);
  const P = (p: Vec3) => project(p, v);
  // Five-spoke star base: spokes from the hub, a small round caster under each tip (drawn back to front).
  const tips: Vec2[] = Array.from({ length: 5 }, (_, i) => {
    const t = Math.PI / 2 + (i * 2 * Math.PI) / 5 + 0.3;
    return [cx + 16 * Math.cos(t), cy + 16 * Math.sin(t)];
  }).sort((p, q) => depth(p) - depth(q));
  const spokeZ = floor + 4.2;
  // Curved backrest: a shell bowed round the sitter's back (centre toward +y), thick 4, from seat+6 to seat+25.
  const shell = (z: number, inner: boolean) =>
    Array.from({ length: 13 }, (_, i): Vec3 => {
      const f = (i / 12) * 2 - 1; // -1..1 across
      const bow = 4.5 * (1 - f * f); // centre further back
      return [cx + 15 * f, cy + 10 + bow + (inner ? 0 : 4), z];
    });
  const backZ0 = seat + 6;
  const backZ1 = seat + 25;
  const backPts = [backZ0, backZ0 + 1.5, backZ1 - 1.5, backZ1].flatMap((z, k) =>
    [...shell(z, true), ...shell(z, false)].map(([x, y]): Vec3 => [cx + (x - cx) * (k === 0 || k === 3 ? 0.93 : 1), y, z]),
  );
  return {
    seatZ: seat,
    spokes: tips.map(([x, y]) => tube(v, [[cx, cy, spokeZ], [x, y, spokeZ - 1.2]], 1.5)),
    casters: tips.map(([x, y]) => cylinder(x, y, 1.9, floor, 2.4, v, 16, 0.6)),
    hub: cylinder(cx, cy, 3.2, floor + 2.6, 3.4, v, 20, 0.6),
    column: cylinder(cx, cy, 2, floor + 6, CHAIR_SEAT_H - 13, v, 16, 0),
    shroud: cylinder(cx, cy, 3, floor + 6, 9, v, 18, 0.4),
    mech: prism({ x: cx - 6, y: cy - 5, w: 12, d: 10, r: 2 }, seat - 7, 2.5, v, 3, 0.4),
    // Padded seat: rounded corners and a soft rolled front edge (deep bevel).
    seat: prism({ x: cx - 16, y: cy - 14, w: 32, d: 27, r: 7 }, seat - 4.5, 4.5, v, 8, 2.2),
    bar: tube(v, [[cx, cy + 4, seat - 5.5], [cx, cy + 12, seat - 5], [cx, cy + 14.5, backZ0 + 4]], 1.4),
    back: hullPath(backPts.map(P)),
    backTop: pathD(shell(backZ1, true).map(P)),
    backFace: pathD([...shell(backZ1 - 1.5, false), ...shell(backZ0 + 1.5, false).reverse()].map(P), true),
  };
}

// ---------- Engineer, seated, facing -y, hands on a keyboard at handsY (desk top z = 0) ----------
// cx, cy: centre of the hips on the seat; seat, floor: heights. Proportions in board units (1 unit ~ 1.2 cm).

export const engineerHead = (cx: number, cy: number, seat: number): Vec3 => [cx, cy - 2.5, seat + 57];
export const ENGINEER_HEAD_R = 9.5;
export function engineerParts(v: View, cx: number, cy: number, seat: number, floor: number, handsY: number) {
  const u = unitLen(v);
  const P = (p: Vec3) => project(p, v);
  const side = (s: -1 | 1) => {
    // Leg: hip, knee forward under the desk, shin down, shoe on the floor (one foot a little further forward).
    const fwd = s < 0 ? 2.5 : 0;
    const hip: Vec3 = [cx + 6 * s, cy + 2, seat + 5];
    const knee: Vec3 = [cx + 7 * s, cy - 19, seat + 5];
    const ankle: Vec3 = [cx + 7.5 * s, cy - 22 - fwd, floor + 5];
    // Arm: shoulder, elbow hanging just in front of the torso, forearm along the desk to the keyboard.
    const shoulder: Vec3 = [cx + 13.5 * s, cy - 2, seat + 39];
    const elbow: Vec3 = [cx + 16.5 * s, cy - 7, seat + 22];
    const wrist: Vec3 = [cx + 9.5 * s, handsY + 3, 4.5];
    const tip: Vec3 = [cx + 8.5 * s, handsY - 2.5, 3.3];
    return {
      shoe: tube(v, [[cx + 7.5 * s, cy - 18 - fwd, floor + 2.6], [cx + 8 * s, cy - 29 - fwd, floor + 2.6]], 3.2),
      shin: tube(v, [knee, ankle], 4.4),
      thigh: tube(v, [hip, knee], 6),
      upper: tube(v, [shoulder, elbow], 4.1),
      fore: tube(v, [elbow, wrist], 3.4),
      hand: tube(v, [wrist, tip], 2.6),
    };
  };
  // Torso: elliptical rings from the hips up, waist narrowest, shoulders widest, sloping to the neck; slight lean.
  const RINGS: [dz: number, hw: number, hd: number, dy: number][] = [
    [0, 12, 7, 2],
    [9, 11, 6.5, 1.5],
    [20, 13.5, 7.2, 0],
    [31, 16.5, 7.6, -1.5],
    [38, 16.5, 7, -2],
    [41.5, 13, 5.8, -2.5],
    [43.5, 7, 4.5, -2.5],
  ];
  const rings = RINGS.map(([dz, hw, hd, dy]) => ring(cx, cy + dy, seat + dz, hw, hd));
  const head = engineerHead(cx, cy, seat);
  const hc = P(head);
  const hr = ENGINEER_HEAD_R * u;
  const hry = hr * 1.08;
  // Hair mass: the head outline from the left round the top to the right, down to a nape line; slightly fuller.
  const hair = (() => {
    const rx = hr * 1.04;
    const ry = hry * 1.05;
    const pts: Vec2[] = [];
    const a0 = Math.PI * 0.7; // lower left (y down)
    const a1 = Math.PI * 2.3; // lower right
    for (let i = 0; i <= 32; i++) {
      const a = a0 + ((a1 - a0) * i) / 32;
      pts.push([hc[0] + rx * Math.cos(a), hc[1] + ry * Math.sin(a) - hry * 0.02]);
    }
    const [lx, ly] = pts[0];
    const [rx2, ry2] = pts[pts.length - 1];
    return `${pathD(pts)}Q${r1(hc[0] + hr * 0.2)} ${r1(hc[1] + hry * 0.42)} ${r1((lx + rx2) / 2)} ${r1((ly + ry2) / 2 + hry * 0.12)}Q${r1(hc[0] - hr * 0.4)} ${r1(hc[1] + hry * 0.5)} ${r1(lx)} ${r1(ly)}Z`;
  })();
  return {
    left: side(-1),
    right: side(1),
    torso: hullPath(rings.flat().map(P)),
    shoulders: hullPath([...rings[4], ...rings[5], ...rings[6]].map(P)),
    // Back seam (spine) and a shade down the camera-side flank.
    spine: pathD([P([cx, cy + 8.6, seat + 9]), P([cx, cy + 8.2, seat + 26]), P([cx, cy + 6.5, seat + 38])]),
    collar: hullPath(ring(cx, cy - 2.5, seat + 44.5, 6.6, 5.4).map(P)),
    neck: hullPath([...ring(cx, cy - 2.5, seat + 43.5, 3.8, 3.6), ...ring(cx, cy - 2.5, seat + 51, 3.6, 3.4)].map(P)),
    head: { cx: hc[0], cy: hc[1], rx: hr, ry: hry },
    hair,
    ear: { cx: hc[0] + hr * 0.97, cy: hc[1] + hry * 0.12, rx: hr * 0.17, ry: hry * 0.27 },
  };
}

// ---------- This scene ----------

const DESK: DeskSpec = { rect: { x: -63, y: -52, w: 126, d: 126, r: 7 }, slabH: 10, legH: 48 };
const FLOOR = -(DESK.slabH + DESK.legH);
const FRONT = DESK.rect.y + DESK.rect.d; // desk front edge, y = 74

// Monitor: stand, neck and housing; screen glass on the front face (+y). Keyboard and engineer share its centre line.
const LINE_X = -7;
const HOUSING: Rect = { x: LINE_X - 39, y: 2, w: 78, d: 4.5, r: 1 };
const H_Z0 = 12;
const H_Z1 = 56;
const SCREEN = { x0: LINE_X - 36, x1: LINE_X + 36, z0: 17.5, z1: 53 };
const STAND: Rect = { x: LINE_X - 12, y: -6, w: 24, d: 14, r: 3 };
const NECK: Rect = { x: LINE_X - 2.5, y: -1.5, w: 5, d: 3.5, r: 0.8 };
const KB_Y = FRONT - 15; // keyboard centre, a hand's width in from the front edge
const CHAIR_Y = FRONT + 14; // chair column
const HIPS_Y = FRONT + 12;
const SEAT = FLOOR + CHAIR_SEAT_H;

// Fit: everything in unit projection, the bubble added in the same units, then scaled into the content band.
const UNIT: View = { origin: [0, 0], scale: 1, azimuth: AZIMUTH, elevation: 30 };
const u = (p: Vec3) => project(p, UNIT);
const box = (r: Rect, z0: number, z1: number): Vec3[] => rectCorners(r).flatMap(([x, y]): Vec3[] => [[x, y, z0], [x, y, z1]]);
const SCENE: Vec3[] = [...box(DESK.rect, FLOOR, 0), ...box(HOUSING, 0, H_Z1), ...box({ x: LINE_X - 18, y: FRONT - 20, w: 36, d: 50, r: 0 }, FLOOR, SEAT + 68)];
const sx = SCENE.map((p) => u(p)[0]);
const sy = SCENE.map((p) => u(p)[1]);
const SPAN = Math.max(...sx) - Math.min(...sx);
const headU = u(engineerHead(LINE_X, HIPS_Y, SEAT));
const monTopU = Math.min(...box(HOUSING, H_Z1, H_Z1).map((p) => u(p)[1]));
const B_RX = 0.37 * SPAN;
const B_RY = 0.135 * SPAN;
const bubbleU = { cx: headU[0] + B_RX * 0.38, cy: monTopU - 0.05 * SPAN - B_RY };
const bx = [Math.min(...sx), Math.max(...sx), bubbleU.cx - B_RX * 1.08, bubbleU.cx + B_RX * 1.08];
const by = [Math.min(...sy), Math.max(...sy), bubbleU.cy - B_RY * 1.4]; // scallops bulge past ry
const X0 = Math.min(...bx);
const X1 = Math.max(...bx);
const Y0 = Math.min(...by);
const Y1 = Math.max(...by);
const SCALE = Math.min((STAGE_W - PAD * 2) / (X1 - X0), (CONTENT_H - PAD * 2) / (Y1 - Y0));
export const view: View = {
  origin: [STAGE_W / 2 - ((X0 + X1) / 2) * SCALE, CONTENT_H / 2 - ((Y0 + Y1) / 2) * SCALE],
  scale: SCALE,
  azimuth: AZIMUTH,
  elevation: 30,
};
const at = (p: Vec3) => project(p, view);
const toStage = ([x, y]: Vec2): Vec2 => [view.origin[0] + x * SCALE, view.origin[1] + y * SCALE];
const frontMatrix = (p: Vec3) => frontMatrixIn(view, p);

export const desk = deskParts(view, DESK);
export const keyboard = keyboardParts(view, LINE_X, KB_Y);
export const chair = chairParts(view, LINE_X, CHAIR_Y, FLOOR);
export const person = engineerParts(view, LINE_X, HIPS_Y, SEAT, FLOOR, KB_Y);

// Board engraving on the desk's front face, right of the engineer so he never hides it.
export const ENGRAVE = "ROLLIN-रोलिन-ROLLIN-रोलिन";
export const ENGRAVE_SIZE = 3.6;
export const engrave = desk.engrave(38, ENGRAVE_SIZE);

export const WALL_SIZE = 3.3;
export const BRAND_SIZE = 2.4;
export const monitor = {
  pool: flatCircle(LINE_X, 22, 46, 0.05, view, 48),
  stand: prism(STAND, 0, 1.6, view, 4, 0.4),
  neck: prism(NECK, 1.6, H_Z0 + 6, view, 2, 0.2),
  housing: prism(HOUSING, H_Z0, H_Z1 - H_Z0, view, 2, 0.6),
  glass: pathD(
    [
      [SCREEN.x0, SCREEN.z1],
      [SCREEN.x1, SCREEN.z1],
      [SCREEN.x1, SCREEN.z0],
      [SCREEN.x0, SCREEN.z0],
    ].map(([x, z]) => at([x, HOUSING.y + HOUSING.d + 0.05, z])),
    true,
  ),
  rows: Array.from({ length: WALL_ROWS }, (_, r) => {
    const pitch = (SCREEN.z1 - SCREEN.z0 - 3) / WALL_ROWS;
    return frontMatrix([LINE_X, HOUSING.y + HOUSING.d + 0.1, SCREEN.z1 - 1.5 - pitch * (r + 0.5) - WALL_SIZE * 0.36]);
  }),
  brand: frontMatrix([LINE_X, HOUSING.y + HOUSING.d + 0.05, (H_Z0 + SCREEN.z0) / 2 - BRAND_SIZE * 0.36]),
};

// Thought bubble (stage units): scalloped ellipse above the head, three trailing circles rising to its lower left
// (clear of the monitor's left edge).
const bc = toStage([bubbleU.cx, bubbleU.cy]);
export const bubble = { cx: bc[0], cy: bc[1], rx: B_RX * SCALE, ry: B_RY * SCALE };
export const bubblePath = (() => {
  const n = 13;
  const pts: Vec2[] = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + 0.15;
    return [bubble.cx + bubble.rx * Math.cos(a), bubble.cy + bubble.ry * Math.sin(a)];
  });
  let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const q = pts[(i + 1) % n];
    const p = pts[i];
    const rr = Math.hypot(q[0] - p[0], q[1] - p[1]) * 0.62;
    d += `A${r1(rr)} ${r1(rr)} 0 0 1 ${r1(q[0])} ${r1(q[1])}`;
  }
  return d + "Z";
})();
export const trail = (() => {
  const { cx, cy, rx, ry } = person.head;
  const from: Vec2 = [cx - 0.45 * rx, cy - 1.45 * ry];
  const to: Vec2 = [bubble.cx - 0.66 * bubble.rx, bubble.cy + 0.95 * bubble.ry];
  return [0.1, 0.42, 0.78].map((f, i) => ({ x: from[0] + (to[0] - from[0]) * f, y: from[1] + (to[1] - from[1]) * f, r: bubble.ry * [0.07, 0.11, 0.155][i] }));
})();

// Entrance sparks: monitor stand and keyboard corners on the desk top.
export const contacts = [...rectCorners(STAND), ...rectCorners(keyboard.rect)].map(([x, y]) => at([x, y, 0]));
