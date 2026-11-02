"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { solidSvg, type Vec2 } from "../../iso/iso-kit";
import { liquidColor, waterSvg } from "../../iso/analogy/water";
import { BulbGlowDef } from "../../iso/react/bulb";
import { paintEntry } from "../../iso/react/reel";
import { useFrameLoop, useInView } from "../../iso/react/live";
import { Stage } from "../../iso/react/draw";
import {
  boardAt,
  contacts,
  dripAt,
  drainStream,
  drainTap,
  drumDigitAt,
  DRUM_H,
  fillStream,
  fillTap,
  FOLD_PAIRS,
  ghostKnobAt,
  ghostRod,
  knob2At,
  knob2Ring,
  knobAt,
  knobRing,
  lever2Rod,
  leverRod,
  linksAt,
  needleAt,
  out2Water,
  outWater,
  STAGE_H,
  STAGE_W,
  STREAM_W,
  supplyWater,
} from "./geometry";
import { area, curve, iy, tx, vy } from "./graph";
import { EDGE_WIN, GRAPH_WINDOWS, graphSamples, LOOP, stateAt, type FoldPart } from "./model";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
// Fold pair -> model fold part (both taps fold together).
const PART: Record<string, FoldPart> = { supply: "supply", grate: "grate", fillTap: "taps", drainTap: "taps", handle: "handle", tank: "tank", meter: "meter", lamp: "lamp" };

// Travel transform: from screen point a toward b by u, scaled about a.
const travel = ([ax, ay]: Vec2, [bx, by]: Vec2, u: number, s: number) =>
  `translate(${((bx - ax) * u + ax).toFixed(2)} ${((by - ay) * u + ay).toFixed(2)}) scale(${s.toFixed(3)}) translate(${(-ax).toFixed(2)} ${(-ay).toFixed(2)})`;

