// Full adder as paper columns. Time unit: video seconds = voice seconds of chip-design episode 12 (video t = audio t,
// voice.ts is the identity map). Word times: builds/notes/episodes/chip-design/12.words.json (take of 2026-10-31 11:09,
// 70.25 s, last word ends at 69.34 s). LOOP = 68 s (3 s entrance + 68 = 71 s video); the fold back ends at 65 s and the
// paper start frame (58 over 67, empty carry boxes and answer row) holds to 71 s, so the loop ends in its start state.
// Analogy (0-28.5): column addition on paper, 58 + 67 = 125; every column adds two digits plus the carry, writes the
// last digit and carries the rest. Fold (28.56-30.4): the paper fades, bit tiles drop in, one full-adder block rises.
// Circuit (30.4-63.4): one column of bits (at most 1 + 1 + 1 = 3 = 11), sum and carry for each total, then four blocks
// chained by their carries and 6 + 7 = 0110 + 0111 = 1101. Fold back (63.4-65).
// The timeline holds only the voice beats (inputs set, pencil moves, arrivals, highlights); every written digit, carry,
// sum, readout total and lit tile is computed by addColumn from those inputs.
export const LOOP = 68;
export const END = 3 + LOOP;
export const BRAND = "ROLLIN";

// One column of addition in any base: two digits plus the carry in -> the written digit and the carry out.
export const addColumn = (a: number, b: number, c: number, base: number) => [(a + b + c) % base, Math.floor((a + b + c) / base)] as const;

// Paper: 58 + 67, columns right to left (units, tens, hundreds).
export const PA = 58;
export const PB = 67;
const digit = (v: number, k: number) => Math.floor(v / 10 ** k) % 10;
const PAPER_COLS = (() => {
  const out: { a: number; b: number; cin: number; d: number; cout: number }[] = [];
  let c = 0;
  for (let k = 0; k < 3; k++) {
    const [d, co] = addColumn(digit(PA, k), digit(PB, k), c, 10);
    out.push({ a: digit(PA, k), b: digit(PB, k), cin: c, d, cout: co });
    c = co;
  }
  return out;
})();
export const PAPER_SUM = PAPER_COLS.reduce((s, col, k) => s + col.d * 10 ** k, 0);
if (PAPER_SUM !== PA + PB) throw new Error(`paper: ${PAPER_SUM}`);
const MAX_COLUMN = addColumn(9, 9, 1, 10); // 19: the carry is never more than one
if (MAX_COLUMN[1] !== 1) throw new Error("carry > 1");

// Circuit: 6 + 7 in 4 bits, bit i of the board's column i (0 = left = bit 3).
export const BA = 6;
export const BB = 7;
const bit = (v: number, col: number) => (v >> (3 - col)) & 1;
// Ripple: carry[4] = 0 (block 3's carry in); block i takes carry[i + 1] and gives carry[i].
const CHAIN = (() => {
  const carry = [0, 0, 0, 0, 0];
  const sum = [0, 0, 0, 0];
  for (let i = 3; i >= 0; i--) [sum[i], carry[i]] = addColumn(bit(BA, i), bit(BB, i), carry[i + 1], 2);
  return { sum, carry };
})();
if (CHAIN.sum.join("") !== "1101" || CHAIN.carry[0] !== 0) throw new Error(`chain: ${CHAIN.sum.join("")}`);
// Every input row: sum = 1 for totals 1 or 3 (XOR), carry = 1 for totals 2 or 3 (majority).
for (let r = 0; r < 8; r++) {
  const [a, b, c] = [(r >> 2) & 1, (r >> 1) & 1, r & 1];
  const [s, co] = addColumn(a, b, c, 2);
  if (s !== (a ^ b ^ c) || co !== (a + b + c >= 2 ? 1 : 0)) throw new Error(`row ${r}`);
}

// ---------- Timeline (video seconds, from the transcript) ----------

