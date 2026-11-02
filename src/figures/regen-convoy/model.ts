// Regeneration as a convoy on a road. Time unit: video seconds = voice seconds of chip-design episode 11 (video t =
// audio t, voice.ts is the identity map). One gate delay = 0.85 s (slow motion) for the four visible gates; the 18
// hidden pairs in the dotted gap run at 0.034 s per gate (one frame at 30 fps) so car 20 follows a little later.
// LOOP = 67.5 s (3 s entrance + 67.5 = 70.5 s video; the last word ends at 67.32 s). The fold back ends at 64.1 s and
// the road start frame (every car in the top lane, straight) holds to 70.5 s, so the loop ends in the start state.
// Analogy: a two-lane road, a convoy of rust cars 1, 2 ... 20 (supercar) in a lane; a gust makes car 1 wobble, the
// convoy follows its lane changes but not its wobble; a dashed ghost convoy that copies every move lets the wobble grow.
// Circuit: the road slides away and each car shrinks into its pair of inverter blocks on one wire between a VDD rail
// and a GND rail; upright 0-1 V gauges above the wire show car 1's input, its middle wire, its output and car 20's
// output. Timeline: the car-1 input moves (lever-like), arrivals (cars, blocks, gauges, curve card, ghost row), gusts
// and the two folds. Lanes, markers, wires, valves, readouts and the curve dots are all computed below.
import { loopTime } from "../../iso/entrance";

export const LOOP = 67.5;
export const BRAND = "ROLLIN";
export const END = 3 + LOOP;
// Figure time: the entrance plays the hook (t < 3), then the loop.
export const vtOf = (t: number) => (t < 3 ? t : 3 + loopTime(t, LOOP));

// ---------- The gate (an inverter) ----------

export const gate = (v: number) => 0.5 - 0.5 * Math.tanh(16 * (v - 0.5));
const slope = (v: number) => 8 * (1 - Math.tanh(16 * (v - 0.5)) ** 2);
const near = (a: number, b: number, e: number) => Math.abs(a - b) < e;
if (!near(gate(0.45), 0.83, 0.005) || !near(gate(0.55), 0.17, 0.005)) throw new Error(`0.45 -> ${gate(0.45)}, 0.55 -> ${gate(0.55)}`);
{
  let lo = 2;
  let hi = -1;
  for (let v = 0; v <= 1; v += 0.0001) if (slope(v) >= 1) (lo = Math.min(lo, v)), (hi = Math.max(hi, v));
  if (!near(lo, 0.394, 0.0015) || !near(hi, 0.606, 0.0015)) throw new Error(`slope >= 1 between ${lo} and ${hi}`);
}
if (!near(gate(0.7), 0.002, 0.0005) || !(gate(gate(0.7)) > 0.9995)) throw new Error(`0.7 -> ${gate(0.7)} -> ${gate(gate(0.7))}`);
export const GHOST_STEP = 0.02;
if (!near(0.9 - 20 * GHOST_STEP, 0.5, 1e-9)) throw new Error("copying: 0.9 - 20 x 0.02 must reach 0.5");
{
  let v = 1;
  for (let i = 0; i < 40; i++) {
    v = gate(v);
    v += v > 0.5 ? -0.1 : 0.1;
  }
  if (!(v > 0.5)) throw new Error(`forty bumped gates end on ${v}`);
}

// ---------- Road (board units: x right along the road, y toward the viewer, z up) ----------

// Across the road p runs 0 (front edge, GND) to 1 (back edge, VDD). A voltage v sits at p = 0.5 + 0.625 (v - 0.5):
// top lane centre 0.9 V, centre line 0.5 V, bottom lane centre 0.1 V.
export const ROAD = { x0: -106, x1: 106, yB: -104, yF: 82 };
export const ROAD_W = ROAD.yF - ROAD.yB;
export const pOf = (v: number) => 0.5 + (v - 0.5) * 0.625;
export const yOfP = (p: number) => ROAD.yF - p * ROAD_W;
export const yOfV = (v: number) => yOfP(pOf(v));
export const LANE = { one: 0.9, zero: 0.1 };
// Car scale on the road; half-width of a car in local units.
export const K_A = 1.07;
export const HALF_W = 13.7;
const halfP = (k: number) => (HALF_W * k) / ROAD_W;
if (!(pOf(1) + halfP(K_A) < 0.97 && pOf(0) - halfP(K_A) > 0.03)) throw new Error("cars must fit the road");

