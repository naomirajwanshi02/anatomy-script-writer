"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { solidSvg } from "../../iso/iso-kit";
import { liquidColor, tapSpokes, waterSvg } from "../../iso/analogy/water";
import { paintEntry } from "../../iso/react/reel";
import { useFrameLoop, useInView } from "../../iso/react/live";
import { Stage } from "../../iso/react/draw";
import {
  boardSvg,
  contacts,
  drainTaps,
  engraveAt,
  fillTaps,
  gauges,
  knobTransform,
  leverRod,
  levers,
  liftPx,
  METER,
  STAGE_H,
  STAGE_W,
  supplyWater,
  tankGhost,
  tankGlass,
  tankTicks,
  tankWater,
  TANK_H,
  view,
} from "./geometry";
import { KEY_TIME, stateAt } from "./model";

const f2 = (v: number) => v.toFixed(2);
const flag = (b: boolean) => (b ? "1" : "0");
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

// The one loop: writes every state from the model into the static art and the readout.
export function TtLive({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const state = useRef({ t: 0, board: -1, glass: -1 });

  const paint = () => {
    const root = ref.current;
    if (!root) return;
    const fig = root.closest("[data-figure]") as HTMLElement | null;
    const s = state.current;
    const t = s.t;
    paintEntry(root, t, contacts);
    const m = stateAt(t);
    const q = <T extends Element>(sel: string) => root.querySelector<T>(sel);
    const qa = <T extends Element>(sel: string) => Array.from(root.querySelectorAll<T>(sel));
    const show = (el: Element | null, opacity: number) => {
      if (!el) return;
      const st = (el as SVGElement).style;
      st.display = opacity <= 0.001 ? "none" : "";
      st.opacity = opacity.toFixed(3);
    };
    const setAttr = (el: Element | null, name: string, v: string) => {
      if (el && el.getAttribute(name) !== v) el.setAttribute(name, v);
    };
    const F = m.fold;

    // ---------- Board: square (tank) -> long (circuit) ----------
    const fb = Math.round(F * 200) / 200;
    if (fb !== s.board) {
      s.board = fb;
      const b = boardSvg(fb);
      const el = q("[data-board]");
      if (el)
        el.innerHTML =
          `<path class="iso-halo" d="${b.halo}"/>` +
          b.feet.map((f) => solidSvg(f, { tone: "lo" })).join("") +
          solidSvg(b.slab, { tone: "mid" }) +
          `<path class="iso-line" data-tone="lo" d="${b.inset}"/><path class="iso-line" data-tone="lo" d="${b.rings}"/>`;
      setAttr(q(".tt-engrave text"), "transform", engraveAt(fb));
    }

    // ---------- Scenes: the water parts sink and fade, the circuit rises in ----------
    const sink = (u: number) => `translate(0 ${f2(liftPx(10 * u))})`;
    for (const k of ["water", "gauges"]) {
      const g = q(`[data-scene='${k}']`);
      show(g, 1 - F);
      setAttr(g, "transform", sink(F));
    }
    const cg = q("[data-scene='circuit']");
    show(cg, F);
    setAttr(cg, "transform", sink(1 - F));
    qa("[data-lbl='a']").forEach((g) => ((g as SVGGElement).style.opacity = (1 - F).toFixed(3)));
    // Pair colours (analogy only): fade out on the lever knobs and plates with the fold.
    qa("[data-lever]").forEach((g) => (g as SVGGElement).style.setProperty("--pk", (1 - F).toFixed(3)));
    qa("[data-lbl='c']").forEach((g) => ((g as SVGGElement).style.opacity = F.toFixed(3)));

    // ---------- Analogy ----------
    const A = m.analogy;
    if (F < 0.999) {
      // Supply tank: steady level, ripples follow the outflow.
      const sw = supplyWater(0.78, 0.25 + 0.8 * clamp01(m.supply[0] * 2), t);
      const swEl = q("[data-supply-water]");
      if (swEl) {
        swEl.innerHTML = waterSvg(sw);
        setAttr(swEl, "transform", `translate(0 ${f2(sw.dy)})`);
      }
      // Shared tank: glass flattens with the fold; water at the computed level.
      const h = TANK_H * (1 - 0.97 * F);
      const hb = Math.round(h * 4) / 4;
      if (hb !== s.glass) {
        s.glass = hb;
        const gl = q("[data-tank-glass]");
        if (gl) gl.innerHTML = solidSvg(tankGlass(hb), { tone: "mid" });
        setAttr(q("[data-tank-ticks]"), "d", tankTicks(hb));
      }
      const inflow = Math.abs(m.seg[2]) + m.rush;
      const tw = tankWater(h, m.level, (1 - F) * (0.3 + 1.4 * clamp01(inflow * 1.5)) * (1 + 0.6 * A.surge), t);
      const twEl = q("[data-tank-water]");
      if (twEl) {
        twEl.innerHTML = waterSvg(tw);
        setAttr(twEl, "transform", `translate(0 ${f2(tw.dy)})`);
      }
      setAttr(q("[data-tank]"), "data-hl", flag(A.tankHl));
      show(q("[data-warn='a']"), m.warnA ? 1 : 0);

      // Flow streaks: on while water moves through that run; fast while the rush is named; a surge at "fight".
      const streak = (id: string, flow: number) => {
        const g = q(`[data-streak='${id}']`);
        if (!g) return;
        const on = Math.abs(flow) > 0.02;
        setAttr(g, "data-on", flag(on));
        setAttr(g, "data-dir", flow < 0 ? "-1" : "1");
        setAttr(g, "data-fast", flag(A.fast));
        setAttr(g, "data-surge", flag(A.surge > 0.3));
        (g as SVGGElement).style.opacity = on ? Math.min(1, 0.45 + Math.abs(flow) * 1.4).toFixed(3) : "0";
      };
      for (let j = 0; j < 3; j++) {
        streak(`s${j}`, m.supply[j]);
        streak(`r${j}`, m.ip[j]);
        streak(`f${j}`, m.ip[j]);
        streak(`h${j}`, m.seg[j]);
        streak(`d${j}`, m.inn[j]);
        streak(`g${j}`, m.gutter[j]);
      }
      (q("[data-gutter-water]") as SVGPathElement | null)?.style.setProperty("opacity", (0.35 + 0.65 * clamp01(m.gutter[0] * 2)).toFixed(3));

      // Taps: the handle lies along the pipe while open, across it while shut.
      for (let i = 0; i < 3; i++) {
        const ft = q(`[data-tap='f${i}']`);
        setAttr(ft?.querySelector("[data-spoke]") ?? null, "d", tapSpokes(fillTaps[i], m.gp[i], view, "y")[0]);
        setAttr(ft, "data-hl", flag(A.fillHl || A.colHl[i]));
        const dt = q(`[data-tap='d${i}']`);
        setAttr(dt?.querySelector("[data-spoke]") ?? null, "d", tapSpokes(drainTaps[i], m.gn[i], view, "y")[0]);
        setAttr(dt, "data-hl", flag(A.drainHl || A.colHl[i]));
        const gg = q(`[data-gauge='${i}']`);
        setAttr(gg?.querySelector("[data-needle]") ?? null, "d", gauges[i].needle(m.level));
        setAttr(gg, "data-hl", flag(A.gaugeHl[i]));
      }
      // "Three tap pairs": each pair lifts and settles in turn.
      qa("[data-lift]").forEach((g) => {
        const i = Number(g.getAttribute("data-lift"));
        setAttr(g, "transform", `translate(0 ${f2(-liftPx(6 * A.colLift[i]))})`);
      });
    }

    // ---------- Levers (lock -> enable) and their links ----------
    const C = m.circ;
    levers.forEach((l, i) => {
      const g = q(`[data-lever='${i}']`);
      if (!g) return;
      setAttr(g.querySelector(".tt-rod"), "d", leverRod(l.x, m.lever[i]));
      setAttr(g.querySelector(".tt-knob"), "transform", knobTransform(l.x, m.lever[i]));
      setAttr(g, "data-hl", flag(F < 0.5 ? A.leverHl[i] : C.enHl[i]));
      show(g.querySelector("[data-ghostlock]"), C.ghostLock);
      setAttr(q(`[data-link='${i}']`), "data-hl", flag(F >= 0.5 && C.enHl[i]));
    });

    // ---------- Circuit ----------
    if (F > 0.001) {
      const strap = (id: string, cur: number) => {
        const g = q(`[data-strap='${id}']`);
        if (!g) return;
        setAttr(g, "data-on", flag(Math.abs(cur) > 0.02));
        setAttr(g, "data-dir", cur < 0 ? "-1" : "1");
        (g as SVGGElement).style.setProperty("--i", clamp01(0.25 + Math.abs(cur) * 2.2).toFixed(3));
      };
      for (let i = 0; i < 3; i++) {
        strap(`vp${i}`, m.ip[i]);
        strap(`pp${i}`, m.ip[i]);
        strap(`pn${i}`, m.inn[i]);
        strap(`ng${i}`, m.inn[i]);
        strap(`b${i}`, m.seg[i]);
        const p = q<SVGGElement>(`[data-dev='p${i}']`);
        p?.style.setProperty("--g", C.gateP[i].toFixed(3));
        setAttr(p, "data-hl", flag(C.pHl[i]));
        const n = q<SVGGElement>(`[data-dev='n${i}']`);
        n?.style.setProperty("--g", C.gateN[i].toFixed(3));
        setAttr(n, "data-hl", flag(C.nHl[i]));
        setAttr(q(`[data-chip='${i}']`), "data-hl", flag(C.chipHl[i]));
        setAttr(q(`[data-pin='${i}']`), "transform", `translate(0 ${f2(-liftPx(3.2 * C.pinLift[i]))})`);
        show(q(`[data-read='${i}']`), C.readTicks[i] ? 1 : 0);
        const tg = q(`[data-tag='${i}']`);
        show(tg, C.tag[i] ? 1 : 0);
        const tt = tg?.querySelector("text");
        if (tt && C.tag[i] && tt.textContent !== C.tag[i]) tt.textContent = C.tag[i];
        setAttr(tg, "data-z", flag(C.tag[i] === "Z"));
      }
      setAttr(q("[data-bus]"), "data-hl", flag(C.busHl));
      const gh = q<SVGPathElement>("[data-ghost-tank]");
      if (gh) {
        if (!gh.getAttribute("d")) gh.setAttribute("d", tankGhost(TANK_H));
        show(gh, C.ghostTank);
      }
      show(q("[data-warn='c']"), m.warnC ? 1 : 0);
    }

    // ---------- Readout: table and level meter ----------
    if (fig) {
      const circ = F >= 0.5;
      const heads = circ ? ["chip", "EN", "out"] : ["pair", "lock", "tap"];
      fig.querySelectorAll<HTMLElement>(".tt-table th").forEach((th, k) => {
        if (th.textContent !== heads[k]) th.textContent = heads[k];
      });
      fig.querySelectorAll<HTMLElement>(".tt-table tbody tr").forEach((tr, i) => {
        const c1 = tr.querySelector<HTMLElement>("[data-c='1']");
        const c2 = tr.querySelector<HTMLElement>("[data-c='2']");
        if (!c1 || !c2) return;
        let v1: string;
        let v2: string;
        let act: boolean;
        if (circ) {
          v1 = String(m.en[i]);
          v2 = m.out[i];
          act = v2 !== "Z";
        } else {
          v1 = m.en[i] ? "off" : "on";
          v2 = m.gp[i] > 0.5 ? "fill" : m.gn[i] > 0.5 ? "drain" : "shut";
          act = v2 !== "shut";
        }
        if (c1.textContent !== v1) c1.textContent = v1;
        if (c2.textContent !== v2) c2.textContent = v2;
        c2.setAttribute("data-act", flag(act));
        c1.setAttribute("data-dim", flag(circ ? m.en[i] === 0 : m.en[i] === 0));
      });
      const M = METER;
      const yv = M.bottom - m.level * (M.bottom - M.top);
      const fill = fig.querySelector("[data-meter-fill]");
      if (fill) {
        fill.setAttribute("y", yv.toFixed(1));
        fill.setAttribute("height", Math.max(0, M.bottom - yv).toFixed(1));
        (fill as SVGRectElement).style.fill = liquidColor(clamp01((F - 0.2) / 0.6));
      }
      const title = fig.querySelector("[data-meter-title]");
      const tv = circ ? "bus" : "tank";
      if (title && title.textContent !== tv) title.textContent = tv;
      const val = fig.querySelector("[data-meter-value]");
      const vv = circ ? m.busValue : `${Math.round(m.level * 100)}%`;
      if (val) {
        if (val.textContent !== vv) val.textContent = vv;
        val.setAttribute("data-dim", flag(circ && vv === "?"));
        val.setAttribute("data-hl", flag(circ && C.meterHl));
      }
    }
  };

  useFrameLoop((dt, reduced) => {
    state.current.t = reduced ? KEY_TIME : state.current.t + dt;
    paint();
    return !reduced;
  }, inView);
  useEffect(() => paint(), []);

  return (
    <div ref={ref} className="tt-stage">
      <Stage
        width={STAGE_W}
        height={STAGE_H}
        label="A shared water tank on a board with three tap pairs. Each pair has a fill tap from a raised supply pipe and a drain tap to a gutter, a lock lever and a level gauge. When pair 1 fills and pair 2 drains at once, water rushes straight through and the level sticks at half. Locking pairs 2 and 3 shuts both their taps, so pair 1 fills the tank alone. The board folds into a circuit: the tank becomes a bus wire, the supply pipe the VDD rail, the gutter the GND rail, each pair a chip with a PMOS and an NMOS, each lock an enable lever EN1 to EN3. One chip pushing 1 and another pulling 0 makes current rush from VDD to GND and the bus sits at an unknown level. With enable off, both switches turn off and the chip's output pin lifts off the bus: a third state, Z. Chip 1 drives a clean 1 while chips 2 and 3 read. The board folds back into the tank."
      >
        {children}
      </Stage>
    </div>
  );
}
