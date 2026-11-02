import type { ReactNode } from "react";
import { Dots, FaceText, Line, Solid } from "../../iso/react/draw";
import { Bulb } from "../../iso/react/bulb";
import { Sparks } from "../../iso/react/reel";
import { SPARKS_PER_POINT } from "../../iso/entrance";
import { board, contacts, cpu, gates, landPoints, junctionAt, knob, knobAt, knobTransform, LEVER_A, rodPath, wirePath, WIRES } from "./geometry";
import { RecipeMapLive } from "./live";

const Name = ({ at, children, size = 11, className = "rm-name" }: { at: string; children: ReactNode; size?: number; className?: string }) => (
  <g className={className}>
    <FaceText transform={at} size={size} tone="hi">
      {children}
    </FaceText>
  </g>
);

const Lever = () => {
  const l = board.lever;
  return (
    <g data-lever="a">
      <Solid paths={l.base} tone="mid" />
      <Line d={l.slot} tone="lo" />
      <Solid paths={l.pivot} tone="mid" />
      <path className="iso-line rm-rod" data-tone="hi" data-rod="" d={rodPath(LEVER_A, 1)} />
      <g data-knob="" transform={knobTransform(knobAt(LEVER_A, 1))}>
        <Solid paths={knob} tone="hi" crease="lo" />
      </g>
    </g>
  );
};

const Wire = ({ w }: { w: (typeof WIRES)[number] }) => {
  const d = wirePath(w);
  const j = junctionAt(w);
  return (
    <g data-wire={w.id} data-net={w.net} data-group={w.group} data-show="1" data-on="0">
      <path className="iso-line gate-trace" data-tone="lo" d={d} />
      <path className="iso-line gate-flow" data-flow="" d={d} />
      {j ? <Dots points={[j]} size={1.1} tone="mid" /> : null}
    </g>
  );
};

const Lamp = ({ i }: { i: number }) => {
  const l = board.lamps[i];
  return (
    <g data-lamp={i ? "z" : "y"}>
      <Bulb parts={l} />
      <circle className="rm-glow bulb-glow" cx={l.glowAt[0].toFixed(1)} cy={l.glowAt[1].toFixed(1)} r={l.glowR.toFixed(1)} fill="url(#rm-glow)" />
    </g>
  );
};

// Static art: board, wires and labels (rise); CPU, gates, lamps and lever (fall). The loop writes levers, wires, lamps
// and the CPU and gate drops and lifts.
export function RecipeMapArt() {
  return (
    <RecipeMapLive>
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
          <Name at={board.labels.b} size={8}>
            B=1
          </Name>
          <Name at={board.labels.lamps[0]}>Y</Name>
          <Name at={board.labels.lamps[1]}>Z</Name>
        </g>
        <g data-parts="">
          <g data-part="cpu">
            <Solid paths={cpu.solid} tone="mid" />
            <Name at={cpu.label} size={8}>
              CPU
            </Name>
          </g>
          {(["and", "not"] as const).map((k) => (
            <g key={k} data-part={k} style={{ display: "none" }}>
              <Solid paths={gates[k].solid} tone="mid" />
              <Line d={gates[k].symbol} tone="hi" className="rm-symbol" />
            </g>
          ))}
          {board.lamps.map((_, i) => (
            <Lamp key={i} i={i} />
          ))}
          <Lever />
        </g>
        <Sparks points={contacts.length} />
        {(["cpu", "and", "not"] as const).map((k) => (
          <g key={k} data-land={k}>
            {Array.from({ length: landPoints[k].length * SPARKS_PER_POINT }, (_, i) => (
              <line key={i} className="reel-spark" data-lspark={i} x1="0" y1="0" x2="0" y2="0" opacity="0" />
            ))}
          </g>
        ))}
      </g>
    </RecipeMapLive>
  );
}

// Readout below the board: header, two code lines with a run pointer and a typing cursor (all written by the loop).
export function RecipeMapReadout() {
  return (
    <div className="rm-readout">
      <div className="rm-head" data-head="">
        c
      </div>
      {[0, 1].map((i) => (
        <div key={i} className="rm-line" data-line={i} data-rust="0">
          <span className="rm-ptr" data-ptr="" />
          <span data-text="" />
          <span className="rm-cursor" data-cursor="" />
        </div>
      ))}
    </div>
  );
}
