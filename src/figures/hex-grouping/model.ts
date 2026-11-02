// Hex grouping model. Time unit: seconds of video (3 s entrance + loop time); LOOP = 33 s, ending on the
// square board with the phone switched off and the callout empty, as it starts. Loop order (analogy and explanation
// only, no desk scene since 2026-10-27): phone analogy (0-12.4), circuit (12.4-31): byte, split into 4s, the table's
// 16 symbols lit one by one, weights 8 4 2 1 add up each group, B and 2 drop, key hold; fold back to the phone (31-32.5).
// The desk-scene channels stay defined but never fire.
// The timeline holds only part moves, arrivals and folds; tile positions, characters, tones, block drops, table
// cells, the monitor's bit wall and its hex rows are computed from it.
import { ENTRY, loopTime } from "../../iso/entrance";

export const CALLER = "ROLLIN";
export const KEY_LABELS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

export const LOOP = 33;

// Phone analogy digits and the 8 bits they fold into.
export const DIGITS = ["9", "8", "1", "2", "3", "4", "5", "6", "7", "0"];
export const BITS = "10110010";

// Each hex digit is exactly 4 bits.
export const NIBBLES = [BITS.slice(0, 4), BITS.slice(4, 8)];
export const NIBBLE_VALUES = NIBBLES.map((n) => parseInt(n, 2)); // 1011 -> 11, 0010 -> 2
export const hexDigit = (i: number) => i.toString(16).toUpperCase();
export const HEX = NIBBLE_VALUES.map(hexDigit); // "B", "2"
// Place values of a 4-bit group, and each group's sum as shown over it ("8 + 2 + 1 = 11", "= 2").
export const WEIGHTS = [8, 4, 2, 1];
export const SUMS = NIBBLES.map((n, k) => {
  const terms = WEIGHTS.filter((_, j) => n[j] === "1");
  return terms.length > 1 ? `${terms.join(" + ")} = ${NIBBLE_VALUES[k]}` : `= ${NIBBLE_VALUES[k]}`;
});

// Readout: the 16 hex digits with their 4-bit codes, generated, 2 rows x 8.
export const TABLE = Array.from({ length: 16 }, (_, i) => ({ i, hex: hexDigit(i), bits: i.toString(2).padStart(4, "0") }));

type Span = [from: number, to: number, value: number];

// Without-it monitor: a wall of 32-bit rows (bytes), seeded so every render is the same. It scrolls up by SCROLL
// rows during the struggle, ending with the circuit's byte BITS on the top row; the fix regroups every row in fours
// and flips each group to its hex digit (8 hex digits per row).
export const WALL_ROWS = 7; // rows visible on the screen
export const SCROLL = 4;
let seed = 7;
const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const randomBits = (n: number) => Array.from({ length: n }, () => (rand() < 0.5 ? "0" : "1")).join("");
export const WALL = Array.from({ length: WALL_ROWS + SCROLL }, (_, r) => (r === SCROLL ? BITS + randomBits(24) : randomBits(32)));
export const WALL_HEX = WALL.map((row) => row.match(/.{4}/g)!.map((n) => hexDigit(parseInt(n, 2))));
const byteText = (row: string) => row.match(/.{8}/g)!.join(" ");

// Thought bubble: the engineer's tangled reading of the wall (fractions of the bubble radii; size in ry).
// strike = digits crossed out; misread = the one active mistake (rust). Calm state: the byte read as hex.
export const JUMBLE = [
  { text: byteText(WALL[SCROLL]).slice(0, 14), x: -0.8, y: -0.28, rot: -5, size: 0.3, strike: [3], misread: 5 },
  { text: byteText(WALL[SCROLL + 1]).slice(9, 21), x: -0.72, y: 0.14, rot: 4, size: 0.27, strike: [1, 6], misread: -1 },
  { text: byteText(WALL[SCROLL + 2]).slice(2, 13), x: -0.78, y: 0.56, rot: -3, size: 0.25, strike: [8], misread: -1 },
];
export const CALM = HEX.join("");
export const BRAND = "ROLLIN";

