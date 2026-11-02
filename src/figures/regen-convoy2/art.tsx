import type { CSSProperties } from "react";
import { FaceText, Solid } from "../../iso/react/draw";
import { Sparks } from "../../iso/react/reel";
import {
  boardEngrave,
  boardSvg,
  CARD,
  centreDash,
  contacts,
  curve,
  cx,
  cy,
  DIGIT,
  ENGRAVE,
  ENGRAVE_SIZE,
  gates,
  gauges,
  ghost,
  ghostGauge,
  LABEL_SIZE,
  litStrap,
  NUM_SIZE,
  railGlow,
  railLabels,
  rails,
  READOUT,
  road,
  segBase,
  sign,
  SIGN_SIZE,
  valve,
} from "./geometry";
import { BRAND, CARS } from "./model";
import { RcLive } from "./live";

const hidden = { opacity: 0, display: "none" } as CSSProperties;

// The dog in its own 2D profile frame (u forward, w down, board units); legs, tail and bob are written by the loop.
function Dog({ slot }: { slot: string }) {
  return (
    <g className="rc2-dog" data-dog={slot} style={hidden}>
      <path className="rc2-dog-shadow" data-dshadow="" />
      <g data-dmatrix="">
        <g data-dbob="">
          <path className="rc2-dog-leg" data-dlegs="" />
          <path className="rc2-dog-tail" data-dtail="" />
          <ellipse className="rc2-dog-fur" cx="0" cy="-7.4" rx="11" ry="3.4" />
          <ellipse className="rc2-dog-fur" cx="16.2" cy="-9.4" rx="2.4" ry="1.4" />
          <circle className="rc2-dog-fur" cx="13" cy="-10.2" r="3.1" />
          <path className="rc2-dog-fill" d="M14.4 -9C15.4 -8.2 16.6 -8 18 -8.4" />
          <path className="rc2-dog-ear" d="M12.2 -13.1C10.2 -13.2 9.4 -11 10.2 -9C11.4 -9.4 12.4 -11 12.6 -12.8Z" />
          <circle className="rc2-dog-dark" cx="14" cy="-11.2" r="0.6" />
          <circle className="rc2-dog-dark" cx="18.4" cy="-9.6" r="0.8" />
        </g>
      </g>
    </g>
  );
}