// Cars: analogy x, and the x of the pair (or wire) each car shrinks into at the fold.
export const CARS = [
  { id: "c1", num: "1", xa: -76, xc: -25, superCar: false },
  { id: "c2", num: "2", xa: -12, xc: 30, superCar: false },
  { id: "c20", num: "20", xa: 73, xc: 82, superCar: true },
] as const;
// The dots between car 2 and car 20 (analogy).
export const DOTS = [{ xa: 23 }, { xa: 29 }, { xa: 35 }];

// ---------- Circuit (a separate gate chain after the fold) ----------

// One wire left to right at y = wireY between the VDD rail (back) and the GND rail (front). Car 1's pair is the hero:
// two big inverter blocks in the middle (scale s = 1); after a dotted gap car 20's pair sits small (s = 0.5) at the
// right end. Each block has a PMOS valve behind it strapped to VDD and an NMOS valve in front strapped to GND. Upright
// 0-1 V gauges float above the wire ("in", "middle", "out" big, "car 20" small), high enough to clear every strap.
export const CIRC = { wireY: 8, vddY: -46, gndY: 70, x0: -104, x1: 106 };
// Block footprint around the wire and its valves, in units of the block scale s.
export const BLK = { w: 26, half: 15, h: 12, p: [-34, -24] as [number, number], n: [22, 32] as [number, number], valveW: 20 };
export const BLOCKS = [
  { id: "a1", x: -52, inW: 0, num: "1", pair: "pair1", s: 1.2 },
  { id: "b1", x: 2, inW: 1, num: "1", pair: "pair1", s: 1.2 },
  { id: "a20", x: 70, inW: 38, num: "20", pair: "pair20", s: 0.5 },
  { id: "b20", x: 92, inW: 39, num: "20", pair: "pair20", s: 0.5 },
] as const;
// Wire segments: car 1's input, the middle, car 1's output; after the gap car 20's input, middle and output.
export const SEGS = [
  { wire: 0, x0: -104, x1: -67.6 },
  { wire: 1, x0: -36.4, x1: -13.6 },
  { wire: 2, x0: 17.6, x1: 44 },
  { wire: 38, x0: 58, x1: 63.5 },
  { wire: 39, x0: 76.5, x1: 85.5 },
  { wire: 40, x0: 98.5, x1: 106 },
] as const;
export const GAP = { x0: 44, x1: 58, dots: [48, 51, 54] };
export const GAUGE_Y = 4;
export const GAUGES = [
  { x: -84, wire: 0, w: 36, z0: 34, z1: 70, label: "in" },
  { x: -25, wire: 1, w: 36, z0: 34, z1: 70, label: "middle" },
  { x: 33, wire: 2, w: 36, z0: 34, z1: 70, label: "out" },
  { x: 100, wire: 40, w: 18, z0: 34, z1: 56, label: "car 20" },
] as const;
export const NEIGHBOUR = { y: -7, x0: -104, x1: -72 };
// Ghost row (on the front strip): plain grey blocks, one marker stepping down 0.02 V per block.
export const GHOST_ROW = { y: 97, span: 14, xs: [-84, -56, -28, 0, 28, 56, 84], blockW: 12, blockD: 12 };
export const ghostRowY = (v: number) => GHOST_ROW.y - (v - 0.5) * GHOST_ROW.span;

// ---------- Timeline (voice seconds) ----------

