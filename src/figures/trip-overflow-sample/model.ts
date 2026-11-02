// Trip-overflow still sample. Time unit: seconds of video (3 s entrance + loop time). No timeline: one frozen scene,
// fully visible from loop start, so the loop trivially ends in its start state.
export const LOOP = 4;

// Trip drums frozen mid-roll: each drum half-way from FROM to TO (upper half shows the bottom of FROM, lower half the
// top of TO). The callout LCD shows the same rollover.
export const FROM = "99999";
export const TO = "00000";
export const CALLOUT = `${FROM} → ${TO}`;
// Speedometer needle reading (km/h on a 0-200 dial).
export const SPEED = 60;
// Tachometer needle (x1000 rpm on a 0-8 dial).
export const RPM = 2.4;
// In-story brand badge on the binnacle's lower lip.
export const BRAND = "ROLLIN";
