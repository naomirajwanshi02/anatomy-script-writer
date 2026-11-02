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
  counter,
  CW,
  drumLeft,
  ENGRAVE,
  ENGRAVE_SIZE,
  GAUGE_R,
  gaugeArc,
  gaugePoint,
  LIGHTS,
  linkPath,
  ODO,
  odoLeft,
  odoWidth,
  pinionPath,
  pinU,
  pod,
  ROW_LABEL_SIZE,
  rowLabel,
  shineArc,
  SPEEDO,
  TACHO,
} from "./geometry";
import { B_VAL, BRAND, START_READING } from "./model";
import { TcLive } from "./live";

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
      <circle cx={g.u} cy={g.v} r={R + 1.6} fill="url(#tc-chrome)" />
      <circle cx={g.u} cy={g.v} r={R + 0.7} fill="#b9a47f" />
      <circle cx={g.u} cy={g.v} r={R + 0.3} fill="#fbf3e2" />
      <circle cx={g.u} cy={g.v} r={R} className="tc-gauge-face" />
      {red !== undefined ? <path className="tc-red-zone" d={gaugeArc(g, red, g.max, g.max, R - 1.3)} /> : null}
      {ticks.map((k) => {
        const isMajor = Math.abs(k / major - Math.round(k / major)) < 1e-6;
        const [x0, y0] = gaugePoint(g, k, g.max, R - (isMajor ? 2.6 : 1.6));
        const [x1, y1] = gaugePoint(g, k, g.max, R - 0.6);
        return <line key={k} className={isMajor ? "tc-tick tc-tick-major" : "tc-tick"} x1={x0} y1={y0} x2={x1} y2={y1} />;
      })}
      {nums.map((k) => {
        const [x, y] = gaugePoint(g, k, g.max, R - 5.2);
        return (
          <text key={k} className="tc-dial-num" x={x} y={y + 1.05} fontSize="2.9" textAnchor="middle">
            {k}
          </text>
        );
      })}
      {children}
      <line data-needle={id} className="tc-needle" x1={tail[0]} y1={tail[1]} x2={tip[0]} y2={tip[1]} />
      <circle className="tc-hub" cx={g.u} cy={g.v} r="2" />
      <circle cx={g.u - 0.5} cy={g.v - 0.5} r="0.7" fill="#fbf3e2" opacity="0.7" />
      <path className="tc-shine" d={shineArc(g)} />
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
        <path className="tc-icon-cut" d="M-0.62 0.1H-0.22M-0.42-0.1V0.3M0.22 0.1H0.62" />
      </g>
    );
  if (kind === 2)
    return (
      <g>
        <path fill="#2f6fb8" d="M0.05-0.62C1.05-0.62 1.05 0.62 0.05 0.62Z" />
        <path className="tc-icon-ray" stroke="#2f6fb8" d="M-0.95-0.5H-0.2M-0.95-0.17H-0.2M-0.95 0.17H-0.2M-0.95 0.5H-0.2" />
      </g>
    );
  return (
    <g>
      <circle className="tc-icon-ray" stroke="#c2402f" fill="none" r="0.9" />
      <text className="tc-icon-r" fill="#c2402f" y="0.42" fontSize="1.2" textAnchor="middle">
        R
      </text>
    </g>
  );
}
const LIGHT_HALO = ["tc-glow-y", "tc-glow-r", "tc-glow-b", "tc-glow-r"];
const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

