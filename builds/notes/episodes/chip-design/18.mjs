// Chip-design episode 18, "What is short-circuit power in CMOS?": notes cues on the voice-synced short-circuit-taps
// page (slow tap handle, then a real CMOS inverter). Build: npm run notes -- chip-design/18
// Built from the Annotation column of builds/notes/episodes/chip-design/18.page.md (script-writer/ANNOTATIONS.md):
// every mark is on the page, timed from its quoted words in 18.words.json (node builds/notes/annotations.mjs plan ...).
// Times are video seconds (= audio seconds of the ElevenLabs_2026-11-02T04_27_08 take). Positions are frame px (1080 x 1920).
// Phases: water scene 0-33.7 s, fold 33.7-35.3, circuit to the fold back 64.4-66.0, video 74.5 s.
// Water board: left corner (54,1242), back corner (648,903), right corner (1032,1090), front corner (713,1415). High tank
// x 432-674 y 508-691, meter dial (501,702), cup counter x 551-594 y 700-760, top tap (810,842), FILL x 694-754 y 817-861,
// glass tank x 640-860 y 900-1240, bottom tap (665,1145), DRAIN x 536-611 y 1142-1190, grate (588,1318), handle (310,940),
// rod vertical at x 395 y 760-880. Engraving x 252-490 y 1277-1362.
// Circuit board: back corner (324,529), right corner (1032,724), front corner about (810,972). Lever knob (259,508), VDD 1 V
// x 259-401 y 551-600, GND x 80-151 y 720-751, PMOS (551,680) label x 609-709 y 701-742, NMOS (475,745) label x 532-633
// y 773-814, output tank x 690-830 y 610-800, strap NMOS-GND about (445,815). Vin graph x 173-740 y 1022-1191, I graph
// y 1214-1383 (narrow pulse x about 222, wide pulse x about 380-520), energy panel x 800-972 y 1049-1369 (from 52.5).
// Measured with builds/notes/labels.mjs and one sheet. The figure engraves ROLLIN itself, so engrave is null.
import { END } from "../../notes-kit.mjs";
import { arrow, box, ring, tick } from "../../pen.mjs";

const DIR = "shorts/chip-design/18 What is short-circuit power in CMOS/";
const WA = 33.51; // water notes leave before the fold (33.66)
const WB = 64.25; // circuit notes leave before the fold back (64.4)

