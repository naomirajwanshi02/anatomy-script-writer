import type { CSSProperties } from "react";
import { Dots, FaceText, Line, Solid } from "../../iso/react/draw";
import { Bulb } from "../../iso/react/bulb";
import { Sparks } from "../../iso/react/reel";
import {
  boardSvg,
  boardTop,
  contacts,
  doorSvg,
  engraveAt,
  ENGRAVE,
  ENGRAVE_SIZE,
  fanGlow,
  fans,
  fridge,
  GATE_LABEL_SIZE,
  gates,
  innerGlow,
  joints,
  knob,
  knobAt,
  knobTransform,
  LABEL_SIZE,
  labels,
  lamps,
  leds,
  leverAt,
  levers,
  gridSvg,
  padDots,
  padRings,
  rodPath,
  shade,
  shelfEdges,
  wires,
} from "./geometry";
import { DfLive } from "./live";

// Start state: doors shut, light off, square board, circuit hidden; the live loop writes every later state.
const dark = { "--lamp": 0 } as CSSProperties;

const Lever = ({ id }: { id: "l" | "r" }) => {
  const l = levers[id];
  return (
    <g data-lever={id}>
      <Solid paths={l.base} tone="mid" />
      <Line d={l.slot} tone="lo" />
      <Solid paths={l.pivot} tone="mid" />
      <path className="iso-line df-rod" data-tone="hi" data-rod="" d={rodPath(leverAt[id], 1)} />
      <g data-knob="" transform={knobTransform(knobAt(leverAt[id], 1))}>
        <Solid paths={knob} tone="hi" crease="lo" />
      </g>
    </g>
  );
};

const Wire = ({ id }: { id: keyof typeof wires }) => (
  <g data-wire={id} data-on={id === "l" || id === "r" ? "1" : "0"}>
    <path className="iso-line gate-trace" data-tone="lo" d={wires[id]} />
    <path className="iso-line gate-flow" data-tone="lit" data-flow="" d={wires[id]} />
  </g>
);

// Gate parts, shown step by step by the loop: the block, the gate shape (symbol and leads), the bubbles; the OR row
// also carries its NAND form for the morph.
const Gate = ({ id }: { id: "nand" | "or" }) => {
  const g = gates[id];
  return (
    <>
      <g data-part={`${id}-block`} style={{ opacity: 0 }}>
        {g.pins.map((p, i) => (
          <g key={i}>
            <Solid paths={p.drop} tone="hi" crease="lo" />
            <Solid paths={p.arm} tone="hi" crease="lo" />
          </g>
        ))}
        <path className="iso-halo" d={g.halo} style={{ filter: "blur(3px)" }} />
        <Solid paths={g.body} tone="mid" />
      </g>
      <g data-part={`${id}-shape`} className="df-sym" style={{ opacity: 0 }}>
        <path className="iso-line" data-tone="hi" d={g.symbol.body} />
        <Line d={g.symbol.leads} tone="mid" />
      </g>
      <g data-part={`${id}-bubble`} className="df-sym" style={{ opacity: 0 }}>
        <Line d={g.symbol.bubbles} tone="hi" />
      </g>
      {id === "or" ? (
        <g data-part="or-nand" className="df-sym" style={{ opacity: 0 }}>
          <path className="iso-line" data-tone="hi" d={g.asNand.body} />
          <Line d={g.asNand.bubbles} tone="hi" />
          <Line d={g.asNand.leads} tone="mid" />
        </g>
      ) : null}
    </>
  );
};

const Lamp = ({ id }: { id: "nand" | "or" }) => (
  <>
    <g data-led={id} style={dark}>
      <Bulb parts={lamps[id]} />
    </g>
    <circle className="df-bulb-glow bulb-glow" data-glow={id} cx={lamps[id].glowAt[0].toFixed(1)} cy={lamps[id].glowAt[1].toFixed(1)} r={lamps[id].glowR.toFixed(1)} fill="url(#df-bulb-glow)" style={{ opacity: 0 }} />
  </>
);

