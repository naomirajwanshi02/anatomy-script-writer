// Chip-design episode 09, "What are don't-care conditions?": notes cues on the voice-synced traffic-light page.
// Build: npm run notes -- chip-design/09
// Times are video seconds (= audio seconds of the 2026-10-31 04:48 take). Positions are frame px (1080 x 1920).
// Notes follow section 3 ("What to draw") of the episode 9 Notion page, retimed to this take. "X = never happens"
// goes above the board (the gate readout sits under the grid).
// Phases (src/figures/dontcare-traffic/voice.ts): light 3-19.9 s (light top y 452, ghost light centre (646, 788)),
// fold 19.9-21.3, circuit 21.3-61.76 (board top y 813, tiles (469, 872) (564, 897) (659, 922), grid y 957-1297,
// readout y 1425-1479), fold back 61.76-63.3, end card 63.3-70.5. Video length 70.5 s.
// The figure engraves ROLLIN itself (board front face), so engrave is null.
import { END } from "../../notes-kit.mjs";
import { cross, box, wave } from "../../pen.mjs";

const DIR = "shorts/chip-design/09 What are don't-care conditions/";
// Wipes: the light notes clear at the fold, the circuit notes at the fold back.
const WA = 19.8, WB = 61.7;

export default [
  {
    name: "notes",
    source: DIR + "What are don't-care conditions (traffic light, voice).html",
    out: DIR + "What are don't-care conditions (traffic light, voice, notes).html",
    words: "builds/notes/episodes/chip-design/09.words.json",
    subtitles: null,
    notes: [
      // Hook, above the light
      [720, 380, 56, 2.9, 0.8, 9.8, "green → check red?"],
      // Red and green never together; the ghost light gets a cross
      [700, 400, 46, 11.0, 1.1, 15.5, "red + green: never together"],
      [540, 1460, 46, 14.7, 1.3, WA, "never happens → skip the check"],
      // Episode tag, top right, to the end
      [935, 330, 50, 17.9, 0.6, END, "Episode 9"],
      // Bits and the grid
      [540, 700, 46, 22.0, 0.8, 28.6, "3 lamps = 3 bits"],
      [540, 620, 46, 29.5, 0.8, 35.0, "go = green alone"],
      [540, 700, 44, 36.4, 1.4, 43.8, "full check: 2 NOT + AND = 3 gates"],
      [540, 540, 46, 40.7, 0.8, 51.2, "X = never happens"],
      // The loop
      [540, 620, 46, 47.7, 0.8, 55.8, "4 boxes → Go = G"],
      [540, 700, 46, 52.2, 1.0, 57.4, "real lights: G alone ✓"],
      [540, 540, 60, 57.8, 0.7, WB, "don't-care = X"],
      // End card after the fold back: takeaway boxed under the board, next episode at the very bottom for the last 4 s.
      [540, 1470, 44, 63.4, 1.2, END, "never happens? don't check"],
      [540, 1693, 52, 66.5, 0.7, END, "Episode 10 →", { alive: true }],
    ],
    pen: [
      // A cross over the ghost light (red and green together)
      { t: 11.2, d: 0.4, w: 15.5, p: cross(646, 788, 60) },
      // "Three lamps": a group box round the 3 bit tiles
      { t: 22.0, d: 0.5, w: 25.3, p: box(392, 812, 738, 1004) },
      // Wavy underline under "don't-care = X"
      { t: 58.6, d: 0.4, w: WB, p: wave(380, 700, 575, 6, 4) },
      // End card box
      { t: 63.8, d: 0.4, w: END, p: box(230, 1430, 850, 1510) },
    ],
    engrave: null,
  },
];
