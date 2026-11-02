// Notes overlay kit: turns an episode cue (notes, pen marks, subtitles, engraving) into a new page
// built on top of an existing voice-synced figure page. The source page is never changed.
// Everything is timed in video seconds (video t = audio t on voice pages) and placed in frame px
// (1080 x 1920). All motion is CSS animation, so capture.mjs (?capture) steps it frame-exactly.
// Full guide: builds/notes/README.md.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const FONT = resolve(ROOT, "samble/samble.otf");
export const END = 999; // wipe time for marks that stay to the end

const at = (p) => resolve(ROOT, p);
const s = (v) => `${+v.toFixed(2)}s`;
const esc = (c) => (c === "<" ? "&lt;" : c === "&" ? "&amp;" : c === '"' ? "&quot;" : c);

// Colours (CLAUDE.md section 3): words brown-black, pen olive, subtitle tones from the sepia ink.
const INK = "#2a1d10", PEN = "#4f5d24", SUB_COMING = "#e3d6bb", SUB_PAST = "#8a7356";

const css = (font) => `<style id="notes">
@font-face{font-family:"Samble";src:url("${font}") format("opentype")}
.iso-svg{overflow:visible}
.nt{--fw:min(100vw,56.25vh);--u:calc(var(--fw) / 1080);position:fixed;left:50%;top:50%;width:var(--fw);height:calc(var(--fw) * 16 / 9);transform:translate(-50%,-50%);pointer-events:none;z-index:5}
.nt svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.nt-g{animation:nt-fade .45s ease-in var(--w) forwards}
.nt-l{fill:none;stroke:${PEN};stroke-width:4;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1 1;animation:nt-draw var(--d) cubic-bezier(.45,.05,.3,1) var(--t) both}
.nt-w{position:absolute;left:calc(var(--x) * var(--u));top:calc(var(--y) * var(--u));transform:translate(-50%,-50%);font:400 calc(var(--s) * var(--u))/1.1 "Samble","Ink Free",cursive;color:${INK};white-space:pre;animation:nt-wipe .45s ease-in var(--w) forwards}
.nt-w b{display:inline-block;font-weight:400;transform-origin:20% 90%;animation:nt-ink .28s cubic-bezier(.2,.7,.3,1) var(--c) both}
.nt-grow{animation:nt-grow var(--gd) var(--ge) var(--t) both,nt-wipe .45s ease-in var(--w) forwards}
.nt-boil{display:inline-block;animation:nt-boil .5s steps(1,end) var(--t) infinite}
.nt-sub{position:absolute;left:50%;top:calc(1440 * var(--u));transform:translate(-50%,-50%);width:max-content;max-width:calc(940 * var(--u));animation:nt-on .25s ease-out var(--t) both,nt-off .2s ease-in var(--e) forwards}
.nt-sub p{margin:0;text-align:center;font:600 calc(42 * var(--u))/1.3 var(--anatomy-mono,ui-monospace,Consolas,monospace);letter-spacing:.01em;color:${SUB_COMING}}
.nt-sub p span{animation:nt-say .15s linear var(--c) both,nt-past .3s linear var(--n) forwards}
@keyframes nt-draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
@keyframes nt-fade{to{opacity:0}}
@keyframes nt-ink{from{opacity:0;transform:translateY(.12em) rotate(-6deg) scale(.7)}60%{opacity:1}to{opacity:1;transform:none}}
@keyframes nt-wipe{to{opacity:0;transform:translate(-50%,-50%) translateY(calc(-14 * var(--u)))}}
@keyframes nt-grow{from{transform:translate(-50%,-50%) scale(var(--g0))}to{transform:translate(-50%,-50%) scale(var(--g1))}}
/* Line boil: the letter redraws itself in 4 slightly different poses, about 8 per second (hand-drawn animation). */
/* Line boil (text displace): the strokes go through moving noise, 4 noise patterns cycled 8 times a
   second. A CSS animation switches the filter, so capture.mjs steps it frame-exactly (no SMIL). */
@keyframes nt-boil{0%{filter:url(#ntb1)}25%{filter:url(#ntb2)}50%{filter:url(#ntb3)}75%{filter:url(#ntb4)}}
@keyframes nt-on{from{opacity:0}to{opacity:1}}
@keyframes nt-off{to{opacity:0}}
@keyframes nt-say{from{color:${SUB_COMING}}to{color:${INK}}}
@keyframes nt-past{to{color:${SUB_PAST}}}
</style>`;

// Noise filters for the line boil: same frequency and strength, four seeds (testers/episode-card-wiggle.html, style 1).
const BOIL = [1, 7, 13, 21].map((seed, i) =>
  `<filter id="ntb${i + 1}" x="-10%" y="-20%" width="120%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="${seed}"/><feDisplacementMap in="SourceGraphic" scale="5" xChannelSelector="R" yChannelSelector="G"/></filter>`).join("");

