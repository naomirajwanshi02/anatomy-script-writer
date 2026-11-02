// Regeneration convoy 2 (chip-design episode 11). Time unit: video seconds = voice seconds (word times in
// builds/notes/episodes/chip-design/11.words.json, last word about 66.8 s); the timeline below is written directly in
// those seconds. One gate delay in the circuit = 0.4 s. LOOP = 67.5 s (3 s entrance + 67.5 = 70.5 s video).
// Start frame = end frame: the ghost convoy in the upper lane, straight, no dog.
// Analogy: a two-lane road with five supercars. Ghost cars copy the swing of the car ahead and add their own, so the
// swing grows until car 5 crosses the line; real cars copy only the lane of the car ahead, so car 1's swerves die out.
// Circuit (after the road scene leaves): a 1 V rail, a chain of five buffers on one wire, a 0 V rail, upright gauges
// over each gate's output wire, a transfer-curve card, one readout and a faint ghost copying wire.
// Timeline: lever moves (the card's input, the bump on gate 2's input), arrivals and the two folds. Every car
// position, wire level, gauge marker, card dot, readout and the ghost wire's level are computed below.
import { loopTime } from "../../iso/entrance";

export const LOOP = 67.5;
export const BRAND = "ROLLIN";
export const END = 3 + LOOP;
export const vtOf = (t: number) => (t < 3 ? t : 3 + loopTime(t, LOOP));

// ---------- The gate (a buffer) ----------

export const buf = (v: number) => 0.5 + 0.5 * Math.tanh(16 * (v - 0.5));
const near = (a: number, b: number, e: number) => Math.abs(a - b) < e;
if (!near(buf(0.45), 0.17, 0.005) || !near(buf(0.55), 0.83, 0.005)) throw new Error(`0.45 -> ${buf(0.45)}, 0.55 -> ${buf(0.55)}`);
if (!(buf(0.7) > 0.995 && buf(0.9) > 0.9999)) throw new Error("0.7 and 0.9 must come out as 1.0");
if (!(buf(0.4) < 0.5)) throw new Error("a level past 0.5 must come out as the wrong bit");
export const COPY_STEP = 0.08;
if (!near(0.9 - 5 * COPY_STEP, 0.5, 1e-9)) throw new Error("copying: 0.9 - 5 x 0.08 must reach 0.5");

// ---------- Road (board units: x right along the road, y toward the viewer, z up) ----------

export const ROAD = { x0: -127, x1: 127, yB: -52, yF: 52 };
export const LANE_UP = -26;
export const LANE_LO = 26;
export const K = 0.63;
// Car half-width on the road (tyres), board units.
export const CAR_HALF_W = 16.5 * K;
export const CARS = [
  { id: "c1", num: "1", x: -55 },
  { id: "c2", num: "2", x: -14 },
  { id: "c3", num: "3", x: 25 },
  { id: "c4", num: "4", x: 64 },
  { id: "c5", num: "5", x: 103 },
] as const;
export const DOG = { x: -88, s: 1.0, su: 1.45, yFrom: 62, yTo: -66 };
export const SIGN = { x: -110, y: 60 };

// ---------- Circuit ----------

// One wire along y = WIRE_Y; five buffers at GATES[i].x; segment i runs into gate i (segment 0 is the chain's input,
// segment 5 its output). Rails: 1 V behind (back), 0 V in front. Ghost copying wire on the front strip.
export const CIRC = { wireY: -12, oneY: -46, zeroY: 22, ghostY: 46, x0: -128, x1: 128, railX1: 96 };
export const GATE = { w: 20, d: 18, h: 10 };
export const GATES = [-100, -54, -8, 38, 84];
export const SEGS = [
  { x0: -128, x1: -110 },
  { x0: -90, x1: -64 },
  { x0: -44, x1: -18 },
  { x0: 2, x1: 28 },
  { x0: 48, x1: 74 },
  { x0: 94, x1: 128 },
];
// Gauges float over segments 1-5 (each gate's output wire).
export const GAUGE = { y: -24, w: 30, z0: 30, z1: 62 };
export const GAUGE_X = [1, 2, 3, 4, 5].map((i) => (SEGS[i].x0 + SEGS[i].x1) / 2);
export const GHOST_GAUGE = { x: 118, y: 46, w: 20, z0: 2, z1: 26 };
export const GATE_DELAY = 0.4;

