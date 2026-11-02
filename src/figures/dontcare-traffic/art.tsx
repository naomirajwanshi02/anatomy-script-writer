import type { CSSProperties } from "react";
import { FaceText, Line, Solid } from "../../iso/react/draw";
import { Bulb } from "../../iso/react/bulb";
import { Sparks } from "../../iso/react/reel";
import {
  boardEngrave,
  boardSvg,
  brand,
  BRAND_SIZE,
  contacts,
  ENGRAVE,
  ENGRAVE_SIZE,
  ghost,
  goLamp,
  grid,
  LABEL_SIZE,
  labels,
  lamps,
  LETTER_SIZE,
  light,
  loopPath,
  plate,
  pool,
  sinkClip,
  TILE_SIZE,
  tiles,
  wire,
  wirePads,
} from "./geometry";
import { BRAND, bitsOf, DONT_CARE, LAMPS, lightAt, VARS } from "./model";
import { DtLive } from "./live";

// Start state: the light standing, green lit; everything of the circuit half hidden. The live loop writes every later
// state.
const start = bitsOf(lightAt(0));
const on = (v: number) => ({ "--on": v }) as CSSProperties;
const dark = { "--lamp": 0 } as CSSProperties;

// Static art: the board (rises) with the grid of boxes (hidden until the fold), the tiles, wire, go lamp, ghost and the
// traffic light (fall), the flying lamps, sparks.
export function DtArt() {
  return (
    <DtLive>
      <g data-entry="">
        <g data-base="">
          <g data-board="" dangerouslySetInnerHTML={{ __html: boardSvg }} />
          <g className="dt-engrave">
            <FaceText transform={boardEngrave} size={ENGRAVE_SIZE} tone="mid" anchor="middle">
              {ENGRAVE}
            </FaceText>
          </g>
          {/* Grid of boxes (rises at 11 s): cells, a little flat traffic light in each, X marks, tick, loop, labels. */}
          <g data-grid="" style={{ opacity: 0, display: "none" }}>
            {grid.map((g) => (
              <g key={g.code}>
                <path className="dt-cell" data-cell={g.code} d={g.cell} />
                <path className="dt-mini-plate" d={g.plate} />
                {g.lenses.map((d, i) => (
                  <path key={i} className="dt-mini-off" d={d} />
                ))}
                <g data-mini={g.code}>
                  {g.bits.map((b, i) =>
                    b ? (
                      <g key={i}>
                        <path className="dt-mini-halo" d={g.halos[i]} fill={`var(--dt-${LAMPS[i]})`} filter="url(#dt-blur-s)" />
                        <path className="dt-mini-lit" d={g.lenses[i]} fill={`var(--dt-${LAMPS[i]})`} />
                      </g>
                    ) : null,
                  )}
                </g>
              </g>
            ))}
            {DONT_CARE.map((c, k) => (
              <path key={c} className="dt-x" data-x={k} d={grid.find((g) => g.code === c)!.x} style={{ opacity: 0 }} />
            ))}
            <path className="dt-tick" data-tick="" d={grid.find((g) => g.code === 0b001)!.tick} pathLength={1} style={{ strokeDashoffset: 1 }} />
            <path className="dt-loop" data-loop="" d={loopPath} pathLength={1} style={{ strokeDashoffset: 1, opacity: 0 }} />
            <g className="dt-label">
              <FaceText transform={labels.r} size={LABEL_SIZE} tone="mid" anchor="middle">
                R
              </FaceText>
              {labels.rows.map((l) => (
                <FaceText key={l.t} transform={l.m} size={LABEL_SIZE} tone="mid" anchor="middle">
                  {l.t}
                </FaceText>
              ))}
              <FaceText transform={labels.yg} size={LABEL_SIZE} tone="mid" anchor="middle">
                YG
              </FaceText>
              {labels.cols.map((l) => (
                <FaceText key={l.t} transform={l.m} size={LABEL_SIZE} tone="mid" anchor="middle">
                  {l.t}
                </FaceText>
              ))}
            </g>
          </g>
        </g>
        <g data-parts="">
          {/* Bit tiles R Y G (after the fold): body, lens (lit in its lamp colour when the bit is 1), digit, letter. */}
          <g data-tiles="" style={{ opacity: 0, display: "none" }}>
            {tiles.map((t, i) => (
              <g key={t.lamp} data-tile={i} style={on(0)}>
                <g data-tile-body="">
                  <Solid paths={t.body} tone="hi" crease="lo" className="dt-tile" />
                  <path className="dt-tile-off" d={t.lens} />
                  <path className="dt-tile-halo" d={t.halo} fill={`var(--dt-${t.lamp})`} filter="url(#dt-blur-s)" />
                  <path className="dt-tile-lit" d={t.lens} fill={`var(--dt-${t.lamp})`} />
                  <g className="dt-digit">
                    <FaceText transform={t.digit} size={TILE_SIZE} tone="hi" anchor="middle">
                      <tspan data-digit={i}>0</tspan>
                    </FaceText>
                  </g>
                </g>
                <g className="dt-letter" data-letter={i}>
                  <FaceText transform={t.letter} size={LETTER_SIZE} tone="hi" anchor="middle">
                    {VARS[i]}
                  </FaceText>
                </g>
              </g>
            ))}
          </g>
          {/* G wire to the go lamp (from 18 s): lo base trace, rust flow while G = 1. */}
          <g data-wire="" data-on="0" style={{ opacity: 0 }}>
            <path className="iso-line gate-trace" data-tone="lo" d={wire} />
            <path className="iso-line gate-flow" data-tone="lit" data-flow="" d={wire} />
            <Line d={wirePads} tone="mid" />
          </g>
          {/* Go lamp: kit glass bulb, lit while go = 1. */}
          <g data-go="" style={{ opacity: 0, display: "none" }}>
            <g data-led="" style={dark}>
              <Bulb parts={goLamp} />
            </g>
            <circle className="dt-bulb-glow bulb-glow" data-glow="" cx={goLamp.glowAt[0].toFixed(1)} cy={goLamp.glowAt[1].toFixed(1)} r={goLamp.glowR.toFixed(1)} fill="url(#dt-bulb-glow)" style={{ opacity: 0 }} />
          </g>
          {/* Ghost light (5.5-8 s): dashed outlines, red and green both lit. */}
          <g className="dt-ghost" data-ghost="" style={{ opacity: 0, display: "none" }}>
            {[ghost.base, ghost.pole, ghost.back, ghost.house].map((p, i) => (
              <path key={i} className="dt-ghost-body" d={p.fill} />
            ))}
            {ghost.lamps.map((l) => (
              <g key={l.lamp}>
                <path className="dt-ghost-bezel" d={l.bezel} />
                {l.lamp !== "yellow" ? <path className="dt-halo" d={l.halo} fill={`var(--dt-${l.lamp})`} filter="url(#dt-blur)" style={{ opacity: 0.7 }} /> : null}
                <path className="dt-lens" d={l.lens} fill={l.lamp !== "yellow" ? `url(#dt-lit-${l.lamp})` : "none"} />
              </g>
            ))}
          </g>
          {/* Glow pools on the board, one per lamp colour, each as bright as its lamp. */}
          {LAMPS.map((l, i) => (
            <path key={l} className="dt-pool" data-pool={i} d={pool} fill={`url(#dt-pool-${l})`} style={{ opacity: start[i] }} />
          ))}
          {/* The traffic light, clipped at the board top so it can sink in at the fold. */}
          <clipPath id="dt-clip-sink">
            <path d={sinkClip} />
          </clipPath>
          <g clipPath="url(#dt-clip-sink)">
            <g data-sink="">
              <Solid paths={light.base} tone="mid" crease="lo" className="dt-plinth" />
              <path className="dt-plate" d={plate.d} />
              {plate.rivets.map(([x, y], i) => (
                <circle key={i} className="dt-rivet" cx={x.toFixed(1)} cy={y.toFixed(1)} r="0.7" />
              ))}
              <g className="dt-brand">
                <FaceText transform={brand} size={BRAND_SIZE} tone="hi" anchor="middle">
                  {BRAND}
                </FaceText>
              </g>
              <Solid paths={light.collar} tone="hi" crease="none" className="dt-dark" />
              <Solid paths={light.pole} tone="hi" crease="none" className="dt-dark" />
              <Solid paths={light.back} tone="hi" crease="none" className="dt-dark dt-backplate" />
              <Solid paths={light.house} tone="hi" crease="mid" className="dt-dark" />
              {/* Lamps top to bottom: bezel, lens (lit = own colour + halo, off = dark sepia glass), shine, visor. */}
              {lamps.map((l, i) => (
                <g key={l.lamp} className="dt-lamp" data-lamp={i} style={on(start[i])}>
                  <path className="dt-bezel" d={l.bezel} />
                  <g data-lens="">
                    <path className="dt-halo dt-real-halo" d={l.halo} fill={`var(--dt-${l.lamp})`} filter="url(#dt-blur)" />
                    <path className="dt-lens" d={l.lens} fill="url(#dt-off)" />
                    <path className="dt-lens dt-lens-lit" d={l.lens} fill={`url(#dt-lit-${l.lamp})`} />
                    <path className="dt-shine" d={l.shine} />
                  </g>
                  <path className="dt-visor" d={l.visor} />
                  <path className="dt-visor-rim" d={l.visorRim} />
                </g>
              ))}
            </g>
          </g>
          {/* Lamps in flight at the folds. */}
          {LAMPS.map((l, i) => (
            <circle key={l} className="dt-fly" data-fly={i} cx="0" cy="0" r="1" style={{ display: "none" }} />
          ))}
        </g>
        <Sparks points={contacts.length} />
      </g>
    </DtLive>
  );
}
