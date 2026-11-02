import { Dots, FaceText, Line, Solid } from "../../iso/react/draw";
import { Sparks } from "../../iso/react/reel";
import { boardEngrave, boardSvg, BRAND_SIZE, callout, contacts, ENGRAVE, ENGRAVE_SIZE, LINE1_SIZE, LINE2_SIZE, machine, PANEL_TEXT, tray } from "./geometry";
import { BRAND, CHECK_ON, CUFF_TONES, LINE1, LINE2, ODD, SPIN_ON } from "./model";
import { WashLive } from "./live";

// Static art: the board (rises), the washing machine, sock tray and callout plate (fall), sparks. The scene is a frozen frame.
export function WashArt() {
  return (
    <WashLive>
      <g data-entry="">
        <g data-base="">
          <g data-board="" dangerouslySetInnerHTML={{ __html: boardSvg }} />
          <g className="pw-engrave">
            <FaceText transform={boardEngrave} size={ENGRAVE_SIZE} tone="mid" anchor="middle">
              {ENGRAVE}
            </FaceText>
          </g>
          <path className="pw-pool" d={machine.pool} fill="url(#pw-blue-pool)" />
        </g>
        <g data-parts="">
          <g data-machine="">
            <path className="iso-halo" d={machine.halo} style={{ filter: "blur(3px)" }} />
            {machine.feet.map((p, i) => (
              <Solid key={i} paths={p} tone="mid" crease="lo" className="pw-foot" />
            ))}
            <Solid paths={machine.body} tone="mid" crease="lo" />
            {/* Control panel strip: dial with engraved ticks, maker's name, SPIN and CHECK lamps. */}
            <path className="pw-line" d={machine.panelLine} />
            <path className="pw-panel" d={machine.panel} />
            <path className="pw-tick" d={machine.dialTicks} />
            <path className="pw-dial-shadow" d={machine.dialShadow} />
            <path className="pw-dial" d={machine.dial} />
            <path className="pw-dial-cap" d={machine.dialCap} />
            <path className="pw-tick pw-pointer" d={machine.dialPointer} />
            <g className="pw-brand">
              <FaceText transform={machine.brand} size={BRAND_SIZE} tone="mid" anchor="middle">
                {BRAND}
              </FaceText>
            </g>
            <path className={SPIN_ON ? "pw-spin pw-on" : "pw-spin"} d={machine.spin} />
            <path className={CHECK_ON ? "pw-check pw-on" : "pw-check"} d={machine.check} />
            <FaceText transform={machine.spinText} size={PANEL_TEXT} tone="mid" anchor="middle">
              SPIN
            </FaceText>
            <FaceText transform={machine.checkText} size={PANEL_TEXT} tone="mid" anchor="middle">
              CHECK
            </FaceText>
            {/* Door: chrome ring, glass porthole with water, socks and bubbles, shine, handle. */}
            <path className="pw-door-shadow" d={machine.doorShadow} />
            <path className="pw-ring0" d={machine.ring0} />
            <path className="pw-ring1" d={machine.ring1} />
            <path className="pw-ring2" d={machine.ring2} />
            <clipPath id="pw-glass-clip">
              <path d={machine.glass} />
            </clipPath>
            <path className="pw-glass" d={machine.glass} />
            <g clipPath="url(#pw-glass-clip)">
              {machine.socks.map((s, i) => (
                <g key={i} className="pw-sock-in">
                  <path className="pw-sock-body" d={s.foot} />
                  <path className="pw-sock-body" d={s.leg} />
                  <path className={i ? "pw-sock-cuff pw-c2" : "pw-sock-cuff pw-c0"} d={s.cuff} />
                </g>
              ))}
              <path className="pw-water" d={machine.water} />
              <path className="pw-surface" d={machine.surface} />
              <path className="pw-ripple" d={machine.ripples} />
              <path className="pw-bubble" d={machine.bubbles} />
            </g>
            <path className="pw-glass-edge" d={machine.glass} />
            <path className="pw-shine" d={machine.shine} />
            <path className="pw-handle" d={machine.handle} />
          </g>
          <g data-tray="">
            <Solid paths={tray.body} tone="mid" crease="lo" className="pw-tray" />
            <Line d={tray.floor} tone="lo" />
            <Line d={tray.dividers} tone="lo" />
            {tray.socks.map((s, k) => (
              <g key={k}>
                <Solid paths={s.leg} tone="mid" crease="none" className="pw-sock" />
                <Solid paths={s.cuff} tone="mid" crease="none" className={`pw-sock pw-${CUFF_TONES[k]}`} />
                <Solid paths={s.foot} tone="mid" crease="none" className="pw-sock" />
              </g>
            ))}
            <path className="pw-empty" d={tray.empty} />
          </g>
          <g data-leader="">
            <Line d={callout.leader} tone="mid" />
            <Dots points={callout.leaderEnds} size={1.2} tone="hi" />
          </g>
          <g data-callout="">
            <Solid paths={callout.plate} tone="mid" crease="lo" />
            <path className="iso-line pw-lcd" data-tone="mid" d={callout.lcd} />
            <text className="pw-lcd-text" transform={callout.line1} fontSize={LINE1_SIZE} textAnchor="middle">
              {LINE1}
            </text>
            <text className="pw-lcd-text" transform={callout.line2} fontSize={LINE2_SIZE} textAnchor="middle">
              {LINE2}
            </text>
            {ODD ? <path className="pw-warn" d={callout.warn} /> : null}
          </g>
        </g>
        <Sparks points={contacts.length} />
      </g>
    </WashLive>
  );
}
