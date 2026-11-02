// Chip-design episode 13, "What does a decoder do in a memory chip?": notes cues on the voice-synced intercom page.
// Build: npm run notes -- chip-design/13
// Times are video seconds (= audio seconds of the 2026-10-31 11:46 take). Positions are frame px (1080 x 1920).
// Each cue starts just after its word in builds/notes/episodes/13.words.json.
// Phases (voice page): intercom building 0-31.48 s, fold 31.48 s, circuit (checker panel, address readout) to the
// fold back at 62.92, then the building again; video length 70 s. The figure fills y 400-1460, so notes sit above
// it (y 355), in the free column left of the building/panel (x < 310), or below the board (end card).
// The figure engraves ROLLIN itself (board front face), so engrave is null.
// Samble has no "x" sign, superscripts or minus: written as "x", "2^n", "-".
import { END } from "../../notes-kit.mjs";
import { ring, box, cross, arrow, line } from "../../pen.mjs";

const DIR = "shorts/chip-design/13 What does a decoder do in a memory chip/";
// Wipes: building notes clear before the fold (31.48), circuit notes at the fold back.
const WB = 62.85;
// Parallelogram box that follows the board slope (hand-drawn: the last side runs a little past the start corner).
const pbox = (x0, y0, x1, slope, h) => {
  const y1 = y0 + (x1 - x0) * slope;
  return `M${x0 - 4} ${y0 - 1} L${x1} ${y1} L${x1} ${y1 + h} L${x0} ${y0 + h} L${x0} ${y0 - 8}`;
};

export default [
  {
    name: "notes",
    source: DIR + "What does a decoder do in a memory chip (intercom, voice).html",
    out: DIR + "What does a decoder do in a memory chip (intercom, voice, notes).html",
    words: "builds/notes/episodes/13.words.json",
    subtitles: null,
    notes: [
      // Building
      [330, 355, 46, 8.4, 0.8, 16.2, "2 x 2 x 2 = 8 flats"],
      [160, 860, 42, 13.6, 0.5, 20.1, "3 switches,", { group: "sw" }],
      [160, 908, 42, 14.1, 0.5, 20.1, "2 ways each", { group: "sw" }],
      [800, 355, 46, 23.6, 0.9, 27.8, "others miss at least one"],
      // Episode tag, top right, to the end
      [935, 330, 50, 29.0, 0.6, END, "Episode 13"],
      // Circuit
      [330, 355, 46, 33.6, 0.8, 38.45, "B, first, right = 1"],
      [330, 355, 46, 39.0, 1.1, 44.1, "address = which row to read"],
      [165, 800, 42, 41.0, 0.6, 45.9, "row = cells,", { group: "row" }],
      [165, 848, 42, 41.5, 0.5, 45.9, "1 bit each", { group: "row" }],
      [700, 1215, 42, 48.5, 1.0, 53.9, "1 0 1 = 4 + 0 + 1 = 5"],
      [330, 355, 46, 55.2, 0.9, 59.5, "3→8, 4→16, 10→1024"],
      [760, 420, 46, 58.7, 0.8, WB, "2^20 = 1,048,576"],
      [160, 780, 42, 60.3, 0.4, WB, "decoder:", { group: "dec" }],
      [160, 828, 42, 60.7, 0.5, WB, "3 in, 8 out", { group: "dec" }],
      // End card after the fold back: takeaway boxed below the board, next episode at the very bottom for the last 4 s.
      [540, 1590, 46, 66.0, 0.9, END, "n wires pick 1 of 2^n rows"],
      [540, 1693, 52, 67.5, 0.7, END, "Episode 14 →", { alive: true }],
    ],
    pen: [
      // Ties: arrows from notes to their parts, drawn on the spoken words; the note inks just after
      { t: 7.92, d: 0.4, w: 16.2, p: arrow(230, 390, 300, 452, 12) },        // "8 flats" -> building roof
      { t: 23.1, d: 0.4, w: 27.8, p: arrow(905, 388, 905, 668, -14) },       // "others miss" -> clear bulb, wing B
      { t: 33.1, d: 0.4, w: 38.45, p: arrow(300, 388, 345, 458, 10) },       // "B, first, right" -> the three levers
      { t: 48.02, d: 0.4, w: 53.9, p: arrow(492, 1196, 490, 1136, 12) },    // "1 0 1 = 5" -> address readout
      { t: 54.76, d: 0.4, w: 59.5, p: arrow(300, 388, 345, 458, 10) },      // "3→8" -> the levers
      { t: 58.22, d: 0.4, w: WB, p: line(590, 452, 930, 452, 4) },          // "2^20" underline
      // "only THREE switches": ring round the booth's three levers
      { t: 2.3, d: 0.5, w: 6.1, p: ring(288, 1120, 180, 92, 15) },
      // "three switches": box round the levers
      { t: 13.4, d: 0.5, w: 18.4, p: pbox(156, 1026, 418, 0.2, 138) },
      // "Only that doorbell rings": ring round the ringing bell
      { t: 23.3, d: 0.4, w: 24.4, p: ring(904, 960, 58, 48, 15) },
      // "three bits of the address": boxes round the levers and the address readout
      { t: 38.0, d: 0.5, w: 43.9, p: pbox(340, 450, 528, 0.267, 120) },
      { t: 38.3, d: 0.5, w: 43.9, p: pbox(228, 985, 486, 0.267, 169) },
      // "one row of memory": box round row 5
      { t: 40.2, d: 0.5, w: 45.9, p: pbox(537, 897, 852, 0.24, 78) },
      // "One mismatch": cross right beside row 4's hollow S dot (a cross on it would strike the engraved S)
      { t: 44.3, d: 0.3, w: 46.0, p: cross(500, 866, 9) },
      // "turns on": ring round row 5's lit lamp
      { t: 51.0, d: 0.5, w: 53.3, p: ring(874, 1022, 46, 40, 15) },
      // "the word line": arrow to row 5's line, stopping short
      { t: 52.6, d: 0.5, w: 54.0, p: arrow(1050, 1120, 812, 1036, 20) },
      // "That's the decoder": box round the checker column
      { t: 60.2, d: 0.5, w: WB, p: pbox(330, 567, 508, 0.267, 460) },
      // End card box
      { t: 66.2, d: 0.4, w: END, p: box(250, 1552, 830, 1632) },
    ],
    engrave: null,
  },
];
