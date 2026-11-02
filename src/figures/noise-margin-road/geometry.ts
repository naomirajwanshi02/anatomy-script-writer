// Noise margins on a road: one board (always on screen). Analogy: a two-lane road across the board (lanes stacked
// along x, the road running along y), a hatched strip between the lanes, a rust car in the middle of the left lane and
// a sepia car in the middle of the right lane, both driving away, a ROLLIN road sign at the back right.
// Fold: the road itself, with both cars, tilts up on its right edge and turns to face the viewer, becoming the upright
// 0-1 V scale behind the middle of the wire (car lane = 1 band, its lane line = 0.6 V, hatched strip = 0.4-0.6 V,
// other lane = 0 band, its lane line = 0.4 V); the cars ride on it as the markers.
// Circuit: sending gate (left), wire with a faint neighbour wire just behind it, receiving gate with its glass-bulb
// lamp (right). x runs right, y toward the viewer (front face +y), z up.
import { boxCorners, cylinder, fitView, flatCircle, flatPath, flatRect, inset, pathD, prism, project, rectCorners, solidSvg, translateTo, type Rect, type Vec2, type Vec3 } from "../../iso/iso-kit";
import { bulbParts } from "../../iso/react/bulb";
import { CAR, GAUGE, ROAD, WIRE, ease, type Hump } from "./model";

export const STAGE_W = 600;
const AZIMUTH = 62;
const ELEVATION = 30;
const PAD = 6;

// Board.
const BOARD: Rect = { x: -78, y: -65, w: 156, d: 130, r: 7 };
const SLAB_H = 8;
const FOOT_H = 4;

// Gauge (the upright road): front plane y = GY, 0 V at z0, 1 V at z0 + h, x from -w/2 to w/2.
export const GY = GAUGE.y;
const GW = GAUGE.w / 2;
export const zOf = (v: number) => GAUGE.z0 + GAUGE.h * v;
const PLINTH: Rect = { x: -GW - 3, y: GY - 3, w: GAUGE.w + 6, d: 3, r: 0.6 };
const PLINTH_TOP = zOf(1) + 2;

// Stage: fit the board and the gauge top to the width; the content sits at the bottom of a taller stage so its lower
// edge lands near frame y 1505 (bottom 20 % free) and the paper above stays free for notes.
const PTS: Vec3[] = [...boxCorners(BOARD, -SLAB_H - FOOT_H, 0), ...boxCorners(PLINTH, 0, PLINTH_TOP)];
const tall = fitView(PTS, STAGE_W, 4000, { pad: PAD, azimuth: AZIMUTH });
const ys = PTS.map((p) => project(p, tall)[1]);
const CONTENT_H = Math.ceil(Math.max(...ys) - Math.min(...ys) + PAD * 2);
export const STAGE_H = 650;
export const view = fitView(PTS, STAGE_W, STAGE_H, { pad: PAD, azimuth: AZIMUTH, headroom: STAGE_H - CONTENT_H });

export const at = (p: Vec3) => project(p, view);
const r3 = (v: number) => Math.round(v * 1e3) / 1e3;
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;

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
// Backing board of the upright scale (appears once the road stands).
export const plinth = prism(PLINTH, 0, PLINTH_TOP, view, 4, 0.4);

// ---------- 3D helpers ----------

const add = (a: Vec3, b: Vec3, k = 1): Vec3 => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a: Vec3): Vec3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
// Direction toward the camera (a face is visible when its normal points this way).
const CAM: Vec3 = (() => {
  const A = (AZIMUTH * Math.PI) / 180;
  const E = (ELEVATION * Math.PI) / 180;
  return [Math.cos(A) * Math.cos(E), Math.sin(A) * Math.cos(E), Math.sin(E)];
})();

// ---------- The folding road panel ----------

// Panel coordinates: s along the road (0 front, 1 back) = across the scale (0 left, 1 right); v across the lanes
// (0 = outer edge of the 0 lane, 1 = outer edge of the car lane) = up the scale (0 V .. 1 V).
// The road first tilts up about its v = 0 edge at full size (the car lane rises to the top), then turns to face the
// viewer while it shrinks to the scale. Returns the screen map, the 3D map and the panel's unit axes.
export function panelFrame(u: number) {
  const psi = (Math.PI / 2) * ease(u / 0.55);
  const phi = (Math.PI / 2) * ease((u - 0.45) / 0.55);
  const m = ease((u - 0.3) / 0.7);
  const sLen = lerp(ROAD.len, GAUGE.w, m);
  const vLen = lerp(ROAD.width, GAUGE.h, m);
  const S: Vec3 = [Math.sin(phi), -Math.cos(phi), 0];
  const V: Vec3 = [-Math.cos(phi) * Math.cos(psi), -Math.sin(phi) * Math.cos(psi), Math.sin(psi)];
  const N = unit(cross(V, S));
  const O: Vec3 = [lerp(ROAD.xV0, 0, m), lerp(0, GY + 0.05, m), lerp(0.05, GAUGE.z0, m)];
  const P3 = (s: number, v: number): Vec3 => add(add(O, S, (s - 0.5) * sLen), V, v * vLen);
  return { P: (s: number, v: number) => at(P3(s, v)), P3, S, V, N, sLen, vLen, carK: lerp(1, GAUGE.carScale, m) };
}
export type PanelFrame = ReturnType<typeof panelFrame>;

