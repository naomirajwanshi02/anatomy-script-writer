// K-map egg carton model. Time unit: one gate delay = 0.5 s (the lamp follows the levers 0.5 s later, transport
// delay). Video time = 3 s entrance + loop time; LOOP = 52 s, ending in the start state (carton with its lid open,
// 4 eggs, no band, no labels, all readout rows dimmed).
// Y = sum of minterms {2, 3, 6, 7} over A, B, C. The K-map grouping is computed below (adjacent terms that differ in
// one bit merge), with the gate cost of each stage, and every stage is checked against the original function.
// Order: three ways to take the eggs with a rubber band (one at a time, two side by side, all four), a diagonal try
// that slips off, the band back round all four; fold (the carton lifts away and leaves a flat K-map grid with a 1 in
// each egg's cell; labels, levers, the gates block, the lamp); one flat band
// per egg (5 gates), one per side-by-side pair (C drops, 3 gates), the columns pulse in Gray order, one band round all
// four (A and C drop, the gates block sinks, B's wire runs straight to the lamp); the levers show the lamp ignores A
// and C; the three stages replay; fold back; the band stretches over the empty cup beside the block (teaser), then
// springs off.
// Timeline: band on/off times, lifts, the folds, label changes and lever moves; band shapes, stretch, the gate count,
// lamp, wires and readout are computed from it.
import { ENTRY, loopTime } from "../../iso/entrance";

export const LOOP = 52;
export const DELAY = 0.5;
export const BRAND = "ROLLIN";

// ---------- K-map ----------

export const VARS = ["A", "B", "C"];
export const ROWS = ["0", "1"]; // A
export const COLS = ["00", "01", "11", "10"]; // BC in Gray order
export const ONES = [2, 3, 6, 7];
const bits = (m: number) => [(m >> 2) & 1, (m >> 1) & 1, m & 1].join("");

// Cell (row, col) -> minterm; minterm -> cell.
export const minterm = (row: number, col: number) => row * 4 + parseInt(COLS[col], 2);
export const hasEgg = (row: number, col: number) => ONES.includes(minterm(row, col));
const cellOf = (m: number) => ({ row: m >> 2, col: COLS.indexOf(bits(m).slice(1)) });

// A term is a pattern over A B C with "-" for a dropped variable.
type Term = string;
const covers = (t: Term, m: number) => [...bits(m)].every((b, i) => t[i] === "-" || t[i] === b);
const merge = (a: Term, b: Term): Term | null => {
  let diff = -1;
  for (let i = 0; i < a.length; i++) {
    if (a[i] === b[i]) continue;
    if (a[i] === "-" || b[i] === "-" || diff >= 0) return null;
    diff = i;
  }
  return diff < 0 ? null : a.slice(0, diff) + "-" + a.slice(diff + 1);
};
// One merge round: pair terms off, merging on the lowest-order variable first (C, then B, then A).
function mergeRound(terms: Term[]): Term[] {
  const left = [...terms];
  const out: Term[] = [];
  while (left.length) {
    const a = left.shift()!;
    let best = -1;
    let bestBit = -1;
    left.forEach((b, j) => {
      const m = merge(a, b);
      if (m && m.lastIndexOf("-") > bestBit) {
        best = j;
        bestBit = m.lastIndexOf("-");
      }
    });
    if (best < 0) out.push(a);
    else out.push(merge(a, left.splice(best, 1)[0])!);
  }
  return out;
}
const STAGES: Term[][] = [ONES.map(bits)];
while (STAGES[STAGES.length - 1].length > 1) {
  const next = mergeRound(STAGES[STAGES.length - 1]);
  if (next.length === STAGES[STAGES.length - 1].length) break;
  STAGES.push(next);
}

