// Regeneration convoy: one board (always on screen). Analogy: a two-lane road running left to right along x with rust
// cars 1, 2, dots, 20 (a supercar) in a lane, driving toward -x (car 1 leads at the left, a lane change runs left to
// right). Circuit: the road slides away; one wire runs left to right between a VDD rail (back) and a GND rail (front),
// with car 1's pair of inverter blocks, a dotted gap and car 20's pair on it; each block has a PMOS valve strapped to
// VDD and an NMOS valve strapped to GND; upright 0-1 V gauges float above the wire segments that matter.
// The curve card (screen space) sits below the board's front-left; paper beside it and above the board stays free.
import { boxCorners, cylinder, faceMatrix, fitView, flatCircle, flatPath, inset, flatRect, pathD, prism, project, rectCorners, solidSvg, type Rect, type Vec2, type Vec3, type View } from "../../iso/iso-kit";
import { BLK, BLOCKS, CARS, CIRC, GAP, GAUGE_Y, GAUGES, GHOST_ROW, K_A, NEIGHBOUR, ROAD, SEGS, gate, ghostRowY, yOfP, yOfV } from "./model";

export const STAGE_W = 600;
export const STAGE_H = 1100;
const AZIMUTH = 62;
const ELEVATION = 30;

// Board.
const BOARD: Rect = { x: -110, y: -112, w: 220, d: 222, r: 7 };
const SLAB_H = 8;
const FOOT_H = 4;

// The stage is taller than the board: the board's back-left corner sits at stage y 392 (frame y about 690) so the
// paper above it (frame 300-600) stays free for notes.
const Y_TOP = 348;
const PTS: Vec3[] = boxCorners(BOARD, -SLAB_H - FOOT_H, 0);
const v0 = fitView(PTS, STAGE_W, 4000, { pad: 6, azimuth: AZIMUTH });
const minY = Math.min(...PTS.map((p) => project(p, v0)[1]));
export const view: View = { ...v0, origin: [v0.origin[0], v0.origin[1] + Y_TOP - minY] };

export const at = (p: Vec3) => project(p, view);
const r3 = (v: number) => Math.round(v * 1e3) / 1e3;
const f2 = (v: number) => v.toFixed(2);

// Text on a front face (+y), reading along +x, upright along +z.
const frontMatrix = (p: Vec3) => {
  const o = at(p);
  const ax = at([p[0] + 1, p[1], p[2]]);
  const az = at([p[0], p[1], p[2] - 1]);
  return `matrix(${r3(ax[0] - o[0])} ${r3(ax[1] - o[1])} ${r3(az[0] - o[0])} ${r3(az[1] - o[1])} ${r3(o[0])} ${r3(o[1])})`;
};
// Text lying flat on the board, reading along +x, vertically centred on y.
const flatText = (x: number, y: number, size: number, z = 0.06) => faceMatrix([x, y + size * 0.36], z, view, "x");

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

const RP = (x: number, p: number, z = 0.05): Vec2 => at([x, yOfP(p), z]);
const quad = (p0: number, p1: number) => pathD([RP(ROAD.x0, p0), RP(ROAD.x1, p0), RP(ROAD.x1, p1), RP(ROAD.x0, p1)], true);
const line = (p: number, x0 = ROAD.x0, x1 = ROAD.x1) => pathD([RP(x0, p), RP(x1, p)]);
export const road = {
  base: quad(0, 1),
  laneTop: quad(0.5, 1),
  laneBot: quad(0, 0.5),
  edges: line(0.03) + line(0.97),
  centre: line(0.5),
  lines: line(0.03) + line(0.97) + line(0.5),
};
// Screen length of one board unit along x (the dashes of the centre line scroll in these units).
export const UNIT_X = Math.hypot(at([1, 0, 0])[0] - at([0, 0, 0])[0], at([1, 0, 0])[1] - at([0, 0, 0])[1]);

// ---------- Circuit: rails, wire, inverter blocks, gauges ----------

