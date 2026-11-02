// Readout graph (Vout against Vin, 0..1 V on both axes): frame size and the swept transfer curves.
import { vss } from "./model";

export const G = { w: 300, h: 300, l: 58, r: 18, t: 18, b: 52 };
export const gx = (v: number) => G.l + v * (G.w - G.l - G.r);
export const gy = (v: number) => G.h - G.b - v * (G.h - G.t - G.b);

// Steady curve Vss(Vin) for one PMOS width, from Vin 0 up to `reach`.
const cache = new Map<string, string>();
export function curvePath(wp: number, reach: number) {
  if (reach < 0) return "";
  const key = `${wp}:${reach.toFixed(3)}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;
  const pts: string[] = [];
  const n = Math.max(2, Math.ceil(reach / 0.004));
  for (let i = 0; i <= n; i++) {
    const v = (reach * i) / n;
    pts.push(`${gx(v).toFixed(1)},${gy(vss(v, wp)).toFixed(1)}`);
  }
  const d = "M" + pts.join("L");
  cache.set(key, d);
  return d;
}
