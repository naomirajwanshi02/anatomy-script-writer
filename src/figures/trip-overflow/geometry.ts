// Arithmetic overflow: a board that is always on screen. Square for the analogy (a car instrument cluster with a 5-drum
// trip meter and a callout plate stand on it), stretched long for the circuit (rows A, B and sum of 8 bit tiles, carry
// chips behind row A, an XOR gate fed by the carries into and out of the sign column, and the overflow lamp V).
// Camera as hex-grouping: the circuit view at 95 % width, the analogy zoomed in by a camera transform.
import {
  boxCorners,
  cylinder,
  faceMatrix,
  fitView,
  flatCircle,
  flatPath,
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
  type SolidPaths,
  type Vec2,
  type Vec3,
  type View,
} from "../../iso/iso-kit";
import { bulbParts } from "../../iso/react/bulb";

export const STAGE_W = 600;
const AZIMUTH = 62;
const A = (AZIMUTH * Math.PI) / 180;
const E = (30 * Math.PI) / 180;
const PAD = 14;

// Board: square for the analogy, long for the circuit.
const SQUARE: Rect = { x: -63, y: -52, w: 126, d: 126, r: 7 };
const LONG: Rect = { x: -84, y: -70, w: 168, d: 105, r: 6 }; // deep at the back for the XOR wiring
const SLAB_H = 8;
const FOOT_H = 4;
export const boardRect = (s: number): Rect => ({
  x: SQUARE.x + (LONG.x - SQUARE.x) * s,
  y: SQUARE.y + (LONG.y - SQUARE.y) * s,
  w: SQUARE.w + (LONG.w - SQUARE.w) * s,
  d: SQUARE.d + (LONG.d - SQUARE.d) * s,
  r: SQUARE.r + (LONG.r - SQUARE.r) * s,
});

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
const PLATE: Rect = { x: -52, y: 34, w: 104, d: 34, r: 3 };
const PLATE_H = 3.5;
const LCD: Rect = { x: -49, y: 37, w: 98, d: 28, r: 2 };
const LCD_Z = PLATE_H + 0.1;
const CALL_X = 0;
const CALL_Y = 55.5; // character baseline
export const CALL_CHAR = 11.8;
const CALL_PITCH = 7.2;
export const CALL_LEN = 13; // "99999 -> 00000"

// Bit tiles: 8 columns (bit 7, the sign, on the left), rows A (back), B and sum (front). Carry chips sit in a row behind
// row A: chip k above column k - 1 holds the carry INTO that column; chip 0, left of the sign column, the carry out.
const TILE = 11;
const PITCH = 13;
const TILE_H = 4.5;
export const ROW_Y = [-21, -0.5, 20]; // row pitch 20.5
export const CHIP_Y = -36.5;
export const CHIP_SCALE = 0.55;
export const colX = (i: number) => (i - 3.5) * PITCH - 3; // i = 0..7, left to right
export const chipX = (k: number) => colX(k - 1) + (k === 0 ? 2 : 0);
export const CHAR_SIZE = 9.5;
// XOR gate at the back right, behind the carry chips, fed by the two carries at the sign column along straight rows;
// the overflow lamp V (glass bulb) right of it.
export const GATE: Rect = { x: 52, y: -59.5, w: 14, d: 14, r: 1 };
const GATE_H = 4;
export const VLAMP = { x: 74, y: -52.5, r: 5 };

