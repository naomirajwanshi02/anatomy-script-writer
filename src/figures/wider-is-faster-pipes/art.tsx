import { Dots, FaceText, Line, Solid } from "../../iso/react/draw";
import { Bulb } from "../../iso/react/bulb";
import { Sparks } from "../../iso/react/reel";
import { board, contacts, knob, knobAt, knobTransform, LANES, rodPath, type Box } from "./geometry";
import { GRAPH, graphFrame, graphY, ticks } from "./model";
import { WiderPipesLive } from "./live";

type StrapPaths = { id: string; d: string; dReverse?: string };

const Strap = ({ s, group }: { s: StrapPaths; group: "charge" | "discharge" }) => (
  <g data-strap={s.id} data-group={group} data-on="0">
    <path className="iso-line wfp-strap" data-tone="lo" d={s.d} />
    <path className="iso-line wfp-flow" data-flow="" data-dir="fwd" d={s.d} />
    {s.dReverse ? <path className="iso-line wfp-flow" data-flow="" data-dir="rev" d={s.dReverse} /> : null}
  </g>
);

// Circuit valve: control pin, cap and bubble are fixed; body, gate bar and arm follow W (filled in by the loop).
const Valve = ({ id }: { id: "pmos" | "nmos" }) => {
  const v = board[id];
  return (
    <g className="wfp-valve wp-only-circuit" data-valve={id} data-open="0">
      <Solid paths={v.pin} tone="mid" crease="none" />
      <g data-valve-arm={id} />
      <Solid paths={v.cap} tone="hi" crease="lo" />
      {v.bubble ? <Line d={v.bubble} tone="hi" /> : null}
      <g className="wfp-body" data-valve-body={id} />
      <g className="wfp-gate" data-valve-gate={id} />
      <g className="wfp-name">
        <FaceText transform={v.name} size={5.4} tone="hi">
          {id === "pmos" ? "PMOS" : "NMOS"}
        </FaceText>
      </g>
    </g>
  );
};

const WaterBox = ({ id }: { id: Box }) => (
  <g data-box={id}>
    <g data-box-water={id} />
    <g className="an-glass" data-box-glass={id} />
  </g>
);

const Stream = ({ id }: { id: string }) => (
  <g className="wp-only-water wfp-stream" data-stream={id} data-on="0">
    {Array.from({ length: LANES }, (_, k) => (
      <path key={k} className="an-drops" data-flow="" data-lane={k} d="" />
    ))}
  </g>
);

const Tap = ({ id }: { id: "p" | "n" }) => (
  <g className="wfp-tap-wrap">
    <path className="iso-halo wp-only-water wfp-tap-halo" data-tap-halo={id} d="" />
    <g className="wfp-tap" data-tap={id} />
  </g>
);

// Readout: tank level against time, W=1 (ink) and W=2 (rust), with the 50 % marks t1 and t2.
export function WiderPipesReadout() {
  return (
    <svg className="wfp-graph" viewBox={`0 0 ${GRAPH.w} ${GRAPH.h}`} width={GRAPH.w} height={GRAPH.h} aria-hidden="true">
      <path className="wfp-axis" d={graphFrame.frame} />
      <path className="wfp-grid" d={graphFrame.full} />
      <path className="wfp-half" d={graphFrame.half} />
      <text className="wp-only-water" x={GRAPH.left - 4} y={graphY(1) + 3} textAnchor="end">
        FULL
      </text>
      <text className="wp-only-circuit" x={GRAPH.left - 4} y={graphY(1) + 3} textAnchor="end">
        VDD
      </text>
      <text x={GRAPH.left - 4} y={graphY(0) + 3} textAnchor="end">
        0
      </text>
      <text className="wfp-faint" x={GRAPH.left - 4} y={graphY(0.5) + 3} textAnchor="end">
        50%
      </text>
      {graphFrame.seconds.map(({ x, s }) => (
        <g key={s}>
          <path className="wfp-axis" d={`M${x.toFixed(1)},${GRAPH.bottom}v3`} />
          <text className="wfp-faint" x={x} y={GRAPH.bottom + 11} textAnchor="middle">
            {s}
          </text>
        </g>
      ))}
      <path className="wfp-curve" data-curve="0" d="" />
      <path className="wfp-curve wfp-curve-new" data-curve="1" d="" />
      {ticks.map((p, k) => (
        <g key={k} className="wfp-tick" data-tick={k} data-show="0">
          <path d={`M${p.x.toFixed(1)},${(p.y - 5).toFixed(1)}V${(p.y + 5).toFixed(1)}`} />
          <text x={p.x} y={p.y - 8} textAnchor="middle">
            {k === 0 ? "t1" : "t2"}
          </text>
        </g>
      ))}
    </svg>
  );
}

