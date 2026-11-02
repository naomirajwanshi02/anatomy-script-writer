// Wider is faster, as water pipes (episode 9 analogy figure). Built on the episode 5/8 tap figures.
// Time unit: seconds. Fill τ = 3.2 s / W, drain τ = 0.7 s / W: a pipe (or transistor) twice as wide has half the
// resistance, so the same tank fills twice as fast (t50 = 0.69 τ: t1 ≈ 2.2 s at W=1, t2 ≈ 1.1 s at W=2).
// Each tap opens or shuts in 0.35 s, break-before-make (the open tap shuts fully before the other starts to open).
// One 60 s pass: water 0-24 s, fold 24-30 s, the same race in the circuit 30-54 s, fold back 54-60 s.
// Starts from scratch: empty tank, empty graph, W=1, input 1.
// Timeline = the spans where Vin is 0, the width ramps and the fold; taps, tank level, current and graph are computed.
import { ENTRY } from "../../iso/entrance";

export const LOOP = 60;
const HALF = 30;
// Reduced motion holds the water half with the wide pipe and a full tank.
export const KEY_TIME = ENTRY.loopFrom + 23.5;

// Vin is 0 inside these spans (loop seconds, [start, end)), 1 elsewhere.
const VIN_LOW: [number, number][] = [
  [5, 12], // W=1: fill, then drain until empty
  [18, 30.6], // W=2: fill again from empty; the circuit half starts full and drains at W=2
  [35, 42], // circuit W=1: fill, then drain until empty
  [48, 60], // circuit W=2: fill
];
// The width changes only while the tank is empty and nothing flows (reset), then the fill starts again.
const WIDEN_AT = 15.4; // each half: W 1 -> 2 over WIDEN_DUR
const NARROW_AT = 2.4; // circuit half only: W 2 -> 1 (the water half starts at W=1)
const WIDEN_DUR = 2.4;
// The W label is enlarged and lit from each width change until shortly after the next fill starts.
const HIGHLIGHT = [
  [WIDEN_AT, 19.6],
  [NARROW_AT, 6.6],
];
const MORPH_IN = 24;
const MORPH_OUT = 54;
const MORPH_DUR = 6;
const LEVER_TRAVEL = 0.3; // s, the lever moves this long before each edge

const TAU_FILL = 3.2; // s at W=1
const TAU_DRAIN = 0.7; // s at W=1
const VALVE_TRAVEL = 0.35;
const DT = 0.005;

export const vinAt = (t: number) => (VIN_LOW.some(([a, b]) => t >= a && t < b) ? 0 : 1);
const smooth = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
export const widthAt = (t: number) => {
  const h = t % HALF;
  if (h >= WIDEN_AT) return 1 + smooth((h - WIDEN_AT) / WIDEN_DUR);
  return t >= HALF ? 2 - smooth((h - NARROW_AT) / WIDEN_DUR) : 1;
};
// The width the label shows: the new value from the moment a change starts.
export const labelW = (t: number) => {
  const h = t % HALF;
  return h >= WIDEN_AT || (t >= HALF && h < NARROW_AT) ? 2 : 1;
};
// W label highlight 0..1: fades in over 0.4 s at a width change, out over 0.6 s.
export const highlightAt = (t: number) => {
  const h = t % HALF;
  const spans = t >= HALF ? HIGHLIGHT : HIGHLIGHT.slice(0, 1);
  return Math.max(0, ...spans.map(([a, b]) => Math.min(smooth((h - a) / 0.4), 1 - smooth((h - b) / 0.6))));
};
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

