// Two's complement model. Time unit: seconds of video (3 s entrance + loop time); LOOP = 44.1 s, ending on the square
// board with the cluster switched off, drums at 0003 and the card out, as it starts. Order (script beats, reworked
// 2026-10-28 to steps on a counter): odometer rolls 3, 2, 1, 0, 9999 (0-11), fold to bits (11.2-13.6): an exposed
// 4-drum binary counter drops onto the long board at 0000; one step back 0000 -> 1111 = -1 (14.2), two more steps back
// 1110, 1101 = -3 (17), shortcut row: 0011 flips tile by tile to 1100, +1 makes 1101, linked to the counter (20-26.2),
// 5 - 3 = 5 + (-3) (26.5), the counter rolls forward five steps 1110, 1111, 0000 (wrap flash), 0001, 0010 (28.5-32.3),
// key hold 0010 = 2 (32.3-40.9), path strip "0000 - 3 = 1101, + 5 = 0010" (38-41), fold back to the odometer (41-43.4).
// The timeline holds only part moves, arrivals, folds and counter steps; drum angles, pinions, the wrap flash, the
// reading, its signed value, the shortcut tiles and the readout lines are computed from it.
import { ENTRY, loopTime } from "../../iso/entrance";

export const LOOP = 44.1;
export const BRAND = "ROLLIN";
export const WIDTH = 4;

// Bit arithmetic on WIDTH-bit words, the only place numbers turn into bits.
const MASK = (1 << WIDTH) - 1;
export const bits = (v: number, w = WIDTH) => (v & ((1 << w) - 1)).toString(2).padStart(w, "0");
export const signed = (v: number) => ((v & MASK) >= 1 << (WIDTH - 1) ? (v & MASK) - (1 << WIDTH) : v & MASK);
const invert = (v: number) => ~v & MASK;
export const minus = (v: number) => (v < 0 ? `−${-v}` : `${v}`);

// Analogy: 0003 rolled back 4 steps lands on 9999, the odometer's "0 - 1".
export const START_READING = 3;
// Circuit: 5 - 3 with only an adder. -3 is three steps back from 0000; the shortcut flips 3 and adds 1.
export const A_VAL = 5;
export const B_VAL = 3;
export const B_BITS = bits(B_VAL); // 0011
export const INV_BITS = bits(invert(B_VAL)); // 1100
export const NEG_BITS = bits(invert(B_VAL) + 1); // 1101

// Counter steps (loop seconds, direction): back 1 (0000 -> 1111), back 2 (1110, 1101), forward A_VAL (to 0010).
const BACK1 = 14.2;
const BACK = [17, 17.8];
const FWD0 = 28.5;
const FWD_PITCH = 0.8;
export const STEPS: { at: number; dir: 1 | -1 }[] = [
  { at: BACK1, dir: -1 },
  ...BACK.slice(0, B_VAL - 1).map((at) => ({ at, dir: -1 as const })),
  ...Array.from({ length: A_VAL }, (_, k) => ({ at: FWD0 + FWD_PITCH * k, dir: 1 as const })),
];
// Each step: the rightmost drum turns first and the carry (or borrow) ripples left, one drum every RIPPLE s.
const RIPPLE = 0.1;
const TURN = 0.4;
// Values after each step, from 0000; the check the brief asks for: 1111, 1110, 1101, then 1110, 1111, 0000, 0001, 0010.
export const VALUES = STEPS.reduce<number[]>((acc, s) => [...acc, (acc[acc.length - 1] + s.dir) & MASK], [0]);
export const RESULT = VALUES[VALUES.length - 1]; // 2

type Span = [from: number, to: number, value: number];

