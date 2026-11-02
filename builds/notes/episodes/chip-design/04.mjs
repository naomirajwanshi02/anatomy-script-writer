// Chip-design episode 04, "What is BCD and why do calculators and clocks use it": notes cues on the voice-synced
// alarm-clock page. Build: npm run notes -- chip-design/04
// Times are video seconds (= audio seconds of the 2026-10-28 18:02 take). Positions are frame px (1080 x 1920).
// Notes follow section 3 ("What to draw") of the episode 4 Notion page, retimed to this take. Changes from that plan:
// no strike-through pen strokes (R2 forbids a stroke through a note), so the hook is answered by a second note with a
// tick; "box → decoder → window" is "box → its own window" (the figure wires each box straight to its window); the
// group box round a tray is left out (the trays sit slanted among other trays, so a square box would cross parts).
// Phases (src/figures/bcd-clock/voice.ts): clock 3-18 s (clock top y 616, board to y 1318), fold 18-20.2, circuit
// 20.2-66 (board y 734-1177, the 7's tray (734, 940), table y 1220-1458, "unused" y 1508), fold back 66-68.6, end card
// 68.6-73. Video length 73 s. The figure engraves ROLLIN itself (board front face), so engrave is null.
import { END } from "../../notes-kit.mjs";
import { arrow, wave, box, tick } from "../../pen.mjs";

const DIR = "shorts/chip-design/04 What is BCD and why do calculators and clocks use it/";
// Wipes: the clock notes clear at the fold to the bits, the circuit notes at the fold back.
const WA = 17.95, WB = 65.9;

export default [
  {
    name: "notes",
    source: DIR + "What is BCD and why do calculators and clocks use it (alarm clock, voice).html",
    out: DIR + "What is BCD and why do calculators and clocks use it (alarm clock, voice, notes).html",
    words: "builds/notes/episodes/chip-design/04.words.json",
    subtitles: null,
    // One explaining note per spoken beat, never more than 3 on screen, at least 1.5 s apart (R7, R8), each up 2.5 s+.
    notes: [
      // Hook, then the clock: decimal, one window per digit
      [540, 400, 84, 0.6, 0.8, 14.0, "07:3A ?"],
      [540, 510, 50, 8.4, 0.8, 12.0, "07:29 → 07:30"],
      [540, 510, 48, 12.9, 1.0, WA, "decimal = 0 1 2 … 9"],
      [540, 400, 52, 14.5, 0.9, WA, "1 window = 1 digit"],
      // Episode tag, top right, to the end
      [935, 330, 50, 16.3, 0.6, END, "Episode 4"],
      // Why four bits
      [540, 470, 50, 24.5, 0.7, 27.4, "1 box = 4 bits"],
      [330, 570, 48, 26.3, 1.0, 29.0, "3 bits → 0 to 7 only"],
      [540, 670, 46, 28.0, 0.9, 31.0, "4 bits → 0 to 15"],
      // Digits as codes
      [540, 470, 48, 29.5, 1.0, 33.0, "0111 = 4+2+1 = 7"],
      [540, 570, 48, 31.6, 0.9, 34.8, "0011 = 2+1 = 3"],
      [540, 470, 50, 36.3, 1.0, 40.5, "BCD = 1 digit, 4 bits"],
      // Plain binary needs dividing
      [540, 470, 46, 43.2, 1.1, 47.0, "30 = 16+8+4+2 = 11110"],
      [540, 570, 46, 45.6, 1.0, 49.0, "30 / 10 = 3 r 0 → 3 0"],
      // BCD: straight to the window
      [540, 470, 50, 50.9, 1.0, 54.5, "box → its own window"],
      // The cost, and the hook answered
      [540, 470, 46, 58.6, 1.1, 61.5, "1010…1111 = A…F: never used"],
      [540, 570, 50, 60.2, 0.7, WB, "so never 07:3A"],
      [540, 670, 44, 62.0, 1.1, WB, "30: binary 5 bits, BCD 8 bits"],
      // End card after the fold back: takeaway boxed in the subtitle area, next episode at the very bottom for the
      // last 4 s.
      [540, 1408, 44, 68.7, 1.1, END, "one digit, one 4-bit box"],
      [540, 1693, 52, 70.2, 0.7, END, "Episode 5 →", { alive: true }],
    ],
    pen: [
      // Hook underlined
      { t: 1.5, d: 0.4, w: 14.0, p: wave(390, 690, 447) },
      // (No arrow to the 3-bit box: any path crosses the "0" label or the next note; its red dashed outline marks it.)
      // The hook answered: tick beside "so never 07:3A"
      { t: 61.0, d: 0.25, w: WB, p: tick(735, 566) },
      // End card box
      { t: 69.1, d: 0.4, w: END, p: box(270, 1368, 810, 1448) },
    ],
    engrave: null,
  },
];
