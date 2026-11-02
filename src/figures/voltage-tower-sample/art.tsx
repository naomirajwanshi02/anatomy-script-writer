import { Dots, FaceText, Line, Solid } from "../../iso/react/draw";
import { Sparks } from "../../iso/react/reel";
import { board, BOXES, BRAND_SIZE, clock, contacts, drain, ENGRAVE, ENGRAVE_SIZE, fill, riser, sump, tank, tower } from "./geometry";
import { BRAND, lit, MARKS } from "./model";
import { VtLive } from "./live";

type TapParts = typeof fill.tap;
const Tap = ({ t }: { t: TapParts }) => (
  <g className="vt-tap">
    <Solid paths={t.body} tone="hi" crease="lo" />
    <Solid paths={t.stem} tone="hi" crease="none" />
    <Solid paths={t.wheel} tone="hi" crease="lo" />
    <path className="an-spoke vt-handle" d={t.handle} />
  </g>
);

// Readout below the board: "pumping per tick", a 4 x 4 grid of squares (litres across, height up), none lit yet.
const N = MARKS;
// Units are full-frame px (the svg is drawn at its viewBox width): squares 64 px.
const C = { cell: 64, gap: 8, l: 74, t: 6, r: 6, b: 70 };
const span = N * C.cell + (N - 1) * C.gap;
const W = C.l + span + C.r;
const H = C.t + span + C.b;
const cx = (i: number) => C.l + i * (C.cell + C.gap);
const cy = (h: number) => C.t + (N - h) * (C.cell + C.gap);
export function VtReadout() {
  return (
    <div className="vt-readout">
      <div className="vt-title">
        PUMPING
        <br />
        PER TICK
      </div>
      <svg className="vt-grid" viewBox={`0 0 ${W} ${H}`} style={{ width: `calc(var(--fw) * ${(W / 1080).toFixed(4)})` }} aria-hidden="true">
        {Array.from({ length: N }, (_, h) =>
          Array.from({ length: N }, (_, i) => (
            <rect key={`${h}-${i}`} className="vt-cell" data-on={lit(i + 1, h + 1) ? "1" : "0"} x={cx(i)} y={cy(h + 1)} width={C.cell} height={C.cell} rx="6" />
          )),
        )}
        {Array.from({ length: N }, (_, i) => (
          <text key={`c${i}`} x={cx(i) + C.cell / 2} y={C.t + span + 32} textAnchor="middle">
            {i + 1}
          </text>
        ))}
        {Array.from({ length: N }, (_, h) => (
          <text key={`r${h}`} x={C.l - 12} y={cy(h + 1) + C.cell / 2 + 9} textAnchor="end">
            {h + 1}
          </text>
        ))}
        <text className="vt-axis-name" x={C.l + span / 2} y={H - 8} textAnchor="middle">
          litres
        </text>
        <text className="vt-axis-name" transform={`translate(22 ${C.t + span / 2}) rotate(-90)`} textAnchor="middle">
          height
        </text>
      </svg>
    </div>
  );
}

// Static art: board with engraving (rise); tower, sump, pump, pipes, taps, tank and clock (fall).
export function VtArt() {
  return (
    <VtLive>
      <g data-entry="">
        <g data-base="">
          <path className="iso-halo" d={board.halo} />
          <Solid paths={board.slab} tone="mid" />
          <Line d={board.groove} tone="lo" />
          <Dots points={board.screws} size={0.5} />
          <g className="vt-engrave">
            <FaceText transform={board.engraveAt} size={ENGRAVE_SIZE} tone="mid" anchor="middle">
              {ENGRAVE}
            </FaceText>
          </g>
        </g>
        <g data-parts="">
          {/* Water tower: plinth with maker's plate, telescopic stand with marks, ladder, trough. */}
          <Solid paths={tower.plinth} tone="mid" />
          <path className="vt-plate" d={tower.plate} />
          <Dots points={tower.plateRivets} size={0.4} tone="hi" />
          <g className="vt-brand">
            <FaceText transform={tower.brandAt} size={BRAND_SIZE} tone="hi" anchor="middle">
              {BRAND}
            </FaceText>
          </g>
          {tower.sections.map((p, i) => (
            <g key={i}>
              <Solid paths={p} tone="mid" crease="lo" />
              <Solid paths={tower.collars[i]} tone="hi" crease="none" />
            </g>
          ))}
          <g className="vt-label">
            {tower.marks.map((m) => (
              <FaceText key={m.n} transform={m.at} size={4.4} tone="hi" anchor="middle">
                {m.n}
              </FaceText>
            ))}
          </g>
          <path className="vt-ladder" d={tower.ladderArms} />
          <path className="vt-ladder" d={tower.ladder} />
          <path className="vt-rung" d={tower.rungs} />
          <path className="vt-ladder" d={tower.struts} />
          <Solid paths={tower.floor} tone="hi" crease="none" />
          <g data-box="trough">
            <g data-box-water="trough" transform={BOXES.trough.shift} />
          </g>
          <Solid paths={riser.spout} tone="mid" crease="none" />
          <g className="an-glass">
            <Solid paths={tower.trough} tone="mid" crease="lo" />
          </g>
          <path className="vt-rim" d={tower.rim} />
          <Solid paths={riser.run} tone="mid" crease="lo" />
          {/* Glass tank (empty) with marks 1-4. */}
          <path className="vt-glass-back" d={tank.back} />
          <g className="an-glass vt-glass">
            <Solid paths={tank.glass} tone="mid" crease="lo" />
          </g>
          <path className="vt-shine" d={tank.shine} />
          <path className="vt-tick" d={tank.ticks} />
          <g className="vt-label">
            {tank.marks.map((m) => (
              <FaceText key={m.n} transform={m.at} size={4.4} tone="hi" anchor="middle">
                {m.n}
              </FaceText>
            ))}
          </g>
          {/* Top pipe and tap, from the trough into the tank's top. */}
          {fill.run.map((p, i) => (
            <Solid key={i} paths={p} tone="mid" crease="lo" />
          ))}
          <Solid paths={fill.spout} tone="mid" crease="none" />
          <Tap t={fill.tap} />
          {/* Sump basin with the pump box standing in it. */}
          <g data-box="sump">
            <g data-box-water="sump" />
          </g>
          <Solid paths={sump.pump} tone="mid" crease="lo" />
          <path className="vt-fin" d={sump.fins} />
          <Solid paths={sump.motor} tone="hi" crease="lo" />
          <g className="an-glass">
            <Solid paths={sump.basin} tone="mid" crease="lo" />
          </g>
          {/* Bottom tap and drain pipe back to the sump. */}
          {drain.out.map((p, i) => (
            <Solid key={i} paths={p} tone="mid" crease="lo" />
          ))}
          <Tap t={drain.tap} />
          <Solid paths={drain.run} tone="mid" crease="lo" />
          <Solid paths={drain.spout} tone="mid" crease="none" />
          {/* Riser from the pump up to the trough. */}
          <Solid paths={riser.up} tone="mid" crease="lo" />
          {/* Clock dial on its plate. */}
          <Solid paths={clock.foot} tone="mid" />
          <Solid paths={clock.plate} tone="mid" crease="lo" />
          <path className="vt-bezel" d={clock.bezel} />
          <path className="vt-dial" d={clock.dial} />
          <path className="vt-dial-tick" d={clock.ticks} />
          <path className="vt-hand" d={clock.hand} />
          <Dots points={[clock.hub]} size={1} tone="hi" />
        </g>
        <Sparks points={contacts.length} />
      </g>
    </VtLive>
  );
}
