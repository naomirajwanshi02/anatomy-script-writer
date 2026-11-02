// Chip-design episode 01, "Why do engineers write binary as hexadecimal": notes cues on the voice-synced
// phone-number page. Build: npm run notes -- chip-design/01
// Times are video seconds (= audio seconds of the 2026-10-27 20:09 take, new hook). Positions are frame px (1080 x 1920).
// Notes follow section 3 ("What to draw") of the episode 1 Notion page, retimed to this take.
// Phases (src/figures/hex-grouping/voice.ts): phone 3-23.4 s (phone top y 616, board to y 1274, callout plate bottom
// edge y 1188), fold to the circuit 23.4-25.4, circuit 25.4-61.5 (byte row: tile tops y 867 at x 240, slope 0.265,
// right tile bottom (785, 1072); engraving just below the row from x 370 y 992; weights over the left group y 812-909;
// B block top y 741, 2 block top y 834; table x 151-929 y 1201-1450), fold back 61.5-63.2, end card on the phone
// board 64-68. Video length 68 s.
// The figure engraves ROLLIN itself (board front face), so engrave is null.
import { END } from "../../notes-kit.mjs";
import { arrow, wave, box, tick } from "../../pen.mjs";

const DIR = "shorts/chip-design/01 Why do engineers write binary as hexadecimal/";
// Wipes: the phone notes clear at the fold to the circuit, the circuit notes at the fold back.
const WA = 23.3, WB = 61.0;

export default [
  {
    name: "notes",
    source: DIR + "Why do engineers write binary as hexadecimal (phone number, voice).html",
    out: DIR + "Why do engineers write binary as hexadecimal (phone number, voice, notes).html",
    words: "builds/notes/episodes/chip-design/01.words.json",
    subtitles: null,
    // One explaining note per spoken beat, never more than 3 on screen, at least 1.5 s apart (R7, R8).
    notes: [
      // Hook: the grouped number, the gaps pointed at, "why?"
      [540, 400, 72, 1.0, 1.0, 7.3, "981 234 5670"],
      [870, 400, 56, 2.8, 0.4, 7.3, "why?"],
      // Phone: no gaps -> misread; the split; same digits
      [540, 470, 50, 10.9, 1.1, 15.9, "no gaps → easy to misread"],
      [420, 1340, 48, 14.2, 0.8, WA, "groups of 3, 3, 4"],
      [540, 470, 50, 16.9, 0.9, WA, "same digits, easier"],
      // Episode tag, top right, stays
      [935, 330, 50, 21.6, 0.6, WB, "Episode 1"],
      // Circuit: switches, the byte, why fours, the 16 symbols
      [300, 600, 46, 28.5, 0.7, 35.6, "on = 1, off = 0"],
      [520, 780, 46, 31.9, 0.7, 36.2, "1 byte = 8 bits"],
      [300, 600, 46, 38.1, 0.6, 44.2, "2×2×2×2 = 16"],
      [770, 600, 44, 39.8, 1.0, 46.3, "why not 3? 3 bits = only 8"],
      [540, 1500, 40, 41.8, 1.3, 48.0, "A=10 B=11 C=12 D=13 E=14 F=15"],
      // Place values, then each group's sum (after its block has landed)
      [380, 680, 44, 47.2, 0.5, 51.6, "×2 ×2 ×2"],
      [320, 620, 46, 52.8, 1.0, 56.6, "8 + 0 + 2 + 1 = 11 = B"],
      [780, 620, 46, 54.7, 0.8, 56.6, "0 + 0 + 2 + 0 = 2"],
      // Key hold B2
      [540, 470, 64, 56.2, 0.7, WB, "1011 0010 = B2"],
      [320, 640, 46, 58.0, 0.6, WB, "hex = base 16"],
      [780, 640, 46, 59.6, 0.9, WB, "1 hex digit = 4 bits"],
      // End card after the fold back: takeaway boxed in the subtitle area, next episode at the very bottom for the
      // last 4 s.
      [935, 330, 50, 62.6, 0.4, END, "Episode 1"],
      [540, 1408, 50, 62.7, 0.9, END, "hex = bits for humans"],
      [540, 1693, 52, 64.0, 0.7, END, "Episode 2 →", { alive: true }],
    ],
    pen: [
      // Hook: arrows up into the two gaps of the number
      { t: 2.0, d: 0.3, w: 7.3, p: arrow(470, 486, 470, 446, 0) },
      { t: 2.3, d: 0.3, w: 7.3, p: arrow(574, 486, 574, 446, 0) },
      // Phone: arrow from the note up to the callout plate; tick beside "same digits, easier"
      { t: 15.0, d: 0.4, w: WA, p: arrow(600, 1300, 612, 1200, 10) },
      { t: 17.9, d: 0.25, w: WA, p: tick(810, 466) },
      // Circuit: square-cornered bracket over the whole byte row on "byte" (12-14 px clear of the tiles, kept above
      // the board engraving under the row); stays until "group them in fours"
      { t: 31.6, d: 0.6, w: 36.2, p: "M196 864 L196 841 L830 1009 L830 1032" },
      // B2 underlined twice
      { t: 57.0, d: 0.4, w: WB, p: wave(330, 750, 505) },
      { t: 57.4, d: 0.4, w: WB, p: wave(338, 758, 521) },
      // End card box
      { t: 63.2, d: 0.4, w: END, p: box(290, 1368, 790, 1448) },
    ],
    engrave: null,
  },
];
