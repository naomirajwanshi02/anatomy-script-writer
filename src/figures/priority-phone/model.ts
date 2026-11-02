// Priority phone, chip-design episode 14 ("What is a priority encoder").
// Time unit: video seconds = voice seconds (video t = audio t; the voice starts with the 3 s entrance, as in episode 13).
// Word times: builds/notes/episodes/chip-design/14.words.json (200 words, 0-65.9 s, audio 66.9 s). LOOP = 65 s
// (3 s entrance + 65 = 68 s video); the fold back ends at 60.8 s, so the start frame (music tile on, music playing)
// holds from 60.8 s to 68 s and the loop ends in its start state.
// Analogy (0-24.3): four sound tiles ranked call, alarm, music, ping beside a phone on a speaker dock; the speaker
// plays the highest tile that is on. Fold (24.3-25.8): the tiles become four levers (wires 3..0), the dock and phone
// sink, an encoder block with output lamps "2" and "1" rises. Circuit (25.8-59.3). Fold back (59.3-60.8).
// The timeline holds only input changes, folds and highlight beats; the speaker, screen, wire flows and lamps are
// computed from the inputs: Y1 = D3 + D2, Y0 = D3 + D2'·D1, valid = D3 + D2 + D1 + D0 (gate delay 0.3 s in the circuit).
export const LOOP = 65;
export const END = 3 + LOOP;
export const BRAND = "ROLLIN";

// Wire r: 3 call, 2 alarm, 1 music, 0 ping (top to bottom).
export type Sound = "call" | "alarm" | "music" | "ping";
export const SOUNDS: Sound[] = ["ping", "music", "alarm", "call"]; // index = wire number
export const ROWS = [3, 2, 1, 0];

// ---------- Timeline (video seconds, word starts from the transcript) ----------

export const W = {
  call0: 0.58, music0: 2.66, call1: 4.48, watch: 5.82, ranks: 7.1, rCall: 8.54, rAlarm: 8.8, rMusic: 9.6, rPing: 10.62,
  plays: 11.56, aCall: 12.62, takes: 13.46, hangUp: 14.56, returns: 15.28, still: 16.36, lower: 17.3, highest: 18.4,
  gets: 19.9, now: 24.3, eachSound: 26.1, ranked: 27.26, theCall: 28.38, zero: 29.18, wireHolds: 29.92, oneWhile: 31.3,
  itsSound: 31.94, speaker: 32.88, winning: 35.0, musicIs: 36.38, zeroOne: 38.52, cCall: 39.6, wireThree: 40.7,
  oneOne: 43.1, musicWire: 44.0, ignored: 45.54, hang2: 46.38, again: 47.46, ping: 48.52, soDoes: 50.58, silence: 50.96,
  third: 52.04, valid: 53.02, anyWire: 53.88, thats: 54.88, high2: 56.88, wins: 57.74, notFirst: 58.34, here: 59.32,
};
export const FOLD = [W.now, W.now + 1.5];
export const FOLD_BACK = [W.here, W.here + 1.5];
export const KEY_TIME = 44.5; // key state: call and music both on, output 1 1

// Input changes: [time, wire, value]. Lever moves take MOVE s; the bit counts once the lever reaches its end.
export const MOVE = 0.25;
const EVENTS: [number, number, 0 | 1][] = [
  [W.aCall, 3, 1],
  [W.hangUp, 3, 0],
  [40.8, 3, 1],
  [W.hang2 + 0.05, 3, 0],
  [W.ping, 1, 0],
  [48.85, 0, 1],
  [W.soDoes, 0, 0],
  [W.valid, 0, 1],
  [W.anyWire, 0, 0],
  [W.thats + 0.1, 1, 1],
  [W.high2, 3, 1],
  [W.here - 0.1, 3, 0],
];
const START: number[] = [0, 1, 0, 0];
const GATE = 0.3;

const ease = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
export const ramp = (t: number, a: number, d: number) => ease((t - a) / d);
const inside = (t: number, a: number, b: number) => t >= a && t < b;
const pulse = (t: number, a: number, b: number, r = 0.2) => Math.min(ramp(t, a, r), 1 - ramp(t, b - r, r));

// Lever position (0 = down/off .. 1 = up/on) and bit (once at its end).
export function leverUp(r: number, t: number) {
  let p = START[r];
  for (const [at, w, v] of EVENTS) {
    if (w !== r) continue;
    if (t < at) break;
    p = p + (v - p) * ease((t - at) / MOVE);
  }
  return p;
}
const bitAt = (r: number, t: number) => (leverUp(r, t) > 0.95 ? 1 : 0);
export const inputs = (t: number) => [0, 1, 2, 3].map((r) => bitAt(r, t));
export function encode(d: number[]) {
  const y1 = d[3] | d[2];
  const y0 = d[3] | ((1 - d[2]) & d[1]);
  const v = d[3] | d[2] | d[1] | d[0];
  return { y1, y0, v, win: v ? 2 * y1 + y0 : -1 };
}

export const vtOf = (t: number) => (t < END ? t : 3 + ((t - 3) % LOOP));

