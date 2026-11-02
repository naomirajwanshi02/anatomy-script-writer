// AND, OR, NOT as taps (episode 3 analogy figure).
// Time unit: one gate delay = 0.5 s (circuit lamps follow their inputs half a second later).
// One 51.5 s pass timed to the episode 3 voiceover (video time = 3 s entrance + loop time); ends in the starting state.
// Story: water (both, then either, then every pattern) -> fold into three gates (AND, OR, NOT lines) -> fold back
// for the interview line -> 00 again. Timeline = input patterns and the fold only; flows, cups, lamps and rows are computed.
import { ENTRY } from "../../iso/entrance";
import type { GateId } from "./geometry";

export const LOOP = 51.5;
// Reduced motion holds the circuit at 11: the AND lamp lit.
export const KEY_TIME = ENTRY.loopFrom + 25;

// Input pattern from each loop time on: 0 = 00, 1 = 01, 2 = 10, 3 = 11 (A is the high bit). Comments give video times.
const PATTERNS: [number, number][] = [
  [0, 0],
  [6.3, 3], // 9.3 s "only if BOTH are open": both taps open
  [9.6, 2], // 12.6 s "if either is open": OR flows, AND stays dry
  [11, 0], // 14 s "Watch every pattern"
  [13, 1],
  [15, 2],
  [17, 3],
  [19.9, 0], // 22.9 s "Each tap becomes an input"
  [24, 3], // 27 s AND lamp lights on "both inputs are one"
  [26.6, 0], // 29.6 s "become OR"
  [28.2, 1], // 31.2 s OR lamp lights on "any input is one"
  [31.4, 2], // 34.4 s "NOT simply flips it": A rises, NOT goes dark, OR stays lit
  [32.9, 3], // 35.9 s "These three can build any logic"
  [37.8, 0], // 40.8 s water again under the interview line
  [39.9, 1],
  [42, 2],
  [44.1, 3],
  [46, 0], // 49 s back to the start for the teaser and the loop
];
const MORPH_IN = 17.8; // 20.8 s "Now, let's build it as a circuit"
const MORPH_OUT = 35; // 38 s fold back before the interview line
const MORPH_DUR = 3;
const GATE_DELAY = 0.5; // s, transport delay of each gate
const CUP_TAU = 0.4; // s, a cup fills or drains with this RC constant
const DT = 0.01;

const wrap = (t: number) => ((t % LOOP) + LOOP) % LOOP;
export const patternAt = (t: number) => {
  const lt = wrap(t);
  let n = 0;
  for (const [from, p] of PATTERNS) if (lt >= from) n = p;
  return n;
};
const inputsAt = (t: number) => {
  const n = patternAt(t);
  return { a: (n >> 1) & 1, b: n & 1 };
};
const logic = ({ a, b }: { a: number; b: number }): Record<GateId, number> => ({ and: a & b, or: a | b, not: 1 - a });

const smooth = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
// 0 = water, 1 = circuit.
const morphAt = (t: number) => (t < MORPH_OUT ? smooth((t - MORPH_IN) / MORPH_DUR) : 1 - smooth((t - MORPH_OUT) / MORPH_DUR));

// Cup levels: each cup fills toward its gate's instant output (1 - e^(-t/τ)) and drains back (e^(-t/τ)).
function simulate() {
  const n = Math.round(LOOP / DT);
  const out: Record<GateId, number[]> = { and: [], or: [], not: [] };
  const level: Record<GateId, number> = { and: 0, or: 0, not: 1 };
  for (let i = 0; i < n; i++) {
    const y = logic(inputsAt(i * DT));
    for (const g of ["and", "or", "not"] as const) {
      level[g] += (y[g] - level[g]) * (DT / CUP_TAU);
      out[g].push(level[g]);
    }
  }
  return out;
}
const CUPS = simulate();

export type State = { a: number; b: number; m: number; flow: Record<GateId, number>; cup: Record<GateId, number> } & Record<GateId, number>;

export const stateAt = (t: number): State => {
  const now = inputsAt(t);
  const late = logic(inputsAt(t - GATE_DELAY));
  const i = Math.min(CUPS.and.length - 1, Math.max(0, Math.floor(wrap(t) / DT)));
  return { ...now, ...late, flow: logic(now), cup: { and: CUPS.and[i], or: CUPS.or[i], not: CUPS.not[i] }, m: morphAt(wrap(t)) };
};

// Truth tables; the current row follows the inputs (NOT has only A).
export const TABLES: Record<GateId, { head: string[]; rows: number[][] }> = {
  and: { head: ["A", "B", "Y"], rows: [[0, 0, 0], [0, 1, 0], [1, 0, 0], [1, 1, 1]] },
  or: { head: ["A", "B", "Y"], rows: [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 1]] },
  not: { head: ["A", "Y"], rows: [[0, 1], [1, 0]] },
};
export const rowAt = (t: number): Record<GateId, number> => {
  const n = patternAt(t);
  return { and: n, or: n, not: inputsAt(t).a };
};

// Lamp state at the start of the loop (NOT is lit while A = 0).
export const START_LAMP: Record<GateId, number> = { and: 0, or: 0, not: 1 };
