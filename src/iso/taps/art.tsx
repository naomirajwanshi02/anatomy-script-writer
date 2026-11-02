import type { CSSProperties } from "react";
import { Dots, FaceText, Line, Solid } from "../react/draw";
import { Bulb } from "../react/bulb";
import { Sparks } from "../react/reel";
import { ENGRAVE, ENGRAVE_SIZE, type TapParts, type ValveParts } from "./geometry";
import { G, vy } from "./graph";
import type { TapsConfig } from "./config";
import { TapsLive } from "./live";

// Every water part carries data-wfold (its fold pair), every circuit part data-cfold; the loop moves and fades them.
const Tap = ({ id, t }: { id: "fill" | "drain"; t: TapParts }) => (
  <g className="tw-tap">
    <Solid paths={t.body} tone="hi" crease="lo" />
    <Solid paths={t.stem} tone="hi" crease="none" />
    <Solid paths={t.wheel} tone="hi" crease="lo" />
    <path className="an-spoke tw-handle" data-tap-bar={id} d={t.bar(id === "fill" ? 1 : 0)} />
    <path className="tw-ring" data-tap-ring={id} d={t.ring} style={{ display: "none" }} />
  </g>
);

const Stream = ({ id }: { id: "fill" | "drain" }) => (
  <g className="tw-stream" data-stream={id} data-on="1">
    <path className="tw-stream-glow" d="" />
    <path className="tw-column" d="" />
    <path className="an-drops tw-drops" data-flow="" d="" />
  </g>
);

const Valve = ({ id, v }: { id: "p" | "n"; v: ValveParts }) => (
  <g className="tw-valve" data-valve={id} data-open="0">
    <Solid paths={v.arm} tone="mid" crease="none" />
    <g className="tw-vbody">
      <Solid paths={v.body} tone="hi" crease="lo" />
    </g>
    <g className="tw-vgate">
      <Solid paths={v.gate} tone="hi" crease="none" />
    </g>
  </g>
);

const Strap = ({ id, d }: { id: string; d: string }) => (
  <g className="tw-strap-g" data-strap={id} data-on="0">
    <path className="tw-strap" d={d} />
    <path className="tw-flow" d={d} />
  </g>
);

