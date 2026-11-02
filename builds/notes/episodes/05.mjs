// Episode 05, "How does a CMOS inverter work": notes cues on the voice-synced two-taps page.
// Times are video seconds (= audio seconds of 5.mp3). Positions are frame px (1080 x 1920).
// Layout: one big board (y 576-1043): input lever (290, 680), top tap / PMOS (556, 684 / 550, 716),
// bottom tap / NMOS (434, 800 / 434, 836), output tank (650, 790), lamp (780, 820). Truth table and
// waveform graph below it (y 1060-1290). Free space: above the board (y 300-560) and below the
// readouts (y 1310-1530). Phases: water 3-21 s, fold to circuit 21-24, circuit 24-39, fold back
// 39-42, water 42-54. Video length 54 s (3 s entrance + 51 s loop).
import { END, paperTable } from "../notes-kit.mjs";
import { arrow, wave, glass, box } from "../pen.mjs";

const DIR = "shorts/digital-electronics/05 How does a CMOS inverter work/";
const WA = 20.8, WB = 38.6;

// Signature on the front face (30 px, no slab patch: a thicker slab would touch the readouts):
// top edge y = 981 + 0.27 (x - 600), usable x 110..700.
const ENGRAVE = { words: ["ROLLIN", "रोलिन"], repeat: 2, sep: "-", x0: 110, x1: 700, topAt: [600, 981], slope: 0.27, face: 30, size: 12, tone: "mid" };

// Readouts (truth table + waveform) only while the circuit is on screen: fade in 22.5-23 s as the
// fold to the circuit settles, fade out 39.5-40 s at the fold back; hidden in both water phases.
// Percentages are of the 54 s video, on the capture clock.
const READOUTS = `
.reel .reel-below{animation:nt-readouts 54s linear 0s both}
@keyframes nt-readouts{0%,41.67%{opacity:0}42.59%,73.15%{opacity:1}74.07%,100%{opacity:0}}
`;

export default [
  {
    name: "notes",
    source: DIR + "How does a CMOS inverter work (two taps).html",
    out: DIR + "How does a CMOS inverter work (two taps, notes).html",
    notes: [
      // Hook
      [560, 380, 64, 0.2, 1.0, 4.3, "2 taps, not 1?"],
      // Water
      [235, 410, 44, 4.6, 0.8, 9.0, "1 handle turns 2 taps"],
      [610, 470, 44, 6.5, 1.1, 9.1, "top tap fills · bottom tap drains"],
      [540, 1440, 46, 9.4, 0.7, 13.0, "1. top tap shuts", { group: "seq" }],
      [540, 1495, 46, 10.9, 0.9, 13.0, "2. then bottom opens → drains", { group: "seq" }],
      [540, 1440, 46, 13.5, 0.9, WA, "turn back → tank refills", { group: "seq2" }],
      [540, 1495, 46, 15.4, 0.9, WA, "only 1 tap is ever open", { group: "seq2" }],
      // Episode tag, top right, stays
      [905, 300, 50, 17.7, 0.9, END, "Episode 5"],
      // Circuit: the board prints PMOS and NMOS, so the mapping is a list below the readouts.
      [540, 1440, 46, 23.4, 0.7, 28.9, "top tap → PMOS", { group: "map" }],
      [540, 1495, 46, 24.8, 0.8, 28.9, "bottom tap → NMOS", { group: "map" }],
      [235, 410, 44, 26.3, 0.7, WB, "handle = input"],
      [880, 575, 44, 28.0, 0.7, WB, "tank = output"],
      [540, 1440, 44, 29.6, 1.0, 35.5, "input 0 → PMOS on → lamp lights", { group: "io" }],
      [540, 1495, 44, 32.7, 1.0, 35.5, "input 1 → NMOS on → tank drains", { group: "io" }],
      [540, 1465, 52, 36.0, 1.0, WB, "output = opposite → inverter"],
      // The interview answer, written out in full above the board.
      [540, 318, 36, 39.2, 0.6, 49.4, "interview answer:", { group: "interview" }],
      [540, 368, 42, 40.4, 1.0, 49.4, "PMOS pulls up to VDD,", { group: "interview" }],
      [540, 418, 42, 42.4, 1.0, 49.4, "NMOS pulls down to GND,", { group: "interview" }],
      [540, 468, 42, 44.6, 1.2, 49.4, "one shared input: exactly one conducts,", { group: "interview" }],
      [540, 518, 42, 47.0, 1.1, 49.4, "so the output inverts the input.", { group: "interview" }],
      // Lead-in, above the board
      [540, 420, 50, 49.9, 1.0, END, "one more of each → NAND"],
      // End card: takeaway boxed below the readouts (they fill the subtitle area here); next
      // episode at the very bottom, line-boiling for the last 4 s (50.0-54.0).
      [540, 1470, 56, 51.5, 0.7, END, "one on, one off"],
      [540, 1693, 52, 50.0, 0.7, END, "Episode 6 →", { alive: true }],
    ],
    pen: [
      { t: 1.3, d: 0.5, w: 4.3, p: wave(400, 720, 418) },
      { t: 3.4, d: 0.6, w: 4.3, p: glass(330, 380) },
      // Water
      { t: 5.4, d: 0.4, w: 9.0, p: arrow(250, 432, 284, 652, -10) },
      { t: 7.4, d: 0.4, w: 9.1, p: arrow(500, 494, 520, 560, -8) },
      { t: 8.2, d: 0.4, w: 9.1, p: arrow(420, 494, 432, 772, 10) },
      // Circuit
      { t: 26.9, d: 0.4, w: WB, p: arrow(250, 432, 284, 652, -10) },
      { t: 28.6, d: 0.4, w: WB, p: arrow(860, 598, 726, 730, 12) },
      // End card box
      { t: 52.2, d: 0.4, w: END, p: box(370, 1434, 710, 1506) },
    ],
    engrave: ENGRAVE,
    css: paperTable(".inv-table") + READOUTS,
  },
];
