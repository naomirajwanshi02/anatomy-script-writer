// Parity wash model. Time unit: seconds of video (3 s entrance + loop time); LOOP = 50.5 s, ending on the square board
// with the machine up, door shut, water off, 7 socks on the tray, no spare, lamps off and the callout at "7 socks", as
// it starts. One idea runs through both halves: count, pair off, and an odd count leaves one alone.
// Order: socks counted and paired (7 = 3 pairs + 1), the spare drops in (8 = 4 pairs), the wash eats the spare,
// 7 come out (odd, CHECK); fold; the 7 data bits (one flip shown), their 1s counted and paired (3, odd), the parity bit
// (4, even); the word is sent down the wires, noise flips one bit on its wire, the receiver counts 5 (odd, error); sent
// again with two flips, 6 (even, missed); "?" over every bit (which one?); back to the one-flip check; fold back.
// The timeline holds only part moves, arrivals, folds, counting starts, send times and noise hits; drum angle, socks,
// tiles, bits on the wires, pairs, the lone item, counts, the CHECK lamp and the readout are computed from it.
import { ENTRY, loopTime } from "../../iso/entrance";

export const LOOP = 50.5;
export const BRAND = "ROLLIN";

// Analogy: 7 socks, a spare makes 8 (even); the wash eats the spare and 7 come out (odd).
export const SOCKS = 7;
export const SLOTS = SOCKS + 1;
const SPARE = SOCKS; // slot index of the spare (the sock the machine eats)

// Circuit: 7 data bits plus one even-parity bit (XOR of the data bits).
export const DATA = "1011000";
const bitsOf = (s: string) => s.split("").map(Number);
export const DATA_BITS = bitsOf(DATA);
export const PARITY = DATA_BITS.reduce((a, b) => a ^ b, 0);
export const ones = (bits: number[]) => bits.reduce((a, b) => a + b, 0);
export const SENT = [...DATA_BITS, PARITY];
// Noise hits flip data bits that are 0 (the first and the third 0 of the word).
const zeros = DATA_BITS.map((b, i) => (b === 0 ? i : -1)).filter((i) => i >= 0);
export const FLIPS = [zeros[0], zeros[2]];
export const DEMO = zeros[0]; // the tile that shows what a flip is, before anything is sent
const received = (n: number) => SENT.map((b, i) => (FLIPS.slice(0, n).includes(i) ? 1 - b : b));
const oddOrEven = (n: number) => (n % 2 ? "odd" : "even");
if (ones(SENT) % 2 !== 0 || ones(received(1)) % 2 !== 1 || ones(received(2)) % 2 !== 0) throw new Error("parity check story is wrong");

// Pairing: items counted in order pair off two by two; an odd count leaves the last one alone.
const pairOff = (items: number[]) => {
  const pairs: [number, number][] = [];
  for (let k = 0; k + 1 < items.length; k += 2) pairs.push([items[k], items[k + 1]]);
  return { pairs, alone: items.length % 2 ? items[items.length - 1] : -1 };
};
const onesAt = (bits: number[]) => bits.map((b, i) => (b ? i : -1)).filter((i) => i >= 0);

type Span = [from: number, to: number, value: number];

// ---------- Timeline (loop seconds) ----------
// Analogy.
const SOCK_COUNT = (k: number) => 1.0 + 0.3 * k; // the 7 socks counted
const SPARE_DROP = 4.0;
const SPARE_COUNT = 4.6;
const PAIRS_OFF = 5.4; // pairs fade as the socks go in
const IN_AT = (k: number) => 6.0 + 0.14 * k;
const HOP = 0.42;
const EAT: [number, number] = [10.2, 10.9]; // the spare flashes rust in the drum, then is gone
const OUT_AT = (k: number) => 12.7 + 0.19 * k;
const RECOUNT = (k: number) => 14.6 + 0.22 * k;
const AFTER = RECOUNT(SOCKS - 1) + 0.3; // odd: CHECK lamp, empty slot outlined
const FOLD = 17.5;
// Circuit.
const DROP_AT = (i: number) => (i === SLOTS - 1 ? 25.0 : 19.0 + 0.08 * i);
const DROP = 0.45;
const SENT_COUNT = onesAt(DATA_BITS).map((_, k) => 22.0 + 0.6 * k);
const PARITY_COUNT = 25.6;
const SENT_OFF = 27.4;
const SENDS = [
  { at: 27.8, n: 1, hits: [28.25], countFrom: 29.4, step: 0.35 },
  { at: 36.8, n: 2, hits: [37.25, 37.45], countFrom: 38.3, step: 0.33 },
];
const TRAVEL = 1.0; // a bit's trip down its wire
const SPARK_LEAD = 0.4;
const BACK_TO_ONE = 44.3; // the takeaway is shown on the one-flip check
const OFF = 48.0; // fold back

