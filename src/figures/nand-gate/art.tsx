import { Dots, FaceText, Line, Solid } from "../../iso/react/draw";
import { Bulb } from "../../iso/react/bulb";
import { Sparks } from "../../iso/react/reel";
import { board, bulb, contacts, gate, knob, knobAt, knobTransform, leverAt, levers, padDots, padRings, pins, rodPath, wires } from "./geometry";
import { GateLive } from "./live";

type Pin = "a" | "b" | "y";

const PinPart = ({ id }: { id: Pin }) => (
  <g>
    <Solid paths={pins[id].drop} tone="hi" crease="lo" />
    <Solid paths={pins[id].arm} tone="hi" crease="lo" />
  </g>
);

const Lever = ({ id }: { id: "a" | "b" }) => {
  const l = levers[id];
  return (
    <g data-lever={id}>
      <Solid paths={l.base} tone="mid" />
      <Line d={l.slot} tone="lo" />
      <Solid paths={l.pivot} tone="mid" />
      <path className="iso-line gate-rod" data-tone="hi" data-rod="" d={rodPath(leverAt[id], 1)} />
      <g data-knob="" transform={knobTransform(knobAt(leverAt[id], 1))}>
        <Solid paths={knob} tone="hi" crease="lo" />
      </g>
    </g>
  );
};

// Static art: board (rises), parts (fall), sparks.
export function NandArt() {
  return (
    <GateLive>
      <g data-entry="">
        <g data-base="">
          <path className="iso-halo" d={board.halo} />
          {board.feet.map((f, i) => (
            <Solid key={i} paths={f} tone="lo" />
          ))}
          <Solid paths={board.slab} tone="mid" />
          <Line d={board.groove} tone="lo" />
          <Line d={board.screwRings} tone="lo" />
          <Dots points={board.screws} size={0.5} />
          {(["a", "b", "y"] as const).map((k) => (
            <g key={k} className="gate-name">
              <FaceText transform={board.labels[k]} size={9} tone="hi">
                {k.toUpperCase()}
              </FaceText>
            </g>
          ))}
          {(["a", "b", "y"] as const).map((k) => (
            <g key={k} data-wire={k}>
              <path className="iso-line gate-trace" data-tone="lo" d={wires[k]} />
              <path className="iso-line gate-flow" data-tone="lit" data-flow="" d={wires[k]} />
            </g>
          ))}
          <Line d={padRings} tone="mid" />
          <Dots points={padDots} size={0.6} tone="hi" />
        </g>
        <g data-parts="">
          <Lever id="a" />
          <Lever id="b" />
          <PinPart id="a" />
          <PinPart id="b" />
          <g>
            <path className="iso-halo" d={gate.halo} style={{ filter: "blur(3px)" }} />
            <Solid paths={gate.body} tone="mid" inner={<Line d={gate.seam} tone="faint" />} />
            <path className="iso-line" data-tone="hi" d={gate.symbol.body} />
            <Line d={gate.symbol.bubble} tone="hi" />
            <g data-lead="">
              <Line d={gate.symbol.leads} tone="mid" />
            </g>
            <Line d={gate.notchRing} tone="lo" />
            <Dots points={[gate.notch]} size={0.5} />
          </g>
          <PinPart id="y" />
          <g data-led="y">
            <Bulb parts={bulb} />
          </g>
          <circle className="gate-glow bulb-glow" cx={bulb.glowAt[0].toFixed(1)} cy={bulb.glowAt[1].toFixed(1)} r={bulb.glowR.toFixed(1)} fill="url(#gate-glow)" />
        </g>
        <Sparks points={contacts.length} />
      </g>
    </GateLive>
  );
}
