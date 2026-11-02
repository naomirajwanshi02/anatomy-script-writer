// Arithmetic overflow model. Time unit: seconds of video (3 s entrance + loop time); LOOP = 35 s: analogy, circuit,
// back to the analogy, ending on the square board with the cluster switched off, the trip meter at 99998, every lamp
// off and the table out, as it starts.
// The timeline holds only part moves, arrivals, folds and drum steps; needles, lights, digits, bits, carries, the XOR
// wires, the V lamp, active tiles and table rows are computed from it.
import { ENTRY, loopTime } from "../../iso/entrance";

export const LOOP = 35;
export const BRAND = "ROLLIN";
export const WIDTH = 8;

// Bit arithmetic on WIDTH-bit words, the only place numbers turn into bits.
const MASK = (1 << WIDTH) - 1;
const SIGN = 1 << (WIDTH - 1);
export const bits = (v: number, w = WIDTH) => (v & ((1 << w) - 1)).toString(2).padStart(w, "0");
export const signed = (v: number) => ((v & MASK) >= SIGN ? (v & MASK) - (1 << WIDTH) : v & MASK);

// Analogy: a 5-drum trip counter at 99998 ticks to 99999 and rolls over to 00000; the 1 of 100000 has no sixth drum.
export const TRIP_DRUMS = 5;
export const START_TRIP = 99998;
const TRIP_TOP = 10 ** TRIP_DRUMS - 1; // 99999
const pad = (v: number) => String(v).padStart(TRIP_DRUMS, "0");
export const LOST_DIGIT = String(Math.floor((TRIP_TOP + 1) / 10 ** TRIP_DRUMS)); // "1"

// Circuit: 100 + 100 in 8 bits with a ripple-carry adder.
export const A_VAL = 100;
export const B_VAL = 100;
export const A_BITS = bits(A_VAL); // 01100100
export const B_BITS = bits(B_VAL); // 01100100
export const TOP = SIGN - 1; // 127, the biggest positive
// Ripple add from the right; carry[c] = carry INTO column c (c = 0 is the sign column on the left), carryOut from column 0.
const ripple = (() => {
  const sum: string[] = Array(WIDTH).fill("0");
  const carryIn: number[] = Array(WIDTH).fill(0);
  let c = 0;
  for (let col = WIDTH - 1; col >= 0; col--) {
    carryIn[col] = c;
    const t = Number(A_BITS[col]) + Number(B_BITS[col]) + c;
    sum[col] = String(t & 1);
    c = t >> 1;
  }
  return { sum: sum.join(""), carryIn, carryOut: c };
})();
export const SUM_BITS = ripple.sum; // 11001000
export const CARRY_IN = ripple.carryIn; // 1 at columns 0, 1, 4 (bits 7, 6, 3)
export const CARRY_OUT = ripple.carryOut; // 0
const SUM = parseInt(SUM_BITS, 2); // 200
export const RESULT = SUM >= SIGN ? SUM - (1 << WIDTH) : SUM; // -56
// The XOR gate: carry into the sign bit vs carry out of it.
export const XOR = CARRY_IN[0] ^ CARRY_OUT; // 1
export const OVERFLOW = XOR === 1;

const minus = (v: number) => (v < 0 ? `−${-v}` : `+${v}`);
// Readout rows, all from the numbers above. Row 0 counts up to the top while it is active (topRow).
const topRow = (n: number) => `top ${bits(n)} = ${minus(n)}`;
export const TABLE = [
  topRow(TOP),
  `${A_VAL} = ${A_BITS}`,
  `${A_BITS} + ${B_BITS} = ${SUM_BITS} → ${minus(RESULT)}`,
  `carry in ${CARRY_IN[0]} ${OVERFLOW ? "≠" : "="} carry out ${CARRY_OUT} → ${OVERFLOW ? "overflow" : "no overflow"}`,
];

type Span = [from: number, to: number, value: number];