// Mechanical odometer: recessed window, 4 light drums; each drum holds all 10 digits, placed round its axis by the loop.
function Odometer() {
  return (
    <g>
      <rect className="tc-bezel" x={odoLeft - 0.8} y={ODO.top - 0.8} width={odoWidth + 1.6} height={ODO.h + 1.6} rx="0.6" />
      <g clipPath="url(#tc-clip-window)">
        {[0, 1, 2, 3].map((i) => {
          const x = odoLeft + i * (ODO.drumW + ODO.gap);
          return (
            <g key={i}>
              <rect x={x} y={ODO.top} width={ODO.drumW} height={ODO.h} fill="url(#tc-drum)" />
              <g data-drum={i}>
                {DIGITS.map((d) => (
                  <text key={d} className="tc-drum-digit" y={ODO.char * 0.36} fontSize={ODO.char} textAnchor="middle" style={{ display: "none" }}>
                    {d}
                  </text>
                ))}
              </g>
              <rect x={x} y={ODO.top} width={ODO.drumW} height={ODO.h} fill="url(#tc-drum-shade)" />
            </g>
          );
        })}
      </g>
      <text className="tc-dial-num" x={ODO.u - 5.5} y={ODO.top + ODO.h + 3.2} fontSize="2.4" textAnchor="middle">
        km
      </text>
    </g>
  );
}

