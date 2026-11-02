// Noise margins on a road. Time unit: video seconds (vt = 3 s entrance + loop time), laid out on the planned voice
// times (a voice.ts can remap them later). LOOP = 69.7 s: the last event (fold back to the road) ends at 64.7 s and
// the start frame holds to 72.7 s, so the loop ends in the start state (car in the middle of its lane).
// Analogy: a rust car in the middle of its lane, a sepia car in the middle of the other lane; a gust of wind pushes a
// ghost car near the lane line over it, and the same gust pushes the real car the same distance but it stays inside.
// Circuit: the road itself (both lanes, the hatched strip and both cars) tilts upright and becomes the 0-1 V scale
// (top lane = 1 band, strip = 0.4-0.6 V, bottom lane = 0 band); the cars are the markers (height = voltage). A
// sending gate drives 0.9 V (VOH) on a wire, the receiving gate reads anything above 0.6 V (VIH) as 1. Noise on a
// neighbour wire couples small bumps onto ours, one big 0.2 V bump pulls the level down to 0.7 V, still a 1.
// Noise margin high = VOH - VIH, low = VIL - VOL.
// Timeline: lever-like moves (the send level), arrivals (gates, gauge, markers, lines, bands, brackets), the gusts,
// the noise flicks and the folds; marker voltages, bands, lamp, readout, wire bumps and the car push are computed.
import { loopTime } from "../../iso/entrance";

export const LOOP = 69.7;
export const BRAND = "ROLLIN";

// ---------- Logic levels and margins ----------

export const VOH = 0.9;
export const VIH = 0.6;
export const VIL = 0.4;
export const VOL = 0.1;
export const NM_HIGH = VOH - VIH;
export const NM_LOW = VIL - VOL;
export const BIG_BUMP = 0.2;
const near = (a: number, b: number) => Math.abs(a - b) < 1e-9;
if (!near(NM_HIGH, 0.3) || !near(NM_LOW, 0.3)) throw new Error(`noise margins ${NM_HIGH} ${NM_LOW}`);
if (!(VOH - BIG_BUMP > VIH) || !near(VOH - BIG_BUMP, 0.7)) throw new Error(`0.9 - 0.2 must stay a 1 (> ${VIH})`);
// 1 above VIH, 0 below VIL, undefined between.
export const bandOf = (v: number) => (v >= VIH ? 1 : v <= VIL ? 0 : -1);

// ---------- Road (board units: x right, y toward the viewer) ----------

// Road across x: v = 0 at x = 70 (outer edge of the 0 lane), v = 1 at x = -70; lane line of the car's lane at v = VIH.
export const ROAD = { xV0: 70, width: 140, yFront: 60, len: 120 };
export const xOfV = (v: number) => ROAD.xV0 - ROAD.width * v;
export const LINE_X = xOfV(VIH);
export const CAR = { x: -42, y: 31, half: 13.7 };
// The ghost drives at the car's spot along the road (the car steps aside for that beat), near the lane line.
export const GHOST = { x: -29.5, y: CAR.y };
export const PUSH = 10; // one gust moves a car this far toward the line (+x)
if (!(CAR.x + CAR.half + PUSH < LINE_X)) throw new Error("the car in the middle must stay inside its lane");
if (!(GHOST.x + CAR.half < LINE_X && GHOST.x + CAR.half + PUSH > LINE_X)) throw new Error("the ghost near the line must be pushed over it");
// The sepia car drives in the middle of the other lane (the 0 lane), further along the road.
export const SEPIA = { x: xOfV(0.2), y: -33 };
export const LANE_MID = { one: 0.8, zero: 0.2 };
if (!near(CAR.x, xOfV(LANE_MID.one))) throw new Error("the rust car must sit in the middle of its lane");

