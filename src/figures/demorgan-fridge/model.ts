// De Morgan fridge model. Time unit: one gate delay = 0.5 s (each output follows its inputs 0.5 s later, transport
// delay; the fridge light is the same NAND output). Video time = 3 s entrance + loop time; LOOP = 48.5 s, ending with
// both doors shut and the light off, as it starts.
// Loop order: fridge (0-14: left opens, right opens, both shut; then the same again for the two descriptions); fold
// (14-15.5); the circuit: one lever flicks to show 0 = open, row 1 builds for rule one (input bubbles, then the OR),
// row 2 for rule two (the AND, then its output bubble); the levers step through 11, 01, 10, 00 with both lamps
// matching; De Morgan's three changes pulse in turn (input bubbles, gate shapes, output bubble); row 1 turns into a
// NAND; the two NAND rows shrink into one tile of a grid of NAND tiles; fold back (46-48).
// Inputs: Ls = left door shut, Rs = right door shut (1 = shut). light = NOT(Ls AND Rs) = NOT Ls OR NOT Rs.
// Timeline: door swings, lever moves, the folds, the row builds, pulses, the morph and the grid; every switch, wire,
// lamp, LED, light pool and readout row is computed from it.
import { ENTRY, loopTime } from "../../iso/entrance";

export const LOOP = 48.5;
export const DELAY = 0.5;
export const BRAND = "ROLLIN";

type Span = [from: number, to: number, value: number];
const CHANNELS: Record<string, { from: number; spans: Span[] }> = {
  // Door open fraction (0 shut .. 1 swung open), analogy only: left, then right, then both shut; and again for the
  // two descriptions.
  left: { from: 0, spans: [[1.5, 2.1, 1], [3.6, 4.2, 0], [8, 8.6, 1], [9.6, 10.2, 0]] },
  right: { from: 0, spans: [[3.6, 4.2, 1], [5.6, 6.2, 0], [9.6, 10.2, 1], [11.6, 12.2, 0]] },
  // Fold: fridge lifts and fades / falls back; board stretches long / back to square; circuit rises in / sinks.
  fridge: { from: 0, spans: [[14, 15, 1], [47, 48, 0]] },
  board: { from: 0, spans: [[14.3, 15.2, 1], [46.5, 47.3, 0]] },
  circuit: { from: 0, spans: [[14.6, 15.5, 1], [46, 46.8, 0]] },
  table: { from: 0, spans: [[15, 15.6, 1], [46, 46.6, 0]] },
  // Row 1 (rule one): input bubbles, then the OR shape; its lamp and output wire come with the OR.
  orBubbles: { from: 0, spans: [[20, 20.5, 1]] },
  orBody: { from: 0, spans: [[21, 21.5, 1]] },
  // Row 2 (rule two): the AND shape, then its output bubble; its lamp and output wire come with the bubble.
  andBody: { from: 0, spans: [[23.5, 24, 1]] },
  andBubble: { from: 0, spans: [[24.8, 25.3, 1]] },
  // De Morgan's three changes pulse in turn, then row 2's NAND pulses.
  pulseIn: { from: 0, spans: [[34, 34.3, 1], [34.8, 35.1, 0]] },
  pulseGate: { from: 0, spans: [[35.2, 35.5, 1], [36, 36.3, 0]] },
  pulseOut: { from: 0, spans: [[36.4, 36.7, 1], [37.2, 37.5, 0]] },
  pulseNand: { from: 0, spans: [[38, 38.3, 1], [39, 39.3, 0]] },
  // Row 1 turns into a NAND (OR with input bubbles -> AND with an output bubble: the same gate).
  morph: { from: 0, spans: [[40, 41, 1]] },
  // Zoom out: the two NAND rows shrink into one tile of a grid of NAND tiles filling the board.
  grid: { from: 0, spans: [[42.5, 44.5, 1], [46, 46.6, 0]] },
};
// Lever moves (circuit phase): [loop time, value]; lever up = 1 = shut. L flicks open (0) and back to show the bits;
// then the four door states 11, 01, 10, 00, 2 s each, and back to 11.
const LEVERS: Record<"l" | "r", [number, number][]> = {
  l: [[0, 1], [17, 0], [18.5, 1], [27, 0], [29, 1], [31, 0], [33, 1]],
  r: [[0, 1], [29, 0], [33, 1]],
};
// The circuit drives the inputs from the fold until the unfold; the doors drive them otherwise.
const CIRCUIT_FROM = 14;
const CIRCUIT_TO = 46;
// A door switch opens once the door is a quarter open.
const SWITCH = 0.25;

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
  for (const [at, value] of moves) if (lt >= at) v = value;
  return v === 1;
};
const wrap = (lt: number) => ((lt % LOOP) + LOOP) % LOOP;

