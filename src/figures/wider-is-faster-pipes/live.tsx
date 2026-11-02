"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { solidSvg } from "../../iso/iso-kit";
import { loopTime } from "../../iso/entrance";
import { liquidColor, waterSvg } from "../../iso/analogy/water";
import { paintEntry } from "../../iso/react/reel";
import { useFrameLoop, useInView } from "../../iso/react/live";
import { BulbGlowDef } from "../../iso/react/bulb";
import { Stage } from "../../iso/react/draw";
import { boxAt, boxLevel, boxSolid, boxWater, contacts, fluidSolid, knobAt, knobTransform, LANES, pipesAt, rodPath, STAGE_H, STAGE_W, streamPath, STREAMS, TAP_Y, tapAt, tapHalo, valveAt, type Box } from "./geometry";
import { curve, KEY_TIME, labelW, LOOP, stateAt, tickShown } from "./model";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
// Supply and drain water drift from blue toward their rail tints during the fold.
const RAIL_TINT: Record<Box, number[]> = { supply: [212, 212, 212], drain: [92, 92, 92] };
const railLiquid = (b: Box, u: number) => `rgb(${[90, 169, 255].map((c, k) => Math.round(c + (RAIL_TINT[b][k] - c) * clamp01(u))).join(",")})`;

