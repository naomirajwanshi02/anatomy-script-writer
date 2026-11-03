// Overlap check for a notes page: plays the page in headless Chrome (capture clock, 10 steps per second)
// and measures what is actually on screen at every step. Fails (exit 1) when, at any moment:
//   R1 two visible notes overlap
//   R2 a pen stroke runs through a visible note (arrows must start beside their note)
//   R3 a note covers an engraved board label (NMOS, TAP, VDD, NOISE, the Rollin engraving) or readout text
//   R4 a note covers a visible part of the figure (anything but the board slab and its rails)
//   R5 a pen stroke runs through an engraved label
//   R6 an arrow tip lands on a visible part (tips must stop short)
// and, unless the page opts out (cue crowd: false), crowding:
//   R7 more than N notes on screen at once (default 3; a group such as the interview answer counts
//      once; the "Episode N" tag and end-card note do not count)
//   R8 a note starts writing less than G s after the previous one (default 1.5; same group excepted)
// Only things at least 15 % visible count, so a fading note still blocks its spot. R4 and R6 start at
// 1.6 s, after the parts have landed.
//   node builds/notes/check.mjs "<notes page.html>"        (npm run notes:check -- "<page>")
// export-reel.mjs runs this first and will not export while it fails.
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";

const W = 1080, H = 1920, STEP = 0.1, VIS = 0.15;
const page = process.argv[2];
if (!page) {
  console.error('usage: node builds/notes/check.mjs "<notes page.html>"');
  process.exit(2);
}
const html = resolve(page);
const chrome = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe`,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
].find((p) => existsSync(p));
if (!chrome) throw new Error("Chrome or Edge not found");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Runs in the page at each step; returns the rule hits as strings.
const probe = `((VIS) => {
  const op = (el) => { let o = 1; for (let e = el; e && e.nodeType === 1; e = e.parentNode) { const cs = getComputedStyle(e); if (cs.display === "none" || cs.visibility === "hidden") return 0; o *= +cs.opacity; } return o; };
  const R = (r, p = 0) => ({ l: r.left - p, t: r.top - p, r: r.right + p, b: r.bottom + p });
  const pad = (a, p) => ({ l: a.l - p, t: a.t - p, r: a.r + p, b: a.b + p }); // grow an {l,t,r,b} box (R reads DOMRects)
  const hit = (a, b) => a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;
  const inside = (pt, a) => pt.x > a.l && pt.x < a.r && pt.y > a.t && pt.y < a.b;
  const name = (s) => JSON.stringify(s.slice(0, 28));
  // Visible notes: union of their visible letters.
  const notes = [];
  let ni = 0;
  for (const n of document.querySelectorAll(".nt-w")) {
    const key = n.dataset.group || "n" + ni++;
    if (op(n) < VIS) continue;
    let box = null;
    for (const b of n.querySelectorAll("b")) {
      if (op(b) < VIS) continue;
      const r = R(b.getBoundingClientRect());
      box = box ? { l: Math.min(box.l, r.l), t: Math.min(box.t, r.t), r: Math.max(box.r, r.r), b: Math.max(box.b, r.b) } : r;
    }
    if (box) notes.push({ box, text: n.textContent, key });
  }
  // Figure: engraved labels and parts (the slab and long rails are not parts).
  const svg = document.querySelector("svg.iso-svg");
  const labels = [], parts = [];
  if (svg) {
    for (const t of svg.querySelectorAll("text")) {
      if (!t.textContent.trim() || op(t) < VIS) continue;
      if (t.getAttribute("fill") === "#fbf3e2") continue; // engraving lip copy
      labels.push({ box: R(t.getBoundingClientRect(), 1), text: t.textContent });
    }
    // Readouts (truth tables, formulas) are HTML text next to the board; they count as labels too.
    for (const e of document.querySelectorAll("[data-figure] *")) {
      if (e.closest(".nt") || e.closest("svg") || e.children.length || !e.textContent.trim() || op(e) < VIS) continue;
      const r = e.getBoundingClientRect();
      if (r.width > 1 && r.height > 1) labels.push({ box: R(r, 1), text: e.textContent.trim() });
    }
    for (const s of svg.querySelectorAll(".iso-solid")) {
      if (op(s) < VIS) continue;
      const r = s.getBoundingClientRect();
      if (r.width < 4 || r.height < 4 || r.width > 520 || r.width * r.height > 140000) continue;
      if (s.parentElement && s.parentElement.closest(".iso-solid")) continue;
      parts.push({ box: R(r, -3) });
    }
  }
  // Visible pen strokes, sampled along their drawn part.
  const pens = [];
  for (const p of document.querySelectorAll(".nt-l")) {
    if (op(p) < VIS) continue;
    const drawn = 1 - parseFloat(getComputedStyle(p).strokeDashoffset || "1");
    if (drawn <= 0.02) continue;
    const len = p.getTotalLength(), m = p.getScreenCTM(), pts = [];
    for (let i = 0; i <= 60; i++) {
      const q = p.getPointAtLength((len * drawn * i) / 60);
      pts.push(new DOMPoint(q.x, q.y).matrixTransform(m));
    }
    const d = p.getAttribute("d");
    const a = d.match(/^M[-\\d.]+ [-\\d.]+ Q[-\\d.]+ [-\\d.]+ ([-\\d.]+) ([-\\d.]+) M/);
    const tip = a && drawn > 0.98 ? new DOMPoint(+a[1], +a[2]).matrixTransform(m) : null;
    pens.push({ pts, tip, d: d.slice(0, 24) });
  }
  const out = [];
  const shrink = (b) => { const h = (b.b - b.t) * 0.15; return { l: b.l + 2, t: b.t + h, r: b.r - 2, b: b.b - h }; };
  for (let i = 0; i < notes.length; i++)
    for (let j = i + 1; j < notes.length; j++)
      // Lines of one group are stacked on purpose: their line boxes may touch; they fail only when they overlap by 6 px.
      if (hit(pad(notes[i].box, notes[i].key === notes[j].key ? -6 : 3), notes[j].box)) out.push("R1 notes overlap: " + name(notes[i].text) + " + " + name(notes[j].text));
  for (const n of notes) {
    for (const p of pens) if (p.pts.some((pt) => inside(pt, shrink(n.box)))) out.push("R2 pen through note " + name(n.text) + " (" + p.d + ")");
    for (const l of labels) if (hit(n.box, l.box)) out.push("R3 note " + name(n.text) + " over label " + name(l.text));
    for (const q of parts) if (hit(n.box, q.box)) out.push("R4 note " + name(n.text) + " over a part at " + Math.round(q.box.l) + "," + Math.round(q.box.t));
  }
  for (const p of pens) {
    for (const l of labels) if (p.pts.some((pt) => inside(pt, l.box))) out.push("R5 pen over label " + name(l.text) + " (" + p.d + ")");
    if (p.tip) for (const q of parts) if (inside(p.tip, q.box)) out.push("R6 arrow tip on a part (" + p.d + ") at " + Math.round(p.tip.x) + "," + Math.round(p.tip.y));
  }
  return { out, vis: notes.map((n) => ({ key: n.key, text: n.text })) };
})(${VIS})`;

const profile = join(tmpdir(), `notes-check-${process.pid}-${Date.now()}`);
const browser = spawn(chrome, ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`, `--window-size=${W},${H}`, "--hide-scrollbars", "--disable-gpu", "about:blank"]);
let failed = false;
try {
  let target, port = 0;
  for (let i = 0; i < 100 && !target; i++) {
    await sleep(100);
    if (!port) {
      try { port = Number(readFileSync(join(profile, "DevToolsActivePort"), "utf8").split("\n")[0]) || 0; } catch {}
      if (!port) continue;
    }
    target = await fetch(`http://127.0.0.1:${port}/json/list`).then((r) => r.json()).then((l) => l.find((t) => t.type === "page")).catch(() => null);
  }
  if (!target) throw new Error("could not connect to Chrome");
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((ok, fail) => ((ws.onopen = ok), (ws.onerror = fail)));
  let id = 0;
  const pending = new Map();
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) {
      const { ok, fail } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? fail(new Error(msg.error.message)) : ok(msg.result);
    }
  };
  const send = (method, params = {}) => new Promise((ok, fail) => { pending.set(++id, { ok, fail }); ws.send(JSON.stringify({ id, method, params })); });
  const evaluate = async (expression) => (await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result.value;

  await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url: `${pathToFileURL(html).href}?capture` });
  for (let i = 0; i < 100; i++) {
    await sleep(100);
    if (await evaluate("document.readyState === 'complete' && typeof window.__isoStep === 'function' && document.fonts.status === 'loaded'")) break;
    if (i === 99) throw new Error("page has no capture mode");
  }
  await sleep(300);
  const loop = Number(await evaluate("document.querySelector('meta[name=iso-loop]')?.content ?? ''")) || 30;
  const total = 3 + loop;
  const crowd = String(await evaluate("document.querySelector('.nt')?.dataset.crowd ?? 'off'"));
  const [MAX, GAP] = crowd === "off" ? [Infinity, 0] : crowd.split(",").map(Number);
  const seen = new Map(); // rule text -> [first t, last t]
  const shown = new Set();
  let lastT = -99, lastKey = null;
  for (let t = 0; t < total - 1e-6; t += STEP) {
    await evaluate(`window.__isoStep(${t === 0 ? 0 : STEP}, ${t.toFixed(2)})`);
    const { out, vis } = await evaluate(probe);
    const counted = new Map();
    for (const n of vis) if (!/^(Episode [0-9]|Follow$)/.test(n.text.trim())) counted.set(n.key, n.text);
    if (counted.size > MAX) out.push(`R7 ${counted.size} notes on screen (max ${MAX}): ` + [...counted.values()].map((x) => JSON.stringify(x.slice(0, 18))).join(" "));
    for (const [key, text] of counted) {
      if (shown.has(key)) continue;
      shown.add(key);
      if (t - lastT < GAP - 1e-6 && key !== lastKey) out.push(`R8 ${JSON.stringify(text.slice(0, 22))} starts ${(t - lastT).toFixed(1)} s after the previous note (min ${GAP} s)`);
      lastT = t;
      lastKey = key;
    }
    for (const hitText of out) {
      if (t < 1.6 && /^R[3-6]/.test(hitText)) continue; // parts and labels are still falling onto the board
      const span = seen.get(hitText);
      if (span) span[1] = t;
      else seen.set(hitText, [t, t]);
    }
  }
  ws.close();
  if (!seen.size) console.log(`check: no overlaps or crowding (${total.toFixed(1)} s, every ${STEP} s)`);
  else {
    failed = true;
    console.log(`check: ${seen.size} overlap${seen.size > 1 ? "s" : ""}`);
    for (const [hitText, [a, b]] of [...seen].sort((x, y) => x[1][0] - y[1][0])) console.log(`  ${a.toFixed(1)}-${b.toFixed(1)} s  ${hitText}`);
  }
} finally {
  browser.kill();
  await sleep(300);
  // Chrome can hold its profile for a moment after exit; a leftover temp folder must not fail the check.
  try { rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch {}
}
process.exit(failed ? 1 : 0);