const W = {
  three: 1.82, threeQ: 3.0, add58: 4.68, add67: 5.5, noCarry: 6.56, eight: 7.7, seven: 8.08, fifteen: 8.76,
  write5: 9.66, carry1: 10.62, next: 11.42, five: 12.16, six: 12.8, carried: 13.6, third: 14.4, twelve: 16.0,
  write2: 16.7, carry2: 17.52, never: 18.42, nineteen: 21.94, numsIn: 22.8, digitOut: 23.88,
  fold: 28.56, bitIs: 30.48, addsTo: 32.78, twoIs: 36.46, threeIs: 37.94, writeLast: 39.12, carryRest: 40.56,
  sumIs: 42.2, carryIs: 45.36, fullAdder: 49.3, lineUp: 50.44, passing: 51.44, watch: 52.86, thirdCol: 54.38,
  one1: 55.24, one2: 55.66, aCarry: 56.34, threeOnes: 57.0, write1: 58.0, carryOne: 58.82, outComes: 59.52,
  threeIn: 61.76, twoOut: 62.48, teaser: 63.38,
};
export const KEY = [W.thirdCol, 59.3]; // key state: the third column adds three ones
export const KEY_TIME = W.threeOnes + 0.5;

const ease = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
const ramp = (t: number, a: number, d: number) => ease((t - a) / d);
const inside = (t: number, a: number, b: number) => t >= a && t < b;
// Rise and fall over [a, b] with ramps of r seconds.
const pulse = (t: number, a: number, b: number, r = 0.25) => Math.min(ramp(t, a, r), 1 - ramp(t, b - r, r));

// Phases: paper visible (fades at the fold, back at the fold back); circuit parts.
const paperIn = (t: number) => (t < 28.6 ? 1 : t < 63.9 ? 1 - ramp(t, 28.6, 0.9) : ramp(t, 63.9, 1.0));
const circuitGone = (t: number) => ramp(t, W.teaser + 0.05, 0.8); // tiles and blocks sink at the fold back

// ---------- Pencil ----------

const REST: [number, number] = [78, 26];
const P = (col: number, row: "a" | "b" | "ans" | "carry"): [number, number] => [(col - 1.5) * 36, { a: -31, b: -15, ans: 10, carry: -46 }[row]];
const PENCIL: [number, [number, number]][] = [
  [0, REST], [4.25, REST], [W.add58, [36, -31]], [W.add67, [36, -15]], [W.eight - 0.2, P(3, "a")], [W.seven, P(3, "b")],
  [W.write5 - 0.1, P(3, "ans")], [10.3, P(3, "ans")], [W.next + 0.3, P(2, "a")], [W.six, P(2, "b")], [W.carried, P(2, "carry")],
  [W.write2 - 0.1, P(2, "ans")], [17.2, P(2, "ans")], [18.05, P(1, "ans")], [18.6, P(1, "ans")], [19.6, REST],
];
function pencilAt(t: number) {
  for (let i = 1; i < PENCIL.length; i++) {
    const [t0, p0] = PENCIL[i - 1];
    const [t1, p1] = PENCIL[i];
    if (t < t1) {
      const moving = p0[0] !== p1[0] || p0[1] !== p1[1];
      const d = Math.min(0.55, t1 - t0);
      const u = moving ? ease((t - (t1 - d)) / d) : 0;
      const x = p0[0] + (p1[0] - p0[0]) * u;
      const y = p0[1] + (p1[1] - p0[1]) * u;
      const lift = moving && t > t1 - d ? 9 * Math.sin(Math.PI * u) : 0;
      return { x, y, z: 3 + lift };
    }
  }
  return { x: REST[0], y: REST[1], z: 3 };
}

// ---------- Paper ----------

export type PaperText = { ch: string; opacity: number; rust: boolean };

