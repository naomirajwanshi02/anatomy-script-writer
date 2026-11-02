// K-map egg carton, voice-synced timing for chip-design episode 08 (ElevenLabs take of 2026-10-29 03:52, last word
// ends at about 63.1 s). Time unit: seconds of video (video t = audio t). The figure's own timeline is not changed: a
// piecewise-linear map turns voice time into the figure's video time, so each beat lands on its spoken line. Flat
// stretches hold a state while the voice explains. Word times: builds/notes/episodes/chip-design/08.words.json.
// LOOP = 63.1 s (3 s entrance + 63.1 = 66.1 s video, room for the end card after the last word).
export const LOOP = 63.1;

// [voice video s, figure video s] (figure video s = 3 + figure loop s).
const ANCHORS: [number, number][] = [
  [0, 0],
  [3, 3], // entrance unchanged; "suppose I want to take these four eggs. there are three ways. which is best? let's watch."
  [5.4, 6.95], // "one at a time. four picks.": the band picks each egg, quickly
  [7.2, 10.6],
  [7.3, 10.9], // "two side by side. two picks."
  [9.2, 13.4],
  [9.4, 13.55], // "or all four together. one pick."
  [11.6, 15.4],
  [12.6, 16.1], // "but I can only pick up eggs together if they sit side by side": the diagonal try slips off
  [14.6, 17.7],
  [15.3, 18.2], // "the biggest pick wins": the band round all four again
  [20.1, 20.25], // "episode eight of chip design. now,"
  [21.6, 21.7], // "the same with bits": the lid lifts away, the circuit rises behind the carton
  [24.4, 21.95], // "the carton becomes a map of three inputs. A picks the row"
  [24.9, 22.5],
  [25.6, 23.0], // "B and C pick the column"
  [26.1, 23.5],
  [29.4, 24.95], // "an egg means the output is one"
  [30.3, 25.9], // "one egg at a time": one band per egg
  [36.6, 27.95], // "each needs a gate that checks all three inputs. four gates, plus one to join them. five gates."
  [37.4, 28.9], // "two side by side": one band per pair, 3 gates
  [41.6, 29.35], // "they differ in just one input. both hold eggs, so that input doesn't matter"
  [42.4, 29.95], // "drop it": BC becomes B
  [44.3, 31.0], // "three smaller gates. the columns are ordered so neighbours always differ by one bit"
  [47.8, 33.4], // "like Gray code": the column labels pulse in order
  [48.5, 33.95], // "all four in one pick"
  [49.0, 34.6],
  [50.1, 35.2], // "A and C drop out": A fades, the gates block sinks, B's wire runs to the lamp
  [50.6, 35.7],
  [52.9, 36.9], // "only B is left. one wire, no gate.": A and C flip, the lamp holds; B drops and comes back
  [55.0, 41.9],
  [55.2, 42.2], // "that is a Karnaugh map: pick the biggest group of neighbouring ones": the three stages replay
  [57.8, 45.5],
  [58.6, 46.9], // fold back to the carton
  [58.9, 47.6], // "what if my band"
  [59.3, 48.4], // "could stretch over an empty cup too?": the band pulls out over the empty cup
  [60.4, 49.4],
  [60.9, 50.2], // "sometimes": a pretend egg fades into the cup
  [61.3, 50.6],
  [61.5, 50.8], // "it can": the band settles over it
  [64.5, 53.3], // "that's episode nine": then the band springs off
  [66.1, 54.98], // start frame under the end card
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
