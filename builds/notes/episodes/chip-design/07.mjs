// Chip-design episode 07, "What is De Morgan's theorem and why do designers use it": notes cues on the voice-synced
// fridge page. Build: npm run notes -- chip-design/07
// Times are video seconds (= audio seconds of the 2026-10-29 03:35 take). Positions are frame px (1080 x 1920).
// Notes follow section 3 ("What to draw") of the episode 7 Notion page, retimed to this take. Changes from that plan:
// the fridge is tall (top y 292), so the fridge-half notes sit below the board, where the table is not yet shown; the
// "= NAND" addition is its own note ("AND + flipped output = NAND"); "both rows: 0 1 1 1" goes above the board (no
// room under the table); the rings round the input bubbles, the group box round the NAND and the ring round the
// centre NAND tile are left out (they would cross the gate labels and tiles); "↔" is written out ("1 → 0, 0 → 1").
// Phases (src/figures/demorgan-fridge/voice.ts): fridge 3-25.4 s (board to y 1246), fold 25.4-27.3, circuit 27.3-66.6
// (board y 812-1240, table y 1298-1536), fold back 66.6-68.5, end card 68.5-71.7. Video length 71.7 s. The figure
// engraves ROLLIN itself (board front face), so engrave is null.
import { END } from "../../notes-kit.mjs";
import { line, tick, box } from "../../pen.mjs";

const DIR = "shorts/chip-design/07 What is De Morgan's theorem and why do designers use it/";
// Wipes: the fridge notes clear at the fold to the circuit, the circuit notes at the fold back.
const WA = 25.3, WB = 66.5;

export default [
  {
    name: "notes",
    source: DIR + "What is De Morgan's theorem and why do designers use it (fridge, voice).html",
    out: DIR + "What is De Morgan's theorem and why do designers use it (fridge, voice, notes).html",
    words: "builds/notes/episodes/chip-design/07.words.json",
    subtitles: null,
    // One explaining note per spoken beat, never more than 3 on screen, at least 1.5 s apart (R7, R8), each up 2.5 s+.
    notes: [
      // Hook, below the board
      [540, 1330, 52, 4.5, 0.9, 9.8, "2 answers, both right?"],
      // The two descriptions, stacked below the board, an "=" beside them
      [540, 1330, 44, 16.0, 1.1, WA, "Rule 1: either open → on"],
      [540, 1420, 44, 19.0, 1.1, WA, "Rule 2: both shut → off"],
      // Episode tag, top right, to the end
      [935, 330, 50, 24.1, 0.6, END, "Episode 7"],
      // Bits and gates, above the board
      [540, 470, 46, 29.8, 1.1, 34.5, "door = bit: 1 shut, 0 open"],
      [540, 560, 46, 32.4, 1.0, 37.6, "gate: bits in → light out"],
      // Rule one, rule two
      [540, 470, 46, 38.4, 1.0, 41.0, "flip: 1 → 0, 0 → 1"],
      [540, 560, 44, 39.9, 1.2, 45.0, "Rule 1 = (NOT L) OR (NOT R)"],
      [540, 650, 44, 42.6, 1.0, 46.6, "Rule 2 = NOT(L AND R)"],
      [540, 560, 44, 45.4, 1.1, 48.0, "AND + flipped output = NAND"],
      // All four states, De Morgan's recipe
      [540, 470, 48, 48.2, 0.8, 52.0, "both rows: 0 1 1 1"],
      [540, 560, 48, 51.8, 1.0, 56.0, "De Morgan: flip, swap, flip"],
      // Why designers care
      [540, 470, 48, 58.3, 0.9, 62.0, "NAND = 4 transistors"],
      [540, 650, 46, 61.0, 1.0, 64.0, "any design = NANDs only"],
      [540, 470, 48, 64.3, 1.0, WB, "1 here → 1000s on a chip"],
      // End card after the fold back: takeaway boxed in the subtitle area, next episode at the very bottom for the
      // last 4 s.
      [540, 1408, 38, 68.6, 1.2, END, "NOT(L AND R) = (NOT L) OR (NOT R)"],
      [540, 1693, 52, 70.1, 0.7, END, "Episode 8 →", { alive: true }],
    ],
    pen: [
      // "Different words, same light": an "=" beside the two rule notes
      { t: 21.0, d: 0.2, w: WA, p: line(818, 1365, 858, 1365, 0) },
      { t: 21.2, d: 0.2, w: WA, p: line(818, 1385, 858, 1385, 0) },
      // De Morgan's recipe: a tick under each word as it is said (flip, swap, flip)
      { t: 52.6, d: 0.25, w: 56.0, p: tick(560, 606) },
      { t: 53.6, d: 0.25, w: 56.0, p: tick(650, 606) },
      { t: 55.0, d: 0.25, w: 56.0, p: tick(745, 606) },
      // End card box
      { t: 69.0, d: 0.4, w: END, p: box(210, 1368, 870, 1448) },
    ],
    engrave: null,
  },
];
