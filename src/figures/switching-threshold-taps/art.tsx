import { Dots, FaceText, Line, Solid } from "../../iso/react/draw";
import { Sparks } from "../../iso/react/reel";
import { board, BRAND_SIZE, circuit, contacts, drain, drainStream, ENGRAVE, ENGRAVE_SIZE, lever, out, supply, taps } from "./geometry";
import { BRAND } from "./model";
import { G, gx, gy } from "./graph";
import { StLive } from "./live";

const Tap = ({ id }: { id: keyof typeof taps }) => {
  const t = taps[id];
  return (
    <g className="st-tap" data-tap={id}>
      <Solid paths={t.body} tone="hi" crease="lo" />
      <Solid paths={t.stem} tone="hi" crease="none" />
      <Solid paths={t.wheel} tone="hi" crease="lo" />
      <path className="an-spoke st-handle" data-tap-bar={id} d="" />
      <path className="st-ring" data-tap-ring={id} d="" />
    </g>
  );
};

const Valve = ({ id }: { id: "p" | "n" }) => (
  <g className="st-valve" data-valve={id} data-open="0" data-flash="0">
    <g data-valve-arm={id} />
    <g className="st-vbody" data-valve-body={id} />
    <g className="st-vgate" data-valve-gate={id} />
    <path className="st-vglow" data-valve-glow={id} d="" />
    <g data-carriers={id} />
  </g>
);

// Readout below the board: Vin and Vout values and the Vout-against-Vin graph card.
export function StReadout() {
  return (
    <div className="st-readout">
      <div className="st-values">
        <div className="st-val" data-read="vin">
          <span className="st-name">Vin</span>
          <span className="st-num" data-num="vin">
            0.00
          </span>
        </div>
        <div className="st-val" data-read="vout">
          <span className="st-name">Vout</span>
          <span className="st-num" data-num="vout">
            0.00
          </span>
        </div>
      </div>
      <svg className="st-graph" data-read="graph" viewBox={`0 0 ${G.w} ${G.h}`} aria-hidden="true">
        <rect className="st-card" x="1.5" y="1.5" width={G.w - 3} height={G.h - 3} rx="10" />
        <path className="st-half" d={`M${gx(0.5)},${gy(0)}V${gy(1)}M${gx(0)},${gy(0.5)}H${gx(1)}`} />
        <path className="st-axis" d={`M${gx(0)},${gy(1)}V${gy(0)}H${gx(1)}`} />
        {[0, 0.5, 1].map((v) => (
          <g key={v}>
            <text x={gx(v)} y={gy(0) + 22} textAnchor="middle">
              {v === 0.5 ? "0.5" : v}
            </text>
            {v > 0 ? (
              <text x={gx(0) - 9} y={gy(v) + 6} textAnchor="end">
                {v === 0.5 ? "0.5" : v}
              </text>
            ) : null}
          </g>
        ))}
        <text className="st-axis-name" x={gx(1)} y={gy(0) + 44} textAnchor="end">
          Vin
        </text>
        <text className="st-axis-name" x={gx(0) + 8} y={gy(1) + 6}>
          Vout
        </text>
        <g className="st-brackets" data-brackets="">
          <path d={`M${gx(0) + 2},${gy(0) - 10}v8H${gx(0.5) - 3}v-8`} />
          <path d={`M${gx(0.5) + 3},${gy(0) - 10}v8H${gx(1) - 2}v-8`} />
        </g>
        <path className="st-curve" data-curve="0" d="" />
        <path className="st-curve" data-curve="1" d="" />
        <g className="st-vm" data-vm="">
          <path d={`M${gx(0.5)},${gy(0) + 4}V${gy(0) - 16}`} />
          <text x={gx(0.5) + 6} y={gy(0) - 20}>
            VM
          </text>
        </g>
        <circle className="st-point" data-point="" r="6" cx={gx(0)} cy={gy(1)} />
      </svg>
    </div>
  );
}

