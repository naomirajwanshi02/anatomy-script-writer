"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { paintEntry } from "../../iso/react/reel";
import { approach, useFrameLoop, useInView } from "../../iso/react/live";
import { BulbGlowDef } from "../../iso/react/bulb";
import { Stage } from "../../iso/react/draw";
import { contacts, flyAt, sinkAt, STAGE_H, STAGE_W } from "./geometry";
import { GATES, KEY_TIME, LAMPS, stateAt } from "./model";

// Voice-synced builds map video time to figure time (voice.ts); the plain build plays the figure as is.
let timeMap: ((t: number) => number) | null = null;
export const setTimeMap = (fn: (t: number) => number) => void (timeMap = fn);

// Lamp colours: red (warning hue), yellow (lit-lamp hue), signal teal for green (approved for this episode).
const LIT = { red: "#c2402f", yellow: "#ffc21a", green: "#1f9e8f" };

// Gate-count readout (Oxanium, tabular digits): the live value in rust, then "gates".
export function DtReadout() {
  return (
    <div className="dt-readout" data-readout="" style={{ opacity: 0 }} aria-label="Gates needed for go">
      <span className="dt-readout-val" data-gates-val="">
        {GATES.before}
      </span>
      <span className="dt-readout-unit"> gates</span>
    </div>
  );
}

