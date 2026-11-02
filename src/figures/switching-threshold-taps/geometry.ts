// Switching threshold as two taps: one board (always on screen). x runs right, y toward the viewer (front face +y), z up.
// Water: a high tank on a four-leg stand (back left, ROLLIN maker's plate); its fill pipe drops down a leg, runs low
// along the back to the fill tap, rises behind the tall glass output tank and pours in from a spout. A wide drain pipe
// (2.5x the narrow fill pipe) leaves the tank's front through the drain tap and pours into a drain basin. One big handle
// (left) drives both tap wheels through a short low linkage (attachment on the handle -> link bar at x = LINK_X -> wheels).
// Circuit (same board): VDD rail where the fill pipe runs, GND rail where the basin sits, PMOS valve at the fill tap,
// NMOS valve at the drain tap, gate wires where the linkage runs, straps along x = COL with the output node joined to the
// glass tank (which stays the output) by a bus.
import { boxCorners, cylinder, faceMatrix, fitView, flatCircle, flatPath, flatRect, inset, pathD, prism, prismFill, project, rectCorners, translateTo, type Rect, type Vec2, type Vec3, type View } from "../../iso/iso-kit";
import { waterBox } from "../../iso/analogy/water";

export const STAGE_W = 600;
const AZIMUTH = 62;
const PAD = 2;

// Board.
export const BOARD: Rect = { x: -66, y: -60, w: 136, d: 116, r: 5 };
const SLAB_H = 6;

// Column of taps / valves and the glass output tank.
// The tank stands right of the valve column (off its line of sight), so nothing on the column hides behind it.
const COL = 14;
const OUT: Rect = { x: 47, y: -14, w: 18, d: 16, r: 1.2 };
const TX = OUT.x + OUT.w / 2;
const NODE_Y = OUT.y + OUT.d / 2; // drain pipe / output node row
const PLINTH_H = 14;
const OUT_H = 44;
const OUT_TOP = PLINTH_H + OUT_H;
const PIPE_Z = PLINTH_H + 2.5; // centre of both low pipes
export const FILL_W = 2; // narrow fill pipe (x WP for the widened pipe)
export const DRAIN_W = 5;
const FILL_TAP_Y = -30;
const DRAIN_TAP_Y = 18;
const TAP_SIZE = 8;
const WHEEL_R = 4.2;
const WHEEL_Z = PIPE_Z + TAP_SIZE / 2 + 2; // wheel bottom
export const LINK_Z = WHEEL_Z + 1.6;
// High tank on its stand.
const SUP: Rect = { x: -56, y: -56, w: 34, d: 20, r: 1.2 };
const STAND_H = OUT_TOP + 4;
const SUP_H = 13;
const DROP_X = -26;
const DROP_Y = SUP.y + SUP.d / 2;
const RISER_Y = OUT.y - 5;
const SPOUT_Y = OUT.y + 6;
const SPOUT_Z = OUT_TOP + 1;
const RISE_Z = OUT_TOP + 4;
// Drain mouth and basin.
const MOUTH_Y = 35;
const BASIN: Rect = { x: 3, y: 31, w: 22, d: 18, r: 1.2 };
const BASIN_H = 4;
const BASIN_LEVEL = 0.4;
// Handle (lever).
const LEVER = { x: -46, y: 12, pivotZ: 7.5, len: 26 }; // front left: its knob stays clear of the VDD label
const LINK_X = -3;
// Circuit.
const VDD_Y = -46;
const GND_Y = 43;
const RAIL_D = 5;
const RAIL_X0 = -49;
const RAIL_X1 = 66;
const VALVE = { unit: 10, d: 10, h: 5 };
const PIN_X = -3;