const literal = (t: Term) => [...t].map((b, i) => (b === "-" ? "" : b === "1" ? VARS[i] : `${VARS[i]}'`)).join("");
const literals = (t: Term) => [...t].filter((b) => b !== "-").length;
// Gate cost: one AND per multi-literal term plus one OR if there is more than one term.
const cost = (terms: Term[]) => {
  const ands = terms.filter((t) => literals(t) > 1).length;
  if (terms.length === 1 && ands === 0) return `Y = ${literal(terms[0])}`;
  return `${ands} AND + ${terms.length > 1 ? 1 : 0} OR`;
};
// Gate count per stage (AND + OR gates), for the without-it chip: it shrinks from the first stage's count to the last.
const gates = (terms: Term[]) => terms.filter((t) => literals(t) > 1).length + (terms.length > 1 ? 1 : 0);
// Readout wording per stage, analogy first (how the eggs are picked, how many picks), circuit after the fold (terms,
// gate cost). The eggs per pick is the group size of the stage's terms (2 to the number of dropped variables).
const PICK_WORDS: Record<number, string> = { 1: "one egg at a time", 2: "two at a time", 4: "all four at once" };
const groupSize = (t: Term) => 2 ** [...t].filter((b) => b === "-").length;
export const HEADER = { egg: ["how you pick", "picks"], circuit: ["terms", "gates"] };
export const TABLE = STAGES.map((terms) => {
  const size = groupSize(terms[0]);
  if (terms.some((t) => groupSize(t) !== size) || !PICK_WORDS[size]) throw new Error(`no pick wording for stage ${terms.join(" ")}`);
  return {
    egg: [PICK_WORDS[size], `${terms.length}`],
    circuit: [`${terms.length} term${terms.length > 1 ? "s" : ""}`, cost(terms)],
    expr: terms.map(literal).join(" + "),
  };
});
export const FINAL = STAGES[STAGES.length - 1];
export const GATES = { before: gates(STAGES[0]), after: gates(STAGES[STAGES.length - 1]) };
if (GATES.before !== 5 || GATES.after !== 0) throw new Error(`gate counts ${GATES.before} -> ${GATES.after}`);

// Check: every stage's sum of products equals the original function on all 8 inputs.
const f = (m: number) => ONES.includes(m);
STAGES.forEach((terms, k) => {
  for (let m = 0; m < 8; m++) if (terms.some((t) => covers(t, m)) !== f(m)) throw new Error(`K-map stage ${k} differs at input ${bits(m)}`);
});
if (STAGES.length !== 3 || FINAL.join() !== "-1-") throw new Error(`K-map stages: ${STAGES.map((s) => s.join(" ")).join(" | ")}`);

// Each stage's groups as cell boxes { r0, r1, c0, c1 } (contiguous here).
export type Box = { r0: number; r1: number; c0: number; c1: number };
const boxOf = (t: Term): Box => {
  const cells = ONES.filter((m) => covers(t, m)).map(cellOf);
  const box = {
    r0: Math.min(...cells.map((c) => c.row)),
    r1: Math.max(...cells.map((c) => c.row)),
    c0: Math.min(...cells.map((c) => c.col)),
    c1: Math.max(...cells.map((c) => c.col)),
  };
  if ((box.r1 - box.r0 + 1) * (box.c1 - box.c0 + 1) !== cells.length) throw new Error(`term ${t} is not one block`);
  return box;
};
const STAGE_BOXES = STAGES.map((terms) => terms.map(boxOf));
const eggsOf = (b: Box) => ONES.filter((m) => {
  const c = cellOf(m);
  return c.row >= b.r0 && c.row <= b.r1 && c.col >= b.c0 && c.col <= b.c1;
});
// Gate count per stage, for the gates block: 5, 3, then 0 (a plain wire).
export const STAGE_GATES = STAGES.map(gates);

// ---------- Rubber bands ----------
// A band is a shape round some cups: a cell box, or (for the diagonal try and the teaser) a set of cells whose hull it
// wraps. Up to 4 bands at once (one per egg in the circuit's first stage).
export type BandShape = { cells: [number, number][] };
const boxCells = (b: Box): [number, number][] => {
  const out: [number, number][] = [];
  for (let r = b.r0; r <= b.r1; r++) for (let c = b.c0; c <= b.c1; c++) out.push([r, c]);
  return out;
};
const EGG_CELLS = ONES.map((m) => cellOf(m)).map((c) => [c.row, c.col] as [number, number]);
const QUAD: [number, number][] = boxCells(STAGE_BOXES[2][0]);
const DIAGONAL: [number, number][] = [EGG_CELLS[1], EGG_CELLS[2]].sort((a, b) => a[0] - b[0]); // top-left and bottom-right of the block
const EMPTY_CUP: [number, number] = [0, QUAD.reduce((m, [, c]) => Math.min(m, c), 9) - 1]; // the cup left of the block, top row
const TEASER: [number, number][] = [...QUAD, EMPTY_CUP];
if (hasEgg(...EMPTY_CUP)) throw new Error("teaser cup is not empty");
if (Math.abs(DIAGONAL[0][1] - DIAGONAL[1][1]) !== 1 || DIAGONAL[0][0] === DIAGONAL[1][0]) throw new Error("diagonal pair");

