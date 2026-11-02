"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { solidSvg } from "../../iso/iso-kit";
import { liquidColor, waterSvg } from "../../iso/analogy/water";
import { paintEntry } from "../../iso/react/reel";
import { useFrameLoop, useInView } from "../../iso/react/live";
import { Stage } from "../../iso/react/draw";
import {
  boardAt,
  boxWater,
  clockHand,
  clockMove,
  contacts,
  FOLD_POINTS,
  fillStream,
  heightBracket,
  K,
  knobAt,
  ladderAt,
  leverRod,
  melt,
  riserFlow,
  riserUp,
  shiftZ,
  STAGE_H,
  STAGE_W,
  standAt,
  SUMP_BOX,
  TANK_BOX,
  tankBracket,
  tankLine,
  taps,
  TOP,
  TROUGH_BOX,
} from "./geometry";
import { KEY_TIME, LOOP, stateAt } from "./model";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

// Voice-synced builds map video time to figure time (voice.ts); the plain build plays the figure as is.
let timeMap: ((t: number) => number) | null = null;
export const setTimeMap = (fn: (t: number) => number) => void (timeMap = fn);

// The one loop: writes the board shape, tower height, taps, water, streams, valves, straps, lever, clock, tags,
// ghosts and the readout grid from the model.
export function VtLive({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const state = useRef({ t: 0, m: -1, T: -1 });

  const paint = () => {
    const root = ref.current;
    const fig = root?.closest("[data-figure]") as HTMLElement | null;
    if (!root || !fig) return;
    const st = state.current;
    const ft = timeMap ? timeMap(st.t) : st.t;
    paintEntry(root, ft, contacts);
    const s = stateAt(ft);
    const q = <T extends Element = SVGElement>(sel: string) => root.querySelector<T>(sel);
    const setD = (sel: string, d: string) => {
      const el = q(sel);
      if (el && el.getAttribute("d") !== d) el.setAttribute("d", d);
    };
    const op = (el: Element | null, o: number) => {
      if (!el) return;
      const e = el as SVGElement;
      e.style.display = o <= 0.001 ? "none" : "";
      e.style.opacity = o.toFixed(3);
    };
    const turn = (2 * Math.PI * 20 * ((ft - 3) % LOOP)) / LOOP; // ripple phase: whole turns per loop

    // Scenes: water parts fade out, circuit parts fade in.
    const water = 1 - clamp01(s.m / 0.7);
    const circ = clamp01((s.m - 0.3) / 0.7);
    root.querySelectorAll(".vt-w").forEach((el) => op(el, water));
    root.querySelectorAll(".vt-c").forEach((el) => op(el, circ));

    // Board: square -> long in the fold.
    if (Math.abs(s.m - st.m) > 0.0005) {
      st.m = s.m;
      const b = boardAt(s.m);
      setD("[data-board-halo]", b.halo);
      setD("[data-board-groove]", b.groove);
      const slab = q("[data-board-slab]");
      if (slab) slab.innerHTML = solidSvg(b.slab, { tone: "mid" });
      const screws = q("[data-board-screws] .iso-dots");
      if (screws) screws.innerHTML = b.screws.map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="0.5"/>`).join("");
      q("[data-engrave] text")?.setAttribute("transform", b.engraveAt);
    }

    // Fold: tower + pump flatten into VDD, sump into GND; the clock slides to the lever.
    const towerFold = melt(FOLD_POINTS.tower.from, FOLD_POINTS.tower.to, s.m, true);
    root.querySelectorAll('[data-fold="tower"]').forEach((el) => el.setAttribute("transform", towerFold));
    const sumpFold = melt(FOLD_POINTS.sump.from, FOLD_POINTS.sump.to, s.m, true);
    root.querySelectorAll('[data-fold="sump"]').forEach((el) => el.setAttribute("transform", sumpFold));
    q("[data-clock]")?.setAttribute("transform", clockMove(s.m));

    // Tower height: telescoping stand, ladder, riser; upper parts shift with it.
    const T = s.H * TOP;
    if (Math.abs(T - st.T) > 0.01) {
      st.T = T;
      const stand = standAt(T);
      const g = q("[data-stand]");
      if (g) g.innerHTML = stand.map((x) => (x.body ? solidSvg(x.body, { tone: "mid", crease: "lo" }) + solidSvg(x.collar!, { tone: "hi", crease: "none" }) : "")).join("");
      stand.forEach((x, i) => {
        const tsp = q(`[data-mark="${i}"]`);
        const text = tsp?.parentElement;
        if (text) {
          text.setAttribute("transform", x.markAt);
          op(text, x.markShow);
        }
      });
      const lad = ladderAt(T);
      setD('[data-ladder="rails"]', lad.rails);
      setD('[data-ladder="rungs"]', lad.rungs);
      root.querySelectorAll("[data-upper]").forEach((el) => el.setAttribute("transform", shiftZ(T - TOP)));
      const up = q("[data-riser-up]");
      if (up) up.innerHTML = solidSvg(riserUp(T), { tone: "mid", crease: "lo" });
      setD("[data-riser-flow]", riserFlow(T));
    }
    // Pump: shudders on "pumping" and hums while it runs; dots climb the riser.
    q("[data-pump]")?.setAttribute("transform", `translate(${(s.shake * 0.8).toFixed(2)} 0)`);
    q('[data-flow="riser"]')?.setAttribute("data-on", s.pump ? "1" : "0");
    setD("[data-height-bracket]", s.heightBracket > 0 ? heightBracket(T) : "");
    op(q("[data-height-bracket]"), s.heightBracket);

    // Water: trough, tank (blue -> rust in the fold), sump.
    const tr = q("[data-box-water=trough]");
    if (tr) {
      tr.setAttribute("transform", TROUGH_BOX.shift);
      tr.innerHTML = waterSvg(boxWater(TROUGH_BOX.rect, TROUGH_BOX.level, 0.3, -turn));
    }
    const tw = q<SVGGElement>("[data-box-water=tank]");
    if (tw) {
      tw.style.setProperty("--liquid", liquidColor(clamp01((s.m - 0.15) / 0.7)));
      const z = s.level * TANK_BOX.h;
      tw.innerHTML = z > 0.5 ? waterSvg(boxWater(TANK_BOX.rect, z, Math.min(0.3 + 0.5 * s.shimmer, z / 3), 1.7 - turn * (1 + s.shimmer))) : "";
    }
    const sp = q("[data-box-water=sump]");
    if (sp) sp.innerHTML = waterSvg(boxWater(SUMP_BOX.rect, SUMP_BOX.level, 0.25, 3.1 - turn));

    // Taps and their flows / streams (analogy).
    setD('[data-tap-bar="top"]', taps.top.bar(s.top));
    setD('[data-tap-bar="bottom"]', taps.bottom.bar(s.bot));
    const filling = s.m < 0.5 && s.top > 0.05 && s.H - s.level > 0.004;
    const draining = s.m < 0.5 && s.bot > 0.05 && s.level > 0.004;
    q('[data-flow="fill"]')?.setAttribute("data-on", filling ? "1" : "0");
    q('[data-flow="drain"]')?.setAttribute("data-on", draining ? "1" : "0");
    const fs = q('[data-stream="fill"]');
    if (fs) {
      const d = fillStream(T, s.level);
      fs.querySelectorAll("path").forEach((p) => p.setAttribute("d", d));
      (fs.querySelector(".vt-column") as SVGElement).style.strokeWidth = (3.2 * K * 0.85 * Math.max(0.35, s.top)).toFixed(2);
      op(fs, filling ? 1 : 0);
    }
    const ds = q('[data-stream="drain"]');
    if (ds) {
      (ds.querySelector(".vt-column") as SVGElement).style.strokeWidth = (3.2 * K * 0.85 * Math.max(0.35, s.bot)).toFixed(2);
      op(ds, draining ? 1 : 0);
    }

    // Lines on the tank: analogy level line; circuit supply line and bracket (follow the rail level).
    op(q("[data-level-line]"), s.levelLine);
    setD("[data-tank-line]", s.lineShow > 0 ? tankLine(s.H) : "");
    setD("[data-tank-bracket]", s.lineShow > 0 ? tankBracket(s.H) : "");
    op(q("[data-tank-line]"), s.lineShow);
    op(q("[data-tank-bracket]"), s.lineShow);

    // Clock hand.
    setD("[data-hand]", clockHand(s.hand));

    // Pulses (rust outlines).
    const pulses: Record<string, number> = { tower: s.towerPulse, dial: s.dialPulse, rail: s.railPulse * circ, tag: s.tagPulse * circ, tank: s.shimmer * circ };
    root.querySelectorAll<SVGElement>("[data-pulse]").forEach((el) => op(el, pulses[el.dataset.pulse!] ?? 0));
    op(q("[data-bus-glow]"), s.busFlash * circ);

    // Ghosts: outline copies of the analogy parts melting into their circuit parts.
    const ghost = (id: keyof typeof FOLD_POINTS, k: number, flat: boolean) => {
      const el = q(`[data-ghost="${id}"]`);
      if (!el) return;
      if (k < 0) return op(el, 0);
      el.setAttribute("transform", melt(FOLD_POINTS[id].from, FOLD_POINTS[id].to, k, flat));
      op(el, Math.sin(Math.PI * Math.min(1, k * 1.1 + 0.05)) * 0.9);
    };
    ghost("tower", s.towerGhost, true);
    ghost("tank", s.tankGhost, false);
    ghost("top", s.tapGhost, true);
    ghost("bottom", s.tapGhost, true);

    // Valves: gate bars lit while conducting (break-before-make from the model).
    const flash = { p: s.pFlash, n: s.nFlash };
    for (const k of ["p", "n"] as const) {
      const g = q(`[data-valve="${k}"]`);
      g?.setAttribute("data-open", (k === "p" ? s.pOn : s.nOn) ? "1" : "0");
      g?.setAttribute("data-flash", flash[k] > 0.3 ? "1" : "0");
      op(q(`[data-valve-glow="${k}"]`), flash[k]);
    }
    // Straps: solid rust while current flows (brightness from the current), light rust dashes in its direction.
    root.querySelectorAll<SVGGElement>("[data-strap]").forEach((el) => {
      const id = el.dataset.strap;
      if (id === "bus") el.setAttribute("data-dir", s.net >= 0 ? "fwd" : "rev");
      const i = id === "charge" ? s.iP : id === "discharge" ? s.iN : Math.abs(s.net);
      el.setAttribute("data-on", s.m > 0.5 && i > 0.02 ? "1" : "0");
      el.style.setProperty("--i", Math.min(1, 0.55 + i * 3).toFixed(3));
    });
    // Rail tint follows the supply (lighter at 0.5 V).
    root.querySelectorAll<SVGGElement>('.rail[data-rail="vdd"]').forEach((el) => el.style.setProperty("--v", s.volts.toFixed(3)));
    // Lever and tags.
    setD("[data-lever-rod]", leverRod(s.lever));
    q("[data-lever-knob]")?.setAttribute("transform", knobAt(s.lever));
    const vt = q("[data-vdd-tag]");
    const vText = `${s.volts.toFixed(1)} V`;
    if (vt && vt.textContent !== vText) vt.textContent = vText;
    const ot = q("[data-out-tag]");
    const oText = `OUT ${s.out}`;
    if (ot && ot.textContent !== oText) ot.textContent = oText;

    // Readout: titles cross-fade in the fold; cells from the model's grid.
    fig.querySelectorAll<HTMLElement>('.vt-readout [data-scene="w"]').forEach((el) => (el.style.opacity = (1 - clamp01((s.m - 0.25) / 0.5)).toFixed(3)));
    fig.querySelectorAll<HTMLElement>('.vt-readout [data-scene="c"]').forEach((el) => (el.style.opacity = clamp01((s.m - 0.25) / 0.5).toFixed(3)));
    const g = s.grid;
    fig.querySelectorAll<SVGRectElement>("[data-cell]").forEach((el) => {
      const idx = Number(el.dataset.cell);
      const state = g.cells[idx];
      if (el.dataset.state !== state) el.dataset.state = state;
      const lit = state === "lit" || state === "flash";
      const pulse = lit && (g.pulseAll || (g.pulseCols && idx % 4 < 2) || (g.pulseRows && Math.floor(idx / 4) < 2));
      el.dataset.pulse = pulse ? "1" : "0";
    });
  };

  useFrameLoop((dt, reduced) => {
    state.current.t = reduced ? KEY_TIME : state.current.t + dt;
    paint();
    return !reduced;
  }, inView);
  useEffect(() => paint(), []);

  return (
    <div ref={ref} className="vt-stage">
      <Stage
        width={STAGE_W}
        height={STAGE_H}
        label="A water rig on a square board: a water tower on a telescopic stand with marks 1 to 4, a sump and pump, a glass tank with a top tap from the tower and a bottom tap back to the sump, and a clock. Each tick the top tap fills the tank to the tower's level and the bottom tap empties it. Halving the tower fills the tank half as deep and lifts each litre half as high: the readout lights 2 x 2 = 4 squares instead of 16. The board then stretches into a CMOS inverter: the tower into the VDD rail at 1.0 V, the sump into GND, the taps into a blue PMOS and a red NMOS valve, the clock driving the input lever, the tank into the output, its water into rust charge. A fill at 1.0 V costs 16 squares of energy, charge times voltage; at 0.5 V half the charge is lifted half as high, 4 squares, a quarter."
      >
        {children}
      </Stage>
    </div>
  );
}
