"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { paintEntry } from "../../iso/react/reel";
import { approach, useFrameLoop, useInView } from "../../iso/react/live";
import { BulbGlowDef } from "../../iso/react/bulb";
import { Stage } from "../../iso/react/draw";
import {
  carFrame,
  carSvg,
  contacts,
  facePt,
  gapQuad,
  gateLift,
  GAUGE_WIND,
  panelFrame,
  panelPaths,
  readoutAt,
  ROAD_WIND,
  slideAt,
  sOfY,
  STAGE_H,
  STAGE_W,
  STREAK_FROM,
  STREAK_PAST,
  streakPath,
  STREAKS,
  vOfX,
  wirePath,
  xOfS,
  zOf,
  type CarLook,
} from "./geometry";
import { CAR, CAR_HALF_V, GHOST, KEY_TIME, PUSH, ROAD, SEPIA, VIH, VIL, WIRE, scrollAt, stateAt } from "./model";

// Voice-synced builds map video time to figure time (voice.ts); the plain build plays the figure as is.
let timeMap: ((t: number) => number) | null = null;
export const setTimeMap = (fn: (t: number) => number) => void (timeMap = fn);

const f2 = (v: number) => v.toFixed(2);
const f3 = (v: number) => v.toFixed(3);

// Double arrow between two screen points (a = fixed end, b = growing end), heads at both ends.
function arrowD(a: [number, number], b: [number, number], g: number, head = 6) {
  if (g <= 0.001) return "";
  const ex = a[0] + (b[0] - a[0]) * g;
  const ey = a[1] + (b[1] - a[1]) * g;
  const dir = Math.sign(b[1] - a[1]) || 1;
  const h = Math.min(head, Math.abs(ey - a[1]) / 2 + 0.5);
  return (
    `M${f2(a[0])} ${f2(a[1])}L${f2(ex)} ${f2(ey)}` +
    `M${f2(a[0] - h)} ${f2(a[1] + dir * h)}L${f2(a[0])} ${f2(a[1])}L${f2(a[0] + h)} ${f2(a[1] + dir * h)}` +
    `M${f2(ex - h)} ${f2(ey - dir * h)}L${f2(ex)} ${f2(ey)}L${f2(ex + h)} ${f2(ey - dir * h)}`
  );
}

const S_RUST = sOfY(CAR.y);
const S_SEPIA = sOfY(SEPIA.y);
const PUSH_V = PUSH / ROAD.width;