const CHANNELS: Record<string, { from: number; spans: Span[] }> = {
  // Analogy.
  door: { from: 0, spans: [[5.6, 6.0, 1], [7.6, 7.85, 0], [12.2, 12.6, 1], [14.3, 14.55, 0]] },
  dial: { from: 0, spans: [[7.8, 8.2, 1], [30, 30.05, 0]] },
  spin: { from: 0, spans: [[7.95, 8.1, 1], [11.6, 11.75, 0]] }, // yellow SPIN lamp
  water: { from: 0, spans: [[7.9, 8.6, 1], [11.4, 12.1, 0]] },
  speed: { from: 0, spans: [[8.3, 8.9, 0.5], [9.3, 9.9, 2], [11.3, 11.8, 0]] }, // drum, revolutions per second
  creep: { from: 0, spans: [[9.5, 11.3, 2.5], [30, 30.05, 0]] }, // machine walks during the spin (reset while sunk)
  sockPairs: { from: 1, spans: [[PAIRS_OFF - 0.3, PAIRS_OFF, 0]] },
  check: { from: 0, spans: [[AFTER, AFTER + 0.15, 1], [FOLD + 0.6, FOLD + 0.65, 0]] }, // red CHECK lamp on the machine
  // Fold.
  sink: { from: 0, spans: [[FOLD, FOLD + 1.2, 1], [OFF + 1.2, OFF + 2.2, 0]] }, // machine, tray and callout sink / rise
  stretch: { from: 0, spans: [[FOLD + 0.4, FOLD + 1.5, 1], [OFF + 0.5, OFF + 1.4, 0]] }, // board: square -> long / back
  circuit: { from: 0, spans: [[FOLD + 1.3, FOLD + 1.8, 1], [OFF, OFF + 0.5, 0]] }, // wires, CHECK block, labels
  table: { from: 0, spans: [[FOLD + 1.5, FOLD + 2.1, 1], [OFF, OFF + 0.6, 0]] },
  tileSink: { from: 0, spans: [[OFF, OFF + 0.5, 1], [OFF + 1.2, OFF + 1.25, 0]] },
  demo: { from: 0, spans: [[20.3, 20.6, 1], [21.1, 21.4, 0]] }, // what a flip is: one tile 0 -> 1 -> 0
  recvClear: { from: 0, spans: [[36.0, 36.4, 1], [SENDS[1].at, SENDS[1].at + 0.01, 0]] },
  unknown: { from: 0, spans: [[41.6, 42.0, 1], [43.7, 44.0, 0]] }, // "?" over every received bit
  wrong: { from: 0, spans: [[40.4, 40.7, 1], [BACK_TO_ONE - 0.3, BACK_TO_ONE, 0]] }, // red dashed: wrong but accepted
};

const ease = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

const channel = (name: string, lt: number) => {
  const { from, spans } = CHANNELS[name];
  let v = from;
  for (const [a, b, value] of spans) {
    if (lt >= b) v = value;
    else if (lt > a) return v + (value - v) * ease((lt - a) / (b - a));
  }
  return v;
};

// Drop height 0..1 (1 = high above): gravity fall with a small bounce.
const dropUp = (lt: number, a: number) => {
  if (lt < a) return 1;
  if (lt < a + DROP) return 1 - ((lt - a) / DROP) ** 2;
  if (lt < a + DROP + 0.14) return 0.04 * Math.sin((Math.PI * (lt - a - DROP)) / 0.14);
  return 0;
};

// Drum angle (revolutions): the integral of the speed channel, tabulated once.
const STEP = 0.01;
const TURNS = (() => {
  const out = [0];
  for (let i = 1; i <= LOOP / STEP; i++) out.push(out[i - 1] + channel("speed", (i - 0.5) * STEP) * STEP);
  return out;
})();
const turnsAt = (lt: number) => {
  const f = lt / STEP;
  const i = Math.min(TURNS.length - 2, Math.floor(f));
  return TURNS[i] + (TURNS[i + 1] - TURNS[i]) * (f - i);
};

