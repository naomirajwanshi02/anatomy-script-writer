// Don't-care traffic light model. Time unit: seconds of loop time after the 3 s entrance (video time = 3 s + loop
// time); LOOP = 30 s, ending in the start state (traffic light standing, green lit, red and yellow off).
// A traffic light has three lamps R Y G = three bits. Only five patterns ever happen (real codes); the other three
// (two or more lamps where the light never shows them) are don't-cares. "go" = 1 only for green alone (001).
// Without don't-cares go = G·R'·Y' (2 NOT + one 3-input AND = 3 gates). Treating the don't-cares as 1 lets the loop
// grow to the 2x2 block 001 011 101 111, which drops R and Y: go = G (0 gates). All of that is computed below.
// Timeline: lamp moves of the real light, the ghost, the folds, the tile count, the grid, tick, X marks, loop,
// label fade and the tile steps; lamps, tiles, boxes, wire, go lamp and readout are computed from it.
import { ENTRY, loopTime } from "../../iso/entrance";

export const LOOP = 30;
export const BRAND = "ROLLIN";

// ---------- Codes and the K-map ----------

export const VARS = ["R", "Y", "G"] as const;
export type Lamp = "red" | "yellow" | "green";
export const LAMPS: Lamp[] = ["red", "yellow", "green"];
export const code = (r: number, y: number, g: number) => (r << 2) | (y << 1) | g;
export const bitsOf = (c: number) => [(c >> 2) & 1, (c >> 1) & 1, c & 1];
export const codeStr = (c: number) => bitsOf(c).join("");

// Patterns a real traffic light shows: all off, red, red + yellow, yellow, green.
export const REAL = [0b000, 0b100, 0b110, 0b010, 0b001];
export const DONT_CARE = [0, 1, 2, 3, 4, 5, 6, 7].filter((c) => !REAL.includes(c));
// go: only green alone.
const GO = (c: number) => c === 0b001;
export const ONES = REAL.filter(GO);
if (DONT_CARE.join() !== "3,5,7") throw new Error(`don't-cares ${DONT_CARE.map(codeStr)}`);

// Map: rows R = 0, 1; columns YG in Gray order.
export const ROWS = ["0", "1"];
export const COLS = ["00", "01", "11", "10"];
export const cellCode = (row: number, col: number) => (row << 2) | parseInt(COLS[col], 2);
export const cellOf = (c: number) => ({ row: c >> 2, col: COLS.indexOf(codeStr(c).slice(1)) });

// Biggest group round the 1: rectangles of 1, 2, 4 or 8 cells (power-of-two sides, columns wrap), only 1s and
// don't-cares inside; the first largest one wins.
type Cells = [number, number][];
const rects: Cells[] = [];
for (const h of [1, 2]) for (const w of [1, 2, 4]) for (let r0 = 0; r0 + h <= 2; r0++) for (let c0 = 0; c0 < 4; c0++) {
  if (w === 4 && c0 > 0) continue;
  const cells: Cells = [];
  for (let r = r0; r < r0 + h; r++) for (let c = c0; c < c0 + w; c++) cells.push([r, c % 4]);
  rects.push(cells);
}
const allowed = (c: number) => ONES.includes(c) || DONT_CARE.includes(c);
const groups = rects.filter((cells) => cells.some(([r, c]) => ONES.includes(cellCode(r, c))) && cells.every(([r, c]) => allowed(cellCode(r, c))));
const best = groups.reduce((a, b) => (b.length > a.length ? b : a));
export const LOOP_CELLS = best;
export const LOOP_CODES = best.map(([r, c]) => cellCode(r, c));
// Term over R Y G: a bit is kept if it is the same in every cell, dropped ("-") otherwise.
const TERM = VARS.map((_, i) => {
  const vals = new Set(LOOP_CODES.map((c) => bitsOf(c)[i]));
  return vals.size === 1 ? `${[...vals][0]}` : "-";
}).join("");
export const DROPPED = VARS.filter((_, i) => TERM[i] === "-");
export const KEPT = VARS.filter((_, i) => TERM[i] !== "-");
if (TERM !== "--1" || DROPPED.join() !== "R,Y") throw new Error(`loop term ${TERM}`);
const LOOP_BOX = {
  r0: Math.min(...best.map(([r]) => r)),
  r1: Math.max(...best.map(([r]) => r)),
  c0: Math.min(...best.map(([, c]) => c)),
  c1: Math.max(...best.map(([, c]) => c)),
};
if ((LOOP_BOX.r1 - LOOP_BOX.r0 + 1) * (LOOP_BOX.c1 - LOOP_BOX.c0 + 1) !== best.length) throw new Error("loop does not wrap in this figure");
export const LOOPBOX = LOOP_BOX;

// Gate count of a single product term: one NOT per complemented literal, one AND if more than one literal.
const gatesOf = (term: string) => {
  const lits = [...term].filter((b) => b !== "-");
  return lits.filter((b) => b === "0").length + (lits.length > 1 ? 1 : 0);
};
const MINTERM = codeStr(ONES[0]); // "001" = G·R'·Y'
export const GATES = { before: gatesOf(MINTERM), after: gatesOf(TERM) };
if (GATES.before !== 3 || GATES.after !== 0) throw new Error(`gates ${GATES.before} -> ${GATES.after}`);

