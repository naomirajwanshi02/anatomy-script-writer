"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { paintEntry } from "../../iso/react/reel";
import { useFrameLoop, useInView } from "../../iso/react/live";
import { Stage } from "../../iso/react/draw";
import {
  arrowD,
  carBox,
  carCentre,
  carSvg,
  contacts,
  cx,
  cy,
  DASH,
  dogBob,
  dogLegs,
  dogMatrix,
  dogShadow,
  dogTail,
  GAP,
  ghostMarker,
  markerPath,
  segPath,
  shiftBy,
  STAGE_H,
  STAGE_W,
  UNIT_X,
} from "./geometry";
import { buf, KEY_TIME, stateAt, type CarState } from "./model";

// Voice-synced builds map video time to figure time (voice.ts); the plain build plays the figure as is.
let timeMap: ((t: number) => number) | null = null;
export const setTimeMap = (fn: (t: number) => number) => void (timeMap = fn);

const f2 = (v: number) => v.toFixed(2);
const f3 = (v: number) => v.toFixed(3);
const clamp01 = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u);

// A part falling onto the board: hidden until it starts, accelerates down, lands at `land` with a small hop.
const fallH = (vt: number, land: number) => {
  const s = (vt - (land - 0.45)) / 0.45;
  if (s < 0) return { h: 0, alpha: 0 };
  if (s < 1) return { h: 120 * (1 - s * s), alpha: Math.min(1, s * 3) };
  const b = vt - land;
  return { h: b < 0.16 ? 2.2 * Math.sin((Math.PI * b) / 0.16) : 0, alpha: 1 };
};

