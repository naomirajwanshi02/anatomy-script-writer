"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { solidSvg } from "../../iso/iso-kit";
import { loopTime } from "../../iso/entrance";
import { liquidColor, waterBox, waterSvg } from "../../iso/analogy/water";
import { paintEntry } from "../../iso/react/reel";
import { approach, useFrameLoop, useInView } from "../../iso/react/live";
import { BulbGlowDef } from "../../iso/react/bulb";
import { Stage } from "../../iso/react/draw";
import { basinAt, basinSeam, basinSolid, contacts, gatesAt, knobAt, knobTransform, LEVERS, rodPath, STAGE_H, STAGE_W, view } from "./geometry";
import { KEY_TIME, LOOP, stateAt, type Net } from "./model";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const LAMPS = ["q1", "q2"] as const;

// The one loop: folds water <-> circuit by m and writes levers, water, gates, wires, lamps and the EN tag.
export function LocksLive({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const state = useRef({ t: 0, lever: { d: 1, en: 1 }, lamp: { q1: 0, q2: 0 }, en: -1 });

  const paint = (dt: number, reduced: boolean) => {
    const root = ref.current;
    if (!root) return;
    const s = state.current;
    paintEntry(root, s.t, contacts);
    const lt = loopTime(s.t, LOOP);
    const p = stateAt(lt);
    const m = p.m;
    const circuit = clamp01((m - 0.55) / 0.45);
    const water = 1 - clamp01((m - 0.7) / 0.3);
    const fig = (root.closest("[data-figure]") ?? root) as HTMLElement;
    fig.style.setProperty("--m", m.toFixed(3));
    fig.style.setProperty("--circuit", circuit.toFixed(3));
    fig.style.setProperty("--water", (1 - m).toFixed(3));
    fig.style.setProperty("--liquid", liquidColor(clamp01((m - 0.25) / 0.4)));

    for (const k of ["d", "en"] as const) {
      s.lever[k] = approach(s.lever[k], p[k] ? -1 : 1, dt, 0.07, reduced);
      const el = root.querySelector(`[data-lever="${k}"]`);
      el?.querySelector("[data-rod]")?.setAttribute("d", rodPath(LEVERS[k], s.lever[k]));
      el?.querySelector("[data-knob]")?.setAttribute("transform", knobTransform(knobAt(LEVERS[k], s.lever[k])));
    }

    const levels = [p.res, p.c1, p.c2];
    const flows = [Math.abs(p.f1), Math.abs(p.f1) + Math.abs(p.f2), Math.abs(p.f2)];
    levels.forEach((level, i) => {
      const glass = root.querySelector(`[data-glass="${i}"]`) as HTMLElement | null;
      if (glass) {
        glass.innerHTML = m < 1 ? solidSvg(basinSolid(i, m), { tone: "mid" }) : "";
        glass.style.opacity = (1 - m).toFixed(3);
      }
      const latch = root.querySelector(`[data-latch="${i}"]`) as HTMLElement | null;
      if (latch) {
        latch.innerHTML = i > 0 && m > 0 ? solidSvg(basinSolid(i, m), { tone: "mid", inner: `<path class="iso-line" data-tone="faint" d="${basinSeam(i, m)}"/>` }) : "";
        latch.style.opacity = clamp01(m * 1.6).toFixed(3);
      }
      const box = root.querySelector(`[data-water="${i}"]`) as HTMLElement | null;
      if (box) {
        const { rect, h } = basinAt(i, m);
        const z = level * (h - 1.6 * (1 - m));
        if (level > 0.03 && water > 0 && z > 0.05) {
          const amp = (1 - m) * Math.min(1, z / 2) * (0.3 + 1.1 * Math.min(1, flows[i] * 2));
          box.innerHTML = waterSvg(waterBox(rect, z, amp, lt, i * 1.7, view));
          box.style.opacity = water.toFixed(3);
        } else box.innerHTML = "";
      }
    });

    const g = gatesAt(p.gate, m);
    const gates = root.querySelector("[data-gates]") as HTMLElement | null;
    if (gates) {
      gates.innerHTML = m < 1 ? [...g.slabs, ...g.posts, g.beam].map((s) => solidSvg(s, { tone: "hi", crease: "lo" })).join("") : "";
      gates.style.opacity = (1 - circuit).toFixed(3);
    }
    [p.f1, p.f2].forEach((f, i) => {
      const el = root.querySelector(`[data-stream="${i}"]`);
      el?.setAttribute("data-on", m < 0.05 && Math.abs(f) > 0.04 ? "1" : "0");
      el?.setAttribute("data-dir", f >= 0 ? "1" : "-1");
    });
    root.querySelectorAll<HTMLElement>("[data-wire]").forEach((el) => el.setAttribute("data-on", p[el.dataset.net as Net] ? "1" : "0"));
    for (const k of LAMPS) {
      s.lamp[k] = approach(s.lamp[k], p[k], dt, 0.08, reduced);
      (root.querySelector(`[data-lamp="${k}"]`) as HTMLElement | null)?.style.setProperty("--lamp", s.lamp[k].toFixed(3));
    }
    if (p.en !== s.en) {
      s.en = p.en;
      const tag = root.querySelector(".lk-tag");
      tag?.setAttribute("data-en", String(p.en));
      const text = tag?.querySelector("text");
      if (text) text.textContent = p.en ? "OPEN" : "CLOSED";
    }
  };

  useFrameLoop((dt, reduced) => {
    state.current.t = reduced ? KEY_TIME : state.current.t + dt;
    paint(dt, reduced);
    return !reduced;
  }, inView);
  useEffect(() => paint(0, true), []);

  return (
    <div ref={ref} className="lk-stage">
      <Stage
        width={STAGE_W}
        height={STAGE_H}
        label="Latch race-through, first as water locks, then as the circuit. A reservoir set by the D lever feeds two lock chambers, Q1 and Q2, through two gates hung from one beam; the EN lever lifts both gates at once, so the blue water runs straight through both chambers in one opening. The locks then fold into two D latches sharing one EN wire, the water becomes the orange signal, and the same race happens: one EN pulse lights both lamps one latch delay apart."
      >
        <defs>
          <BulbGlowDef id="lk-glow" />
        </defs>
        {children}
      </Stage>
    </div>
  );
}
