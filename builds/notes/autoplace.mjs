// Automatic note placement for a notes cue: moves each NOTE (and its group) and each tie arrow only as far as needed so
// the page passes notes:check R1-R6, and prints the new coordinates (or writes them into the cue with --write).
//   node builds/notes/autoplace.mjs <cue.mjs> [--variant notes] [--write] [--step 0.1]
// How it works:
// 1. Builds the variant to a scratch page (builds/notes/.place/page.html) and plays it on the capture clock every
//    `step` s, measuring what notes:check measures: engraved and readout labels (R3/R5), part boxes (.iso-solid, the
//    same filter as R4/R6), every note's box at full ink, and every pen stroke's points.
// 2. Ties: a pen arrow (an arrow(...) call in the cue) that starts 0-0.6 s before a note and wipes with it is that note's
//    tie (script-writer/ANNOTATIONS.md: the tie starts on the resolved time, the note 0.2-0.3 s later). Other pens are
//    fixed obstacles (rings, boxes, ticks, standalone arrows; a standalone arrow only gets its tip pulled back).
// 3. In time order, a note that already passes (no overlap with labels, parts, notes or pens over its whole visible
//    span, margin 6 px) stays. Otherwise its group moves to the nearest free spot (8 px grid, up to 260 px away,
//    inside y 290-1530) on the same side of its tie target as planned, so "above left of the PMOS" stays above left.
//    Notes inside a tied box, the "Episode N" badge and end-card notes (alive) never move; they are reported.
// 4. A tie arrow that fails (tip within 10 px of a part, stroke through a label or a note) is redrawn: start 10 px
//    outside its note box on the side nearest the target, tip pulled back from the planned tip until it is 15 px
//    outside every part box, bend chosen from a short list so the stroke clears labels and notes.
// Crowding (R7, R8) is timing, not placement: it is reported, never changed. Run notes:check afterwards; it is the
// judge (the arrow shapes here mirror pen.mjs, so a clean result here should pass there).
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";
import { buildNotes, ROOT } from "./notes-kit.mjs";
import { arrow } from "./pen.mjs";

const args = process.argv.slice(2);
const opt = (n, d) => {
  const i = args.indexOf(`--${n}`);
  if (i < 0) return d;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
};
const flag = (n) => {
  const i = args.indexOf(`--${n}`);
  if (i >= 0) args.splice(i, 1);
  return i >= 0;
};
const WRITE = flag("write");
const VARIANT = opt("variant", null);
const STEP = +opt("step", "0.1");
const cuePath = args[0] && resolve(args[0]);
if (!cuePath || !existsSync(cuePath)) {
  console.error("usage: node builds/notes/autoplace.mjs <cue.mjs> [--variant notes] [--write] [--step 0.1]");
  process.exit(2);
}
const variants = (await import(pathToFileURL(cuePath).href)).default;
const v = VARIANT ? variants.find((x) => x.name === VARIANT) : variants[0];
if (!v) throw new Error(`no variant ${VARIANT}`);

