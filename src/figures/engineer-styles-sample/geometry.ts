// Engineer styles tester: a 2x2 grid of small desk scenes (desk, monitor with a blue LCD wall of bits, keyboard,
// office chair, seated engineer seen from behind at azimuth 62), one design per cell. Each cell has its own view.
//
// The engineer is drawn with smooth silhouettes: limbs are tapered capsules (outline layer under fill layer, so a
// limb reads as one shape), the torso is a smoothed contour through elliptical body rings. Every builder returns an
// ordered list of layers (back to front) that the art maps straight to SVG.
import { cylinder, flatCircle, flatRect, inset, pathD, prism, prismFill, project, rectCorners, type Rect, type SolidPaths, type Vec2, type Vec3, type View } from "../../iso/iso-kit";
import { STYLES, WALL_ROWS, type StyleKey } from "./model";

export const STAGE_W = 600;
export const STAGE_H = 1000;
const AZIMUTH = 62;

// ---------- Shared helpers ----------

const r1 = (v: number) => (Math.round(v * 10) / 10).toFixed(1);
const unitLen = (v: View) => {
  const a = (v.azimuth * Math.PI) / 180;
  const p = project([Math.sin(a), -Math.cos(a), 0], v);
  const o = project([0, 0, 0], v);
  return Math.hypot(p[0] - o[0], p[1] - o[1]);
};
const hullPts = (pts: Vec2[]) => {
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
  return [...half(s).slice(0, -1), ...half([...s].reverse()).slice(0, -1)];
};
const hullPath = (pts: Vec2[]) => pathD(hullPts(pts), true);
// Horizontal ellipse ring (board units).
const ring = (cx: number, cy: number, z: number, hw: number, hd: number, n = 24): Vec3[] =>
  Array.from({ length: n }, (_, i) => [cx + hw * Math.cos((i / n) * Math.PI * 2), cy + hd * Math.sin((i / n) * Math.PI * 2), z]);