// Seeded speckles in the two lanes (Park-Miller).
let seed = 23;
const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const SPECKS = Array.from({ length: 56 }, (_, i) => [rand(), i % 2 ? 0.66 + rand() * 0.3 : 0.04 + rand() * 0.3] as Vec2);

const frac = (v: number) => v - Math.floor(v);
// Hatch segments from (s, va) to (s + ds, vb), repeated every step along s and clipped to 0 <= s <= 1.
function hatch(P: (s: number, v: number) => Vec2, off: number, step: number, ds: number, va: number, vb: number) {
  const segs: string[] = [];
  for (let s = off - step * Math.ceil((off + ds) / step); s <= 1; s += step) {
    let s0 = s;
    let v0 = va;
    let s1 = s + ds;
    let v1 = vb;
    if (s1 <= 0) continue;
    if (s0 < 0) {
      v0 = va + ((vb - va) * (0 - s0)) / ds;
      s0 = 0;
    }
    if (s1 > 1) {
      v1 = va + ((vb - va) * (1 - s)) / ds;
      s1 = 1;
    }
    segs.push(pathD([P(s0, v0), P(s1, v1)]));
  }
  return segs.join("");
}

// Every path of the road panel at fold u, with the road texture scrolled by `scroll` units (toward the viewer).
export function panelPaths(f: PanelFrame, scroll: number) {
  const P = f.P;
  const quad = (v0: number, v1: number) => pathD([P(0, v0), P(1, v0), P(1, v1), P(0, v1)], true);
  const line = (v: number) => pathD([P(0, v), P(1, v)]);
  const off = frac(-scroll / ROAD.len);
  return {
    base: quad(0, 1),
    strip: quad(0.4, 0.6),
    hatchRoad: hatch(P, frac(-scroll / 7) * (7 / ROAD.len), 7 / ROAD.len, 6 / ROAD.len, 0.405, 0.595),
    speck: SPECKS.map(([s, v]) => {
      const q = frac(s + off);
      return pathD([P(q, v), P(Math.min(1, q + 0.004), v)]);
    }).join(""),
    lanes: line(0.4) + line(0.6),
    edges: line(0.015) + line(0.985),
  };
}

// ---------- Cars (box-and-cylinder meshes, so they can ride the road as it turns upright) ----------

// A car frame: o = ground centre, a = forward (driving direction), b = across (toward the lane's v = 1 side),
// n = up, k = scale. Local sizes are the first draft's car at 1.9x.
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
export type CarLook = "rust" | "sepia" | "ghost";
// One car as SVG markup. lean (radians-ish) tips the body toward -b (the side the wind pushes it to).
export function carSvg(f: Fr, look: CarLook, lean = 0) {
  const ghost = look === "ghost";
  const body = ghost ? "car-ghost" : `car-${look}`;
  const glass = ghost ? "car-ghost" : "car-glass";
  const tyreCls = ghost ? "car-ghost" : "car-tyre";
  const fb: Fr = { ...f, b: unit(add(f.b, f.n, lean)), n: unit(add(f.n, f.b, -lean)) };
  const shadow = ghost
    ? ""
    : `<path class="car-shadow" d="${pathD(
        Array.from({ length: 36 }, (_, i) => {
          const t = (i / 36) * 2 * Math.PI;
          return at(pt(f, [Math.cos(t) * 30, Math.sin(t) * 17, 0.03]));
        }),
        true,
      )}"/>`;
  const tyres = [-17.1, 17.1].map((ac) => tyre(f, ac, -8, -13.3, tyreCls) + tyre(f, ac, 8, 13.3, tyreCls)).join("");
  const R = -26.65; // rear face (the car drives toward +a)
  const rear = (b0: number, b1: number, n0: number, n1: number, cls: string) =>
    face(fb, [[R, b0, n0], [R, b1, n0], [R, b1, n1], [R, b0, n1]], neg(fb.a), cls);
  return (
    shadow +
    tyres +
    box(fb, [-26.6, 26.6], [-13.7, 13.7], [6.46, 17.48], body) +
    box(fb, [-15.2, 11.4], [-11.78, 11.78], [17.48, 27.36], glass) +
    box(fb, [-12.92, 9.88], [-10.64, 10.64], [27.36, 29.64], body) +
    (ghost ? "" : rear(-8, -3.8, 12.16, 15.58, look === "rust" ? "car-tail" : "car-tail0") + rear(3.8, 8, 12.16, 15.58, look === "rust" ? "car-tail" : "car-tail0") + rear(-3.04, 3.04, 7.22, 10.64, "car-plate"))
  );
}
// Frame of a car sitting at panel point (s, v) on the panel f.
export const carFrame = (f: PanelFrame, s: number, v: number): Fr => ({ o: add(f.P3(s, v), f.N, 0.05), a: f.S, b: f.V, n: f.N, k: f.carK });
export const sOfY = (y: number) => (ROAD.yFront - y) / ROAD.len;
export const vOfX = (x: number) => (ROAD.xV0 - x) / ROAD.width;

