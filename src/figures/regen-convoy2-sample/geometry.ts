// Regeneration convoy, still sample: one board (wide, shallow) with a two-lane road along x, five supercars in the
// upper lane, a flat side-profile dog crossing ahead of car 1, and a roadside sign on the front verge.
import { boxCorners, cylinder, fitView, flatCircle, inset, flatRect, pathD, prism, project, rectCorners, solidSvg, type Rect, type Vec2, type Vec3, type View } from "../../iso/iso-kit";
import { CARS, DOG, K, ROAD, SIGN } from "./model";

export const STAGE_W = 600;
const AZIMUTH = 62;
const ELEVATION = 30;

// Board: long along x (the road), shallow in y, so the cars read large at 95 % of the frame width.
const BOARD: Rect = { x: -132, y: -68, w: 264, d: 136, r: 7 };
const SLAB_H = 8;
const FOOT_H = 4;

// Room above the board's back corner for the cars' height.
const Y_TOP = 70;
const PTS: Vec3[] = boxCorners(BOARD, -SLAB_H - FOOT_H, 0);
const v0 = fitView(PTS, STAGE_W, 4000, { pad: 6, azimuth: AZIMUTH });
const minY = Math.min(...PTS.map((p) => project(p, v0)[1]));
export const view: View = { ...v0, origin: [v0.origin[0], v0.origin[1] + Y_TOP - minY] };
export const STAGE_H = Math.ceil(Math.max(...PTS.map((p) => project(p, view)[1])) + 40);

export const at = (p: Vec3) => project(p, view);
const r3 = (v: number) => Math.round(v * 1e3) / 1e3;

// Text on a front face (+y), reading along +x, upright along +z.
const frontMatrix = (p: Vec3) => {
  const o = at(p);
  const ax = at([p[0] + 1, p[1], p[2]]);
  const az = at([p[0], p[1], p[2] - 1]);
  return `matrix(${r3(ax[0] - o[0])} ${r3(ax[1] - o[1])} ${r3(az[0] - o[0])} ${r3(az[1] - o[1])} ${r3(o[0])} ${r3(o[1])})`;
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
  return (
    `<path class="iso-halo" d="${prism(b, -SLAB_H - FOOT_H, SLAB_H, view).fill}"/>` +
    feet +
    solidSvg(prism(b, -SLAB_H, SLAB_H, view, 6, 1.2), { tone: "mid" }) +
    `<path class="iso-line" data-tone="lo" d="${flatRect(inset(b, 3.5), 0, view)}"/>` +
    `<path class="iso-line" data-tone="lo" d="${rings}"/>`
  );
})();

// ---------- Road ----------

const RY = (p: number) => ROAD.yF - p * (ROAD.yF - ROAD.yB);
const RP = (x: number, p: number, z = 0.05): Vec2 => at([x, RY(p), z]);
const line = (p: number) => pathD([RP(ROAD.x0, p), RP(ROAD.x1, p)]);
export const road = {
  base: pathD([RP(ROAD.x0, 0), RP(ROAD.x1, 0), RP(ROAD.x1, 1), RP(ROAD.x0, 1)], true),
  edges: line(0.05) + line(0.95),
  centre: line(0.5),
};
// Screen length of one board unit along x: the centre dashes are 12 units on, 9 off.
const UNIT_X = Math.hypot(at([1, 0, 0])[0] - at([0, 0, 0])[0], at([1, 0, 0])[1] - at([0, 0, 0])[1]);
export const centreDash = `${(12 * UNIT_X).toFixed(2)} ${(9 * UNIT_X).toFixed(2)}`;

// ---------- Roadside sign (in-story ROLLIN), facing the viewer ----------

const SIGN_W = 34;
const SIGN_Z0 = 9;
const SIGN_H = 12;
export const SIGN_SIZE = 7;
export const sign = {
  posts: [-12, 12].map((dx) => cylinder(SIGN.x + dx, SIGN.y, 1, 0, SIGN_Z0, view, 12)),
  plate: prism({ x: SIGN.x - SIGN_W / 2, y: SIGN.y - 1, w: SIGN_W, d: 2, r: 0.5 }, SIGN_Z0, SIGN_H, view, 2, 0.3),
  textAt: frontMatrix([SIGN.x, SIGN.y + 1.08, SIGN_Z0 + SIGN_H / 2 - SIGN_SIZE * 0.36]),
};

