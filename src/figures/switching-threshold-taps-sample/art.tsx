import { Dots, FaceText, Line, Solid } from "../../iso/react/draw";
import { Sparks } from "../../iso/react/reel";
import { board, BOXES, BRAND_SIZE, contacts, drain, ENGRAVE, ENGRAVE_SIZE, fill, lever, links, out, streams, supply, type Box } from "./geometry";
import { BRAND, fmt, VIN, VOUT } from "./model";
import { StLive } from "./live";

const WaterBox = ({ id, glass }: { id: Box; glass: Parameters<typeof Solid>[0]["paths"] }) => (
  <g data-box={id}>
    <g data-box-water={id} transform={BOXES[id].shift || undefined} />
    <g className="an-glass">
      <Solid paths={glass} tone="mid" crease="lo" />
    </g>
  </g>
);

const Stream = ({ id }: { id: keyof typeof streams }) => (
  <g className="st-stream" data-stream={id} data-on="1">
    <path className="st-column" d={streams[id].d} style={{ strokeWidth: streams[id].w.toFixed(2) }} />
    <path className="an-drops st-drops" data-flow="" d={streams[id].d} />
  </g>
);

type TapParts = typeof fill.tap;
const Tap = ({ t }: { t: TapParts }) => (
  <g className="st-tap">
    <Solid paths={t.body} tone="hi" crease="lo" />
    <Solid paths={t.stem} tone="hi" crease="none" />
    <Solid paths={t.wheel} tone="hi" crease="lo" />
    <path className="an-spoke st-handle" d={t.handle} />
  </g>
);

// Readout below the board: Vin and Vout values and an empty Vout-against-Vin graph card.
const G = { w: 300, h: 300, l: 58, r: 18, t: 18, b: 52 };
const gx = (v: number) => G.l + v * (G.w - G.l - G.r);
const gy = (v: number) => G.h - G.b - v * (G.h - G.t - G.b);
export function StReadout() {
  return (
    <div className="st-readout">
      <div className="st-values">
        <div className="st-val">
          <span className="st-name">Vin</span>
          <span className="st-num">{fmt(VIN)}</span>
        </div>
        <div className="st-val">
          <span className="st-name">Vout</span>
          <span className="st-num">{fmt(VOUT)}</span>
        </div>
      </div>
      <svg className="st-graph" viewBox={`0 0 ${G.w} ${G.h}`} aria-hidden="true">
        <rect className="st-card" x="1.5" y="1.5" width={G.w - 3} height={G.h - 3} rx="10" />
        <path className="st-half" d={`M${gx(0.5)},${gy(0)}V${gy(1)}M${gx(0)},${gy(0.5)}H${gx(1)}`} />
        <path className="st-axis" d={`M${gx(0)},${gy(1)}V${gy(0)}H${gx(1)}`} />
        {[0, 0.5, 1].map((v) => (
          <g key={v}>
            <text x={gx(v)} y={gy(0) + 22} textAnchor="middle">
              {v === 0.5 ? "0.5" : v}
            </text>
            {v > 0 ? (
              <text x={gx(0) - 9} y={gy(v) + 6} textAnchor="end">
                {v === 0.5 ? "0.5" : v}
              </text>
            ) : null}
          </g>
        ))}
        <text className="st-axis-name" x={gx(1)} y={gy(0) + 44} textAnchor="end">
          Vin
        </text>
        <text className="st-axis-name" x={gx(0) + 8} y={gy(1) + 6}>
          Vout
        </text>
      </svg>
    </div>
  );
}

