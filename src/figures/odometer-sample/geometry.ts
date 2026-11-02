// Odometer still sample: a square board (always on screen) with a car instrument cluster pod standing on it and a
// callout plate on the front right. Same camera as hex-grouping's analogy (azimuth 62, square board ~92 % of frame).
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
  type Rect,
  type SolidPaths,
  type Vec2,
  type Vec3,
} from "../../iso/iso-kit";

export const STAGE_W = 600;
const AZIMUTH = 62;
const A = (AZIMUTH * Math.PI) / 180;
const E = (30 * Math.PI) / 180;
// Board at ~92 % of the frame: the stage is 95 % of the frame wide, so pad (1 - 92/95) / 2 of the stage width.
const PAD = Math.round((STAGE_W * (1 - 0.92 / 0.95)) / 2);

const SQUARE: Rect = { x: -63, y: -52, w: 126, d: 126, r: 7 };
const SLAB_H = 8;
const FOOT_H = 4;

// Instrument cluster binnacle (board units). The face is a plane tilted TILT back from vertical; face coordinates
// (u, w): u along +x, w up the face from its bottom edge at (y = FACE_Y0, z = ZB). s is the offset along the face normal.
const TILT = (25 * Math.PI) / 180;
const ZB = 3; // plinth top
const FACE_Y0 = -8;
const DEPTH = 14; // housing depth behind the face, along -y
const HOUSING = { u0: -48, u1: 48 };
const topW = (u: number) => 46 + 4 * (1 - (u / 48) ** 2);
const PLINTH: Rect = { x: -50, y: -44, w: 100, d: 39, r: 5 };
const HOOD = { back: -4, front: 12, t: 5, from: 30 }; // along the normal; band thickness; ends wrap down to w = from
const N: Vec3 = [0, Math.cos(TILT), Math.sin(TILT)];
const F = (u: number, w: number, s = 0): Vec3 => [u, FACE_Y0 - w * Math.sin(TILT) + s * N[1], ZB + w * Math.cos(TILT) + s * N[2]];
// Callout plate on the board's front right, with a blue LCD strip.
const PLATE: Rect = { x: -38, y: 34, w: 92, d: 34, r: 3 };
const PLATE_H = 3.5;
const LCD: Rect = { x: -34, y: 37, w: 84, d: 28, r: 2 };
const LCD_Z = PLATE_H + 0.1;
const CALL_X = 8;
const CALL_Y = 58; // digit baseline
export const CALL_CHAR = 19;
const CALL_PITCH = 14;

const PTS: Vec3[] = [...boxCorners(SQUARE, -SLAB_H - FOOT_H, 0), ...boxCorners(PLINTH, 0, F(0, topW(0) + HOOD.t, HOOD.front)[2])];
const K = Math.sqrt(1.6);
const unitY = ([x, y, z]: Vec3) => ((x * Math.cos(A) + y * Math.sin(A)) * Math.sin(E) - z * Math.cos(E)) * K;
const spanY = Math.max(...PTS.map(unitY)) - Math.min(...PTS.map(unitY));
const widthScale = fitView(PTS, STAGE_W, 4000, { pad: PAD, azimuth: AZIMUTH }).scale;
export const STAGE_H = Math.ceil(spanY * widthScale + PAD * 2);
export const view = fitView(PTS, STAGE_W, STAGE_H, { pad: PAD, azimuth: AZIMUTH });

const at = (p: Vec3) => project(p, view);
const r3 = (v: number) => Math.round(v * 1e3) / 1e3;

// Local 2D frame on a front face (+y plane): u along +x, v downward (-z), origin at p.
const frontMatrix = (p: Vec3) => {
  const o = at(p);
  const ax = at([p[0] + 1, p[1], p[2]]);
  const az = at([p[0], p[1], p[2] - 1]);
  return `matrix(${r3(ax[0] - o[0])} ${r3(ax[1] - o[1])} ${r3(az[0] - o[0])} ${r3(az[1] - o[1])} ${r3(o[0])} ${r3(o[1])})`;
};