// Stage: the circuit fills 95 % of the width; the analogy is drawn in the same view and zoomed in so the square board
// spans about 92 % of the frame; the zoom eases out as the board stretches long.
const CIRCUIT_PTS: Vec3[] = [...boxCorners(LONG, -SLAB_H - FOOT_H, 0), ...boxCorners({ x: colX(0) - 6, y: CHIP_Y - 4, w: colX(7) - colX(0) + 12, d: ROW_Y[2] - CHIP_Y + 10 }, 0, TILE_H), ...boxCorners({ x: VLAMP.x - 6, y: VLAMP.y - 6, w: 12, d: 12 }, 0, 18)];
const ANALOGY_PTS: Vec3[] = [...boxCorners(SQUARE, -SLAB_H - FOOT_H, 0), ...boxCorners(PLINTH, 0, F(0, topW(0) + HOOD.t, HOOD.front)[2])];
const circuitScale = fitView(CIRCUIT_PTS, STAGE_W, 300, { pad: PAD, azimuth: AZIMUTH }).scale;
const K = Math.sqrt(1.6);
const unitX = ([x, y]: Vec3) => (x * Math.sin(A) - y * Math.cos(A)) * K;
const unitY = ([x, y, z]: Vec3) => ((x * Math.cos(A) + y * Math.sin(A)) * Math.sin(E) - z * Math.cos(E)) * K;
const span = (pts: Vec3[], f: (p: Vec3) => number) => Math.max(...pts.map(f)) - Math.min(...pts.map(f));
const ZOOM_PAD = 9; // square board at ~92 % of the frame (stage = 95 % of the frame)
const ZOOM = (STAGE_W - ZOOM_PAD * 2) / (span(ANALOGY_PTS, unitX) * circuitScale);
export const STAGE_H = Math.ceil(Math.max(300, span(ANALOGY_PTS, unitY) * circuitScale * ZOOM + ZOOM_PAD * 2));
export const view = fitView(CIRCUIT_PTS, STAGE_W, STAGE_H, { pad: PAD, azimuth: AZIMUTH });

const at = (p: Vec3) => project(p, view);
const r3 = (v: number) => Math.round(v * 1e3) / 1e3;

// Camera zoom for board stretch s: analogy box centred and enlarged at s = 0, identity at s = 1 (as hex-grouping).
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

// Local 2D frame on a front face (+y plane): u along +x, v downward (-z), origin at p.
const frontMatrix = (p: Vec3) => {
  const o = at(p);
  const ax = at([p[0] + 1, p[1], p[2]]);
  const az = at([p[0], p[1], p[2] - 1]);
  return `matrix(${r3(ax[0] - o[0])} ${r3(ax[1] - o[1])} ${r3(az[0] - o[0])} ${r3(az[1] - o[1])} ${r3(o[0])} ${r3(o[1])})`;
};

const depth = ([x, y, z]: Vec3) => (x * Math.cos(A) + y * Math.sin(A)) * Math.cos(E) + z * Math.sin(E);
const backToFront = (pts: Vec2[]) => [...pts].sort((p, q) => depth([p[0], p[1], 0]) - depth([q[0], q[1], 0]));

// Board engraving on the front face, centred, upright; it follows the board as it stretches.
export const ENGRAVE = "ROLLIN-रोलिन-ROLLIN-रोलिन";
export const ENGRAVE_SIZE = 3.6;
export const boardEngrave = (s: number) => {
  const b = boardRect(s);
  return frontMatrix([b.x + b.w / 2, b.y + b.d, -SLAB_H / 2 - ENGRAVE_SIZE * 0.36]);
};

