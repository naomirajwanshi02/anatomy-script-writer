import { Solid } from "../../iso/react/draw";
import { bubble, bubblePath, calm, chair, deskContacts, keyboard, monitor, person, trail, WALL_SIZE, HEX_SIZE, bitX, hexX, wallRow, type Tube as TubeT } from "./without";
import { CALM, JUMBLE, WALL, WALL_HEX } from "./model";

// "Without it" scene art (static; the loop moves, shows and fills it). Parts copied from the approved sample.

// Limb or bar tube: ink stroke under a fill stroke, round caps.
const Tube = ({ t, cls, shade }: { t: TubeT; cls: string; shade?: boolean }) => (
  <g>
    <path className="hex-tube-out" d={t.d} strokeWidth={(t.w + 2.1).toFixed(2)} />
    <path className={`hex-tube-in ${cls}`} d={t.d} strokeWidth={t.w.toFixed(2)} />
    {shade && <path className="hex-tube-shade" d={t.sd} strokeWidth={t.sw.toFixed(2)} />}
  </g>
);

// One tangled line of bits in the bubble: one text per digit (mono advance 0.6 em) so single digits can be struck
// out or marked as the misread one. The loop adds a small wobble to its rotation.
function JumbleLine({ text, x, y, rot, size, strike, misread, k }: (typeof JUMBLE)[number] & { k: number }) {
  const fs = size * bubble.ry;
  const adv = fs * 0.6;
  const tx = `translate(${(bubble.cx + x * bubble.rx).toFixed(1)} ${(bubble.cy + y * bubble.ry).toFixed(1)})`;
  return (
    <g data-jumble={k} data-at={tx} data-rot={rot} transform={`${tx} rotate(${rot})`}>
      {[...text].map((ch, i) =>
        ch === " " ? null : (
          <text key={i} className={i === misread ? "hex-jumble hex-misread" : "hex-jumble"} x={(i * adv).toFixed(1)} y="0" fontSize={fs.toFixed(1)}>
            {ch}
          </text>
        ),
      )}
      {strike.map((i) => (
        <line key={i} className="hex-strike" x1={(i * adv - adv * 0.15).toFixed(1)} y1={(-fs * 0.12).toFixed(1)} x2={(i * adv + adv * 1.1).toFixed(1)} y2={(-fs * 0.5).toFixed(1)} />
      ))}
    </g>
  );
}

// Under the board: desk legs slot (grown by the loop). On the board: the monitor's blue pool.
export function DeskLegs() {
  return <g data-desk-legs="" />;
}
export function DeskPool() {
  return <path className="hex-mon-pool" d={monitor.pool} fill="url(#hex-blue-pool)" style={{ opacity: 0 }} />;
}

export function Monitor() {
  return (
    <g>
      <Solid paths={monitor.stand} tone="mid" crease="lo" />
      <Solid paths={monitor.neck} tone="mid" crease="lo" />
      <Solid paths={monitor.housing} tone="mid" crease="lo" />
      <path className="iso-line hex-mon-glass" data-tone="hi" d={monitor.glass} />
      <path className="hex-mon-lit" d="" />
      <path className="hex-mon-flash" d="" style={{ opacity: 0 }} />
      <g clipPath="url(#hex-clip-wall)">
        <g className="hex-wall" style={{ opacity: 0 }}>
          {WALL.map((row, r) => (
            <g key={r} data-wall-row={r} transform={wallRow(r, 0)}>
              {[...row].map((b, j) => (
                <text key={j} data-bit={j} className="hex-lcd-text" x={bitX(j, 0).toFixed(2)} y="0" fontSize={WALL_SIZE} textAnchor="middle">
                  {b}
                </text>
              ))}
              {WALL_HEX[r].map((h, g) => (
                <text key={g} data-hexd={g} className="hex-lcd-text hex-wall-hex" x={hexX(g).toFixed(2)} y="0" fontSize={HEX_SIZE.toFixed(2)} textAnchor="middle" style={{ display: "none" }}>
                  {h}
                </text>
              ))}
            </g>
          ))}
        </g>
      </g>
    </g>
  );
}

export function Keyboard() {
  return (
    <g>
      <Solid paths={keyboard.body} tone="mid" crease="lo" />
      <path className="iso-line" data-tone="lo" d={keyboard.keys} />
    </g>
  );
}