// Upright gauge = the road turned up: width w (along the road), height h (0..1 V), standing at y with 0 V at z0.
// On it the cars shrink to carScale; a car's centre height is its voltage, so its half-width in volts is CAR_HALF_V.
export const GAUGE = { w: 80, h: 112, z0: 14, y: 16, carScale: 0.54 };
export const CAR_HALF_V = (CAR.half * GAUGE.carScale) / GAUGE.h;
if (!(VOH - BIG_BUMP - CAR_HALF_V > VIH + 0.02)) throw new Error("at 0.7 V the car must stay clear of the 0.6 line");
if (!(VOH + CAR_HALF_V < 1 && VOL - CAR_HALF_V > 0 && VOL + CAR_HALF_V < VIL - 0.1)) throw new Error("cars must fit their bands");

// Road texture scroll: 70 repeats of 28 units per loop, so the loop ends on the same phase.
const SCROLL_PER_S = (28 * 70) / LOOP;
export const scrollAt = (t: number) => SCROLL_PER_S * (t < 3 ? t - 3 : loopTime(t, LOOP));

// ---------- Timeline (video seconds) ----------

type Span = [from: number, to: number, value: number];
const CHANNELS: Record<string, { from: number; spans: Span[] }> = {
  car: { from: 1, spans: [[22.7, 23.0, 0], [64.3, 64.7, 1]] },
  ghost: { from: 0, spans: [[4.9, 5.3, 1], [8.6, 9.0, 0]] },
  ghostPush: { from: 0, spans: [[7.5, 7.9, 1], [8.15, 8.7, 0]] },
  carPush: { from: 0, spans: [[10.95, 11.35, 1], [11.65, 12.3, 0]] },
  // Fold: the road (with both cars) turns up into the scale (u) and back; a backing board appears behind it.
  fold: { from: 0, spans: [[22.8, 24.0, 1], [63.5, 64.35, 0]] },
  plinth: { from: 0, spans: [[24.0, 24.4, 1], [63.35, 63.5, 0]] },
  // Ticks and the 0 V / 1 V labels appear on "voltage".
  // Rust car waits faded at the 0 V end until the gate sends; the sepia car is faded until "a zero".
  park: { from: 0, spans: [[26.6, 27.2, 1], [35.0, 35.2, 0]] },
  dim0: { from: 0, spans: [[24.0, 24.4, 1], [56.1, 56.4, 0]] },
  gates: { from: 0, spans: [[24.7, 25.2, 1]] },
  wire: { from: 0, spans: [[24.95, 25.5, 1]] },
  rise: { from: 0, spans: [[26.0, 26.6, 1]] },
  marker1: { from: 0, spans: [[26.6, 26.85, 1]] },
  fill1: { from: 0, spans: [[35.0, 35.2, 1]] },
  line6: { from: 0, spans: [[29.2, 29.6, 1]] },
  band1: { from: 0, spans: [[30.2, 30.7, 1]] },
  lane: { from: 0, spans: [[32.1, 32.35, 1], [33.2, 33.5, 0]] },
  thick: { from: 0, spans: [[33.2, 33.5, 1]] },
  readout: { from: 0, spans: [[35.0, 35.3, 1]] },
  neighbour: { from: 0, spans: [[38.6, 39.0, 1]] },
  tick9: { from: 0, spans: [[49.0, 49.35, 1]] },
  bracket1: { from: 0, spans: [[49.9, 50.7, 1]] },
  bfill1: { from: 0, spans: [[51.9, 52.4, 1]] },
  marker0: { from: 0, spans: [[56.1, 56.4, 1]] },
  line4: { from: 0, spans: [[56.6, 57.0, 1]] },
  band0: { from: 0, spans: [[57.2, 57.6, 1]] },
  bracket0: { from: 0, spans: [[57.9, 58.7, 1]] },
  bfill0: { from: 0, spans: [[58.8, 59.2, 1]] },
  hatch: { from: 0, spans: [[58.8, 59.2, 1]] },
  // Fold back: the circuit parts fade, then the scale itself (the folding panel underneath carries on).
  out: { from: 0, spans: [[63.2, 63.45, 1]] },
  gaugeOut: { from: 0, spans: [[63.35, 63.55, 1]] },
};
// Single pulses (0 -> 1 -> 0): [start, length].
const PULSES: Record<string, [number, number][]> = {
  recvPulse: [[27.9, 0.5]],
  glow6: [[29.2, 0.7]],
  bandFlash: [[30.2, 0.7]],
  glow4: [[56.6, 0.7]],
  sendPulse: [[34.7, 0.45]],
  gapFlash: [[36.6, 0.7], [44.4, 0.8]],
  lampBoost: [[47.0, 0.6]],
  bracketPulse: [[55.1, 0.6]],
};
// The gusts: streaks sweep in from the left road side (x -74) to past the car; [start, duration].
export const GUSTS = { ghost: [6.9, 1.1], car: [10.47, 1.1] } as const;
// On the gauge the wind sweeps down from above onto the rust car: the noise gust (hits at 39.25) and the strong gust
// (hits at 42.15 and pushes the car down to 0.7 V). [start, duration]; heads travel from v 1.12 to v 0.75.
export const GAUGE_GUSTS = { noise: [38.83, 1.0], big: [41.6, 1.3] } as const;

