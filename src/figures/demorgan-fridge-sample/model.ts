// De Morgan fridge still sample. Time unit: seconds of video (3 s entrance + loop time); LOOP = 4 s of one
// frozen frame, so it starts and ends in the same state. The timeline is empty (no lever moves, arrivals or folds
// after the entrance); the lamp state is computed from the frozen door state below.
export const LOOP = 4;

export const BRAND = "ROLLIN";

// Door switches: true = door open. Frozen frame: left door open, right door closed.
export const LEFT_OPEN = true;
export const RIGHT_OPEN = false;

// Inside light: NOT (left closed AND right closed) = left open OR right open (De Morgan).
const leftClosed = !LEFT_OPEN;
const rightClosed = !RIGHT_OPEN;
export const LAMP_ON = !(leftClosed && rightClosed);
export const LAMP = LAMP_ON ? 1 : 0; // --lamp value

// Left door swing angle (degrees) while open.
export const SWING = LEFT_OPEN ? 80 : 0;
