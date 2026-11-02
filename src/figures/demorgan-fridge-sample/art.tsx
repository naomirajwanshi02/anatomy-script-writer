import type { CSSProperties } from "react";
import { FaceText, Solid } from "../../iso/react/draw";
import { Sparks } from "../../iso/react/reel";
import { boardEngrave, boardSvg, BRAND_SIZE, contacts, door, ENGRAVE, ENGRAVE_SIZE, fan, fanGlow, fridge, innerGlow, leds, shade, shelfEdges, boardTop } from "./geometry";
import { BRAND, LAMP } from "./model";
import { DfLive } from "./live";

const lampStyle = { "--lamp": LAMP } as CSSProperties;

// Static art: the board (rises), the fridge (falls), sparks. The scene is a frozen frame.
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
        <radialGradient id="df-fan" gradientUnits="userSpaceOnUse" cx={fanGlow.cx.toFixed(1)} cy={fanGlow.cy.toFixed(1)} r={fanGlow.r.toFixed(1)}>
          <stop offset="0" stopColor="#fffdf2" stopOpacity="0.85" />
          <stop offset="0.6" stopColor="#fffdf2" stopOpacity="0.5" />
          <stop offset="1" stopColor="#fffdf2" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g data-entry="">
        <g data-base="">
          <g data-board="" dangerouslySetInnerHTML={{ __html: boardSvg }} />
          <g className="df-engrave">
            <FaceText transform={boardEngrave} size={ENGRAVE_SIZE} tone="mid" anchor="middle">
              {ENGRAVE}
            </FaceText>
          </g>
          <g clipPath="url(#df-board-top)">
            <rect className="df-shade" x="0" y="0" width="100%" height="100%" fill="url(#df-shade)" />
            <g data-lamp="" style={lampStyle}>
              <path className="df-pool" d={fan} fill="url(#df-fan)" />
            </g>
          </g>
        </g>
        <g data-parts="">
          <g data-fridge="" data-lamp="" style={lampStyle}>
            <path className="iso-halo" d={fridge.halo} style={{ filter: "blur(3px)" }} />
            {fridge.feet.map((p, i) => (
              <Solid key={i} paths={p} tone="mid" crease="lo" className="df-foot" />
            ))}
            <Solid paths={fridge.body} tone="mid" crease="lo" />
            {/* Cavity behind the open left door, clipped to the opening. */}
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
              <circle className="df-wash" cx={innerGlow.cx.toFixed(1)} cy={innerGlow.cy.toFixed(1)} r={innerGlow.r.toFixed(1)} fill="url(#df-glow)" />
              {/* LED strips: ceiling bar and side-wall strips near the front. */}
              <path className="df-shelf-edge" d={shelfEdges} />
              <path className="df-led-bloom" d={leds.left + leds.ceiling} />
              <path className="df-led" d={leds.right} />
              <path className="df-led" d={leds.left} />
              <path className="df-led" d={leds.ceiling} />
            </g>
            <path className="df-rim" d={fridge.opening} />
            <path className="df-door-bloom" d={fridge.opening} />
            {/* Freezer drawer and closed right door. */}
            <Solid paths={fridge.drawer} tone="mid" crease="lo" />
            <path className="df-handle" d={fridge.drawerStand + fridge.drawerHandle} />
            <path className="df-handle-hi" d={fridge.drawerHandle} />
            <Solid paths={fridge.rightDoor} tone="mid" crease="lo" />
            <path className="df-plate" d={fridge.plate} />
            <g className="df-brand">
              <FaceText transform={fridge.brand} size={BRAND_SIZE} tone="hi" anchor="middle">
                {BRAND}
              </FaceText>
            </g>
            <path className="df-handle" d={fridge.rightStand + fridge.rightHandle} />
            <path className="df-handle-hi" d={fridge.rightHandle} />
            {/* Open left door: handle behind it, then inner face (washed with LED light), free edge, top, gasket. */}
            <path className="df-handle" d={door.stand + door.handle} />
            <path className="df-handle-hi" d={door.handle} />
            <path className="df-door-inner" d={door.inner} />
            <path className="df-door-edge" d={door.edge} />
            <path className="df-door-top" d={door.top} />
            <path className="df-wash" d={door.inner} fill="url(#df-wash-r)" />
            <path className="df-gasket" d={door.gasket} />
          </g>
        </g>
        <Sparks points={contacts.length} />
      </g>
    </DfLive>
  );
}