const clamp01 = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u);
export const ease = (u: number) => {
  const c = clamp01(u);
  return c * c * (3 - 2 * c);
};
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

// ---------- Signal on the wire ----------

// Send level: 0 until the sending gate drives the wire, rising to VOH over 1 s.
const SEND: [number, number] = [35.0, 36.0];
const FLOW_ON: [number, number] = [34.7, 63.2];
const levelAt = (vt: number) => VOH * ease((vt - SEND[0]) / (SEND[1] - SEND[0]));

// Wire along x from the sending gate to the receiving gate; the gauge reads it at x = 0.
export const WIRE = { x0: -40, x1: 36, at: 0, w: 7 };
// Noise flicks of the neighbour wire. Small ones (from 39.9) each launch a small bump along our wire; the big one at
// 42.15 launches a 0.2 V bump that slows to a stop right at the gauge at 43.45, holds, and fades from 48.0.
const SMALL = 0.025;
const SMALL_AT = [39.9, 40.45, 41.0, 41.55, 59.5, 60.05, 60.6, 61.15, 61.7, 62.25];
const PRE_FLICK = [38.75, 39.1, 39.45, 59.3];
const HUMP_SPEED = 58;
const BIG = { from: 42.15, to: 43.45, fade: [48.0, 49.0] as [number, number] };
export const FLICKS = [...PRE_FLICK, ...SMALL_AT, BIG.from].sort((a, b) => a - b);
export type Hump = { x: number; a: number };
export function humpsAt(vt: number): Hump[] {
  const out: Hump[] = [];
  for (const t0 of SMALL_AT) {
    const x = WIRE.x0 + (vt - t0) * HUMP_SPEED;
    if (vt >= t0 && x <= WIRE.x1 + 8) out.push({ x, a: SMALL * Math.min(1, (vt - t0) / 0.1) });
  }
  if (vt >= BIG.from && vt < BIG.fade[1]) {
    const u = clamp01((vt - BIG.from) / (BIG.to - BIG.from));
    const x = WIRE.x0 + (WIRE.at - WIRE.x0) * (1 - (1 - u) * (1 - u)); // slows and stops at the gauge
    const fade = vt <= BIG.fade[0] ? 1 : 1 - ease((vt - BIG.fade[0]) / (BIG.fade[1] - BIG.fade[0]));
    out.push({ x, a: BIG_BUMP * Math.min(1, (vt - BIG.from) / 0.15) * fade });
  }
  return out;
}
const dipAt = (humps: Hump[], x: number) => humps.reduce((s, h) => s + h.a * Math.exp(-(((h.x - x) / WIRE.w) ** 2)), 0);

// Small jitter (about +-0.012 V on top of the bumps) while the neighbour is noisy.
const ramp = (vt: number, a: number, b: number) => clamp01((vt - a) / (b - a));
const jitEnv = (vt: number) => ramp(vt, 39.25, 39.5) * (1 - ramp(vt, 42.15, 42.5)) + ramp(vt, 59.3, 59.6) * (1 - ramp(vt, 63.2, 63.4));
const wobble = (vt: number, f1: number, f2: number, p: number) => (Math.sin(2 * Math.PI * f1 * vt + p) + 0.6 * Math.sin(2 * Math.PI * f2 * vt + 2 * p)) / 1.6;
export const marker1At = (vt: number) => levelAt(vt) - dipAt(humpsAt(vt), WIRE.at) + 0.012 * jitEnv(vt) * wobble(vt, 3.3, 5.9, 0.4);
export const marker0At = (vt: number) => VOL + 0.02 * ramp(vt, 59.3, 59.6) * (1 - ramp(vt, 63.2, 63.4)) * wobble(vt, 2.7, 6.3, 1.9);

