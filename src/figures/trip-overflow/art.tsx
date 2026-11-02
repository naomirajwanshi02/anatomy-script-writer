import type { ReactNode } from "react";
import { Dots, FaceText, Line, Solid } from "../../iso/react/draw";
import { Sparks } from "../../iso/react/reel";
import {
  BADGE,
  boardEngrave,
  boardSvg,
  CALL_CHAR,
  callout,
  CHAR_SIZE,
  contacts,
  ENGRAVE,
  ENGRAVE_SIZE,
  GAUGE_R,
  GHOST,
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
  ROW_LABEL_SIZE,
  ROW_LABELS,
  rowLabel,
  shineArc,
  signLabel,
  SPEEDO,
  TACHO,
  vlamp,
  wires,
  xorGate,
} from "./geometry";
import { Bulb } from "../../iso/react/bulb";
import { BRAND, LOST_DIGIT, START_TRIP, TRIP_DRUMS } from "./model";
import { TovLive } from "./live";

type GaugeSpec = { u: number; v: number; max: number; sweep: number };

// One round gauge in face-frame units: raised chrome-like ring (sepia light/mid bands), dark face, ticks, numbers,
// optional red zone, needle with hub cap, faint glass shine. The needle points at 0; the loop rotates it.
function Gauge({ g, id, minor, major, label, red, children }: { g: GaugeSpec; id: string; minor: number; major: number; label: number; red?: number; children?: ReactNode }) {
  const R = GAUGE_R;
  const ticks = Array.from({ length: Math.round(g.max / minor) + 1 }, (_, i) => i * minor);
  const nums = Array.from({ length: Math.round(g.max / label) + 1 }, (_, i) => i * label);
  const tail = gaugePoint(g, g.max * 0.5, g.max, 2.6);
  const tip = gaugePoint(g, 0, g.max, R - 2);
  return (
    <g>
      <circle cx={g.u + 0.5} cy={g.v + 0.7} r={R + 2.1} fill="#1e140a" opacity="0.35" />
      <circle cx={g.u} cy={g.v} r={R + 2.1} fill="#8a7356" />
      <circle cx={g.u} cy={g.v} r={R + 1.6} fill="url(#tov-chrome)" />
      <circle cx={g.u} cy={g.v} r={R + 0.7} fill="#b9a47f" />
      <circle cx={g.u} cy={g.v} r={R + 0.3} fill="#fbf3e2" />
      <circle cx={g.u} cy={g.v} r={R} className="tov-gauge-face" />
      {red !== undefined ? <path className="tov-red-zone" d={gaugeArc(g, red, g.max, g.max, R - 1.3)} /> : null}
      {ticks.map((k) => {
        const isMajor = Math.abs(k / major - Math.round(k / major)) < 1e-6;
        const [x0, y0] = gaugePoint(g, k, g.max, R - (isMajor ? 2.6 : 1.6));
        const [x1, y1] = gaugePoint(g, k, g.max, R - 0.6);
        return <line key={k} className={isMajor ? "tov-tick tov-tick-major" : "tov-tick"} x1={x0} y1={y0} x2={x1} y2={y1} />;
      })}
      {nums.map((k) => {
        const [x, y] = gaugePoint(g, k, g.max, R - 5.2);
        return (
          <text key={k} className="tov-dial-num" x={x} y={y + 1.05} fontSize="2.9" textAnchor="middle">
            {k}
          </text>
        );
      })}
      {children}
      <line data-needle={id} className="tov-needle" x1={tail[0]} y1={tail[1]} x2={tip[0]} y2={tip[1]} />
      <circle className="tov-hub" cx={g.u} cy={g.v} r="2" />
      <circle cx={g.u - 0.5} cy={g.v - 0.5} r="0.7" fill="#fbf3e2" opacity="0.7" />
      <path className="tov-shine" d={shineArc(g)} />
    </g>
  );
}

// Warning icons in unit coordinates (about -1..1): 0 warning triangle "!" (red), 1 check engine (yellow), 2 battery (red),
// 3 headlight (blue).
function Icon({ kind }: { kind: number }) {
  if (kind === 0)
    return (
      <g>
        <path fill="none" stroke="#c2402f" className="tov-icon-ray" strokeLinejoin="round" d="M0-0.88L0.95 0.72H-0.95Z" />
        <text className="tov-icon-r" fill="#c2402f" y="0.55" fontSize="1.15" textAnchor="middle">
          !
        </text>
      </g>
    );
  if (kind === 1) return <path fill="#ffc21a" d="M-0.95-0.2H-0.75V-0.5H-0.2V-0.72H0.3V-0.5H0.6L0.76-0.3H0.98V0.42H0.76L0.6 0.62H-0.5L-0.7 0.32H-0.95Z" />;
  if (kind === 2)
    return (
      <g>
        <path fill="#c2402f" d="M-0.95-0.45H0.95V0.65H-0.95ZM-0.7-0.45V-0.68H-0.35V-0.45ZM0.35-0.45V-0.68H0.7V-0.45Z" />
        <path className="tov-icon-cut" d="M-0.62 0.1H-0.22M-0.42-0.1V0.3M0.22 0.1H0.62" />
      </g>
    );
  return (
    <g>
      <path fill="#2f6fb8" d="M0.05-0.62C1.05-0.62 1.05 0.62 0.05 0.62Z" />
      <path className="tov-icon-ray" stroke="#2f6fb8" d="M-0.95-0.5H-0.2M-0.95-0.17H-0.2M-0.95 0.17H-0.2M-0.95 0.5H-0.2" />
    </g>
  );
}
const LIGHT_HALO = ["tov-glow-r", "tov-glow-y", "tov-glow-r", "tov-glow-b"];
const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

