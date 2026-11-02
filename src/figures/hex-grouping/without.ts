// Hex grouping, "without it" scene: the square board becomes a desk (legs and a modesty panel grow under it). On
// it a monitor with a blue LCD wall of bits and a keyboard on the monitor's centre line; an engineer on an office chair
// on the same line, back to the camera; a thought bubble above the head. Drawn in the figure's own view (inside the
// zoom group), with a desk camera that eases out so the whole scene fits the frame.
//
// deskParts, keyboardParts, chairParts and engineerParts are copied from the approved sample
// (src/figures/hex-without-sample/geometry.ts) so they can be swapped as a block.
import { cylinder, flatCircle, flatRect, inset, pathD, prism, prismFill, project, rectCorners, solidSvg, type Rect, type Vec2, type Vec3, type View } from "../../iso/iso-kit";
import { ANALOGY_ZOOM, STAGE_W, view } from "./geometry";
import { WALL_ROWS } from "./model";

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
// sd / sw: the shaded side (light from the upper left): a narrower stroke offset toward screen right-down, kept
// inside the tube's fill.
export type Tube = { d: string; w: number; sd: string; sw: number };
const tube = (v: View, pts: Vec3[], r: number): Tube => {
  const ps = pts.map((p) => project(p, v));
  const w = 2 * r * unitLen(v);
  const off = ps.map((p, i) => {
    const a = ps[Math.max(0, i - 1)];
    const b = ps[Math.min(ps.length - 1, i + 1)];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    let n: Vec2 = [-(b[1] - a[1]) / len, (b[0] - a[0]) / len];
    if (n[0] + 0.4 * n[1] < 0) n = [-n[0], -n[1]];
    return [p[0] + n[0] * w * 0.27, p[1] + n[1] * w * 0.27] as Vec2;
  });
  return { d: pathD(ps), w, sd: pathD(off), sw: w * 0.44 };
};
// Smooth closed path through screen points (Catmull-Rom as cubic Béziers).
const smoothClosed = (pts: Vec2[]) => {
  const n = pts.length;
  const p = (i: number) => pts[(i + n) % n];
  let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const [a, b, c, e] = [p(i - 1), p(i), p(i + 1), p(i + 2)];
    d += `C${r1(b[0] + (c[0] - a[0]) / 6)} ${r1(b[1] + (c[1] - a[1]) / 6)} ${r1(c[0] - (e[0] - b[0]) / 6)} ${r1(c[1] - (e[1] - b[1]) / 6)} ${r1(c[0])} ${r1(c[1])}`;
  }
  return d + "Z";
};
// Outline of a stack of horizontal rings (bottom to top) traced edge by edge, so concave curves (waist, shoulder
// slope) survive; a convex hull would fill them in. Also returns the right-hand chain and ring centres for shading.
const ringSilhouette = (rings: Vec2[][], centres: Vec2[]) => {
  const L: Vec2[] = [];
  const R: Vec2[] = [];
  const li: number[] = [];
  const ri: number[] = [];
  rings.forEach((r) => {
    let a = 0;
    let b = 0;
    r.forEach((p, i) => {
      if (p[0] < r[a][0]) a = i;
      if (p[0] > r[b][0]) b = i;
    });
    L.push(r[a]);
    R.push(r[b]);
    li.push(a);
    ri.push(b);
  });
  // Arc of ring r from index i to j, taking the way round that passes the extreme y (top: min, bottom: max).
  const arc = (r: Vec2[], i: number, j: number, top: boolean) => {
    const n = r.length;
    const walk = (step: number) => {
      const out: Vec2[] = [];
      for (let k = i; k !== j; k = (k + step + n) % n) out.push(r[k]);
      out.push(r[j]);
      return out;
    };
    const [a, b] = [walk(1), walk(-1)];
    const ext = (s: Vec2[]) => (top ? Math.min(...s.map((p) => p[1])) : Math.max(...s.map((p) => p[1])));
    return top ? (ext(a) < ext(b) ? a : b) : ext(a) > ext(b) ? a : b;
  };
  const t = rings.length - 1;
  const outline = [...L.slice(0, t), ...arc(rings[t], li[t], ri[t], true), ...R.slice(0, t).reverse(), ...arc(rings[0], ri[0], li[0], false).slice(1, -1)];
  const inner = R.map((p, k) => [p[0] + (centres[k][0] - p[0]) * 0.42, p[1] + (centres[k][1] - p[1]) * 0.42] as Vec2);
  return { d: smoothClosed(outline), shade: smoothClosed([...R.slice(0, t), ...inner.slice(0, t).reverse()]) };
};

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
  // Ergonomic mesh back: taller, waisted at the lumbar, bowed round the back; frame outline, see-through mesh, lumbar pad.
  // Fitted to the sitter (hips at cy - 2): the centre line touches the back of the polo from the waist to the
  // shoulder blades, the edges wrap 3 units forward round the flanks, and it stays narrower than the shoulders.
  const meshZ0 = seat + 6;
  const meshZ1 = seat + 35;
  const meshAt = (z: number, f: number): Vec3 => {
    const k = (z - meshZ0) / (meshZ1 - meshZ0);
    const hw = 12.5 + 3 * k - 1.4 * Math.exp(-(((k - 0.3) / 0.18) ** 2)); // narrow at the lumbar, wider at the blades
    const lumbar = -1.2 * Math.exp(-(((k - 0.3) / 0.2) ** 2)); // lumbar curve pushes into the small of the back
    return [cx + hw * f, cy + 4 + 3 * (1 - f * f) + lumbar - 1.5 * k, z];
  };
  const fs = Array.from({ length: 13 }, (_, i) => (i / 12) * 2 - 1);
  const zs = Array.from({ length: 13 }, (_, i) => meshZ0 + ((meshZ1 - meshZ0) * i) / 12);
  const outline = [...fs.map((f) => meshAt(meshZ0, f)), ...zs.map((z) => meshAt(z, 1)), ...[...fs].reverse().map((f) => meshAt(meshZ1, f)), ...[...zs].reverse().map((z) => meshAt(z, -1))];
  const lumZ0 = meshZ0 + 6;
  const lumZ1 = meshZ0 + 12;
  const lumFs = fs.slice(2, 11);
  // Armrests: an L-bracket from under the seat out to a post just outside the hips, and a pad right under the
  // elbow (top at seat + 21.4) so the forearm rests on it; the pad stops short of the desk slab.
  const ARM_X = 18.5;
  const arm = (s: -1 | 1) => ({
    bracket: prism({ x: s < 0 ? cx - ARM_X - 1 : cx + 5, y: cy - 5.5, w: ARM_X - 4, d: 4, r: 0.8 }, seat - 7.5, 1.8, v, 2, 0.4),
    post: prism({ x: cx + ARM_X * s - 1.4, y: cy - 5.5, w: 2.8, d: 4, r: 0.8 }, seat - 7.5, 26.4, v, 2, 0.4),
    pad: prism({ x: cx + ARM_X * s - 2.8, y: cy - 13, w: 5.6, d: 14, r: 2 }, seat + 18.8, 2.6, v, 4, 0.9),
  });
  // Twin-wheel casters: a swivel stem under each spoke tip, a hood over the axle, and two tyred wheels (one each
  // side of the hood) standing in the vertical plane along the spoke; the far wheel is drawn first.
  const disc = (c: Vec3, d: Vec2, r: number, from = 0, to = Math.PI * 2, n = 24) =>
    Array.from({ length: n + 1 }, (_, i): Vec3 => {
      const t = from + ((to - from) * i) / n;
      return [c[0] + d[0] * r * Math.cos(t), c[1] + d[1] * r * Math.cos(t), c[2] + r * Math.sin(t)];
    });
  const WHEEL_R = 1.7;
  const caster = ([x, y]: Vec2) => {
    const len = Math.hypot(x - cx, y - cy) || 1;
    const d: Vec2 = [(x - cx) / len, (y - cy) / len];
    const nrm: Vec2 = [-d[1], d[0]];
    const axle: Vec3 = [x + d[0] * 1.2, y + d[1] * 1.2, floor + WHEEL_R];
    const side = (s: number): Vec3 => [axle[0] + nrm[0] * 1.15 * s, axle[1] + nrm[1] * 1.15 * s, axle[2]];
    const [far, near] = [-1, 1].sort((a, b) => depth([nrm[0] * a, nrm[1] * a]) - depth([nrm[0] * b, nrm[1] * b])).map(side);
    const wheel = (c: Vec3) => ({ tyre: pathD(disc(c, d, WHEEL_R).map(P), true), hub: pathD(disc(c, d, WHEEL_R * 0.42).map(P), true) });
    const hoodHalf = (s: number) => disc([axle[0] + nrm[0] * 0.75 * s, axle[1] + nrm[1] * 0.75 * s, axle[2]], d, WHEEL_R + 0.25, 0, Math.PI, 16);
    return {
      stem: cylinder(x, y, 0.75, floor + WHEEL_R + 1.6, spokeZ - 0.3 - (floor + WHEEL_R + 1.6), v, 12, 0),
      far: wheel(far),
      hood: hullPath([...hoodHalf(-1), ...hoodHalf(1)].map(P)),
      near: wheel(near),
    };
  };
  return {
    seatZ: seat,
    spokes: tips.map(([x, y]) => tube(v, [[cx, cy, spokeZ], [x, y, spokeZ - 0.3]], 1.5)),
    casters: tips.map(caster),
    hub: cylinder(cx, cy, 3.2, floor + 2.6, 3.4, v, 20, 0.6),
    column: cylinder(cx, cy, 2, floor + 6, CHAIR_SEAT_H - 13, v, 16, 0),
    shroud: cylinder(cx, cy, 3, floor + 6, 9, v, 18, 0.4),
    mech: prism({ x: cx - 6, y: cy - 5, w: 12, d: 10, r: 2 }, seat - 7, 2.5, v, 3, 0.4),
    // Padded seat: rounded corners and a soft rolled front edge (deep bevel).
    seat: prism({ x: cx - 16, y: cy - 14, w: 32, d: 27, r: 7 }, seat - 4.5, 4.5, v, 8, 2.2),
    // Spine bar: from under the seat's rear, up to the bottom centre of the mesh back.
    bar: tube(v, [[cx, cy + 9, seat - 5.5], [cx, cy + 15, seat - 3], [cx, cy + 9, meshZ0 + 3]], 1.4),
    back: hullPath(backPts.map(P)),
    backTop: pathD(shell(backZ1, true).map(P)),
    backFace: pathD([...shell(backZ1 - 1.5, false), ...shell(backZ0 + 1.5, false).reverse()].map(P), true),
    mesh: pathD(outline.map(P), true),
    meshRibs: [0.25, 0.5, 0.75].map((k) => pathD(fs.map((f) => P(meshAt(meshZ0 + k * (meshZ1 - meshZ0), f))))).join(""),
    lumbar: pathD([...lumFs.map((f) => meshAt(lumZ0, f)), ...[...lumFs].reverse().map((f) => meshAt(lumZ1, f))].map(([x, y, z]) => P([x, y + 0.6, z])), true),
    armFar: arm(-1),
    armNear: arm(1),
  };
}