// Handwritten notes (Samble): every letter inks in on its own, staggered across the write duration.
// note = [x, y, size, start, duration, wipe, text, opts?]; (x, y) is the centre of the text.
// opts.grow = seconds the whole note keeps scaling while it shows, from opts.growFrom (0.55) to opts.growTo (1).
//   Growing past 1 accelerates ("larger and larger"); up to 1 it eases out.
// opts.group = notes that read as one block (the interview answer) count once for the crowding check.
// opts.alive = line boil: the strokes wobble through moving noise, like hand-drawn animation (end card).
function notesHtml(notes) {
  return notes.map(([x, y, sz, t, d, w, txt, o = {}]) => {
    const chars = [...txt];
    const step = d / Math.max(1, chars.length - 1);
    // Fixed per-letter offsets (no randomness) so every render is identical.
    const letter = (c, i) => (c === " " ? " " : `<b style="--c:${s(t + i * step)}">${esc(c)}</b>`);
    let ink = chars.map(letter).join("");
    // Line boil on the letters only: thin glyphs like the arrow would break apart under the displacement.
    if (o.alive) ink = chars.map((c, i) => (c === "→" ? letter(c, i) : `<span class="nt-boil">${letter(c, i)}</span>`)).join("");
    const cls = "nt-w" + (o.grow ? " nt-grow" : "");
    const grp = o.group ? ` data-group="${o.group}"` : "";
    return `<i class="${cls}"${grp} style="--x:${x};--y:${y};--s:${sz};--w:${s(w)};--t:${s(t)};--gd:${s(o.grow ?? 0)};--g0:${o.growFrom ?? 0.55};--g1:${o.growTo ?? 1};--ge:${(o.growTo ?? 1) > 1 ? "cubic-bezier(.45,0,.8,1)" : "cubic-bezier(.2,.7,.3,1)"}">${ink}</i>`;
  }).join("\n");
}

// Pen marks: pen = {t, d, w, p}; p is path data from pen.mjs (or a raw "M.. L.." string).
function penSvg(pen) {
  return pen.map(({ t, d, w, p }) =>
    `<g class="nt-g" style="--w:${s(w)}"><path class="nt-l" pathLength="1" style="--t:${s(t)};--d:${s(d)}" d="${p}"/></g>`).join("\n");
}

// Subtitle lines from the transcript when the cue says subtitles: "auto". A line ends at a full stop,
// a question mark, a comma after 3+ words, a pause over 0.35 s, or at 6 words.
export function autoLines(words) {
  const lines = [];
  let cur = [];
  const flush = (end) => {
    if (cur.length) lines.push([cur[0][0], end, cur.map((w) => w[2]).join(" ")]);
    cur = [];
  };
  words.forEach((w, i) => {
    cur.push(w);
    const next = words[i + 1];
    const gap = next ? next[0] - w[1] : 9;
    const stop = /[.?!:]$/.test(w[2]) || (/,$/.test(w[2]) && cur.length >= 3) || gap > 0.35 || cur.length >= 6;
    if (stop) flush(next ? Math.min(next[0] - 0.1, w[1] + 1.2) : w[1] + 1.5);
  });
  return lines;
}

// Printed subtitles, three tones: coming words faint, the spoken word dark, past words mid.
// line = [start, end, text]; word times come from the transcript when the word count matches.
function subsHtml(lines, spoken) {
  return lines.map(([a, b, txt]) => {
    const parts = txt.split(" ");
    const heard = spoken.filter(([st]) => st >= a - 0.08 && st < b);
    const tw = (i) => (heard.length === parts.length ? heard[i][0] : a + (i / parts.length) * Math.min(b - a, 2.2));
    const spans = parts.map((p, i) =>
      `<span style="--c:${s(Math.max(a, tw(i)))};--n:${i + 1 < parts.length ? s(Math.max(a, tw(i + 1))) : "999s"}">${p}</span>`).join(" ");
    return `<div class="nt-sub" style="--t:${s(a - 0.1)};--e:${s(b - 0.05)}"><p>${spans}</p></div>`;
  }).join("\n");
}

