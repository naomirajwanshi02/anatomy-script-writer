// Chip-design episode 17, "Why does lowering supply voltage save so much power?": notes cues on the voice-synced
// bucket-stairs page (analogy, then a real CMOS inverter). Build: npm run notes -- chip-design/17
// Built from the Annotation column of builds/notes/episodes/chip-design/17.page.md (script-writer/ANNOTATIONS.md,
// chip-design 01-07 style and density): every mark is on the page, timed from its quoted words in 17.words.json
// (node builds/notes/annotations.mjs plan ...). Times are video seconds (= audio seconds of the
// ElevenLabs_2026-11-01T15_43_45 take). Positions are frame px (1080 x 1920).
// Phases: bucket scene 0-28.9 s, fold 28.9-30.4, circuit to the fold back 71.2-72.8, video 76.8 s.
// Circuit (DE CMOS board, redrawn 2026-11-02): VDD rail y about 676-780 with the "VDD 1.0 V" tag at x 825-926 y 757-803,
// PMOS x 476-604 y 744-810 (label 353-429), NMOS x 310-430 y 904-970 (label 185-260), tank C x 610-720 y 744-950, OUT tag
// x 533-592 y 851-886; Vout graph x 68-553 y 1215-1499, ENERGY FROM VDD card x 556-1010 y 1252-1474. Free paper above the
// board (y 300-620) and in the gap above the readouts (y about 1170-1200). Measured with builds/notes/labels.mjs.
// Bucket scene: building x 346-648 up to y 339 (two floors: y 551), glass tank x 648-886 from y 443, Sam and buckets
// x 250-550 at y 820-1015, readout card y 1253-1470. Circuit: voltage source x 454-540 (y 367-734) with its bracket
// at x 389-454, PMOS x 583-680 y 432-501, output tank x 832-961 from y 497 (a dimmed 1.0 V copy at x 684-820 from
// 56.6), NMOS x 767-853 y 864-929, OUT tag x 875-929, GND rail y 994-1102, readout counters x 579-713 and 750-886.
// Free paper: left of the building or the source (x 40-370), above right (x 560-1060, y 300-420, the badge at its
// right end from 26.5), right of the tank (x 890-1060), and the gap above the readout card (y about 1180).
// The figure engraves ROLLIN itself (board front face), so engrave is null.
import { END } from "../../notes-kit.mjs";
import { arrow, box, line, ring, tick, wave } from "../../pen.mjs";

const DIR = "shorts/chip-design/17 Why does lowering supply voltage save so much power/";
// Wipes: bucket notes before the fold (28.88), circuit notes when the teaser starts (66.32) or before the fold back (71.22).
const WA = 28.73;
const WB = 66.2;
const WC = 70.7;

