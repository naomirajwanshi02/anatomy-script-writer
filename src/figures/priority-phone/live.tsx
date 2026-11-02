"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { BulbGlowDef } from "../../iso/react/bulb";
import { paintEntry } from "../../iso/react/reel";
import { useFrameLoop, useInView } from "../../iso/react/live";
import { Stage } from "../../iso/react/draw";
import { beamFrom, beamTo, contacts, ICON_K, ICON_SLIDE, iconCentre, leverRod, leverTip, liftPx, music, phone, slidePx, STAGE_H, STAGE_W, wall } from "./geometry";
import { KEY_TIME, stateAt } from "./model";

const f2 = (v: number) => v.toFixed(2);
const flag = (b: boolean) => (b ? "1" : "0");

// The one loop: writes every state from the model into the static art.
// Re-take: a voice page can map video time to this figure's own timeline (written in the old take's seconds).
let timeMap: ((t: number) => number) | null = null;
export const setTimeMap = (fn: (t: number) => number) => void (timeMap = fn);

export function PeLive({ children }: { children: ReactNode }) {
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
    const show = (el: Element | null, opacity: number) => {
      if (!el) return;
      const s = (el as SVGElement).style;
      s.display = opacity <= 0.001 ? "none" : "";
      s.opacity = opacity.toFixed(3);
    };
    const setAttr = (el: Element | null, name: string, v: string) => {
      if (el && el.getAttribute(name) !== v) el.setAttribute(name, v);
    };
    const A = m.analogy;
    const C = m.circ;

    // ---------- Scenes: phone and stand sink out, the wall rises in ----------
    const sink = (u: number) => `translate(0 ${f2(liftPx(12 * u))})`;
    for (const s of ["phone", "stand"]) {
      const g = q(`[data-scene='${s}']`);
      show(g, 1 - m.fold);
      setAttr(g, "transform", s === "phone" ? sink(m.fold) : "");
    }
    const wl = q("[data-scene='wall']");
    show(wl, m.fold);

    // ---------- Tiles and icons ----------
    for (let r = 0; r < 4; r++) {
      const tile = q(`[data-tile='${r}']`);
      setAttr(tile, "data-on", flag(A.tileOn[r]));
      setAttr(tile, "data-hl", flag(A.tileHl[r]));
      const ic = q(`[data-icon='${r}']`);
      setAttr(ic, "data-on", flag(A.tileOn[r]));
      setAttr(ic, "data-mode", m.fold > 0.5 ? "row" : "tile");
      setAttr(ic, "data-hl", flag(C.iconHl[r] && m.fold > 0.5));
      const [sx, sy] = slidePx(ICON_SLIDE * m.fold);
      const c = iconCentre(r);
      const k = 1 + (ICON_K - 1) * m.fold;
      setAttr(ic, "transform", `translate(${f2(c[0] + sx)} ${f2(c[1] + sy)}) scale(${f2(k)}) translate(${f2(-c[0])} ${f2(-c[1])})`);
    }
    show(q("[data-first='tile']"), A.first);

    // ---------- Phone screen: opens once, music player or incoming call ----------
    const u = A.screen;
    setAttr(q("[data-lit]"), "d", phone.line(u));
    show(q("[data-flash]"), u > 0 && u < 1 ? 1 : 0);
    if (u > 0 && u < 1) setAttr(q("[data-flash]"), "d", phone.line(Math.max(0.004, u * 0.04)));
    show(q("[data-lit]"), u > 0 ? 1 : 0);
    show(q("[data-screen]"), u ** 4);
    show(q("[data-call]"), A.callScreen);
    show(q("[data-music]"), 1 - A.callScreen);
    for (let i = 0; i < 7; i++) {
      const h = A.music > 0 ? 6 + 22 * Math.abs(Math.sin(m.t * (3.1 + i * 0.7) + i * 1.3)) : 4;
      setAttr(q(`[data-eq='${i}']`), "d", music.eq[i](h));
    }
    // Sound arcs: music breathes, the call rings.
    const ma = q<SVGGElement>("[data-arcs='music']");
    show(ma, A.music);
    if (ma) ma.style.filter = A.boost > 0.01 ? `drop-shadow(0 0 ${f2(6 * A.boost)}px #f0a868)` : "";
    show(q("[data-arcs='ring']"), A.ring);
    root.querySelectorAll<SVGPathElement>("[data-arcs] [data-arc]").forEach((p) => {
      const i = Number(p.getAttribute("data-arc"));
      p.style.opacity = (1 - i * 0.28).toFixed(3);
    });
    // Scan dot from the music tile into the speaker.
    const beam = q<SVGCircleElement>("[data-beam]");
    if (beam) {
      beam.style.display = A.beam < 0 ? "none" : "";
      if (A.beam >= 0) {
        const e = A.beam * A.beam * (3 - 2 * A.beam);
        setAttr(beam, "cx", f2(beamFrom[0] + (beamTo[0] - beamFrom[0]) * e));
        setAttr(beam, "cy", f2(beamFrom[1] + (beamTo[1] - beamFrom[1]) * e));
      }
    }

    // ---------- Circuit ----------
    if (m.fold > 0.001) {
      wall.rows.forEach((w) => {
        const r = w.r;
        const lv = q(`[data-lever='${r}']`);
        const up = C.up[r];
        setAttr(lv?.querySelector(".pe-rod") ?? null, "d", leverRod(w.geo, up));
        const tip = leverTip(w.geo, up);
        setAttr(lv?.querySelector(".pe-knob") ?? null, "cx", f2(tip[0]));
        setAttr(lv?.querySelector(".pe-knob") ?? null, "cy", f2(tip[1]));
        setAttr(lv, "data-hl", flag(C.leverHl[r]));
        const num = q<SVGGElement>(`[data-num='${r}']`);
        if (num) num.style.opacity = C.numIn[r].toFixed(3);
        setAttr(num, "data-hl", flag(C.numHl[r]));
        const g = q(`[data-wire='${r}']`);
        const i = 3 - r;
        setAttr(g?.querySelector(".pe-wire") ?? null, "d", w.wire(C.wireDraw[i]));
        setAttr(g, "data-hl", flag(C.wireHl[r] && C.wireDraw[i] > 0.99));
        const fl = g?.querySelector<SVGPathElement>(".pe-flow");
        if (fl) fl.style.display = C.flow[r] ? "" : "none";
      });
      show(q("[data-first='lever']"), C.first);
      const rise = (g: Element | null, v: number) => {
        show(g, v);
        setAttr(g, "transform", `translate(0 ${f2(liftPx(10 * (1 - v)))})`);
      };
      [0, 1, 2].forEach((i) => {
        const vin = i < 2 ? C.lampsIn : C.validIn;
        rise(q(`[data-lampg='${i}']`), vin);
        show(q(`[data-out='${i}']`), vin);
        const fl = q<SVGPathElement>(`[data-out='${i}'] .pe-flow`);
        if (fl) fl.style.display = C.outFlow[i] && vin > 0.99 ? "" : "none";
        const lv = Math.max(C.lamp[i], i < 2 ? C.lampGlint : 0);
        (q(`[data-lamp='${i}']`) as SVGGElement | null)?.style.setProperty("--lamp", lv.toFixed(3));
        show(q(`[data-pool='${i}']`), C.lamp[i]);
        show(q(`[data-lampring='${i}']`), i < 2 && C.lampHl[i] ? 1 : 0);
      });
    }
  };

  useFrameLoop((dt, reduced) => {
    state.current.t = reduced ? KEY_TIME : state.current.t + dt;
    paint();
    return !reduced;
  }, inView);
  useEffect(() => paint(), []);

  return (
    <div ref={ref} className="pe-stage">
      <Stage
        width={STAGE_W}
        height={STAGE_H}
        label="A phone stands in a speaker dock on a board, beside four ranked sound tiles: call, alarm, music and a message ping. The music tile is on and the speaker plays music; a call comes in and takes the speaker while the music tile stays on; hanging up brings the music back. The highest-ranked sound that is on gets the speaker. The tiles fold into four levers, wires 3 to 0, running into an encoder block with two output lamps, 2 and 1. Music alone reads 0 1; the call on wire 3 gives 1 1 while the music wire stays on but ignored. A ping alone and silence both read 0 0, so a third lamp, valid, shows whether any wire is on. The circuit folds back into the phone playing music."
      >
        <defs>
          <BulbGlowDef id="pe-glow" />
          <BulbGlowDef id="pe-pool" />
          <linearGradient id="pe-lcd-glass" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0" stopColor="#d6e5f3" />
            <stop offset="1" stopColor="#bcd3ec" />
          </linearGradient>
        </defs>
        {children}
      </Stage>
    </div>
  );
}
