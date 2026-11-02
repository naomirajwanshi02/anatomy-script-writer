// Chip-design episode 08, "How does a Karnaugh map simplify logic": notes cues on the voice-synced egg-carton page.
// Build: npm run notes -- chip-design/08
// Times are video seconds (= audio seconds of the 2026-10-29 03:52 take). Positions are frame px (1080 x 1920).
// Notes follow section 3 ("What to draw") of the episode 8 Notion page, retimed to this take. Left out of that plan:
// the arrows to the row and column labels and the strike through A and C (pen strokes may not touch engraved labels);
// "00 01 11 10: 1 bit apart" goes above the board (the table sits under the map). The "?" over the empty cup is a
// small note with a tick beside it.
// Phases (src/figures/kmap-eggs/voice.ts): carton 3-20.1 s (board y 572-1091), fold 20.1-21.6, circuit 21.6-57.8
// (levers top y 542, board y 574-1091, table y 1166-1382), fold back 57.8-58.6, teaser and end card 58.6-66.1.
// Video length 66.1 s. The figure engraves ROLLIN itself (board front face), so engrave is null.
import { END } from "../../notes-kit.mjs";
import { cross, tick, box } from "../../pen.mjs";

const DIR = "shorts/chip-design/08 How does a Karnaugh map simplify logic/";
// Wipes: the carton notes clear before the episode tag and the fold, the circuit notes at the fold back.
const WA = 17.7, WB = 57.7;

export default [
  {
    name: "notes",
    source: DIR + "How does a Karnaugh map simplify logic (egg carton, voice).html",
    out: DIR + "How does a Karnaugh map simplify logic (egg carton, voice, notes).html",
    words: "builds/notes/episodes/chip-design/08.words.json",
    subtitles: null,
    // One explaining note per spoken beat, never more than 3 on screen, at least 1.5 s apart (R7, R8), each up 2.5 s+.
    notes: [
      // Hook, then the three ways stacked above the board
      [540, 400, 60, 2.4, 0.8, 6.0, "4 eggs, 3 ways?"],
      [540, 360, 46, 6.5, 1.0, WA, "1 at a time: 4 picks"],
      [540, 440, 46, 8.4, 1.0, WA, "2 at a time: 2 picks"],
      [540, 520, 46, 11.1, 0.7, WA, "all 4: 1 pick"],
      // Episode tag, top right, to the end
      [935, 330, 50, 18.3, 0.6, END, "Episode 8"],
      // The map
      [540, 380, 46, 24.7, 1.0, 29.3, "row = A, column = BC"],
      [540, 460, 46, 27.6, 0.8, 31.0, "egg = output 1"],
      // One egg at a time
      [540, 380, 46, 30.6, 1.1, 34.2, "1 egg = AND of A, B, C"],
      [540, 460, 46, 35.9, 1.1, 40.0, "4 AND + 1 OR = 5 gates"],
      // Two side by side
      [540, 380, 44, 40.0, 1.2, 44.0, "011, 010 → C doesn't matter"],
      [540, 460, 46, 43.3, 1.1, 48.2, "2 AND + 1 OR = 3 gates"],
      [540, 1450, 44, 45.0, 1.1, 48.4, "00 01 11 10: 1 bit apart"],
      // All four: a wire
      [540, 410, 80, 51.8, 0.6, WB, "Y = B"],
      [540, 520, 44, 54.9, 1.2, WB, "Karnaugh map: biggest pick wins"],
      // Teaser: a "?" over the empty cup, then a tick on "it can"
      [470, 560, 56, 60.4, 0.3, END, "?"],
      // End card after the fold back: takeaway boxed in the subtitle area, next episode at the very bottom for the
      // last 4 s.
      [540, 1440, 44, 58.8, 1.0, END, "bigger pick, fewer gates"],
      [540, 1693, 52, 62.1, 0.7, END, "Episode 9 →", { alive: true }],
    ],
    pen: [
      // Side by side only: a cross over the diagonal pair
      { t: 14.2, d: 0.4, w: WA, p: cross(621, 821, 26) },
      // "Sometimes, it can": a tick beside the "?"
      { t: 61.5, d: 0.3, w: END, p: tick(515, 562) },
      // End card box
      { t: 59.2, d: 0.4, w: END, p: box(300, 1400, 780, 1480) },
    ],
    engrave: null,
  },
];