// Board markup for stretch s (rebuilt by the loop while it changes).
export function boardSvg(s: number) {
  const b = boardRect(s);
  const feetSvg = backToFront(rectCorners(b, 14))
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
    feetSvg +
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
  clip: columnClip({ x: PLINTH.x - 3, y: PLINTH.y - 2, w: PLINTH.w + 6, d: PLINTH.d + 14 }),
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
// Trip meter inside the speedometer face, below the hub: 5 drums.
export const ODO = { u: SPEEDO.u, top: SPEEDO.v + 4.8, h: 7.2, drumW: 4.1, gap: 0.3, char: 6.2 };
export const odoWidth = ODO.drumW * 5 + ODO.gap * 4;
export const odoLeft = ODO.u - odoWidth / 2;
// Tell-tale strip between the gauges: a column of 4.
export const LIGHTS = { u: 0, v0: -36, pitch: 7, size: 4.6 };
// Trip-reset knob on the housing front below the speedometer (right of the callout leader), with its label.
export const KNOB = { u: 31.5, w: 2.4, len: 3.2, r: 1.35 };
export const knob = {
  stem: pathD([at(F(KNOB.u, KNOB.w, 0)), at(F(KNOB.u, KNOB.w, KNOB.len))]),
  backFrame: faceMatrix2(KNOB.len - 0.6),
  capFrame: faceMatrix2(KNOB.len),
};
export const KNOB_LABEL = { u: KNOB.u + 2.6, v: -KNOB.w + 0.8, size: 2.1 };
// Brand badge on the binnacle's lower lip.
export const BADGE = { u: 0, v: -1.4, size: 2.8 };

// Callout plate.
export const callout = {
  plate: prism(PLATE, 0, PLATE_H, view, 4, 0.8),
  clip: columnClip(PLATE),
  lcd: flatRect(LCD, LCD_Z, view, 4),
  digit: (i: number) => faceMatrix([CALL_X + (i - (CALL_LEN - 1) / 2) * CALL_PITCH, CALL_Y], LCD_Z, view, "x"),
  // Warning box around the last five characters ("00000").
  warn: flatRect({ x: CALL_X + 1.5 * CALL_PITCH - 1, y: CALL_Y - CALL_CHAR * 0.9, w: CALL_PITCH * 5 + 2, d: CALL_CHAR * 1.12, r: 1.5 }, LCD_Z + 0.05, view, 3),
  // Leader: from the plate's back-right corner along the board to the foot of the binnacle, then up its lower lip to
  // the odometer window's lower edge, just in front of the glass.
  leader: pathD([at([PLATE.x + PLATE.w - 2, PLATE.y + 2, PLATE_H]), at(F(ODO.u, 0, 3)), at(F(ODO.u, -(ODO.top + ODO.h), 0.3))]),
  leaderEnds: [at([PLATE.x + PLATE.w - 2, PLATE.y + 2, PLATE_H]), at(F(ODO.u, -(ODO.top + ODO.h), 0.3))] as [number, number][],
};

// Clip for a part sinking into the board: its footprint at board level and everything straight above it.
function columnClip(r: Omit<Rect, "r">) {
  const c = rectCorners(r).map(([x, y]) => at([x, y, 0]));
  const up = c.map(([x, y]): [number, number] => [x, y - 4000]);
  const pts = [...c, ...up].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const crossZ = (o: number[], a: number[], b: number[]) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list: [number, number][]) => {
    const h: [number, number][] = [];
    for (const q of list) {
      while (h.length >= 2 && crossZ(h[h.length - 2], h[h.length - 1], q) <= 0) h.pop();
      h.push(q);
    }
    return h;
  };
  const lower = half(pts);
  const upper = half([...pts].reverse());
  return pathD([...lower.slice(0, -1), ...upper.slice(0, -1)], true);
}

const SINK_DEPTH = 64; // cluster and callout sink fully into the board
export const sinkTransform = (u: number) => translateTo(view, [0, 0, -u * SINK_DEPTH]);

// Tile solid centred at (x, y) on height z, footprint scale sc and height factor grow (0..1).
export function tileSolid(x: number, y: number, z: number, sc: number, grow: number) {
  const w = TILE * sc;
  const h = Math.max(0.05, TILE_H * sc * grow);
  const rect: Rect = { x: x - w / 2, y: y - w / 2, w, d: w, r: 1.2 * sc };
  return { paths: prism(rect, z, h, view, 3, Math.min(0.6, h / 4)), h: z + h };
}
export const tileText = (x: number, y: number, h: number, size: number) => faceMatrix([x, y + size * 0.36], h, view, "x");

// Overflow lamp V: the kit glass bulb; its V label engraved in front of it.
export const vlamp = {
  bulb: bulbParts([VLAMP.x, VLAMP.y], view, { baseR: VLAMP.r, h: 5 }),
  label: faceMatrix([VLAMP.x, VLAMP.y + VLAMP.r + 3 + 7 * 0.36], 0.02, view, "x"),
};