// Static art: the board (rises) with the road scene and the circuit's flat parts; the parts (fall): dog, ghost and real
// cars, sign; the circuit's gates, gauges and ghost copiers (arrive at the fold). Card and readout below the board.
export function RcArt() {
  return (
    <RcLive>
      <g data-entry="">
        <g data-base="">
          <g data-board="" dangerouslySetInnerHTML={{ __html: boardSvg }} />
          <g className="rc2-engrave">
            <FaceText transform={boardEngrave} size={ENGRAVE_SIZE} tone="mid" anchor="middle">
              {ENGRAVE}
            </FaceText>
          </g>
          <g data-roadbase="">
            <path className="rc2-tar" d={road.base} />
            <path className="rc2-edge" d={road.edges} />
            <path className="rc2-centre" data-centre="" d={road.centre} strokeDasharray={centreDash} />
            <path className="rc2-linesglow" data-linesglow="" d={road.lowerLines} style={{ opacity: 0 }} />
          </g>
          {/* Circuit, flat parts: rails with their labels, straps, the wire (base trace + rust flow), the ghost wire. */}
          <g data-circbase="" style={hidden}>
            <Solid paths={rails.one} tone="hi" crease="lo" className="rc2-rail rc2-one" />
            <Solid paths={rails.zero} tone="hi" crease="lo" className="rc2-rail rc2-zero" />
            <path className="rc2-railglow" data-railglow="" d={railGlow} style={{ opacity: 0 }} />
            <g className="rc2-marks">
              <FaceText transform={railLabels.one} size={LABEL_SIZE} tone="hi">
                1 V
              </FaceText>
              <FaceText transform={railLabels.zero} size={LABEL_SIZE} tone="hi">
                0 V
              </FaceText>
            </g>
            {gates.map((g, i) => (
              <path key={i} className="rc2-strap" d={g.straps} />
            ))}
            <g data-ghostwire="">
              <path className="rc2-ghostwire" d={ghost.wire} />
            </g>
            {segBase.map((d, i) => (
              <g key={i} data-seg={i} data-on="1">
                <path className="iso-line gate-trace" data-tone="lo" data-sp="" d={d} />
                <path className="iso-line gate-flow" data-tone="lit" data-flow="" data-sp="" d={d} />
              </g>
            ))}
          </g>
        </g>
        <g data-parts="">
          <g data-roadparts="">
            <Dog slot="back" />
            {CARS.map((c) => (
              <g key={c.id} className={`rc2-car rc2-${c.id}`} data-ghost={c.id} />
            ))}
            {CARS.map((c) => (
              <g key={c.id} className={`rc2-car rc2-${c.id}`} data-car={c.id} style={hidden} />
            ))}
            <Dog slot="front" />
            <rect className="rc2-warn" data-warn="" rx="10" style={hidden} />
            <g className="rc2-sign">
              {sign.posts.map((p, i) => (
                <Solid key={i} paths={p} tone="mid" crease="none" className="rc2-post" />
              ))}
              <Solid paths={sign.plate} tone="hi" crease="lo" className="rc2-plate" />
              <FaceText transform={sign.textAt} size={SIGN_SIZE} tone="hi" anchor="middle">
                {BRAND}
              </FaceText>
            </g>
          </g>
          <g data-circparts="" style={hidden}>
            {/* Ghost copiers and their small gauge (front strip). */}
            <g data-ghostparts="">
              {ghost.blocks.map((b, i) => (
                <Solid key={i} paths={b} tone="mid" crease="none" className="rc2-gblock" />
              ))}
              <Solid paths={ghostGauge.panel} tone="hi" crease="lo" className="rc2-panel rc2-gpanel" />
              <path className="rc2-band" d={ghostGauge.band1} />
              <path className="rc2-band" d={ghostGauge.band0} />
              <path className="rc2-ghalf" d={ghostGauge.half} />
              <path className="rc2-gmarker" data-gmarker="" />
            </g>
            {/* Buffer gates (gate 2 carries the input valve and the rail current strap). */}
            {gates.map((g, i) => (
              <g key={i} data-gate={i}>
                {i === 1 ? (
                  <g data-valve="" style={hidden}>
                    <Solid paths={valve} tone="mid" crease="none" className="rc2-valve" />
                  </g>
                ) : null}
                <Solid paths={g.body} tone="hi" crease="lo" className="rc2-block" />
                <path className="rc2-sym" d={g.sym} />
                <g className="rc2-num">
                  <FaceText transform={g.numAt} size={NUM_SIZE} tone="hi" anchor="middle">
                    {g.num}
                  </FaceText>
                </g>
                {i === 1 ? (
                  <g data-litstrap="" style={hidden}>
                    <path className="rc2-strap-lit" d={litStrap} />
                    <path className="rc2-strap-dash" d={litStrap} />
                  </g>
                ) : null}
              </g>
            ))}
            {/* Upright 0-1 V gauges over each gate's output wire. */}
            {gauges.map((g, i) => (
              <g key={i} data-gauge={i}>
                <Solid paths={g.post} tone="mid" crease="none" className="rc2-post" />
                <Solid paths={g.panel} tone="hi" crease="lo" className="rc2-panel" />
                <g data-bands="" style={{ opacity: 0 }}>
                  <path className="rc2-band" d={g.band1} />
                  <path className="rc2-band" d={g.band0} />
                  <path className="rc2-bandfill" data-bf="1" d={g.band1} style={{ opacity: 0 }} />
                  <path className="rc2-bandfill" data-bf="0" d={g.band0} style={{ opacity: 0 }} />
                  <path className="rc2-ghalf" d={g.half} />
                  <g className="rc2-digit">
                    <FaceText transform={g.one} size={DIGIT} tone="hi">
                      1
                    </FaceText>
                    <FaceText transform={g.zero} size={DIGIT} tone="hi">
                      0
                    </FaceText>
                  </g>
                  <path className="rc2-marker" data-marker="" />
                </g>
              </g>
            ))}
          </g>
        </g>
        <Sparks points={contacts.length} />
      </g>
      {/* Transfer curve card (S curve of the buffer), slides up below gate 2. */}
      <g data-card="" style={hidden}>
        <rect className="rc2-card" x={CARD.x} y={CARD.y} width={CARD.w} height={CARD.h} rx="8" />
        <path className="rc2-axes" d={curve.axes + curve.ticks} />
        <path className="rc2-halfline" data-half="" d={curve.half} style={{ opacity: 0 }} />
        <path className="rc2-curve" d={curve.path} />
        <path className="rc2-steep" data-steep="" d={curve.steep} style={{ opacity: 0 }} />
        <path className="rc2-flattop" data-flattop="" d={curve.flatTop} style={{ opacity: 0 }} />
        <text className="rc2-ct" x={cx(0)} y={cy(0) + 22} textAnchor="middle">
          0
        </text>
        <text className="rc2-ct" x={cx(0.5)} y={cy(0) + 22} textAnchor="middle">
          0.5
        </text>
        <text className="rc2-ct" x={cx(1)} y={cy(0) + 22} textAnchor="middle">
          1
        </text>
        <text className="rc2-ct" x={cx(0) - 9} y={cy(1) + 6} textAnchor="end">
          1
        </text>
        <text className="rc2-ct" x={cx(0) - 9} y={cy(0.5) + 6} textAnchor="end">
          0.5
        </text>
        <text className="rc2-ct rc2-cl" x={cx(1) + 2} y={cy(0) - 8} textAnchor="end">
          in
        </text>
        <text className="rc2-ct rc2-cl" x={cx(0) + 8} y={cy(1) + 4} textAnchor="start">
          out
        </text>
        <path className="rc2-guide" data-guide="" />
        <path className="rc2-arrow" data-arrow="" />
        <circle className="rc2-dot" data-cin="" r="7" />
        <circle className="rc2-dot" data-cout="" r="7" />
      </g>
      {/* One readout: gate 2's input, then its output. */}
      <g data-readout="" style={hidden}>
        <rect className="rc2-ro-box" x={READOUT.x - READOUT.w / 2} y={READOUT.y} width={READOUT.w} height={READOUT.h} rx="8" />
        <text className="rc2-ro-label" x={READOUT.x} y={READOUT.y + 26} textAnchor="middle" data-rolabel="">
          gate 2 in
        </text>
        <text className="rc2-ro-val" x={READOUT.x} y={READOUT.y + 68} textAnchor="middle" data-roval="">
          0.7 V
        </text>
      </g>
    </RcLive>
  );
}
