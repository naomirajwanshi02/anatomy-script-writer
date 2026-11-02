// Don't-care traffic light, voice-synced timing for chip-design episode 09 (last word ends at 66.92 s). Time unit:
// seconds of video (video t = audio t). The figure's own timeline is not changed: a piecewise-linear map turns voice
// time into the figure's video time, so each beat lands on its spoken line. Flat stretches hold a state while the
// voice explains. Word times: builds/notes/episodes/chip-design/09.words.json.
// LOOP = 67.5 s (3 s entrance + 67.5 = 70.5 s video, room for the end card after the last word).
export const LOOP = 67.5;

// [voice video s, figure video s] (figure video s = 3 + figure loop s).
const ANCHORS: [number, number][] = [
  [0, 0],
  [3, 3], // entrance unchanged; green lit hold ("do you check that red is off?" ... "let's watch")
  [5.44, 5.5], // "red": red lights
  [6.52, 6.3], // "yellow"
  [8.16, 7.1], // "green"; "one lamp at a time" holds green
  [10.66, 8.5], // "red and green never light together": the ghost light appears
  [12.0, 9.6],
  [12.6, 10.2], // the ghost has faded
  [13.2, 10.3], // "only look at green": the real green brightens
  [13.6, 10.7],
  [19.9, 10.95], // hold (episode tag); "now, the same with bits": the fold
  [21.3, 12.45], // the lamps have landed in the tiles
  [25.06, 12.5], // "three lamps, three bits. red, yellow and green." held; "that's eight patterns"
  [26.3, 14.0], // the tiles count through the 8 patterns
  [27.4, 15.0], // "lay them out in a grid": the grid rises; "one little light per box"
  [31.84, 15.3], // "only one means go. green alone."
  [32.04, 15.5], // "tick it": the tick in box 001, the go lamp appears
  [32.6, 15.9],
  [36.0, 16.0], // "takes three gates": readout 3 gates
  [36.4, 16.4],
  [39.0, 17.3], // "like red and green together": box 101 flickers
  [39.6, 17.9],
  [40.5, 18.0], // "mark them X": X marks one by one; "count them as ticks only if it helps"
  [42.0, 19.5],
  [43.7, 20.0], // "draw one loop around four boxes": the loop draws
  [44.9, 20.98],
  [47.5, 21.0], // "one tick, three x's" held; "red and yellow drop out": R and Y fade
  [48.1, 21.6],
  [50.36, 21.8], // "go equals green"; "one wire": readout 0 gates, the G wire lights; "no gate"
  [50.86, 22.3],
  [52.0, 26.0], // "and it's safe ... green alone gives the right answer": the tiles step off, red, yellow, green
  [55.9, 28.4],
  [57.6, 28.5], // "called don't cares": the X marks pulse
  [58.3, 29.2],
  [61.7, 29.35], // key state held
  [63.3, 31.0], // "the light tells drivers": fold back to the traffic light, green lit
  [70.5, 33.0], // start frame held under the end card
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
