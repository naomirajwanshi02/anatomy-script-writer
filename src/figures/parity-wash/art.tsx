import { Dots, FaceText, Line, Solid } from "../../iso/react/draw";
import { Sparks } from "../../iso/react/reel";
import {
  boardEngrave,
  boardSvg,
  BRAND_SIZE,
  CALL_SIZE,
  callout,
  circuit,
  contacts,
  dialPointer,
  doorSvg,
  ENGRAVE,
  ENGRAVE_SIZE,
  LABEL_SIZE,
  machine,
  PANEL_TEXT,
  rack,
  slotOutline,
  SOCK_TONES,
  sockSvg,
  TILE_CHAR,
  tray,
} from "./geometry";
import { BRAND, SLOTS, SOCKS } from "./model";
import { WashLive } from "./live";

const SLOT_LIST = Array.from({ length: SLOTS }, (_, k) => k);

// Static art: the board (rises; stretched by the loop), the washing machine, sock tray and callout (fall), the circuit
// tiles, CHECK panel and labels, sparks. The door, drum, board and tiles are rebuilt into their slots by the loop.
export function WashArt() {
  return (
    <WashLive>
      <defs>
        <clipPath id="pw-clip-machine" clipPathUnits="userSpaceOnUse">
          <path d={machine.clip} />
        </clipPath>
        <clipPath id="pw-clip-tray" clipPathUnits="userSpaceOnUse">
          <path d={tray.clip} />
        </clipPath>
        <clipPath id="pw-clip-callout" clipPathUnits="userSpaceOnUse">
          <path d={callout.clip} />
        </clipPath>
        <clipPath id="pw-clip-mouth" clipPathUnits="userSpaceOnUse">
          <path d={machine.mouth} />
        </clipPath>
      </defs>
      <g data-entry="">
        <g data-base="">
          <g data-board="" dangerouslySetInnerHTML={{ __html: boardSvg(0) }} />
          <g data-engrave="" className="pw-engrave">
            <FaceText transform={boardEngrave(0)} size={ENGRAVE_SIZE} tone="mid" anchor="middle">
              {ENGRAVE}
            </FaceText>
          </g>
          <path className="pw-pool" d={machine.pool} fill="url(#pw-blue-pool)" />
        </g>
        <g data-parts="">
          {/* Washing machine: cabinet, panel, drum behind the mouth. */}
          <g data-clip="url(#pw-clip-machine)">
            <g data-sink="">
              <g data-shake="">
                <path className="iso-halo" d={machine.halo} style={{ filter: "blur(3px)" }} />
                {machine.feet.map((p, i) => (
                  <Solid key={i} paths={p} tone="mid" crease="lo" className="pw-foot" />
                ))}
                <Solid paths={machine.body} tone="mid" crease="lo" />
                <path className="pw-line" d={machine.panelLine} />
                <path className="pw-panel" d={machine.panel} />
                <path className="pw-tick" d={machine.dialTicks} />
                <path className="pw-dial-shadow" d={machine.dialShadow} />
                <path className="pw-dial" d={machine.dial} />
                <path className="pw-dial-cap" d={machine.dialCap} />
                <path className="pw-tick pw-pointer" d={dialPointer(0)} />
                <g className="pw-brand">
                  <FaceText transform={machine.brand} size={BRAND_SIZE} tone="mid" anchor="middle">
                    {BRAND}
                  </FaceText>
                </g>
                <path className="pw-spin" d={machine.spin} />
                <path className="pw-spin pw-on" d={machine.spin} style={{ opacity: 0 }} />
                <path className="pw-check" d={machine.check} />
                <path className="pw-check pw-on" d={machine.check} style={{ opacity: 0 }} />
                <FaceText transform={machine.spinText} size={PANEL_TEXT} tone="mid" anchor="middle">
                  SPIN
                </FaceText>
                <FaceText transform={machine.checkText} size={PANEL_TEXT} tone="mid" anchor="middle">
                  CHECK
                </FaceText>
                <path className="pw-mouth-rim" d={machine.mouthRim} />
                <path className="pw-mouth" d={machine.mouth} />
                <g clipPath="url(#pw-clip-mouth)">
                  <path className="pw-drum-back" d={machine.drumBack} />
                  <g data-drum="" />
                </g>
              </g>
            </g>
          </g>
          {/* Sock tray with the socks resting in their slots. */}
          <g data-clip="url(#pw-clip-tray)">
            <g data-sink="">
              <Solid paths={tray.body} tone="mid" crease="lo" className="pw-tray" />
              <Line d={tray.floor} tone="lo" />
              <Line d={tray.dividers} tone="lo" />
              {/* The sock left alone (rust) and the empty slot after the wash (red dashes), under the socks. */}
              {SLOT_LIST.map((k) => (
                <path key={k} className="pw-slot" data-slot-mark={k} d={slotOutline(k)} />
              ))}
              {SLOT_LIST.map((k) => (
                <g key={k} data-rest={k} style={{ display: k < SLOTS - 1 ? "" : "none" }} dangerouslySetInnerHTML={{ __html: sockSvg(k, SOCK_TONES[k]) }} />
              ))}
              {/* Rack: posts and the bar the socks hang from. */}
              <path className="pw-rack-post" d={rack.posts} />
              <path className="pw-rack-bar" d={rack.bar} />
              {/* Pairs: an arc over each two counted socks (rebuilt by the loop). */}
              <path className="pw-arc" data-sock-arcs="" d="" />
            </g>
          </g>
          {/* Door: drawn after the tray so it swings out in front of it. */}
          <g data-clip="url(#pw-clip-machine)">
            <g data-sink="">
              <g data-shake="">
                <g data-door="" dangerouslySetInnerHTML={{ __html: doorSvg(0) }} />
              </g>
            </g>
          </g>
          {/* Socks in flight between the tray and the drum. */}
          <g>
            {SLOT_LIST.map((k) => (
              <g key={k} data-fly={k} style={{ display: "none" }} dangerouslySetInnerHTML={{ __html: sockSvg(k, SOCK_TONES[k]) }} />
            ))}
          </g>
          <g data-leader="">
            <Line d={callout.leader} tone="mid" />
            <Dots points={callout.leaderEnds} size={1.2} tone="hi" />
          </g>
          <g data-clip="url(#pw-clip-callout)">
            <g data-sink="">
              <Solid paths={callout.plate} tone="mid" crease="lo" />
              <path className="iso-line pw-lcd" data-tone="mid" d={callout.lcd} />
              {/* Callout: the live count, then the verdict (written by the loop). */}
              {[0, 1].map((i) => (
                <text key={i} data-call={i} className="pw-lcd-text" transform={callout.lines[i]} fontSize={CALL_SIZE[i]} textAnchor="middle">
                  {i ? "" : `${SOCKS} socks`}
                </text>
              ))}
              <path className="pw-warn" data-call-warn="" d={callout.warn} style={{ opacity: 0 }} />
            </g>
          </g>
          {/* Circuit: wires, CHECK block and lamp, labels, parity outline, outlines round the bit left alone and the
              wrong word. */}
          <g data-circuit="" style={{ opacity: 0 }}>
            <path className="iso-line gate-trace" data-tone="lo" d={circuit.wires} />
            <Line d={circuit.link} tone="lo" />
            <path className="pw-parity" d={circuit.parity} />
            <path className="pw-missed" data-wrong="" d={circuit.wrong} style={{ opacity: 0 }} />
            <g data-lamp="">
              <path className="pw-lamp-pool" d={circuit.lampPool} fill="url(#pw-red-pool)" />
              <Solid paths={circuit.panel} tone="mid" crease="lo" />
              <Solid paths={circuit.lampBase} tone="mid" crease="lo" className="pw-lamp-base" />
              <Solid paths={circuit.lamp} tone="mid" crease="lo" className="pw-lamp" />
            </g>
            <g className="pw-labels">
              {circuit.labels.map((l) => (
                <FaceText key={l.text} transform={l.m} size={LABEL_SIZE} tone="mid" anchor="middle">
                  {l.text}
                </FaceText>
              ))}
            </g>
          </g>
          {/* Bits on their wires (rebuilt by the loop). */}
          <g data-dots="" />
          {/* The bit left alone: rust outline round its foot, under the tiles. */}
          <path className="pw-alone" data-tile-alone="" d="" />
          {/* Tiles: sent row (0-7) then received row (8-15), back to front. */}
          {[0, 1].flatMap((row) =>
            SLOT_LIST.map((i) => (
              <g key={`${row}-${i}`} data-tile={`${row}-${i}`} className="pw-tile" style={{ display: "none" }}>
                <g data-slot="" />
                <FaceText transform="" size={TILE_CHAR} tone="hi" anchor="middle">
                  0
                </FaceText>
              </g>
            )),
          )}
          {/* Pairs: an arc over each two counted 1s, rebuilt by the loop. */}
          <path className="pw-arc" data-tile-arcs="" d="" />
          <g data-unknown="" className="pw-unknown" style={{ opacity: 0 }}>
            {circuit.unknown.map(([x, y], i) => (
              <text key={i} x={x.toFixed(1)} y={y.toFixed(1)} textAnchor="middle">
                ?
              </text>
            ))}
          </g>
          <g data-spark="" />
        </g>
        <Sparks points={contacts.length} />
      </g>
    </WashLive>
  );
}
