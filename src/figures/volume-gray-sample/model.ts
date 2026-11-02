// Volume knob (Gray code) still sample. Time unit: seconds of video (3 s entrance + loop time); LOOP = 4 s of one
// frozen frame, so it starts and ends in the same state. The timeline is empty (no lever moves, arrivals or folds
// after the entrance); the display reading, level bar and pointer angle are computed from the frozen state below.
export const LOOP = 4;

export const BRAND = "ROLLIN";

// The knob is turned from 3 to 4. In plain binary all three bits flip (011 -> 100); mid-turn the sensor catches
// the new top bit before the old low bits clear and reads 111.
export const FROM = 3;
export const TO = 4;
export const STEPS = 8; // scale 0..7, three sensor bits
const bits = (n: number) => n.toString(2).padStart(3, "0");
const glitch = (a: number, b: number) => parseInt(bits(a).split("").map((c, i) => (c === "1" || bits(b)[i] === "1" ? "1" : "0")).join(""), 2);

// Frozen frame: the pointer sits halfway between FROM and TO, the sensor reads the glitch value.
export const POINTER = (FROM + TO) / 2;
export const READ = glitch(FROM, TO); // 011 | 100 = 111 = 7
export const LCD_TEXT = `VOL ${READ}`;
// Level bar: one cell per step above 0, lit up to the reading (maxed at 7).
export const BAR = Array.from({ length: STEPS - 1 }, (_, i) => i < READ);