// The one loop: folds water <-> circuit by m, widens pipes, taps and valves by W, and writes the lever, water,
// straps, tank, lamp and graph.
export function WiderPipesLive({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const state = useRef({ t: 0, fluid: -1, w: -1, c: ["", ""] });

  const paint = () => {
    const root = ref.current;
    const fig = root?.closest("[data-figure]") as HTMLElement | null;
    if (!root || !fig) return;
    const s = state.current;
    paintEntry(root, s.t, contacts);
    const lt = loopTime(s.t, LOOP);
    const p = stateAt(lt);
    const m = p.m;
    const circuit = clamp01((m - 0.55) / 0.45);
    const water = 1 - clamp01((m - 0.7) / 0.3);
    fig.style.setProperty("--m", m.toFixed(3));
    fig.style.setProperty("--wh", p.hl.toFixed(3));
    fig.style.setProperty("--circuit", circuit.toFixed(3));
    fig.style.setProperty("--water", (1 - m).toFixed(3));
    fig.style.setProperty("--liquid", liquidColor(clamp01((m - 0.25) / 0.4)));

    root.setAttribute("data-vin", p.lever < 0 ? "1" : "0");
    root.setAttribute("data-w", String(labelW(lt)));
    root.querySelector("[data-lever-rod]")?.setAttribute("d", rodPath(p.lever));
    root.querySelector("[data-lever-knob]")?.setAttribute("transform", knobTransform(knobAt(p.lever)));
    root.querySelector('[data-valve="pmos"]')?.setAttribute("data-open", p.gp > 0.5 ? "1" : "0");
    root.querySelector('[data-valve="nmos"]')?.setAttribute("data-open", p.gn > 0.5 ? "1" : "0");

    // Valves and flow lanes follow W.
    if (Math.abs(p.w - s.w) > 0.003) {
      s.w = p.w;
      for (const id of ["pmos", "nmos"] as const) {
        const v = valveAt(id === "pmos" ? TAP_Y.p : TAP_Y.n, p.w);
        const put = (sel: string, html: string) => {
          const el = root.querySelector(sel);
          if (el) el.innerHTML = html;
        };
        put(`[data-valve-body="${id}"]`, solidSvg(v.body, { tone: "mid" }));
        put(`[data-valve-gate="${id}"]`, solidSvg(v.gate, { tone: "hi", crease: "none" }));
        put(`[data-valve-arm="${id}"]`, solidSvg(v.arm, { tone: "mid", crease: "none" }));
      }
      for (const id of STREAMS)
        for (let k = 0; k < LANES; k++) root.querySelector(`[data-stream="${id}"] [data-lane="${k}"]`)?.setAttribute("d", streamPath(id, k, p.w));
    }

    const i = p.i;
    const boxes: [Box, number, number][] = [
      ["supply", Math.max(0, i), 0],
      ["drain", Math.max(0, -i), 3.1],
    ];
    for (const [b, flow, phase] of boxes) {
      const glass = root.querySelector(`[data-box-glass="${b}"]`) as HTMLElement | null;
      if (glass) {
        glass.innerHTML = m < 1 ? solidSvg(boxSolid(b, m), { tone: "mid" }) : "";
        glass.style.opacity = (1 - m).toFixed(3);
      }
      const box = root.querySelector(`[data-box-water="${b}"]`) as HTMLElement | null;
      if (!box) continue;
      const z = boxLevel(b) * boxAt(b, m).h;
      if (water > 0 && z > 0.05) {
        const amp = (1 - m) * Math.min(1, z / 2) * (0.3 + 1.1 * Math.min(1, flow * 2));
        box.innerHTML = waterSvg(boxWater(b, m, z, amp, lt, phase));
        box.style.opacity = water.toFixed(3);
        box.style.setProperty("--liquid", railLiquid(b, (m - 0.25) / 0.4));
      } else box.innerHTML = "";
    }

    const pipes = pipesAt(m, p.w);
    for (const k of ["top", "mid", "bottom"] as const) {
      const el = root.querySelector(`[data-pipes="${k}"]`) as HTMLElement | null;
      if (!el) continue;
      el.innerHTML = circuit < 1 ? pipes[k].map((x) => solidSvg(x, { tone: "mid", crease: "lo" })).join("") : "";
      el.style.opacity = (1 - circuit).toFixed(3);
    }
    for (const [k, open] of [["p", p.gp], ["n", p.gn]] as const) {
      const el = root.querySelector(`[data-tap="${k}"]`) as HTMLElement | null;
      if (!el) continue;
      const tap = tapAt(TAP_Y[k], m, open, p.w);
      el.innerHTML = circuit < 1 ? tap.solids.map((x) => solidSvg(x, { tone: "hi", crease: "lo" })).join("") + (tap.handle ? `<path class="an-spoke wfp-handle" d="${tap.handle}"/>` : "") : "";
      el.style.opacity = (1 - circuit).toFixed(3);
      root.querySelector(`[data-tap-halo="${k}"]`)?.setAttribute("d", tapHalo(TAP_Y[k], p.w));
    }

    const still = m < 0.05;
    const runs: Record<string, boolean> = { supply: i > 0.2, fill: i > 0.2, drainMid: i < -0.2, drain: i < -0.2 };
    root.querySelectorAll<HTMLElement>("[data-stream]").forEach((el) => el.setAttribute("data-on", still && runs[el.dataset.stream!] ? "1" : "0"));
    const strength = Math.min(1, Math.abs(i) * 1.3);
    root.querySelectorAll<HTMLElement>("[data-strap]").forEach((el) => {
      const on = (i > 0.1 && el.dataset.group === "charge") || (i < -0.1 && (el.dataset.group === "discharge" || el.dataset.strap === "bus-tank"));
      el.setAttribute("data-on", on ? "1" : "0");
      el.setAttribute("data-dir", i < 0 ? "rev" : "fwd");
      el.style.setProperty("--i", strength.toFixed(3));
    });

    if (Math.abs(p.level - s.fluid) > 0.002) {
      s.fluid = p.level;
      const fluid = root.querySelector("[data-fluid]");
      if (fluid) fluid.innerHTML = p.level > 0.02 ? solidSvg(fluidSolid(p.level), { tone: "hi", crease: "none" }) : "";
    }
    (root.querySelector("[data-lamp]") as HTMLElement | null)?.style.setProperty("--lamp", p.level.toFixed(3));
    const glow = root.querySelector(".wfp-glow") as HTMLElement | null;
    if (glow) glow.style.opacity = p.level.toFixed(3);

    for (let k = 0; k < 2; k++) {
      const d = curve(k, lt);
      if (d !== s.c[k]) {
        s.c[k] = d;
        fig.querySelector(`[data-curve="${k}"]`)?.setAttribute("d", d);
      }
      fig.querySelector(`[data-tick="${k}"]`)?.setAttribute("data-show", tickShown(k, lt) ? "1" : "0");
    }
  };

  useFrameLoop((dt, reduced) => {
    state.current.t = reduced ? KEY_TIME : state.current.t + dt;
    paint();
    return !reduced;
  }, inView);
  useEffect(() => paint(), []);

  return (
    <div ref={ref} className="wfp-stage" data-w="1" data-vin="1">
      <Stage
        width={STAGE_W}
        height={STAGE_H}
        label="What decides the delay of a logic gate, first as water. A tall supply tank at the back feeds one pipe with two taps down to a drain at the front; a glass tank is teed in between. Through a thin pipe (W=1) the tank fills slowly; the graph marks t1 at half full. The pipes and taps then widen (W=2), twice the cross-section, and the tank fills about twice as fast: t2 is half of t1. The tanks fold into the VDD and GND rails, the taps into the PMOS and NMOS valves (block width = pipe width) and the race repeats in the circuit."
      >
        <defs>
          <BulbGlowDef id="wfp-glow" />
        </defs>
        {children}
      </Stage>
    </div>
  );
}
