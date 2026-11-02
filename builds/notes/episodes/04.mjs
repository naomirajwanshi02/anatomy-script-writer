// Episode 04, "Why is NAND called a universal gate": notes cues on the voice-synced NAND page.
// Times are video seconds (= audio seconds of 4.mp3). Positions are frame px (1080 x 1920).
// Layout: one NAND board (y 567-950; levers A, B at the back left, NAND block x 400-683, lamp at
// 790, 760), truth table below it (x 367-717, rows 00 y 1130, 01 1200, 10 1273, 11 1343). No fold:
// the board only shows NAND switching, so the notes spell out how NOT, AND and OR are built.
// Free space: above the board (y 300-560), right of the table (x 760-1050), below it (y 1390-1530).
// Video length 48.5 s (3 s entrance + 45.5 s loop).
import { END, paperTable } from "../notes-kit.mjs";
import { arrow, wave, tick, bulb, box } from "../pen.mjs";

const DIR = "shorts/digital-electronics/04 Why is NAND called a universal gate/";

// Signature on the front face (31 px, no slab patch; this board stands on feet):
// top edge y = 856 + 0.267 (x - 600), usable x 130..820.
const ENGRAVE = { words: ["ROLLIN", "रोलिन"], repeat: 2, sep: "-", x0: 130, x1: 820, topAt: [600, 856], slope: 0.267, face: 31, size: 12, tone: "mid" };

export default [
  {
    name: "notes",
    source: DIR + "Why is NAND called a universal gate.html",
    out: DIR + "Why is NAND called a universal gate (notes).html",
    notes: [
      // Hook
      [540, 390, 64, 0.2, 1.0, 4.3, "1 gate builds them all"],
      [905, 300, 50, 2.0, 0.9, END, "Episode 4"],
      // Which gate: NAND
      [540, 450, 50, 6.0, 0.9, 15.5, "NAND = NOT AND"],
      [770, 1203, 42, 10.0, 0.4, 18.5, "→ on", { group: "rows" }],
      [800, 1271, 42, 11.5, 0.6, 18.5, "→ still on", { group: "rows" }],
      [775, 1339, 42, 13.6, 0.5, 18.5, "→ dark", { group: "rows" }],
      // Every gate from NAND
      [540, 1450, 46, 17.0, 1.0, 28.0, "every gate can be built from it"],
      [540, 335, 46, 19.6, 0.9, 32.8, "tie A and B together → NOT", { group: "build" }],
      [540, 400, 46, 22.4, 0.9, 32.8, "NAND, then NOT → AND", { group: "build" }],
      [540, 465, 46, 25.0, 1.1, 32.8, "NOT each input, then NAND → OR", { group: "build" }],
      [540, 1450, 46, 28.6, 0.9, 32.8, "AND, OR, NOT → any circuit", { group: "logic" }],
      [540, 1505, 46, 31.5, 0.8, 32.8, "so NAND alone can too", { group: "logic" }],
      // The interview answer, written out in full above the board; it stays to the end.
      [540, 320, 36, 33.4, 0.6, END, "interview answer:", { group: "interview" }],
      [540, 375, 46, 34.9, 0.8, END, "NAND is universal because NOT,", { group: "interview" }],
      [540, 430, 46, 37.2, 1.0, END, "AND and OR can all be built", { group: "interview" }],
      [540, 485, 46, 38.6, 0.8, END, "from NAND gates alone,", { group: "interview" }],
      [540, 1450, 46, 40.0, 1.2, 43.8, "and those build any Boolean function.", { group: "interview" }],
      // End card: takeaway boxed below the table (the subtitle area is the table here); next
      // episode at the very bottom, line-boiling for the last 4 s (44.5-48.5).
      [540, 1450, 54, 44.3, 0.8, END, "NAND builds everything"],
      [540, 1693, 52, 44.5, 0.7, END, "Episode 5 →", { alive: true }],
    ],
    pen: [
      { t: 1.2, d: 0.5, w: 4.3, p: wave(330, 760, 428) },
      { t: 2.6, d: 0.6, w: 4.3, p: bulb(170, 380) },
      { t: 7.0, d: 0.4, w: 15.5, p: arrow(560, 478, 560, 600, 10) },
      { t: 10.4, d: 0.3, w: 18.5, p: tick(845, 1201) },
      { t: 12.2, d: 0.3, w: 18.5, p: tick(900, 1269) },
      { t: 17.8, d: 0.5, w: 28.0, p: wave(330, 750, 1482) },
      // End card box
      { t: 45.1, d: 0.4, w: END, p: box(300, 1414, 780, 1486) },
    ],
    engrave: ENGRAVE,
    css: paperTable(".gate-table"),
  },
];