// ---------- Engineer, seated, facing -y, hands on a keyboard at handsY (desk top z = 0) ----------
// cx, cy: centre of the hips on the seat; seat, floor: heights. Proportions in board units (1 unit ~ 1.2 cm).

// Camera-side test for a board-plane offset (positive = toward the camera).
const nearer = (dx: number, dy: number) => {
  const a = ((view.azimuth ?? 45) * Math.PI) / 180;
  return dx * Math.cos(a) + dy * Math.sin(a);
};
// Polo torso: V-taper (narrow waist, broad shoulders), slight lean. Phase t (seconds) adds a slow breath and a soft
// ripple of loose fabric round the untucked hem, so the shirt moves a little while he sits.
const SHIRT_RINGS: [dz: number, hw: number, hd: number, dy: number][] = [
  [0, 12.8, 7.6, 2],
  [9, 11.8, 7, 1.5],
  [20, 14.2, 7.8, 0],
  [31, 15.6, 8.2, -1.5],
  [37, 15.8, 7.6, -2],
  [41, 13, 6.2, -2.5],
  [43.5, 7.6, 4.8, -2.5],
];
const shirtRings = (cx: number, cy: number, seat: number, t: number) =>
  SHIRT_RINGS.map(([dz, hw, hd, dy], k) => {
    const breath = 1 + 0.012 * Math.sin(t * 1.6) * (k >= 2 && k <= 4 ? 1 : 0.3);
    const lift = 0.25 * Math.sin(t * 1.6) * (k / 6);
    const loose = k <= 1 ? 1 - k * 0.5 : 0; // loose fabric only near the hem
    return Array.from({ length: 24 }, (_, i): Vec3 => {
      const th = (i / 24) * Math.PI * 2;
      const ripple = 1 + loose * 0.035 * Math.sin(th * 3 + t * 2.1) + loose * 0.02 * Math.sin(th * 5 - t * 1.3);
      return [cx + hw * breath * ripple * Math.cos(th), cy + dy + hd * breath * ripple * Math.sin(th), seat + dz + lift];
    });
  });