// Static art: board, engraving and the circuit's board-level parts (rise); stand, pipes, taps, handle, valves, tank (fall).
export function StArt() {
  return (
    <StLive>
      <g data-entry="">
        <g data-base="">
          <path className="iso-halo" d={board.halo} />
          <Solid paths={board.slab} tone="mid" />
          <Line d={board.groove} tone="lo" />
          <Dots points={board.screws} size={0.5} />
          <g className="st-engrave">
            <FaceText transform={board.engraveAt} size={ENGRAVE_SIZE} tone="mid" anchor="middle">
              {ENGRAVE}
            </FaceText>
          </g>
          <g className="st-c">
            {circuit.charge.map((d, i) => (
              <g key={`c${i}`} className="st-strap-g" data-strap="charge">
                <path className="st-strap" d={d} />
                <path className="st-flow" d={d} />
              </g>
            ))}
            {circuit.discharge.map((d, i) => (
              <g key={`d${i}`} className="st-strap-g" data-strap="discharge">
                <path className="st-strap" d={d} />
                <path className="st-flow" d={d} />
              </g>
            ))}
            <g className="st-strap-g" data-strap="bus" data-dir="fwd">
              <path className="st-strap" d={circuit.bus} />
              <path className="st-flow" data-flow-dir="fwd" d={circuit.bus} />
              <path className="st-flow" data-flow-dir="rev" d={circuit.busRev} />
            </g>
            <Dots points={[circuit.node]} size={1.1} tone="mid" />
            <path className="iso-line st-gate-wire" data-tone="mid" d={circuit.gate} />
            <Dots points={[circuit.gateJunction]} size={1.1} tone="mid" />
            <g className="rail" data-rail="vdd">
              <Solid paths={circuit.vdd} tone="hi" crease="lo" />
            </g>
            <g className="rail" data-rail="gnd">
              <Solid paths={circuit.gnd} tone="hi" crease="lo" />
            </g>
            <g className="rail-name" data-rail="vdd">
              <FaceText transform={circuit.vddLabel} size={6} tone="hi">
                VDD
              </FaceText>
            </g>
            <g className="rail-name" data-rail="gnd">
              <FaceText transform={circuit.gndLabel} size={6} tone="hi">
                GND
              </FaceText>
            </g>
            <g className="st-label">
              <FaceText transform={circuit.pLabel} size={7} tone="hi">
                PMOS
              </FaceText>
              <FaceText transform={circuit.nLabel} size={7} tone="hi">
                NMOS
              </FaceText>
            </g>
            <g className="st-label st-wlabel" data-wlabel="">
              <FaceText transform={circuit.wLabel} size={5.4} tone="hi">
                W x2.5
              </FaceText>
            </g>
          </g>
        </g>
        <g data-parts="">
          {/* High tank on its stand (water only). */}
          <g className="st-w">
            {supply.backLegs.map((p, i) => (
              <Solid key={i} paths={p} tone="mid" crease="none" />
            ))}
            <path className="st-brace" d={supply.braceBack} />
            {supply.feet.map((p, i) => (
              <Solid key={i} paths={p} tone="mid" crease="none" />
            ))}
            {supply.frontLegs.map((p, i) => (
              <Solid key={i} paths={p} tone="mid" crease="none" />
            ))}
            <path className="st-brace" d={supply.brace} />
            <Solid paths={supply.platform} tone="hi" crease="lo" />
            <g data-box-water="supply" />
            <g className="an-glass">
              <Solid paths={supply.glass} tone="mid" crease="lo" />
            </g>
            <path className="st-plate" d={supply.plate} />
            <Dots points={supply.plateRivets} size={0.5} tone="hi" />
            <g className="st-brand">
              <FaceText transform={supply.brandAt} size={BRAND_SIZE} tone="hi" anchor="middle">
                {BRAND}
              </FaceText>
            </g>
            <path className="st-glow" data-tank-glow="" d={supply.outline} />
            <g className="st-ghost-text" data-vdd-ghost="">
              <FaceText transform={supply.vddAt} size={5} tone="hi" anchor="middle">
                VDD
              </FaceText>
            </g>
            <path className="st-ghost" data-half-ghost="" d={supply.halfGhost} />
            {/* Fill pipe (rebuilt as it widens) and the fill tap. */}
            <g className="st-pipe" data-fill-pipe="" />
            <path className="st-glow" data-pipe-glow="" d="" />
            <Tap id="fill" />
          </g>
          {/* PMOS valve and the gate pins (circuit only). */}
          <g className="st-c">
            {circuit.pins.map((p, i) => (
              <g key={i}>
                <Solid paths={p.pin} tone="mid" crease="none" />
                <Solid paths={p.cap} tone="hi" crease="lo" />
              </g>
            ))}
            <Line d={circuit.bubble} tone="hi" />
            <Valve id="p" />
            <path className="st-ghost st-ghost-pipe" data-ghost-pipe="" d={circuit.ghostPipe} />
          </g>
          {/* Handle (shared: becomes the input lever) and its linkage (water only). */}
          <Solid paths={lever.base} tone="mid" />
          <Line d={lever.slot} tone="lo" />
          <path className="st-tick" d={lever.ticks} />
          <path className="st-tick st-tick-mid" d={lever.midTick} />
          <g className="st-marks">
            <FaceText transform={lever.mark0} size={5} tone="lit">
              0
            </FaceText>
            <FaceText transform={lever.mark1} size={5} tone="lit">
              1
            </FaceText>
          </g>
          <Solid paths={lever.pivot} tone="mid" />
          <path className="iso-line st-rod" data-tone="hi" data-lever-rod="" d="" />
          <g data-lever-knob="">
            <Solid paths={lever.knob} tone="hi" crease="lo" />
          </g>
          <path className="st-ring" data-knob-ring="" d="" />
          <g className="st-w">
            <path className="iso-line st-link-rod" data-tone="hi" data-link="" d="" />
            <g data-link-joints="" />
          </g>
          <g className="st-w">
            <Solid paths={drain.back} tone="mid" crease="lo" />
          </g>
          {/* Glass output tank (shared). */}
          <Solid paths={out.plinth} tone="mid" />
          <g data-box-water="out" />
          <g className="st-w">
            <g className="st-stream" data-stream="fill">
              <path className="st-column" d="" />
              <path className="an-drops st-drops" d="" />
            </g>
          </g>
          <g className="an-glass">
            <Solid paths={out.glass} tone="mid" crease="lo" />
          </g>
          <path className="st-half-ring" d={out.half} />
          <path className="st-half-ring" d={out.halfTicks} />
          <g className="st-label">
            <FaceText transform={out.halfText} size={4.2} tone="hi" anchor="start">
              HALF
            </FaceText>
          </g>
          <path className="st-ring" data-level-ring="" d="" />
          <path className="st-glow" data-out-glow="" d={out.glass.outline} />
          {/* Drain pipe, tap and basin (water only). */}
          <g className="st-w">
            {drain.run.map((p, i) => (
              <Solid key={i} paths={p} tone="mid" crease="lo" />
            ))}
            <Tap id="drain" />
            <g data-box-water="basin" />
            <g className="st-stream" data-stream="drain">
              <path className="st-column" d={drainStream} />
              <path className="an-drops st-drops" d={drainStream} />
            </g>
            <g className="an-glass">
              <Solid paths={drain.basin} tone="mid" crease="lo" />
            </g>
            <g className="st-arrows" data-arrows="">
              <path data-arrow="in" d="" />
              <path data-arrow="out" d="" />
            </g>
          </g>
          {/* NMOS valve (circuit only). */}
          <g className="st-c">
            <Valve id="n" />
          </g>
        </g>
        <Sparks points={contacts.length} />
      </g>
    </StLive>
  );
}
