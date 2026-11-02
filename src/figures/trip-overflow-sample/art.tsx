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
  KNOB,
  knob,
  KNOB_LABEL,
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
import { BRAND, CALLOUT, FROM, RPM, SPEED, TO } from "./model";
import { TripLive } from "./live";

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
      <circle cx={g.u} cy={g.v} r={R + 1.6} fill="url(#trip-chrome)" />
      <circle cx={g.u} cy={g.v} r={R + 0.7} fill="#b9a47f" />
      <circle cx={g.u} cy={g.v} r={R + 0.3} fill="#fbf3e2" />
      <circle cx={g.u} cy={g.v} r={R} className="trip-gauge-face" />
      {red !== undefined ? <path className="trip-red-zone" d={gaugeArc(g, red, g.max, g.max, R - 1.3)} /> : null}
      {ticks.map((k) => {
        const isMajor = Math.abs(k / major - Math.round(k / major)) < 1e-6;
        const [x0, y0] = gaugePoint(g, k, g.max, R - (isMajor ? 2.6 : 1.6));
        const [x1, y1] = gaugePoint(g, k, g.max, R - 0.6);
        return <line key={k} className={isMajor ? "trip-tick trip-tick-major" : "trip-tick"} x1={x0} y1={y0} x2={x1} y2={y1} />;
      })}
      {nums.map((k) => {
        const [x, y] = gaugePoint(g, k, g.max, R - 5.2);
        return (
          <text key={k} className="trip-dial-num" x={x} y={y + 1.05} fontSize="2.9" textAnchor="middle">
            {k}
          </text>
        );
      })}
      {children}
      <line className="trip-needle" x1={tail[0]} y1={tail[1]} x2={tip[0]} y2={tip[1]} />
      <circle className="trip-hub" cx={g.u} cy={g.v} r="2" />
      <circle cx={g.u - 0.5} cy={g.v - 0.5} r="0.7" fill="#fbf3e2" opacity="0.7" />
      <path className="trip-shine" d={shineArc(g)} />
    </g>
  );
}

// Warning icons in unit coordinates (about -1..1). Only the warning triangle (red) and check-engine (yellow) are lit;
// the battery and headlight lamps are dark (faint sepia, no halo).
const DARK = "#8a7356";
function Icon({ kind }: { kind: number }) {
  if (kind === 0)
    return (
      <g>
        <path fill="none" stroke="#c2402f" className="trip-icon-ray" strokeLinejoin="round" d="M0-0.88L0.95 0.72H-0.95Z" />
        <text className="trip-icon-r" fill="#c2402f" y="0.55" fontSize="1.15" textAnchor="middle">
          !
        </text>
      </g>
    );
  if (kind === 1) return <path fill="#ffc21a" d="M-0.95-0.2H-0.75V-0.5H-0.2V-0.72H0.3V-0.5H0.6L0.76-0.3H0.98V0.42H0.76L0.6 0.62H-0.5L-0.7 0.32H-0.95Z" />;
  if (kind === 2)
    return (
      <g opacity="0.45">
        <path fill={DARK} d="M-0.95-0.45H0.95V0.65H-0.95ZM-0.7-0.45V-0.68H-0.35V-0.45ZM0.35-0.45V-0.68H0.7V-0.45Z" />
        <path className="trip-icon-cut" d="M-0.62 0.1H-0.22M-0.42-0.1V0.3M0.22 0.1H0.62" />
      </g>
    );
  return (
    <g opacity="0.45">
      <path fill={DARK} d="M0.05-0.62C1.05-0.62 1.05 0.62 0.05 0.62Z" />
      <path className="trip-icon-ray" stroke={DARK} d="M-0.95-0.5H-0.2M-0.95-0.17H-0.2M-0.95 0.17H-0.2M-0.95 0.5H-0.2" />
    </g>
  );
}
const LIGHT_HALO: (string | null)[] = ["trip-glow-r", "trip-glow-y", null, null];

// Trip meter: recessed window with 5 light drums, frozen mid-roll from FROM to TO: the upper half of each window
// shows the bottom of the outgoing digit, the lower half the top of the incoming one. Rust outline = active.
function TripMeter() {
  const mid = ODO.top + ODO.h / 2;
  const base = ODO.char * 0.36;
  return (
    <g>
      <rect className="trip-bezel" x={odoLeft - 0.8} y={ODO.top - 0.8} width={odoWidth + 1.6} height={ODO.h + 1.6} rx="0.6" />
      <g clipPath="url(#trip-clip-window)">
        {FROM.split("").map((d, i) => {
          const x = odoLeft + i * (ODO.drumW + ODO.gap);
          const cu = x + ODO.drumW / 2;
          return (
            <g key={i}>
              <rect x={x} y={ODO.top} width={ODO.drumW} height={ODO.h} fill="url(#trip-drum)" />
              <text className="trip-drum-digit" x={cu} y={mid - ODO.h / 2 + base} fontSize={ODO.char} textAnchor="middle">
                {d}
              </text>
              <text className="trip-drum-digit" x={cu} y={mid + ODO.h / 2 + base} fontSize={ODO.char} textAnchor="middle">
                {TO[i]}
              </text>
              <line className="trip-seam" x1={x} y1={mid} x2={x + ODO.drumW} y2={mid} />
              <rect x={x} y={ODO.top} width={ODO.drumW} height={ODO.h} fill="url(#trip-drum-shade)" />
            </g>
          );
        })}
      </g>
      <rect className="trip-active" x={odoLeft - 0.8} y={ODO.top - 0.8} width={odoWidth + 1.6} height={ODO.h + 1.6} rx="0.6" />
      <text className="trip-dial-num" x={ODO.u - 5.5} y={ODO.top + ODO.h + 2.9} fontSize="2.2" textAnchor="middle">
        TRIP
      </text>
    </g>
  );
}

