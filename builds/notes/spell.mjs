// Shared spelling for matching page text against a Whisper transcript (annotations.mjs, retake.mjs).
// Compare the page and the transcript in one spelling. Whisper writes numbers as digits ("58", "103", "21"),
// splits "P-moss" into "P" + "moss" and "tri-state" into "tri" + "-state", may join "V D D" as "VDD", and spells
// "halve" as "half". Both sides become canonical tokens (number words folded to digits) matched as one stream on
// token boundaries, so every one of those spellings meets its page twin.
export const UNITS = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19 };
export const TENS = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
export const rawToks = (s) => (s.replace(/\[[^\]]*\]/g, "").toLowerCase().replace(/['’]/g, "").match(/[a-z0-9]+/g) ?? [])
  .map((w) => (w === "halve" ? "half" : w));
// 1-99 at ts[j]: "seven", "sixty four"; null when ts[j] is not a number word
export function small(ts, j) {
  const w = ts[j]?.w;
  if (w in UNITS) return { v: UNITS[w], j: j + 1 };
  if (!(w in TENS)) return null;
  const u = ts[j + 1]?.w;
  return u in UNITS && UNITS[u] >= 1 && UNITS[u] <= 9 ? { v: TENS[w] + UNITS[u], j: j + 2 } : { v: TENS[w], j: j + 1 };
}
// fold number words into digits: "sixty four" -> 64, "a hundred and three" -> 103; "one zero one" stays 1 0 1
export function fold(ts) {
  const out = [];
  for (let k = 0; k < ts.length; ) {
    let n = ts[k].w === "a" && ts[k + 1]?.w === "hundred" ? { v: 1, j: k + 1 } : small(ts, k);
    if (!n) { out.push(ts[k]); k++; continue; }
    if (ts[n.j]?.w === "hundred" && n.v >= 1 && n.v <= 9) {
      n = { v: n.v * 100, j: n.j + 1 };
      const and = ts[n.j]?.w === "and" ? 1 : 0;
      const r = small(ts, n.j + and);
      if (r && r.v >= 1) n = { v: n.v + r.v, j: r.j };
    }
    out.push({ w: String(n.v), i: ts[k].i });
    k = n.j;
  }
  return out;
}
// page text -> canonical tokens
export const canon = (s) => fold(rawToks(s).map((w) => ({ w, i: 0 }))).map((x) => x.w);
// transcript [[start, end, word], ...] -> canonical tokens folded across word edges, each with its word index
export const transcriptTokens = (words) => fold(words.flatMap((w, i) => rawToks(w[2]).map((x) => ({ w: x, i }))));
