import { FaceText, Line, Solid } from "../../iso/react/draw";
import { Sparks } from "../../iso/react/reel";
import { cells, contacts, ENGRAVE, ENGRAVE_SIZE, LABEL_SIZE, WALL_SIZE, type Layer, type Seg } from "./geometry";
import { WALL } from "./model";
import { EngineerStylesLive } from "./live";

const fill = (mat: string) => `url(#es-g-${mat})`;

// Limb: every segment's ink outline first, then the fills, so joints merge into one silhouette; edge segments
// (cuffs, roll bands) keep their own outline on top.
function Limb({ segs }: { segs: Seg[] }) {
  return (
    <g>
      <g className="es-out">
        {segs.map((s, i) => (
          <path key={i} d={s.d} />
        ))}
      </g>
      {segs.map((s, i) => (
        <path key={i} className={s.edge ? "es-edge" : "es-fill"} d={s.d} fill={fill(s.mat)} />
      ))}
    </g>
  );
}

function Layers({ list }: { list: Layer[] }) {
  return (
    <>
      {list.map((l, i) =>
        l.t === "limb" ? (
          <Limb key={i} segs={l.segs} />
        ) : l.t === "blob" ? (
          <path key={i} className="es-blob" d={l.d} fill={fill(l.mat)} />
        ) : l.t === "line" ? (
          <path key={i} className={l.cls} d={l.d} />
        ) : (
          <g key={i} className={l.cls}>
            <Solid paths={l.paths} tone={l.tone ?? "hi"} />
          </g>
        ),
      )}
    </>
  );
}

// Static art: four desk scenes (desks rise, parts fall), a label under each. Frozen frame after the entrance.
export function EngineerStylesArt() {
  return (
    <EngineerStylesLive>
      <g data-entry="">
        <g data-base="">
          {cells.map((c) => (
            <g key={c.key}>
              <path className="iso-halo" d={c.desk.halo} />
              <Solid paths={c.desk.modesty} tone="mid" crease="lo" />
              {c.desk.legs.map((p, i) => (
                <Solid key={i} paths={p} tone="mid" crease="lo" />
              ))}
              <Solid paths={c.desk.slab} tone="mid" crease="lo" />
              <Line d={c.desk.inset} tone="lo" />
              {c.engrave ? (
                <g className="es-engrave">
                  <FaceText transform={c.engrave} size={ENGRAVE_SIZE} tone="mid" anchor="middle">
                    {ENGRAVE}
                  </FaceText>
                </g>
              ) : null}
              <path className="es-pool" d={c.monitor.pool} fill="url(#es-blue-pool)" />
            </g>
          ))}
        </g>
        <g data-parts="">
          {cells.map((c) => (
            <g key={c.key}>
              <Solid paths={c.monitor.stand} tone="mid" crease="lo" />
              <Solid paths={c.monitor.neck} tone="mid" crease="lo" />
              <Solid paths={c.monitor.housing} tone="mid" crease="lo" />
              <path className="iso-line es-lcd" data-tone="hi" d={c.monitor.glass} />
              {WALL.map((row, r) => (
                <text key={r} className="es-lcd-text" transform={c.monitor.rows[r]} fontSize={WALL_SIZE} textAnchor="middle">
                  {row}
                </text>
              ))}
              <Solid paths={c.keyboard.body} tone="mid" crease="lo" />
              <Line d={c.keyboard.keys} tone="lo" />
              {c.person.mouse ? (
                <g>
                  <path className="es-blob" d={c.person.mouse.body} fill={fill("mouse")} />
                  <path className="es-seam" d={c.person.mouse.split} />
                </g>
              ) : null}
              {/* Chair base: five spokes with casters, hub, gas-lift column in its shroud, tilt block. */}
              <g className="es-chair">
                <Limb segs={c.chair.spokes.map((d) => ({ d, mat: "metal" }))} />
                {c.chair.casters.map((p, i) => (
                  <Solid key={i} paths={p} tone="hi" />
                ))}
                <Solid paths={c.chair.hub} tone="hi" />
                <Solid paths={c.chair.column} tone="hi" />
                <Solid paths={c.chair.shroud} tone="hi" />
                <Solid paths={c.chair.mech} tone="hi" />
              </g>
              {/* Shins and shoes, the padded seat, then the thighs on it. */}
              <Limb segs={c.person.legsFar.lower} />
              <Limb segs={c.person.legsNear.lower} />
              <g className="es-chair es-seat">
                <Solid paths={c.chair.seat} tone="hi" crease="mid" />
              </g>
              <Limb segs={c.person.legsFar.thigh} />
              <Limb segs={c.person.legsNear.thigh} />
              <Layers list={c.person.body} />
              {/* Backrest on its support bar: curved shell, padded face, lumbar seam. */}
              <path className="es-blob" d={c.chair.bar} fill={fill("metal")} />
              <path className="es-blob" d={c.chair.back} fill={fill("chair")} />
              <path className="es-pad" d={c.chair.pad} fill={fill("chair-pad")} />
              <path className="es-seam es-seam-dark" d={c.chair.seam} />
            </g>
          ))}
        </g>
        <Sparks points={contacts.length} />
      </g>
      {cells.map((c) => (
        <text key={c.key} className="es-label" x={c.label.x.toFixed(1)} y={c.label.y.toFixed(1)} fontSize={LABEL_SIZE} textAnchor="middle">
          {c.key}
        </text>
      ))}
    </EngineerStylesLive>
  );
}
