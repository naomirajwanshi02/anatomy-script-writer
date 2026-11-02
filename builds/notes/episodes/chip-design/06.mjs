// Chip-design episode 06, "Why does a rotary encoder use Gray code": notes cues on the voice-synced volume-knob page.
// Build: npm run notes -- chip-design/06
// Times are video seconds (= audio seconds of the 2026-10-29 03:19 take). Positions are frame px (1080 x 1920).
// Notes follow section 3 ("What to draw") of the episode 6 Notion page, retimed to this take. Left out of that plan:
// the group boxes, rings and ticks drawn on the brushes and the table (the brushes sit on the disc and the table rows
// are figure text, so marks there would cross parts or labels; the figure's rust bits and red dashed 7 carry them),
// and the fridge doodle (pen.mjs has no fridge shape). Notes stay in the paper above the board, clear of the speaker
// on the right (x 778-972 from y 456).
// Phases (src/figures/volume-gray/voice.ts): amp 3-18.3 s (amp top y 432), fold 18.3-20.3, disc 20.3-58.2 (disc
// x 340-720 y 600-810, brushes (626, 715), table y 1168-1514), fold back 58.2-60, end card 60-68. Video length 68 s.
// The figure engraves ROLLIN itself (board front face), so engrave is null.
import { END } from "../../notes-kit.mjs";
import { arrow, wave, box } from "../../pen.mjs";

const DIR = "shorts/chip-design/06 Why does a rotary encoder use Gray code/";
// Wipes: the amp notes clear at the fold to the disc, the disc notes at the fold back.
const WA = 18.3, WB = 58.1;

export default [
  {
    name: "notes",
    source: DIR + "Why does a rotary encoder use Gray code (volume knob, voice).html",
    out: DIR + "Why does a rotary encoder use Gray code (volume knob, voice, notes).html",
    words: "builds/notes/episodes/chip-design/06.words.json",
    subtitles: null,
    // One explaining note per spoken beat, never more than 3 on screen, at least 1.5 s apart (R7, R8), each up 2.5 s+.
    notes: [
      // Hook, the blast, the misread
      [400, 350, 64, 3.6, 0.8, 9.8, "3 → 4 … 7?!"],
      [400, 340, 56, 10.4, 0.7, WA, "3 → 7 → 4"],
      [400, 405, 44, 12.9, 0.7, WA, "7 = misread"],
      // Episode tag, top right, to the end
      [935, 330, 50, 16.3, 0.6, END, "Episode 6"],
      // The sensors and the codes
      [400, 390, 44, 21.5, 1.3, 27.0, "3 sensors: metal = 1, gap = 0"],
      [400, 470, 46, 24.7, 0.9, 30.0, "3 = 011, 4 = 100"],
      // The false 7
      [400, 390, 46, 30.4, 0.9, 34.2, "tiny misalignment"],
      [400, 470, 46, 36.0, 0.9, 41.6, "011 → 111 → 100"],
      // The fix
      [400, 390, 46, 39.3, 0.8, 43.6, "neighbours: 1 bit"],
      [400, 390, 46, 46.3, 0.9, 49.8, "010 → 110: 1 bit"],
      [400, 470, 44, 50.9, 1.1, 54.2, "late → 3 longer, then 4"],
      [400, 390, 46, 54.6, 1.0, WB, "Gray code (Frank Gray)"],
      // End card after the fold back: takeaway boxed in the subtitle area, next episode at the very bottom for the
      // last 4 s.
      [540, 1408, 44, 62.8, 0.8, END, "one step, one bit"],
      [540, 1693, 52, 64.4, 0.7, END, "Episode 7 →", { alive: true }],
    ],
    pen: [
      // Hook underlined
      { t: 4.5, d: 0.4, w: 9.8, p: wave(260, 540, 382) },
      // The left brush: arrow down toward the brushes, stopping above the disc
      { t: 34.9, d: 0.4, w: 38.0, p: arrow(640, 420, 628, 585, -8) },
      // End card box
      { t: 63.2, d: 0.4, w: END, p: box(300, 1368, 780, 1448) },
    ],
    engrave: null,
  },
];