// Engineer on the office chair (interleaved: base, legs, seat, thighs, arms, torso and head, backrest).
export function EngineerOnChair() {
  return (
    <g>
      <g className="hex-chair">
        {/* Back to front: each twin-wheel caster (stem, far wheel, hood, near wheel), then its spoke over the stem. */}
        {chair.casters.map((c, i) => (
          <g key={i}>
            <Solid paths={c.stem} tone="hi" />
            <path className="hex-tyre" d={c.far.tyre} />
            <path className="hex-wheel-hub" d={c.far.hub} />
            <path className="hex-caster-hood" d={c.hood} />
            <path className="hex-tyre" d={c.near.tyre} />
            <path className="hex-wheel-hub" d={c.near.hub} />
            <Tube t={chair.spokes[i]} cls="hex-tube-chair" />
          </g>
        ))}
        <Solid paths={chair.hub} tone="hi" />
        <Solid paths={chair.column} tone="hi" />
        <Solid paths={chair.shroud} tone="hi" />
        <Solid paths={chair.mech} tone="hi" />
        <Solid paths={chair.armFar.bracket} tone="hi" />
        <Solid paths={chair.armNear.bracket} tone="hi" />
      </g>
      {[person.left, person.right].map((s, i) => (
        <g key={i}>
          <Tube t={s.shin} cls="hex-tube-jeans" shade />
          <Tube t={s.hemJeans} cls="hex-tube-jeans-hem" />
          <Tube t={s.shoe} cls="hex-tube-shoe" shade />
        </g>
      ))}
      <g className="hex-chair">
        <Solid paths={chair.seat} tone="hi" crease="mid" />
        <Solid paths={chair.armFar.post} tone="hi" />
        <Solid paths={chair.armFar.pad} tone="hi" crease="mid" />
      </g>
      {[person.left, person.right].map((s, i) => (
        <g key={i}>
          <Tube t={s.thigh} cls="hex-tube-jeans" shade />
          <path className="hex-stitch" d={s.stitch} />
        </g>
      ))}
      {/* Arms are drawn before the torso so the polo's edge covers their roots and they grow out of the body (no
          ball joints). The near forearm rests on the near armrest pad, drawn just before it. */}
      <Arm s={person.left} />
      <g className="hex-chair">
        <Solid paths={chair.armNear.post} tone="hi" />
        <Solid paths={chair.armNear.pad} tone="hi" crease="mid" />
      </g>
      <Arm s={person.right} />
      <g data-shirt="">
        <path className="hex-shirt-fill" data-shirt-torso="" d={person.torso} />
        <path className="hex-shirt-top" data-shirt-yoke="" d={person.shoulders} />
        <path className="hex-body-shade" data-shirt-shade="" d={person.torsoShade} />
        <path className="hex-fold" data-shirt-folds="" d="" />
        <path className="hex-seam" data-shirt-hem="" d="" />
      </g>
      <path className="hex-skin" d={person.neck} />
      <path className="hex-tube-shade" d={person.neckShade.sd} strokeWidth={person.neckShade.sw.toFixed(2)} />
      <path className="hex-shirt-top" d={person.collar} />
      <path className="hex-seam" d={person.collarFold} />
      {person.ears.map((e, i) => (
        <g key={i}>
          <ellipse className="hex-skin" cx={e.cx.toFixed(1)} cy={e.cy.toFixed(1)} rx={e.rx.toFixed(1)} ry={e.ry.toFixed(1)} />
          <path className="hex-ear-in" d={`M${(e.cx + (i ? 0.25 : -0.25) * e.rx).toFixed(1)} ${(e.cy - e.ry * 0.55).toFixed(1)}Q${(e.cx + (i ? 0.75 : -0.75) * e.rx).toFixed(1)} ${e.cy.toFixed(1)} ${(e.cx + (i ? 0.25 : -0.25) * e.rx).toFixed(1)} ${(e.cy + e.ry * 0.55).toFixed(1)}`} />
        </g>
      ))}
      <path className="hex-skin" d={person.skull} />
      <path className="hex-nape" d={person.nape[0]} />
      <path className="hex-nape hex-nape-faint" d={person.nape[1]} />
      <path className="hex-hair-fill" d={person.hair} />
      <path className="hex-hair-edge" d={person.hairEdge} />
      <path className="hex-body-shade" d={person.headShade} />
      <Tube t={chair.bar} cls="hex-tube-chair" />
      {/* Ergonomic mesh back: see-through mesh (the polo shows through), ribs, lumbar pad, frame on top. */}
      <path className="hex-mesh" d={chair.mesh} />
      <path className="hex-mesh-rib" d={chair.meshRibs} />
      <path className="hex-lumbar" d={chair.lumbar} />
      <path className="hex-mesh-frame" d={chair.mesh} />
    </g>
  );
}

