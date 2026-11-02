// Verilog vs a programming language: C runs its lines one after another on a CPU; Verilog lines are two gates
// that work all the time, side by side.
// Time unit: one gate delay = 1 s; loop 27 s, ends in the starting state (A = 0, Z lit, Y off, CPU on the board,
// header "c", no code).
// Timeline = lever moves, line executions, part arrivals/lifts and typing spans only; lamps, wires, readout text,
// cursor and part offsets are computed here.
import { ENTRY } from "../../iso/entrance";

export const LOOP = 27;
// Reduced motion holds the key state: Verilog, A = 1, Y lit, Z clear.
export const KEY_TIME = ENTRY.loopFrom + 23.5;

// ---- Timeline (loop seconds) ----
// A falls at 25 s (not 26 s) so the transport-delayed outputs return to Z lit / Y off at 26 s, inside the loop.
const A_HIGH: [number, number][] = [
  [7, 18],
  [21, 25],
];
export const B = 1; // fixed input, printed on the board
const EXEC = [8, 10]; // C: line 1 runs at 8 s, line 2 at 10 s (pointer on each for 2 s)
const EXEC_END = 12;
const CPU_LIFT = 12; // CPU lifts off
const CPU_FALL = 25.95; // CPU falls back, lands at CPU_FALL + FALL
const GATE_FALL = { and: 14.5, not: 16.3 }; // gates fall in once their line is typed
const GATE_LIFT = 26; // both gates lift off
const C_TYPE = 0.5; // C code typed from here
const C_ERASE: [number, number] = [12, 12.9];
const V_TYPE = [13.2, 15.2]; // Verilog line starts
const V_ERASE: [number, number] = [25.3, 26.1];
const CPS = 14; // typing speed, chars per second

const C_CODE = "y = a & b;\nz = !a;";
const V_CODE = "assign y = a & b;\nassign z = ~a;";
const V_LINE1 = V_CODE.indexOf("\n");

// ---- Drops and lifts (same gravity as the shared entrance: 1000 stage units in 0.55 s) ----
const TRAVEL = 1000;
export const FALL = 0.55;
const GRAVITY = (2 * TRAVEL) / FALL ** 2;
const RESTITUTION = 0.09;
// Vertical screen offset of a part: 0 on the board, negative above; null when it is off screen.
function dropOffset(t: number, fallFrom: number): number | null {
  const s = t - fallFrom;
  if (s < 0) return null;
  if (s < FALL) return -TRAVEL + 0.5 * GRAVITY * s * s;
  const b = s - FALL;
  const up = GRAVITY * FALL * RESTITUTION * b - 0.5 * GRAVITY * b * b;
  return up > 0 ? -up : 0;
}
function liftOffset(t: number, liftFrom: number): number | null {
  const s = t - liftFrom;
  if (s < 0) return 0;
  const y = -0.5 * GRAVITY * s * s;
  return y < -TRAVEL ? null : y;
}
export const landAt = { cpu: CPU_FALL + FALL, and: GATE_FALL.and + FALL, not: GATE_FALL.not + FALL };

export const partsAt = (t: number) => ({
  cpu: t < CPU_FALL ? liftOffset(t, CPU_LIFT) : dropOffset(t, CPU_FALL),
  and: t < GATE_LIFT ? dropOffset(t, GATE_FALL.and) : liftOffset(t, GATE_LIFT),
  not: t < GATE_LIFT ? dropOffset(t, GATE_FALL.not) : liftOffset(t, GATE_LIFT),
});

// A part is wired (its wires shown, it drives its lamp) while it sits on the board.
// Gates still drive for LET_GO s after they start to lift, so the 26 s switch (A fell at 25 s) happens on the board.
const LET_GO = 0.1;
const cpuOn = (t: number) => t < CPU_LIFT || t >= landAt.cpu;
const andOn = (t: number) => t >= landAt.and && t < GATE_LIFT + LET_GO;
const notOn = (t: number) => t >= landAt.not && t < GATE_LIFT + LET_GO;

const inSpans = (t: number, s: [number, number][]) => s.some(([a, b]) => t >= a && t < b);
export const aAt = (t: number) => (inSpans(t, A_HIGH) ? 1 : 0);

const DT = 0.01;
const GATE_DELAY = 1; // s, transport delay of each gate

