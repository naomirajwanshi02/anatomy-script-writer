// RTL and logic synthesis: an always block with two registers is typed; synthesis builds it as flip-flop r1,
// an AND gate and flip-flop q. The value hops one register per rising clk edge: A -> r1 -> (AND) -> q.
// Time unit: one gate delay = 1 s (AND delay and clk-to-Q delay); loop 28 s, ends in the starting state
// (A = 0, B = 1, clk = 0, q off, no parts, empty code).
// Timeline = lever moves, clk edges, part arrivals/lifts and typing spans only; r1, AND, q, wires, readout text,
// token colours, cursor and part offsets are computed here.
import { ENTRY } from "../../iso/entrance";

export const LOOP = 28;
// Reduced motion holds the key state: r1 and the AND already 1, register q still waiting for its edge.
export const KEY_TIME = ENTRY.loopFrom + 13;

// ---- Timeline (loop seconds) ----
const A_HIGH: [number, number][] = [[8, 16]];
export const B = 1; // B lever stays at 1
const CLK_PERIOD = 4; // high 2 s, low 2 s; rising edges at 2, 6, 10, 14, 18, 22, 26 s
const CLK_HIGH = 2;
const CLK_RISE = 2;
export type Group = "r1" | "q"; // code groups: the r1 line (with always/begin/end) and the q line
const RUST: Record<Group, number> = { r1: 5, q: 6 }; // synthesis: tokens turn rust, then their parts drop in
const LAND = { r1: 5.5, and: 6.5, q: 7.2 }; // landings
const LIFT = 24; // all parts lift off
const TYPE_FROM = 0.5;
const TYPE_TO = 4.5;
const ERASE: [number, number] = [24.5, 26];

const inSpans = (t: number, s: [number, number][]) => s.some(([a, b]) => t >= a && t < b);
export const aAt = (t: number) => (inSpans(t, A_HIGH) ? 1 : 0);
const clkPhase = (t: number) => (((t - CLK_RISE) % CLK_PERIOD) + CLK_PERIOD) % CLK_PERIOD;
export const clkAt = (t: number) => (clkPhase(t) < CLK_HIGH ? 1 : 0);

// clk lever position from time (1 = logic 0, -1 = logic 1), eased over 0.25 s after each edge; periodic, so the
// fall at 28 s = 0 s matches the start frame.
const SWING = 0.25;
const ease = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
export const clkLever = (t: number) => {
  const ph = clkPhase(t);
  return ph < CLK_HIGH ? 1 - 2 * ease(ph / SWING) : -1 + 2 * ease((ph - CLK_HIGH) / SWING);
};

// ---- Drops and lifts (same gravity as the shared entrance: 1000 stage units in 0.55 s) ----
const TRAVEL = 1000;
const FALL = 0.55;
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
export const landAt = LAND;
export type Part = keyof typeof LAND;
export const PARTS = Object.keys(LAND) as Part[];
export const partsAt = (t: number) =>
  Object.fromEntries(PARTS.map((k) => [k, t < LIFT ? dropOffset(t, LAND[k] - FALL) : liftOffset(t, LIFT)])) as Record<Part, number | null>;
const onBoard = (t: number, k: Part) => t >= LAND[k] && t < LIFT;

const DT = 0.01;
const DELAY = 1; // s, AND transport delay and clk-to-Q of each flip-flop

export type Net = "a" | "b" | "clk" | "r1" | "and" | "q";
type Trace = Record<Net, number[]>;

// Edge-triggered register (while on the board): at each rising clk edge it samples D; its Q takes that value
// one delay later. Between edges it ignores D.
function register(n: number, lag: number, clk: number[], d: (i: number) => number, part: Part) {
  const q: number[] = [];
  const pending: { at: number; v: number }[] = [];
  let qv = 0;
  for (let i = 0; i < n; i++) {
    const rising = clk[i] === 1 && clk[(i - 1 + n) % n] === 0;
    if (rising && onBoard(i * DT, part)) pending.push({ at: i + lag, v: d(i) });
    while (pending.length && pending[0].at <= i) qv = pending.shift()!.v;
    q.push(qv);
  }
  return q;
}

// r1 samples A; the AND (while on the board) outputs r1·B one delay earlier (transport delay), else 0; q samples
// the AND output. Starts from the loop's start state (r1 = q = 0).
function simulate(): Trace {
  const n = Math.round(LOOP / DT);
  const lag = Math.round(DELAY / DT);
  const a = Array.from({ length: n }, (_, i) => aAt(i * DT));
  const clk = Array.from({ length: n }, (_, i) => clkAt(i * DT));
  const r1 = register(n, lag, clk, (i) => a[i], "r1");
  const and = r1.map((_, i) => (onBoard(i * DT, "and") ? r1[(i - lag + n) % n] & B : 0));
  const q = register(n, lag, clk, (i) => and[i], "q");
  return { a, b: a.map(() => B), clk, r1, and, q };
}

const SIM = simulate();
const index = (t: number) => Math.min(SIM.a.length - 1, Math.max(0, Math.floor(t / DT)));

export type State = Record<Net, number>;
export const stateAt = (t: number): State => {
  const i = index(t);
  return { a: SIM.a[i], b: SIM.b[i], clk: SIM.clk[i], r1: SIM.r1[i], and: SIM.and[i], q: SIM.q[i] };
};

// Wires appear when the part they belong to lands.
export const wireShown = (t: number, part: Part) => onBoard(t, part);

// ---- Readout ----
// Code segments per line; each segment turns rust when its group is built (null = never).
export const CODE: { text: string; group: Group | null }[][] = [
  [{ text: "always @(posedge clk) begin", group: "r1" }],
  [
    { text: "  ", group: null },
    { text: "r1 <= a;", group: "r1" },
  ],
  [
    { text: "  ", group: null },
    { text: "q  <= r1 & b;", group: "q" },
  ],
  [{ text: "end", group: "r1" }],
];
const LINES = CODE.map((line) => line.map((s) => s.text).join(""));
const FULL = LINES.join("\n");
const CPS = FULL.length / (TYPE_TO - TYPE_FROM); // about 14.5 chars per second

const clampN = (v: number, max: number) => Math.max(0, Math.min(max, Math.floor(v)));
function typed(t: number): { n: number; busy: boolean } {
  if (t < ERASE[0]) {
    const n = clampN((t - TYPE_FROM) * CPS, FULL.length);
    return { n, busy: t >= TYPE_FROM && n < FULL.length };
  }
  if (t < ERASE[1]) return { n: clampN(FULL.length * (1 - (t - ERASE[0]) / (ERASE[1] - ERASE[0])) + 1, FULL.length), busy: true };
  return { n: 0, busy: false };
}

export type Readout = { segs: { text: string; rust: boolean }[][]; cursorLine: number; cursorOn: boolean };

export function readoutAt(t: number): Readout {
  const { n, busy } = typed(t);
  let left = n;
  let cursorLine = 0;
  const segs = CODE.map((line, li) => {
    if (li > 0) {
      left -= 1; // the newline
      if (left >= 0) cursorLine = li;
    }
    return line.map((s) => {
      const k = Math.max(0, Math.min(s.text.length, left));
      left -= s.text.length;
      return { text: s.text.slice(0, k), rust: s.group !== null && t >= RUST[s.group] && t < ERASE[0] };
    });
  });
  // Solid while typing or erasing, else a 2 Hz blink (28 s holds a whole number of blinks).
  return { segs, cursorLine, cursorOn: busy || (t * 2) % 1 < 0.5 };
}