// ---------- Timeline (voice seconds) ----------

type Span = [from: number, to: number, value: number];
const CHANNELS: Record<string, { from: number; spans: Span[] }> = {
  // Analogy.
  ghostOut: { from: 0, spans: [[7.26, 8.0, 1], [62.2, 63.0, 0]] },
  realIn: { from: 0, spans: [[7.26, 8.0, 1], [62.2, 62.3, 0]] },
  warn: { from: 0, spans: [[6.42, 6.55, 1], [7.3, 7.4, 0]] },
  lines: { from: 0, spans: [[16.68, 17.0, 1], [17.7, 18.0, 0]] },
  // Folds: the road scene leaves (25.5-26.4) and comes back (63.0-64.0); circuit parts arrive and leave.
  roadAway: { from: 0, spans: [[25.5, 26.4, 1], [63.0, 64.0, 0]] },
  circBase: { from: 0, spans: [[26.0, 26.8, 1], [62.2, 63.0, 0]] },
  circLift: { from: 0, spans: [[62.2, 63.0, 1], [63.0, 63.01, 0]] },
  bands: { from: 0, spans: [[29.14, 29.6, 1], [62.2, 63.0, 0]] },
  // Curve card.
  hl2: { from: 0, spans: [[32.82, 33.1, 1], [45.58, 45.9, 0]] },
  card: { from: 0, spans: [[32.82, 33.3, 1], [45.58, 46.1, 0]] },
  half: { from: 0, spans: [[35.52, 35.8, 1]] },
  arrowOut: { from: 0, spans: [[37.86, 38.3, 1], [41.6, 41.9, 0]] },
  flatTop: { from: 0, spans: [[39.86, 40.2, 1], [44.4, 44.8, 0]] },
  probeOn: { from: 0, spans: [[33.0, 33.4, 1], [45.58, 46.0, 0]] },
  // Rail current into gate 2, the input valve.
  railLit: { from: 0, spans: [[47.12, 47.5, 1], [58.1, 58.5, 0]] },
  valve: { from: 0, spans: [[48.12, 48.4, 1], [62.2, 62.6, 0]] },
  // Key state: the bump on gate 2's input, the readout.
  bump: { from: 0, spans: [[50.8, 51.22, 1], [55.0, 55.2, 0]] },
  roShow: { from: 0, spans: [[51.22, 51.5, 1], [57.6, 58.0, 0]] },
  ghostWire: { from: 0, spans: [[26.0, 26.8, 0.75], [58.1, 61.4, 0]] },
};
const PULSES: Record<string, [number, number][]> = {
  car5: [[18.0, 0.6]],
  topBands: [[30.5, 0.6]],
  botBands: [[31.6, 0.6]],
  g2Marker: [[44.66, 0.7]],
  gate2: [[52.64, 0.55]],
  outGauges: [[58.1, 1.1], [59.3, 1.1], [60.5, 0.9]],
};
// Gate pulse left to right (27.48-28.6).
export const GATE_PULSE = { from: 27.48, step: 0.22, dur: 0.45 };
// The card's input (a lever): 0.45 until 37.06, then 0.55, 0.7 at 42.04, 0.9 at 43.00.
const CARD_MOVES: [number, number, number][] = [
  [37.06, 37.2, 0.55],
  [42.04, 42.4, 0.7],
  [43.0, 43.36, 0.9],
];
// The card's output dot follows the curve 0.8 s after its input (37.06 -> 37.86); the probe on gate 2's input follows
// the card 1.2 s later, so gate 2's gauge marker jumps one gate delay after that, at 38.74.
const CARD_LAG = 0.8;
const PROBE_LAG = 1.2;
// The bump ripple on segment 1 (49.78-50.8), then ripples on every segment, left to right.
export const BUMP_RIPPLE = { seg: 1, from: 49.78, to: 50.8 };
export const RIPPLES = { from: 55.26, step: 0.4, dur: 0.45, depth: 0.3 };
// Dog runs across the open stretch ahead of car 1.
export const DOG_RUNS = [[2.92, 4.3], [12.96, 14.3]] as const;

