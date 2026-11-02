// NAND gate model. Time unit: seconds of video (3 s entrance + loop time); one 45.5 s pass timed to the
// episode 4 voiceover, ending on 00 like it starts. Timeline = the input row from each loop time on.
import { ENTRY, loopTime } from "../../iso/entrance";

export const ROWS: [boolean, boolean][] = [
  [false, false],
  [false, true],
  [true, false],
  [true, true],
];
export const LOOP = 45.5;

// [loop time, row]; comments give video times and the line they sit under.
const TIMELINE: [number, number][] = [
  [0, 0], // 3 s board lands on 00, lamp on
  [6.6, 1], // 9.6 s "Zero one, it's on"
  [8.15, 2], // 11.15 s "One zero, still on"
  [10.1, 3], // 13.1 s "Only when BOTH inputs are one": lamp dark, the key state
  [16.4, 0], // 19.4 s "Tie both inputs together": 00 -> lamp on
  [18.4, 3], // 21.4 s "...NAND becomes NOT": 11 -> lamp off
  [20.2, 0], // 23.2 s the table steps on under the AND, OR and interview lines
  [22.6, 1],
  [25, 2],
  [27.4, 3],
  [29.8, 0],
  [32.2, 1],
  [34.6, 2],
  [37, 3],
  [39.5, 0], // 42.5 s back to 00 for the teaser and the loop
];

// Reduced motion: hold the key row (11, the only one with Y = 0).
export const KEY_TIME = ENTRY.loopFrom + 11;

export const nand = (a: boolean, b: boolean) => !(a && b);

export const rowAt = (t: number) => {
  const lt = loopTime(t, LOOP);
  let row = 0;
  for (const [from, r] of TIMELINE) if (lt >= from) row = r;
  return row;
};
