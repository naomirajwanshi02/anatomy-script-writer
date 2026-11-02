import { Dots, FaceText, Line, Solid } from "../../iso/react/draw";
import { Sparks } from "../../iso/react/reel";
import { boardAt, BRAND_SIZE, circuit, clock, contacts, drain, ENGRAVE, ENGRAVE_SIZE, fill, ghosts, lever, levelLine, riser, sump, tank, taps, tower, valves } from "./geometry";
import { BRAND, MARKS } from "./model";
import { VtLive } from "./live";

const board0 = boardAt(0);

type TapParts = typeof taps.top;
const Tap = ({ id, t }: { id: keyof typeof taps; t: TapParts }) => (
  <g className="vt-tap">
    <Solid paths={t.body} tone="hi" crease="lo" />
    <Solid paths={t.stem} tone="hi" crease="none" />
    <Solid paths={t.wheel} tone="hi" crease="lo" />
    <path className="an-spoke vt-handle" data-tap-bar={id} d={t.bar(0)} />
  </g>
);

const Valve = ({ id }: { id: "p" | "n" }) => (
  <g className="vt-valve" data-valve={id} data-open="0" data-flash="0">
    <Solid paths={valves[id].arm} tone="mid" crease="none" />
    <g className="vt-vbody">
      <Solid paths={valves[id].body} tone="mid" />
    </g>
    <g className="vt-vgate">
      <Solid paths={valves[id].gate} tone="hi" crease="none" />
    </g>
    <path className="vt-vglow" data-valve-glow={id} d={valves[id].glow} />
  </g>
);

const Strap = ({ id, d, rev }: { id: string; d: string; rev?: string }) => (
  <g className="vt-strap-g" data-strap={id} data-dir="fwd">
    <path className="vt-strap" d={d} />
    <path className="vt-flow" data-flow-dir="fwd" d={d} />
    {rev ? <path className="vt-flow" data-flow-dir="rev" d={rev} /> : null}
  </g>
);

const Stream = ({ id, d = "" }: { id: string; d?: string }) => (
  <g className="vt-stream" data-stream={id}>
    <path className="vt-column" d={d} />
    <path className="an-drops vt-drops" d={d} />
  </g>
);

// Readout below the board: titled card with a 4 x 4 grid (analogy: litres x height; circuit: charge x voltage).
const N = MARKS;
// Units are full-frame px (the svg is drawn at its viewBox width): squares 64 px.
const G = { cell: 64, gap: 8, l: 74, t: 6, r: 6, b: 70 };
const span = N * G.cell + (N - 1) * G.gap;
const W = G.l + span + G.r;
const H = G.t + span + G.b;
const cx = (i: number) => G.l + i * (G.cell + G.gap);
const cy = (h: number) => G.t + (N - h) * (G.cell + G.gap);
export function VtReadout() {
  return (
    <div className="vt-readout" data-readout="">
      <div className="vt-title">
        <span data-scene="w">
          PUMPING
          <br />
          PER TICK
        </span>
        <span data-scene="c">
          ENERGY
          <br />
          PER TICK
        </span>
      </div>
      <svg className="vt-grid" viewBox={`0 0 ${W} ${H}`} style={{ width: `calc(var(--fw) * ${(W / 1080).toFixed(4)})` }} aria-hidden="true">
        {Array.from({ length: N }, (_, h) =>
          Array.from({ length: N }, (_, i) => (
            <rect key={`${h}-${i}`} className="vt-cell" data-cell={h * N + i} data-state="off" x={cx(i)} y={cy(h + 1)} width={G.cell} height={G.cell} rx="6" />
          )),
        )}
        {Array.from({ length: N }, (_, i) => (
          <text key={`c${i}`} x={cx(i) + G.cell / 2} y={G.t + span + 32} textAnchor="middle">
            {i + 1}
          </text>
        ))}
        {Array.from({ length: N }, (_, h) => (
          <text key={`r${h}`} x={G.l - 12} y={cy(h + 1) + G.cell / 2 + 9} textAnchor="end">
            {h + 1}
          </text>
        ))}
        <text className="vt-axis-name" data-scene="w" x={G.l + span / 2} y={H - 8} textAnchor="middle">
          litres
        </text>
        <text className="vt-axis-name" data-scene="c" x={G.l + span / 2} y={H - 8} textAnchor="middle">
          charge
        </text>
        <text className="vt-axis-name" data-scene="w" transform={`translate(22 ${G.t + span / 2}) rotate(-90)`} textAnchor="middle">
          height
        </text>
        <text className="vt-axis-name" data-scene="c" transform={`translate(22 ${G.t + span / 2}) rotate(-90)`} textAnchor="middle">
          voltage
        </text>
      </svg>
    </div>
  );
}