// Timeline (loop seconds): each channel starts at its initial value and eases to value over [from, to].
const CHANNELS: Record<string, { from: number; spans: Span[] }> = {
  // Phone half.
  power: { from: 0, spans: [[0.95, 1, 1], [12.35, 12.6, 0]] }, // screen width: on with the power line; collapses to a dot
  open: { from: 0, spans: [[1, 1.6, 1], [12, 12.35, 0]] }, // screen height: the line opens to full; closes to a line
  calloutSplit: { from: 0, spans: [[7.5, 9, 1], [31.6, 31.65, 0]] }, // callout digits slide into 981 234 5670 (reset while hidden)
  warn: { from: 0, spans: [[6, 6.15, 1], [7.35, 7.5, 0]] }, // red dashed "hard to read" box round the tight run
  calling: { from: 0, spans: [[7.5, 8, 1], [12, 12.3, 0]] }, // "Calling ROLLIN..." on callout and screen
  gapMark: { from: 0, spans: [[9, 9.4, 1], [12, 12.3, 0]] }, // rust bars light in the two new gaps once split
  phone: { from: 0, spans: [[12.4, 13.6, 1], [31.9, 32.5, 0]] }, // phone and callout sink into the board (gone by 13.6 s) / rise back
  stretch: { from: 0, spans: [[12.8, 13.8, 1], [31.2, 32, 0]] }, // board: square -> long / back to square
  land: { from: 0, spans: [[12.6, 13.8, 1], [31.6, 31.65, 0]] }, // callout digits drop as tiles onto the board (reset while hidden)
  table: { from: 0, spans: [[18.4, 19, 1], [31, 31.6, 0]] }, // hex table hidden until "sixteen patterns", in just before the 0-to-F sweep
  // Circuit half (back to the start values at 31.6 s, while the tiles are sunk).
  split: { from: 1, spans: [[14.5, 15, 0], [31.6, 31.65, 1]] }, // tiles land in 3, 3, 4; the 8 close into one row
  flip: { from: 0, spans: [[13.5, 14, 1], [31.6, 31.65, 0]] }, // digits flip to bits
  sink: { from: 0, spans: [[14, 14.5, 1], [31.6, 31.65, 0]] }, // the last 2 tiles sink into the board
  centre: { from: 0, spans: [[14.5, 15, 1], [31.6, 31.65, 0]] }, // row re-centres on 8 tiles
  nib: { from: 0, spans: [[17, 19, 1], [31.6, 31.65, 0]] }, // gap opens between the two groups of 4 bits
  // Weights 8 4 2 1 float over each group in turn (the 1-bits light rust), then their sum; gone as the block lands.
  weigh0: { from: 0, spans: [[21, 21.4, 1], [23.5, 23.8, 0]] },
  sum0: { from: 0, spans: [[22.2, 22.6, 1], [23.5, 23.8, 0]] },
  weigh1: { from: 0, spans: [[24, 24.4, 1], [26, 26.3, 0]] },
  sum1: { from: 0, spans: [[25, 25.4, 1], [26, 26.3, 0]] },
  tilesOut: { from: 0, spans: [[31, 31.5, 1], [31.7, 31.75, 0]] }, // all tiles sink into the board at the fold back
  // Without-it scene: the board becomes a desk; monitor, keyboard, engineer and chair fall in.
  desk: { from: 0, spans: [] }, // desk legs grow under the board / retract
  cam: { from: 0, spans: [] }, // camera eases out to fit the desk scene / back
  monPower: { from: 0, spans: [] }, // monitor screen width (power line / dot)
  monOpen: { from: 0, spans: [] }, // monitor screen height (line opens / closes)
  bubble: { from: 0, spans: [] }, // thought bubble pops in / out
  scroll: { from: 0, spans: [] }, // wall of bits scrolls up slowly (rows)
  regroup: { from: 0, spans: [] }, // byte gaps close, nibble gaps open
  hexFlip: { from: 0, spans: [] }, // each group of 4 flips to its hex digit
  calm: { from: 0, spans: [] }, // bubble: tangle and "?" -> calm "B2" and a tick
};

// Key presses (loop seconds): one digit every 0.44 s from 1.6 s; the key dips for 0.25 s and its digit appears.
export const PRESS = DIGITS.map((_, k) => 1.6 + 0.44 * k);
const DIP = 0.25;

// Hex block arrivals and departures (loop seconds), and when each nibble is active.
export const BLOCKS = [
  { drop: 23.5, lift: 31 }, // "B" over the left nibble, once its weights add to 11
  { drop: 26, lift: 31 }, // "2" over the right nibble
];
const DROP = 0.6;
const LIFT = 0.5;

// Desk-scene parts (monitor, keyboard, engineer and chair): fall in like the entrance, land at 29.3 s; lift away.
export const DESK_PARTS = { drop: 999, lift: 999 }; // desk scene retired
export const DESK_LAND = DESK_PARTS.drop + DROP;

const ease = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));

const channel = (name: string, lt: number) => {
  const { from, spans } = CHANNELS[name];
  let v = from;
  for (const [from, to, value] of spans) {
    if (lt >= to) v = value;
    else if (lt > from) return v + (value - v) * ease((lt - from) / (to - from));
  }
  return v;
};

