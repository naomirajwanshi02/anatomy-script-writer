import type { CSSProperties } from "react";
import { Dots, FaceText, Line, Solid } from "../../iso/react/draw";
import { Bulb } from "../../iso/react/bulb";
import { Sparks } from "../../iso/react/reel";
import {
  boardSvg,
  BRAND_SIZE,
  carton,
  CIRCUIT_LABEL_SIZE,
  circuitLabels,
  contacts,
  engraveAt,
  ENGRAVE,
  ENGRAVE_SIZE,
  gatesBlock,
  GATES_SIZE,
  knob,
  knobAt,
  knobTransform,
  LABEL_SIZE,
  labels,
  lamp,
  leverAt,
  levers,
  lid,
  MAP_SIZE,
  mapGrid,
  padDots,
  padRings,
  pretendEgg,
  rodPath,
  wires,
} from "./geometry";
import { BRAND, EMPTY, inputsAt, STAGE_GATES } from "./model";
import { KxLive } from "./live";

type CellArt = (typeof carton.back)[number];

// Start state: carton with 4 eggs, lid open, the loose band beside it, no labels, circuit hidden; the live loop writes
// every later state.
const start = inputsAt(0);
const dark = { "--lamp": 0 } as CSSProperties;
const BANDS = 4; // band slots (one per egg at most)

// One row of cups: rim rings, wells and their inner walls.
const Wells = ({ cells }: { cells: CellArt[] }) => (
  <>
    {cells.map((c, i) => (
      <g key={i}>
        <path className="kx-cup-rim" d={c.ring} />
        <path className="kx-well" d={c.well} />
        <path className="kx-well-in" d={c.wall} />
        {c.egg ? <path className="kx-shadow" data-shadow={c.m} d={c.shadow} style={{ opacity: 0 }} /> : null}
      </g>
    ))}
  </>
);
// The eggs of one row, left to right: each egg clipped above its cup's front arc, then the front lip line over it.
const Eggs = ({ cells }: { cells: CellArt[] }) => (
  <>
    {cells.map((c) =>
      c.egg ? (
        <g key={c.id}>
          <clipPath id={c.id}>
            <path d={c.clip} />
          </clipPath>
          <g clipPath={`url(#${c.id})`}>
            <path className="kx-egg" data-egg={c.m} d={c.egg} fill="url(#kx-shell)" />
          </g>
          <path className="kx-lip" d={c.lip} />
        </g>
      ) : null,
    )}
  </>
);
// Band slots (filled by the loop): whole loop (back), front part after row 0 / row 1 eggs, or flat on the map.
const Bands = ({ part }: { part: "back" | "front0" | "front1" | "flat" }) => (
  <>
    {Array.from({ length: BANDS }, (_, i) => (
      <g key={i} data-band={i} data-part={part} style={{ display: "none" }}>
        <path className="kx-rubber" />
        <path className="kx-rubber-hi" />
      </g>
    ))}
  </>
);

const Lever = ({ id }: { id: "a" | "b" | "c" }) => {
  const l = levers[id];
  const v = start[id] ? 1 : 0;
  return (
    <g data-lever={id}>
      <Solid paths={l.base} tone="mid" />
      <Line d={l.slot} tone="lo" />
      <Solid paths={l.pivot} tone="mid" />
      <path className="iso-line kx-rod" data-tone="hi" data-rod="" d={rodPath(leverAt[id], v)} />
      <g data-knob="" transform={knobTransform(knobAt(leverAt[id], v))}>
        <Solid paths={knob} tone="hi" crease="lo" />
      </g>
    </g>
  );
};

const Wire = ({ id }: { id: "a" | "b" | "c" }) => (
  <g data-wire={id} data-on={start[id] ? "1" : "0"}>
    <path className="iso-line gate-trace" data-tone="lo" d={wires[id]} />
    <path className="iso-line gate-flow" data-tone="lit" data-flow="" d={wires[id]} />
  </g>
);

