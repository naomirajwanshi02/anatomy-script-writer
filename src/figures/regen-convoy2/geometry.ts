// Regeneration convoy 2: one board (wide, shallow, always on screen). Analogy: a two-lane road along x with five
// supercars (driving toward -x, car 1 at the left), a flat side-profile dog crossing ahead of car 1 and a roadside sign.
// Circuit (after the road scene leaves): a 1 V rail (back), a wire with five buffer blocks, a 0 V rail (front), upright
// gauges over the gate outputs, a ghost copying wire on the front strip with its own small gauge. The curve card and the
// readout sit in screen space below the board.
import { boxCorners, cylinder, faceMatrix, fitView, flatCircle, flatPath, inset, flatRect, pathD, prism, project, rectCorners, solidSvg, type Rect, type Vec2, type Vec3, type View } from "../../iso/iso-kit";
import { buf, CARS, CIRC, DOG, GATE, GATES, GAUGE, GAUGE_X, GHOST_GAUGE, K, ROAD, SEGS, SIGN } from "./model";

export const STAGE_W = 600;
const AZIMUTH = 62;
const ELEVATION = 30;

const BOARD: Rect = { x: -132, y: -68, w: 264, d: 136, r: 7 };
const SLAB_H = 8;
const FOOT_H = 4;

// Room above the board's back corner for the gauges (they float up to z = 62).
const Y_TOP = 110;
const PTS: Vec3[] = boxCorners(BOARD, -SLAB_H - FOOT_H, 0);
const v0 = fitView(PTS, STAGE_W, 4000, { pad: 6, azimuth: AZIMUTH });
const minY = Math.min(...PTS.map((p) => project(p, v0)[1]));
export const view: View = { ...v0, origin: [v0.origin[0], v0.origin[1] + Y_TOP - minY] };
const BOARD_BOTTOM = Math.max(...PTS.map((p) => project(p, view)[1]));

export const at = (p: Vec3) => project(p, view);
const r3 = (v: number) => Math.round(v * 1e3) / 1e3;
const f2 = (v: number) => v.toFixed(2);

const frontMatrix = (p: Vec3) => {
  const o = at(p);
  const ax = at([p[0] + 1, p[1], p[2]]);
  const az = at([p[0], p[1], p[2] - 1]);
  return `matrix(${r3(ax[0] - o[0])} ${r3(ax[1] - o[1])} ${r3(az[0] - o[0])} ${r3(az[1] - o[1])} ${r3(o[0])} ${r3(o[1])})`;
};
const flatText = (x: number, y: number, size: number, z = 0.06) => faceMatrix([x, y + size * 0.36], z, view, "x");

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

// Screen offset of a board move (dx, dy, dz): used for the folds and for parts falling.
export const shiftBy = (dx: number, dy: number, dz: number) => {
  const a = at([0, 0, 0]);
  const b = at([dx, dy, dz]);
  return `translate(${f2(b[0] - a[0])} ${f2(b[1] - a[1])})`;
};

// ---------- Road ----------

const RY = (p: number) => ROAD.yF - p * (ROAD.yF - ROAD.yB);
const RP = (x: number, p: number, z = 0.05): Vec2 => at([x, RY(p), z]);
const line = (p: number) => pathD([RP(ROAD.x0, p), RP(ROAD.x1, p)]);
export const road = {
  base: pathD([RP(ROAD.x0, 0), RP(ROAD.x1, 0), RP(ROAD.x1, 1), RP(ROAD.x0, 1)], true),
  edges: line(0.05) + line(0.95),
  centre: line(0.5),
  // The lower (front) lane's two lines.
  lowerLines: line(0.05) + line(0.5),
};
export const UNIT_X = Math.hypot(at([1, 0, 0])[0] - at([0, 0, 0])[0], at([1, 0, 0])[1] - at([0, 0, 0])[1]);
export const DASH = 12;
export const GAP = 9;
export const centreDash = `${(DASH * UNIT_X).toFixed(2)} ${(GAP * UNIT_X).toFixed(2)}`;

// ---------- Roadside sign (in-story ROLLIN) ----------

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