type BandEvent = { shape: [number, number][]; on: number; off: number; lift?: [number, number]; slip?: number; stretchTo?: [number, number]; flat?: boolean };
const pick = (shape: [number, number][], on: number, len: number): BandEvent => ({ shape, on, off: on + len, lift: [on + 0.3, on + len - 0.25] });
// Analogy: one band picks one egg at a time (4), each side-by-side pair (2), all four (1); the diagonal try; the
// band round all four again until the fold.
const SINGLE_ORDER = [EGG_CELLS[1], EGG_CELLS[0], EGG_CELLS[3], EGG_CELLS[2]]; // top-left, top-right, bottom-left, bottom-right
const ANALOGY: BandEvent[] = [
  ...SINGLE_ORDER.map((c, k) => pick([c], 4.0 + 0.9 * k, 0.8)),
  ...STAGE_BOXES[1].map((b, k) => pick(boxCells(b), 8.0 + 1.2 * k, 1.05)),
  { shape: QUAD, on: 10.6, off: 12.6, lift: [11.0, 11.9] },
  { shape: DIAGONAL, on: 13.2, off: 14.4, slip: 13.9 },
  { shape: QUAD, on: 15.2, off: 17.2 },
];
// Circuit: one band per egg, one per pair, one round all four; the quick replay; then the band round all four again
// on the carton after the fold back, stretching over the empty cup (teaser) and springing off.
const STAGE_AT = [22.0, 25.5, 31.5];
const STAGE_OFF = [25.0, 31.0, 39.0];
const REPLAY = [39.2, 40.4, 41.6];
const CIRCUIT: BandEvent[] = [
  ...STAGE_BOXES[0].map((b, k) => ({ shape: boxCells(b), on: STAGE_AT[0] + 0.3 * k, off: STAGE_OFF[0] })),
  ...STAGE_BOXES[1].map((b, k) => ({ shape: boxCells(b), on: STAGE_AT[1] + 0.3 * k, off: STAGE_OFF[1] })),
  { shape: QUAD, on: STAGE_AT[2], off: STAGE_OFF[2] },
  ...STAGE_BOXES[0].map((b) => ({ shape: boxCells(b), on: REPLAY[0], off: REPLAY[1] - 0.05 })),
  ...STAGE_BOXES[1].map((b) => ({ shape: boxCells(b), on: REPLAY[1], off: REPLAY[2] - 0.05 })),
  { shape: QUAD, on: REPLAY[2], off: 42.6 },
].map((b) => ({ ...b, flat: true })); // on the flat map, not round eggs
const TEASE = { on: 44.6, stretch: [45.4, 46.4] as [number, number], settle: 47.8, egg: [47.2, 47.6] as [number, number], off: 50.4 };
const ENDING: BandEvent[] = [{ shape: QUAD, on: TEASE.on, off: TEASE.off, stretchTo: TEASE.stretch }];
const BANDS = [...ANALOGY, ...CIRCUIT, ...ENDING];