type Span = [from: number, to: number, value: number];
const CHANNELS: Record<string, { from: number; spans: Span[] }> = {
  // Fold to the circuit on "Now, the same with bits" and back on "Clean ones and zeros".
  fold: { from: 0, spans: [[26.36, 28.1, 1], [62.62, 64.1, 0]] },
  rails: { from: 0, spans: [[26.9, 27.6, 1], [62.62, 63.1, 0]] },
  // Each car shrinks into its pair; the pairs settle on "Each car".
  pair1: { from: 0, spans: [[27.4, 28.12, 1]] },
  pair20: { from: 0, spans: [[27.6, 28.34, 1]] },
  wires: { from: 0, spans: [[27.6, 28.2, 1]] },
  out: { from: 0, spans: [[62.62, 63.0, 1]] },
  ghostIn: { from: 0, spans: [[16.6, 17.0, 1], [21.16, 21.9, 0]] },
  // Gauges rise on "a voltage"; bands fill on "1 near 1 volt" / "0 near 0"; tarmac look on "Those are the lanes".
  gaugeIn: { from: 0, spans: [[33.4, 33.9, 1]] },
  band1: { from: 0, spans: [[34.1, 34.4, 1]] },
  band0: { from: 0, spans: [[35.34, 35.6, 1]] },
  lanes: { from: 0, spans: [[36.48, 36.65, 1], [37.3, 37.5, 0]] },
  strapLit: { from: 0, spans: [[48.88, 49.1, 1], [50.64, 51.0, 0]] },
  neighbour: { from: 0, spans: [[50.96, 51.2, 1], [56.9, 57.2, 0]] },
  // Curve card.
  card: { from: 0, spans: [[37.82, 38.3, 1]] },
  curveDot: { from: 0, spans: [[38.78, 39.0, 1]] },
  inStep: { from: 0, spans: [[39.6, 39.75, 1]] },
  outFall: { from: 0, spans: [[40.34, 40.9, 1]] },
  arrowIn: { from: 0, spans: [[39.6, 39.9, 1], [41.6, 41.9, 0]] },
  arrowOut: { from: 0, spans: [[40.34, 40.84, 1], [41.6, 41.9, 0]] },
  track: { from: 0, spans: [[41.66, 41.96, 1]] },
  flat: { from: 0, spans: [[44.5, 44.9, 1], [47.6, 48.1, 0]] },
  // Key-state readouts: car 1's input, the middle wire, car 1's output.
  ro1: { from: 0, spans: [[52.34, 52.6, 1], [56.9, 57.2, 0]] },
  ro2: { from: 0, spans: [[53.66, 53.9, 1], [56.9, 57.2, 0]] },
  ro3: { from: 0, spans: [[55.9, 56.1, 1], [56.9, 57.2, 0]] },
  // Ghost copying row.
  grow: { from: 0, spans: [[56.96, 57.4, 1], [59.32, 59.9, 0]] },
  count: { from: 0, spans: [[57.24, 58.44, 1]] },
};
const PULSES: Record<string, [number, number][]> = {
  linesGlow: [[15.52, 1.0]],
  pairPulse: [[28.95, 0.55]],
  aPulse: [[30.6, 0.5]],
  bPulse: [[31.6, 0.5]],
  outPulse: [[55.9, 0.6]],
  glowHalf: [[38.78, 1.0]],
  railGlow: [[48.24, 1.4]],
  flash: [[51.3, 0.5], [51.9, 0.35]],
};
// Gust streaks (analogy): [start, duration]; the heads reach the car about 70 % of the way.
export const GUSTS = { hook: [1.45, 1.05], lane: [12.2, 1.0] } as const;
// The neighbour's ripple runs into car 1's input from 51.3 s and stops under its gauge at 52.64 s.
export const RIPPLE = { from: 51.3, to: 52.64, fade: [53.0, 53.6] as [number, number] };
// Cars rolling in behind car 1 on "but" / "20th": [start, duration].
const ROLL: Record<string, [number, number]> = { c1: [-1, 0.1], c2: [3.1, 0.6], c20: [3.4, 0.85] };
const DOTS_IN = 3.55;

const clamp01 = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u);
export const ease = (u: number) => {
  const c = clamp01(u);
  return c * c * (3 - 2 * c);
};
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
const fill = (fn: (t: number, n: number) => number) => {
  const a = new Float32Array(N);
  for (let n = 0; n < N; n++) a[n] = fn(n * DT, n);
  return a;
};