// Timeline (loop seconds): each channel starts at its initial value and eases to value over [from, to].
const DIGIT_START = pad(START_TRIP).split("").map(Number);
const RESET = 32.8; // drums set back to 99998 while the cluster is under the board
const CHANNELS: Record<string, { from: number; spans: Span[] }> = {
  // Analogy half.
  engine: { from: 0, spans: [[0, 1.2, 1], [11, 11.8, 0]] }, // idle rpm blends in after the ignition sweep; needles drop at the fold
  pool: { from: 0, spans: [[0.2, 1, 1], [11, 12, 0]] }, // warm glow pool round the cluster
  driving: { from: 0, spans: [[1.2, 2.5, 1], [11, 11.8, 0]] }, // speed needle climbs to cruise, drops at the fold
  bang: { from: 0, spans: [[7.9, 8.1, 1], [11, 11.3, 0]] }, // red "!" tell-tale after the rollover
  warn: { from: 0, spans: [[8.2, 8.4, 1], [10.9, 11.1, 0]] }, // red dashed box round 00000 on the callout
  // Drum positions (digit = position mod 10): the right drum ticks 8 -> 9, then all five roll on to 0 together.
  drumR: { from: DIGIT_START[TRIP_DRUMS - 1], spans: [[4, 4.5, 9], [7, 8, 10], [RESET, RESET + 0.05, DIGIT_START[TRIP_DRUMS - 1]]] },
  drum: { from: 9, spans: [[7, 8, 10], [RESET, RESET + 0.05, 9]] },
  // The sixth drum the trip meter does not have: it shows the lost 1 as the drums roll, then drops off.
  ghost: { from: 0, spans: [[7.5, 7.9, 1], [10.6, 10.65, 0]] },
  ghostFall: { from: 0, spans: [[8.6, 9.8, 1], [10.6, 10.65, 0]] },
  // Fold: the cluster is gone (12.9) before the tiles settle (13.0-13.4).
  lift: { from: 0, spans: [[11.3, 13, 1], [RESET, RESET + 0.05, 0]] }, // the 5 drums lift out and land in row A
  phone: { from: 0, spans: [[11.2, 12.9, 1], [33.0, 34.0, 0]] }, // cluster and callout sink / rise back
  stretch: { from: 0, spans: [[11.8, 13.3, 1], [32.7, 33.5, 0]] }, // board: square -> long / back
  table: { from: 0, spans: [[12.5, 13.5, 1], [32.0, 32.7, 0]] },
  // Circuit half.
  sign: { from: 0, spans: [[13.6, 14.0, 1], [32.0, 32.4, 0]] }, // SIGN label under the sign column
  count: { from: 0, spans: [[14.5, 16.5, 1]] }, // top row counts 0 -> 127
  wires: { from: 0, spans: [[25.5, 26.0, 1], [32.0, 32.4, 0]] }, // XOR gate and its wires show
  signWarn: { from: 0, spans: [[23.0, 23.3, 1], [32.0, 32.3, 0]] }, // red dashed outline on the sign sum tile
  sink: { from: 0, spans: [[32.0, 32.7, 1], [RESET + 0.1, RESET + 0.15, 0]] }, // all circuit tiles sink into the board
};

// Row A: drums land on columns 3..7, columns 0..2 drop in; their text turns 0 -> A bits as they settle.
const SETTLE = 13;
const A_DROP = (i: number) => 12.5 + 0.1 * i; // columns 0..2
const B_DROP = (i: number) => 18 + 0.05 * i;
// Sum fills right to left one tile per 0.5 s from 19; the carry into column c appears with column c + 1.
const ADD_FROM = 19;
export const FILL_AT = (c: number) => ADD_FROM + 0.5 * (WIDTH - 1 - c);
const CARRY_AT = (c: number) => FILL_AT(c + 1);
const ADD_END = FILL_AT(0) + 0.5; // 23
const DETECT = 25; // carry-out chip shows its 0
const XOR_IN = 26.0; // the carry-in wire carries its 1 into the gate
const XOR_OUT = 26.6; // the gate output reaches the lamp
const LAMP: [number, number] = [27.0, 27.4];
const LAMP_OFF: [number, number] = [32.0, 32.4];
const DROP = 0.3;

