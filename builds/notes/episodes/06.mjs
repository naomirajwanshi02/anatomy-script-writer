// Episode 06, "How do you build a NAND gate in CMOS": notes cues on the voice-synced taps page.
// Times are video seconds (= audio seconds of 6.mp3). Positions are frame px (1080 x 1920).
// Layout: one big board (y 539-1004): levers at (300, 640) and (230, 710); top taps / PMOS pair at
// (548, 650)-(652, 676) under the supply tank (x 490-774, y 536-684); bottom taps / NMOS pair in a
// row at (444, 750)-(404, 784); output tank x 622-772, y 700-840; drain x 232-480, y 796-900; lamp
// (804, 784). Truth table below (x 373-706, y 1099-1448). Free space: above the board (y 300-520),
// beside the table (x 40-360 and 720-1040), below it (y 1455-1530). Phases: water 3-20 s, fold to
// circuit 20-23, circuit 23-41, fold back 41-44, water 44-55.5. Video length 55.5 s.
import { END, paperTable } from "../notes-kit.mjs";
import { arrow, wave, glass, box } from "../pen.mjs";

const DIR = "shorts/digital-electronics/06 How do you build a NAND gate in CMOS/";
const WA = 20.3, WB = 40.4;

// Board patch: 9-unit slab instead of 5 (grown downward, parts keep their places) for the engraving.
const THICK = ["halo:Of($e,-5,5,A),board:_e($e,-5,5,A,5,.8)", "halo:Of($e,-9,9,A),board:_e($e,-9,9,A,5,.8)", "board slab 5 -> 9"];

// Signature on the right part of the front face (left part stays clear for arrows):
// top edge y = 943 + 0.267 (x - 600), 43 px tall on the 9-unit slab, text between x 420 and 720.
const ENGRAVE = { words: ["ROLLIN", "रोलिन"], repeat: 2, sep: "-", x0: 420, x1: 720, topAt: [600, 943], slope: 0.267, face: 43, size: 14, tone: "mid" };

export default [
  {
    name: "notes",
    source: DIR + "How do you build a NAND gate in CMOS (taps, voice).html",
    out: DIR + "How do you build a NAND gate in CMOS (taps, voice, notes).html",
    notes: [
      // Hook
      [580, 380, 64, 0.2, 1.0, 4.4, "why is PMOS on top?"],
      // Water: 2 taps side by side fill, 2 in a row drain
      [890, 500, 40, 4.7, 0.8, 9.4, "top 2, side by side", { group: "t" }],
      [890, 550, 40, 5.5, 0.6, 9.4, "→ fill the tank", { group: "t" }],
      [190, 1150, 40, 7.2, 0.7, 9.4, "bottom 2, in a row", { group: "b" }],
      [190, 1200, 40, 8.0, 0.5, 9.4, "→ drain", { group: "b" }],
      [880, 1341, 40, 9.8, 0.9, 18.0, "A alone → stays full", { group: "ab" }],
      [880, 1270, 40, 13.8, 0.9, 18.0, "B alone → still full", { group: "ab" }],
      [580, 450, 50, 15.6, 0.9, WA, "it never empties"],
      // Episode tag, top right, stays
      [905, 300, 50, 17.1, 0.9, END, "Episode 6"],
      // Circuit
      [870, 560, 40, 23.3, 0.8, 28.3, "2 PMOS in parallel"],
      [580, 450, 46, 25.5, 1.1, 30.7, "PMOS passes a strong 1 → near VDD"],
      [190, 1150, 40, 28.7, 0.8, 34.2, "2 NMOS in series"],
      [880, 1412, 40, 31.2, 0.8, 37.6, "1 1 → drains"],
      [880, 1300, 40, 34.5, 1.0, 37.6, "any 0 → a PMOS refills"],
      [580, 450, 50, 37.9, 1.1, WB, "0 only when both are 1 → NAND"],
      // The interview answer, written out in full above the board.
      [580, 318, 36, 40.9, 0.6, 50.4, "interview answer:", { group: "interview" }],
      [580, 368, 42, 42.4, 1.0, 50.4, "2 PMOS in parallel to VDD,", { group: "interview" }],
      [580, 418, 42, 45.5, 1.0, 50.4, "2 NMOS in series to GND,", { group: "interview" }],
      [580, 468, 42, 47.4, 1.3, 50.4, "so the output goes low only when both are high.", { group: "interview" }],
      // Lead-in, above the board
      [580, 420, 50, 50.9, 0.9, END, "swap them → NOR"],
      // End card: takeaway boxed below the table (the table fills the subtitle area); next episode at
      // the very bottom, line-boiling for the last 4 s (51.5-55.5).
      [540, 1492, 50, 52.4, 0.8, END, "parallel up · series down"],
      [540, 1693, 52, 51.5, 0.7, END, "Episode 7 →", { alive: true }],
    ],
    pen: [
      { t: 1.3, d: 0.5, w: 4.4, p: wave(390, 770, 418) },
      { t: 2.6, d: 0.6, w: 4.4, p: glass(330, 380) },
      // Water
      { t: 6.2, d: 0.4, w: 9.4, p: arrow(880, 572, 792, 694, 10) },
      { t: 8.5, d: 0.4, w: 9.4, p: arrow(170, 1122, 226, 914, -10) },
      { t: 16.6, d: 0.5, w: WA, p: wave(460, 700, 482) },
      // Circuit
      { t: 24.1, d: 0.4, w: 28.3, p: arrow(850, 582, 702, 686, 12) },
      { t: 29.4, d: 0.45, w: 34.2, p: arrow(210, 1122, 384, 838, -12) },
      { t: 39.0, d: 0.5, w: WB, p: wave(330, 830, 482) },
      // End card box
      { t: 53.2, d: 0.4, w: END, p: box(300, 1456, 780, 1528) },
    ],
    engrave: ENGRAVE,
    patches: [THICK],
    css: paperTable(".g-table"),
  },
];