// Socks: where each one is. hop 0..1 = flight from tray slot to drum mouth; inDrum while it tumbles.
function socksAt(lt: number) {
  return Array.from({ length: SLOTS }, (_, k) => {
    const inU = (lt - IN_AT(k)) / HOP;
    const outU = k === SPARE ? -1 : (lt - OUT_AT(k)) / HOP;
    if (k === SPARE && lt < SPARE_DROP) return { onTray: false, hop: -1, inDrum: false, up: 1 };
    if (inU < 0) return { onTray: true, hop: -1, inDrum: false, up: k === SPARE ? dropUp(lt, SPARE_DROP) : 0 };
    if (inU < 1) return { onTray: false, hop: inU, inDrum: false, up: 0 };
    if (k === SPARE) return { onTray: false, hop: -1, inDrum: lt < EAT[1], up: 0 };
    if (outU < 0) return { onTray: false, hop: -1, inDrum: true, up: 0 };
    if (outU < 1) return { onTray: false, hop: 1 - outU, inDrum: false, up: 0 };
    return { onTray: true, hop: -1, inDrum: false, up: 0 };
  });
}

// Sock count on the tray: before the wash the 7 are counted, then the spare; after it the 7 that came out.
function sockCount(lt: number) {
  const upTo = (at: (k: number) => number) => Array.from({ length: SOCKS }, (_, k) => k).filter((k) => lt >= at(k));
  if (lt < PAIRS_OFF + 0.6) {
    const items = [...upTo(SOCK_COUNT), ...(lt >= SPARE_COUNT ? [SPARE] : [])];
    return { n: items.length, items, after: false };
  }
  if (lt >= RECOUNT(0) && lt < FOLD + 0.6) {
    const items = upTo(RECOUNT);
    return { n: items.length, items, after: true };
  }
  return { n: 0, items: [] as number[], after: false };
}

// Callout lines: the live count, then the verdict.
function calloutAt(lt: number, n: number): [string, string] {
  if (lt < SOCK_COUNT(0) || lt >= FOLD + 0.6) return [`${SOCKS} socks`, ""];
  if (lt < PAIRS_OFF + 0.6) {
    if (n < SOCKS) return [`count: ${n}`, ""];
    if (n === SOCKS) return [`${SOCKS} = ${(SOCKS - 1) / 2} pairs + 1`, "odd"];
    return [`${SLOTS} = ${SLOTS / 2} pairs`, "even"];
  }
  if (lt < RECOUNT(0)) return [`${SLOTS} socks in`, "wash"];
  if (n < SOCKS) return [`out: ${n}`, ""];
  return [`${SLOTS} in → ${SOCKS} out`, `odd ✗`];
}

// Bits on the wires and the received word of the current send.
function sendAt(lt: number) {
  const send = [...SENDS].reverse().find((s) => lt >= s.at && lt < OFF);
  if (!send) return { send: null, dots: [] as { i: number; u: number; bit: number }[], sparks: [] as { i: number; travel: number; burst: number }[], recv: null as number[] | null, flipped: [] as number[] };
  const u = (lt - send.at) / TRAVEL;
  const hit = FLIPS.slice(0, send.n);
  // A bit flips on its wire once its spark has landed.
  const bitAt = (i: number) => {
    const k = hit.indexOf(i);
    return k >= 0 && lt >= send.hits[k] ? 1 - SENT[i] : SENT[i];
  };
  const dots = u >= 0 && u < 1 ? SENT.map((_, i) => ({ i, u, bit: bitAt(i) })) : [];
  const sparks = hit.map((i, k) => {
    const h = send.hits[k];
    return { i, travel: lt >= h - SPARK_LEAD && lt < h ? (lt - h + SPARK_LEAD) / SPARK_LEAD : -1, burst: lt >= h && lt < h + 0.45 ? (lt - h) / 0.45 : -1 };
  });
  // Back to the one-flip word for the takeaway.
  const n = lt >= BACK_TO_ONE ? 1 : send.n;
  return { send, dots, sparks, recv: u >= 1 ? received(n) : null, flipped: u >= 1 ? FLIPS.slice(0, n) : [] };
}

// Reduced motion: hold the key state (one flip caught: five 1s, odd, CHECK lit).
export const KEY_TIME = ENTRY.loopFrom + 33;

