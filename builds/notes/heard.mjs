import { readFileSync } from "node:fs";
// Words heard per frame window, for the video-stage understanding test (script-writer/UNDERSTANDING-TEST.md).
//   node builds/notes/heard.mjs <words.json> [step=2.5] [end]
// Prints one line per frame second t = step, 2*step, ...: the words spoken in (t - step, t].
// The frame list for notes:sheet is printed first, so the sheets and the lines share the same seconds.
const [wordsPath, stepArg, endArg] = process.argv.slice(2);
const words = JSON.parse(readFileSync(wordsPath, "utf8")); // [[start, end, word], ...]
const step = +(stepArg ?? 2.5);
const end = +(endArg ?? Math.ceil(words.at(-1)[1] + 1));
const secs = [];
for (let t = step; t <= end + 1e-9; t += step) secs.push(+t.toFixed(2));
console.log(`frames: ${secs.join(" ")}`);
for (const t of secs) {
  const said = words.filter((w) => w[0] > t - step && w[0] <= t).map((w) => w[2].trim()).join(" ");
  console.log(`${t.toFixed(1).padStart(5)} s  ${said || "(silence)"}`);
}