// Car 1's input (circuit): lever-like moves of the wire into pair 1.
const MOVES: [number, number, number][] = [
  [29.75, 30.05, 0.9], // "The first flips the bit": the input becomes a 1 (crosses 0.5 at 29.9)
  [37.82, 38.3, 0.1], // "At the line": the input goes back to a 0 so it can rise across the line later
  [41.96, 42.9, 0.9], // "the gate follows its input": a slow drift up across the line (crosses at 42.43)
  [44.96, 45.5, 0.7], // "inside a lane": 0.9 -> 0.7 -> 0.9
  [45.78, 46.3, 0.9],
  [51.4, 52.64, 0.7], // the bump pulls the 1 to exactly 0.7 on "seven tenths"
  [56.9, 57.4, 0.9],
];
const ramp = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const w0At = (t: number) => {
  let v = 0.1;
  for (const [a, b, to] of MOVES) v = t >= b ? to : t > a ? v + (to - v) * ease((t - a) / (b - a)) : v;
  // "It ignores the wobble": +-0.1 V inside the top lane.
  v += 0.1 * Math.sin(2 * Math.PI * 1.5 * (t - 46.9)) * ramp(t, 46.9, 47.05) * (1 - ramp(t, 48.35, 48.55));
  return v;
};
// Small bumps flicker into the chain on "Every gate puts the bit back in its lane": [wire, start].
const BUMPS: [number, number][] = [
  [0, 60.4], [38, 60.55], [1, 60.7], [39, 60.9], [2, 61.0], [40, 61.2], [3, 61.3], [0, 61.5], [38, 61.6], [2, 61.75], [1, 61.95], [39, 62.05],
];
const bumpAt = (i: number, t: number) =>
  BUMPS.reduce((s, [w, t0]) => (w === i && t > t0 && t < t0 + 0.4 ? s + 0.12 * Math.sin((Math.PI * (t - t0)) / 0.4) : s), 0);

// The chain: wire i = the gate of wire i-1, one gate delay later, plus its injected bumps (toward the middle).
export const WIRE_COUNT = 41;
const delayOf = (i: number) => (i <= 2 || i >= 39 ? 0.85 : 0.034);
const W: Float32Array[] = [];
W[0] = fill((t) => {
  const v = w0At(t);
  return Math.min(1, Math.max(0, v - (v > 0.5 ? 1 : -1) * bumpAt(0, t)));
});
for (let i = 1; i < WIRE_COUNT; i++) {
  const prev = W[i - 1];
  const d = delayOf(i);
  W[i] = fill((t) => {
    const base = gate(sample(prev, t - d));
    return Math.min(1, Math.max(0, base - (base > 0.5 ? 1 : -1) * bumpAt(i, t)));
  });
}
export const wireAt = (i: number, vt: number) => sample(W[i], vt);

// Checks: the key state reads 0.7 -> 0.00 -> 1.00; car 1's input crosses the line inside "follows"; every visible
// wire stays in its band through the small bumps; car 20's output follows later.
if (!near(wireAt(0, 52.64), 0.7, 1e-6) || wireAt(1, 54) > 0.005 || wireAt(2, 56) < 0.995) throw new Error("key state must read 0.7 / 0.00 / 1.00");
for (let vt = 60.2; vt <= 62.6; vt += 0.01)
  for (const i of [0, 1, 2, 38, 39, 40])
    if (i % 2 === 0 ? wireAt(i, vt) < 0.6 : wireAt(i, vt) > 0.4) throw new Error(`wire ${i} leaves its lane at ${vt.toFixed(2)} s`);
{
  let cross = -1;
  for (let vt = 41.9; vt < 43 && cross < 0; vt += 0.005) if (wireAt(0, vt) > 0.5) cross = vt;
  if (cross < 42.2 || cross > 42.7) throw new Error(`car 1 crosses the line at ${cross}`);
  if (!(wireAt(40, 48.5) > 0.9)) throw new Error("car 20's output must be a 1 by 48.5 s");
  // The flips land on "the bit" (middle goes 0) and "flips it back" (output goes 1), one gate delay (0.85 s) apart.
  if (!(wireAt(1, 30.5) > 0.5 && wireAt(1, 30.95) < 0.5 && wireAt(2, 31.35) < 0.5 && wireAt(2, 31.85) > 0.5)) throw new Error("flips off their words");
}

