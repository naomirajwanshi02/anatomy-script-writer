// Lowering supply voltage as carrying buckets up a building: still sample (chip-design episode 17, start frame).
// Time unit: seconds of video (3 s entrance + loop time). LOOP = 4 s of one frozen frame, so it starts and ends in
// the same state. Timeline: empty (no lever moves, arrivals or folds after the entrance).
// Every other value is computed below from the building height in floors.
export const LOOP = 4;

export const BRAND = "ROLLIN";

// The one input: building height in floors (= supply voltage). Frozen at four floors.
export const FLOORS = 4;

// One bucket fills one floor of tank, so the tank needs as many buckets as the building has floors.
export const BUCKETS = FLOORS;

// Start frame: no bucket carried yet, so the tank is empty and no floor has been climbed.
export const CARRIED = 0;
export const TANK_FLOORS = CARRIED; // floors of tank filled
// Floors climbed = buckets carried x floors per trip.
export const CLIMBED = CARRIED * FLOORS;
// Buckets still standing at the foot of the stairs.
export const WAITING = BUCKETS - CARRIED;