function paperState(t: number) {
  const units = PAPER_COLS[0];
  const tens = PAPER_COLS[1];
  const hundreds = PAPER_COLS[2];
  const glow8 = inside(t, W.eight, W.write5);
  const glow7 = inside(t, W.seven, W.write5);
  const tensGlow = (from: number) => inside(t, from, W.write2) || inside(t, W.numsIn, W.digitOut);
  const shown = (from: number) => (t < 28.6 ? ramp(t, from, 0.3) : 0); // written digits are wiped at the fold
  // Top and bottom digits, left to right: columns 2 and 3 (tens, units).
  const top: PaperText[] = [
    { ch: String(tens.a), opacity: 1, rust: tensGlow(W.five) || inside(t, W.third, W.twelve) },
    { ch: String(units.a), opacity: 1, rust: glow8 },
  ];
  const bottom: PaperText[] = [
    { ch: String(tens.b), opacity: 1, rust: tensGlow(W.six) || inside(t, W.third, W.twelve) },
    { ch: String(units.b), opacity: 1, rust: glow7 },
  ];
  // Carry boxes (columns 1..3): units shows a faint 0 (no carry yet); tens and hundreds get the hopped 1s.
  const carries: PaperText[] = [
    { ch: String(hundreds.cin), opacity: shown(18.1), rust: true },
    { ch: String(tens.cin), opacity: shown(11.2), rust: true },
    { ch: String(units.cin), opacity: 0.45 * shown(W.noCarry), rust: false },
  ];
  // Answer digits (columns 1..3).
  const answer: PaperText[] = [
    { ch: String(hundreds.d), opacity: shown(18.15), rust: inside(t, 18.15, 18.9) },
    { ch: String(tens.d), opacity: shown(W.write2), rust: inside(t, W.write2, W.carry2) || inside(t, W.digitOut, 25.3) },
    { ch: String(units.d), opacity: shown(W.write5), rust: inside(t, W.write5, W.carry1) },
  ];
  // The tens column's carried 1 glows with the tens digits; the hundreds' carried 1 glows as "a carry out".
  const carryPulse = pulse(t, W.never, 19.9, 0.2);
  const hops = [
    { ch: String(units.cout), u: (t - W.carry1) / 0.6, from: [colXp(3) - 9, 10], to: [colXp(2), -46] },
    { ch: String(tens.cout), u: (t - W.carry2) / 0.6, from: [colXp(2) - 9, 10], to: [colXp(1), -46] },
  ]
    .filter((h) => h.u > 0 && h.u < 1)
    .map((h) => ({ ch: h.ch, x: h.from[0] + (h.to[0] - h.from[0]) * ease(h.u), y: h.from[1] + (h.to[1] - h.from[1]) * ease(h.u), z: 16 * Math.sin(Math.PI * h.u) }));
  return {
    top,
    bottom,
    carries,
    carryRust: [inside(t, W.digitOut, 25.3), tensGlow(W.carried) || inside(t, W.third, W.twelve) || carryPulse > 0.05, false],
    carryPulse,
    answer,
    hops,
    slots: pulse(t, W.three, 4.4, 0.3) * (0.75 + 0.25 * Math.cos(2 * Math.PI * Math.max(0, t - W.threeQ) * 1.4)),
  };
}
const colXp = (i: number) => (i - 1.5) * 36;

// ---------- Circuit ----------

export type Tile = { ch: string; active: boolean };
type Inputs = [number, number, number];

// Block 3's inputs (A, B, carry in) during the one-column lesson; each entry holds until the next.
const SINGLE: [number, Inputs][] = [
  [0, [0, 0, 0]], [W.addsTo, [1, 0, 0]], [33.08, [1, 1, 0]], [33.32, [1, 1, 1]], [W.twoIs - 0.15, [1, 1, 0]], [W.threeIs, [1, 1, 1]],
  [W.sumIs, [0, 0, 0]], [44.32, [1, 0, 0]], [44.6, [1, 1, 0]], [44.82, [1, 1, 1]], [W.carryIs + 0.15, [1, 0, 0]], [46.56, [1, 1, 0]],
  [47.04, [1, 1, 1]], [W.lineUp - 0.15, [0, 0, 0]],
];
const singleAt = (t: number) => SINGLE.reduce<Inputs>((v, [at, x]) => (t >= at ? x : v), [0, 0, 0]);
const SINGLE_FROM = [W.writeLast + 0.5, W.carryRest + 0.55]; // its sum and carry are written (hops land)
const LIVE_FROM = W.sumIs; // afterwards they follow the inputs at once

// Chain: inputs set tile by tile, then each column resolves right to left.
const SET_A = (i: number) => 53.0 + 0.12 * i;
const SET_B = (i: number) => 53.36 + 0.12 * i;
const RESOLVE_SUM = [W.outComes, W.write1 + 0.4, 54.05, 53.75];
const RESOLVE_CARRY = [W.outComes, W.carryOne + 0.48, 54.5, 53.75]; // carry out of block i lands on carry tile i
const BLOCK_IN = (i: number) => (i === 3 ? 29.8 : W.lineUp + 0.06 + 0.3 * (2 - i));