// Static art. Base (rises): board (rebuilt as it stretches), engraving, the circuit's board-level wiring. Parts (fall):
// tower, tank, pipes, taps, sump, clock; valves, lever and tags (circuit only).
export function VtArt() {
  return (
    <VtLive>
      <g data-entry="">
        <g data-base="">
          <path className="iso-halo" data-board-halo="" d={board0.halo} />
          <g data-board-slab="">
            <Solid paths={board0.slab} tone="mid" />
          </g>
          <path className="iso-line" data-tone="lo" data-board-groove="" d={board0.groove} />
          <g data-board-screws="">
            <Dots points={board0.screws} size={0.5} />
          </g>
          <g className="vt-engrave" data-engrave="">
            <FaceText transform={board0.engraveAt} size={ENGRAVE_SIZE} tone="mid" anchor="middle">
              {ENGRAVE}
            </FaceText>
          </g>
          <g className="vt-c">
            {circuit.charge.map((d, i) => (
              <Strap key={`c${i}`} id="charge" d={d} />
            ))}
            {circuit.discharge.map((d, i) => (
              <Strap key={`d${i}`} id="discharge" d={d} />
            ))}
            <Strap id="bus" d={circuit.bus} rev={circuit.busRev} />
            <path className="vt-bus-glow" data-bus-glow="" d={circuit.bus} />
            <Dots points={[circuit.node]} size={1.1} tone="mid" />
            <path className="iso-line vt-gate-wire" data-tone="mid" d={circuit.gate} />
            <path className="iso-line vt-gate-wire" data-tone="mid" d={circuit.clockLink} />
            <Dots points={[circuit.gateJunction]} size={1.1} tone="mid" />
            <g className="rail" data-rail="vdd">
              <Solid paths={circuit.vdd} tone="hi" crease="lo" />
            </g>
            <path className="vt-glow" data-pulse="rail" d={circuit.vddGlow} />
            <g className="rail" data-rail="gnd">
              <Solid paths={circuit.gnd} tone="hi" crease="lo" />
            </g>
            <g className="rail-name" data-rail="vdd">
              <FaceText transform={circuit.vddLabel} size={6} tone="hi">
                VDD
              </FaceText>
            </g>
            <g className="rail-name" data-rail="gnd">
              <FaceText transform={circuit.gndLabel} size={6} tone="hi">
                GND
              </FaceText>
            </g>
            <g className="vt-label">
              <FaceText transform={circuit.pLabel} size={7} tone="hi">
                PMOS
              </FaceText>
              <FaceText transform={circuit.nLabel} size={7} tone="hi">
                NMOS
              </FaceText>
            </g>
          </g>
        </g>
        <g data-parts="">
          {/* Circuit, back: VDD tag, gate pins, PMOS valve. */}
          <g className="vt-c">
            <Solid paths={circuit.tag} tone="hi" crease="lo" />
            <g className="vt-tag-text">
              <FaceText transform={circuit.tagText} size={6} tone="hi" anchor="middle">
                <tspan data-vdd-tag="">1.0 V</tspan>
              </FaceText>
            </g>
            <path className="vt-glow" data-pulse="tag" d={circuit.tagGlow} />
            {circuit.pins.map((p, i) => (
              <g key={i}>
                <Solid paths={p.pin} tone="mid" crease="none" />
                <Solid paths={p.cap} tone="hi" crease="lo" />
              </g>
            ))}
            <Line d={circuit.bubble} tone="hi" />
            <Valve id="p" />
          </g>
          {/* Water tower (slides back and flattens into VDD in the fold). */}
          <g className="vt-w" data-fold="tower">
            <Solid paths={tower.plinth} tone="mid" />
            <path className="vt-plate" d={tower.plate} />
            <Dots points={tower.plateRivets} size={0.4} tone="hi" />
            <g className="vt-brand">
              <FaceText transform={tower.brandAt} size={BRAND_SIZE} tone="hi" anchor="middle">
                {BRAND}
              </FaceText>
            </g>
            <g data-stand="" />
            <g className="vt-label">
              {Array.from({ length: MARKS }, (_, i) => (
                <FaceText key={i} transform="" size={4.4} tone="hi" anchor="middle">
                  <tspan data-mark={i}>{i + 1}</tspan>
                </FaceText>
              ))}
            </g>
            <path className="vt-ladder" data-ladder="rails" d="" />
            <path className="vt-rung" data-ladder="rungs" d="" />
            <g data-upper="">
              <path className="vt-ladder" d={tower.struts} />
              <Solid paths={tower.floor} tone="hi" crease="none" />
              <g data-box-water="trough" />
              <Solid paths={riser.spout} tone="mid" crease="none" />
              <g className="an-glass">
                <Solid paths={tower.trough} tone="mid" crease="lo" />
              </g>
              <path className="vt-rim" d={tower.rim} />
              <path className="vt-glow" data-pulse="tower" d={tower.glow} />
              <Solid paths={riser.run} tone="mid" crease="lo" />
            </g>
          </g>
          {/* Glass tank (shared: the output tank). */}
          <path className="vt-glass-back" d={tank.back} />
          <g data-box-water="tank" />
          <g className="vt-w">
            <Stream id="fill" />
          </g>
          <g className="an-glass vt-glass">
            <Solid paths={tank.glass} tone="mid" crease="lo" />
          </g>
          <path className="vt-shine" d={tank.shine} />
          <path className="vt-tick" d={tank.ticks} />
          <g className="vt-label">
            {tank.marks.map((mk) => (
              <FaceText key={mk.n} transform={mk.at} size={4.4} tone="hi" anchor="middle">
                {mk.n}
              </FaceText>
            ))}
          </g>
          <path className="vt-line" data-tank-line="" d="" />
          <path className="vt-bracket" data-tank-bracket="" d="" />
          <path className="vt-line" data-level-line="" d={levelLine} />
          {/* Top pipe and tap (shift down with the tower). */}
          <g className="vt-w" data-fold="tower">
            <g data-upper="">
              {fill.run.map((p, i) => (
                <Solid key={i} paths={p} tone="mid" crease="lo" />
              ))}
              <Solid paths={fill.spout} tone="mid" crease="none" />
              <g data-on="0" data-flow="fill">
                <path className="an-drops vt-drops" d={fill.flow} />
              </g>
              <Tap id="top" t={taps.top} />
            </g>
          </g>
          {/* Circuit, middle: input lever, output tag, NMOS valve. */}
          <g className="vt-c">
            <Solid paths={lever.base} tone="mid" />
            <Line d={lever.slot} tone="lo" />
            <path className="vt-ltick" d={lever.ticks} />
            <g className="vt-marks">
              <FaceText transform={lever.mark0} size={4.4} tone="lit">
                0
              </FaceText>
              <FaceText transform={lever.mark1} size={4.4} tone="lit">
                1
              </FaceText>
            </g>
            <Solid paths={lever.pivot} tone="mid" />
            <path className="iso-line vt-rod" data-tone="hi" data-lever-rod="" d="" />
            <g data-lever-knob="">
              <Solid paths={lever.knob} tone="hi" crease="lo" />
            </g>
            <Solid paths={circuit.outTag} tone="hi" crease="lo" />
            <g className="vt-tag-text">
              <FaceText transform={circuit.outText} size={4.2} tone="hi" anchor="middle">
                <tspan data-out-tag="">OUT 0</tspan>
              </FaceText>
            </g>
            <Valve id="n" />
          </g>
          {/* Sump with the pump box, bottom tap and drain pipe, riser. */}
          <g className="vt-w" data-fold="sump">
            <g data-box-water="sump" />
          </g>
          <g className="vt-w" data-fold="tower">
            <g data-pump="">
              <Solid paths={sump.pump} tone="mid" crease="lo" />
              <path className="vt-fin" d={sump.fins} />
              <Solid paths={sump.motor} tone="hi" crease="lo" />
            </g>
          </g>
          <g className="vt-w" data-fold="sump">
            <g className="an-glass">
              <Solid paths={sump.basin} tone="mid" crease="lo" />
            </g>
          </g>
          <g className="vt-w">
            {drain.out.map((p, i) => (
              <Solid key={i} paths={p} tone="mid" crease="lo" />
            ))}
            <Tap id="bottom" t={taps.bottom} />
            <Solid paths={drain.run} tone="mid" crease="lo" />
            <Solid paths={drain.spout} tone="mid" crease="none" />
            <g data-on="0" data-flow="drain">
              <path className="an-drops vt-drops" d={drain.flow} />
            </g>
            <Stream id="drain" d={drain.stream} />
          </g>
          <g className="vt-w" data-fold="tower">
            <g data-riser-up="" />
            <g data-on="0" data-flow="riser">
              <path className="an-drops vt-drops" data-riser-flow="" d="" />
            </g>
          </g>
          <g className="vt-w">
            <path className="vt-bracket" data-height-bracket="" d="" />
          </g>
          {/* Clock (slides to the lever in the fold). */}
          <g data-clock="">
            <Solid paths={clock.foot} tone="mid" />
            <Solid paths={clock.plate} tone="mid" crease="lo" />
            <path className="vt-bezel" d={clock.bezel} />
            <path className="vt-dial" d={clock.dial} />
            <path className="vt-dial-tick" d={clock.ticks} />
            <path className="vt-hand" data-hand="" d="" />
            <Dots points={[clock.hub]} size={1} tone="hi" />
            <path className="vt-glow" data-pulse="dial" d={clock.glow} />
          </g>
          {/* Ghosts that melt into their circuit parts on their cue words. */}
          <path className="vt-ghost" data-ghost="tower" d={ghosts.tower} />
          <path className="vt-ghost vt-ghost-blue" data-ghost="tank" d={ghosts.tank} />
          <path className="vt-ghost" data-ghost="top" d={ghosts.top} />
          <path className="vt-ghost" data-ghost="bottom" d={ghosts.bottom} />
          <path className="vt-glow" data-pulse="tank" d={tank.glow} />
        </g>
        <Sparks points={contacts.length} />
      </g>
    </VtLive>
  );
}
