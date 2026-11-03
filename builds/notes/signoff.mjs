// The sign-off end sequence (owner, 2026-11-03): the "1 : 0" scoreboard pun, then the follow prompt.
//   node builds/notes/signoff.mjs <words.json> [--y 440]      (npm run notes:signoff -- <words.json>)
// Finds the fixed sign-off in the recording ("Now you can explain what most engineers can't. Follow, and keep it
// that way.") and prints the notes and pen entries, timed from the spoken words, to paste into the episode's cue file
// (`notes: [...]` and `pen: [...]`). Then run autoplace, notes:check and the signoff check as usual.
//   "final score" + "you" on "you", a big "1" on "explain", "most engineers" on "most", a big "0" on "can't":
//   a scoreboard in bits, top zone above the board (x 330 / 720, y from --y, default 440).
//   Ending (sample 7): "Follow" writes on "Follow" at y 1530 (line-boils), in the free paper between the takeaway box and
//   the strip both apps cover (one video serves Instagram Reels and YouTube Shorts); a short olive arrow points down-left
//   toward the corner where both apps put their follow/subscribe button (tip at y 1625, above both apps' text); then a
//   double underline and three small sparks on "keep it that way".
// All scoreboard notes share group "signoff", so the crowding check counts them once.
import { readFileSync } from "node:fs";
import { arrow, line } from "./pen.mjs";

const [wordsPath, ...rest] = process.argv.slice(2);
if (!wordsPath) {
  console.error("usage: signoff.mjs <words.json> [--y 440]");
  process.exit(2);
}
const yi = rest.indexOf("--y");
const Y = yi >= 0 ? +rest[yi + 1] : 440;
const words = JSON.parse(readFileSync(wordsPath, "utf8")); // [[start, end, word], ...]
const norm = (w) => String(w).toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]/g, "");
const W = words.map((w) => norm(w[2]));

// The sign-off is the last "follow" of the take; the other words are found around it.
const iFollow = W.lastIndexOf("follow");
const back = (from, w) => { for (let i = from; i >= 0; i--) if (W[i] === w) return i; return -1; };
const fwd = (from, w) => { for (let i = from; i < W.length; i++) if (W[i] === w) return i; return -1; };
const iCant = back(iFollow, "cant");
const iEng = back(iCant, "engineers");
const iMost = back(iEng, "most");
const iExpl = back(iMost, "explain");
const iYou = back(iExpl, "you");
const iKeep = fwd(iFollow, "keep");
const miss = Object.entries({ follow: iFollow, "can't": iCant, engineers: iEng, most: iMost, explain: iExpl, you: iYou, keep: iKeep })
  .filter(([, i]) => i < 0).map(([w]) => w);
if (miss.length) {
  console.error(`not found in the recording: ${miss.join(", ")}. Is the sign-off spoken word for word? (SCRIPTS.md section 2)`);
  process.exit(1);
}
const t = (i) => +words[i][0].toFixed(2);
const [YOU, EXPLAIN, MOST, CANT, FOLLOW, KEEP] = [iYou, iExpl, iMost, iCant, iFollow, iKeep].map(t);
const r = (v) => +v.toFixed(2);

const notes = [
  [540, Y, 40, r(YOU), 0.5, "END", "final score"],
  [330, Y + 70, 56, r(YOU + 0.05), 0.3, "END", "you"],
  [330, Y + 190, 110, r(EXPLAIN + 0.05), 0.25, "END", "1"],
  [720, Y + 70, 56, r(MOST), 0.6, "END", "most engineers"],
  [720, Y + 190, 110, r(CANT + 0.05), 0.25, "END", "0"],
];
const follow = [530, 1530, 76, r(FOLLOW), 0.5, "END", "Follow"];
const pen = [
  { t: r(FOLLOW + 0.2), d: 0.4, p: arrow(408, 1540, 300, 1625, 16), c: 'arrow down-left, toward the follow button (both apps)' },
  { t: r(KEEP), d: 0.25, p: line(420, 1566, 650, 1562), c: "underline 1" },
  { t: r(KEEP + 0.15), d: 0.25, p: line(432, 1584, 640, 1582), c: "underline 2" },
  { t: r(KEEP + 0.4), d: 0.2, p: line(684, 1476, 702, 1454, 0) + " " + line(700, 1500, 728, 1494, 0) + " " + line(690, 1524, 712, 1536, 0), c: "sparks" },
];

const q = (s) => JSON.stringify(s);
console.log(`// Sign-off (builds/notes/signoff.mjs, from ${wordsPath}): you ${YOU}, explain ${EXPLAIN}, most ${MOST}, can't ${CANT}, Follow ${FOLLOW}, keep ${KEEP}`);
console.log("// notes: [...]");
for (const n of notes) console.log(`      [${n.slice(0, 5).join(", ")}, END, ${q(n[6])}, { group: "signoff" }],`);
console.log(`      [${follow.slice(0, 5).join(", ")}, END, "Follow", { alive: true, group: "signoff" }],`);
console.log("// pen: [...]");
for (const p of pen) console.log(`      { t: ${p.t}, d: ${p.d}, w: END, p: ${q(p.p)} }, // ${p.c}`);