// Shirt outline, shoulder yoke, untucked hem line and two soft back folds at time t (rebuilt by the loop).
export function shirtAt(cx: number, cy: number, seat: number, t: number) {
  const P = (p: Vec3) => project(p, view);
  const rings = shirtRings(cx, cy, seat, t);
  const near = (rg: Vec3[]) => rg.filter(([x, y]) => nearer(x - cx, y - cy) >= -0.5).map(P).sort((p, q) => p[0] - q[0]);
  const sway = Math.sin(t * 1.25);
  const fold = (x0: number, x1: number, ph: number) => {
    const back = (x: number, z: number): Vec3 => [cx + x, cy + 9.3, seat + z];
    const a = P(back(x0 + 0.6 * Math.sin(t * 1.1 + ph), 4));
    const m = P(back((x0 + x1) / 2 + 1.4 * sway, 13 + 0.8 * Math.sin(t * 0.9 + ph)));
    const b = P(back(x1, 24));
    return `M${r1(a[0])} ${r1(a[1])}Q${r1(m[0])} ${r1(m[1])} ${r1(b[0])} ${r1(b[1])}`;
  };
  const body = shirtSilhouette(rings, P);
  return {
    torso: body.d,
    shade: body.shade,
    shoulders: ringSilhouette([rings[4], rings[5], rings[6]].map((r) => r.map(P)), SHIRT_RINGS.slice(4).map(([dz, , , dy]) => P([cx, cy + dy, seat + dz]))).d,
    hem: pathD(near(rings[0])),
    folds: fold(-7, -3, 0) + fold(6, 2.5, 1.7),
  };
}
// Polo outline and its shaded right flank from the shirt rings (centres follow each ring's lean).
function shirtSilhouette(rings: Vec3[][], P: (p: Vec3) => Vec2) {
  const centres = rings.map((r) => {
    const c = r.reduce((s, p) => [s[0] + p[0] / r.length, s[1] + p[1] / r.length, s[2] + p[2] / r.length], [0, 0, 0] as Vec3);
    return P(c);
  });
  return ringSilhouette(rings.map((r) => r.map(P)), centres);
}
// Head forward of the shoulders (typing posture): the neck leans about 15 degrees toward the screen.
export const engineerHead = (cx: number, cy: number, seat: number): Vec3 => [cx, cy - 8, seat + 56.5];
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
    // Arm (fit, not bulky): the shoulder joint sits inside the torso edge so the arm grows out of the body; elbow
    // on the armrest pad; forearm rises to the desk, the wrist bends down and the hand lies flat on the keys.
    const shoulder: Vec3 = [cx + 13.5 * s, cy - 1.5, seat + 36];
    const elbow: Vec3 = [cx + 18.5 * s, cy - 8, seat + 23.5];
    const wrist: Vec3 = [cx + 9.5 * s, handsY + 4, 4];
    const knuckle: Vec3 = [cx + 9 * s, handsY - 0.5, 3.4];
    const tip: Vec3 = [cx + 8.8 * s, handsY - 3, 2.9];
    const lat = (p: Vec3, k: number): Vec3 => [p[0] + k, p[1], p[2]];
    const along = (a: Vec3, b: Vec3, k: number): Vec3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
    // Polo short sleeve: loose tube over the top 45 % of the upper arm, with a ribbed cuff at its end.
    const cuff = along(shoulder, elbow, 0.45);
    // Muscle line on the screen: a short curve beside the limb axis (offset in pixels along the screen normal).
    const muscle = (a: Vec3, b: Vec3, k0: number, k1: number, off: number) => {
      const [p, q] = [P(a), P(b)];
      const len = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
      const n: Vec2 = [(-(q[1] - p[1]) / len) * off * u, ((q[0] - p[0]) / len) * off * u];
      const at = (k: number, bow: number): Vec2 => [p[0] + (q[0] - p[0]) * k + n[0] * bow, p[1] + (q[1] - p[1]) * k + n[1] * bow];
      const [m0, m1, m2] = [at(k0, 1), at((k0 + k1) / 2, 1.35), at(k1, 1)];
      return `M${r1(m0[0])} ${r1(m0[1])}Q${r1(m1[0])} ${r1(m1[1])} ${r1(m2[0])} ${r1(m2[1])}`;
    };
    const kneeIn: Vec3 = [knee[0], knee[1], knee[2] + 0.6];
    return {
      shoe: tube(v, [[cx + 7.5 * s, cy - 18 - fwd, floor + 2.6], [cx + 8 * s, cy - 29 - fwd, floor + 2.6]], 3.3),
      hemJeans: tube(v, [[ankle[0], ankle[1] + 0.4, ankle[2] + 1.5], [ankle[0], ankle[1] - 0.2, ankle[2] - 0.3]], 4.9),
      shin: tube(v, [knee, ankle], 4.5),
      thigh: tube(v, [hip, knee], 6.3),
      // Jeans: outer seam stitch down the thigh and shin.
      stitch: pathD([[hip[0] + 5.6 * s, hip[1], hip[2] + 0.5], [kneeIn[0] + 5.6 * s, kneeIn[1], kneeIn[2]]].map(P)) + pathD([[knee[0] + 4 * s, knee[1] - 1, knee[2] - 2], [ankle[0] + 4 * s, ankle[1], ankle[2] + 2]].map(P)),
      sleeve: tube(v, [shoulder, cuff], 5.3),
      // Ribbed cuff: a flat band across the sleeve end (butt caps, drawn just inside the sleeve outline).
      cuffBand: tube(v, [along(shoulder, elbow, 0.4), along(shoulder, elbow, 0.45)], 4.8),
      upper: tube(v, [shoulder, elbow], 4.1),
      bicep: tube(v, [along(shoulder, elbow, 0.45), along(shoulder, elbow, 0.75)], 4.4),
      foreBulk: tube(v, [along(elbow, wrist, 0.05), along(elbow, wrist, 0.38)], 3.8),
      fore: tube(v, [elbow, wrist], 3.4),
      // Back of the hand lying on the keys: one smooth shape from the wrist, widening over the knuckles, fingers
      // together and curling down to rounded tips; a faint knuckle line; the thumb tucked along the inside.
      hand: smoothClosed(
        [
          lat(wrist, -1.7),
          lat(along(wrist, knuckle, 0.55), -2.15),
          lat(knuckle, -2.35),
          lat(along(knuckle, tip, 0.7), -2.05),
          [tip[0] - 1, tip[1] - 0.6, tip[2]],
          [tip[0] + 1, tip[1] - 0.6, tip[2]],
          lat(along(knuckle, tip, 0.7), 2.05),
          lat(knuckle, 2.35),
          lat(along(wrist, knuckle, 0.55), 2.15),
          lat(wrist, 1.7),
        ].map(P),
      ),
      knuckles: pathD([lat(knuckle, -1.6), [knuckle[0], knuckle[1] - 0.3, knuckle[2] + 0.15] as Vec3, lat(knuckle, 1.6)].map(P)),
      thumb: tube(v, [lat(along(wrist, knuckle, 0.2), -1.5 * s), lat(along(knuckle, tip, 0.2), -2.3 * s)], 0.75),
      muscles: muscle(shoulder, elbow, 0.55, 0.85, 2.4 * s),
    };
  };
  const rings = shirtRings(cx, cy, seat, 0);
  const head = engineerHead(cx, cy, seat);
  const hc = P(head);
  const hr = ENGINEER_HEAD_R * u;
  const hry = hr * 1.08;
  // Skull from behind: widest across the crown, narrowing toward the jaw and nape (lower half up to 17 % narrower).
  const skullAt = (a: number, k = 1): Vec2 => {
    const s = Math.sin(a);
    const narrow = s > 0 ? 1 - 0.17 * s * s : 1 + 0.02 * s;
    return [hc[0] + hr * k * Math.cos(a) * narrow, hc[1] + hry * k * s];
  };
  const skull = smoothClosed(Array.from({ length: 36 }, (_, i) => skullAt((i / 36) * Math.PI * 2)));
  // Hair: the skull outline a touch fuller over the top, closed by a soft hairline that dips slightly at the
  // nape; a lighter faded band under it blends into the neck.
  const HAIRLINE = 0.6;
  const aR = Math.asin(HAIRLINE);
  const aL = Math.PI - aR;
  const over = Array.from({ length: 25 }, (_, i) => skullAt(aR - ((aR + (2 * Math.PI - aL)) * i) / 24, 1.04));
  const [lx, ly] = over[over.length - 1];
  const [rx0, ry0] = over[0];
  // Soft hairline: small uneven tufts along a curve dipping at the nape, with no ink line across it (only the
  // outer edge of the hair is outlined); two fading bands below blend it into the neck.
  const curve = (dip: number, n = 16, tuft = 0) =>
    Array.from({ length: n + 1 }, (_, i): Vec2 => {
      const k = i / n;
      const qx = (1 - k) ** 2 * lx + 2 * (1 - k) * k * hc[0] + k * k * rx0;
      const qy = (1 - k) ** 2 * ly + 2 * (1 - k) * k * (hc[1] + hry * dip) + k * k * ry0;
      return [qx, qy + tuft * hry * (0.5 + 0.5 * Math.sin(i * 2.3)) * (i % 2) * Math.sin(Math.PI * k)];
    });
  const hairline = curve(0.74, 26, 0.022);
  const hair = `${pathD(over)}L${hairline.slice(1).map((p) => `${r1(p[0])} ${r1(p[1])}`).join("L")}Z`;
  const hairEdge = pathD(over);
  const band = (a: number, b: number) => {
    const fa = (s: number) => skullAt(s > 0 ? Math.asin(a) : Math.PI - Math.asin(a));
    const fb = (s: number) => skullAt(s > 0 ? Math.asin(b) : Math.PI - Math.asin(b));
    const top = a === HAIRLINE ? hairline : curve(0.74 + (a - HAIRLINE) * 0.8).map((p, i, arr) => (i === 0 ? fa(-1) : i === arr.length - 1 ? fa(1) : p));
    const bot = curve(0.74 + (b - HAIRLINE) * 0.8).map((p, i, arr) => (i === 0 ? fb(-1) : i === arr.length - 1 ? fb(1) : p));
    return pathD([...top, ...bot.reverse()], true);
  };
  const nape = [band(HAIRLINE, 0.7), band(0.7, 0.78)];
  // Light from the upper left: a crescent of shade down the right side of the head.
  const shadeR = Array.from({ length: 13 }, (_, i) => skullAt(-Math.PI / 2 + (Math.PI * i) / 12));
  const shadeIn = Array.from({ length: 13 }, (_, i) => {
    const a = Math.PI / 2 - (Math.PI * i) / 12;
    return [hc[0] + hr * 0.38 * Math.cos(a) + hr * 0.25, hc[1] + hry * 0.9 * Math.sin(a)] as Vec2;
  });
  const ear = (s: -1 | 1) => ({ cx: hc[0] + s * hr * 0.95, cy: hc[1] + hry * 0.14, rx: hr * 0.17, ry: hry * 0.28 });
  const body = shirtSilhouette(rings, P);
  // Neck leaning forward from the collar to the base of the skull.
  const neckBase: Vec3 = [cx, cy - 2.5, seat + 42.5];
  const neckTop: Vec3 = [cx, cy - 7, seat + 51.5];
  return {
    left: side(-1),
    right: side(1),
    torso: body.d,
    torsoShade: body.shade,
    shoulders: shirtAt(cx, cy, seat, 0).shoulders,
    // Back seam (spine) and a shade down the camera-side flank.
    spine: pathD([P([cx, cy + 8.6, seat + 9]), P([cx, cy + 8.2, seat + 26]), P([cx, cy + 6.5, seat + 38])]),
    // Polo collar: a folded band standing round the back of the neck.
    collar: hullPath([...ring(cx, cy - 2.5, seat + 43.2, 8, 5.9), ...ring(cx, cy - 2.5, seat + 47, 6.6, 5)].map(P)),
    collarFold: pathD(ring(cx, cy - 2.5, seat + 45, 7.4, 5.5, 24).filter(([x, y]) => nearer(x - cx, y - cy + 2.5) >= 0).map(P).sort((p, q) => p[0] - q[0])),
    neck: hullPath([...ring(neckBase[0], neckBase[1], neckBase[2], 4.1, 3.8), ...ring(neckTop[0], neckTop[1], neckTop[2], 3.6, 3.4)].map(P)),
    neckShade: tube(v, [neckBase, neckTop], 3.7),
    head: { cx: hc[0], cy: hc[1], rx: hr, ry: hry },
    skull,
    hair,
    hairEdge,
    nape,
    headShade: smoothClosed([...shadeR, ...shadeIn]),
    ears: [ear(-1), ear(1)],
  };
}

