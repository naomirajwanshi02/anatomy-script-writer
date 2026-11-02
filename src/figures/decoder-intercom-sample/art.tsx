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
  contacts,
  core,
  DOT_TAG,
  ENGRAVE,
  ENGRAVE_SIZE,
  engraveAt,
  flats,
  KNOB_R,
  NAME_SIZE,
  VALUE_SIZE,
  WING_SIZE,
  wingText,
  wings,
} from "./geometry";
import { BRAND, dotOn, LEVER_INFO, rings, wireOn } from "./model";
import { DiLive } from "./live";

// Static art (frozen frame): board (rises); building, cables, junction boxes, bells and the guard booth (fall at the
// entrance); sparks. Dots, bells and cable flows all come from the model.
export function DiArt() {
  const b = boardSvg();
  return (
    <DiLive>
      <g data-entry="">
        <g data-base="">
          <path className="iso-halo" d={b.halo} />
          {b.feet.map((f, k) => (
            <Solid key={k} paths={f} tone="lo" />
          ))}
          <Solid paths={b.slab} tone="mid" />
          <Line d={b.inset} tone="lo" />
          <Line d={b.rings} tone="lo" />
          <g className="di-engrave">
            <FaceText transform={engraveAt} size={ENGRAVE_SIZE} tone="mid" anchor="middle">
              {ENGRAVE}
            </FaceText>
          </g>
        </g>
        <g data-parts="">
          {/* Wing A, the core, wing B (painter's order left to right). */}
          {[0, 1].map((i) => {
            const w = wings[i];
            const block = (
              <g key={`w${i}`}>
                <Solid paths={w.body} tone="hi" crease="lo" className="di-bld" />
                <Solid paths={w.coping} tone="hi" crease="none" className="di-coping" />
                <path className="di-plinth" d={w.plinth} />
                <path className="di-slab" d={w.slab} />
                <path className="di-cornice" d={w.parapet} />
                <g className="di-wing">
                  <FaceText transform={i ? wingText.B : wingText.A} size={WING_SIZE} tone="hi" anchor="middle">
                    {i ? "B" : "A"}
                  </FaceText>
                </g>
              </g>
            );
            if (i === 0) return block;
            return [
              <g key="core">
                <Solid paths={core.body} tone="hi" crease="lo" className="di-core" />
                <Solid paths={core.coping} tone="hi" crease="none" className="di-coping" />
                <path className="di-door" d={core.door} />
                <path className="di-cornice" d={core.doorSplit} />
                <path className="di-glass" d={core.stairs} />
                <path className="di-cornice" d={core.stairBars} />
                <path className="di-sign" d={core.sign} />
                <g className="di-brand">
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
            <g key={f.flat.id}>
              <path className="di-frame" d={f.frame} />
              <path className="di-glass" d={f.glass} />
              <path className="di-mullion" d={f.mullion} />
              <path className="di-shine" d={f.shine} />
              <Solid paths={f.sill} tone="hi" crease="none" />
              <path className="di-plate" d={f.plate} />
              {f.dots.map((d) => (
                <g key={d.k} className="di-dot" data-on={dotOn(f.flat, d.k) ? "1" : "0"}>
                  <path d={d.d} />
                  <text className="di-dot-tag" transform={d.label} fontSize={DOT_TAG} textAnchor="middle">
                    {LEVER_INFO[d.k].tag}
                  </text>
                </g>
              ))}
              {f.balcony ? (
                <g>
                  <Solid paths={f.balcony.slab} tone="hi" crease="none" />
                  <path className="di-rail" d={f.balcony.rail} />
                </g>
              ) : null}
            </g>
          ))}
          {/* Bells: kit glass bulbs on brackets, lit only for the ringing flat. */}
          {flats.map((f) => {
            const on = rings(f.flat);
            return (
              <g key={f.flat.id}>
                {on ? <path className="di-wallglow" d={f.wallGlow} fill="url(#di-pool)" /> : null}
                <Solid paths={f.bracket} tone="hi" crease="lo" />
                <g transform={f.bulbTransform} style={{ "--lamp": on ? 1 : 0 } as CSSProperties}>
                  <Bulb parts={f.bulb} />
                  <circle className="di-glow bulb-glow" cx={f.bulb.glowAt[0].toFixed(1)} cy={f.bulb.glowAt[1].toFixed(1)} r={f.bulb.glowR.toFixed(1)} fill="url(#di-glow)" />
                </g>
                {on ? f.arcs.map((d, i) => <path key={i} className="di-sound" d={d} style={{ opacity: 1 - i * 0.28 }} />) : null}
              </g>
            );
          })}
          {/* Cables on the board: base trace always, rust flow only on a cable carrying a 1. */}
          {cables.map((c) => (
            <g key={c.k}>
              <path className="di-wire" d={c.d} />
              {wireOn(c.k) ? <path className="di-flow" d={c.d} /> : null}
            </g>
          ))}
          {boxes.map((x, i) => (
            <g key={i}>
              <Solid paths={x.body} tone="hi" crease="lo" className="di-box" />
              <path className="di-cornice" d={x.lid} />
            </g>
          ))}
          {/* Guard booth with the intercom panel on its front. */}
          <Solid paths={booth.body} tone="hi" crease="lo" className="di-booth" />
          <path className="di-glass" d={booth.window} />
          <path className="di-mullion" d={booth.windowBar} />
          <Solid paths={booth.roof} tone="hi" crease="lo" className="di-roof" />
          <path className="di-panel" d={booth.panel} />
          {booth.levers.map((l) => (
            <g key={l.k}>
              <path className="di-slot" d={l.slot} />
              <g className="di-ptext">
                <FaceText transform={l.name} size={NAME_SIZE} tone="hi" anchor="middle">
                  {LEVER_INFO[l.k].name}
                </FaceText>
                <FaceText transform={l.v0} size={VALUE_SIZE} tone="mid" anchor="middle">
                  {LEVER_INFO[l.k].v0}
                </FaceText>
                <FaceText transform={l.v1} size={VALUE_SIZE} tone="mid" anchor="middle">
                  {LEVER_INFO[l.k].v1}
                </FaceText>
              </g>
              <path className="di-boot" d={l.boss} />
              <path className="di-rod" d={l.rod} />
              <circle className="di-knob-lever" cx={l.tip[0].toFixed(1)} cy={l.tip[1].toFixed(1)} r={KNOB_R} />
            </g>
          ))}
        </g>
        <Sparks points={contacts.length} />
      </g>
    </DiLive>
  );
}
