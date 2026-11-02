// Latch race-through as water locks (reference analogy figure).
// Time unit: one latch delay = 1 s (the circuit's slow motion); loop 30 s, ends in the starting state.
// Story: water locks (0-8 s) -> fold into two D latches sharing EN (8-11 s) -> circuit race -> fold back (27-30 s).
// Timeline = lever spans only; everything else (latch outputs, water levels, flows, gate travel, morph)
// is computed here once and read by live.tsx.
import { ENTRY } from "../../iso/entrance";

export const LOOP = 30;
// Reduced motion holds the key state: EN open, both chambers/latches already through.
export const KEY_TIME = ENTRY.loopFrom + 21;

// Lever timeline (loop seconds, [start, end)).
const D_HIGH: [number, number][] = [
  [0.8, 11.5],
  [16.5, 23],
];
const EN_OPEN: [number, number][] = [
  [2.5, 7],
  [12.5, 15.5],
  [17.5, 22.5],
  [24, 27],
];
const MORPH_IN = 8; // water -> circuit fold starts
const MORPH_OUT = 27; // circuit -> water fold starts
const MORPH_DUR = 3;

const inSpans = (t: number, s: [number, number][]) => s.some(([a, b]) => t >= a && t < b);
export const dAt = (t: number) => (inSpans(t, D_HIGH) ? 1 : 0);
export const enAt = (t: number) => (inSpans(t, EN_OPEN) ? 1 : 0);

const smooth = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
// 0 = water locks, 1 = circuit.
export const morphAt = (t: number) => (t < MORPH_OUT ? smooth((t - MORPH_IN) / MORPH_DUR) : 1 - smooth((t - MORPH_OUT) / MORPH_DUR));

const DT = 0.01;
const LATCH_DELAY = 1; // s, transport delay of each D latch
const CHAMBER_TAU = 0.42; // s, RC constant of each lock chamber through a fully open gate
const RESERVOIR_TAU = 0.35; // s, reservoir follows the D lever
const GATE_TRAVEL = 0.5; // s, gates lift or drop fully

type Trace = { d: number[]; en: number[]; q1: number[]; q2: number[]; res: number[]; c1: number[]; c2: number[]; gate: number[]; f1: number[]; f2: number[] };

function simulate(): Trace {
  const n = Math.round(LOOP / DT);
  const lag = Math.round(LATCH_DELAY / DT);
  const s: Trace = { d: [], en: [], q1: [], q2: [], res: [], c1: [], c2: [], gate: [], f1: [], f2: [] };
  const at = (a: number[], i: number) => (i >= 0 ? a[i] : 0);
  // D latch with delay: while EN was high one delay ago, Q follows its input from one delay ago; else it holds.
  const latch = (q: number[], input: number[], i: number) => (at(s.en, i - lag) ? at(input, i - lag) : at(q, i - 1));
  let res = 0;
  let c1 = 0;
  let c2 = 0;
  let gate = 0;
  for (let i = 0; i < n; i++) {
    const t = i * DT;
    s.d.push(dAt(t));
    s.en.push(enAt(t));
    s.q1.push(latch(s.q1, s.d, i));
    s.q2.push(latch(s.q2, s.q1, i));
    gate = Math.min(1, Math.max(0, gate + (enAt(t) ? 1 : -1) * (DT / GATE_TRAVEL)));
    const open = gate * gate;
    res += (dAt(t) - res) * (DT / RESERVOIR_TAU);
    // Flow through each gate follows the level difference (RC: 1 - e^(-t/τ) filling, e^(-t/τ) draining).
    const f1 = open * (res - c1);
    const f2 = open * (c1 - c2);
    c1 += f1 * (DT / CHAMBER_TAU);
    c2 += f2 * (DT / CHAMBER_TAU);
    s.res.push(res);
    s.c1.push(c1);
    s.c2.push(c2);
    s.gate.push(gate);
    s.f1.push(f1);
    s.f2.push(f2);
  }
  return s;
}

const SIM = simulate();
const index = (t: number) => Math.min(SIM.d.length - 1, Math.max(0, Math.floor(t / DT)));

export type State = { d: number; en: number; q1: number; q2: number; res: number; c1: number; c2: number; gate: number; f1: number; f2: number; m: number };

export const stateAt = (t: number): State => {
  const i = index(t);
  return { d: SIM.d[i], en: SIM.en[i], q1: SIM.q1[i], q2: SIM.q2[i], res: SIM.res[i], c1: SIM.c1[i], c2: SIM.c2[i], gate: SIM.gate[i], f1: SIM.f1[i], f2: SIM.f2[i], m: morphAt(t) };
};