// Wind streaks: a gently waving line ending in a curl at its leading tip, in a frame (o, a = travel, c = across).
type SFr = { o: Vec3; a: Vec3; c: Vec3 };
export function streakPath(fr: SFr, head: number, w: number, len: number) {
  const P = (t: number, c: number) => at(add(add(fr.o, fr.a, t), fr.c, c));
  const n = 20;
  const pts: Vec2[] = [];
  for (let i = 0; i <= n; i++) pts.push(P(head - len + (len * i) / n, w + 1.6 * Math.sin((i / n) * Math.PI * 1.5)));
  const lw = w - 1.6;
  const r = 5;
  for (let i = 1; i <= 16; i++) {
    const t = (i / 16) * Math.PI * 1.6;
    pts.push(P(head + r * Math.sin(t), lw - r + r * Math.cos(t)));
  }
  return pathD(pts);
}
// Road gusts blow along +x at z = 14 across the lanes; gauge gusts blow down (-z) in front of the scale.
export const ROAD_WIND: SFr = { o: [0, 0, 14], a: [1, 0, 0], c: [0, 1, 0] };
export const GAUGE_WIND: SFr = { o: [0, GY + 12, 0], a: [0, 0, -1], c: [1, 0, 0] };
// Four streaks per gust spread over the target car: offset across, length, lag (s), tone.
export const STREAKS = [
  { dy: -20, len: 44, lag: 0.1, tone: "mid" },
  { dy: -6, len: 54, lag: 0, tone: "hi" },
  { dy: 8, len: 50, lag: 0.06, tone: "hi" },
  { dy: 21, len: 42, lag: 0.16, tone: "mid" },
] as const;
export const STREAK_FROM = -84;
export const STREAK_PAST = 14;

// ROLLIN road sign on the right verge at the back: post and a plate facing the viewer.
const SX = 64;
const SY = -62;
export const sign = {
  post: cylinder(SX, SY, 1.2, 0, 15, view, 18),
  plate: prism({ x: SX - 10, y: SY - 1.4, w: 20, d: 1.6, r: 0.5 }, 14, 11, view, 4, 0.3),
};
export const BRAND_SIZE = 5.2;
export const brand = frontMatrix([SX, SY + 0.25, 19.5 - BRAND_SIZE * 0.36]);

// ---------- Circuit ----------

const WY = 36;
const NY = 27; // neighbour wire, just behind ours (9 units = about 30 frame px apart)
const GATE_H = 13;
const gateRect = (x: number, w: number): Rect => ({ x, y: WY - 13, w, d: 26, r: 3 });
const gateSym = (x0: number) =>
  flatPath([[x0 + 7, WY - 8.5], [x0 + 7, WY + 8.5], [x0 + 23, WY]], GATE_H + 0.05, view, true) +
  flatPath([[x0 + 1.5, WY], [x0 + 7, WY]], GATE_H + 0.05, view) +
  flatPath([[x0 + 23, WY], [x0 + 26, WY]], GATE_H + 0.05, view);
const SEND = gateRect(-74, 34);
const RECV = gateRect(36, 40);
export const gates = [
  { body: prism(SEND, 0, GATE_H, view, 4, 0.8), sym: gateSym(SEND.x + 2.5) },
  { body: prism(RECV, 0, GATE_H, view, 4, 0.8), sym: gateSym(RECV.x + 1) },
];
export const gateLift = (h: number) => translateTo(view, [0, 0, h]);
// Lamp: kit glass bulb standing on the receiving gate's output end, drawn 1.6x about its base.
export const LAMP_AT: Vec2 = [RECV.x + 32, WY];
export const lamp = bulbParts(LAMP_AT, view, { baseR: 5 });
export const lampXform = (() => {
  const b0 = at([LAMP_AT[0], LAMP_AT[1], 0]);
  const b = at([LAMP_AT[0], LAMP_AT[1], GATE_H]);
  return `translate(${r3(b[0])} ${r3(b[1])}) scale(1.6) translate(${r3(-b0[0])} ${r3(-b0[1])})`;
})();