// Band dynamics: it drops onto the eggs from just above, slightly open, and settles round their waists with a small
// damped wobble (about 0.4 s); it comes off by lifting up and opening a little as it fades (never shrinking through the
// eggs); the diagonal band rides up over the other eggs, over-stretches, slips off sideways with a twang.
const wobble = (u: number) => 1 + 0.2 * Math.exp(-u * 9) * Math.cos(u * 20);
export type BandState = { shape: [number, number][]; teaser: number; show: number; scale: number; rise: number; slip: number; twang: number; lift: number; flat: boolean };
function bandsAt(lt: number): BandState[] {
  const out: BandState[] = [];
  for (const b of BANDS) {
    if (lt < b.on || lt >= b.off + 0.25) continue;
    const u = lt - b.on;
    const off = lt - b.off;
    let scale = wobble(u);
    let show = Math.min(1, u * 8);
    // Drop on: from just above the eggs down to their waists; lift off: up and away.
    let rise = Math.exp(-u * 12);
    if (off >= 0) {
      const k = Math.min(1, off / 0.25);
      scale = 1 + 0.12 * k;
      rise = k;
      show = Math.max(0, 1 - k);
    }
    let slip = 0;
    let twang = 0;
    if (b.slip !== undefined) {
      rise = Math.max(rise, Math.min(1, Math.max(0, (lt - b.on - 0.25) / 0.45)));
      if (lt >= b.slip) {
        const v = lt - b.slip;
        slip = Math.min(1, v / 0.35);
        twang = Math.exp(-v * 6) * Math.sin(v * 70);
        show = Math.max(0, 1 - v / 0.45);
      }
    }
    const lift = b.lift ? hopAt(lt, b.lift[0], { rise: 0.25, hold: Math.max(0, b.lift[1] - b.lift[0] - 0.5), drop: 0.25 }).h : 0;
    let teaser = 0;
    if (b.stretchTo) {
      teaser = Math.min(1, Math.max(0, (lt - b.stretchTo[0]) / (b.stretchTo[1] - b.stretchTo[0])));
      teaser = teaser * teaser * (3 - 2 * teaser);
      // Hovering at full stretch: a slight tremble until it settles over the pretend egg.
      if (lt >= b.stretchTo[1] && lt < TEASE.settle) twang = 0.25 * Math.sin((lt - b.stretchTo[1]) * 40);
      if (lt >= TEASE.settle) scale *= wobble(lt - TEASE.settle) * 0.97 + 0.03;
    }
    out.push({ shape: b.shape, teaser, show, scale, rise, slip, twang, lift, flat: !!b.flat });
  }
  return out;
}
export const TEASER_CELLS = TEASER;
export const DIAGONAL_CELLS = DIAGONAL;
export const EMPTY = EMPTY_CUP;

// ---------- Timeline ----------

type Span = [from: number, to: number, value: number];
const CHANNELS: Record<string, { from: number; spans: Span[] }> = {
  // Fold: the carton and its lid lift away / come back; the flat map grid shows where the carton was; the circuit
  // (levers, gates block, lamp) rises in / sinks.
  lid: { from: 0, spans: [[17.3, 18.3, 1], [42.8, 43.8, 0]] },
  map: { from: 0, spans: [[17.9, 18.6, 1], [42.8, 43.4, 0]] },
  circuit: { from: 0, spans: [[17.6, 18.6, 1], [42.6, 43.4, 0]] },
  // Map labels: rows (A) then columns (BC) appear; at the pairs BC becomes B (C dropped); at all four A fades.
  rowLabels: { from: 0, spans: [[19.0, 19.5, 1], [42.6, 43.0, 0]] },
  colLabels: { from: 0, spans: [[20.0, 20.5, 1], [42.6, 43.0, 0]] },
  dropC: { from: 0, spans: [[26.4, 26.9, 1], [42.6, 42.65, 0]] },
  dropA: { from: 0, spans: [[32.2, 32.7, 1], [42.6, 42.65, 0]] },
  // The gates block sinks into the board at all four (a plain wire is left); the A and C wires fade.
  noGates: { from: 0, spans: [[32.4, 33.2, 1], [42.6, 42.65, 0]] },
  // Readout wording: egg (0) cross-fades to circuit (1) at the fold and back at the fold back.
  words: { from: 0, spans: [[17.5, 18.5, 1], [42.6, 43.6, 0]] },
  // Pretend egg in the empty cup (teaser).
  pretend: { from: 0, spans: [[TEASE.egg[0], TEASE.egg[1], 1], [50.2, 50.4, 0]] },
};
// Gray pulse: the column labels pulse in order 00, 01, 11, 10 (one per 0.6 s), then back to the first.
const GRAY_AT = 28.0;
const GRAY_STEP = 0.6;
// Lever moves: [loop time, value]; lever up = 1. A and C flip while the lamp holds; then B drops and comes back.
const LEVERS: Record<"a" | "b" | "c", [number, number][]> = {
  a: [[0, 0], [34.0, 1], [36.6, 0]],
  b: [[0, 1], [37.4, 0], [38.6, 1]],
  c: [[0, 0], [35.0, 1], [36.6, 0]],
};
// Readout: the active row by loop time (-1 = none); rows below the active one count as visited.
const ROW_AT: [number, number][] = [
  [0, -1],
  [4.0, 0],
  [8.0, 1],
  [10.6, 2],
  [17.3, -1],
  [22.0, 0],
  [25.5, 1],
  [31.5, 2],
  [REPLAY[0], 0],
  [REPLAY[1], 1],
  [REPLAY[2], 2],
  [42.6, -1],
];

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
const wrap = (lt: number) => ((lt % LOOP) + LOOP) % LOOP;

