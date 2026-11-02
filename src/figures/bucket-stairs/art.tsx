import { Dots, FaceText, Line, Solid } from "../../iso/react/draw";
import { Sparks } from "../../iso/react/reel";
import {
  board,
  BRAND_SIZE,
  buckets,
  building,
  circuit,
  contacts,
  COPY_DX,
  copings,
  ctank,
  drain,
  ENGRAVE,
  ENGRAVE_SIZE,
  floorLines,
  floors,
  lever,
  nmos,
  pmos,
  spouts,
  stairs,
  tankRimGlow,
} from "./geometry";
import { BRAND, FLOORS, GRAPH } from "./model";
import { BsLive } from "./live";

// Vout graph (circuit only, left of the counter card): y axis 0 to 1.0 V with four ticks, x axis time, the VDD line,
// the live trace, and the faint ghost building beside it (42.3).
function VoutGraph() {
  const g = GRAPH;
  const ticks = Array.from({ length: FLOORS }, (_, k) => g.yOf(k + 1));
  return (
    <div className="bs-graph" data-graph="" style={{ display: "none" }}>
      <div className="bs-graph-head">
        <span className="bs-graph-name">Vout</span>
        <span className="bs-graph-value" data-graph-value="">
          0.0 V
        </span>
      </div>
      <svg viewBox={`0 0 ${g.w} ${g.h}`} width={g.w} height={g.h} aria-hidden="true">
        <path className="bs-graph-grid" d={ticks.map((y) => `M${g.left},${y.toFixed(1)}H${g.right}`).join("")} />
        <path className="bs-graph-axis" d={`M${g.left},${g.top - 6}V${g.bottom}H${g.right}`} />
        {ticks.map((y, k) => (
          <path key={k} className="bs-graph-tick" data-gtick={k} d={`M${g.left - 6},${y.toFixed(1)}H${g.left}`} />
        ))}
        <text x={g.left - 9} y={g.yOf(4) + 4} textAnchor="end">
          1.0 V
        </text>
        <text x={g.left - 9} y={g.yOf(2) + 4} textAnchor="end">
          0.5 V
        </text>
        <text x={g.left - 9} y={g.bottom + 4} textAnchor="end">
          0
        </text>
        <text x={g.right} y={g.bottom + 15} textAnchor="end">
          time
        </text>
        <g data-gghost="" style={{ display: "none" }}>
          <path className="bs-graph-ghost" d={g.ghost} />
        </g>
        <path className="bs-graph-vdd" data-graph-vdd="" d="" />
        <text className="bs-graph-vddname" data-graph-vddname="" x={g.right - 2} y={0} textAnchor="end">
          VDD
        </text>
        <path className="bs-graph-trace" data-graph-trace="" d="" />
        <path className="bs-graph-step" data-graph-step="" d="" style={{ display: "none" }} />
      </svg>
    </div>
  );
}

// Readout below the board: the counter card (title, up to two counters, each with a small header and a line), with the
// Vout graph on its left in the circuit.
export function BsReadout() {
  const col = (n: 1 | 2) => (
    <div className="bs-col" data-col={n} style={n === 2 ? { display: "none" } : undefined}>
      <div className="bs-head" data-head="">
        &nbsp;
      </div>
      <div className="bs-counter" data-val="">
        0
      </div>
      <div className="bs-line" data-line="">
        &nbsp;
      </div>
    </div>
  );
  return (
    <div className="bs-below" data-mode="floors">
      <VoutGraph />
      <div className="bs-readout">
        <div className="bs-title" data-title="">
          FLOORS CLIMBED
          <br />= EFFORT
        </div>
        <div className="bs-cols">
          {col(1)}
          {col(2)}
        </div>
      </div>
    </div>
  );
}

