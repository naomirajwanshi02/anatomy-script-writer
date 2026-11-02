import type { CSSProperties } from "react";
import { FaceText, Solid } from "../../iso/react/draw";
import { Sparks } from "../../iso/react/reel";
import {
  blocks,
  boardEngrave,
  boardSvg,
  CARD,
  contacts,
  counterAt,
  curve,
  cx,
  cy,
  ENGRAVE,
  ENGRAVE_SIZE,
  gapDots,
  gapLine,
  gauges,
  ghostRow,
  LABEL_SIZE,
  labels,
  litStrap,
  neighbourPath,
  rails,
  railGlow,
  road,
  segPaths,
  STREAKS,
  wireBase,
} from "./geometry";
import { CARS, DOTS } from "./model";
import { RcLive } from "./live";

const hidden = { opacity: 0, display: "none" } as CSSProperties;

// Static art: the board (rises) with the road; the parts (fall): cars, ghosts, gusts; the circuit (after the fold):
// rails, wire, inverter blocks, gauges, neighbour wire, readouts, ghost row; the curve card below the board.
// The live loop writes every later state.
export function RcArt() {
  return (
    <RcLive>
      <g data-entry="">
        <g data-base="">
          <g data-board="" dangerouslySetInnerHTML={{ __html: boardSvg }} />
          <g className="rc-engrave">
            <FaceText transform={boardEngrave} size={ENGRAVE_SIZE} tone="mid" anchor="middle">
              {ENGRAVE}
            </FaceText>
          </g>
          {/* The road: tarmac, edge lines, dashed centre line (shrinks and slides away at the fold). */}
          <g data-road="">
            <path className="rc-tar" d={road.base} />
            <path className="rc-edge" d={road.edges} />
            <path className="rc-centre" data-g="centre" d={road.centre} />
            <path className="rc-linesglow" data-g="linesGlow" d={road.lines} style={{ opacity: 0 }} />
          </g>
          {/* Circuit rails: VDD (back, dark), GND (front, light), engraved at their left ends. */}
          <g data-g="rails" style={hidden}>
            <Solid paths={rails.vdd} tone="hi" crease="lo" className="rc-rail rc-vdd" />
            <Solid paths={rails.gnd} tone="hi" crease="lo" className="rc-rail rc-gnd" />
            <path className="rc-railglow" data-g="railGlow" d={railGlow} style={{ opacity: 0 }} />
            <g className="rc-marks">
              <FaceText transform={labels.vdd} size={LABEL_SIZE} tone="hi">
                VDD
              </FaceText>
              <FaceText transform={labels.gnd} size={LABEL_SIZE} tone="hi">
                GND
              </FaceText>
            </g>
          </g>
        </g>
        <g data-parts="">
          {/* Ghost copying row in front of the GND rail (plain dashed blocks, no rails). */}
          <g data-ghostrow="" style={hidden}>
            <path className="rc-ghost-half" d={ghostRow.half} />
            {ghostRow.blocks.map((b, i) => (
              <Solid key={i} paths={b} tone="mid" crease="none" className="rc-gblock" />
            ))}
            <path className="rc-ghost-marker" data-gm="" />
          </g>
          {/* The wire: base trace end to end, dotted through the gap; rust flow per segment while it carries a 1. */}
          <g data-g="wires" style={hidden}>
            <path className="iso-line gate-trace" data-tone="lo" d={wireBase} />
            <path className="rc-gapline" d={gapLine} />
            <path className="rc-gapdot" d={gapDots} />
            {/* Faint neighbour wire above car 1's input (flickers in the key state). */}
            <g data-neighbour="" style={hidden}>
              <path className="rc-neighbour" data-nb="" d={neighbourPath} />
            </g>
            {segPaths.map((d, i) => (
              <g key={i} data-seg={i} data-on="0">
                <path className="iso-line gate-trace" data-tone="lo" data-sp="" d={d} />
                <path className="iso-line gate-flow" data-tone="lit" data-flow="" data-sp="" d={d} />
              </g>
            ))}
          </g>
          {/* Inverter blocks: straps, PMOS valve (behind), block with symbol and car number, NMOS valve (front). */}
          {blocks.map((b, i) => (
            <g key={b.id} data-block={i} data-p="0" data-n="0" style={hidden}>
              <g data-lift="">
                <path className="rc-strap" d={b.straps} />
                <g className="rc-valve" data-valve="pmos">
                  <Solid paths={b.pmos.body} tone="mid" crease="lo" className="rc-vbody" />
                  <Solid paths={b.pmos.gate} tone="mid" crease="none" className="rc-vgate" />
                </g>
                {i === 1 ? (
                  <g data-g="strapLit" style={hidden}>
                    <path className="rc-strap-lit" d={litStrap} />
                    <path className="rc-strap-dash" d={litStrap} />
                  </g>
                ) : null}
                <Solid paths={b.body} tone="hi" crease="lo" className="rc-block" />
                <path className="rc-sym" d={b.sym} />
                <g className="rc-num">
                  <FaceText transform={b.numAt} size={b.numSize} tone="hi" anchor="middle">
                    {b.num}
                  </FaceText>
                </g>
                <g className="rc-valve" data-valve="nmos">
                  <Solid paths={b.nmos.body} tone="mid" crease="lo" className="rc-vbody" />
                  <Solid paths={b.nmos.gate} tone="mid" crease="none" className="rc-vgate" />
                </g>
              </g>
            </g>
          ))}
          {/* Upright 0-1 V gauges floating above the wire segments (rise on "a voltage"). */}
          {gauges.map((g, i) => (
            <g key={i} data-gauge={i} style={hidden}>
              <Solid paths={g.post} tone="mid" crease="none" className="rc-post" />
              <Solid paths={g.panel} tone="hi" crease="lo" className="rc-panel" />
              <path className="rc-band" d={g.band1} />
              <path className="rc-band" d={g.band0} />
              <path className="rc-bandfill" data-gb="1" d={g.band1} style={{ opacity: 0 }} />
              <path className="rc-bandfill" data-gb="0" d={g.band0} style={{ opacity: 0 }} />
              <g data-glanes="" style={{ opacity: 0 }}>
                <path className="rc-gtar" d={g.band1} />
                <path className="rc-gtar" d={g.band0} />
                <path className="rc-glane" d={g.laneLines} />
              </g>
              <path className="rc-ghalf" d={g.half} />
              <path className="rc-ghalfglow" data-gh="" d={g.half} style={{ opacity: 0 }} />
              <g className="rc-gdigit" data-gd="1" style={{ opacity: 0 }}>
                <FaceText transform={g.one} size={g.digit} tone="hi">
                  1
                </FaceText>
              </g>
              <g className="rc-gdigit" data-gd="0" style={{ opacity: 0 }}>
                <FaceText transform={g.zero} size={g.digit} tone="hi">
                  0
                </FaceText>
              </g>
              <g className="rc-glabel">
                <FaceText transform={g.labelAt} size={g.labelSize} tone="hi" anchor="middle">
                  {g.label}
                </FaceText>
              </g>
              <path className="rc-marker" data-gm="" />
            </g>
          ))}
          {/* The road's ghost convoy (dashed outlines), under the real cars. */}
          {CARS.map((c) => (
            <g key={c.id} data-ghost={c.id} style={hidden} />
          ))}
          {DOTS.map((_, j) => (
            <path key={j} className="rc-dot" data-dot={j} style={hidden} />
          ))}
          {CARS.map((c) => (
            <g key={c.id} data-car={c.id} />
          ))}
          {/* Gust streaks (analogy). */}
          {(["hook", "lane"] as const).map((k) => STREAKS.map((s, i) => <path key={`${k}${i}`} className="rc-streak" data-tone={s.tone} data-streak={`${k}${i}`} style={hidden} />))}
          {/* Key-state readouts below the first three gauges: car 1's input, the middle wire, car 1's output. */}
          {[0, 1, 2].map((i) => (
            <g key={i} data-ro={i} style={hidden}>
              <rect className="rc-ro-box" x="-38" y="-15" width="76" height="30" rx="5" />
              <text className="rc-ro" x="0" y="8" textAnchor="middle">
                <tspan className="rc-ro-val" data-ro-val="">
                  0.0
                </tspan>
                <tspan className="rc-ro-unit"> V</tspan>
              </text>
            </g>
          ))}
          <g data-counter="" style={hidden} transform={`translate(${counterAt[0].toFixed(1)} ${counterAt[1].toFixed(1)})`}>
            <rect className="rc-ro-box" x="-48" y="-15" width="96" height="30" rx="5" />
            <text className="rc-ro" x="0" y="7.5" textAnchor="middle">
              <tspan className="rc-ro-unit">stage </tspan>
              <tspan className="rc-ro-val" data-count="">
                0
              </tspan>
            </text>
          </g>
        </g>
        <Sparks points={contacts.length} />
      </g>
      {/* Transfer curve card (falling S curve), slides in on "At the line". */}
      <g data-card="" style={hidden}>
        <rect className="rc-card" x={CARD.x} y={CARD.y} width={CARD.w} height={CARD.h} rx="8" />
        <path className="rc-plot" d={curve.plot} />
        <path className="rc-flat" data-g="flatLo" d={curve.flatLo} style={{ opacity: 0 }} />
        <path className="rc-flat" data-g="flatHi" d={curve.flatHi} style={{ opacity: 0 }} />
        <path className="rc-half" d={curve.half} />
        <path className="rc-halfglow" data-g="cardHalf" d={curve.half} style={{ opacity: 0 }} />
        <path className="rc-axes" d={curve.axes + curve.ticks} />
        <path className="rc-curve" d={curve.path} />
        <text className="rc-ct" x={cx(0)} y={cy(0) + 24} textAnchor="middle">
          0
        </text>
        <text className="rc-ct" x={cx(0.5)} y={cy(0) + 24} textAnchor="middle">
          0.5
        </text>
        <text className="rc-ct" x={cx(1)} y={cy(0) + 24} textAnchor="middle">
          1
        </text>
        <text className="rc-ct" x={cx(0) - 9} y={cy(1) + 6} textAnchor="end">
          1
        </text>
        <text className="rc-ct" x={cx(0) - 9} y={cy(0.5) + 6} textAnchor="end">
          0.5
        </text>
        <text className="rc-ct rc-cl" x={cx(1) - 2} y={cy(0) + 24} textAnchor="start" dx="14">
          in
        </text>
        <text className="rc-ct rc-cl" x={cx(0) + 8} y={cy(1) - 4} textAnchor="start">
          out
        </text>
        <path className="rc-arrow" data-g="arrowIn" />
        <path className="rc-arrow" data-g="arrowOut" />
        <g data-g="curveDot" style={hidden}>
          <path className="rc-guide" data-cg="" />
          <circle className="rc-cdot" data-cpt="" r="4" />
          <circle className="rc-dot-io" data-cin="" r="7" />
          <circle className="rc-dot-io" data-cout="" r="7" />
        </g>
      </g>
    </RcLive>
  );
}