const carFrame = (x: number, y: number, yaw: number): Fr => {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  return { o: [x, y, 0.05], a: [-c, -s, 0], b: [s, -c, 0], n: [0, 0, 1], k: K };
};
// One car at board (x, y), driving toward -x, turned by yaw about its centre (negative yaw: nose toward +y).
export const carSvg = (x: number, y: number, yaw: number, num: string) => supercar(carFrame(x, y, yaw), num);
// Screen box round a car (warning outline), padded.
export function carBox(x: number, y: number, yaw: number, pad = 7) {
  const f = carFrame(x, y, yaw);
  const ps: Vec2[] = [];
  for (const A of [-32, 30]) for (const B of [-17, 17]) for (const Nz of [0, 25]) ps.push(at(pt(f, [A, B, Nz])));
  const x0 = Math.min(...ps.map((p) => p[0])) - pad;
  const x1 = Math.max(...ps.map((p) => p[0])) + pad;
  const y0 = Math.min(...ps.map((p) => p[1])) - pad;
  const y1 = Math.max(...ps.map((p) => p[1])) + pad;
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}
// Screen centre of a car (for its pulse).
export const carCentre = (x: number, y: number) => at([x, y, 8 * K]);

// ---------- Dog: a flat 2D side profile in the upright plane of its run (x = DOG.x, running toward -y) ----------

// Local 2D (u forward, w down) maps to board (DOG.x, y - u * su, -w * s): an affine SVG matrix.
export const dogMatrix = (y: number) => {
  const o = at([DOG.x, y, 0.1]);
  const u = at([DOG.x, y - DOG.su, 0.1]);
  const w = at([DOG.x, y, 0.1 - DOG.s]);
  return `matrix(${r3(u[0] - o[0])} ${r3(u[1] - o[1])} ${r3(w[0] - o[0])} ${r3(w[1] - o[1])} ${r3(o[0])} ${r3(o[1])})`;
};
export const dogShadow = (y: number) =>
  pathD(
    Array.from({ length: 32 }, (_, i) => {
      const t = (i / 32) * 2 * Math.PI;
      return at([DOG.x + 4 * DOG.s * Math.sin(t), y - (2 + 14 * Math.cos(t)) * DOG.su, 0.04]);
    }),
    true,
  );
// Legs in the trot: diagonal pairs swing together; hips on the body's underside.
export function dogLegs(phase: number) {
  const L = 5.2;
  const leg = (hx: number, a: number) => `M${f2(hx)} -5.4L${f2(hx + L * Math.sin(a))} ${f2(-5.4 + L * Math.cos(a))}`;
  const s = 0.42 * Math.sin(phase);
  return leg(7.6, s) + leg(6.6, -s) + leg(-7.2, -s) + leg(-8.2, s);
}
// Tail up, wagging about its root.
export function dogTail(phase: number) {
  const a = 0.35 * Math.sin(2 * phase);
  const r = (x: number, y: number) => {
    const dx = x + 10.6;
    const dy = y + 8;
    return `${f2(-10.6 + dx * Math.cos(a) - dy * Math.sin(a))} ${f2(-8 + dx * Math.sin(a) + dy * Math.cos(a))}`;
  };
  return `M-10.6 -8C${r(-12.6, -9.4)} ${r(-13, -12)} ${r(-12, -14.4)}`;
}
export const dogBob = (phase: number) => `translate(0 ${f2(-0.35 * Math.abs(Math.sin(phase)))})`;

// ---------- Circuit ----------