const C = CIRC;
const railRect = (y: number): Rect => ({ x: C.x0, y: y - 2, w: C.x1 - C.x0, d: 4, r: 0.6 });
export const rails = { vdd: prism(railRect(C.vddY), 0, 2, view, 2, 0.3), gnd: prism(railRect(C.gndY), 0, 2, view, 2, 0.3) };
export const railGlow = pathD([at([C.x0, C.vddY, 2.05]), at([C.x1, C.vddY, 2.05])]) + pathD([at([C.x0, C.gndY, 2.05]), at([C.x1, C.gndY, 2.05])]);
export const LABEL_SIZE = 8;
// VDD and GND engraved in front of their rails at the left end.
export const labels = {
  vdd: flatText(C.x0, C.vddY + 7, LABEL_SIZE),
  gnd: flatText(C.x0, C.gndY + 7, LABEL_SIZE),
};

// The wire: a thin neutral base trace end to end (dotted through the gap) and one flow overlay per segment.
const W = C.wireY;
export const wireBase = flatPath([[C.x0, W], [GAP.x0, W]], 0.06, view) + flatPath([[GAP.x1, W], [C.x1, W]], 0.06, view);
export const gapLine = flatPath([[GAP.x0, W], [GAP.x1, W]], 0.06, view);
export const gapDots = GAP.dots.map((x) => flatCircle(x, W, 1.3, 0.08, view, 14)).join("");
export const segPaths = SEGS.map((sg) => flatPath([[sg.x0, W], [sg.x1, W]], 0.06, view));
// Car 1's input with a travelling ripple (the neighbour's bump): a hump of height h (board units) at x.
export function inputPath(x: number, h: number) {
  const sg = SEGS[0];
  const pts: Vec2[] = [];
  for (let xx = sg.x0; xx <= sg.x1 + 0.01; xx += 1) pts.push(at([xx, W, 0.06 + h * Math.exp(-(((xx - x) / 4) ** 2))]));
  return pathD(pts);
}
export function neighbourBump(x: number, h: number) {
  const pts: Vec2[] = [];
  for (let xx = NEIGHBOUR.x0; xx <= NEIGHBOUR.x1 + 0.01; xx += 1) pts.push(at([xx, NEIGHBOUR.y, 0.06 + h * Math.exp(-(((xx - x) / 4) ** 2))]));
  return pathD(pts);
}
export const neighbourPath = neighbourBump(0, 0);

