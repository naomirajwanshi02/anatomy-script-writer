import type { CSSProperties } from "react";
import { Dots, FaceText, Line, Solid } from "../../iso/react/draw";
import { Bulb } from "../../iso/react/bulb";
import { Sparks } from "../../iso/react/reel";
import {
  board,
  board2,
  BOXES,
  BRAND_SIZE,
  circuit,
  contacts,
  contacts2,
  CUPS_SIZE,
  DIGIT_SIZE,
  drain,
  ENGRAVE,
  ENGRAVE_SIZE,
  fill,
  grate,
  lamp2,
  lever,
  lever2,
  links,
  meter,
  out,
  out2,
  streams,
  supply,
  type Box,
} from "./geometry";
import { BRAND, CUP_DIGITS, E_UNITS, EDGES, I_PEAK, LAMP, samples, SHARP, SLOW, T_END, VTN, VTP } from "./model";
import { ScLive } from "./live";

const WaterBox = ({ id, glass }: { id: Box; glass: Parameters<typeof Solid>[0]["paths"] }) => (
  <g data-box={id}>
    <g data-box-water={id} transform={BOXES[id].shift || undefined} />
    <g className="an-glass">
      <Solid paths={glass} tone="mid" crease="lo" />
    </g>
  </g>
);

const Stream = ({ id }: { id: keyof typeof streams }) => (
  <g className="sc-stream" data-stream={id} data-on="1">
    <path className="sc-column" d={streams[id].d} style={{ strokeWidth: streams[id].w.toFixed(2) }} />
    <path className="an-drops sc-drops" data-flow="" d={streams[id].d} />
  </g>
);

type TapParts = typeof fill.tap;
const Tap = ({ t }: { t: TapParts }) => (
  <g className="sc-tap">
    <Solid paths={t.body} tone="hi" crease="lo" />
    <Solid paths={t.stem} tone="hi" crease="none" />
    <Solid paths={t.wheel} tone="hi" crease="lo" />
    <path className="an-spoke sc-handle" d={t.handle} />
  </g>
);

const Engrave = ({ at }: { at: string }) => (
  <g className="sc-engrave">
    <FaceText transform={at} size={ENGRAVE_SIZE} tone="mid" anchor="middle">
      {ENGRAVE}
    </FaceText>
  </g>
);