// Muscular arm in a polo: skin forearm and upper arm with bicep and forearm bulk, short sleeve with a ribbed cuff.
// Each group draws all its ink outlines first, then all its fills, so overlapping tubes merge into one smooth limb.
const Merged = ({ ts, cls }: { ts: TubeT[]; cls: string }) => (
  <g>
    {ts.map((t, i) => (
      <path key={`o${i}`} className="hex-tube-out" d={t.d} strokeWidth={(t.w + 2.1).toFixed(2)} />
    ))}
    {ts.map((t, i) => (
      <path key={`i${i}`} className={`hex-tube-in ${cls}`} d={t.d} strokeWidth={t.w.toFixed(2)} />
    ))}
    {/* Shade strokes share one group opacity so where they overlap they never stack into darker patches; only the
        long segments carry it (short bulk tubes would push it past their round ends). */}
    <g className="hex-shade-group">
      {ts
        .filter((t) => t.w * 2.2 < Math.hypot(...pathEnds(t.d)))
        .map((t, i) => (
          <path key={`s${i}`} className="hex-tube-shade-solid" d={t.sd} strokeWidth={t.sw.toFixed(2)} />
        ))}
    </g>
  </g>
);
// Screen length (dx, dy) between the first and last point of a tube path.
const pathEnds = (d: string): [number, number] => {
  const n = d.match(/-?\d+(\.\d+)?/g)!.map(Number);
  return [n[n.length - 2] - n[0], n[n.length - 1] - n[1]];
};
function Arm({ s }: { s: typeof person.left }) {
  return (
    <g>
      <Tube t={s.thumb} cls="hex-tube-skin" />
      <Merged ts={[s.fore, s.foreBulk, s.upper, s.bicep]} cls="hex-tube-skin" />
      <path className="hex-skin" d={s.hand} />
      <path className="hex-ear-in" d={s.knuckles} />
      <path className="hex-muscle" d={s.muscles} />
      <Merged ts={[s.sleeve]} cls="hex-tube-shirt" />
      <path className="hex-cuff" d={s.cuffBand.d} strokeWidth={s.cuffBand.w.toFixed(2)} />
    </g>
  );
}

// Thought bubble: tangle of bits with a "?" (struggle), then a calm "B2" with a small ink tick (fixed).
export function ThoughtBubble() {
  return (
    <g data-bubble="" style={{ display: "none" }}>
      {trail.map((c, i) => (
        <circle key={i} className="hex-bubble-shape hex-trail" cx={c.x.toFixed(1)} cy={c.y.toFixed(1)} r={c.r.toFixed(1)} />
      ))}
      <path className="hex-bubble-shape" d={bubblePath} />
      <g data-tangle="">
        {JUMBLE.map((l, i) => (
          <JumbleLine key={i} k={i} {...l} />
        ))}
        <text className="hex-question" x={(bubble.cx + 0.66 * bubble.rx).toFixed(1)} y={(bubble.cy + 0.36 * bubble.ry).toFixed(1)} fontSize={(1.05 * bubble.ry).toFixed(1)} textAnchor="middle">
          ?
        </text>
      </g>
      <g data-calm="" style={{ opacity: 0 }}>
        <text className="hex-calm" x={calm.text.x.toFixed(1)} y={calm.text.y.toFixed(1)} fontSize={calm.text.size.toFixed(1)} textAnchor="middle">
          {CALM}
        </text>
        <path className="hex-tick" d={calm.tick} />
      </g>
    </g>
  );
}

export const DeskSparks = () => (
  <g data-desk-sparks="">
    {Array.from({ length: deskContacts.length * 3 }, (_, i) => (
      <line key={i} className="reel-spark" data-dspark={i} x1="0" y1="0" x2="0" y2="0" opacity="0" />
    ))}
  </g>
);
