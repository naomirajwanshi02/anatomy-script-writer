"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { solidSvg } from "../../iso/iso-kit";
import { liquidColor, waterSvg } from "../../iso/analogy/water";
import { paintEntry } from "../../iso/react/reel";
import { useFrameLoop, useInView } from "../../iso/react/live";
import { Stage } from "../../iso/react/draw";
import {
  arrows,
  BASIN_BOX,
  boxWater,
  carriers,
  contacts,
  DRAIN_W,
  FILL_W,
  fillGlow,
  fillPipe,
  fillStream,
  K,
  knobAt,
  knobRing,
  levelRing,
  leverRod,
  linkage,
  OUT_BOX,
  STAGE_H,
  STAGE_W,
  SUP_BOX,
  tapBar,
  tapRing,
  taps,
  valve,
  VALVE_Y,
} from "./geometry";
import { curvePath, gx, gy } from "./graph";
import { fmt, KEY_TIME, LOOP, stateAt } from "./model";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

// The one loop: writes the handle, taps, pipes, water, valves, straps, carriers, readouts and graph from the model.
export function StLive({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const state = useRef({ t: 0, wp: -1, pw: -1, nw: -1 });

  const paint = () => {
    const root = ref.current;
    const fig = root?.closest("[data-figure]") as HTMLElement | null;
    if (!root || !fig) return;
    const st = state.current;
    paintEntry(root, st.t, contacts);
    const s = stateAt(st.t);
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

    // Scene: water parts fade out, circuit parts fade in; the tank's water turns into the rust signal.
    const water = 1 - clamp01(s.m / 0.6);
    const circ = clamp01((s.m - 0.4) / 0.6);
    root.querySelectorAll(".st-w").forEach((el) => op(el, water));
    root.querySelectorAll(".st-c").forEach((el) => op(el, circ));
    // Ripple phase: whole turns per loop, so the last frame matches the first.
    const turn = (2 * Math.PI * 16 * ((st.t - 3) % LOOP)) / LOOP;

    // Handle / lever and its linkage.
    setD("[data-lever-rod]", leverRod(s.h));
    q("[data-lever-knob]")?.setAttribute("transform", knobAt(s.h));
    setD("[data-knob-ring]", s.handlePulse > 0 ? knobRing(s.h) : "");
    op(q("[data-knob-ring]"), s.handlePulse);
    const link = linkage(s.h);
    setD("[data-link]", link.arm + link.bar + link.toFill + link.toDrain);
    const joints = q("[data-link-joints]");
    if (joints) joints.innerHTML = link.joints.map(([x, y]) => `<circle class="st-joint" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.6"/>`).join("");

    // Taps: open as far as the handle drives each one past its threshold (the PMOS / NMOS overdrive).
    const fillOpen = clamp01((1 - s.h - 0.3) / 0.7);
    const drainOpen = clamp01((s.h - 0.3) / 0.7);
    setD('[data-tap-bar="fill"]', tapBar(taps.fill.y, fillOpen));
    setD('[data-tap-bar="drain"]', tapBar(taps.drain.y, drainOpen));
    setD('[data-tap-ring="fill"]', s.tapPulse > 0 ? tapRing(taps.fill.y) : "");
    op(q('[data-tap-ring="fill"]'), s.tapPulse);

    // Fill pipe width follows the PMOS width.
    if (Math.abs(s.wp - st.wp) > 0.002) {
      st.wp = s.wp;
      const pipe = q("[data-fill-pipe]");
      if (pipe) pipe.innerHTML = fillPipe(FILL_W * s.wp).map((x) => solidSvg(x, { tone: "mid", crease: "lo" })).join("");
    }
    setD("[data-pipe-glow]", s.pipeGlow > 0 ? fillGlow(FILL_W * s.wp) : "");
    op(q("[data-pipe-glow]"), s.pipeGlow);

    // Water: supply, output tank (blue -> rust in the fold) and basin.
    const sup = q("[data-box-water=supply]");
    if (sup) {
      sup.setAttribute("transform", SUP_BOX.shift);
      sup.innerHTML = waterSvg(boxWater(SUP_BOX.rect, s.supplyLevel * SUP_BOX.h, 0.3, -turn));
    }
    const outW = q<SVGGElement>("[data-box-water=out]");
    if (outW) {
      outW.setAttribute("transform", OUT_BOX.shift);
      outW.style.setProperty("--liquid", liquidColor(clamp01((s.m - 0.15) / 0.7)));
      const z = Math.max(0.15, s.level * OUT_BOX.h);
      outW.innerHTML = waterSvg(boxWater(OUT_BOX.rect, z, Math.min(0.3, z / 3) * (1 - s.m), 1.7 - turn));
    }
    const basin = q("[data-box-water=basin]");
    if (basin) basin.innerHTML = waterSvg(boxWater(BASIN_BOX.rect, BASIN_BOX.level * BASIN_BOX.h, 0.3, 3.1 - turn));

    // Streams: run while water flows; the width follows the pipe.
    const fillS = q('[data-stream="fill"]');
    if (fillS) {
      const d = fillStream(s.level);
      fillS.querySelectorAll("path").forEach((p) => p.setAttribute("d", d));
      (fillS.querySelector(".st-column") as SVGElement).style.strokeWidth = (FILL_W * s.wp * K * 0.9).toFixed(2);
      op(fillS, s.fill > 0.005 ? 1 : 0);
    }
    const drainS = q('[data-stream="drain"]');
    if (drainS) {
      (drainS.querySelector(".st-column") as SVGElement).style.strokeWidth = (DRAIN_W * K * 0.9).toFixed(2);
      op(drainS, s.drain > 0.005 ? 1 : 0);
    }
    // In / out arrows ("in equals out"), lengths from the two flows.
    const ar = arrows(s.arrows * Math.min(16, s.fill * 140), s.arrows * Math.min(16, s.drain * 140));
    setD('[data-arrow="in"]', ar.in);
    setD('[data-arrow="out"]', ar.out);
    // Level pulses.
    setD("[data-level-ring]", s.levelPulse > 0 ? levelRing(s.level) : "");
    op(q("[data-level-ring]"), s.levelPulse);
    op(q("[data-out-glow]"), s.tankPulse);
    // Fold back beats on the high tank.
    op(q("[data-tank-glow]"), s.tankGlow);
    op(q("[data-vdd-ghost]"), s.vddGhost * 0.55);
    op(q("[data-half-ghost]"), s.halfGhost);

    // Valves: PMOS width follows the model, gate bars lit while conducting.
    const vw = { p: s.wp, n: 1 };
    for (const k of ["p", "n"] as const) {
      const key = k === "p" ? "pw" : "nw";
      if (Math.abs(vw[k] - st[key]) > 0.002) {
        st[key] = vw[k];
        const v = valve(VALVE_Y[k], vw[k]);
        const set = (sel: string, html: string) => {
          const el = q(sel);
          if (el) el.innerHTML = html;
        };
        set(`[data-valve-arm="${k}"]`, solidSvg(v.arm, { tone: "mid", crease: "none" }));
        set(`[data-valve-body="${k}"]`, solidSvg(v.body, { tone: "mid" }));
        set(`[data-valve-gate="${k}"]`, solidSvg(v.gate, { tone: "hi", crease: "none" }));
        setD(`[data-valve-glow="${k}"]`, v.glow);
      }
      const g = q(`[data-valve="${k}"]`);
      g?.setAttribute("data-open", (k === "p" ? s.pOn : s.nOn) ? "1" : "0");
      const flash = k === "p" ? s.pFlash : s.nFlash;
      g?.setAttribute("data-flash", flash > 0.3 ? "1" : "0");
      op(q(`[data-valve-glow="${k}"]`), flash);
      // Carriers: holes (hollow rings) crawl VDD -> tank in the PMOS; electrons (dots) run GND -> tank 2.5x faster.
      const c = q(`[data-carriers="${k}"]`);
      if (c) {
        // (A mobility demo for the "holes / electrons" beat: both crawl at their own pace while it lasts.)
        const moving = k === "p" ? s.holesMove : s.electronsMove;
        const speed = k === "p" ? 0.3 : 0.75;
        const u = moving ? (st.t * speed) % 1 : 0;
        c.innerHTML =
          s.carriers > 0
            ? carriers(VALVE_Y[k], vw[k], u, k === "p" ? 1 : -1)
                .map(([x, y]) => `<circle class="${k === "p" ? "st-hole" : "st-electron"}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${k === "p" ? 1.6 : 1.3}"/>`)
                .join("")
            : "";
        op(c, s.carriers);
      }
    }
    op(q("[data-wlabel]"), s.wideLabel * clamp01((s.wp - 1) / 0.3));
    op(q("[data-ghost-pipe]"), s.ghostPipe * 0.9);

    // Straps: rust while current flows, brightness from the current.
    root.querySelectorAll<SVGGElement>("[data-strap]").forEach((el) => {
      const net = s.fill - s.drain;
      if (el.dataset.strap === "bus") el.setAttribute("data-dir", net >= 0 ? "fwd" : "rev");
      const i = el.dataset.strap === "charge" ? s.fill : el.dataset.strap === "discharge" ? s.drain : Math.abs(net);
      el.setAttribute("data-on", i > 0.01 ? "1" : "0");
      el.style.setProperty("--i", Math.min(1, 0.45 + i * 2.5).toFixed(3));
    });

    // Readouts.
    // Readouts fade by opacity only (never display: none), so the board never moves when they appear.
    const fade = (el: Element | null, o: number) => el && ((el as HTMLElement).style.opacity = o.toFixed(3));
    fade(fig.querySelector('[data-read="vin"]'), s.readVin);
    fade(fig.querySelector('[data-read="vout"]'), s.readVout);
    fade(fig.querySelector('[data-read="graph"]'), s.readVout);
    const nVin = fig.querySelector('[data-num="vin"]');
    if (nVin && nVin.textContent !== fmt(s.h)) nVin.textContent = fmt(s.h);
    const nVout = fig.querySelector('[data-num="vout"]');
    if (nVout && nVout.textContent !== fmt(s.level)) nVout.textContent = fmt(s.level);
    s.sweeps.forEach((sw, i) => {
      const el = fig.querySelector(`[data-curve="${i}"]`);
      if (!el) return;
      const d = curvePath(sw.wp, sw.reach);
      if (el.getAttribute("d") !== d) el.setAttribute("d", d);
      el.setAttribute("data-active", sw.active ? "1" : "0");
    });
    const pt = fig.querySelector("[data-point]");
    pt?.setAttribute("cx", gx(s.h).toFixed(1));
    pt?.setAttribute("cy", gy(s.level).toFixed(1));
    const vm = fig.querySelector<SVGGElement>("[data-vm]");
    if (vm) {
      op(vm, s.vmTick);
      vm.style.transform = `scaleY(${s.vmTick.toFixed(3)})`;
    }
    op(fig.querySelector("[data-brackets]"), s.brackets);
  };

  useFrameLoop((dt, reduced) => {
    state.current.t = reduced ? KEY_TIME : state.current.t + dt;
    paint();
    return !reduced;
  }, inView);
  useEffect(() => paint(), []);

  return (
    <div ref={ref} className="st-stage">
      <Stage
        width={STAGE_W}
        height={STAGE_H}
        label="A water rig on a board: a high tank on a stand feeds a narrow fill pipe through the fill tap into a tall glass tank with a half mark; a drain pipe two and a half times wider leaves it through the drain tap into a basin. One handle drives both taps through a short linkage. At the middle mark both taps run and the tank stays almost empty; widening the fill pipe 2.5 times brings the level to half. The rig then folds into a CMOS inverter: the high tank into the VDD rail, the basin into GND, the taps into a blue PMOS and a red NMOS valve, the handle into the input lever, the water into rust current. With equal widths the output flips at 0.455 V and sits at 0.05 V for a half input; with the PMOS 2.5 times wider it flips at 0.5 V, the switching threshold, shown on a graph of Vout against Vin."
      >
        {children}
      </Stage>
    </div>
  );
}
