// Short-circuit power as two linked taps, then a real CMOS inverter: chip-design episode 18 ("What is short-circuit
// power in CMOS"), built on the recorded voice (take 04_27_08).
// Time unit: one video second = one voice second (figure time = voice time = video time; the 3 s entrance is
// included). LOOP = 71.5 s, so the video is END = 74.5 s. The fold back (64.4-66.0) returns to the start frame (handle at
// the middle mark, both taps half open, through-stream, needle up, counter 04 at the end), held to 74.5; vtOf maps the
// next frame back to 3 s, which shows the same state, so the loop ends in its start state.
// Timeline (below): handle / lever moves, the slow-motion replay (rewind + rate), meter zeroings, part arrivals (the
// two folds, one part every 0.3 s) and the spoken beats (pulses). Everything else is computed from the handle position
// h = Vin (0..1 V): tap openings (PMOS on while Vin < 0.7, NMOS on while Vin > 0.3), the through-current
// I = k min((Vin - 0.3)^2, (0.7 - Vin)^2), the tank level (fills through the top tap, drains through the bottom, RC-like),
// the needle, the cups (= energy = integral of VDD x I dt, scaled so a 0.5 s edge = 1), the graph pulses and the counter.
// Rules checked here: break-before-make does not hold during a slow edge (NMOS on at 0.3 V before PMOS off at 0.7 V);
// overlap time = 0.4 x edge time; energy ratio for a 5 s vs a 0.5 s edge = 10.0 (OVERLAP, RATIO below).
export const LOOP = 71.5;
export const END = 3 + LOOP;
export const BRAND = "ROLLIN";

import { bump, clamp01, foldClock, handleTrack, inside, inverter, lin, loopClock, ramp, replayClock, simulate, window01, type Move, type TapsState } from "../../iso/taps/model";
import { makeGraph } from "../../iso/taps/graph";

// ---------- Physics ----------
export const DEV = inverter({ vdd: 1, vtn: 0.3, vtp: 0.7, k: 25 }); // 25 mA / V^2: peak (Vin = 0.5) is 1 mA
export const { VDD, VTN, VTP, current, I_PEAK } = DEV;
// Energy of one linear edge of length T (s): VDD x T x mean of I over 0..1 V. One unit = a 0.5 s edge.
export const SHARP = 0.5;
export const SLOW = 5;
export const E_UNIT = VDD * SHARP * DEV.meanI; // mJ (mA x V x s) per sharp edge
export const RATIO = (VDD * SLOW * DEV.meanI) / E_UNIT; // 10.0
export const OVERLAP = (VTP - VTN) / VDD; // fraction of an edge with both on: 0.4 (0.2 s vs 2.0 s)
export const vtOf = loopClock(LOOP);

// ---------- Timeline ----------
// Handle (water) = input lever (circuit): [start, duration, target, linear?]. Edges that are measured are linear.
const MOVES: Move[] = [
  [6.6, 0.7, 0, false], // "Let's watch": to the fill end
  [9.4, 0.9, 1, true], // "As one opens": to the drain end ...
  [10.3, 0.9, 0, true], // ... and back
  [17.5, 0.5, 1, true], // "Flick": fill to drain in 0.5 s
  [20.0, 0.6, 0, false], // reset to the fill end
  [21.0, SLOW, 1, true], // "turn it slowly": 5 s
  // The handle stays at the drain end until the fold: top tap shut, the last of the tank drains slowly.
  [34.6, 0.5, 0, false], // fold: handle -> lever, input 0
  [42.8, SLOW, 1, true], // "As the input rises": 0 -> 1 V in 5 s
  [47.8, 0.6, 0.5, false], // "Halfway": 0.5 V, held
  [52.5, 0.5, 0, false], // lever to 0
  [55.7, SHARP, 1, true], // sharp edge
  [56.6, 0, 0, true], // snaps back (no overlap)
  [57.2, SLOW, 1, true], // slow edge
  [64.9, 0.6, 0.5, false], // fold back: handle to the middle mark
];
const hRaw = handleTrack(MOVES);
// Slow-motion replay: the flick (story 17.5-18.0) replayed over 18.1-19.9, slowest while both taps are open
// (handle 0.3-0.7, story 17.65-17.85, shown over 18.6-19.2), so the brief through-flash reads; cup 01 lands at 19.2.
export const storyOf = replayClock([
  [18.1, 17.5],
  [18.6, 17.65],
  [19.2, 17.85],
  [19.9, 18.0],
]);
export const REPLAY = { from: 18.1, to: 19.9, story: 17.5, storyOf };
export const hAt = (t: number) => hRaw(inside(t, REPLAY.from, REPLAY.to) ? storyOf(t) : t);
// Meter zeroings (the meter's reset knob): [shown 00 from, counts from]. Before the 4.2-11.2 demonstration beats, and
// the 20.0-20.6 reset (knob held while the handle returns, so the reset itself is not counted).
const ZERO: [number, number][] = [
  [6.95, 6.95],
  [11.4, 11.4],
  [20.0, 20.6],
];
// Circuit energy rows: the integral over each edge's own window.
export const EDGE_WIN = { sharp: [55.6, 56.6], slow: [57.1, 62.3] } as const;

