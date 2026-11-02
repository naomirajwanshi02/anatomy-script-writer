// Volume knob / Gray code, voice-synced timing for chip-design episode 06 (ElevenLabs take of 2026-10-29 03:19, last
// word ends at about 65 s). Time unit: seconds of video (video t = audio t). The figure's own timeline is not changed:
// a piecewise-linear map turns voice time into the figure's video time, so each beat lands on its spoken line. Flat
// stretches hold a state while the voice explains. Word times: builds/notes/episodes/chip-design/06.words.json.
// LOOP = 65 s (3 s entrance + 65 = 68 s video, room for the end card after the last word).
export const LOOP = 65;

// [voice video s, figure video s] (figure video s = 3 + figure loop s).
const ANCHORS: [number, number][] = [
  [0, 0],
  [3, 3], // entrance unchanged; "you change the volume from three to four, but it blasts to seven. why seven? let's watch."
  [5.8, 4.95], // "turn the volume from three to four"
  [7.8, 5.6], // "for a split second": the left brush crosses, VOL 7
  [11.4, 6.8], // "the speaker roars at seven"
  [11.8, 7.0], // "then it settles on four"
  [18.3, 8.95], // "for a moment, the knob read the wrong number. episode six of chip design": hold
  [20.3, 11.0], // "now, the same with bits": the amp lifts away, the disc turns back to 3
  [34.3, 14.0], // "inside the knob, three tiny sensors... all three bits must flip. but real sensors never line up"
  [34.9, 14.6], // "if the left one flips first": the left brush crosses
  [37.9, 17.0], // "they read one one one. that's seven." held
  [38.2, 17.2], // "the fix?": the others cross, 100
  [39.0, 18.9],
  [41.5, 20.6], // "number the steps so neighbours differ by only one bit": back to 3, the disc redrawn in Gray
  [44.2, 21.95], // "three becomes zero one zero"
  [44.9, 22.6], // "four becomes one one zero": the Gray turn, one bit
  [48.3, 24.45], // "now one turn flips one bit"
  [49.3, 25.2], // "the other two sensors stay still": back to 3, the left brush now a hair behind
  [49.7, 26.0], // "so if that one is late"
  [50.3, 26.6],
  [53.2, 29.0], // "the knob just shows three a moment longer": 010 held, then 110
  [53.5, 29.2], // "never seven"
  [54.4, 30.4], // "that is Gray code"
  [58.2, 34.45], // "each step changes just one bit": the rows flash in turn
  [60.0, 36.1], // "a fridge door has a sensor too": fold back to the amp
  [68.0, 36.98], // "one bit, open or shut. two doors, one light. when does it turn on? that's episode seven."
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
