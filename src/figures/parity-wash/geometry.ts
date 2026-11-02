// Parity wash: a board that is always on screen. Square for the analogy (a front-loading washing machine, a tray of
// socks and a callout plate stand on it), stretched long for the circuit: the sent row (7 data tiles and the parity
// tile) at the back, one wire per bit down to the received row at the front, and the CHECK block with its lamp.
// Pairs are shown the same way in both halves: an arc over two counted items; the one left alone is outlined rust.
import {
  boxCorners,
  cylinder,
  faceMatrix,
  fitView,
  flatCircle,
  flatRect,
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
import { SLOTS } from "./model";

export const STAGE_W = 600;
const AZIMUTH = 62;
const PAD = 14;
const A = (AZIMUTH * Math.PI) / 180;
const E = (30 * Math.PI) / 180;

// Board: square for the analogy, long for the circuit.
const SQUARE: Rect = { x: -63, y: -63, w: 126, d: 126, r: 7 };
const LONG: Rect = { x: -100, y: -42, w: 196, d: 76, r: 6 };
const SLAB_H = 8;
const FOOT_H = 4;
export const boardRect = (s: number): Rect => ({
  x: SQUARE.x + (LONG.x - SQUARE.x) * s,
  y: SQUARE.y + (LONG.y - SQUARE.y) * s,
  w: SQUARE.w + (LONG.w - SQUARE.w) * s,
  d: SQUARE.d + (LONG.d - SQUARE.d) * s,
  r: SQUARE.r + (LONG.r - SQUARE.r) * s,
});

// Washing machine (board units): cabinet on four short feet, front face at y = FRONT_Y.
const FEET_H = 2.4;
const CAB: Rect = { x: -34, y: -50, w: 68, d: 42, r: 4 };
const CAB_H = 78;
const FRONT_Y = CAB.y + CAB.d;
const TOP_Z = FEET_H + CAB_H;
const SINK_DEPTH = TOP_Z + 12;
const PANEL = { x0: -31, x1: 31, z0: TOP_Z - 15, z1: TOP_Z - 3 };
const DIAL = { x: -21, z: (PANEL.z0 + PANEL.z1) / 2, r: 4.4 };
const LAMP_Z = PANEL.z1 - 4;
const SPIN_X = 13;
const CHECK_X = 24;
const DOOR = { x: 0, z: FEET_H + 31, r: 25 };
const GLASS_R = 17.5;
const MOUTH_R = GLASS_R + 1.5;
const HINGE_X = DOOR.x - DOOR.r - 1;
const DOOR_OPEN = (95 * Math.PI) / 180;

// Laundry tray in front of the machine, one slot per sock that went in.
const SLOT_W = 9.5;
const TRAY: Rect = { x: -62, y: -1, w: SLOTS * SLOT_W + 4, d: 22, r: 2.5 };
const TRAY_H = 3;
const SOCK_H = 2.6;

// Callout plate on the board's front right, with a blue LCD strip.
const PLATE: Rect = { x: 6, y: 30, w: 52, d: 28, r: 3 };
const PLATE_H = 3.5;
const LCD: Rect = { x: 9, y: 33, w: 46, d: 22, r: 2 };
const LCD_Z = PLATE_H + 0.1;
export const CALL_SIZE = [4.6, 7];

// Circuit: the sent row (back) and the received row (front), 8 tiles each, one wire per bit between them; the CHECK
// block right of the received row; labels in front.
const TILE = 15;
const PITCH = 17.5;
const TILE_H = 5;
const TILE_TRAVEL = 80;
export const TILE_CHAR = 12;
const ROW_Y = [-26, 8]; // 0 = sent, 1 = received
const tileX = (i: number) => -84 + PITCH * i;
const PANEL_C: Rect = { x: 54, y: ROW_Y[1] - 10, w: 32, d: 20, r: 2.5 };
const PANEL_H = 6;
const LAMP_C: Vec2 = [PANEL_C.x + PANEL_C.w / 2, ROW_Y[1]];
export const LABEL_SIZE = 6;
const WIRE_Y0 = ROW_Y[0] + TILE / 2 + 0.6;
const WIRE_Y1 = ROW_Y[1] - TILE / 2 - 0.6;

// Stage: the circuit fits the width; the analogy is drawn in the same view and zoomed in by a camera transform so the
// square board also spans the width; the zoom eases out as the board stretches long.
const CIRCUIT_PTS: Vec3[] = boxCorners(LONG, -SLAB_H - FOOT_H, 0);
const ANALOGY_PTS: Vec3[] = [...boxCorners(SQUARE, -SLAB_H - FOOT_H, 0), ...boxCorners(CAB, 0, TOP_Z + 2)];
const unitView = { origin: [0, 0] as Vec2, scale: 1, azimuth: AZIMUTH, elevation: 30 };
const spanOf = (pts: Vec3[], c: 0 | 1) => {
  const v = pts.map((p) => project(p, unitView)[c]);
  return Math.max(...v) - Math.min(...v);
};
const circuitScale = (STAGE_W - PAD * 2) / spanOf(CIRCUIT_PTS, 0);
const ZOOM_PAD = 24;
const ZOOM = (STAGE_W - ZOOM_PAD * 2) / (spanOf(ANALOGY_PTS, 0) * circuitScale);
export const STAGE_H = Math.ceil(Math.max(spanOf(CIRCUIT_PTS, 1) * circuitScale + PAD * 2, spanOf(ANALOGY_PTS, 1) * circuitScale * ZOOM + ZOOM_PAD * 2));
export const view = fitView(CIRCUIT_PTS, STAGE_W, STAGE_H, { pad: PAD, azimuth: AZIMUTH });

const at = (p: Vec3) => project(p, view);
const r3 = (v: number) => Math.round(v * 1e3) / 1e3;
const f1 = (v: number) => v.toFixed(1);

const ANALOGY_BOX = (() => {
  const p = ANALOGY_PTS.map(at);
  const xs = p.map(([x]) => x);
  const ys = p.map(([, y]) => y);
  return { cx: (Math.min(...xs) + Math.max(...xs)) / 2, cy: (Math.min(...ys) + Math.max(...ys)) / 2 };
})();
export const zoomTransform = (s: number) => {
  const k = s * s * (3 - 2 * s);
  const z = ZOOM + (1 - ZOOM) * k;
  const tx = (1 - k) * (STAGE_W / 2 - ZOOM * ANALOGY_BOX.cx);
  const ty = (1 - k) * (STAGE_H / 2 - ZOOM * ANALOGY_BOX.cy);
  return `translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${z.toFixed(4)})`;
};

// Text on a front face (+y), reading along +x, upright along +z.
const frontMatrix = (p: Vec3) => {
  const o = at(p);
  const ax = at([p[0] + 1, p[1], p[2]]);
  const az = at([p[0], p[1], p[2] - 1]);
  return `matrix(${r3(ax[0] - o[0])} ${r3(ax[1] - o[1])} ${r3(az[0] - o[0])} ${r3(az[1] - o[1])} ${r3(o[0])} ${r3(o[1])})`;
};
const F = (x: number, z: number, lift = 0): Vec3 => [x, FRONT_Y + lift, z];
const frontPoly = (pts: Vec2[], lift = 0, close = true) => pathD(pts.map(([x, z]) => at(F(x, z, lift))), close);
const circle = (cx: number, cz: number, r: number, seg = 48): Vec2[] =>
  Array.from({ length: seg }, (_, i) => [cx + r * Math.cos((i / seg) * Math.PI * 2), cz + r * Math.sin((i / seg) * Math.PI * 2)]);

// Engraving on the board's front face (+y), centred, upright; it follows the board as it stretches.
export const ENGRAVE = "ROLLIN-रोलिन-ROLLIN-रोलिन";
export const ENGRAVE_SIZE = 3.6;
export const boardEngrave = (s: number) => {
  const b = boardRect(s);
  return frontMatrix([b.x + b.w / 2, b.y + b.d, -SLAB_H / 2 - ENGRAVE_SIZE * 0.36]);
};

const depth = ([x, y, z]: Vec3) => (x * Math.cos(A) + y * Math.sin(A)) * Math.cos(E) + z * Math.sin(E);
const backToFront = (pts: Vec2[]) => [...pts].sort((p, q) => depth([p[0], p[1], 0]) - depth([q[0], q[1], 0]));

// Board markup for stretch s (rebuilt by the loop while it changes).
export function boardSvg(s: number) {
  const b = boardRect(s);
  const feet = backToFront(rectCorners(b, 14))
    .map(([x, y]) => solidSvg(cylinder(x, y, 5, -SLAB_H - FOOT_H, FOOT_H, view, 24, 0.4), { tone: "lo" }))
    .join("");
  const rings = rectCorners(b, 7)
    .map(([x, y]) => flatCircle(x, y, 1.8, 0, view, 14))
    .join("");
  const screws = rectCorners(b, 7)
    .map(([x, y]) => {
      const [sx, sy] = at([x, y, 0]);
      return `<circle cx="${f1(sx)}" cy="${f1(sy)}" r="0.5"/>`;
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
}

// 2D convex hull (screen points), for sink clips.
function hull(points: Vec2[]): Vec2[] {
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: Vec2, a: Vec2, b: Vec2) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list: Vec2[]) => {
    const h: Vec2[] = [];
    for (const p of list) {
      while (h.length >= 2 && cross(h[h.length - 2], h[h.length - 1], p) <= 0) h.pop();
      h.push(p);
    }
    return h;
  };
  const lower = half(pts);
  const upper = half([...pts].reverse());
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}
// Clip for a part sinking into the board: its footprint at board level and everything straight above it.
function columnClip(r: Rect) {
  const c = rectCorners(r).map(([x, y]) => at([x, y, 0]));
  const up = c.map(([x, y]): Vec2 => [x, y - 4000]);
  return pathD(hull([...c, ...up]), true);
}
export const sinkTransform = (u: number) => translateTo(view, [0, 0, -u * SINK_DEPTH]);
// Machine offset: creep along x plus the spin shake.
export const shakeTransform = (creep: number, [sx, sy, sz]: [number, number, number]) => translateTo(view, [creep + sx, sy, sz]);

function roundRect(x0: number, z0: number, x1: number, z1: number, r: number): Vec2[] {
  const pts: Vec2[] = [];
  const corners: [number, number, number][] = [
    [x1 - r, z1 - r, 0],
    [x0 + r, z1 - r, Math.PI / 2],
    [x0 + r, z0 + r, Math.PI],
    [x1 - r, z0 + r, Math.PI * 1.5],
  ];
  for (const [cx, cz, a0] of corners)
    for (let k = 0; k <= 5; k++) pts.push([cx + r * Math.cos(a0 + (k / 5) * (Math.PI / 2)), cz + r * Math.sin(a0 + (k / 5) * (Math.PI / 2))]);
  return pts;
}

// Sock outline lying on its side, in (u, v): v runs down the leg from the cuff (0) to the heel, u across toward the toe.
const LEG_W = 3.6;
const LEG_L = 15;
const FOOT_L = 7.6;
const FOOT_W = 4;
const HEEL_R = 2.2;
const CUFF_L = 2.6;
function sockOutline(): Vec2[] {
  const pts: Vec2[] = [
    [0, 0],
    [LEG_W, 0],
    [LEG_W, LEG_L - FOOT_W],
    [FOOT_L - FOOT_W / 2, LEG_L - FOOT_W],
  ];
  for (let i = 1; i < 10; i++) {
    const th = -Math.PI / 2 + (Math.PI * i) / 10;
    pts.push([FOOT_L - FOOT_W / 2 + (FOOT_W / 2) * Math.cos(th), LEG_L - FOOT_W / 2 + (FOOT_W / 2) * Math.sin(th)]);
  }
  pts.push([FOOT_L - FOOT_W / 2, LEG_L]);
  for (let i = 0; i <= 6; i++) {
    const th = Math.PI / 2 + (Math.PI / 2) * (i / 6);
    pts.push([HEEL_R + HEEL_R * Math.cos(th), LEG_L - HEEL_R + HEEL_R * Math.sin(th)]);
  }
  return pts;
}
const SOCK = sockOutline();
const CUFF: Vec2[] = [[-0.15, -0.15], [LEG_W + 0.15, -0.15], [LEG_W + 0.15, CUFF_L], [-0.15, CUFF_L]];

// A flat polygon slab on the board plane: visible walls (by facing, back to front), then the top face.
function slabSvg(poly: Vec2[], z: number, h: number, topClass: string) {
  const n = poly.length;
  let area = 0;
  for (let i = 0; i < n; i++) area += poly[i][0] * poly[(i + 1) % n][1] - poly[(i + 1) % n][0] * poly[i][1];
  const sign = area > 0 ? 1 : -1;
  const walls: { d: number; svg: string }[] = [];
  for (let i = 0; i < n; i++) {
    const p = poly[i];
    const q = poly[(i + 1) % n];
    const nx = (q[1] - p[1]) * sign;
    const ny = -(q[0] - p[0]) * sign;
    const facing = nx * Math.cos(A) + ny * Math.sin(A);
    if (facing <= 0) continue;
    const len = Math.hypot(nx, ny) || 1;
    const cls = ny / len > 0.7 ? "pw-wall-a" : "pw-wall-b";
    const quad = pathD([at([p[0], p[1], z]), at([q[0], q[1], z]), at([q[0], q[1], z + h]), at([p[0], p[1], z + h])], true);
    walls.push({ d: depth([(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, z]), svg: `<path class="${cls}" d="${quad}"/>` });
  }
  walls.sort((a, b) => a.d - b.d);
  const top = pathD(poly.map(([x, y]) => at([x, y, z + h])), true);
  return walls.map((w) => w.svg).join("") + `<path class="${topClass}" d="${top}"/>`;
}

// Tray sock k: hanging upright from a peg on the rack bar over its slot, side-on to the camera (front face +y), cuff
// at the top, toe pointing right. tone: "black" or "white".
const slotX = (k: number) => TRAY.x + 2 + k * SLOT_W;
const RACK_Y = TRAY.y + TRAY.d / 2;
const SOCK_T = 1.6; // sock thickness along -y
const BAR_Z = TRAY_H + 1 + LEG_L + 2; // rack bar height
const SOCK_TOP = BAR_Z - 1.2; // cuff top, just under the bar
const standing = (k: number, lift: number, pts: Vec2[]) => pts.map(([u, v]) => at([slotX(k) + 0.9 + u, RACK_Y - lift, SOCK_TOP - v]));
export const sockSvg = (k: number, tone: string) => {
  const back = pathD(standing(k, SOCK_T, SOCK), true);
  const front = pathD(standing(k, 0, SOCK), true);
  const cuff = pathD(standing(k, -0.05, CUFF), true);
  const peg = pathD(standing(k, -0.3, [[1.1, 1.6], [LEG_W - 1.1, 1.6], [LEG_W - 1.1, -2.6], [1.1, -2.6]]), true);
  return `<path class="pw-sock-back pw-${tone}" d="${back}"/><path class="pw-sock-front pw-${tone}" d="${front}"/><path class="pw-sock-cuff pw-${tone}" d="${cuff}"/><path class="pw-peg" d="${peg}"/>`;
};
const sockHome = (k: number): Vec3 => [slotX(k) + 0.9 + LEG_W / 2, RACK_Y, SOCK_TOP - LEG_L / 2];
// Rack over the tray: two posts at its ends and the bar the socks hang from.
const rackX = [TRAY.x + 1.2, TRAY.x + TRAY.w - 1.2];
export const rack = {
  posts: rackX.map((x) => pathD([at([x, RACK_Y, TRAY_H]), at([x, RACK_Y, BAR_Z + 1.5])])).join(""),
  bar: pathD([at([rackX[0], RACK_Y, BAR_Z + 1.5]), at([rackX[1], RACK_Y, BAR_Z + 1.5])]),
};
const mouth = (k: number): Vec3 => [DOOR.x + (k - 3.5) * 1.6, FRONT_Y + 2, DOOR.z - 3];
// Flight offset for a sock hopping between its slot and the drum mouth (u 0 = slot, 1 = mouth), and the spare's drop.
export function sockFlight(k: number, u: number) {
  const a = sockHome(k);
  const b = mouth(k);
  const p = a.map((v, i) => v + (b[i] - v) * u) as Vec3;
  p[2] += 22 * Math.sin(Math.PI * u);
  return translateTo(view, [p[0] - a[0], p[1] - a[1], p[2] - a[2]]);
}
export const sockDrop = (up: number) => translateTo(view, [0, 0, up * 45]);

// Slot outline on the tray floor (the sock left alone in rust, the empty slot in red dashes).
const slotRect = (k: number): Rect => ({ x: slotX(k) + 0.3, y: TRAY.y + 1.8, w: SLOT_W - 0.6, d: TRAY.d - 3.6, r: 1 });
export const slotOutline = (k: number) => flatRect(slotRect(k), TRAY_H + 0.05, view, 3);
// Arc over two items: a hand-drawn-looking bridge in the air between their centres.
const arcPath = (a: Vec3, b: Vec3, h: number) =>
  pathD(Array.from({ length: 17 }, (_, i): Vec2 => {
    const u = i / 16;
    return at([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u + h * Math.sin(Math.PI * u)]);
  }));
export const sockArc = (i: number, j: number) => {
  const a = sockHome(i);
  const b = sockHome(j);
  return arcPath([a[0], a[1], BAR_Z + 4], [b[0], b[1], BAR_Z + 4], 6 + 0.6 * Math.abs(j - i) * SLOT_W * 0.3);
};

export const tray = {
  body: prism(TRAY, 0, TRAY_H, view, 4, 0.6),
  floor: flatRect(inset(TRAY, 1.6), TRAY_H, view, 4),
  dividers: Array.from({ length: SLOTS - 1 }, (_, k) => pathD([at([slotX(k + 1), TRAY.y + 1.6, TRAY_H]), at([slotX(k + 1), TRAY.y + TRAY.d - 1.6, TRAY_H])])).join(""),
  clip: columnClip(inset(TRAY, -2)),
};

// Machine: static parts.
const dialTicks = Array.from({ length: 11 }, (_, i) => {
  const th = Math.PI * (1.25 - (1.5 * i) / 10);
  const r0 = DIAL.r + 1;
  const r1 = DIAL.r + (i % 5 === 0 ? 2.6 : 1.9);
  return frontPoly(
    [
      [DIAL.x + r0 * Math.cos(th), DIAL.z + r0 * Math.sin(th)],
      [DIAL.x + r1 * Math.cos(th), DIAL.z + r1 * Math.sin(th)],
    ],
    0.2,
    false,
  );
}).join("");
export const dialPointer = (u: number) => {
  const th = Math.PI * 0.75 - u * ((Math.PI * 2) / 3);
  return frontPoly([[DIAL.x, DIAL.z], [DIAL.x + (DIAL.r - 0.6) * Math.cos(th), DIAL.z + (DIAL.r - 0.6) * Math.sin(th)]], 0.75, false);
};

export const machine = {
  halo: prismFill(inset(CAB, -2), 0, 0.1, view),
  feet: backToFront(rectCorners(CAB, 6)).map(([x, y]) => cylinder(x, y, 2.6, 0, FEET_H, view, 16, 0.4)),
  body: prism(CAB, FEET_H, CAB_H, view, 6, 1.4),
  panel: frontPoly(roundRect(PANEL.x0, PANEL.z0, PANEL.x1, PANEL.z1, 2), 0.15),
  panelLine: frontPoly([[CAB.x + 2, PANEL.z0 - 2.5], [CAB.x + CAB.w - 2, PANEL.z0 - 2.5]], 0.05, false),
  dialShadow: frontPoly(circle(DIAL.x + 0.5, DIAL.z - 0.6, DIAL.r, 32), 0.2),
  dial: frontPoly(circle(DIAL.x, DIAL.z, DIAL.r, 32), 0.6),
  dialCap: frontPoly(circle(DIAL.x, DIAL.z, DIAL.r - 1.4, 28), 0.7),
  dialTicks,
  spin: frontPoly(circle(SPIN_X, LAMP_Z, 1.7, 20), 0.3),
  check: frontPoly(circle(CHECK_X, LAMP_Z, 1.7, 20), 0.3),
  spinText: frontMatrix(F(SPIN_X, LAMP_Z - 3.8, 0.25)),
  checkText: frontMatrix(F(CHECK_X, LAMP_Z - 3.8, 0.25)),
  brand: frontMatrix(F(-3, DIAL.z - 1.6, 0.25)),
  // Drum mouth (behind the door) and its clip.
  mouthRim: frontPoly(circle(DOOR.x, DOOR.z, MOUTH_R + 1.2, 64), 0.08),
  mouth: frontPoly(circle(DOOR.x, DOOR.z, MOUTH_R, 64), 0.1),
  drumBack: frontPoly(circle(DOOR.x, DOOR.z, MOUTH_R - 4, 56), 0.11),
  clip: columnClip(inset(CAB, -5)),
  // Soft blue glow pool on the board around the machine.
  pool: flatCircle(0, -14, 66, 0.05, view, 64),
};
export const PANEL_TEXT = 2.3;
export const BRAND_SIZE = 4.4;

// Water surface z(x) in the drum (water kit formula), x relative to the drum centre.
const surf = (x: number, base: number, amp: number, t: number, ph: number) => base + amp * (0.7 * Math.sin(0.55 * x - 3.1 * t + ph) + 0.3 * Math.sin(1.3 * x + 2.3 * t + 2 * ph));
const wavy = (base: number, amp: number, t: number, ph: number, half: number, n = 36): Vec2[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const x = -half + (2 * half * i) / n;
    return [DOOR.x + x, surf(x, base, amp, t, ph)];
  });

// Sock in the front-face plane, centred at (cx, cz), rotated by ang.
function sockFront(cx: number, cz: number, ang: number, s: number, tone: string) {
  const mid: Vec2 = [FOOT_L / 2, LEG_L / 2];
  const rot = ([u, v]: Vec2): Vec2 => {
    const a = (u - mid[0]) * s;
    const b = -(v - mid[1]) * s;
    return [cx + a * Math.cos(ang) - b * Math.sin(ang), cz + a * Math.sin(ang) + b * Math.cos(ang)];
  };
  return `<path class="pw-sock-in pw-${tone}" d="${frontPoly(SOCK.map(rot), 0.12)}"/><path class="pw-sock-cuff pw-${tone}" d="${frontPoly(CUFF.map(rot), 0.13)}"/>`;
}

// Drum interior markup: perforations and lifters turning with the drum, socks tumbling, water with bubbles.
// lost: the sock being eaten (index) and its progress 0..1 (rust flash, then it fades out), or -1.
export function drumSvg(m: { turns: number; speed: number; water: number; slosh: number; lt: number; inDrum: boolean[]; tones: string[]; lostK: number; lost: number }) {
  const ang = -m.turns * Math.PI * 2;
  const holes = Array.from({ length: 14 }, (_, i) => {
    const th = ang + (i / 14) * Math.PI * 2;
    return frontPoly(circle(DOOR.x + (MOUTH_R - 2) * Math.cos(th), DOOR.z + (MOUTH_R - 2) * Math.sin(th), 0.7, 8), 0.115);
  }).join("");
  const lifters = [0, 1, 2]
    .map((i) => {
      const th = ang + (i / 3) * Math.PI * 2;
      const c = Math.cos(th);
      const s = Math.sin(th);
      const pts: Vec2[] = [
        [-1.4, MOUTH_R - 0.5],
        [1.4, MOUTH_R - 0.5],
        [0.8, MOUTH_R - 4.5],
        [-0.8, MOUTH_R - 4.5],
      ].map(([a, r]): Vec2 => [DOOR.x + r * c - a * s, DOOR.z + r * s + a * c]);
      return frontPoly(pts, 0.116);
    })
    .join("");
  const lift = Math.min(1, m.speed / 1.2);
  const socks = m.inDrum
    .map((on, k) => {
      if (!on) return "";
      const heap: Vec2 = [-9 + k * 2.6, -11 + (k % 2) * 3];
      const th = ang * 0.9 + (k / 8) * Math.PI * 2;
      const R = 10.5 + (k % 3) * 1.4;
      const ring: Vec2 = [R * Math.cos(th), R * Math.sin(th)];
      const bob = m.speed > 0.05 && lift < 1 ? 2.5 * Math.abs(Math.sin(2.4 * m.lt + k * 1.3)) : 0;
      const x = heap[0] + (ring[0] - heap[0]) * lift;
      const z = heap[1] + (ring[1] - heap[1]) * lift + bob;
      const svg = sockFront(DOOR.x + x, DOOR.z + z, k * 0.9 + ang * (0.6 + 0.4 * lift), 0.85, m.tones[k]);
      if (k !== m.lostK || m.lost < 0) return svg;
      return `<g class="pw-lost" style="opacity:${(m.lost < 0.5 ? 1 : 2 - 2 * m.lost).toFixed(3)}">${svg}</g>`;
    })
    .join("");
  let water = "";
  if (m.water > 0.01) {
    const base = DOOR.z - MOUTH_R - 1 + m.water * (MOUTH_R + 2.5);
    const half = MOUTH_R + 1;
    const top = wavy(base, m.slosh * Math.min(1, m.water * 2), m.lt, 0.8, half);
    const body = frontPoly([...top, [DOOR.x + half, DOOR.z - MOUTH_R - 3], [DOOR.x - half, DOOR.z - MOUTH_R - 3]], 0.14);
    const ripples = [frontPoly(wavy(base - 5, 0.6, m.lt * 1.2, 2.1, 12, 24), 0.15, false), frontPoly(wavy(base - 10.5, 0.5, m.lt * 0.9, 3.4, 9, 20), 0.15, false)].join("");
    const span = Math.max(1, base - (DOOR.z - MOUTH_R));
    const bubbles = Array.from({ length: 8 }, (_, i) => {
      const x = -12 + ((i * 7.3) % 24);
      const z = DOOR.z - MOUTH_R + ((m.lt * (3 + (i % 3)) + i * 2.7) % span);
      const r = 0.6 + (i % 3) * 0.25;
      return frontPoly(circle(DOOR.x + x + 0.8 * Math.sin(m.lt * 3 + i), z, r, 10), 0.16);
    }).join("");
    water = `<path class="pw-water" d="${body}"/><path class="pw-surface" d="${frontPoly(top, 0.15, false)}"/><path class="pw-ripple" d="${ripples}"/><path class="pw-bubble" d="${bubbles}"/>`;
  }
  return `<path class="pw-hole" d="${holes}"/><path class="pw-lifter" d="${lifters}"/>${socks}${water}`;
}

// Door markup for swing u (0 shut .. 1 open): the ring and glass turn about the hinge on the left.
export function doorSvg(u: number) {
  const th = u * DOOR_OPEN;
  const P = ([x, z]: Vec2, lift: number): Vec2 => {
    const dx = x - HINGE_X;
    return at([HINGE_X + dx * Math.cos(th) - lift * Math.sin(th), FRONT_Y + dx * Math.sin(th) + lift * Math.cos(th), z]);
  };
  const poly = (pts: Vec2[], lift: number, close = true) => pathD(pts.map((p) => P(p, lift)), close);
  const shine = Array.from({ length: 14 }, (_, i): Vec2 => {
    const a = Math.PI * (0.62 + (0.32 * i) / 13);
    return [DOOR.x + (GLASS_R - 2.6) * Math.cos(a), DOOR.z + (GLASS_R - 2.6) * Math.sin(a)];
  });
  const hinge = poly(roundRect(HINGE_X - 1.5, DOOR.z - 7, HINGE_X + 2.5, DOOR.z + 7, 1.4), 0.6);
  return (
    `<path class="pw-hinge" d="${hinge}"/>` +
    (u < 0.02 ? `<path class="pw-door-shadow" d="${poly(circle(DOOR.x + 0.8, DOOR.z - 1, DOOR.r, 64), 0.1)}"/>` : "") +
    `<path class="pw-ring0" d="${poly(circle(DOOR.x, DOOR.z, DOOR.r, 64), 0.5) + poly(circle(DOOR.x, DOOR.z, GLASS_R, 64), 0.5)}"/>` +
    `<path class="pw-ring1" d="${poly(circle(DOOR.x, DOOR.z, DOOR.r - 2.2, 64), 0.6) + poly(circle(DOOR.x, DOOR.z, GLASS_R, 64), 0.6)}"/>` +
    `<path class="pw-ring2" d="${poly(circle(DOOR.x, DOOR.z, DOOR.r - 4.6, 64), 0.7) + poly(circle(DOOR.x, DOOR.z, GLASS_R, 64), 0.7)}"/>` +
    `<path class="pw-glass" d="${poly(circle(DOOR.x, DOOR.z, GLASS_R, 64), 0.4)}"/>` +
    `<path class="pw-shine" d="${poly(shine, 0.5, false)}"/>` +
    `<path class="pw-handle" d="${poly(roundRect(DOOR.x + DOOR.r - 3, DOOR.z - 6, DOOR.x + DOOR.r + 1.5, DOOR.z + 6, 1.6), 0.9)}"/>`
  );
}

// Callout: plate, blue LCD strip, two lines, red dashed warning box around line 2.
const L1: Vec2 = [LCD.x + LCD.w / 2, LCD.y + 7];
const L2: Vec2 = [LCD.x + LCD.w / 2, LCD.y + 16];
export const callout = {
  plate: prism(PLATE, 0, PLATE_H, view, 4, 0.8),
  lcd: flatRect(LCD, LCD_Z, view, 4),
  lines: [faceMatrix([L1[0], L1[1] + CALL_SIZE[0] * 0.36], LCD_Z + 0.1, view, "x"), faceMatrix([L2[0], L2[1] + CALL_SIZE[1] * 0.36], LCD_Z + 0.1, view, "x")],
  warn: flatRect({ x: L2[0] - 14, y: L2[1] - 4.8, w: 28, d: 9.6, r: 1.2 }, LCD_Z + 0.08, view, 3),
  // Leader from the plate's back-left corner, lifted, to the tray's right end (clear of the machine).
  leader: pathD([at([PLATE.x + 3, PLATE.y + 3, PLATE_H]), at([TRAY.x + TRAY.w + 2, TRAY.y + TRAY.d + 2, 9]), at([TRAY.x + TRAY.w - 1, TRAY.y + TRAY.d / 2, TRAY_H + 0.3])]),
  leaderEnds: [at([PLATE.x + 3, PLATE.y + 3, PLATE_H]), at([TRAY.x + TRAY.w - 1, TRAY.y + TRAY.d / 2, TRAY_H + 0.3])] as [number, number][],
  clip: columnClip(inset(PLATE, -2)),
};

// Circuit: tiles of both rows, wires, parity outline, alone and wrong outlines, "?" marks, CHECK block and lamp, labels.
const tileRect = (row: number, i: number): Rect => ({ x: tileX(i) - TILE / 2, y: ROW_Y[row] - TILE / 2, w: TILE, d: TILE, r: 1.2 });
export function tileSolid(row: number, i: number, up: number, grow: number) {
  const z = up * TILE_TRAVEL;
  const h = Math.max(0.05, TILE_H * grow);
  return { paths: prism(tileRect(row, i), z, h, view, 3, Math.min(0.6, h / 4)), text: faceMatrix([tileX(i), ROW_Y[row] + TILE_CHAR * 0.36], z + h, view, "x") };
}
// Pair arc over two tiles of a row, and the outline round a tile's foot (the one left alone).
export const tileArc = (row: number, i: number, j: number) => arcPath([tileX(i), ROW_Y[row], TILE_H + 1], [tileX(j), ROW_Y[row], TILE_H + 1], 7 + 0.9 * Math.abs(j - i));
export const tileOutline = (row: number, i: number) => flatRect(inset(tileRect(row, i), -2), 0.06, view, 3);
// A bit on its wire at u (0 sent row .. 1 received row).
export const dotAt = (i: number, u: number) => at([tileX(i), WIRE_Y0 + (WIRE_Y1 - WIRE_Y0) * u, 0.3]);
const recvRow: Rect = { x: tileX(0) - TILE / 2 - 3, y: ROW_Y[1] - TILE / 2 - 3, w: tileX(SLOTS - 1) - tileX(0) + TILE + 6, d: TILE + 6, r: 2 };
export const circuit = {
  wires: Array.from({ length: SLOTS }, (_, i) => pathD([at([tileX(i), WIRE_Y0, 0.05]), at([tileX(i), WIRE_Y1, 0.05])])).join(""),
  parity: flatRect(inset(tileRect(0, SLOTS - 1), -2), 0.05, view, 3),
  wrong: flatRect(recvRow, 0.06, view, 3),
  unknown: Array.from({ length: SLOTS }, (_, i) => at([tileX(i), ROW_Y[1], TILE_H + 9])),
  panel: prism(PANEL_C, 0, PANEL_H, view, 4, 0.6),
  lampBase: cylinder(LAMP_C[0], LAMP_C[1], 6, PANEL_H, 1.4, view, 28, 0.3),
  lamp: cylinder(LAMP_C[0], LAMP_C[1], 4.4, PANEL_H + 1.4, 2.4, view, 28, 0.6),
  lampPool: flatCircle(LAMP_C[0], LAMP_C[1] + 4, 22, 0.05, view, 40),
  link: pathD([at([tileX(SLOTS - 1) + TILE / 2 + 0.6, ROW_Y[1], 0.05]), at([PANEL_C.x - 0.5, ROW_Y[1], 0.05])]),
  labels: [
    { text: "sent", m: faceMatrix([PANEL_C.x + PANEL_C.w / 2, ROW_Y[0] + LABEL_SIZE * 0.36], 0.05, view, "x") },
    { text: "received", m: faceMatrix([(tileX(0) + tileX(SLOTS - 2)) / 2, ROW_Y[1] + TILE / 2 + 9], 0.05, view, "x") },
    { text: "parity", m: faceMatrix([tileX(SLOTS - 1), ROW_Y[1] + TILE / 2 + 9], 0.05, view, "x") },
    { text: "CHECK", m: faceMatrix([LAMP_C[0], PANEL_C.y + PANEL_C.d + 8], 0.05, view, "x") },
  ],
};
// Noise spark: a zig-zag bolt from above onto the middle of bit i's wire; travel u 0..1 then a burst b 0..1.
export const sparkSvg = (i: number, u: number, b: number) => boltSvg([tileX(i), (WIRE_Y0 + WIRE_Y1) / 2, 0.3], u, b);
function boltSvg(end: Vec3, u: number, b: number) {
  const pts: Vec3[] = [
    [end[0] - 26, end[1] - 14, 70],
    [end[0] - 12, end[1] - 6, 52],
    [end[0] - 18, end[1] - 4, 40],
    [end[0] - 4, end[1] - 2, 24],
    [end[0] - 9, end[1], 16],
    end,
  ];
  if (u >= 0) {
    const n = pts.length - 1;
    const f = u * n;
    const k = Math.min(n - 1, Math.floor(f));
    const head = pts[k].map((v, j) => v + (pts[k + 1][j] - v) * (f - k)) as Vec3;
    const trail = [...pts.slice(Math.max(0, k - 1), k + 1), head].map(at);
    const [hx, hy] = at(head);
    return `<path class="pw-bolt" d="${pathD(trail)}"/><circle class="pw-spark-head" cx="${f1(hx)}" cy="${f1(hy)}" r="2.6"/>`;
  }
  if (b >= 0) {
    const [cx, cy] = at(end);
    const rays = Array.from({ length: 8 }, (_, j) => {
      const a = (j / 8) * Math.PI * 2 + 0.3;
      const r0 = 3 + 10 * b;
      const r1 = r0 + 6 * (1 - b);
      return `M${f1(cx + r0 * Math.cos(a))} ${f1(cy + r0 * Math.sin(a) * 0.6)}L${f1(cx + r1 * Math.cos(a))} ${f1(cy + r1 * Math.sin(a) * 0.6)}`;
    }).join("");
    return `<path class="pw-burst" style="opacity:${(1 - b).toFixed(3)}" d="${rays}"/>`;
  }
  return "";
}

// Entrance spark points: machine feet, tray and callout plate corners.
export const contacts = [...rectCorners(CAB, 6), ...rectCorners(TRAY), ...rectCorners(PLATE)].map(([x, y]) => at([x, y, 0]));

// Table position: just below the long board's front edge, as a fraction of the stage height.
export const TABLE_TOP = (Math.max(...boxCorners(LONG, -SLAB_H - FOOT_H, 0).map((p) => at(p)[1])) + 10) / STAGE_H;

// Sock colour per slot: pairs share a colour (black, white), the spare matches the odd one out.
export const SOCK_TONES = ["black", "black", "white", "white", "black", "black", "white", "white"];
