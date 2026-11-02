// Voltage tower, voice-synced timing for chip-design episode 17 (ElevenLabs take of 2026-11-01 07:10, last word ends at
// 66.88 s). Time unit: seconds of video (video t = audio t). The figure's own timeline is not changed: a
// piecewise-linear map turns voice time into the figure's video time, so each beat lands on its spoken line. Word
// times: builds/notes/episodes/chip-design/17.words.json. The hook preview plays inside the entrance, unchanged.
// LOOP = 64.9 s (3 s entrance + 64.9 = 67.9 s video: the last word plus 1 s; the end card takes the last 4 s).
export const LOOP = 64.9;

// [voice video s, figure video s] (figure video s = 3 + figure loop s; the figure's LOOP is 70.7).
const ANCHORS: [number, number][] = [
  [0, 0],
  [3, 3], // entrance unchanged; "so why does a lower tower save so much pumping energy?"
  [4.0, 4.7], // "lower tower": the tower pulses
  [5.42, 6.0], // "pumping": the pump shudders
  [6.52, 7.6], // "a pump fills the tower"
  [8.2, 9.6], // "top tap": the top tap opens
  [9.76, 11.6], // "tower's level": the tank settles level with the tower
  [10.82, 13.6], // "bottom tap": top tap shut first, then the bottom tap drains
  [12.64, 15.2], // "every clock tick"
  [13.66, 16.3], // "fills"
  [14.4, 17.0], // "and empties"
  [15.22, 17.9], // "halve the tower": the stand drops to mark 2
  [16.2, 19.0], // "the tank fills half as deep"
  [17.96, 21.0], // "each litre": the pump runs to mark 2
  [18.68, 21.7], // "pumped half as high": height bracket
  [20.12, 23.2], // "half the water": 2 columns
  [21.0, 24.2], // "half the height": 2 rows
  [21.82, 25.2], // "a quarter": the 2 x 2 block fills rust
  [24.2, 27.4], // "saves energy twice": columns, then rows pulse
  [28.52, 31.8], // "episode seventeen of chip design. now, the same with bits": fold starts
  [30.6, 33.8], // fold done
  [31.06, 34.1], // "the pump and tower": ghost melts into VDD
  [32.32, 35.8], // "chip's supply"
  [33.5, 36.4], // "height becomes voltage": 1.0 V tag
  [34.76, 37.7], // "the tank"
  [36.32, 38.7], // "output wire"
  [37.12, 40.0], // "holding charge"
  [38.62, 41.7], // "the taps"
  [39.92, 42.7], // "two switches"
  [40.84, 44.0], // "each tick": lever to 0
  [41.64, 45.0], // "top switch": NMOS off, then PMOS on
  [42.14, 45.7], // "fills the wire"
  [43.42, 46.7], // "output one"
  [44.16, 47.7], // "bottom switch"
  [44.72, 48.3], // "drains it"
  [45.62, 49.0], // "zero"
  [46.24, 49.6], // "each fill": one fill at 1.0 V
  [48.18, 50.6], // "charge times voltage": 16 squares, column by column
  [49.22, 52.0], // "like water times height"
  [50.74, 53.3], // "halve the voltage": 1.0 V -> 0.5 V
  [51.64, 54.6], // "half the charge"
  [52.62, 55.6], // "lifted half as high"
  [54.2, 57.0], // "that's ONE quarter the energy": key state
  [55.94, 60.1], // "charge and voltage both shrink"
  [57.9, 62.1], // "lower supply": 0.5 V tag
  [58.78, 63.1], // "so much power": three fast ticks
  [60.08, 64.7], // "but the switches never flip instantly": fold back starts
  [61.7, 66.3], // fold back done
  [63.02, 66.9], // "both are half open": both taps half open
  [64.6, 69.0], // "where does that charge go?": start frame
  [67.9, 73.7], // "that's episode eighteen": start frame held under the end card
];

export function voiceToFigure(t: number) {
  const end = 3 + LOOP;
  const T = t < end ? t : 3 + ((t - 3) % LOOP);
  for (let i = 1; i < ANCHORS.length; i++) {
    const [a0, f0] = ANCHORS[i - 1];
    const [a1, f1] = ANCHORS[i];
    if (T <= a1) return f0 + ((f1 - f0) * (T - a0)) / (a1 - a0);
  }
  return ANCHORS[ANCHORS.length - 1][1];
}
