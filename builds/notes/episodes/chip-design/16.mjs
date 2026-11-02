// Chip-design episode 16, "What sets the switching threshold of a CMOS inverter?": notes cues on the voice-synced taps page.
// Build: npm run notes -- chip-design/16
// Times are video seconds (= audio seconds of the 2026-11-01 05:59 take). Positions are frame px (1080 x 1920).
// Each cue starts just after its word in builds/notes/episodes/chip-design/16.words.json.
// Phases (voice page): water rig 0-29.44 s, fold 29.44-30.94 s, circuit (lever, PMOS, NMOS, tank, Vin/Vout, graph) to
// the fold back at 60.04-61.54, then the water rig again; video length 67 s. The board fills y 690-1200; the high tank
// stands at x 325-570 up to y 340, so water notes sit above the board on the right (x 600-1040). Circuit readouts
// fill y 1250-1590, so circuit notes sit above the board (y 420-650).
// The figure engraves ROLLIN itself (board front face), so engrave is null.
import { END } from "../../notes-kit.mjs";
import { ring, box, tick, glass, arrow } from "../../pen.mjs";

const DIR = "shorts/chip-design/16 What sets the switching threshold of a CMOS inverter/";
// Wipes: water notes clear before the fold (29.44), circuit notes at the fold back (60.04).
const WA = 29.3;
const WB = 60.0;

export default [
  {
    name: "notes",
    source: DIR + "What sets the switching threshold of a CMOS inverter (taps, voice).html",
    out: DIR + "What sets the switching threshold of a CMOS inverter (taps, voice, notes).html",
    words: "builds/notes/episodes/chip-design/16.words.json",
    subtitles: null,
    notes: [
      // Water rig. Hook note above the tank from its spoken words.
      [760, 450, 64, 3.64, 0.9, 7.68, "expected: half full"],
      [820, 420, 46, 16.94, 0.8, 21.74, "stuck near empty"],
      [300, 1260, 46, 22.24, 0.9, 25.26, "top pipe 2.5x wider"],
      // Episode tag, top right, to the end
      [935, 330, 50, 27.6, 0.6, END, "Episode 16"],
      // Circuit. Readout and graph notes sit in the free strip between the board's front corner (y 1185) and the
      // graph (y 1247), so their arrows stay short.
      [540, 440, 44, 35.3, 1.2, 38.96, "transistor = an electric tap"],
      [800, 1215, 44, 39.46, 0.8, 42.72, "should be 0.50 V"],
      [540, 440, 44, 43.22, 1.0, 47.56, "hole = missing electron"],
      [800, 1215, 44, 46.26, 0.7, 50.26, "flips at 0.45 V"],
      [800, 1215, 44, 51.18, 0.9, 55.88, "now flips at 0.50 V"],
      [360, 1215, 44, 53.6, 1.1, 56.84, "VM = input at half output"],
      [800, 1215, 44, 56.4, 1.0, 59.0, "0.5 V of room each side"],
      // End card after the fold back: takeaway boxed in the subtitle area, next episode at the very bottom for the last 4 s.
      [540, 1408, 44, 63.0, 1.3, END, "slow holes need a wider P-moss"],
      [540, 1693, 52, 64.5, 0.7, END, "Episode 17 →", { alive: true }],
    ],
    pen: [
      // Hook: glass of water doodle beside the hook note (water analogy)
      { t: 4.0, d: 0.6, w: 7.68, p: glass(1010, 590) },
      // Ties: arrows from notes to their parts, drawn on the spoken words; the note inks just after
      { t: 3.14, d: 0.4, w: 7.68, p: arrow(930, 490, 908, 800, -20) },      // "expected: half full" -> the tank's half mark
      // "two taps": arrow to the linkage rod
      { t: 8.22, d: 0.4, w: 11.18, p: arrow(250, 690, 355, 835, 12) },
      { t: 16.44, d: 0.4, w: 21.74, p: arrow(905, 450, 912, 925, -14) },    // "stuck near empty" -> the low level
      // "narrower": ring round the narrow fill pipe
      { t: 19.8, d: 0.5, w: 23.2, p: ring(615, 740, 95, 42, 15) },
      { t: 21.74, d: 0.4, w: 25.26, p: arrow(520, 1230, 600, 790, 14) },    // "top pipe 2.5x wider" -> the wide fill pipe
      // "half full": tick beside the tank's half mark
      { t: 23.4, d: 0.3, w: 27.16, p: tick(915, 805, 1.2) },
      { t: 34.8, d: 0.4, w: 38.96, p: arrow(600, 470, 684, 822, 10) },      // "transistor" -> the P-moss valve
      { t: 38.96, d: 0.4, w: 42.72, p: arrow(630, 1225, 497, 1480, -14) },  // "should be 0.50 V" -> the Vout readout
      { t: 42.72, d: 0.4, w: 47.56, p: arrow(600, 470, 684, 822, 10) },     // "hole" -> the P-moss dots
      { t: 45.76, d: 0.4, w: 50.26, p: arrow(760, 1240, 745, 1385, 8) },    // "flips at 0.45 V" -> the curve's drop
      { t: 50.68, d: 0.4, w: 55.88, p: arrow(780, 1240, 765, 1392, 8) },    // "now flips at 0.50 V" -> the second curve
      // "switching threshold" (key): ring round the VM tick on the graph
      { t: 53.3, d: 0.5, w: 56.84, p: ring(762, 1508, 42, 30, 0) },
      { t: 53.4, d: 0.4, w: 56.84, p: arrow(530, 1235, 718, 1500, -14) },   // "VM = ..." -> the VM tick
      { t: 55.9, d: 0.4, w: 59.0, p: arrow(800, 1240, 790, 1522, 8) },      // "0.5 V of room" -> the two brackets
      // End card box
      { t: 63.2, d: 0.4, w: END, p: box(180, 1370, 900, 1446) },
    ],
    engrave: null,
  },
];