export default [
  {
    name: "notes",
    source: DIR + "What is short-circuit power in CMOS (taps, voice).html",
    out: DIR + "What is short-circuit power in CMOS (taps, voice, notes).html",
    words: "builds/notes/episodes/chip-design/18.words.json",
    subtitles: null,
    crowd: { max: 4, gap: 1.0 },
    notes: [
      // Water scene
      [840, 360, 60, 0.7, 0.6, 7.44, "tank empties,", { group: "hook" }],
      [840, 430, 60, 1.2, 0.7, 7.44, "top still pours", { group: "hook" }],
      [960, 760, 44, 12.08, 0.45, 20.02, "top = fill"],
      [930, 1400, 44, 14.14, 0.6, 20.02, "bottom = drain"],
      [860, 420, 42, 15.64, 0.9, 26.04, "meter = top tap water"],
      [900, 520, 42, 17.76, 0.3, 26.75, "1 cup:", { group: "cup1" }],
      [900, 575, 42, 18.06, 0.75, 26.75, "both open a blink", { group: "cup1" }],
      [900, 1440, 42, 22.88, 0.5, 26.75, "both open =", { group: "skip" }],
      [900, 1495, 42, 23.3, 0.7, 26.75, "water skips tank", { group: "skip" }],
      [880, 400, 42, 26.34, 0.4, WA, "10 cups:", { group: "cup10" }],
      [870, 455, 42, 26.7, 0.9, WA, "both open 10x longer", { group: "cup10" }],
      [935, 330, 48, 31.44, 0.5, END, "Episode 18"],
      // Circuit
      [170, 400, 44, 35.88, 0.65, 39.76, "handle = input"],
      [480, 420, 44, 40.06, 0.65, 44.36, "top tap = PMOS"],
      [210, 948, 44, 41.74, 0.75, 46.26, "bottom tap = NMOS"],
      [820, 510, 42, 44.66, 0.85, 49.36, "NMOS on above 0.3 V"],
      [800, 440, 42, 46.56, 0.9, 49.36, "PMOS off above 0.7 V"],
      [400, 450, 44, 48.54, 0.8, 52.46, "0.3-0.7 V: both on"],
      [200, 340, 42, 50.74, 0.4, 54.96, "current =", { group: "cur" }],
      [330, 388, 42, 51.1, 1.0, 54.96, "water through both taps", { group: "cur" }],
      [800, 420, 42, 52.2, 1.0, 54.96, "current fills no tank:", { group: "heat" }],
      [800, 475, 42, 52.7, 0.4, 54.96, "just heat", { group: "heat" }],
      [300, 975, 42, 53.58, 0.7, 57.5, "edge = how fast", { group: "edge" }],
      [330, 1018, 42, 54.0, 0.5, 57.5, "input rises", { group: "edge" }],
      [760, 1440, 42, 55.96, 1.25, 60.84, "0.5 s edge: 1 unit of energy"],
      [330, 985, 42, 57.8, 0.8, WB, "10x longer overlap", { group: "x10" }],
      [340, 1030, 42, 58.2, 0.55, WB, "= 10x energy", { group: "x10" }],
      [760, 1440, 42, 62.3, 1.35, WB, "energy = area under I from VDD"],
      // End card (after the fold back), boxed below the water board
      [540, 1462, 44, 70.7, 1.4, END, "slower edge = more short-circuit energy"],
      [540, 1693, 52, 72.2, 0.7, END, "Episode 19 →", { alive: true }],
    ],
    pen: [
      // Water scene
      { t: 0.2, d: 0.4, w: 7.44, p: arrow(880, 470, 822, 893, 8) }, // hook to the top tap stream
      { t: 4.16, d: 0.5, w: 7.44, p: ring(310, 940, 70, 95, 10) }, // the handle
      { t: 8.34, d: 0.3, w: 11.6, p: arrow(250, 640, 382, 790, 20) }, // to the linkage rod
      { t: 11.78, d: 0.3, w: 20.02, p: arrow(880, 794, 853, 818, 4) }, // "top = fill" to the top tap
      { t: 13.84, d: 0.3, w: 20.02, p: arrow(800, 1390, 688, 1248, 10) }, // "bottom = drain" to the bottom tap
      { t: 15.34, d: 0.3, w: 26.04, p: arrow(700, 440, 642, 708, 14) }, // "meter = top tap water" to the meter
      { t: 17.46, d: 0.3, w: 26.75, p: arrow(720, 545, 644, 710, 10) }, // "1 cup" to the cup counter
      { t: 22.68, d: 0.5, w: 26.75, p: box(620, 790, 890, 1205) }, // the two taps
      { t: 24.86, d: 0.3, w: 26.04, p: arrow(640, 1452, 598, 1370, 6) }, // to the stream into the grate
      { t: 26.04, d: 0.3, w: WA, p: arrow(690, 480, 642, 708, 12) }, // "10 cups" to the cup counter
      { t: 29.04, d: 0.3, w: WA, p: arrow(640, 1452, 598, 1370, 6) }, // to the stream into the grate
      // Circuit
      { t: 35.58, d: 0.3, w: 39.76, p: arrow(200, 425, 245, 488, 6) }, // "handle = input" to the lever
      { t: 39.76, d: 0.3, w: 44.36, p: arrow(520, 445, 532, 640, 6) }, // "top tap = PMOS" to the PMOS
      { t: 41.44, d: 0.3, w: 46.26, p: arrow(200, 915, 404, 766, -100) }, // "bottom tap = NMOS" to the NMOS
      { t: 44.36, d: 0.3, w: 49.36, p: arrow(660, 535, 472, 704, -10) }, // "NMOS on" to the NMOS
      { t: 46.26, d: 0.3, w: 49.36, p: arrow(640, 465, 602, 628, 6) }, // "PMOS off" to the PMOS
      { t: 48.34, d: 0.5, w: 52.46, p: box(420, 650, 720, 768) }, // the two valves
      { t: 50.44, d: 0.3, w: 54.96, p: arrow(600, 395, 480, 706, -10) }, // "current = water" to the rust strap
      { t: 51.9, d: 0.3, w: 54.96, p: arrow(820, 500, 765, 596, 6) }, // "fills no tank" to the output tank
      { t: 53.28, d: 0.3, w: 57.5, p: arrow(430, 1030, 405, 1140, 6) }, // "edge" to the Vin row
      { t: 55.66, d: 0.4, w: 60.84, p: arrow(480, 1430, 236, 1302, 14) }, // "0.5 s edge" to the narrow pulse
      { t: 57.5, d: 0.4, w: WB, p: arrow(420, 1048, 440, 1262, 4) }, // "10x" to the wide pulse
      { t: 60.84, d: 0.5, w: WB, p: ring(450, 1318, 115, 72, 0) }, // key: the wide pulse
      { t: 62.0, d: 0.4, w: WB, p: arrow(520, 1420, 480, 1345, 6) }, // "area" to the wide pulse
      { t: 63.52, d: 0.3, w: WB, p: tick(262, 1272, 0.9) }, // beside the narrow pulse
      // End card box
      { t: 70.5, d: 0.5, w: END, p: box(100, 1428, 980, 1500) },
    ],
    engrave: null,
  },
];