// Inverter blocks on the wire: body with a big triangle-and-bubble on top and the car number on its front face; a PMOS
// valve behind (strap to VDD), an NMOS valve in front (strap to GND). Every size scales with the block's s.
const strap = (pts: Vec3[]) => pathD(pts.map(at));
const blockGeo = (x: number, s: number) => {
  const h = BLK.h * s;
  const vh = 4 * s;
  const y0 = W - BLK.half * s;
  const y1 = W + BLK.half * s;
  const py: [number, number] = [W + BLK.p[0] * s, W + BLK.p[1] * s];
  const ny: [number, number] = [W + BLK.n[0] * s, W + BLK.n[1] * s];
  const valve = ([a, b]: [number, number]) => ({
    body: prism({ x: x - (BLK.valveW / 2) * s, y: a, w: BLK.valveW * s, d: b - a, r: 0.8 }, 0, vh, view, 2, 0.3),
    gate: prism({ x: x - 12 * s, y: (a + b) / 2 - 2 * s, w: 24 * s, d: 4 * s, r: 0.5 }, vh, 1.6 * s, view, 2, 0.3),
  });
  const z = h + 0.06;
  return {
    h,
    vh,
    y0,
    y1,
    py,
    ny,
    body: prism({ x: x - (BLK.w / 2) * s, y: y0, w: BLK.w * s, d: y1 - y0, r: 1.5 * s }, 0, h, view, 3, 0.6),
    sym: flatPath([[x - 9 * s, W - 11 * s], [x - 9 * s, W + 11 * s], [x + 6.5 * s, W]], z, view, true) + flatCircle(x + 9.5 * s, W, 2.8 * s, z, view, 18),
    pmos: valve(py),
    nmos: valve(ny),
    straps:
      strap([[x, C.vddY + 2, 0.06], [x, py[0], 0.06]]) +
      strap([[x, py[1], 0.06], [x, y0, 0.06]]) +
      strap([[x, y1, 0.06], [x, ny[0], 0.06]]) +
      strap([[x, ny[1], 0.06], [x, C.gndY - 2, 0.06]]),
  };
};
export const blocks = BLOCKS.map((b) => {
  const g = blockGeo(b.x, b.s);
  const size = 10 * b.s;
  return { id: b.id, num: b.num, numSize: size, numAt: frontMatrix([b.x, g.y1 + 0.06, g.h / 2 - size * 0.36]), ...g };
});
// Car 1's second block (b1): the PMOS strap from the VDD rail down through its valve, over the block and into "out".
export const litStrap = (() => {
  const b = BLOCKS[1];
  const g = blockGeo(b.x, b.s);
  const xr = b.x + (BLK.w / 2) * b.s;
  return strap([
    [b.x, C.vddY + 2, 0.1],
    [b.x, g.py[0], 0.1],
    [b.x, g.py[0], g.vh + 0.1],
    [b.x, g.py[1], g.vh + 0.1],
    [b.x, g.y0, g.h],
    [xr, W, g.h],
    [xr + 0.01, W, 0.1],
    [GAUGES[2].x, W, 0.1],
  ]);
})();
// Drop and hop: screen offset of a lift in z.
export const liftBy = (h: number) => {
  const a = at([0, 0, 0]);
  const b = at([0, 0, h]);
  return `translate(${f2(b[0] - a[0])} ${f2(b[1] - a[1])})`;
};

// Gauges: an upright panel facing the viewer on a thin post, floating above its wire segment. The face has a label
// strip at the bottom, then the 0 band and the 1 band; v runs 0..1 up the bands.
const GY = GAUGE_Y;
const gaugeGeo = (i: number) => {
  const g = GAUGES[i];
  const hw = g.w / 2;
  const lab = (g.z1 - g.z0) * 0.2;
  const fz = (v: number) => g.z0 + lab + 1 + (g.z1 - g.z0 - lab - 2) * v;
  const fp = (x: number, v: number, dy = 0.08): Vec2 => at([x, GY + 1 + dy, fz(v)]);
  const fquad = (x0: number, x1: number, v0: number, v1: number) => pathD([fp(x0, v0), fp(x1, v0), fp(x1, v1), fp(x0, v1)], true);
  const m = g.w * 0.06;
  return { g, hw, lab, fz, fp, fquad, m };
};
export const gauges = GAUGES.map((g, i) => {
  const { hw, lab, fz, fp, fquad, m } = gaugeGeo(i);
  const digit = g.w * 0.22;
  const labelSize = g.w * (g.label.length > 3 ? 0.17 : 0.22);
  return {
    panel: prism({ x: g.x - hw, y: GY - 1, w: g.w, d: 2, r: 0.4 }, g.z0, g.z1 - g.z0, view, 2, 0.3),
    post: cylinder(g.x, GY, 0.9, 0, g.z0, view, 12),
    band1: fquad(g.x - hw + m, g.x + hw - m, 0.5, 1),
    band0: fquad(g.x - hw + m, g.x + hw - m, 0, 0.5),
    half: pathD([fp(g.x - hw + m, 0.5, 0.12), fp(g.x + hw - m, 0.5, 0.12)]),
    laneLines: pathD([fp(g.x - hw + 2 * m, 0.75, 0.12), fp(g.x + hw - 2 * m, 0.75, 0.12)]) + pathD([fp(g.x - hw + 2 * m, 0.25, 0.12), fp(g.x + hw - 2 * m, 0.25, 0.12)]),
    digit,
    one: frontMatrix([g.x - hw + m + digit * 0.45, GY + 1.2, fz(0.75) - digit * 0.36]),
    zero: frontMatrix([g.x - hw + m + digit * 0.45, GY + 1.2, fz(0.25) - digit * 0.36]),
    label: g.label,
    labelSize,
    labelAt: frontMatrix([g.x, GY + 1.2, g.z0 + lab / 2 + 0.5 - labelSize * 0.36]),
  };
});
// Bold rust marker on a gauge face at voltage v: a bar across the bands with a pointer sticking out on the right.
export function markerPath(i: number, v: number) {
  const { g, hw, fp, m } = gaugeGeo(i);
  const a = fp(g.x - hw + m + g.w * 0.3, v, 0.16);
  const b = fp(g.x + hw - m, v, 0.16);
  const t = fp(g.x + hw + g.w * 0.08, v + 0.07, 0.16);
  const u = fp(g.x + hw + g.w * 0.08, v - 0.07, 0.16);
  return `M${f2(a[0])} ${f2(a[1])}L${f2(b[0])} ${f2(b[1])}M${f2(b[0])} ${f2(b[1])}L${f2(t[0])} ${f2(t[1])}L${f2(u[0])} ${f2(u[1])}Z`;
}
// Gauges rise from a little lower as they appear.
export const gaugeRise = (u: number) => liftBy(-14 * (1 - u));
// Readout anchor: over the gauge's label strip, so each value sits on its own gauge.
export const readoutAt = (i: number) => {
  const g = GAUGES[i];
  return at([g.x, GY + 1.4, g.z0 + (g.z1 - g.z0) * 0.1]);
};