// Smooth path through points (Catmull-Rom as cubic Beziers).
export function smoothD(pts: Vec2[], close = true): string {
  const n = pts.length;
  if (n < 3) return pathD(pts, close);
  const get = (i: number) => (close ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  for (let i = 0; i < (close ? n : n - 1); i++) {
    const [p0, p1, p2, p3] = [get(i - 1), get(i), get(i + 1), get(i + 2)];
    d += `C${r1(p1[0] + (p2[0] - p0[0]) / 6)} ${r1(p1[1] + (p2[1] - p0[1]) / 6)} ${r1(p2[0] - (p3[0] - p1[0]) / 6)} ${r1(p2[1] - (p3[1] - p1[1]) / 6)} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return d + (close ? "Z" : "");
}
// Tapered capsule between two screen circles (outer tangents plus end arcs).
function capsule(a: Vec2, ra: number, b: Vec2, rb: number, n = 12): string {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const L = Math.hypot(dx, dy);
  if (L <= Math.abs(ra - rb) + 1e-3) {
    const [c, r] = ra >= rb ? [a, ra] : [b, rb];
    return pathD(Array.from({ length: 24 }, (_, i): Vec2 => [c[0] + r * Math.cos((i / 24) * Math.PI * 2), c[1] + r * Math.sin((i / 24) * Math.PI * 2)]), true);
  }
  const ang = Math.atan2(dy, dx);
  const th = Math.acos((ra - rb) / L);
  const pts: Vec2[] = [];
  for (let i = 0; i <= n; i++) {
    const t = ang - th + (2 * th * i) / n;
    pts.push([b[0] + rb * Math.cos(t), b[1] + rb * Math.sin(t)]);
  }
  for (let i = 0; i <= n; i++) {
    const t = ang + th + (2 * (Math.PI - th) * i) / n;
    pts.push([a[0] + ra * Math.cos(t), a[1] + ra * Math.sin(t)]);
  }
  return pathD(pts, true);
}
// Text on a front face (+y), reading along +x, upright along +z.
const frontMatrixIn = (v: View, p: Vec3) => {
  const o = project(p, v);
  const ax = project([p[0] + 1, p[1], p[2]], v);
  const az = project([p[0], p[1], p[2] - 1], v);
  const r = (n: number) => Math.round(n * 1e3) / 1e3;
  return `matrix(${r(ax[0] - o[0])} ${r(ax[1] - o[1])} ${r(az[0] - o[0])} ${r(az[1] - o[1])} ${r(o[0])} ${r(o[1])})`;
};

// ---------- Layers ----------
// mat: a gradient material id (es-g-<mat>); edge: segment drawn with its own outline on top (cuffs, roll bands).
export type Seg = { d: string; mat: string; edge?: boolean };
export type Layer =
  | { t: "limb"; segs: Seg[] }
  | { t: "blob"; d: string; mat: string; thin?: boolean }
  | { t: "line"; d: string; cls: string }
  | { t: "solid"; paths: SolidPaths; cls: string; tone?: string };

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

// Mouse: a smooth dome on the desk at (x, y), long axis along y.
function mouseParts(v: View, x: number, y: number) {
  const P = (p: Vec3) => project(p, v);
  const pts = [...ring(x, y, 0, 2.7, 4.2), ...ring(x, y + 0.4, 1.6, 2.4, 3.6), ...ring(x, y + 0.6, 2.6, 1.5, 2.3)].map(P);
  return {
    body: smoothD(hullPts(pts)),
    split: pathD([P([x, y - 4, 2.1]), P([x, y - 1, 2.7])]),
  };
}

// ---------- Office chair, centred at (cx, cy) on the floor, facing -y (backrest toward +y) ----------

export const CHAIR_SEAT_H = 36;
export function chairParts(v: View, cx: number, cy: number, floor: number, tilt = 0) {
  const seat = floor + CHAIR_SEAT_H;
  const a = (v.azimuth * Math.PI) / 180;
  const depth = ([x, y]: Vec2) => x * Math.cos(a) + y * Math.sin(a);
  const P = (p: Vec3) => project(p, v);
  const u = unitLen(v);
  const tips: Vec2[] = Array.from({ length: 5 }, (_, i) => {
    const t = Math.PI / 2 + (i * 2 * Math.PI) / 5 + 0.3;
    return [cx + 16 * Math.cos(t), cy + 16 * Math.sin(t)];
  }).sort((p, q) => depth(p) - depth(q));
  const spokeZ = floor + 4.2;
  const backZ0 = seat + 6;
  const backZ1 = seat + 27;
  // Curved backrest shell bowed round the sitter's back, leaning back by `tilt` (y per unit height).
  const shell = (z: number, off: number, narrow = 1) =>
    Array.from({ length: 15 }, (_, i): Vec3 => {
      const f = (i / 14) * 2 - 1;
      const bow = 4.5 * (1 - f * f);
      return [cx + 15.5 * f * narrow, cy + 10 + bow + off + (z - backZ0) * tilt, z];
    });
  const zs = [backZ0, backZ0 + 2, backZ0 + 9, backZ1 - 3, backZ1];
  const nar = [0.86, 0.97, 0.94, 1, 0.9];
  const backPts = zs.flatMap((z, k) => [...shell(z, 0, nar[k]), ...shell(z, 4, nar[k])]).map(P);
  const spoke = (x: number, y: number) => capsule(P([cx, cy, spokeZ]), 1.9 * u, P([x, y, spokeZ - 1.4]), 1.3 * u);
  return {
    seatZ: seat,
    spokes: tips.map(([x, y]) => spoke(x, y)),
    casters: tips.map(([x, y]) => cylinder(x, y, 1.9, floor, 2.4, v, 16, 0.6)),
    hub: cylinder(cx, cy, 3.2, floor + 2.6, 3.4, v, 20, 0.6),
    column: cylinder(cx, cy, 1.7, floor + 6, CHAIR_SEAT_H - 13, v, 16, 0),
    shroud: cylinder(cx, cy, 2.8, floor + 6, 10, v, 18, 0.6),
    mech: prism({ x: cx - 6, y: cy - 5, w: 12, d: 10, r: 2 }, seat - 7.5, 3, v, 3, 0.4),
    seat: prism({ x: cx - 16, y: cy - 14, w: 32, d: 27, r: 8 }, seat - 5, 5, v, 10, 2.4),
    bar: capsule(P([cx, cy + 6, seat - 6]), 1.5 * u, P([cx, cy + 13.5, seat - 5]), 1.5 * u) + capsule(P([cx, cy + 13.5, seat - 5]), 1.5 * u, P([cx, cy + 14.5 + 6 * tilt, backZ0 + 5]), 1.4 * u),
    back: smoothD(hullPts(backPts)),
    // Padded face: the camera-side surface inset from the shell edge, plus a lumbar seam.
    pad: smoothD([...shell(backZ1 - 2.2, 4.1, 0.86), ...shell(backZ0 + 2.2, 4.1, 0.8).reverse()].map(P)),
    seam: pathD(shell(backZ0 + 9, 4.15, 0.88).map(P)),
  };
}

// ---------- Engineer, seated, facing -y, back to the camera ----------
// cx, cy: centre of the hips on the seat; seat, floor: heights; kbY: keyboard centre y; front: desk front edge y.
// Proportions in board units (1 unit ~ 1.2 cm).

type Look = {
  lean: number; // torso lean in degrees, + toward the monitor
  hunch: number; // extra forward roll of the upper back and head
  bulk: number; // garment thickness added to the torso and sleeves
  hair: "short" | "pony" | "swept";
  hairMat: string;
  shirt: string;
  sleeve: string;
  legs: string;
};
const LOOKS: Record<StyleKey, Look> = {
  A: { lean: 5, hunch: 0, bulk: 0, hair: "short", hairMat: "hair", shirt: "shirt", sleeve: "shirt", legs: "trousers" },
  B: { lean: 17, hunch: 4, bulk: 1.4, hair: "short", hairMat: "hair", shirt: "hoodie", sleeve: "hoodie", legs: "jeans" },
  C: { lean: 7, hunch: 0, bulk: 0.8, hair: "pony", hairMat: "hair", shirt: "cardigan", sleeve: "cardigan", legs: "trousers" },
  D: { lean: -15, hunch: 0, bulk: 0, hair: "swept", hairMat: "hair-light", shirt: "shirtd", sleeve: "shirtd", legs: "jeans" },
};

export const HEAD_R = 9.3;

export function engineerParts(v: View, key: StyleKey, cx: number, cy: number, seat: number, floor: number, kbY: number, front: number) {
  const L = LOOKS[key];
  const u = unitLen(v);
  const P = (p: Vec3) => project(p, v);
  const k = Math.tan((L.lean * Math.PI) / 180);
  // Spine offset in y at height dz above the seat (forward is -y), with a rounded upper back when hunched.
  const dy = (dz: number) => -k * dz - L.hunch * Math.pow(dz / 44, 2.2);
  const at = (x: number, dz: number, y = 0): Vec3 => [cx + x, cy + dy(dz) + y, seat + dz];
  const cap = (a: Vec3, ra: number, b: Vec3, rb: number) => capsule(P(a), ra * u, P(b), rb * u);
  const chain = (pts: Vec3[], rs: number[], mats: string[]): Seg[] => pts.slice(1).map((p, i) => ({ d: cap(pts[i], rs[i], p, rs[i + 1]), mat: mats[i] }));
  const b = L.bulk;

  // Torso rings [dz, half-width, half-depth, y offset]: hips, waist (narrowest), chest, shoulders, slope to the neck.
  const RINGS: [number, number, number, number][] = [
    [0, 12.5, 8, 1.5],
    [6, 12, 7.5, 1.2],
    [13, 11, 6.8, 0.6],
    [22, 12.8, 7.2, 0],
    [30, 15, 7.6, -0.8],
    [36, 16.6, 7.3, -1.4],
    [40, 15.2, 6.4, -2],
    [42.5, 11, 5.4, -2.4],
    [44, 6.5, 4.6, -2.6],
  ];
  const rings = RINGS.map(([dz, hw, hd, oy]) => ring(cx, cy + dy(dz) + oy, seat + dz, hw + (dz < 43 ? b : b * 0.5), hd + b * 0.6, 28).map(P));
  // Smoothed contour: bottom arc, right extremes up, top arc, left extremes down.
  const torsoD = (() => {
    const ext = rings.map((r) => {
      let li = 0;
      let ri = 0;
      r.forEach((p, i) => {
        if (p[0] < r[li][0]) li = i;
        if (p[0] > r[ri][0]) ri = i;
      });
      return { li, ri };
    });
    const arc = (r: Vec2[], from: number, to: number, top: boolean) => {
      const n = r.length;
      const fw: Vec2[] = [];
      const bw: Vec2[] = [];
      for (let i = from; ; i = (i + 1) % n) {
        fw.push(r[i]);
        if (i === to) break;
      }
      for (let i = from; ; i = (i - 1 + n) % n) {
        bw.push(r[i]);
        if (i === to) break;
      }
      const avg = (s: Vec2[]) => s.reduce((m, p) => m + p[1], 0) / s.length;
      const pick = top ? (avg(fw) < avg(bw) ? fw : bw) : avg(fw) > avg(bw) ? fw : bw;
      return pick.filter((_, i) => i % 2 === 0 || i === pick.length - 1);
    };
    const last = rings.length - 1;
    const pts: Vec2[] = [
      ...arc(rings[0], ext[0].li, ext[0].ri, false),
      ...rings.slice(1, last).map((r, i) => r[ext[i + 1].ri]),
      ...arc(rings[last], ext[last].ri, ext[last].li, true),
      ...rings
        .slice(1, last)
        .map((r, i) => r[ext[i + 1].li])
        .reverse(),
    ];
    return smoothD(pts);
  })();

  // Head and neck.
  const neckBase = at(0, 43, -2.6);
  const fwd = key === "B" ? 4.5 : key === "D" ? -0.5 : 1;
  const drop = key === "B" ? 2.5 : 0;
  const head: Vec3 = [cx, neckBase[1] - 1 - fwd, seat + 56 - drop];
  const hc = P(head);
  const hr = HEAD_R * u;
  const hry = hr * 1.1;
  const headD = smoothD(
    Array.from({ length: 24 }, (_, i): Vec2 => {
      const a = (i / 24) * Math.PI * 2;
      const jaw = Math.sin(a) > 0 ? 1 - 0.1 * Math.sin(a) ** 2 : 1; // slightly narrower toward the jaw
      return [hc[0] + hr * Math.cos(a) * jaw, hc[1] + hry * Math.sin(a)];
    }),
  );
  // Hair cap: head outline over the top from angle a0 to a1 (y down), closed by a nape curve at depth `nape`.
  const hairCap = (a0: number, a1: number, nape: number, puff: number) => {
    const pts: Vec2[] = [];
    for (let i = 0; i <= 20; i++) {
      const a = a0 + ((a1 - a0) * i) / 20;
      const s = 1 + puff * Math.max(0, -Math.sin(a));
      pts.push([hc[0] + hr * 1.04 * s * Math.cos(a), hc[1] + hry * 1.03 * s * Math.sin(a) - hry * 0.03]);
    }
    const [lx, ly] = pts[0];
    const [rx, ry] = pts[pts.length - 1];
    pts.push([hc[0] + (rx - hc[0]) * 0.55, (ry + hc[1] + hry * nape) / 2 + hry * 0.05]);
    pts.push([hc[0] + hr * 0.08, hc[1] + hry * nape]);
    pts.push([hc[0] + (lx - hc[0]) * 0.55, (ly + hc[1] + hry * nape) / 2 + hry * 0.05]);
    return smoothD(pts);
  };
  // Hair strands: soft curves from a crown point toward the hairline.
  const strands = (crown: Vec2, ends: [number, number][], bend: number) =>
    ends
      .map(([ex, ey]) => {
        const e: Vec2 = [hc[0] + ex * hr, hc[1] + ey * hry];
        const m: Vec2 = [(crown[0] + e[0]) / 2 + bend * hr, (crown[1] + e[1]) / 2 - bend * 0.4 * hry];
        return `M${r1(crown[0] + (e[0] - crown[0]) * 0.12)} ${r1(crown[1] + (e[1] - crown[1]) * 0.12)}Q${r1(m[0])} ${r1(m[1])} ${r1(crown[0] + (e[0] - crown[0]) * 0.86)} ${r1(crown[1] + (e[1] - crown[1]) * 0.86)}`;
      })
      .join("");
  const ear: Seg = { d: cap([head[0] + HEAD_R * 0.95, head[1] + 0.6, head[2] + 0.4], 1.45, [head[0] + HEAD_R * 0.97, head[1] + 1.1, head[2] - 2.6], 1.15), mat: "skin" };
  const earIn = pathD([P([head[0] + HEAD_R * 1.05, head[1] + 0.2, head[2] + 0.6]), P([head[0] + HEAD_R * 1.06, head[1] + 0.5, head[2] - 1.6])]);
  const neck: Seg = { d: cap(neckBase, 4, [head[0], head[1] + 1.2, head[2] - 6.5], 3.7), mat: "skin" };

  // Shoulder joints and legs.
  const sh = (s: -1 | 1): Vec3 => at(13.6 * s, 37, -1.6 - (key === "B" ? 1.5 : 0));
  const legs = (s: -1 | 1): { lower: Seg[]; thigh: Seg[] } => {
    const out = key === "D" ? 1 : 0;
    const hip = at(6.2 * s, 5, 1);
    const knee: Vec3 = [cx + (7 + out) * s, cy - 19 - out * 2, seat + 5];
    const ankle: Vec3 = [cx + (7.5 + out * 1.5) * s, cy - 22 - out * 9 - (s < 0 ? 2 : 0), floor + 5];
    const heel: Vec3 = [ankle[0], ankle[1] + 2, floor + 2.6];
    const toe: Vec3 = [ankle[0] + 0.6 * s, ankle[1] - 8, floor + 2.1];
    return {
      lower: [...chain([knee, ankle], [4.8, 3.3], [L.legs]), { d: cap(heel, 2.9, toe, 2.5), mat: "shoe" }],
      thigh: [{ d: cap(hip, 6.6, knee, 5.2), mat: L.legs }],
    };
  };

  // Arms. Typing: shoulder, elbow by the waist, forearm to the keyboard, hand on the keys.
  const hand = (wrist: Vec3, knuckle: Vec3, tip: Vec3, mat = "skin"): Seg[] => [
    { d: cap(wrist, 2, knuckle, 2.5), mat },
    { d: cap(knuckle, 2.4, tip, 1.6), mat },
  ];
  const typing = (s: -1 | 1, elbowY = -6): { upper: Seg[]; lower: Seg[] } => {
    const S = sh(s);
    const E = at(17 * s, 19, elbowY);
    const W: Vec3 = [cx + 9.5 * s, kbY + 4.5, 4.4];
    const K: Vec3 = [cx + 8.8 * s, kbY + 0.6, 4.3];
    const T: Vec3 = [cx + 8.4 * s, kbY - 2.6, 3.2];
    return armSegs(S, E, W, K, T);
  };
  const lerp = (a: Vec3, c: Vec3, f: number): Vec3 => [a[0] + (c[0] - a[0]) * f, a[1] + (c[1] - a[1]) * f, a[2] + (c[2] - a[2]) * f];
  const armSegs = (S: Vec3, E: Vec3, W: Vec3, K: Vec3, T: Vec3): { upper: Seg[]; lower: Seg[] } => {
    const sl = L.sleeve;
    const upper: Seg[] = [{ d: cap(S, 4.4 + b, E, 3.5 + b * 0.8), mat: sl }];
    let lower: Seg[];
    if (key === "D") {
      // Rolled sleeve: shirt to just below the elbow, a rolled band, then the bare forearm.
      const R0 = lerp(E, W, 0.16);
      const R1 = lerp(E, W, 0.27);
      lower = [
        { d: cap(R1, 2.9, W, 2.1), mat: "skin" },
        { d: cap(E, 3.5, R0, 3.3), mat: sl },
        { d: cap(R0, 3.7, R1, 3.6), mat: "roll", edge: true },
      ];
    } else {
      const C0 = lerp(E, W, 0.84);
      lower = [
        { d: cap(E, 3.5 + b * 0.8, C0, 2.7 + b * 0.6), mat: sl },
        { d: cap(C0, 2.8 + b * 0.5, lerp(E, W, 0.97), 2.6 + b * 0.4), mat: key === "A" ? "cuff" : sl === "hoodie" ? "rib-dark" : "rib", edge: true },
      ];
    }
    return { upper, lower: [...hand(W, K, T), ...lower] };
  };

  // Per design: which hand does what.
  const near = (() => {
    if (key === "D") {
      // Hand on the chin: elbow low by the side, forearm up, knuckles along the jaw.
      const S = sh(1);
      const E = at(17.5, 22, -8);
      const W: Vec3 = [head[0] + 8, head[1] - 4, head[2] - 11.5];
      const K: Vec3 = [head[0] + 6.4, head[1] - 6, head[2] - 8.6];
      const T: Vec3 = [head[0] + 5.6, head[1] - 7.5, head[2] - 5.6];
      return armSegs(S, E, W, K, T);
    }
    return typing(1, key === "B" ? -9 : -6);
  })();
  const far = (() => {
    if (key === "C") {
      // Hand on the mouse, left of the keyboard (the sitter's right hand).
      const S = sh(-1);
      const E = at(-18.5, 19, -6);
      const mx = cx - 34;
      return { arm: armSegs(S, E, [mx + 2.2, kbY + 8.5, 3.2], [mx + 0.4, kbY + 3.6, 3.6], [mx - 0.2, kbY + 0.2, 2.9]), mouse: mouseParts(v, mx, kbY + 2.5) };
    }
    if (key === "D") {
      // Resting on the desk edge in front of the keyboard.
      const S = sh(-1);
      const E = at(-17, 17, -6);
      return { arm: armSegs(S, E, [cx - 12, front - 1.5, 1.6], [cx - 11, front - 5.5, 1.9], [cx - 10.5, front - 8.6, 1.3]), mouse: null };
    }
    return { arm: typing(-1, key === "B" ? -9 : -6), mouse: null };
  })();

  // Garment details on the back (screen paths).
  const seam = (pts: Vec3[]) => smoothD(pts.map(P), false);
  const details: Layer[] = [];
  const collarLayers: Layer[] = [];
  const top = (dz: number, hw: number, hd: number, oy = -2.6) => ring(cx, cy + dy(dz) + oy, seat + dz, hw, hd, 28);
  if (key === "A") {
    // Yoke seam across the shoulder blades, box pleat below it, a soft fold at the near flank.
    details.push({ t: "line", d: seam([at(-15.5, 35.5, 5), at(-6, 36.6, 7.4), at(6, 36.6, 7.4), at(15.5, 35.5, 5)]), cls: "es-seam" });
    details.push({ t: "line", d: seam([at(0, 36.4, 7.6), at(0, 30, 8.6), at(0, 24, 8.3)]), cls: "es-seam" });
    details.push({ t: "line", d: seam([at(9, 33, 7.2), at(10.5, 26, 7.4), at(9.5, 20, 6.8)]), cls: "es-fold" });
    // Shirt collar: a stand with the fold-down collar over it.
    collarLayers.push({ t: "blob", d: hullPath([...top(43.2, 7.6, 6), ...top(45.8, 6.3, 5.1)].map(P)), mat: "cuff" });
    collarLayers.push({ t: "line", d: pathD(top(44.6, 7.05, 5.6).filter((p) => p[1] > cy + dy(44.6) - 2.6).map(P)), cls: "es-seam" });
  } else if (key === "B") {
    // Raglan seams from the neck to under the arms, a centre fold.
    details.push({ t: "line", d: seam([at(-5.5, 43.5, 4.6), at(-11, 38, 6.6), at(-16.5, 30, 5)]), cls: "es-seam" });
    details.push({ t: "line", d: seam([at(5.5, 43.5, 4.6), at(11, 38, 6.6), at(16.5, 30, 5)]), cls: "es-seam" });
    details.push({ t: "line", d: seam([at(3, 34, 9), at(4, 27, 9.2), at(3, 20, 8.6)]), cls: "es-fold" });
  } else if (key === "C") {
    // Knit ribs down the back, and the top's neckline above the cardigan's ribbed neck band.
    for (const x of [-9, -4.5, 0, 4.5, 9]) details.push({ t: "line", d: seam([at(x * 1.15, 39.5, 6.6 - Math.abs(x) * 0.25), at(x, 30, 8.4 - Math.abs(x) * 0.25), at(x * 0.95, 20, 7.8 - Math.abs(x) * 0.2)]), cls: "es-knit" });
    collarLayers.push({ t: "blob", d: hullPath([...top(43.4, 7, 5.4), ...top(45, 5.4, 4.4)].map(P)), mat: "top" });
    collarLayers.push({ t: "blob", d: hullPath([...top(41.8, 9, 6.2), ...top(43.4, 7.6, 5.6)].map(P)), mat: "rib" });
  } else {
    // Plain shirt: yoke seam and a long fold where the back presses the chair.
    details.push({ t: "line", d: seam([at(-15.5, 35.5, 5), at(-6, 36.6, 7.4), at(6, 36.6, 7.4), at(15.5, 35.5, 5)]), cls: "es-seam" });
    details.push({ t: "line", d: seam([at(-6, 32, 8.2), at(-3, 26, 8.6), at(-5, 20, 8.2)]), cls: "es-fold" });
    collarLayers.push({ t: "blob", d: hullPath([...top(43.2, 7.4, 5.8), ...top(45.4, 6.2, 5)].map(P)), mat: "shirtd" });
  }

  // Hair and head extras.
  const crown = P([head[0] + 1, head[1] + HEAD_R * 0.6, head[2] + 4]);
  const headLayers: Layer[] = [];
  const nearExtras: Layer[] = [];
  if (L.hair === "short") {
    headLayers.push({ t: "blob", d: hairCap(Math.PI * 0.74, Math.PI * 2.08, 0.5, 0.06), mat: L.hairMat });
    headLayers.push({ t: "line", d: strands(crown, [[-0.85, 0.2], [-0.55, 0.45], [0.05, 0.5], [0.6, 0.35], [0.9, 0.05], [-0.6, -0.75]], 0.08), cls: "es-strand" });
  } else if (L.hair === "swept") {
    headLayers.push({ t: "blob", d: hairCap(Math.PI * 0.72, Math.PI * 2.06, 0.46, 0.1), mat: L.hairMat });
    headLayers.push({ t: "line", d: strands(P([head[0] - 4, head[1] + 2, head[2] + 9]), [[0.95, 0.0], [0.8, 0.38], [0.3, 0.48], [0.9, -0.45]], -0.1), cls: "es-strand" });
  } else {
    // Long hair pulled back into a high ponytail: a full cap, strands to the tie, the tail down the upper back.
    const tie: Vec3 = [head[0] + 0.5, head[1] + HEAD_R * 0.92, head[2] + 1.5];
    const tieP = P(tie);
    headLayers.push({ t: "blob", d: hairCap(Math.PI * 0.68, Math.PI * 2.12, 0.62, 0.05), mat: L.hairMat });
    headLayers.push({ t: "line", d: strands(tieP, [[-0.95, -0.1], [-0.7, -0.7], [0, -1.05], [0.65, -0.75], [0.95, -0.05], [-0.6, 0.45], [0.55, 0.45]], 0), cls: "es-strand" });
    const tail: Vec3[] = [tie, [tie[0] + 0.6, tie[1] + 1.6, tie[2] - 4], [tie[0] + 1.3, tie[1] + 1.4, tie[2] - 10], [tie[0] + 1.6, tie[1] + 0.4, tie[2] - 16.5]];
    headLayers.push({ t: "limb", segs: chain(tail, [2.3, 3.3, 2.7, 1.1], [L.hairMat, L.hairMat, L.hairMat]) });
    headLayers.push({ t: "line", d: smoothD(tail.map((p) => P([p[0] + 0.5, p[1] + 1, p[2]])).slice(1), false), cls: "es-strand" });
    headLayers.push({ t: "blob", d: cap([tie[0] - 0.2, tie[1] + 0.2, tie[2] + 0.2], 1.7, [tie[0] + 0.3, tie[1] + 0.9, tie[2] - 1.3], 1.7), mat: "dark" });
  }
  if (key === "B") {
    // Hood bunched at the nape (drawn over the neck), headphones: band over the crown, a cup on each ear.
    nearExtras.push({ t: "blob", d: smoothD(hullPts([...ring(cx, neckBase[1] + 4, seat + 42.5, 8.5, 4.4), ...ring(cx, neckBase[1] + 5.2, seat + 47.5, 6.2, 3)].map(P))), mat: "hoodie" });
    nearExtras.push({ t: "line", d: seam([[cx - 6, neckBase[1] + 6.8, seat + 45.5], [cx, neckBase[1] + 8.4, seat + 44.5], [cx + 6, neckBase[1] + 6.8, seat + 45.5]]), cls: "es-seam" });
    const bandR = HEAD_R + 1.2;
    const band = Array.from({ length: 17 }, (_, i): Vec3 => {
      const t = (i / 16) * Math.PI;
      return [head[0] + bandR * Math.cos(t), head[1] + 0.8, head[2] + 0.5 + bandR * 1.05 * Math.sin(t)];
    });
    nearExtras.push({ t: "line", d: smoothD(band.map(P), false), cls: "es-band" });
    nearExtras.push({ t: "line", d: smoothD(band.map(P), false), cls: "es-band-hi" });
    nearExtras.push({ t: "blob", d: cap([head[0] + HEAD_R * 0.9, head[1] + 0.8, head[2] - 0.5], 3.9, [head[0] + HEAD_R + 2.2, head[1] + 0.8, head[2] - 0.5], 3.6), mat: "dark" });
    nearExtras.push({ t: "blob", d: cap([head[0] + HEAD_R + 1.9, head[1] + 0.8, head[2] - 0.5], 2.6, [head[0] + HEAD_R + 2.5, head[1] + 0.8, head[2] - 0.5], 2.4), mat: "pad" });
  }
  if (key === "D") {
    // Glasses: the near temple arm runs from the front of the face to the top of the ear and hooks behind it;
    // the far arm shows as a short stroke at the far edge.
    const g = (x: number, y: number, z: number) => P([head[0] + x, head[1] + y, head[2] + z]);
    nearExtras.push({ t: "line", d: smoothD([g(HEAD_R * 0.93, -7.5, 0.6), g(HEAD_R * 1.02, -2.5, 0.9), g(HEAD_R * 1.06, 0.6, 0.7), g(HEAD_R * 0.98, 1.8, -1.4)], false), cls: "es-glasses" });
    nearExtras.push({ t: "line", d: pathD([g(HEAD_R * 0.92, -8.8, 0.4), g(HEAD_R * 0.75, -9.4, 0.2)]), cls: "es-glasses" });
  }

  const farGlasses: Layer[] =
    key === "D" ? [{ t: "line", d: smoothD([P([head[0] - HEAD_R * 0.93, head[1] - 7.5, head[2] + 0.6]), P([head[0] - HEAD_R * 1.03, head[1] - 2.5, head[2] + 0.9]), P([head[0] - HEAD_R * 1.04, head[1] + 0.6, head[2] + 0.7])], false), cls: "es-glasses" }] : [];

  // Back-to-front layers for the person (legs and seat handled by the scene, which interleaves the chair).
  return {
    mouse: far.mouse,
    legsFar: legs(-1),
    legsNear: legs(1),
    body: [
      { t: "limb", segs: [...far.arm.lower, ...far.arm.upper] } as Layer,
      { t: "limb", segs: near.lower } as Layer,
      ...(key === "B" ? [{ t: "blob", d: cap([head[0] - HEAD_R - 2.2, head[1] + 0.8, head[2] - 0.5], 3.6, [head[0] - HEAD_R * 0.9, head[1] + 0.8, head[2] - 0.5], 3.9), mat: "dark" } as Layer] : []),
      ...farGlasses,
      { t: "blob", d: torsoD, mat: L.shirt } as Layer,
      ...details,
      { t: "limb", segs: near.upper } as Layer,
      { t: "limb", segs: [neck] } as Layer,
      ...collarLayers,
      { t: "blob", d: headD, mat: "skin" } as Layer,
      ...(L.hair === "pony" ? headLayers : []),
      ...(L.hair !== "pony" ? headLayers : []),
      { t: "limb", segs: [ear] } as Layer,
      { t: "line", d: earIn, cls: "es-ear" } as Layer,
      ...nearExtras,
    ],
  };
}

// ---------- One desk scene per cell ----------

const DESK: DeskSpec = { rect: { x: -55, y: -50, w: 110, d: 110, r: 7 }, slabH: 10, legH: 48 };
const FLOOR = -(DESK.slabH + DESK.legH);
const FRONT = DESK.rect.y + DESK.rect.d; // 60
const LINE_X = -5;
const HOUSING: Rect = { x: LINE_X - 37, y: 0, w: 74, d: 4.5, r: 1 };
const H_Z0 = 12;
const H_Z1 = 54;
const SCREEN = { x0: LINE_X - 34, x1: LINE_X + 34, z0: 16, z1: 51 };
const STAND: Rect = { x: LINE_X - 12, y: -8, w: 24, d: 14, r: 3 };
const NECK: Rect = { x: LINE_X - 2.5, y: -3.5, w: 5, d: 3.5, r: 0.8 };
const KB_Y = FRONT - 15;
const CHAIR_Y = FRONT + 14;
const HIPS_Y = FRONT + 12;
const SEAT = FLOOR + CHAIR_SEAT_H;
export const WALL_SIZE = 3.2;
export const ENGRAVE = "ROLLIN-रोलिन-ROLLIN-रोलिन";
export const ENGRAVE_SIZE = 3.4;
export const LABEL_SIZE = 20;

// Grid cells: 2 columns x 2 rows, a label line under each.
const GAP = 14;
const CELL_W = (STAGE_W - GAP * 3) / 2;
const CELL_H = (STAGE_H - GAP * 3) / 2;
const UNIT: View = { origin: [0, 0], scale: 1, azimuth: AZIMUTH, elevation: 30 };
const box = (r: Rect, z0: number, z1: number): Vec3[] => rectCorners(r).flatMap(([x, y]): Vec3[] => [[x, y, z0], [x, y, z1]]);
const SCENE: Vec3[] = [...box(DESK.rect, FLOOR, 0), ...box(HOUSING, 0, H_Z1), ...box({ x: LINE_X - 20, y: FRONT - 20, w: 40, d: 52, r: 0 }, FLOOR, SEAT + 67)];
const su = SCENE.map((p) => project(p, UNIT));
const X0 = Math.min(...su.map((p) => p[0]));
const X1 = Math.max(...su.map((p) => p[0]));
const Y0 = Math.min(...su.map((p) => p[1]));
const Y1 = Math.max(...su.map((p) => p[1]));
const SCALE = Math.min((CELL_W - 8) / (X1 - X0), (CELL_H - LABEL_SIZE * 1.8 - 8) / (Y1 - Y0));

function cell(key: StyleKey, i: number) {
  const left = GAP + (i % 2) * (CELL_W + GAP);
  const topY = GAP + Math.floor(i / 2) * (CELL_H + GAP);
  const view: View = {
    origin: [left + CELL_W / 2 - ((X0 + X1) / 2) * SCALE, topY + (CELL_H - LABEL_SIZE * 1.8) / 2 - ((Y0 + Y1) / 2) * SCALE],
    scale: SCALE,
    azimuth: AZIMUTH,
    elevation: 30,
  };
  const at = (p: Vec3) => project(p, view);
  const fm = (p: Vec3) => frontMatrixIn(view, p);
  const desk = deskParts(view, DESK);
  const chair = chairParts(view, LINE_X, CHAIR_Y, FLOOR, key === "D" ? 0.22 : 0);
  const person = engineerParts(view, key, LINE_X, HIPS_Y, SEAT, FLOOR, KB_Y, FRONT);
  const pitch = (SCREEN.z1 - SCREEN.z0 - 3) / WALL_ROWS;
  return {
    key,
    desk,
    chair,
    person,
    keyboard: keyboardParts(view, LINE_X, KB_Y),
    monitor: {
      pool: flatCircle(LINE_X, 20, 42, 0.05, view, 48),
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
      rows: Array.from({ length: WALL_ROWS }, (_, r) => fm([LINE_X, HOUSING.y + HOUSING.d + 0.1, SCREEN.z1 - 1.5 - pitch * (r + 0.5) - WALL_SIZE * 0.36])),
    },
    // The page's one engraving: cell A's desk front face, right of the chair.
    engrave: i === 0 ? desk.engrave(28, ENGRAVE_SIZE) : null,
    label: { x: left + CELL_W / 2, y: topY + CELL_H - LABEL_SIZE * 0.35 },
    contacts: rectCorners(STAND).map(([x, y]) => at([x, y, 0])),
  };
}

export const cells = STYLES.map((k, i) => cell(k, i));
export const contacts = cells.flatMap((c) => c.contacts);