export function stateAt(time: number) {
  const t = vtOf(time);
  const d = inputs(t);
  const up = [0, 1, 2, 3].map((r) => leverUp(r, t));
  const now = encode(d);
  const late = encode(inputs(t - GATE));

  // Scene: 0 = phone, 1 = circuit.
  const fold = t < FOLD_BACK[0] ? ramp(t, FOLD[0], FOLD[1] - FOLD[0]) : 1 - ramp(t, FOLD_BACK[0], FOLD_BACK[1] - FOLD_BACK[0]);
  const circuit = t >= FOLD[0] && t < FOLD_BACK[1];

  // ----- Analogy -----
  // Tile highlight (rust ring): glints on "call", the rank roll call, the scan from the top on "highest".
  const rankAt = [W.rPing, W.rMusic, W.rAlarm, W.rCall];
  const tileHl = [0, 1, 2, 3].map(
    (r) =>
      (r === 3 && (inside(t, W.call0, W.call0 + 0.5) || inside(t, W.call1, W.call1 + 0.5) || inside(t, W.lower, W.lower + 0.4))) ||
      (r === 1 && (inside(t, W.music0, W.music0 + 0.6) || inside(t, W.still, W.still + 0.6) || inside(t, W.lower + 0.4, W.lower + 0.8))) ||
      inside(t, W.ranks + 0.2 * (3 - r), W.ranks + 0.2 * (3 - r) + 0.3) ||
      inside(t, rankAt[r], rankAt[r] + 0.45) ||
      (r >= 1 && inside(t, W.highest + 0.25 * (3 - r), r === 1 ? W.gets + 0.2 : W.highest + 0.25 * (3 - r) + 0.25)),
  );
  // Music arcs breathe with the beat; ring arcs pulse fast while the call has the speaker.
  const beat = 0.6 + 0.4 * Math.sin(2 * Math.PI * 1.6 * t);
  const boost = Math.max(pulse(t, W.watch, W.watch + 0.8), pulse(t, W.plays, W.plays + 0.8), pulse(t, W.gets + 0.5, 23.5, 0.3));
  const analogy = {
    tileOn: d.map((b) => b === 1),
    tileHl,
    first: pulse(t, W.music0, W.music0 + 1.5),
    music: now.win === 1 ? Math.min(1, beat + 0.4 * boost) : 0,
    ring: now.win === 3 ? 0.55 + 0.45 * Math.abs(Math.sin(2 * Math.PI * 2.4 * t)) : 0,
    boost,
    callScreen: now.win === 3 ? 1 : 0,
    // Screen opens once in the entrance (a bright line opens vertically into the screen).
    screen: ramp(t, 1.5, 0.5),
    // Scan dot from the music tile into the speaker.
    beam: inside(t, W.gets, W.gets + 0.6) ? (t - W.gets) / 0.6 : -1,
  };

  // ----- Circuit -----
  const wireDraw = ROWS.map((r, i) => (t >= FOLD_BACK[0] ? 1 - ramp(t, FOLD_BACK[0], 0.6) : ramp(t, W.eachSound + 0.3 * i, 0.35)));
  const numIn = ROWS.map((r, i) => (t >= FOLD_BACK[0] ? 1 - ramp(t, FOLD_BACK[0], 0.5) : ramp(t, W.ranked + 0.3 * i, 0.3)));
  const numHl = [0, 1, 2, 3].map((r) => (r === 3 && inside(t, W.theCall, W.theCall + 0.6)) || (r === 0 && inside(t, W.zero, W.zero + 0.6)));
  const iconHl = [0, 1, 2, 3].map(
    (r) =>
      numHl[r] ||
      (r === 1 && (inside(t, W.itsSound, W.itsSound + 0.6) || inside(t, W.musicIs, W.musicIs + 0.7))) ||
      (r === 3 && inside(t, W.cCall, W.cCall + 0.7)),
  );
  const leverHl = [0, 1, 2, 3].map((r) => (r === 1 && inside(t, W.musicIs, W.musicIs + 0.7)) || (r === 3 && inside(t, W.cCall, W.cCall + 0.7)));
  const wireHl = [0, 1, 2, 3].map(
    (r) => inside(t, W.wireHolds, W.wireHolds + 0.6) || (r === 1 && inside(t, W.musicWire, W.ignored + 0.4)) || (r === 3 && inside(t, W.wins, W.wins + 0.6)),
  );
  const flowOn = circuit && t >= W.oneWhile;
  const lampsIn = t >= FOLD_BACK[0] ? 1 - ramp(t, FOLD_BACK[0], 0.6) : ramp(t, W.speaker, 0.45);
  const validIn = t >= FOLD_BACK[0] ? 1 - ramp(t, FOLD_BACK[0], 0.6) : ramp(t, W.third, 0.45);
  const blink = inside(t, W.winning, W.winning + 0.35);
  const lampHl = [inside(t, W.zeroOne, W.zeroOne + 0.6) || inside(t, W.oneOne, W.oneOne + 0.6), inside(t, W.zeroOne, W.zeroOne + 0.6) || inside(t, W.oneOne, W.oneOne + 0.6)];
  const circ = {
    wall: fold,
    up,
    wireDraw,
    numIn,
    numHl,
    iconHl,
    leverHl,
    wireHl,
    flow: d.map((b) => flowOn && b === 1),
    outFlow: [flowOn && late.y1 === 1, flowOn && late.y0 === 1, flowOn && late.v === 1],
    lampsIn,
    validIn,
    // Lamp brightness: "2" (Y1), "1" (Y0), valid; a short blink on "the winning".
    lamp: [blink ? 0 : late.y1, blink ? 0 : late.y0, late.v],
    lampGlint: blink ? 0.5 : 0,
    lampHl,
    first: pulse(t, W.notFirst, W.notFirst + 1),
  };

  return { t, fold, d, analogy, circ };
}
export type State = ReturnType<typeof stateAt>;

// The encoder truth: the highest wire on wins, whatever the lower wires hold.
for (let n = 0; n < 16; n++) {
  const d = [0, 1, 2, 3].map((r) => (n >> r) & 1);
  const top = d.lastIndexOf(1);
  const e = encode(d);
  if (e.win !== top || e.v !== (n ? 1 : 0)) throw new Error(`encode ${n}`);
}