// XOR symbol in gate units (x -1..1 along the signal, y across), engraved on the gate top: OR body, the extra back
// curve, input and output leads.
const GX = GATE.x + GATE.w / 2;
const GY = GATE.y + GATE.d / 2;
const GU = 5.5;
const gp = ([x, y]: Vec2): Vec3 => [GX + x * GU, GY + y * GU, GATE_H + 0.02];
const backCurve = (dx: number): Vec2[] => Array.from({ length: 11 }, (_, i) => {
  const y = 0.55 - (1.1 * i) / 10;
  return [-0.62 + dx + 0.22 * (1 - (y / 0.55) ** 2), y];
});
const orBody = (): Vec2[] => {
  const pts: Vec2[] = [];
  for (let i = 0; i <= 12; i++) pts.push([-0.62 + 1.2 * (i / 12), -0.55 * Math.sqrt(1 - (i / 12) ** 2)]);
  for (let i = 12; i >= 0; i--) pts.push([-0.62 + 1.2 * (i / 12), 0.55 * Math.sqrt(1 - (i / 12) ** 2)]);
  return [...pts, ...backCurve(0).slice(1, -1)];
};
const gPath = (pts: Vec2[], close = false) => pathD(pts.map((p) => at(gp(p))), close);
// Inputs at y = -/+ IN_Y gate units: the carry out (back) on top, the carry in (front) below.
const IN_Y = 0.55;
export const xorGate = {
  halo: prismFill(inset(GATE, 1), 0.1, 0.1, view),
  body: prism(GATE, 0, GATE_H, view, 3, 0.6),
  symbol: gPath(orBody(), true) + gPath(backCurve(-0.18)),
  leads: gPath([[-1.2, -IN_Y * 0.55], [-0.5, -IN_Y * 0.55]]) + gPath([[-1.2, IN_Y * 0.55], [-0.5, IN_Y * 0.55]]) + gPath([[0.58, 0], [1.25, 0]]),
};

// Wires on the board from the two carry chips at the sign column back to two straight rows behind the chips, right to
// the gate, and from the gate to the lamp. Signals run left to right; the carry-out row lies behind the carry-in row,
// so they never cross.
const wz = 0.05;
const flat = (pts: Vec2[]) => flatPath(pts, wz, view);
const CHIP_BACK = CHIP_Y - (TILE * CHIP_SCALE) / 2;
// Wire rows 9 units apart (about 25 frame px), the front one 8.5 units behind the chips so chip tops never cover it.
const WIRE_GAP = 4.5;
const inY = (s: number) => GY + s * WIRE_GAP;
export const wires = {
  carryIn: flat([[chipX(1), CHIP_BACK], [chipX(1), inY(1)], [GX - 1.2 * GU, inY(1)]]),
  carryOut: flat([[chipX(0), CHIP_BACK], [chipX(0), inY(-1)], [GX - 1.2 * GU, inY(-1)]]),
  out: flat([[GX + 1.25 * GU, GY], [VLAMP.x - VLAMP.r, GY]]),
};

// SIGN engraved in front of the sign column (under the sum row).
export const signLabel = faceMatrix([colX(0), ROW_Y[2] + TILE / 2 + 3.2 + 4.5 * 0.36], 0.02, view, "x");

// Ghost sixth drum, left of the trip meter's five (face-frame units).
export const GHOST = { x: ODO.u - (ODO.drumW * 5 + ODO.gap * 4) / 2 - ODO.gap - ODO.drumW, fall: 12 };

// Drum i's centre in board coordinates (on the recessed face of the speedometer), where its tile lifts out.
export const drumCentre = (i: number): Vec3 => F(odoLeft + i * (ODO.drumW + ODO.gap) + ODO.drumW / 2, -(ODO.top + ODO.h / 2), 0.5);
export const DRUM_SCALE = ODO.drumW / TILE;

// Tile in flight from drum i (u = 0) to its place in row A (u = 1), arcing up and growing to full size. The 5 drums land
// on the 5 right-hand columns.
export const DRUM_COL0 = 3;
export function drumFlight(i: number, u: number) {
  const [sx, sy, sz] = drumCentre(i);
  const x = sx + (colX(i + DRUM_COL0) - sx) * u;
  const y = sy + (ROW_Y[0] - sy) * u;
  const z = sz + (0 - sz) * u + 22 * Math.sin(Math.PI * u);
  return { x, y, z, sc: DRUM_SCALE + (1 - DRUM_SCALE) * u };
}

// Engraved row labels left of each row (circuit only).
export const ROW_LABELS = ["A", "B", "sum"];
export const ROW_LABEL_SIZE = 7;
export const rowLabel = (r: number) => faceMatrix([colX(0) - 18, ROW_Y[r] + ROW_LABEL_SIZE * 0.36], 0.02, view, "x");

// Readout table position: just below the long board's front edge, as a fraction of the stage height.
export const TABLE_TOP = (Math.max(...boxCorners(LONG, -SLAB_H - FOOT_H, 0).map((q) => at(q)[1])) + 2) / STAGE_H;

// Entrance spark points: the binnacle plinth and callout plate corners.
export const contacts = [...rectCorners(PLINTH), ...rectCorners(PLATE)].map(([x, y]) => at([x, y, 0]));

