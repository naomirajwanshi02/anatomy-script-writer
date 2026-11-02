// Hex grouping, voice-synced timing for chip-design episode 01 (ElevenLabs take of 2026-10-27 20:09, new hook
// "Your phone number has gaps for a reason", 66.7 s, last word ends at 65.8 s). Time unit: seconds of video
// (video t = audio t). The figure's own timeline is not changed: a piecewise-linear map turns voice time into the
// figure's video time, so each beat lands on its spoken line. Flat stretches hold a state while the voice explains.
// Word times: builds/notes/episodes/chip-design/01.words.json.
// LOOP = 65 s (3 s entrance + 65 = 68 s video, room for the end card after the last word).
export const LOOP = 65;

// [voice video s, figure video s] (figure video s = 3 + figure loop s).
const ANCHORS: [number, number][] = [
  [0, 0],
  [3, 3], // entrance unchanged; "your phone number has gaps for a reason"
  [7.55, 4.6], // "programmers use the same trick... let's see why": screen on, waits for the first digit
  [10.45, 8.85], // "nine eight one two three four five six seven zero": one key per spoken digit
  [10.75, 9.0], // "hard to remember": red dashed box round the tight run
  [11.9, 10.35], // box holds
  [12.1, 10.5], // "now:" box gone
  [15.2, 12.0], // "nine eight one... two three four... five six seven zero": the number splits as it is said
  [15.6, 12.4], // rust bars in the gaps
  [22.4, 14.9], // "easier. same number, just grouped. the gaps make it easy to read. episode one": grouped hold
  [23.4, 15.4], // "now,": the phone screen collapses
  [25.4, 18.0], // "we group ones and zeros": the phone sinks, digits fly down as tiles, flip to bits
  [35.7, 20.0], // "a chip is made of billions of tiny switches... here's a byte: one zero one one, zero zero one zero"
  [37.0, 21.99], // "group them in fours": the gap opens between the groups; the table slides in
  [40.4, 21.99], // "four bits make sixteen patterns, one symbol each": hold (sweep not started)
  [41.6, 23.25], // "digits stop at nine": cells 0 to 9 light in turn
  [43.7, 24.0], // "so A is ten, up to F, fifteen": cells A to F
  [46.6, 24.0], // "each bit is worth double the one on its right": hold
  [47.0, 24.4], // "eight, four, two, one": weights over the left group
  [51.95, 26.5], // "one zero one one is eight plus two plus one... eleven": weights hold
  [52.6, 27.1], // "that's B": B lands
  [53.4, 27.12], // hold on B
  [53.8, 27.4], // "zero zero one zero"
  [54.0, 29.0], // nothing moves in between
  [54.6, 29.6], // "is two": 2 lands
  [61.5, 33.9], // "so the byte is B two. that is hex... just for humans to read": key hold B2
  [63.2, 35.5], // "but a chip can only add": fold back to the phone
  [68.0, 36.0], // "so how does it subtract? that's episode two": start frame under the end card
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
