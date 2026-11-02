// Parity wash, voice-synced timing for chip-design episode 05 (ElevenLabs take of 2026-10-28 18:18, last word ends at
// about 62.4 s). Time unit: seconds of video (video t = audio t). The figure's own timeline is not changed: a
// piecewise-linear map turns voice time into the figure's video time, so each beat lands on its spoken line. Flat
// stretches hold a state while the voice explains. Word times: builds/notes/episodes/chip-design/05.words.json.
// LOOP = 62.5 s (3 s entrance + 62.5 = 65.5 s video, room for the end card after the last word).
export const LOOP = 62.5;

// [voice video s, figure video s] (figure video s = 3 + figure loop s).
const ANCHORS: [number, number][] = [
  [0, 0],
  [3, 3], // entrance unchanged; "lose one sock in the wash, and you know. how? let's watch."
  [4.3, 3.95],
  [5.7, 5.85], // "seven socks. that's odd": counted and paired, three pairs and one alone
  [7.0, 6.95], // "so we add one spare"
  [7.9, 7.65], // "to make eight": the spare drops in, four pairs
  [9.2, 8.0], // "an even number"
  [9.9, 10.9], // "the machine eats": socks go in, door shuts
  [10.1, 12.6], // "a sock": the drum spins, the spare flashes rust and is gone
  [10.7, 13.9],
  [11.0, 15.2], // "and seven come out"
  [11.9, 17.3],
  [12.3, 18.9], // "odd again": counted, one alone, the empty slot, CHECK
  [12.5, 19.25],
  [19.4, 20.45], // "something is missing. even in, odd out. episode five of chip design": hold
  [20.9, 22.0], // "now, the same with bits": fold, the seven data bits drop in
  [21.7, 23.3], // "bits can flip by mistake": one tile flips and back
  [22.8, 24.4],
  [27.9, 24.95], // "like a lost sock. here are seven bits: one zero one one zero zero zero."
  [28.9, 26.2], // "count the ones. three.": the 1s light and pair off, one alone
  [32.2, 27.95], // "that's odd. so the chip adds one more bit"
  [32.7, 28.45], // "a one": the parity tile drops in
  [33.2, 28.6], // "to make four": counted, four pairs... two pairs, even
  [37.5, 30.35], // "even. that extra bit is the parity bit, like the spare sock. now,"
  [38.6, 30.8], // "noise, a random bump on the wire": the bits travel down their wires
  [40.3, 31.25], // "flips a zero": the spark hits one wire
  [41.3, 31.8], // "into a one": the received row fills
  [41.9, 32.4], // "count again"
  [42.8, 33.8], // "five. odd.": CHECK lamp
  [45.6, 38.9], // "the chip knows something broke": key hold
  [45.7, 39.4], // "but": received row clears
  [46.0, 39.8], // "two flips": sent again, two sparks
  [46.5, 40.5],
  [46.8, 40.8], // "make six"
  [47.5, 42.95], // "even again"
  [48.6, 43.5], // "so it slips through": red dashed round the wrong word
  [49.7, 44.6], // "and parity never says which bit flipped": "?" over every bit
  [51.4, 45.6],
  [52.4, 47.0], // "that is a parity bit"
  [52.7, 47.4], // back to the one-flip check
  [57.6, 50.95], // "one extra bit that keeps the count of ones even. an odd count means an error": hold
  [60.3, 53.45], // "but what if three bits must change at the same moment?": fold back to the machine
  [65.5, 53.48], // "like a volume knob. that's episode six": start frame under the end card
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