// Static art: board with engraving (rise); stand, tanks, pipes, taps, handle and links (fall).
export function StArt() {
  return (
    <StLive>
      <g data-entry="">
        <g data-base="">
          <path className="iso-halo" d={board.halo} />
          <Solid paths={board.slab} tone="mid" />
          <Line d={board.groove} tone="lo" />
          <Dots points={board.screws} size={0.5} />
          <g className="st-engrave">
            <FaceText transform={board.engraveAt} size={ENGRAVE_SIZE} tone="mid" anchor="middle">
              {ENGRAVE}
            </FaceText>
          </g>
        </g>
        <g data-parts="">
          {/* Supply tank on its stand. */}
          {supply.backLegs.map((p, i) => (
            <Solid key={i} paths={p} tone="mid" crease="none" />
          ))}
          <path className="st-brace" d={supply.braceBack} />
          {supply.feet.map((p, i) => (
            <Solid key={i} paths={p} tone="mid" crease="none" />
          ))}
          {supply.frontLegs.map((p, i) => (
            <Solid key={i} paths={p} tone="mid" crease="none" />
          ))}
          <path className="st-brace" d={supply.brace} />
          <Solid paths={supply.platform} tone="hi" crease="lo" />
          <WaterBox id="supply" glass={supply.glass} />
          <path className="st-plate" d={supply.plate} />
          <Dots points={supply.plateRivets} size={0.5} tone="hi" />
          <g className="st-brand">
            <FaceText transform={supply.brandAt} size={BRAND_SIZE} tone="hi" anchor="middle">
              {BRAND}
            </FaceText>
          </g>
          {/* Fill pipe and tap. */}
          {fill.run.map((p, i) => (
            <Solid key={i} paths={p} tone="mid" crease="lo" />
          ))}
          {fill.down.map((p, i) => (
            <Solid key={i} paths={p} tone="mid" crease="lo" />
          ))}
          <Tap t={fill.tap} />
          <path className="st-arm" d={fill.tagArm} />
          <path className="st-plate" d={fill.tag} />
          <g className="st-label">
            <FaceText transform={fill.tagText} size={5} tone="hi" anchor="middle">
              FILL
            </FaceText>
          </g>
          {/* Handle. */}
          <Solid paths={lever.base} tone="mid" />
          <Line d={lever.slot} tone="lo" />
          <path className="st-tick" d={lever.ticks} />
          <path className="st-tick st-tick-mid" d={lever.midTick} />
          <Solid paths={lever.pivot} tone="mid" />
          <path className="iso-line st-rod" data-tone="hi" d={lever.rod} />
          <g transform={lever.knobAt}>
            <Solid paths={lever.knob} tone="hi" crease="lo" />
          </g>
          {/* Output tank. */}
          <Solid paths={out.plinth} tone="mid" />
          <g data-box="out">
            <g data-box-water="out" transform={BOXES.out.shift} />
          </g>
          <Stream id="fill" />
          <g className="an-glass">
            <Solid paths={out.glass} tone="mid" crease="lo" />
          </g>
          <path className="st-half-ring" d={out.half} />
          <path className="st-half-ring" d={out.halfTicks} />
          <g className="st-label">
            <FaceText transform={out.halfText} size={4.2} tone="hi" anchor="start">
              HALF
            </FaceText>
          </g>
          <Solid paths={fill.spout} tone="mid" crease="none" />
          {/* Link rods from the handle to both tap wheels. */}
          <path className="iso-line st-link-rod" data-tone="hi" d={links.fill} />
          {/* Drain pipe, tap and basin. */}
          {drain.run.map((p, i) => (
            <Solid key={i} paths={p} tone="mid" crease="lo" />
          ))}
          <path className="iso-line st-link-rod" data-tone="hi" d={links.drain} />
          <Tap t={drain.tap} />
          <path className="st-arm" d={drain.tagArm} />
          <path className="st-plate" d={drain.tag} />
          <g className="st-label">
            <FaceText transform={drain.tagText} size={5} tone="hi" anchor="middle">
              DRAIN
            </FaceText>
          </g>
          <Dots points={links.joints} size={0.9} tone="hi" />
          <g data-box="basin">
            <g data-box-water="basin" />
          </g>
          <Solid paths={drain.elbow} tone="mid" crease="none" />
          <Stream id="drain" />
          <g className="an-glass">
            <Solid paths={drain.basin} tone="mid" crease="lo" />
          </g>
        </g>
        <Sparks points={contacts.length} />
      </g>
    </StLive>
  );
}