// Checks: the big bump stops the 1 marker exactly at 0.7 V; once sent, the 1 never reaches VIH; the 0 stays below
// VIL; the lamp lights during the rise; small noise stays near +-0.03 V.
if (!near(marker1At(BIG.to), VOH - BIG_BUMP)) throw new Error(`marker at ${BIG.to} s is ${marker1At(BIG.to)}, not 0.7`);
for (let vt = 36; vt <= 63.2; vt += 0.01) {
  const v = marker1At(vt);
  if (!(v > VIH + 0.05) || bandOf(v) !== 1) throw new Error(`1 marker ${v.toFixed(3)} at ${vt.toFixed(2)} s comes too near VIH`);
  if ((vt < 42.15 || vt > 59.3) && Math.abs(v - VOH) > 0.045) throw new Error(`noise ${v.toFixed(3)} at ${vt.toFixed(2)} s`);
  if (bandOf(marker0At(vt)) !== 0) throw new Error(`0 marker leaves its band at ${vt.toFixed(2)} s`);
}
let firstLit = -1;
for (let vt = 34; vt <= 37 && firstLit < 0; vt += 0.005) if (marker1At(vt) > VIH) firstLit = vt;
if (firstLit < SEND[0] || firstLit > SEND[1]) throw new Error(`lamp lights at ${firstLit}`);

// Car heights on the panel (v, 0..1): lane middles on the road; after the fold the cars move to their voltages (the
// rust car never lower than its own half-width, so it sits at the 0 V end), and back to the lane middles at the end.
const shown = (v: number) => Math.max(v, CAR_HALF_V + 0.008);
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
export function carVs(vt: number, v1: number, v0: number) {
  const into = ease((vt - 26.6) / 0.6);
  const back = ease((vt - 63.2) / 0.3);
  return { one: lerp(lerp(LANE_MID.one, shown(v1), into), LANE_MID.one, back), zero: lerp(lerp(LANE_MID.zero, v0, into), LANE_MID.zero, back) };
}

// ---------- State ----------

// Reduced motion: hold the key state (marker at 0.7 V, still a 1, lamp lit).
export const KEY_TIME = 45.5;

export function stateAt(t: number) {
  const vt = 3 + loopTime(t, LOOP);
  const v1 = marker1At(vt);
  const v0 = marker0At(vt);
  // Neighbour flicker: each flick flashes the neighbour wire and decays; the big one flashes brightest.
  const flash = FLICKS.reduce((s, tk) => (vt >= tk ? s + (tk === BIG.from ? 2 : 1) * Math.exp(-(vt - tk) / 0.14) : s), 0);
  const gust = (k: keyof typeof GUSTS) => (vt - GUSTS[k][0]) / GUSTS[k][1];
  return {
    vt,
    v1,
    v0,
    band1: bandOf(v1),
    band0: bandOf(v0),
    lamp: v1 > VIH ? 1 : 0,
    flow: vt >= FLOW_ON[0] && vt < FLOW_ON[1] ? 1 : 0,
    humps: humpsAt(vt),
    flash: Math.min(1, flash),
    gustGhost: gust("ghost"),
    gustCar: gust("car"),
    gustNoise: (vt - GAUGE_GUSTS.noise[0]) / GAUGE_GUSTS.noise[1],
    gustBig: (vt - GAUGE_GUSTS.big[0]) / GAUGE_GUSTS.big[1],
    cars: carVs(vt, v1, v0),
    ...(Object.fromEntries(Object.keys(CHANNELS).map((k) => [k, channel(k, vt)])) as Record<keyof typeof CHANNELS, number>),
    ...(Object.fromEntries(Object.keys(PULSES).map((k) => [k, pulse(k, vt)])) as Record<keyof typeof PULSES, number>),
  };
}