export function TapsArt({ cfg }: { cfg: TapsConfig }) {
  const { world: w, parts, labels } = cfg;
  const { board, circuit, lever2, ghost, grate, supply, fill, meter, fillTap, drainTap, drain, lever, out, out2, lamp2 } = w;
  return (
    <TapsLive cfg={cfg}>
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
          <g className="tw-engrave" data-engrave="">
            <FaceText transform={board.engraveAt} size={ENGRAVE_SIZE} tone="mid" anchor="middle">
              {ENGRAVE}
            </FaceText>
          </g>
          {/* Circuit: rails, straps, wires and engraved labels (flat on the board). */}
          <g data-cfold="supply">
            <g className="rail" data-rail="vdd">
              <Solid paths={circuit.vdd} tone="hi" crease="lo" />
            </g>
            <path className="tw-ring" data-pulse="vdd" d={circuit.vddRing} />
            <g className="rail-name" data-rail="vdd" data-lflash="vdd">
              <FaceText transform={circuit.vddLabel} size={5.6} tone="hi">
                {labels.vdd}
              </FaceText>
            </g>
          </g>
          <g data-cfold="grate">
            <g className="rail" data-rail="gnd">
              <Solid paths={circuit.gnd} tone="hi" crease="lo" />
            </g>
            <path className="tw-ring" data-pulse="gnd" d={circuit.gndRing} />
            <g className="rail-name" data-rail="gnd" data-lflash="gnd">
              <FaceText transform={circuit.gndLabel} size={5.6} tone="hi">
                {labels.gnd}
              </FaceText>
            </g>
          </g>
          <g data-cfold="fillTap">
            <Strap id="vddp" d={circuit.vddp} />
            <Strap id="pnode" d={circuit.pnode} />
            <g className="tw-label" data-lflash="pn">
              <FaceText transform={circuit.pLabel} size={6.4} tone="hi">
                {labels.pmos}
              </FaceText>
            </g>
          </g>
          <g data-cfold="drainTap">
            <Strap id="noden" d={circuit.noden} />
            <Strap id="ngnd" d={circuit.ngnd} />
            <Dots points={[circuit.node]} size={1.3} tone="hi" />
            <g className="tw-label" data-lflash="pn">
              <FaceText transform={circuit.nLabel} size={6.4} tone="hi">
                {labels.nmos}
              </FaceText>
            </g>
          </g>
          <g data-cfold="handle">
            <path className="iso-line tw-gate-wire" data-tone="mid" d={circuit.gate} />
            <Dots points={[circuit.gateJunction]} size={1.1} tone="mid" />
            <g className="tw-label tw-vin" data-lflash="vin">
              <FaceText transform={lever2.vinAt} size={5} tone="hi">
                <tspan data-vin-text="">{labels.vin(0)}</tspan>
              </FaceText>
            </g>
          </g>
          <g data-cfold="tank">
            <g className="tw-strap-g" data-strap="bus" data-on="0" data-dir="fwd">
              <path className="tw-strap" d={circuit.bus} />
              <path className="tw-flow tw-flow-fwd" d={circuit.bus} />
              <path className="tw-flow tw-flow-rev" d={circuit.busRev} />
            </g>
          </g>
          <g data-cfold="lamp">
            <path className="iso-line tw-gate-wire" data-tone="mid" d={circuit.lampWire} />
          </g>
          {parts.ghost ? (
            <g className="tw-ghost" data-ghost="" style={{ display: "none" }}>
              <Solid paths={ghost.base} tone="mid" />
            </g>
          ) : null}
        </g>
        <g data-parts="">
          {/* ---------------- Water rig ---------------- */}
          {parts.grate ? (
            <g data-wfold="grate">
              <Solid paths={grate.frame} tone="hi" crease="lo" />
              {grate.slots.map((d, i) => (
                <path key={i} className="tw-slot" d={d} />
              ))}
              <path className="tw-ring" data-pulse="grate" d={grate.ring} />
            </g>
          ) : null}
          <g data-wfold="supply">
            {supply.backLegs.map((p, i) => (
              <Solid key={i} paths={p} tone="mid" crease="none" />
            ))}
            <path className="tw-brace" d={supply.braceBack} />
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
            <path className="tw-brace" d={supply.brace} />
            <Solid paths={supply.platform} tone="hi" crease="lo" />
            <g data-box="supply">
              <g data-box-water="supply" transform={supply.shift} />
              <g className="an-glass">
                <Solid paths={supply.glass} tone="mid" crease="lo" />
              </g>
            </g>
            <path className="tw-plate" d={supply.plate} />
            <Dots points={supply.plateRivets} size={0.5} tone="hi" />
            <g className="tw-brand">
              <FaceText transform={supply.brandAt} size={w.BRAND_SIZE} tone="hi" anchor="middle">
                {labels.brand}
              </FaceText>
            </g>
          </g>
          {parts.meter ? (
            <g data-wfold="meter">
              <Solid paths={fill.dropTop} tone="mid" crease="none" />
              <Solid paths={fill.dropLow} tone="mid" crease="none" />
              <Solid paths={meter.box} tone="hi" crease="lo" />
              <path className="tw-meter-body" d={meter.body} />
              <path className="tw-meter-rim" d={meter.rim} />
              <path className="tw-dial" d={meter.dial} />
              <path className="tw-dial-ticks" d={meter.ticks} />
              <path className="tw-needle" data-needle="" d="" />
              <path className="tw-hub" d={meter.hub} />
              <path className="tw-window" d={meter.window} />
              <defs>
                {meter.drums.map((d, i) => (
                  <clipPath key={i} id={`tw-drum-${i}`}>
                    <path d={d} />
                  </clipPath>
                ))}
              </defs>
              {meter.drums.map((d, i) => (
                <g key={i}>
                  <path className="tw-drum" d={d} />
                  <g clipPath={`url(#tw-drum-${i})`} data-drum={i}>
                    <text className="tw-digit" data-dig="a" transform={w.drumDigitAt(i, 0)} fontSize={w.DIGIT_SIZE} textAnchor="middle">
                      0
                    </text>
                    <text className="tw-digit" data-dig="b" transform={w.drumDigitAt(i, 0)} fontSize={w.DIGIT_SIZE} textAnchor="middle">
                      0
                    </text>
                  </g>
                </g>
              ))}
              <g className="tw-label">
                <FaceText transform={meter.cupsAt} size={w.CUPS_SIZE} tone="hi" anchor="middle">
                  {labels.cups}
                </FaceText>
              </g>
              <path className="tw-ring" data-pulse="meter" d={meter.ring} />
            </g>
          ) : (
            <g data-wfold="supply">
              <Solid paths={fill.drop} tone="mid" crease="none" />
            </g>
          )}
          <g data-wfold="fillTap">
            {fill.down.map((p, i) => (
              <Solid key={i} paths={p} tone="mid" crease="lo" />
            ))}
            <Tap id="fill" t={fillTap} />
            {parts.tags ? (
              <>
                <path className="tw-arm" d={fill.tagArm} />
                <path className="tw-plate" d={fill.tag} />
                <g className="tw-label">
                  <FaceText transform={fill.tagText} size={5} tone="hi" anchor="middle">
                    {labels.fill}
                  </FaceText>
                </g>
              </>
            ) : null}
          </g>
          <g data-wfold="handle">
            <Solid paths={lever.base} tone="mid" />
            <Line d={lever.slot} tone="lo" />
            <path className="tw-tick" d={lever.ticks} />
            <path className="tw-tick tw-tick-mid" d={lever.midTick} />
            <Solid paths={lever.quadPost} tone="mid" crease="none" />
            <path className="tw-quadrant" d={lever.quadrant} />
            <path className="tw-arc" d={lever.arc} />
            <path className="tw-arc-tick" d={lever.arcTicks} />
            <path className="tw-arc-mid" d={lever.arcMid} />
            <Solid paths={lever.pivot} tone="mid" />
            <path className="iso-line tw-rod" data-tone="hi" data-lever-rod="" d="" />
            <g data-lever-knob="">
              <Solid paths={lever.knob} tone="hi" crease="lo" />
            </g>
            <path className="tw-ring" data-knob-ring="" d="" />
            {parts.slowmo ? (
              <g className="tw-slowmo" data-slowmo="" style={{ display: "none" }}>
                <FaceText transform={lever.slowmoAt} size={5.2} tone="hi">
                  {labels.slowmo}
                </FaceText>
              </g>
            ) : null}
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
            {parts.glint ? <path className="tw-glint" data-glint="" d={out.glint} /> : null}
            <Solid paths={fill.spout} tone="mid" crease="none" />
          </g>
          <g data-wfold="handle" data-links="">
            <path className="iso-line tw-link-rod" data-tone="hi" data-link="fill" d="" />
          </g>
          <g data-wfold="drainTap">
            {drain.run.map((p, i) => (
              <Solid key={i} paths={p} tone="mid" crease="lo" />
            ))}
          </g>
          <g data-wfold="handle" data-links="">
            <path className="iso-line tw-link-rod" data-tone="hi" data-link="drain" d="" />
          </g>
          <g data-wfold="drainTap">
            <Tap id="drain" t={drainTap} />
            {parts.tags ? (
              <>
                <path className="tw-arm" d={drain.tagArm} />
                <path className="tw-plate" d={drain.tag} />
                <g className="tw-label">
                  <FaceText transform={drain.tagText} size={5} tone="hi" anchor="middle">
                    {labels.drain}
                  </FaceText>
                </g>
              </>
            ) : null}
          </g>
          <g data-wfold="handle">
            <g className="iso-dots" data-tone="hi" data-link-joints="" />
          </g>
          <g data-wfold={parts.grate ? "grate" : "drainTap"}>
            <g data-splash="">
              <path className="tw-splash" d={grate.splash} />
              <path className="tw-splash-ring" d={grate.splashRing} />
            </g>
            <Solid paths={drain.elbow} tone="mid" crease="none" />
            <Stream id="drain" />
          </g>
          {parts.drip ? (
            <g data-wfold="drainTap">
              <circle className="tw-drip" data-drip="" r="2.2" cx="0" cy="0" style={{ display: "none" }} />
            </g>
          ) : null}

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
            <path className="tw-tick" d={lever2.ticks} />
            <g className="tw-marks">
              <FaceText transform={lever2.mark0} size={5} tone="lit">
                0
              </FaceText>
              <FaceText transform={lever2.mark1} size={5} tone="lit">
                1
              </FaceText>
            </g>
            <Solid paths={lever2.pivot} tone="mid" />
            <path className="iso-line tw-rod" data-tone="hi" data-lever2-rod="" d="" />
            <g data-lever2-knob="">
              <Solid paths={lever2.knob} tone="hi" crease="lo" />
            </g>
            <path className="tw-ring" data-lever2-ring="" d="" />
          </g>
          {parts.ghost ? (
            <g className="tw-ghost" data-ghost="" style={{ display: "none" }}>
              <path className="iso-line tw-ghost-rod" data-tone="hi" data-ghost-rod="" d="" />
              <g data-ghost-knob="">
                <Solid paths={ghost.knob} tone="hi" crease="lo" />
              </g>
            </g>
          ) : null}
          <g data-cfold="tank">
            <Solid paths={out2.plinth} tone="mid" />
            <g className="tw-out2" data-box-water="out2" transform={out2.shift} />
            <g className="an-glass">
              <Solid paths={out2.glass} tone="mid" crease="lo" />
            </g>
            <path className="tw-ring" data-pulse="out2" d={out2.ring} />
            <g className="tw-label">
              <FaceText transform={out2.loadAt} size={5.6} tone="hi">
                {labels.load}
              </FaceText>
            </g>
          </g>
          <g data-cfold="lamp">
            <g data-lamp="" style={{ "--lamp": "1" } as CSSProperties}>
              <circle className="tw-glow bulb-glow" cx={lamp2.glowAt[0].toFixed(1)} cy={lamp2.glowAt[1].toFixed(1)} r={lamp2.glowR.toFixed(1)} fill="url(#tw-glow)" />
              <Bulb parts={lamp2} />
            </g>
          </g>
        </g>
        <Sparks points={(parts.grate ? w.contacts : w.contactsNoGrate).length} />
      </g>
    </TapsLive>
  );
}

