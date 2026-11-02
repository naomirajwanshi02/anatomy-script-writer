import type { CSSProperties } from "react";
import { Dots, FaceText, Line, Solid } from "../../iso/react/draw";
import { Bulb } from "../../iso/react/bulb";
import { Sparks } from "../../iso/react/reel";
import {
  board,
  BRAND_SIZE,
  circuit,
  contacts,
  CUPS_SIZE,
  DIGIT_SIZE,
  drain,
  drainTap,
  drumDigitAt,
  ENGRAVE,
  ENGRAVE_SIZE,
  fill,
  fillTap,
  ghost,
  grate,
  lamp2,
  lever,
  lever2,
  meter,
  out,
  out2,
  supply,
  type TapParts,
  type ValveParts,
} from "./geometry";
import { BRAND, SHARP, SLOW, VTN, VTP } from "./model";
import { G, vy } from "./graph";
import { ScLive } from "./live";

// Every water part carries data-wfold (its fold pair), every circuit part data-cfold; the loop moves and fades them.
const Tap = ({ id, t }: { id: "fill" | "drain"; t: TapParts }) => (
  <g className="sct-tap">
    <Solid paths={t.body} tone="hi" crease="lo" />
    <Solid paths={t.stem} tone="hi" crease="none" />
    <Solid paths={t.wheel} tone="hi" crease="lo" />
    <path className="an-spoke sct-handle" data-tap-bar={id} d={t.bar(id === "fill" ? 1 : 0)} />
    <path className="sct-ring" data-tap-ring={id} d={t.ring} style={{ display: "none" }} />
  </g>
);

const Stream = ({ id }: { id: "fill" | "drain" }) => (
  <g className="sct-stream" data-stream={id} data-on="1">
    <path className="sct-stream-glow" d="" />
    <path className="sct-column" d="" />
    <path className="an-drops sct-drops" data-flow="" d="" />
  </g>
);

const Valve = ({ id, v }: { id: "p" | "n"; v: ValveParts }) => (
  <g className="sct-valve" data-valve={id} data-open="0">
    <Solid paths={v.arm} tone="mid" crease="none" />
    <g className="sct-vbody">
      <Solid paths={v.body} tone="hi" crease="lo" />
    </g>
    <g className="sct-vgate">
      <Solid paths={v.gate} tone="hi" crease="none" />
    </g>
  </g>
);

const Strap = ({ id, d }: { id: string; d: string }) => (
  <g className="sct-strap-g" data-strap={id} data-on="0">
    <path className="sct-strap" d={d} />
    <path className="sct-flow" d={d} />
  </g>
);

