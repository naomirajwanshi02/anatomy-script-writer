import { FaceText, Solid } from "../../iso/react/draw";
import { Sparks } from "../../iso/react/reel";
import { bandAll, bandFront, boardEngrave, boardSvg, BRAND_SIZE, carton, contacts, ENGRAVE, ENGRAVE_SIZE, LABEL_SIZE, labels, lid } from "./geometry";
import { BRAND } from "./model";
import { KeLive } from "./live";

type CellArt = (typeof carton.back)[number];

// One row of cups: wells and their inner walls.
const Wells = ({ cells }: { cells: CellArt[] }) => (
  <>
    {cells.map((c, i) => (
      <g key={i}>
        <path className="ke-cup-rim" d={c.ring} />
        <path className="ke-well" d={c.well} />
        <path className="ke-well-in" d={c.wall} />
      </g>
    ))}
  </>
);
// The eggs of one row, left to right: each egg clipped above its cup's front arc, then the front lip line over it.
const Eggs = ({ cells }: { cells: CellArt[] }) => (
  <>
    {cells.map((c) =>
      c.egg ? (
        <g key={c.id}>
          <clipPath id={c.id}>
            <path d={c.clip} />
          </clipPath>
          <path className="ke-egg" d={c.egg} fill="url(#ke-shell)" clipPath={`url(#${c.id})`} />
          <path className="ke-lip" d={c.lip} />
        </g>
      ) : null,
    )}
  </>
);

// Static art: the board (rises), the carton with its eggs and the rust group band (falls), sparks. Frozen frame.
export function KeArt() {
  return (
    <KeLive>
      <g data-entry="">
        <g data-base="">
          <g data-board="" dangerouslySetInnerHTML={{ __html: boardSvg }} />
          <g className="ke-engrave">
            <FaceText transform={boardEngrave} size={ENGRAVE_SIZE} tone="mid" anchor="middle">
              {ENGRAVE}
            </FaceText>
          </g>
          {/* K-map axis labels engraved on the board: A with 0/1 beside the rows, BC with the Gray-order columns in front. */}
          <g className="ke-label">
            <FaceText transform={labels.a} size={LABEL_SIZE} tone="mid" anchor="middle">
              A
            </FaceText>
            {labels.rows.map((l) => (
              <FaceText key={l.t} transform={l.m} size={LABEL_SIZE} tone="mid" anchor="middle">
                {l.t}
              </FaceText>
            ))}
            <FaceText transform={labels.bc} size={LABEL_SIZE} tone="mid" anchor="middle">
              BC
            </FaceText>
            {labels.cols.map((l) => (
              <FaceText key={l.t} transform={l.m} size={LABEL_SIZE} tone="mid" anchor="middle">
                {l.t}
              </FaceText>
            ))}
          </g>
        </g>
        <g data-parts="">
          <path className="iso-halo" d={carton.halo} style={{ filter: "blur(3px)" }} />
          {/* Lid folded open backwards: outer shell, rim top, inner wall, inside panel with latch holes and the print. */}
          <path className="ke-lid-outer" d={lid.outer} />
          <path className="ke-lid-rim" d={lid.rimTop} />
          <path className="ke-lid-wall" d={lid.wall} />
          <path className="ke-lid-panel" d={lid.panel} />
          <path className="ke-speck" d={lid.panel} fill="url(#ke-speck)" />
          <path className="ke-hole" d={lid.holes} />
          <g className="ke-brand">
            <FaceText transform={lid.brand} size={BRAND_SIZE} tone="hi" anchor="middle">
              {BRAND}
            </FaceText>
          </g>
          {/* Tray: cup bulges (scallops) under a thin flat rim. */}
          {carton.bulges.map((d, i) => (
            <path key={i} className="ke-bulge" d={d} fill="url(#ke-bump)" />
          ))}
          <Solid paths={carton.rim} tone="mid" crease="lo" className="ke-pulp" />
          <path className="ke-speck" d={carton.rim.top} fill="url(#ke-speck)" />
          {/* Back row, band (whole loop, back part shows), back eggs, cone posts, front row, band (front part again). */}
          <Wells cells={carton.back} />
          <path className="ke-band" d={bandAll} />
          <path className="ke-band-in" d={bandAll} />
          <Eggs cells={carton.back} />
          {carton.posts.map((p, i) => (
            <g key={i}>
              <path className="ke-post" d={p.d} fill="url(#ke-post)" />
              <circle className="ke-post-tip" cx={p.tip.cx.toFixed(1)} cy={p.tip.cy.toFixed(1)} r="1.2" />
            </g>
          ))}
          <Wells cells={carton.front} />
          <Eggs cells={carton.front} />
          <path className="ke-band" d={bandFront} />
          <path className="ke-band-in" d={bandFront} />
        </g>
        <Sparks points={contacts.length} />
      </g>
    </KeLive>
  );
}
