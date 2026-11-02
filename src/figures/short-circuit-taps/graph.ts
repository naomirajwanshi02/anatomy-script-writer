// Readout graph layout (SVG units): Vin row on top (0..1 V), I from VDD row below (0..I_PEAK mA); x = time across the
// current graph window (model GRAPH_WINDOWS).
import { GRAPH_WINDOWS, I_PEAK, type graphSamples } from "./model";

export const G = { w: 640, h: 380, l: 112, r: 16, t: 40, rowH: 120, gap: 70, iTop: 40 + 120 + 70 };
export const vy = (v: number) => G.t + G.rowH * (1 - v);
export const iy = (i: number) => G.iTop + G.rowH * (1 - i / I_PEAK);
export const tx = (w: number, t: number) => {
  const [a, b] = GRAPH_WINDOWS[w];
  return G.l + ((t - a) / (b - a)) * (G.w - G.l - G.r);
};
const f1 = (v: number) => v.toFixed(1);
type S = ReturnType<typeof graphSamples>;
export const curve = (w: number, s: S, pick: (p: S[number]) => number, y: (v: number) => number) =>
  s.length ? "M" + s.map((p) => `${f1(tx(w, p.t))},${f1(y(pick(p)))}`).join("L") : "";
// Shaded area under the current between t0 and t1 (closed down to the zero line).
export function area(w: number, s: S, t0: number, t1: number) {
  const pts = s.filter((p) => p.t >= t0 && p.t <= t1);
  if (pts.length < 2) return "";
  const a = pts[0].t;
  const b = pts[pts.length - 1].t;
  return `M${f1(tx(w, a))},${f1(iy(0))}` + pts.map((p) => `L${f1(tx(w, p.t))},${f1(iy(p.i))}`).join("") + `L${f1(tx(w, b))},${f1(iy(0))}Z`;
}