const clamp01 = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u);
export const ease = (u: number) => {
  const c = clamp01(u);
  return c * c * (3 - 2 * c);
};
const ramp = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
export const channel = (name: string, vt: number) => {
  const { from, spans } = CHANNELS[name];
  let v = from;
  for (const [a, b, value] of spans) {
    if (vt >= b) v = value;
    else if (vt > a) return v + (value - v) * ease((vt - a) / (b - a));
  }
  return v;
};
const pulse = (name: string, vt: number) => PULSES[name].reduce((m, [a, d]) => (vt > a && vt < a + d ? Math.max(m, Math.sin((Math.PI * (vt - a)) / d)) : m), 0);
const moves = (list: [number, number, number][], v0: number, t: number) => {
  let v = v0;
  for (const [a, b, to] of list) v = t >= b ? to : t > a ? v + (to - v) * ease((t - a) / (b - a)) : v;
  return v;
};
export const cardIn = (t: number) => moves(CARD_MOVES, 0.45, t);

// ---------- Sampled simulation (DT = 0.01 s) ----------

const DT = 0.01;
const N = Math.ceil((END + 1) / DT);
const sample = (a: Float32Array, t: number) => {
  const u = t / DT;
  if (u <= 0) return a[0];
  if (u >= N - 1) return a[N - 1];
  const i = Math.floor(u);
  return a[i] + (a[i + 1] - a[i]) * (u - i);
};
const fill = (fn: (t: number) => number) => {
  const a = new Float32Array(N);
  for (let n = 0; n < N; n++) a[n] = fn(n * DT);
  return a;
};

// Noise injected on segment i (toward 0): the held bump on segment 1, then one passing ripple per segment.
export const rippleAt = (i: number, t: number) => {
  const t0 = RIPPLES.from + RIPPLES.step * (i - 1);
  return i >= 1 && t > t0 && t < t0 + RIPPLES.dur ? Math.sin((Math.PI * (t - t0)) / RIPPLES.dur) : 0;
};
const noise = (i: number, t: number) => (i === 1 ? 0.3 * channel("bump", t) : 0) + RIPPLES.depth * rippleAt(i, t);
// The chain: segment 0 is a steady 1; segment i = the buffer of segment i-1 one gate delay earlier, minus its noise.
// While the probe is on, segment 1 is held at the card's input (seen PROBE_LAG later).
const S: Float32Array[] = [fill(() => 1)];
for (let i = 1; i < SEGS.length; i++) {
  const prev = S[i - 1];
  S[i] = fill((t) => {
    let v = buf(sample(prev, t - GATE_DELAY));
    if (i === 1) v = lerp(v, cardIn(t - PROBE_LAG), channel("probeOn", t));
    return Math.min(1, Math.max(0, v - noise(i, t)));
  });
}
export const segAt = (i: number, vt: number) => sample(S[i], vt);
// Ghost copying wire: each copier passes its input on unchanged (no restoring) and each ripple adds a held 0.08 V drop.
const GH: Float32Array[] = [fill(() => 0.9)];
for (let i = 1; i < SEGS.length; i++) {
  const prev = GH[i - 1];
  const t0 = RIPPLES.from + RIPPLES.step * (i - 1);
  GH[i] = fill((t) => sample(prev, t - GATE_DELAY) - COPY_STEP * ease((t - t0) / RIPPLES.dur));
}
export const ghostAt = (i: number, vt: number) => sample(GH[i], vt);