export function ScArt() {
  return (
    <ScLive>
      <g data-entry="">
        <g data-base="">
          <path className="iso-halo" data-board-halo="" d={board.halo} />
          <g data-board-slab="">
            <Solid paths={board.slab} tone="mid" />
          </g>
          <path className="iso-line" data-tone="lo" data-board-groove="" d={board.groove} />
          <g data-board-screws="">
            <Dots points={board.screws} size={0.5} />
          </g>
          <g className="sct-engrave" data-engrave="">
            <FaceText transform={board.engraveAt} size={ENGRAVE_SIZE} tone="mid" anchor="middle">
              {ENGRAVE}
            </FaceText>
          </g>
          {/* Circuit: rails, straps, wires and engraved labels (flat on the board). */}
          <g data-cfold="supply">
            <g className="rail" data-rail="vdd">
              <Solid paths={circuit.vdd} tone="hi" crease="lo" />
            </g>
            <path className="sct-ring" data-pulse="vdd" d={circuit.vddRing} />
            <g className="rail-name" data-rail="vdd" data-lflash="vdd">
              <FaceText transform={circuit.vddLabel} size={5.6} tone="hi">
                VDD 1 V
              </FaceText>
            </g>
          </g>
          <g data-cfold="grate">
            <g className="rail" data-rail="gnd">
              <Solid paths={circuit.gnd} tone="hi" crease="lo" />
            </g>
            <path className="sct-ring" data-pulse="gnd" d={circuit.gndRing} />
            <g className="rail-name" data-rail="gnd" data-lflash="gnd">
              <FaceText transform={circuit.gndLabel} size={5.6} tone="hi">
                GND
              </FaceText>
            </g>
          </g>
          <g data-cfold="fillTap">
            <Strap id="vddp" d={circuit.vddp} />
            <Strap id="pnode" d={circuit.pnode} />
            <g className="sct-label" data-lflash="pn">
              <FaceText transform={circuit.pLabel} size={6.4} tone="hi">
                PMOS
              </FaceText>
            </g>
          </g>
          <g data-cfold="drainTap">
            <Strap id="noden" d={circuit.noden} />
            <Strap id="ngnd" d={circuit.ngnd} />
            <Dots points={[circuit.node]} size={1.3} tone="hi" />
            <g className="sct-label" data-lflash="pn">
              <FaceText transform={circuit.nLabel} size={6.4} tone="hi">
                NMOS
              </FaceText>
            </g>
          </g>
          <g data-cfold="handle">
            <path className="iso-line sct-gate-wire" data-tone="mid" d={circuit.gate} />
            <Dots points={[circuit.gateJunction]} size={1.1} tone="mid" />
            <g className="sct-label sct-vin" data-lflash="vin">
              <FaceText transform={lever2.vinAt} size={5} tone="hi">
                <tspan data-vin-text="">Vin 0.0 V</tspan>
              </FaceText>
            </g>
          </g>
          <g data-cfold="tank">
            <g className="sct-strap-g" data-strap="bus" data-on="0" data-dir="fwd">
              <path className="sct-strap" d={circuit.bus} />
              <path className="sct-flow sct-flow-fwd" d={circuit.bus} />
              <path className="sct-flow sct-flow-rev" d={circuit.busRev} />
            </g>
          </g>
          <g data-cfold="lamp">
            <path className="iso-line sct-gate-wire" data-tone="mid" d={circuit.lampWire} />
          </g>
          {/* Ghost water handle beside the lever (54.4 flick, 58.8 slow turn). */}
          <g className="sct-ghost" data-ghost="" style={{ display: "none" }}>
            <Solid paths={ghost.base} tone="mid" />
          </g>
        </g>
        <g data-parts="">
          {/* ---------------- Water rig ---------------- */}
          <g data-wfold="grate">
            <Solid paths={grate.frame} tone="hi" crease="lo" />
            {grate.slots.map((d, i) => (
              <path key={i} className="sct-slot" d={d} />
            ))}
            <path className="sct-ring" data-pulse="grate" d={grate.ring} />
          </g>
          <g data-wfold="supply">
            {supply.backLegs.map((p, i) => (
              <Solid key={i} paths={p} tone="mid" crease="none" />
            ))}
            <path className="sct-brace" d={supply.braceBack} />
          </g>
          <g data-wfold="fillTap">
            <Solid paths={fill.run} tone="mid" crease="lo" />
          </g>
          <g data-wfold="supply">
            {supply.feet.map((p, i) => (
              <Solid key={i} paths={p} tone="mid" crease="none" />
            ))}
            {supply.frontLegs.map((p, i) => (
              <Solid key={i} paths={p} tone="mid" crease="none" />
            ))}
            <path className="sct-brace" d={supply.brace} />
            <Solid paths={supply.platform} tone="hi" crease="lo" />
            <g data-box="supply">
              <g data-box-water="supply" transform={supply.shift} />
              <g className="an-glass">
                <Solid paths={supply.glass} tone="mid" crease="lo" />
              </g>
            </g>
            <path className="sct-plate" d={supply.plate} />
            <Dots points={supply.plateRivets} size={0.5} tone="hi" />
            <g className="sct-brand">
              <FaceText transform={supply.brandAt} size={BRAND_SIZE} tone="hi" anchor="middle">
                {BRAND}
              </FaceText>
            </g>
          </g>
          <g data-wfold="meter">
            <Solid paths={fill.dropTop} tone="mid" crease="none" />
            <Solid paths={fill.dropLow} tone="mid" crease="none" />
            <Solid paths={meter.box} tone="hi" crease="lo" />
            <path className="sct-meter-body" d={meter.body} />
            <path className="sct-meter-rim" d={meter.rim} />
            <path className="sct-dial" d={meter.dial} />
            <path className="sct-dial-ticks" d={meter.ticks} />
            <path className="sct-needle" data-needle="" d="" />
            <path className="sct-hub" d={meter.hub} />
            <path className="sct-window" d={meter.window} />
            <defs>
              {meter.drums.map((d, i) => (
                <clipPath key={i} id={`sct-drum-${i}`}>
                  <path d={d} />
                </clipPath>
              ))}
            </defs>
            {meter.drums.map((d, i) => (
              <g key={i}>
                <path className="sct-drum" d={d} />
                <g clipPath={`url(#sct-drum-${i})`} data-drum={i}>
                  <text className="sct-digit" data-dig="a" transform={drumDigitAt(i, 0)} fontSize={DIGIT_SIZE} textAnchor="middle">
                    0
                  </text>
                  <text className="sct-digit" data-dig="b" transform={drumDigitAt(i, 0)} fontSize={DIGIT_SIZE} textAnchor="middle">
                    0
                  </text>
                </g>
              </g>
            ))}
            <g className="sct-label">
              <FaceText transform={meter.cupsAt} size={CUPS_SIZE} tone="hi" anchor="middle">
                cups
              </FaceText>
            </g>
            <path className="sct-ring" data-pulse="meter" d={meter.ring} />
          </g>
          <g data-wfold="fillTap">
            {fill.down.map((p, i) => (
              <Solid key={i} paths={p} tone="mid" crease="lo" />
            ))}
            <Tap id="fill" t={fillTap} />
            <path className="sct-arm" d={fill.tagArm} />
            <path className="sct-plate" d={fill.tag} />
            <g className="sct-label">
              <FaceText transform={fill.tagText} size={5} tone="hi" anchor="middle">
                FILL
              </FaceText>
            </g>
          </g>
          <g data-wfold="handle">
            <Solid paths={lever.base} tone="mid" />
            <Line d={lever.slot} tone="lo" />
            <path className="sct-tick" d={lever.ticks} />
            <path className="sct-tick sct-tick-mid" d={lever.midTick} />
            <Solid paths={lever.quadPost} tone="mid" crease="none" />
            <path className="sct-quadrant" d={lever.quadrant} />
            <path className="sct-arc" d={lever.arc} />
            <path className="sct-arc-tick" d={lever.arcTicks} />
            <path className="sct-arc-mid" d={lever.arcMid} />
            <Solid paths={lever.pivot} tone="mid" />
            <path className="iso-line sct-rod" data-tone="hi" data-lever-rod="" d="" />
            <g data-lever-knob="">
              <Solid paths={lever.knob} tone="hi" crease="lo" />
            </g>
            <path className="sct-ring" data-knob-ring="" d="" />
            <g className="sct-slowmo" data-slowmo="" style={{ display: "none" }}>
              <FaceText transform={lever.slowmoAt} size={5.2} tone="hi">
                slow-mo
              </FaceText>
            </g>
          </g>
          <g data-wfold="tank">
            <Solid paths={out.plinth} tone="mid" />
            <g data-box="out">
              <g data-box-water="out" transform={out.shift} />
            </g>
            <Stream id="fill" />
            <g className="an-glass">
              <Solid paths={out.glass} tone="mid" crease="lo" />
            </g>
            <path className="sct-glint" data-glint="" d={out.glint} />
            <Solid paths={fill.spout} tone="mid" crease="none" />
          </g>
          <g data-wfold="handle" data-links="">
            <path className="iso-line sct-link-rod" data-tone="hi" data-link="fill" d="" />
          </g>
          <g data-wfold="drainTap">
            {drain.run.map((p, i) => (
              <Solid key={i} paths={p} tone="mid" crease="lo" />
            ))}
          </g>
          <g data-wfold="handle" data-links="">
            <path className="iso-line sct-link-rod" data-tone="hi" data-link="drain" d="" />
          </g>
          <g data-wfold="drainTap">
            <Tap id="drain" t={drainTap} />
            <path className="sct-arm" d={drain.tagArm} />
            <path className="sct-plate" d={drain.tag} />
            <g className="sct-label">
              <FaceText transform={drain.tagText} size={5} tone="hi" anchor="middle">
                DRAIN
              </FaceText>
            </g>
          </g>
          <g data-wfold="handle">
            <g className="iso-dots" data-tone="hi" data-link-joints="" />
          </g>
          <g data-wfold="grate">
            <g data-splash="">
              <path className="sct-splash" d={grate.splash} />
              <path className="sct-splash-ring" d={grate.splashRing} />
            </g>
            <Solid paths={drain.elbow} tone="mid" crease="none" />
            <Stream id="drain" />
          </g>
          <g data-wfold="drainTap">
            <circle className="sct-drip" data-drip="" r="2.2" cx="0" cy="0" style={{ display: "none" }} />
          </g>

          {/* ---------------- Circuit ---------------- */}
          <g data-cfold="fillTap">
            <Solid paths={circuit.pins[0].pin} tone="mid" crease="none" />
            <Solid paths={circuit.pins[0].cap} tone="hi" crease="lo" />
            <Line d={circuit.bubble} tone="hi" />
            <Valve id="p" v={circuit.p} />
          </g>
          <g data-cfold="drainTap">
            <Solid paths={circuit.pins[1].pin} tone="mid" crease="none" />
            <Solid paths={circuit.pins[1].cap} tone="hi" crease="lo" />
            <Valve id="n" v={circuit.n} />
          </g>
          <g data-cfold="handle">
            <Solid paths={lever2.base} tone="mid" />
            <Line d={lever2.slot} tone="lo" />
            <path className="sct-tick" d={lever2.ticks} />
            <g className="sct-marks">
              <FaceText transform={lever2.mark0} size={5} tone="lit">
                0
              </FaceText>
              <FaceText transform={lever2.mark1} size={5} tone="lit">
                1
              </FaceText>
            </g>
            <Solid paths={lever2.pivot} tone="mid" />
            <path className="iso-line sct-rod" data-tone="hi" data-lever2-rod="" d="" />
            <g data-lever2-knob="">
              <Solid paths={lever2.knob} tone="hi" crease="lo" />
            </g>
            <path className="sct-ring" data-lever2-ring="" d="" />
          </g>
          <g className="sct-ghost" data-ghost="" style={{ display: "none" }}>
            <path className="iso-line sct-ghost-rod" data-tone="hi" data-ghost-rod="" d="" />
            <g data-ghost-knob="">
              <Solid paths={ghost.knob} tone="hi" crease="lo" />
            </g>
          </g>
          <g data-cfold="tank">
            <Solid paths={out2.plinth} tone="mid" />
            <g className="sct-out2" data-box-water="out2" transform={out2.shift} />
            <g className="an-glass">
              <Solid paths={out2.glass} tone="mid" crease="lo" />
            </g>
            <path className="sct-ring" data-pulse="out2" d={out2.ring} />
            <g className="sct-label">
              <FaceText transform={out2.loadAt} size={5.6} tone="hi">
                load C
              </FaceText>
            </g>
          </g>
          <g data-cfold="lamp">
            <g data-lamp="" style={{ "--lamp": "1" } as CSSProperties}>
              <circle className="sct-glow bulb-glow" cx={lamp2.glowAt[0].toFixed(1)} cy={lamp2.glowAt[1].toFixed(1)} r={lamp2.glowR.toFixed(1)} fill="url(#sct-glow)" />
              <Bulb parts={lamp2} />
            </g>
          </g>
        </g>
        <Sparks points={contacts.length} />
      </g>
    </ScLive>
  );
}