// Folds: one part every 0.3 s, each travels 0.6 s.
export const FOLD: [number, number] = [33.7, 35.3];
export const BACK: [number, number] = [64.4, 66.0];
const { morphAt, folds } = foldClock({ fold: FOLD, back: BACK });

// ---------- The one simulation (both halves) ----------
// Tank tau 0.25 (symmetric: half full at the middle mark); the water rig during the slow turn and after it: 1.6, so the
// last of the tank drains slowly (to ~31 s).
const SIM = simulate({ end: END, dev: DEV, hAt, eUnit: E_UNIT, replay: REPLAY, tauAt: (t) => (t >= 21.0 && t < FOLD[0] ? 1.6 : 0.25) });
export const levelAt = SIM.levelAt;
const eAt = SIM.eAt;
// Cups on the meter: start segment anchored so 3 s reads 04; end segment anchored so END reads 04 (= 104, two drums).
export function cupsAt(t: number) {
  if (t < ZERO[0][0]) return 4 + eAt(t) - eAt(3);
  if (t >= BACK[0]) return 104 - (eAt(END) - eAt(t));
  const [, z] = [...ZERO].reverse().find(([a]) => t >= a)!;
  const tt = Math.min(t, FOLD[0]);
  return tt < z ? 0 : Math.round((eAt(tt) - eAt(z)) * 1000) / 1000;
}
export const edgeEnergy = (w: readonly [number, number], t: number) => (t < w[0] ? 0 : eAt(Math.min(t, w[1])) - eAt(w[0]));

// ---------- Graph windows (circuit readout) ----------
export const GRAPH_SPAN = 9.6;
export const GRAPH_WINDOWS: [number, number][] = [
  [42.6, 42.6 + GRAPH_SPAN],
  [55.1, 55.1 + GRAPH_SPAN],
];
export const graphWindow = (t: number) => (inside(t, 42.3, 52.5) ? 0 : inside(t, 52.5, BACK[0] + 0.6) ? 1 : -1);
export const GRAPH = makeGraph(GRAPH_WINDOWS, I_PEAK, hAt, current);

