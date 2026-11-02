// Chip-design episode 11, "What is the regenerative property of logic gates?": notes cues on the voice-synced
// convoy page (src/figures/regen-convoy2). Build: npm run notes -- chip-design/11
// Times are video seconds (= audio seconds of the 2026-10-31 take, 11.words.json). Positions are frame px (1080 x 1920).
// Notes follow section 3 ("What to draw") of the episode 11 Notion page, re-anchored to the recorded words.
// Phases: road 3-25.5 s (board y about 637-1069, ghost convoy then real convoy), fold 25.5-27.3, circuit 27.3-62.2
// (gauges reach up to y about 551; the curve card and the readout sit below the board, x about 184-583, y 1112-1458),
// fold back 62.2-64.0, start frame to the end. The figure engraves ROLLIN itself, so engrave is null.
import { END } from "../../notes-kit.mjs";
import { arrow, box } from "../../pen.mjs";

const DIR = "shorts/chip-design/11 What is the regenerative property of logic gates/";
// Wipes: the road notes clear at the fold, the circuit notes at the fold back.
const WA = 25.4, WB = 62.1;

export default [
  {
    name: "notes",
    source: DIR + "What is the regenerative property of logic gates (convoy, voice).html",
    out: DIR + "What is the regenerative property of logic gates (convoy, voice, notes).html",
    words: "builds/notes/episodes/chip-design/11.words.json",
    subtitles: null,
    notes: [
      // Copying world
      [540, 500, 48, 5.56, 0.8, 10.2, "copying: wobble grows"],
      // Real drivers
      [540, 500, 46, 18.0, 0.9, 23.0, "car 1 wobbles → car 5 straight"],
      // Episode tag, top right, to the end
      [935, 330, 50, 23.28, 0.6, END, "Episode 11"],
      // Lanes and the middle line
      [540, 450, 44, 29.14, 1.1, 35.5, "lane = bit: 1 near 1 V, 0 near 0 V"],
      [470, 370, 44, 34.56, 0.9, 39.9, "middle line = 0.5 V: touchy"],
      [810, 1250, 42, 37.86, 0.8, 42.8, "steep at the middle line"],
      // Flat inside a lane, own power
      [540, 450, 44, 42.04, 0.9, 48.6, "0.7 or 0.9 in → clean out"],
      [470, 370, 44, 47.12, 0.9, 53.5, "power wires: 1 V and 0 V"],
      // Key state and gate after gate
      [810, 1250, 46, 52.64, 0.7, 58.1, "0.7 in → 1.0 out"],
      [790, 1400, 42, 55.26, 0.9, 60.0, "copying instead: 0.9 → 0.5"],
      [540, 450, 44, 58.44, 1.0, WB, "past the middle line → wrong bit"],
      // End card after the fold back: boxed takeaway below the board, next episode at the very bottom for the last 4 s.
      [540, 1400, 46, 64.5, 1.2, END, "follow the lane, not the wobble"],
      [540, 1693, 52, 66.5, 0.7, END, "Episode 12 →", { alive: true }],
    ],
    pen: [
      // "lane lines": arrow from the paper above the board to the lower lane's back line, beside car 3
      { t: 16.68, d: 0.5, w: WA, p: arrow(700, 600, 670, 775, -15) },
      // End card box
      { t: 64.9, d: 0.4, w: END, p: box(190, 1360, 890, 1440) },
    ],
    engrave: null,
  },
];