// Checks: the key state reads 0.7 in, 1.0 out; ripples never flip an output; gate 2's gauge jumps at 38.74;
// the ghost wire ends on 0.5.
if (!near(segAt(1, 52), 0.7, 0.002) || segAt(2, 54) < 0.995) throw new Error("key state must read 0.7 / 1.0");
for (let vt = 55.2; vt < 58; vt += 0.01) for (let i = 1; i < 6; i++) if (segAt(i, vt) < 0.65) throw new Error(`segment ${i} dips too far at ${vt}`);
if (!(segAt(2, 38.6) < 0.5 && segAt(2, 38.8) > 0.5)) throw new Error("gate 2's output must cross 0.5 near 38.74");
if (!near(ghostAt(5, 58), 0.5, 1e-3)) throw new Error(`ghost wire ends on ${ghostAt(5, 58)}`);

// ---------- Analogy: car paths (lateral y on the road) ----------

const W_SWING = 2 * Math.PI * 1.5;
const sw = (u: number) => (u <= 0 ? 0 : 0.5 - 0.5 * Math.cos(W_SWING * u));
// Ghosts: car 1 swings from 4.26; each ghost copies the ghost ahead (seen D later) and adds its own swing of 4.
const GHOST_START = [4.26, 5.26, 5.563, 5.867, 6.17];
const GA: Float32Array[] = [];
for (let k = 0; k < 5; k++) {
  const prev = GA[k - 1];
  const D = k === 0 ? 0 : GHOST_START[k] - GHOST_START[k - 1];
  const own = k === 0 ? 2.5 : 4;
  GA[k] = fill((t) => (prev ? sample(prev, t - D) : 0) + own * sw(t - GHOST_START[k]));
}
// Real convoy: car 1 changes lane (9.70-10.6) and swerves twice after the second dog (14.12); each follower starts its
// own lane change when the car ahead crosses the line (car 2 reacts 0.97 s later), ignoring every swerve.
const R1 = fill((t) => lerp(LANE_UP, LANE_LO, ease((t - 9.7) / 0.9)) + (t > 14.12 ? 7 * Math.exp(-(t - 14.12) / 0.45) * Math.sin(2 * Math.PI * 1.6 * (t - 14.12)) : 0));
const REACT = [0, 0.97, 0, 0, 0];
const RA: Float32Array[] = [R1];
const crossOf = (a: Float32Array) => {
  for (let n = 0; n < N; n++) if (a[n] > 0) return n * DT;
  return Infinity;
};
for (let k = 1; k < 5; k++) {
  const start = crossOf(RA[k - 1]) + REACT[k];
  RA[k] = fill((t) => lerp(LANE_UP, LANE_LO, ease((t - start) / 0.6)));
}
const ghostY = (k: number, vt: number) => LANE_UP + (vt < 9 ? sample(GA[k], vt) : 0);
const realY = (k: number, vt: number) => sample(RA[k], vt);
{
  // Ghost 5 crosses the middle line at about 6.42 s; ghost 4 never does; real followers stay in a lane after 12.6 s.
  const edge = (k: number, vt: number) => ghostY(k, vt) + CAR_HALF_W;
  if (!(edge(4, 6.4) < 0 && edge(4, 6.45) > 0)) throw new Error(`ghost 5 must cross the line at 6.42 (${edge(4, 6.4)}, ${edge(4, 6.45)})`);
  for (let vt = 4; vt < 8; vt += 0.01) if (edge(3, vt) > 0) throw new Error("ghost 4 must stay in its lane");
  for (let vt = 12.7; vt < 26; vt += 0.01) for (let k = 1; k < 5; k++) if (Math.abs(realY(k, vt) - LANE_LO) > 1e-3) throw new Error(`car ${k + 1} not straight at ${vt}`);
  if (!(realY(1, 11.2) > LANE_UP && realY(1, 11.05) === LANE_UP && realY(4, 12.65) === LANE_LO)) throw new Error("lane changes off their times");
}
const yawOf = (f: (vt: number) => number, vt: number) => Math.max(-0.2, Math.min(0.2, -0.004 * ((f(vt + 0.02) - f(vt - 0.02)) / 0.04)));