const corners: Vec3[] = [...boxCorners(BOARD, -SLAB_H, 0), ...boxCorners(SUP, 0, STAND_H + SUP_H + 1)];
const unit: View = fitView(corners, STAGE_W, 10000, { pad: PAD, azimuth: AZIMUTH });
const ys = corners.map((p) => project(p, unit)[1]);
export const STAGE_H = Math.ceil(Math.max(...ys) - Math.min(...ys) + PAD * 2);
export const view = fitView(corners, STAGE_W, STAGE_H, { pad: PAD, azimuth: AZIMUTH });
export const at = (p: Vec3) => project(p, view);
const P = (pts: Vec3[], close = false) => pathD(pts.map(at), close);
export const K = Math.sqrt(1.6) * view.scale; // stage px per board unit (roughly)
const r3 = (v: number) => Math.round(v * 1e3) / 1e3;
// Text standing in a front plane (constant y), reading along +x, baseline centred at height z.
const frontText = (x: number, y: number, z: number, size: number) => {
  const p: Vec3 = [x, y, z - size * 0.36];
  const o = at(p);
  const ax = at([p[0] + 1, p[1], p[2]]);
  const az = at([p[0], p[1], p[2] - 1]);
  return `matrix(${r3(ax[0] - o[0])} ${r3(ax[1] - o[1])} ${r3(az[0] - o[0])} ${r3(az[1] - o[1])} ${r3(o[0])} ${r3(o[1])})`;
};
const fRect = (y: number, x0: number, x1: number, z0: number, z1: number) => P([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], true);
const grow = (r: Rect, by: number): Rect => inset(r, -by);
const face = (x: number, y: number) => faceMatrix([x, y], 0, view, "x");

const pipeX = (x0: number, x1: number, y: number, zc: number, d: number) => prism({ x: Math.min(x0, x1), y: y - d / 2, w: Math.abs(x1 - x0), d, r: 0.4 }, zc - d / 2, d, view, 2, 0.2);
const pipeY = (y0: number, y1: number, x: number, zc: number, d: number) => prism({ x: x - d / 2, y: Math.min(y0, y1), w: d, d: Math.abs(y1 - y0), r: 0.4 }, zc - d / 2, d, view, 2, 0.2);
const pipeZ = (x: number, y: number, z0: number, z1: number, d: number) => cylinder(x, y, d / 2, z0, z1 - z0, view, 16, 0.2);

export const ENGRAVE = "ROLLIN-रोलिन-ROLLIN-रोलिन";
export const ENGRAVE_SIZE = 3.6;

export const board = {
  halo: prismFill(BOARD, -SLAB_H, SLAB_H, view),
  slab: prism(BOARD, -SLAB_H, SLAB_H, view, 5, 0.8),
  groove: flatRect(inset(BOARD, 3), 0, view),
  screws: rectCorners(BOARD, 5).map(([x, y]) => at([x, y, 0])),
  engraveAt: frontText(BOARD.x + BOARD.w / 2, BOARD.y + BOARD.d, -SLAB_H / 2, ENGRAVE_SIZE),
};

// ---------- Water half ----------

