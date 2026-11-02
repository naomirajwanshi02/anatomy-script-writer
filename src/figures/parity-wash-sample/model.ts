// Parity wash still sample. Time unit: seconds of video (3 s entrance + loop time); LOOP = 4 s of one frozen frame,
// so it starts and ends in the same state. The timeline is empty (no lever moves, arrivals or folds after the
// entrance); the sock count, parity and callout lines are computed from the counts below.
export const LOOP = 4;

export const BRAND = "ROLLIN";

// Socks went in as pairs (even count, spare added if needed); the machine ate one.
export const SOCKS_IN = 8;
export const SOCKS_OUT = 7;
export const SLOTS = SOCKS_IN; // one tray slot per sock that went in
export const ODD = SOCKS_OUT % 2 === 1;

// Callout lines on the LCD.
export const LINE1 = `${SOCKS_IN} in → ${SOCKS_OUT} out`;
export const LINE2 = ODD ? "odd ✗" : "even ✓";

// Frozen frame: spin lamp and check lamp both lit.
export const SPIN_ON = true;
export const CHECK_ON = ODD;

// Cuff band tone per sock on the tray (sepia tones only), pairs share a tone.
export const CUFF_TONES = ["c0", "c0", "c1", "c1", "c2", "c2", "c3"] as const;
