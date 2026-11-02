// Chip-design episode 15, "What is a tri-state buffer and why does a bus need it?": notes cues on the voice-synced tank page.
// Build: npm run notes -- chip-design/15
// Times are video seconds (= audio seconds of the 2026-11-01 05:49 take). Positions are frame px (1080 x 1920).
// Each cue starts just after its word in builds/notes/episodes/chip-design/15.words.json (53.3-57.2 s untranscribed;
// the words there were added to 15.words.json, timed from the pauses: DISCONNECTED 53.5).
// Phases (voice page): tank 0-28.0 s, fold 28.0-29.8, circuit (VDD/GND rails, three chips on one bus) to the fold
// back at 62.14, then the tank again; video length 71 s. The board fills y 590-1082, readouts y 1137-1518, so notes
// sit above the board (y 440-520) or in the strip between board and table (y 1135).
// The figure engraves ROLLIN itself (board front face), so engrave is null.
import { END } from "../../notes-kit.mjs";
import { ring, box, arrow } from "../../pen.mjs";

const DIR = "shorts/chip-design/15 What is a tri-state buffer and why does a bus need it/";
// Wipes: tank notes clear before the fold (28.0), circuit notes at the fold back.
const WA = 27.9;
const WB = 61.9;
// Parallelogram box that follows the board slope (hand-drawn: the last side runs a little past the start corner).
const pbox = (x0, y0, x1, slope, h) => {
  const y1 = y0 + (x1 - x0) * slope;
  return `M${x0 - 4} ${y0 - 1} L${x1} ${y1} L${x1} ${y1 + h} L${x0} ${y0 + h} L${x0} ${y0 - 8}`;
};

export default [
  {
    name: "notes",
    source: DIR + "What is a tri-state buffer and why does a bus need it (tank, voice).html",
    out: DIR + "What is a tri-state buffer and why does a bus need it (tank, voice, notes).html",
    words: "builds/notes/episodes/chip-design/15.words.json",
    subtitles: null,
    notes: [
      // Tank
      [760, 370, 46, 16.36, 0.9, 19.92, "fill in = drain out"],
      [540, 1135, 42, 20.42, 1.3, 24.48, "locked: shut, still reads gauge"],
      // Episode tag, top right, to the end
      [935, 330, 50, 26.7, 0.6, END, "Episode 15"],
      // Circuit
      [420, 440, 46, 33.42, 1.0, 38.14, "full = VDD, empty = GND"],
      [420, 520, 46, 38.64, 1.0, 41.96, "blue pushes, red pulls"],
      [420, 440, 46, 42.9, 1.1, 44.8, "supply to ground: a short"],
      [540, 1135, 42, 54.0, 1.2, 58.24, "Z = not pushing or pulling"],
      [420, 440, 46, 58.5, 0.9, WB, "only chip 1 enabled"],
      // End card after the fold back: takeaway boxed below the board, next episode at the very bottom for the last 4 s.
      [540, 1590, 46, 67.0, 1.2, END, "one drives, the rest let go"],
      [540, 1693, 52, 68.5, 0.7, END, "Episode 16 →", { alive: true }],
    ],
    pen: [
      // "FIGHT": arrow from pair 1's fill tap towards pair 2's drain tap (tips must stop short of the dense pipes)
      { t: 1.6, d: 0.5, w: 6.5, p: arrow(300, 560, 433, 660, -60) },
      // "Three tap pairs": box round the three tap pairs and their locks
      { t: 6.52, d: 0.5, w: 11.1, p: pbox(80, 600, 700, 0.267, 334) },
      // "water rushes": arrow along the rush, top pipe down to the gutter
      { t: 14.54, d: 0.5, w: 17.26, p: arrow(560, 560, 580, 895, 40) },
      // Ties: arrows from notes to their parts, drawn on the spoken words; the note inks just after
      { t: 15.86, d: 0.4, w: 19.92, p: arrow(780, 400, 812, 622, -10) },    // "fill in = drain out" -> the half level
      { t: 19.92, d: 0.4, w: 24.48, p: arrow(485, 1108, 472, 975, 6) },     // "locked" -> locks 2 and 3
      { t: 32.92, d: 0.4, w: 38.14, p: arrow(450, 470, 500, 608, 10) },     // "full = VDD" -> the VDD rail
      { t: 38.14, d: 0.4, w: 41.96, p: arrow(290, 548, 330, 662, 8) },      // "blue pushes, red pulls" -> chip 1's switches
      { t: 42.45, d: 0.4, w: 44.8, p: arrow(600, 470, 420, 740, 10) },      // "a short" -> the rust strap
      // "in between": ring round the "?" under the bus meter
      { t: 44.1, d: 0.4, w: 46.2, p: ring(826, 1500, 44, 32, 10) },
      // "Off, both switches": arrow to EN lever 2
      { t: 47.34, d: 0.4, w: 51.16, p: arrow(200, 1110, 290, 935, -10) },
      // "DISCONNECTED" (key): ring round chip 2's Z tag
      { t: 53.5, d: 0.5, w: 57.26, p: ring(500, 678, 34, 30, 0) },
      { t: 53.6, d: 0.4, w: 58.24, p: arrow(760, 1160, 642, 1358, -8) },  // "Z = not pushing or pulling" -> Z in table row 2
      // "clean one": ring round the bus meter's "1"
      { t: 57.4, d: 0.4, w: 58.24, p: ring(826, 1500, 44, 32, 10) },
      // "tri-state buffer": box round chip 1 and its EN lever
      { t: 58.24, d: 0.5, w: WB, p: "M264 652 L408 652 L408 735 L300 790 L212 900 L130 900 L130 780 L268 648" },
      // End card box
      { t: 67.2, d: 0.4, w: END, p: box(240, 1552, 840, 1632) },
    ],
    engrave: null,
  },
];