export function stateAt(t: number) {
  const lt = loopTime(t, LOOP);
  const speed = channel("speed", lt);
  const fast = clamp01((speed - 0.5) / 1.5);

  // ---- Analogy.
  const sc = sockCount(lt);
  const sockPairing = pairOff(sc.items);
  const after = lt >= AFTER && lt < FOLD + 0.6;

  // ---- Circuit: the sent row (with the flip demo) and its count, the sends, the received row and its count.
  const tileOn = lt >= DROP_AT(0) && lt < OFF + 1.2;
  const demo = channel("demo", lt);
  const sentBits = SENT.map((b, i) => (i === DEMO && demo >= 0.5 ? 1 - b : b));
  const sentCounted = [...onesAt(DATA_BITS).filter((_, k) => lt >= SENT_COUNT[k]), ...(lt >= PARITY_COUNT ? [SLOTS - 1] : [])];
  const sentPhase = lt >= SENT_COUNT[0] && lt < SENT_OFF;
  const sx = sendAt(lt);
  const recvClear = channel("recvClear", lt);
  const backToOne = lt >= BACK_TO_ONE;
  const recvOnes = sx.recv ? onesAt(sx.recv) : [];
  const recvCounted = sx.send && sx.recv ? recvOnes.filter((_, k) => backToOne || lt >= sx.send!.countFrom + k * sx.send!.step) : [];
  const recvPhase = sx.send !== null && sx.recv !== null && (backToOne || lt >= sx.send.countFrom) && recvClear < 0.5;
  const recvDone = recvPhase && recvCounted.length === recvOnes.length;
  const sentDone = lt >= SENT_COUNT[SENT_COUNT.length - 1];
  // The readout counts whichever row is being checked.
  let readout = "";
  if (recvPhase) readout = `ones: ${recvCounted.length}` + (recvDone ? ` → ${oddOrEven(recvCounted.length)} → ${recvCounted.length % 2 ? "error" : "missed"}` : "");
  else if (sentPhase) readout = `ones: ${sentCounted.length}` + (sentDone ? ` → ${oddOrEven(sentCounted.length)}` : "");
  const sp = pairOff(sentCounted);
  const rp = pairOff(recvCounted);

  return {
    lt,
    // Machine.
    door: channel("door", lt),
    dial: channel("dial", lt),
    spin: channel("spin", lt),
    check: channel("check", lt),
    water: channel("water", lt),
    speed,
    turns: turnsAt(lt),
    slosh: 0.5 + 1.4 * (speed / 2),
    shake: [fast * 0.8 * Math.sin(2 * Math.PI * 11 * lt), fast * 0.5 * Math.sin(2 * Math.PI * 7 * lt + 1), fast * 0.6 * Math.abs(Math.sin(2 * Math.PI * 13 * lt))] as [number, number, number],
    creep: channel("creep", lt),
    socks: socksAt(lt),
    // The machine eats the spare: it flashes rust in the drum (0..1), then is gone.
    eatK: SPARE,
    eat: lt >= EAT[0] && lt < EAT[1] ? (lt - EAT[0]) / (EAT[1] - EAT[0]) : -1,
    // Sock pairs (arcs over the tray) and the sock left alone (rust).
    sockPairs: sockPairing.pairs,
    sockAlone: sockPairing.alone,
    pairsShow: sc.after ? 1 : channel("sockPairs", lt),
    emptySlot: after ? SPARE : -1,
    callout: calloutAt(lt, sc.n),
    calloutWarn: after,
    // Fold.
    sink: channel("sink", lt),
    stretch: channel("stretch", lt),
    circuit: channel("circuit", lt),
    table: channel("table", lt),
    tileGrow: 1 - channel("tileSink", lt),
    // Sent row: drops in, one tile shows a flip, its 1s counted and paired, then the parity tile.
    sentUp: SENT.map((_, i) => (tileOn ? dropUp(lt, DROP_AT(i)) : 1)),
    sentBits,
    demoFade: demo > 0 && demo < 1 ? Math.abs(1 - 2 * demo) : 1,
    demoOn: demo > 0.02,
    sentHot: SENT.map((_, i) => sentPhase && sentCounted.includes(i)),
    sentPairs: sentPhase ? sp.pairs : [],
    sentAlone: sentPhase ? sp.alone : -1,
    // Wires and the received row: bits travel down, sparks flip bits on their wires, the receiver counts.
    dots: sx.dots,
    sparks: sx.sparks,
    recv: sx.recv,
    recvGrow: 1 - recvClear,
    flipped: sx.flipped,
    recvHot: SENT.map((_, i) => recvPhase && recvCounted.includes(i)),
    recvPairs: recvPhase ? rp.pairs : [],
    recvAlone: recvPhase ? rp.alone : -1,
    errorLamp: recvDone && recvCounted.length % 2 === 1,
    unknown: channel("unknown", lt),
    wrong: channel("wrong", lt),
    readout,
  };
}
