// Switching threshold as two taps, chip-design episode 16 ("What sets the switching threshold of a CMOS inverter").
// Time unit: video seconds = voice seconds (video t = audio t; the voice starts with the 3 s entrance).
// Word times: builds/notes/episodes/chip-design/16.words.json (198 words, 0-64.7 s). LOOP = 64 s (3 s entrance + 64 =
// 67 s video). The fold back ends at 61.54 s; the start frame (handle on its middle mark, narrow fill pipe, level about
// 5 %) is settled by about 63.5 s and holds to 67 s, so the loop ends in its start state.
// Water (0-29.44): handle = input, fill tap = PMOS, drain tap = NMOS, glass tank level = output. Fold at "Now," (29.44-
// 30.94): high tank -> VDD rail, basin -> GND rail, taps -> valves, link rods -> gate wires, water -> rust current.
// Circuit (30.94-60.04). Fold back at "That high tank" (60.04-61.54).
// Timeline: handle moves, the PMOS (fill pipe) width, the two folds and highlight beats. Everything else is computed:
// square-law currents (VDD 1 V, Vt 0.3 V, mu_n / mu_p = 2.5, lambda 0.05) give the steady output Vss(Vin, Wp) where
// fill = drain; the level moves toward it as an RC curve, dV/dt = (Vss - V) / tau, tau = TAU0 / (Gp + Gn), G = k * Vov
// (the device that conducts sets the speed, CLAUDE.md section 6). Water flows, straps, readouts and graph all read
// these numbers. Checks: Wp = Wn: VM 0.455 V, Vout(0.5) = 0.05; Wp = 2.5 Wn: VM 0.500 V, Vout(0.5) = 0.50.
export const LOOP = 64;
export const END = 3 + LOOP;
export const BRAND = "ROLLIN";

// ---------- Device model ----------

const VDD = 1;
const VT = 0.3;
const MU = 2.5; // electrons / holes
const LAMBDA = 0.05;
const WN = 1;
export const WP_WIDE = 2.5;

// Drain current of a square-law device: overdrive vov = Vgs - Vt, vds >= 0, strength k.
function ids(k: number, vov: number, vds: number) {
  if (vov <= 0 || vds <= 0) return 0;
  const sat = vds >= vov;
  return (sat ? 0.5 * k * vov * vov : k * (vov * vds - 0.5 * vds * vds)) * (1 + LAMBDA * vds);
}
export const iP = (vin: number, vout: number, wp: number) => ids(wp, VDD - vin - VT, VDD - vout); // fill (VDD -> tank)
export const iN = (vin: number, vout: number) => ids(MU * WN, vin - VT, vout); // drain (tank -> GND)

// Steady output where fill = drain (bisection; fill - drain falls as vout rises).
export function vss(vin: number, wp: number) {
  const pOn = VDD - vin - VT > 0;
  const nOn = vin - VT > 0;
  if (pOn && !nOn) return VDD;
  if (nOn && !pOn) return 0;
  if (!pOn && !nOn) return 0.5;
  let lo = 0;
  let hi = VDD;
  for (let i = 0; i < 50; i++) {
    const m = (lo + hi) / 2;
    if (iP(vin, m, wp) - iN(vin, m) > 0) lo = m;
    else hi = m;
  }
  return (lo + hi) / 2;
}
// Switching threshold: the input where Vss = VDD / 2.
export function vm(wp: number) {
  let lo = VT;
  let hi = VDD - VT;
  for (let i = 0; i < 50; i++) {
    const m = (lo + hi) / 2;
    if (vss(m, wp) > 0.5) lo = m;
    else hi = m;
  }
  return (lo + hi) / 2;
}
const TAU0 = 0.3; // s
const gOf = (vin: number, wp: number) => Math.max(0, VDD - vin - VT) * wp + Math.max(0, vin - VT) * MU * WN;
// Full-scale current for the flow visuals: one device fully on at the narrow width.
export const I_REF = 0.5 * 1 * (VDD - VT) ** 2;

// ---------- Timeline (video seconds, word starts from the transcript) ----------

