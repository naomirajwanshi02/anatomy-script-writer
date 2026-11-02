// BCD clock still sample. Time unit: seconds of video (3 s entrance + loop time); LOOP = 4 s of one frozen frame,
// so it starts and ends in the same state. The timeline is empty (no lever moves, arrivals or folds after the
// entrance); the lit segments and callout digits are computed from the time shown.
export const LOOP = 4;

export const BRAND = "ROLLIN";

// Time on the clock: 09:59, one decimal digit per display cell.
export const TIME = "0959";
export const DIGITS = TIME.split("").map(Number);

// Seven-segment map: segments a b c d e f g lit per decimal digit.
const SEG: Record<number, string> = {
  0: "abcdef",
  1: "bc",
  2: "abdeg",
  3: "abcdg",
  4: "bcfg",
  5: "acdfg",
  6: "acdefg",
  7: "abc",
  8: "abcdefg",
  9: "abcdfg",
};
export const SEGMENTS = ["a", "b", "c", "d", "e", "f", "g"] as const;
export const litSegments = (d: number) => SEGMENTS.map((s) => SEG[d].includes(s));

// Frozen frame: colon lit, alarm on, PM off-hour indicator lit.
export const COLON_ON = true;
export const ALARM_ON = true;
export const PM_ON = true;
