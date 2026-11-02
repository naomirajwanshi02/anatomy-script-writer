// BCD alarm clock model. Time unit: seconds of video (3 s entrance + loop time); LOOP = 41 s: analogy, circuit (why
// four bits, the boxes light, plain binary needs a divide-by-ten gear block, BCD boxes drive their windows straight,
// six codes wasted), and a fold back to the square board with the clock up, its display off, the callout empty and the
// table out, as it starts. The timeline holds only part moves, arrivals, folds and clock ticks; segments, colon, lamps,
// codes, active boxes, table cells, the gear block's subtraction steps and the windows' digits are computed.
import { ENTRY, loopTime } from "../../iso/entrance";

export const LOOP = 41;
export const BRAND = "ROLLIN";

// Each decimal digit gets its own 4-bit code (BCD).
export const code = (d: number) => d.toString(2).padStart(4, "0");

// Clock ticks (loop seconds): the time shown from each moment on. Flash marks the tick whose changed digits flash rust
// in the callout.
const TICKS: { at: number; time: string; flash: boolean }[] = [
  { at: 0, time: "0728", flash: false },
  { at: 3, time: "0729", flash: false },
  { at: 5.6, time: "0730", flash: true },
];
const FLASH = 0.7;
export const TIME = TICKS[TICKS.length - 1].time; // the time that folds into the circuit
export const DIGITS = TIME.split("").map(Number);
export const CODES = DIGITS.map(code); // 0000 0111 : 0011 0000

// Why four bits: the box of the 7 first shows only its 3 low bits (7 = 111, the most 3 bits can hold), then the 4th
// tile drops in.
export const THREE_BOX = DIGITS.indexOf(7);
export const THREE_MAX = (1 << 3) - 1; // 7

// Plain binary: the minutes as one number (30 = 11110) need a divide-by-ten gear block, one subtraction of ten per
// clunk, to give the two digits.
export const MINUTES = DIGITS[2] * 10 + DIGITS[3];
export const BINARY = MINUTES.toString(2); // 11110
export const TENS = Math.floor(MINUTES / 10); // 3
export const REM = MINUTES % 10; // 0

// Seven-segment table: segments a b c d e f g lit per decimal digit.
const SEG: Record<number, string> = {
  0: "abcdef",
  1: "bc",
  2: "abdeg",
  3: "abcdg",
  4: "bcfg",
  5: "acdfg",
  6: "acdefg",
  7: "abc",
  8: "abcdefg",
  9: "abcdfg",
};
export const SEGMENTS = ["a", "b", "c", "d", "e", "f", "g"] as const;
export const litSegments = (d: number) => SEGMENTS.map((s) => SEG[d].includes(s));

// Readout: all 16 four-bit codes; 10..15 are never used by a decimal digit.
export const TABLE = Array.from({ length: 16 }, (_, i) => ({ i, bits: code(i), unused: i > 9 }));

type Span = [from: number, to: number, value: number];

// Timeline (loop seconds): each channel starts at its initial value and eases to value over [from, to].
const BACK = 37.9; // fold back starts
const CHANNELS: Record<string, { from: number; spans: Span[] }> = {
  // Analogy half.
  power: { from: 0, spans: [[0.95, 1, 1], [11.35, 11.6, 0]] }, // display width: a line on, collapses to a dot
  open: { from: 0, spans: [[1, 1.6, 1], [11, 11.35, 0]] }, // display height: the line opens / closes
  alm: { from: 0, spans: [[1, 1.6, 1], [11, 11.35, 0]] }, // ALM bell lamp
  ring: { from: 0, spans: [[6.3, 6.5, 1], [10.8, 11, 0]] }, // alarm rings
  calloutOn: { from: 0, spans: [[1, 1.6, 1], [38.3, 38.35, 0]] }, // callout digits
  // Fold.
  clockSink: { from: 0, spans: [[11.4, 12.9, 1], [39.4, 40.5, 0]] }, // clock sinks (gone by 12.9) / rises back
  calloutSink: { from: 0, spans: [[11.4, 12.9, 1], [39.4, 40.5, 0]] },
  stretch: { from: 0, spans: [[11.9, 13, 1], [38.6, 39.4, 0]] }, // board: square -> long / back
  land: { from: 0, spans: [[11.6, 12.6, 1], [38.3, 38.35, 0]] }, // callout digits fly to the box labels
  labelFade: { from: 0, spans: [[20.6, 21, 1], [38.3, 38.35, 0]] }, // labels give way to the windows
  circuit: { from: 0, spans: [[12.8, 13.1, 1], [BACK, BACK + 0.5, 0]] }, // box trays
  table: { from: 0, spans: [[12.5, 13.5, 1], [BACK, BACK + 0.6, 0]] },
  flip: { from: 0, spans: [[13.2, 13.5, 1], [38.5, 38.55, 0]] }, // tiles flip digit -> bit
  tileSink: { from: 0, spans: [[BACK, BACK + 0.5, 1], [38.5, 38.55, 0]] },
  threeWarn: { from: 0, spans: [[13.6, 13.9, 1], [15.6, 15.9, 0]] }, // red dashed outline: 3 bits stop at 7
  // Plain binary: minute boxes sink, the 5-tile row and the gear block rise; they drop away and the boxes return.
  minSink: { from: 0, spans: [[21, 21.6, 1], [28.6, 29.2, 0]] },
  gearSink: { from: 1, spans: [[21.8, 22.5, 0], [28.0, 28.6, 1]] },
  // Key state: each box drives its own small window.
  win: { from: 0, spans: [[29.0, 29.5, 1], [BACK, BACK + 0.5, 0]] },
  unusedLabel: { from: 0, spans: [[35.5, 35.9, 1], [38.3, 38.35, 0]] },
};

