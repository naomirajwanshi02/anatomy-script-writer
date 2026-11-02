// Volume knob / Gray code model. Time unit: one sensor skew = 1.2-2.4 s (slow motion): a brush that leads (or lags)
// the others by a tenth of a step is shown crossing its border while the knob creeps through that tenth.
// Video time = 3 s entrance + loop time; LOOP = 34 s, ending at VOL 3 on the binary disc with the amp down, as it
// starts.
// Order: analogy (amp, binary 3 -> 4 blasts to 7, 0-6), fold to the coded disc (6-8), the binary turn again in slow
// motion with the left (b2) brush a hair ahead (111 = 7, 11-16), the disc redrawn in Gray (17), a clean Gray turn
// 3 -> 4 (19), the same turn replayed with that brush late (3 holds longer, then 4, 21.5-27.5), the Gray rows flash
// in turn with each row's one changed bit (27.5-31.5), fold back (31.5-33.5).
// The timeline holds only the disc angle, the brush lead, the folds and the code on the disc; every reading, the volume
// shown, the level bar, the sound arcs, the warning outline and the readout rows are computed from it.
import { ENTRY, loopTime } from "../../iso/entrance";

export const LOOP = 34;
export const BRAND = "ROLLIN";
export const STEPS = 8; // scale 0..7, three sensor bits b2 b1 b0

// Codes: plain binary and reflected Gray code (and its decode).
export const binary = (v: number) => v;
export const gray = (v: number) => v ^ (v >> 1);
export const ungray = (g: number) => {
  let v = g;
  for (let s = g >> 1; s; s >>= 1) v ^= s;
  return v;
};
export const bits3 = (n: number) => n.toString(2).padStart(3, "0");
if (bits3(gray(3)) !== "010" || bits3(gray(4)) !== "110" || bits3(3) !== "011" || bits3(4) !== "100") throw new Error("codes");

// Brush lead (in steps) per bit b2, b1, b0: b2 sits a tenth of a step ahead; in the replay it sits a tenth behind.
export const LEAD = [0.1, 0, 0];
export const LATE = [-0.1, 0, 0];
const REPLAY: [number, number] = [22.2, 27.0];
export const leadAt = (lt: number) => (lt >= REPLAY[0] && lt < REPLAY[1] ? LATE : LEAD);

type Span = [from: number, to: number, value: number, linear?: boolean];

// Timeline (loop seconds): each channel starts at its initial value and moves to value over [from, to].
const CHANNELS: Record<string, { from: number; spans: Span[] }> = {
  // Disc angle in steps (3 = position 3).
  pos: {
    from: 3,
    spans: [
      // Analogy: binary turn 3 -> 4; b2 crosses the 3|4 border at 2.6, b1 and b0 at 3.8.
      [2, 2.6, 3.4],
      [2.6, 3.8, 3.5, true],
      [3.8, 4.0, 4],
      [6.5, 8, 3], // back to 3 at the fold
      // Circuit, binary, slow motion: b2 crosses at 11.6, b1 and b0 at 14.0 (111 = 7 held 2.4 s).
      [11, 11.6, 3.4],
      [11.6, 14.0, 3.5, true],
      [14.0, 14.2, 4],
      [16, 16.8, 3], // back to 3, then the disc is redrawn in Gray
      [19, 19.6, 4], // Gray turn 3 -> 4: only b2 crosses
      [21.5, 22.2, 3], // back to 3 for the replay
      // Replay with b2 late: b1 and b0 do not change; b2 crosses only at 26.0, so 3 holds longer, then 4.
      [23, 23.6, 3.4],
      [23.6, 26.0, 3.6, true],
      [26.0, 26.2, 4],
      [31.5, 32.1, 3], // back to 3 at the fold back
    ],
  },
  fold: { from: 0, spans: [[6, 7.5, 1], [31.6, 33.1, 0]] }, // amp lifts and fades / lowers back
  code: { from: 0, spans: [[17.0, 17.6, 1], [33.2, 33.5, 0]] }, // 0 binary, 1 Gray
};
// The Gray rows flash in turn, one per second, each with its one changed bit.
const FLASH: [number, number] = [27.5, 31.5];