// Timeline (loop seconds): each channel starts at its initial value and eases to value over [from, to].
const CHANNELS: Record<string, { from: number; spans: Span[] }> = {
  // Analogy.
  engine: { from: 0, spans: [[0, 1.2, 1], [11, 11.8, 0]] }, // idle rpm blends in after the ignition sweep; needles drop at the fold
  pool: { from: 0, spans: [[0.2, 1, 1], [11, 12, 0]] }, // warm glow pool round the cluster
  reverse: { from: 0, spans: [[2.5, 2.8, 1], [11, 11.3, 0]] }, // R tell-tale
  rolling: { from: 0, spans: [[2.8, 3.3, 1], [8.2, 8.7, 0]] }, // speed needle while reversing
  warn: { from: 0, spans: [[8.4, 8.6, 1], [10.5, 10.7, 0]] }, // red dashed box round 9999 on the callout
  // Drum positions (digit = position mod 10): the right drum steps back 3, 2, 1, 0, then all four roll to 9; they
  // roll on to 0000 before the fold, and are set back to 0003 while the cluster is under the board.
  drum3: { from: START_READING, spans: [[3, 3.6, 2], [4.4, 5, 1], [5.8, 6.4, 0], [7.4, 8.4, -1], [10.6, 11.2, 0], [41.8, 41.85, START_READING]] },
  drum: { from: 0, spans: [[7.4, 8.4, -1], [10.6, 11.2, 0], [41.8, 41.85, 0]] },
  // Fold to bits and back.
  phone: { from: 0, spans: [[11.6, 13.5, 1], [42.2, 43.4, 0]] }, // cluster and callout sink / rise back
  stretch: { from: 0, spans: [[12.2, 13.5, 1], [41.4, 42.8, 0]] }, // board: square -> long / back to square
  counter: { from: 1, spans: [[12.8, 13.6, 0], [41, 41.7, -1]] }, // binary counter: 1 = above (drops in), 0 = landed, -1 = sunk
  table: { from: 0, spans: [[13.4, 14, 1], [41, 41.7, 0]] },
  // Shortcut row beside the counter: drops in as 0011, flips, +1, links to the counter, then sinks.
  rowIn: { from: 1, spans: [[20, 20.6, 0], [25.6, 26.2, -1], [41.8, 41.85, 1]] },
  plus1: { from: 0, spans: [[23, 23.5, 1], [41.8, 41.85, 0]] },
  link: { from: 0, spans: [[23.6, 24, 1], [25.4, 25.7, 0]] },
  // Readout lines: the 5 - 3 line, then the path strip.
  problem: { from: 0, spans: [[26.4, 26.8, 1], [41, 41.4, 0]] },
  path: { from: 0, spans: [[38, 38.5, 1], [41, 41.4, 0]] },
};

const FLIP_AT = (i: number) => 20.8 + 0.5 * i;
const FLIP_DUR = 0.4;
const KEY = [STEPS[STEPS.length - 1].at + RIPPLE * 3 + TURN, 40.9]; // key hold, through the path strip

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

// Counter mechanics for the step list: drum i (0 = left, weight 8) turns one slot whenever its bit changes, forward
// for a step up and back for a step down (its rim is printed 0 1 0 1 ..., so every slot changes the bit); the
// ripple starts at the right drum. Pinion j sits left of drum j and turns with drum j - 1 (the carry passed left);
// pinion 0 turns into empty space when the leftmost drum carries out (the wrap).
function counterAt(lt: number) {
  const pos = [0, 0, 0, 0];
  const pin = [0, 0, 0, 0];
  const turning = [false, false, false, false];
  const pinOn = [false, false, false, false];
  let flash = 0;
  let value = 0;
  let stepsDone = 0;
  STEPS.forEach((s, k) => {
    const from = VALUES[k];
    const to = VALUES[k + 1];
    for (let i = 3; i >= 0; i--) {
      const w = 1 << (3 - i);
      if ((from & w) === (to & w)) continue;
      const t0 = s.at + RIPPLE * (3 - i);
      const u = ease((lt - t0) / TURN);
      pos[i] += s.dir * u;
      if (lt > t0 && lt < t0 + TURN) turning[i] = true;
      // The pinion left of a carrying drum turns with the next drum (or into empty space past the left drum).
      if (i < 3) {
        pin[i + 1] += s.dir * u;
        if (lt > t0 && lt < t0 + TURN) pinOn[i + 1] = true;
      }
      if (i === 0) {
        const wrap = (s.dir > 0 && from === MASK) || (s.dir < 0 && from === 0);
        if (wrap) {
          pin[0] += s.dir * u;
          if (lt > t0 && lt < t0 + TURN) pinOn[0] = true;
          const f = (lt - t0) / 0.9;
          if (f > 0 && f < 1) flash = f;
        }
      }
    }
    if (lt >= s.at + RIPPLE * 3 + TURN * 0.5) {
      value = to;
      stepsDone = k + 1;
    }
  });
  return { pos, pin, turning, pinOn, flash, value, stepsDone };
}

