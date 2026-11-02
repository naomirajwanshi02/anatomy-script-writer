// Series badge, banner-plane version. Time unit: seconds from the start of the overlay (no board entrance).
// A taildragger tows a banner in from the left along the top of the frame, settles at the top-right edge,
// bobs there while the banner waves, then flies off to the right.

// capture.mjs renders 3 s (its usual entrance) + LOOP, so LOOP = 2.6 gives the 5.6 s badge.
export const LOOP = 2.6;
export const DURATION = 5.6;

export const T = {
  arrive: [0, 1.8], // fly in from off-frame left, easing out
  leave: [4.6, 5.6], // fly off to the right, easing in
} as const;

export const PROP_HZ = 9; // propeller turns per second (drawn as a flicking blade)
export const BOB = { y: 7, rot: 1.4, hz: 0.55 }; // px, degrees, cycles per second
export const WAVE = { amp: 7, k: 0.018, speed: 5.5 }; // banner ripple: px, rad per px, rad per second

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 3;
const easeIn = (u: number) => clamp01(u) ** 2.4;

// Horizontal offset of the whole plane + banner from its parked spot (0 = parked at the top-right edge).
export function flyOffset(t: number, offLeft: number, offRight: number): number {
  if (t < T.leave[0]) return -offLeft * (1 - easeOut((t - T.arrive[0]) / (T.arrive[1] - T.arrive[0])));
  return offRight * easeIn((t - T.leave[0]) / (T.leave[1] - T.leave[0]));
}