// ---------- Ghost copying row (in front of the road) ----------

export const ghostRow = {
  blocks: GHOST_ROW.xs.map((x) => prism({ x: x - GHOST_ROW.blockW / 2, y: GHOST_ROW.y - GHOST_ROW.blockD / 2, w: GHOST_ROW.blockW, d: GHOST_ROW.blockD, r: 1 }, 0, 4, view, 2, 0.3)),
  half: flatPath([[GHOST_ROW.xs[0] - 10, GHOST_ROW.y], [GHOST_ROW.xs[GHOST_ROW.xs.length - 1] + 12, GHOST_ROW.y]], 0.06, view),
};
export const ghostMarker = (u: number, v: number) => {
  const xs = GHOST_ROW.xs;
  const x = xs[0] + GHOST_ROW.blockW / 2 + 5 + u * (xs[xs.length - 1] - xs[0]);
  return flatCircle(x, ghostRowY(v), 4, 0.1, view, 20);
};
export const ghostSlide = (dx: number) => {
  const a = at([0, 0, 0]);
  const b = at([dx, 0, 0]);
  return `translate(${f2(b[0] - a[0])} ${f2(b[1] - a[1])})`;
};
export const counterAt = at([GHOST_ROW.xs[GHOST_ROW.xs.length - 1] + 4, GHOST_ROW.y + 20, 0]);

// ---------- Cars (box-and-cylinder meshes rebuilt every frame) ----------

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

