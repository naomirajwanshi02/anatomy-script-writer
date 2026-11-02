// Short-circuit power as two linked taps: still sample (chip-design episode 18), two frozen panels.
// Time unit: seconds of video (3 s entrance + loop time). LOOP = 4 s of one frozen frame, so it starts and ends in
// the same state. Timeline: empty (no lever moves, arrivals or folds after the entrance).
// Graph time unit: seconds of input edge (the readout's own axis; a 0.5 s sharp edge and a 5 s slow edge).
// Every other value is computed below from the handle position, VDD and the two thresholds.
export const LOOP = 4;

export const BRAND = "ROLLIN";

// ---------- Panel 1: water ----------
// The one input: handle position 0..1 (0 = fill tap fully open, drain shut; 1 = the reverse). Frozen at the middle mark.
export const HANDLE = 0.5;
// Linked taps: the fill tap opens as the handle goes toward 0, the drain tap as it goes toward 1.
export const FILL_OPEN = 1 - HANDLE;
export const DRAIN_OPEN = HANDLE;
// Both pipes the same width: with both taps half open, one stream runs straight through the tank.
export const PIPE_W = 3;
// Flow through the rig (fill and drain equal while both are open), relative: drives the stream.
export const FLOW = Math.min(FILL_OPEN, DRAIN_OPEN) > 0 ? 1 : 0;
// Frozen tank level (fraction of the glass): about 40 %.
export const LEVEL = 0.4;
// Cups counted by the meter so far (two drums).
export const CUPS = 4;
export const CUP_DIGITS = String(CUPS).padStart(2, "0");
// Meter needle angle (0..1 of its sweep), follows the flow.
export const NEEDLE = 0.15 + 0.45 * FLOW;

// ---------- Panel 2: circuit ----------
export const VDD = 1; // V
export const VTN = 0.3; // NMOS turns on above this
export const VTP = 0.7; // PMOS stays on below this (VDD - |Vtp|)
export const VIN = 0.5; // frozen input, lever part way up
export const VOUT = 0.5; // output node at the key state (tank half full)
export const LAMP = VOUT ** 2; // lamp brightness ~ power in the lamp: dim
// Both devices conduct inside the band.
export const P_ON = VIN < VTP;
export const N_ON = VIN > VTN;

// Short-circuit current through both devices (mA): I = k * min((Vin - Vtn)^2, (Vtp - Vin)^2) inside the band.
const K_MA = 25; // mA / V^2, so the peak (Vin = 0.5) is 1 mA
export const current = (v: number) => (v > VTN && v < VTP ? K_MA * Math.min((v - VTN) ** 2, (VTP - v) ** 2) : 0);
export const I_PEAK = current((VTN + VTP) / 2);

// Graph input: a sharp rise (0.5 s) then, after a hold, a slow fall (5 s, ten times as long).
export const SHARP = 0.5;
export const SLOW = 5;
const T_SHARP = 0.6; // start of the sharp rise
const T_SLOW = 2.4; // start of the slow fall
export const T_END = T_SLOW + SLOW + 0.6;
export const vin = (t: number) => {
  if (t < T_SHARP) return 0;
  if (t < T_SHARP + SHARP) return (t - T_SHARP) / SHARP;
  if (t < T_SLOW) return 1;
  if (t < T_SLOW + SLOW) return 1 - (t - T_SLOW) / SLOW;
  return 0;
};
export const EDGES = { sharp: [T_SHARP, T_SHARP + SHARP], slow: [T_SLOW, T_SLOW + SLOW] } as const;

// Sampled curves (dense enough for the narrow pulse).
const N = 3400;
export const samples = Array.from({ length: N + 1 }, (_, i) => {
  const t = (T_END * i) / N;
  const v = vin(t);
  return { t, v, i: current(v) };
});

// Energy lost per edge: E = VDD * integral of I dt (trapezoid rule), in mJ when I is in mA.
function energy(t0: number, t1: number) {
  let e = 0;
  for (let k = 1; k < samples.length; k++) {
    const a = samples[k - 1];
    const b = samples[k];
    if (b.t <= t0 || a.t >= t1) continue;
    e += ((a.i + b.i) / 2) * (b.t - a.t) * VDD;
  }
  return e;
}
export const E_SHARP = energy(EDGES.sharp[0], EDGES.sharp[1]);
export const E_SLOW = energy(EDGES.slow[0], EDGES.slow[1]);
// Counter values relative to the sharp edge: 1 and 10 (the ratio of the edge times).
export const E_UNITS = { sharp: Math.round(E_SHARP / E_SHARP), slow: Math.round(E_SLOW / E_SHARP) };