export default [
  {
    name: "notes",
    source: DIR + "Why does lowering supply voltage save so much power (buckets, voice).html",
    out: DIR + "Why does lowering supply voltage save so much power (buckets, voice, notes).html",
    words: "builds/notes/episodes/chip-design/17.words.json",
    subtitles: null,
    crowd: { max: 4, gap: 1.0 },
    notes: [
      // Bucket scene
      [900, 340, 46, 0.2, 0.5, 5.98, "half height,", { group: "hook" }],
      [900, 392, 46, 0.6, 0.55, 5.98, "1/4 climbing", { group: "hook" }],
      [190, 500, 44, 4.04, 0.7, 7.12, "lower building?"],
      [900, 340, 42, 8.38, 0.3, 12.16, "tank =", { group: "tbh" }],
      [900, 392, 42, 8.7, 0.7, 12.16, "building height", { group: "tbh" }],
      [975, 500, 40, 11.94, 0.45, 17.68, "1 floor =", { group: "ffb" }],
      [975, 552, 40, 12.3, 0.4, 17.68, "1 bucket", { group: "ffb" }],
      [975, 1000, 42, 14.24, 0.35, 17.68, "4 trips"],
      [190, 660, 44, 15.2, 0.6, 17.68, "4 floors each"],
      [190, 560, 44, 18.74, 0.7, 22.92, "half the floors"],
      [975, 1000, 42, 19.92, 0.35, WA, "2 trips"],
      [190, 660, 44, 21.0, 0.6, WA, "2 floors each"],
      [880, 1190, 40, 22.05, 0.75, WA, "2 x 2 = 4, not 16"],
      // Episode tag, top right, until the teaser starts (the end card later takes the top right)
      [935, 330, 50, 26.68, 0.5, WB, "Episode 17"],
      // Circuit
      [700, 560, 42, 33.16, 0.5, 37.76, "wire = tank"],
      [560, 640, 40, 34.18, 0.4, 36.44, "1 = full"],
      [430, 560, 42, 35.64, 0.35, 40.86, "PMOS on"],
      [820, 470, 42, 36.94, 0.6, 43.22, "charge = water"],
      [920, 640, 42, 38.26, 0.5, 46.0, "VDD source"],
      [230, 1170, 40, 41.36, 0.7, 54.18, "1.0 V = 4 floors"],
      [760, 1190, 40, 44.72, 0.65, 48.32, "lifted 4 steps"],
      [500, 470, 42, 47.2, 0.85, 52.1, "energy = charge x V"],
      [800, 1190, 40, 49.94, 0.75, 54.18, "4 drops x 4 steps"],
      [880, 560, 42, 53.78, 0.7, WB, "0.5 V = 2 floors"],
      [500, 470, 42, 55.08, 0.9, 57.14, "half V → half charge"],
      [760, 1190, 40, 58.1, 0.55, 59.58, "2 steps each"],
      [800, 1190, 40, 60.08, 0.75, WB, "2 drops x 2 steps"],
      [560, 330, 42, 61.72, 0.8, WB, "energy = C x V x V"],
      [500, 600, 42, 67.2, 0.45, WC, "PMOS fills"],
      [230, 600, 42, 68.7, 0.55, WC, "NMOS empties"],
      // End card after the fold back, last 4 s: top right (the readout fills the subtitle area), next episode at the bottom.
      [900, 335, 44, 72.8, 0.6, END, "1/2 voltage =", { group: "card" }],
      [900, 388, 44, 73.2, 0.5, END, "1/4 energy", { group: "card" }],
      [540, 1693, 52, 74.3, 0.7, END, "Episode 18 →", { alive: true }],
    ],
    pen: [
      // Bucket scene
      { t: 3.54, d: 0.3, w: 7.12, p: arrow(300, 520, 330, 560, 4) }, // "lower building?" to the building
      { t: 4.88, d: 0.4, w: 7.12, p: wave(95, 285, 528, 5, 5) }, // under "lower building?"
      { t: 7.12, d: 0.5, w: 10.3, p: ring(392, 895, 165, 75, 12) }, // Sam and the buckets
      { t: 7.88, d: 0.3, w: 12.16, p: arrow(880, 412, 870, 426, 2) }, // "tank = building height" to the tank's rim
      { t: 10.3, d: 0.3, w: 13.74, p: tick(905, 600, 1.0) }, // beside the tank's floor lines
      { t: 11.44, d: 0.3, w: 17.68, p: arrow(960, 580, 893, 640, 6) }, // "1 floor = 1 bucket" to the floor marks
      { t: 12.16, d: 0.4, w: 13.74, p: arrow(300, 760, 330, 470, -20) }, // up to the top of the stairs
      { t: 13.74, d: 0.4, w: 17.68, p: arrow(915, 1000, 565, 985, 10) }, // "4 trips" to the buckets
      { t: 14.7, d: 0.3, w: 17.68, p: arrow(300, 690, 332, 730, 4) }, // "4 floors each" to the stairs
      { t: 16.02, d: 0.5, w: 19.42, p: ring(750, 1360, 175, 152, 0) }, // the 16 counter group
      { t: 18.24, d: 0.3, w: 22.92, p: arrow(300, 585, 332, 600, 2) }, // "half the floors" to the roof
      { t: 19.9, d: 0.4, w: WA, p: arrow(915, 1000, 470, 1002, 6) }, // "2 trips" to the two buckets
      { t: 20.5, d: 0.3, w: WA, p: arrow(300, 690, 332, 780, 4) }, // "2 floors each" to the stairs
      { t: 21.48, d: 0.3, w: WA, p: arrow(985, 1215, 964, 1300, 6) }, // "2 x 2 = 4, not 16" to the 4
      { t: 22.92, d: 0.3, w: WA, p: tick(1050, 600, 0.9) }, // beside "2 trips"
      { t: 24.14, d: 0.3, w: WA, p: tick(315, 640, 0.9) }, // beside "2 floors each"
      // Circuit
      { t: 32.66, d: 0.3, w: 37.76, p: arrow(760, 582, 732, 850, 8) }, // "wire = tank" to the output tank
      { t: 33.68, d: 0.3, w: 36.44, p: arrow(560, 662, 562, 835, 4) }, // "1 = full" to the output tag
      { t: 35.14, d: 0.3, w: 40.86, p: arrow(478, 585, 466, 828, 2) }, // "PMOS on" to the PMOS
      { t: 36.44, d: 0.3, w: 43.22, p: arrow(800, 492, 736, 860, 8) }, // "charge = water" to the charge in the tank
      { t: 37.76, d: 0.3, w: 46.0, p: arrow(915, 662, 880, 742, 4) }, // "VDD source" to the VDD tag
      { t: 38.28, d: 0.4, w: 40.86, p: arrow(630, 610, 640, 660, 2) }, // to the VDD rail
      { t: 40.86, d: 0.3, w: 54.18, p: arrow(330, 1190, 380, 1284, 4) }, // "1.0 V = 4 floors" to the Vout graph's VDD line
      { t: 44.22, d: 0.3, w: 48.32, p: arrow(640, 1205, 530, 1380, 6) }, // "lifted 4 steps" to the Vout graph's steps
      { t: 49.44, d: 0.3, w: 54.18, p: arrow(790, 1212, 815, 1350, 4) }, // "4 drops x 4 steps" to the 16
      { t: 52.6, d: 0.4, w: 54.18, p: box(615, 1288, 816, 1480) }, // the 16 counter group
      { t: 53.28, d: 0.3, w: WB, p: arrow(870, 582, 872, 742, 4) }, // "0.5 V = 2 floors" to the VDD tag
      { t: 54.58, d: 0.4, w: 57.14, p: arrow(470, 492, 520, 938, 2) }, // "half V → half charge" to the level line at mark 2
      { t: 56.28, d: 0.4, w: 59.58, p: ring(715, 722, 55, 30, 15) }, // the two packets
      { t: 57.6, d: 0.3, w: 59.58, p: arrow(640, 1205, 530, 1380, 6) }, // "2 steps each" to the Vout graph's steps
      { t: 59.58, d: 0.3, w: WB, p: arrow(950, 1212, 958, 1360, 4) }, // "2 drops x 2 steps" to the 4
      { t: 59.68, d: 0.5, w: WB, p: box(785, 1288, 990, 1480) }, // key: the 4 counter group
      { t: 61.52, d: 0.4, w: WB, p: line(370, 358, 750, 358, 3) }, // under "energy = C x V x V"
      { t: 63.72, d: 0.4, w: WB, p: ring(875, 780, 72, 44, 0) }, // the VDD tag
      { t: 66.7, d: 0.3, w: WC, p: arrow(470, 622, 468, 826, -8) }, // "PMOS fills" to the PMOS
      { t: 68.2, d: 0.4, w: WC, p: arrow(250, 622, 300, 878, 6) }, // "NMOS empties" to the NMOS
      { t: 69.82, d: 0.4, w: WC, p: ring(540, 777, 75, 45, 0) }, // both switches: a ring round the PMOS block
      { t: 70.0, d: 0.4, w: WC, p: ring(370, 937, 72, 45, 0) }, // and one round the NMOS block
      // End card box
      { t: 73.2, d: 0.4, w: END, p: box(748, 292, 1060, 420) },
    ],
    engrave: null,
  },
];