// The one loop: entrance, then the model drives the road, gusts, cars, fold, scale extras, wire, gates and lamp.
export function NmLive({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const state = useRef({ t: 0, lamp: 0, ro: "", cars: {} as Record<string, string> });

  const paint = (dt: number, snap: boolean) => {
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
    const live = 1 - m.out; // circuit parts fade at the fold back
    const upright = m.fold >= 0.999;

    // ---------- The road / upright scale ----------
    const pf = panelFrame(m.fold);
    const p = panelPaths(pf, scrollAt(ft));
    q("[data-panel]")
      ?.querySelectorAll<SVGPathElement>("[data-pp]")
      .forEach((el) => set(el, "d", p[el.getAttribute("data-pp") as keyof typeof p]));
    show(q("[data-plinth]"), m.plinth);
    show(q("[data-face]"), upright ? 1 : 0);
    show(q("[data-sign]"), m.car);

    // ---------- Cars: rust (our 1), sepia (the 0 lane), ghost near the line ----------
    const paintCar = (key: string, look: CarLook, sPos: number, v: number, lean: number, alpha: number) => {
      const g = q(`[data-car="${key}"]`);
      if (!g) return;
      show(g, alpha);
      if (alpha <= 0.001) return;
      const svg = carSvg(carFrame(pf, sPos, v), look, lean);
      if (s.cars[key] !== svg) {
        s.cars[key] = svg;
        g.innerHTML = svg;
      }
    };
    paintCar("rust", "rust", S_RUST, m.cars.one - m.carPush * PUSH_V, 0.09 * m.carPush, (1 - m.ghost) * (1 - 0.55 * m.park));
    paintCar("sepia", "sepia", S_SEPIA, m.cars.zero, 0, 1 - 0.65 * m.dim0);
    paintCar("ghost", "ghost", S_RUST, vOfX(GHOST.x) - m.ghostPush * PUSH_V, 0.09 * m.ghostPush, m.ghost * 0.85);

    // ---------- Wind: road gusts along +x, gauge gusts down onto the rust car ----------
    const gust = (k: string, g0: number, place: (st: (typeof STREAKS)[number], g: number) => [number, number, number]) =>
      STREAKS.forEach((st, i) => {
        const el = q<SVGPathElement>(`[data-streak="${k}${i}"]`);
        if (!el) return;
        const g = g0 - st.lag / 1.1;
        if (g <= 0 || g >= 1) return show(el, 0);
        const [head, w, len] = place(st, g);
        set(el, "d", streakPath(k === "ghost" || k === "car" ? ROAD_WIND : GAUGE_WIND, head, w, len * Math.min(1, g * 4)));
        show(el, Math.min(1, g / 0.12) * Math.min(1, (1 - g) / 0.25));
      });
    const roadGust = (target: { x: number; y: number }) => (st: (typeof STREAKS)[number], g: number) =>
      [STREAK_FROM + (target.x + STREAK_PAST - STREAK_FROM) * g, target.y + st.dy, st.len] as [number, number, number];
    gust("ghost", m.gustGhost, roadGust(GHOST));
    gust("car", m.gustCar, roadGust(CAR));
    // On the gauge, heads run from v 1.12 down to v 0.75 (head coordinate = -z), spread across the rust car.
    const gaugeGust = (scale: number) => (st: (typeof STREAKS)[number], g: number) =>
      [-zOf(1.12 + (0.75 - 1.12) * g), xOfS(S_RUST) + st.dy * 0.7, st.len * 0.6 * scale] as [number, number, number];
    gust("noise", upright ? m.gustNoise : 0, gaugeGust(0.8));
    gust("big", upright ? m.gustBig : 0, gaugeGust(1.1));

    // ---------- Scale extras ----------
    const gq = (k: string) => q(`[data-g="${k}"]`);
    const op = (k: string, v: number) => {
      const el = gq(k);
      if (el) el.style.opacity = f3(v);
    };
    const vRust = m.cars.one;
    const vSepia = m.cars.zero;
    const edge1 = vRust - CAR_HALF_V;
    const edge0 = vSepia + CAR_HALF_V;
    op("ticks", m.rise * live);
    op("labels", m.rise * live);
    op("label6", m.line6 * live);
    op("label4", m.line4 * live);
    op("digit1", m.band1 * live);
    op("digit0", m.band0 * live);
    op("bandFlash", m.bandFlash * 0.45);
    op("glow6", Math.max(m.glow6, m.lane) * live);
    gq("glow6")?.style.setProperty("--p", f3(Math.max(m.glow6, m.lane)));
    op("glow4", m.glow4 * live);
    gq("glow4")?.style.setProperty("--p", f3(m.glow4));
    const gap = gq("gap");
    if (gap) {
      gap.style.opacity = f3(m.gapFlash * 0.75);
      if (m.gapFlash > 0) set(gap, "d", gapQuad(S_RUST, edge1, VIH));
    }
    const bf1 = gq("bfill1");
    if (bf1) {
      bf1.style.opacity = f3(m.bfill1 * 0.4 * live);
      if (m.bfill1 > 0) set(bf1, "d", gapQuad(S_RUST, edge1, VIH));
    }
    const bf0 = gq("bfill0");
    if (bf0) {
      bf0.style.opacity = f3(m.bfill0 * 0.4 * live);
      if (m.bfill0 > 0) set(bf0, "d", gapQuad(S_SEPIA, edge0, VIL));
    }
    // Safety-room arrows: from the rust car's lower edge down to the 0.6 line; from the sepia car's upper edge up to
    // the 0.4 line.
    const bracket = (k: string, sPos: number, from: number, to: number, g: number, pulse: number) => {
      const el = gq(k);
      if (!el) return;
      const d = upright ? arrowD(facePt(sPos, from), facePt(sPos, to), g) : "";
      el.querySelectorAll("[data-b]").forEach((pp) => set(pp, "d", d));
      el.style.opacity = f3(live);
      el.style.setProperty("--pulse", f3(pulse));
    };
    bracket("bracket1", S_RUST, edge1, VIH, m.bracket1, m.bracketPulse);
    bracket("bracket0", S_SEPIA, edge0, VIL, m.bracket0, 0);

    // ---------- Wires: ours draws on with the gates, bumps from the noise; the neighbour flickers ----------
    const wire = q("[data-wire]");
    show(wire, m.wire > 0.001 ? live : 0);
    if (wire && m.wire > 0.001) {
      const d = wirePath(WIRE.x0 + (WIRE.x1 - WIRE.x0) * m.wire, m.humps);
      wire.querySelectorAll("[data-w]").forEach((pp) => set(pp, "d", d));
      set(wire, "data-on", m.flow ? "1" : "0");
    }
    show(q("[data-neighbour]"), m.neighbour * (0.35 + 0.65 * m.flash) * live);

    // ---------- Gates slide in from the sides; each pulses once (a short hop) ----------
    [0, 1].forEach((i) => {
      const g = q(`[data-gate="${i}"]`);
      show(g, m.gates * live);
      g?.setAttribute("transform", slideAt((i ? 1 : -1) * 34 * (1 - m.gates)));
      const pulse = i ? m.recvPulse : m.sendPulse;
      const lift = g?.querySelector("[data-lift]") as SVGGElement | null;
      lift?.setAttribute("transform", gateLift(3 * pulse));
      lift?.style.setProperty("--pulse", f3(pulse));
    });

    // ---------- Lamp: lit while our voltage is above VIH; one brighter pulse in the key state ----------
    s.lamp = approach(s.lamp, m.lamp, dt, 0.05, snap);
    q("[data-led]")?.style.setProperty("--lamp", f3(s.lamp * (0.8 + 0.2 * m.lampBoost)));
    const glow = q("[data-glow]");
    if (glow) glow.style.opacity = f3(s.lamp * (0.85 + 0.6 * m.lampBoost));

    // ---------- Readout beside the rust car ----------
    const ro = q("[data-readout]");
    show(ro, m.readout * live);
    if (ro && m.readout > 0.001) {
      const [x, y] = readoutAt(vRust);
      ro.setAttribute("transform", `translate(${f2(x)} ${f2(y)})`);
      const txt = Math.max(0, m.v1).toFixed(1);
      if (txt !== s.ro) {
        s.ro = txt;
        const val = ro.querySelector("[data-ro-val]");
        if (val) val.textContent = txt;
      }
    }
  };

  useFrameLoop((dt, reduced) => {
    state.current.t = reduced ? KEY_TIME : state.current.t + dt;
    paint(dt, reduced);
    return !reduced;
  }, inView);
  useEffect(() => paint(0, true), []);

  return (
    <div ref={ref} className="nm-stage">
      <Stage
        width={STAGE_W}
        height={STAGE_H}
        label="A rust car drives in the middle of its lane and a sepia car in the middle of the other lane, a hatched strip between the lanes. A dashed ghost car drives near the lane line; a gust of wind pushes it over the line. The same gust pushes the real car the same distance and it stays inside its lane. The road with both cars tilts upright and becomes a 0 to 1 volt scale: the rust car's lane is the 1 band above 0.6 volts, its lane line the 0.6 volt line, the hatched strip 0.4 to 0.6 volts, the other lane the 0 band below 0.4 volts. A sending gate drives the wire; the rust car climbs to 0.9 volts and the receiving gate's lamp lights. Gusts of noise push the car down to 0.7 volts, still above the 0.6 line, so the lamp stays lit. A double arrow marks the safety room from the car down to the line, and from the sepia car at 0.1 volts up to the 0.4 line. The scale folds back into the road, both cars in the middle of their lanes."
      >
        <defs>
          <BulbGlowDef id="nm-bulb-glow" />
        </defs>
        {children}
      </Stage>
    </div>
  );
}