const legs = rectCorners(SUP, 2.2);
export const supply = {
  backLegs: legs.slice(0, 2).map(([x, y]) => cylinder(x, y, 1.4, 0, STAND_H - 2, view, 14)),
  frontLegs: legs.slice(2).map(([x, y]) => cylinder(x, y, 1.4, 0, STAND_H - 2, view, 14)),
  feet: legs.map(([x, y]) => cylinder(x, y, 2.4, 0, 1, view, 18, 0.2)),
  brace: fRect(SUP.y + SUP.d - 2.2, legs[2][0], legs[3][0], STAND_H * 0.42, STAND_H * 0.42 + 1.4),
  braceBack: fRect(SUP.y + 2.2, legs[0][0], legs[1][0], STAND_H * 0.42, STAND_H * 0.42 + 1.4),
  platform: prism(grow(SUP, 1), STAND_H - 2, 2, view, 3, 0.3),
  glass: prism(SUP, STAND_H, SUP_H, view, 4, 0.3),
  outline: prism(SUP, STAND_H, SUP_H, view, 4, 0.3).outline,
  plate: fRect(SUP.y + SUP.d + 0.1, SUP.x + 9, SUP.x + SUP.w - 9, STAND_H + 1.6, STAND_H + 7.6),
  plateRivets: [SUP.x + 10.2, SUP.x + SUP.w - 10.2].map((x) => at([x, SUP.y + SUP.d + 0.1, STAND_H + 4.6])),
  brandAt: frontText(SUP.x + SUP.w / 2, SUP.y + SUP.d + 0.15, STAND_H + 4.6, 4.2),
  vddAt: frontText(SUP.x + SUP.w / 2, SUP.y + SUP.d + 0.15, STAND_H + SUP_H - 3.2, 5),
  // "Half as high": the tank on a stand of half the height (outline only).
  halfGhost: prism(SUP, STAND_H / 2, SUP_H, view, 4, 0.3).outline + fRect(SUP.y + SUP.d, legs[2][0] - 1.4, legs[2][0] + 1.4, 0, STAND_H / 2) + fRect(SUP.y + SUP.d, legs[3][0] - 1.4, legs[3][0] + 1.4, 0, STAND_H / 2),
};
export const BRAND_SIZE = 4.2;
export const SUP_BOX = { rect: SUP, h: SUP_H, shift: translateTo(view, [0, 0, STAND_H]) };

// Fill pipe of width d (rebuilt while it widens): drop, low run, the tap's run, riser, top run, spout.
export function fillPipe(d: number) {
  return [
    pipeZ(DROP_X, DROP_Y, PIPE_Z - d / 2, STAND_H, d),
    pipeX(DROP_X - d / 2, COL + d / 2, DROP_Y, PIPE_Z, d),
    pipeY(DROP_Y + d / 2, FILL_TAP_Y - TAP_SIZE / 2, COL, PIPE_Z, d),
    pipeY(FILL_TAP_Y + TAP_SIZE / 2, RISER_Y + d / 2, COL, PIPE_Z, d),
    pipeX(COL - d / 2, TX + d / 2, RISER_Y, PIPE_Z, d),
    pipeZ(TX, RISER_Y, PIPE_Z, RISE_Z + d / 2, d),
    pipeY(RISER_Y - d / 2, SPOUT_Y + d / 2, TX, RISE_Z, d),
    pipeZ(TX, SPOUT_Y, SPOUT_Z, RISE_Z, d + 0.6),
  ];
}
// Highlight outline round the fill pipe (glow beats).
export const fillGlow = (d: number) => fillPipe(d).map((s) => s.outline).join("");

// A tap: body block round the pipe, stem, wheel; the handle bar turns with `open` (0 across the pipe, 1 along it).
function tapParts(y: number) {
  const body = prism({ x: COL - TAP_SIZE / 2, y: y - TAP_SIZE / 2, w: TAP_SIZE, d: TAP_SIZE, r: 0.8 }, PIPE_Z - TAP_SIZE / 2, TAP_SIZE, view, 3, 0.4);
  const stem = cylinder(COL, y, 0.9, PIPE_Z + TAP_SIZE / 2, 2, view, 12);
  const wheel = cylinder(COL, y, WHEEL_R, WHEEL_Z, 1.2, view, 28, 0.3);
  return { body, stem, wheel, y };
}
export const taps = { fill: tapParts(FILL_TAP_Y), drain: tapParts(DRAIN_TAP_Y) };
export function tapBar(y: number, open: number) {
  const a = Math.PI / 2 - (open * Math.PI) / 2;
  const r = WHEEL_R + 1.2;
  const z = WHEEL_Z + 1.25;
  return P([[COL - Math.cos(a) * r, y - Math.sin(a) * r, z], [COL + Math.cos(a) * r, y + Math.sin(a) * r, z]]);
}
export const tapHub = (y: number) => at([COL, y, WHEEL_Z + 1.25]);
export const tapRing = (y: number) => flatCircle(COL, y, WHEEL_R + 2.2, WHEEL_Z + 0.6, view, 28);

