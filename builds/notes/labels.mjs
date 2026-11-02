import { execFileSync } from "node:child_process";
// Every text label's box in frame px (1080 x 1920) at the given seconds, so note and pen positions are measured once
// instead of guessed (the labels are what notes:check R3/R5 protect). Uses probe.mjs.
//   node builds/notes/labels.mjs "<page.html>" <sec> [sec ...]
// Prints, per second, one line per label: text, left, top, right, bottom.
const [page, ...secs] = process.argv.slice(2);
if (!page || !secs.length) {
  console.error('usage: node builds/notes/labels.mjs "<page.html>" <sec> [sec ...]');
  process.exit(2);
}
const expr =
  'JSON.stringify([...document.querySelectorAll("*")].filter(e=>e.children.length===0&&e.textContent.trim())' +
  '.map(e=>{const r=e.getBoundingClientRect();const k=1080/innerWidth;' +
  'return [e.textContent.trim().slice(0,24),Math.round(r.left*k),Math.round(r.top*k),Math.round(r.right*k),Math.round(r.bottom*k)]})' +
  '.filter(a=>a[3]>a[1]&&a[4]>a[2]&&a[2]<1920))';
for (const s of secs) {
  const out = execFileSync("node", ["builds/notes/probe.mjs", page, s, expr], { encoding: "utf8" }).trim().split("\n").pop();
  let rows = JSON.parse(out);
  if (typeof rows === "string") rows = JSON.parse(rows);
  console.log(`== ${s} s`);
  for (const [t, l, tp, r, b] of rows) console.log(`  ${t.padEnd(24)} x ${l}-${r}  y ${tp}-${b}`);
}
