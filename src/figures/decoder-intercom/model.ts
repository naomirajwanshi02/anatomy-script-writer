// Decoder intercom, chip-design episode 13 ("What does a decoder do in a memory chip").
// Time unit: video seconds = voice seconds (video t = audio t; the voice starts with the 3 s entrance, as in episode 12).
// Word times: builds/notes/episodes/13.words.json (200 words, 0-69.56 s). LOOP = 67 s (3 s entrance + 67 = 70 s video);
// the levers return to the middle at 64.3-64.75 s, so the start frame (levers in the middle, every bell clear, every
// dot hollow) holds from about 65 s to 70 s and the loop ends in its start state.
// Analogy (0-31.5): eight flats, one intercom with three levers (wing, floor, side); each flat's bell checks all three.
// Fold (31.48-32.98): the building becomes a wall of 8 memory rows, each bell becomes a row lamp, each check plate a
// checker block, the booth levers become address levers on the wall. Circuit (33-62.9). Fold back (62.92-64.2).
// The timeline holds only lever moves, folds and highlight beats; every dot, bell, lamp, wire flow, word line and readout
// digit is computed from the lever positions: dot = (lever bit == flat/row bit), ring / word line = AND of the 3 dots,
// row = 4*a2 + 2*a1 + a0.
export const LOOP = 67;
export const END = 3 + LOOP;
export const BRAND = "ROLLIN";

// ---------- Address bits ----------

export type Sig = "w" | "f" | "s";
export const SIGS: Sig[] = ["w", "f", "s"];
export const BIT: Record<Sig, number> = { w: 2, f: 1, s: 0 };
export const LEVER_INFO: Record<Sig, { name: string; v0: string; v1: string; tag: string; key: string; keyBit: string }> = {
  w: { name: "WING", v0: "A", v1: "B", tag: "W", key: "W = wing", keyBit: "W = bit 2" },
  f: { name: "FLOOR", v0: "G", v1: "1", tag: "F", key: "F = floor", keyBit: "F = bit 1" },
  s: { name: "SIDE", v0: "L", v1: "R", tag: "S", key: "S = side", keyBit: "S = bit 0" },
};

// The eight flats (row r = 4w + 2f + s), each with its own three bits.
export type Flat = { id: string; row: number; bits: Record<Sig, 0 | 1> };
export const rowBits = (r: number): Record<Sig, 0 | 1> => ({ w: ((r >> 2) & 1) as 0 | 1, f: ((r >> 1) & 1) as 0 | 1, s: (r & 1) as 0 | 1 });
export const FLATS: Flat[] = Array.from({ length: 8 }, (_, r) => {
  const bits = rowBits(r);
  return { id: `${bits.w ? "B" : "A"}${bits.f ? "1" : "G"}${bits.s ? "R" : "L"}`, row: r, bits };
});
export const rowOf = (v: Record<Sig, 0 | 1>) => 4 * v.w + 2 * v.f + v.s;

// The data stored in row 5 (read out at "for reading").
export const ROW5_DATA = [1, 0, 1, 1, 0, 0, 1, 0];
// A 20-bit address for "about a million rows" (low three bits 101 = the guard's setting); its row in a 64-line sketch.
export const ADDR20 = 0x5a3c5;
export const BITS20 = Array.from({ length: 20 }, (_, i) => (ADDR20 >> (19 - i)) & 1);
export const DENSE = 64;
export const DENSE_ROW = Math.floor((ADDR20 / 2 ** 20) * DENSE);

// ---------- Timeline (video seconds, word starts from the transcript) ----------