// Sam: flat side profile facing +u (local u forward, v down, feet at 0), sepia ink; head can look up; carried bucket.
function Sam() {
  return (
    <g className="bs-sam" data-sam="">
      <path className="bs-sam-shadow" data-sam-shadow="" />
      <g data-sam-m="">
        <path className="bs-sam-leg bs-sam-back" d="M-0.4 -7.4L-1.6 -0.6" />
        <path className="bs-sam-shoe bs-sam-back" d="M-2.6 -0.2L-0.4 -0.2" />
        <path className="bs-sam-arm bs-sam-back" d="M-0.6 -12.6L-2.2 -8.6" />
        <path className="bs-sam-shirt" d="M-2.3 -7.2C-2.5 -9.6 -2.4 -12.2 -1.4 -13.3C-0.6 -13.9 0.9 -13.9 1.6 -13.2C2.4 -12.2 2.5 -9.6 2.3 -7.2Z" />
        <path className="bs-sam-leg" d="M0.7 -7.4L1.7 -0.6" />
        <path className="bs-sam-shoe" d="M0.8 -0.2L3.6 -0.2" />
        <g data-carry="" style={{ display: "none" }}>
          <path className="bs-carry" d="M2.2 -8.4L6.6 -8.4L6 -4.2L2.8 -4.2Z" />
          <ellipse className="bs-carry-water" cx="4.4" cy="-8.4" rx="2.1" ry="0.65" />
          <path className="bs-carry-bail" d="M2.2 -8.4Q4.4 -11.8 6.6 -8.4" />
        </g>
        <path className="bs-sam-arm" d="M0.4 -12.5L2.6 -9.4L3.6 -10.8" />
        <circle className="bs-sam-skin" cx="3.7" cy="-11" r="0.75" />
        <g data-head="">
          <circle className="bs-sam-skin" cx="0.5" cy="-16.2" r="2.5" />
          <path className="bs-sam-skin" d="M2.9 -16.2L3.6 -15.4L2.9 -15.1" />
          <path className="bs-sam-hair" d="M-2.1 -15.6C-2.5 -17.6 -1.2 -19.1 0.6 -19.1C2.1 -19.1 3.1 -18.3 3.2 -17.1C2 -17.5 0.6 -17.3 -0.4 -16.3C-0.8 -15.6 -1.3 -15.2 -2.1 -15.6Z" />
          <circle className="bs-sam-eye" cx="1.8" cy="-16.5" r="0.32" />
          <path className="bs-sam-smile" d="M1.6 -14.9C2.1 -14.6 2.6 -14.7 2.9 -15" />
        </g>
      </g>
    </g>
  );
}


const Strap = ({ id, d, rev }: { id: string; d: string; rev?: string }) => (
  <g className="bs-strap-g" data-strap={id} data-dir="fwd">
    <path className="bs-strap" d={d} />
    <path className="bs-flow" data-flow-dir="fwd" d={d} />
    {rev ? <path className="bs-flow" data-flow-dir="rev" d={rev} /> : null}
  </g>
);

