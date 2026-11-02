"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { BulbGlowDef } from "../../iso/react/bulb";
import { paintEntry } from "../../iso/react/reel";
import { useFrameLoop, useInView } from "../../iso/react/live";
import { Stage } from "../../iso/react/draw";
import { booth, cellTextAt, contacts, lever4, leverRod, leverTip, liftPx, STAGE_H, STAGE_W, wall, wordLine, type LeverGeo } from "./geometry";
import { DENSE_ROW, KEY_TIME, SIGS, stateAt } from "./model";

const f2 = (v: number) => v.toFixed(2);
const flag = (b: boolean) => (b ? "1" : "0");

// The one loop: writes every state from the model into the static art.
// Re-take: a voice page can map video time to this figure's own timeline (written in the old take's seconds).
let timeMap: ((t: number) => number) | null = null;
export const setTimeMap = (fn: (t: number) => number) => void (timeMap = fn);

export function DxLive({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const state = useRef({ t: 0 });

  const paint = () => {
    const root = ref.current;
    if (!root) return;
    const t = timeMap ? timeMap(state.current.t) : state.current.t;
    paintEntry(root, t, contacts);
    const m = stateAt(t);
    const q = <T extends Element>(sel: string) => root.querySelector<T>(sel);
    const qa = <T extends Element>(sel: string) => Array.from(root.querySelectorAll<T>(sel));
    const show = (el: Element | null, opacity: number) => {
      if (!el) return;
      const s = (el as SVGElement).style;
      s.display = opacity <= 0.001 ? "none" : "";
      s.opacity = opacity.toFixed(3);
    };
    const setAttr = (el: Element | null, name: string, v: string) => {
      if (el && el.getAttribute(name) !== v) el.setAttribute(name, v);
    };
    const lever = (g: Element | null, geo: LeverGeo, pos: number, hl: boolean) => {
      if (!g) return;
      setAttr(g.querySelector(".dx-rod"), "d", leverRod(geo, pos));
      const tip = leverTip(geo, pos);
      setAttr(g.querySelector(".dx-knob-lever"), "cx", f2(tip[0]));
      setAttr(g.querySelector(".dx-knob-lever"), "cy", f2(tip[1]));
      setAttr(g, "data-hl", flag(hl));
    };

    // ---------- Scenes: building (0) and memory wall (1); booth and cables sink with the building ----------
    const sink = (u: number) => `translate(0 ${f2(liftPx(10 * u))})`;
    const bld = q("[data-scene='building']");
    show(bld, 1 - m.fold);
    setAttr(bld, "transform", sink(m.fold));
    const wl = q("[data-scene='wall']");
    show(wl, m.fold);
    setAttr(wl, "transform", sink(1 - m.fold));
    for (const s of ["ground", "booth"]) {
      const g = q(`[data-scene='${s}']`);
      show(g, 1 - m.fold);
      setAttr(g, "transform", sink(m.fold));
    }

    // ---------- Analogy ----------
    const A = m.analogy;
    setAttr(q("[data-lift]"), "transform", `translate(0 ${f2(-liftPx(5 * A.lift))})`);
    qa("[data-winghl]").forEach((g, i) => setAttr(g, "data-hl", flag(A.wingHl[i])));
    qa("[data-flat]").forEach((g) => {
      const r = Number(g.getAttribute("data-flat"));
      const f = (r >> 1) & 1;
      const s = r & 1;
      setAttr(g, "data-pale", flag(A.pale[f]));
      setAttr(g, "data-hl", flag(A.sideHl[s]));
    });
    for (let r = 0; r < 8; r++) {
      SIGS.forEach((k, i) => {
        const d = q(`[data-adot='${r}${k}']`);
        setAttr(d, "data-on", flag(A.dots[r][i]));
        setAttr(d, "data-hl", flag(A.dotHl[r][i]));
      });
      (q(`[data-bell='${r}']`) as SVGGElement | null)?.style.setProperty("--lamp", A.lamp[r].toFixed(3));
      show(q(`[data-wglow='${r}']`), A.ringing[r] ? 1 : 0);
      const arcs = q<SVGGElement>(`[data-arcs='${r}']`);
      if (arcs) {
        arcs.style.display = A.ringing[r] ? "" : "none";
        // The arcs breathe outward while it rings.
        arcs.style.opacity = A.ringing[r] ? (0.65 + 0.35 * Math.sin(2 * Math.PI * 2.2 * m.t)).toFixed(3) : "0";
      }
    }
    setAttr(q("[data-panel]"), "data-hl", flag(A.panelHl));
    SIGS.forEach((k, i) => {
      const c = q(`[data-cable='${k}']`);
      show(c?.querySelector(".dx-cable-hl") ?? null, A.cableHl ? 0.45 : 0);
      const fl = c?.querySelector<SVGPathElement>(".dx-flow");
      if (fl) fl.style.display = A.flow[i] ? "" : "none";
    });
    qa(".dx-jbox").forEach((g) => setAttr(g, "data-hl", flag(A.cableHl)));
    booth.levers.forEach((l) => lever(q(`[data-lever='b${l.k}']`), l.geo, m.pos[l.k], m.leverHl[l.k]));

    // ---------- Circuit ----------
    const C = m.circ;
    if (m.fold > 0.001) {
      wall.levers.forEach((l) => lever(q(`[data-lever='w${l.k}']`), l.geo, m.pos[l.k], m.leverHl[l.k]));
      qa("[data-names]").forEach((g) => ((g as SVGGElement).style.opacity = (1 - C.labelsBits).toFixed(3)));
      qa("[data-bitlabels]").forEach((g) => ((g as SVGGElement).style.opacity = C.labelsBits.toFixed(3)));
      SIGS.forEach((k, i) => {
        const g = q(`[data-wire='${k}']`);
        setAttr(g, "data-hl", flag(C.wireHl[i]));
        const fl = g?.querySelector<SVGPathElement>(".dx-flow");
        if (fl) fl.style.display = C.flow[i] ? "" : "none";
      });
      for (let r = 0; r < 8; r++) {
        SIGS.forEach((k, i) => setAttr(q(`[data-cdot='${r}${k}']`), "data-on", flag(C.cdots[r][i])));
        const line = q<SVGPathElement>(`[data-wl='${r}']`);
        if (line) {
          line.style.display = C.wordOn[r] ? "" : "none";
          if (C.wordOn[r]) setAttr(line, "d", wordLine(r, C.front));
          setAttr(line, "data-thick", flag(C.thick));
          setAttr(line, "data-glow", flag(C.lineGlow));
        }
        (q(`[data-lamp='${r}']`) as SVGGElement | null)?.style.setProperty("--lamp", C.lit[r] ? "1" : "0");
        setAttr(q(`[data-band='${r}']`), "data-bright", flag(C.rowBright === r));
      }
      qa("[data-ghostbell]").forEach((el) => ((el as SVGPathElement).style.opacity = C.ghostBells.toFixed(3)));
      show(q("[data-ghostwin]"), C.ghostWindow);
      show(q("[data-outline='5']"), C.rowOutline ? 1 : 0);
      show(q("[data-outline='4']"), C.rowBright === 4 ? 1 : 0);
      (q("[data-colglow]") as SVGPathElement | null)?.style.setProperty("opacity", C.columnHl ? "1" : "0");
      // Row 5 opens: its cells light pale left to right with their bits; copies slide out past the row end.
      C.cellsPale.forEach((u, i) => {
        (q(`[data-cell='5-${i}']`) as SVGPathElement | null)?.style.setProperty("--pale", u.toFixed(3));
        (q(`[data-bit='${i}']`) as SVGTextElement | null)?.style.setProperty("opacity", u.toFixed(3));
        const out = q<SVGTextElement>(`[data-out='${i}']`);
        const s = C.slide[i];
        if (out) {
          out.style.display = s < 0 ? "none" : "";
          if (s >= 0) {
            const c = wall.rows[5].cellText[i];
            const e = s * s * (3 - 2 * s);
            setAttr(out, "transform", cellTextAt(c.x + (150 - c.x) * e, c.y + 10 * e, c.z));
            out.style.opacity = (1 - Math.max(0, (s - 0.6) / 0.4)).toFixed(3);
          }
        }
      });
      // Scale-up beat.
      show(q("[data-rows8]"), C.rows8);
      show(q("[data-wires]"), C.levers3);
      show(q("[data-levers3]"), C.levers3);
      const l4 = q<SVGGElement>("[data-lever4]");
      if (l4) {
        show(l4, C.lever4);
        const u = Math.min(1, C.lever4 * 1.0);
        const dx = (lever4.slide[0] - lever4.home[0]) * (1 - u);
        const dy = (lever4.slide[1] - lever4.home[1]) * (1 - u);
        setAttr(l4, "transform", `translate(${f2(dx)} ${f2(dy)})`);
      }
      show(q("[data-s16]"), C.s16);
      C.lit16.forEach((on, r) => {
        setAttr(q(`[data-lamp16='${r}']`), "data-on", flag(on));
        const l = q<SVGPathElement>(`[data-l16='${r}']`);
        if (l) l.style.display = on ? "" : "none";
      });
      show(q("[data-s20]"), C.s20);
      setAttr(q(`[data-dense='${DENSE_ROW}']`), "data-on", flag(C.denseHl));
    }

    // ---------- Key plate ----------
    show(q("[data-keyset='plain']"), m.key.plain);
    show(q("[data-keyset='bits']"), m.key.bits);
    show(q("[data-keymatch]"), m.key.match);
    (q("[data-keym='flat']") as SVGGElement | null)?.style.setProperty("opacity", (1 - C.labelsBits).toFixed(3));
    (q("[data-keym='row']") as SVGGElement | null)?.style.setProperty("opacity", C.labelsBits.toFixed(3));
    qa("[data-keyline]").forEach((g) => setAttr(g, "data-hl", flag(m.key.hl[g.getAttribute("data-keyline") as "w" | "f" | "s"])));

    // ---------- Address plate: digits fill from the levers, rust while pulsed ----------
    SIGS.forEach((k, i) => {
      const g = q(`[data-digit='${k}']`);
      const text = g?.querySelector("text");
      if (text && text.textContent !== m.readout.digits[i]) text.textContent = m.readout.digits[i];
      if (text) text.style.opacity = m.readout.in.toFixed(3);
      setAttr(g, "data-hl", flag(m.readout.hl[i]));
    });
  };

  useFrameLoop((dt, reduced) => {
    state.current.t = reduced ? KEY_TIME : state.current.t + dt;
    paint();
    return !reduced;
  }, inView);
  useEffect(() => paint(), []);

  return (
    <div ref={ref} className="dx-stage">
      <Stage
        width={STAGE_W}
        height={STAGE_H}
        label="An apartment building on a board: wings A and B, ground and first floors, a left and a right flat on each, eight flats in all, each with a glass-bulb doorbell and a check plate of three dots W, F and S. The guard's booth has three levers: WING (A or B), FLOOR (G or 1) and SIDE (L or R); a key plate reads W = wing, F = floor, S = side, filled = matches this flat. Every bell checks all three levers: a dot fills where its lever matches the flat, and a bell rings only when all three match. The guard sets B, ground, right, and only that bell rings; eight settings ring eight bells, one at a time. The building folds into eight memory rows: three address wires run down through a checker at each row's left end, each row ends in a lamp. B, ground, right is 1 0 1, so only row 5's word line turns on, its lamp lights and its bits are read out. Each extra wire doubles the rows; twenty wires pick one of about a million rows. The rows fold back into the building, the levers return to the middle and the bell goes out."
      >
        <defs>
          <BulbGlowDef id="dx-glow" />
          <BulbGlowDef id="dx-pool" />
        </defs>
        {children}
      </Stage>
    </div>
  );
}

