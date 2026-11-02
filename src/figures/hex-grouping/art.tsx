import { Dots, FaceText, Line, Solid } from "../../iso/react/draw";
import { Sparks } from "../../iso/react/reel";
import { BLOCK_CHAR, blocks, boardEngrave, boardSvg, CALL_CHAR, callout, CALLING_SIZE, CHAR_SIZE, contacts, cord, ENGRAVE, ENGRAVE_SIZE, KEY_SIZE, phone, SCREEN_CALL_SIZE, SCREEN_CHAR, screenCalling, screenDigit, WEIGHT_SIZE } from "./geometry";
import { CALLER, DIGITS, HEX, WEIGHTS } from "./model";
import { HexLive } from "./live";
import { monitor } from "./without";
import { DeskLegs, DeskPool, DeskSparks, EngineerOnChair, Keyboard, Monitor, ThoughtBubble } from "./without-art";

// Static art: the board (rises; stretched by the loop), desk phone and callout plate (fall), tiles and hex blocks,
// sparks; then the without-it desk scene. Tiles, the board and the desk legs are rebuilt into their slots by the loop.
export function HexArt() {
  return (
    <HexLive>
      <defs>
        <clipPath id="hex-clip-phone" clipPathUnits="userSpaceOnUse">
          <path d={phone.clip} />
        </clipPath>
        <clipPath id="hex-clip-callout" clipPathUnits="userSpaceOnUse">
          <path d={callout.clip} />
        </clipPath>
        <clipPath id="hex-clip-wall" clipPathUnits="userSpaceOnUse">
          <path d={monitor.glass} />
        </clipPath>
      </defs>
      <g data-entry="">
        <g data-base="">
          <DeskLegs />
          <g data-board="" dangerouslySetInnerHTML={{ __html: boardSvg(0) }} />
          <g data-engrave="" className="hex-engrave">
            <FaceText transform={boardEngrave(0)} size={ENGRAVE_SIZE} tone="mid" anchor="middle">
              {ENGRAVE}
            </FaceText>
          </g>
          <path className="hex-pool" d={phone.pool} fill="url(#hex-blue-pool)" style={{ opacity: 0 }} />
          <DeskPool />
        </g>
        <g data-parts="">
          <g data-leader="">
            <Line d={cord} tone="mid" />
          </g>
          <g clipPath="url(#hex-clip-phone)">
          <g data-phone="">
            <path className="iso-halo" d={phone.halo} style={{ filter: "blur(3px)" }} />
            <Solid paths={phone.plinth} tone="mid" crease="lo" />
            <Solid paths={phone.deck} tone="mid" crease="lo" />
            <Line d={phone.grille} tone="mid" />
            <Solid paths={phone.body} tone="mid" crease="lo" />
            <Line d={phone.lip} tone="lo" />
            <Line d={phone.cradle} tone="lo" />
            {phone.saddles.map((p, i) => (
              <Solid key={i} paths={p} tone="mid" />
            ))}
            <Solid paths={phone.hook} tone="mid" />
            <Solid paths={phone.cups[0].base} tone="mid" />
            <Solid paths={phone.cups[0].bowl} tone="mid" />
            <Dots points={phone.cups[0].holes} size={0.45} tone="hi" />
            <Solid paths={phone.grip} tone="mid" />
            <Solid paths={phone.cups[1].base} tone="mid" />
            <Solid paths={phone.cups[1].bowl} tone="mid" />
            <Dots points={phone.cups[1].holes} size={0.45} tone="hi" />
            <Solid paths={phone.antennaBase} tone="mid" />
            <Solid paths={phone.antenna} tone="mid" />
            <Solid paths={phone.antennaTip} tone="mid" />
            <Solid paths={phone.screenBezel} tone="hi" className="hex-glass" />
            <path className="hex-lit" d="" />
            <path className="hex-flash" d="" style={{ opacity: 0 }} />
            <g className="hex-screen-text" style={{ opacity: 0 }}>
              {DIGITS.map((d, i) => (
                <text key={i} data-screen={i} className="hex-lcd-text" transform={screenDigit(i)} fontSize={SCREEN_CHAR} textAnchor="middle">
                  {d}
                </text>
              ))}
              <text data-screen-calling="" className="hex-lcd-text" transform={screenCalling} fontSize={SCREEN_CALL_SIZE} style={{ opacity: 0 }}>
                CALLING {CALLER}
              </text>
            </g>
            <Line d={phone.navRing} tone="mid" />
            <Solid paths={phone.ok} tone="mid" />
            {phone.keys.map((k) => (
              <g key={k.k} data-key={k.k}>
                <Solid paths={k.body} tone="mid" crease="lo" />
                <path className="hex-accent hex-key-accent" d={k.top} />
                <FaceText transform={k.text} size={KEY_SIZE} tone="hi" anchor="middle">
                  {k.label}
                </FaceText>
              </g>
            ))}
          </g>
          </g>
          <g data-leader="">
            <Line d={callout.leader} tone="mid" />
            <Dots points={callout.leaderEnds} size={1.2} tone="hi" />
          </g>
          <g clipPath="url(#hex-clip-callout)">
          <g data-phone="">
            <Solid paths={callout.plate} tone="mid" crease="lo" />
            <path className="iso-line hex-lcd" data-tone="mid" d={callout.lcd} />
            <path className="hex-warn" d={callout.warn} style={{ opacity: 0 }} />
            <path className="hex-gap" d={callout.gaps} style={{ opacity: 0 }} />
            {DIGITS.map((d, i) => (
              <text key={i} data-callout={i} className="hex-lcd-text" transform="" fontSize={CALL_CHAR} textAnchor="middle" style={{ display: "none" }}>
                {d}
              </text>
            ))}
            <text data-calling="" className="hex-lcd-text hex-calling" transform={callout.calling} fontSize={CALLING_SIZE} textAnchor="middle" style={{ opacity: 0 }}>
              Calling {CALLER}
            </text>
          </g>
          </g>
          {blocks.map((b, k) => (
            <g key={k} data-block={k} style={{ display: "none" }}>
              <path className="iso-halo" d={b.halo} style={{ filter: "blur(3px)" }} />
              <Solid paths={b.body} tone="mid" />
              <FaceText transform={b.text} size={BLOCK_CHAR} tone="hi" anchor="middle">
                {HEX[k]}
              </FaceText>
            </g>
          ))}
          {DIGITS.map((d, i) => (
            <g key={i} data-tile={i} style={{ display: "none" }}>
              <g data-slot="" />
              <FaceText transform="" size={CHAR_SIZE} tone="hi" anchor="middle">
                {d}
              </FaceText>
            </g>
          ))}
          {/* Place values floating in front of each group in turn (8 4 2 1; the 1-bits lit rust). The sums are drawn by hand. */}
          {Array.from({ length: 8 }, (_, i) => (
            <text key={i} data-weight={i} className="hex-weight" transform="" fontSize={WEIGHT_SIZE} textAnchor="middle" style={{ opacity: 0 }}>
              {WEIGHTS[i % 4]}
            </text>
          ))}
          {/* Without-it scene: monitor, keyboard, engineer and chair fall in together; the bubble pops in after. */}
          <g data-desk-parts="" style={{ display: "none" }}>
            <Monitor />
            <Keyboard />
            <EngineerOnChair />
          </g>
          <ThoughtBubble />
          <DeskSparks />
        </g>
        <Sparks points={contacts.length} />
      </g>
    </HexLive>
  );
}