// A car frame: o = ground centre, a = forward (-x), b = across toward the back edge (-y), n = up, k = scale.
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
function tyre(f: Fr, ac: number, b0: number, b1: number, cls: string, seg = 14) {
  const ring = (b: number, r: number): L3[] => Array.from({ length: seg }, (_, i) => [ac + r * Math.cos((i / seg) * 2 * Math.PI), b, WR + r * Math.sin((i / seg) * 2 * Math.PI)] as L3);
  let out = "";
  for (let i = 0; i < seg; i++) {
    const t0 = (i / seg) * 2 * Math.PI;
    const t1 = ((i + 1) / seg) * 2 * Math.PI;
    const tm = (t0 + t1) / 2;
    const nrm = unit(add(add([0, 0, 0], f.a, Math.cos(tm)), f.n, Math.sin(tm)));
    const q = (t: number, b: number): L3 => [ac + WR * Math.cos(t), b, WR + WR * Math.sin(t)];
    out += face(f, [q(t0, b0), q(t1, b0), q(t1, b1), q(t0, b1)], nrm, cls);
  }
  const outer = Math.abs(b1) > Math.abs(b0) ? b1 : b0;
  const inner = outer === b1 ? b0 : b1;
  const outN = outer > 0 ? f.b : neg(f.b);
  out += face(f, ring(inner, WR), neg(outN), cls) + face(f, ring(outer, WR), outN, cls);
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

// A regular car (local length 53, width 27.4, height 30) with its number large on the roof.
function sedan(f: Fr, fb: Fr, ghost: boolean, num: string) {
  const body = ghost ? "car-ghost" : "car-rust";
  const glass = ghost ? "car-ghost" : "car-glass";
  const tyreCls = ghost ? "car-ghost" : "car-tyre";
  const tyres = [-17.1, 17.1].map((ac) => tyre(f, ac, -8, -13.3, tyreCls) + tyre(f, ac, 8, 13.3, tyreCls)).join("");
  const R = -26.65; // rear face (the car drives toward +a)
  const rear = (b0: number, b1: number, n0: number, n1: number, cls: string) => face(fb, [[R, b0, n0], [R, b1, n0], [R, b1, n1], [R, b0, n1]], neg(fb.a), cls);
  return (
    (ghost ? "" : shadowOf(f, 30, 17)) +
    tyres +
    box(fb, [-26.6, 26.6], [-13.7, 13.7], [6.46, 17.48], body) +
    box(fb, [-15.2, 11.4], [-11.78, 11.78], [17.48, 27.36], glass) +
    box(fb, [-12.92, 9.88], [-10.64, 10.64], [27.36, 29.64], body) +
    (ghost ? "" : rear(-8, -3.8, 12.16, 15.58, "car-tail") + rear(3.8, 8, 12.16, 15.58, "car-tail") + rear(-3.04, 3.04, 7.22, 10.64, "car-plate")) +
    (ghost || !num ? "" : carText(fb, [-1.5, 0, 29.7], [-1, 0, 0], [0, -1, 0], 21, num, "car-num"))
  );
}

// Supercar (car 20): low wedge body, wide wheels, low canopy, rear spoiler; "20" on the bonnet, ROLLIN on its plate.
function supercar(f: Fr, fb: Fr, ghost: boolean, num: string, brand: string) {
  const body = ghost ? () => "car-ghost" : (i: number) => `car-rust ${i < 2 ? "f-t" : i < 4 ? "f-s" : "f-e"}`;
  const glass = ghost ? () => "car-ghost" : (i: number) => `car-glass ${i < 2 ? "f-t" : i < 4 ? "f-s" : "f-e"}`;
  const tyreCls = ghost ? "car-ghost" : "car-tyre";
  const top = (a: number) => 15 + ((8 - 15) * (a + 29)) / 58;
  const W = 15.5;
  const wedge: L3[][] = [
    [[-29, -W, top(-29)], [29, -W, top(29)], [29, W, top(29)], [-29, W, top(-29)]],
    [[-29, -W, 5], [-29, W, 5], [29, W, 5], [29, -W, 5]],
    [[-29, -W, 5], [29, -W, 5], [29, -W, top(29)], [-29, -W, top(-29)]],
    [[-29, W, 5], [-29, W, top(-29)], [29, W, top(29)], [29, W, 5]],
    [[-29, -W, 5], [-29, -W, top(-29)], [-29, W, top(-29)], [-29, W, 5]],
    [[29, -W, 5], [29, W, 5], [29, W, top(29)], [29, -W, top(29)]],
  ];
  const canopy: L3[][] = [
    [[-10, -8.5, 20], [3, -8.5, 19], [3, 8.5, 19], [-10, 8.5, 20]],
    [[-14, -11, top(-14)], [-14, 11, top(-14)], [10, 11, top(10)], [10, -11, top(10)]],
    [[-14, -11, top(-14)], [10, -11, top(10)], [3, -8.5, 19], [-10, -8.5, 20]],
    [[-14, 11, top(-14)], [-10, 8.5, 20], [3, 8.5, 19], [10, 11, top(10)]],
    [[-14, -11, top(-14)], [-10, -8.5, 20], [-10, 8.5, 20], [-14, 11, top(-14)]],
    [[10, -11, top(10)], [10, 11, top(10)], [3, 8.5, 19], [3, -8.5, 19]],
  ];
  const tyres = [-18.5, 18.5].map((ac) => tyre(f, ac, -8.5, -16.5, tyreCls) + tyre(f, ac, 8.5, 16.5, tyreCls)).join("");
  const posts = [-9, 9].map((b) => box(fb, [-25.5, -23], [b - 1, b + 1], [top(-24), 21.2], ghost ? "car-ghost" : "car-rust")).join("");
  const wing = box(fb, [-31, -22.5], [-16.5, 16.5], [21, 22.8], ghost ? "car-ghost" : "car-rust");
  const R = -29.05;
  const rear = (b0: number, b1: number, n0: number, n1: number, cls: string) => face(fb, [[R, b0, n0], [R, b1, n0], [R, b1, n1], [R, b0, n1]], neg(fb.a), cls);
  return (
    (ghost ? "" : shadowOf(f, 32, 19)) +
    tyres +
    convex(fb, wedge, body) +
    convex(fb, canopy, glass) +
    posts +
    wing +
    (ghost
      ? ""
      : rear(-14, -10.5, 11.2, 13.6, "car-tail") +
        rear(10.5, 14, 11.2, 13.6, "car-tail") +
        rear(-9.5, 9.5, 6.4, 11.4, "car-plate") +
        carText(fb, [R - 0.05, 0, 8.9], [0, 1, 0], [0, 0, -1], 4.6, brand, "car-brand") +
        carText(fb, [19, 0, top(19) + 0.08], [-1, 0, 7 / 58], [0, -1, 0], 17, num, "car-num"))
  );
}

export type CarLook = "rust" | "ghost";
// One car at board (x, y) with scale k; lean tips the body sideways.
export function carSvg(x: number, y: number, k: number, look: CarLook, superCar: boolean, num: string, lean = 0, brand = "") {
  const f: Fr = { o: [x, y, 0.05], a: [-1, 0, 0], b: [0, -1, 0], n: [0, 0, 1], k };
  const fb: Fr = { ...f, b: unit(add(f.b, f.n, lean)), n: unit(add(f.n, f.b, -lean)) };
  const ghost = look === "ghost";
  return superCar ? supercar(f, fb, ghost, num, brand) : sedan(f, fb, ghost, num);
}
export const dotAt = (x: number, y: number, r: number) => flatCircle(x, y, r, 0.08, view, 14);
// Road group transform at the fold: it shrinks toward its centre and slides back (away) as it fades.
export function roadAway(u: number) {
  const c = at([0, (ROAD.yB + ROAD.yF) / 2, 0]);
  const s = 1 - 0.3 * u;
  const off = at([0, (ROAD.yB + ROAD.yF) / 2 - 40 * u, 0]);
  return `translate(${f2(off[0])} ${f2(off[1])}) scale(${f2(s)}) translate(${f2(-c[0])} ${f2(-c[1])})`;
}

// Wind streaks: a gently waving line ending in a curl at its leading tip, in a frame (o, a = travel, c = across).
type SFr = { o: Vec3; a: Vec3; c: Vec3 };
export function streakPath(fr: SFr, head: number, w: number, len: number) {
  const P = (t: number, c: number) => at(add(add(fr.o, fr.a, t), fr.c, c));
  const n = 20;
  const pts: Vec2[] = [];
  for (let i = 0; i <= n; i++) pts.push(P(head - len + (len * i) / n, w + 1.6 * Math.sin((i / n) * Math.PI * 1.5)));
  const lw = w - 1.6;
  const r = 4;
  for (let i = 1; i <= 16; i++) {
    const t = (i / 16) * Math.PI * 1.6;
    pts.push(P(head + r * Math.sin(t), lw - r + r * Math.cos(t)));
  }
  return pathD(pts);
}
// Gusts blow across the road from behind (+y) at z = 14, spread along the car (x).
export const windFrame = (x: number): SFr => ({ o: [x, 0, 20], a: [0, 1, 0], c: [1, 0, 0] });
export const STREAKS = [
  { dx: -14, len: 44, lag: 0.1, tone: "mid" },
  { dx: -4, len: 56, lag: 0, tone: "hi" },
  { dx: 6, len: 50, lag: 0.06, tone: "hi" },
  { dx: 15, len: 40, lag: 0.16, tone: "mid" },
] as const;
export const STREAK_FROM = ROAD.yB - 4;

// ---------- Curve card (screen space, below the board's front-left) ----------

const CARD_W = 236;
const CARD_H = 214;
const CARD_X = 26;
// Top of the card: just below the board's front-bottom edge at the card's right side.
const CARD_Y = (() => {
  const k = at([1, 0, 0])[0] - at([0, 0, 0])[0];
  const ky = at([0, 1, 0])[0] - at([0, 0, 0])[0];
  const yF = BOARD.y + BOARD.d;
  const x = (CARD_X + CARD_W - at([0, 0, 0])[0] - yF * ky) / k;
  return Math.round(at([x, yF, -SLAB_H - FOOT_H])[1] + 16);
})();
export const CARD = { x: CARD_X, y: CARD_Y, w: CARD_W, h: CARD_H };
const PX0 = 50;
const PX1 = 204;
const PY0 = 20;
const PY1 = 172;
export const cx = (v: number) => CARD.x + PX0 + (PX1 - PX0) * v;
export const cy = (v: number) => CARD.y + PY1 - (PY1 - PY0) * v;
export const curve = {
  path: pathD(Array.from({ length: 81 }, (_, i) => [cx(i / 80), cy(gate(i / 80))] as Vec2)),
  axes: pathD([[cx(0), cy(1) - 6], [cx(0), cy(0)], [cx(1) + 6, cy(0)]]),
  ticks: pathD([[cx(0.5), cy(0)], [cx(0.5), cy(0) + 5]]) + pathD([[cx(1), cy(0)], [cx(1), cy(0) + 5]]) + pathD([[cx(0), cy(1)], [cx(0) - 5, cy(1)]]) + pathD([[cx(0), cy(0.5)], [cx(0) - 5, cy(0.5)]]),
  half: pathD([[cx(0.5), cy(0)], [cx(0.5), cy(1)]]),
  flatLo: `M${f2(cx(0))} ${f2(cy(1))}H${f2(cx(0.394))}V${f2(cy(0))}H${f2(cx(0))}Z`,
  flatHi: `M${f2(cx(0.606))} ${f2(cy(1))}H${f2(cx(1))}V${f2(cy(0))}H${f2(cx(0.606))}Z`,
  plot: `M${f2(cx(0))} ${f2(cy(1))}H${f2(cx(1))}V${f2(cy(0))}H${f2(cx(0))}Z`,
};
// Arrow from (x0, y0) to (x1, y1) grown to fraction g.
export function arrowD(x0: number, y0: number, x1: number, y1: number, g: number, head = 7) {
  if (g <= 0.001) return "";
  const ex = x0 + (x1 - x0) * g;
  const ey = y0 + (y1 - y0) * g;
  const l = Math.hypot(ex - x0, ey - y0) || 1;
  const ux = (ex - x0) / l;
  const uy = (ey - y0) / l;
  const h = Math.min(head, l * 0.6);
  return `M${f2(x0)} ${f2(y0)}L${f2(ex)} ${f2(ey)}M${f2(ex - ux * h - uy * h * 0.7)} ${f2(ey - uy * h + ux * h * 0.7)}L${f2(ex)} ${f2(ey)}L${f2(ex - ux * h + uy * h * 0.7)} ${f2(ey - uy * h - ux * h * 0.7)}`;
}

// Entrance spark points: car 1's tyres on the road.
export const contacts: Vec2[] = [-17.1, 17.1].flatMap((A) => [-10.6, 10.6].map((B) => at([CARS[0].xa - A * K_A, yOfV(0.9) - B * K_A, 0])));