const depth = ([x, y, z]: Vec3) => (x * Math.cos(A) + y * Math.sin(A)) * Math.cos(E) + z * Math.sin(E);
const backToFront = (pts: Vec2[]) => [...pts].sort((p, q) => depth([p[0], p[1], 0]) - depth([q[0], q[1], 0]));

// Board engraving on the front face, centred, upright.
export const ENGRAVE = "ROLLIN-रोलिन-ROLLIN-रोलिन";
export const ENGRAVE_SIZE = 3.6;
export const boardEngrave = frontMatrix([SQUARE.x + SQUARE.w / 2, SQUARE.y + SQUARE.d, -SLAB_H / 2 - ENGRAVE_SIZE * 0.36]);

export function boardSvg() {
  const b = SQUARE;
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
}

// Solid between a front ring and a back ring of 3D points built from a face profile (u, w), counter-clockwise.
// Faces are shaded like the kit's prisms; the front cap is the lit "top". The kit only extrudes rects along z.
const VIEW_DIR: Vec3 = [Math.cos(A) * Math.cos(E), Math.sin(A) * Math.cos(E), Math.sin(E)];
const WDIR: Vec3 = [0, -Math.sin(TILT), Math.cos(TILT)];
const sub = (p: Vec3, q: Vec3): Vec3 => [p[0] - q[0], p[1] - q[1], p[2] - q[2]];
const dot = (p: Vec3, q: Vec3) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];
const cross = (p: Vec3, q: Vec3): Vec3 => [p[1] * q[2] - p[2] * q[1], p[2] * q[0] - p[0] * q[2], p[0] * q[1] - p[1] * q[0]];
function ringSolid(profile: Vec2[], front3: Vec3[], back3: Vec3[]): SolidPaths {
  const n = profile.length;
  const front = front3.map(at);
  const back = back3.map(at);
  const facing = profile.map(([u, w], i) => {
    const [u1, w1] = profile[(i + 1) % n];
    // In-plane outward normal (dw, -du) of a counter-clockwise profile, in 3D.
    const out: Vec3 = [w1 - w, -(u1 - u) * WDIR[1], -(u1 - u) * WDIR[2]];
    let nrm = cross(sub(front3[(i + 1) % n], front3[i]), sub(back3[i], front3[i]));
    if (dot(nrm, out) < 0) nrm = [-nrm[0], -nrm[1], -nrm[2]];
    const len = Math.hypot(nrm[0], nrm[1], nrm[2]) || 1;
    return dot(nrm, VIEW_DIR) / len;
  });
  const fill = [pathD(front, true)];
  const shades: string[][] = [[], [], [], []];
  const outline = [pathD(front, true)];
  for (let i = 0; i < n; i++) {
    if (facing[i] <= 1e-6) continue;
    const j = (i + 1) % n;
    const quad = pathD([front[i], front[j], back[j], back[i]], true);
    fill.push(quad);
    shades[Math.min(3, Math.max(0, Math.floor((1 - facing[i]) * 4)))].push(quad);
    outline.push(pathD([back[i], back[j]]));
    if (facing[(i + n - 1) % n] <= 1e-6) outline.push(pathD([front[i], back[i]]));
    if (facing[j] <= 1e-6) outline.push(pathD([front[j], back[j]]));
  }
  return { fill: fill.join(""), outline: outline.join(""), crease: "", top: pathD(front, true), shades: shades.map((x) => x.join("")) };
}

