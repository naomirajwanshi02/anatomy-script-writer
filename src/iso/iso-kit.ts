// Anatomy iso kit: isometric projection and solid builders shared by every figure.
// Board units: x right, y toward the viewer, z up. Screen units: SVG stage pixels.

export type Vec2 = [number, number];
export type Vec3 = [number, number, number];

export type View = {
  origin: Vec2;
  scale: number;
  azimuth?: number;
  elevation?: number;
};

export type Rect = { x: number; y: number; w: number; d: number; r: number };

export type SolidPaths = {
  fill: string;
  outline: string;
  crease: string;
  top: string;
  shades: string[];
  bevel?: string;
  seamless?: boolean;
};

const DEG = Math.PI / 180;
const K = Math.sqrt(1.6);

function trig({ scale, azimuth = 45, elevation = 30 }: View) {
  const a = azimuth * DEG;
  const e = elevation * DEG;
  return { sinA: Math.sin(a), cosA: Math.cos(a), sinE: Math.sin(e), cosE: Math.cos(e), k: scale * K };
}

export function project([x, y, z]: Vec3, view: View): Vec2 {
  const { origin } = view;
  const { sinA, cosA, sinE, cosE, k } = trig(view);
  return [origin[0] + (x * sinA - y * cosA) * k, origin[1] + ((x * cosA + y * sinA) * sinE - z * cosE) * k];
}

// Board-plane direction that points at the camera (a face whose normal has a positive dot with it is visible).
function toward(view: View): Vec2 {
  const { sinA, cosA } = trig(view);
  return [cosA, sinA];
}

const num = (v: number) => {
  const s = (Math.round(v * 10) / 10).toFixed(1).replace(/\.0$/, "");
  return s === "-0" ? "0" : s;
};

export function pathD(points: Vec2[], close = false): string {
  return points.length ? points.map(([x, y], i) => `${i ? "L" : "M"}${num(x)} ${num(y)}`).join("") + (close ? "Z" : "") : "";
}

function roundedRect({ x, y, w, d, r }: Rect, seg = 8): Vec2[] {
  const rr = Math.max(0, Math.min(r, w / 2, d / 2));
  const corners: [number, number, number][] = [
    [x + w - rr, y + rr, -90],
    [x + w - rr, y + d - rr, 0],
    [x + rr, y + d - rr, 90],
    [x + rr, y + rr, 180],
  ];
  const out: Vec2[] = [];
  for (const [cx, cy, start] of corners) {
    const n = rr > 0 ? seg : 0;
    for (let i = 0; i <= n; i++) {
      const a = (start + (n ? (90 * i) / n : 45)) * DEG;
      out.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
    }
  }
  return out;
}

function signedArea(pts: Vec2[]): number {
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[(i + 1) % pts.length];
    s += x0 * y1 - x1 * y0;
  }
  return s / 2;
}

const clockwise = (pts: Vec2[]) => (signedArea(pts) < 0 ? [...pts].reverse() : pts);

