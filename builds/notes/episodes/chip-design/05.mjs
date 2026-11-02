// Chip-design episode 05, "How does a parity bit detect errors": notes cues on the voice-synced washing-machine page.
// Build: npm run notes -- chip-design/05
// Times are video seconds (= audio seconds of the 2026-10-28 18:18 take). Positions are frame px (1080 x 1920).
// Notes follow section 3 ("What to draw") of the episode 5 Notion page, retimed to this take, after the 2026-10-29
// rework of the figure. The figure now shows the counting itself (pair arcs, the one left alone in rust, the callout
// count, the "ones: n → odd/even" readout), so the notes that only repeated a count ("7 + 1 spare = 8 (even)",
// "8 in → 7 out (odd)", "count the 1s: 3 (odd)", "3 + 1 = 4 (even)", "5 ones = odd → error", "2 flips → 6 → missed")
// are left out; the notes carry what the figure cannot say: the rule, the definitions and the limit.
// Phases (src/figures/parity-wash/voice.ts): washing machine 3-19.4 s (machine top y 547, board to y 1354), fold
// 19.4-22, circuit 22-57.6 (board y 743-1146, sent parity tile (757, 916), readout y 1233), fold back 57.6-60.3, end
// card 60.3-65.5. Video length 65.5 s. The figure engraves ROLLIN itself (board front face), so engrave is null.
import { END } from "../../notes-kit.mjs";
import { arrow, squiggle, box } from "../../pen.mjs";

const DIR = "shorts/chip-design/05 How does a parity bit detect errors/";
// Wipes: the machine notes clear at the fold to the bits, the circuit notes at the fold back.
const WA = 19.35, WB = 57.5;

export default [
  {
    name: "notes",
    source: DIR + "How does a parity bit detect errors (washing machine, voice).html",
    out: DIR + "How does a parity bit detect errors (washing machine, voice, notes).html",
    words: "builds/notes/episodes/chip-design/05.words.json",
    subtitles: null,
    // One explaining note per spoken beat, never more than 3 on screen, at least 1.5 s apart (R7, R8), each up 2.5 s+.
    notes: [
      // Hook, then the rule the pairs show
      [540, 400, 72, 2.9, 0.4, 6.0, "how?"],
      [540, 420, 44, 6.2, 1.3, WA, "even = pairs, odd = 1 left over"],
      // Episode tag, top right, to the end
      [935, 330, 50, 17.7, 0.6, END, "Episode 5"],
      // Bits: what a flip is, the word
      [540, 470, 48, 21.9, 1.1, 25.0, "bit flip: 0 → 1 or 1 → 0"],
      [540, 470, 50, 25.2, 0.6, 28.0, "7 data bits"],
      // The parity bit
      [540, 470, 48, 35.7, 1.0, 39.2, "parity bit = spare sock"],
      [330, 570, 46, 37.4, 1.1, 40.6, "XOR of all bits = parity"],
      // The limit
      [540, 470, 48, 50.9, 0.9, 54.2, "which bit? can't tell"],
      // End card after the fold back: takeaway boxed in the subtitle area, next episode at the very bottom for the
      // last 4 s.
      [540, 1408, 44, 60.4, 0.9, END, "odd count = error"],
      [540, 1693, 52, 61.9, 0.7, END, "Episode 6 →", { alive: true }],
    ],
    pen: [
      // Hook: a squiggle under "how?"
      { t: 3.4, d: 0.4, w: 6.0, p: squiggle(450, 630, 446, 6, 4) },
      // Parity bit: arrow down to the sent row's parity tile, stopping above it
      { t: 36.5, d: 0.4, w: 39.2, p: arrow(720, 500, 752, 870, 10) },
      // End card box
      { t: 60.8, d: 0.4, w: END, p: box(300, 1368, 780, 1448) },
    ],
    engrave: null,
  },
];