export function circuitState(t: number) {
  const chain = t >= W.lineUp - 0.15;
  const gone = circuitGone(t);
  const A = [0, 0, 0, 0];
  const B = [0, 0, 0, 0];
  const C: (number | null)[] = [null, null, null, null, 0];
  const S: (number | null)[] = [null, null, null, null];
  const aAct = [false, false, false, false];
  const bAct = [false, false, false, false];
  const cAct = [false, false, false, false, false];
  const sAct = [false, false, false, false];
  if (!chain) {
    const [a, b, c] = singleAt(t);
    A[3] = a;
    B[3] = b;
    C[4] = c;
    const [s, co] = addColumn(a, b, c, 2);
    if (t >= SINGLE_FROM[0]) S[3] = t >= LIVE_FROM ? s : 1;
    if (t >= SINGLE_FROM[1]) C[3] = t >= LIVE_FROM ? co : 1;
    aAct[3] = a === 1;
    bAct[3] = b === 1;
    cAct[4] = c === 1;
    sAct[3] = S[3] === 1 && (inside(t, SINGLE_FROM[0], W.sumIs) || inside(t, W.sumIs, W.carryIs));
    cAct[3] = C[3] === 1 && (inside(t, SINGLE_FROM[1], W.sumIs) || inside(t, W.carryIs, W.lineUp));
  } else {
    for (let i = 0; i < 4; i++) {
      if (t >= SET_A(i)) A[i] = bit(BA, i);
      if (t >= SET_B(i)) B[i] = bit(BB, i);
      aAct[i] = A[i] === 1 && inside(t, SET_A(i), SET_A(i) + 0.6);
      bAct[i] = B[i] === 1 && inside(t, SET_B(i), SET_B(i) + 0.6);
    }
    for (let i = 3; i >= 0; i--) {
      if (t >= RESOLVE_SUM[i]) S[i] = CHAIN.sum[i];
      if (t >= RESOLVE_CARRY[i]) C[i] = CHAIN.carry[i];
      sAct[i] = S[i] === 1 && inside(t, RESOLVE_SUM[i], RESOLVE_SUM[i] + 0.6);
      cAct[i] = C[i] === 1 && inside(t, RESOLVE_CARRY[i], RESOLVE_CARRY[i] + 0.6);
    }
    // Key state: the third column's A, B and carry in light on their words, then together.
    if (inside(t, W.one1, W.write1)) aAct[1] = true;
    if (inside(t, W.one2, W.write1)) bAct[1] = true;
    if (inside(t, W.aCarry, W.write1)) cAct[2] = true;
    if (inside(t, W.write1, W.carryOne + 0.6)) sAct[1] = true;
    // "Out comes thirteen": the sum row pulses left to right.
    for (let i = 0; i < 4; i++) if (inside(t, 59.9 + 0.2 * i, 60.3 + 0.2 * i) && S[i] === 1) sAct[i] = true;
    // "Three in": every block's inputs; "two out": every block's outputs.
    if (inside(t, W.threeIn, W.twoOut - 0.1)) {
      for (let i = 0; i < 4; i++) (aAct[i] = A[i] === 1), (bAct[i] = B[i] === 1);
      for (let k = 1; k < 5; k++) cAct[k] = C[k] === 1;
    }
    if (inside(t, W.twoOut, W.teaser)) {
      for (let i = 0; i < 4; i++) sAct[i] = S[i] === 1;
      cAct[0] = C[0] === 1;
      for (let k = 1; k < 4; k++) cAct[k] = C[k] === 1;
    }
  }
  // Sizes: tiles drop in at the fold, blocks grow up; everything sinks at the fold back.
  const dropA = (i: number) => 1 - ramp(t, 29.15 + 0.08 * i, 0.5);
  const dropB = (i: number) => 1 - ramp(t, 29.35 + 0.08 * i, 0.5);
  const block = (i: number) => ramp(t, BLOCK_IN(i), 0.45) * (1 - gone);
  const tilesIn = t >= 29 ? 1 - gone : 0;
  const str = (v: number | null) => (v === null ? "" : String(v));
  const mk = (v: number | null, act: boolean): Tile => ({ ch: str(v), active: act });
  // Hops: the written bit drops into the sum tile; the carried bit hops left onto the carry tile.
  const hops: { ch: string; from: [number, number, number]; to: [number, number, number]; u: number }[] = [];
  const hop = (a: number, d: number, i: number, kind: "s" | "c", ch: string) => {
    const u = (t - a) / d;
    if (u <= 0 || u >= 1) return;
    hops.push({ ch, u, from: [colXp(i), -2, 6.5], to: kind === "s" ? [colXp(i), 20, 5.2] : [colXp(i) - 18, -2, 3.2] });
  };
  hop(W.writeLast + 0.05, 0.45, 3, "s", "1");
  hop(W.carryRest, 0.55, 3, "c", "1");
  hop(53.95, 0.5, 2, "c", String(CHAIN.carry[2]));
  hop(W.write1, 0.4, 1, "s", String(CHAIN.sum[1]));
  hop(W.carryOne, 0.48, 1, "c", String(CHAIN.carry[1]));
  return {
    a: A.map((v, i) => mk(v, aAct[i])),
    b: B.map((v, i) => mk(v, bAct[i])),
    s: S.map((v, i) => mk(v, sAct[i])),
    c: C.map((v, k) => mk(v, cAct[k])),
    dropA: [0, 1, 2, 3].map(dropA),
    dropB: [0, 1, 2, 3].map(dropB),
    tilesIn,
    block: [0, 1, 2, 3].map(block),
    // Carry tile k comes with block k (k = 4 with block 3); sum tile i with block i.
    carryIn: [0, 1, 2, 3, 4].map((k) => block(Math.min(3, k))),
    sumIn: [0, 1, 2, 3].map(block),
    boxActive: [0, 1, 2, 3].map((i) => (i === 1 && inside(t, KEY[0], KEY[1])) || (i === 3 && inside(t, W.writeLast, W.sumIs))),
    faLabel: ramp(t, W.fullAdder, 0.5) * (1 - gone),
    labels: (t >= 29.4 ? ramp(t, 29.4, 0.5) : 0) * (1 - gone),
    // Carry wires: rust flow while a resolved carry of 1 sits on them.
    flow: C.map((v) => (v === 1 ? 1 : 0)),
    chainDot: inside(t, W.passing, 52.7) ? (t - W.passing) / (52.7 - W.passing) : -1,
    hops,
  };
}

