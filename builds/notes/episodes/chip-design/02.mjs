// Chip-design episode 02, "How does a computer subtract using only an adder": notes cues on the voice-synced
// odometer page. Build: npm run notes -- chip-design/02
// Times are video seconds (= audio seconds of the 2026-10-27 20:55 take). Positions are frame px (1080 x 1920).
// Notes follow section 3 ("What to draw") of the episode 2 Notion page, retimed to this take. Notes use "-" (Samble has no U+2212 minus). Lines the readout
// already prints (1111 = -1 like 9999, 1101 = -3, 5 - 3 = 5 + (-3)) are not written again.
// Phases (src/figures/twos-complement/voice.ts): odometer 3-22.3 s (cluster top y 594, callout plate y 1058-1296,
// board to y 1382), fold to the counter 22.3-24.6, circuit 24.6-61.5 (counter top-left (296, 702), window x 318-770
// y 778-961, shortcut row x 372-692 y 938-1070, readout card y 1225-1613), fold back 61.5-63.6, end card 64-68.
// Video length 68 s. The figure engraves ROLLIN itself (board front face), so engrave is null.
import { END } from "../../notes-kit.mjs";
import { arrow, wave, box, tick } from "../../pen.mjs";

const DIR = "shorts/chip-design/02 How does a computer subtract using only an adder/";
// Wipes: the odometer notes clear at the fold to the counter, the circuit notes at the fold back.
const WA = 22.2, WB = 61.0;

export default [
  {
    name: "notes",
    source: DIR + "How does a computer subtract using only an adder (odometer, voice).html",
    out: DIR + "How does a computer subtract using only an adder (odometer, voice, notes).html",
    words: "builds/notes/episodes/chip-design/02.words.json",
    subtitles: null,
    // One explaining note per spoken beat, never more than 3 on screen, at least 1.5 s apart (R7, R8).
    notes: [
      // Hook
      [540, 400, 72, 1.0, 1.2, 10.3, "0000 - 1 = 9999 ?"],
      [540, 500, 50, 7.2, 0.8, 10.3, "subtract = add?"],
      // Odometer: why 9999, then the wrap
      [540, 420, 50, 11.0, 1.2, WA, "4 wheels → only 0000 to 9999"],
      [540, 520, 50, 17.3, 0.7, WA, "0 - 1 → 9999"],
      // Episode tag, top right, until the fold back
      [935, 330, 50, 20.3, 0.6, WB, "Episode 2"],
      // Counter: what -1 looks like, then -3
      [540, 430, 50, 30.5, 0.9, 37.4, "leftmost 1 = negative"],
      [540, 540, 46, 35.0, 1.0, 37.4, "3 steps back → 1101 = -3"],
      // Shortcut row
      [520, 430, 46, 41.0, 1.1, 45.0, "0011 → 1100 → +1 = 1101"],
      // Rolling forward five steps
      [840, 560, 46, 47.8, 0.5, 53.0, "+5 steps"],
      // Key hold, then the takeaway
      [540, 470, 72, 53.7, 0.6, WB, "5 - 3 = 2"],
      [320, 600, 46, 55.3, 0.8, WB, "-x = flip(x) + 1"],
      [780, 600, 46, 57.5, 0.8, WB, "4 bits: -8 to +7"],
      // End card after the fold back: episode tag again, takeaway boxed in the subtitle area, next episode at the very
      // bottom for the last 4 s.
      [935, 330, 50, 62.5, 0.4, END, "Episode 2"],
      [540, 1408, 44, 63.3, 1.2, END, "subtract = add the complement"],
      [540, 1693, 52, 64.0, 0.7, END, "Episode 3 →", { alive: true }],
    ],
    pen: [
      // Counter: arrow from the note down toward the left drum (stops above the frame)
      { t: 31.4, d: 0.4, w: 34.4, p: arrow(420, 466, 372, 672, 10) },
      // Shortcut: tick after the row's note (the counter reads the same 1101)
      { t: 42.2, d: 0.25, w: 45.0, p: tick(840, 426) },
      // Roll direction beside the counter, stopping short of it
      { t: 48.4, d: 0.4, w: 53.0, p: arrow(830, 596, 792, 690, -14) },
      // 5 - 3 = 2 underlined
      { t: 54.4, d: 0.4, w: WB, p: wave(390, 690, 512) },
      // End card box
      { t: 64.3, d: 0.4, w: END, p: box(200, 1368, 880, 1448) },
    ],
    engrave: null,
  },
];