// Static art: board, rails, straps and labels (rise); lever, boxes, pipes, taps, valves, tank and lamp (fall).
export function WiderPipesArt() {
  return (
    <WiderPipesLive>
      <g data-entry="">
        <g data-base="">
          <path className="iso-halo" d={board.halo} />
          <Solid paths={board.slab} tone="mid" />
          <Line d={board.groove} tone="lo" />
          <Dots points={board.screws} size={0.5} />
          <g className="wp-only-circuit">
            {board.charge.map((s) => (
              <Strap key={s.id} s={s} group="charge" />
            ))}
            {board.discharge.map((s) => (
              <Strap key={s.id} s={s} group="discharge" />
            ))}
            {board.vin.map((s) => (
              <path key={s.id} className="iso-line wfp-vin" data-tone="mid" d={s.d} />
            ))}
            <Dots points={[board.vinJunction]} size={1.1} tone="mid" />
            <g className="bit" data-bit="1">
              <FaceText transform={board.bit1} size={6} tone="hi">
                1
              </FaceText>
            </g>
            <g className="bit" data-bit="0">
              <FaceText transform={board.bit0} size={6} tone="hi">
                0
              </FaceText>
            </g>
            <path className="iso-line wfp-strap" data-tone="lo" d={board.sense} />
            <g className="rail" data-rail="vdd">
              <Solid paths={board.vdd} tone="hi" crease="lo" />
            </g>
            <g className="rail" data-rail="gnd">
              <Solid paths={board.gnd} tone="hi" crease="lo" />
            </g>
            <Solid paths={board.bus} tone="hi" crease="lo" />
          </g>
          <g className="rail-name" data-rail="vdd">
            <FaceText transform={board.vddLabel} size={5.4} tone="hi">
              VDD
            </FaceText>
          </g>
          <g className="rail-name" data-rail="gnd">
            <FaceText transform={board.gndLabel} size={5.4} tone="hi">
              GND
            </FaceText>
          </g>
          <g className="wfp-w" data-w="1">
            <FaceText transform={board.wLabel} size={5.4} tone="hi">
              W=1
            </FaceText>
          </g>
          <g className="wfp-w" data-w="2">
            <FaceText transform={board.wLabel} size={5.4} tone="hi">
              W=2
            </FaceText>
          </g>
        </g>
        <g data-parts="">
          <g className="wp-only-circuit">
            <Solid paths={board.lever.base} tone="mid" />
            <Line d={board.lever.slot} tone="lo" />
            <Solid paths={board.lever.pivot} tone="mid" />
            <path className="iso-line wfp-rod" data-tone="hi" data-lever-rod="" d={rodPath(-1)} />
            <g data-lever-knob="" transform={knobTransform(knobAt(-1))}>
              <Solid paths={knob} tone="hi" crease="lo" />
            </g>
          </g>
          <WaterBox id="supply" />
          <g className="wfp-pipe" data-pipes="top" />
          <Stream id="supply" />
          <Valve id="pmos" />
          <Tap id="p" />
          <g className="wfp-pipe" data-pipes="mid" />
          <Stream id="fill" />
          <Stream id="drainMid" />
          <Solid paths={board.tank.base} tone="mid" />
          <g data-fluid="" className="wfp-fluid" />
          <g className="wfp-shell">
            <Solid paths={board.tank.shell} tone="hi" crease="none" inner={<Line d={board.tank.ticks} tone="lo" />} />
          </g>
          <Solid paths={board.tank.lid} tone="mid" />
          <Valve id="nmos" />
          <Tap id="n" />
          <g className="wfp-pipe" data-pipes="bottom" />
          <Stream id="drain" />
          <WaterBox id="drain" />
          <g className="wp-only-circuit">
            <g className="wfp-lamp" data-lamp="">
              <Bulb parts={board.lamp} />
            </g>
            <circle className="wfp-glow bulb-glow" cx={board.lamp.glowAt[0].toFixed(1)} cy={board.lamp.glowAt[1].toFixed(1)} r={board.lamp.glowR.toFixed(1)} fill="url(#wfp-glow)" />
          </g>
        </g>
        <Sparks points={contacts.length} />
      </g>
    </WiderPipesLive>
  );
}