// Inputs at a loop time.
export function inputsAt(lt: number) {
  const x = wrap(lt);
  if (x >= CIRCUIT_FROM && x < CIRCUIT_TO) return { l: step(LEVERS.l, x), r: step(LEVERS.r, x) };
  return { l: channel("left", x) < SWITCH, r: channel("right", x) < SWITCH };
}
export const nand = (l: boolean, r: boolean) => !(l && r);
export const orBubbles = (l: boolean, r: boolean) => !l || !r;

// Outputs: each gate output is its function of the inputs one delay earlier.
export function outputsAt(lt: number) {
  const p = inputsAt(lt - DELAY);
  return { nand: nand(p.l, p.r), or: orBubbles(p.l, p.r) };
}

// De Morgan check: both rows agree at every moment of the loop.
for (let i = 0; i <= LOOP * 100; i++) {
  const o = outputsAt(i / 100);
  if (o.nand !== o.or) throw new Error(`De Morgan rows disagree at loop ${i / 100} s`);
}

// Readout rows: L shut, R shut, light.
export const ROWS: [number, number][] = [
  [1, 1],
  [0, 1],
  [1, 0],
  [0, 0],
];
export const rowOf = (l: boolean, r: boolean) => ROWS.findIndex(([a, b]) => a === +l && b === +r);
// Rows count as visited from the start of each phase (analogy, circuit, return), so the loop ends as it starts.
const PHASES = [0, CIRCUIT_FROM, CIRCUIT_TO];
const SAMPLE = 0.02;
const firstSeen = PHASES.map((from, k) => {
  const to = PHASES[k + 1] ?? LOOP;
  const seen = ROWS.map(() => Infinity);
  for (let x = from; x < to; x += SAMPLE) {
    const { l, r } = inputsAt(x);
    const i = rowOf(l, r);
    if (seen[i] === Infinity) seen[i] = x;
  }
  return seen;
});

// Reduced motion: hold the key state (circuit, 0 1, both lamps lit).
export const KEY_TIME = ENTRY.loopFrom + 28;

export function stateAt(t: number) {
  const lt = loopTime(t, LOOP);
  const inp = inputsAt(lt);
  const out = outputsAt(lt);
  const phase = lt >= CIRCUIT_TO ? 2 : lt >= CIRCUIT_FROM ? 1 : 0;
  const row = rowOf(inp.l, inp.r);
  return {
    lt,
    l: inp.l,
    r: inp.r,
    nand: out.nand,
    or: out.or,
    light: out.nand,
    left: channel("left", lt),
    right: channel("right", lt),
    fridge: channel("fridge", lt),
    board: channel("board", lt),
    circuit: channel("circuit", lt),
    row,
    seen: firstSeen[phase].map((s) => lt >= s),
    table: channel("table", lt),
    orBubbles: channel("orBubbles", lt),
    orBody: channel("orBody", lt),
    andBody: channel("andBody", lt),
    andBubble: channel("andBubble", lt),
    pulseIn: channel("pulseIn", lt),
    pulseGate: channel("pulseGate", lt),
    pulseOut: channel("pulseOut", lt),
    pulseNand: channel("pulseNand", lt),
    morph: channel("morph", lt),
    grid: channel("grid", lt),
  };
}
