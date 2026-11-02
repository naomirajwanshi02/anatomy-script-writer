// Readout graph layout (SVG units): Vin row on top (0..1 V), I from VDD row below (0..iPeak); x = time across the
// current graph window. Windows are [t0, t1] video seconds; the model picks which window shows (TapsGraphState.w).
export const G = { w: 640, h: 380, l: 112, r: 16, t: 40, rowH: 120, gap: 70, iTop: 40 + 120 + 70 };
export const vy = (v: number) => G.t + G.rowH * (1 - v);
const f1 = (v: number) => v.toFixed(1);

export type GraphSample = { t: number; v: number; i: number };

export function makeGraph(windows: [number, number][], iPeak: number, hAt: (t: number) => number, current: (v: number) => number) {
  const iy = (i: number) => G.iTop + G.rowH * (1 - i / iPeak);
  const tx = (w: number, t: number) => {
    const [a, b] = windows[w];
    return G.l + ((t - a) / (b - a)) * (G.w - G.l - G.r);
  };
  // Samples for a window, up to time t.
  const samples = (w: number, t: number, step = 0.01) => {
    const [a, b] = windows[w];
    const out: GraphSample[] = [];
    const end = Math.min(t, b);
    for (let s = a; s < end; s += step) {
      const v = hAt(s);
      out.push({ t: s, v, i: current(v) });
    }
    if (end > a) {
      const v = hAt(end);
      out.push({ t: end, v, i: current(v) });
    }
    return out;
  };
  const curve = (w: number, s: GraphSample[], pick: (p: GraphSample) => number, y: (v: number) => number) =>
    s.length ? "M" + s.map((p) => `${f1(tx(w, p.t))},${f1(y(pick(p)))}`).join("L") : "";
  // Shaded area under the current between t0 and t1 (closed down to the zero line).
  const area = (w: number, s: GraphSample[], t0: number, t1: number) => {
    const pts = s.filter((p) => p.t >= t0 && p.t <= t1);
    if (pts.length < 2) return "";
    const a = pts[0].t;
    const b = pts[pts.length - 1].t;
    return `M${f1(tx(w, a))},${f1(iy(0))}` + pts.map((p) => `L${f1(tx(w, p.t))},${f1(iy(p.i))}`).join("") + `L${f1(tx(w, b))},${f1(iy(0))}Z`;
  };
  return { iy, tx, samples, curve, area };
}
export type TapsGraph = ReturnType<typeof makeGraph>;