export const out = {
  plinth: prism(grow(OUT, 1.6), 0, PLINTH_H, view, 3, 0.4),
  glass: prism(OUT, PLINTH_H, OUT_H, view, 10, 0.4),
  half: flatRect(OUT, PLINTH_H + OUT_H / 2, view, 10),
  halfTicks: [OUT.x + 2.5, OUT.x + OUT.w - 2.5].map((x) => P([[x, OUT.y + OUT.d, PLINTH_H + OUT_H / 2 - 1.6], [x, OUT.y + OUT.d, PLINTH_H + OUT_H / 2 + 1.6]])).join(""),
  halfText: frontText(OUT.x + 2.2, OUT.y + OUT.d + 0.1, PLINTH_H + OUT_H / 2 + 3.8, 4.2),
};
export const OUT_BOX = { rect: OUT, h: OUT_H, shift: translateTo(view, [0, 0, PLINTH_H]) };
// Ring at the water surface (level pulses).
export const levelRing = (level: number) => flatRect(grow(OUT, 0.6), PLINTH_H + Math.max(0.3, level * OUT_H), view, 10);

export const drain = {
  // Run from the tank's left face (drawn before the tank, so its end tucks behind the glass).
  back: pipeX(COL - DRAIN_W / 2, OUT.x + 0.5, NODE_Y, PIPE_Z, DRAIN_W),
  run: [
    pipeY(NODE_Y + DRAIN_W / 2, DRAIN_TAP_Y - TAP_SIZE / 2, COL, PIPE_Z, DRAIN_W),
    pipeY(DRAIN_TAP_Y + TAP_SIZE / 2, MOUTH_Y, COL, PIPE_Z, DRAIN_W),
  ],
  basin: prism(BASIN, 0, BASIN_H, view, 4, 0.3),
};
export const BASIN_BOX = { rect: BASIN, h: BASIN_H, level: BASIN_LEVEL };

// Falling streams: centre lines (fill: spout to the water surface; drain: an arc from the mouth into the basin).
export const fillStream = (level: number) => P([[TX, SPOUT_Y, SPOUT_Z], [TX, SPOUT_Y, PLINTH_H + level * OUT_H + 0.3]]);
export const drainStream = P([
  [COL, MOUTH_Y, PIPE_Z],
  [COL, MOUTH_Y + 2.2, PIPE_Z - 2],
  [COL, MOUTH_Y + 3.6, PIPE_Z - 6],
  [COL, MOUTH_Y + 4.4, BASIN_LEVEL * BASIN_H + 0.3],
]);
// In / out flow arrows (length in board units).
export function arrows(inLen: number, outLen: number) {
  const ix = OUT.x + OUT.w + 4;
  const iz = OUT_TOP + 10;
  const head = (tip: Vec3, dir: Vec3, side: Vec3) => {
    const b: Vec3 = [tip[0] - dir[0] * 2.6, tip[1] - dir[1] * 2.6, tip[2] - dir[2] * 2.6];
    return P([[b[0] + side[0] * 1.8, b[1] + side[1] * 1.8, b[2] + side[2] * 1.8], tip, [b[0] - side[0] * 1.8, b[1] - side[1] * 1.8, b[2] - side[2] * 1.8]]);
  };
  const inTip: Vec3 = [ix, SPOUT_Y, iz - inLen];
  const ox = COL + DRAIN_W / 2 + 4;
  const outTip: Vec3 = [ox, MOUTH_Y - 12 + outLen, PIPE_Z];
  return {
    in: inLen > 0.3 ? P([[ix, SPOUT_Y, iz], inTip]) + head(inTip, [0, 0, -1], [1, 0, 0]) : "",
    out: outLen > 0.3 ? P([[ox, MOUTH_Y - 12, PIPE_Z], outTip]) + head(outTip, [0, 1, 0], [1, 0, 0]) : "",
  };
}

