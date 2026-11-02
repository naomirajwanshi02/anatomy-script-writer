import { Dots, FaceText, Line, Solid } from "../../iso/react/draw";
import { Bulb } from "../../iso/react/bulb";
import { Sparks } from "../../iso/react/reel";
import { board, contacts, knob, knobAt, knobTransform, rodPath, streams, tapLink, type Box } from "./geometry";
import { SCOPE, scopeFrame, scopeTrace, TABLE } from "./model";
import { InverterTapsLive } from "./live";

type StrapPaths = { id: string; d: string; dReverse?: string };

const Strap = ({ s, group }: { s: StrapPaths; group: "charge" | "discharge" }) => (
  <g data-strap={s.id} data-group={group} data-on="0">
    <path className="iso-line inv-strap" data-tone="lo" d={s.d} />
    <path className="iso-line inv-flow" data-flow="" data-dir="fwd" d={s.d} />
    {s.dReverse ? <path className="iso-line inv-flow" data-flow="" data-dir="rev" d={s.dReverse} /> : null}
  </g>
);

const Valve = ({ id }: { id: "pmos" | "nmos" }) => {
  const v = board[id];
  return (
    <g className="inv-valve ci-only-circuit" data-valve={id} data-open="0">
      <Solid paths={v.pin} tone="mid" crease="none" />
      <Solid paths={v.arm} tone="mid" crease="none" />
      <Solid paths={v.cap} tone="hi" crease="lo" />
      {v.bubble ? <Line d={v.bubble} tone="hi" /> : null}
      <g className="inv-body">
        <Solid paths={v.body} tone="mid" />
      </g>
      <g className="inv-gate">
        <Solid paths={v.gate} tone="hi" crease="none" />
      </g>
      <Dots points={v.contacts} size={0.5} />
      <g className="inv-name">
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

const Stream = ({ id }: { id: keyof typeof streams }) => (
  <g className="ci-only-water" data-stream={id} data-on="0">
    <path className="an-drops" data-flow="" d={streams[id]} />
  </g>
);

// Readout: truth table and the Vin/Vout scope.
export function InverterReadout() {
  return (
    <div className="inv-readout">
      <table className="inv-table" aria-label="Truth table">
        <thead>
          <tr>
            <th>Vin</th>
            <th>Vout</th>
          </tr>
        </thead>
        <tbody>
          {TABLE.map((r) => (
            <tr key={r.vin} data-vin={r.vin}>
              <td>{r.vin}</td>
              <td>{r.vout}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <svg className="inv-scope" viewBox={`0 0 ${SCOPE.w} ${SCOPE.h}`} width={SCOPE.w} height={SCOPE.h} aria-hidden="true">
        <path className="inv-scope-grid" d={scopeFrame.baselines} />
        {SCOPE.rows.map((r, i) => (
          <g key={i}>
            <text x={SCOPE.left - 5} y={r.top + 3} textAnchor="end">
              VDD
            </text>
            <text x={SCOPE.left - 5} y={r.bottom + 3} textAnchor="end">
              0
            </text>
            <text className="inv-scope-name" x={2} y={(r.top + r.bottom) / 2 + 3}>
              {i === 0 ? "Vin" : "Vout"}
            </text>
          </g>
        ))}
        <path className="inv-scope-trace" d={scopeTrace(0)} />
        <path className="inv-scope-trace" d={scopeTrace(1)} />
        <path className="inv-scope-active" data-scope-active="" d="" />
        <path className="inv-scope-axis" d={scopeFrame.axis} />
        {scopeFrame.seconds.map(({ x, s }) => (
          <g key={s}>
            <path className="inv-scope-axis" d={`M${x.toFixed(1)},${SCOPE.axis}v3`} />
            <text x={x} y={SCOPE.axis + 8} textAnchor="middle" className="inv-scope-sec">
              {s}
            </text>
          </g>
        ))}
        <path className="inv-scope-cursor" data-scope-cursor="" d={`M${SCOPE.left},4V${SCOPE.axis}`} />
      </svg>
    </div>
  );
}

// Static art: board, rails, straps and labels (rise); lever, boxes, pipes, taps, valves, tank and lamp (fall).
export function InverterTapsArt() {
  return (
    <InverterTapsLive>
      <g data-entry="">
        <g data-base="">
          <path className="iso-halo" d={board.halo} />
          <Solid paths={board.slab} tone="mid" />
          <Line d={board.groove} tone="lo" />
          <Dots points={board.screws} size={0.5} />
          <g className="ci-only-circuit">
            {board.charge.map((s) => (
              <Strap key={s.id} s={s} group="charge" />
            ))}
            {board.discharge.map((s) => (
              <Strap key={s.id} s={s} group="discharge" />
            ))}
          </g>
          {board.vin.map((s) => (
            <g key={s.id} data-vin="" data-on="1">
              <path className="iso-line inv-vin" data-tone="mid" d={s.d} />
            </g>
          ))}
          <g className="ci-only-water" data-vin="" data-on="1">
            <path className="iso-line inv-vin" data-tone="mid" d={tapLink} />
          </g>
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
          <g className="ci-only-circuit">
            <path className="iso-line inv-strap" data-tone="lo" d={board.sense} />
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
        </g>
        <g data-parts="">
          <g>
            <Solid paths={board.lever.base} tone="mid" />
            <Line d={board.lever.slot} tone="lo" />
            <Solid paths={board.lever.pivot} tone="mid" />
            <path className="iso-line inv-rod" data-tone="hi" data-lever-rod="" d={rodPath(-1)} />
            <g data-lever-knob="" transform={knobTransform(knobAt(-1))}>
              <Solid paths={knob} tone="hi" crease="lo" />
            </g>
          </g>
          <WaterBox id="supply" />
          <g className="ci-pipe" data-pipes="top" />
          <Stream id="supply" />
          <Valve id="pmos" />
          <g className="ci-tap" data-tap="p" />
          <g className="ci-pipe" data-pipes="mid" />
          <Stream id="fill" />
          <Stream id="drainMid" />
          <g className="ci-only-circuit">
            <Solid paths={board.tank.base} tone="mid" />
            <g data-fluid="" className="inv-fluid" />
          </g>
          <WaterBox id="out" />
          <g className="ci-only-circuit">
            <g className="inv-shell">
              <Solid paths={board.tank.shell} tone="hi" crease="none" inner={<Line d={board.tank.ticks} tone="lo" />} />
            </g>
            <Solid paths={board.tank.lid} tone="mid" />
          </g>
          <Valve id="nmos" />
          <g className="ci-tap" data-tap="n" />
          <g className="ci-pipe" data-pipes="bottom" />
          <Stream id="drain" />
          <WaterBox id="drain" />
          <g className="ci-only-circuit">
            <g className="inv-lamp" data-lamp="">
              <Bulb parts={board.lamp} />
            </g>
            <circle className="inv-glow bulb-glow" cx={board.lamp.glowAt[0].toFixed(1)} cy={board.lamp.glowAt[1].toFixed(1)} r={board.lamp.glowR.toFixed(1)} fill="url(#inv-glow)" />
          </g>
        </g>
        <Sparks points={contacts.length} />
      </g>
    </InverterTapsLive>
  );
}
