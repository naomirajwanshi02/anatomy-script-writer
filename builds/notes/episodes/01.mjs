// Episode 01, "Why do computers use binary": notes cues on the voice-synced bulb-meter page.
// Times are video seconds (= audio seconds of 1.mp3). Positions are frame px (1080 x 1920).
// Board phases in the source page: meters 3-23 s (noise 12.5-17.5), fold to circuit 23-26,
// circuit 26-36.5 (truth table counts 29-34), fold back 36.5-38.5, meters + noise 39.5-49,
// fold to circuit 50-53 (settled at 53).
import { END } from "../notes-kit.mjs";
import { arrow, both, wave, squiggle, tick, bulb, ring, box } from "../pen.mjs";

const DIR = "shorts/digital-electronics/01 Why do computers use binary/";
const SOURCE = DIR + "Why do computers use binary (bulb meter, voice).html";
const WORDS = "builds/notes/episodes/01.words.json";

// Wipes: notes above and below the board clear at each fold.
const WA = 22.9, WB = 36.2, WC = 49.6;

// Board patch: 9-unit slab instead of 5 (grown downward, parts keep their places) for the engraving.
const THICK = ["halo:Td(Or,-5,5,H),board:Ft(Or,-5,5,H,5,.8)", "halo:Td(Or,-9,9,H),board:Ft(Or,-9,9,H,5,.8)", "board slab 5 -> 9"];

// Signature on the front face (measured on the 9-unit slab: top edge y = 1048 + 0.267 (x - 500),
// face 43 px tall, usable x 130..820).
const ENGRAVE = { words: ["ROLLIN", "रोलिन"], repeat: 2, sep: "-", x0: 130, x1: 820, topAt: [500, 1048], slope: 0.267, face: 43, size: 15, tone: "mid" };

// Pen marks shared by both variants (times differ for three arrows, set below).
const penCore = (noiseAt, steadyAt) => [
  // Meters
  { t: 1.6, d: 0.5, w: WA, p: wave(495, 720, 488) },
  { t: 3.5, d: 0.8, w: WA, p: bulb(300, 415) },
  { t: 9.2, d: 0.4, w: WA, p: arrow(470, 702, 518, 762, 16) },
  { t: 10.9, d: 0.4, w: WA, p: arrow(752, 760, 708, 848, 16) },
  { t: 12.9, d: 0.5, w: WA, p: squiggle(186, 270, 1112, 6, 3) },
  { t: noiseAt, d: 0.4, w: WA, p: arrow(318, 1046, 304, 994, -10) },
  { t: 15.1, d: 0.4, w: WA, p: arrow(452, 812, 488, 850, -14) },
  { t: steadyAt, d: 0.4, w: WA, p: arrow(772, 892, 742, 920, 12) },
  // Circuit: lever, pattern ticks, underline
  { t: 28.9, d: 0.4, w: WB, p: arrow(336, 708, 322, 760, -12) },
  { t: 31.5, d: 0.25, w: WB, p: tick(620, 1275) },
  { t: 32.2, d: 0.25, w: WB, p: tick(730, 1275) },
  { t: 33.0, d: 0.25, w: WB, p: tick(840, 1275) },
  { t: 33.6, d: 0.25, w: WB, p: tick(950, 1275) },
  { t: 35.5, d: 0.5, w: WB, p: wave(555, 760, 515) },
  // Noise-margin sketch
  { t: 36.6, d: 0.35, w: WC, p: "M660 470 Q770 466 880 471" },
  { t: 36.9, d: 0.35, w: WC, p: "M660 640 Q770 643 880 639" },
  { t: 37.3, d: 0.45, w: WC, p: both(700, 482, 700, 628) },
  { t: 38.2, d: 0.7, w: WC, p: squiggle(420, 628, 555, 9, 3) },
  { t: 44.6, d: 0.8, w: WC, p: box(640, 432, 940, 676) },
];
const penEnd = [
  { t: 52.8, d: 0.7, w: END, p: ring(276, 872, 102, 90) },
  { t: 53.6, d: 0.4, w: END, p: arrow(268, 1168, 262, 984, 12) },
  { t: 54.4, d: 0.5, w: END, p: box(600, 1168, 980, 1244) },
];

// Notes shared by both variants: [x, y, size, start, duration, wipe, text].
const notesCircuit = [
  [900, 330, 54, 18.1, 0.9, END, "Episode 1"],
  [330, 1210, 48, 25.1, 0.9, WB, "supply → switch"],
  [300, 630, 46, 27.3, 0.5, WB, "0 = off"],
  [300, 686, 46, 28.4, 0.5, WB, "1 = on"],
  [620, 1225, 52, 30.4, 0.25, WB, "00"],
  [730, 1225, 52, 30.6, 0.25, WB, "01"],
  [840, 1225, 52, 30.8, 0.25, WB, "10"],
  [950, 1225, 52, 31.0, 0.25, WB, "11"],
  [540, 470, 72, 34.5, 1.0, WB, "binary = 2 levels"],
  [905, 470, 44, 36.7, 0.25, WC, "1"],
  [905, 640, 44, 37.0, 0.25, WC, "0"],
  [800, 555, 40, 37.5, 0.6, WC, "wide gap"],
  [530, 610, 40, 39.0, 0.6, WC, "can't cross"],
  [790, 400, 46, 45.0, 0.8, WC, "noise margin"],
];
const notesEnd = [
  [285, 1205, 50, 53.2, 0.6, END, "transistor?"],
  [790, 1205, 50, 53.8, 0.7, END, "2 levels = safe"],
  [790, 1300, 46, 54.6, 0.5, END, "Episode 2 →"],
];

