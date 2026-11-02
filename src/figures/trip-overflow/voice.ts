// Arithmetic overflow, voice-synced timing for chip-design episode 03 (ElevenLabs take of 2026-10-28 17:47, last word
// ends at about 66.1 s). Time unit: seconds of video (video t = audio t). The figure's own timeline is not changed:
// a piecewise-linear map turns voice time into the figure's video time, so each beat lands on its spoken line. Flat
// stretches hold a state while the voice explains. Word times: builds/notes/episodes/chip-design/03.words.json.
// LOOP = 66 s (3 s entrance + 66 = 69 s video, room for the end card after the last word).
export const LOOP = 66;

// [voice video s, figure video s] (figure video s = 3 + figure loop s).
const ANCHORS: [number, number][] = [
  [0, 0],
  [3, 3], // entrance unchanged; "one more kilometre, and the trip meter shows zero. why zero? let's watch."
  [5.7, 7.0], // "this trip meter shows"
  [6.2, 7.5], // "nine nine nine nine nine": right drum to 9
  [9.1, 9.95], // "one more kilometre"
  [10.0, 11.0], // "zero zero zero zero zero": every drum rolls to 0, the ghost sixth drum shows the lost 1
  [12.5, 11.5], // "one hundred thousand needs"
  [13.6, 12.8], // "a sixth wheel": the ghost drum drops away
  [19.2, 13.95], // "too big, so it wrapped round. episode three of chip design": 00000 held
  [21.2, 16.5], // "now, the same with bits": fold, the drums land as row A
  [25.6, 16.55], // "chips wrap too... minus fifty-six": hold
  [28.0, 16.6], // "the leftmost bit is the sign": SIGN under column 0
  [28.6, 17.0],
  [31.2, 17.5], // "positives stop at one hundred twenty-seven": top row counts up
  [32.4, 19.5],
  [33.3, 20.95],
  [33.4, 21.0], // "add one hundred twice": row B drops in
  [34.9, 22.0], // "carrying like in school": columns add right to left
  [36.9, 25.0], // "the last carry lands in the sign bit"
  [38.6, 25.3],
  [38.9, 25.55], // "and it turns to one"
  [39.5, 25.95], // "it reads minus fifty-six": red dashed outline on the sign tile
  [39.9, 26.3],
  [47.2, 27.95], // "wrapped round... too big for its bits": key hold
  [47.8, 28.1], // "the chip watches two carries": carry out shows its 0
  [49.3, 28.5], // "into the sign bit and out": XOR gate and wires appear, the carry-in wire carries its 1
  [50.0, 29.05],
  [56.0, 29.3], // "if they differ... an XOR gate, which outputs one when its inputs differ"
  [56.6, 29.65], // "lights": gate output to the lamp
  [57.1, 30.0], // "the overflow lamp": V bulb lights
  [57.6, 30.45],
  [62.0, 34.9], // "that is overflow detection: carry in differs from carry out": key hold
  [64.4, 37.0], // "but why does a clock keep every digit in its own box?": fold back to the trip meter
  [69.0, 37.95], // "that's episode four": start frame under the end card
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
