// Chip-design episode 10, "What are noise margins?": notes cues on the voice-synced road page.
// Build: npm run notes -- chip-design/10
// Times are video seconds (= audio seconds of the 2026-10-31 05:37 take). Positions are frame px (1080 x 1920).
// Notes follow section 3 ("What to draw") of the episode 10 Notion page, retimed to this take; the wobble became a
// gust of wind. The board reaches y 1505 at its front corner, so the end-card takeaway sits in the paper above the
// board; "Episode 11 →" stays at the very bottom.
// Phases (src/figures/noise-margin-road/voice.ts): road 3-19.3 s (rust car (270, 1161), sepia car (806, 1125),
// board top y 983), fold 19.32-21.0 (the road stands up into the gauge), circuit 21.0-53.96 (gauge x 323-681,
// y 651-1237, rust car = 1 marker, sepia car = 0 marker; readout x 702-849; gust streaks reach y 591 at 33 s),
// The figure engraves ROLLIN itself (board front face), so engrave is null.
import { END } from "../../notes-kit.mjs";
import { arrow, both, box, wave } from "../../pen.mjs";

const DIR = "shorts/chip-design/10 What are noise margins/";
// Wipes: the road notes clear at the fold, the circuit notes at the fold back.
const WA = 19.2, WB = 53.9;

export default [
  {
    name: "notes",
    source: DIR + "What are noise margins (road, voice).html",
    out: DIR + "What are noise margins (road, voice, notes).html",
    words: "builds/notes/episodes/chip-design/10.words.json",
    subtitles: null,
    notes: [
      // Hook
      [540, 420, 64, 1.9, 0.7, 6.5, "why the middle?"],
      // Near the line vs the middle, then the safety room
      [330, 560, 46, 6.9, 0.9, 12.3, "near the line → over"],
      [780, 640, 46, 9.7, 0.6, 15.3, "middle → safe"],
      [300, 900, 46, 12.6, 0.5, WA, "safety room"],
      // Episode tag, top right, to the end
      [935, 330, 50, 17.6, 0.6, END, "Episode 10"],
      // The scale
      [540, 420, 46, 21.4, 1.0, 26.6, "bit = voltage on a wire"],
      [300, 560, 46, 24.9, 0.8, 31.4, "read 1 above 0.6 V"],
      [800, 560, 46, 29.0, 0.7, 37.0, "1 sent at 0.9 V"],
      // Noise
      [300, 470, 46, 32.7, 0.6, 38.0, "noise = gust"],
      [780, 440, 46, 37.3, 0.8, 41.2, "0.9 → 0.7: still 1"],
      // Margin and the zero
      [540, 580, 44, 44.0, 1.2, WB, "margin = 0.9 - 0.6 = 0.3 V"],
      [540, 500, 44, 47.9, 1.2, WB, "0: sent 0.1, read below 0.4"],
      // End card after the fold back: takeaway boxed above the board, next episode at the very bottom for the last 4 s.
      [540, 700, 44, 55.6, 1.3, END, "small bumps stay in their lane"],
      [540, 1693, 52, 59.5, 0.7, END, "Episode 11 →", { alive: true }],
    ],
    pen: [
      // "The space between your wheels and the line": double arrow from the car to the lane line
      { t: 10.4, d: 0.5, w: WA, p: both(420, 1185, 540, 1185) },
      // "That's the lane line": arrow to the 0.6 line's right end
      { t: 26.8, d: 0.5, w: 29.0, p: arrow(770, 640, 696, 925, -20) },
      // "noise margin": wavy underline under "margin"
      { t: 46.7, d: 0.4, w: WB, p: wave(340, 450, 608, 5, 3) },
      // End card box
      { t: 56.0, d: 0.4, w: END, p: box(195, 660, 885, 740) },
    ],
    engrave: null,
  },
];