export default [
  {
    // Short labels on the arrows + printed three-tone subtitles from the transcript.
    name: "notes",
    crowd: false, // approved before the crowding rule; kept as is
    source: SOURCE,
    out: DIR + "Why do computers use binary (bulb meter, voice, notes).html",
    words: WORDS,
    subtitles: [
      [0.0, 1.95, "Computers only know two words."], [2.2, 3.05, "Why only two?"],
      [3.2, 4.7, "Let's test it with light."], [4.9, 6.65, "Two bulbs share one power supply."],
      [6.8, 7.75, "Each has a meter."], [7.9, 9.6, "The left meter has five levels."],
      [9.8, 11.0, "The right meter has two."], [11.15, 12.1, "Off and on."],
      [12.3, 13.8, "Now the supply gets noisy."], [13.9, 15.6, "The five-level meter keeps jumping."],
      [15.8, 17.85, "The two-level meter never moves."], [18.0, 19.2, "Welcome to episode 1"],
      [19.2, 20.6, "of Digital Electronics."], [20.8, 22.8, "So how does a chip use this?"],
      [23.1, 24.7, "Now turn this into a circuit."], [24.85, 26.4, "The supply becomes a switch."],
      [26.55, 28.15, "A switch is off or on."], [28.3, 29.15, "Zero or one."],
      [29.3, 31.15, "Two switches give four patterns."], [31.35, 32.85, "Zero zero, zero one,"],
      [32.9, 34.2, "one zero, one one."], [34.3, 36.2, "That is why computers use binary."],
      [36.3, 37.85, "The two levels are far apart,"], [37.9, 40.45, "so small noise cannot turn one into the other."],
      [40.65, 42.35, "In an interview, say this:"], [42.5, 44.05, "Binary uses two voltage levels"],
      [44.05, 45.35, "with a wide noise margin,"], [45.4, 47.3, "so small noise cannot flip a bit,"],
      [47.35, 49.6, "and each bit is one on or off switch."], [49.85, 51.3, "So what is that switch?"],
      [51.45, 52.35, "A transistor."], [52.45, 55.5, "That's episode 2."],
    ],
    notes: [
      [540, 430, 84, 0.3, 1.1, WA, "only 2 words"],
      [445, 676, 46, 8.9, 0.6, WA, "5 levels"],
      [775, 736, 46, 10.6, 0.6, WA, "2 levels"],
      [228, 1066, 44, 13.4, 0.5, WA, "noise"],
      [400, 802, 42, 14.7, 0.6, WA, "misread"],
      [810, 876, 42, 17.0, 0.5, WA, "steady"],
      ...notesCircuit,
      [400, 802, 42, 46.4, 0.5, WC, "misread"],
      [810, 876, 42, 47.0, 0.5, WC, "steady"],
      [560, 1215, 54, 47.7, 1.0, WC, "1 bit = 1 switch"],
      ...notesEnd,
    ],
    pen: [
      ...penCore(13.7, 17.3),
      { t: 46.5, d: 0.4, w: WC, p: arrow(452, 812, 488, 850, -14) },
      { t: 47.2, d: 0.4, w: WC, p: arrow(772, 892, 742, 920, 12) },
      ...penEnd,
    ],
    engrave: ENGRAVE,
    patches: [THICK],
  },
  {
    // No subtitles: condensed voiceover beats as notes on their arrows, interview answer in full.
    // This is the version exported as the reel.
    name: "notes-2",
    crowd: false, // approved before the crowding rule; kept as is
    source: SOURCE,
    out: DIR + "Why do computers use binary (bulb meter, voice, notes 2).html",
    notes: [
      [540, 430, 84, 0.3, 1.1, WA, "only 2 words"],
      [540, 560, 46, 3.3, 0.8, 7.6, "test it with light"],
      [445, 676, 46, 8.9, 0.6, WA, "5 levels"],
      [790, 736, 44, 10.6, 0.8, WA, "2 levels: off / on"],
      [228, 1066, 44, 12.6, 0.5, WA, "add noise"],
      [400, 802, 42, 14.7, 0.6, WA, "misread"],
      [868, 876, 42, 16.6, 0.6, WA, "never moves"],
      [560, 1250, 48, 21.0, 0.9, WA, "how does a chip use this?"],
      ...notesCircuit,
      [785, 1335, 44, 29.4, 0.8, WB, "2 switches → 4 patterns"],
      // The interview answer, written out in full; it stays until the end card needs the space.
      [540, 1250, 40, 40.8, 0.6, 52.6, "interview answer:"],
      [540, 1310, 48, 42.5, 1.2, 52.6, "Binary = 2 voltage levels"],
      [540, 1368, 48, 44.1, 1.0, 52.6, "with a wide noise margin,"],
      [540, 1426, 48, 45.4, 1.4, 52.6, "so small noise can't flip a bit."],
      [540, 1484, 48, 47.4, 1.4, 52.6, "Each bit = 1 on/off switch."],
      // End card: the takeaway boxed in the centre of the subtitle area; the next episode at the very
      // bottom (fixed size), line-boiling for the last 4 s (51.5-55.5).
      [285, 1205, 50, 53.2, 0.6, END, "transistor?"],
      [540, 1408, 56, 53.0, 0.6, END, "2 levels = safe"],
      [540, 1693, 52, 51.5, 0.7, END, "Episode 2 →", { alive: true }],
    ],
    pen: [
      ...penCore(13.0, 16.2),
      { t: 52.8, d: 0.7, w: END, p: ring(276, 872, 102, 90) },
      { t: 53.6, d: 0.4, w: END, p: arrow(268, 1168, 262, 984, 12) },
      { t: 53.3, d: 0.4, w: END, p: box(360, 1372, 720, 1444) },
    ],
    engrave: ENGRAVE,
    patches: [THICK],
  },
];