// The one loop: entrance, then the model drives the real light, the ghost, the folds, tiles, grid, X marks, tick,
// loop, wire, go lamp and readout.
export function DtLive({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const state = useRef({ t: 0, light: [0, 0, 1], tile: [0, 0, 1], go: 0, key: "" });

  const paint = (dt: number, snap: boolean) => {
    const root = ref.current;
    if (!root) return;
    const s = state.current;
    const ft = timeMap ? timeMap(s.t) : s.t;
    paintEntry(root, ft, contacts);
    const m = stateAt(ft);
    const fig = root.closest("[data-figure]") as HTMLElement | null;
    const q = <T extends Element = SVGGElement>(sel: string) => root.querySelector(sel) as (T & ElementCSSInlineStyle) | null;
    const show = (el: (Element & ElementCSSInlineStyle) | null, v: number) => {
      if (!el) return;
      el.style.opacity = v.toFixed(3);
      el.style.display = v <= 0.001 ? "none" : "";
    };

    // Real light: each lamp eases to its state; green a little brighter while "only look at green" (boost).
    const gone = m.fly > 0 ? 1 : 0;
    for (let i = 0; i < 3; i++) {
      s.light[i] = approach(s.light[i], m.light[i], dt, 0.06, snap);
      const g = q(`[data-lamp="${i}"]`);
      g?.style.setProperty("--on", s.light[i].toFixed(3));
      g?.style.setProperty("--boost", (i === 2 ? m.boost : 0).toFixed(3));
      const lens = g?.querySelector("[data-lens]") as SVGGElement | null;
      if (lens) lens.style.display = gone ? "none" : "";
      const pool = q(`[data-pool="${i}"]`);
      if (pool) pool.style.opacity = (s.light[i] * (1 - gone) * (1 + 0.4 * (i === 2 ? m.boost : 0))).toFixed(3);
    }
    show(q("[data-ghost]"), m.ghost * 0.85);

    // Fold: the light sinks into the board; the lamps fly to the tiles and back.
    const sink = q("[data-sink]");
    if (sink) {
      sink.setAttribute("transform", sinkAt(m.sink));
      sink.style.opacity = (1 - m.sink * m.sink).toFixed(3);
      sink.style.display = m.sink >= 0.999 ? "none" : "";
    }
    const flying = m.fly > 0.001 && m.fly < 0.999;
    const flyBits = m.lt < 15 ? m.light : m.bits;
    for (let i = 0; i < 3; i++) {
      const c = q<SVGCircleElement>(`[data-fly="${i}"]`);
      if (!c) continue;
      c.style.display = flying ? "" : "none";
      if (!flying) continue;
      const p = flyAt(i, m.fly);
      c.setAttribute("cx", p.x.toFixed(2));
      c.setAttribute("cy", p.y.toFixed(2));
      c.setAttribute("r", p.r.toFixed(2));
      c.setAttribute("fill", flyBits[i] ? LIT[LAMPS[i]] : "#3b2a1a");
      c.toggleAttribute("data-lit", !!flyBits[i]);
    }

    // Tiles: lens lit in its colour while the bit is 1 (only once the lamps have landed); digit; R and Y letters fade
    // when they drop out of the loop.
    show(q("[data-tiles]"), m.tiles);
    const landed = m.fly >= 0.999 ? 1 : 0;
    for (let i = 0; i < 3; i++) {
      s.tile[i] = approach(s.tile[i], m.bits[i] * landed, dt, 0.04, snap);
      const g = q(`[data-tile="${i}"]`);
      g?.style.setProperty("--on", s.tile[i].toFixed(3));
      g?.setAttribute("data-bit", `${m.bits[i]}`);
      const d = q(`[data-digit="${i}"]`);
      if (d && d.textContent !== `${m.bits[i]}`) d.textContent = `${m.bits[i]}`;
      const dropped = i < 2 ? m.drop : 0;
      const letter = q(`[data-letter="${i}"]`);
      if (letter) letter.style.opacity = (1 - 0.85 * dropped).toFixed(3);
      const body = g?.querySelector("[data-tile-body]") as SVGGElement | null;
      if (body) body.style.opacity = (1 - 0.45 * dropped).toFixed(3);
    }

    // Grid rises in (from just below, fading in); X marks one by one, then one pulse; tick and loop draw on.
    const grid = q("[data-grid]");
    show(grid, m.grid);
    grid?.setAttribute("transform", `translate(0 ${((1 - m.grid) * 24).toFixed(2)})`);
    grid?.style.setProperty("--xp", m.xPulse.toFixed(3));
    m.xs.forEach((v, k) => {
      const x = q(`[data-x="${k}"]`);
      if (x) x.style.opacity = v.toFixed(3);
    });
    const mini = q(`[data-mini="5"]`);
    if (mini) mini.style.opacity = `${m.flicker}`;
    const tick = q("[data-tick]");
    if (tick) {
      tick.style.strokeDashoffset = (1 - m.tick).toFixed(3);
      tick.style.opacity = m.tick > 0 ? "1" : "0";
    }
    const loop = q("[data-loop]");
    if (loop) {
      loop.style.strokeDashoffset = (1 - m.loopDraw).toFixed(4);
      loop.style.opacity = m.loop.toFixed(3);
    }
    const key = `${m.hot}`;
    if (key !== s.key) {
      s.key = key;
      root.querySelectorAll("[data-cell]").forEach((c) => c.toggleAttribute("data-hot", Number(c.getAttribute("data-cell")) === m.hot));
    }

    // G wire (rust flow while G = 1) and the go lamp (lit while go = 1).
    const w = q("[data-wire]");
    if (w) {
      w.style.opacity = m.wire.toFixed(3);
      w.setAttribute("data-on", m.bits[2] && m.wire > 0.5 ? "1" : "0");
    }
    show(q("[data-go]"), m.go);
    s.go = approach(s.go, m.go > 0.5 && m.lt >= 12.5 && m.goLit ? 1 : 0, dt, 0.08, snap);
    q("[data-led]")?.style.setProperty("--lamp", s.go.toFixed(3));
    const glow = q("[data-glow]");
    if (glow) glow.style.opacity = s.go.toFixed(3);

    // Readout: the gate count, value in rust.
    const ro = fig?.querySelector("[data-readout]") as HTMLElement | null;
    if (ro) ro.style.opacity = m.readout.toFixed(3);
    const val = fig?.querySelector("[data-gates-val]");
    if (val && val.textContent !== `${m.gates}`) val.textContent = `${m.gates}`;
  };

  useFrameLoop((dt, reduced) => {
    state.current.t = reduced ? KEY_TIME : state.current.t + dt;
    paint(dt, reduced);
    return !reduced;
  }, inView);
  useEffect(() => paint(0, true), []);

  return (
    <div ref={ref} className="dt-stage">
      <Stage
        width={STAGE_W}
        height={STAGE_H}
        label="A traffic light on a square board steps red, yellow, green. A dashed ghost light with red and green both lit appears beside it and fades: a real light never shows that. The light sinks into the board and its three lamps fly into three bit tiles R, Y and G, which count through all 8 patterns. A grid of 8 boxes, rows R and columns YG, shows each pattern as a little light. Go is a tick in box 001 only, 3 gates. The patterns a real light never shows get an X: don't care. One loop round the four boxes with G on drops R and Y: go is just G, 0 gates, one wire from G to the go lamp. Stepping through off, red, yellow, green lights the go lamp only on green. The light rises again, green lit."
      >
        <defs>
          <BulbGlowDef id="dt-bulb-glow" />
          {/* Off lens: dark sepia glass, slightly lighter at the upper left. */}
          <radialGradient id="dt-off" cx="0.38" cy="0.34" r="0.8">
            <stop offset="0" stopColor="#5a4630" />
            <stop offset="0.6" stopColor="#3b2a1a" />
            <stop offset="1" stopColor="#1e140a" />
          </radialGradient>
          {(Object.keys(LIT) as (keyof typeof LIT)[]).map((k) => (
            <g key={k}>
              {/* Lit lens: near-white core, full hue at the rim. */}
              <radialGradient id={`dt-lit-${k}`} cx="0.45" cy="0.42" r="0.7">
                <stop offset="0" stopColor="#fffdf2" />
                <stop offset="0.35" stopColor={LIT[k]} stopOpacity="0.75" />
                <stop offset="1" stopColor={LIT[k]} />
              </radialGradient>
              {/* Glow pool on the board: pale core, then the hue fading out (normal blending). */}
              <radialGradient id={`dt-pool-${k}`} cx="0.5" cy="0.5" r="0.5">
                <stop offset="0" stopColor="#fffdf2" stopOpacity="0.55" />
                <stop offset="0.35" stopColor={LIT[k]} stopOpacity="0.22" />
                <stop offset="1" stopColor={LIT[k]} stopOpacity="0" />
              </radialGradient>
            </g>
          ))}
          <filter id="dt-blur" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <filter id="dt-blur-s" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="1.6" />
          </filter>
        </defs>
        {children}
      </Stage>
    </div>
  );
}