const C = CIRC;
const railRect = (y: number): Rect => ({ x: C.x0, y: y - 2.5, w: C.railX1 - C.x0, d: 5, r: 0.6 });
export const rails = { one: prism(railRect(C.oneY), 0, 2.4, view, 2, 0.3), zero: prism(railRect(C.zeroY), 0, 2.4, view, 2, 0.3) };
export const LABEL_SIZE = 10;
export const railLabels = {
  one: flatText(C.x0 + 1, C.oneY + 8.5, LABEL_SIZE),
  zero: flatText(C.x0 + 1, C.zeroY + 8.5, LABEL_SIZE),
};
const W = C.wireY;
export const segPath = (i: number, pos = 0, amp = 0) => {
  const { x0, x1 } = SEGS[i];
  if (amp <= 0.001) return flatPath([[x0, W], [x1, W]], 0.06, view);
  const px = x0 + (x1 - x0) * pos;
  const pts: Vec2[] = [];
  for (let x = x0; x <= x1 + 0.01; x += 0.75) pts.push(at([x, W, 0.06 + 3.4 * amp * Math.exp(-(((x - px) / 3.2) ** 2))]));
  return pathD(pts);
};
export const segBase = SEGS.map((_, i) => segPath(i));
const strap = (pts: Vec3[]) => pathD(pts.map(at));
const G = GATE;
export const NUM_SIZE = 7;
export const gates = GATES.map((x, i) => {
  const y0 = W - G.d / 2;
  const y1 = W + G.d / 2;
  const z = G.h + 0.06;
  return {
    x,
    body: prism({ x: x - G.w / 2, y: y0, w: G.w, d: G.d, r: 1.5 }, 0, G.h, view, 3, 0.6),
    sym: flatPath([[x - 6, W - 6.5], [x - 6, W + 6.5], [x + 6.5, W]], z, view, true),
    num: String(i + 1),
    numAt: frontMatrix([x, y1 + 0.06, G.h / 2 - NUM_SIZE * 0.36]),
    straps: strap([[x + 4, C.oneY + 2.5, 0.06], [x + 4, y0, 0.06]]) + strap([[x + 4, y1, 0.06], [x + 4, C.zeroY - 2.5, 0.06]]),
  };
});
// Gate 2's rail current: down the strap from the 1 V rail, over the block and out along its output wire.
export const litStrap = (() => {
  const x = GATES[1];
  return strap([
    [x + 4, C.oneY + 2.5, 0.1],
    [x + 4, W - G.d / 2, 0.1],
    [x + 4, W - G.d / 2, G.h + 0.1],
    [x + 4, W - 2, G.h + 0.1],
    [x + G.w / 2, W - 2, G.h + 0.1],
    [x + G.w / 2 + 0.01, W, 0.1],
    [x + G.w / 2 + 12, W, 0.1],
  ]);
})();
export const railGlow = pathD([at([GATES[1] - 14, C.oneY, 2.5]), at([GATES[1] + 22, C.oneY, 2.5])]);
// Gate 2's input valve: a small grey disc on the block's input face where the wire ends.
export const valve = cylinder(GATES[1] - G.w / 2 - 1.6, W, 2.6, 0, 4.4, view, 18, 0.3);

// Gauges: upright panels facing the viewer on a thin post over segments 1-5. Face: "0" band (0-0.25 V) at the bottom,
// "1" band (0.75-1 V) at the top, 0.5 ticks at the sides.
const GY = GAUGE.y;
const fz = (z0: number, z1: number, v: number) => z0 + 1.2 + (z1 - z0 - 2.4) * v;
const gaugeFace = (x: number, y: number, w: number, z0: number, z1: number) => {
  const hw = w / 2;
  const m = w * 0.08;
  const fp = (xx: number, v: number, dy = 0.08): Vec2 => at([xx, y + 1 + dy, fz(z0, z1, v)]);
  const fquad = (v0: number, v1: number) => pathD([fp(x - hw + m, v0), fp(x + hw - m, v0), fp(x + hw - m, v1), fp(x - hw + m, v1)], true);
  return { hw, m, fp, fquad };
};
export const DIGIT = 7.5;
export const gauges = GAUGE_X.map((x) => {
  const { hw, m, fp, fquad } = gaugeFace(x, GY, GAUGE.w, GAUGE.z0, GAUGE.z1);
  return {
    x,
    panel: prism({ x: x - hw, y: GY - 1, w: GAUGE.w, d: 2, r: 0.4 }, GAUGE.z0, GAUGE.z1 - GAUGE.z0, view, 2, 0.3),
    post: cylinder(x, GY, 0.9, G.h + 0.5, GAUGE.z0 - G.h - 0.5, view, 12),
    band1: fquad(0.75, 1),
    band0: fquad(0, 0.25),
    half: pathD([fp(x - hw + m, 0.5, 0.12), fp(x - hw + m + 5, 0.5, 0.12)]) + pathD([fp(x + hw - m - 5, 0.5, 0.12), fp(x + hw - m, 0.5, 0.12)]),
    one: frontMatrix([x - hw + m + 3.6, GY + 1.2, fz(GAUGE.z0, GAUGE.z1, 0.875) - DIGIT * 0.36]),
    zero: frontMatrix([x - hw + m + 3.6, GY + 1.2, fz(GAUGE.z0, GAUGE.z1, 0.125) - DIGIT * 0.36]),
  };
});
// Marker on a gauge face at level v: a bar across the face with a pointer on the right.
const markerOn = (x: number, y: number, w: number, z0: number, z1: number, v: number) => {
  const { hw, m, fp } = gaugeFace(x, y, w, z0, z1);
  const a = fp(x - hw + m + w * 0.3, v, 0.16);
  const b = fp(x + hw - m, v, 0.16);
  const t = fp(x + hw + w * 0.1, v + 0.08, 0.16);
  const u = fp(x + hw + w * 0.1, v - 0.08, 0.16);
  return `M${f2(a[0])} ${f2(a[1])}L${f2(b[0])} ${f2(b[1])}M${f2(b[0])} ${f2(b[1])}L${f2(t[0])} ${f2(t[1])}L${f2(u[0])} ${f2(u[1])}Z`;
};
export const markerPath = (i: number, v: number) => markerOn(GAUGE_X[i], GY, GAUGE.w, GAUGE.z0, GAUGE.z1, v);

