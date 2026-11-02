// Chip-design episode 14, "What is a priority encoder?": notes cues on the voice-synced phone page.
// Build: npm run notes -- chip-design/14
// Times are video seconds (= audio seconds of the 2026-11-01 05:40 take). Positions are frame px (1080 x 1920).
// Each cue starts just after its word in builds/notes/episodes/chip-design/14.words.json.
// Phases (voice page): phone and sound tiles 0-24.3 s, fold 24.3-25.8 s, circuit (levers, encoder block, lamps) to
// the fold back at 59.32-60.8, then the phone again; video length 68 s. The figure fills y 437-1423; the wall's top
// edge slopes down to the right (0.256), so notes sit above it (y 370 left, y 480 right) or below the board.
// The figure engraves ROLLIN itself (board front face), so engrave is null.
import { END } from "../../notes-kit.mjs";
import { ring, box, arrow } from "../../pen.mjs";

const DIR = "shorts/chip-design/14 What is a priority encoder/";
// Wipes: phone notes clear before the fold (24.3), circuit notes at the fold back (59.32).
const WA = 24.2;
const WB = 59.2;

export default [
  {
    name: "notes",
    source: DIR + "What is a priority encoder (phone, voice).html",
    out: DIR + "What is a priority encoder (phone, voice, notes).html",
    words: "builds/notes/episodes/chip-design/14.words.json",
    subtitles: null,
    notes: [
      // Phone
      [330, 370, 46, 7.6, 0.9, 12.5, "set by the phone's maker"],
      [790, 380, 44, 16.9, 1.0, 21.1, "lit tile = wants the speaker"],
      // Episode tag, top right, to the end
      [935, 330, 50, 22.4, 0.6, END, "Episode 14"],
      // Circuit
      [420, 370, 44, 27.8, 1.0, 31.8, "2 alarm, 1 music, 0 ping"],
      [760, 480, 44, 33.8, 0.8, 38.4, "2 bits count 0 to 3"],
      [760, 480, 44, 38.9, 0.7, 43.0, "1 in binary = 01"],
      [760, 480, 46, 43.6, 0.6, 47.4, "3 = 2 + 1 = 11"],
      [540, 370, 44, 53.5, 1.2, 58.3, "ping: valid 1, silence: valid 0"],
      [540, 1480, 44, 55.8, 1.1, WB, "call came last, still wins"],
      // End card after the fold back: takeaway boxed below the board, next episode at the very bottom for the last 4 s.
      [540, 1590, 46, 64.0, 1.2, END, "top-ranked input always wins"],
      [540, 1693, 52, 65.5, 0.7, END, "Episode 15 →", { alive: true }],
    ],
    pen: [
      // Hook "your music": ring round the playing music tile; it leaves at 2.3 s (gone by 2.75) because the "1st" tag (2.8-4.1 s) sits on its line
      { t: 1.64, d: 0.5, w: 2.3, p: ring(312, 928, 118, 50, 15) },
      // Ties: arrows from notes to their parts, drawn on the spoken words; the note inks just after
      { t: 7.1, d: 0.4, w: 12.5, p: arrow(390, 398, 338, 428, 10) },        // "set by the phone's maker" -> tile stand
      { t: 27.3, d: 0.4, w: 31.8, p: arrow(400, 400, 322, 582, 10) },       // "2 alarm, 1 music, 0 ping" -> levers
      { t: 38.2, d: 0.4, w: 43.0, p: arrow(790, 510, 872, 832, -10) },      // "1 in binary = 01" -> the "1" lamp
      { t: 43.1, d: 0.4, w: 47.4, p: arrow(760, 510, 822, 795, -10) },      // "3 = 2 + 1 = 11" -> the two lit lamps
      { t: 53.1, d: 0.4, w: 58.3, p: arrow(800, 402, 822, 1056, 6) },       // "ping: valid ..." -> the valid lamp
      // "A call": arrow to the call tile, stopping short of the stand
      { t: 12.7, d: 0.4, w: 14.5, p: arrow(60, 470, 150, 600, 18) },
      // "Still on": ring round the music tile
      { t: 16.4, d: 0.5, w: 18.4, p: ring(292, 913, 130, 52, 15) },
      { t: 16.5, d: 0.4, w: 21.1, p: arrow(610, 410, 488, 872, 14) },       // "lit tile" -> music tile
      // "two output bits": box round the two output lamps and their labels
      { t: 33.6, d: 0.5, w: 39.4, p: box(722, 792, 932, 992) },
      // "ignored": ring round lever 1
      { t: 45.6, d: 0.4, w: 48.4, p: ring(318, 895, 44, 42, 15) },
      // "priority": box round the encoder block and its three lamps
      { t: 55.6, d: 0.5, w: WB, p: box(448, 598, 978, 1248) },
      // End card box
      { t: 64.2, d: 0.4, w: END, p: box(220, 1552, 860, 1632) },
    ],
    engrave: null,
  },
];
