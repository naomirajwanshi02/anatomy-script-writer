import type { ReactNode } from "react";
import { Dots, FaceText, Line, Solid } from "../../iso/react/draw";
import { Bulb } from "../../iso/react/bulb";
import { Sparks } from "../../iso/react/reel";
import { board, contacts, knob, knobAt, knobTransform, LEVERS, rodPath, streams, WIRES } from "./geometry";
import { LocksLive } from "./live";

const Name = ({ at, children, size = 5.2, className = "lk-name" }: { at: string; children: ReactNode; size?: number; className?: string }) => (
  <g className={className}>
    <FaceText transform={at} size={size} tone="hi">
      {children}
    </FaceText>
  </g>
);

const Lever = ({ id }: { id: "d" | "en" }) => {
  const l = board.levers[id];
  return (
    <g data-lever={id}>
      <Solid paths={l.base} tone="mid" />
      <Line d={l.slot} tone="lo" />
      <Solid paths={l.pivot} tone="mid" />
      <path className="iso-line lk-rod" data-tone="hi" data-rod="" d={rodPath(LEVERS[id], 1)} />
      <g data-knob="" transform={knobTransform(knobAt(LEVERS[id], 1))}>
        <Solid paths={knob} tone="hi" crease="lo" />
      </g>
    </g>
  );
};

const Wire = ({ id }: { id: string }) => {
  const w = WIRES.find((x) => x.id === id)!;
  return (
    <g data-wire={w.id} data-net={w.net} data-on="0">
      <path className="iso-line gate-trace" data-tone="lo" d={w.d} />
      <path className="iso-line gate-flow" data-flow="" d={w.d} />
      {w.junction ? <Dots points={[w.junction]} size={1.1} tone="mid" /> : null}
    </g>
  );
};

const Lamp = ({ i }: { i: number }) => {
  const l = board.lamps[i];
  return (
    <g data-lamp={`q${i + 1}`}>
      <Bulb parts={l} />
      <circle className="lk-glow bulb-glow" cx={l.glowAt[0].toFixed(1)} cy={l.glowAt[1].toFixed(1)} r={l.glowR.toFixed(1)} fill="url(#lk-glow)" />
    </g>
  );
};

// Static art: board and labels (rise), levers, basins, streams, gates and lamps (fall). The loop fills the slots.
export function LocksArt() {
  return (
    <LocksLive>
      <g data-entry="">
        <g data-base="">
          <path className="iso-halo" d={board.halo} />
          <Solid paths={board.slab} tone="mid" />
          <Line d={board.groove} tone="lo" />
          <Dots points={board.screws} size={0.5} />
          <g className="lk-only-circuit">
            {WIRES.map((w) => (
              <Wire key={w.id} id={w.id} />
            ))}
            {board.labels.lamps.map((at, i) => (
              <Name key={i} at={at}>{`Q${i + 1}`}</Name>
            ))}
          </g>
          <g className="lk-only-water">
            {board.labels.chambers.map((at, i) => (
              <Name key={i} at={at}>{`Q${i + 1}`}</Name>
            ))}
          </g>
          <Name at={board.labels.d}>D</Name>
          <Name at={board.labels.en}>EN</Name>
          <g className="lk-tag" data-en="0">
            <FaceText transform={board.labels.tag} size={5} tone="hi">
              CLOSED
            </FaceText>
          </g>
        </g>
        <g data-parts="">
          <Lever id="en" />
          {board.basinHalo.map((halo, i) => (
            <g key={i} data-basin={i}>
              <g className="lk-only-water">
                <path className="iso-halo" d={halo} style={{ filter: "blur(3px)" }} />
              </g>
              <g className="lk-latch" data-latch={i} />
              <g className="lk-water" data-water={i} />
              <g className="an-glass" data-glass={i} />
              {i > 0 ? (
                <g className="lk-pins lk-only-circuit">
                  <Name at={board.pins[i - 1].title} size={3.2} className="lk-block">
                    D LATCH
                  </Name>
                  <Name at={board.pins[i - 1].en} size={3.2} className="lk-pin">
                    EN
                  </Name>
                  <Name at={board.pins[i - 1].d} size={3.2} className="lk-pin">
                    D
                  </Name>
                  <Name at={board.pins[i - 1].q} size={3.2} className="lk-pin">
                    Q
                  </Name>
                </g>
              ) : null}
            </g>
          ))}
          <g className="lk-only-water">
            {streams.map((paths, i) => (
              <g key={i} className="lk-stream" data-stream={i} data-on="0" data-dir="1">
                {paths.map((d, j) => (
                  <path key={j} className="iso-line lk-drops" data-flow="" d={d} style={{ animationDelay: `${-j * 0.4}s` }} />
                ))}
              </g>
            ))}
          </g>
          <g className="lk-gates" data-gates="" />
          <g className="lk-only-circuit">
            {board.lamps.map((_, i) => (
              <Lamp key={i} i={i} />
            ))}
          </g>
          <Lever id="d" />
        </g>
        <Sparks points={contacts.length} />
      </g>
    </LocksLive>
  );
}
