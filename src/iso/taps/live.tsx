"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { solidSvg, type Vec2 } from "../iso-kit";
import { liquidColor, waterSvg } from "../analogy/water";
import { BulbGlowDef } from "../react/bulb";
import { paintEntry } from "../react/reel";
import { useFrameLoop, useInView } from "../react/live";
import { Stage } from "../react/draw";
import { vy } from "./graph";
import type { TapsConfig } from "./config";
import type { FoldPart } from "./model";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
// Fold pair -> model fold part (both taps fold together).
const PART: Record<string, FoldPart> = { supply: "supply", grate: "grate", fillTap: "taps", drainTap: "taps", handle: "handle", tank: "tank", meter: "meter", lamp: "lamp" };

// Travel transform: from screen point a toward b by u, scaled about a.
const travel = ([ax, ay]: Vec2, [bx, by]: Vec2, u: number, s: number) =>
  `translate(${((bx - ax) * u + ax).toFixed(2)} ${((by - ay) * u + ay).toFixed(2)}) scale(${s.toFixed(3)}) translate(${(-ax).toFixed(2)} ${(-ay).toFixed(2)})`;

// The one loop: board shape, water rig, circuit and readout, all from cfg.stateAt(t).
export function TapsLive({ cfg, children }: { cfg: TapsConfig; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const state = useRef({ t: 0, m: -1, gkey: "" });
  const W = cfg.world;
  const LOOP = cfg.loop;

  const paint = () => {
    const root = ref.current;
    const fig = root?.closest("[data-figure]") as HTMLElement | null;
    if (!root || !fig) return;
    const st = state.current;
    paintEntry(root, st.t, cfg.parts.grate ? W.contacts : W.contactsNoGrate);
    const s = cfg.stateAt(st.t);
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
    const bothFlash = s.bothFlash ?? 0;

    // Board: square -> long (rect and view interpolate).
    if (Math.abs(s.m - st.m) > 0.0005) {
      st.m = s.m;
      const b = W.boardAt(s.m);
      q("[data-board-halo]")?.setAttribute("d", b.halo);
      q("[data-board-groove]")?.setAttribute("d", b.groove);
      const slab = q("[data-board-slab]");
      if (slab) slab.innerHTML = solidSvg(b.slab, { tone: "mid" });
      const screws = q("[data-board-screws] .iso-dots");
      if (screws) screws.innerHTML = b.screws.map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="0.5"/>`).join("");
      q("[data-engrave] text")?.setAttribute("transform", b.engraveAt);
    }

    // Folds: each water part travels to its circuit part and fades; the circuit part arrives from the water part.
    for (const [key, pair] of Object.entries(W.FOLD_PAIRS)) {
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
    if (sup) sup.innerHTML = waterSvg(W.supplyWater(0.3, -turn));
    // Glass tank / output tank: the same level; blue turns into the rust signal as the tank folds.
    const tankU = s.fold.tank;
    const outW = q<SVGGElement>("[data-box-water=out]");
    if (outW) {
      outW.style.setProperty("--liquid", liquidColor(clamp01(tankU / 0.8)));
      outW.innerHTML = tankU < 0.99 ? waterSvg(W.outWater(s.L, Math.min(0.3, s.L * 3), 1.7 - turn)) : "";
    }
    // Streams: width and visibility follow the flows; the through-stream glows on its beat.
    const stream = (id: "fill" | "drain", d: string, flow: number) => {
      const g = q(`[data-stream="${id}"]`);
      if (!g) return;
      const on = flow > 0.004;
      op(g, on ? 1 : 0);
      if (!on) return;
      g.querySelectorAll("path").forEach((p) => p.getAttribute("d") !== d && p.setAttribute("d", d));
      const w = W.STREAM_W * Math.sqrt(clamp01(flow * 3.5));
      (g.querySelector(".tw-column") as SVGElement).style.strokeWidth = Math.max(1.2, w).toFixed(2);
      const glow = g.querySelector(".tw-stream-glow") as SVGElement;
      const gl = (s.throughGlow ?? 0) + bothFlash + (id === "drain" ? (s.gratePulse ?? 0) : 0);
      glow.style.strokeWidth = (w + 7 * clamp01(gl)).toFixed(2);
      glow.style.opacity = clamp01(gl).toFixed(3);
    };
    stream("fill", W.fillStream(s.L), s.fillFlow);
    stream("drain", W.drainStream, s.drainFlow);
    op(q("[data-splash]"), s.drainFlow > 0.004 ? 1 : 0);
    // Tap bars turn with their openings.
    setD('[data-tap-bar="fill"]', W.fillTap.bar(s.P));
    setD('[data-tap-bar="drain"]', W.drainTap.bar(s.N));
    op(q('[data-tap-ring="fill"]'), Math.max(s.fillTapPulse ?? 0, bothFlash));
    op(q('[data-tap-ring="drain"]'), Math.max(s.drainTapPulse ?? 0, bothFlash));
    op(q('[data-pulse="grate"]'), s.gratePulse ?? 0);
    op(q("[data-glint]"), s.tankGlint ?? 0);
    // Handle, knob, its ring, link rods (glow rust on their beat).
    const handlePulse = s.handlePulse ?? 0;
    setD("[data-lever-rod]", W.leverRod(s.h));
    q("[data-lever-knob]")?.setAttribute("transform", W.knobAt(s.h));
    setD("[data-knob-ring]", handlePulse > 0.001 ? W.knobRing(s.h) : "");
    op(q("[data-knob-ring]"), handlePulse);
    const links = W.linksAt(s.h);
    setD('[data-link="fill"]', links.fill);
    setD('[data-link="drain"]', links.drain);
    qa("[data-links]").forEach((el) => el.setAttribute("data-glow", (s.rodGlow ?? 0) > 0.3 ? "1" : "0"));
    const joints = q("[data-link-joints]");
    if (joints) joints.innerHTML = links.joints.map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="0.9"/>`).join("");
    op(q("[data-slowmo]"), s.slowmo ?? 0);
    // Meter: needle follows the through-flow; drums roll with the cups (odometer style).
    if (q("[data-needle]")) {
      setD("[data-needle]", W.needleAt(0.06 + 0.8 * clamp01(s.iN)));
      op(q('[data-pulse="meter"]'), s.meterPulse ?? 0);
      const c = s.cups ?? 0;
      const cups = ((c % 100) + 100) % 100;
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
          a.setAttribute("transform", W.drumDigitAt(i, f * W.DRUM_H));
        }
        if (b) {
          b.textContent = String((d + 1) % 10);
          b.setAttribute("transform", W.drumDigitAt(i, (f - 1) * W.DRUM_H));
        }
      });
    }
    // One drop from the drain tap's spout.
    const drip = q("[data-drip]");
    if (drip) {
      const u = s.drip ?? -1;
      if (u >= 0) {
        const [x, y] = W.dripAt(u);
        drip.setAttribute("cx", x.toFixed(1));
        drip.setAttribute("cy", y.toFixed(1));
      }
      op(drip, u >= 0 ? 1 - clamp01((u - 0.85) / 0.15) : 0);
    }

    // ---------------- Circuit ----------------
    const out2 = q<SVGGElement>("[data-box-water=out2]");
    if (out2 && tankU > 0.01) out2.innerHTML = waterSvg(W.out2Water(s.L, Math.min(0.2, s.L * 2), 0.9 - turn));
    q<SVGGElement>("[data-lamp]")?.style.setProperty("--lamp", (s.L * s.L).toFixed(3));
    const leverPulse = s.leverPulse ?? 0;
    setD("[data-lever2-rod]", W.lever2Rod(s.h));
    q("[data-lever2-knob]")?.setAttribute("transform", W.knob2At(s.h));
    setD("[data-lever2-ring]", leverPulse > 0.001 ? W.knob2Ring(s.h) : "");
    op(q("[data-lever2-ring]"), leverPulse);
    const vin = q("[data-vin-text]");
    const vt = cfg.labels.vin(s.h);
    if (vin && vin.textContent !== vt) vin.textContent = vt;
    // Valves: gate bar lit while conducting; flashes on their words.
    const pFlash = s.pFlash ?? 0;
    const nFlash = s.nFlash ?? 0;
    q("[data-valve=p]")?.setAttribute("data-open", s.P > 0 ? "1" : "0");
    q("[data-valve=n]")?.setAttribute("data-open", s.N > 0 ? "1" : "0");
    q<SVGGElement>("[data-valve=p]")?.style.setProperty("filter", pFlash > 0.01 ? `brightness(${(1 + 0.4 * pFlash).toFixed(3)}) drop-shadow(0 0 ${(6 * pFlash).toFixed(1)}px #2f6fb8)` : "");
    q<SVGGElement>("[data-valve=n]")?.style.setProperty("filter", nFlash > 0.01 ? `brightness(${(1 + 0.4 * nFlash).toFixed(3)}) drop-shadow(0 0 ${(6 * nFlash).toFixed(1)}px #c2402f)` : "");
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
    op(q('[data-pulse="vdd"]'), s.vddPulse ?? 0);
    op(q('[data-pulse="gnd"]'), s.gndPulse ?? 0);
    op(q('[data-pulse="out2"]'), s.outPulse ?? 0);
    // Fold labels flash as their parts arrive.
    qa("[data-lflash]").forEach((el) => {
      const f = s.labelFlash?.[el.dataset.lflash as "vdd"] ?? 0;
      el.setAttribute("data-flash", f > 0.2 ? "1" : "0");
    });
    // Ghost water handle beside the lever.
    const ghostA = s.ghost ?? 0;
    qa("[data-ghost]").forEach((el) => op(el, ghostA * 0.6));
    if (ghostA > 0) {
      const gh = s.ghostH ?? s.h;
      setD("[data-ghost-rod]", W.ghostRod(gh));
      q("[data-ghost-knob]")?.setAttribute("transform", W.ghostKnobAt(gh));
    }

    // ---------------- Readout ----------------
    const fade = (el: Element | null, o: number) => el && ((el as HTMLElement).style.opacity = clamp01(o).toFixed(3));
    fade(fig.querySelector("[data-read]"), s.readA ?? 0);
    const gc = cfg.readout?.graph;
    const gs = s.graph;
    if (gc && gs) {
      const g = gc.g;
      fade(fig.querySelector("[data-i-row]"), gs.iRowA);
      fig.querySelector("[data-band]")?.setAttribute("data-lit", gs.bandLit ? "1" : "0");
      const vinRow = fig.querySelector<SVGGElement>("[data-vin-row] .tw-row-name");
      const vp = s.vinRowPulse ?? 0;
      if (vinRow) vinRow.style.fontSize = vp > 0.01 ? `${(26 * (1 + 0.25 * vp)).toFixed(1)}px` : "";
      const w = gs.w;
      const key = `${w}|${t.toFixed(2)}`;
      if (key !== st.gkey) {
        st.gkey = key;
        const set = (sel: string, d: string) => {
          const el = fig.querySelector(sel);
          if (el && el.getAttribute("d") !== d) el.setAttribute("d", d);
        };
        if (w < 0) {
          ["[data-vin-curve]", "[data-icurve]", ...Array.from({ length: gc.areas }, (_, i) => `[data-area="${i}"]`)].forEach((sel) => set(sel, ""));
        } else {
          const smp = g.samples(w, t);
          set("[data-vin-curve]", g.curve(w, smp, (p) => p.v, vy));
          set("[data-icurve]", g.curve(w, smp, (p) => p.i, g.iy));
          for (let i = 0; i < gc.areas; i++) {
            const a = gs.areas[i];
            set(`[data-area="${i}"]`, a ? g.area(w, smp, a.t0, a.t1) : "");
          }
        }
      }
      for (let i = 0; i < gc.areas; i++) {
        const el = fig.querySelector<SVGElement>(`[data-area="${i}"]`);
        const a = gs.areas[i];
        if (!el) continue;
        el.setAttribute("data-active", a?.active ? "1" : "0");
        if (i === 0 || a) el.style.transform = a && a.pulse > 0.01 ? `scaleY(${(1 + 0.15 * a.pulse).toFixed(3)})` : "";
      }
      // Edge labels under the Vin row.
      gs.edges.forEach((e, i) => {
        const el = fig.querySelector<SVGTextElement>(`[data-edge="${i}"]`);
        if (!el) return;
        el.style.opacity = e.on ? "1" : "0";
        el.setAttribute("x", e.x.toFixed(1));
      });
    }
    const cs = s.counter;
    if (cfg.readout?.counter && cs) {
      fade(fig.querySelector("[data-energy]"), cs.a);
      cs.rows.forEach((r, i) => {
        const n = fig.querySelector<HTMLElement>(`[data-enum="${i}"]`);
        const txt = String(Math.round(r.value));
        if (n && n.textContent !== txt) n.textContent = txt;
        fig.querySelector<HTMLElement>(`[data-erow="${i}"]`)?.setAttribute("data-state", r.state);
      });
    }
  };

  useFrameLoop((dt, reduced) => {
    state.current.t = reduced ? cfg.reducedAt : state.current.t + dt;
    paint();
    return !reduced;
  }, inView);
  useEffect(() => paint(), []);

  return (
    <div ref={ref} className="tw-stage">
      <Stage width={W.STAGE_W} height={W.STAGE_H} label={cfg.label}>
        <defs>
          <BulbGlowDef id="tw-glow" />
        </defs>
        {children}
      </Stage>
    </div>
  );
}