type Trace = { a: number[]; y: number[]; z: number[] };

// C: an output changes only when its line runs (y = a & b at 8 s, z = !a at 10 s) and then holds.
// Verilog: while a gate is on the board its output is its function of the inputs one delay earlier (transport delay).
// Otherwise the lamp holds. Starts from the loop's start state (Y off, Z lit).
function simulate(): Trace {
  const n = Math.round(LOOP / DT);
  const lag = Math.round(GATE_DELAY / DT);
  const a = Array.from({ length: n }, (_, i) => aAt(i * DT));
  const before = (i: number) => a[(i - lag + n) % n];
  const ex = EXEC.map((e) => Math.round(e / DT));
  const y: number[] = [];
  const z: number[] = [];
  let yv = 0;
  let zv = 1;
  for (let i = 0; i < n; i++) {
    const t = i * DT;
    if (i === ex[0]) yv = a[i] & B;
    if (i === ex[1]) zv = a[i] ? 0 : 1;
    if (andOn(t)) yv = before(i) & B;
    if (notOn(t)) zv = before(i) ? 0 : 1;
    y.push(yv);
    z.push(zv);
  }
  return { a, y, z };
}

const SIM = simulate();
const index = (t: number) => Math.min(SIM.a.length - 1, Math.max(0, Math.floor(t / DT)));

export type Net = "a" | "b" | "y" | "z";
export type WireGroup = "and" | "not";
export type State = { a: number; b: number; y: number; z: number };

export const stateAt = (t: number): State => {
  const i = index(t);
  return { a: SIM.a[i], b: B, y: SIM.y[i], z: SIM.z[i] };
};

// Wires: in C every wire runs lever -> CPU -> lamps; in Verilog each gate brings its own wires.
export const wireShown = (t: number, group: WireGroup) => cpuOn(t) || (group === "and" ? andOn(t) : notOn(t));

// ---- Readout ----
const clampN = (v: number, max: number) => Math.max(0, Math.min(max, Math.floor(v)));

function typed(t: number): { code: string; n: number; busy: boolean } {
  if (t < C_ERASE[0]) {
    const n = clampN((t - C_TYPE) * CPS, C_CODE.length);
    return { code: C_CODE, n, busy: t >= C_TYPE && n < C_CODE.length };
  }
  if (t < C_ERASE[1]) return { code: C_CODE, n: clampN(C_CODE.length * (1 - (t - C_ERASE[0]) / (C_ERASE[1] - C_ERASE[0])) + 1, C_CODE.length), busy: true };
  if (t < V_ERASE[0]) {
    const n1 = clampN((t - V_TYPE[0]) * CPS, V_LINE1);
    const n2 = clampN((t - V_TYPE[1]) * CPS, V_CODE.length - V_LINE1);
    const busy = (t >= V_TYPE[0] && n1 < V_LINE1) || (t >= V_TYPE[1] && n2 < V_CODE.length - V_LINE1);
    return { code: V_CODE, n: t < V_TYPE[1] ? n1 : V_LINE1 + n2, busy };
  }
  if (t < V_ERASE[1]) return { code: V_CODE, n: clampN(V_CODE.length * (1 - (t - V_ERASE[0]) / (V_ERASE[1] - V_ERASE[0])) + 1, V_CODE.length), busy: true };
  return { code: C_CODE, n: 0, busy: false };
}

export type Readout = { header: string; lines: [string, string]; cursorLine: number; cursorOn: boolean; pointer: number; rust: [boolean, boolean] };

export function readoutAt(t: number): Readout {
  const { code, n, busy } = typed(t);
  const text = code.slice(0, n);
  const parts = text.split("\n");
  const verilog = t >= C_ERASE[1] && t < V_ERASE[1];
  const pointer = t >= EXEC[0] && t < EXEC[1] ? 0 : t >= EXEC[1] && t < EXEC_END ? 1 : -1;
  return {
    header: verilog ? "verilog" : "c",
    lines: [parts[0] ?? "", parts[1] ?? ""],
    cursorLine: parts.length - 1,
    // Solid while typing or erasing, else a 2 Hz blink (27 s holds a whole number of blinks).
    cursorOn: busy || (t * 2) % 1 < 0.5,
    pointer,
    rust: verilog ? [t >= landAt.and, t >= landAt.not] : [pointer === 0, pointer === 1],
  };
}
