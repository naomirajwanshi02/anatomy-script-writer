import type { CSSProperties, ReactNode } from "react";
import type { SolidPaths } from "../iso-kit";
import { InView } from "./live";

type Tone = "hi" | "mid" | "lo" | "faint" | "lit" | "red" | "green" | "blue" | "none" | (string & {});

export function Solid({
  paths,
  tone = "hi",
  crease = "faint",
  halo = false,
  lit = false,
  flat = false,
  className,
  inner,
  children,
}: {
  paths: SolidPaths;
  tone?: Tone;
  crease?: Tone;
  halo?: boolean;
  lit?: boolean;
  flat?: boolean;
  className?: string;
  inner?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <g className={className ? `iso-solid ${className}` : "iso-solid"} data-lit={lit ? "" : undefined} data-seamless={paths.seamless ? "" : undefined}>
      {halo ? <path className="iso-halo" d={paths.fill} /> : null}
      <path className="iso-fill" d={paths.fill} />
      {flat ? null : paths.shades.map((d, i) => (d ? <path key={i} className="iso-shade" data-shade={i} d={d} /> : null))}
      {flat ? null : <path className="iso-top" d={paths.top} />}
      {crease === "none" || !paths.crease ? null : <path className="iso-line iso-crease" data-tone={crease} d={paths.crease} />}
      {crease === "none" || !paths.bevel ? null : <path className="iso-line iso-bevel" data-tone={crease} d={paths.bevel} />}
      {inner}
      <path className="iso-line iso-edge" data-tone={tone} d={paths.outline} />
      {children}
    </g>
  );
}

export function Line({
  d,
  tone = "lo",
  dotted = false,
  dashed = false,
  flow = false,
  className,
  free,
}: {
  d?: string;
  tone?: Tone;
  dotted?: boolean;
  dashed?: boolean;
  flow?: boolean;
  className?: string;
  free?: boolean | string;
}) {
  if (!d) return null;
  return (
    <path
      className={className ? `iso-line ${className}` : "iso-line"}
      data-tone={tone}
      data-dotted={dotted ? "" : undefined}
      data-dashed={dashed ? "" : undefined}
      data-flow={flow ? "" : undefined}
      data-free={free === true ? "" : free || undefined}
      d={d}
    />
  );
}

const r1 = (v: number) => Math.round(v * 10) / 10;

export function Dots({ points, size = 0.5, tone = "mid", pulse = false }: { points: [number, number, number?][]; size?: number; tone?: Tone; pulse?: boolean }) {
  return (
    <g className="iso-dots" data-tone={tone}>
      {points.map(([x, y, o], i) => (
        <circle
          key={i}
          cx={r1(x)}
          cy={r1(y)}
          r={size}
          fillOpacity={o !== undefined && o < 1 ? Math.max(0, o) : undefined}
          data-pulse={pulse ? "" : undefined}
          style={pulse ? ({ "--pulse-at": `${(i * 137) % 1600}ms` } as CSSProperties) : undefined}
        />
      ))}
    </g>
  );
}

export function FaceText({
  transform,
  children,
  size = 3,
  tone = "mid",
  anchor = "start",
}: {
  transform: string;
  children?: ReactNode;
  size?: number;
  tone?: Tone;
  anchor?: "start" | "middle" | "end";
}) {
  return (
    <text className="iso-face-text" data-tone={tone} transform={transform} fontSize={size} textAnchor={anchor}>
      {children}
    </text>
  );
}

export function Stage({ width, height, label, className, children }: { width: number; height: number; label: string; className?: string; children?: ReactNode }) {
  return (
    <InView className={className ? `iso-stage ${className}` : "iso-stage"}>
      <svg className="iso-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label} focusable="false">
        {children}
      </svg>
    </InView>
  );
}

// Older card layout (no built page uses it any more; kept for old figures). Corners render only with content.
export function Plate({
  fig,
  title,
  hint,
  readout,
  className,
  children,
}: {
  fig?: string;
  title?: ReactNode;
  hint?: ReactNode;
  readout?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  const corners = { fig, title, hint, readout };
  return (
    <figure className={className ? `iso-figure ${className}` : "iso-figure"}>
      <div className="iso-plate">
        {children}
        <div className="iso-plate-corners">
          {Object.entries(corners).map(([k, v]) =>
            v ? (
              <span key={k} className="iso-plate-corner" data-corner={k}>
                {v}
              </span>
            ) : null,
          )}
        </div>
      </div>
    </figure>
  );
}
