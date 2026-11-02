import type { ReactNode } from "react";
import { FaceText, Line, Solid, Dots } from "../../iso/react/draw";
import { Bulb } from "../../iso/react/bulb";
import { Sparks } from "../../iso/react/reel";
import { SPARKS_PER_POINT } from "../../iso/entrance";
import { board, contacts, junctionAt, knob, knobAt, knobTransform, landPoints, LEVERS, parts, rodPath, wirePath, WIRES, type LeverId } from "./geometry";
import { CODE, PARTS } from "./model";
import { RtlLive } from "./live";

const Name = ({ at, children, size = 11, className = "rt-name" }: { at: string; children: ReactNode; size?: number; className?: string }) => (
  <g className={className}>
    <FaceText transform={at} size={size} tone="hi">
      {children}
    </FaceText>
  </g>
);

const Lever = ({ id }: { id: LeverId }) => {
  const l = board.levers[id];
  return (
    <g data-lever={id}>
      <Solid paths={l.base} tone="mid" />
      <Line d={l.slot} tone="lo" />
      <Solid paths={l.pivot} tone="mid" />
      <path className="iso-line rt-rod" data-tone="hi" data-rod="" d={rodPath(LEVERS[id], 1)} />
      <g data-knob="" transform={knobTransform(knobAt(LEVERS[id], 1))}>
        <Solid paths={knob} tone="hi" crease="lo" />
      </g>
    </g>
  );
};

const Wire = ({ w }: { w: (typeof WIRES)[number] }) => {
  const d = wirePath(w);
  const j = junctionAt(w);
  return (
    <g data-wire={w.id} data-net={w.net} data-for={w.part} data-show="0" data-on="0">
      <path className="iso-line gate-trace" data-tone="lo" d={d} />
      <path className="iso-line gate-flow" data-flow="" d={d} />
      {j ? <Dots points={[j]} size={1.1} tone="mid" /> : null}
    </g>
  );
};

const FlipFlop = ({ id }: { id: "r1" | "q" }) => {
  const f = parts[id];
  return (
    <g data-part={id} style={{ display: "none" }}>
      <Solid paths={f.solid} tone="mid" />
      <Line d={f.symbol} tone="hi" className="rt-symbol" />
      <Name at={f.labels.tag} size={10} className="rt-tag">
        {id}
      </Name>
      <Name at={f.labels.d} size={11}>
        D
      </Name>
      <Name at={f.labels.q} size={11}>
        Q
      </Name>
      <Name at={f.labels.clk} size={6}>
        clk
      </Name>
    </g>
  );
};

// Static art: board, wires and labels (rise); levers and lamp (fall). Flip-flops and the AND drop in mid-loop.
export function RtlArt() {
  const l = board.lamp;
  return (
    <RtlLive>
      <g data-entry="">
        <g data-base="">
          <path className="iso-halo" d={board.halo} />
          <Solid paths={board.slab} tone="mid" />
          <Line d={board.groove} tone="lo" />
          <Dots points={board.screws} size={0.5} />
          {WIRES.map((w) => (
            <Wire key={w.id} w={w} />
          ))}
          <Name at={board.labels.a}>A</Name>
          <Name at={board.labels.b}>B</Name>
          <Name at={board.labels.clk} size={9}>
            clk
          </Name>
          <Name at={board.labels.q}>q</Name>
        </g>
        <g data-parts="">
          <FlipFlop id="r1" />
          <g data-part="and" style={{ display: "none" }}>
            <Solid paths={parts.and.solid} tone="mid" />
            <Line d={parts.and.symbol} tone="hi" className="rt-symbol" />
          </g>
          <FlipFlop id="q" />
          <g data-lamp="q">
            <Bulb parts={l} />
            <circle className="rt-glow bulb-glow" cx={l.glowAt[0].toFixed(1)} cy={l.glowAt[1].toFixed(1)} r={l.glowR.toFixed(1)} fill="url(#rt-glow)" />
          </g>
          <Lever id="a" />
          <Lever id="b" />
          <Lever id="clk" />
        </g>
        <Sparks points={contacts.length} />
        {PARTS.map((k) => (
          <g key={k} data-land={k}>
            {Array.from({ length: landPoints[k].length * SPARKS_PER_POINT }, (_, i) => (
              <line key={i} className="reel-spark" data-lspark={i} x1="0" y1="0" x2="0" y2="0" opacity="0" />
            ))}
          </g>
        ))}
      </g>
    </RtlLive>
  );
}

// Readout below the board: header and the always block, typed by the loop; tokens turn rust as their part is built.
export function RtlReadout() {
  return (
    <div className="rt-readout">
      <div className="rt-head">verilog</div>
      {CODE.map((line, i) => (
        <div key={i} className="rt-line" data-line={i}>
          {line.map((_, j) => (
            <span key={j} data-seg={j} data-rust="0" />
          ))}
          <span className="rt-cursor" data-cursor="" />
        </div>
      ))}
    </div>
  );
}
