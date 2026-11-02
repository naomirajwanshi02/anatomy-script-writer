import type { CSSProperties } from "react";
import { Dots, FaceText, Line, Solid, Stage } from "../../iso/react/draw";
import { Bulb, BulbGlowDef } from "../../iso/react/bulb";
import { Sparks } from "../../iso/react/reel";
import { boards, STAGE_H, STAGE_W, type GateId } from "./geometry";
import { START_LAMP, TABLES } from "./model";
import { TapsLive } from "./live";

const LABELS: Record<GateId, string> = {
  and: "AND row: first water from a supply tank through taps A and B in series to a cup (water only if both are open), then the same as an AND gate on a small board: levers A and B, a lamp for Y. The lamp lights only when both levers are 1.",
  or: "OR row: first water from a supply tank through taps A and B on parallel branches to a cup (water if either is open), then the same as an OR gate on a small board: levers A and B, a lamp for Y. The lamp lights when either lever is 1.",
  not: "NOT row: first water from a supply tank through one tap with an inverted handle to a cup (open while the handle is down), then the same as a NOT gate on a small board: lever A, a lamp for Y. The lamp shows the opposite of A.",
};

const Name = ({ at, children, className = "bg-name" }: { at: string; children: string; className?: string }) => (
  <g className={className}>
    <FaceText transform={at} size={5.4} tone="hi">
      {children}
    </FaceText>
  </g>
);

const Equation = ({ id }: { id: GateId }) => (
  <div className="bg-eq">
    {id === "and" ? (
      "Y = A · B"
    ) : id === "or" ? (
      "Y = A + B"
    ) : (
      <>
        Y = <span className="bg-ol">A</span>
      </>
    )}
  </div>
);

const Table = ({ id }: { id: GateId }) => {
  const t = TABLES[id];
  return (
    <table className="bg-table" aria-label={`${id.toUpperCase()} truth table`}>
      <thead>
        <tr>
          {t.head.map((h) => (
            <th key={h}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {t.rows.map((row, i) => (
          <tr key={i}>
            {row.map((v, j) => (
              <td key={j}>{v}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// One board: base and labels rise; tank, pipes, taps/levers, gate block, cup and lamp fall. The loop fills the slots.
function Board({ id }: { id: GateId }) {
  const b = boards[id];
  return (
    <Stage width={STAGE_W} height={STAGE_H} label={LABELS[id]}>
      <defs>
        <BulbGlowDef id={`bg-glow-${id}`} />
      </defs>
      <g data-entry="">
        <g data-base="">
          <path className="iso-halo" d={b.halo} />
          <Solid paths={b.board} tone="mid" />
          <Line d={b.groove} tone="lo" />
          <Dots points={b.screws} size={0.5} />
          <g className="bg-only-circuit">
            {b.wires.map((w) => (
              <g key={w.id} data-wire={w.id} data-net={w.net} data-on={w.net === "y" ? String(START_LAMP[id]) : "0"}>
                <path className="iso-line gate-trace" data-tone="lo" d={w.d} />
                <path className="iso-line gate-flow" data-flow="" d={w.d} />
              </g>
            ))}
          </g>
          {Object.entries(b.labels).map(([k, at]) => (
            <Name key={k} at={at} className={k === "y" ? "bg-name" : "bg-name bg-only-circuit"}>
              {k.toUpperCase()}
            </Name>
          ))}
          {Object.entries(b.water.labels).map(([k, at]) => (
            <Name key={k} at={at} className="bg-name bg-only-water">
              {k.toUpperCase()}
            </Name>
          ))}
        </g>
        <g data-parts="">
          <g data-tank-water="" />
          <g className="an-glass" data-tank="" />
          {b.water.pipes.map((p, i) => (
            <g key={i}>
              <g data-pipe={i} />
              <g className="bg-only-water" data-drops={i} data-net={p.net} data-on="0">
                <path className="an-drops" d={p.drops} />
              </g>
            </g>
          ))}
          {Object.entries(b.levers).map(([k, at]) => {
            const l = b.leverParts[k];
            return (
              <g key={k} data-lever={k}>
                <g data-lever-base="">
                  <Solid paths={l.base} tone="mid" />
                  <Line d={l.slot} tone="lo" />
                  <Solid paths={l.pivot} tone="mid" />
                </g>
                <g data-tap={k} />
                <path className="iso-line bg-rod" data-tone="hi" data-rod="" d={b.rodPath(at, 1)} />
                <g data-knob="" transform={b.knobTransform(b.knobAt(at, 1))}>
                  <Solid paths={b.knob} tone="hi" crease="lo" />
                </g>
              </g>
            );
          })}
          <g className="bg-gate bg-only-circuit">
            <path className="iso-halo" d={b.gate.halo} style={{ filter: "blur(3px)" }} />
            <Solid paths={b.gate.body} tone="mid" inner={<Line d={b.gate.seam} tone="faint" />} />
            <path className="iso-line bg-symbol" data-tone="hi" d={b.gate.symbol} />
          </g>
          <g data-cup-water="" />
          <g className="an-glass" data-cup="" />
          <g data-lamp="" className="bg-only-circuit" style={{ "--lamp": START_LAMP[id] } as CSSProperties}>
            <Bulb parts={b.lamp} />
            <circle className="bg-glow bulb-glow" cx={b.lamp.glowAt[0].toFixed(1)} cy={b.lamp.glowAt[1].toFixed(1)} r={b.lamp.glowR.toFixed(1)} fill={`url(#bg-glow-${id})`} />
          </g>
        </g>
        <Sparks points={b.contacts.length} />
      </g>
    </Stage>
  );
}

// Static art: three rows, each a board with its equation and truth table beside it.
export function TapsArt() {
  return (
    <TapsLive>
      {(["and", "or", "not"] as const).map((id) => (
        <div key={id} className="bg-row" data-gate={id}>
          <Board id={id} />
          <div className="bg-readout">
            <Equation id={id} />
            <Table id={id} />
          </div>
        </div>
      ))}
    </TapsLive>
  );
}
