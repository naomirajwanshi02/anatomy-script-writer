import { Dots, FaceText, Line, Solid } from "../../iso/react/draw";
import { Sparks } from "../../iso/react/reel";
import { amp, boardEngrave, boardSvg, BRAND_SIZE, CALL_CHAR, callout, contacts, ENGRAVE, ENGRAVE_SIZE, LCD_CHAR, speaker, TICK_SIZE } from "./geometry";
import { BAR, BRAND, LCD_TEXT } from "./model";
import { VgLive } from "./live";

// Static art: the board (rises), the amplifier, speaker and callout plate (fall), sparks. The scene is a frozen frame.
export function VgArt() {
  return (
    <VgLive>
      <g data-entry="">
        <g data-base="">
          <g data-board="" dangerouslySetInnerHTML={{ __html: boardSvg }} />
          <g className="vg-engrave">
            <FaceText transform={boardEngrave} size={ENGRAVE_SIZE} tone="mid" anchor="middle">
              {ENGRAVE}
            </FaceText>
          </g>
          <path className="vg-pool" d={amp.pool} fill="url(#vg-blue-pool)" />
        </g>
        <g data-parts="">
          <g data-amp="">
            <path className="iso-halo" d={amp.halo} style={{ filter: "blur(3px)" }} />
            {amp.feet.map((p, i) => (
              <Solid key={i} paths={p} tone="mid" crease="lo" className="vg-foot" />
            ))}
            <Solid paths={amp.body} tone="mid" crease="lo" />
            <Line d={amp.vents} tone="lo" />
            <Line d={amp.faceRule} tone="lo" />
            {/* Display: dark bezel, blue glass, pixel text, level bar. */}
            <path className="vg-bezel" d={amp.bezel} />
            <path className="vg-glass" d={amp.glass} />
            <path className="vg-inner-shadow" d={amp.shadow} />
            <text className="vg-lcd-text" transform={amp.lcdText} fontSize={LCD_CHAR} textAnchor="start">
              {LCD_TEXT}
            </text>
            {amp.bar.map((d, i) => (
              <path key={i} className={BAR[i] ? "vg-seg" : "vg-seg vg-seg-off"} d={d} />
            ))}
            {/* Maker's plate. */}
            <path className="vg-plate" d={amp.plate} />
            <g className="vg-brand">
              <FaceText transform={amp.brand} size={BRAND_SIZE} tone="hi" anchor="middle">
                {BRAND}
              </FaceText>
            </g>
            {/* Volume scale 0-7 around the knob. */}
            <Line d={amp.ticks} tone="hi" />
            {amp.tickText.map((t, i) => (
              <FaceText key={i} transform={t} size={TICK_SIZE} tone="hi" anchor="middle">
                {i}
              </FaceText>
            ))}
            {/* Knob: skirt, side band, front cap, grip lines, pointer. */}
            <path className="vg-knob-skirt" d={amp.knobSkirt} />
            <path className="vg-knob-side" d={amp.knobSide} />
            <path className="vg-knob-grip" d={amp.knobGrip} />
            <path className="vg-knob-cap" d={amp.knobCap} />
            <path className="vg-pointer" d={amp.pointer} />
            <path className="vg-power" d={amp.power} />
          </g>
          <g data-speaker="">
            <path className="iso-halo" d={speaker.halo} style={{ filter: "blur(3px)" }} />
            <Solid paths={speaker.body} tone="mid" crease="lo" />
            <path className="vg-grille" d={speaker.wooferRim} />
            <path className="vg-cone" d={speaker.woofer} />
            <path className="vg-dust" d={speaker.dust} />
            <path className="vg-grille" d={speaker.tweeterRim} />
            <path className="vg-dust" d={speaker.tweeter} />
          </g>
          <g data-sound="">
            {speaker.arcs.map((d, i) => (
              <path key={i} className="vg-arc" d={d} style={{ opacity: 1 - Math.floor(i / 2) * 0.18 }} />
            ))}
          </g>
          <g data-leader="">
            <Line d={callout.leader} tone="mid" />
            <Dots points={callout.leaderEnds} size={1.2} tone="hi" />
          </g>
          <g data-callout="">
            <path className="vg-warn" d={callout.warn} />
            <Solid paths={callout.plate} tone="mid" crease="lo" />
            <path className="iso-line vg-lcd" data-tone="mid" d={callout.lcd} />
            <text className="vg-lcd-text" transform={callout.text} fontSize={CALL_CHAR} textAnchor="middle">
              {LCD_TEXT}
            </text>
          </g>
        </g>
        <Sparks points={contacts.length} />
      </g>
    </VgLive>
  );
}