// ---------- Cars (box meshes, built once) ----------

const add = (a: Vec3, b: Vec3, k = 1): Vec3 => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const unit = (a: Vec3): Vec3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const CAM: Vec3 = (() => {
  const A = (AZIMUTH * Math.PI) / 180;
  const E = (ELEVATION * Math.PI) / 180;
  return [Math.cos(A) * Math.cos(E), Math.sin(A) * Math.cos(E), Math.sin(E)];
})();

// A car frame: o = ground centre, a = forward, b = across (+b toward the back edge when straight), n = up, k = scale.
type Fr = { o: Vec3; a: Vec3; b: Vec3; n: Vec3; k: number };
type L3 = [number, number, number];
const pt = (f: Fr, [A, B, N]: L3): Vec3 => add(add(add(f.o, f.a, A * f.k), f.b, B * f.k), f.n, N * f.k);
const neg = (a: Vec3): Vec3 => [-a[0], -a[1], -a[2]];
function face(f: Fr, pts: L3[], normal: Vec3, cls: string) {
  if (dot(normal, CAM) <= 1e-3) return "";
  return `<path class="${cls}" d="${pathD(
    pts.map((p) => at(pt(f, p))),
    true,
  )}"/>`;
}
function box(f: Fr, [a0, a1]: [number, number], [b0, b1]: [number, number], [n0, n1]: [number, number], cls: string) {
  return (
    face(f, [[a0, b0, n0], [a0, b1, n0], [a0, b1, n1], [a0, b0, n1]], neg(f.a), `${cls} f-e`) +
    face(f, [[a1, b0, n0], [a1, b1, n0], [a1, b1, n1], [a1, b0, n1]], f.a, `${cls} f-e`) +
    face(f, [[a0, b0, n0], [a1, b0, n0], [a1, b0, n1], [a0, b0, n1]], neg(f.b), `${cls} f-s`) +
    face(f, [[a0, b1, n0], [a1, b1, n0], [a1, b1, n1], [a0, b1, n1]], f.b, `${cls} f-s`) +
    face(f, [[a0, b0, n0], [a1, b0, n0], [a1, b1, n0], [a0, b1, n0]], neg(f.n), `${cls} f-t`) +
    face(f, [[a0, b0, n1], [a1, b0, n1], [a1, b1, n1], [a0, b1, n1]], f.n, `${cls} f-t`)
  );
}
// Convex solid from faces (normals found from the points, pointing away from the solid's centre).
function convex(f: Fr, faces: L3[][], cls: (i: number) => string) {
  const all = faces.flat();
  const c: Vec3 = pt(f, [all.reduce((s, p) => s + p[0], 0) / all.length, all.reduce((s, p) => s + p[1], 0) / all.length, all.reduce((s, p) => s + p[2], 0) / all.length]);
  return faces
    .map((fc, i) => {
      const P = fc.map((p) => pt(f, p));
      let nrm: Vec3 = [0, 0, 0];
      for (let j = 0; j < P.length; j++) {
        const a = P[j];
        const b = P[(j + 1) % P.length];
        nrm = add(nrm, [(a[1] - b[1]) * (a[2] + b[2]), (a[2] - b[2]) * (a[0] + b[0]), (a[0] - b[0]) * (a[1] + b[1])]);
      }
      const mid = P.reduce((s, p) => add(s, p, 1 / P.length), [0, 0, 0] as Vec3);
      if (dot(nrm, sub(mid, c)) < 0) nrm = neg(nrm);
      return face(f, fc, unit(nrm), cls(i));
    })
    .join("");
}
const WR = 6.27;
function tyre(f: Fr, ac: number, b0: number, b1: number, seg = 14) {
  const ring = (b: number, r: number): L3[] => Array.from({ length: seg }, (_, i) => [ac + r * Math.cos((i / seg) * 2 * Math.PI), b, WR + r * Math.sin((i / seg) * 2 * Math.PI)] as L3);
  let out = "";
  for (let i = 0; i < seg; i++) {
    const t0 = (i / seg) * 2 * Math.PI;
    const t1 = ((i + 1) / seg) * 2 * Math.PI;
    const tm = (t0 + t1) / 2;
    const nrm = unit(add(add([0, 0, 0], f.a, Math.cos(tm)), f.n, Math.sin(tm)));
    const q = (t: number, b: number): L3 => [ac + WR * Math.cos(t), b, WR + WR * Math.sin(t)];
    out += face(f, [q(t0, b0), q(t1, b0), q(t1, b1), q(t0, b1)], nrm, "car-tyre");
  }
  const outer = Math.abs(b1) > Math.abs(b0) ? b1 : b0;
  const inner = outer === b1 ? b0 : b1;
  const outN = outer > 0 ? f.b : neg(f.b);
  out += face(f, ring(inner, WR), neg(outN), "car-tyre") + face(f, ring(outer, WR), outN, "car-tyre");
  out += face(f, ring(outer + Math.sign(outer) * 0.05, WR * 0.45), outN, "car-hub");
  return out;
}
// Text on a car surface: centre c, reading direction r and glyph-down direction d (local), size in local units.
function carText(f: Fr, c: L3, r: L3, d: L3, size: number, text: string, cls: string) {
  const C = pt(f, c);
  const o3 = add(C, sub(pt(f, [c[0] + d[0], c[1] + d[1], c[2] + d[2]]), C), size * 0.36);
  const o = at(o3);
  const ax = at(add(o3, sub(pt(f, [c[0] + r[0], c[1] + r[1], c[2] + r[2]]), C)));
  const ay = at(add(o3, sub(pt(f, [c[0] + d[0], c[1] + d[1], c[2] + d[2]]), C)));
  return `<text class="${cls}" font-size="${size}" text-anchor="middle" transform="matrix(${r3(ax[0] - o[0])} ${r3(ax[1] - o[1])} ${r3(ay[0] - o[0])} ${r3(ay[1] - o[1])} ${r3(o[0])} ${r3(o[1])})">${text}</text>`;
}
const shadowOf = (f: Fr, ra: number, rb: number) =>
  `<path class="car-shadow" d="${pathD(
    Array.from({ length: 36 }, (_, i) => {
      const t = (i / 36) * 2 * Math.PI;
      return at(pt(f, [Math.cos(t) * ra, Math.sin(t) * rb, 0.03]));
    }),
    true,
  )}"/>`;