// Handle: swings in y about its pivot. h = 0 fill end (back), 0.5 middle (straight up), 1 drain end (front).
const SWING = 0.6;
const angle = (h: number) => (2 * h - 1) * SWING;
const leverPoint = (h: number, f: number): Vec3 => [LEVER.x, LEVER.y + Math.sin(angle(h)) * LEVER.len * f, LEVER.pivotZ + Math.cos(angle(h)) * LEVER.len * f];
const tick = (h: number, half: number) => {
  const y = LEVER.y + Math.sin(angle(h)) * 11;
  return flatPath([[LEVER.x - half, y], [LEVER.x + half, y]], 5.05, view);
};
export const lever = {
  base: prism({ x: LEVER.x - 10, y: LEVER.y - 13, w: 20, d: 26, r: 1.4 }, 0, 5, view, 3, 0.4),
  slot: flatRect({ x: LEVER.x - 1.4, y: LEVER.y - 11, w: 2.8, d: 22, r: 1.2 }, 5, view, 3),
  ticks: tick(0, 6) + tick(1, 6),
  midTick: tick(0.5, 8.4),
  pivot: cylinder(LEVER.x, LEVER.y, 2.8, 5, 2.5, view, 18, 0.3),
  knob: cylinder(0, 0, 3.6, -1.8, 4, view, 22, 0.6),
  mark0: faceMatrix([LEVER.x + 6.6, LEVER.y - 4], 5.05, view, "x"),
  mark1: faceMatrix([LEVER.x + 6.6, LEVER.y + 9.4], 5.05, view, "x"),
  markMid: face(LEVER.x + 11.5, LEVER.y + 1.8),
};
export const leverRod = (h: number) => P([[LEVER.x, LEVER.y, LEVER.pivotZ], leverPoint(h, 1)]);
export const knobAt = (h: number) => translateTo(view, leverPoint(h, 1));
export const knobRing = (h: number) => {
  const [x, y, z] = leverPoint(h, 1);
  return flatCircle(x, y, 6.5, z, view, 28);
};

// Linkage: from a point on the handle to the link bar at x = LINK_X, then along y to both wheels (low, clear of the tank).
export function linkage(h: number) {
  const a = leverPoint(h, 0.62);
  const bar: Vec3 = [LINK_X, a[1], LINK_Z];
  return {
    arm: P([a, [a[0] + 4, a[1], LINK_Z], bar]),
    bar: P([[LINK_X, FILL_TAP_Y, LINK_Z], [LINK_X, DRAIN_TAP_Y, LINK_Z]]),
    toFill: P([[LINK_X, FILL_TAP_Y, LINK_Z], [COL - WHEEL_R, FILL_TAP_Y, LINK_Z]]),
    toDrain: P([[LINK_X, DRAIN_TAP_Y, LINK_Z], [COL - WHEEL_R, DRAIN_TAP_Y, LINK_Z]]),
    joints: [at(a), at(bar), at([LINK_X, FILL_TAP_Y, LINK_Z]), at([LINK_X, DRAIN_TAP_Y, LINK_Z])],
  };
}

// ---------- Circuit half ----------

