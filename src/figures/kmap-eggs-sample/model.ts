// K-map egg carton still sample. Time unit: seconds of video (3 s entrance + loop time); LOOP = 4 s of one
// frozen frame, so it starts and ends in the same state. The timeline is empty (no lever moves, arrivals or folds
// after the entrance); the eggs and the rust group band are computed from the minterms below.
export const LOOP = 4;

export const BRAND = "ROLLIN";

// 3-variable K-map as a 2x4 carton: rows A = 0, 1; columns BC in Gray order.
export const ROWS = ["0", "1"];
export const COLS = ["00", "01", "11", "10"];

// Minterms that are 1 (cell index = A*4 + BC): 010, 011, 110, 111.
export const ONES = [2, 3, 6, 7];

// Cell (row, col) -> minterm index (col label read as binary BC).
export const minterm = (row: number, col: number) => row * 4 + parseInt(COLS[col], 2);
export const hasEgg = (row: number, col: number) => ONES.includes(minterm(row, col));

// The group band wraps every egg cell (one 2x2 block here): bounds in row/column indices.
const eggCells = ROWS.flatMap((_, r) => COLS.map((_, c) => [r, c] as const)).filter(([r, c]) => hasEgg(r, c));
export const GROUP = {
  r0: Math.min(...eggCells.map(([r]) => r)),
  r1: Math.max(...eggCells.map(([r]) => r)),
  c0: Math.min(...eggCells.map(([, c]) => c)),
  c1: Math.max(...eggCells.map(([, c]) => c)),
};