// Bump height in board units: 0.025 V reads as 3 units, 0.2 V as 9 units (compressed so both stay on screen).
const bumpZ = (a: number) => (a <= 0 ? 0 : 3 * Math.pow(a / 0.025, 0.53));
// Our wire up to xEnd (it draws on left to right), raised by the noise bumps.
export function wirePath(xEnd: number, humps: Hump[]) {
  const pts: Vec2[] = [];
  for (let x = WIRE.x0; x < xEnd; x += 1) pts.push(at([x, WY, 0.05 + humps.reduce((s, h) => s + bumpZ(h.a) * Math.exp(-(((x - h.x) / WIRE.w) ** 2)), 0)]));
  pts.push(at([xEnd, WY, 0.05]));
  return pathD(pts);
}
export const wirePads = flatCircle(WIRE.x0 + 0.5, WY, 1.5, 0.05, view, 14) + flatCircle(WIRE.x1 - 0.5, WY, 1.5, 0.05, view, 14);
export const neighbour = flatPath([[-36, NY], [25, NY]], 0.05, view);
export const neighbourPads = flatCircle(-36, NY, 1.5, 0.05, view, 14) + flatCircle(25, NY, 1.5, 0.05, view, 14);
export const slideAt = (dx: number) => translateTo(view, [dx, 0, 0]);

// ---------- Gauge face extras (front plane just in front of the upright road) ----------

const FY = 0.12;
const fp = (x: number, z: number, y = FY): Vec2 => at([x, GY + y, z]);
export const frontQuad = (x0: number, x1: number, z0: number, z1: number, y = FY) => pathD([fp(x0, z0, y), fp(x1, z0, y), fp(x1, z1, y), fp(x0, z1, y)], true);
const frontLine = (x0: number, x1: number, z: number, y = 0.16) => pathD([fp(x0, z, y), fp(x1, z, y)]);
export const gaugeFace = {
  minor: [1, 2, 3, 5, 7, 8, 9].map((i) => frontLine(-GW - 0.6, -GW - 3.4, zOf(i / 10))).join(""),
  major: [0, 0.4, 0.6, 1].map((v) => frontLine(-GW - 0.6, -GW - 5, zOf(v))).join(""),
  glow6: frontLine(-GW, GW, zOf(0.6), 0.2),
  glow4: frontLine(-GW, GW, zOf(0.4), 0.2),
  band1: frontQuad(-GW, GW, zOf(0.6), zOf(1)),
};
// x of a panel s position on the upright gauge.
export const xOfS = (s: number) => (s - 0.5) * GAUGE.w;
// Pale strip between the 0.6 line and the rust car's lower edge, across the car's length.
export const gapQuad = (s: number, vEdge: number, vLine: number) => {
  const half = 26.6 * GAUGE.carScale;
  return frontQuad(xOfS(s) - half, xOfS(s) + half, zOf(Math.min(vEdge, vLine)), zOf(Math.max(vEdge, vLine)), 0.14);
};
// Bracket end points on the face, at panel s.
export const facePt = (s: number, v: number) => fp(xOfS(s), zOf(v), 0.3);

// Labels left of the scale (Oxanium) and the band digits on the tarmac (Type Machine).
export const LABEL_SIZE = 7;
const LX = -GW - 6.5;
export const labels = {
  one: frontMatrix([LX, GY + FY, zOf(1) - LABEL_SIZE * 0.36]),
  six: frontMatrix([LX, GY + FY, zOf(0.6) - LABEL_SIZE * 0.36]),
  four: frontMatrix([LX, GY + FY, zOf(0.4) - LABEL_SIZE * 0.36]),
  zero: frontMatrix([LX, GY + FY, zOf(0) - LABEL_SIZE * 0.36]),
};
export const DIGIT_SIZE = 13;
export const digits = {
  one: frontMatrix([xOfS(0.78), GY + 0.2, zOf(0.8) - DIGIT_SIZE * 0.36]),
  zero: frontMatrix([xOfS(0.22), GY + 0.2, zOf(0.2) - DIGIT_SIZE * 0.36]),
};
// Readout anchor (left middle of the box) right of the scale, at the rust car's height.
export const readoutAt = (v: number) => fp(GW + 5, zOf(v), 0.3);

// Entrance spark points: the cars' tyres (on the flat road) and the sign post.
const road0 = panelFrame(0);
const tyreContacts = (s: number, v: number) => {
  const f = carFrame(road0, s, v);
  return [-17.1, 17.1].flatMap((A) => [-10.6, 10.6].map((B) => at(pt(f, [A, B, 0]))));
};
export const contacts: Vec2[] = [...tyreContacts(sOfY(CAR.y), vOfX(CAR.x)), at([SX, SY, 0])];
