import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { canon, transcriptTokens } from "./spell.mjs";
// Planned annotations (Annotation column of an episode page, script-writer/ANNOTATIONS.md section 5) against the recording.
//   node builds/notes/annotations.mjs plan    <page.md> <words.json>              resolved in/out times per mark
//   node builds/notes/annotations.mjs signoff <page.md> <words.json> <cue.mjs>    every planned mark built as planned
//   node builds/notes/annotations.mjs board   <page.md> <words.json>              every On the board event at its spoken words
// Times resolve from the quoted spoken words in the transcript; the planned seconds in brackets only pick the
// occurrence when a phrase is said more than once.
const [mode, pagePath, wordsPath, cuePath] = process.argv.slice(2);
if (!["plan", "signoff", "board"].includes(mode) || !wordsPath || (mode === "signoff" && !cuePath)) {
  console.error("usage: annotations.mjs plan|board <page.md> <words.json> | signoff <page.md> <words.json> <cue.mjs>");
  process.exit(2);
}
// a page fetched from Notion: <b>A-B s</b> times, escaped [tags]
const page = readFileSync(pagePath, "utf8").replace(/<b>([\d.]+-[\d.]+ s)<\/b>/g, "**$1**").replace(/\\([[\]])/g, "$1");
const toks = canon;
const words = JSON.parse(readFileSync(wordsPath, "utf8")); // [[start, end, word], ...]
// transcript tokens, folded across word edges ("sixty" "-four" -> 64), each keeping the index of its word
const T = transcriptTokens(words);
const S = T.map((x) => x.w).join("");
const off = []; // char offset of each token in S
T.reduce((o, x, k) => ((off[k] = o), o + x.w.length), 0);
const bound = new Set([...off, S.length]);
// a round page number may be the start of a longer spoken one: "a hundred" (100) of "a hundred and three" (103)
const numPrefix = (p, s) => /^\d+0$/.test(p) && /^\d+$/.test(s) && s.length === p.length && s.startsWith(p.replace(/0+$/, ""));

// Table rows and marks
const rows = [];
for (const line of page.split(/\r?\n/)) {
  if (!line.startsWith("| **")) continue;
  const cells = line.trim().replace(/^\||\|$/g, "").split(" | ").map((c) => c.trim());
  const t = cells.length === 3 && cells[0].match(/^\*\*([\d.]+)-([\d.]+) s\*\*\s*(.*)/);
  if (t) rows.push({ t0: +t[1], t1: +t[2], voice: t[3], board: cells[1], ann: cells[2] });
}
const block = rows.flatMap((r) => toks(r.voice));
const plannedEnd = rows.at(-1).t1;
const voiceEnd = words.at(-1)[1];