// The one loop: entrance, then the model drives the road scene, the folds, the circuit, the card and the readout.
export function RcLive({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const state = useRef({ t: 0, svg: {} as Record<string, string>, txt: {} as Record<string, string> });

  const paint = () => {
    const root = ref.current;
    if (!root) return;
    const s = state.current;
    const ft = timeMap ? timeMap(s.t) : s.t;
    paintEntry(root, ft, contacts);
    const m = stateAt(ft);
    const vt = m.vt;
    const q = <T extends Element = SVGGElement>(sel: string) => root.querySelector(sel) as (T & ElementCSSInlineStyle) | null;
    const show = (el: (Element & ElementCSSInlineStyle) | null, v: number) => {
      if (!el) return;
      el.style.opacity = f3(clamp01(v));
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

    // ---------- Road scene: leaves at the fold (slides back and fades), returns at the fold back ----------
    const away = m.roadAway;
    const roadT = away > 0.001 ? shiftBy(0, -50 * away, 0) : "";
    for (const sel of ["[data-roadbase]", "[data-roadparts]"]) {
      const g = q(sel);
      show(g, 1 - away);
      set(g, "transform", roadT);
    }
    const centre = q("[data-centre]");
    if (centre) {
      centre.style.strokeDashoffset = f2((m.scroll % (DASH + GAP)) * UNIT_X);
    }
    show(q("[data-linesglow]"), m.lines);

    const paintCar = (sel: string, key: string, c: CarState, alpha: number, extra = "") => {
      const g = q(sel);
      if (!g) return;
      show(g, alpha);
      if (alpha <= 0.001) return;
      html(g, key, carSvg(c.x, c.y, c.yaw, c.num));
      set(g, "transform", extra);
    };
    if (away < 0.999) {
      m.ghosts.forEach((c) => paintCar(`[data-ghost="${c.id}"]`, `g-${c.id}`, c, m.ghostAlpha));
      m.cars.forEach((c, k) => {
        let extra = "";
        if (k === 4 && m.car5 > 0.001) {
          const [px, py] = carCentre(c.x, c.y);
          const sc = 1 + 0.1 * m.car5;
          extra = `translate(${f2(px)} ${f2(py)}) scale(${f3(sc)}) translate(${f2(-px)} ${f2(-py)})`;
        }
        paintCar(`[data-car="${c.id}"]`, `c-${c.id}`, c, m.realAlpha, extra);
        const g = q(`[data-car="${c.id}"]`);
        if (g) g.style.setProperty("--pulse", f3(k === 4 ? m.car5 : 0));
      });
      // Warning outline round ghost car 5 while it is over the line.
      const warn = q("[data-warn]");
      show(warn, m.warn);
      if (warn && m.warn > 0.001) {
        const c = m.ghosts[4];
        const b = carBox(c.x, c.y, c.yaw);
        set(warn, "x", f2(b.x));
        set(warn, "y", f2(b.y));
        set(warn, "width", f2(b.w));
        set(warn, "height", f2(b.h));
      }
      // Dog: drawn behind the cars while it is in the back lane, in front of them otherwise.
      const d = m.dog;
      const back = d.y < -16;
      for (const slot of ["back", "front"] as const) {
        const g = q(`[data-dog="${slot}"]`);
        const on = d.alpha > 0.001 && (slot === "back") === back;
        show(g, on ? d.alpha : 0);
        if (!g || !on) continue;
        set(g.querySelector("[data-dshadow]"), "d", dogShadow(d.y));
        set(g.querySelector("[data-dmatrix]"), "transform", dogMatrix(d.y));
        set(g.querySelector("[data-dbob]"), "transform", dogBob(d.phase));
        set(g.querySelector("[data-dlegs]"), "d", dogLegs(d.phase));
        set(g.querySelector("[data-dtail]"), "d", dogTail(d.phase));
      }
    }

    // ---------- Circuit: flat parts fade in; gates and gauges fall on; everything lifts away at the fold back ----------
    const lift = m.circLift;
    show(q("[data-circbase]"), m.circBase);
    const parts = q("[data-circparts]");
    const circOn = m.circBase > 0.001 || (vt > 26 && vt < 63);
    show(parts, circOn ? 1 - lift : 0);
    set(parts, "transform", lift > 0.001 ? shiftBy(0, 0, 40 * lift) : "");
    if (circOn) {
      m.segs.forEach((v, i) => {
        const g = q(`[data-seg="${i}"]`);
        if (!g) return;
        set(g, "data-on", v >= 0.5 ? "1" : "0");
        const hp = m.humps.find((h) => h[0] === i);
        const d = segPath(i, hp ? hp[1] : 0, hp ? hp[2] : 0);
        g.querySelectorAll("[data-sp]").forEach((p) => set(p, "d", d));
      });
      m.gatePulse.forEach((p, i) => {
        const g = q(`[data-gate="${i}"]`);
        if (!g) return;
        const f = fallH(vt, 26.7 + 0.08 * i);
        const h = f.h + 2.5 * p;
        show(g, f.alpha);
        set(g, "transform", h > 0.001 ? shiftBy(0, 0, h) : "");
        g.style.setProperty("--pulse", f3(Math.max(p, i === 1 ? m.hl2 : 0)));
        g.setAttribute("data-hl", i === 1 && m.hl2 > 0.5 ? "1" : "0");
      });
      show(q("[data-valve]"), m.valve);
      show(q("[data-litstrap]"), m.railLit);
      show(q("[data-railglow]"), m.railLit);
      m.segs.slice(1).forEach((v, i) => {
        const g = q(`[data-gauge="${i}"]`);
        if (!g) return;
        const f = fallH(vt, 27.05 + 0.08 * i);
        show(g, f.alpha);
        set(g, "transform", f.h > 0.001 ? shiftBy(0, 0, f.h) : "");
        const bands = q(`[data-gauge="${i}"] [data-bands]`);
        if (bands) bands.style.opacity = f3(m.bands);
        const b1 = g.querySelector<SVGPathElement>('[data-bf="1"]');
        const b0 = g.querySelector<SVGPathElement>('[data-bf="0"]');
        const all = m.outGauges;
        if (b1) b1.style.opacity = f3(Math.max(m.topBands, all * 0.9));
        if (b0) b0.style.opacity = f3(m.botBands);
        const mk = g.querySelector<SVGPathElement>("[data-marker]");
        set(mk, "d", markerPath(i, v));
        if (mk) mk.style.setProperty("--pulse", f3(i === 1 ? m.g2Marker : 0));
      });
      const gp = q("[data-ghostparts]");
      const gw = q("[data-ghostwire]");
      const gf = fallH(vt, 27.2);
      show(gp, gf.alpha * (m.ghostWire / 0.75));
      set(gp, "transform", gf.h > 0.001 ? shiftBy(0, 0, gf.h) : "");
      show(gw, m.ghostWire / 0.75);
      set(q("[data-gmarker]"), "d", ghostMarker(m.ghostSegs[5]));
    }

    // ---------- Curve card ----------
    const card = q("[data-card]");
    show(card, m.card);
    if (card && m.card > 0.001) {
      set(card, "transform", `translate(0 ${f2(70 * (1 - m.card))})`);
      show(q("[data-half]"), m.half);
      show(q("[data-steep]"), m.half);
      show(q("[data-flattop]"), m.flatTop);
      const ci = m.cardIn;
      const co = m.cardOut;
      set(q("[data-cin]"), "cx", f2(cx(ci)));
      set(q("[data-cin]"), "cy", f2(cy(0)));
      set(q("[data-cout]"), "cx", f2(cx(0)));
      set(q("[data-cout]"), "cy", f2(cy(co)));
      set(q("[data-guide]"), "d", `M${f2(cx(ci))} ${f2(cy(0))}V${f2(cy(buf(ci)))}H${f2(cx(0))}`);
      set(q("[data-arrow]"), "d", arrowD(cx(0) + 16, cy(m.cardOutFrom), cx(0) + 16, cy(buf(0.55)), m.arrowOut, 10));
    }

    // ---------- Readout ----------
    const ro = q("[data-readout]");
    show(ro, m.readout.alpha);
    if (ro && m.readout.alpha > 0.001) {
      text(q("[data-rolabel]"), "rol", m.readout.label);
      text(q("[data-roval]"), "rov", m.readout.text);
    }
  };

  useFrameLoop((dt, reduced) => {
    state.current.t = reduced ? KEY_TIME : state.current.t + dt;
    paint();
    return !reduced;
  }, inView);
  useEffect(() => paint(), []);

  return (
    <div ref={ref} className="rc2-stage">
      <Stage
        width={STAGE_W}
        height={STAGE_H}
        label="A two-lane road with five supercars numbered 1 to 5. As faint ghost cars, each copies the swing of the car ahead and adds its own, so the swing grows until car 5 crosses the middle line. As real cars, they follow car 1's lane change but not its swerves when a dog runs across. The road leaves and a chain of five buffer gates on one wire appears between a 1 volt rail and a 0 volt rail, with a 0 to 1 volt gauge over each gate's output. A transfer curve card shows a small step across 0.5 volts swinging the output far, and a flat top. A bump pulls gate 2's input to 0.7 volts; its output stays at 1.0 volts. A faint copying wire below sinks from 0.9 to 0.5 volts. The road returns."
      >
        {children}
      </Stage>
    </div>
  );
}