// Tell-tale ignition check: all on, then out one after another.
const IGNITION_ON: [number, number] = [0.1, 0.25];
const IGNITION_OFF = (k: number): [number, number] => [0.6 + 0.15 * k, 0.72 + 0.15 * k];

const ease = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
const ramp = (lt: number, [a, b]: [number, number]) => ease((lt - a) / (b - a));

const channel = (name: string, lt: number) => {
  const { from, spans } = CHANNELS[name];
  let v = from;
  for (const [a, b, value] of spans) {
    if (lt >= b) v = value;
    else if (lt > a) return v + (value - v) * ease((lt - a) / (b - a));
  }
  return v;
};

// Text dip for a character change at [a, a + d]: the old char fades out, the new one fades in.
const dip = (lt: number, a: number, d: number) => {
  const u = (lt - a) / d;
  return { after: u >= 0.5, opacity: u <= 0 || u >= 1 ? 1 : Math.abs(1 - 2 * u) };
};

// Drop-in height factor 0..1 (1 = above, out of view) for a tile arriving at a.
const dropUp = (lt: number, a: number) => (lt < a ? 1 : lt < a + DROP ? (1 - (lt - a) / DROP) ** 2 : 0);

// Needles: smooth, computed from time (sums of slow sines), never frame-to-frame noise.
const idleRpm = (lt: number) => 0.85 + 0.06 * (0.6 * Math.sin(2 * Math.PI * 0.37 * lt) + 0.4 * Math.sin(2 * Math.PI * 0.83 * lt + 1));
const cruiseRpm = (lt: number) => 1.4 * (0.6 * Math.sin(2 * Math.PI * 0.29 * lt + 0.4) + 0.4 * Math.sin(2 * Math.PI * 0.71 * lt));
const cruise = (lt: number) => 60 + 3 * (0.6 * Math.sin(2 * Math.PI * 0.31 * lt) + 0.4 * Math.sin(2 * Math.PI * 0.77 * lt + 0.7));

// Reduced motion: hold the key state (V lamp lit).
export const KEY_TIME = ENTRY.loopFrom + 29;

export type TileState = { show: boolean; ch: string; textOpacity: number; up: number; active: boolean; rust?: boolean; dim?: boolean; warn?: number };