// Trip meter: recessed window, 5 light drums; each drum holds all 10 digits, placed round its axis by the loop.
// Rust outline on the window while the drums roll over (active).
function Odometer() {
  return (
    <g>
      <rect className="tov-bezel" x={odoLeft - 0.8} y={ODO.top - 0.8} width={odoWidth + 1.6} height={ODO.h + 1.6} rx="0.6" />
      <g clipPath="url(#tov-clip-window)">
        {Array.from({ length: TRIP_DRUMS }, (_, i) => {
          const x = odoLeft + i * (ODO.drumW + ODO.gap);
          return (
            <g key={i}>
              <rect x={x} y={ODO.top} width={ODO.drumW} height={ODO.h} fill="url(#tov-drum)" />
              <g data-drum={i}>
                {DIGITS.map((d) => (
                  <text key={d} className="tov-drum-digit" y={ODO.char * 0.36} fontSize={ODO.char} textAnchor="middle" style={{ display: "none" }}>
                    {d}
                  </text>
                ))}
              </g>
              <rect x={x} y={ODO.top} width={ODO.drumW} height={ODO.h} fill="url(#tov-drum-shade)" />
            </g>
          );
        })}
      </g>
      <rect data-trip-active="" className="tov-active" x={odoLeft - 0.8} y={ODO.top - 0.8} width={odoWidth + 1.6} height={ODO.h + 1.6} rx="0.6" style={{ opacity: 0 }} />
      <text className="tov-dial-num" x={ODO.u - 5.5} y={ODO.top + ODO.h + 2.9} fontSize="2.2" textAnchor="middle">
        TRIP
      </text>
      {/* The sixth drum the meter does not have: it shows the lost 1 as the drums roll over, then drops away. */}
      <g data-ghost="" style={{ opacity: 0 }}>
        <rect className="tov-ghost" x={GHOST.x} y={ODO.top} width={ODO.drumW} height={ODO.h} rx="0.5" />
        <text className="tov-drum-digit tov-ghost-digit" x={GHOST.x + ODO.drumW / 2} y={ODO.top + ODO.h / 2 + ODO.char * 0.36} fontSize={ODO.char} textAnchor="middle">
          {LOST_DIGIT}
        </text>
      </g>
    </g>
  );
}

// Trip-reset knob: a short stalk out of the housing front with a round cap.
function TripKnob() {
  return (
    <g>
      <path className="tov-stem" d={knob.stem} />
      <circle transform={knob.backFrame} cx={KNOB.u} cy={-KNOB.w} r={KNOB.r} className="tov-knob-back" />
      <circle transform={knob.capFrame} cx={KNOB.u} cy={-KNOB.w} r={KNOB.r} className="tov-knob" />
    </g>
  );
}

// Wire on the board: neutral base trace, rust flow dots on top while it carries a 1.
const Wire = ({ id, d }: { id: string; d: string }) => (
  <g data-wire={id} data-on="0">
    <path className="iso-line gate-trace" data-tone="lo" d={d} />
    <path className="iso-line gate-flow" data-tone="lit" data-flow="" d={d} />
  </g>
);