// Readout below the circuit board: a two-row graph (Vin with the both-on strip; I from VDD with the pulses, drawn live)
// and the energy-lost counter (one row per edge).
export function ScReadout() {
  return (
    <div className="sct-readout" data-read="" style={{ opacity: 0 }}>
      <svg className="sct-graph" viewBox={`0 0 ${G.w} ${G.h}`} aria-hidden="true">
        <g data-vin-row="">
          <text className="sct-row-name" x={G.l} y={G.t - 14}>
            Vin
          </text>
          <rect className="sct-band" data-band="" data-lit="0" x={G.l} y={vy(VTP)} width={G.w - G.l - G.r} height={vy(VTN) - vy(VTP)} />
          <text className="sct-band-name" x={G.w - G.r - 6} y={vy(0.5) + 7} textAnchor="end">
            both on
          </text>
          <path className="sct-axis" d={`M${G.l},${vy(1) - 6}V${vy(0)}H${G.w - G.r}`} />
          {[0, 1].map((v) => (
            <text key={v} className="sct-tick-text" x={G.l - 10} y={vy(v) + 7} textAnchor="end">
              {v}
            </text>
          ))}
          {[VTN, VTP].map((v) => (
            <text key={v} className="sct-thr" x={G.l - 10} y={vy(v) + 7} textAnchor="end">
              {v} V
            </text>
          ))}
          <path className="sct-vin-curve" data-vin-curve="" d="" />
          <text className="sct-edge" data-edge="sharp" x="0" y={vy(1) + 28} textAnchor="start" style={{ opacity: 0 }}>
            {SHARP} s
          </text>
          <text className="sct-edge" data-edge="slow" x="0" y={vy(1) + 28} textAnchor="middle" style={{ opacity: 0 }}>
            {SLOW} s
          </text>
        </g>
        <g data-i-row="" style={{ opacity: 0 }}>
          <text className="sct-row-name" x={G.l} y={G.iTop - 14}>
            I from VDD (mA)
          </text>
          <path className="sct-pulse" data-area="a" data-active="0" d="" />
          <path className="sct-pulse" data-area="b" data-active="0" d="" />
          <path className="sct-axis" d={`M${G.l},${G.iTop - 6}V${G.iTop + G.rowH}H${G.w - G.r}`} />
          {[0, 1].map((v) => (
            <text key={v} className="sct-tick-text" x={G.l - 10} y={G.iTop + G.rowH * (1 - v) + 7} textAnchor="end">
              {v}
            </text>
          ))}
          <path className="sct-icurve" data-icurve="" d="" />
        </g>
      </svg>
      <div className="sct-energy" data-energy="" style={{ opacity: 0 }}>
        <div className="sct-energy-name">energy lost</div>
        <div className="sct-energy-row" data-erow="sharp" data-state="off">
          <span className="sct-energy-edge">{SHARP} s</span>
          <span className="sct-energy-num" data-enum="sharp">
            0
          </span>
        </div>
        <div className="sct-energy-row" data-erow="slow" data-state="off">
          <span className="sct-energy-edge">{SLOW} s</span>
          <span className="sct-energy-num" data-enum="slow">
            0
          </span>
        </div>
      </div>
    </div>
  );
}
