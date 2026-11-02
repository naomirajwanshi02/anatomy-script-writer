import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { transcriptTokens } from "./spell.mjs";
// Re-take: an episode's voice was re-recorded after its figure was built on the old take. Align the two transcripts
// and print the anchors that let the existing figure follow the new take, so no figure event is retimed by hand.
//   node builds/notes/retake.mjs <old.words.json> <new.words.json> [--old-loop <s>] [--min <n>] [--write <slug>]
// --write <slug> also writes the voice page: src/figures/<slug>/voice.ts (an existing voice.ts is renamed
// voice-take1.ts and composed), src/main-<slug>-voice.tsx and builds/build-<slug>-voice.mjs when missing (copied from
// the figure's own entry and build script, same output file). Then: node builds/build-<slug>-voice.mjs
// Prints RETAKE: [new voice s, old voice s] pairs, a piecewise-linear map from the new recording's time to the old
// recording's time. The figure keeps its own timeline; its voice page becomes
//   figure t = oldVoiceToFigure(retake(t))      (oldVoiceToFigure = identity for figures written in voice seconds)
// Words spoken only in the new take (a new hook, a rewritten line) get no anchor of their own: the figure stretches
// across them. They are listed, with the dropped old words, so the events the revised page adds there (row 1
// "Visual hook:", changed cue words) are placed by hand in the figure's timeline, in old-take seconds.
const args = process.argv.slice(2);
const opt = (k, d) => (args.includes(k) ? +args[args.indexOf(k) + 1] : d);
const [oldPath, newPath] = args.filter((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));
if (!oldPath || !newPath) {
  console.error("usage: retake.mjs <old.words.json> <new.words.json> [--old-loop <s>] [--min <n>]");
  process.exit(2);
}
const minRun = opt("--min", 2);
const slug = args.includes("--write") ? args[args.indexOf("--write") + 1] : null;
const fig = slug && `src/figures/${slug}`;
if (slug && !existsSync(fig)) { console.error(`no figure ${fig}`); process.exit(2); }
// the old LOOP: --old-loop, else the figure's voice.ts, else its model.ts
const loopIn = (f) => (existsSync(f) ? +(readFileSync(f, "utf8").match(/export const LOOP = ([\d.]+)/)?.[1] ?? NaN) : NaN);
const oldLoop = opt("--old-loop", slug ? (Number.isFinite(loopIn(`${fig}/voice.ts`)) ? loopIn(`${fig}/voice.ts`) : loopIn(`${fig}/model.ts`)) : NaN);
const oldW = JSON.parse(readFileSync(oldPath, "utf8"));
const newW = JSON.parse(readFileSync(newPath, "utf8"));
const A = transcriptTokens(oldW);
const B = transcriptTokens(newW);

// Longest common subsequence of the two token lists (about 200 x 200 tokens per reel).
const n = A.length, m = B.length;
const L = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
for (let i = n - 1; i >= 0; i--)
  for (let j = m - 1; j >= 0; j--) L[i][j] = A[i].w === B[j].w ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
const pairs = [];
for (let i = 0, j = 0; i < n && j < m; )
  if (A[i].w === B[j].w) pairs.push([i++, j++]);
  else if (L[i + 1][j] >= L[i][j + 1]) i++;
  else j++;

// Runs of consecutive matched tokens; short runs ("the", "a") are coincidences, not anchors.
const runs = [];
for (const p of pairs) {
  const r = runs.at(-1);
  if (r && p[0] === r.at(-1)[0] + 1 && p[1] === r.at(-1)[1] + 1) r.push(p);
  else runs.push([p]);
}
const kept = runs.filter((r) => r.length >= minRun);

const f2 = (x) => +x.toFixed(2);
const said = (W, T, a, b) => T.slice(a, b + 1).map((t) => W[t.i][2].trim()).filter((w, k, s) => k === 0 || w !== s[k - 1]).join(" ");
const anchors = [[0, 0]];
const push = (nt, ot, note) => {
  const last = anchors.at(-1);
  if (nt > last[0] + 0.01 && ot >= last[1]) anchors.push([f2(nt), f2(ot), note]);
};
if (kept.length) {
  // the entrance plays unchanged up to the first spoken match (or 3 s)
  const e = Math.min(3, newW[B[kept[0][0][1]].i][0], oldW[A[kept[0][0][0]].i][0]);
  if (e > 0.05) push(e, e, "entrance");
}
// one anchor per matched word start (at least 0.3 s apart), plus the end of each run, so the map follows the new
// take's pace word by word; a comment names the words at the start of each run and every ~3 s after
for (const r of kept) {
  let lastNote = -9;
  for (const [k, [ia, jb]] of r.entries()) {
    if (k > 0 && B[jb].i === B[r[k - 1][1]].i) continue; // same word (a folded number split across tokens)
    const nt = newW[B[jb].i][0];
    if (k > 0 && nt - anchors.at(-1)[0] < 0.3) continue;
    const label = k === 0 || nt - lastNote >= 3;
    if (label) lastNote = nt;
    push(nt, oldW[A[ia].i][0], label ? `"${said(newW, B, jb, Math.min(r.at(-1)[1], jb + 5))}"` : "");
  }
  const [ib, je] = r.at(-1);
  push(newW[B[je].i][1], oldW[A[ib].i][1], "");
}
const newEnd = newW.at(-1)[1], oldEnd = oldW.at(-1)[1];
let newLoop = NaN;
if (Number.isFinite(oldLoop)) {
  newLoop = f2(oldLoop + (newEnd - oldEnd));
  push(3 + newLoop, 3 + oldLoop, "loop end: the start frame under the end card");
}