// ---------- This scene ----------

const DESK: DeskSpec = { rect: { x: -63, y: -52, w: 126, d: 126, r: 7 }, slabH: 8, legH: 50 }; // slab = the board
const FLOOR = -(DESK.slabH + DESK.legH);
const FRONT = DESK.rect.y + DESK.rect.d; // desk front edge, y = 74

// Desk legs and modesty panel grown to height h (0..legH) under the board, as markup for the loop.
export function deskLegsSvg(h: number) {
  if (h < 0.2) return "";
  const d = deskParts(view, { ...DESK, legH: h });
  const r = DESK.rect;
  const m = Math.min(26, h);
  const modesty = prism({ x: r.x + 8, y: r.y + 12, w: r.w - 16, d: 3, r: 0.5 }, -DESK.slabH - m, m, view, 2, 0.3);
  return (
    `<path class="iso-halo" d="${d.halo}"/>` +
    solidSvg(modesty, { tone: "mid", crease: "lo" }) +
    d.legs.map((p) => solidSvg(p, { tone: "mid", crease: "lo" })).join("")
  );
}
export const DESK_LEG_H = DESK.legH;
// Board engraving centre on the desk's front face, right of the engineer so he never hides it.
export const DESK_ENGRAVE_X = 38;

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
const GLASS_Y = HOUSING.y + HOUSING.d + 0.05;