function convexHull(pts: Vec2[]): Vec2[] {
  const s = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (s.length < 3) return s;
  const cross = (o: Vec2, a: Vec2, b: Vec2) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: Vec2[] = [];
  for (const p of s) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: Vec2[] = [];
  for (let i = s.length - 1; i >= 0; i--) {
    const p = s[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

// Index runs (as closed vertex chains) of edges whose flag equals `want`.
function runs(flags: boolean[], want: boolean): number[][] {
  const n = flags.length;
  const out: number[][] = [];
  const start = flags.findIndex((f, i) => f !== flags[(i + n - 1) % n]);
  if (start < 0) return flags[0] === want ? [Array.from({ length: n + 1 }, (_, i) => i % n)] : [];
  let cur: number[] | null = null;
  for (let j = 0; j < n; j++) {
    const i = (start + j) % n;
    if (flags[i] === want) {
      if (!cur) cur = [i];
      cur.push((i + 1) % n);
    } else if (cur) {
      out.push(cur);
      cur = null;
    }
  }
  if (cur) out.push(cur);
  return out;
}

function extrude(poly: Vec2[], z: number, h: number, view: View, opts: { convex?: boolean; bevel?: number } = {}): SolidPaths {
  const convex = opts.convex ?? true;
  const n = poly.length;
  const ccw = signedArea(poly) > 0;
  const [vx, vy] = toward(view);
  const { sinA, cosA } = trig(view);
  const normals: Vec2[] = poly.map(([x, y], i) => {
    const [x1, y1] = poly[(i + 1) % n];
    const dx = x1 - x;
    const dy = y1 - y;
    const len = Math.hypot(dx, dy) || 1;
    return ccw ? [dy / len, -dx / len] : [-dy / len, dx / len];
  });
  const visible = normals.map(([nx, ny]) => nx * vx + ny * vy > 1e-9);
  const top = poly.map(([x, y]) => project([x, y, z + h], view));
  const bottom = poly.map(([x, y]) => project([x, y, z], view));
  const outline: string[] = [];
  const crease: string[] = [];
  for (const r of runs(visible, false)) outline.push(pathD(r.map((i) => top[i])));
  for (const r of runs(visible, true)) {
    crease.push(pathD(r.map((i) => top[i])));
    if (h > 0) outline.push(pathD(r.map((i) => bottom[i])));
  }
  if (h > 0) for (let i = 0; i < n; i++) if (visible[(i + n - 1) % n] !== visible[i]) outline.push(pathD([top[i], bottom[i]]));
  let fill: string;
  if (convex) fill = pathD(convexHull([...top, ...bottom]), true);
  else {
    const parts = [pathD(clockwise(top), true), pathD(clockwise(bottom), true)];
    for (let i = 0; i < n; i++) {
      if (!visible[i]) continue;
      const j = (i + 1) % n;
      parts.push(pathD(clockwise([top[i], top[j], bottom[j], bottom[i]]), true));
    }
    fill = parts.join("");
  }
  const shades: string[][] = Array.from({ length: 4 }, () => []);
  if (h > 0) {
    const [lx, ly] = [-sinA, cosA];
    for (let i = 0; i < n; i++) {
      if (!visible[i]) continue;
      const [nx, ny] = normals[i];
      const facing = (nx * lx + ny * ly + 1) / 2;
      const s = Math.min(3, Math.max(0, Math.floor(facing * 4)));
      const j = (i + 1) % n;
      shades[s].push(pathD(clockwise([top[i], top[j], bottom[j], bottom[i]]), true));
    }
  }
  let bevel: string | undefined;
  if (opts.bevel && opts.bevel > 0) {
    const b = opts.bevel;
    const innerTop = poly
      .map(([x, y], i) => {
        const [ax, ay] = normals[(i + n - 1) % n];
        const [bx, by] = normals[i];
        const sx = ax + bx;
        const sy = ay + by;
        const len = Math.hypot(sx, sy) || 1;
        return [x - (sx / len) * b, y - (sy / len) * b] as Vec2;
      })
      .map(([x, y]) => project([x, y, z + h], view));
    bevel = runs(visible, true)
      .map((r) => pathD([top[r[0]], ...r.slice(1, -1).map((i) => innerTop[i]), top[r[r.length - 1]]]))
      .join("");
  }
  return { fill, outline: outline.join(""), crease: crease.join(""), top: pathD(clockwise(top), true), shades: shades.map((s) => s.join("")), bevel };
}

const rectPoly = (rect: Rect, seg = 8) => roundedRect(rect, seg);

export function prism(rect: Rect, z: number, h: number, view: View, seg = 8, bevel = 0): SolidPaths {
  return extrude(rectPoly(rect, seg), z, h, view, { convex: true, bevel });
}

function circlePoly(cx: number, cy: number, r: number, seg = 40): Vec2[] {
  return Array.from({ length: seg }, (_, i) => {
    const a = (i / seg) * Math.PI * 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as Vec2;
  });
}

export function cylinder(cx: number, cy: number, r: number, z: number, h: number, view: View, seg = 32, bevel = 0): SolidPaths {
  return extrude(circlePoly(cx, cy, r, seg), z, h, view, { convex: true, bevel });
}

export const inset = ({ x, y, w, d, r }: Rect, by: number): Rect => ({ x: x + by, y: y + by, w: w - by * 2, d: d - by * 2, r: Math.max(0, r - by) });

export function flatPath(points: Vec2[], z: number, view: View, close = false): string {
  return pathD(points.map(([x, y]) => project([x, y, z], view)), close);
}

export const flatRect = (rect: Rect, z: number, view: View, seg = 8) => flatPath(rectPoly(rect, seg), z, view, true);

export const flatCircle = (cx: number, cy: number, r: number, z: number, view: View, seg = 40) => flatPath(circlePoly(cx, cy, r, seg), z, view, true);

export function rectCorners({ x, y, w, d }: Omit<Rect, "r"> & { r?: number }, by = 0): Vec2[] {
  return [
    [x + by, y + by],
    [x + w - by, y + by],
    [x + by, y + d - by],
    [x + w - by, y + d - by],
  ];
}

export function boxCorners({ x, y, w, d }: Omit<Rect, "r"> & { r?: number }, z0: number, z1: number): Vec3[] {
  const out: Vec3[] = [];
  for (const px of [x, x + w]) for (const py of [y, y + d]) for (const pz of [z0, z1]) out.push([px, py, pz]);
  return out;
}

function frontEdge(poly: Vec2[], z: number, view: View): string {
  const n = poly.length;
  const ccw = signedArea(poly) > 0;
  const [vx, vy] = toward(view);
  const visible = poly.map(([x, y], i) => {
    const [x1, y1] = poly[(i + 1) % n];
    const dx = x1 - x;
    const dy = y1 - y;
    const [nx, ny] = ccw ? [dy, -dx] : [-dy, dx];
    return nx * vx + ny * vy > 1e-9;
  });
  return runs(visible, true)
    .map((r) => pathD(r.map((i) => project([poly[i][0], poly[i][1], z], view))))
    .join("");
}

export const rectFrontEdge = (rect: Rect, z: number, view: View, seg = 8) => frontEdge(rectPoly(rect, seg), z, view);

export const prismFill = (rect: Rect, z: number, h: number, view: View) => prism(rect, z, h, view).fill;

// Screen offset of a board-space vector, as an SVG translate.
function offsetOf(view: View, [x, y, z]: Vec3): Vec2 {
  const a = project([0, 0, 0], view);
  const b = project([x, y, z], view);
  return [b[0] - a[0], b[1] - a[1]];
}

const r2 = (v: number) => Math.round(v * 100) / 100;

export function translateTo(view: View, v: Vec3): string {
  const [dx, dy] = offsetOf(view, v);
  return `translate(${r2(dx)} ${r2(dy)})`;
}

const r3 = (v: number) => Math.round(v * 1e3) / 1e3;

function axesAt(p: Vec2, z: number, view: View) {
  const origin = project([p[0], p[1], z], view);
  const rel = (q: Vec3): Vec2 => {
    const [x, y] = project(q, view);
    return [x - origin[0], y - origin[1]];
  };
  return { origin, x: rel([p[0] + 1, p[1], z]), y: rel([p[0], p[1] + 1, z]), z: rel([p[0], p[1], z + 1]) };
}

const matrix = (a: Vec2, b: Vec2, o: Vec2) => `matrix(${r3(a[0])} ${r3(a[1])} ${r3(b[0])} ${r3(b[1])} ${r3(o[0])} ${r3(o[1])})`;

// SVG transform that lays text flat on the board at p, reading along +x ("x") or along +y ("y").
export function faceMatrix(p: Vec2, z: number, view: View, axis: "x" | "y" = "x"): string {
  const { origin, x, y } = axesAt(p, z, view);
  return axis === "x" ? matrix(x, y, origin) : matrix([-y[0], -y[1]], x, origin);
}

export function heightPx(h: number, view: View): number {
  const { cosE, k } = trig(view);
  return h * cosE * k;
}

export function fitView(
  points: Vec3[],
  width: number,
  height: number,
  { pad = 24, headroom = 0, azimuth = 45, elevation = 30 }: { pad?: number; headroom?: number; azimuth?: number; elevation?: number } = {},
): View {
  const unit: View = { origin: [0, 0], scale: 1, azimuth, elevation };
  const p = points.map((q) => project(q, unit));
  const xs = p.map(([x]) => x);
  const ys = p.map(([, y]) => y);
  const x0 = Math.min(...xs);
  const x1 = Math.max(...xs);
  const y0 = Math.min(...ys);
  const y1 = Math.max(...ys);
  const scale = Math.min((width - pad * 2) / (x1 - x0), (height - pad * 2 - headroom) / (y1 - y0));
  return { origin: [width / 2 - ((x0 + x1) / 2) * scale, headroom + (height - headroom) / 2 - ((y0 + y1) / 2) * scale], scale, azimuth, elevation };
}

// Markup string for a solid rebuilt every frame (same structure as the React <Solid>).
export function solidSvg(
  paths: SolidPaths,
  { tone = "hi", crease = "faint", halo = false, lit = false, flat = false, className, inner = "" }: { tone?: string; crease?: string; halo?: boolean; lit?: boolean; flat?: boolean; className?: string; inner?: string } = {},
): string {
  const out: string[] = [];
  if (halo) out.push(`<path class="iso-halo" d="${paths.fill}"/>`);
  out.push(`<path class="iso-fill" d="${paths.fill}"/>`);
  if (!flat) {
    paths.shades.forEach((d, i) => d && out.push(`<path class="iso-shade" data-shade="${i}" d="${d}"/>`));
    out.push(`<path class="iso-top" d="${paths.top}"/>`);
  }
  if (crease !== "none" && paths.crease) out.push(`<path class="iso-line iso-crease" data-tone="${crease}" d="${paths.crease}"/>`);
  if (crease !== "none" && paths.bevel) out.push(`<path class="iso-line iso-bevel" data-tone="${crease}" d="${paths.bevel}"/>`);
  if (inner) out.push(inner);
  out.push(`<path class="iso-line iso-edge" data-tone="${tone}" d="${paths.outline}"/>`);
  const attrs = [`class="${className ? `iso-solid ${className}` : "iso-solid"}"`, lit ? 'data-lit=""' : "", paths.seamless ? 'data-seamless=""' : ""].filter(Boolean).join(" ");
  return `<g ${attrs}>${out.join("")}</g>`;
}
