import { cylinder, heightPx, pathD, project, type Vec2, type View } from "../iso-kit";
import { Solid } from "./draw";
import "../bulb.css";

// Glass bulb lamp (the only lamp): base ring, screw socket with threads, glass globe, lead wires,
// zig-zag filament and a shine line. h is the socket height; the globe centre sits 4.8 above the socket top.
// Brightness comes from --lamp (0..1) set by the loop on an ancestor of <Bulb>.
export function bulbParts([x, y]: Vec2, view: View, { baseR = 6.2, h = 6 } = {}) {
  const at = (z: number, dx = 0, dy = 0) => project([x + dx, y + dy, z], view);
  const top = 1.6 + h;
  const globe = at(top + 4.8);
  const r = heightPx(6, view);
  const neck = at(top);
  const a: Vec2 = [globe[0] - r * 0.36, globe[1] + r * 0.1];
  const b: Vec2 = [globe[0] + r * 0.36, globe[1] + r * 0.1];
  const f = (p: Vec2) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
  return {
    base: cylinder(x, y, baseR, 0, 1.6, view, 28, 0.3),
    body: cylinder(x, y, 3.2, 1.6, h, view, 28, 0.4),
    threads: [0.2, 0.45, 0.7]
      .map((q) =>
        pathD(
          Array.from({ length: 13 }, (_, i) => {
            const t = ((-28 + 15 * i) * Math.PI) / 180;
            return at(1.6 + h * q + 0.6, 3.2 * Math.cos(t), 3.2 * Math.sin(t));
          }),
        ),
      )
      .join(""),
    globe,
    globeR: r,
    leads: `M${f([neck[0] - r * 0.22, neck[1]])}L${f(a)}M${f([neck[0] + r * 0.22, neck[1]])}L${f(b)}`,
    filament: "M" + Array.from({ length: 9 }, (_, i) => f([a[0] + ((b[0] - a[0]) * i) / 8, a[1] + (i % 2 ? -1 : 1) * r * 0.1])).join("L"),
    shine: `M${f([globe[0] - r * 0.6, globe[1] - r * 0.3])}Q${f([globe[0] - r * 0.45, globe[1] - r * 0.72])} ${f([globe[0] - r * 0.05, globe[1] - r * 0.76])}`,
    glowAt: globe,
    glowR: heightPx(22, view),
  };
}

export type BulbPaths = ReturnType<typeof bulbParts>;

export const Bulb = ({ parts }: { parts: BulbPaths }) => (
  <>
    <Solid paths={parts.base} tone="lo" />
    <Solid paths={parts.body} tone="mid" />
    <path className="iso-line" data-tone="lo" d={parts.threads} />
    <circle className="bulb-glass" cx={parts.globe[0].toFixed(1)} cy={parts.globe[1].toFixed(1)} r={parts.globeR.toFixed(1)} />
    <path className="iso-line" data-tone="lo" d={parts.leads} />
    <path className="iso-line bulb-filament" data-tone="mid" d={parts.filament} />
    <path className="iso-line" data-tone="faint" d={parts.shine} />
  </>
);

// Light pool around a lit bulb: put one in <defs> and fill a .bulb-glow circle with url(#id).
export const BulbGlowDef = ({ id }: { id: string }) => (
  <radialGradient id={id}>
    <stop offset="0" style={{ stopColor: "#fff6c8", stopOpacity: 0.55 }} />
    <stop offset="0.4" style={{ stopColor: "var(--bulb)", stopOpacity: 0.18 }} />
    <stop offset="1" style={{ stopColor: "var(--bulb)", stopOpacity: 0 }} />
  </radialGradient>
);
