// Chip-design episode 03, "What is arithmetic overflow and how is it detected": notes cues on the voice-synced
// trip-counter page. Build: npm run notes -- chip-design/03
// Times are video seconds (= audio seconds of the 2026-10-28 17:47 take). Positions are frame px (1080 x 1920).
// Notes follow section 3 ("What to draw") of the episode 3 Notion page, retimed to this take. Notes use "-" (Samble has
// no U+2212 minus). Lines the readout already prints (01111111 = +127, the sum, carry in 1 vs carry out 0) are not
// written again.
// Phases (src/figures/trip-overflow/voice.ts): trip meter 3-19.2 s (cluster top y 637, board to y 1340), fold to the
// bits 19.2-21.2, circuit 21.2-62 (board y 737-1158, row A sign tile (346, 823), sum sign tile (248, 914), carry chips
// (335, 780) and (389, 790), XOR gate (849, 953), V bulb (925, 942), readout y 1190-1385), fold back 62-64.4, end card
// 64.4-69. Video length 69 s. The figure engraves ROLLIN itself (board front face), so engrave is null.
import { END } from "../../notes-kit.mjs";
import { arrow, wave, box } from "../../pen.mjs";

const DIR = "shorts/chip-design/03 What is arithmetic overflow and how is it detected/";
// Wipes: the trip-meter notes clear at the fold to the bits, the circuit notes at the fold back.
const WA = 19.1, WB = 61.9;

export default [
  {
    name: "notes",
    source: DIR + "What is arithmetic overflow and how is it detected (trip counter, voice).html",
    out: DIR + "What is arithmetic overflow and how is it detected (trip counter, voice, notes).html",
    words: "builds/notes/episodes/chip-design/03.words.json",
    subtitles: null,
    // One explaining note per spoken beat, never more than 3 on screen, at least 1.5 s apart (R7, R8), each up 2.5 s+.
    notes: [
      // Hook, then why the meter shows zero
      [540, 400, 72, 0.6, 1.0, WA, "99999 + 1 = 00000 ?"],
      [540, 520, 50, 6.6, 0.9, WA, "5 wheels → max 99999"],
      // Episode tag, top right, to the end
      [935, 330, 50, 17.2, 0.6, END, "Episode 3"],
      // Bits: the chip version of the wrap
      [540, 420, 72, 22.6, 0.8, 30.0, "100 + 100 = -56 ?!"],
      [540, 560, 48, 26.9, 0.7, 29.5, "8 bits = 1 byte"],
      [330, 640, 46, 29.7, 0.8, 32.0, "leftmost bit 1 = -"],
      [540, 470, 46, 32.0, 1.1, 34.8, "256 patterns: 128 are negative"],
      // The add
      [540, 560, 48, 33.9, 0.6, 37.2, "100 = 64+32+4"],
      [540, 470, 46, 35.5, 1.1, 38.6, "1 + 1 = 10: write 0, carry 1"],
      // Key moment, overflow
      [540, 560, 50, 39.9, 0.7, 43.4, "200 - 256 = -56"],
      [540, 470, 46, 43.9, 1.1, 47.5, "overflow = too big for 8 bits"],
      // Detection: the two carries, the rule, the gate, the lamp
      [330, 640, 46, 50.4, 0.6, 54.0, "in: 1, out: 0"],
      [540, 470, 46, 51.9, 1.1, 55.4, "match → OK, differ → overflow"],
      [620, 560, 46, 54.6, 0.9, 57.6, "XOR: 1 when different"],
      [930, 760, 46, 57.2, 0.6, 59.8, "V = oVerflow"],
      [540, 470, 50, 58.7, 1.0, WB, "+ and + → - = overflow"],
      // End card after the fold back: takeaway boxed in the subtitle area, next episode at the very bottom for the
      // last 4 s.
      [540, 1408, 44, 63.8, 1.1, END, "carries differ = overflow"],
      [540, 1693, 52, 65.3, 0.7, END, "Episode 4 →", { alive: true }],
    ],
    pen: [
      // Hook underlined
      { t: 1.7, d: 0.4, w: WA, p: wave(250, 830, 446) },
      // Leftmost bit: arrow down to the sign tile of row A, stopping above it
      { t: 30.6, d: 0.4, w: 32.0, p: arrow(330, 668, 338, 765, 8) },
      // Carry direction: right to left along the columns, in the paper above the board
      { t: 36.2, d: 0.5, w: 38.6, p: arrow(780, 690, 380, 690, -10) },
      // (No pointer at the sum sign tile: the row labels A, B, sum and SIGN leave no clear path; the figure's red dashed
      // outline marks it.)
      // Two carries: arrows from the note to the carry-out and carry-in chips, stopping short
      { t: 51.0, d: 0.35, w: 54.0, p: arrow(295, 668, 322, 786, 6) },
      { t: 51.3, d: 0.35, w: 54.0, p: arrow(375, 668, 372, 798, -6) },
      // XOR gate
      { t: 55.5, d: 0.4, w: 57.6, p: arrow(720, 590, 832, 905, -10) },
      // V lamp
      { t: 57.8, d: 0.35, w: 59.8, p: arrow(930, 788, 928, 868, 6) },
      // End card box
      { t: 64.2, d: 0.4, w: END, p: box(270, 1368, 810, 1448) },
    ],
    engrave: null,
  },
];