const at = (p: Vec3) => project(p, view);
const frontMatrix = (p: Vec3) => frontMatrixIn(view, p);

export const keyboard = keyboardParts(view, LINE_X, KB_Y);
export const chair = chairParts(view, LINE_X, CHAIR_Y, FLOOR);
export const person = engineerParts(view, LINE_X, HIPS_Y, SEAT, FLOOR, KB_Y);
export const shirtNow = (t: number) => shirtAt(LINE_X, HIPS_Y, SEAT, t);

const screenQuad = (hw: number, hd: number, dy = 0) => {
  const cx = (SCREEN.x0 + SCREEN.x1) / 2;
  const cz = (SCREEN.z0 + SCREEN.z1) / 2;
  return pathD(
    [
      [cx - hw, cz + hd],
      [cx + hw, cz + hd],
      [cx + hw, cz - hd],
      [cx - hw, cz - hd],
    ].map(([x, z]) => at([x, GLASS_Y + dy, z])),
    true,
  );
};
export const monitor = {
  pool: flatCircle(LINE_X, 22, 46, 0.05, view, 48),
  stand: prism(STAND, 0, 1.6, view, 4, 0.4),
  neck: prism(NECK, 1.6, H_Z0 + 6, view, 2, 0.2),
  housing: prism(HOUSING, H_Z0, H_Z1 - H_Z0, view, 2, 0.6),
  glass: screenQuad((SCREEN.x1 - SCREEN.x0) / 2, (SCREEN.z1 - SCREEN.z0) / 2),
};
// Lit area for a CRT-style power state (width, open 0..1): a thin bright line opening to the full glass.
export function monitorLit(width: number, open: number) {
  if (width <= 0.01) return "";
  const hw = Math.max(0.35, ((SCREEN.x1 - SCREEN.x0) / 2 - 0.8) * width);
  const hd = Math.max(0.3, ((SCREEN.z1 - SCREEN.z0) / 2 - 0.8) * open);
  return screenQuad(hw, hd, 0.02);
}