export const W = {
  halfway0: 0.92, empty: 3.14, halfway1: 4.74, watch: 6.68, handle: 7.7, oneOpens: 9.34, pours: 11.8, high: 12.46,
  bottom: 13.2, halfway2: 14.62, both: 15.48, level: 16.56, equals: 17.72, out: 18.12, topPipe: 18.94, drainWins: 20.5,
  widen: 21.74, half: 23.2, full: 23.52, weak: 24.3, wider: 25.26, now: 29.44, handleC: 31.3, output: 33.22,
  pmos: 34.8, nmos: 36.2, halfwayC: 37, bothOn: 37.78, sitsLow: 38.62, pmos2: 40.08, narrower: 40.92, charges: 42.06,
  holes: 42.9, electrons: 44.36, so: 45.1, empty2: 46.22, reachesHalf: 47.86, make: 48.54, pmos3: 48.94,
  wider2: 50.26, and: 50.68, flipsHalf: 51.7, that: 52.16, switching: 53.08, room: 55.88, equalSpeed: 56.84,
  pmos4: 58.42, thatHigh: 60.04, highTank: 60.16, supply: 61, halfAs: 62.58,
};
const FOLD = [W.now, W.now + 1.5];
const FOLD_BACK = [W.thatHigh, W.thatHigh + 1.5];
export const KEY_TIME = 54.5; // key state: lever 0.50, output 0.50, wide PMOS

const ease = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
export const ramp = (t: number, a: number, d: number) => ease((t - a) / d);
const inside = (t: number, a: number, b: number) => t >= a && t < b;
// A single bump 0 -> 1 -> 0 over [a, a + d].
const bump = (t: number, a: number, d: number) => (t < a || t > a + d ? 0 : Math.sin((Math.PI * (t - a)) / d));

// Handle / lever: [time, target (0 = fill end, 0.5 = middle, 1 = drain end), duration].
const H_MOVES: [number, number, number][] = [
  [W.handle, 1, 0.4], // "The handle": to the drain end, the tank empties
  [W.oneOpens, 0, 0.5], // "as one opens": to the fill end
  [W.bottom + 0.1, 1, 0.35], // "the bottom one drains"
  [W.halfway2, 0.5, 0.5], // "Halfway, both taps run"
  [W.now + 0.1, 0, 0.4], // fold: lever to 0 (output full)
  [W.halfwayC, 0.5, 0.5], // "Halfway, both are on"
  [W.electrons, 0, 0.15], // on "electrons": snap to 0, the output refills
  [45.6, 0.47, 0.65], // "So the output ..." sweep up: flips at 0.455 on "empty"
  [46.25, 0.5, 1.5], // creep to the half mark on "half"
  [W.make, 0, 0.3], // "Make the PMOS": back to 0
  [W.and, 0.45, 0.7], // "and it flips at half": second sweep
  [51.4, 0.5, 0.3], // reaches 0.5 on "half"
  [W.equalSpeed + 0.1, 1, 0.15], // "equal speed": step to 1 (drains)
  [W.equalSpeed + 1.1, 0, 0.15], // then to 0 (fills in the same time)
  [W.thatHigh + 0.3, 0.5, 0.6], // fold back: handle to its middle mark
];
function handleAt(t: number) {
  let h = 0.5;
  for (const [a, v, d] of H_MOVES) {
    if (t < a) break;
    h += (v - h) * ease((t - a) / d);
  }
  // "Let's watch": one small wiggle at the middle mark.
  return h + 0.06 * Math.sin((Math.PI * 2 * (t - W.watch)) / 0.5) * (inside(t, W.watch, W.watch + 0.5) ? 1 : 0);
}
// PMOS / fill pipe width: 1 -> 2.5 on "Widen it", back to 1 in the fold, 2.5 again on "Make the PMOS ... wider", 1 in the fold back.
function wpAt(t: number) {
  let w = 1;
  w += (WP_WIDE - 1) * ramp(t, W.widen, 0.8);
  w -= (WP_WIDE - 1) * ramp(t, FOLD[0], 1.4);
  w += (WP_WIDE - 1) * ramp(t, W.pmos3, W.wider2 + 0.3 - W.pmos3);
  w -= (WP_WIDE - 1) * ramp(t, FOLD_BACK[0], 1.4);
  return w;
}
const morphAt = (t: number) => (t < FOLD_BACK[0] ? ramp(t, FOLD[0], FOLD[1] - FOLD[0]) : 1 - ramp(t, FOLD_BACK[0], FOLD_BACK[1] - FOLD_BACK[0]));

// ---------- Simulation ----------