// ---------- Readout: the active column's total (paper: decimal; bits: total = its two-bit form) ----------

function readoutAt(t: number) {
  const ones = (v: Inputs) => v[0] + v[1] + v[2];
  const tb = (n: number) => `${n} = ${n.toString(2).padStart(2, "0")}`;
  if (t < 28.5) {
    if (t >= W.nineteen) return { text: String(MAX_COLUMN[1] * 10 + MAX_COLUMN[0]), key: false };
    if (t >= W.twelve) return { text: String(PAPER_COLS[1].a + PAPER_COLS[1].b + PAPER_COLS[1].cin), key: false };
    if (t >= W.fifteen) return { text: String(PAPER_COLS[0].a + PAPER_COLS[0].b + PAPER_COLS[0].cin), key: false };
    return { text: " ", key: false };
  }
  if (t < W.lineUp - 0.15) {
    const n = ones(singleAt(t));
    if (t < W.twoIs) return { text: n ? String(n) : " ", key: false };
    return { text: tb(n), key: false };
  }
  if (t >= W.outComes) return { text: tb(bit(BA, 0) + bit(BB, 0) + CHAIN.carry[1]), key: false };
  if (t >= W.threeOnes) return { text: tb(bit(BA, 1) + bit(BB, 1) + CHAIN.carry[2]), key: true };
  if (t >= W.aCarry) return { text: "3", key: true };
  if (t >= W.one2) return { text: "2", key: true };
  if (t >= W.one1) return { text: "1", key: true };
  if (t >= 54.05) return { text: tb(bit(BA, 2) + bit(BB, 2)), key: false };
  if (t >= 53.75) return { text: tb(bit(BA, 3) + bit(BB, 3)), key: false };
  return { text: " ", key: false };
}
const readoutIn = (t: number) => (t < 28.4 ? pulse(t, W.fifteen - 0.2, 28.4, 0.4) : Math.max(pulse(t, W.addsTo - 0.2, W.lineUp, 0.4), pulse(t, 53.6, W.teaser + 0.4, 0.4)));

// ---------- State ----------

// Figure time: the entrance plays the hook (t < 3), then the loop.
export const vtOf = (t: number) => (t < END ? t : 3 + ((t - 3) % LOOP));

export function stateAt(time: number) {
  const t = vtOf(time);
  const r = readoutAt(t);
  return {
    t,
    paperIn: paperIn(t),
    pencil: pencilAt(t),
    paper: paperState(t),
    circuit: circuitState(t),
    readout: r.text,
    readoutKey: r.key,
    readoutIn: readoutIn(t),
  };
}
