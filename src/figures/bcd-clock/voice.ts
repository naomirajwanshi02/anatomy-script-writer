// BCD alarm clock, voice-synced timing for chip-design episode 04 (ElevenLabs take of 2026-10-28 18:02, last word ends
// at about 69.9 s). Time unit: seconds of video (video t = audio t). The figure's own timeline is not changed: a
// piecewise-linear map turns voice time into the figure's video time, so each beat lands on its spoken line. Flat
// stretches hold a state while the voice explains. Word times: builds/notes/episodes/chip-design/04.words.json.
// LOOP = 70 s (3 s entrance + 70 = 73 s video, room for the end card after the last word).
export const LOOP = 70;

// [voice video s, figure video s] (figure video s = 3 + figure loop s).
const ANCHORS: [number, number][] = [
  [0, 0],
  [3, 3], // entrance unchanged; "your alarm clock never shows seven, three, A. why not?"
  [3.8, 3.9], // "let's watch the clock": display line opens
  [4.5, 4.6],
  [5.7, 5.95], // "this clock shows seven twenty-nine"
  [5.9, 6.05],
  [8.0, 8.5], // "one minute later"
  [8.15, 8.65], // "seven thirty": the two changed digits flash, the bell rings
  [17.9, 13.95], // "each window shows one digit... decimal. one window per digit. episode four of chip design"
  [20.2, 16.5], // "now, the same with bits": fold, the digits land as four boxes of bits
  [25.8, 16.6], // "chips only store ones and zeros... a box of four bits. four, because"
  [26.2, 16.9], // "three bits": the 7's box shows 111 in three tiles, red dashed outline
  [27.0, 17.95], // "only count to seven"
  [27.6, 18.6], // the fourth tile drops in
  [27.9, 18.9],
  [28.0, 19.55], // "seven is zero one one one": boxes light one by one
  [28.4, 20.55],
  [30.2, 20.6],
  [30.6, 21.55], // "three is zero zero one one"
  [34.3, 21.6], // "so seven thirty is zero, seven, three"
  [34.7, 22.55], // "zero"
  [38.9, 23.6], // "that is B C D, binary-coded decimal. why not plain binary?"
  [39.4, 24.0],
  [40.4, 24.8], // "the minutes, thirty": minute boxes sink, the 5-tile row and the gear block rise
  [41.1, 25.5],
  [43.8, 25.95], // "are one one one one zero"
  [46.9, 29.6], // "to show them, the chip must divide by ten": three clunks, tens 1 2 3, then 3 r 0
  [48.3, 30.95], // "that needs an extra circuit. and time."
  [49.4, 31.6], // "with B C D": gear block drops away, the minute boxes return
  [50.0, 32.2],
  [50.6, 32.65], // "each box goes straight to its own window": windows light 0 7 3 0
  [53.6, 36.9], // "no dividing at all. the cost?": key hold
  [57.3, 37.0], // "four bits make sixteen patterns. digits use ten."
  [58.8, 38.5], // "the other six, A to F, are wasted": codes 1010-1111 dim with a red dashed outline
  [59.3, 38.9],
  [66.0, 40.85], // "that's why your clock never shows A. one box per digit... clocks and calculators use B C D"
  [68.6, 43.5], // "but what if one of these bits flips by mistake?": fold back to the clock
  [73.0, 43.95], // "that's episode five": start frame under the end card
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