// Tile drops per box (all 4 tiles of a box together; the 3-bit box's top tile later), boxes light one by one, unused
// cells one by one.
const DROP_AT = (k: number, i: number) => (k === THREE_BOX && i === 0 ? 15.0 : 12.5 + 0.08 * k);
const DROP = 0.45;
const LIGHT_AT = (k: number) => 16.5 + 1.0 * k;
const LIGHT_END = BACK;
const UNUSED_AT = (i: number) => 34 + 0.25 * (i - 10);
const UNUSED_END = 38.3;
const BIN_DROP = (i: number) => 21.8 + 0.08 * i;
const BIN_END = 28.0;
const CONVERT = 23.0; // first clunk
const STEP = 1.2;
const WIN_ON = 29.6;

const ease = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));

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

// Reduced motion: hold the key state (each box lighting its own window).
export const KEY_TIME = ENTRY.loopFrom + 32;

// Gear block: tens counted so far (one subtraction of ten per STEP) and the gear angle (one clunk per step).
const stepsDone = (lt: number) => (lt < CONVERT ? 0 : Math.min(Math.floor((lt - CONVERT) / STEP) + 1, TENS));
const CONVERT_END = CONVERT + STEP * TENS;
const gearTurn = (lt: number) => {
  if (lt < CONVERT) return 0;
  const u = (Math.min(lt, CONVERT_END) - CONVERT) / STEP;
  const k = Math.floor(u);
  return 90 * (k + ease(Math.min(1, (u - k) / 0.55)));
};

export function stateAt(t: number) {
  const lt = loopTime(t, LOOP);
  const tick = [...TICKS].reverse().find((k) => lt >= k.at)!;
  const prev = TICKS[TICKS.indexOf(tick) - 1];
  const shown = tick.time.split("").map(Number);
  const power = channel("power", lt);
  const open = channel("open", lt);
  const on = power * open;
  const ring = channel("ring", lt);
  const land = channel("land", lt);
  const sinceTick = lt - tick.at;
  const flashing = tick.flash && prev && sinceTick < FLASH && Math.floor(sinceTick / (FLASH / 4)) % 2 === 0;
  const lit = DIGITS.map((_, k) => lt >= LIGHT_AT(k) && lt < LIGHT_END);
  const dropped = lt < 38.5;
  const minSink = channel("minSink", lt);
  const tileSink = channel("tileSink", lt);
  const gearSink = channel("gearSink", lt);
  const converting = lt >= CONVERT - 0.4 && lt < CONVERT_END && gearSink < 1;
  const tens = stepsDone(lt);
  const win = channel("win", lt);
  return {
    power,
    open,
    on,
    shown,
    segments: shown.map(litSegments),
    colon: on > 0.5 && lt % 1 < 0.5,
    alm: channel("alm", lt),
    ring,
    bellAngle: ring * 16 * Math.sin(2 * Math.PI * 6 * lt),
    bellGlow: 1 + ring * (0.6 + 0.4 * Math.sin(2 * Math.PI * 6 * lt)),
    arcs: [0, 1].map((k) => ring * (0.5 + 0.5 * Math.sin(2 * Math.PI * 2.5 * lt - k * 1.4))),
    shake: ring * 0.9 * Math.sin(2 * Math.PI * 17 * lt),
    callout: channel("calloutOn", lt) > 0.01 && land <= 0 ? channel("calloutOn", lt) : 0,
    flash: shown.map((d, k) => Boolean(flashing && prev.time[k] !== tick.time[k])),
    clockSink: channel("clockSink", lt),
    calloutSink: channel("calloutSink", lt),
    stretch: channel("stretch", lt),
    land,
    labelOpacity: land > 0 ? 1 - channel("labelFade", lt) : 0,
    circuit: channel("circuit", lt),
    // Minute trays fade while the plain-binary row stands in their place.
    trayOpacity: DIGITS.map((_, k) => (k >= 2 ? 1 - minSink : 1)),
    table: channel("table", lt),
    flip: channel("flip", lt),
    tileGrow: DIGITS.map((_, k) => (1 - tileSink) * (k >= 2 ? 1 - minSink : 1)),
    tileUp: DIGITS.map((_, k) => [0, 1, 2, 3].map((i) => (dropped ? dropUp(lt, DROP_AT(k, i)) : 1))),
    threeWarn: channel("threeWarn", lt),
    lit,
    cells: TABLE.map((c) => DIGITS.some((d, k) => d === c.i && lit[k])),
    unused: TABLE.map((c) => c.unused && lt >= UNUSED_AT(c.i) && lt < UNUSED_END),
    unusedLabel: channel("unusedLabel", lt),
    // Plain binary row and the divide-by-ten gear block.
    binUp: BINARY.split("").map((_, i) => (lt < BIN_END ? dropUp(lt, BIN_DROP(i)) : 0)),
    binGrow: lt < BIN_END || gearSink < 1 ? 1 - (lt >= BIN_END ? gearSink : 0) : 0,
    binShow: lt >= BIN_DROP(0) && gearSink < 1,
    gearSink,
    gearAngle: gearTurn(lt),
    converting,
    tens,
    counter: lt >= CONVERT_END ? `${TENS} r ${REM}` : `tens ${tens}`,
    // Windows: each box straight to its own window, the digit lit from the box's code.
    win,
    winOn: lt >= WIN_ON && lt < BACK,
  };
}
