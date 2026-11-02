import { Dots, FaceText, Line, Solid } from "../../iso/react/draw";
import { Sparks } from "../../iso/react/reel";
import { board, BRAND_SIZE, buckets, building, columns, contacts, drain, ENGRAVE, ENGRAVE_SIZE, MARK_SIZE, samMatrix, samShadow, spout, stairs, tank } from "./geometry";
import { BRAND, CLIMBED } from "./model";
import { BsLive } from "./live";

// Readout below the board: "FLOORS CLIMBED = EFFORT" with one big counter.
export function BsReadout() {
  return (
    <div className="bs-readout">
      <div className="bs-title">
        FLOORS CLIMBED
        <br />= EFFORT
      </div>
      <div className="bs-counter">{CLIMBED}</div>
    </div>
  );
}

// Sam: flat side profile facing right (local u right, v down, feet at 0), sepia ink.
function Sam() {
  return (
    <g className="bs-sam">
      <path className="bs-sam-shadow" d={samShadow} />
      <g transform={samMatrix}>
        <path className="bs-sam-leg bs-sam-back" d="M-0.4 -7.4L-1.6 -0.6" />
        <path className="bs-sam-shoe bs-sam-back" d="M-2.6 -0.2L-0.4 -0.2" />
        <path className="bs-sam-arm bs-sam-back" d="M-0.6 -12.6L-2.2 -8.6" />
        <path className="bs-sam-shirt" d="M-2.3 -7.2C-2.5 -9.6 -2.4 -12.2 -1.4 -13.3C-0.6 -13.9 0.9 -13.9 1.6 -13.2C2.4 -12.2 2.5 -9.6 2.3 -7.2Z" />
        <path className="bs-sam-leg" d="M0.7 -7.4L1.7 -0.6" />
        <path className="bs-sam-shoe" d="M0.8 -0.2L3.6 -0.2" />
        <path className="bs-sam-arm" d="M0.4 -12.5L2.6 -9.4L3.6 -10.8" />
        <circle className="bs-sam-skin" cx="3.7" cy="-11" r="0.75" />
        <circle className="bs-sam-skin" cx="0.5" cy="-16.2" r="2.5" />
        <path className="bs-sam-skin" d="M2.9 -16.2L3.6 -15.4L2.9 -15.1" />
        <path className="bs-sam-hair" d="M-2.1 -15.6C-2.5 -17.6 -1.2 -19.1 0.6 -19.1C2.1 -19.1 3.1 -18.3 3.2 -17.1C2 -17.5 0.6 -17.3 -0.4 -16.3C-0.8 -15.6 -1.3 -15.2 -2.1 -15.6Z" />
        <circle className="bs-sam-eye" cx="1.8" cy="-16.5" r="0.32" />
        <path className="bs-sam-smile" d="M1.6 -14.9C2.1 -14.6 2.6 -14.7 2.9 -15" />
      </g>
    </g>
  );
}

// Static art: board with engraving (rise); building with stairs, tank, spout, tap, Sam and the buckets (fall).
export function BsArt() {
  return (
    <BsLive>
      <g data-entry="">
        <g data-base="">
          <path className="iso-halo" d={board.halo} />
          <Solid paths={board.slab} tone="mid" />
          <Line d={board.groove} tone="lo" />
          <Dots points={board.screws} size={0.5} />
          <g className="bs-engrave">
            <FaceText transform={board.engraveAt} size={ENGRAVE_SIZE} tone="mid" anchor="middle">
              {ENGRAVE}
            </FaceText>
          </g>
        </g>
        <g data-parts="">
          {/* Building: body, coping, roof, plinth, slab lines, window bands, door, name plate. */}
          <g className="bs-building">
            <Solid paths={building.body} tone="mid" crease="lo" />
          </g>
          <path className="bs-slab-side" d={building.sideSlabs} />
          <g className="bs-coping">
            <Solid paths={building.coping} tone="hi" crease="none" />
          </g>
          <path className="bs-roof" d={building.roof} />
          <path className="bs-plinth" d={building.plinth} />
          <path className="bs-slab" d={building.slabs} />
          {building.bands.map((b, i) => (
            <g key={i}>
              <Solid paths={b.sill} tone="mid" crease="none" />
              <path className="bs-frame" d={b.frame} />
              <path className="bs-wglass" d={b.glass} />
              <path className="bs-mullion" d={b.mullions} />
              <path className="bs-wshine" d={b.shine} />
            </g>
          ))}
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
          {/* Glass tank (empty), marks 1-4 level with the floors. */}
          <path className="bs-glass-back" d={tank.back} />
          <g className="an-glass bs-glass">
            <Solid paths={tank.glass} tone="mid" crease="lo" />
          </g>
          <path className="bs-rim" d={tank.rim} />
          <path className="bs-shine" d={tank.shine} />
          <path className="bs-tick" d={tank.ticks} />
          <g className="bs-label">
            {tank.marks.map((m) => (
              <FaceText key={m.n} transform={m.at} size={MARK_SIZE} tone="hi" anchor="middle">
                {m.n}
              </FaceText>
            ))}
          </g>
          {/* Spout from the roof edge over the rim. */}
          <Solid paths={spout.mount} tone="hi" crease="none" />
          <Solid paths={spout.drop} tone="mid" crease="none" />
          <Solid paths={spout.run} tone="mid" crease="lo" />
          {/* Drain tap at the tank's foot (closed: handle across the pipe). */}
          <Solid paths={drain.pipe} tone="mid" crease="lo" />
          <Solid paths={drain.nozzle} tone="mid" crease="none" />
          <g className="bs-tap">
            <Solid paths={drain.body} tone="hi" crease="lo" />
            <Solid paths={drain.stem} tone="hi" crease="none" />
            <Solid paths={drain.wheel} tone="hi" crease="lo" />
            <path className="an-spoke bs-handle" d={drain.handle} />
          </g>
          {/* Outside stairs: flights and landings bottom to top, columns, handrails. */}
          {columns.map((c, i) => (
            <g key={i} className="bs-column">
              <Solid paths={c} tone="hi" crease="none" />
            </g>
          ))}
          {stairs.map((f, k) => (
            <g key={k} className="bs-flight">
              {f.steps.map((s, i) => (
                <Solid key={i} paths={s} tone="mid" crease="lo" />
              ))}
              <Solid paths={f.landing} tone="mid" crease="lo" />
              <path className="bs-post" d={f.posts} />
              <path className="bs-rail" d={f.rail} />
            </g>
          ))}
          {/* Sam at the stair foot, then the row of four buckets of blue water. */}
          <Sam />
          {buckets.map((b, i) => (
            <g key={i} className="bs-bucket">
              <Solid paths={b.body} tone="mid" crease="lo" />
              <path className="bs-hoop" d={b.hoop} />
              <path className="bs-bucket-rim" d={b.rim} />
              <path className="bs-water" d={b.water} />
              <path className="bs-water-ripple" d={b.ripple} />
              <path className="bs-bail" d={b.bail} />
              <Dots points={b.ears} size={0.45} tone="hi" />
            </g>
          ))}
        </g>
        <Sparks points={contacts.length} />
      </g>
    </BsLive>
  );
}
