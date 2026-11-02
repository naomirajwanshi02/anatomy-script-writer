import type { CSSProperties } from "react";
import { FaceText, Line, Solid } from "../../iso/react/draw";
import { Bulb } from "../../iso/react/bulb";
import { Sparks } from "../../iso/react/reel";
import {
  boardEngrave,
  boardSvg,
  brand,
  BRAND_SIZE,
  contacts,
  digits,
  DIGIT_SIZE,
  ENGRAVE,
  ENGRAVE_SIZE,
  gates,
  gaugeFace,
  LABEL_SIZE,
  labels,
  lamp,
  lampXform,
  neighbour,
  neighbourPads,
  plinth,
  sign,
  STREAKS,
  wirePads,
} from "./geometry";
import { BRAND } from "./model";
import { NmLive } from "./live";

const hidden = { opacity: 0, display: "none" } as CSSProperties;
const dark = { "--lamp": 0 } as CSSProperties;

// Static art: the board (rises) with the folding road; the gauge extras, cars, wires, gates, lamp, sign, wind streaks
// and the readout. The live loop writes every later state (the road panel and the cars are rebuilt as they move).
export function NmArt() {
  return (
    <NmLive>
      <g data-entry="">
        <g data-base="">
          <g data-board="" dangerouslySetInnerHTML={{ __html: boardSvg }} />
          <g className="nm-engrave">
            <FaceText transform={boardEngrave} size={ENGRAVE_SIZE} tone="mid" anchor="middle">
              {ENGRAVE}
            </FaceText>
          </g>
          {/* Backing board of the upright scale. */}
          <g data-plinth="" style={hidden}>
            <Solid paths={plinth} tone="hi" crease="lo" className="nm-col" />
          </g>
          {/* The road (folds up into the scale): tarmac, hatched strip, speckles, edge and lane lines. */}
          <g data-panel="">
            <path className="nm-tar" data-pp="base" />
            <path className="nm-strip" data-pp="strip" />
            <path className="nm-hr" data-pp="hatchRoad" />
            <path className="nm-speck" data-pp="speck" />
            <path className="nm-white" data-pp="edges" />
            <path className="nm-white nm-lane" data-pp="lanes" />
          </g>
          {/* Scale extras on the upright road: band flash, lane-line glows, gap flash and margin fills. */}
          <g data-face="" style={hidden}>
            <path className="nm-flash" data-g="bandFlash" d={gaugeFace.band1} style={{ opacity: 0 }} />
            <path className="nm-fill" data-g="bfill1" style={{ opacity: 0 }} />
            <path className="nm-fill" data-g="bfill0" style={{ opacity: 0 }} />
            <path className="nm-fill" data-g="gap" style={{ opacity: 0 }} />
            <path className="nm-lineglow" data-g="glow6" d={gaugeFace.glow6} style={{ opacity: 0 }} />
            <path className="nm-lineglow" data-g="glow4" d={gaugeFace.glow4} style={{ opacity: 0 }} />
            <g data-g="ticks">
              <path className="nm-minor" d={gaugeFace.minor} />
              <path className="nm-major" d={gaugeFace.major} />
            </g>
            <g className="nm-scale" data-g="labels">
              <FaceText transform={labels.one} size={LABEL_SIZE} tone="hi" anchor="end">
                1 V
              </FaceText>
              <FaceText transform={labels.zero} size={LABEL_SIZE} tone="hi" anchor="end">
                0 V
              </FaceText>
            </g>
            <g className="nm-scale" data-g="label6" style={{ opacity: 0 }}>
              <FaceText transform={labels.six} size={LABEL_SIZE} tone="hi" anchor="end">
                0.6
              </FaceText>
            </g>
            <g className="nm-scale" data-g="label4" style={{ opacity: 0 }}>
              <FaceText transform={labels.four} size={LABEL_SIZE} tone="hi" anchor="end">
                0.4
              </FaceText>
            </g>
            <g className="nm-digit" data-g="digit1" style={{ opacity: 0 }}>
              <FaceText transform={digits.one} size={DIGIT_SIZE} tone="hi" anchor="middle">
                1
              </FaceText>
            </g>
            <g className="nm-digit" data-g="digit0" style={{ opacity: 0 }}>
              <FaceText transform={digits.zero} size={DIGIT_SIZE} tone="hi" anchor="middle">
                0
              </FaceText>
            </g>
          </g>
        </g>
        <g data-parts="">
          {/* The cars (rebuilt every frame as they ride the road and the fold): sepia (0 lane), rust (our 1), ghost. */}
          <g data-car="sepia" />
          <g data-car="rust" />
          <g data-car="ghost" className="nm-ghost" style={hidden} />
          {/* Safety-room double arrows on the tarmac: pale engraved line over a dark cut. */}
          <g data-g="bracket1" className="nm-bracket">
            <path className="nm-cut" data-b="cut" />
            <path className="nm-ink" data-b="ink" />
          </g>
          <g data-g="bracket0" className="nm-bracket">
            <path className="nm-cut" data-b="cut" />
            <path className="nm-ink" data-b="ink" />
          </g>
          {/* Neighbour wire (faint, flickering), our wire (trace, rust flow while it carries a 1). */}
          <g data-neighbour="" style={hidden}>
            <path className="nm-neighbour" d={neighbour} />
            <Line d={neighbourPads} tone="lo" />
          </g>
          <g data-wire="" data-on="0" style={hidden}>
            <path className="iso-line gate-trace" data-tone="mid" data-w="trace" />
            <path className="iso-line gate-flow" data-tone="lit" data-flow="" data-w="flow" />
            <Line d={wirePads} tone="mid" />
          </g>
          {/* Sending gate (left); receiving gate with its lamp (right). */}
          <g data-gate="0" style={hidden}>
            <g data-lift="">
              <Solid paths={gates[0].body} tone="hi" crease="lo" className="nm-gate" />
              <path className="nm-sym" d={gates[0].sym} />
            </g>
          </g>
          <g data-gate="1" style={hidden}>
            <g data-lift="">
              <Solid paths={gates[1].body} tone="hi" crease="lo" className="nm-gate" />
              <path className="nm-sym" d={gates[1].sym} />
            </g>
            <g transform={lampXform}>
              <circle className="nm-bulb-glow bulb-glow" data-glow="" cx={lamp.glowAt[0].toFixed(1)} cy={lamp.glowAt[1].toFixed(1)} r={lamp.glowR.toFixed(1)} fill="url(#nm-bulb-glow)" style={{ opacity: 0 }} />
              <g data-led="" style={dark}>
                <Bulb parts={lamp} />
              </g>
            </g>
          </g>
          {/* ROLLIN road sign on the right verge. */}
          <g data-sign="">
            <Solid paths={sign.post} tone="hi" crease="none" className="nm-post" />
            <Solid paths={sign.plate} tone="hi" crease="lo" className="nm-sign" />
            <g className="nm-brand">
              <FaceText transform={brand} size={BRAND_SIZE} tone="hi" anchor="middle">
                {BRAND}
              </FaceText>
            </g>
          </g>
          {/* Wind streaks: the road gusts (ghost, car) and the gauge gusts (noise, strong). */}
          {(["ghost", "car", "noise", "big"] as const).map((k) =>
            STREAKS.map((s, i) => <path key={`${k}${i}`} className="nm-streak" data-tone={s.tone} data-streak={`${k}${i}`} style={hidden} />),
          )}
          {/* Voltage readout beside the rust car (Oxanium, tabular digits), value in rust. */}
          <g data-readout="" style={hidden}>
            <rect className="nm-ro-box" x="0" y="-17" width="86" height="34" rx="5" />
            <text className="nm-ro" x="8" y="9.5">
              <tspan className="nm-ro-val" data-ro-val="">
                0.0
              </tspan>
              <tspan className="nm-ro-unit"> V</tspan>
            </text>
          </g>
        </g>
        <Sparks points={contacts.length} />
      </g>
    </NmLive>
  );
}
