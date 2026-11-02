// Analogy water kit: liquid colour, sloshing water boxes, glass, pipes, flow paths and taps.
import { flatPath, inset, pathD, prism, project, type Rect, type SolidPaths, type Vec2, type View } from "../iso-kit";
import "./water.css";

// Sepia: water blue #2f6fb8 (0) -> light rust #f0a868 (0.5) -> rust signal #b5541c (1), never through grey.
const STOPS = [
  [47, 111, 184],
  [240, 168, 104],
  [181, 84, 28],
];

export function liquidColor(u: number): string {
  const t = Math.min(1, Math.max(0, u));
  const i = t < 0.5 ? 0 : 1;
  const f = t < 0.5 ? t * 2 : t * 2 - 1;
  return `rgb(${STOPS[i].map((c, k) => Math.round(c + (STOPS[i + 1][k] - c) * f)).join(",")})`;
}

export type WaterPaths = { front: string; side: string; top: string; ripples: string[]; rim: string };

// Water inside `box` (inset 0.9) at `level` with a travelling surface:
// z(x) = level + amp * (0.7 sin(0.55x - 3.1t + phase) + 0.3 sin(1.3x + 2.3t + 2 phase)).
export function waterBox(box: Rect, level: number, amp: number, t: number, phase: number, view: View, seg = 18): WaterPaths {
  const b = inset(box, 0.9);
  const x0 = b.x;
  const x1 = b.x + b.w;
  const y0 = b.y;
  const y1 = b.y + b.d;
  const p = (x: number, y: number, z: number) => project([x, y, z], view);
  const surface = (x: number) => Math.max(0.05, level + amp * (0.7 * Math.sin(0.55 * x - 3.1 * t + phase) + 0.3 * Math.sin(1.3 * x + 2.3 * t + 2 * phase)));
  const xs = Array.from({ length: seg + 1 }, (_, i) => x0 + ((x1 - x0) * i) / seg);
  const back = [...xs].reverse();
  const along = (y: number, list: number[], lift = 0): Vec2[] => list.map((x) => p(x, y, surface(x) + lift));
  return {
    front: pathD([p(x0, y1, 0), p(x1, y1, 0), ...along(y1, back)], true),
    side: pathD([p(x1, y0, 0), p(x1, y1, 0), p(x1, y1, surface(x1)), p(x1, y0, surface(x1))], true),
    top: pathD([...along(y1, xs), ...along(y0, back)], true),
    ripples: [0.3, 0.62].map((f) => pathD(along(y0 + (y1 - y0) * f, xs, 0.02))),
    rim: pathD(along(y1, xs, 0.02)),
  };
}

export function waterSvg(w: WaterPaths): string {
  return (
    `<path class="an-w-side" d="${w.side}"/><path class="an-w-front" d="${w.front}"/><path class="an-w-top" d="${w.top}"/>` +
    w.ripples.map((d) => `<path class="an-w-ripple" d="${d}"/>`).join("") +
    `<path class="an-w-rim" d="${w.rim}"/>`
  );
}

// Glass walls: an ordinary prism, rendered inside a group with class "an-glass" (transparent faces, 5 % shades).
export const glassBox = (rect: Rect, z: number, h: number, view: View): SolidPaths => prism(rect, z, h, view, 4, 0.3);

// Round-ish pipes of diameter d along x (from x0 to x1 at y) or along y (from y0 to y1 at x), bottom at z.
export const pipeX = (x0: number, x1: number, y: number, z: number, d: number, view: View): SolidPaths =>
  prism({ x: Math.min(x0, x1), y: y - d / 2, w: Math.abs(x1 - x0), d, r: 0.4 }, z, d, view, 2, 0.2);

export const pipeY = (y0: number, y1: number, x: number, z: number, d: number, view: View): SolidPaths =>
  prism({ x: x - d / 2, y: Math.min(y0, y1), w: d, d: Math.abs(y1 - y0), r: 0.4 }, z, d, view, 2, 0.2);

// Centre line for an .an-drops flow overlay, at height z.
export const flowPath = (points: Vec2[], z: number, view: View): string => flatPath(points, z, view);

export type Tap = { body: SolidPaths; stem: SolidPaths; at: Vec2; z: number; r: number };

// Tap on a pipe at `at`: a small block body with a stem; the handle sits on top at z + h.
export function tap(at: Vec2, z: number, view: View, { size = 4, h = 5 }: { size?: number; h?: number } = {}): Tap {
  const body = prism({ x: at[0] - size / 2, y: at[1] - size / 2, w: size, d: size, r: 0.8 }, z, h, view, 3, 0.3);
  const stem = prism({ x: at[0] - 0.6, y: at[1] - 0.6, w: 1.2, d: 1.2, r: 0.6 }, z + h, 1.2, view, 6);
  return { body, stem, at, z: z + h + 1.2, r: size / 2 + 1.4 };
}

// One handle bar through the tap. open = 1: along the pipe (axis), open = 0: across it (shut).
export function tapSpokes(t: Pick<Tap, "at" | "z" | "r">, open: number, view: View, axis: "x" | "y" = "x"): string[] {
  const a = (axis === "x" ? 0 : Math.PI / 2) + (1 - open) * (Math.PI / 2);
  const dx = Math.cos(a) * t.r;
  const dy = Math.sin(a) * t.r;
  return [pathD([project([t.at[0] - dx, t.at[1] - dy, t.z], view), project([t.at[0] + dx, t.at[1] + dy, t.z], view)])];
}