// Valve block (DE style): control pin with cap and arm, bubble on the PMOS pin, tinted body, gate bar, one label.
type ValveParts = typeof pmos;
const Valve = ({ id, v, name }: { id: "p" | "n"; v: ValveParts; name: string }) => (
  <g className="bs-valve" data-valve={id}>
    <Solid paths={v.pin} tone="mid" crease="none" />
    <Solid paths={v.arm} tone="mid" crease="none" />
    <Solid paths={v.cap} tone="hi" crease="lo" />
    {v.bubble ? <Line d={v.bubble} tone="hi" /> : null}
    <g className="bs-vbody">
      <Solid paths={v.body} tone="mid" />
    </g>
    <g className="bs-vgate">
      <Solid paths={v.gate} tone="hi" crease="none" />
    </g>
    <Dots points={v.contacts} size={0.5} />
    <g className="bs-vname">
      <FaceText transform={v.name} size={5.4} tone="hi">
        {name}
      </FaceText>
    </g>
    <path className="bs-vglow" data-valve-glow={id} d={v.glow} style={hidden} />
  </g>
);
type Floor = (typeof floors)[number];
const FloorWalls = ({ f }: { f: Floor }) => (
  <g>
    <g className="bs-building">
      <Solid paths={f.body} tone="mid" crease="lo" />
    </g>
    {f.slab ? <path className="bs-slab" d={f.slab} /> : null}
    {f.sideSlab ? <path className="bs-slab-side" d={f.sideSlab} /> : null}
    <Solid paths={f.sill} tone="mid" crease="none" />
    <path className="bs-frame" d={f.frame} />
    <path className="bs-wglass" d={f.glass} />
    <path className="bs-mullion" d={f.mullions} />
    <path className="bs-wshine" d={f.shine} />
  </g>
);
const Coping = ({ c }: { c: typeof copings.high }) => (
  <g>
    <g className="bs-coping">
      <Solid paths={c.solid} tone="hi" crease="none" />
    </g>
    <path className="bs-roof" d={c.roof} />
  </g>
);
type Flight = (typeof stairs)[number];
const FlightArt = ({ f, k }: { f: Flight; k: number }) => (
  <g className="bs-flight">
    {f.columns.map((c, i) => (
      <g key={`c${i}`} className="bs-column">
        <Solid paths={c} tone="hi" crease="none" />
      </g>
    ))}
    {f.steps.map((s, i) => (
      <Solid key={i} paths={s} tone="mid" crease="lo" />
    ))}
    <Solid paths={f.landing} tone="mid" crease="lo" />
    <path className="bs-post" d={f.posts} />
    <path className="bs-rail" d={f.rail} />
  </g>
);
const Spout = ({ s }: { s: typeof spouts.high }) => (
  <g>
    <Solid paths={s.mount} tone="hi" crease="none" />
    <Solid paths={s.drop} tone="mid" crease="none" />
    <Solid paths={s.run} tone="mid" crease="lo" />
  </g>
);
const hidden = { display: "none" } as const;
const Label = ({ id, transform, size = 5 }: { id: string; transform: string; size?: number }) => (
  <g className="bs-label bs-tlabel">
    <FaceText transform={transform} size={size} tone="hi" anchor="middle">
      <tspan data-text={id}>&nbsp;</tspan>
    </FaceText>
  </g>
);

