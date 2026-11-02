"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { solidSvg } from "../../iso/iso-kit";
import { loopTime } from "../../iso/entrance";
import { liquidColor, waterBox, waterSvg } from "../../iso/analogy/water";
import { paintEntry } from "../../iso/react/reel";
import { approach, useFrameLoop, useInView } from "../../iso/react/live";
import { boards, type GateId } from "./geometry";
import { KEY_TIME, LOOP, rowAt, START_LAMP, stateAt } from "./model";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const GATES: GateId[] = ["and", "or", "not"];
const CUP_FULL = 0.78; // a full cup fills this share of its height
const TANK_FULL = 0.8;

// The one loop: folds all three boards by m and writes taps/levers, pipes, drops, tank, cup water, wires, lamps and table rows.
export function TapsLive({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const state = useRef({ t: 0, lever: { a: 1, b: 1 }, lamp: { ...START_LAMP }, row: { and: -1, or: -1, not: -1 } });

  const paint = (dt: number, reduced: boolean) => {
    const root = ref.current;
    if (!root) return;
    const s = state.current;
    const lt = loopTime(s.t, LOOP);
    const p = stateAt(lt);
    const m = p.m;
    const circuit = clamp01((m - 0.55) / 0.45);
    const water = 1 - clamp01((m - 0.7) / 0.3);
    const fig = (root.closest("[data-figure]") ?? root) as HTMLElement;
    fig.style.setProperty("--circuit", circuit.toFixed(3));
    fig.style.setProperty("--water", (1 - m).toFixed(3));
    fig.style.setProperty("--liquid", liquidColor(clamp01((m - 0.25) / 0.4)));

    for (const k of ["a", "b"] as const) s.lever[k] = approach(s.lever[k], p[k] ? -1 : 1, dt, 0.07, reduced);
    const rows = rowAt(lt);

    for (const id of GATES) {
      const el = root.querySelector(`[data-gate="${id}"]`);
      if (!el) continue;
      const b = boards[id];
      const w = b.water;
      paintEntry(el, s.t, b.contacts);

      Object.entries(b.levers).forEach(([k, at], i) => {
        const lever = el.querySelector(`[data-lever="${k}"]`);
        const v = s.lever[k as "a" | "b"];
        lever?.querySelector("[data-rod]")?.setAttribute("d", w.handleRod(at, v, m));
        lever?.querySelector("[data-knob]")?.setAttribute("transform", b.knobTransform(w.handleKnob(at, v, m)));
        (lever?.querySelector("[data-lever-base]") as HTMLElement | null)?.style.setProperty("opacity", clamp01(m * 1.5).toFixed(3));
        const tap = lever?.querySelector("[data-tap]") as HTMLElement | null;
        if (tap) {
          tap.innerHTML = m < 1 ? solidSvg(w.tapSolid(i, m), { tone: "mid" }) : "";
          tap.style.opacity = (1 - circuit).toFixed(3);
        }
      });

      const nets = { y: p.flow[id], a: p.a, b: p.b };
      w.pipes.forEach((_, i) => {
        const pipe = el.querySelector(`[data-pipe="${i}"]`) as HTMLElement | null;
        if (!pipe) return;
        pipe.innerHTML = m < 1 ? w.pipeSolids(i, m).map((x) => solidSvg(x, { tone: "mid" })).join("") : "";
        pipe.style.opacity = (1 - circuit).toFixed(3);
      });
      el.querySelectorAll<HTMLElement>("[data-drops]").forEach((d) => d.setAttribute("data-on", m < 0.05 && nets[d.dataset.net as "y" | "a" | "b"] ? "1" : "0"));

      const tank = w.tankAt(m);
      const tankEl = el.querySelector("[data-tank]") as HTMLElement | null;
      const tankWater = el.querySelector("[data-tank-water]") as HTMLElement | null;
      if (tankEl) tankEl.innerHTML = tank.h > 0.2 ? solidSvg(w.tankSolid(m), { tone: "mid" }) : "";
      if (tankWater) tankWater.innerHTML = tank.h > 0.2 ? waterSvg(waterBox(tank.rect, TANK_FULL * tank.h, 0.25 * tank.s, lt, 0.9, b.view)) : "";
      [tankEl, tankWater].forEach((x) => x?.style.setProperty("opacity", tank.s.toFixed(3)));

      const cup = el.querySelector("[data-cup]") as HTMLElement | null;
      if (cup) {
        cup.innerHTML = m < 1 ? solidSvg(w.cupSolid(m), { tone: "mid" }) : "";
        cup.style.opacity = (1 - m).toFixed(3);
      }
      const cupWater = el.querySelector("[data-cup-water]") as HTMLElement | null;
      if (cupWater) {
        const c = w.cupAt(m);
        const level = p.cup[id];
        const z = level * CUP_FULL * c.h;
        if (level > 0.03 && water > 0 && z > 0.05) {
          const stir = p.flow[id] ? 1 : 0.3;
          cupWater.innerHTML = waterSvg(waterBox(c.rect, z, (1 - m) * Math.min(1, z / 2) * 0.5 * stir, lt, 1.3, b.view));
          cupWater.style.opacity = water.toFixed(3);
        } else cupWater.innerHTML = "";
      }

      el.querySelectorAll<HTMLElement>("[data-wire]").forEach((x) => {
        const net = x.dataset.net as "a" | "b" | "y";
        x.setAttribute("data-on", String(net === "y" ? p[id] : p[net]));
      });
      s.lamp[id] = approach(s.lamp[id], p[id], dt, 0.08, reduced);
      (el.querySelector("[data-lamp]") as HTMLElement | null)?.style.setProperty("--lamp", s.lamp[id].toFixed(3));
      if (rows[id] !== s.row[id]) {
        s.row[id] = rows[id];
        el.querySelectorAll(".bg-table tbody tr").forEach((tr, i) => tr.toggleAttribute("data-now", i === rows[id]));
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
    <div ref={ref} className="bg-rows">
      {children}
    </div>
  );
}
