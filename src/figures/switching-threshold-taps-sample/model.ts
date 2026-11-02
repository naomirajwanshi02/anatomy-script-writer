// Switching threshold as two taps: still sample (chip-design episode 16, hook state of the analogy).
// Time unit: seconds of video (3 s entrance + loop time). LOOP = 4 s of one frozen frame, so it starts and ends in
// the same state. Timeline: empty (no lever moves, arrivals or folds after the entrance).
// Every other value is computed below from the one handle position and the two pipe widths.
export const LOOP = 4;

export const BRAND = "ROLLIN";

// The one input: handle position 0..1 (0 = fill tap fully open, drain shut; 1 = the reverse). Frozen at the middle mark.
export const HANDLE = 0.5;
// Linked taps: the fill tap opens as the handle goes toward 0, the drain tap as it goes toward 1.
export const FILL_OPEN = 1 - HANDLE;
export const DRAIN_OPEN = HANDLE;

// Pipe widths (board units): the drain pipe is 2.5x the fill pipe.
export const FILL_W = 2;
export const DRAIN_W = 5;

// Steady level (Torricelli): inflow a_f * sqrt(H) = outflow a_d * sqrt(h), pipe area ~ open * width^2, so
// h = H * (a_f / a_d)^2. Supply head H = 2 output-tank heights.
const HEAD = 2;
const ratio = (FILL_OPEN * FILL_W ** 2) / (DRAIN_OPEN * DRAIN_W ** 2);
export const LEVEL = Math.min(1, HEAD * ratio ** 2); // about 0.05 of the output tank

// Water flow through each tap (equal in steady state), relative, drives the stream thickness.
export const FLOW = FILL_OPEN > 0 && DRAIN_OPEN > 0 ? 1 : 0;

// Readouts: Vin = handle position, Vout = output tank level.
export const VIN = HANDLE;
export const VOUT = LEVEL;
export const fmt = (v: number) => v.toFixed(2);
