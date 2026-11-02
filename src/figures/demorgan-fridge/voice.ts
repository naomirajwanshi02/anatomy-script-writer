// De Morgan fridge, voice-synced timing for chip-design episode 07 (ElevenLabs take of 2026-10-29 03:35, last word
// ends at about 68.7 s). Time unit: seconds of video (video t = audio t). The figure's own timeline is not changed: a
// piecewise-linear map turns voice time into the figure's video time, so each beat lands on its spoken line. Flat
// stretches hold a state while the voice explains. Word times: builds/notes/episodes/chip-design/07.words.json (the
// transcript drops most of "That's called De Morgan's rule: flip the inputs, swap and for or, and flip the output",
// 50.2-55.6 s; its three phrases are placed in that gap).
// LOOP = 68.7 s (3 s entrance + 68.7 = 71.7 s video, room for the end card after the last word).
export const LOOP = 68.7;

// [voice video s, figure video s] (figure video s = 3 + figure loop s).
const ANCHORS: [number, number][] = [
  [0, 0],
  [3, 3], // entrance unchanged; "I asked two people... different answers. both right. how? let's watch. this fridge has two doors."
  [8.8, 4.5], // "open the left": left door opens, light on
  [9.4, 5.1],
  [10.5, 6.6], // "open the right": left shuts as the right opens, light stays on
  [11.1, 7.2],
  [12.5, 8.6], // "shut both": light off
  [13.1, 9.2],
  [15.4, 11.0], // "the first said, it's on when either door is open": left opens again
  [16.0, 11.6],
  [16.6, 12.6], // right opens, left shuts
  [17.2, 13.2],
  [19.5, 14.6], // "the second said, it's off only when both are shut": right shuts, light off
  [20.1, 15.2],
  [25.4, 16.95], // "different words, same light. episode seven of chip design."
  [27.3, 18.6], // "now, the same with binary": fold to the levers, the table comes in
  [30.9, 19.95], // "each door becomes a bit: one means shut"
  [31.6, 20.5], // "zero means open": lever L flicks down
  [33.0, 21.5], // "a gate is a tiny circuit": L back up
  [38.3, 23.0], // "that turns bits into the light. the first rule, left open or right open: flip each input"
  [38.9, 23.5], // row 1's input bubbles
  [39.6, 24.0], // "then an or gate": the OR shape and its lamp
  [40.2, 24.5],
  [42.5, 26.45], // "the second, not both shut: an and gate"
  [43.1, 27.0],
  [43.6, 27.8], // "with its output flipped": the output bubble and its lamp
  [44.2, 28.3],
  [46.0, 29.95], // "that's called NAND"
  [50.3, 36.1], // "try all four door states. both give the same light every time": 01, 10, 00, back to 11
  [51.7, 36.95], // "that's called De Morgan's rule"
  [52.7, 38.15], // "flip the inputs": input bubbles pulse
  [52.9, 38.2],
  [54.0, 39.3], // "swap and for or": gate shapes pulse
  [54.8, 39.4],
  [55.8, 40.55], // "and flip the output": output bubble pulses
  [57.8, 40.95], // "but why do we care about this?"
  [59.3, 42.3], // "NAND is one of the smallest, fastest gates on a chip": the NAND pulses
  [60.9, 42.95], // "with this rule"
  [62.0, 44.0], // "any design can be built from NANDs alone": row 1 turns into a NAND
  [64.0, 45.45], // "and big circuit design needs thousands of these": shrink into the NAND grid
  [66.2, 47.5],
  [66.6, 48.95], // "how do we use fewer?": fold back to the fridge
  [68.5, 51.0],
  [71.7, 51.48], // "that's episode eight": start frame under the end card
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
