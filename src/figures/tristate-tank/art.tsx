import type { CSSProperties } from "react";
import { FaceText, Solid } from "../../iso/react/draw";
import { Sparks } from "../../iso/react/reel";
import {
  brandAt,
  BRAND_SIZE,
  bus,
  busEnd,
  busText,
  BUS_SIZE,
  chips,
  contacts,
  DATA_SIZE,
  dataText,
  devText,
  DEV_SIZE,
  drainPipes,
  drainTaps,
  ENGRAVE,
  ENGRAVE_SIZE,
  engraveAt,
  enLinks,
  fightWarn,
  fillPipes,
  fillTaps,
  gauges,
  gutter,
  header,
  LABEL_SIZE,
  leverRod,
  knob,
  knobTransform,
  levers,
  METER,
  rails,
  railText,
  RAIL_SIZE,
  risers,
  straps,
  streaks,
  supply,
  tank,
  tankWarn,
} from "./geometry";
import { BRAND, D_CIRCUIT } from "./model";
import { TtLive } from "./live";

const f1 = (v: number) => v.toFixed(1);

// A water run: a soft blue glow along the path while it flows, the kit drops on top.
const Streak = ({ id, d }: { id: string; d: string }) => (
  <g className="tt-streak" data-streak={id} data-on="0">
    <path className="tt-glow" d={d} />
    <path className="an-drops" d={d} />
  </g>
);

// A strap: neutral base trace; while current flows, a solid rust overlay with light rust dashes in the current direction.
const Strap = ({ id, d, rev }: { id: string; d: string; rev?: string }) => (
  <g className="tt-strapg" data-strap={id} data-on="0" data-dir="1">
    <path className="tt-strap" d={d} />
    <path className="tt-strap-on" d={d} />
    <path className="tt-dash" data-way="1" d={d} />
    {rev ? <path className="tt-dash" data-way="-1" d={rev} /> : null}
  </g>
);

// Readout below the board: the three-row table and the tall level meter.
export function TtReadout() {
  const M = METER;
  const y = (v: number) => M.bottom - v * (M.bottom - M.top);
  return (
    <div className="tt-readout">
      <table className="tt-table" aria-label="Driver table">
        <thead>
          <tr>
            <th data-h="0">pair</th>
            <th data-h="1">lock</th>
            <th data-h="2">tap</th>
          </tr>
        </thead>
        <tbody>
          {[0, 1, 2].map((i) => (
            <tr key={i} data-row={i}>
              <td>{i + 1}</td>
              <td data-c="1">off</td>
              <td data-c="2">-</td>
            </tr>
          ))}
        </tbody>
      </table>
      <svg className="tt-meter" viewBox={`0 0 ${M.w} ${M.h}`} aria-hidden="true">
        <text className="tt-meter-title" data-meter-title="" x={M.tubeX + M.tubeW / 2} y={30} textAnchor="middle">
          tank
        </text>
        <rect className="tt-tube-back" x={M.tubeX} y={M.top} width={M.tubeW} height={M.bottom - M.top} rx={6} />
        <rect className="tt-tube-fill" data-meter-fill="" x={M.tubeX} y={y(0.5)} width={M.tubeW} height={y(0) - y(0.5)} />
        <rect className="tt-tube" x={M.tubeX} y={M.top} width={M.tubeW} height={M.bottom - M.top} rx={6} />
        {[
          [1, "full"],
          [0.5, "half"],
          [0, "empty"],
        ].map(([v, s]) => (
          <g key={s as string}>
            <path className="tt-mark" d={`M${M.tubeX - 10} ${y(v as number)}H${M.tubeX}`} />
            <text className="tt-mark-text" x={M.tubeX - 14} y={y(v as number) + 6} textAnchor="end">
              {s as string}
            </text>
          </g>
        ))}
        <text className="tt-meter-value" data-meter-value="" x={M.tubeX + M.tubeW / 2} y={M.h - 4} textAnchor="middle">
          50%
        </text>
      </svg>
    </div>
  );
}

