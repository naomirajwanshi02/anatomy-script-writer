import { Dots, FaceText, Line, Solid } from "../../iso/react/draw";
import { Sparks } from "../../iso/react/reel";
import { boardEngrave, boardSvg, BRAND_SIZE, CALL_CHAR, callout, clock, contacts, COUNTER_SIZE, ENGRAVE, ENGRAVE_SIZE, gearbox, gearPaths, LABEL_SIZE, LAMP_TEXT, segPaths, threeWarn, TILE_CHAR, TILE_ORDER, trays, WIN_CHAR, windows } from "./geometry";
import { BINARY, BRAND, DIGITS, THREE_BOX } from "./model";
import { BcdLive } from "./live";

// Static art: the board (rises; stretched by the loop), the alarm clock and callout plate (fall), the circuit trays,
// labels and tiles, sparks. Tiles and the board are rebuilt into their slots by the loop.
export function BcdArt() {
  return (
    <BcdLive>
      <defs>
        <clipPath id="bcd-clip-clock" clipPathUnits="userSpaceOnUse">
          <path d={clock.clip} />
        </clipPath>
        <clipPath id="bcd-clip-callout" clipPathUnits="userSpaceOnUse">
          <path d={callout.clip} />
        </clipPath>
      </defs>
      <g data-entry="">
        <g data-base="">
          <g data-board="" dangerouslySetInnerHTML={{ __html: boardSvg(0) }} />
          <g data-engrave="" className="bcd-engrave">
            <FaceText transform={boardEngrave(0)} size={ENGRAVE_SIZE} tone="mid" anchor="middle">
              {ENGRAVE}
            </FaceText>
          </g>
          <path className="bcd-pool" d={clock.pool} fill="url(#bcd-blue-pool)" style={{ opacity: 0 }} />
        </g>
        <g data-parts="">
          <g clipPath="url(#bcd-clip-clock)">
            <g data-sink="clock">
              <g data-shake="">
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
                <path className="bcd-glass-off" d={clock.glass} />
                <path className="bcd-lit" d="" />
                <path className="bcd-flash" d="" style={{ opacity: 0 }} />
                <g className="bcd-screen" style={{ opacity: 0 }}>
                  <path className="bcd-inner-shadow" d={clock.shadow} />
                  <path className="bcd-divider" d={clock.dividers} />
                  {segPaths.map((segs, k) => (
                    <g key={k} data-cell={k}>
                      {segs.map((d, i) => (
                        <path key={i} className="bcd-seg" d={d} />
                      ))}
                    </g>
                  ))}
                  <g data-colon="">
                    {clock.colon.map((d, i) => (
                      <path key={i} className="bcd-seg" d={d} />
                    ))}
                  </g>
                </g>
                <g data-bell="">
                  <path className="bcd-bell" d={clock.bell} />
                  <path className="bcd-bell" d={clock.clapper} />
                  <g className="bcd-bell-on" style={{ opacity: 0 }}>
                    <path className="bcd-bell bcd-on" d={clock.bell} />
                    <path className="bcd-bell bcd-on" d={clock.clapper} />
                  </g>
                </g>
                {clock.arcs.map((d, i) => (
                  <path key={i} className="bcd-arc" data-arc={i} d={d} style={{ opacity: 0 }} />
                ))}
                <path className="bcd-pm" d={clock.pm} />
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
            </g>
          </g>
          <g data-leader="">
            <Line d={callout.leader} tone="mid" />
            <Dots points={callout.leaderEnds} size={1.2} tone="hi" />
          </g>
          <g clipPath="url(#bcd-clip-callout)">
            <g data-sink="callout">
              <Solid paths={callout.plate} tone="mid" crease="lo" />
              <path className="iso-line bcd-lcd" data-tone="mid" d={callout.lcd} />
              {callout.boxes.map((d, k) => (
                <path key={k} className="bcd-box" data-box={k} d={d} />
              ))}
              <g data-callout-text="" style={{ opacity: 0 }}>
                {DIGITS.map((n, k) => (
                  <text key={k} data-callout={k} className="bcd-lcd-text" transform={callout.text[k]} fontSize={CALL_CHAR} textAnchor="middle">
                    {n}
                  </text>
                ))}
                <text className="bcd-lcd-text" transform={callout.colon} fontSize={CALL_CHAR} textAnchor="middle">
                  :
                </text>
              </g>
            </g>
          </g>
          <g data-circuit="" style={{ opacity: 0 }}>
            {trays.map((t, k) => (
              <g key={k} data-tray={k}>
                <Solid paths={t.body} tone="mid" crease="lo" />
                <path className="bcd-accent" d={t.accent} />
              </g>
            ))}
            <path className="bcd-warn" data-three="" d={threeWarn(THREE_BOX)} style={{ opacity: 0 }} />
          </g>
          {/* Key state: each box wired straight to its own small window. */}
          <g data-windows="" style={{ opacity: 0 }}>
            {windows.map((w, k) => (
              <g key={k} data-win={k}>
                <path className="iso-line gate-trace" data-tone="lo" d={w.wire} />
                <path className="iso-line gate-flow" data-tone="lit" d={w.wire} />
                <Solid paths={w.plate} tone="mid" crease="lo" />
                <path className="iso-line bcd-lcd" data-tone="mid" d={w.lcd} />
                <text className="bcd-lcd-text bcd-win-text" transform={w.text} fontSize={WIN_CHAR} textAnchor="middle">
                  {DIGITS[k]}
                </text>
              </g>
            ))}
          </g>
          {DIGITS.map((n, k) => (
            <g key={k} data-label={k} style={{ display: "none" }}>
              <FaceText transform="" size={LABEL_SIZE} tone="hi" anchor="middle">
                {n}
              </FaceText>
            </g>
          ))}
          {TILE_ORDER.map(({ k, i }) => (
            <g key={`${k}-${i}`} data-tile={`${k}-${i}`} style={{ display: "none" }}>
              <g data-slot="" />
              <FaceText transform="" size={TILE_CHAR} tone="hi" anchor="middle">
                {DIGITS[k]}
              </FaceText>
            </g>
          ))}
          {/* Plain binary: the minutes as one 5-tile number feed the divide-by-ten gear block. */}
          <g data-gwire="" style={{ display: "none" }}>
            <path className="iso-line gate-trace" data-tone="lo" d={gearbox.feed} />
            <path className="iso-line gate-flow" data-tone="lit" d={gearbox.feed} />
          </g>
          {BINARY.split("").map((b, i) => (
            <g key={i} data-bin={i} style={{ display: "none" }}>
              <g data-slot="" />
              <FaceText transform="" size={TILE_CHAR} tone={b === "1" ? "hi" : "lo"} anchor="middle">
                {b}
              </FaceText>
            </g>
          ))}
          <g data-gsink="" style={{ display: "none" }}>
            <Solid paths={gearbox.body} tone="mid" crease="lo" />
            {gearPaths(0).map((d, i) => (
              <path key={i} className="bcd-gear" data-gear={i} d={d} />
            ))}
            {gearbox.hubs.map((d, i) => (
              <path key={i} className="bcd-hub" d={d} />
            ))}
            <Dots points={gearbox.bolts} size={1} tone="hi" />
            <text className="bcd-counter" transform={gearbox.div} fontSize={COUNTER_SIZE} textAnchor="middle">
              ÷10
            </text>
            <text data-counter="" className="bcd-counter" transform={gearbox.counter} fontSize={COUNTER_SIZE} textAnchor="middle">
              tens 0
            </text>
          </g>
        </g>
        <Sparks points={contacts.length} />
      </g>
    </BcdLive>
  );
}