// Bit wall: rows of 32 glyphs on the glass, one text per glyph so the groups can regroup and flip.
// Byte layout: 4 groups of 8, one-character gaps. Nibble layout: 8 groups of 4, 0.75-character gaps.
export const WALL_SIZE = 3.1;
export const HEX_SIZE = WALL_SIZE * 1.45;
const ADV = WALL_SIZE * 0.6;
const PITCH = (SCREEN.z1 - SCREEN.z0 - 3) / WALL_ROWS;
const NIB_GAP = 0.75;
export const bitX = (j: number, regroup: number) => {
  const byte = j + Math.floor(j / 8) - 17;
  const nib = j + Math.floor(j / 4) * NIB_GAP - (31 + 7 * NIB_GAP) / 2;
  return (byte + (nib - byte) * regroup) * ADV;
};
// Hex row: 8 digits in pairs ("B2 0F 4A 9C"), one-character gaps, on the same baseline as the bit row.
export const hexX = (g: number) => (g + Math.floor(g / 2) - 5) * HEX_SIZE * 0.6;
// Row r baseline, scrolled up by `scroll` rows (row SCROLL ends on top).
export const wallRow = (r: number, scroll: number) => frontMatrix([LINE_X, GLASS_Y + 0.05, SCREEN.z1 - 1.5 - PITCH * (r - scroll + 0.5) - WALL_SIZE * 0.36]);
export const GLYPH_MID = -WALL_SIZE * 0.36; // glyph vertical centre in row space (flip axis)