const ease = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));

const channel = (name: string, lt: number) => {
  const { from, spans } = CHANNELS[name];
  let v = from;
  for (const [a, b, value, linear] of spans) {
    if (lt >= b) v = value;
    else if (lt > a) {
      const u = (lt - a) / (b - a);
      return v + (value - v) * (linear ? u : ease(u));
    }
  }
  return v;
};

// Sensor reading at loop time lt: each brush reads its own track at the disc angle plus its lead.
function readingAt(lt: number) {
  const pos = channel("pos", lt);
  const codeMix = channel("code", lt);
  const isGray = codeMix >= 0.5;
  const enc = isGray ? gray : binary;
  const lead = leadAt(lt);
  const read = lead.map((o, k) => (enc(Math.round(pos + o)) >> (2 - k)) & 1);
  const raw = read[0] * 4 + read[1] * 2 + read[2];
  return { pos, codeMix, isGray, enc, lead, read, vol: isGray ? ungray(raw) : raw };
}

// Readout rows per code: binary, the positions the story visits; Gray, a run of neighbours round 3 and 4.
export const ROWS = {
  bin: [3, 7, 4],
  gray: [2, 3, 4, 5],
};

// Sound arc pairs lit for a volume: one faint pair when quiet, two at 4, all three at 7.
const arcsFor = (v: number) => [v >= 4 ? 1 : v >= 1 ? 0.45 : 0, v >= 4 ? 1 : 0, v >= 7 ? 1 : 0];

// Reduced motion: hold the key state (clean Gray VOL 4).
export const KEY_TIME = ENTRY.loopFrom + 20.5;

export function stateAt(t: number) {
  const lt = loopTime(t, LOOP);
  const { pos, codeMix, isGray, enc, lead, read, vol } = readingAt(lt);
  // Glitch: the reading is neither position the knob sits between.
  const glitch = vol !== Math.floor(pos) && vol !== Math.ceil(pos);
  const pulse = 0.8 + 0.2 * Math.sin(2 * Math.PI * 2 * lt);
  const rows = (isGray ? ROWS.gray : ROWS.bin).map((v) => ({ v, bits: bits3(enc(v)) }));
  // Binary rows: 3 always; 7 and 4 once reached in the analogy turn or the slow circuit turn. Gray rows: all.
  const reached = (v: number) => v === 3 || (v === 7 && ((lt >= 2.6 && lt < 6.8) || (lt >= 11.6 && lt < 17))) || (v === 4 && ((lt >= 3.8 && lt < 6.8) || (lt >= 14 && lt < 17)));
  const flashing = lt >= FLASH[0] && lt < FLASH[1];
  const flashRow = flashing ? Math.min(rows.length - 1, Math.floor(lt - FLASH[0])) : -1;
  // Bits that differ: in a flash, from the row's previous neighbour; otherwise, from position 3.
  const changed = (r: { v: number; bits: string }, flash: boolean) => {
    const prev = bits3(enc(flash ? r.v - 1 : 3));
    return r.bits.split("").map((c, k) => (flash || r.v !== 3) && c !== prev[k]);
  };
  return {
    lt,
    pos,
    lead,
    fold: channel("fold", lt),
    codeMix,
    isGray,
    read,
    vol,
    glitch,
    bar: Array.from({ length: STEPS - 1 }, (_, i) => i < vol),
    arcs: arcsFor(vol).map((a) => a * pulse),
    rows: rows.map((r, i) => {
      const flash = i === flashRow;
      const on = flashing ? flash : r.v === vol;
      return {
        ...r,
        shown: isGray || reached(r.v),
        on,
        warn: r.v === 7 && !isGray && glitch,
        dim: r.v === 7 && !isGray && !glitch,
        changed: on ? changed(r, flash) : [false, false, false],
      };
    }),
  };
}