const railRect = (y: number): Rect => ({ x: RAIL_X0, y: y - RAIL_D / 2, w: RAIL_X1 - RAIL_X0, d: RAIL_D, r: 0.8 });
const strap = (y0: number, y1: number) => flatPath([[COL, y0], [COL, y1]], 0, view);
const PLINTH = grow(OUT, 1.6);
export const circuit = {
  vdd: prism(railRect(VDD_Y), 0, 1.6, view, 2, 0.3),
  gnd: prism(railRect(GND_Y), 0, 1.6, view, 2, 0.3),
  vddLabel: face(BOARD.x + 3.5, VDD_Y + 2.4),
  gndLabel: face(BOARD.x + 3.5, GND_Y + 2.4),
  pLabel: face(-26, FILL_TAP_Y - 3),
  nLabel: face(-26, DRAIN_TAP_Y + 7.5),
  wLabel: face(-26, FILL_TAP_Y + 5.5),
  charge: [strap(VDD_Y + RAIL_D / 2, FILL_TAP_Y - VALVE.d / 2), strap(FILL_TAP_Y + VALVE.d / 2, NODE_Y)],
  discharge: [strap(NODE_Y, DRAIN_TAP_Y - VALVE.d / 2), strap(DRAIN_TAP_Y + VALVE.d / 2, GND_Y - RAIL_D / 2)],
  // Output node -> tank: carries the net current (fill - drain), either way.
  bus: flatPath([[COL, NODE_Y], [PLINTH.x, NODE_Y]], 0, view),
  busRev: flatPath([[PLINTH.x, NODE_Y], [COL, NODE_Y]], 0, view),
  node: at([COL, NODE_Y, 0]),
  gate: flatPath([[LEVER.x + 10, LEVER.y], [PIN_X, LEVER.y]], 0, view) + flatPath([[PIN_X, FILL_TAP_Y], [PIN_X, DRAIN_TAP_Y]], 0, view),
  gateJunction: at([PIN_X, LEVER.y, 0]),
  pins: [FILL_TAP_Y, DRAIN_TAP_Y].map((y) => ({ pin: cylinder(PIN_X, y, 1.4, 0, 7, view, 16), cap: cylinder(PIN_X, y, 2, 7, 1.2, view, 18, 0.3) })),
  bubble: flatCircle(PIN_X, FILL_TAP_Y, 3.1, 8.2, view, 20) + flatCircle(PIN_X, FILL_TAP_Y, 3.1, 7.2, view, 20),
  // Ghost of the water scene's narrow fill pipe over the PMOS.
  ghostPipe: pipeY(FILL_TAP_Y - 14, FILL_TAP_Y + 14, COL, VALVE.h + 2.2, FILL_W).outline,
};
// A valve of width w (body x-extent = w * unit), centred on the column; rebuilt while the PMOS widens.
export function valve(y: number, w: number) {
  const bw = w * VALVE.unit;
  const body: Rect = { x: COL - bw / 2, y: y - VALVE.d / 2, w: bw, d: VALVE.d, r: 0.4 };
  const gate: Rect = { x: body.x - 1, y: y - 1.2, w: bw + 2, d: 2.4, r: 0.4 };
  const arm: Rect = { x: PIN_X, y: y - 0.9, w: body.x - PIN_X, d: 1.8, r: 0.3 };
  return {
    body: prism(body, 0, VALVE.h, view, 3, 0.4),
    gate: prism(gate, VALVE.h, 1.1, view, 2, 0.3),
    arm: prism(arm, 4.2, 1.2, view, 2),
    glow: prism(grow(body, 1.2), 0, VALVE.h + 1.4, view, 3, 0.4).outline,
    bw,
  };
}
// Carrier dots on a valve's top: n columns across its width, moving along y by phase u (0..1).
export function carriers(y: number, w: number, u: number, dir: 1 | -1) {
  const bw = w * VALVE.unit;
  const pts: Vec2[] = [];
  const cols = Math.max(2, Math.round(bw / 4));
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < 2; r++) {
      const f = (((u + r * 0.5 + c * 0.37) % 1) + 1) % 1;
      const yy = y - VALVE.d / 2 + 0.8 + (dir > 0 ? f : 1 - f) * (VALVE.d - 1.6);
      pts.push(at([COL - bw / 2 + (bw * (c + 0.5)) / cols, yy, VALVE.h + 1.25]));
    }
  }
  return pts;
}
export const VALVE_Y = { p: FILL_TAP_Y, n: DRAIN_TAP_Y };

// Entrance spark points: handle base, stand feet, tank plinth, drain basin.
export const contacts: Vec2[] = [
  ...rectCorners({ x: LEVER.x - 10, y: LEVER.y - 13, w: 20, d: 26 }),
  ...legs,
  ...rectCorners(PLINTH),
  ...rectCorners(BASIN),
].map(([x, y]) => at([x, y, 0]));

export const boxWater = (rect: Rect, level: number, amp: number, phase: number) => waterBox(rect, level, amp, 0, phase, view);