// Trip-reset knob: a short stalk out of the housing front with a round cap, and an engraved label.
function TripKnob() {
  return (
    <g>
      <path className="trip-stem" d={knob.stem} />
      <circle transform={knob.backFrame} cx={KNOB.u} cy={-KNOB.w} r={KNOB.r} className="trip-knob-back" />
      <circle transform={knob.capFrame} cx={KNOB.u} cy={-KNOB.w} r={KNOB.r} className="trip-knob" />
    </g>
  );
}

// Static still: board with engraving and warm pool (rise), cluster binnacle and callout plate (fall), sparks.
export function TripArt() {
  return (
    <TripLive>
      <defs>
        <clipPath id="trip-clip-opening" clipPathUnits="userSpaceOnUse">
          <path d={pod.opening} />
        </clipPath>
        <clipPath id="trip-clip-window">
          <rect x={odoLeft} y={ODO.top} width={odoWidth} height={ODO.h} />
        </clipPath>
      </defs>
      <g data-entry="">
        <g data-base="">
          <g dangerouslySetInnerHTML={{ __html: boardSvg() }} />
          <g className="trip-engrave">
            <FaceText transform={boardEngrave} size={ENGRAVE_SIZE} tone="mid" anchor="middle">
              {ENGRAVE}
            </FaceText>
          </g>
          <path className="trip-pool" d={pod.pool} fill="url(#trip-warm-pool)" />
        </g>
        <g data-parts="">
          <path className="iso-halo" d={pod.halo} style={{ filter: "blur(3px)" }} />
          <Solid paths={pod.plinth} tone="mid" crease="lo" />
          <Solid paths={pod.housing} tone="mid" crease="lo" />
          <path className="trip-lip" d={pod.lip} />
          <path className="trip-recess" d={pod.opening} />
          <g clipPath="url(#trip-clip-opening)">
            <path className="trip-face" d={pod.face} />
            <g transform={pod.faceFrame}>
              <Gauge g={TACHO} minor={0.5} major={1} label={1} value={RPM} red={TACHO.red} />
              <Gauge g={SPEEDO} minor={10} major={20} label={40} value={SPEED}>
                <TripMeter />
              </Gauge>
              {[0, 1, 2, 3].map((k) => {
                const v = LIGHTS.v0 + k * LIGHTS.pitch;
                const halo = LIGHT_HALO[k];
                return (
                  <g key={k}>
                    {halo ? <circle cx={LIGHTS.u} cy={v} r={LIGHTS.size * 0.8} fill={`url(#${halo})`} /> : null}
                    <g transform={`translate(${LIGHTS.u} ${v}) scale(${LIGHTS.size / 2})`}>
                      <Icon kind={k} />
                    </g>
                  </g>
                );
              })}
            </g>
          </g>
          <g transform={pod.lipFrame}>
            <text className="trip-badge" x={BADGE.u} y={BADGE.v} fontSize={BADGE.size} textAnchor="middle">
              {BRAND}
            </text>
            <text className="trip-badge" x={KNOB_LABEL.u} y={KNOB_LABEL.v} fontSize={KNOB_LABEL.size} textAnchor="start">
              TRIP
            </text>
          </g>
          <TripKnob />
          <Solid paths={pod.hood} tone="mid" crease="lo" />
          <g>
            <Line d={callout.leader} tone="mid" />
            <Dots points={callout.leaderEnds} size={1.2} tone="hi" />
          </g>
          <Solid paths={callout.plate} tone="mid" crease="lo" />
          <path className="iso-line trip-lcd" data-tone="mid" d={callout.lcd} />
          {CALLOUT.split("").map((d, i) => (
            <text key={i} className="trip-lcd-text" transform={callout.digit(i)} fontSize={CALL_CHAR} textAnchor="middle">
              {d}
            </text>
          ))}
          <path className="trip-warn" d={callout.warn} />
        </g>
        <Sparks points={contacts.length} />
      </g>
    </TripLive>
  );
}