// Binnacle outline in face coordinates, counter-clockwise: rounded lower corners, rounded upper ends, arched top.
// side/top inset the outline; bottom sets the lowest w.
function outline(side: number, top: number, bottom: number): Vec2[] {
  const u0 = HOUSING.u0 + side;
  const u1 = HOUSING.u1 - side;
  const rb = 5;
  const rt = 9;
  const pts: Vec2[] = [];
  const arc = (cu: number, cw: number, r: number, a0: number, a1: number) => {
    for (let i = 0; i <= 6; i++) {
      const a = a0 + ((a1 - a0) * i) / 6;
      pts.push([cu + r * Math.cos(a), cw + r * Math.sin(a)]);
    }
  };
  arc(u0 + rb, bottom + rb, rb, Math.PI, 1.5 * Math.PI);
  arc(u1 - rb, bottom + rb, rb, 1.5 * Math.PI, 2 * Math.PI);
  arc(u1 - rt, topW(u1 - rt) - top - rt, rt, 0, Math.PI / 2);
  for (let i = 1; i < 16; i++) {
    const u = u1 - rt - ((u1 - u0 - 2 * rt) * i) / 16;
    pts.push([u, topW(u) - top]);
  }
  arc(u0 + rt, topW(u0 + rt) - top - rt, rt, Math.PI / 2, Math.PI);
  return pts;
}

// Hood: an arched band over the top and round both ends, wrapping down to w = HOOD.from, just outside the binnacle.
function hoodProfile(): Vec2[] {
  const ring = outline(0, 0, 0);
  const normals = ring.map((_, i): Vec2 => {
    const a = ring[(i + ring.length - 1) % ring.length];
    const b = ring[(i + 1) % ring.length];
    const du = b[0] - a[0];
    const dw = b[1] - a[1];
    const l = Math.hypot(du, dw) || 1;
    return [dw / l, -du / l];
  });
  // Upper part of the ring (after the two lower corners), from the right end over the top to the left end.
  const idx = ring.map((_, i) => i).filter((i) => i >= 14 && ring[i][1] >= HOOD.from);
  const off = (i: number, d: number): Vec2 => [ring[i][0] + normals[i][0] * d, ring[i][1] + normals[i][1] * d];
  const inner = idx.map((i) => off(i, 0.4));
  const outer = idx.map((i) => off(i, 0.4 + HOOD.t));
  // Counter-clockwise: the outer edge right to left over the top, back along the inner edge left to right.
  return [...outer, ...inner.reverse()];
}

const housingRing = outline(0, 0, 0);
const lipRing = outline(1.8, 1.8, 4.8);
const openRing = outline(3, 3, 6);
const hoodRing = hoodProfile();
const FACE_S = -1.2; // recessed dark face
const face2 = (ring: Vec2[], s: number) => pathD(ring.map(([u, w]) => at(F(u, w, s))), true);

// Local 2D frame on the face plane at offset s: x = u, y = -w (down the face).
const faceMatrix2 = (s: number) => {
  const o = at(F(0, 0, s));
  const a = at(F(1, 0, s));
  const b = at(F(0, -1, s));
  return `matrix(${r3(a[0] - o[0])} ${r3(a[1] - o[1])} ${r3(b[0] - o[0])} ${r3(b[1] - o[1])} ${r3(o[0])} ${r3(o[1])})`;
};

export const pod = {
  halo: prismFill({ ...PLINTH, x: PLINTH.x - 2, y: PLINTH.y - 2, w: PLINTH.w + 4, d: PLINTH.d + 4 }, 0, 0.1, view),
  plinth: prism(PLINTH, 0, ZB, view, 5, 0.6),
  housing: ringSolid(housingRing, housingRing.map(([u, w]) => F(u, w)), housingRing.map(([u, w]) => sub(F(u, w), [0, DEPTH, 0]))),
  hood: ringSolid(hoodRing, hoodRing.map(([u, w]) => F(u, w, HOOD.front)), hoodRing.map(([u, w]) => F(u, w, HOOD.back))),
  lip: face2(lipRing, 0.02),
  opening: face2(openRing, 0.04),
  face: face2(openRing, FACE_S),
  faceFrame: faceMatrix2(FACE_S),
  lipFrame: faceMatrix2(0.05),
  pool: flatCircle(0, -24, 80, 0.05, view, 56),
};