// Signature engraved on the board's front face, in the kit's own label style (face-text, mid tone,
// bold mono caps, pale lip under each letter). It is appended inside the board group [data-base],
// so it rises and lands with the board. Face geometry is measured on a rendered frame (README).
// e.board picks the board when a figure has several (0 = first svg.iso-svg); k keeps ids unique.
function engraveScript(e, k = 0) {
  const text = Array.from({ length: e.repeat ?? 2 }, () => e.words).flat().join(e.sep ?? "-");
  const [tx, ty] = e.topAt;
  return `<script id="rollin${k}">(()=>{
const TXT=${JSON.stringify(text)},X0=${e.x0},X1=${e.x1},SL=${e.slope},Y0=${ty}+SL*(X0-${tx}),FACE=${e.face},SIZE=${e.size};
const NS="http://www.w3.org/2000/svg",LEN=X1-X0;
const el=(n,a,p)=>{const e=document.createElementNS(NS,n);for(const k in a)e.setAttribute(k,a[k]);p&&p.appendChild(e);return e};
let g=null;
function build(base){
  g=el("g",{class:"rl-eng"},base);
  const clip=el("clipPath",{id:"rl-face${k}"},el("defs",{},g));
  el("rect",{x:0,y:1.5,width:LEN,height:FACE-3},clip);
  const face=el("g",{"clip-path":"url(#rl-face${k})"},g);
  const style="font-weight:700;font-family:var(--anatomy-mono,ui-monospace,Consolas,monospace),'Nirmala UI',sans-serif;letter-spacing:.12em;font-size:"+SIZE+"px";
  const y=FACE/2+SIZE*.36;
  el("text",{x:LEN/2,y:y+.8,fill:"#fbf3e2",opacity:.8,style,"text-anchor":"middle"},face).textContent=TXT;
  el("text",{x:LEN/2,y,class:"iso-face-text","data-tone":${JSON.stringify(e.tone ?? "mid")},style,"text-anchor":"middle"},face).textContent=TXT;
}
function place(){
  const base=document.querySelectorAll("svg.iso-svg [data-base]")[${e.board ?? 0}];
  if(!base) return requestAnimationFrame(place);
  const m=base.ownerSVGElement.getScreenCTM();
  if(!m) return requestAnimationFrame(place);
  const fw=Math.min(innerWidth,innerHeight*9/16), k=fw/1080;
  const L=(innerWidth-fw)/2, T=(innerHeight-fw*16/9)/2, inv=m.inverse();
  const P=(x,y)=>new DOMPoint(L+x*k,T+y*k).matrixTransform(inv);
  const o=P(X0,Y0), ax=P(X0+1,Y0+SL), ay=P(X0,Y0+1);
  if(!g) build(base);
  g.setAttribute("transform","matrix("+(ax.x-o.x)+" "+(ax.y-o.y)+" "+(ay.x-o.x)+" "+(ay.y-o.y)+" "+o.x+" "+o.y+")");
}
place();
addEventListener("resize",()=>requestAnimationFrame(place));
})();</script>`;
}

const NL = String.fromCharCode(10);

// Build one page from a cue variant. Returns the output path.
export function buildNotes(v) {
  const src = at(v.source), out = at(v.out);
  let html = readFileSync(src, "utf8");
  // Exact-text patches of the source bundle (e.g. the thicker board slab); each must match once.
  for (const [from, to, why] of v.patches ?? []) {
    if (!html.includes(from)) throw new Error(`patch not found (${why ?? from})`);
    html = html.replace(from, to);
  }
  if (!html.endsWith("</body></html>")) throw new Error("unexpected page end: " + src);

  let subs = "";
  if (v.subtitles) {
    if (!v.words || !existsSync(at(v.words))) throw new Error("subtitles need the transcript: " + v.words);
    const spoken = JSON.parse(readFileSync(at(v.words), "utf8"));
    subs = subsHtml(v.subtitles === "auto" ? autoLines(spoken) : v.subtitles, spoken);
  }
  // v.css: extra figure-scoped styles for this page only (e.g. restyling a readout to match the
  // reference figure); the source page stays untouched.
  const block = `${css(pathToFileURL(FONT).href)}${v.css ? `<style id="notes-figure">${v.css}</style>` : ""}
<div class="nt" aria-hidden="true" data-crowd="${v.crowd === false ? "off" : `${v.crowd?.max ?? 3},${v.crowd?.gap ?? 1.5}`}">
<svg viewBox="0 0 1080 1920"><defs>${BOIL}</defs>
${penSvg(v.pen ?? [])}
</svg>
${notesHtml(v.notes ?? [])}
${subs}
</div>
${[].concat(v.engrave ?? []).map(engraveScript).join(NL)}
`;
  writeFileSync(out, html.replace(/<\/body><\/html>$/, block + "</body></html>"));
  return out;
}

// Truth-table restyle to the house paper card (README section 6; testers/truth-table-styles.html,
// style 2) for a cue's `css`. sel is the page's table selector (e.g. ".gate-table"); size, when given,
// is the type size as a fraction of the frame width.
export function paperTable(sel, size) {
  const T = `.reel table${sel}`;
  return `
${T}{${size ? `font-size:calc(var(--fw) * ${size}) !important;` : ""}line-height:1;border-collapse:separate;border-spacing:0;background:#f6ecd6;border:calc(var(--fw) * .00167) solid #3b2a1a;border-radius:calc(var(--fw) * .012);padding:calc(var(--fw) * .012) calc(var(--fw) * .009)}
${T} th{color:var(--anatomy-muted);font-weight:400;padding:0 calc(var(--fw) * .028) calc(var(--fw) * .011) !important;border-bottom:calc(var(--fw) * .0012) solid var(--anatomy-faint) !important}
${T} td{color:var(--anatomy-text) !important;padding:calc(var(--fw) * .009) calc(var(--fw) * .028) !important}
${T} tbody tr:first-child td,${T} tr:has(th) + tr td{padding-top:calc(var(--fw) * .014) !important}
${T} tr[data-now] td{background:#ecdcbc !important;color:var(--anatomy-strong) !important}
${T} tr[data-now] td:last-child{color:#b5541c !important}
`;
}