// ---------- State per frame ----------
export function stateAt(time: number): TapsState {
  const t = vtOf(time);
  const h = hAt(t);
  const L = levelAt(t);
  const circuitOn = t >= FOLD[0] && t < BACK[1];
  const P = DEV.pOpen(h);
  const N = DEV.nOpen(h);
  const I = current(h);
  const iN = I / I_PEAK; // 0..1
  const gw = graphWindow(t);
  const sharpActive = inside(t, 55.7, 56.6);
  const sharpBright = bump(t, 62.0, 1.4) + bump(t, 63.5, 0.8);
  const ghostFlick = inside(t, 54.4, 56.6) ? Math.min(ramp(t, 54.4, 0.3), 1 - ramp(t, 56.3, 0.3)) : 0;
  const ghostSlow = window01(t, 58.8, 61.1);
  const tx = GRAPH.tx;
  return {
    t,
    h,
    L,
    m: morphAt(t),
    P,
    N,
    I,
    iN,
    // Streams: the tank's own fill / drain plus a thin through-stream while both taps are open (the through-current).
    fillFlow: Math.max(P * (1 - L), 0.1 * iN),
    drainFlow: Math.max(N * L, 0.1 * iN),
    fold: folds(t),
    cups: cupsAt(t),
    // Replay flash: both taps flash while part open together (computed from the through-current).
    bothFlash: inside(t, REPLAY.from, REPLAY.to) ? clamp01(2 * Math.sqrt(iN)) : 0,
    // Water beats.
    handlePulse: bump(t, 4.2, 0.8),
    rodGlow: window01(t, 8.3, 10.3),
    fillTapPulse: bump(t, 11.8, 0.8),
    tankGlint: bump(t, 12.7, 0.8),
    drainTapPulse: bump(t, 13.8, 0.8),
    meterPulse: bump(t, 15.5, 0.8) + bump(t, 26.0, 0.8),
    slowmo: inside(t, REPLAY.from, REPLAY.to + 0.1) ? Math.min(ramp(t, REPLAY.from, 0.2), 1 - ramp(t, REPLAY.to - 0.1, 0.2)) : 0,
    throughGlow: window01(t, 24.4, 26.0),
    gratePulse: bump(t, 13.8, 0.8) + bump(t, 29.0, 0.8),
    drip: t >= 66.1 && t < 66.8 ? (t - 66.1) / 0.7 : -1,
    // Circuit beats.
    leverPulse: bump(t, 35.6, 0.8),
    outPulse: bump(t, 37.3, 0.8),
    pFlash: bump(t, 39.8, 0.8),
    vddPulse: bump(t, 40.4, 0.8),
    nFlash: bump(t, 41.4, 0.8),
    gndPulse: bump(t, 41.9, 0.8),
    vinRowPulse: bump(t, 35.6, 0.8) + bump(t, 53.3, 0.8),
    labelFlash: {
      vdd: bump(t, FOLD[0] + 0.3, 0.8),
      gnd: bump(t, FOLD[0] + 0.6, 0.8),
      pn: bump(t, FOLD[0] + 0.9, 0.8),
      vin: bump(t, FOLD[0] + 1.2, 0.8),
    },
    // Ghost water handle: the flick at 54.4, the slow turn at 58.8 (following Vin).
    ghost: Math.max(ghostFlick, ghostSlow),
    ghostH: ghostFlick > 0 ? lin(t, 54.9, SHARP) : h,
    // Readout.
    readA: t < BACK[0] ? ramp(t, FOLD[0] + 1.5, 0.6) : 1 - ramp(t, BACK[0], 0.5),
    graph: {
      w: gw,
      iRowA: t < BACK[0] ? ramp(t, 42.6, 0.5) : 1 - ramp(t, BACK[0], 0.5),
      bandLit: circuitOn && h > VTN && h < VTP,
      areas:
        gw === 0
          ? [{ t0: GRAPH_WINDOWS[0][0], t1: GRAPH_WINDOWS[0][1], active: I > 0, pulse: 0 }]
          : [
              { t0: EDGE_WIN.sharp[0], t1: EDGE_WIN.sharp[1], active: sharpActive || sharpBright > 0.15, pulse: bump(t, 63.5, 0.8) },
              { t0: EDGE_WIN.slow[0], t1: EDGE_WIN.slow[1], active: inside(t, 57.2, BACK[0]), pulse: 0 },
            ],
      // Edge labels under the Vin row: "0.5 s" after the sharp edge, "5 s" centred over the slow one.
      edges: [
        { on: gw === 1 && t >= 55.7, x: tx(1, 56.2) + 8 },
        { on: gw === 1 && t >= 57.2, x: (tx(1, 57.2) + tx(1, 62.2)) / 2 + 30 },
      ],
    },
    counter: {
      a: t < BACK[0] ? ramp(t, 52.5, 0.5) : 1 - ramp(t, BACK[0], 0.5),
      rows: [
        { value: edgeEnergy(EDGE_WIN.sharp, t), state: sharpActive || sharpBright > 0.15 ? "on" : t >= 56.2 ? "done" : "off" },
        { value: edgeEnergy(EDGE_WIN.slow, t), state: inside(t, 57.2, BACK[0]) ? "on" : t >= 62.2 ? "done" : "off" },
      ],
    },
  };
}
