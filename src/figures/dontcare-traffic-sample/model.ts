// Traffic light still sample. Time unit: seconds of video (3 s entrance + loop time); LOOP = 4 s of one frozen
// frame, so it starts and ends in the same state. The timeline is empty (no lever moves, arrivals or folds after the
// entrance); which lamp glows is computed from the signal phase below.
export const LOOP = 4;

export const BRAND = "ROLLIN";

// Signal phase of the frozen frame, and the lamps top to bottom.
export type Phase = "red" | "yellow" | "green";
export const PHASE: Phase = "green";
export const LAMPS: Phase[] = ["red", "yellow", "green"];
export const isLit = (lamp: Phase) => lamp === PHASE;