// Find a phrase in the transcript: the occurrence whose relative place best matches the planned time.
// Exact token-stream match first; then a round number as the start of a longer one; then the first word only (loose).
function at(phrase, planned) {
  const p = canon(phrase);
  if (!p.length) return null;
  const P = p.join("");
  const exact = [], near = [], first = [];
  for (let k = 0; k < T.length; k++) {
    const o = off[k];
    if (S.startsWith(P, o) && bound.has(o + P.length)) { exact.push(T[k].i); continue; }
    const head = p.slice(0, -1).join("");
    if (S.startsWith(head, o) && bound.has(o + head.length)) {
      const kk = off.indexOf(o + head.length, k);
      if (kk >= 0 && numPrefix(p.at(-1), T[kk].w)) { near.push(T[k].i); continue; }
    }
    if (T[k].w === p[0]) first.push(T[k].i);
  }
  const hits = exact.length ? exact : near.length ? near : first;
  if (!hits.length) return null;
  const want = (planned / plannedEnd) * voiceEnd;
  const i = hits.reduce((b, h) => (Math.abs(words[h][0] - want) < Math.abs(words[b][0] - want) ? h : b));
  return { t: words[i][0], loose: !exact.length && !near.length };
}
// Folds: the fold line's row and the last row (fold back); each resolves to its first spoken words.
const foldRows = rows.filter((r, i) => /Now, (the same with bits|let's build it as a circuit)/.test(r.voice) || i === rows.length - 1);
const rowStart = (r) => at(toks(r.voice).slice(0, 3).join(" "), r.t0)?.t ?? null;
const foldAt = foldRows.length > 1 ? rowStart(foldRows[0]) : null;
const when = (s) => {
  s = (s ?? "").replace(/^out /, "");
  if (s === "end") return { t: 999 };
  const m = s.match(/^(?:fold|"([^"]+)") \(([\d.]+)\)$/);
  if (!m) return null;
  if (m[1]) return at(m[1], +m[2]);
  const r = foldRows.find((x) => x.t0 >= +m[2] - 0.5);
  if (r) return { t: rowStart(r) };
  // the fold back inside the last row ("A-B fold back" in its board cell): its offset from the row's resolved start
  const last = rows.at(-1);
  const fb = last.board.match(/([\d.]+)-[\d.]+ fold back/);
  const t0 = fb && Math.abs(+fb[1] - +m[2]) < 0.6 ? rowStart(last) : null;
  return t0 == null ? null : { t: t0 + (+fb[1] - last.t0) };
};

// board: the figure's timeline from the page and the recording (htmlmp4 step 5): every On the board event
// written as `12.3 ("cue words"): what happens` resolves to the time its words are spoken.
if (mode === "board") {
  let bad = 0;
  let prevPlay = null;
  console.log(`voice ends ${voiceEnd.toFixed(2)} s; fold line starts ${foldAt == null ? "?" : foldAt.toFixed(2)} s`);
  for (const r of rows) {
    const ev = [...r.board.matchAll(/(\d+(?:\.\d+)?)(?:-[\d.]+)? \("([^"]+)"(?: \+ ([\d.]+) s)?\):?\s*([^]*?)(?=\s\d+(?:\.\d+)?(?:-[\d.]+)? \("|$)/g)];
    console.log(`-- row "${r.voice.replace(/\[[^\]]*\]\s*/g, "").slice(0, 50)}"`);
    for (const [, planned, cue, plus, what] of ev) {
      const hit0 = at(cue, +planned - (+plus || 0));
      const hit = hit0 && { ...hit0, t: hit0.t + (+plus || 0) };
      if (!hit) bad++;
      // board events spoken before the landing has settled play from 1.6 s; in the hook row every later event
      // keeps the page's order, at least 0.4 s after the one before (SCRIPTS.md section 4, visual hook)
      let early = "";
      if (hit) {
        const floor = r === rows[0] && prevPlay != null ? prevPlay + 0.4 : 0;
        const play = Math.max(hit.t, hit.t < 1.6 ? 1.6 : 0, floor);
        if (r === rows[0]) prevPlay = play;
        if (play > hit.t + 1e-9) early = ` (${hit.t < 1.6 ? "spoken before the landing" : "after the shifted event before it"}: plays at ${play.toFixed(2)})`;
      }
      const tt = hit ? hit.t.toFixed(2) : "  ??";
      console.log(`${tt.padStart(6)}  "${cue}"${hit?.loose ? " (first word only: check by ear)" : ""}${early}  ${what.slice(0, 90)}`);
    }
  }
  if (bad) console.log(`WARN  ${bad} cue(s) not spoken in the recording: the take differs from the page (report, do not guess)`);
  process.exit(bad ? 1 : 0);
}

