"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { solidSvg } from "../../iso/iso-kit";
import { paintEntry } from "../../iso/react/reel";
import { useFrameLoop, useInView } from "../../iso/react/live";
import { Stage } from "../../iso/react/draw";
import {
  at,
  C_CHAR,
  carryX,
  CHAR_SIZE,
  colX,
  contacts,
  CTILE,
  CTILE_H,
  faSolid,
  flatText,
  PENCIL_DIR,
  PENCIL_LEN,
  PENCIL_W,
  ROW,
  STAGE_H,
  STAGE_W,
  TABLE_TOP,
  TILE,
  TILE_H,
  tileSolid,
  zoomTransform,
} from "./geometry";
import { KEY_TIME, stateAt, type Tile } from "./model";

// Readout below the board: the active column's total (decimal on paper, then "total = two bits").
export function FaTable() {
  return (
    <div className="fa-read" role="status" aria-label="The active column's total">
      <div className="fa-rtag">column total</div>
      <div className="fa-rval">{" "}</div>
    </div>
  );
}

const DROP_Z = 30; // tile drop height (board units)

// Voice-synced builds map video time to figure time (voice.ts); the plain build plays the figure as is.
let timeMap: ((t: number) => number) | null = null;
export const setTimeMap = (fn: (t: number) => number) => void (timeMap = fn);

const f2 = (v: number) => v.toFixed(2);
const pt = ([x, y]: [number, number]) => `${f2(x)} ${f2(y)}`;

// Pencil from its tip in screen space: lead, wood cone, hexagonal body with a centre facet, ferrule end.
function pencilPaths(tip: [number, number]) {
  const [dx, dy] = PENCIL_DIR;
  const l = Math.hypot(dx, dy);
  const d: [number, number] = [dx / l, dy / l];
  const n: [number, number] = [-d[1], d[0]];
  const p = (s: number, w: number): [number, number] => [tip[0] + d[0] * s + n[0] * w, tip[1] + d[1] * s + n[1] * w];
  const h = PENCIL_W / 2;
  const L = PENCIL_LEN;
  return {
    lead: `M${pt(p(0, 0))}L${pt(p(5, h * 0.36))}L${pt(p(5, -h * 0.36))}Z`,
    wood: `M${pt(p(5, h * 0.36))}L${pt(p(15, h))}L${pt(p(15, -h))}L${pt(p(5, -h * 0.36))}Z`,
    body: `M${pt(p(15, h))}L${pt(p(L - 9, h))}L${pt(p(L - 9, -h))}L${pt(p(15, -h))}ZM${pt(p(15, h * 0.2))}L${pt(p(L - 9, h * 0.2))}`,
    end: `M${pt(p(L - 9, h))}L${pt(p(L, h))}L${pt(p(L, -h))}L${pt(p(L - 9, -h))}ZM${pt(p(L - 6, h))}L${pt(p(L - 6, -h))}M${pt(p(L - 3, h))}L${pt(p(L - 3, -h))}`,
  };
}