// ---------------------------------------------------------------------------------------------------------------------
// Panel 1: the water rig, frozen at the handle's middle mark.
// ---------------------------------------------------------------------------------------------------------------------
export function ScArt1() {
  return (
    <ScLive panel={1}>
      <g data-entry="">
        <g data-base="">
          <path className="iso-halo" d={board.halo} />
          <Solid paths={board.slab} tone="mid" />
          <Line d={board.groove} tone="lo" />
          <Dots points={board.screws} size={0.5} />
          <Engrave at={board.engraveAt} />
        </g>
        <g data-parts="">
          {/* Grate at the front edge (lowest part, drawn first). */}
          <Solid paths={grate.frame} tone="hi" crease="lo" />
          {grate.slots.map((d, i) => (
            <path key={i} className="sc-slot" d={d} />
          ))}
          {/* High tank on its stand; the fill pipe's run passes behind the front legs. */}
          {supply.backLegs.map((p, i) => (
            <Solid key={i} paths={p} tone="mid" crease="none" />
          ))}
          <path className="sc-brace" d={supply.braceBack} />
          <Solid paths={fill.run} tone="mid" crease="lo" />
          {supply.feet.map((p, i) => (
            <Solid key={i} paths={p} tone="mid" crease="none" />
          ))}
          {supply.frontLegs.map((p, i) => (
            <Solid key={i} paths={p} tone="mid" crease="none" />
          ))}
          <path className="sc-brace" d={supply.brace} />
          <Solid paths={supply.platform} tone="hi" crease="lo" />
          <WaterBox id="supply" glass={supply.glass} />
          <path className="sc-plate" d={supply.plate} />
          <Dots points={supply.plateRivets} size={0.5} tone="hi" />
          <g className="sc-brand">
            <FaceText transform={supply.brandAt} size={BRAND_SIZE} tone="hi" anchor="middle">
              {BRAND}
            </FaceText>
          </g>
          {/* Drop pipe and the water meter (needle dial + two-drum cup counter). */}
          <Solid paths={fill.dropTop} tone="mid" crease="none" />
          <Solid paths={fill.dropLow} tone="mid" crease="none" />
          <Solid paths={meter.box} tone="hi" crease="lo" />
          <path className="sc-meter-body" d={meter.body} />
          <path className="sc-meter-rim" d={meter.rim} />
          <path className="sc-dial" d={meter.dial} />
          <path className="sc-dial-ticks" d={meter.ticks} />
          <path className="sc-needle" d={meter.needle} />
          <path className="sc-hub" d={meter.hub} />
          <path className="sc-window" d={meter.window} />
          {meter.drums.map((d, i) => (
            <path key={i} className="sc-drum" d={d} />
          ))}
          {meter.digitAt.map((t, i) => (
            <text key={i} className="sc-digit" transform={t} fontSize={DIGIT_SIZE} textAnchor="middle">
              {CUP_DIGITS[i]}
            </text>
          ))}
          <g className="sc-label">
            <FaceText transform={meter.cupsAt} size={CUPS_SIZE} tone="hi" anchor="middle">
              cups
            </FaceText>
          </g>
          {/* Fill pipe down to the fill tap. */}
          {fill.down.map((p, i) => (
            <Solid key={i} paths={p} tone="mid" crease="lo" />
          ))}
          <Tap t={fill.tap} />
          <path className="sc-arm" d={fill.tagArm} />
          <path className="sc-plate" d={fill.tag} />
          <g className="sc-label">
            <FaceText transform={fill.tagText} size={5} tone="hi" anchor="middle">
              FILL
            </FaceText>
          </g>
          {/* Handle. */}
          <Solid paths={lever.base} tone="mid" />
          <Line d={lever.slot} tone="lo" />
          <path className="sc-tick" d={lever.ticks} />
          <path className="sc-tick sc-tick-mid" d={lever.midTick} />
          <Solid paths={lever.pivot} tone="mid" />
          <path className="iso-line sc-rod" data-tone="hi" d={lever.rod} />
          <g transform={lever.knobAt}>
            <Solid paths={lever.knob} tone="hi" crease="lo" />
          </g>
          {/* Glass tank. */}
          <Solid paths={out.plinth} tone="mid" />
          <g data-box="out">
            <g data-box-water="out" transform={BOXES.out.shift} />
          </g>
          <Stream id="fill" />
          <g className="an-glass">
            <Solid paths={out.glass} tone="mid" crease="lo" />
          </g>
          <Solid paths={fill.spout} tone="mid" crease="none" />
          <path className="iso-line sc-link-rod" data-tone="hi" d={links.fill} />
          {/* Drain pipe, tap and the stream into the grate. */}
          {drain.run.map((p, i) => (
            <Solid key={i} paths={p} tone="mid" crease="lo" />
          ))}
          <path className="iso-line sc-link-rod" data-tone="hi" d={links.drain} />
          <Tap t={drain.tap} />
          <path className="sc-arm" d={drain.tagArm} />
          <path className="sc-plate" d={drain.tag} />
          <g className="sc-label">
            <FaceText transform={drain.tagText} size={5} tone="hi" anchor="middle">
              DRAIN
            </FaceText>
          </g>
          <Dots points={links.joints} size={0.9} tone="hi" />
          <path className="sc-splash" d={grate.splash} />
          <path className="sc-splash-ring" d={grate.splashRing} />
          <Solid paths={drain.elbow} tone="mid" crease="none" />
          <Stream id="drain" />
        </g>
        <Sparks points={contacts.length} />
      </g>
    </ScLive>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Panel 2: the CMOS inverter at Vin = 0.5 V, both devices on, short-circuit current VDD -> GND.
// ---------------------------------------------------------------------------------------------------------------------
type ValveParts = typeof circuit.p;
const Valve = ({ id, v }: { id: "p" | "n"; v: ValveParts }) => (
  <g className="sc-valve" data-valve={id} data-open="1">
    <Solid paths={v.arm} tone="mid" crease="none" />
    <g className="sc-vbody">
      <Solid paths={v.body} tone="hi" crease="lo" />
    </g>
    <g className="sc-vgate">
      <Solid paths={v.gate} tone="hi" crease="none" />
    </g>
  </g>
);

export function ScArt2() {
  return (
    <ScLive panel={2}>
      <g data-entry="">
        <g data-base="">
          <path className="iso-halo" d={board2.halo} />
          <Solid paths={board2.slab} tone="mid" />
          <Line d={board2.groove} tone="lo" />
          <Dots points={board2.screws} size={0.5} />
          <Engrave at={board2.engraveAt} />
          {circuit.path.map((d, i) => (
            <g key={i} className="sc-strap-g" data-strap="sc" data-on="1">
              <path className="sc-strap" d={d} />
              <path className="sc-flow" d={d} />
            </g>
          ))}
          <g className="sc-strap-g" data-strap="bus" data-on="0">
            <path className="sc-strap" d={circuit.bus} />
          </g>
          <path className="iso-line sc-gate-wire" data-tone="mid" d={circuit.lampWire} />
          <Dots points={[circuit.node]} size={1.3} tone="hi" />
          <path className="iso-line sc-gate-wire" data-tone="mid" d={circuit.gate} />
          <Dots points={[circuit.gateJunction]} size={1.1} tone="mid" />
          <g className="rail" data-rail="vdd">
            <Solid paths={circuit.vdd} tone="hi" crease="lo" />
          </g>
          <g className="rail" data-rail="gnd">
            <Solid paths={circuit.gnd} tone="hi" crease="lo" />
          </g>
          <g className="rail-name" data-rail="vdd">
            <FaceText transform={circuit.vddLabel} size={5.6} tone="hi">
              VDD 1 V
            </FaceText>
          </g>
          <g className="rail-name" data-rail="gnd">
            <FaceText transform={circuit.gndLabel} size={5.6} tone="hi">
              GND
            </FaceText>
          </g>
          <g className="sc-label">
            <FaceText transform={circuit.pLabel} size={6.4} tone="hi">
              PMOS
            </FaceText>
            <FaceText transform={circuit.nLabel} size={6.4} tone="hi">
              NMOS
            </FaceText>
          </g>
          <g className="sc-label sc-vin">
            <FaceText transform={lever2.vinAt} size={5} tone="hi">
              Vin 0.5 V
            </FaceText>
          </g>
        </g>
        <g data-parts="">
          {circuit.pins.map((p, i) => (
            <g key={i}>
              <Solid paths={p.pin} tone="mid" crease="none" />
              <Solid paths={p.cap} tone="hi" crease="lo" />
            </g>
          ))}
          <Line d={circuit.bubble} tone="hi" />
          <Valve id="p" v={circuit.p} />
          <Valve id="n" v={circuit.n} />
          {/* Input lever, part way up. */}
          <Solid paths={lever2.base} tone="mid" />
          <Line d={lever2.slot} tone="lo" />
          <path className="sc-tick" d={lever2.ticks} />
          <g className="sc-marks">
            <FaceText transform={lever2.mark0} size={5} tone="lit">
              0
            </FaceText>
            <FaceText transform={lever2.mark1} size={5} tone="lit">
              1
            </FaceText>
          </g>
          <Solid paths={lever2.pivot} tone="mid" />
          <path className="iso-line sc-rod" data-tone="hi" d={lever2.rod} />
          <g transform={lever2.knobAt}>
            <Solid paths={lever2.knob} tone="hi" crease="lo" />
          </g>
          {/* Output tank, half full. */}
          <Solid paths={out2.plinth} tone="mid" />
          <g className="sc-out2" data-box-water="out2" transform={out2.shift} />
          <g className="an-glass">
            <Solid paths={out2.glass} tone="mid" crease="lo" />
          </g>
          {/* Output lamp, dim. */}
          <g data-lamp="" style={{ "--lamp": LAMP.toFixed(3) } as CSSProperties}>
            <circle className="sc-glow bulb-glow" cx={lamp2.glowAt[0].toFixed(1)} cy={lamp2.glowAt[1].toFixed(1)} r={lamp2.glowR.toFixed(1)} fill="url(#sc-glow)" />
            <Bulb parts={lamp2} />
          </g>
        </g>
        <Sparks points={contacts2.length} />
      </g>
    </ScLive>
  );
}

// Readout below the circuit board: a two-row graph (Vin with the both-on band; I from VDD with the two pulses) and an
// energy-lost counter (1 for the sharp edge, 10 for the slow one).
const G = { w: 640, h: 380, l: 64, r: 16, t: 40, rowH: 120, gap: 70 };
const tx = (t: number) => G.l + (t / T_END) * (G.w - G.l - G.r);
const vy = (v: number) => G.t + G.rowH * (1 - v);
const iTop = G.t + G.rowH + G.gap;
const iy = (i: number) => iTop + G.rowH * (1 - i / I_PEAK);
const f1 = (v: number) => v.toFixed(1);
const curve = (pick: (s: (typeof samples)[number]) => number, y: (v: number) => number) =>
  "M" + samples.filter((_, k) => k % 4 === 0 || k === samples.length - 1).map((s) => `${f1(tx(s.t))},${f1(y(pick(s)))}`).join("L");
// Pulse area for one edge (closed down to the zero line).
const pulseArea = (t0: number, t1: number) => {
  const pts = samples.filter((s) => s.t >= t0 && s.t <= t1);
  return `M${f1(tx(t0))},${f1(iy(0))}` + pts.map((s) => `L${f1(tx(s.t))},${f1(iy(s.i))}`).join("") + `L${f1(tx(t1))},${f1(iy(0))}Z`;
};
const edgeLabel = (e: readonly [number, number], s: number) => ({ x: tx((e[0] + e[1]) / 2), text: `${s} s` });

export function ScReadout() {
  const a = edgeLabel(EDGES.sharp, SHARP);
  const b = edgeLabel(EDGES.slow, SLOW);
  return (
    <div className="sc-readout">
      <svg className="sc-graph" viewBox={`0 0 ${G.w} ${G.h}`} aria-hidden="true">
        {/* Vin row. */}
        <text className="sc-row-name" x={G.l} y={G.t - 14}>
          Vin
        </text>
        <rect className="sc-band" x={tx(0)} y={vy(VTP)} width={tx(T_END) - tx(0)} height={vy(VTN) - vy(VTP)} />
        <text className="sc-band-name" x={tx(T_END) - 6} y={vy(0.5) + 6} textAnchor="end">
          both on
        </text>
        <path className="sc-axis" d={`M${tx(0)},${vy(1) - 6}V${vy(0)}H${tx(T_END)}`} />
        {[0, 1].map((v) => (
          <text key={v} className="sc-tick-text" x={tx(0) - 10} y={vy(v) + 6} textAnchor="end">
            {v}
          </text>
        ))}
        <path className="sc-vin-curve" d={curve((s) => s.v, vy)} />
        <text className="sc-edge" x={tx(EDGES.sharp[1]) + 8} y={vy(1) + 26} textAnchor="start">
          {a.text}
        </text>
        <text className="sc-edge" x={b.x + 30} y={vy(1) + 26} textAnchor="middle">
          {b.text}
        </text>
        {/* I from VDD row. */}
        <text className="sc-row-name" x={G.l} y={iTop - 14}>
          I from VDD (mA)
        </text>
        <path className="sc-pulse" data-active="0" d={pulseArea(EDGES.sharp[0], EDGES.sharp[1])} />
        <path className="sc-pulse" data-active="1" d={pulseArea(EDGES.slow[0], EDGES.slow[1])} />
        <path className="sc-axis" d={`M${tx(0)},${iy(I_PEAK) - 6}V${iy(0)}H${tx(T_END)}`} />
        {[0, I_PEAK].map((v) => (
          <text key={v} className="sc-tick-text" x={tx(0) - 10} y={iy(v) + 6} textAnchor="end">
            {+v.toFixed(1)}
          </text>
        ))}
        <path className="sc-icurve" d={curve((s) => s.i, iy)} />
      </svg>
      <div className="sc-energy">
        <div className="sc-energy-name">energy lost</div>
        <div className="sc-energy-row" data-active="0">
          <span className="sc-energy-edge">{SHARP} s</span>
          <span className="sc-energy-num">{E_UNITS.sharp}</span>
        </div>
        <div className="sc-energy-row" data-active="1">
          <span className="sc-energy-edge">{SLOW} s</span>
          <span className="sc-energy-num">{E_UNITS.slow}</span>
        </div>
      </div>
    </div>
  );
}
