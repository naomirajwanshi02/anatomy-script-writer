// Episode 02, "How does a transistor work as a switch": notes cues on the voice-synced water-tap page.
// Times are video seconds (= audio seconds of 2.mp3). Positions are frame px (1080 x 1920).
// Board phases in the source page: water 3-19 s (tap open about 9.5-13, shut 13.5), fold to circuit
// 19.5-22 (settled at 22), circuit 22-55 (gate 1 and lamp lit about 30-33), fold back to water 55.5-57.
// Video length 58.5 s (3 s entrance + 55.5 s loop).
import { END } from "../notes-kit.mjs";
import { arrow, wave, tick, cross, glass, box } from "../pen.mjs";

const DIR = "shorts/digital-electronics/02 How does a transistor work as a switch/";

// Wipes: water notes clear before the fold, circuit notes before the fold back.
const WA = 18.6, WC = 55.2;

// Signature on the front face. This board is already thick enough (face 39 px, no slab patch):
// top edge y = 1052 + 0.265 (x - 400), usable x 120..730 (measured on the 10 s frame).
const ENGRAVE = { words: ["ROLLIN", "रोलिन"], repeat: 2, sep: "-", x0: 120, x1: 730, topAt: [400, 1052], slope: 0.265, face: 39, size: 15, tone: "mid" };

export default [
  {
    name: "notes",
    crowd: false, // approved before the crowding rule; kept as is
    source: DIR + "How does a transistor work as a switch (water tap, voice).html",
    out: DIR + "How does a transistor work as a switch (water tap, voice, notes).html",
    notes: [
      // Hook
      [540, 430, 84, 0.3, 1.0, WA, "just a switch"],
      [540, 545, 46, 2.6, 0.8, 3.6, "but switch what?"],
      [540, 545, 46, 4.15, 0.7, 9.0, "see it with water"],
      // Water: tank, drain, handle
      [800, 640, 46, 5.9, 0.6, WA, "high tank"],
      [500, 1245, 46, 7.0, 0.6, WA, "low drain"],
      [440, 690, 46, 9.4, 0.5, WA, "handle"],
      [200, 1245, 46, 11.9, 0.7, WA, "open → flows"],
      [200, 1305, 46, 13.5, 0.7, WA, "shut → stops"],
      // Episode tag, top right, stays
      [900, 330, 54, 15.2, 0.9, END, "Episode 2"],
      // Circuit: what each part became
      [780, 620, 46, 20.3, 0.7, 29.4, "tank → VDD"],
      [300, 1245, 46, 22.0, 0.7, 35.4, "drain → GND"],
      [560, 520, 46, 23.6, 0.9, 29.4, "pipe → wire + lamp"],
      [790, 1245, 46, 25.7, 0.8, 35.4, "tap → NMOS"],
      [330, 640, 46, 28.1, 0.7, 38.8, "handle = gate"],
      [780, 620, 46, 29.9, 0.9, 38.8, "gate 1 → current flows"],
      [780, 690, 46, 33.8, 0.8, 38.8, "gate 0 → it stops"],
      // Takeaway above the board
      [540, 450, 64, 35.8, 1.1, 47.4, "a voltage flips it"],
      // The interview answer, written out in full below the board; it stays until the end card.
      [540, 1250, 40, 39.1, 0.6, 52.6, "interview answer:"],
      [540, 1310, 48, 40.7, 1.2, 52.6, "NMOS conducts when its gate"],
      [540, 1368, 48, 42.9, 1.0, 52.6, "is above the threshold,"],
      [540, 1426, 48, 44.3, 1.0, 52.6, "and is off below it:"],
      [540, 1484, 48, 45.9, 1.1, 52.6, "a voltage-controlled switch."],
      // Lead-in to episode 3, above the board
      [540, 520, 50, 48.0, 0.8, WC, "1 switch = on / off"],
      [540, 590, 50, 50.3, 1.0, WC, "many switches → decisions?"],
      // End card: takeaway boxed in the centre of the subtitle area; next episode at the very bottom
      // (fixed size), line-boiling for the last 4 s (54.5-58.5).
      [540, 1408, 56, 52.9, 0.7, END, "voltage = switch"],
      [540, 1693, 52, 54.5, 0.7, END, "Episode 3 →", { alive: true }],
    ],
    pen: [
      // Hook doodles
      { t: 1.4, d: 0.5, w: WA, p: wave(395, 690, 488) },
      { t: 4.6, d: 0.6, w: WA, p: glass(282, 425) },
      // Water
      { t: 6.4, d: 0.4, w: WA, p: arrow(790, 665, 774, 734, 14) },
      { t: 7.5, d: 0.4, w: WA, p: arrow(520, 1215, 546, 1166, -10) },
      { t: 9.8, d: 0.45, w: WA, p: arrow(470, 712, 610, 902, -20) },
      { t: 12.5, d: 0.3, w: WA, p: tick(378, 1247) },
      { t: 14.1, d: 0.3, w: WA, p: cross(378, 1305, 11) },
      // Circuit
      { t: 21.6, d: 0.4, w: 29.4, p: arrow(840, 645, 880, 893, -14) },
      { t: 22.6, d: 0.4, w: 35.4, p: arrow(262, 1215, 250, 1004, 12) },
      { t: 24.4, d: 0.45, w: 29.4, p: arrow(600, 545, 712, 824, -18) },
      { t: 26.4, d: 0.4, w: 35.4, p: arrow(730, 1212, 590, 1012, 18) },
      { t: 28.7, d: 0.4, w: 38.8, p: arrow(360, 664, 412, 796, -12) },
      { t: 32.8, d: 0.3, w: 38.8, p: tick(800, 845, 1.3) },
      { t: 36.8, d: 0.5, w: 47.4, p: wave(410, 680, 500) },
      // End card box
      { t: 53.3, d: 0.4, w: END, p: box(350, 1372, 730, 1444) },
    ],
    engrave: ENGRAVE,
  },
];