// Face layout in face-frame units (x = u, y = -w).
export const GAUGE_R = 17.5;
export const TACHO = { u: -24.5, v: -25.8, max: 8, red: 6, sweep: 240 };
// The speedometer sweeps 200 degrees so its 0 and 200 sit level with the hub, clear of the large odometer window.
export const SPEEDO = { u: 24.5, v: -25.8, max: 200, sweep: 200 };
type At = { u: number; v: number; sweep: number };
// Gauge angle (radians, maths convention) for value k on a 0..max dial: g.sweep degrees clockwise, symmetric about the top.
export const gaugeAngle = (g: At, k: number, max: number) => ((90 + g.sweep / 2 - (g.sweep * k) / max) * Math.PI) / 180;
export const gaugePoint = (g: At, k: number, max: number, r: number): Vec2 => [g.u + r * Math.cos(gaugeAngle(g, k, max)), g.v - r * Math.sin(gaugeAngle(g, k, max))];
export const gaugeArc = (g: At, k0: number, k1: number, max: number, r: number) => {
  const p0 = gaugePoint(g, k0, max, r);
  const p1 = gaugePoint(g, k1, max, r);
  return `M${p0[0].toFixed(2)} ${p0[1].toFixed(2)}A${r} ${r} 0 0 1 ${p1[0].toFixed(2)} ${p1[1].toFixed(2)}`;
};
// Glass shine: a thin arc on the upper left of each gauge.
export const shineArc = (g: At) => {
  const r = GAUGE_R - 2.6;
  const p = (deg: number) => `${(g.u + r * Math.cos((deg * Math.PI) / 180)).toFixed(2)} ${(g.v - r * Math.sin((deg * Math.PI) / 180)).toFixed(2)}`;
  return `M${p(165)}A${r} ${r} 0 0 1 ${p(105)}`;
};
// Odometer inside the speedometer face, below the hub.
export const ODO = { u: SPEEDO.u, top: SPEEDO.v + 4.4, h: 8, drumW: 5, gap: 0.4, char: 6.8 };
export const odoWidth = ODO.drumW * 4 + ODO.gap * 3;
export const odoLeft = ODO.u - odoWidth / 2;
// Tell-tale strip between the gauges: a column of 4.
export const LIGHTS = { u: 0, v0: -36, pitch: 7, size: 4.6 };
// Brand badge on the binnacle's lower lip.
export const BADGE = { u: 0, v: -1.4, size: 2.8 };

// Callout plate.
export const callout = {
  plate: prism(PLATE, 0, PLATE_H, view, 4, 0.8),
  lcd: flatRect(LCD, LCD_Z, view, 4),
  digit: (i: number) => faceMatrix([CALL_X + (i - 1.5) * CALL_PITCH, CALL_Y], LCD_Z, view, "x"),
  warn: flatRect({ x: CALL_X - 2 * CALL_PITCH - 1, y: CALL_Y - CALL_CHAR * 0.9, w: CALL_PITCH * 4 + 2, d: CALL_CHAR * 1.12, r: 1.5 }, LCD_Z + 0.05, view, 3),
  // Leader from the plate's top-right corner up the pod's right side to the odometer window's lower-right corner.
  // Leader: from the plate's back-right corner along the board to the foot of the binnacle, then up its lower lip to
  // the odometer window's lower edge, just in front of the glass.
  leader: pathD([at([PLATE.x + PLATE.w - 2, PLATE.y + 2, PLATE_H]), at(F(ODO.u, 0, 3)), at(F(ODO.u, -(ODO.top + ODO.h), 0.3))]),
  leaderEnds: [at([PLATE.x + PLATE.w - 2, PLATE.y + 2, PLATE_H]), at(F(ODO.u, -(ODO.top + ODO.h), 0.3))] as [number, number][],
};

// Entrance spark points: the binnacle plinth and callout plate corners.
export const contacts = [...rectCorners(PLINTH), ...rectCorners(PLATE)].map(([x, y]) => at([x, y, 0]));
