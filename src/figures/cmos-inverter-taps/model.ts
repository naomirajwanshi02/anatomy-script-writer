// CMOS inverter as two taps (episode 5 analogy figure).
// Time unit: seconds; the output tank charges and drains with τ = 0.7 s, each tap opens or shuts in 0.2 s
// (break-before-make: the open tap shuts fully before the other one starts to open).
// One 51 s pass timed to the episode 5 voiceover (video time = 3 s entrance + loop time); ends in the starting state.
// Story: taps (fill, drain, refill) -> fold into the inverter -> input 0, 1, 0 in the circuit -> fold back for the interview line.
// Timeline = the spans where Vin is 0 and the fold; taps, tank level, current and graph are computed here.
import { ENTRY } from "../../iso/entrance";

export const LOOP = 51;
// Reduced motion holds the tank full with the PMOS open.
export const KEY_TIME = ENTRY.loopFrom + 28.8;

// Vin is 0 inside these spans (loop seconds, [start, end)), 1 elsewhere. Comments give video times.
const VIN_LOW: [number, number][] = [
  [3.4, 5.8], // 6.4 s "The top fills a tank"; 8.8 s "Turn it." -> the top shuts first, then the tank drains
  [10.4, 23.4], // 13.4 s "Turn it back, and the tank refills"; 26.4 s "The handle is the input"
  [26.2, 29.8], // 29.2 s "Input zero: P MOS conducts"; 32.8 s "Input one: N MOS conducts"
  [33, 39.5], // 36 s "always the opposite: an inverter"; 42.5 s water again under the interview line
  [42.8, 46], // 45.8 s fill, 49 s drain: empty again for the loop
];
export const EDGES = VIN_LOW.flat();
const MORPH_IN = 18; // 21 s "Now, let's build it as a circuit"
const MORPH_OUT = 35.6; // 38.6 s fold back before the interview line
const MORPH_DUR = 3;
const LEVER_TRAVEL = 0.3; // s, the lever moves this long before each edge

const TAU = 0.7; // s, RC constant of the output tank through one open valve
const VALVE_TRAVEL = 0.2; // s, a tap or valve opens or shuts fully
const DT = 0.01;

export const vinAt = (t: number) => (VIN_LOW.some(([a, b]) => t >= a && t < b) ? 0 : 1);
const smooth = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
// 0 = water, 1 = circuit.
const morphAt = (t: number) => (t < MORPH_OUT ? smooth((t - MORPH_IN) / MORPH_DUR) : 1 - smooth((t - MORPH_OUT) / MORPH_DUR));
// Lever position: -1 = pulled (Vin 1), 1 = up (Vin 0); it starts moving LEVER_TRAVEL before each edge.
const leverAt = (t: number) => {
  let v = vinAt(0) ? -1 : 1;
  for (const [a, b] of VIN_LOW) {
    v += 2 * smooth((t - (a - LEVER_TRAVEL)) / LEVER_TRAVEL);
    v -= 2 * smooth((t - (b - LEVER_TRAVEL)) / LEVER_TRAVEL);
  }
  return v;
};

// gp, gn: how far the PMOS and NMOS are open; level: output tank 0..1; flow: current into the tank (< 0 draining).
function simulate() {
  const n = Math.round(LOOP / DT);
  const s = { gp: [] as number[], gn: [] as number[], level: [] as number[], flow: [] as number[] };
  let gp = 0;
  let gn = 1;
  let level = 0;
  for (let i = 0; i < n; i++) {
    const step = DT / VALVE_TRAVEL;
    if (vinAt(i * DT)) {
      gp = Math.max(0, gp - step);
      if (gp === 0) gn = Math.min(1, gn + step);
    } else {
      gn = Math.max(0, gn - step);
      if (gn === 0) gp = Math.min(1, gp + step);
    }
    // RC: fills toward 1 through the PMOS (1 - e^(-t/τ)), drains toward 0 through the NMOS (e^(-t/τ)).
    const rate = (gp * (1 - level) - gn * level) / TAU;
    level = Math.min(1, Math.max(0, level + rate * DT));
    s.gp.push(gp);
    s.gn.push(gn);
    s.level.push(level);
    s.flow.push(rate * TAU);
  }
  return s;
}
const SIM = simulate();
const index = (t: number) => Math.min(SIM.level.length - 1, Math.max(0, Math.floor(t / DT)));
export const levelAt = (t: number) => SIM.level[index(t)];
export const flowAt = (t: number) => SIM.flow[index(t)];

export type State = { vin: number; gp: number; gn: number; level: number; i: number; m: number; lever: number };
export const stateAt = (t: number): State => {
  const i = index(t);
  return { vin: vinAt(t), gp: SIM.gp[i], gn: SIM.gn[i], level: SIM.level[i], i: SIM.flow[i], m: morphAt(t), lever: leverAt(t) };
};

export const TABLE = [
  { vin: 0, vout: 1 },
  { vin: 1, vout: 0 },
];

// Scope readout: Vin (row 0) and Vout = tank level (row 1) over one loop, plus the active (rust) segment.
export const SCOPE = { w: 214, h: 104, left: 40, right: 6, rows: [{ top: 8, bottom: 38 }, { top: 58, bottom: 88 }], axis: 96 };
export const scopeX = (t: number) => SCOPE.left + (t / LOOP) * (SCOPE.w - SCOPE.left - SCOPE.right);
const scopeY = (row: number, v: number) => SCOPE.rows[row].bottom - v * (SCOPE.rows[row].bottom - SCOPE.rows[row].top);

export function scopeTrace(row: number, from = 0, to = LOOP) {
  const f = row === 0 ? vinAt : levelAt;
  const pts: string[] = [];
  const n = Math.max(2, Math.round((900 * (to - from)) / LOOP));
  let last: number | null = null;
  for (let i = 0; i <= n; i++) {
    const t = Math.min(to - 1e-6, from + ((to - from) * i) / n);
    const v = f(t);
    if (row === 0 && last !== null && v !== last) pts.push(`${scopeX(t).toFixed(1)},${scopeY(row, last).toFixed(1)}`);
    pts.push(`${scopeX(t).toFixed(1)},${scopeY(row, v).toFixed(1)}`);
    last = v;
  }
  return "M" + pts.join("L");
}

// Vout from the last input edge up to t, while current still flows.
export function scopeActive(t: number) {
  const edge = [...EDGES].reverse().find((e) => t >= e);
  return edge !== undefined && Math.abs(flowAt(t)) > 0.02 ? scopeTrace(1, edge, t) : "";
}

export const scopeFrame = {
  baselines: SCOPE.rows.map((r) => `M${SCOPE.left},${r.bottom}H${SCOPE.w - SCOPE.right}M${SCOPE.left},${r.top}H${SCOPE.w - SCOPE.right}`).join(""),
  axis: `M${SCOPE.left},${SCOPE.axis}H${SCOPE.w - SCOPE.right}`,
  seconds: Array.from({ length: Math.floor(LOOP / 10) + 1 }, (_, i) => ({ x: scopeX(i * 10), s: i * 10 })),
};