// The one loop: board shape, water rig, circuit and readout, all from stateAt(t).
export function ScLive({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const state = useRef({ t: 0, m: -1, gkey: "" });

  const paint = () => {
    const root = ref.current;
    const fig = root?.closest("[data-figure]") as HTMLElement | null;
    if (!root || !fig) return;
    const st = state.current;
    paintEntry(root, st.t, contacts);
    const s = stateAt(st.t);
    const t = s.t;
    const q = <T extends Element = SVGElement>(sel: string) => root.querySelector<T>(sel);
    const qa = (sel: string) => root.querySelectorAll<SVGElement>(sel);
    const op = (el: Element | null, o: number) => {
      if (!el) return;
      const e = el as SVGElement;
      e.style.display = o <= 0.001 ? "none" : "inline";
      e.style.opacity = Math.min(1, o).toFixed(3);
    };
    const setD = (sel: string, d: string) => {
      const el = q(sel);
      if (el && el.getAttribute("d") !== d) el.setAttribute("d", d);
    };
    const turn = (2 * Math.PI * 24 * ((t - 3 + LOOP) % LOOP)) / LOOP; // ripple: whole turns per loop

    // Board: square -> long (rect and view interpolate).
    if (Math.abs(s.m - st.m) > 0.0005) {
      st.m = s.m;
      const b = boardAt(s.m);
      q("[data-board-halo]")?.setAttribute("d", b.halo);
      q("[data-board-groove]")?.setAttribute("d", b.groove);
      const slab = q("[data-board-slab]");
      if (slab) slab.innerHTML = solidSvg(b.slab, { tone: "mid" });
      const screws = q("[data-board-screws] .iso-dots");
      if (screws) screws.innerHTML = b.screws.map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="0.5"/>`).join("");
      q("[data-engrave] text")?.setAttribute("transform", b.engraveAt);
    }

    // Folds: each water part travels to its circuit part and fades; the circuit part arrives from the water part.
    for (const [key, pair] of Object.entries(FOLD_PAIRS)) {
      const u = s.fold[PART[key]];
      qa(`[data-wfold="${key}"]`).forEach((el) => {
        op(el, 1 - clamp01(u * 1.6));
        el.setAttribute("transform", u > 0.001 ? travel(pair[0], pair[1], u, 1 - 0.45 * u) : "");
      });
      qa(`[data-cfold="${key}"]`).forEach((el) => {
        op(el, clamp01((u - 0.3) / 0.7));
        el.setAttribute("transform", u < 0.999 ? travel(pair[1], pair[0], 1 - u, 1 - 0.45 * (1 - u)) : "");
      });
    }

    // ---------------- Water rig ----------------
    const sup = q("[data-box-water=supply]");
    if (sup) sup.innerHTML = waterSvg(supplyWater(0.3, -turn));
    // Glass tank / output tank: the same level; blue turns into the rust signal as the tank folds.
    const tankU = s.fold.tank;
    const outW = q<SVGGElement>("[data-box-water=out]");
    if (outW) {
      outW.style.setProperty("--liquid", liquidColor(clamp01(tankU / 0.8)));
      outW.innerHTML = tankU < 0.99 ? waterSvg(outWater(s.L, Math.min(0.3, s.L * 3), 1.7 - turn)) : "";
    }
    // Streams: width and visibility follow the flows; the through-stream glows on its beat.
    const stream = (id: "fill" | "drain", d: string, flow: number) => {
      const g = q(`[data-stream="${id}"]`);
      if (!g) return;
      const on = flow > 0.004;
      op(g, on ? 1 : 0);
      if (!on) return;
      g.querySelectorAll("path").forEach((p) => p.getAttribute("d") !== d && p.setAttribute("d", d));
      const w = STREAM_W * Math.sqrt(clamp01(flow * 3.5));
      (g.querySelector(".sct-column") as SVGElement).style.strokeWidth = Math.max(1.2, w).toFixed(2);
      const glow = g.querySelector(".sct-stream-glow") as SVGElement;
      const gl = s.throughGlow + s.bothFlash + (id === "drain" ? s.gratePulse : 0);
      glow.style.strokeWidth = (w + 7 * clamp01(gl)).toFixed(2);
      glow.style.opacity = clamp01(gl).toFixed(3);
    };
    stream("fill", fillStream(s.L), s.fillFlow);
    stream("drain", drainStream, s.drainFlow);
    op(q("[data-splash]"), s.drainFlow > 0.004 ? 1 : 0);
    // Tap bars turn with their openings.
    setD('[data-tap-bar="fill"]', fillTap.bar(s.P));
    setD('[data-tap-bar="drain"]', drainTap.bar(s.N));
    op(q('[data-tap-ring="fill"]'), Math.max(s.fillTapPulse, s.bothFlash));
    op(q('[data-tap-ring="drain"]'), Math.max(s.drainTapPulse, s.bothFlash));
    op(q('[data-pulse="grate"]'), s.gratePulse);
    op(q("[data-glint]"), s.tankGlint);
    // Handle, knob, its ring (4.2), link rods (glow rust on "two taps").
    setD("[data-lever-rod]", leverRod(s.h));
    q("[data-lever-knob]")?.setAttribute("transform", knobAt(s.h));
    setD("[data-knob-ring]", s.handlePulse > 0.001 ? knobRing(s.h) : "");
    op(q("[data-knob-ring]"), s.handlePulse);
    const links = linksAt(s.h);
    setD('[data-link="fill"]', links.fill);
    setD('[data-link="drain"]', links.drain);
    qa("[data-links]").forEach((el) => el.setAttribute("data-glow", s.rodGlow > 0.3 ? "1" : "0"));
    const joints = q("[data-link-joints]");
    if (joints) joints.innerHTML = links.joints.map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="0.9"/>`).join("");
    op(q("[data-slowmo]"), s.slowmo);
    // Meter: needle follows the through-flow; drums roll with the cups (odometer style).
    setD("[data-needle]", needleAt(0.06 + 0.8 * clamp01(s.iN)));
    op(q('[data-pulse="meter"]'), s.meterPulse);
    const cups = ((s.cups % 100) + 100) % 100;
    const units = cups % 10;
    const roll = [units % 1, Math.floor(units) === 9 ? units % 1 : 0]; // fraction rolled in drum 1 (units) / 0 (tens)
    const digits = [Math.floor(cups / 10) % 10, Math.floor(units)];
    [0, 1].forEach((i) => {
      const f = i === 1 ? roll[0] : roll[1];
      const d = digits[i];
      const a = q(`[data-drum="${i}"] [data-dig="a"]`);
      const b = q(`[data-drum="${i}"] [data-dig="b"]`);
      if (a) {
        a.textContent = String(d);
        a.setAttribute("transform", drumDigitAt(i, f * DRUM_H));
      }
      if (b) {
        b.textContent = String((d + 1) % 10);
        b.setAttribute("transform", drumDigitAt(i, (f - 1) * DRUM_H));
      }
    });
    // One drop from the drain tap's spout ("a shut tap still drips").
    const drip = q("[data-drip]");
    if (drip) {
      if (s.drip >= 0) {
        const [x, y] = dripAt(s.drip);
        drip.setAttribute("cx", x.toFixed(1));
        drip.setAttribute("cy", y.toFixed(1));
      }
      op(drip, s.drip >= 0 ? 1 - clamp01((s.drip - 0.85) / 0.15) : 0);
    }

    // ---------------- Circuit ----------------
    const out2 = q<SVGGElement>("[data-box-water=out2]");
    if (out2 && tankU > 0.01) out2.innerHTML = waterSvg(out2Water(s.L, Math.min(0.2, s.L * 2), 0.9 - turn));
    q<SVGGElement>("[data-lamp]")?.style.setProperty("--lamp", (s.L * s.L).toFixed(3));
    setD("[data-lever2-rod]", lever2Rod(s.h));
    q("[data-lever2-knob]")?.setAttribute("transform", knob2At(s.h));
    setD("[data-lever2-ring]", s.leverPulse > 0.001 ? knob2Ring(s.h) : "");
    op(q("[data-lever2-ring]"), s.leverPulse);
    const vin = q("[data-vin-text]");
    const vt = `Vin ${s.h.toFixed(1)} V`;
    if (vin && vin.textContent !== vt) vin.textContent = vt;
    // Valves: gate bar lit while conducting (PMOS below 0.7 V, NMOS above 0.3 V); flashes on their words.
    q("[data-valve=p]")?.setAttribute("data-open", s.P > 0 ? "1" : "0");
    q("[data-valve=n]")?.setAttribute("data-open", s.N > 0 ? "1" : "0");
    q<SVGGElement>("[data-valve=p]")?.style.setProperty("filter", s.pFlash > 0.01 ? `brightness(${(1 + 0.4 * s.pFlash).toFixed(3)}) drop-shadow(0 0 ${(6 * s.pFlash).toFixed(1)}px #2f6fb8)` : "");
    q<SVGGElement>("[data-valve=n]")?.style.setProperty("filter", s.nFlash > 0.01 ? `brightness(${(1 + 0.4 * s.nFlash).toFixed(3)}) drop-shadow(0 0 ${(6 * s.nFlash).toFixed(1)}px #c2402f)` : "");
    // Straps: the charge current (PMOS -> tank), the discharge current (tank -> NMOS) and the through-current I.
    const charge = s.P * (1 - s.L);
    const dis = s.N * s.L;
    const iP = charge * 2 + s.iN;
    const iN = dis * 2 + s.iN;
    const net = charge - dis;
    const straps: Record<string, number> = { vddp: iP, pnode: iP, noden: iN, ngnd: iN, bus: Math.abs(net) * 2 };
    qa("[data-strap]").forEach((el) => {
      const i = straps[el.dataset.strap!] ?? 0;
      el.setAttribute("data-on", i > 0.02 ? "1" : "0");
      el.style.setProperty("--i", Math.min(1, 0.45 + i).toFixed(3));
      if (el.dataset.strap === "bus") el.setAttribute("data-dir", net >= 0 ? "fwd" : "rev");
    });
    op(q('[data-pulse="vdd"]'), s.vddPulse);
    op(q('[data-pulse="gnd"]'), s.gndPulse);
    op(q('[data-pulse="out2"]'), s.outPulse);
    // Fold labels flash as their parts arrive.
    qa("[data-lflash]").forEach((el) => {
      const f = s.labelFlash[el.dataset.lflash as keyof typeof s.labelFlash] ?? 0;
      el.setAttribute("data-flash", f > 0.2 ? "1" : "0");
    });
    // Ghost water handle (flick at 54.4, slow turn at 58.8 following Vin).
    const ghostA = Math.max(s.ghostFlick, s.ghostSlow);
    qa("[data-ghost]").forEach((el) => op(el, ghostA * 0.6));
    if (ghostA > 0) {
      const gh = s.ghostFlick > 0 ? s.ghostFlickH : s.h;
      setD("[data-ghost-rod]", ghostRod(gh));
      q("[data-ghost-knob]")?.setAttribute("transform", ghostKnobAt(gh));
    }

    // ---------------- Readout ----------------
    const fade = (el: Element | null, o: number) => el && ((el as HTMLElement).style.opacity = clamp01(o).toFixed(3));
    fade(fig.querySelector("[data-read]"), s.readA);
    fade(fig.querySelector("[data-i-row]"), s.iRowA);
    fade(fig.querySelector("[data-energy]"), s.energyA);
    fig.querySelector("[data-band]")?.setAttribute("data-lit", s.bandLit ? "1" : "0");
    const vinRow = fig.querySelector<SVGGElement>("[data-vin-row] .sct-row-name");
    if (vinRow) vinRow.style.fontSize = s.vinRowPulse > 0.01 ? `${(26 * (1 + 0.25 * s.vinRowPulse)).toFixed(1)}px` : "";
    const w = s.gw;
    const key = `${w}|${t.toFixed(2)}`;
    if (key !== st.gkey) {
      st.gkey = key;
      const set = (sel: string, d: string) => {
        const el = fig.querySelector(sel);
        if (el && el.getAttribute("d") !== d) el.setAttribute("d", d);
      };
      if (w < 0) {
        ["[data-vin-curve]", "[data-icurve]", '[data-area="a"]', '[data-area="b"]'].forEach((sel) => set(sel, ""));
      } else {
        const smp = graphSamples(w, t);
        set("[data-vin-curve]", curve(w, smp, (p) => p.v, vy));
        set("[data-icurve]", curve(w, smp, (p) => p.i, iy));
        if (w === 0) {
          set('[data-area="a"]', area(w, smp, GRAPH_WINDOWS[0][0], GRAPH_WINDOWS[0][1]));
          set('[data-area="b"]', "");
        } else {
          set('[data-area="a"]', area(w, smp, EDGE_WIN.sharp[0], EDGE_WIN.sharp[1]));
          set('[data-area="b"]', area(w, smp, EDGE_WIN.slow[0], EDGE_WIN.slow[1]));
        }
      }
    }
    const areaA = fig.querySelector<SVGElement>('[data-area="a"]');
    const areaB = fig.querySelector<SVGElement>('[data-area="b"]');
    if (areaA) {
      const active = w === 0 ? s.I > 0 : s.sharpActive || s.sharpBright > 0.15;
      areaA.setAttribute("data-active", active ? "1" : "0");
      areaA.style.transform = s.sharpPulse > 0.01 ? `scaleY(${(1 + 0.15 * s.sharpPulse).toFixed(3)})` : "";
    }
    areaB?.setAttribute("data-active", s.slowActive ? "1" : "0");
    // Edge labels under the Vin row.
    const edge = (id: "sharp" | "slow", a: number, b: number, on: boolean) => {
      const el = fig.querySelector<SVGTextElement>(`[data-edge="${id}"]`);
      if (!el) return;
      el.style.opacity = w === 1 && on ? "1" : "0";
      el.setAttribute("x", (id === "sharp" ? tx(1, b) + 8 : (tx(1, a) + tx(1, b)) / 2 + 30).toFixed(1));
    };
    edge("sharp", 55.7, 56.2, t >= 55.7);
    edge("slow", 57.2, 62.2, t >= 57.2);
    // Energy counter: one row per edge.
    const row = (id: "sharp" | "slow", e: number, active: boolean, done: boolean) => {
      const n = fig.querySelector<HTMLElement>(`[data-enum="${id}"]`);
      const txt = String(Math.round(e));
      if (n && n.textContent !== txt) n.textContent = txt;
      fig.querySelector<HTMLElement>(`[data-erow="${id}"]`)?.setAttribute("data-state", active ? "on" : done ? "done" : "off");
    };
    row("sharp", s.eSharp, s.sharpActive || s.sharpBright > 0.15, t >= 56.2);
    row("slow", s.eSlow, s.slowActive, t >= 62.2);
  };

  useFrameLoop((dt, reduced) => {
    state.current.t = reduced ? 63 : state.current.t + dt;
    paint();
    return !reduced;
  }, inView);
  useEffect(() => paint(), []);

  return (
    <div ref={ref} className="sct-stage">
      <Stage
        width={STAGE_W}
        height={STAGE_H}
        label="A water rig on a square board: a high tank on a stand (maker's plate ROLLIN) feeds a fill pipe through a water meter with a cup counter to the fill tap over a glass tank; a drain pipe leaves the tank through the drain tap into a floor grate. One handle drives both taps. At the middle mark both taps are half open and water runs straight through the tank into the drain while the meter counts. A flick of the handle loses one cup, a slow five second turn ten. The board then becomes a CMOS inverter: the high tank the VDD rail, the grate GND, the taps a blue PMOS and a red NMOS, the handle the input lever, the tank the output tank. As the input rises the NMOS turns on at 0.3 V before the PMOS turns off at 0.7 V, and current runs from VDD straight to GND. A graph of Vin and the current from VDD shows a narrow pulse for a 0.5 s edge and a ten times wider pulse for a 5 s edge, with energy lost 1 and 10."
      >
        <defs>
          <BulbGlowDef id="sct-glow" />
        </defs>
        {children}
      </Stage>
    </div>
  );
}