// Static art. Base (rises): board, engraving, the circuit's flat wiring. Parts (fall): building, stairs, tank, Sam,
// buckets; then the circuit parts (hidden until the fold). The loop writes the states.
export function BsArt() {
  return (
    <BsLive>
      <g data-entry="">
        <g data-base="">
          <path className="iso-halo" data-board-halo="" d={board.halo} />
          <g data-board-slab="">
            <Solid paths={board.slab} tone="mid" />
          </g>
          <path className="iso-line" data-tone="lo" data-board-groove="" d={board.groove} />
          <g data-board-screws="">
            <Dots points={board.screws} size={0.5} />
          </g>
          <g className="bs-engrave" data-engrave="">
            <FaceText transform={board.engraveAt} size={ENGRAVE_SIZE} tone="mid" anchor="middle">
              {ENGRAVE}
            </FaceText>
          </g>
          {/* Circuit, flat on the board (DE style): VDD rail at the back, GND rail at the front, straps, input wires. */}
          <g data-c="rails" style={hidden}>
            <g className="rail" data-rail="vdd" data-vdd-rail="">
              <Solid paths={circuit.vdd} tone="hi" crease="lo" />
            </g>
            <g className="rail" data-rail="gnd">
              <Solid paths={circuit.gnd} tone="hi" crease="lo" />
            </g>
            <g className="rail-name" data-rail="vdd">
              <FaceText transform={circuit.vddLabel} size={5.4} tone="hi">
                VDD
              </FaceText>
            </g>
            <g className="rail-name" data-rail="gnd">
              <FaceText transform={circuit.gndLabel} size={5.4} tone="hi">
                GND
              </FaceText>
            </g>
            <path className="bs-glow" data-pulse="rail" d={circuit.railGlow} style={hidden} />
          </g>
          <g data-c="wire" style={hidden}>
            <path className="bs-pad" d={circuit.pad} />
            <Solid paths={circuit.busBar} tone="hi" crease="lo" />
            <Strap id="bus" d={circuit.bus} rev={circuit.busRev} />
            <path className="bs-wire-flash" data-wire-flash="" d={circuit.wireFlash} style={hidden} />
          </g>
          <g data-c="p" style={hidden}>
            <Strap id="vddp" d={circuit.vddp} />
            <Strap id="pbus" d={circuit.pbus} />
          </g>
          <g data-c="n" style={hidden}>
            <Strap id="busn" d={circuit.busn} />
            <Strap id="ngnd" d={circuit.ngnd} />
          </g>
          <g data-c="lever" style={hidden}>
            <path className="iso-line bs-gate-wire" data-tone="mid" d={circuit.vin} />
            <Dots points={[circuit.vinJunction]} size={1.1} tone="mid" />
            <g className="bs-bit" data-bit="1">
              <FaceText transform={circuit.bit1} size={6} tone="hi">
                1
              </FaceText>
            </g>
            <g className="bs-bit" data-bit="0">
              <FaceText transform={circuit.bit0} size={6} tone="hi">
                0
              </FaceText>
            </g>
          </g>
        </g>
        <g data-parts="">
          {/* Building walls (melt into the small ghost in the fold). */}
          <g data-melt="">
            <g data-walls="">
              <FloorWalls f={floors[0]} />
              <path className="bs-plinth" d={building.plinth} />
              <path className="bs-door" d={building.door} />
              <path className="bs-door-panel" d={building.doorPanel} />
              <Dots points={[building.knob]} size={0.5} tone="hi" />
              <Solid paths={building.step} tone="mid" crease="none" />
              <path className="bs-plate" d={building.plate} />
              <Dots points={building.plateRivets} size={0.35} tone="hi" />
              <g className="bs-brand">
                <FaceText transform={building.brandAt} size={BRAND_SIZE} tone="hi" anchor="middle">
                  {BRAND}
                </FaceText>
              </g>
              <FloorWalls f={floors[1]} />
              <g data-roof-low="" style={hidden}>
                <Coping c={copings.low} />
              </g>
              <g data-upper-walls="">
                <FloorWalls f={floors[2]} />
                <FloorWalls f={floors[3]} />
                <Coping c={copings.high} />
              </g>
            </g>
            <path className="bs-glow" data-pulse="building" d={building.glow} style={hidden} />
          </g>

          {/* Glass tank (water, then glass, dashed full mark), its spouts and the drain tap. */}
          <g data-afade="">
            <g data-tank="main">
              <g data-water="" />
              <g data-glass="" />
              <path className="bs-full-mark" data-full-mark="" style={hidden} />
            </g>
            <path className="bs-glow" data-pulse="roof" d={tankRimGlow + building.roofGlow} style={hidden} />
          </g>
          <g data-melt="">
            <g data-spout-low="" style={hidden}>
              <Spout s={spouts.low} />
            </g>
          </g>
          <g data-afade="">
            <Solid paths={drain.pipe} tone="mid" crease="lo" />
            <Solid paths={drain.nozzle} tone="mid" crease="none" />
            <g className="bs-tap">
              <Solid paths={drain.body} tone="hi" crease="lo" />
              <Solid paths={drain.stem} tone="hi" crease="none" />
              <Solid paths={drain.wheel} tone="hi" crease="lo" />
              <path className="an-spoke bs-handle" d={drain.handle} />
            </g>
            <g data-drain="" style={hidden}>
              <path className="bs-puddle" d={drain.puddle} />
              <path className="bs-stream" d={drain.stream} />
            </g>
          </g>

          {/* Outside stairs: flights 1-2, then 3-4 with the high spout (slide/fade with the upper floors). */}
          <g data-melt="">
            <FlightArt f={stairs[0]} k={0} />
            <FlightArt f={stairs[1]} k={1} />
            <g data-upper-stairs="">
              <FlightArt f={stairs[2]} k={2} />
              <FlightArt f={stairs[3]} k={3} />
              <Spout s={spouts.high} />
            </g>
          </g>
          <g data-afade="">
            <g data-floor-lines="">
              {floorLines.map((d, k) => (
                <path key={k} className="bs-floor-line" data-floor-line={k} d={d} style={hidden} />
              ))}
            </g>
            <path className="bs-pour" data-pour="" />
          </g>

          {/* Sam, then the buckets. */}
          <Sam />
          {buckets.map((b, i) => (
            <g key={i} className="bs-bucket" data-bucket={i}>
              <Solid paths={b.body} tone="mid" crease="lo" />
              <path className="bs-hoop" d={b.hoop} />
              <path className="bs-bucket-rim" d={b.rim} />
              <path className="bs-water" d={b.water} />
              <path className="bs-water-ripple" d={b.ripple} />
              <path className="bs-bail" d={b.bail} />
              <Dots points={b.ears} size={0.45} tone="hi" />
            </g>
          ))}

          {/* ---------- Circuit parts (DE style), back to front: VDD tag, PMOS, output tag, tanks, NMOS, lever. ---------- */}
          <g data-c="vtag" style={hidden}>
            <g className="bs-vtag">
              <Solid paths={circuit.tag} tone="hi" crease="lo" />
            </g>
            <g className="bs-tag-text">
              <FaceText transform={circuit.tagText} size={4.4} tone="hi" anchor="middle">
                <tspan data-text="vdd">VDD 1.0 V</tspan>
              </FaceText>
            </g>
            <path className="bs-glow" data-pulse="vtag" d={circuit.tagGlow} style={hidden} />
          </g>
          <g data-c="p2" style={hidden}>
            <Valve id="p" v={pmos} name="PMOS" />
          </g>
          <g data-c="tag" style={hidden}>
            <Solid paths={circuit.outTag} tone="hi" crease="lo" />
            <g className="bs-tag-text">
              <FaceText transform={circuit.outText} size={4.2} tone="hi" anchor="middle">
                <tspan data-text="out">OUT 1</tspan>
              </FaceText>
            </g>
          </g>
          {(["live", "copy"] as const).map((id) => (
            <g key={id} data-ctank={id} style={hidden}>
              <Solid paths={ctank.base} tone="mid" />
              <g className="bs-fluid" data-cfluid="" />
              {id === "live" ? <g className="bs-fluid bs-fluid-blue" data-water-ghost="" style={hidden} /> : null}
              <g className="bs-shell">
                <Solid paths={ctank.shell} tone="hi" crease="none" inner={<Line d={ctank.rings} tone="mid" />} />
              </g>
              <g className="bs-label">
                {ctank.marks.map((mk) => (
                  <FaceText key={mk.n} transform={mk.at} size={4.4} tone="hi" anchor="middle">
                    {mk.n}
                  </FaceText>
                ))}
                <FaceText transform={ctank.cAt} size={6.4} tone="hi" anchor="middle">
                  C
                </FaceText>
              </g>
              <Solid paths={ctank.lid} tone="mid" />
              {id === "live" ? <path className="bs-glow" data-pulse="tank" d={ctank.glow} style={hidden} /> : null}
              {id === "live" ? <path className="bs-ghost bs-ghost-blue" data-water-ghost-line="" d={ctank.ghost} style={hidden} /> : null}
            </g>
          ))}
          <path className="bs-level-line" data-level-line="" d="" style={hidden} />
          <g data-c="copy-label" style={hidden}>
            <Label id="copy0" transform={ctank.label(0, COPY_DX)} />
            <Label id="copy1" transform={ctank.label(1, COPY_DX)} />
          </g>
          <g data-c="live-label" style={hidden}>
            <Label id="live0" transform={ctank.label(0)} />
            <Label id="live1" transform={ctank.label(1)} />
          </g>
          <g data-c="n2" style={hidden}>
            <Valve id="n" v={nmos} name="NMOS" />
          </g>
          <g data-c="lever2" style={hidden}>
            <Solid paths={lever.base} tone="mid" />
            <Line d={lever.slot} tone="lo" />
            <Solid paths={lever.pivot} tone="mid" />
            <path className="iso-line bs-rod" data-tone="hi" data-lever-rod="" d="" />
            <g data-lever-knob="">
              <Solid paths={lever.knob} tone="hi" crease="lo" />
            </g>
          </g>

          {/* Through-current stream, packets of charge, puffs. */}
          <path className="bs-through" data-through="" d={circuit.stream} style={hidden} />
          <g data-drops="" />
          <g data-puffs="" />
        </g>
        <Sparks points={contacts.length} />
      </g>
    </BsLive>
  );
}
