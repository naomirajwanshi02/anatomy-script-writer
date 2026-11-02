import { FaceText, Solid } from "../../iso/react/draw";
import { Sparks } from "../../iso/react/reel";
import { boardEngrave, boardSvg, brand, BRAND_SIZE, contacts, ENGRAVE, ENGRAVE_SIZE, lamps, light, plate, pool } from "./geometry";
import { BRAND, isLit, PHASE } from "./model";
import { DtLive } from "./live";

// Static art: the board (rises), the traffic light with its lit lamp and glow pool (falls), sparks. Frozen frame.
export function DtArt() {
  return (
    <DtLive>
      <g data-entry="">
        <g data-base="">
          <g data-board="" dangerouslySetInnerHTML={{ __html: boardSvg }} />
          <g className="dt-engrave">
            <FaceText transform={boardEngrave} size={ENGRAVE_SIZE} tone="mid" anchor="middle">
              {ENGRAVE}
            </FaceText>
          </g>
        </g>
        <g data-parts="">
          {/* Glow pool on the board in the lit lamp's colour. */}
          <path className="dt-pool" d={pool} fill={`url(#dt-pool-${PHASE})`} />
          {/* Concrete plinth with the maker's plate, collar, dark pole, backplate and housing. */}
          <Solid paths={light.base} tone="mid" crease="lo" className="dt-plinth" />
          <path className="dt-plate" d={plate.d} />
          {plate.rivets.map(([x, y], i) => (
            <circle key={i} className="dt-rivet" cx={x.toFixed(1)} cy={y.toFixed(1)} r="0.7" />
          ))}
          <g className="dt-brand">
            <FaceText transform={brand} size={BRAND_SIZE} tone="hi" anchor="middle">
              {BRAND}
            </FaceText>
          </g>
          <Solid paths={light.collar} tone="hi" crease="none" className="dt-dark" />
          <Solid paths={light.pole} tone="hi" crease="none" className="dt-dark" />
          <Solid paths={light.back} tone="hi" crease="none" className="dt-dark dt-backplate" />
          <Solid paths={light.house} tone="hi" crease="mid" className="dt-dark" />
          {/* Lamps top to bottom: bezel, lens (lit = own colour + halo, off = dark sepia glass), shine, visor. */}
          {lamps.map((l) => {
            const on = isLit(l.lamp);
            return (
              <g key={l.lamp} className="dt-lamp" data-lamp={l.lamp} data-on={on ? "1" : "0"}>
                <path className="dt-bezel" d={l.bezel} />
                {on ? <path className="dt-halo" d={l.halo} fill={`var(--dt-${l.lamp})`} filter="url(#dt-blur)" /> : null}
                <path className="dt-lens" d={l.lens} fill={on ? `url(#dt-lit-${l.lamp})` : "url(#dt-off)"} />
                <path className="dt-shine" d={l.shine} />
                <path className="dt-visor" d={l.visor} />
                <path className="dt-visor-rim" d={l.visorRim} />
              </g>
            );
          })}
        </g>
        <Sparks points={contacts.length} />
      </g>
    </DtLive>
  );
}