// Supercar: low wedge body, nose at +a, cabin (body-colour roof, dark glass), rear spoiler on two posts, dark wheels;
// the number large on the roof and in a racing roundel on the side facing the viewer (-b).
const shade = (i: number) => (i < 2 ? "f-t" : i < 4 ? "f-s" : "f-e");
function supercar(f: Fr, num: string) {
  const top = (a: number) => 17 + ((9 - 17) * (a + 29)) / 58;
  const W = 15.5;
  const B0 = 4.5;
  const wedge: L3[][] = [
    [[-29, -W, top(-29)], [29, -W, top(29)], [29, W, top(29)], [-29, W, top(-29)]],
    [[-29, -W, B0], [-29, W, B0], [29, W, B0], [29, -W, B0]],
    [[-29, -W, B0], [29, -W, B0], [29, -W, top(29)], [-29, -W, top(-29)]],
    [[-29, W, B0], [-29, W, top(-29)], [29, W, top(29)], [29, W, B0]],
    [[-29, -W, B0], [-29, -W, top(-29)], [-29, W, top(-29)], [-29, W, B0]],
    [[29, -W, B0], [29, W, B0], [29, W, top(29)], [29, -W, top(29)]],
  ];
  const RZ0 = 23;
  const RZ1 = 22;
  const canopy: L3[][] = [
    [[-10, -8.5, RZ0], [4, -8.5, RZ1], [4, 8.5, RZ1], [-10, 8.5, RZ0]],
    [[-15, -11, top(-15)], [-15, 11, top(-15)], [11, 11, top(11)], [11, -11, top(11)]],
    [[-15, -11, top(-15)], [11, -11, top(11)], [4, -8.5, RZ1], [-10, -8.5, RZ0]],
    [[-15, 11, top(-15)], [-10, 8.5, RZ0], [4, 8.5, RZ1], [11, 11, top(11)]],
    [[-15, -11, top(-15)], [-10, -8.5, RZ0], [-10, 8.5, RZ0], [-15, 11, top(-15)]],
    [[11, -11, top(11)], [11, 11, top(11)], [4, 8.5, RZ1], [4, -8.5, RZ1]],
  ];
  const tyres = [-18.5, 18.5].map((ac) => tyre(f, ac, -8.5, -16.5) + tyre(f, ac, 8.5, 16.5)).join("");
  const posts = [-9, 9].map((b) => box(f, [-26, -23.5], [b - 1, b + 1], [top(-24), 22.6], "car-body")).join("");
  const wing = box(f, [-29.5, -24], [-16, 16], [22.4, 24], "car-body");
  // Roundel on the viewer-side flank, between the wheels.
  const S = -W - 0.08;
  const RA = 1;
  const RN = 10.2;
  const RR = 4.1;
  const roundel = face(
    f,
    Array.from({ length: 28 }, (_, i) => {
      const t = (i / 28) * 2 * Math.PI;
      return [RA + RR * Math.cos(t), S, RN + RR * Math.sin(t)] as L3;
    }),
    neg(f.b),
    "car-roundel",
  );
  const R = -29.05;
  const rear = (b0: number, b1: number, n0: number, n1: number, cls: string) => face(f, [[R, b0, n0], [R, b1, n0], [R, b1, n1], [R, b0, n1]], neg(f.a), cls);
  return (
    shadowOf(f, 31, 19) +
    tyres +
    convex(f, wedge, (i) => `car-body ${shade(i)}`) +
    convex(f, canopy, (i) => (i === 0 ? "car-body f-t" : `car-glass ${shade(i)}`)) +
    posts +
    wing +
    rear(-14, -10.5, 11.5, 14, "car-tail") +
    rear(10.5, 14, 11.5, 14, "car-tail") +
    roundel +
    carText(f, [RA, S - 0.02, RN], [-1, 0, 0], [0, 0, -1], 6.4, num, "car-rnum") +
    carText(f, [-3, 0, (RZ0 + RZ1) / 2 + 0.1], [-1, 0, 0], [0, -1, 0], 14, num, "car-num")
  );
}