// Readout below the circuit board: a two-row graph (Vin with the both-on strip; I from VDD with the pulses, drawn live)
// and a counter (one row per edge or case).
export function TapsReadout({ cfg }: { cfg: TapsConfig }) {
  const gr = cfg.readout?.graph;
  const ct = cfg.readout?.counter;
  return (
    <div className="tw-readout" data-read="" style={{ opacity: 0 }}>
      {gr ? (
        <svg className="tw-graph" viewBox={`0 0 ${G.w} ${G.h}`} aria-hidden="true">
          <g data-vin-row="">
            <text className="tw-row-name" x={G.l} y={G.t - 14}>
              {gr.vinName}
            </text>
            <rect className="tw-band" data-band="" data-lit="0" x={G.l} y={vy(gr.vtp)} width={G.w - G.l - G.r} height={vy(gr.vtn) - vy(gr.vtp)} />
            <text className="tw-band-name" x={G.w - G.r - 6} y={vy(0.5) + 7} textAnchor="end">
              {gr.bandName}
            </text>
            <path className="tw-axis" d={`M${G.l},${vy(1) - 6}V${vy(0)}H${G.w - G.r}`} />
            {[0, 1].map((v) => (
              <text key={v} className="tw-tick-text" x={G.l - 10} y={vy(v) + 7} textAnchor="end">
                {v}
              </text>
            ))}
            {[gr.vtn, gr.vtp].map((v) => (
              <text key={v} className="tw-thr" x={G.l - 10} y={vy(v) + 7} textAnchor="end">
                {v} V
              </text>
            ))}
            <path className="tw-vin-curve" data-vin-curve="" d="" />
            {gr.edges.map((e, i) => (
              <text key={i} className="tw-edge" data-edge={i} x="0" y={vy(1) + 28} textAnchor={e.anchor} style={{ opacity: 0 }}>
                {e.text}
              </text>
            ))}
          </g>
          <g data-i-row="" style={{ opacity: 0 }}>
            <text className="tw-row-name" x={G.l} y={G.iTop - 14}>
              {gr.iName}
            </text>
            {Array.from({ length: gr.areas }, (_, i) => (
              <path key={i} className="tw-pulse" data-area={i} data-active="0" d="" />
            ))}
            <path className="tw-axis" d={`M${G.l},${G.iTop - 6}V${G.iTop + G.rowH}H${G.w - G.r}`} />
            {[0, 1].map((v) => (
              <text key={v} className="tw-tick-text" x={G.l - 10} y={G.iTop + G.rowH * (1 - v) + 7} textAnchor="end">
                {v}
              </text>
            ))}
            <path className="tw-icurve" data-icurve="" d="" />
          </g>
        </svg>
      ) : null}
      {ct ? (
        <div className="tw-energy" data-energy="" style={{ opacity: 0 }}>
          <div className="tw-energy-name">{ct.name}</div>
          {ct.rows.map((r, i) => (
            <div key={i} className="tw-energy-row" data-erow={i} data-state="off">
              <span className="tw-energy-edge">{r}</span>
              <span className="tw-energy-num" data-enum={i}>
                0
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
