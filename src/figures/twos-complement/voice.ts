// Two's complement, voice-synced timing for chip-design episode 02 (ElevenLabs take of 2026-10-27 20:55, 66.1 s, last
// word ends at about 65 s). Time unit: seconds of video (video t = audio t). The figure's own timeline is not changed:
// a piecewise-linear map turns voice time into the figure's video time, so each beat lands on its spoken line. Flat
// stretches hold a state while the voice explains. Word times: builds/notes/episodes/chip-design/02.words.json.
// LOOP = 65 s (3 s entrance + 65 = 68 s video, room for the end card after the last word).
export const LOOP = 65;

// [voice video s, figure video s] (figure video s = 3 + figure loop s).
const ANCHORS: [number, number][] = [
  [0, 0],
  [3, 3], // entrance unchanged; "what if your car's odometer goes back past zero?"
  [10.6, 5.9], // "an odometer is your car's distance counter... this one reads three. going back": cluster on, reverse lamp
  [11.8, 6.6], // "two"
  [12.0, 7.4],
  [12.4, 8.0], // "one"
  [12.9, 8.8],
  [13.3, 9.4], // "zero"
  [14.3, 10.4], // "one more step"
  [15.0, 11.4], // "nine nine nine nine": all four drums roll to 9999
  [21.4, 13.5], // "past zero, it wraps around. episode two of chip design": 9999 held with the warning box
  [22.3, 14.0], // "now,": drums on to 0000
  [24.6, 17.0], // "the same with bits. a four-bit counter wraps the same way": fold, the binary counter lands
  [27.0, 17.2], // "one step back from zero"
  [27.9, 17.95], // "it shows one one one one": every drum rolls back
  [32.9, 19.95], // "so that means minus one, like nine nine nine nine": hold
  [34.6, 21.55], // "three steps back from zero, it shows one one zero one": two more steps back
  [37.5, 22.95], // "that's minus three": hold
  [38.4, 23.7], // "chips find it with a shortcut": the 0011 row drops in
  [39.0, 23.8],
  [40.3, 25.75], // "flip every bit of three": tiles flip one by one to 1100
  [40.4, 26.0],
  [40.9, 26.5], // "then add one": 1101
  [41.5, 27.0], // link to the counter, which reads 1101
  [41.7, 28.6],
  [42.3, 29.2], // "now, five minus three": the row sinks
  [42.6, 29.8], // 5 - 3 = 5 + (-3) line
  [47.6, 31.4], // "the chip only has an adder, so it adds five to minus three. adding five is like rolling forward"
  [50.0, 33.4], // "five steps. watch it roll past zero": 1110, 1111, 0000 with the wrap flash
  [53.0, 35.4], // "and stop at zero zero one zero": 0001, 0010
  [56.0, 41.0], // "two. that is two's complement": key hold 0010 = 2
  [57.0, 41.5], // "minus three is three steps back from zero": path strip
  [61.5, 43.9], // "so adding it subtracts. one adder does both jobs": hold
  [63.6, 46.4], // "but what if the answer is too big for its bits?": fold back to the odometer
  [68.0, 47.1], // "that's episode three": start frame under the end card
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