// The one loop: writes the paper digits and the pencil, the circuit tiles, blocks, wires and hops, and the readout.
export function FaLive({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const state = useRef({ t: 0, keys: {} as Record<string, string> });

  const paint = () => {
    const root = ref.current;
    if (!root) return;
    const s = state.current;
    const ft = timeMap ? timeMap(s.t) : s.t;
    paintEntry(root, ft, contacts);
    const m = stateAt(ft);
    const q = <T extends Element>(sel: string) => root.querySelector<T>(sel);
    const qa = <T extends Element>(sel: string) => Array.from(root.querySelectorAll<T>(sel));

    // Camera: zoomed on the paper in the analogy, the whole board for the circuit.
    const zk = (1 - m.paperIn).toFixed(3);
    if (s.keys.zoom !== zk) {
      s.keys.zoom = zk;
      q("[data-zoom]")?.setAttribute("transform", zoomTransform(1 - m.paperIn));
    }

    // Paper: fades at the fold and back at the fold back; digits glow rust while they are being added.
    const pg = q<SVGGElement>("[data-paper]");
    if (pg) {
      pg.style.display = m.paperIn <= 0.001 ? "none" : "";
      pg.style.opacity = m.paperIn.toFixed(3);
    }
    const setText = (el: SVGTextElement | null, ch: string, opacity: number, rust: boolean) => {
      if (!el) return;
      if (el.textContent !== ch) el.textContent = ch;
      el.style.opacity = opacity.toFixed(3);
      el.classList.toggle("fa-rust", rust);
    };
    const P = m.paper;
    P.top.forEach((d, k) => setText(q(`[data-ptop="${k}"]`), d.ch, d.opacity, d.rust));
    P.bottom.forEach((d, k) => setText(q(`[data-pbot="${k}"]`), d.ch, d.opacity, d.rust));
    P.carries.forEach((d, k) => {
      const el = q<SVGTextElement>(`[data-pcarry="${k}"]`);
      setText(el, d.ch, d.opacity, d.rust);
      el?.classList.toggle("fa-bold", P.carryRust[k]);
    });
    P.answer.forEach((d, k) => setText(q(`[data-pans="${k}"]`), d.ch, d.opacity, d.rust));
    qa<SVGPathElement>("[data-pslot]").forEach((el) => (el.style.opacity = P.slots.toFixed(3)));
    q<SVGPathElement>("[data-cpulse]")?.style.setProperty("opacity", P.carryPulse.toFixed(3));

    // Pencil: drawn from its tip; it rests beside the paper and fades with it.
    const pen = q<SVGGElement>("[data-pencil]");
    if (pen) {
      pen.style.opacity = m.paperIn.toFixed(3);
      pen.style.display = m.paperIn <= 0.001 ? "none" : "";
      const tip = at([m.pencil.x, m.pencil.y, m.pencil.z]) as [number, number];
      const pp = pencilPaths(tip);
      pen.querySelector(".fa-pencil-lead")?.setAttribute("d", pp.lead);
      pen.querySelector(".fa-pencil-wood")?.setAttribute("d", pp.wood);
      pen.querySelector(".fa-pencil-body")?.setAttribute("d", pp.body);
      pen.querySelector(".fa-pencil-end")?.setAttribute("d", pp.end);
    }

    // Circuit tiles and blocks: each solid is rebuilt only when its drop, size or accent changes.
    const C = m.circuit;
    const tile = (key: string, x: number, y: number, size: number, h: number, char: number, z: number, grow: number, st: Tile, show: boolean) => {
      const g = q<SVGGElement>(`[data-t="${key}"]`);
      if (!g) return;
      const vis = show && grow > 0.01;
      g.style.display = vis ? "" : "none";
      if (!vis) return;
      const sol = tileSolid(x, y, size, h, z, grow);
      const k = `${f2(z)}|${grow.toFixed(3)}|${st.active}`;
      if (s.keys[key] !== k) {
        s.keys[key] = k;
        const accent = st.active ? `<path class="fa-accent" d="${sol.paths.top}"/>` : "";
        g.querySelector("[data-slot]")!.innerHTML = solidSvg(sol.paths, { tone: "mid", crease: "lo" }) + accent;
      }
      const text = g.querySelector("text")!;
      text.setAttribute("transform", flatText(x, y, sol.top, char));
      text.setAttribute("font-size", String(char));
      text.setAttribute("data-tone", st.ch === "1" ? "hi" : "mid");
      text.classList.toggle("fa-rust", st.active);
      if (text.textContent !== st.ch) text.textContent = st.ch;
      text.style.opacity = Math.min(1, grow * 1.5).toFixed(3);
    };
    for (let i = 0; i < 4; i++) {
      const sink = C.tilesIn;
      tile(`a${i}`, colX(i), ROW.a, TILE, TILE_H, CHAR_SIZE, DROP_Z * C.dropA[i] ** 2, sink, C.a[i], C.dropA[i] < 0.999);
      tile(`b${i}`, colX(i), ROW.b, TILE, TILE_H, CHAR_SIZE, DROP_Z * C.dropB[i] ** 2, sink, C.b[i], C.dropB[i] < 0.999);
      tile(`s${i}`, colX(i), ROW.s, TILE, TILE_H, CHAR_SIZE, 0, C.sumIn[i], C.s[i], true);
      // Block: grows up from the board; rust outline in its active stretch; "FA" engraved on its top.
      const g = q<SVGGElement>(`[data-t="f${i}"]`);
      if (g) {
        const grow = C.block[i];
        g.style.display = grow > 0.01 ? "" : "none";
        if (grow > 0.01) {
          const fa = faSolid(i, grow);
          const k = `${grow.toFixed(3)}|${C.boxActive[i]}`;
          if (s.keys[`f${i}`] !== k) {
            s.keys[`f${i}`] = k;
            const accent = C.boxActive[i] ? `<path class="fa-accent" d="${fa.paths.top}"/>` : "";
            g.querySelector("[data-slot]")!.innerHTML = solidSvg(fa.paths, { tone: "mid", crease: "lo" }) + accent;
          }
          const lab = g.querySelector("text")!;
          lab.setAttribute("transform", flatText(colX(i), ROW.fa, fa.top + 0.02, 5.5));
          lab.setAttribute("font-size", "5.5");
          lab.style.opacity = C.faLabel.toFixed(3);
        }
      }
    }
    for (let k = 0; k < 5; k++) tile(`c${k}`, carryX(k), ROW.fa, CTILE, CTILE_H, C_CHAR, 0, C.carryIn[k], C.c[k], true);

    // Wires: column wires with their block, carry wires with their tile; rust flow while a 1 sits on the carry.
    qa<SVGPathElement>("[data-cwire]").forEach((el, i) => (el.style.opacity = C.block[i].toFixed(3)));
    qa<SVGGElement>("[data-kwire]").forEach((g, k) => {
      g.style.opacity = C.carryIn[k].toFixed(3);
      (g.querySelector(".fa-flow") as SVGPathElement).style.opacity = C.flow[k] ? "1" : "0";
    });
    q<SVGGElement>("[data-labels]")?.style.setProperty("opacity", C.labels.toFixed(3));

    // The carry chain dot ("each passing its carry left") and the hopping bits.
    const dot = q<SVGCircleElement>("[data-dot]");
    if (dot) {
      dot.style.display = C.chainDot < 0 ? "none" : "";
      if (C.chainDot >= 0) {
        const x = carryX(4) + (carryX(0) - carryX(4)) * C.chainDot;
        const [sx, sy] = at([x, ROW.fa, 1.2]);
        dot.setAttribute("cx", f2(sx));
        dot.setAttribute("cy", f2(sy));
      }
    }
    const hops = [
      ...P.hops.map((h) => ({ ch: h.ch, x: h.x, y: h.y, z: h.z + 0.8, size: 10 })),
      ...C.hops.map((h) => {
        const u = h.u * h.u * (3 - 2 * h.u);
        return {
          ch: h.ch,
          x: h.from[0] + (h.to[0] - h.from[0]) * u,
          y: h.from[1] + (h.to[1] - h.from[1]) * u,
          z: h.from[2] + (h.to[2] - h.from[2]) * u + 12 * Math.sin(Math.PI * h.u),
          size: 8,
        };
      }),
    ];
    qa<SVGTextElement>("[data-hop]").forEach((el, k) => {
      const h = hops[k];
      el.style.display = h ? "" : "none";
      if (!h) return;
      if (el.textContent !== h.ch) el.textContent = h.ch;
      el.setAttribute("font-size", String(h.size));
      el.setAttribute("transform", flatText(h.x, h.y, h.z, h.size));
    });

    // Readout: in with the first total, out at the folds; rust in the key state.
    const fig = root.closest("[data-figure]") as HTMLElement | null;
    if (fig) {
      fig.style.setProperty("--fa-table-in", m.readoutIn.toFixed(3));
      fig.style.setProperty("--fa-table-top", `${(TABLE_TOP * 100 + 17 * m.paperIn).toFixed(2)}%`);
      const v = fig.querySelector(".fa-rval");
      if (v && v.textContent !== m.readout) v.textContent = m.readout;
      v?.toggleAttribute("data-key", m.readoutKey);
    }
  };

  useFrameLoop((dt, reduced) => {
    state.current.t = reduced ? KEY_TIME : state.current.t + dt;
    paint();
    return !reduced;
  }, inView);
  useEffect(() => paint(), []);

  return (
    <div ref={ref} className="fa-stage">
      <Stage
        width={STAGE_W}
        height={STAGE_H}
        label="A sheet of squared paper on a long board shows 58 over 67. A pencil adds the units, 8 plus 7 is 15: it writes 5 and carries 1 into a box above the tens. The tens column then adds three numbers, 5, 6 and the carried 1, which is 12: it writes 2 and carries 1, giving 125. The paper fades and bit tiles drop in: rows A and B over one full-adder block. Its three inputs light one by one, a total of three, written in bits as 11; the right bit drops into the sum tile and the front bit hops left onto the carry tile. Three more blocks rise, joined by their carries. Six plus seven, 0110 plus 0111: the third column adds three ones, writes 1 and carries 1, and the sum row reads 1101. The board folds back to the paper."
      >
        <g data-zoom="" transform={zoomTransform(0)}>
          {children}
        </g>
      </Stage>
    </div>
  );
}
