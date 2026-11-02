import { Dots, FaceText, Line, Solid } from "../../iso/react/draw";
import { Sparks } from "../../iso/react/reel";
import { boardEngrave, boardSvg, BRAND_SIZE, CALL_CHAR, callout, clock, contacts, digits, ENGRAVE, ENGRAVE_SIZE, LAMP_TEXT } from "./geometry";
import { ALARM_ON, BRAND, COLON_ON, DIGITS, PM_ON } from "./model";
import { BcdLive } from "./live";

// Static art: the board (rises), the alarm clock and callout plate (fall), sparks. The scene is a frozen frame.
export function BcdArt() {
  return (
    <BcdLive>
      <g data-entry="">
        <g data-base="">
          <g data-board="" dangerouslySetInnerHTML={{ __html: boardSvg }} />
          <g className="bcd-engrave">
            <FaceText transform={boardEngrave} size={ENGRAVE_SIZE} tone="mid" anchor="middle">
              {ENGRAVE}
            </FaceText>
          </g>
          <path className="bcd-pool" d={clock.pool} fill="url(#bcd-blue-pool)" />
        </g>
        <g data-parts="">
          <g data-clock="">
            <path className="iso-halo" d={clock.halo} style={{ filter: "blur(3px)" }} />
            {clock.feet.map((p, i) => (
              <Solid key={i} paths={p} tone="mid" crease="lo" className="bcd-foot" />
            ))}
            <Solid paths={clock.body} tone="mid" crease="lo" />
            <Solid paths={clock.snooze} tone="mid" crease="lo" />
            <Line d={clock.snoozeRidge} tone="lo" />
            {clock.buttons.map((p, i) => (
              <Solid key={i} paths={p} tone="mid" crease="lo" />
            ))}
            <path className="bcd-bezel" d={clock.bezel} />
            <path className="bcd-glass" d={clock.glass} />
            <path className="bcd-inner-shadow" d={clock.shadow} />
            <path className="bcd-divider" d={clock.dividers} />
            {digits.map((segs, k) => (
              <g key={k} data-digit={DIGITS[k]}>
                {segs.map((s, i) => (
                  <path key={i} className={s.on ? "bcd-seg" : "bcd-seg bcd-seg-off"} d={s.d} />
                ))}
              </g>
            ))}
            {clock.colon.map((d, i) => (
              <path key={i} className={COLON_ON ? "bcd-seg" : "bcd-seg bcd-seg-off"} d={d} />
            ))}
            <path className={ALARM_ON ? "bcd-bell bcd-on" : "bcd-bell"} d={clock.bell} />
            <path className={ALARM_ON ? "bcd-bell bcd-on" : "bcd-bell"} d={clock.clapper} />
            <path className={PM_ON ? "bcd-pm bcd-on" : "bcd-pm"} d={clock.pm} />
            <FaceText transform={clock.pmText} size={LAMP_TEXT} tone="mid" anchor="middle">
              PM
            </FaceText>
            <FaceText transform={clock.bellText} size={LAMP_TEXT} tone="mid" anchor="middle">
              ALM
            </FaceText>
            <g className="bcd-brand">
              <FaceText transform={clock.brand} size={BRAND_SIZE} tone="mid" anchor="middle">
                {BRAND}
              </FaceText>
            </g>
          </g>
          <g data-leader="">
            <Line d={callout.leader} tone="mid" />
            <Dots points={callout.leaderEnds} size={1.2} tone="hi" />
          </g>
          <g data-callout="">
            <Solid paths={callout.plate} tone="mid" crease="lo" />
            <path className="iso-line bcd-lcd" data-tone="mid" d={callout.lcd} />
            {callout.boxes.map((d, k) => (
              <path key={k} className="bcd-box" d={d} />
            ))}
            {DIGITS.map((n, k) => (
              <text key={k} className="bcd-lcd-text" transform={callout.text[k]} fontSize={CALL_CHAR} textAnchor="middle">
                {n}
              </text>
            ))}
            <text className="bcd-lcd-text" transform={callout.colon} fontSize={CALL_CHAR} textAnchor="middle">
              :
            </text>
          </g>
        </g>
        <Sparks points={contacts.length} />
      </g>
    </BcdLive>
  );
}