export const W = {
  three: 4.08, eight: 5.16, building: 7.42, A: 8.18, B: 8.8, ground: 9.54, first: 9.94, left: 10.96, right: 11.38,
  panel: 12.68, wing: 14.44, floor: 15.1, side: 15.62, every: 16.24, checks: 16.8, all: 17.08, three3: 17.4, and: 17.72,
  rings: 18.0, only: 18.22, ifW: 18.64, allM: 18.86, flat: 19.58, setB: 20.76, setG: 21.82, setR: 22.62, onlyThat: 23.1,
  settings: 24.36, now: 31.48, eachSwitch: 33.26, wire: 34.1, zeroOne: 34.7, wingC: 36.06, floorC: 36.72, sideC: 36.98,
  threeBits: 37.74, bits: 38.0, of: 38.24, address: 38.54, eachFlat: 39.26, oneRow: 40.06, eachRow: 41.42, allB: 42.16,
  threeB: 42.52, bitsB: 42.78, likeDb: 43.28, mismatch: 44.16, quiet: 45.3, kB: 46.14, kG: 46.88, kR: 47.22, one1: 48.02,
  zero: 48.34, one2: 48.58, turns: 50.6, on: 50.86, thatLine: 51.6, wordLine: 52.44, opens: 53.18, reading: 53.96,
  extra: 54.76, doubles: 55.58, twenty: 56.98, million: 58.42, decoder: 59.66, fewWires: 60.82, rowOut: 61.86,
  oneSetting: 62.92, ringsDb: 63.44, reverse: 64.86,
};
const FOLD = [W.now, W.now + 1.5]; // building -> memory rows
const FOLD_BACK = [W.oneSetting, W.oneSetting + 1.3]; // memory rows -> building
export const KEY_TIME = 51.2; // key state: row 5's word line on, its lamp lit

// Lever moves: [time, target]; target -1 = up (first value, bit 0), +1 = down (second value, bit 1), 0 = middle.
type Move = [number, number, number]; // time, target, move duration
const FLICK = 0.12;
const SET = 0.25;
const MOVES: Record<Sig, Move[]> = { w: [], f: [], s: [] };
const flick = (k: Sig, t0: number) => MOVES[k].push([t0, -1, FLICK], [t0 + 0.16, 1, FLICK], [t0 + 0.32, 0, FLICK]);
flick("w", W.wing);
flick("f", W.floor);
flick("s", W.side);
MOVES.w.push([W.setB, 1, SET]);
MOVES.f.push([W.setG, -1, SET]);
MOVES.s.push([W.setR, 1, SET]);
// "Eight settings": 000 .. 111, 0.4 s each, then back to B, ground, right (101).
for (let k = 0; k <= 8; k++) {
  const b = rowBits(k === 8 ? 5 : k);
  for (const s of SIGS) MOVES[s].push([W.settings + 0.4 * k, b[s] ? 1 : -1, FLICK]);
}
// Fold back: the guard lets go, the levers return to the middle (start frame).
MOVES.w.push([64.3, 0, SET]);
MOVES.f.push([64.42, 0, SET]);
MOVES.s.push([64.54, 0, SET]);

const ease = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
export const ramp = (t: number, a: number, d: number) => ease((t - a) / d);
const inside = (t: number, a: number, b: number) => t >= a && t < b;
const pulse = (t: number, a: number, b: number, r = 0.25) => Math.min(ramp(t, a, r), 1 - ramp(t, b - r, r));

// Lever position (-1 .. 1) and its value (0, 1 or null while not at an end).
export function leverPos(k: Sig, t: number) {
  let p = 0;
  for (const [at, target, d] of MOVES[k]) {
    if (t < at) break;
    p = p + (target - p) * ease((t - at) / d);
  }
  return p;
}
export const valueOf = (p: number): 0 | 1 | null => (p <= -0.95 ? 0 : p >= 0.95 ? 1 : null);

// ---------- State ----------

export const vtOf = (t: number) => (t < END ? t : 3 + ((t - 3) % LOOP));