// Static art (start frame); the loop (live.tsx) writes every state from the model.
export function TtArt() {
  return (
    <TtLive>
      <g data-entry="">
        <g data-base="">
          <g data-board="" />
          <g className="tt-engrave">
            <FaceText transform={engraveAt(0)} size={ENGRAVE_SIZE} tone="mid" anchor="middle">
              {ENGRAVE}
            </FaceText>
          </g>
        </g>
        <g data-parts="">
          {/* ---------- Circuit (shown at the fold): rails, straps, bus, chips ---------- */}
          <g data-scene="circuit" style={{ opacity: 0, display: "none" }}>
            <g className="tt-rail" data-rail="vdd">
              <Solid paths={rails.vdd} tone="hi" crease="lo" />
            </g>
            <g className="tt-rail" data-rail="gnd">
              <Solid paths={rails.gnd} tone="hi" crease="lo" />
            </g>
            <g className="tt-railname" data-rail="vdd">
              <FaceText transform={railText.vdd} size={RAIL_SIZE} tone="hi">
                VDD
              </FaceText>
            </g>
            <g className="tt-railname" data-rail="gnd">
              <FaceText transform={railText.gnd} size={RAIL_SIZE} tone="hi">
                GND
              </FaceText>
            </g>
            {straps.map((s, i) => (
              <g key={i}>
                <Strap id={`vp${i}`} d={s.vddP} />
                <Strap id={`pp${i}`} d={s.pPin} />
                <Strap id={`pn${i}`} d={s.pinN} />
                <Strap id={`ng${i}`} d={s.nGnd} />
              </g>
            ))}
            <g className="tt-bus" data-bus="" data-hl="0">
              <path className="tt-strap tt-busbase" d={bus.base} />
              {bus.seg.map((s, j) => (
                <Strap key={j} id={`b${j}`} d={s.fwd} rev={s.rev} />
              ))}
              <circle className="tt-busend" cx={f1(busEnd.cap[0])} cy={f1(busEnd.cap[1])} r={4.2} />
            </g>
            <g className="tt-name">
              <FaceText transform={busText} size={BUS_SIZE} tone="hi" anchor="end">
                BUS
              </FaceText>
            </g>
            {chips.map((c, i) => (
              <g key={i} className="tt-chip tt-hl" data-chip={i} data-hl="0">
                <g className="tt-dev tt-hl" data-dev={`p${i}`} data-hue="p" data-hl="0" style={{ "--g": 0 } as CSSProperties}>
                  <g className="tt-body">
                    <Solid paths={c.pmos} tone="mid" />
                  </g>
                  <g className="tt-gate">
                    <Solid paths={c.pgate} tone="hi" crease="none" />
                  </g>
                </g>
                <g className="tt-dev tt-hl" data-dev={`n${i}`} data-hue="n" data-hl="0" style={{ "--g": 0 } as CSSProperties}>
                  <g className="tt-body">
                    <Solid paths={c.nmos} tone="mid" />
                  </g>
                  <g className="tt-gate">
                    <Solid paths={c.ngate} tone="hi" crease="none" />
                  </g>
                </g>
                <g className="tt-pin" data-pin={i}>
                  <Solid paths={c.pin} tone="hi" crease="lo" />
                </g>
                <g className="tt-name">
                  <FaceText transform={dataText[i]} size={DATA_SIZE} tone="hi" anchor="end">
                    {`D=${D_CIRCUIT[i]}`}
                  </FaceText>
                </g>
                <path className="tt-read" data-read={i} d={c.readTick} style={{ display: "none" }} />
                <g data-tag={i} style={{ display: "none" }}>
                  <path className="tt-tagplate" d={c.tagPlate} />
                  <text className="tt-tagtext" transform={c.tagText} fontSize={13} textAnchor="middle">
                    Z
                  </text>
                </g>
              </g>
            ))}
            <g className="tt-name">
              <FaceText transform={devText.pmos} size={DEV_SIZE} tone="hi" anchor="end">
                PMOS
              </FaceText>
              <FaceText transform={devText.nmos} size={DEV_SIZE} tone="hi" anchor="end">
                NMOS
              </FaceText>
            </g>
            {/* EN links: lever to chip, raised over the GND rail and the bus. */}
            {enLinks.map((l, i) => (
              <g key={i} className="tt-link" data-link={i} data-hl="0">
                <path className="tt-linkpath" d={l.d + l.stubN} />
                <circle className="tt-linkdot" cx={f1(l.dot[0])} cy={f1(l.dot[1])} r={2.4} />
              </g>
            ))}
            <path className="tt-ghost" data-ghost-tank="" d="" style={{ opacity: 0 }} />
            <path className="tt-warn" data-warn="c" d={fightWarn} style={{ display: "none" }} />
          </g>

          {/* ---------- Analogy: supply tank, pipes, taps, shared tank, gutter ---------- */}
          <g data-scene="water">
            {supply.legs.map((l, k) => (
              <Solid key={k} paths={l} tone="mid" crease="none" />
            ))}
            <g data-supply-water="" />
            <g className="an-glass">
              <Solid paths={supply.glass} tone="mid" />
            </g>
            <Solid paths={supply.lid} tone="mid" crease="lo" />
            <Solid paths={supply.pipe} tone="mid" crease="lo" />
            {streaks.supply.map((d, j) => (
              <Streak key={j} id={`s${j}`} d={d} />
            ))}
            {risers.map((r, i) => (
              <g key={i}>
                <Solid paths={r} tone="mid" crease="lo" />
                <Streak id={`r${i}`} d={streaks.riser[i]} />
              </g>
            ))}
            {fillPipes.map((p, i) => (
              <g key={i}>
                <Solid paths={p} tone="mid" crease="lo" />
                <Streak id={`f${i}`} d={streaks.fill[i]} />
                <g className="tt-tap tt-hl" data-lift={i} data-tap={`f${i}`} data-hl="0">
                  {fillTaps[i].solids.map((x, k) => (
                    <Solid key={k} paths={x} tone="hi" crease="lo" className={k === 1 ? undefined : k === 2 ? "tt-cap" : "tt-tapbody"} />
                  ))}
                  <path className="an-spoke tt-spoke" data-spoke="" d="" />
                </g>
              </g>
            ))}
            <Solid paths={header} tone="mid" crease="lo" />
            {streaks.header.map((d, j) => (
              <g key={j} className="tt-streak" data-streak={`h${j}`} data-on="0">
                <path className="tt-glow" d={d} />
                <path className="an-drops" data-way="1" d={d} />
                <path className="an-drops" data-way="-1" d={streaks.headerRev[j]} />
              </g>
            ))}
            <g className="tt-tank tt-hl" data-tank="" data-hl="0">
              <Solid paths={tank.plinth} tone="hi" crease="lo" className="tt-plinth" />
              <path className="tt-plate" d={tank.plate} />
              <g className="tt-brand">
                <FaceText transform={brandAt} size={BRAND_SIZE} tone="hi" anchor="middle">
                  {BRAND}
                </FaceText>
              </g>
              <g data-tank-water="" />
              <g className="an-glass" data-tank-glass="" />
              <path className="tt-ticks" data-tank-ticks="" d="" />
            </g>
            {drainPipes.map((p, i) => (
              <g key={i}>
                <Solid paths={p} tone="mid" crease="lo" />
                <Streak id={`d${i}`} d={streaks.drain[i]} />
                <g className="tt-tap tt-hl" data-lift={i} data-tap={`d${i}`} data-hl="0">
                  {drainTaps[i].solids.map((x, k) => (
                    <Solid key={k} paths={x} tone="hi" crease="lo" className={k === 1 ? undefined : k === 2 ? "tt-cap" : "tt-tapbody"} />
                  ))}
                  <path className="an-spoke tt-spoke" data-spoke="" d="" />
                </g>
              </g>
            ))}
            <Solid paths={gutter.body} tone="mid" crease="lo" className="tt-gutter" />
            <path className="tt-gutter-water" data-gutter-water="" d={gutter.water} />
            <path className="tt-outlet" d={gutter.outlet} />
            {streaks.gutter.map((d, j) => (
              <Streak key={j} id={`g${j}`} d={d} />
            ))}
            <path className="tt-warn" data-warn="a" d={tankWarn} />
          </g>

          {/* ---------- Shared: lock / enable levers; gauges (analogy) ---------- */}
          {levers.map((l) => (
            <g key={l.i} className="tt-lever tt-hl" data-lever={l.i} data-lift={l.i} data-hl="0">
              <Solid paths={l.box} tone="hi" crease="lo" className="tt-leverbox" />
              <path className="tt-leverface" d={l.face} />
              <g className="tt-lbl" data-lbl="a">
                <FaceText transform={l.label} size={LABEL_SIZE + 1} tone="hi" anchor="middle">
                  {String(l.i + 1)}
                </FaceText>
              </g>
              <g className="tt-lbl" data-lbl="c" style={{ opacity: 0 }}>
                <FaceText transform={l.label} size={LABEL_SIZE} tone="hi" anchor="middle">
                  {`EN${l.i + 1}`}
                </FaceText>
              </g>
              <path className="tt-boss" d={l.boss} />
              <path className="tt-rod" d={leverRod(l.x, 1)} />
              <g className="tt-knob" transform={knobTransform(l.x, 1)}>
                <Solid paths={knob} tone="hi" crease="lo" />
              </g>
              <g className="tt-ghostlock" data-ghostlock="" style={{ opacity: 0 }}>
                <path d={l.lock.body} />
                <path d={l.lock.shackle} />
              </g>
            </g>
          ))}
          <g data-scene="gauges">
            {gauges.map((g, i) => (
              <g key={i} className="tt-gauge tt-hl" data-gauge={i} data-lift={i} data-hl="0">
                <Solid paths={g.base} tone="mid" crease="none" />
                <path className="tt-dial" d={g.dial} />
                <path className="tt-dial-arc" d={g.arc} />
                <path className="tt-dial-tick" d={g.ticks} />
                <path className="tt-needle" data-needle="" d={g.needle(0.5)} />
                <circle className="tt-hub" cx={f1(g.hub[0])} cy={f1(g.hub[1])} r={1.6} />
              </g>
            ))}
          </g>
        </g>
        <Sparks points={contacts.length} />
      </g>
    </TtLive>
  );
}