// One car at board (x, y), driving toward -x, turned by yaw about its centre (negative yaw: nose toward +y).
function carSvg(x: number, y: number, yaw: number, num: string) {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  const f: Fr = { o: [x, y, 0.05], a: [-c, -s, 0], b: [s, -c, 0], n: [0, 0, 1], k: K };
  return supercar(f, num);
}
export const cars = CARS.map((c) => ({ id: c.id, svg: carSvg(c.x, c.y, c.yaw, c.num) }));

// ---------- Dog: a flat 2D side profile in the upright plane of its run (x = DOG.x, running toward -y) ----------

// Local 2D (u forward, w down) maps to board (DOG.x, DOG.y - u * su, -w * s): an affine SVG matrix.
export const dogMatrix = (() => {
  const o = at([DOG.x, DOG.y, 0.1]);
  const u = at([DOG.x, DOG.y - DOG.su, 0.1]);
  const w = at([DOG.x, DOG.y, 0.1 - DOG.s]);
  return `matrix(${r3(u[0] - o[0])} ${r3(u[1] - o[1])} ${r3(w[0] - o[0])} ${r3(w[1] - o[1])} ${r3(o[0])} ${r3(o[1])})`;
})();
// Soft ground shadow under the dog (on the board plane).
export const dogShadow = pathD(
  Array.from({ length: 32 }, (_, i) => {
    const t = (i / 32) * 2 * Math.PI;
    return at([DOG.x + 4 * DOG.s * Math.sin(t), DOG.y - (2 + 14 * Math.cos(t)) * DOG.su, 0.04]);
  }),
  true,
);

// Entrance spark points: car 1's and car 5's tyres on the road.
export const contacts: Vec2[] = [CARS[0], CARS[4]].flatMap((c) => {
  const co = Math.cos(c.yaw);
  const si = Math.sin(c.yaw);
  return [-18.5, 18.5].flatMap((A) => [-12.5, 12.5].map((B) => at([c.x + (-co * A + si * B) * K, c.y + (-si * A - co * B) * K, 0])));
});
