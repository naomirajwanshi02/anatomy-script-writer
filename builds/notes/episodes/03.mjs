// Episode 03, "What are the basic logic gates": notes cues on the voice-synced taps page.
// Times are video seconds (= audio seconds of 3.mp3). Positions are frame px (1080 x 1920).
// Layout: three boards stacked (AND y 431-679, OR y 863-1111, NOT y 1295-1543), each with its truth
// table on the right (x 733-978). Free space: top band (y 300-420, left of x 700), gap 1 (y 690-850)
// and gap 2 (y 1120-1285), full width. No room in the subtitle area, so the boxed takeaway goes in the
// top band. Phases: water 3-20 s, fold to circuit 20-23, circuit 23-39, fold back 39-41, water 41-54.5.
// Video length 54.5 s (3 s entrance + 51.5 s loop).
import { END } from "../notes-kit.mjs";
import { arrow, wave, glass, box } from "../pen.mjs";

const DIR = "shorts/digital-electronics/03 What are the basic logic gates/";
const WA = 20.3, WB = 38.6;

// Signature on every board's front face (no slab patch: faces are 31 px). Board 1 front face top edge
// y = 602 + 0.267 (x - 400); boards 2 and 3 are the same, 432 and 864 px lower. Usable x 150..540.
const face = (board, dy) => ({ board, words: ["ROLLIN", "रोलिन"], repeat: 2, sep: "-", x0: 150, x1: 540, topAt: [400, 602 + dy], slope: 0.267, face: 31, size: 12, tone: "mid" });

// Truth tables restyled as paper cards (testers/truth-table-styles.html, style 2): the table on a flat
// paper card (face #f6ecd6) with an ink outline (1.8 px at 1080), muted headers over a thin rule,
// plain ink rows, the current row on the lit shade in strong ink with only its output in rust.
const TABLES = `
.reel .bg-row .bg-readout{gap:calc(var(--fw) * .016)}
.reel .bg-row .bg-eq{font-size:calc(var(--fw) * .04)}
.reel .bg-row table.bg-table{font-size:calc(var(--fw) * .036) !important;line-height:1;border-collapse:separate;border-spacing:0;background:#f6ecd6;border:calc(var(--fw) * .00167) solid #3b2a1a;border-radius:calc(var(--fw) * .012);padding:calc(var(--fw) * .012) calc(var(--fw) * .009)}
.reel .bg-row .bg-table th{color:var(--anatomy-muted);font-weight:400;padding:0 calc(var(--fw) * .028) calc(var(--fw) * .011) !important;border-bottom:calc(var(--fw) * .0012) solid var(--anatomy-faint) !important}
.reel .bg-row .bg-table td{color:var(--anatomy-text);padding:calc(var(--fw) * .009) calc(var(--fw) * .028) !important}
.reel .bg-row .bg-table tbody tr:first-child td{padding-top:calc(var(--fw) * .014) !important}
.reel .bg-row .bg-table tr[data-now] td{background:#ecdcbc;color:var(--anatomy-strong)}
.reel .bg-row .bg-table tr[data-now] td:last-child{color:#b5541c}
`;

export default [
  {
    name: "notes",
    source: DIR + "What are the basic logic gates (taps).html",
    out: DIR + "What are the basic logic gates (taps, notes).html",
    // Kept sparse on purpose: this frame is full (three boards, three tables). One short note per
    // board per phase, never more than 3 notes on screen.
    notes: [
      // Hook (top band)
      [430, 325, 64, 0.2, 1.0, 5.8, "AND · OR · NOT"],
      // Water: one note per board
      [500, 370, 44, 6.4, 0.9, 10.2, "in a row: both must open"],
      [500, 800, 44, 10.5, 0.9, WA, "side by side: either opens"],
      [430, 345, 50, 15.5, 1.0, WA, "AND = both · OR = either"],
      // Episode tag, top right, stays
      [905, 300, 50, 17.8, 0.9, END, "Episode 3"],
      // Circuit: one word per gap
      [430, 760, 50, 24.5, 0.5, 34.0, "→ AND"],
      [430, 1190, 50, 28.7, 0.5, 34.0, "→ OR"],
      [430, 1215, 50, 34.6, 0.6, WB, "→ NOT flips it"],
      // The interview answer, one line beside each gate's board; it stays to the end.
      [430, 770, 44, 39.9, 1.2, END, "AND: 1 only if all inputs are 1", { group: "interview" }],
      [430, 1190, 44, 42.6, 1.0, END, "OR: 1 if any input is 1", { group: "interview" }],
      [430, 1245, 44, 44.8, 0.9, END, "NOT: flips its input", { group: "interview" }],
      // End card: no room in the subtitle area, so the boxed takeaway sits in the top band; the next
      // episode at the very bottom, line-boiling for the last 4 s (50.5-54.5).
      [430, 350, 54, 49.0, 0.8, END, "1 gate does all 3?"],
      [540, 1693, 52, 50.5, 0.7, END, "Episode 4 →", { alive: true }],
    ],
    pen: [
      { t: 3.2, d: 0.6, w: 5.8, p: glass(195, 330) },
      { t: 1.3, d: 0.5, w: 5.8, p: wave(300, 560, 362) },
      // Water
      { t: 7.2, d: 0.4, w: 10.2, p: arrow(316, 382, 292, 412, 6) },
      { t: 11.3, d: 0.4, w: WA, p: arrow(312, 810, 290, 852, 6) },
      // Circuit
      { t: 25.0, d: 0.4, w: 34.0, p: arrow(515, 748, 472, 574, 10) },
      { t: 29.2, d: 0.4, w: 34.0, p: arrow(505, 1180, 472, 1006, 10) },
      { t: 35.2, d: 0.4, w: WB, p: arrow(592, 1222, 450, 1360, 14) },
      // End card box
      { t: 49.7, d: 0.4, w: END, p: box(245, 314, 615, 386) },
    ],
    engrave: [face(0, 0), face(1, 432), face(2, 864)],
    css: TABLES,
  },
];
