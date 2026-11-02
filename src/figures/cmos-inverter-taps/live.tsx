"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { solidSvg } from "../../iso/iso-kit";
import { loopTime } from "../../iso/entrance";
import { liquidColor, waterSvg } from "../../iso/analogy/water";
import { paintEntry } from "../../iso/react/reel";
import { useFrameLoop, useInView } from "../../iso/react/live";
import { BulbGlowDef } from "../../iso/react/bulb";
import { Stage } from "../../iso/react/draw";
import { boxAt, boxSolid, boxWater, contacts, fluidSolid, knobAt, knobTransform, pipesAt, rodPath, STAGE_H, STAGE_W, TAP_Y, tapAt, type Box } from "./geometry";
import { KEY_TIME, LOOP, SCOPE, scopeActive, scopeX, stateAt } from "./model";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
// Supply and drain water drift from blue toward their rail tints during the fold.
const RAIL_TINT: Record<"supply" | "drain", number[]> = { supply: [212, 212, 212], drain: [92, 92, 92] };
const railLiquid = (b: "supply" | "drain", u: number) => `rgb(${[90, 169, 255].map((c, k) => Math.round(c + (RAIL_TINT[b][k] - c) * clamp01(u))).join(",")})`;

// The one loop: folds water <-> circuit by m and writes the lever, taps/valves, water, straps, tank, lamp, table and scope.
export function InverterTapsLive({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const state = useRef({ t: 0, fluid: -1, vin: -1, active: "" });

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
    fig.style.setProperty("--circuit", circuit.toFixed(3));
    fig.style.setProperty("--water", (1 - m).toFixed(3));
    fig.style.setProperty("--liquid", liquidColor(clamp01((m - 0.25) / 0.4)));

    root.setAttribute("data-vin", p.lever < 0 ? "1" : "0");
    root.querySelector("[data-lever-rod]")?.setAttribute("d", rodPath(p.lever));
    root.querySelector("[data-lever-knob]")?.setAttribute("transform", knobTransform(knobAt(p.lever)));
    root.querySelector('[data-valve="pmos"]')?.setAttribute("data-open", p.gp > 0.5 ? "1" : "0");
    root.querySelector('[data-valve="nmos"]')?.setAttribute("data-open", p.gn > 0.5 ? "1" : "0");

    const i = p.i;
    const boxes: [Box, number, number, number][] = [
      ["supply", 0.8, Math.max(0, i), 0],
      ["out", p.level, Math.abs(i), 1.7],
      ["drain", 0.3 + 0.25 * Math.min(1, Math.max(0, -i) * 2), Math.max(0, -i), 3.1],
    ];
    for (const [b, level, flow, phase] of boxes) {
      const glass = root.querySelector(`[data-box-glass="${b}"]`) as HTMLElement | null;
      if (glass) {
        glass.innerHTML = m < 1 ? solidSvg(boxSolid(b, m), { tone: "mid" }) : "";
        glass.style.opacity = (1 - m).toFixed(3);
      }
      const box = root.querySelector(`[data-box-water="${b}"]`) as HTMLElement | null;
      if (!box) continue;
      const z = level * (boxAt(b, m).h - 1.6 * (1 - m));
      if (level > 0.02 && water > 0 && z > 0.05) {
        const amp = (1 - m) * Math.min(1, z / 2) * (0.3 + 1.1 * Math.min(1, flow * 2));
        box.innerHTML = waterSvg(boxWater(b, m, z, amp, lt, phase));
        box.style.opacity = water.toFixed(3);
        if (b !== "out") box.style.setProperty("--liquid", railLiquid(b, (m - 0.25) / 0.4));
      } else box.innerHTML = "";
    }

    const pipes = pipesAt(m);
    for (const k of ["top", "mid", "bottom"] as const) {
      const el = root.querySelector(`[data-pipes="${k}"]`) as HTMLElement | null;
      if (!el) continue;
      el.innerHTML = circuit < 1 ? pipes[k].map((x) => solidSvg(x, { tone: "mid", crease: "lo" })).join("") : "";
      el.style.opacity = (1 - circuit).toFixed(3);
    }
    for (const [k, open] of [["p", p.gp], ["n", p.gn]] as const) {
      const el = root.querySelector(`[data-tap="${k}"]`) as HTMLElement | null;
      if (!el) continue;
      const tap = tapAt(TAP_Y[k], m, open);
      el.innerHTML = circuit < 1 ? tap.solids.map((x) => solidSvg(x, { tone: "hi", crease: "lo" })).join("") + (tap.handle ? `<path class="an-spoke ci-handle" d="${tap.handle}"/>` : "") : "";
      el.style.opacity = (1 - circuit).toFixed(3);
      el.setAttribute("data-open", open > 0.5 ? "1" : "0");
    }

    const still = m < 0.05;
    const runs: Record<string, boolean> = { supply: i > 0.04, fill: i > 0.04, drainMid: i < -0.04, drain: i < -0.04 };
    root.querySelectorAll<HTMLElement>("[data-stream]").forEach((el) => el.setAttribute("data-on", still && runs[el.dataset.stream!] ? "1" : "0"));
    const strength = Math.min(1, Math.abs(i) * 1.3);
    root.querySelectorAll<HTMLElement>("[data-strap]").forEach((el) => {
      const on = (i > 0.02 && el.dataset.group === "charge") || (i < -0.02 && (el.dataset.group === "discharge" || el.dataset.strap === "bus-tank"));
      el.setAttribute("data-on", on ? "1" : "0");
      el.setAttribute("data-dir", i < 0 ? "rev" : "fwd");
      el.style.setProperty("--i", strength.toFixed(3));
    });

    if (p.vin !== s.vin) {
      s.vin = p.vin;
      root.querySelectorAll("[data-vin]").forEach((el) => el !== root && el.setAttribute("data-on", String(p.vin)));
      fig.querySelectorAll<HTMLElement>(".inv-table tbody tr").forEach((tr) => tr.toggleAttribute("data-now", tr.dataset.vin === String(p.vin)));
    }
    if (Math.abs(p.level - s.fluid) > 0.002) {
      s.fluid = p.level;
      const fluid = root.querySelector("[data-fluid]");
      if (fluid) fluid.innerHTML = solidSvg(fluidSolid(p.level), { tone: "hi", crease: "none" });
    }
    (root.querySelector("[data-lamp]") as HTMLElement | null)?.style.setProperty("--lamp", p.level.toFixed(3));
    const glow = root.querySelector(".inv-glow") as HTMLElement | null;
    if (glow) glow.style.opacity = p.level.toFixed(3);
    fig.querySelector("[data-scope-cursor]")?.setAttribute("d", `M${scopeX(lt).toFixed(1)},4V${SCOPE.axis}`);
    const active = scopeActive(lt);
    if (active !== s.active) {
      s.active = active;
      fig.querySelector("[data-scope-active]")?.setAttribute("d", active);
    }
  };

  useFrameLoop((dt, reduced) => {
    state.current.t = reduced ? KEY_TIME : state.current.t + dt;
    paint();
    return !reduced;
  }, inView);
  useEffect(() => paint(), []);

  return (
    <div ref={ref} className="inv-stage">
      <Stage
        width={STAGE_W}
        height={STAGE_H}
        label="A CMOS inverter, first as two taps on one water pipe, then as the circuit. One handle turns both taps: at 0 the bottom tap shuts and then the top tap opens, so the VDD supply tank fills the output tank; at 1 the top tap shuts and then the bottom one opens, so the output tank drains into the GND drain. The taps then fold into the PMOS and NMOS valves, the pipes into straps and the water into the orange current. A lever sets Vin. A PMOS valve with a bubble on its control pin sits between the VDD rail and a glass output tank; an NMOS valve sits between the tank and the GND rail. When Vin is 0 the PMOS opens, current flows from VDD, the tank fills and the lamp lights. When Vin is 1 the PMOS closes first, then the NMOS opens and the tank drains to ground, so the lamp goes dark."
      >
        <defs>
          <BulbGlowDef id="inv-glow" />
        </defs>
        {children}
      </Stage>
    </div>
  );
}