// Ghost copying wire on the front strip: dashed wire, plain dashed copier blocks, a small gauge at its end.
const GW = C.ghostY;
export const ghost = {
  wire: flatPath([[C.x0, GW], [GHOST_GAUGE.x - 4, GW]], 0.06, view),
  blocks: GATES.map((x) => prism({ x: x - 6, y: GW - 5, w: 12, d: 10, r: 1 }, 0, 5, view, 2, 0.3)),
};
const GG = GHOST_GAUGE;
export const ghostGauge = (() => {
  const { hw, m, fp, fquad } = gaugeFace(GG.x, GG.y, GG.w, GG.z0, GG.z1);
  return {
    panel: prism({ x: GG.x - hw, y: GG.y - 1, w: GG.w, d: 2, r: 0.4 }, GG.z0, GG.z1 - GG.z0, view, 2, 0.3),
    band1: fquad(0.75, 1),
    band0: fquad(0, 0.25),
    half: pathD([fp(GG.x - hw + m, 0.5, 0.12), fp(GG.x + hw - m, 0.5, 0.12)]),
  };
})();
export const ghostMarker = (v: number) => markerOn(GG.x, GG.y, GG.w, GG.z0, GG.z1, v);

// ---------- Curve card and readout (screen space, below the board, under gate 2) ----------

const CARD_W = 236;
const CARD_H = 200;
const g2x = at([GATES[1], W + G.d / 2, 0])[0];
const CARD_X = Math.round(Math.max(16, g2x - CARD_W / 2));
const CARD_Y = Math.round(BOARD_BOTTOM + 18);
export const CARD = { x: CARD_X, y: CARD_Y, w: CARD_W, h: CARD_H };
export const STAGE_H = CARD_Y + CARD_H + 12;
const PX0 = 50;
const PX1 = 206;
const PY0 = 18;
const PY1 = 160;
export const cx = (v: number) => CARD.x + PX0 + (PX1 - PX0) * v;
export const cy = (v: number) => CARD.y + PY1 - (PY1 - PY0) * v;
const curvePts = (a: number, b: number) => Array.from({ length: 61 }, (_, i) => a + ((b - a) * i) / 60).map((v) => [cx(v), cy(buf(v))] as Vec2);
export const curve = {
  path: pathD(curvePts(0, 1)),
  steep: pathD(curvePts(0.394, 0.606)),
  flatTop: pathD(curvePts(0.606, 1)),
  axes: pathD([[cx(0), cy(1) - 6], [cx(0), cy(0)], [cx(1) + 6, cy(0)]]),
  ticks: pathD([[cx(0.5), cy(0)], [cx(0.5), cy(0) + 5]]) + pathD([[cx(1), cy(0)], [cx(1), cy(0) + 5]]) + pathD([[cx(0), cy(1)], [cx(0) - 5, cy(1)]]) + pathD([[cx(0), cy(0.5)], [cx(0) - 5, cy(0.5)]]),
  half: pathD([[cx(0.5), cy(0)], [cx(0.5), cy(1)]]),
};
export function arrowD(x0: number, y0: number, x1: number, y1: number, g: number, head = 8) {
  if (g <= 0.001) return "";
  const ex = x0 + (x1 - x0) * g;
  const ey = y0 + (y1 - y0) * g;
  const l = Math.hypot(ex - x0, ey - y0) || 1;
  const ux = (ex - x0) / l;
  const uy = (ey - y0) / l;
  const h = Math.min(head, l * 0.6);
  return `M${f2(x0)} ${f2(y0)}L${f2(ex)} ${f2(ey)}M${f2(ex - ux * h - uy * h * 0.7)} ${f2(ey - uy * h + ux * h * 0.7)}L${f2(ex)} ${f2(ey)}L${f2(ex - ux * h + uy * h * 0.7)} ${f2(ey - uy * h - ux * h * 0.7)}`;
}
export const READOUT = { x: CARD_X + CARD_W / 2, y: CARD_Y + 20, w: 190, h: 84 };

// Entrance spark points: car 1's and car 5's tyres in the upper lane.
export const contacts: Vec2[] = [CARS[0], CARS[4]].flatMap((c) => [-18.5, 18.5].flatMap((A) => [-12.5, 12.5].map((B) => at([c.x - A * K, -26 - B * K, 0]))));