// Check: G alone equals G·R'·Y' on every real code (they may differ only on don't-cares).
const covers = (term: string, c: number) => [...codeStr(c)].every((b, i) => term[i] === "-" || term[i] === b);
for (const c of REAL) if (covers(TERM, c) !== covers(MINTERM, c) || covers(TERM, c) !== GO(c)) throw new Error(`G differs from G·R'·Y' at ${codeStr(c)}`);
export const goOf = (c: number) => covers(TERM, c);

// ---------- Timeline ----------

// Real light: the lit lamp from each time on (one lamp at a time).
const LIGHT: [number, number][] = [
  [0, 0b001],
  [2.5, 0b100],
  [3.3, 0b010],
  [4.1, 0b001],
];
// Tiles: the count through all 8 patterns (9.5-11), then green; the steps off, red, yellow, green (23-25.4).
const COUNT_AT = 9.5;
const COUNT_STEP = 1.5 / 8;
const STEPS: [number, number][] = [
  [23.0, 0b000],
  [23.6, 0b100],
  [24.2, 0b010],
  [24.8, 0b001],
];
const X_AT = DONT_CARE.map((_, i) => 15.0 + 0.6 * i);
export const FLICKER = { code: 0b101, from: 14.3, to: 14.9 };

type Span = [from: number, to: number, value: number];
const CHANNELS: Record<string, { from: number; spans: Span[] }> = {
  ghost: { from: 0, spans: [[5.5, 6.1, 1], [6.6, 7.2, 0]] },
  boost: { from: 0, spans: [[7.3, 7.7, 1], [8.0, 8.4, 0]] },
  // Fold: the light sinks into the board, its lamps fly down into the tiles; and back.
  sink: { from: 0, spans: [[8.2, 9.2, 1], [27.0, 28.0, 0]] },
  fly: { from: 0, spans: [[8.0, 9.4, 1], [26.8, 27.9, 0]] },
  tiles: { from: 0, spans: [[9.1, 9.5, 1], [26.6, 27.0, 0]] },
  grid: { from: 0, spans: [[11.0, 12.0, 1], [26.5, 27.0, 0]] },
  tick: { from: 0, spans: [[12.5, 12.9, 1], [26.5, 27.0, 0]] },
  go: { from: 0, spans: [[12.3, 12.8, 1], [26.5, 27.0, 0]] },
  readout: { from: 0, spans: [[13.0, 13.4, 1], [26.4, 26.9, 0]] },
  loop: { from: 0, spans: [[16.95, 17.0, 1], [26.5, 27.0, 0]] },
  drop: { from: 0, spans: [[18.0, 18.6, 1], [26.6, 27.0, 0]] },
  wire: { from: 0, spans: [[18.8, 19.3, 1], [26.5, 26.9, 0]] },
  xPulse: { from: 0, spans: [[25.5, 25.8, 1], [25.8, 26.2, 0]] },
};
// Hand-drawn loop: the draw progress runs 17-18 s linearly (a pen stroke), it fades with the grid.
const LOOP_DRAW: [number, number] = [17.0, 18.0];

const ease = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
export const channel = (name: string, lt: number) => {
  const { from, spans } = CHANNELS[name];
  let v = from;
  for (const [a, b, value] of spans) {
    if (lt >= b) v = value;
    else if (lt > a) return v + (value - v) * ease((lt - a) / (b - a));
  }
  return v;
};
const step = (moves: [number, number][], lt: number) => {
  let v = moves[0][1];
  for (const [t, value] of moves) if (lt >= t) v = value;
  return v;
};

export const lightAt = (lt: number) => step(LIGHT, lt);
export function tilesAt(lt: number) {
  if (lt >= COUNT_AT && lt < COUNT_AT + COUNT_STEP * 8) return Math.floor((lt - COUNT_AT) / COUNT_STEP);
  if (lt >= STEPS[0][0] && lt < 26.5) return step(STEPS, lt);
  return 0b001;
}

// Reduced motion: hold the key state (loop drawn, R and Y dropped, G wired to the go lamp).
export const KEY_TIME = ENTRY.loopFrom + 20;

export function stateAt(t: number) {
  const lt = loopTime(t, LOOP);
  const tiles = tilesAt(lt);
  const stepping = lt >= STEPS[0][0] && lt < 26.5;
  const oneWire = lt >= 18.8 && lt < 26.5; // R and Y drop at 18 s, the one wire at 18.8 s
  return {
    lt,
    light: bitsOf(lightAt(lt)),
    bits: bitsOf(tiles),
    goLit: goOf(tiles),
    hot: stepping ? tiles : -1, // grid box matching the tiles while they step
    gates: oneWire ? GATES.after : GATES.before,
    flicker: lt >= FLICKER.from && lt < FLICKER.to ? (Math.floor((lt - FLICKER.from) * 13) % 2 === 0 ? 0.15 : 1) : 1,
    xs: X_AT.map((a) => (lt < a ? 0 : lt < 26.5 ? ease((lt - a) / 0.3) : 1 - ease((lt - 26.5) / 0.5))),
    loopDraw: lt < LOOP_DRAW[0] ? 0 : Math.min(1, (lt - LOOP_DRAW[0]) / (LOOP_DRAW[1] - LOOP_DRAW[0])),
    ...Object.fromEntries(Object.keys(CHANNELS).map((k) => [k, channel(k, lt)])) as Record<keyof typeof CHANNELS, number>,
  };
}