// Analogy paths. Car 1: top lane, one swerve after the hook gust, a lane change on "changes lane", a second wobble on
// "but the wobble" that settles by "back to the middle".
const swerve = (t: number, t0: number, a: number, tau: number, fr: number) => (t < t0 ? 0 : a * Math.exp(-(t - t0) / tau) * Math.sin(2 * Math.PI * fr * (t - t0)));
const A1 = fill((t) => lerp(LANE.one, LANE.zero, ease((t - 8.2) / 0.6)) + swerve(t, 2.2, -0.22, 0.45, 1.0) + swerve(t, 12.9, -0.12, 1.1, 1.3));
// Each follower steers toward the middle of the lane of the car ahead (seen a moment later), with its own small
// damped sway (an underdamped steer).
const follow = (lead: Float32Array, delay: number) => {
  let x = LANE.one;
  let vel = 0;
  const w = 6.5;
  const z = 0.72;
  return fill((t) => {
    const target = sample(lead, t - delay) > 0.5 ? LANE.one : LANE.zero;
    vel += (w * w * (target - x) - 2 * z * w * vel) * DT;
    x += vel * DT;
    return x;
  });
};
const A2 = follow(A1, 0.9);
const A20 = follow(A2, 0.55);
const ANALOG: Record<string, Float32Array> = { c1: A1, c2: A2, c20: A20 };
// Ghost convoy (top lane): each ghost copies the offset of the ghost ahead and adds its own wobble, so the swing grows.
const gw = (t: number) => 0.045 * ramp(t, 17.2, 17.8) * (1 - ramp(t, 20.9, 21.6)) * Math.sin(2 * Math.PI * 0.9 * (t - 17.36));
const G: Float32Array[] = [];
for (let k = 1; k <= 20; k++) {
  const prev = G[k - 2];
  G[k - 1] = fill((t) => (prev ? sample(prev, t - 0.03) : 0) + gw(t) * (1 + 0.15 * Math.sin(1.7 * k)));
}
const GHOST_OF: Record<string, number> = { c1: 0, c2: 1, c20: 19 };
{
  let min20 = 1;
  for (let vt = 17; vt < 21.5; vt += 0.01) min20 = Math.min(min20, LANE.one + sample(G[19], vt));
  if (!(pOf(min20) - halfP(K_A) < 0.5)) throw new Error(`ghost 20 must weave over the line (min ${min20})`);
  // The real convoy never leaves its lane while only car 1 wobbles.
  for (let vt = 2; vt < 7; vt += 0.01) for (const c of ["c1", "c2", "c20"]) if (pOf(sample(ANALOG[c], vt)) - halfP(K_A) < 0.5) throw new Error(`${c} leaves the top lane at ${vt}`);
  for (let vt = 11.5; vt < 26; vt += 0.01) for (const c of ["c1", "c2", "c20"]) if (pOf(sample(ANALOG[c], vt)) + halfP(K_A) > 0.5) throw new Error(`${c} leaves the bottom lane at ${vt}`);
}

// Road texture scroll (units along +x: the convoy drives toward -x); it stops while the road is the chain.
const SCROLL = (() => {
  let s = 0;
  return fill((t) => (s += 24 * (1 - channel("fold", t)) * DT));
})();

// ---------- State ----------

// Reduced motion: hold the key state (car 1 at 0.7 V, the middle at 0.00 V, car 2 at 1.00 V).
export const KEY_TIME = 56.4;

export type CarState = { id: string; num: string; x: number; y: number; k: number; alpha: number; lean: number; superCar: boolean };

const analogV = (id: string, vt: number) => (vt >= 30 ? LANE.one : sample(ANALOG[id], vt));

