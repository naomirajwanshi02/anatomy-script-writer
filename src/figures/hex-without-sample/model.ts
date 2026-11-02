// Hex "without it" still sample. Time unit: seconds of video (3 s entrance + loop time); LOOP = 4 s of one frozen
// frame, so it starts and ends in the same state. The timeline is empty (no lever moves, arrivals or folds after the
// entrance); the bit wall and the thought-bubble jumble are computed from the bits below.
export const LOOP = 4;

export const BRAND = "ROLLIN";

// The byte from the circuit fold, first on the wall.
export const BITS = "10110010";

// Monitor wall: 7 rows of 32 bits (grouped in bytes), seeded so every render is the same.
let seed = 7;
const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const randomBits = (n: number) => Array.from({ length: n }, () => (rand() < 0.5 ? "0" : "1")).join("");
export const WALL_ROWS = 7;
export const WALL = Array.from({ length: WALL_ROWS }, (_, r) => {
  const bits = r === 0 ? BITS + randomBits(24) : randomBits(32);
  return bits.match(/.{8}/g)!.join(" ");
});

// Thought bubble: the engineer's tangled reading of the wall (fractions of the bubble radii; size in ry).
// strike = digits crossed out; misread = the one active mistake (rust).
export const JUMBLE = [
  { text: WALL[0].slice(0, 14), x: -0.8, y: -0.28, rot: -5, size: 0.3, strike: [3], misread: 5 },
  { text: WALL[1].slice(9, 21), x: -0.72, y: 0.14, rot: 4, size: 0.27, strike: [1, 6], misread: -1 },
  { text: WALL[2].slice(2, 13), x: -0.78, y: 0.56, rot: -3, size: 0.25, strike: [8], misread: -1 },
];