// gp, gn: how far the PMOS and NMOS taps are open; level: tank 0..1; flow: into the tank in units of 1/TAU_FILL (< 0 draining).
function simulate() {
  const n = Math.round(LOOP / DT);
  const s = { gp: [] as number[], gn: [] as number[], level: [] as number[], flow: [] as number[] };
  let gp = 0;
  let gn = 1;
  let level = 0;
  for (let i = 0; i < n; i++) {
    const t = i * DT;
    const step = DT / VALVE_TRAVEL;
    if (vinAt(t)) {
      gp = Math.max(0, gp - step);
      if (gp === 0) gn = Math.min(1, gn + step);
    } else {
      gn = Math.max(0, gn - step);
      if (gn === 0) gp = Math.min(1, gp + step);
    }
    // RC: fills toward 1 through the PMOS (1 - e^(-t/τ)), drains toward 0 through the NMOS (e^(-t/τ)), τ ∝ 1/W.
    const w = widthAt(t);
    const rate = w * ((gp * (1 - level)) / TAU_FILL - (gn * level) / TAU_DRAIN);
    level = Math.min(1, Math.max(0, level + rate * DT));
    s.gp.push(gp);
    s.gn.push(gn);
    s.level.push(level);
    s.flow.push(rate * TAU_FILL);
  }
  return s;
}
const SIM = simulate();
const index = (t: number) => Math.min(SIM.level.length - 1, Math.max(0, Math.floor(t / DT)));
export const levelAt = (t: number) => SIM.level[index(t)];

export type State = { vin: number; gp: number; gn: number; level: number; i: number; m: number; lever: number; w: number; hl: number };
export const stateAt = (t: number): State => {
  const i = index(t);
  return { vin: vinAt(t), gp: SIM.gp[i], gn: SIM.gn[i], level: SIM.level[i], i: SIM.flow[i], m: morphAt(t), lever: leverAt(t), w: widthAt(t), hl: highlightAt(t) };
};

// Graph readout: the W=1 fill (ink) and the W=2 fill (rust) from the moment the PMOS tap starts to open.
export const GRAPH = { w: 220, h: 112, left: 30, right: 8, top: 10, bottom: 92, span: 12 };
const FILL_SPANS = [
  [VIN_LOW[0], VIN_LOW[2]],
  [VIN_LOW[1], VIN_LOW[3]],
];
const FILLS = FILL_SPANS.map((spans) => spans.map(([a]) => a + VALVE_TRAVEL));
// End of the fill that started at s (the input goes back to 1).
const fillEnd = (k: number, s: number) => FILL_SPANS[k][FILLS[k].indexOf(s)][1];
// Time from the start of a fill until the tank passes 50 %, read from the simulation.
const t50 = (start: number) => {
  let u = 0;
  while (u < GRAPH.span && levelAt(start + u) < 0.5) u += DT;
  return u;
};
const T50 = FILLS.map((starts) => t50(starts[0]));

export const graphX = (u: number) => GRAPH.left + (Math.min(u, GRAPH.span) / GRAPH.span) * (GRAPH.w - GRAPH.left - GRAPH.right);
export const graphY = (v: number) => GRAPH.bottom - v * (GRAPH.bottom - GRAPH.top);
// Start of curve k showing at t, or null: curve 1 (W=2) only once it is newer than curve 0 (W=1).
const curveStart = (k: number, t: number): number | null => {
  const s = [...FILLS[k]].reverse().find((a) => t >= a);
  if (s === undefined) return null;
  if (k === 1 && s < (curveStart(0, t) ?? Infinity)) return null;
  return s;
};
export function curve(k: number, t: number) {
  const s = curveStart(k, t);
  if (s === null) return "";
  const len = Math.min(t, fillEnd(k, s)) - s > GRAPH.span ? GRAPH.span : Math.min(t, fillEnd(k, s)) - s;
  const n = Math.max(2, Math.round((len / GRAPH.span) * 160));
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const u = (len * i) / n;
    pts.push(`${graphX(u).toFixed(1)},${graphY(levelAt(s + u)).toFixed(1)}`);
  }
  return "M" + pts.join("L");
}
export const tickShown = (k: number, t: number) => {
  const s = curveStart(k, t);
  return s !== null && t - s >= T50[k];
};
export const ticks = T50.map((u) => ({ x: graphX(u), y: graphY(0.5) }));
export const graphFrame = {
  frame: `M${GRAPH.left},${GRAPH.top}V${GRAPH.bottom}H${GRAPH.w - GRAPH.right}`,
  full: `M${GRAPH.left},${graphY(1)}H${GRAPH.w - GRAPH.right}`,
  half: `M${GRAPH.left},${graphY(0.5)}H${GRAPH.w - GRAPH.right}`,
  seconds: [0, 2, 4, 6, 8, 10, 12].map((s) => ({ x: graphX(s), s })),
};