export function DfArt() {
  return (
    <DfLive>
      <defs>
        <clipPath id="df-cavity">
          <path d={fridge.opening} />
        </clipPath>
        <clipPath id="df-board-top">
          <path d={boardTop} />
        </clipPath>
        <radialGradient id="df-shade" gradientUnits="userSpaceOnUse" cx={shade.cx.toFixed(1)} cy={shade.cy.toFixed(1)} r={shade.r.toFixed(1)}>
          <stop offset="0" stopColor="#e2d0ad" stopOpacity="1" />
          <stop offset="0.55" stopColor="#ecdcbc" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ecdcbc" stopOpacity="0" />
        </radialGradient>
        {(["left", "right"] as const).map((k) => (
          <radialGradient key={k} id={`df-fan-${k}`} gradientUnits="userSpaceOnUse" cx={fanGlow[k].cx.toFixed(1)} cy={fanGlow[k].cy.toFixed(1)} r={fanGlow[k].r.toFixed(1)}>
            <stop offset="0" stopColor="#fffdf2" stopOpacity="0.85" />
            <stop offset="0.6" stopColor="#fffdf2" stopOpacity="0.5" />
            <stop offset="1" stopColor="#fffdf2" stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>
      <g data-zoom="">
      <g data-entry="">
        <g data-base="">
          <g data-board="" dangerouslySetInnerHTML={{ __html: boardSvg(0) }} />
          <g className="df-engrave" data-engrave="">
            <FaceText transform={engraveAt(0)} size={ENGRAVE_SIZE} tone="mid" anchor="middle">
              {ENGRAVE}
            </FaceText>
          </g>
          {/* Fridge floor light: warm shade around the fridge, white fans out of each open door. */}
          <g data-floor-light="" clipPath="url(#df-board-top)">
            <rect className="df-shade" x="0" y="0" width="100%" height="100%" fill="url(#df-shade)" />
            <g data-light="" style={dark}>
              <path className="df-pool" data-fan="left" d={fans.left} fill="url(#df-fan-left)" />
              <path className="df-pool" data-fan="right" d={fans.right} fill="url(#df-fan-right)" />
            </g>
          </g>
        </g>
        <g data-parts="">
          <g data-fridge="">
            <g data-light="" style={dark}>
              <path className="iso-halo" d={fridge.halo} style={{ filter: "blur(3px)" }} />
              {fridge.feet.map((p, i) => (
                <Solid key={i} paths={p} tone="mid" crease="lo" className="df-foot" />
              ))}
              <Solid paths={fridge.body} tone="mid" crease="lo" />
              <path className="df-gasket-band" d={fridge.gasketBand} />
              <path className="df-toe" d={fridge.toeKick} />
              <path className="df-toe-slot" d={fridge.toeSlots} />
              {/* Cavity behind the doors, clipped to the opening. */}
              <path className="df-gap" d={fridge.opening} />
              <g clipPath="url(#df-cavity)">
                <path className="df-back" d={fridge.back} />
                <path className="df-wash" d={fridge.back} fill="url(#df-wash-t)" />
                <path className="df-wall" d={fridge.left} />
                <path className="df-wash" d={fridge.left} fill="url(#df-wash-l)" />
                <path className="df-floor" d={fridge.floor} />
                <path className="df-wash" d={fridge.floor} fill="url(#df-wash-b)" />
                <Solid paths={fridge.carton} tone="mid" crease="lo" className="df-item" />
                <Solid paths={fridge.shelves[0]} tone="mid" crease="none" className="df-shelf" />
                <Solid paths={fridge.bottle} tone="mid" crease="lo" className="df-item" />
                <Solid paths={fridge.bottleNeck} tone="mid" crease="lo" className="df-item" />
                <Solid paths={fridge.shelves[1]} tone="mid" crease="none" className="df-shelf" />
                <Solid paths={fridge.jar} tone="mid" crease="lo" className="df-item" />
                <circle className="df-wash" cx={innerGlow.cx.toFixed(1)} cy={innerGlow.cy.toFixed(1)} r={innerGlow.r.toFixed(1)} fill="url(#df-glow)" />
                <path className="df-shelf-edge" d={shelfEdges} />
                {/* LED strips: ceiling bar and side-wall strips near the front. */}
                <path className="df-led-bloom" d={leds.left + leds.ceiling} />
                <path className="df-led" d={leds.right} />
                <path className="df-led" d={leds.left} />
                <path className="df-led" d={leds.ceiling} />
              </g>
              <path className="df-rim" d={fridge.opening} />
              <path className="df-door-bloom" d={fridge.opening} />
              {/* Freezer drawer. */}
              <Solid paths={fridge.drawer} tone="mid" crease="lo" />
              <path className="df-handle" d={fridge.drawerStand + fridge.drawerHandle} />
              <path className="df-handle-hi" d={fridge.drawerHandle} />
              {/* Doors (rebuilt by the loop while they swing). */}
              <g data-door="left" dangerouslySetInnerHTML={{ __html: doorSvg("left", 0) }} />
              <g data-door="right" dangerouslySetInnerHTML={{ __html: doorSvg("right", 0) }} />
            </g>
          </g>
          {/* Zoom-out: the grid of NAND tiles round the shrunken circuit. */}
          <g data-grid="" style={{ opacity: 0, display: "none" }} dangerouslySetInnerHTML={{ __html: gridSvg }} />
          <g data-circuit="" style={{ opacity: 0, display: "none" }}>
          <g data-shrink="">
            <Wire id="l" />
            <Wire id="r" />
            <g data-part="or-out" style={{ opacity: 0 }}>
              <Wire id="or" />
            </g>
            <g data-part="nand-out" style={{ opacity: 0 }}>
              <Wire id="nand" />
            </g>
            <Line d={padRings} tone="mid" />
            <Dots points={padDots} size={0.6} tone="hi" />
            <Dots points={joints} size={1.2} tone="hi" />
            <g className="df-lever-name">
              <FaceText transform={labels.l} size={LABEL_SIZE} tone="hi">
                L
              </FaceText>
              <FaceText transform={labels.r} size={LABEL_SIZE} tone="hi">
                R
              </FaceText>
            </g>
            <g className="df-gate-name">
              <g data-part="nand-label" style={{ opacity: 0 }}>
                <FaceText transform={labels.nand} size={GATE_LABEL_SIZE} tone="hi">
                  NAND
                </FaceText>
              </g>
              <g data-part="or-label" style={{ opacity: 0 }}>
                <FaceText transform={labels.or} size={GATE_LABEL_SIZE} tone="hi">
                  OR + bubbles
                </FaceText>
              </g>
              <g data-part="or-label-nand" style={{ opacity: 0 }}>
                <FaceText transform={labels.or} size={GATE_LABEL_SIZE} tone="hi">
                  NAND
                </FaceText>
              </g>
            </g>
            <Lever id="l" />
            <Lever id="r" />
            {/* Back row first (rule one), then the front row (rule two). */}
            <Gate id="or" />
            <g data-part="or-lamp" style={{ opacity: 0 }}>
              <Lamp id="or" />
            </g>
            <Gate id="nand" />
            <g data-part="nand-lamp" style={{ opacity: 0 }}>
              <Lamp id="nand" />
            </g>
          </g>
          </g>
        </g>
        <Sparks points={contacts.length} />
      </g>
      </g>
    </DfLive>
  );
}