export function stateAt(time: number) {
  const t = vtOf(time);
  const pos = { w: leverPos("w", t), f: leverPos("f", t), s: leverPos("s", t) };
  const val = { w: valueOf(pos.w), f: valueOf(pos.f), s: valueOf(pos.s) };
  const match = (bits: Record<Sig, 0 | 1>, k: Sig) => val[k] !== null && val[k] === bits[k];

  // Scene: 0 = building, 1 = memory rows.
  const fold = t < FOLD_BACK[0] ? ramp(t, FOLD[0], FOLD[1] - FOLD[0]) : 1 - ramp(t, FOLD_BACK[0], FOLD_BACK[1] - FOLD_BACK[0]);
  const circuit = t >= FOLD[0] && t < FOLD_BACK[1];

  // ----- Analogy -----
  const dots = FLATS.map((f) => SIGS.map((k) => match(f.bits, k)));
  const bells = dots.map((d) => d.every(Boolean));
  // "Eight doorbells": each bulb glints in turn (a short half glow), the opening colour pop.
  const glint = FLATS.map((_, i) => 0.6 * pulse(t, W.eight + 0.14 * i, W.eight + 0.14 * i + 0.34, 0.12));
  const lamp = bells.map((on, i) => Math.max(on ? 1 : 0, glint[i]));
  // Dot highlights: "checks all three" (dot k on every plate with its lever), "rings only if all match" (flat B-G-R).
  const turn: Sig | null = inside(t, W.checks, W.all) ? "w" : inside(t, W.all, W.three3) ? "f" : inside(t, W.three3, W.and) ? "s" : null;
  const flashK: Sig | null = inside(t, W.rings, W.rings + 0.3) ? "w" : inside(t, W.only, W.only + 0.3) ? "f" : inside(t, W.ifW, W.ifW + 0.3) ? "s" : null;
  const flashAll = inside(t, W.allM, W.flat + 0.3);
  const dotHl = FLATS.map((f) => SIGS.map((k) => turn === k || (f.row === 5 && (flashK === k || flashAll))));

  // Lever highlights (knob ring and name): analogy and circuit beats.
  const leverHl = (k: Sig) =>
    inside(t, W.three, W.three + 0.9) ||
    turn === k ||
    (k === "w" && (inside(t, W.wingC, W.wingC + 0.5) || inside(t, W.kB, W.kB + 0.6))) ||
    (k === "f" && (inside(t, W.floorC, W.floorC + 0.5) || inside(t, W.kG, W.kG + 0.6))) ||
    (k === "s" && (inside(t, W.sideC, W.sideC + 0.5) || inside(t, W.kR, W.kR + 0.6)));

  const analogy = {
    lift: pulse(t, W.building, 12.1, 0.35),
    wingHl: [inside(t, W.A, W.B), inside(t, W.B, W.B + 0.6)],
    pale: [inside(t, W.ground, 10.9), inside(t, W.first, 10.9)], // by floor
    sideHl: [inside(t, W.left, W.right), inside(t, W.right, W.right + 0.5)],
    panelHl: inside(t, W.panel, W.panel + 0.9),
    cableHl: inside(t, W.every, W.and),
    dots,
    dotHl,
    lamp,
    ringing: bells,
    flow: SIGS.map((k) => val[k] === 1),
  };

  // ----- Circuit -----
  // Checker dots show their comparison from "all three bits" on (W, then F, then S); the rows drive their word lines
  // from "turns on" (row enable).
  const reveal: Record<Sig, number> = { w: W.allB, f: W.threeB, s: W.bitsB };
  const shown = (k: Sig) => circuit && t >= reveal[k];
  const cdots = FLATS.map((f) => SIGS.map((k) => shown(k) && match(f.bits, k)));
  const drive = circuit && t >= W.turns;
  const wordOn = cdots.map((d) => drive && d.every(Boolean));
  const front = ramp(t, W.turns, 0.3); // word line runs left to right
  const lit = wordOn.map((on) => on && front >= 0.99);
  const addr = SIGS.every((k) => val[k] !== null) ? rowOf(val as Record<Sig, 0 | 1>) : -1;
  const digitHl = (k: Sig) =>
    inside(t, W.address, W.address + 0.6) ||
    (k === "w" && (inside(t, W.kB, W.kB + 0.6) || inside(t, W.one1, W.one1 + 0.32))) ||
    (k === "f" && (inside(t, W.kG, W.kG + 0.6) || inside(t, W.zero, W.zero + 0.24))) ||
    (k === "s" && (inside(t, W.kR, W.kR + 0.6) || inside(t, W.one2, W.one2 + 0.5)));
  const fillAt: Record<Sig, number> = { w: W.threeBits, f: W.bits, s: W.of };

  // Scale-up beat: a fourth lever, 16 rows, then 20 levers and a dense block; back to 3 levers and 8 rows.
  const s16 = pulse(t, W.doubles, W.twenty + 0.12, 0.35);
  const s20 = pulse(t, W.twenty, 59.45, 0.35);
  const addr16 = addr >= 0 ? addr : -1; // fourth bit 0: row 0101 = 5 of 16

  const circ = {
    wall: fold,
    labelsBits: ramp(t, W.eachSwitch, 0.4),
    wireHl: SIGS.map((k, i) => inside(t, W.wire + 0.2 * i, W.wire + 0.2 * i + 0.25) || inside(t, W.fewWires, W.fewWires + 0.8)),
    flow: SIGS.map((k) => circuit && t >= W.zeroOne && val[k] === 1),
    cdots,
    wordOn,
    front,
    lit,
    thick: t >= W.wordLine,
    lineGlow: inside(t, W.thatLine, W.thatLine + 0.6) || inside(t, W.rowOut, W.rowOut + 0.7),
    ghostWindow: 0.55 * pulse(t, W.eachFlat, W.eachRow - 0.4, 0.4),
    rowOutline: inside(t, W.oneRow, W.eachRow),
    ghostBells: 0.5 * pulse(t, W.likeDb, W.likeDb + 0.8, 0.2),
    rowBright: inside(t, W.mismatch, 46.0) ? 4 : -1,
    cellsPale: ROW5_DATA.map((_, i) => ramp(t, W.opens + 0.08 * i, 0.15) * (1 - ramp(t, W.extra, 0.3))),
    slide: ROW5_DATA.map((_, i) => (t >= W.reading + 0.05 * i && t < W.reading + 0.05 * i + 0.75 ? (t - W.reading - 0.05 * i) / 0.75 : -1)),
    columnHl: inside(t, W.decoder, W.fewWires),
    rows8: 1 - Math.max(s16, s20),
    levers3: 1 - s20,
    lever4: pulse(t, W.extra, W.twenty + 0.12, 0.35),
    s16,
    s20,
    lit16: Array.from({ length: 16 }, (_, r) => drive && r === addr16),
    denseHl: inside(t, W.million, 59.3),
  };

  const keyHl: Record<Sig, boolean> = { w: leverHl("w") || circ.wireHl[0], f: leverHl("f") || circ.wireHl[1], s: leverHl("s") || circ.wireHl[2] };

  return {
    t,
    fold,
    pos,
    val,
    leverHl: { w: leverHl("w"), f: leverHl("f"), s: leverHl("s") },
    analogy,
    circ,
    key: {
      plain: ramp(t, W.checks, 0.3) * (1 - ramp(t, W.eachSwitch, 0.3)),
      bits: ramp(t, W.eachSwitch, 0.3) * (1 - ramp(t, 64.6, 0.4)),
      match: ramp(t, W.and, 0.3) * (1 - ramp(t, 64.6, 0.4)),
      hl: keyHl,
    },
    readout: {
      in: pulse(t, W.threeBits - 0.3, W.oneSetting + 0.3, 0.35) * (1 - Math.max(s16, s20)),
      digits: SIGS.map((k) => (t >= fillAt[k] && val[k] !== null ? String(val[k]) : " ")),
      hl: SIGS.map(digitHl),
      row: addr,
    },
  };
}
export type State = ReturnType<typeof stateAt>;

// Every setting lights exactly one row (and one bell).
for (let r = 0; r < 8; r++) {
  const v = rowBits(r);
  const hits = FLATS.filter((f) => SIGS.every((k) => f.bits[k] === v[k]));
  if (hits.length !== 1 || hits[0].row !== rowOf(v)) throw new Error(`setting ${r}`);
}
