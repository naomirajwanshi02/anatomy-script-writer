// Hand-drawn line helpers: turn kit paths into wobbly pen strokes that "boil" (redraw with fresh jitter
// a few times a second) and can be drawn on or erased by a progress value.
import type { Vec2 } from "../../iso/iso-kit";

export type Poly = { pts: Vec2[]; closed: boolean };

// The kit's pathD only writes M, L and Z, so a path string splits cleanly into polylines.
export function parseD(d: string): Poly[] {
  return d
    .split("M")
    .filter((s) => s.trim())
    .map((s) => {
      const n = (s.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
      const pts: Vec2[] = [];
      for (let i = 0; i + 1 < n.length; i += 2) pts.push([n[i], n[i + 1]]);
      return { pts, closed: /Z\s*$/.test(s) };
    });
}

// Even spacing along the line (frame px), so the wobble looks the same on long and short strokes.
export function resample({ pts, closed }: Poly, step = 7): Vec2[] {
  const src = closed ? [...pts, pts[0]] : pts;
  const out: Vec2[] = [src[0]];
  let carry = 0;
  for (let i = 1; i < src.length; i++) {
    const [x0, y0] = src[i - 1];
    const [x1, y1] = src[i];
    const len = Math.hypot(x1 - x0, y1 - y0);
    let s = step - carry;
    while (s < len) {
      out.push([x0 + ((x1 - x0) * s) / len, y0 + ((y1 - y0) * s) / len]);
      s += step;
    }
    carry = len - (s - step);
  }
  out.push(src[src.length - 1]);
  return out;
}

// First `frac` of a polyline, by length.
export function partial(pts: Vec2[], frac: number): Vec2[] {
  if (frac >= 1) return pts;
  if (frac <= 0 || pts.length < 2) return [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  const goal = total * frac;
  const out: Vec2[] = [pts[0]];
  let run = 0;
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (run + seg >= goal) {
      const u = (goal - run) / (seg || 1);
      out.push([pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * u, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * u]);
      return out;
    }
    run += seg;
    out.push(pts[i]);
  }
  return out;
}

// Deterministic noise in [-1, 1]: the same boil frame always draws the same wobble (capture-safe).
export const noise = (a: number, b: number, c: number) => {
  const v = Math.sin(a * 12.9898 + b * 78.233 + c * 37.719) * 43758.5453;
  return (v - Math.floor(v)) * 2 - 1;
};

const r1 = (v: number) => Math.round(v * 10) / 10;

// Wobbly smooth path through the points: each point is nudged by up to `amp` px, then joined with
// quadratic curves through the midpoints so the line squiggles instead of zig-zagging.
export function squiggle(pts: Vec2[], boil: number, id: number, amp: number): string {
  if (pts.length < 2) return "";
  const p = pts.map(([x, y], i): Vec2 => [x + noise(boil, id, i) * amp, y + noise(boil, id, i + 997) * amp]);
  let d = `M${r1(p[0][0])} ${r1(p[0][1])}`;
  for (let i = 1; i < p.length - 1; i++) {
    const mx = (p[i][0] + p[i + 1][0]) / 2;
    const my = (p[i][1] + p[i + 1][1]) / 2;
    d += `Q${r1(p[i][0])} ${r1(p[i][1])} ${r1(mx)} ${r1(my)}`;
  }
  const last = p[p.length - 1];
  return d + `L${r1(last[0])} ${r1(last[1])}`;
}