// Thought bubble (view units): scalloped ellipse above the head, three trailing circles rising to its lower left.
const scenePts: Vec3[] = [
  ...rectCorners(DESK.rect).flatMap(([x, y]): Vec3[] => [[x, y, FLOOR], [x, y, 0]]),
  ...rectCorners(HOUSING).map(([x, y]): Vec3 => [x, y, H_Z1]),
  ...rectCorners({ x: LINE_X - 18, y: FRONT - 20, w: 36, d: 50 }).flatMap(([x, y]): Vec3[] => [[x, y, FLOOR], [x, y, SEAT + 68]]),
];
const sp = scenePts.map(at);
const SPAN = Math.max(...sp.map((p) => p[0])) - Math.min(...sp.map((p) => p[0]));
const monTop = Math.min(...rectCorners(HOUSING).map(([x, y]) => at([x, y, H_Z1])[1]));
const B_RX = 0.37 * SPAN;
const B_RY = 0.135 * SPAN;
export const bubble = { cx: person.head.cx + B_RX * 0.38, cy: monTop - 0.05 * SPAN - B_RY, rx: B_RX, ry: B_RY };
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
// Bubble pops from the head end of the trail.
export const BUBBLE_FROM: Vec2 = [trail[0].x, trail[0].y];
// Calm state: "B2" and a small ink tick.
export const calm = {
  text: { x: bubble.cx - 0.12 * bubble.rx, y: bubble.cy + 0.33 * bubble.ry, size: 0.95 * bubble.ry },
  tick: pathD([
    [bubble.cx + 0.42 * bubble.rx, bubble.cy + 0.02 * bubble.ry],
    [bubble.cx + 0.52 * bubble.rx, bubble.cy + 0.24 * bubble.ry],
    [bubble.cx + 0.72 * bubble.rx, bubble.cy - 0.28 * bubble.ry],
  ]),
};

