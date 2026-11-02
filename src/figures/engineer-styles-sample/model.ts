// Engineer styles tester (not a reel figure). Time unit: seconds of video (3 s entrance + loop time); LOOP = 4 s of
// one frozen frame, so it starts and ends in the same state. The timeline is empty (no lever moves, arrivals or
// folds after the entrance); each monitor's bit wall is computed from the seeded bits below.
export const LOOP = 4;

// The four designs compared, one per grid cell (left to right, top to bottom).
export const STYLES = ["A", "B", "C", "D"] as const;
export type StyleKey = (typeof STYLES)[number];

// Monitor wall: 7 rows of 32 bits (grouped in bytes), seeded so every render is the same.
let seed = 7;
const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const randomBits = (n: number) => Array.from({ length: n }, () => (rand() < 0.5 ? "0" : "1")).join("");
export const WALL_ROWS = 7;
export const WALL = Array.from({ length: WALL_ROWS }, () => randomBits(32).match(/.{8}/g)!.join(" "));
