// Noise margins on a road, voice-synced timing for chip-design episode 10 (last word ends at 59.74 s). Time unit:
// seconds of video (video t = audio t). The figure's own timeline is not changed: a piecewise-linear map turns voice
// time into the figure's video time, so each beat lands on its spoken word. Word times:
// builds/notes/episodes/chip-design/10.words.json.
// LOOP = 60.5 s (3 s entrance + 60.5 = 63.5 s video; the start frame holds from 55.46 s under the end card).
export const LOOP = 60.5;

// [voice video s, figure video s].
const ANCHORS: [number, number][] = [
  [0, 0],
  [3, 3], // entrance unchanged; "let's watch": the car drives straight
  [3.96, 4.9], // "Drive near the line": the car gives way to the ghost near the line
  [4.4, 5.4],
  [5.0, 6.9], // the gust sweeps in
  [5.6, 7.5], // "gust" / "pushes": it hits the ghost
  [6.75, 7.9], // "over it": the ghost's wheels are over the line
  [7.0, 8.15],
  [7.6, 9.0], // "Drive in the middle": the ghost fades, the car is back in the middle
  [8.3, 10.47], // the same gust sweeps in
  [8.8, 10.95], // "same gust": it hits the car
  [9.6, 11.35], // "no harm": full slide, still in the lane
  [9.9, 11.65],
  [10.6, 12.3], // back in the middle; held through "safety room", "stronger gust", "episode 10"
  [19.32, 22.7], // "Now, the same with bits": the fold
  [21.0, 24.65], // fold done before "A bit"
  [21.18, 24.7], // "A bit": the gates slide in
  [21.96, 26.0], // "voltage": the gauge rises
  [22.64, 26.6], // "wire": empty marker at 0
  [23.64, 27.9], // "next gate": the receiving gate pulses
  [24.74, 29.2], // "above six": the 0.6 line draws
  [25.84, 30.2], // "of a volt" / "as a 1": the 1 band fills
  [26.72, 32.1], // "That's the lane line": lane-line look
  [27.9, 33.2],
  [28.2, 33.5],
  [28.9, 34.7], // "sends": the sending gate pulses, flow starts
  [29.1, 35.0],
  [29.9, 36.0], // "nine tenths": the marker reaches 0.9
  [30.84, 36.6], // "well clear": the gap flashes
  [31.6, 37.3],
  [32.52, 38.6], // "Noise": the neighbour wire appears
  [32.96, 39.25], // "gust": the jitter starts
  [33.96, 39.9], // "Random bumps": the ripples
  [35.9, 42.15], // "pulls": the big bump sets off
  [37.14, 43.45], // "seven tenths": the marker stops at 0.7
  [38.14, 44.4], // "Still above": the gap flashes
  [40.14, 47.0], // "taken as 1": the lamp pulses (key state held 37.14-40.9)
  [41.64, 49.0], // drift back to 0.9; "from nine tenths": the 0.9 tick glows
  [42.58, 49.9], // "down to six tenths": the bracket grows
  [43.5, 50.7],
  [43.82, 51.9], // "safety room": the bracket fills
  [46.68, 55.1], // "noise margin": the bracket pulses
  [47.7, 56.1], // "A zero works the same way, near the bottom": 0 marker, 0.4 line, 0 band, bracket
  [49.8, 59.2],
  [50.18, 59.3], // "That's why digital survives noise ... stay in their lane": both markers jitter
  [53.96, 63.2], // "One gust is fine": fold back to the road
  [55.46, 64.7], // start frame
  [63.5, 72.7], // held to the end
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
for (let i = 1; i < ANCHORS.length; i++)
  if (!(ANCHORS[i][0] > ANCHORS[i - 1][0] && ANCHORS[i][1] >= ANCHORS[i - 1][1])) throw new Error(`voice anchor ${i} out of order`);
