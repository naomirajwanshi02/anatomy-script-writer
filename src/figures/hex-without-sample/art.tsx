import { Dots, FaceText, Line, Solid } from "../../iso/react/draw";
import { Sparks } from "../../iso/react/reel";
import { bubble, bubblePath, BRAND_SIZE, chair, contacts, desk, engrave, ENGRAVE, ENGRAVE_SIZE, keyboard, monitor, person, trail, WALL_SIZE, type Tube as TubeT } from "./geometry";
import { BRAND, JUMBLE, WALL } from "./model";
import { HexWithoutLive } from "./live";

// Limb or bar tube: ink stroke under a fill stroke, round caps.
const Tube = ({ t, cls }: { t: TubeT; cls: string }) => (
  <g>
    <path className="hws-tube-out" d={t.d} strokeWidth={(t.w + 2.1).toFixed(2)} />
    <path className={`hws-tube-in ${cls}`} d={t.d} strokeWidth={t.w.toFixed(2)} />
  </g>
);

// One tangled line of bits in the bubble: one text per digit (mono advance 0.6 em) so single digits can be struck
// out or marked as the misread one.
function JumbleLine({ text, x, y, rot, size, strike, misread }: (typeof JUMBLE)[number]) {
  const fs = size * bubble.ry;
  const adv = fs * 0.6;
  return (
    <g transform={`translate(${(bubble.cx + x * bubble.rx).toFixed(1)} ${(bubble.cy + y * bubble.ry).toFixed(1)}) rotate(${rot})`}>
      {[...text].map((ch, i) =>
        ch === " " ? null : (
          <text key={i} className={i === misread ? "hws-jumble hws-misread" : "hws-jumble"} x={(i * adv).toFixed(1)} y="0" fontSize={fs.toFixed(1)}>
            {ch}
          </text>
        ),
      )}
      {strike.map((i) => (
        <line key={i} className="hws-strike" x1={(i * adv - adv * 0.15).toFixed(1)} y1={(-fs * 0.12).toFixed(1)} x2={(i * adv + adv * 1.1).toFixed(1)} y2={(-fs * 0.5).toFixed(1)} />
      ))}
    </g>
  );
}

// Static art: the desk (rises), monitor, keyboard, chair and engineer (fall), thought bubble, sparks. Frozen frame.
export function HexWithoutArt() {
  return (
    <HexWithoutLive>
      <g data-entry="">
        <g data-base="">
          <path className="iso-halo" d={desk.halo} />
          <Solid paths={desk.modesty} tone="mid" crease="lo" />
          {desk.legs.map((p, i) => (
            <Solid key={i} paths={p} tone="mid" crease="lo" />
          ))}
          <Solid paths={desk.slab} tone="mid" crease="lo" />
          <Line d={desk.inset} tone="lo" />
          <Line d={desk.rings} tone="lo" />
          <Dots points={desk.screws} size={0.5} tone="mid" />
          <g className="hws-engrave">
            <FaceText transform={engrave} size={ENGRAVE_SIZE} tone="mid" anchor="middle">
              {ENGRAVE}
            </FaceText>
          </g>
          <path className="hws-pool" d={monitor.pool} fill="url(#hws-blue-pool)" />
        </g>
        <g data-parts="">
          <Solid paths={monitor.stand} tone="mid" crease="lo" />
          <Solid paths={monitor.neck} tone="mid" crease="lo" />
          <Solid paths={monitor.housing} tone="mid" crease="lo" />
          <path className="iso-line hws-lcd" data-tone="hi" d={monitor.glass} />
          {WALL.map((row, r) => (
            <text key={r} className="hws-lcd-text" transform={monitor.rows[r]} fontSize={WALL_SIZE} textAnchor="middle">
              {row}
            </text>
          ))}
          <FaceText transform={monitor.brand} size={BRAND_SIZE} tone="mid" anchor="middle">
            {BRAND}
          </FaceText>
          <Solid paths={keyboard.body} tone="mid" crease="lo" />
          <Line d={keyboard.keys} tone="lo" />
          {/* Chair base: spokes, casters, hub, gas-lift column and its shroud, tilt block. */}
          <g className="hws-chair">
            {chair.spokes.map((t, i) => (
              <Tube key={i} t={t} cls="hws-tube-chair" />
            ))}
            {chair.casters.map((p, i) => (
              <Solid key={i} paths={p} tone="hi" />
            ))}
            <Solid paths={chair.hub} tone="hi" />
            <Solid paths={chair.column} tone="hi" />
            <Solid paths={chair.shroud} tone="hi" />
            <Solid paths={chair.mech} tone="hi" />
          </g>
          {/* Legs (far side first): shoe, shin, then the seat, then thighs on it. */}
          {[person.left, person.right].map((s, i) => (
            <g key={i}>
              <Tube t={s.shin} cls="hws-tube-trousers" />
              <Tube t={s.shoe} cls="hws-tube-shoe" />
            </g>
          ))}
          <g className="hws-chair">
            <Solid paths={chair.seat} tone="hi" crease="mid" />
          </g>
          {[person.left, person.right].map((s, i) => (
            <Tube key={i} t={s.thigh} cls="hws-tube-trousers" />
          ))}
          {/* Arms: upper arm, elbow bend, forearm to the keyboard, hand resting on the keys. */}
          {[person.left, person.right].map((s, i) => (
            <g key={i}>
              <Tube t={s.fore} cls="hws-tube-shirt" />
              <Tube t={s.hand} cls="hws-tube-skin" />
              <Tube t={s.upper} cls="hws-tube-shirt" />
            </g>
          ))}
          {/* Torso: tapered back, lighter shoulder tops, spine seam, collar band, neck, head with hair mass and ear. */}
          <path className="hws-shirt-fill" d={person.torso} />
          <path className="hws-shirt-top" d={person.shoulders} />
          <path className="hws-seam" d={person.spine} />
          <path className="hws-shirt-top" d={person.collar} />
          <path className="hws-skin" d={person.neck} />
          <ellipse className="hws-skin" cx={person.head.cx.toFixed(1)} cy={person.head.cy.toFixed(1)} rx={person.head.rx.toFixed(1)} ry={person.head.ry.toFixed(1)} />
          <ellipse className="hws-skin" cx={person.ear.cx.toFixed(1)} cy={person.ear.cy.toFixed(1)} rx={person.ear.rx.toFixed(1)} ry={person.ear.ry.toFixed(1)} />
          <path className="hws-hair" d={person.hair} />
          {/* Backrest on its support bar, behind the lower back. */}
          <Tube t={chair.bar} cls="hws-tube-chair" />
          <path className="hws-chair-back" d={chair.back} />
          <path className="hws-chair-face" d={chair.backFace} />
          <path className="hws-seam" d={chair.backTop} />
          <g className="hws-bubble">
            {trail.map((c, i) => (
              <circle key={i} className="hws-bubble-shape hws-trail" cx={c.x.toFixed(1)} cy={c.y.toFixed(1)} r={c.r.toFixed(1)} />
            ))}
            <path className="hws-bubble-shape" d={bubblePath} />
            {JUMBLE.map((l, i) => (
              <JumbleLine key={i} {...l} />
            ))}
            <text className="hws-question" x={(bubble.cx + 0.66 * bubble.rx).toFixed(1)} y={(bubble.cy + 0.36 * bubble.ry).toFixed(1)} fontSize={(1.05 * bubble.ry).toFixed(1)} textAnchor="middle">
              ?
            </text>
          </g>
        </g>
        <Sparks points={contacts.length} />
      </g>
    </HexWithoutLive>
  );
}
