import type { CSSProperties } from "react";
import { FaceText, Line, Solid } from "../../iso/react/draw";
import { Bulb } from "../../iso/react/bulb";
import { Sparks } from "../../iso/react/reel";
import {
  boardSvg,
  booth,
  boxes,
  brandAt,
  BRAND_SIZE,
  cables,
  CDOT_TAG,
  cellTextAt,
  contacts,
  core,
  DOT_TAG,
  ENGRAVE,
  ENGRAVE_SIZE,
  engraveAt,
  flats,
  KEY_SIZE,
  KEY_SIZE2,
  keyPlate,
  KNOB_R,
  lever4,
  leverRod,
  leverTip,
  NAME_SIZE,
  ROWNUM_SIZE,
  ADDR_SIZE,
  ADDR_TAG,
  addrPlate,
  scale16,
  scale20,
  VALUE_SIZE,
  wall,
  WING_SIZE,
  wingText,
  wings,
  wordLine,
  WVALUE_SIZE,
} from "./geometry";
import { BRAND, LEVER_INFO, ROW5_DATA } from "./model";
import { DxLive } from "./live";

const f1 = (v: number) => v.toFixed(1);

// Static art (start frame: levers in the middle, bells clear, dots hollow). The loop (live.tsx) writes every state
// from the model: lever rods, dots, bells, lamps, wire flows, word lines, scene folds and highlight beats.
export function DxArt() {
  const b = boardSvg();
  return (
    <DxLive>
      <g data-entry="">
        <g data-base="">
          <path className="iso-halo" d={b.halo} />
          {b.feet.map((f, k) => (
            <Solid key={k} paths={f} tone="lo" />
          ))}
          <Solid paths={b.slab} tone="mid" />
          <Line d={b.inset} tone="lo" />
          <Line d={b.rings} tone="lo" />
          <g className="dx-engrave">
            <FaceText transform={engraveAt} size={ENGRAVE_SIZE} tone="mid" anchor="middle">
              {ENGRAVE}
            </FaceText>
          </g>
        </g>
        <g data-parts="">
          {/* ---------- Memory wall (circuit): behind the building, shown at the fold ---------- */}
          <g data-scene="wall" style={{ opacity: 0, display: "none" }}>
            <Solid paths={wall.body} tone="hi" crease="lo" className="dx-bld" />
            <Solid paths={wall.coping} tone="hi" crease="none" className="dx-coping" />
            <path className="dx-plinth" d={wall.plinth} />
            <path className="dx-panel" d={wall.header} />
            {/* Address wires: base trace, flash, rust flow while the lever's bit is 1. */}
            <g data-wires="">
              {wall.wires.map((w) => (
                <g key={w.k} data-wire={w.k}>
                  <path className="dx-wire" d={w.d} />
                  <path className="dx-flow" d={w.d} style={{ display: "none" }} />
                </g>
              ))}
            </g>
            {/* Eight rows. */}
            <g data-rows8="">
              <path className="dx-colglow" data-colglow="" d={wall.column} style={{ opacity: 0 }} />
              {wall.rows.map((r) => (
                <g key={r.flat.row} data-row={r.flat.row}>
                  <path className="dx-band" data-band={r.flat.row} d={r.band} />
                  <path className="dx-checker" d={r.checker} />
                  {r.dots.map((d) => (
                    <g key={d.k} className="dx-dot" data-cdot={`${r.flat.row}${d.k}`} data-on="0" data-hl="0">
                      <path d={d.d} />
                      <text className="dx-dot-tag" transform={d.label} fontSize={CDOT_TAG} textAnchor="middle">
                        {LEVER_INFO[d.k].tag}
                      </text>
                    </g>
                  ))}
                  <g className="dx-rownum">
                    <FaceText transform={r.num} size={ROWNUM_SIZE} tone="mid" anchor="middle">
                      {String(r.flat.row)}
                    </FaceText>
                  </g>
                  {r.cells.map((c, i) => (
                    <path key={i} className="dx-cell" data-cell={`${r.flat.row}-${i}`} d={c} />
                  ))}
                  <path className="dx-wl-base" d={wordLine(r.flat.row, 1)} />
                  <path className="dx-wl" data-wl={r.flat.row} d={wordLine(r.flat.row, 0)} style={{ display: "none" }} />
                  <Solid paths={r.bracket} tone="hi" crease="lo" />
                  <g data-lamp={r.flat.row} transform={r.bulbTransform} style={{ "--lamp": 0 } as CSSProperties}>
                    <Bulb parts={r.bulb} />
                    <circle className="dx-glow bulb-glow" cx={f1(r.bulb.glowAt[0])} cy={f1(r.bulb.glowAt[1])} r={f1(r.bulb.glowR)} fill="url(#dx-glow)" />
                  </g>
                  <path className="dx-ghostbell" data-ghostbell="" d={r.ghostBell} style={{ opacity: 0 }} />
                </g>
              ))}
              {/* Row 5's data: shown in its cells while the row is open, then copies slide out past the row end. */}
              {ROW5_DATA.map((v, i) => {
                const c = wall.rows[5].cellText[i];
                return (
                  <text key={i} className="dx-bit" data-bit={i} transform={cellTextAt(c.x, c.y, c.z)} fontSize={10} textAnchor="middle" style={{ opacity: 0 }}>
                    {String(v)}
                  </text>
                );
              })}
              {ROW5_DATA.map((v, i) => (
                <text key={i} className="dx-bit dx-bit-out" data-out={i} fontSize={10} textAnchor="middle" style={{ display: "none" }}>
                  {String(v)}
                </text>
              ))}
              <g data-ghostwin="" style={{ opacity: 0 }}>
                <path className="dx-frame" d={wall.ghostWindow.frame} />
                <path className="dx-glass" d={wall.ghostWindow.glass} />
                <path className="dx-mullion" d={wall.ghostWindow.mullion} />
              </g>
              <path className="dx-outline" data-outline="5" d={wall.rowOutline(5)} style={{ display: "none" }} />
              <path className="dx-outline dx-outline-soft" data-outline="4" d={wall.rowOutline(4)} style={{ display: "none" }} />
            </g>
            {/* Address levers on the wall header: value labels A/B, G/1, L/R, then 0/1. */}
            <g data-levers3="">
              {wall.levers.map((l) => (
                <g key={l.k} className="dx-lever" data-lever={`w${l.k}`} data-hl="0">
                  <path className="dx-slot" d={l.slot} />
                  <g className="dx-ptext" data-names="">
                    <FaceText transform={l.v0} size={WVALUE_SIZE} tone="mid" anchor="middle">
                      {LEVER_INFO[l.k].v0}
                    </FaceText>
                    <FaceText transform={l.v1} size={WVALUE_SIZE} tone="mid" anchor="middle">
                      {LEVER_INFO[l.k].v1}
                    </FaceText>
                  </g>
                  <g className="dx-ptext" data-bitlabels="" style={{ opacity: 0 }}>
                    <FaceText transform={l.v0} size={WVALUE_SIZE} tone="mid" anchor="middle">
                      0
                    </FaceText>
                    <FaceText transform={l.v1} size={WVALUE_SIZE} tone="mid" anchor="middle">
                      1
                    </FaceText>
                  </g>
                  <path className="dx-boot" d={l.boss} />
                  <path className="dx-rod" d={leverRod(l.geo, 0)} />
                  <circle className="dx-knob-lever" cx={f1(leverTip(l.geo, 0)[0])} cy={f1(leverTip(l.geo, 0)[1])} r={KNOB_R * 0.8} />
                </g>
              ))}
            </g>
            {/* Scale-up: a fourth lever slides in; 16 rows; 20 levers over a dense block of thin rows. */}
            <g data-lever4="" style={{ opacity: 0 }}>
              <path className="dx-slot" d={lever4.slot} />
              <path className="dx-boot" d={lever4.boss} />
              <path className="dx-rod" d={lever4.rod} />
              <circle className="dx-knob-lever" cx={f1(lever4.tip[0])} cy={f1(lever4.tip[1])} r={KNOB_R * 0.8} />
            </g>
            <g data-s16="" style={{ opacity: 0, display: "none" }}>
              <path className="dx-wire" d={scale16.wires} />
              {scale16.rows.map((r, i) => (
                <g key={i}>
                  <path className="dx-wl-base" d={r.line} />
                  <path className="dx-wl dx-wl-thin" data-l16={i} d={r.line} style={{ display: "none" }} />
                  <path className="dx-plate" d={r.checker} />
                  <path className="dx-dot16" d={r.dots} />
                  <path className="dx-cell" d={r.band} />
                  <path className="dx-lamp16" data-lamp16={i} d={r.lamp} />
                </g>
              ))}
            </g>
            <g data-s20="" style={{ opacity: 0, display: "none" }}>
              <path className="dx-panel" d={scale20.header} />
              <path className="dx-wire dx-wire-thin" d={scale20.wires} />
              {scale20.rows.map((d, i) => (
                <path key={i} className="dx-dense" data-dense={i} d={d} />
              ))}
              {scale20.levers.map((l, i) => (
                <g key={i}>
                  <path className="dx-slot" d={l.slot} />
                  <path className="dx-rod dx-rod-thin" d={l.rod} />
                  <circle className="dx-knob-lever" cx={f1(l.tip[0])} cy={f1(l.tip[1])} r={2.2} />
                </g>
              ))}
            </g>
            {/* Address plate under the levers: the three bits the levers spell. */}
            <g data-addr="">
              <Solid paths={addrPlate.body} tone="hi" crease="lo" className="dx-keybody" />
              <path className="dx-keyface" d={addrPlate.face} />
              <g className="dx-addrtag">
                <FaceText transform={addrPlate.tag} size={ADDR_TAG} tone="mid" anchor="middle">
                  address
                </FaceText>
              </g>
              {addrPlate.digits.map((d) => (
                <g key={d.k} className="dx-digit" data-digit={d.k} data-hl="0">
                  <FaceText transform={d.at} size={ADDR_SIZE} tone="hi" anchor="middle">
                    {" "}
                  </FaceText>
                </g>
              ))}
            </g>
          </g>

          {/* ---------- Building (analogy) ---------- */}
          <g data-scene="building">
            <g data-lift="">
              {[0, 1].map((i) => {
                const w = wings[i];
                const block = (
                  <g key={`w${i}`}>
                    <Solid paths={w.body} tone="hi" crease="lo" className="dx-bld" />
                    <Solid paths={w.coping} tone="hi" crease="none" className="dx-coping" />
                    <path className="dx-plinth" d={w.plinth} />
                    <path className="dx-slab" d={w.slab} />
                    <path className="dx-cornice" d={w.parapet} />
                    <g className="dx-wing" data-winghl={i} data-hl="0">
                      <FaceText transform={i ? wingText.B : wingText.A} size={WING_SIZE} tone="hi" anchor="middle">
                        {i ? "B" : "A"}
                      </FaceText>
                    </g>
                  </g>
                );
                if (i === 0) return block;
                return [
                  <g key="core">
                    <Solid paths={core.body} tone="hi" crease="lo" className="dx-core" />
                    <Solid paths={core.coping} tone="hi" crease="none" className="dx-coping" />
                    <path className="dx-door" d={core.door} />
                    <path className="dx-cornice" d={core.doorSplit} />
                    <path className="dx-glass" d={core.stairs} />
                    <path className="dx-cornice" d={core.stairBars} />
                    <path className="dx-sign" d={core.sign} />
                    <g className="dx-brand">
                      <FaceText transform={brandAt} size={BRAND_SIZE} tone="hi" anchor="middle">
                        {BRAND}
                      </FaceText>
                    </g>
                    <Solid paths={core.step} tone="hi" crease="none" />
                  </g>,
                  block,
                ];
              })}
              {/* Flats: window, sill, check plate with its three dots. */}
              {flats.map((f) => (
                <g key={f.flat.id} className="dx-flat" data-flat={f.flat.row} data-pale="0" data-hl="0">
                  <path className="dx-frame" d={f.frame} />
                  <path className="dx-glass dx-win" d={f.glass} />
                  <path className="dx-mullion" d={f.mullion} />
                  <path className="dx-shine" d={f.shine} />
                  <Solid paths={f.sill} tone="hi" crease="none" />
                  <path className="dx-plate" d={f.plate} />
                  {f.dots.map((d) => (
                    <g key={d.k} className="dx-dot" data-adot={`${f.flat.row}${d.k}`} data-on="0" data-hl="0">
                      <path d={d.d} />
                      <text className="dx-dot-tag" transform={d.label} fontSize={DOT_TAG} textAnchor="middle">
                        {LEVER_INFO[d.k].tag}
                      </text>
                    </g>
                  ))}
                  {f.balcony ? (
                    <g>
                      <Solid paths={f.balcony.slab} tone="hi" crease="none" />
                      <path className="dx-rail" d={f.balcony.rail} />
                    </g>
                  ) : null}
                </g>
              ))}
              {/* Bells: kit glass bulbs on brackets; lit only for the ringing flat (and the opening glint). */}
              {flats.map((f) => (
                <g key={f.flat.id}>
                  <path className="dx-wallglow" data-wglow={f.flat.row} d={f.wallGlow} fill="url(#dx-pool)" style={{ opacity: 0 }} />
                  <Solid paths={f.bracket} tone="hi" crease="lo" />
                  <g data-bell={f.flat.row} transform={f.bulbTransform} style={{ "--lamp": 0 } as CSSProperties}>
                    <Bulb parts={f.bulb} />
                    <circle className="dx-glow bulb-glow" cx={f1(f.bulb.glowAt[0])} cy={f1(f.bulb.glowAt[1])} r={f1(f.bulb.glowR)} fill="url(#dx-glow)" />
                  </g>
                  <g data-arcs={f.flat.row} style={{ display: "none" }}>
                    {f.arcs.map((d, i) => (
                      <path key={i} className="dx-sound" d={d} style={{ opacity: 1 - i * 0.28 }} />
                    ))}
                  </g>
                </g>
              ))}
            </g>
          </g>

          {/* ---------- Cables and junction boxes on the board ---------- */}
          <g data-scene="ground">
            {cables.map((c) => (
              <g key={c.k} data-cable={c.k}>
                <path className="dx-wire" d={c.d} />
                <path className="dx-cable-hl" d={c.d} style={{ opacity: 0 }} />
                <path className="dx-flow" d={c.d} style={{ display: "none" }} />
              </g>
            ))}
            {boxes.map((x, i) => (
              <g key={i} className="dx-jbox" data-hl="0">
                <Solid paths={x.body} tone="hi" crease="lo" className="dx-box" />
                <path className="dx-cornice dx-lid" d={x.lid} />
              </g>
            ))}
          </g>

          {/* ---------- Guard booth with the intercom panel ---------- */}
          <g data-scene="booth">
            <Solid paths={booth.body} tone="hi" crease="lo" className="dx-booth" />
            <path className="dx-glass" d={booth.window} />
            <path className="dx-mullion" d={booth.windowBar} />
            <Solid paths={booth.roof} tone="hi" crease="lo" className="dx-roof" />
            <path className="dx-panel" data-panel="" data-hl="0" d={booth.panel} />
            {booth.levers.map((l) => (
              <g key={l.k} className="dx-lever" data-lever={`b${l.k}`} data-hl="0">
                <path className="dx-slot" d={l.slot} />
                <g className="dx-ptext">
                  <g className="dx-lname">
                    <FaceText transform={l.name} size={NAME_SIZE} tone="hi" anchor="middle">
                      {LEVER_INFO[l.k].name}
                    </FaceText>
                  </g>
                  <FaceText transform={l.v0} size={VALUE_SIZE} tone="mid" anchor="middle">
                    {LEVER_INFO[l.k].v0}
                  </FaceText>
                  <FaceText transform={l.v1} size={VALUE_SIZE} tone="mid" anchor="middle">
                    {LEVER_INFO[l.k].v1}
                  </FaceText>
                </g>
                <path className="dx-boot" d={l.boss} />
                <path className="dx-rod" d={leverRod(l.geo, 0)} />
                <circle className="dx-knob-lever" cx={f1(leverTip(l.geo, 0)[0])} cy={f1(leverTip(l.geo, 0)[1])} r={KNOB_R} />
              </g>
            ))}
          </g>

          {/* ---------- Key plate along the front (text appears at "checks all three") ---------- */}
          <g data-keyplate="">
            <Solid paths={keyPlate.body} tone="hi" crease="lo" className="dx-keybody" />
            <path className="dx-keyface" d={keyPlate.face} />
            <g data-keyset="plain" style={{ opacity: 0 }}>
              {keyPlate.lines.map((l) => (
                <g key={l.k} className="dx-keyline" data-keyline={l.k} data-hl="0">
                  <FaceText transform={l.at} size={KEY_SIZE} tone="hi" anchor="start">
                    {LEVER_INFO[l.k].key}
                  </FaceText>
                </g>
              ))}
            </g>
            <g data-keyset="bits" style={{ opacity: 0 }}>
              {keyPlate.lines.map((l) => (
                <g key={l.k} className="dx-keyline" data-keyline={l.k} data-hl="0">
                  <FaceText transform={l.at} size={KEY_SIZE} tone="hi" anchor="start">
                    {LEVER_INFO[l.k].keyBit}
                  </FaceText>
                </g>
              ))}
            </g>
            <g data-keymatch="" style={{ opacity: 0 }}>
              <path className="dx-keydot" d={keyPlate.matchDot} />
              <g className="dx-keyline" data-keym="flat">
                <FaceText transform={keyPlate.match} size={KEY_SIZE2} tone="hi" anchor="start">
                  filled = matches this flat
                </FaceText>
              </g>
              <g className="dx-keyline" data-keym="row" style={{ opacity: 0 }}>
                <FaceText transform={keyPlate.match} size={KEY_SIZE2} tone="hi" anchor="start">
                  filled = matches this row
                </FaceText>
              </g>
            </g>
          </g>
        </g>
        <Sparks points={contacts.length} />
      </g>
    </DxLive>
  );
}