// Needles: smooth, computed from time (sums of slow sines), never frame-to-frame noise.
const idleRpm = (lt: number) => 0.85 + 0.06 * (0.6 * Math.sin(2 * Math.PI * 0.37 * lt) + 0.4 * Math.sin(2 * Math.PI * 0.83 * lt + 1));
const reverseSpeed = (lt: number) => 6 + 2 * (0.6 * Math.sin(2 * Math.PI * 0.45 * lt) + 0.4 * Math.sin(2 * Math.PI * 1.1 * lt + 0.7));

// Reduced motion: hold the key state (counter at 0010 = 2).
export const KEY_TIME = ENTRY.loopFrom + 35;

export type TileState = { ch: string; textOpacity: number; active: boolean };

export function stateAt(t: number) {
  const lt = loopTime(t, LOOP);
  const sweep = lt < 1.2 ? 8 * Math.sin((Math.PI * lt) / 1.2) : 0;
  const engine = channel("engine", lt);
  const ignition = (k: number) => ramp(lt, IGNITION_ON) * (1 - ramp(lt, IGNITION_OFF(k)));
  const reverse = channel("reverse", lt);
  const drums = [channel("drum", lt), channel("drum", lt), channel("drum", lt), channel("drum3", lt)];
  const c = counterAt(lt);
  const plus1 = channel("plus1", lt);
  const inKey = lt >= KEY[0] && lt < KEY[1];

  // Shortcut row: 0011 flips left to right one tile at a time to 1100, then +1 rolls the right tile to 1 (1101).
  const shortcut: TileState[] = [0, 1, 2, 3].map((i) => {
    const f = dip(lt, FLIP_AT(i), FLIP_DUR);
    const p = dip(lt, 23, 0.5);
    let ch = f.after ? INV_BITS[i] : B_BITS[i];
    if (i === 3 && p.after) ch = NEG_BITS[i];
    const flipping = lt >= FLIP_AT(i) - 0.1 && lt < FLIP_AT(i) + FLIP_DUR + 0.2;
    return { ch, textOpacity: Math.min(f.opacity, i === 3 ? p.opacity : 1), active: flipping || (i === 3 && lt >= 22.9 && lt < 23.7) };
  });

  // Readout: the reading and its signed value; a small step tag (back n / +n); the ghost "like 9999" at -1.
  const back = STEPS.slice(0, c.stepsDone).filter((s) => s.dir < 0).length;
  const fwd = STEPS.slice(0, c.stepsDone).filter((s) => s.dir > 0).length;
  const forwardPhase = lt >= FWD0 - 0.3 && lt < KEY[1];
  const stepTag = forwardPhase ? (fwd > 0 ? `+${fwd} step${fwd > 1 ? "s" : ""}` : "+0") : back > 0 && lt < 20 ? `${back} step${back > 1 ? "s" : ""} back` : "";
  const ghost = c.value === MASK && lt < BACK[0] ? "like 9999" : "";

  return {
    lt,
    tach: Math.max(0, sweep + engine * idleRpm(lt)),
    speed: channel("rolling", lt) * reverseSpeed(lt),
    lights: [0, 1, 2, 3].map((k) => (k === 3 ? Math.max(ignition(k), reverse) : ignition(k))),
    pool: channel("pool", lt),
    drums,
    // Callout mirrors the drums' settled digits.
    reading: drums.map((p) => (((Math.round(p) % 10) + 10) % 10).toString()).join(""),
    warn: channel("warn", lt),
    phone: channel("phone", lt),
    stretch: channel("stretch", lt),
    table: channel("table", lt),
    // Binary counter: drop-in height (1 above .. 0 landed .. -1 sunk), drum slot positions, pinions, wrap flash.
    counter: channel("counter", lt),
    bpos: c.pos,
    pins: c.pin,
    turning: c.turning,
    pinOn: c.pinOn,
    flash: c.flash,
    value: c.value,
    valueBits: bits(c.value),
    valueText: minus(signed(c.value)),
    stepTag,
    ghost,
    inKey,
    rowIn: channel("rowIn", lt),
    shortcut,
    plus1,
    link: channel("link", lt),
    problem: channel("problem", lt),
    problemText: `${A_VAL} − ${B_VAL} = ${A_VAL} + (${minus(-B_VAL)})`,
    path: channel("path", lt),
    pathText: `${bits(0)} − ${B_VAL} = ${NEG_BITS},  + ${A_VAL} = ${bits(RESULT)}`,
  };
}