// Landing sparks: monitor stand and keyboard corners on the desk top.
export const deskContacts = [...rectCorners(STAND), ...rectCorners(keyboard.rect)].map(([x, y]) => at([x, y, 0]));

// Desk camera: scale and shift that fit the whole scene, bubble included, inside the safe band (top 15 % and
// bottom 20 % of the frame stay free); applied outside the analogy zoom.
const SAFE = { x0: 8, x1: STAGE_W - 8, y0: -170, y1: 520 };
const DESK_BOX = (() => {
  const pts: Vec2[] = [...sp, [bubble.cx - bubble.rx * 1.08, bubble.cy - bubble.ry * 1.4], [bubble.cx + bubble.rx * 1.08, bubble.cy + bubble.ry]];
  const z = ANALOGY_ZOOM;
  const xs = pts.map(([x]) => x * z.k + z.tx);
  const ys = pts.map(([, y]) => y * z.k + z.ty);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
})();
const CAM_K = Math.min(1, (SAFE.x1 - SAFE.x0) / (DESK_BOX.x1 - DESK_BOX.x0), (SAFE.y1 - SAFE.y0) / (DESK_BOX.y1 - DESK_BOX.y0));
const CAM_T: Vec2 = [(SAFE.x0 + SAFE.x1) / 2 - (CAM_K * (DESK_BOX.x0 + DESK_BOX.x1)) / 2, (SAFE.y0 + SAFE.y1) / 2 - (CAM_K * (DESK_BOX.y0 + DESK_BOX.y1)) / 2];
export const deskCam = (c: number) => {
  if (c <= 0) return "";
  const e = c * c * (3 - 2 * c);
  const k = 1 + (CAM_K - 1) * e;
  return `translate(${(CAM_T[0] * e).toFixed(2)} ${(CAM_T[1] * e).toFixed(2)}) scale(${k.toFixed(4)}) `;
};
// Fall distance (view units) for the desk parts, out of view above.
export const DESK_TRAVEL = 700;
// Sink distance (view units) as the desk parts fade on the fold back.
export const DESK_SINK = 24;