const marks = [];
const problems = [];
const warns = [];
for (const r of rows)
  for (const ln of r.ann.split(/<br\s*\/?>|\s+(?=NOTE "|PEN \w+ · )/).map((x) => x.trim()).filter((x) => x && x.replace(/\.$/, "") !== "Nothing new")) {
    const f = ln.split(" · ").map((x) => x.trim());
    const k = f[0].match(/^NOTE "([^"]+)"$|^PEN (\w+)$/);
    const on = f[1]?.match(/^on "([^"]+)" \(([\d.]+)\)$|^at end-4 \(([\d.]+)\)$/);
    if (!k || !on) { problems.push(`row ${r.t0} s: cannot read "${ln.slice(0, 60)}" (run check-annotations.py)`); continue; }
    const tin = on[1] ? at(on[1], +on[2]) : { t: "end-4" };
    // cold open (SCRIPTS.md section 4): the hook note writes from the first frame; its CAPS underline (a pen
    // under a note's text) keeps its spoken time; every other pen waits for the landing (R4/R6 start at 1.6 s)
    const tagsHere = f.slice(k[1] ? 5 : 4);
    if (k[1] && tagsHere.includes("hook") && typeof tin?.t === "number") tin.t = 0;
    if (!k[1] && typeof tin?.t === "number" && tin.t < 1.6 && !/^under "/.test(f[2] ?? "")) tin.t = 1.6;
    const isNote = !!k[1];
    const outF = isNote ? f[2] : f[3];
    const m = {
      kind: isNote ? "NOTE" : "PEN", what: k[1] ?? k[2], cue: on[1] ?? "end-4", planned: +(on[2] ?? on[3]),
      in: tin?.t ?? null, loose: tin?.loose, out: when(outF)?.t ?? null, outSpec: outF,
      place: isNote ? f[3] : f[2], tie: isNote ? f[4] : null, tags: f.slice(isNote ? 5 : 4),
    };
    if (m.in == null) problems.push(`"${m.what}": cue "${m.cue}" not found in the transcript`);
    if (m.out == null) problems.push(`"${m.what}": out ${outF} not found in the transcript`);
    if (m.loose) warns.push(`"${m.what}": only the first word of "${m.cue}" matched; check the time by ear`);
    marks.push(m);
  }

const fmt = (t) => (t === 999 ? "end" : typeof t === "number" ? t.toFixed(2) : String(t));
if (mode === "plan") {
  console.log(`voice ends ${voiceEnd.toFixed(2)} s; fold line starts ${fmt(foldAt)} s`);
  for (const m of marks)
    console.log(`${m.kind.padEnd(4)} ${fmt(m.in).padStart(6)} -> ${fmt(m.out).padEnd(6)} ${m.kind === "NOTE" ? `"${m.what}"` : m.what} · ${m.place}${m.tie ? " · " + m.tie : ""}${m.tags.length ? " · " + m.tags.join(" · ") : ""}`);
  for (const p of [...problems, ...warns]) console.log("WARN ", p);
  process.exit(0);
}

// signoff: compare with the built cue file
const { default: variants } = await import(pathToFileURL(resolve(cuePath)).href);
const v = variants.find((x) => x.name === "notes") ?? variants[0];
const src = readFileSync(v.source, "utf8");
const loop = +(src.match(/name="iso-loop" content="([\d.]+)"/)?.[1] ?? NaN);
const video = 3 + loop;
const err = [...problems];
const norm = (s) => s.replace(/\s+/g, " ").trim();
const used = new Set();
const penUsed = new Set();
const penNear = (t, lo = -0.6, hi = 0.6) => v.pen.findIndex((p, i) => !penUsed.has(i) && p.t - t >= lo && p.t - t <= hi);
for (const m of marks) {
  if (m.in === "end-4") m.in = video - 4;
  if (m.in == null) continue;
  if (m.kind === "NOTE") {
    let i = v.notes.findIndex((n, j) => !used.has(j) && norm(n[6]) === norm(m.what));
    const run = [i];
    if (i < 0) // a long note built as 2-3 lines written one after another (within 1.5 s)
      for (const [j, n] of v.notes.entries()) {
        if (used.has(j)) continue;
        const r = [j];
        for (const [k, o] of v.notes.entries())
          if (r.length < 3 && !used.has(k) && !r.includes(k) && o[3] > v.notes[r.at(-1)][3] && o[3] - n[3] <= 1.5) r.push(k);
        for (let len = 2; len <= r.length; len++)
          if (norm(r.slice(0, len).map((k) => v.notes[k][6]).join(" ")) === norm(m.what)) { i = j; run.splice(0, 1, ...r.slice(0, len)); break; }
        if (i >= 0) break;
      }
    if (i < 0) { err.push(`planned note "${m.what}" is not in the cue file`); continue; }
    run.forEach((k) => used.add(k));
    const n = v.notes[i];
    const late = n[3] - m.in;
    if (late < -0.05 || late > 0.5 + (m.tie && m.tie !== "tie none" ? 0.5 : 0))
      err.push(`note "${m.what}" starts at ${n[3]} s; its words "${m.cue}" are at ${fmt(m.in)} s (0 to 0.5 s after, 1 s with a tie)`);
    if (m.out === 999 && n[5] < 999) err.push(`note "${m.what}" must stay to the end (wipe ${n[5]})`);
    else if (m.out != null && m.out !== 999 && Math.abs(n[5] - m.out) > 0.8)
      err.push(`note "${m.what}" wipes at ${n[5]} s; planned out ${m.outSpec} resolves to ${fmt(m.out)} s`);
    if (m.tie && !/tie none/.test(m.tie)) {
      // "tie box": the note sits outside its planned PEN box, which may already be matched
      const p = m.tie === "tie box"
        ? v.pen.findIndex((q) => q.t - m.in >= -0.6 && q.t - m.in <= 0.8)
        : penNear(m.in, -0.2, 0.8);
      if (p < 0) err.push(`note "${m.what}" has no ${m.tie.replace("tie ", "")} drawn near ${fmt(m.in)} s`);
      else penUsed.add(p);
    }
  } else {
    const p = penNear(m.in, -0.1, 0.6);
    if (p < 0) err.push(`planned ${m.what} (${m.place}) at ${fmt(m.in)} s is not in the cue file`);
    else penUsed.add(p);
  }
}
v.notes.forEach((n, j) => {
  if (!used.has(j) && !/^Episode \d+ →$/.test(norm(n[6]))) err.push(`cue note "${n[6]}" at ${n[3]} s was not planned on the page`);
});
const extra = v.pen.filter((p, i) => !penUsed.has(i)).length;
for (const e of err) console.log("ERROR", e);
for (const w of warns) console.log("WARN ", w);
if (extra) console.log(`WARN  ${extra} pen mark(s) in the cue file are not on the page (end-card box and doodles are fine)`);
console.log(`${err.length ? "FAIL" : "PASS"}: ${marks.length} planned marks, ${v.notes.length} cue notes, ${v.pen.length} pen marks, video ${video} s`);
process.exit(err.length ? 1 : 0);