export function stateAt(t: number) {
  const vt = vtOf(t);
  const fold = channel("fold", vt);
  const out = channel("out", vt);
  const live = 1 - out;
  const ch = Object.fromEntries(Object.keys(CHANNELS).map((k) => [k, channel(k, vt)])) as Record<keyof typeof CHANNELS, number>;
  const pu = Object.fromEntries(Object.keys(PULSES).map((k) => [k, pulse(k, vt)])) as Record<keyof typeof PULSES, number>;

  // Cars: on the road, then each slides onto its pair on the wire and shrinks away into it (and back out at the end).
  const cars: CarState[] = CARS.map((c) => {
    const [r0, rd] = ROLL[c.id];
    const r = ease((vt - r0) / rd);
    const v = analogV(c.id, vt);
    const dv = (analogV(c.id, vt + 0.03) - analogV(c.id, vt - 0.03)) / 0.06;
    return {
      id: c.id,
      num: c.num,
      x: lerp(c.xa, c.xc, fold) + 50 * (1 - r) * (1 - r),
      y: lerp(yOfV(v), CIRC.wireY, fold),
      k: K_A * lerp(1, 0.3, fold),
      alpha: ease((vt - r0) / (rd * 0.45)) * (1 - ease((fold - 0.45) / 0.5)),
      lean: Math.max(-0.14, Math.min(0.14, -0.05 * dv)) * (1 - fold),
      superCar: c.superCar,
    };
  });
  const ghosts: CarState[] = CARS.map((c) => ({
    id: c.id,
    num: "",
    x: c.xa,
    y: yOfV(Math.max(0.02, Math.min(0.98, LANE.one + sample(G[GHOST_OF[c.id]], vt)))),
    k: K_A,
    alpha: ch.ghostIn * 0.9,
    lean: 0,
    superCar: c.superCar,
  }));
  const a2 = analogV("c2", vt);
  const a20 = analogV("c20", vt);
  const dots = DOTS.map((d, j) => ({ x: d.xa, y: yOfV(lerp(a2, a20, (j + 1) / 4)), alpha: ease((vt - DOTS_IN - j * 0.1) / 0.25) * (1 - ease(fold / 0.4)) }));
  const pairs: Record<string, number> = { pair1: ch.pair1, pair20: ch.pair20 };
  const blocks = BLOCKS.map((b, i) => {
    const vin = wireAt(b.inW, vt);
    return {
      drop: pairs[b.pair],
      alpha: Math.min(1, pairs[b.pair] * 2.5) * live,
      pmos: vin < 0.5 ? 1 : 0,
      nmos: vin >= 0.5 ? 1 : 0,
      pulse: b.pair === "pair1" ? Math.max(pu.pairPulse, i === 0 ? pu.aPulse : pu.bPulse) : 0,
    };
  });
  const segs = SEGS.map((sg) => {
    const v = wireAt(sg.wire, vt);
    return { v, flow: v >= 0.5 ? 1 : 0, alpha: ch.wires * live };
  });
  const gauges = GAUGES.map((g, i) => ({ v: wireAt(g.wire, vt), pulse: i === 2 ? pu.outPulse : 0 }));
  // Ripple on car 1's input: from the left end, slowing to a stop under its gauge, then fading.
  const ru = clamp01((vt - RIPPLE.from) / (RIPPLE.to - RIPPLE.from));
  const ripple = {
    x: NEIGHBOUR.x0 + (GAUGES[0].x - NEIGHBOUR.x0) * (1 - (1 - ru) * (1 - ru)),
    a: vt < RIPPLE.from ? 0 : 1 - ramp(vt, RIPPLE.fade[0], RIPPLE.fade[1]),
  };
  const w0 = wireAt(0, vt);
  const inS = lerp(0.45, 0.55, ch.inStep);
  const outS = lerp(gate(0.45), gate(0.55), ch.outFall);
  const ghostN = Math.min(20, Math.floor(ch.count * 20 + 1e-6));
  return {
    vt,
    fold,
    live,
    scroll: sample(SCROLL, vt),
    cars,
    ghosts,
    dots,
    blocks,
    segs,
    gauges,
    ripple,
    curveIn: lerp(inS, w0, ch.track),
    curveOut: lerp(outS, gate(w0), ch.track),
    readouts: [
      { alpha: ch.ro1 * live, text: w0.toFixed(1) },
      { alpha: ch.ro2 * live, text: wireAt(1, vt).toFixed(2) },
      { alpha: ch.ro3 * live, text: wireAt(2, vt).toFixed(2) },
    ],
    ghostRow: { alpha: ch.grow * live, n: ghostN, v: 0.9 - GHOST_STEP * ghostN, u: ch.count },
    gust: (k: keyof typeof GUSTS) => (vt - GUSTS[k][0]) / GUSTS[k][1],
    ...ch,
    ...pu,
  };
}