// Block height above its resting place, 0..1 (1 = out of view): gravity drop with a small bounce, eased lift.
const blockUp = ({ drop, lift }: { drop: number; lift: number }, lt: number) => {
  if (lt < drop || lt >= lift + LIFT) return 1;
  if (lt < drop + DROP) return 1 - ((lt - drop) / DROP) ** 2;
  if (lt < drop + DROP + 0.16) return 0.03 * Math.sin((Math.PI * (lt - drop - DROP)) / 0.16);
  if (lt < lift) return 0;
  return ease((lt - lift) / LIFT);
};

// Table sweep (loop seconds): one cell after another, 0 to F.
const SWEEP = [19, 21];

// Reduced motion: hold the key state B2.
export const KEY_TIME = ENTRY.loopFrom + 28;

export function stateAt(t: number) {
  const lt = loopTime(t, LOOP);
  const flip = channel("flip", lt);
  const showBits = flip >= 0.5;
  const tiles = DIGITS.map((d, i) => {
    const ch = showBits ? (BITS[i] ?? d) : d;
    const tone = showBits && i < 8 ? (BITS[i] === "1" ? "hi" : "lo") : "hi";
    return { ch, tone, nibble: i < 4 ? 0 : i < 8 ? 1 : -1 };
  });
  const active = BLOCKS.map((b) => lt >= b.drop && lt < b.lift);
  const tilesOut = channel("tilesOut", lt);
  return {
    tilesOut,
    desk: channel("desk", lt),
    cam: channel("cam", lt),
    // Fall in like the entrance; on the fold back they sink a little into the desk and fade (no lift).
    deskUp: lt >= DESK_PARTS.lift ? 0 : blockUp(DESK_PARTS, lt),
    deskOut: lt >= DESK_PARTS.lift ? ease((lt - DESK_PARTS.lift) / LIFT) : 0,
    // Seconds since the desk parts landed (drives their sparks; negative before).
    deskSince: lt - DESK_LAND,
    monPower: channel("monPower", lt),
    monOpen: channel("monOpen", lt),
    bubble: channel("bubble", lt),
    scroll: channel("scroll", lt),
    regroup: channel("regroup", lt),
    hexFlip: channel("hexFlip", lt),
    calm: channel("calm", lt),
    // Tangle wobble while struggling (degrees).
    wobble: Math.sin(lt * 2.4) * 2.5,
    split: channel("split", lt),
    sink: channel("sink", lt),
    centre: channel("centre", lt),
    nib: channel("nib", lt),
    land: channel("land", lt),
    phone: channel("phone", lt),
    stretch: channel("stretch", lt),
    calloutSplit: channel("calloutSplit", lt),
    calling: channel("calling", lt),
    table: channel("table", lt),
    warn: channel("warn", lt),
    gapMark: channel("gapMark", lt),
    power: channel("power", lt),
    open: channel("open", lt),
    // Animated dots after "Calling ROLLIN": 0..3, one more every 0.35 s.
    dots: Math.floor(Math.max(0, lt - 7.5) / 0.35) % 4,
    // Tiles fade as they fly back into the callout, so it ends empty (start state from 29.2 s).
    tileOpacity: lt >= 31 ? Math.min(1, channel("land", lt) / 0.5) : 1,
    // Digit i shows on callout and screen once typed, until it drops off at the fold.
    typed: DIGITS.map((_, i) => lt < 12.6 && lt >= PRESS[i]),
    // Key dip 0..1 per key label.
    keys: KEY_LABELS.map((label) => {
      const i = DIGITS.indexOf(label);
      const u = i < 0 ? -1 : (lt - PRESS[i]) / DIP;
      return u >= 0 && u < 1 ? Math.sin(Math.PI * u) : 0;
    }),
    textOpacity: Math.abs(1 - 2 * flip),
    tiles,
    active,
    blockUp: BLOCKS.map((b) => blockUp(b, lt)),
    // Table: the 16 symbols light one by one, 0 to F (19-21 s), then the active nibbles' cells stay lit.
    cells: TABLE.map((c) => NIBBLE_VALUES.some((v, k) => v === c.i && active[k]) || (lt >= SWEEP[0] && lt < SWEEP[1] && c.i === Math.floor(((lt - SWEEP[0]) / (SWEEP[1] - SWEEP[0])) * 16))),
    weigh: [channel("weigh0", lt), channel("weigh1", lt)],
    sum: [channel("sum0", lt), channel("sum1", lt)],
  };
}
