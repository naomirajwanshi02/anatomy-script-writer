import type { ReactNode } from "react";
import { Dots, FaceText, Line, Solid } from "../../iso/react/draw";
import { Sparks } from "../../iso/react/reel";
import {
  BADGE,
  boardEngrave,
  boardSvg,
  CALL_CHAR,
  callout,
  contacts,
  ENGRAVE,
  ENGRAVE_SIZE,
  GAUGE_R,
  gaugeArc,
  gaugePoint,
  LIGHTS,
  ODO,
  odoLeft,
  odoWidth,
  pod,
  shineArc,
  SPEEDO,
  TACHO,
} from "./geometry";
import { BRAND, READING, RPM, SPEED } from "./model";
import { OdoLive } from "./live";

type GaugeSpec = { u: number; v: number; max: number; sweep: number };

// One round gauge in face-frame units: raised chrome-like ring (sepia light/mid bands), dark face, ticks, numbers,
// optional red zone, needle with hub cap, faint glass shine. Children draw extras between the numbers and the needle.
function Gauge({ g, minor, major, label, value, red, children }: { g: GaugeSpec; minor: number; major: number; label: number; value: number; red?: number; children?: ReactNode }) {
  const R = GAUGE_R;
  const ticks = Array.from({ length: Math.round(g.max / minor) + 1 }, (_, i) => i * minor);
  const nums = Array.from({ length: Math.round(g.max / label) + 1 }, (_, i) => i * label);
  const tail = gaugePoint(g, value + g.max * 0.5, g.max, 2.6);
  const tip = gaugePoint(g, value, g.max, R - 2);
  return (
    <g>
      <circle cx={g.u + 0.5} cy={g.v + 0.7} r={R + 2.1} fill="#1e140a" opacity="0.35" />
      <circle cx={g.u} cy={g.v} r={R + 2.1} fill="#8a7356" />
      <circle cx={g.u} cy={g.v} r={R + 1.6} fill="url(#odo-chrome)" />
      <circle cx={g.u} cy={g.v} r={R + 0.7} fill="#b9a47f" />
      <circle cx={g.u} cy={g.v} r={R + 0.3} fill="#fbf3e2" />
      <circle cx={g.u} cy={g.v} r={R} className="odo-gauge-face" />
      {red !== undefined ? <path className="odo-red-zone" d={gaugeArc(g, red, g.max, g.max, R - 1.3)} /> : null}
      {ticks.map((k) => {
        const isMajor = Math.abs(k / major - Math.round(k / major)) < 1e-6;
        const [x0, y0] = gaugePoint(g, k, g.max, R - (isMajor ? 2.6 : 1.6));
        const [x1, y1] = gaugePoint(g, k, g.max, R - 0.6);
        return <line key={k} className={isMajor ? "odo-tick odo-tick-major" : "odo-tick"} x1={x0} y1={y0} x2={x1} y2={y1} />;
      })}
      {nums.map((k) => {
        const [x, y] = gaugePoint(g, k, g.max, R - 5.2);
        return (
          <text key={k} className="odo-dial-num" x={x} y={y + 1.05} fontSize="2.9" textAnchor="middle">
            {k}
          </text>
        );
      })}
      {children}
      <line className="odo-needle" x1={tail[0]} y1={tail[1]} x2={tip[0]} y2={tip[1]} />
      <circle className="odo-hub" cx={g.u} cy={g.v} r="2" />
      <circle cx={g.u - 0.5} cy={g.v - 0.5} r="0.7" fill="#fbf3e2" opacity="0.7" />
      <path className="odo-shine" d={shineArc(g)} />
    </g>
  );
}

// Warning icons in unit coordinates (about -1..1).
function Icon({ kind }: { kind: number }) {
  if (kind === 0) return <path fill="#ffc21a" d="M-0.95-0.2H-0.75V-0.5H-0.2V-0.72H0.3V-0.5H0.6L0.76-0.3H0.98V0.42H0.76L0.6 0.62H-0.5L-0.7 0.32H-0.95Z" />;
  if (kind === 1)
    return (
      <g>
        <path fill="#c2402f" d="M-0.95-0.45H0.95V0.65H-0.95ZM-0.7-0.45V-0.68H-0.35V-0.45ZM0.35-0.45V-0.68H0.7V-0.45Z" />
        <path className="odo-icon-cut" d="M-0.62 0.1H-0.22M-0.42-0.1V0.3M0.22 0.1H0.62" />
      </g>
    );
  if (kind === 2)
    return (
      <g>
        <path fill="#2f6fb8" d="M0.05-0.62C1.05-0.62 1.05 0.62 0.05 0.62Z" />
        <path className="odo-icon-ray" stroke="#2f6fb8" d="M-0.95-0.5H-0.2M-0.95-0.17H-0.2M-0.95 0.17H-0.2M-0.95 0.5H-0.2" />
      </g>
    );
  return (
    <g>
      <circle className="odo-icon-ray" stroke="#c2402f" fill="none" r="0.9" />
      <text className="odo-icon-r" fill="#c2402f" y="0.42" fontSize="1.2" textAnchor="middle">
        R
      </text>
    </g>
  );
}
const LIGHT_HALO = ["odo-glow-y", "odo-glow-r", "odo-glow-b", "odo-glow-r"];