// Static art: the board (rises), the carton (falls; its lid lifts away at the fold), the circuit behind it (rises),
// sparks.
export function KxArt() {
  return (
    <KxLive>
      <g data-entry="">
        <g data-base="">
          <g data-board="" dangerouslySetInnerHTML={{ __html: boardSvg(0) }} />
          <g className="kx-engrave" data-engrave="">
            <FaceText transform={engraveAt(0)} size={ENGRAVE_SIZE} tone="mid" anchor="middle">
              {ENGRAVE}
            </FaceText>
          </g>
          {/* Flat K-map grid (where the carton was, from the fold): cells, a 1 in each egg's cell, flat bands on top. */}
          <g data-map="" style={{ opacity: 0 }}>
            <path className="kx-map-cell" d={mapGrid.cells} />
            <g className="kx-map-one">
              {mapGrid.ones.map((o, i) => (
                <FaceText key={i} transform={o.m} size={MAP_SIZE} tone={o.one ? "hi" : "lo"} anchor="middle">
                  {o.one ? "1" : "0"}
                </FaceText>
              ))}
            </g>
          </g>
        </g>
        <g data-parts="">
          {/* Circuit behind the carton (in the lid's place): wires, gates block, levers, lamp. */}
          <g data-circuit="" style={{ opacity: 0, display: "none" }}>
            <g data-wire-side="">
              <Wire id="a" />
              <Wire id="c" />
            </g>
            <Wire id="b" />
            <Line d={padRings} tone="mid" />
            <Dots points={padDots} size={0.6} tone="hi" />
            <Lever id="a" />
            <Lever id="b" />
            <Lever id="c" />
            <g className="kx-circuit-name">
              <FaceText transform={circuitLabels.a} size={CIRCUIT_LABEL_SIZE} tone="hi">
                A
              </FaceText>
              <FaceText transform={circuitLabels.b} size={CIRCUIT_LABEL_SIZE} tone="hi">
                B
              </FaceText>
              <FaceText transform={circuitLabels.c} size={CIRCUIT_LABEL_SIZE} tone="hi">
                C
              </FaceText>
            </g>
            <clipPath id="kx-clip-gates">
              <path d={gatesBlock.clip} />
            </clipPath>
            <g clipPath="url(#kx-clip-gates)">
              <g data-gates="">
                <Solid paths={gatesBlock.body} tone="mid" crease="lo" />
                <text className="kx-gates-text" data-gates-text="" transform={gatesBlock.text} fontSize={GATES_SIZE} textAnchor="middle">
                  {`${STAGE_GATES[0]} gates`}
                </text>
              </g>
            </g>
            <g data-led="" style={dark}>
              <Bulb parts={lamp} />
            </g>
            <circle className="kx-bulb-glow bulb-glow" data-glow="" cx={lamp.glowAt[0].toFixed(1)} cy={lamp.glowAt[1].toFixed(1)} r={lamp.glowR.toFixed(1)} fill="url(#kx-bulb-glow)" style={{ opacity: 0 }} />
          </g>
          {/* Lid folded open backwards (lifts away at the fold): outer shell, rim, inner wall, panel, holes, print. */}
          <g data-lid="">
            <path className="kx-lid-outer" d={lid.outer} />
            <path className="kx-lid-rim" d={lid.rimTop} />
            <path className="kx-lid-wall" d={lid.wall} />
            <path className="kx-lid-panel" d={lid.panel} />
            <path className="kx-speck" d={lid.panel} fill="url(#kx-speck)" />
            <path className="kx-hole" d={lid.holes} />
            <g className="kx-brand">
              <FaceText transform={lid.brand} size={BRAND_SIZE} tone="hi" anchor="middle">
                {BRAND}
              </FaceText>
            </g>
          </g>
          {/* Flat bands on the map (circuit). */}
          <Bands part="flat" />
          {/* K-map axis labels engraved on the board (from the fold): A with 0/1, then BC with the Gray-order columns. */}
          <g className="kx-label">
              <g data-labels="a" style={{ opacity: 0 }}>
                <FaceText transform={labels.a} size={LABEL_SIZE} tone="mid" anchor="middle">
                  A
                </FaceText>
                {labels.rows.map((l) => (
                  <FaceText key={l.t} transform={l.m} size={LABEL_SIZE} tone="mid" anchor="middle">
                    {l.t}
                  </FaceText>
                ))}
              </g>
              <g data-labels="bc" style={{ opacity: 0 }}>
                <FaceText transform={labels.bc} size={LABEL_SIZE} tone="mid" anchor="middle">
                  BC
                </FaceText>
              </g>
              <g data-labels="b" style={{ opacity: 0 }}>
                <FaceText transform={labels.bc} size={LABEL_SIZE} tone="mid" anchor="middle">
                  B
                </FaceText>
              </g>
              <g data-labels="cols" style={{ opacity: 0 }}>
                {labels.cols.map((l, k) => (
                  <g key={l.t} data-col={k}>
                    <FaceText transform={l.m} size={LABEL_SIZE} tone="mid" anchor="middle">
                      {l.t}
                    </FaceText>
                  </g>
                ))}
              </g>
          </g>
          <g data-carton="">
            <path className="iso-halo" d={carton.halo} style={{ filter: "blur(3px)" }} />
            {/* Tray: cup bulges (scallops) under a thin flat rim. */}
            {carton.bulges.map((d, i) => (
              <path key={i} className="kx-bulge" d={d} fill="url(#kx-bump)" />
            ))}
            <Solid paths={carton.rim} tone="mid" crease="lo" className="kx-pulp" />
            <path className="kx-speck" d={carton.rim.top} fill="url(#kx-speck)" />
            {/* Back row, bands (whole loop), back eggs, band fronts of row 0, posts, front row, band fronts of row 1. */}
            <Wells cells={carton.back} />
            <path className="kx-pretend" data-pretend="" d={pretendEgg(...EMPTY)} style={{ opacity: 0 }} />
            <Bands part="back" />
            <Eggs cells={carton.back} />
            <Bands part="front0" />
            {carton.posts.map((p, i) => (
              <g key={i}>
                <path className="kx-post" d={p.d} fill="url(#kx-post)" />
                <circle className="kx-post-tip" cx={p.tip.cx.toFixed(1)} cy={p.tip.cy.toFixed(1)} r="1.2" />
              </g>
            ))}
            <Wells cells={carton.front} />
            <Eggs cells={carton.front} />
            <Bands part="front1" />
          </g>
        </g>
        <Sparks points={contacts.length} />
      </g>
    </KxLive>
  );
}