export function stateAt(t: number) {
  const lt = loopTime(t, LOOP);
  const sweep = lt < 1.2 ? 8 * Math.sin((Math.PI * lt) / 1.2) : 0;
  const engine = channel("engine", lt);
  const driving = channel("driving", lt);
  const ignition = (k: number) => ramp(lt, IGNITION_ON) * (1 - ramp(lt, IGNITION_OFF(k)));
  const bang = channel("bang", lt);
  const drums = Array.from({ length: TRIP_DRUMS }, (_, i) => channel(i === TRIP_DRUMS - 1 ? "drumR" : "drum", lt));
  const sink = channel("sink", lt);
  const lift = channel("lift", lt);
  const circuit = lt >= 12.4 && lt < RESET && sink < 1;

  // Table rows active per phase.
  const rows = lt < 14.5 ? [] : lt < 18 ? [0] : lt < ADD_FROM ? [1] : lt < DETECT ? [2] : lt < 32 ? [3] : [];
  const addCol = lt >= ADD_FROM && lt < ADD_END ? Math.floor(WIDTH - 1 - (lt - ADD_FROM) / 0.5) : -1;
  const signMark = lt >= 13.6 && lt < 18; // the sign column is pointed out
  const keyState = lt >= ADD_END && lt < 32;

  const rowA: TileState[] = A_BITS.split("").map((b, i) => {
    const fromDrum = i >= WIDTH - TRIP_DRUMS;
    const d = dip(lt, SETTLE, 0.4);
    return {
      show: circuit && (fromDrum ? lift > 0 : lt >= A_DROP(i)),
      ch: d.after ? b : "0",
      textOpacity: d.opacity,
      up: fromDrum ? 0 : dropUp(lt, A_DROP(i)),
      active: rows.includes(1) || addCol === i || (signMark && i === 0),
    };
  });
  const rowB: TileState[] = B_BITS.split("").map((b, i) => ({
    show: circuit && lt >= B_DROP(i),
    ch: b,
    textOpacity: 1,
    up: dropUp(lt, B_DROP(i)),
    active: rows.includes(1) || addCol === i,
  }));
  const sum: TileState[] = SUM_BITS.split("").map((b, i) => ({
    show: circuit && lt >= FILL_AT(i),
    ch: b,
    textOpacity: 1,
    up: dropUp(lt, FILL_AT(i)),
    active: addCol === i || (keyState && i === 0),
    warn: i === 0 ? channel("signWarn", lt) : 0,
  }));
  // Carry chips: index 0 = carry out of the sign column (left of it), 1..WIDTH-1 = carry into columns 0..WIDTH-2.
  const chips: TileState[] = Array.from({ length: WIDTH }, (_, k) => {
    if (k === 0) {
      const on = lt >= DETECT;
      return { show: circuit, ch: on ? String(CARRY_OUT) : "", textOpacity: on ? ramp(lt, [DETECT, DETECT + 0.3]) : 1, up: 0, active: false, dim: CARRY_OUT === 0 };
    }
    const c = k - 1;
    const carry = CARRY_IN[c];
    const on = carry === 1 && lt >= CARRY_AT(c);
    // Carries glow rust while the add runs; at detection only the carry into the sign column stays rust.
    const lit = on && (lt < DETECT || c === 0);
    return { show: circuit, ch: on ? "1" : "", textOpacity: 1, up: 0, active: lit, rust: lit };
  });

  const wires = channel("wires", lt);
  const count = Math.round(TOP * channel("count", lt));

  return {
    lt,
    tach: Math.max(0, sweep + engine * idleRpm(lt) + driving * cruiseRpm(lt) * 0.3 + driving * 1.1),
    speed: driving * cruise(lt),
    // Tell-tales: 0 "!" (red), 1 check engine (yellow), 2 battery (red), 3 headlight (blue).
    lights: [0, 1, 2, 3].map((k) => (k === 0 ? Math.max(ignition(k), bang) : ignition(k))),
    pool: channel("pool", lt),
    drums,
    ghost: channel("ghost", lt),
    ghostFall: channel("ghostFall", lt),
    // Callout mirrors the trip: the settled reading while driving, then the rollover "99999 -> 00000".
    callout: lt >= 8 && lt < RESET ? `${pad(TRIP_TOP)} → ${pad(0)}` : `    ${drums.map(digitOf).join("")}    `,
    warn: channel("warn", lt),
    drumsOut: lift > 0,
    lift,
    phone: channel("phone", lt),
    stretch: channel("stretch", lt),
    table: channel("table", lt),
    topRow: topRow(count),
    sink,
    rowA,
    rowB,
    sum,
    chips,
    sign: channel("sign", lt),
    // XOR gate: shown with its wires; the carry-in wire carries its 1, the carry-out wire its 0; the output and lamp
    // follow the gate.
    wires,
    flowIn: wires > 0.5 && lt >= XOR_IN && CARRY_IN[0] === 1,
    flowOut: wires > 0.5 && lt >= XOR_IN && CARRY_OUT === 1,
    flowY: wires > 0.5 && lt >= XOR_OUT && XOR === 1,
    vlamp: XOR * ramp(lt, LAMP) * (1 - ramp(lt, LAMP_OFF)),
    rows,
    labels: channel("stretch", lt) * (1 - sink),
  };
}

const digitOf = (p: number) => (((Math.floor(p + 1e-6) % 10) + 10) % 10).toString();
