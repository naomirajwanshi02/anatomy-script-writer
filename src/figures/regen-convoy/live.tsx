"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { paintEntry } from "../../iso/react/reel";
import { useFrameLoop, useInView } from "../../iso/react/live";
import { Stage } from "../../iso/react/draw";
import {
  arrowD,
  carSvg,
  contacts,
  cx,
  cy,
  dotAt,
  gaugeRise,
  ghostMarker,
  ghostSlide,
  inputPath,
  liftBy,
  markerPath,
  neighbourBump,
  readoutAt,
  roadAway,
  STAGE_H,
  STAGE_W,
  STREAK_FROM,
  streakPath,
  STREAKS,
  UNIT_X,
  windFrame,
} from "./geometry";
import { BRAND, GUSTS, KEY_TIME, gate, stateAt, type CarState } from "./model";

// Voice-synced builds map video time to figure time (voice.ts); the plain build plays the figure as is.
let timeMap: ((t: number) => number) | null = null;
export const setTimeMap = (fn: (t: number) => number) => void (timeMap = fn);

const f2 = (v: number) => v.toFixed(2);
const f3 = (v: number) => v.toFixed(3);
const DASH = 12;
const GAP = 9;

// The one loop: entrance, then the model drives the road, cars, gusts, fold, chain, gauges, curve card and readouts.
export function RcLive({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const state = useRef({ t: 0, svg: {} as Record<string, string>, txt: {} as Record<string, string> });

  const paint = (_dt: number, _snap: boolean) => {
    const root = ref.current;
    if (!root) return;
    const s = state.current;
    const ft = timeMap ? timeMap(s.t) : s.t;
    paintEntry(root, ft, contacts);
    const m = stateAt(ft);
    const q = <T extends Element = SVGGElement>(sel: string) => root.querySelector(sel) as (T & ElementCSSInlineStyle) | null;
    const show = (el: (Element & ElementCSSInlineStyle) | null, v: number) => {
      if (!el) return;
      el.style.opacity = f3(Math.max(0, Math.min(1, v)));
      el.style.display = v <= 0.001 ? "none" : "";
    };
    const set = (el: Element | null, attr: string, v: string) => {
      if (el && el.getAttribute(attr) !== v) el.setAttribute(attr, v);
    };
    const html = (el: Element | null, key: string, v: string) => {
      if (el && s.svg[key] !== v) {
        s.svg[key] = v;
        el.innerHTML = v;
      }
    };
    const text = (el: Element | null, key: string, v: string) => {
      if (el && s.txt[key] !== v) {
        s.txt[key] = v;
        el.textContent = v;
      }
    };
    const op = (k: string, v: number) => {
      const el = q(`[data-g="${k}"]`);
      if (el) el.style.opacity = f3(Math.max(0, Math.min(1, v)));
    };

    // ---------- Road: the centre dashes scroll while the convoy drives; it shrinks and slides away at the fold ----------
    const centre = q("[data-g=centre]");
    if (centre) {
      centre.style.strokeDasharray = `${f2(DASH * UNIT_X)} ${f2(GAP * UNIT_X)}`;
      centre.style.strokeDashoffset = f2(-(m.scroll % (DASH + GAP)) * UNIT_X);
    }
    const roadG = q("[data-road]");
    const away = Math.min(1, m.fold / 0.75);
    show(roadG, 1 - away);
    if (roadG) set(roadG, "transform", away > 0.001 ? roadAway(away) : "");
    op("linesGlow", m.linesGlow);
    show(q("[data-g=rails]"), m.rails);
    op("railGlow", m.railGlow);

    // ---------- Cars, the ghost convoy and the dots ----------
    const paintCar = (sel: string, key: string, c: CarState, ghost: boolean) => {
      const g = q(sel);
      if (!g) return;
      show(g, c.alpha);
      if (c.alpha <= 0.001) return;
      html(g, key, carSvg(c.x, c.y, c.k, ghost ? "ghost" : "rust", c.superCar, ghost ? "" : c.num, c.lean, c.superCar ? BRAND : ""));
    };
    m.cars.forEach((c) => paintCar(`[data-car="${c.id}"]`, `car-${c.id}`, c, false));
    m.ghosts.forEach((c) => paintCar(`[data-ghost="${c.id}"]`, `ghost-${c.id}`, c, true));
    m.dots.forEach((d, j) => {
      const el = q(`[data-dot="${j}"]`);
      show(el, d.alpha);
      if (d.alpha > 0.001) set(el, "d", dotAt(d.x, d.y, 3.4));
    });

    // ---------- Gusts (analogy): streaks blow across the road from behind onto car 1 ----------
    const car1 = m.cars[0];
    (Object.keys(GUSTS) as (keyof typeof GUSTS)[]).forEach((k) => {
      const g0 = m.gust(k);
      const target = car1.y + 6;
      STREAKS.forEach((st, i) => {
        const el = q<SVGPathElement>(`[data-streak="${k}${i}"]`);
        if (!el) return;
        const g = g0 - st.lag / 1.05;
        if (g <= 0 || g >= 1) return show(el, 0);
        const head = STREAK_FROM + (target - STREAK_FROM) * Math.min(1, g / 0.75) + Math.max(0, g - 0.75) * 30;
        set(el, "d", streakPath(windFrame(car1.x), head, st.dx * car1.k * 1.1, st.len * Math.min(1, g * 4)));
        show(el, Math.min(1, g / 0.12) * Math.min(1, (1 - g) / 0.25));
      });
    });

    // ---------- Circuit: wire segments (rust flow on a 1), ripple, neighbour wire ----------
    show(q("[data-g=wires]"), m.wires * m.live);
    m.segs.forEach((sg, i) => {
      const g = q(`[data-seg="${i}"]`);
      if (!g) return;
      set(g, "data-on", sg.flow ? "1" : "0");
      if (i === 0) {
        const d = inputPath(m.ripple.x, 3.2 * m.ripple.a);
        g.querySelectorAll("[data-sp]").forEach((p) => set(p, "d", d));
      }
    });
    const nb = q("[data-neighbour]");
    show(nb, m.neighbour * (0.4 + 0.6 * m.flash));
    set(nb?.querySelector("[data-nb]") ?? null, "d", neighbourBump(-98 + 14 * Math.min(1, m.flash), 3 * m.flash));

    // ---------- Inverter blocks: drop in, valves, pulses; the lit PMOS strap ----------
    m.blocks.forEach((b, i) => {
      const g = q(`[data-block="${i}"]`);
      show(g, b.alpha);
      if (!g || b.alpha <= 0.001) return;
      set(g, "data-p", String(b.pmos));
      set(g, "data-n", String(b.nmos));
      const lift = g.querySelector("[data-lift]") as SVGGElement | null;
      lift?.setAttribute("transform", liftBy(40 * (1 - b.drop) ** 2 + 2.5 * b.pulse));
      lift?.style.setProperty("--pulse", f3(b.pulse));
    });
    show(q("[data-g=strapLit]"), m.strapLit * m.live);

    // ---------- Gauges: rise on "a voltage", bands, lanes look, 0.5 glow, rust marker ----------
    m.gauges.forEach((gs, i) => {
      const g = q(`[data-gauge="${i}"]`);
      show(g, m.gaugeIn * m.live);
      if (!g || m.gaugeIn <= 0.001) return;
      set(g, "transform", gaugeRise(m.gaugeIn));
      const o = (sel: string, v: number) => {
        const el = g.querySelector(sel) as (Element & ElementCSSInlineStyle) | null;
        if (el) el.style.opacity = f3(Math.max(0, Math.min(1, v)));
      };
      o('[data-gb="1"]', m.band1);
      o('[data-gb="0"]', m.band0);
      o('[data-gd="1"]', 0.55 + 0.45 * m.band1);
      o('[data-gd="0"]', 0.55 + 0.45 * m.band0);
      o("[data-glanes]", m.lanes);
      o("[data-gh]", m.glowHalf);
      const mk = g.querySelector("[data-gm]");
      set(mk, "d", markerPath(i, gs.v));
      (mk as SVGPathElement | null)?.style.setProperty("--pulse", f3(gs.pulse));
    });

    // ---------- Curve card ----------
    const card = q("[data-card]");
    show(card, m.card * m.live);
    if (card && m.card > 0.001) {
      card.setAttribute("transform", `translate(0 ${f2(40 * (1 - m.card))})`);
      op("cardHalf", m.glowHalf);
      op("flatLo", m.flat * 0.95);
      op("flatHi", m.flat * 0.95);
      const vin = m.curveIn;
      const vout = m.curveOut;
      set(q("[data-g=arrowIn]"), "d", arrowD(cx(0.45), cy(0) - 10, cx(0.55), cy(0) - 10, m.arrowIn, 6));
      set(q("[data-g=arrowOut]"), "d", arrowD(cx(0) + 10, cy(gate(0.45)), cx(0) + 10, cy(gate(0.55)), m.arrowOut, 8));
      show(q("[data-g=curveDot]"), m.curveDot);
      set(q("[data-cin]"), "cx", f2(cx(vin)));
      set(q("[data-cin]"), "cy", f2(cy(0)));
      set(q("[data-cout]"), "cx", f2(cx(0)));
      set(q("[data-cout]"), "cy", f2(cy(vout)));
      set(q("[data-cpt]"), "cx", f2(cx(vin)));
      set(q("[data-cpt]"), "cy", f2(cy(gate(vin))));
      set(q("[data-cg]"), "d", `M${f2(cx(vin))} ${f2(cy(0))}V${f2(cy(gate(vin)))}H${f2(cx(0))}`);
    }

    // ---------- Key-state readouts: right below gauges 1-3 (between each panel and the wire) ----------
    m.readouts.forEach((r, i) => {
      const g = q(`[data-ro="${i}"]`);
      show(g, r.alpha);
      if (!g || r.alpha <= 0.001) return;
      const [x, y] = readoutAt(i);
      g.setAttribute("transform", `translate(${f2(x)} ${f2(y)})`);
      text(g.querySelector("[data-ro-val]"), `ro${i}`, r.text);
    });

    // ---------- Ghost copying row ----------
    const gr = q("[data-ghostrow]");
    show(gr, m.ghostRow.alpha);
    if (gr && m.ghostRow.alpha > 0.001) {
      gr.setAttribute("transform", ghostSlide(-30 * (1 - Math.min(1, m.ghostRow.alpha * 1.2))));
      set(gr.querySelector("[data-gm]"), "d", ghostMarker(m.ghostRow.u, m.ghostRow.v));
    }
    const ctr = q("[data-counter]");
    show(ctr, m.ghostRow.u > 0 ? m.ghostRow.alpha : 0);
    text(ctr?.querySelector("[data-count]") ?? null, "count", String(m.ghostRow.n));
  };

  useFrameLoop((dt, reduced) => {
    state.current.t = reduced ? KEY_TIME : state.current.t + dt;
    paint(dt, reduced);
    return !reduced;
  }, inView);
  useEffect(() => paint(0, true), []);

  return (
    <div ref={ref} className="rc-stage">
      <Stage
        width={STAGE_W}
        height={STAGE_H}
        label="A two-lane road with a convoy of rust cars 1, 2 and a supercar 20. A gust makes car 1 wobble inside its lane while the others drive straight; when car 1 changes lane every car behind follows, but its wobble does not pass on. A dashed ghost convoy that copies every move lets the wobble grow until ghost 20 weaves over the line. The road slides away and each car shrinks into a pair of inverter gates on one wire between a VDD rail and a GND rail, each gate with a blue PMOS valve to VDD and a red NMOS valve to GND. Upright 0 to 1 volt gauges above the wire show car 1's input, its middle wire, its output and car 20's output, each with a 1 band, a 0 band and a 0.5 line. A transfer curve card shows a tiny change at 0.5 volts swinging the output far, and flat ends inside the bands. A bump from a neighbour wire pulls car 1's input to 0.7 volts; the first gate gives 0.00 volts, the second a clean 1.00 volt. A ghost row of copying blocks drifts 0.02 volts per stage and reaches 0.5 after 20. The chain folds back into the road."
      >
        {children}
      </Stage>
    </div>
  );
}
