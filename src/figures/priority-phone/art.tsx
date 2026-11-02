import type { CSSProperties } from "react";
import { FaceText, Line, Solid } from "../../iso/react/draw";
import { Bulb } from "../../iso/react/bulb";
import { Sparks } from "../../iso/react/reel";
import { boardSvg, call, contacts, dock, ENGRAVE, ENGRAVE_SIZE, engraveAt, icons, KNOB_R, LABEL_SIZE, LCD, leverRod, leverTip, music, NUM_SIZE, phone, stand, wall } from "./geometry";
import { BRAND } from "./model";
import { PeLive } from "./live";

const f1 = (v: number) => v.toFixed(1);

// Static art (start frame: music tile on, music playing). The loop (live.tsx) writes every state from the model:
// tiles, screen, sound arcs, lever rods, wire flows, lamps, scene folds and highlight beats.
export function PeArt() {
  const b = boardSvg();
  return (
    <PeLive>
      <g data-entry="">
        <g data-base="">
          <path className="iso-halo" d={b.halo} />
          {b.feet.map((f, k) => (
            <Solid key={k} paths={f} tone="lo" />
          ))}
          <Solid paths={b.slab} tone="mid" />
          <Line d={b.inset} tone="lo" />
          <Line d={b.rings} tone="lo" />
          <g className="pe-engrave">
            <FaceText transform={engraveAt} size={ENGRAVE_SIZE} tone="mid" anchor="middle">
              {ENGRAVE}
            </FaceText>
          </g>
        </g>
        <g data-parts="">
          {/* ---------- Wall (circuit): levers, wires, encoder block, output lamps ---------- */}
          <g data-scene="wall" style={{ opacity: 0, display: "none" }}>
            <Solid paths={wall.body} tone="hi" crease="lo" className="pe-wall" />
            <Solid paths={wall.coping} tone="hi" crease="none" className="pe-coping" />
            <path className="pe-plinth" d={wall.plinth} />
            {wall.rows.map((w) => (
              <g key={w.r} data-wire={w.r} data-hl="0">
                <path className="pe-wire" d={w.wire(0)} />
                <path className="pe-flow" d={w.wire(1)} style={{ display: "none" }} />
              </g>
            ))}
            {wall.outs.map((d, i) => (
              <g key={i} data-out={i} style={{ opacity: 0 }}>
                <path className="pe-wire" d={d} />
                <path className="pe-flow" d={d} style={{ display: "none" }} />
              </g>
            ))}
            <Solid paths={wall.block} tone="hi" crease="lo" className="pe-block" />
            {wall.rows.map((w) => (
              <g key={w.r} className="pe-lever" data-lever={w.r} data-hl="0">
                <path className="pe-slot" d={w.slot} />
                <g className="pe-num" data-num={w.r} data-hl="0" style={{ opacity: 0 }}>
                  <FaceText transform={w.num} size={NUM_SIZE} tone="hi" anchor="middle">
                    {String(w.r)}
                  </FaceText>
                </g>
                <path className="pe-boss" d={w.boss} />
                <path className="pe-rod" d={leverRod(w.geo, w.r === 1 ? 1 : 0)} />
                <circle className="pe-knob" cx={f1(leverTip(w.geo, w.r === 1 ? 1 : 0)[0])} cy={f1(leverTip(w.geo, w.r === 1 ? 1 : 0)[1])} r={KNOB_R} />
              </g>
            ))}
            <g className="pe-tag" data-first="lever" style={{ opacity: 0 }}>
              <FaceText transform={wall.rows[2].first} size={11} tone="hi" anchor="start">
                1st
              </FaceText>
            </g>
            {/* Output lamps "2" and "1" (rise with the outputs), then the valid lamp below. */}
            {wall.lamps.map((l, i) => (
              <g key={i} data-lampg={i} style={{ opacity: 0 }}>
                <path className="pe-pool" data-pool={i} d={l.pool} fill="url(#pe-pool)" style={{ opacity: 0 }} />
                <Solid paths={l.bracket} tone="hi" crease="lo" />
                <g data-lamp={i} transform={l.bulbTransform} style={{ "--lamp": 0 } as CSSProperties}>
                  <Bulb parts={l.bulb} />
                  <circle className="pe-glow bulb-glow" cx={f1(l.bulb.glowAt[0])} cy={f1(l.bulb.glowAt[1])} r={f1(l.bulb.glowR)} fill="url(#pe-glow)" />
                </g>
                <path className="pe-lampring" data-lampring={i} d={l.ring} style={{ display: "none" }} />
                <g className="pe-label">
                  {i < 2 ? (
                    <FaceText transform={wall.labels[i]} size={LABEL_SIZE} tone="hi" anchor="middle">
                      {i === 0 ? "2" : "1"}
                    </FaceText>
                  ) : (
                    <FaceText transform={wall.validLabel} size={12} tone="hi" anchor="start">
                      valid
                    </FaceText>
                  )}
                </g>
              </g>
            ))}
          </g>

          {/* ---------- Stand with the four sound tiles (analogy) ---------- */}
          <g data-scene="stand">
            <Solid paths={stand.body} tone="hi" crease="lo" className="pe-wall" />
            <Solid paths={stand.coping} tone="hi" crease="none" className="pe-coping" />
            {stand.tiles.map((t) => (
              <g key={t.r} className="pe-tile" data-tile={t.r} data-on={t.r === 1 ? "1" : "0"} data-hl="0">
                <Solid paths={t.body} tone="hi" crease="lo" className="pe-tilebody" />
                <path className="pe-tileface" d={t.face} />
              </g>
            ))}
            <g className="pe-tag" data-first="tile" style={{ opacity: 0 }}>
              <FaceText transform={stand.first} size={11} tone="hi" anchor="start">
                1st
              </FaceText>
            </g>
          </g>

          {/* ---------- Sound icons: on the tiles, then beside the levers ---------- */}
          {icons.map((ic) => (
            <g key={ic.r} className="pe-icon" data-icon={ic.r} data-on={ic.r === 1 ? "1" : "0"} data-mode="tile" data-hl="0">
              {ic.fill ? <path className="pe-icon-fill" d={ic.fill} /> : null}
              {ic.line ? <path className="pe-icon-line" d={ic.line} /> : null}
              {ic.thick ? <path className="pe-icon-thick" d={ic.thick} /> : null}
            </g>
          ))}

          {/* ---------- Speaker dock and phone (analogy) ---------- */}
          <g data-scene="phone">
            <Solid paths={phone.body} tone="hi" crease="lo" className="pe-phone" />
            <path className="pe-bezel" d={phone.bezel} />
            <path className="pe-screen-off" d={phone.glass} />
            <path className="pe-lit" data-lit="" d={phone.line(1)} />
            <g data-screen="" style={{ opacity: 1 }}>
              <g data-music="">
                <path className="pe-lcd-ink" d={music.note.fill} />
                <path className="pe-lcd-line" d={music.note.line} />
                <text className="pe-lcd-text" transform={music.title} fontSize={LCD.title} textAnchor="middle">
                  now playing
                </text>
                <path className="pe-lcd-ink" d={music.bar} />
                <path className="pe-lcd-ink" d={music.knob} />
                {music.eq.map((bar, i) => (
                  <path key={i} className="pe-lcd-ink" data-eq={i} d={bar(10)} />
                ))}
                <path className="pe-lcd-ink" d={music.play} />
              </g>
              <g data-call="" style={{ opacity: 0 }}>
                <path className="pe-lcd-ink" d={call.icon.fill} />
                <path className="pe-lcd-thick" d={call.icon.thick} />
                <text className="pe-lcd-text pe-lcd-name" transform={call.name} fontSize={LCD.big} textAnchor="middle">
                  {BRAND}
                </text>
                <text className="pe-lcd-text" transform={call.sub} fontSize={LCD.small} textAnchor="middle">
                  incoming call
                </text>
                <path className="pe-decline" d={call.decline} />
                <path className="pe-accept" d={call.accept} />
                {call.ringIcon.map((ic, i) => (
                  <g key={i}>
                    <path className="pe-btn-ink" d={ic.fill} />
                    <path className="pe-btn-thick" d={ic.thick} />
                  </g>
                ))}
              </g>
            </g>
            <path className="pe-flash" data-flash="" d={phone.line(0)} style={{ display: "none" }} />
            <path className="pe-shine" d={phone.shine} />
            <path className="pe-home" d={phone.home} />
            <path className="pe-home" d={phone.cam} />
            <Solid paths={dock.body} tone="hi" crease="lo" className="pe-dock" />
            <path className="pe-slotline" d={dock.slot} />
            <path className="pe-grille" d={dock.grille} />
            <path className="pe-cone" d={dock.cone} />
            <path className="pe-conering" d={dock.ring} />
            <path className="pe-cap" d={dock.cap} />
            {dock.tweet.map((d, i) => (
              <path key={i} className="pe-cone" d={d} />
            ))}
            <g data-arcs="music">
              {dock.arcs.map((d, i) => (
                <path key={i} className="pe-sound" data-arc={i} d={d} />
              ))}
            </g>
            <g data-arcs="ring" style={{ display: "none" }}>
              {dock.ringArcs.map((d, i) => (
                <path key={i} className="pe-sound" data-arc={i} d={d} />
              ))}
            </g>
          </g>
          <circle className="pe-beam" data-beam="" r={5} style={{ display: "none" }} />
        </g>
        <Sparks points={contacts.length} />
      </g>
    </PeLive>
  );
}