// Static art: board and pool (rise; the board is stretched by the loop), cluster and callout (fall, sink at the fold),
// bit tiles (rebuilt by the loop), sparks.
export function TovArt() {
  const start = `    ${String(START_TRIP).padStart(TRIP_DRUMS, "0")}    `;
  return (
    <TovLive>
      <defs>
        <clipPath id="tov-clip-pod" clipPathUnits="userSpaceOnUse">
          <path d={pod.clip} />
        </clipPath>
        <clipPath id="tov-clip-callout" clipPathUnits="userSpaceOnUse">
          <path d={callout.clip} />
        </clipPath>
        <clipPath id="tov-clip-opening" clipPathUnits="userSpaceOnUse">
          <path d={pod.opening} />
        </clipPath>
        <clipPath id="tov-clip-window">
          <rect x={odoLeft} y={ODO.top} width={odoWidth} height={ODO.h} />
        </clipPath>
      </defs>
      <g data-entry="">
        <g data-base="">
          <g data-board="" dangerouslySetInnerHTML={{ __html: boardSvg(0) }} />
          <g data-engrave="" className="tov-engrave">
            <FaceText transform={boardEngrave(0)} size={ENGRAVE_SIZE} tone="mid" anchor="middle">
              {ENGRAVE}
            </FaceText>
          </g>
          <g data-labels="" style={{ opacity: 0 }}>
            {ROW_LABELS.map((l, r) => (
              <FaceText key={l} transform={rowLabel(r)} size={ROW_LABEL_SIZE} tone="mid" anchor="middle">
                {l}
              </FaceText>
            ))}
          </g>
          <path className="tov-pool" d={pod.pool} fill="url(#tov-warm-pool)" style={{ opacity: 0 }} />
          <g data-labels-v="" style={{ opacity: 0 }}>
            <FaceText transform={vlamp.label} size={7} tone="mid" anchor="middle">
              V
            </FaceText>
          </g>
          <g data-sign="" style={{ opacity: 0 }}>
            <FaceText transform={signLabel} size={4.5} tone="mid" anchor="middle">
              SIGN
            </FaceText>
          </g>
          <g data-xor="" style={{ opacity: 0 }}>
            <Wire id="in" d={wires.carryIn} />
            <Wire id="out" d={wires.carryOut} />
            <Wire id="y" d={wires.out} />
          </g>
        </g>
        <g data-parts="">
          <g clipPath="url(#tov-clip-pod)">
            <g data-phone="">
              <path className="iso-halo" d={pod.halo} style={{ filter: "blur(3px)" }} />
              <Solid paths={pod.plinth} tone="mid" crease="lo" />
              <Solid paths={pod.housing} tone="mid" crease="lo" />
              <path className="tov-lip" d={pod.lip} />
              <path className="tov-recess" d={pod.opening} />
              <g clipPath="url(#tov-clip-opening)">
                <path className="tov-face" d={pod.face} />
                <g transform={pod.faceFrame}>
                  <Gauge g={TACHO} id="tach" minor={0.5} major={1} label={1} red={TACHO.red} />
                  <Gauge g={SPEEDO} id="speed" minor={10} major={20} label={40}>
                    <Odometer />
                  </Gauge>
                  {[0, 1, 2, 3].map((k) => {
                    const v = LIGHTS.v0 + k * LIGHTS.pitch;
                    return (
                      <g key={k}>
                        <circle data-halo={k} cx={LIGHTS.u} cy={v} r={LIGHTS.size * 0.8} fill={`url(#${LIGHT_HALO[k]})`} style={{ opacity: 0 }} />
                        <g data-light={k} transform={`translate(${LIGHTS.u} ${v}) scale(${LIGHTS.size / 2})`} style={{ opacity: 0.12 }}>
                          <Icon kind={k} />
                        </g>
                      </g>
                    );
                  })}
                </g>
              </g>
              <g transform={pod.lipFrame}>
                <text className="tov-badge" x={BADGE.u} y={BADGE.v} fontSize={BADGE.size} textAnchor="middle">
                  {BRAND}
                </text>
                <text className="tov-badge" x={KNOB_LABEL.u} y={KNOB_LABEL.v} fontSize={KNOB_LABEL.size} textAnchor="start">
                  TRIP
                </text>
              </g>
              <TripKnob />
              <Solid paths={pod.hood} tone="mid" crease="lo" />
            </g>
          </g>
          <g data-leader="">
            <Line d={callout.leader} tone="mid" />
            <Dots points={callout.leaderEnds} size={1.2} tone="hi" />
          </g>
          <g clipPath="url(#tov-clip-callout)">
            <g data-phone="">
              <Solid paths={callout.plate} tone="mid" crease="lo" />
              <path className="iso-line tov-lcd" data-tone="mid" d={callout.lcd} />
              {start.split("").map((d, i) => (
                <text key={i} data-call={i} className="tov-lcd-text" transform={callout.digit(i)} fontSize={CALL_CHAR} textAnchor="middle">
                  {d}
                </text>
              ))}
              <path className="tov-warn" d={callout.warn} style={{ opacity: 0 }} />
            </g>
          </g>
          <g data-gate="" style={{ opacity: 0 }}>
            <path className="iso-halo" d={xorGate.halo} style={{ filter: "blur(3px)" }} />
            <Solid paths={xorGate.body} tone="mid" />
            <path className="iso-line" data-tone="hi" d={xorGate.symbol} />
            <Line d={xorGate.leads} tone="mid" />
          </g>
          <g data-vlamp="" style={{ opacity: 0 }}>
            <Bulb parts={vlamp.bulb} />
          </g>
          <circle data-vglow="" className="tov-bulb-glow bulb-glow" cx={vlamp.bulb.glowAt[0].toFixed(1)} cy={vlamp.bulb.glowAt[1].toFixed(1)} r={(vlamp.bulb.glowR * 1.5).toFixed(1)} fill="url(#tov-bulb-glow)" style={{ opacity: 0 }} />
          {Array.from({ length: 32 }, (_, k) => (
            <g key={k} data-tile={k} style={{ display: "none" }}>
              <g data-slot="" />
              <FaceText transform="" size={CHAR_SIZE} tone="hi" anchor="middle">
                0
              </FaceText>
            </g>
          ))}
        </g>
        <Sparks points={contacts.length} />
      </g>
    </TovLive>
  );
}