// ---------- Cue text: which line holds which note / pen ----------
const src = readFileSync(cuePath, "utf8");
const lines = src.split(/\r?\n/);
const blockLines = (key) => {
  const a = lines.findIndex((l) => new RegExp(`^\\s*${key}: \\[\\s*$`).test(l));
  if (a < 0) return [];
  const out = [];
  for (let i = a + 1; i < lines.length && !/^\s*\],?\s*$/.test(lines[i]); i++) if (/^\s*[[{]/.test(lines[i])) out.push(i);
  return out;
};
const noteLines = blockLines("notes");
const penLines = blockLines("pen");
const textOk = noteLines.length === v.notes.length && penLines.length === v.pen.length;
const num = String.raw`(-?[\d.]+)`;
const ARROW = new RegExp(String.raw`arrow\(\s*${num},\s*${num},\s*${num},\s*${num}(?:,\s*${num})?\s*\)`);

// ---------- Measure the page ----------
const work = join(ROOT, "builds/notes/.place");
mkdirSync(work, { recursive: true });
const page = buildNotes({ ...v, out: join(work, "page.html") });

const chrome = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe`,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
].find((p) => existsSync(p));
if (!chrome) throw new Error("Chrome or Edge not found");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Labels and parts as notes:check sees them (VIS 15 %), notes and pens excluded.
const probe = `(() => {
  const op = (el) => { let o = 1; for (let e = el; e && e.nodeType === 1; e = e.parentNode) { const cs = getComputedStyle(e); if (cs.display === "none" || cs.visibility === "hidden") return 0; o *= +cs.opacity; } return o; };
  const B = (r, p = 0) => [Math.round(r.left - p), Math.round(r.top - p), Math.round(r.right + p), Math.round(r.bottom + p)];
  const svg = document.querySelector("svg.iso-svg");
  const labels = [], parts = [];
  if (svg) {
    for (const t of svg.querySelectorAll("text")) {
      if (!t.textContent.trim() || op(t) < 0.15 || t.getAttribute("fill") === "#fbf3e2") continue;
      labels.push(B(t.getBoundingClientRect(), 1));
    }
    for (const e of document.querySelectorAll("[data-figure] *")) {
      if (e.closest(".nt") || e.closest("svg") || e.children.length || !e.textContent.trim() || op(e) < 0.15) continue;
      const r = e.getBoundingClientRect();
      if (r.width > 1 && r.height > 1) labels.push(B(r, 1));
    }
    for (const s of svg.querySelectorAll(".iso-solid")) {
      if (op(s) < 0.15) continue;
      const r = s.getBoundingClientRect();
      if (r.width < 4 || r.height < 4 || r.width > 520 || r.width * r.height > 140000) continue;
      if (s.parentElement && s.parentElement.closest(".iso-solid")) continue;
      parts.push(B(r));
    }
  }
  return { labels, parts };
})()`;
// Each note's box at full ink, as an offset from its (x, y); each pen's points (frame px).
const shapes = `(() => {
  const st = document.createElement("style");
  st.textContent = ".nt-w,.nt-w b{animation:none !important;opacity:1 !important}";
  document.head.appendChild(st);
  const notes = [...document.querySelectorAll(".nt-w")].map((n) => [...n.querySelectorAll("b")].map((b) => { const r = b.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; }));
  st.remove();
  const pens = [...document.querySelectorAll(".nt-l")].map((p) => {
    const len = p.getTotalLength(), m = p.getScreenCTM(), pts = [];
    for (let i = 0; i <= 80; i++) { const q = p.getPointAtLength((len * i) / 80); const d = new DOMPoint(q.x, q.y).matrixTransform(m); pts.push([Math.round(d.x), Math.round(d.y)]); }
    return pts;
  });
  return { notes, pens };
})()`;

const profile = join(tmpdir(), `notes-place-${process.pid}-${Date.now()}`);
const browser = spawn(chrome, ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "--window-size=1080,1920", "--hide-scrollbars", "--disable-gpu", "about:blank"]);
let frames = [], shp, total;
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
  await send("Emulation.setDeviceMetricsOverride", { width: 1080, height: 1920, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url: `${pathToFileURL(page).href}?capture` });
  for (let i = 0; i < 100; i++) {
    await sleep(100);
    if (await evaluate("document.readyState === 'complete' && typeof window.__isoStep === 'function' && document.fonts.status === 'loaded'")) break;
    if (i === 99) throw new Error("page has no capture mode");
  }
  await sleep(300);
  total = 3 + (Number(await evaluate("document.querySelector('meta[name=iso-loop]')?.content ?? ''")) || 30);
  shp = await evaluate(shapes);
  for (let t = 0; t < total - 1e-6; t += STEP) {
    await evaluate(`window.__isoStep(${t === 0 ? 0 : STEP}, ${t.toFixed(2)})`);
    frames.push({ t, ...(await evaluate(probe)) });
  }
  ws.close();
} finally {
  browser.kill();
  await sleep(300);
  try { rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch {}
}

// ---------- Geometry ----------
const hit = (a, b, m = 0) => a[0] - m < b[2] && b[0] - m < a[2] && a[1] - m < b[3] && b[1] - m < a[3];
const inBox = ([x, y], b, m = 0) => x > b[0] - m && x < b[2] + m && y > b[1] - m && y < b[3] + m;
const shift = (b, dx, dy) => [b[0] + dx, b[1] + dy, b[2] + dx, b[3] + dy];
const union = (bs) => bs.reduce((a, b) => [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])]);
const dedupe = (bs) => [...new Map(bs.map((b) => [b.join(","), b])).values()];
// Labels and parts seen over a time span (parts and labels only count once landed, as in notes:check).
const seenCache = new Map();
const seen = (a, b) => {
  const k = `${a}|${b}`;
  if (!seenCache.has(k)) {
    const fs = frames.filter((f) => f.t >= Math.max(a, 1.6) - 1e-6 && f.t <= b + 1e-6);
    seenCache.set(k, { labels: dedupe(fs.flatMap((f) => f.labels)), parts: dedupe(fs.flatMap((f) => f.parts)) });
  }
  return seenCache.get(k);
};
// Points along an arrow as pen.mjs draws it (quadratic body + open V head).
const arrowPts = (x1, y1, x2, y2, bend) => {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, l = Math.hypot(x2 - x1, y2 - y1);
  const cx = mx - ((y2 - y1) / l) * bend, cy = my + ((x2 - x1) / l) * bend;
  const pts = [];
  for (let i = 0; i <= 60; i++) {
    const u = i / 60;
    pts.push([(1 - u) ** 2 * x1 + 2 * (1 - u) * u * cx + u * u * x2, (1 - u) ** 2 * y1 + 2 * (1 - u) * u * cy + u * u * y2]);
  }
  const a = Math.atan2(y2 - cy, x2 - cx);
  for (const s of [-0.5, 0.5]) for (let k = 0; k <= 6; k++) pts.push([x2 - (17 * k * Math.cos(a + s)) / 6, y2 - (17 * k * Math.sin(a + s)) / 6]);
  return pts;
};
const r1 = (x) => Math.round(x);

// ---------- Marks ----------
// A note's letters ink one by one (notes-kit: letter i at t + i x d / (chars - 1)) and its wipe drops it under the
// checker's 15 % visibility about 0.41 s after `wipe`; pens show from their start to the same point after their wipe.
const GONE = 0.41;
const life = (t, w) => [t, w + GONE];
const overlaps = (a, b) => a[0] < b[1] && b[0] < a[1];
const notes = v.notes.map((n, i) => {
  const [x, y, size, t, d, w, text, o = {}] = n;
  const chars = [...text];
  const step = d / Math.max(1, chars.length - 1);
  const at = chars.map((c, k) => (c === " " ? -1 : t + k * step)).filter((c) => c >= 0);
  const letters = shp.notes[i].map((b, k) => ({ c: at[k] ?? t, rel: [b[0] - x, b[1] - y, b[2] - x, b[3] - y] }));
  return { i, x, y, size, t, w, text, o, key: o.group ?? `n${i}`, rel: union(letters.map((l) => l.rel)), letters, life: life(t, w), dx: 0, dy: 0 };
});
const box = (n) => shift(n.rel, n.x + n.dx, n.y + n.dy);
// The note's visible letters at frame time tf (null when nothing shows).
const visBox = (n, tf) => {
  if (tf < n.t || tf >= n.w + GONE) return null;
  const ls = n.letters.filter((l) => tf >= l.c + 0.03);
  if (!ls.length) return null;
  const b = shift(union(ls.map((l) => l.rel)), n.x + n.dx, n.y + n.dy);
  if (tf > n.w) b[1] -= 14; // the wipe drifts the note up 14 px as it fades
  return b;
};
const framesIn = (a, b) => frames.filter((f) => f.t >= a - 1e-6 && f.t < b);
const pens = v.pen.map((p, i) => {
  const m = textOk ? lines[penLines[i]].match(ARROW) : null;
  const a = m ? { x1: +m[1], y1: +m[2], x2: +m[3], y2: +m[4], bend: m[5] === undefined ? 18 : +m[5] } : null;
  return { i, t: p.t, w: p.w, life: life(p.t, p.w), arrow: a, pts: shp.pens[i], kind: m ? "arrow" : (lines[penLines[i]] ?? "").match(/p: (\w+)\(/)?.[1] ?? "path" };
});
// Groups and their ties.
const groups = [];
for (const n of notes) {
  let g = groups.find((x) => x.key === n.key);
  if (!g) groups.push((g = { key: n.key, notes: [], tie: null, boxTie: null }));
  g.notes.push(n);
}
for (const g of groups) {
  const t0 = Math.min(...g.notes.map((n) => n.t));
  const w = g.notes[0].w;
  const tie = pens.find((p) => p.t <= t0 + 0.05 && p.t >= t0 - 0.65 && Math.abs(p.w - w) < 0.01 && (p.kind === "arrow" || p.kind === "box"));
  if (tie?.kind === "arrow") (g.tie = tie), (tie.owner = g);
  if (tie?.kind === "box") g.boxTie = tie;
  g.life = [t0, w + GONE];
  // A note inside its tied box (the end card) moves only with the box: frozen. A note outside its box may move.
  const inside = (b, o) => b[0] >= o[0] && b[1] >= o[1] && b[2] <= o[2] && b[3] <= o[3];
  const boxed = g.boxTie && g.notes.every((n) => inside(box(n), union(g.boxTie.pts.map(([x, y]) => [x, y, x, y]))));
  g.frozen = boxed || g.notes.some((n) => n.o.alive || /^(Episode \d|Follow$)/.test(n.text.trim()));
}
const gBox = (g) => union(g.notes.map(box));
const arrowOf = (p) => (p.arrow ? arrowPts(p.arrow.x1, p.arrow.y1, p.arrow.x2, p.arrow.y2, p.arrow.bend) : p.pts);

// Margins: CHECK mirrors notes:check exactly (a passing cue stays as it is); ROOM is what a moved note or a redrawn
// arrow gets (more air, the tip 15 px clear of parts).
const CHECK = { note: 3, label: 0, part: -3, pen: -1, tip: -3, penLabel: 0 };
const ROOM = { note: 10, label: 6, part: 6, pen: 4, tip: 15, penLabel: 2 };
const TIGHT = { note: 5, label: 3, part: 2, pen: 2, tip: 10, penLabel: 1 }; // second try where ROOM finds no spot
const LAST = { note: 4, label: 1, part: 0, pen: 1, tip: 4, penLabel: 1 }; // last try: just inside notes:check
const PULL = 45; // a tip is pulled back at most this far from its planned point, so it still points at the same part
const shrink = (b) => { const h = (b[3] - b[1]) * 0.15; return [b[0] + 2, b[1] + h, b[2] - 2, b[3] - h]; };
// Problems of a group at its current place, frame by frame as notes:check sees them, and of a tie arrow.
function noteFails(g, M = ROOM) {
  const out = new Set();
  for (const n of g.notes) {
    const full = box(n);
    if (!g.frozen && (full[1] < 290 || full[3] > 1530 || full[0] < 12 || full[2] > 1068)) out.add("off zone");
    const others = notes.filter((o) => o.key !== n.key && overlaps(o.life, n.life) && hit(full, box(o), M.note));
    const ps = pens.filter((p) => p.owner !== g && overlaps(p.life, n.life));
    for (const f of framesIn(...n.life)) {
      const b = visBox(n, f.t);
      if (!b) continue;
      if (f.t >= 1.6) {
        if (f.labels.some((l) => hit(b, l, M.label))) out.add("label");
        if (f.parts.some((q) => hit(b, q, M.part))) out.add("part");
      }
      for (const o of others) {
        const ob = visBox(o, f.t);
        if (ob && hit(b, ob, M.note)) out.add("note " + JSON.stringify(o.text));
      }
      const pb = M === CHECK ? shrink(b) : b;
      for (const p of ps) if (f.t >= p.t && f.t < p.life[1] && arrowOf(p).some((pt) => inBox(pt, pb, M === CHECK ? 0 : M.pen))) out.add("pen " + p.kind);
    }
  }
  return [...out];
}
function arrowFails(p, M = ROOM) {
  const g = p.owner;
  const pts = arrowOf(p);
  const tip = [p.arrow.x2, p.arrow.y2];
  const out = new Set();
  const ns = notes.filter((n) => overlaps(n.life, p.life));
  for (const f of framesIn(...p.life)) {
    if (f.t >= 1.6) {
      if (f.parts.some((q) => inBox(tip, q, M.tip))) out.add("tip on a part");
      if (pts.some((pt) => f.labels.some((l) => inBox(pt, l, M.penLabel)))) out.add("through a label");
    }
    for (const n of ns) {
      const b = visBox(n, f.t);
      if (!b) continue;
      const own = n.key === g?.key;
      const nb = M === CHECK ? shrink(b) : b;
      if (pts.some((pt) => inBox(pt, nb, M === CHECK ? 0 : own ? 2 : 4))) out.add("through note " + JSON.stringify(n.text));
    }
  }
  return [...out];
}
// Redraw a tie arrow from its group's box toward the planned tip `aim`; null when no clean arrow exists. Starts tried
// in order: the planned start (moved with the note), the box point nearest the aim, then the box's edge middles and
// corners, each 10 px out. The tip is pulled back from the aim (at most PULL px) until it clears every part by M.tip.
function fitArrow(p, aim, keepStart = false, M = ROOM) {
  const { labels, parts } = seen(...p.life);
  const b = p.owner ? gBox(p.owner) : null;
  const starts = [[p.arrow.x1, p.arrow.y1]];
  if (!keepStart && b) {
    const out = (x, y, ux, uy) => {
      const l = Math.hypot(ux, uy) || 1;
      return [x + (ux / l) * 10, y + (uy / l) * 10];
    };
    const cx = Math.min(Math.max(aim[0], b[0]), b[2]), cy = Math.min(Math.max(aim[1], b[1]), b[3]);
    if (aim[0] !== cx || aim[1] !== cy) starts.push(out(cx, cy, aim[0] - cx, aim[1] - cy));
    const mx = (b[0] + b[2]) / 2, my = (b[1] + b[3]) / 2;
    starts.push(out(mx, b[1], 0, -1), out(b[2], my, 1, 0), out(mx, b[3], 0, 1), out(b[0], my, -1, 0));
    for (const [x, y] of [[b[0], b[1]], [b[2], b[1]], [b[2], b[3]], [b[0], b[3]]]) starts.push(out(x, y, x - mx, y - my));
  }
  const bends = [p.arrow.bend, 0, 6, -6, 12, -12, 20, -20, 35, -35, 60, -60, 100, -100];
  for (const S of starts) {
    const L = Math.hypot(aim[0] - S[0], aim[1] - S[1]);
    if (L < 40) continue;
    let T = null;
    for (let s = 0; s <= Math.min(PULL, L - 35); s += 2) {
      const q = [aim[0] + ((S[0] - aim[0]) * s) / L, aim[1] + ((S[1] - aim[1]) * s) / L];
      if (!parts.some((r) => inBox(q, r, M.tip)) && !labels.some((r) => inBox(q, r, M.penLabel + 2))) {
        T = q;
        break;
      }
    }
    if (!T) continue;
    for (const bend of bends) {
      const cand = { ...p, arrow: { x1: r1(S[0]), y1: r1(S[1]), x2: r1(T[0]), y2: r1(T[1]), bend } };
      if (!arrowFails(cand, M).length) return cand.arrow;
    }
  }
  return null;
}

// ---------- Place, in time order ----------
const report = [];
const side = (a, b) => [Math.sign(Math.round(a[0] - b[0]) || 0), Math.sign(Math.round(a[1] - b[1]) || 0)];
for (const g of [...groups].sort((a, b) => a.life[0] - b.life[0])) {
  const name = JSON.stringify(g.notes.map((n) => n.text).join(" "));
  // Lines of one group move together, so overlapping lines are a spacing fault in the cue itself.
  for (let i = 0; i < g.notes.length; i++)
    for (let j = i + 1; j < g.notes.length; j++)
      if (hit(box(g.notes[i]), box(g.notes[j]), -6)) report.push(`LINES  ${name}: lines ${i + 1} and ${j + 1} overlap; space them by hand (about 1.2 x size apart)`);
  const bad = noteFails(g, CHECK);
  const tieBad = g.tie ? arrowFails(g.tie, CHECK) : [];
  if (!bad.length && !tieBad.length) continue;
  if (g.frozen) {
    if (bad.length) report.push(`FIXED  ${name}: ${[...new Set(bad)].join(", ")} (badge, end card or boxed note: move by hand)`);
    if (tieBad.length) report.push(`FIXED  ${name} tie: ${tieBad.join(", ")}`);
    continue;
  }
  const aim = g.tie ? [g.tie.arrow.x2, g.tie.arrow.y2] : null;
  const want = aim ? side([(gBox(g)[0] + gBox(g)[2]) / 2, (gBox(g)[1] + gBox(g)[3]) / 2], aim) : null;
  const tie0 = g.tie && { ...g.tie.arrow };
  const cands = [];
  for (let dx = -260; dx <= 260; dx += 8) for (let dy = -260; dy <= 260; dy += 8) if (dx * dx + dy * dy <= 260 * 260) cands.push([dx, dy]);
  cands.sort((a, b) => a[0] ** 2 + a[1] ** 2 - (b[0] ** 2 + b[1] ** 2));
  let done = false;
  for (const M of [ROOM, TIGHT, LAST]) {
    for (const [dx, dy] of cands) {
      g.notes.forEach((n) => ((n.dx = dx), (n.dy = dy)));
      if (want) {
        const b = gBox(g);
        const s = side([(b[0] + b[2]) / 2, (b[1] + b[3]) / 2], aim);
        if ((want[0] && s[0] !== want[0]) || (want[1] && s[1] !== want[1])) continue;
      }
      if (noteFails(g, M).length) continue;
      if (g.tie) {
        g.tie.arrow = { ...tie0, x1: tie0.x1 + dx, y1: tie0.y1 + dy };
        if (arrowFails(g.tie, M).length) {
          const a = fitArrow(g.tie, aim, false, M);
          if (!a) {
            g.tie.arrow = { ...tie0 };
            continue;
          }
          g.tie.arrow = a;
        }
      }
      done = true;
      report.push(`MOVED  ${name}: was ${[...new Set(bad.concat(tieBad))].join(", ")}${M === ROOM ? "" : M === TIGHT ? " (tight margins)" : " (minimum margins: look at it)"}`);
      break;
    }
    if (done) break;
  }
  if (!done) {
    g.notes.forEach((n) => ((n.dx = 0), (n.dy = 0)));
    if (g.tie) g.tie.arrow = { ...tie0 };
    report.push(`NO FIT ${name}: ${[...new Set(bad.concat(tieBad))].join(", ")} (no free spot within 260 px on its planned side)`);
  }
}
// Standalone arrows: pull the tip back / re-bend when it fails.
for (const p of pens) {
  if (p.kind !== "arrow" || p.owner || !arrowFails(p, CHECK).length) continue;
  const aim = [p.arrow.x2, p.arrow.y2];
  const a = fitArrow(p, aim, true) ?? fitArrow(p, aim, true, TIGHT) ?? fitArrow(p, aim, true, LAST);
  if (a) p.arrow = a;
  else report.push(`NO FIT pen arrow at ${p.t}: ${arrowFails(p, CHECK).join(", ")}`);
}

// ---------- Output ----------
const changes = [];
const fmt = (x) => +(+x).toFixed(1);
for (const n of notes) {
  if (!n.dx && !n.dy) continue;
  const nx = n.x + n.dx, ny = n.y + n.dy;
  changes.push({ line: noteLines[n.i], from: `[${n.x}, ${n.y},`, to: `[${nx}, ${ny},`, say: `NOTE  ${JSON.stringify(n.text)}: (${n.x}, ${n.y}) -> (${nx}, ${ny})` });
}
for (const p of pens) {
  if (p.kind !== "arrow" || !textOk) continue;
  const m = lines[penLines[p.i]].match(ARROW);
  const a = p.arrow;
  const now = `arrow(${fmt(a.x1)}, ${fmt(a.y1)}, ${fmt(a.x2)}, ${fmt(a.y2)}, ${fmt(a.bend)})`;
  const was = `arrow(${+m[1]}, ${+m[2]}, ${+m[3]}, ${+m[4]}, ${m[5] === undefined ? 18 : +m[5]})`;
  if (now !== was) changes.push({ line: penLines[p.i], from: m[0], to: now, say: `ARROW at ${p.t}: ${m[0]} -> ${now}` });
}
for (const c of changes) console.log(c.say);
for (const r of report) console.log(r);
if (!changes.length && !report.length) console.log("autoplace: every note and arrow already clear; nothing to change");
if (WRITE && changes.length) {
  if (!textOk) throw new Error("cue lines do not map one entry per line; apply the changes above by hand");
  for (const c of changes) {
    if (!lines[c.line].includes(c.from)) throw new Error(`line ${c.line + 1} changed under us`);
    lines[c.line] = lines[c.line].replace(c.from, c.to);
  }
  writeFileSync(cuePath, lines.join(src.includes("\r\n") ? "\r\n" : "\n"));
  console.log(`autoplace: wrote ${changes.length} change${changes.length > 1 ? "s" : ""} into ${cuePath}`);
}
console.log("Crowding (R7, R8) and the final word are notes:check's; run it next.");
