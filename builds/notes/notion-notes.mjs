import { readFileSync } from "node:fs";
// Prints the "On-screen notes" Notion section per episode (JSON: {"NN": markdown}) from the cue files.
//   node builds/notes/notion-notes.mjs [NN ...]   (default 01-06; the reel variant of each)
const pick = { "01": "notes-2", "02": "notes", "03": "notes", "04": "notes", "05": "notes", "06": "notes" };
const only = process.argv.slice(2);
const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const where = (x, y) => (y <= 330 && x > 800 ? "top right" : y < 300 ? "top" : y < 570 ? "above the board" : y > 1640 ? "very bottom (end card)" : y > 1420 ? "below the readouts" : y > 1090 ? (x > 720 ? "right of the table" : x < 380 ? "left of the table" : "below the board") : "board area");
const out = {};
for (const ep of only.length ? only : Object.keys(pick)) {
  const { default: vs } = await import(new URL(`./episodes/${ep}.mjs`, import.meta.url));
  const v = vs.find((x) => x.name === (pick[ep] ?? "notes"));
  const rows = [...v.notes].sort((a, b) => a[3] - b[3]).map(([x, y, , t, , w, txt, o]) =>
    `<tr><td>${t.toFixed(1)}</td><td>${esc(txt)}${o?.alive ? " (line boil)" : ""}</td><td>${w >= 999 ? "stays" : w.toFixed(1)}</td></tr>`).join("\n");
  const file = v.out.split("/").pop();
  out[ep] = `## On-screen notes (built ${"2026-10-26"})\n\nHandwritten notes (Samble) on olive hand-drawn arrows, generated from \`builds/notes/episodes/${ep}.mjs\`; no printed subtitles. The older iPad timing table further down is superseded by this. Times are video seconds (= audio seconds of ${+ep}.mp3).\n\n<table header-row="true">\n<tr><td>Time (s)</td><td>Note</td><td>Clears (s)</td></tr>\n${rows}\n</table>\n\n- Notes page: \`shorts/${v.out.split("/")[1]}/${file}\`\n- Reel: \`${ep <= "02" ? "exported" : "awaiting review"}\`${v.engrave ? "\n- Board edge engraved: ROLLIN-रोलिन-ROLLIN-रोलिन" : ""}\n- Checks: no overlaps or crowding (\`npm run notes:check\`)\n\n`;
}
console.log(JSON.stringify(out));