// Exposed binary counter (circuit): frame, dark window, 4 dark drums printed 0 1 0 1 ... round the rim (paper digits,
// gear teeth on both sides, placed round the axle by the loop), reading-line ticks, carry pinions under the gaps, the
// empty seat left of the left drum, and the wrap flash there.
const BIN_SLOTS = Array.from({ length: 10 }, (_, k) => String(k % 2));
function BinaryCounter() {
  const mid = (CW.v0 + CW.v1) / 2;
  return (
    <g data-counter="" style={{ display: "none" }}>
      <g clipPath="url(#tc-clip-counter)">
        <g data-counter-lift="">
          <path className="iso-halo" d={counter.halo} style={{ filter: "blur(3px)" }} />
          <Solid paths={counter.body} tone="mid" crease="lo" />
          <g transform={counter.face}>
            <rect className="tc-cwin" x={CW.u0} y={CW.v0} width={CW.u1 - CW.u0} height={CW.v1 - CW.v0} rx="1" />
            <g clipPath="url(#tc-clip-cwin)">
              {[0, 1, 2, 3].map((i) => (
                <g key={i}>
                  <rect x={drumLeft(i)} y={CW.v0} width={CW.drumW} height={CW.v1 - CW.v0} fill="url(#tc-bdrum)" />
                  <g data-bdrum={i}>
                    {BIN_SLOTS.map((d, k) => (
                      <text key={k} className="tc-bdrum-digit" y={CW.char * 0.36} fontSize={CW.char} textAnchor="middle" style={{ display: "none" }}>
                        {d}
                      </text>
                    ))}
                    {Array.from({ length: 20 }, (_, k) => (
                      <path key={k} className="tc-tooth" d="" />
                    ))}
                  </g>
                  <rect x={drumLeft(i)} y={CW.v0} width={CW.drumW} height={CW.v1 - CW.v0} fill="url(#tc-drum-shade)" />
                  <rect data-broll={i} className="tc-broll" x={drumLeft(i) + 0.3} y={CW.v0 + 0.3} width={CW.drumW - 0.6} height={CW.v1 - CW.v0 - 0.6} rx="0.8" style={{ opacity: 0 }} />
                </g>
              ))}
            </g>
            <path className="tc-cline" d={`M${CW.u0 - 2.2} ${mid}H${CW.u0 - 0.4}M${CW.u1 + 0.4} ${mid}H${CW.u1 + 2.2}`} />
            <path className="tc-axle" d={`M${CW.u0} ${CW.pinV}H${CW.u1}`} />
            <circle className="tc-seat" cx={pinU(0)} cy={CW.pinV} r={CW.pinR + 0.8} />
            {[0, 1, 2, 3].map((j) => (
              <g key={j} transform={`translate(${pinU(j)} ${CW.pinV})`}>
                <path data-pin={j} className="tc-pinion" d={pinionPath(CW.pinR)} />
                <circle className="tc-pin-hub" r="0.6" />
              </g>
            ))}
            <g data-flash="" transform={`translate(${pinU(0)} ${CW.pinV})`} style={{ opacity: 0 }}>
              <circle className="tc-flash" r="3" />
              <path className="tc-flash" d={Array.from({ length: 8 }, (_, k) => { const a = (k * Math.PI) / 4; return `M${(4 * Math.cos(a)).toFixed(2)} ${(4 * Math.sin(a)).toFixed(2)}L${(6.5 * Math.cos(a)).toFixed(2)} ${(6.5 * Math.sin(a)).toFixed(2)}`; }).join("")} />
            </g>
          </g>
        </g>
      </g>
    </g>
  );
}
// Static art: board and pool (rise; the board is stretched by the loop), cluster and callout (fall, sink at the fold),
// binary counter (drops in at the fold), shortcut tiles (rebuilt by the loop) and their link, sparks.
export function TcArt() {
  const start = START_READING.toString().padStart(4, "0");
  return (
    <TcLive>
      <defs>
        <clipPath id="tc-clip-pod" clipPathUnits="userSpaceOnUse">
          <path d={pod.clip} />
        </clipPath>
        <clipPath id="tc-clip-callout" clipPathUnits="userSpaceOnUse">
          <path d={callout.clip} />
        </clipPath>
        <clipPath id="tc-clip-opening" clipPathUnits="userSpaceOnUse">
          <path d={pod.opening} />
        </clipPath>
        <clipPath id="tc-clip-counter" clipPathUnits="userSpaceOnUse">
          <path d={counter.clip} />
        </clipPath>
        <clipPath id="tc-clip-cwin">
          <rect x={CW.u0} y={CW.v0} width={CW.u1 - CW.u0} height={CW.v1 - CW.v0} rx="1" />
        </clipPath>
        <clipPath id="tc-clip-window">
          <rect x={odoLeft} y={ODO.top} width={odoWidth} height={ODO.h} />
        </clipPath>
      </defs>
      <g data-entry="">
        <g data-base="">
          <g data-board="" dangerouslySetInnerHTML={{ __html: boardSvg(0) }} />
          <g data-engrave="" className="tc-engrave">
            <FaceText transform={boardEngrave(0)} size={ENGRAVE_SIZE} tone="mid" anchor="middle">
              {ENGRAVE}
            </FaceText>
          </g>
          <g data-labels="" style={{ opacity: 0 }}>
            <FaceText transform={rowLabel} size={ROW_LABEL_SIZE} tone="mid" anchor="middle">
              {String(B_VAL)}
            </FaceText>
          </g>
          <path className="tc-pool" d={pod.pool} fill="url(#tc-warm-pool)" style={{ opacity: 0 }} />
        </g>
        <g data-parts="">
          <g clipPath="url(#tc-clip-pod)">
            <g data-phone="">
              <path className="iso-halo" d={pod.halo} style={{ filter: "blur(3px)" }} />
              <Solid paths={pod.plinth} tone="mid" crease="lo" />
              <Solid paths={pod.housing} tone="mid" crease="lo" />
              <path className="tc-lip" d={pod.lip} />
              <path className="tc-recess" d={pod.opening} />
              <g clipPath="url(#tc-clip-opening)">
                <path className="tc-face" d={pod.face} />
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
                <text className="tc-badge" x={BADGE.u} y={BADGE.v} fontSize={BADGE.size} textAnchor="middle">
                  {BRAND}
                </text>
              </g>
              <Solid paths={pod.hood} tone="mid" crease="lo" />
            </g>
          </g>
          <g data-leader="">
            <Line d={callout.leader} tone="mid" />
            <Dots points={callout.leaderEnds} size={1.2} tone="hi" />
          </g>
          <g clipPath="url(#tc-clip-callout)">
            <g data-phone="">
              <Solid paths={callout.plate} tone="mid" crease="lo" />
              <path className="iso-line tc-lcd" data-tone="mid" d={callout.lcd} />
              {start.split("").map((d, i) => (
                <text key={i} data-call={i} className="tc-lcd-text" transform={callout.digit(i)} fontSize={CALL_CHAR} textAnchor="middle">
                  {d}
                </text>
              ))}
              <path className="tc-warn" d={callout.warn} style={{ opacity: 0 }} />
            </g>
          </g>
          <BinaryCounter />
          <g data-link="" style={{ opacity: 0 }}>
            <Line d={linkPath} tone="mid" />
          </g>
          {[0, 1, 2, 3].map((k) => (
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
    </TcLive>
  );
}