// Road dashes scroll (the convoy drives toward -x), subtle.
const SCROLL = fill((t) => 9 * t);

// ---------- State ----------

// Reduced motion: hold the key state (gate 2's input at 0.7, its output at 1.0).
export const KEY_TIME = 54.5;

export type CarState = { id: string; num: string; x: number; y: number; yaw: number };

export function stateAt(t: number) {
  const vt = vtOf(t);
  const ch = Object.fromEntries(Object.keys(CHANNELS).map((k) => [k, channel(k, vt)])) as Record<keyof typeof CHANNELS, number>;
  const pu = Object.fromEntries(Object.keys(PULSES).map((k) => [k, pulse(k, vt)])) as Record<keyof typeof PULSES, number>;
  const ghosts: CarState[] = CARS.map((c, k) => ({ id: c.id, num: c.num, x: c.x, y: ghostY(k, vt), yaw: vt < 9 ? yawOf((u) => ghostY(k, u), vt) : 0 }));
  const cars: CarState[] = CARS.map((c, k) => ({ id: c.id, num: c.num, x: c.x, y: realY(k, vt), yaw: yawOf((u) => realY(k, u), vt) }));
  // Dog: position across the road, trot phase, fade at both ends.
  let dog = { alpha: 0, y: DOG.yFrom, phase: 0 };
  for (const [a, b] of DOG_RUNS) {
    if (vt > a && vt < b) {
      const u = (vt - a) / (b - a);
      dog = { alpha: Math.min(1, (vt - a) / 0.12, (b - vt) / 0.15), y: lerp(DOG.yFrom, DOG.yTo, u), phase: 2 * Math.PI * 3.2 * (vt - a) };
    }
  }
  const segs = SEGS.map((_, i) => segAt(i, vt));
  const ghostSegs = SEGS.map((_, i) => ghostAt(i, vt));
  const gatePulse = GATES.map((_, i) => {
    const a = GATE_PULSE.from + GATE_PULSE.step * i;
    const p = vt > a && vt < a + GATE_PULSE.dur ? Math.sin((Math.PI * (vt - a)) / GATE_PULSE.dur) : 0;
    return Math.max(p, i === 1 ? pu.gate2 : 0);
  });
  // Ripple humps: [segment, position 0..1 along it, amplitude 0..1].
  const humps: [number, number, number][] = [];
  if (vt > BUMP_RIPPLE.from && vt < 51.6) humps.push([1, Math.min(0.5, 0.5 * ease((vt - BUMP_RIPPLE.from) / (BUMP_RIPPLE.to - BUMP_RIPPLE.from))), 1 - ramp(vt, 51.0, 51.6)]);
  for (let i = 1; i < SEGS.length; i++) {
    const r = rippleAt(i, vt);
    if (r > 0) humps.push([i, ramp(vt, RIPPLES.from + RIPPLES.step * (i - 1), RIPPLES.from + RIPPLES.step * (i - 1) + RIPPLES.dur), r]);
  }
  const cin = cardIn(vt);
  const cout = buf(cardIn(vt - CARD_LAG));
  const showOut = vt >= 54.02;
  return {
    vt,
    scroll: sample(SCROLL, vt),
    ghosts,
    cars,
    ghostAlpha: 1 - ch.ghostOut,
    realAlpha: ch.realIn,
    dog,
    segs,
    ghostSegs,
    gatePulse,
    humps,
    cardIn: cin,
    cardOut: cout,
    cardOutFrom: buf(0.45),
    readout: { label: showOut ? "gate 2 out" : "gate 2 in", text: `${(showOut ? segs[2] : segs[1]).toFixed(1)} V`, alpha: ch.roShow },
    ...ch,
    ...pu,
  };
}