// Spans spoken in only one take: new words (figure events to place by hand) and dropped old words.
const gaps = [];
let pa = -1, pb = -1;
for (const r of [...kept, [[n, m]]]) {
  const [a0, b0] = r[0];
  if (b0 > pb + 1) gaps.push(`new  ${f2(newW[B[pb + 1].i][0]).toFixed(2).padStart(6)}-${f2(newW[B[b0 - 1].i][1]).toFixed(2).padEnd(6)} "${said(newW, B, pb + 1, b0 - 1)}"`);
  if (a0 > pa + 1) gaps.push(`old  ${f2(oldW[A[pa + 1].i][0]).toFixed(2).padStart(6)}-${f2(oldW[A[a0 - 1].i][1]).toFixed(2).padEnd(6)} "${said(oldW, A, pa + 1, a0 - 1)}" (dropped: its figure events squeeze into the neighbouring span)`);
  [pa, pb] = r.at(-1);
}

const lines = [];
const say = (s) => (lines.push(s), console.log(s));
const matched = kept.reduce((s, r) => s + r.length, 0);
say(`// old take ${oldPath}: ${A.length} tokens, last word ends ${oldEnd.toFixed(2)} s`);
say(`// new take ${newPath}: ${B.length} tokens, last word ends ${newEnd.toFixed(2)} s`);
say(`// ${matched} tokens matched in ${kept.length} runs (${Math.round((100 * matched) / B.length)} % of the new take)`);
if (Number.isFinite(newLoop)) say(`export const LOOP = ${newLoop}; // was ${oldLoop}`);
else say(`// pass --old-loop <LOOP of the figure's voice page> for the new LOOP and the loop-end anchor`);
say("// [new voice s, old voice s]");
say("const RETAKE: [number, number][] = [");
for (const [a, b, note] of anchors) say(`  [${a}, ${b}],${note ? " // " + note : ""}`);
say("];");
say(`export function retake(t: number) {
  for (let i = 1; i < RETAKE.length; i++) {
    const [a0, f0] = RETAKE[i - 1];
    const [a1, f1] = RETAKE[i];
    if (t <= a1) return f0 + ((f1 - f0) * (t - a0)) / (a1 - a0);
  }
  return RETAKE[RETAKE.length - 1][1] + (t - RETAKE[RETAKE.length - 1][0]);
}`);
if (gaps.length) {
  say("// Spoken in only one take (place the page's new events here by hand, in old-take seconds):");
  for (const g of gaps) say("//   " + g);
}

if (slug) {
  if (!Number.isFinite(newLoop)) { console.error("--write needs the old LOOP (--old-loop, or LOOP in voice.ts / model.ts)"); process.exit(2); }
  const take1 = existsSync(`${fig}/voice.ts`);
  if (take1) renameSync(`${fig}/voice.ts`, `${fig}/voice-take1.ts`);
  const body = lines.filter((l) => !l.startsWith("//   ") && !l.startsWith("// Spoken in only one take")).join("\n");
  writeFileSync(`${fig}/voice.ts`, [
    `// ${slug}: voice page for the re-recorded take (notes:retake). Time unit: seconds of video (video t = audio t).`,
    `// RETAKE maps the new take's time to the old take's time; the figure's own timeline is unchanged${take1 ? ", and voice-take1.ts (the old take's map) takes it on to figure time" : " (it is written in the old take's seconds)"}.`,
    `// New-only spans (from notes:retake) are where the revised page's new events go, placed in the figure in old-take seconds.`,
    take1 ? `import { voiceToFigure as take1 } from "./voice-take1";` : "",
    body,
    `export function voiceToFigure(t: number) {`,
    `  const T = t < 3 + LOOP ? t : 3 + ((t - 3) % LOOP);`,
    `  return ${take1 ? "take1(retake(T))" : "retake(T)"};`,
    `}`,
    "",
  ].filter((l) => l !== "").join("\n") + "\n");
  const main = `src/main-${slug}.tsx`, mainV = `src/main-${slug}-voice.tsx`;
  if (!existsSync(mainV) && existsSync(main)) {
    let s = readFileSync(main, "utf8");
    s = s.replace(/import "\.\/iso\/iso\.css";/, `import { setTimeMap } from "./figures/${slug}/live";\nimport { voiceToFigure } from "./figures/${slug}/voice";\nimport "./iso/iso.css";\n\n// Voice page for the re-recorded take: video t = audio t.\nsetTimeMap(voiceToFigure);`);
    writeFileSync(mainV, s);
  }
  const build = `builds/build-${slug}.mjs`, buildV = `builds/build-${slug}-voice.mjs`;
  if (!existsSync(buildV) && existsSync(build)) {
    let s = readFileSync(build, "utf8").replace(`src/main-${slug}.tsx`, `src/main-${slug}-voice.tsx`);
    if (!/model:/.test(s)) s = s.replace(/(title: [^\n]*\n)/, `$1  model: "src/figures/${slug}/voice.ts",\n`);
    writeFileSync(buildV, s);
  }
  console.error(`wrote ${fig}/voice.ts${take1 ? " (old map kept as voice-take1.ts)" : ""}; build with: node ${existsSync(buildV) ? buildV : "builds/build-" + slug + "-voice.mjs"}`);
}
