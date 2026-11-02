// Series badge, hand-drawn version. Time unit: seconds from the start of the overlay (no entrance).
// The pen draws the board, the parts, the title, flips the lever, lights the lamp and writes the
// episode number, holds, then erases. Lines boil at BOIL_FPS with a small whole-frame shake.

// capture.mjs renders 3 s (its usual entrance) + LOOP, so LOOP = 1.5 gives the 4.5 s badge.
export const LOOP = 1.5;
export const DURATION = 4.5;

export const BOIL_FPS = 10;
export const WOBBLE = 2.2; // px of line jitter (1080-wide frame)
export const SHAKE = 1.6; // px of whole-badge shake

// Draw-on windows [start, end] in seconds.
export const T = {
  board: [0, 0.9],
  parts: [0.55, 1.25],
  wires: [1.0, 1.35],
  title: [1.2, 1.85],
  lever: [1.85, 2.15],
  lamp: [2.05, 2.5],
  flow: [2.1, 2.45],
  number: [2.4, 3.1],
  erase: [4.0, 4.5],
} as const;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const ease = (u: number) => 1 - (1 - clamp01(u)) ** 2;

// Draw-on progress for a window, then the shared erase at the end.
export function progress(t: number, [a, b]: readonly [number, number]): number {
  const on = ease((t - a) / (b - a));
  const off = clamp01((t - T.erase[0]) / (T.erase[1] - T.erase[0]));
  return Math.max(0, on - off);
}
