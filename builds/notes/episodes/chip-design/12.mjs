// Chip-design episode 12, "How does a full adder work?": notes cues on the voice-synced paper-columns page.
// Build: npm run notes -- chip-design/12
// Times are video seconds (= audio seconds of the 2026-10-31 11:09 take). Positions are frame px (1080 x 1920).
// Notes follow section 3 ("What to draw") of the episode 12 Notion page, retimed to this take. Left out of that plan:
// the olive box round the four adders (the block row runs diagonally across the board, so no square box clears the
// other tiles). The figure engraves ROLLIN itself (board front face), so engrave is null.
// Phases (src/figures/full-adder-columns): paper 0-28.56 s (zoomed; board top y about 700), fold 28.56-30.4, circuit
// 30.4-63.38 (board top y about 770), fold back 63.38-65, end card 65-71. Video length 71 s.
import { END } from "../../notes-kit.mjs";
import { ring, box } from "../../pen.mjs";

const DIR = "shorts/chip-design/12 How does a full adder work/";
// Wipes: the paper notes clear at the fold, the circuit notes at the fold back.
const WA = 28.5, WB = 63.3;

export default [
  {
    name: "notes",
    source: DIR + "How does a full adder work (paper columns, voice).html",
    out: DIR + "How does a full adder work (paper columns, voice, notes).html",
    words: "builds/notes/episodes/chip-design/12.words.json",
    subtitles: null,
    notes: [
      // Paper
      [300, 500, 48, 7.9, 0.7, 12.0, "8 + 7 + 0 = 15"],
      [760, 560, 48, 14.6, 0.7, 20.0, "5 + 6 + 1 = 12"],
      [330, 470, 46, 18.6, 0.9, 23.5, "max: 9 + 9 + 1 = 19"],
      // Episode tag, top right, to the end
      [935, 330, 50, 26.9, 0.6, END, "Episode 12"],
      // Bits
      [300, 520, 46, 30.6, 0.7, 36.3, "max 1+1+1 = 3"],
      [740, 520, 44, 34.6, 1.0, 41.8, "bits count: 0, 1, 10, 11"],
      [330, 420, 44, 42.3, 1.0, 47.4, "sum: total 1 or 3 (XOR)"],
      [700, 600, 44, 45.5, 1.3, 50.3, "carry: total 2 or 3 (majority)"],
      [330, 470, 44, 49.5, 1.1, 52.8, "full = takes the carry too"],
      [700, 480, 46, 53.0, 0.9, 59.4, "6 + 7 = 0110 + 0111"],
      [330, 560, 46, 59.7, 1.0, WB, "1101 = 8 + 4 + 1 = 13"],
      // End card after the fold back: takeaway boxed in the subtitle area, next episode at the very bottom for the last
      // 4 s.
      [540, 1420, 48, 65.2, 0.8, END, "three in, two out"],
      [540, 1693, 52, 67.0, 0.7, END, "Episode 13 →", { alive: true }],
    ],
    pen: [
      // "That's the third number": a ring round the tens column's carry, 5 and 6
      { t: 14.4, d: 0.5, w: 16.3, p: ring(604, 941, 150, 85, -43) },
      // End card box
      { t: 65.5, d: 0.4, w: END, p: box(300, 1375, 780, 1465) },
    ],
    engrave: null,
  },
];