const DT = 0.01;
function simulate() {
  const n = Math.ceil(END / DT) + 2;
  const level: number[] = [];
  let v = vss(0.5, 1); // start state: steady at the middle mark
  for (let i = 0; i < n; i++) {
    const t = i * DT;
    const h = handleAt(t);
    const wp = wpAt(t);
    const tau = TAU0 / Math.max(0.02, gOf(h, wp));
    v += (vss(h, wp) - v) * (1 - Math.exp(-DT / tau));
    level.push(v);
  }
  return level;
}
const LEVEL = simulate();
const levelAt = (t: number) => LEVEL[Math.min(LEVEL.length - 1, Math.max(0, Math.round(t / DT)))];

export const vtOf = (t: number) => (t < END ? t : 3 + ((t - 3) % LOOP));

// Graph curves: the steady transfer curve Vss(Vin) from 0 up to the swept input.
export const SWEEPS = [
  { from: 45.6, wp: 1 },
  { from: W.and, wp: WP_WIDE },
];

export function stateAt(time: number) {
  const t = vtOf(time);
  const h = handleAt(t);
  const wp = wpAt(t);
  const v = levelAt(t);
  const m = morphAt(t);
  const fill = iP(h, v, wp) / I_REF;
  const drain = iN(h, v) / I_REF;
  const circuit = m > 0.5;

  // Swept curves: 0 before the sweep starts, then up to the largest input reached since.
  const sweeps = SWEEPS.map((s, i) => {
    const end = i === 0 ? W.make : FOLD_BACK[0];
    if (t < s.from || t >= FOLD_BACK[1]) return { reach: -1, wp: s.wp, active: false };
    let reach = 0;
    for (let u = s.from; u <= Math.min(t, end); u += 0.05) reach = Math.max(reach, Math.min(0.5, handleAt(u)));
    return { reach, wp: s.wp, active: t < end };
  });

  return {
    t,
    h,
    wp,
    level: v,
    m,
    fill, // flow into the tank (relative)
    drain, // flow out of the tank (relative)
    pOn: VDD - h - VT > 0,
    nOn: h - VT > 0,
    supplyLevel: 0.75 - 0.06 * Math.min(1, fill), // the high tank dips while it pours
    // Water beats.
    levelPulse: Math.max(bump(t, W.empty - 0.1, 0.6), bump(t, W.drainWins, 0.6), bump(t, W.half, 0.6)),
    handlePulse: Math.max(bump(t, W.halfway1, 0.6), bump(t, W.handleC, 0.6)),
    arrows: t >= W.level && t < W.topPipe ? ramp(t, W.level, W.equals + 0.3 - W.level) : 0,
    pipeGlow: Math.max(bump(t, W.topPipe, 0.7), bump(t, W.wider, 0.6)),
    tapPulse: bump(t, W.weak, 0.6),
    // Fold back beats.
    tankGlow: bump(t, W.highTank + 0.2, 1.3),
    vddGhost: bump(t, W.supply, 1.0),
    halfGhost: inside(t, W.halfAs, W.halfAs + 1.5) ? Math.min(ramp(t, W.halfAs, 0.25), 1 - ramp(t, W.halfAs + 1.2, 0.3)) : 0,
    // Circuit beats.
    readVin: circuit && t >= W.handleC ? ramp(t, W.handleC, 0.3) : 0,
    readVout: circuit && t >= W.output ? ramp(t, W.output, 0.3) : 0,
    tankPulse: bump(t, W.output, 0.6),
    pFlash: Math.max(bump(t, W.pmos, 0.6), bump(t, W.pmos2, 0.7), bump(t, W.pmos4, 0.7)),
    nFlash: bump(t, W.nmos, 0.6),
    ghostPipe: inside(t, W.narrower, W.narrower + 0.6) ? 1 : 0,
    carriers: inside(t, W.charges, W.so) ? Math.min(ramp(t, W.charges, 0.3), 1 - ramp(t, W.so - 0.3, 0.3)) : 0,
    holesMove: t >= W.holes,
    electronsMove: t >= W.electrons,
    wideLabel: circuit && t >= W.pmos3 ? ramp(t, W.pmos3, 0.4) : 0,
    vmTick: circuit && t >= W.switching ? ramp(t, W.switching, 0.5) : 0,
    brackets: circuit && t >= W.room ? ramp(t, W.room, 0.6) : 0,
    sweeps,
  };
}
export type State = ReturnType<typeof stateAt>;
export const fmt = (v: number) => Math.max(0, v).toFixed(2);
