// Lowering supply voltage as a water tower: still sample (chip-design episode 17, start frame of the analogy).
// Time unit: seconds of video (3 s entrance + loop time). LOOP = 4 s of one frozen frame, so it starts and ends in
// the same state. Timeline: empty (no lever moves, arrivals or folds after the entrance).
// Every other value is computed below from the tower height and the two tap positions.
export const LOOP = 4;

export const BRAND = "ROLLIN";

// The one input: tower height in marks (1..4) = supply voltage. Frozen at the top mark.
export const TOWER_MARK = 4;
export const MARKS = 4;

// Both taps closed in the start frame: nothing flows, the glass tank stays empty, the pump is idle.
export const TOP_OPEN = 0;
export const BOTTOM_OPEN = 0;
export const TANK_LEVEL = TOP_OPEN > 0 ? TOWER_MARK / MARKS : 0;
export const FLOWING = TOP_OPEN > 0 || BOTTOM_OPEN > 0;

// Clock: one hand, at 12 (no tick counted yet).
export const CLOCK_TICKS = 0;

// Readout: pumping per tick, a 4 x 4 grid (litres across, height up). One square per litre lifted one mark; a tick
// at tower height h moving L litres lights L x h squares. Nothing has moved yet, so no square is lit.
export const LITRES = TANK_LEVEL * MARKS * CLOCK_TICKS;
export const lit = (litre: number, height: number) => litre <= LITRES && height <= (LITRES > 0 ? TOWER_MARK : 0);