// Mechanical odometer: recessed window, 4 light drums with dark digits, the neighbours curving away above and below.
function Odometer() {
  return (
    <g>
      <rect className="odo-bezel" x={odoLeft - 0.8} y={ODO.top - 0.8} width={odoWidth + 1.6} height={ODO.h + 1.6} rx="0.6" />
      <g clipPath="url(#odo-clip-window)">
        {READING.split("").map((d, i) => {
          const x = odoLeft + i * (ODO.drumW + ODO.gap);
          const cu = x + ODO.drumW / 2;
          const mid = ODO.top + ODO.h / 2;
          const base = ODO.char * 0.36;
          const above = String((Number(d) + 1) % 10);
          const below = String((Number(d) + 9) % 10);
          return (
            <g key={i}>
              <rect x={x} y={ODO.top} width={ODO.drumW} height={ODO.h} fill="url(#odo-drum)" />
              <text className="odo-drum-digit" transform={`translate(${cu} ${mid - ODO.h * 0.5}) scale(1 0.4)`} y={base} fontSize={ODO.char} textAnchor="middle">
                {above}
              </text>
              <text className="odo-drum-digit" x={cu} y={mid + base} fontSize={ODO.char} textAnchor="middle">
                {d}
              </text>
              <text className="odo-drum-digit" transform={`translate(${cu} ${mid + ODO.h * 0.5}) scale(1 0.4)`} y={base} fontSize={ODO.char} textAnchor="middle">
                {below}
              </text>
              <rect x={x} y={ODO.top} width={ODO.drumW} height={ODO.h} fill="url(#odo-drum-shade)" />
            </g>
          );
        })}
      </g>
      <text className="odo-dial-num" x={ODO.u - 5.5} y={ODO.top + ODO.h + 3.2} fontSize="2.4" textAnchor="middle">
        km
      </text>
    </g>
  );
}

// Static still: board with engraving and warm pool (rise), cluster binnacle and callout plate (fall), sparks.
export function OdoArt() {
  return (
    <OdoLive>
      <defs>
        <clipPath id="odo-clip-opening" clipPathUnits="userSpaceOnUse">
          <path d={pod.opening} />
        </clipPath>
        <clipPath id="odo-clip-window">
          <rect x={odoLeft} y={ODO.top} width={odoWidth} height={ODO.h} />
        </clipPath>
      </defs>
      <g data-entry="">
        <g data-base="">
          <g dangerouslySetInnerHTML={{ __html: boardSvg() }} />
          <g className="odo-engrave">
            <FaceText transform={boardEngrave} size={ENGRAVE_SIZE} tone="mid" anchor="middle">
              {ENGRAVE}
            </FaceText>
          </g>
          <path className="odo-pool" d={pod.pool} fill="url(#odo-warm-pool)" />
        </g>
        <g data-parts="">
          <path className="iso-halo" d={pod.halo} style={{ filter: "blur(3px)" }} />
          <Solid paths={pod.plinth} tone="mid" crease="lo" />
          <Solid paths={pod.housing} tone="mid" crease="lo" />
          <path className="odo-lip" d={pod.lip} />
          <path className="odo-recess" d={pod.opening} />
          <g clipPath="url(#odo-clip-opening)">
            <path className="odo-face" d={pod.face} />
            <g transform={pod.faceFrame}>
              <Gauge g={TACHO} minor={0.5} major={1} label={1} value={RPM} red={TACHO.red} />
              <Gauge g={SPEEDO} minor={10} major={20} label={40} value={SPEED}>
                <Odometer />
              </Gauge>
              {[0, 1, 2, 3].map((k) => {
                const v = LIGHTS.v0 + k * LIGHTS.pitch;
                return (
                  <g key={k}>
                    <circle cx={LIGHTS.u} cy={v} r={LIGHTS.size * 0.8} fill={`url(#${LIGHT_HALO[k]})`} />
                    <g transform={`translate(${LIGHTS.u} ${v}) scale(${LIGHTS.size / 2})`}>
                      <Icon kind={k} />
                    </g>
                  </g>
                );
              })}
            </g>
          </g>
          <g transform={pod.lipFrame}>
            <text className="odo-badge" x={BADGE.u} y={BADGE.v} fontSize={BADGE.size} textAnchor="middle">
              {BRAND}
            </text>
          </g>
          <Solid paths={pod.hood} tone="mid" crease="lo" />
          <g>
            <Line d={callout.leader} tone="mid" />
            <Dots points={callout.leaderEnds} size={1.2} tone="hi" />
          </g>
          <Solid paths={callout.plate} tone="mid" crease="lo" />
          <path className="iso-line odo-lcd" data-tone="mid" d={callout.lcd} />
          {READING.split("").map((d, i) => (
            <text key={i} className="odo-lcd-text" transform={callout.digit(i)} fontSize={CALL_CHAR} textAnchor="middle">
              {d}
            </text>
          ))}
          <path className="odo-warn" d={callout.warn} />
        </g>
        <Sparks points={contacts.length} />
      </g>
    </OdoLive>
  );
}