export function inputsAt(lt: number) {
  const x = wrap(lt);
  return { a: step(LEVERS.a, x) === 1, b: step(LEVERS.b, x) === 1, c: step(LEVERS.c, x) === 1 };
}
// Lamp: the original function of the levers one delay earlier.
export function lampAt(lt: number) {
  const p = inputsAt(lt - DELAY);
  return f((+p.a << 2) | (+p.b << 1) | +p.c);
}
// The gate count shown on the gates block: the stage the bands show.
const gatesAt = (lt: number) => (lt >= STAGE_AT[2] ? STAGE_GATES[2] : lt >= STAGE_AT[1] ? STAGE_GATES[1] : STAGE_GATES[0]);

// Egg hops: each egg a band lifts rises with it (the analogy picks).
type Hop = { rise: number; hold: number; drop: number };
const SQUASH = 0.08; // landing squash, s
function hopAt(lt: number, at: number, { rise, hold, drop }: Hop) {
  const u = lt - at;
  if (u < 0) return { h: 0, sy: 1 };
  if (u < rise) return { h: ease(u / rise), sy: 1 };
  if (u < rise + hold) return { h: 1, sy: 1 };
  if (u < rise + hold + drop) return { h: 1 - ease((u - rise - hold) / drop), sy: 1 };
  const v = u - rise - hold - drop;
  if (v < SQUASH) return { h: 0, sy: 1 - 0.08 * Math.sin((Math.PI * v) / SQUASH) };
  return { h: 0, sy: 1 };
}
const LIFT_SHARE = 0.4; // eggs rise to 40 % of the full hop (a quarter egg height)
export function eggLift(m: number, lt: number) {
  const c = cellOf(m);
  let out = { h: 0, sy: 1 };
  for (const b of BANDS) {
    if (!b.lift || !b.shape.some(([r, k]) => r === c.row && k === c.col)) continue;
    const s = hopAt(lt, b.lift[0], { rise: 0.25, hold: Math.max(0, b.lift[1] - b.lift[0] - 0.5), drop: 0.25 });
    if (s.h * LIFT_SHARE > out.h || s.sy < out.sy) out = { h: s.h * LIFT_SHARE, sy: s.sy };
  }
  return out;
}

// Reduced motion: hold the key state (all four in one band, a plain wire from B to the lamp).
export const KEY_TIME = ENTRY.loopFrom + 33.5;

export function stateAt(t: number) {
  const lt = loopTime(t, LOOP);
  const inp = inputsAt(lt);
  const now = step(ROW_AT, lt);
  const grayK = lt >= GRAY_AT && lt < GRAY_AT + GRAY_STEP * 4 ? Math.floor((lt - GRAY_AT) / GRAY_STEP) : -1;
  return {
    lt,
    ...inp,
    lamp: lampAt(lt),
    bands: bandsAt(lt),
    map: channel("map", lt),
    lifts: ONES.map((m) => ({ m, ...eggLift(m, lt) })),
    lid: channel("lid", lt),
    circuit: channel("circuit", lt),
    rowLabels: channel("rowLabels", lt),
    colLabels: channel("colLabels", lt),
    dropC: channel("dropC", lt),
    dropA: channel("dropA", lt),
    noGates: channel("noGates", lt),
    gates: gatesAt(lt),
    words: channel("words", lt),
    pretend: channel("pretend", lt),
    grayK,
    now,
    seen: TABLE.map((_, i) => i < now),
  };
}
