import { FaceText, Line, Solid } from "../../iso/react/draw";
import { Sparks } from "../../iso/react/reel";
import {
  boardSvg,
  carryWire,
  colX,
  columnWire,
  contacts,
  ENGRAVE,
  ENGRAVE_SIZE,
  engraveAt,
  flatText,
  LABEL_SIZE,
  P_CARRY_CHAR,
  P_CHAR,
  paper,
  PAPER_Z,
  PROW,
  ROW,
  rowLabel,
} from "./geometry";
import { PA, PB } from "./model";
import { FaLive } from "./live";

const TOP = String(PA).split("");
const BOTTOM = String(PB).split("");

// Circuit slots, back to front and left to right (the painter's order at azimuth 62): row A, row B, the block row
// (carry tile 0, block 0, carry tile 1, ... carry tile 4), the sum row. The loop rebuilds each solid into its slot.
function Tiles({ kind, n }: { kind: string; n: number }) {
  return (
    <>
      {Array.from({ length: n }, (_, k) => (
        <g key={k} data-t={`${kind}${k}`} style={{ display: "none" }}>
          <g data-slot="" />
          <text className="iso-face-text fa-bit" data-tone="mid" textAnchor="middle" />
        </g>
      ))}
    </>
  );
}

// Static art: board (rises), paper with 58 over 67 and the pencil (fall at the entrance, fade at the folds), the
// circuit tiles and blocks (rebuilt by the loop), carry wires with their rust flow, hops, sparks.
export function FaArt() {
  const b = boardSvg();
  return (
    <FaLive>
      <g data-entry="">
        <g data-base="">
          <path className="iso-halo" d={b.halo} />
          {b.feet.map((f, k) => (
            <Solid key={k} paths={f} tone="lo" />
          ))}
          <Solid paths={b.slab} tone="mid" />
          <Line d={b.inset} tone="lo" />
          <Line d={b.rings} tone="lo" />
          <g className="fa-engrave">
            <FaceText transform={engraveAt} size={ENGRAVE_SIZE} tone="mid" anchor="middle">
              {ENGRAVE}
            </FaceText>
          </g>
          <g data-labels="" style={{ opacity: 0 }}>
            {(
              [
                ["A", ROW.a],
                ["B", ROW.b],
                ["sum", ROW.s],
              ] as const
            ).map(([s, y]) => (
              <FaceText key={s} transform={rowLabel(y)} size={LABEL_SIZE} tone="mid" anchor="middle">
                {s}
              </FaceText>
            ))}
          </g>
        </g>
        <g data-parts="">
          <g data-paper="">
            <path className="iso-halo" d={paper.halo} style={{ filter: "blur(3px)" }} />
            <Solid paths={paper.sheet} tone="mid" className="fa-paper" />
            <path className="fa-grid" d={paper.grid} />
            {paper.boxes.map((d, k) => (
              <path key={k} className="fa-cbox" d={d} />
            ))}
            <path data-cpulse="" className="fa-cbox-on" d={paper.boxes[1]} style={{ opacity: 0 }} />
            <path className="fa-rule" d={paper.rule} />
            <text className="fa-pdigit" transform={paper.plus} fontSize={P_CHAR} textAnchor="middle">
              +
            </text>
            {paper.slots.map((d, k) => (
              <path key={k} data-pslot="" className="fa-slot" d={d} style={{ opacity: 0 }} />
            ))}
            {TOP.map((ch, k) => (
              <text key={k} data-ptop={k} className="fa-pdigit" transform={flatText(colX(k + 2), PROW.a, PAPER_Z, P_CHAR)} fontSize={P_CHAR} textAnchor="middle">
                {ch}
              </text>
            ))}
            {BOTTOM.map((ch, k) => (
              <text key={k} data-pbot={k} className="fa-pdigit" transform={flatText(colX(k + 2), PROW.b, PAPER_Z, P_CHAR)} fontSize={P_CHAR} textAnchor="middle">
                {ch}
              </text>
            ))}
            {[1, 2, 3].map((i, k) => (
              <text key={k} data-pcarry={k} className="fa-pdigit fa-pcarry" transform={flatText(colX(i), PROW.carry, PAPER_Z, P_CARRY_CHAR)} fontSize={P_CARRY_CHAR} textAnchor="middle" style={{ opacity: 0 }}>
                0
              </text>
            ))}
            {[1, 2, 3].map((i, k) => (
              <text key={k} data-pans={k} className="fa-pdigit" transform={flatText(colX(i), PROW.ans, PAPER_Z, P_CHAR)} fontSize={P_CHAR} textAnchor="middle" style={{ opacity: 0 }}>
                0
              </text>
            ))}
          </g>
          <g data-circuit="">
            {[0, 1, 2, 3].map((i) => (
              <path key={i} data-cwire={i} className="fa-wire" d={columnWire(i)} style={{ opacity: 0 }} />
            ))}
            {[0, 1, 2, 3, 4].map((k) => (
              <g key={k} data-kwire={k} style={{ opacity: 0 }}>
                <path className="fa-wire" d={carryWire(k)} />
                <path className="fa-flow" d={carryWire(k)} style={{ opacity: 0 }} />
              </g>
            ))}
            <Tiles kind="a" n={4} />
            <Tiles kind="b" n={4} />
            {[0, 1, 2, 3, 4].map((k) => (
              <g key={k}>
                <g data-t={`c${k}`} style={{ display: "none" }}>
                  <g data-slot="" />
                  <text className="iso-face-text fa-bit" data-tone="mid" textAnchor="middle" />
                </g>
                {k < 4 ? (
                  <g data-t={`f${k}`} style={{ display: "none" }}>
                    <g data-slot="" />
                    <text className="iso-face-text fa-falabel" data-tone="mid" textAnchor="middle" style={{ opacity: 0 }}>
                      FA
                    </text>
                  </g>
                ) : null}
              </g>
            ))}
            <circle data-dot="" className="fa-dot" r="2.6" style={{ display: "none" }} />
            <Tiles kind="s" n={4} />
          </g>
          {[0, 1].map((k) => (
            <text key={k} data-hop={k} className="iso-face-text fa-hop" textAnchor="middle" style={{ display: "none" }}>
              1
            </text>
          ))}
          <g data-pencil="">
            <path className="fa-pencil-body" d="" />
            <path className="fa-pencil-wood" d="" />
            <path className="fa-pencil-lead" d="" />
            <path className="fa-pencil-end" d="" />
          </g>
        </g>
        <Sparks points={contacts.length} />
      </g>
    </FaLive>
  );
}
