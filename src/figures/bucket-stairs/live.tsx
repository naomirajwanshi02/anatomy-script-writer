"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { solidSvg, type Vec3 } from "../../iso/iso-kit";
import { paintEntry } from "../../iso/react/reel";
import { useFrameLoop, useInView } from "../../iso/react/live";
import { Stage } from "../../iso/react/draw";
import {
  boardAt,
  bucketTransform,
  climberAt,
  contacts,
  copyShift,
  dropSvg,
  F,
  fluidSvg,
  knobAt,
  landingPoint,
  levelLineAt,
  leverRod,
  meltBuilding,
  PACKET_HOMES,
  packetAt,
  pourStream,
  puffSvg,
  SAM,
  SAM_HOME,
  samMatrix,
  samShadow,
  shiftZ,
  STAGE_H,
  STAGE_W,
  tankFullMark,
  tankSvg,
  tankWater,
} from "./geometry";
import { charge, GRAPH, graphStep, graphTrace, LOOP, PUFFS, stateAt, tripEnd, V_FULL, V_HALF, voltsOf, voutAt } from "./model";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const BLUE = "#2f6fb8";
const DROP_K = 0.8; // drop scale: about 30 frame px tall

// The one loop: writes the board shape, building floors, tank, Sam, buckets, the circuit parts, drops and the readout.
export function BsLive({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const state = useRef({ t: 0, m: -1, glass: "", V: -1, fluid: -1 });

  const paint = () => {
    const root = ref.current;
    const fig = root?.closest("[data-figure]") as HTMLElement | null;
    if (!root || !fig) return;
    const st = state.current;
    const ft = st.t;
    paintEntry(root, ft, contacts);
    const s = stateAt(ft);
    const t = s.t;
    const q = <T extends Element = SVGElement>(sel: string) => root.querySelector<T>(sel);
    const qa = (sel: string) => root.querySelectorAll<SVGElement>(sel);
    const op = (el: Element | null, o: number) => {
      if (!el) return;
      const e = el as SVGElement;
      e.style.display = o <= 0.001 ? "none" : "";
      e.style.opacity = Math.min(1, o).toFixed(3);
    };
    const setD = (sel: string, d: string) => {
      const el = q(sel);
      if (el && el.getAttribute("d") !== d) el.setAttribute("d", d);
    };
    const text = (id: string, v: string) => {
      const el = q(`[data-text="${id}"]`);
      if (el && el.textContent !== v) el.textContent = v;
    };
    const phase = (2 * Math.PI * 30 * ((t - 3 + LOOP) % LOOP)) / LOOP; // ripple: whole turns per loop

    // Board: square -> long.
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

    // Building: upper floors slide/fade, low roof; the whole building melts into its small ghost in the folds.
    const meltA = 1 - clamp01((s.melt - 0.35) / 0.5);
    const meltT = s.melt > 0.001 ? meltBuilding(s.melt) : "";
    qa("[data-melt]").forEach((el) => {
      if (el.getAttribute("transform") !== meltT) el.setAttribute("transform", meltT);
      op(el, meltA);
    });
    qa("[data-afade]").forEach((el) => op(el, s.analogyA));
    const up = q("[data-upper-walls]");
    up?.setAttribute("transform", shiftZ(s.upperDz * F));
    op(up, s.upperA);
    const ups = q("[data-upper-stairs]");
    ups?.setAttribute("transform", shiftZ(s.upperDz * F));
    op(ups, s.upperA);
    op(q("[data-roof-low]"), s.roofLowA);
    op(q("[data-spout-low]"), s.roofLowA);
    op(q('[data-pulse="building"]'), s.buildingPulse);
    op(q('[data-pulse="roof"]'), s.roofPulse);
    qa("[data-floor-line]").forEach((el) => {
      const k = s.floorLines[Number(el.dataset.floorLine)];
      op(el, k > 0.001 ? 1 : 0);
      el.style.strokeDasharray = "200";
      el.style.strokeDashoffset = (200 * (1 - Math.min(1, k * 2))).toFixed(1);
      el.style.opacity = clamp01(k).toFixed(3);
    });

    // Analogy tank: glass (rebuilt when its height changes), blue water, dashed full mark at the roof line.
    const glassKey = `${s.tankH.toFixed(3)}|${s.tankGhostA.toFixed(2)}`;
    if (glassKey !== st.glass) {
      st.glass = glassKey;
      const g = q('[data-tank="main"] [data-glass]');
      if (g) g.innerHTML = tankSvg(s.tankH * F, s.tankGhostA);
      setD("[data-full-mark]", tankFullMark(s.tankH * F));
    }
    op(q("[data-full-mark]"), s.fullMark);
    const main = q<SVGGElement>('[data-tank="main"]');
    if (main) {
      main.style.setProperty("--liquid", BLUE);
      main.style.setProperty("--glass", BLUE);
      const w = main.querySelector("[data-water]");
      if (w) w.innerHTML = s.analogyA > 0.01 ? tankWater(s.level * F, phase) : "";
    }
    const drainEl = q("[data-drain]");
    op(drainEl, s.drainA);
    if (drainEl) (drainEl as SVGElement).style.setProperty("--liquid", BLUE);

    // Pour stream (Sam's bucket going in).
    let pour = "";
    const r0 = s.carrying;
    if (r0) {
      const e = tripEnd(r0);
      if (t >= e - r0.pour && t < e) pour = pourStream(r0.floors * F, s.level * F);
    }
    const pourEl = q<SVGPathElement>("[data-pour]");
    if (pourEl) {
      pourEl.setAttribute("d", pour);
      pourEl.style.stroke = BLUE;
      pourEl.style.display = pour ? "" : "none";
    }

    // Sam: position on his trip (or home), scale, facing, carried bucket, look-up.
    const sam = q<SVGGElement>("[data-sam]");
    if (sam) {
      let p: Vec3 = SAM_HOME;
      let dir = 1;
      let k = 0; // 0 home size .. 1 stairs size
      let a = s.samA;
      const r = s.carrying;
      if (r && t >= r.start) {
        const c = climberAt(SAM_HOME, r, t);
        p = c.p;
        dir = c.dir;
        k = c.phase === "walk" ? c.u : 1;
        const e = tripEnd(r);
        if (t > e - r.pour * 0.3) a = 0; // gone with the pour; back at home for the next trip
      }
      const sc = SAM.s + (SAM.sStairs - SAM.s) * k;
      op(sam, a);
      q("[data-sam-m]")?.setAttribute("transform", samMatrix(p, dir, sc));
      q("[data-sam-shadow]")?.setAttribute("d", samShadow(p, sc));
      const carry = q<SVGGElement>("[data-carry]");
      if (carry) carry.style.display = r ? "" : "none";
      q("[data-head]")?.setAttribute("transform", `rotate(${(-22 * s.lookUp).toFixed(2)} 0.5 -13.8)`);
    }

    // Buckets.
    s.buckets.forEach((b, i) => {
      const el = q(`[data-bucket="${i}"]`);
      op(el, b.a);
      el?.setAttribute("transform", bucketTransform(i, b.dy, 1));
    });

    // ---------- Circuit ----------
    op(q('[data-c="rails"]'), s.railsA);
    op(q('[data-c="vtag"]'), s.railsA);
    op(q('[data-c="wire"]'), s.wireA);
    op(q('[data-ctank="live"]'), s.tankA);
    op(q('[data-c="p"]'), s.pA);
    op(q('[data-c="p2"]'), s.pA);
    op(q('[data-c="n"]'), s.nA);
    op(q('[data-c="n2"]'), s.nA);
    op(q('[data-c="lever"]'), s.leverA);
    op(q('[data-c="lever2"]'), s.leverA);
    op(q('[data-c="tag"]'), s.tag);
    op(q("[data-wire-flash]"), s.wireFlash);
    // Arrivals drop in from a little above.
    const drop = (sel: string, a: number) => q(sel)?.setAttribute("transform", a < 1 ? shiftZ((1 - a) * 14) : "");
    drop('[data-ctank="live"]', s.tankA);
    drop('[data-c="p2"]', s.pA);
    drop('[data-c="n2"]', s.nA);
    drop('[data-c="lever2"]', s.leverA);

    // Supply: the tag reads the volts; the rail tint lightens as VDD halves.
    const V = s.V;
    const half = V < (V_FULL + V_HALF) / 2;
    text("vdd", `VDD ${voltsOf(half ? V_HALF : V_FULL)} V`);
    const k = clamp01((V_FULL - V) / (V_FULL - V_HALF));
    q<SVGGElement>("[data-vdd-rail]")?.style.setProperty("--rail", `color-mix(in srgb, #a08a68 ${(k * 70).toFixed(1)}%, #4a3726)`);
    if (Math.abs(V - st.V) > 0.0005) {
      st.V = V;
      setD("[data-level-line]", levelLineAt(V_HALF));
    }
    op(q("[data-level-line]"), s.levelLine);

    // Pulses (ink outlines) on their words.
    const pulses: Record<string, number> = { rail: s.railPulse, vtag: s.vddTagPulse, tank: s.tankPulse };
    for (const [key, v] of Object.entries(pulses)) op(q(`[data-pulse="${key}"]`), v);

    // Output tank (rust charge), the blue water ghost (36.4), the full-voltage copy, labels.
    const live = q<SVGGElement>('[data-ctank="live"]');
    if (live && s.tankA > 0) {
      const lv = Math.round(s.cLevel * 400) / 400;
      if (lv !== st.fluid) {
        st.fluid = lv;
        const f = live.querySelector("[data-cfluid]");
        if (f) f.innerHTML = fluidSvg(lv);
      }
      (live.querySelector("[data-cfluid]") as SVGElement | null)?.style.setProperty("filter", s.dropsPulse > 0.01 ? `brightness(${(1 + 0.35 * s.dropsPulse).toFixed(3)})` : "");
      const wg = live.querySelector<SVGGElement>("[data-water-ghost]");
      if (wg) {
        if (s.waterGhost > 0.01 && !wg.innerHTML) wg.innerHTML = fluidSvg(V_FULL);
        op(wg, s.waterGhost);
      }
      op(live.querySelector("[data-water-ghost-line]"), s.waterGhost * 2);
    }
    const copy = q<SVGGElement>('[data-ctank="copy"]');
    if (copy) {
      op(copy, s.copyA);
      if (s.copyA > 0) {
        copy.setAttribute("transform", copyShift(s.copySlide));
        const f = copy.querySelector("[data-cfluid]");
        if (f && !f.innerHTML) f.innerHTML = fluidSvg(V_FULL);
      }
    }
    op(q('[data-c="copy-label"]'), s.copyLabel);
    op(q('[data-c="live-label"]'), s.liveLabel);
    text("copy0", `${voltsOf(V_FULL)} V:`);
    text("copy1", `${charge(V_FULL)} drops`);
    text("live0", `${voltsOf(V_HALF)} V:`);
    text("live1", `${charge(V_HALF)} drops`);
    text("out", `OUT ${s.out}`);

    // Switches: gate bars from the lever (break-before-make), a soft glow round the one that conducts.
    const gate = (id: "p" | "n", g: number) => {
      q<SVGGElement>(`[data-valve="${id}"]`)?.style.setProperty("--g", clamp01(g).toFixed(3));
      op(q(`[data-valve-glow="${id}"]`), clamp01(g) * 0.7);
    };
    gate("p", s.top);
    gate("n", s.bot);
    // Straps: solid rust while current flows, light rust dashes in its direction.
    const iP = clamp01(s.iP / 1.2);
    const iN = clamp01(s.iN / 1.2);
    const net = s.iP - s.iN;
    const straps: Record<string, number> = { vddp: iP, pbus: iP, bus: clamp01(Math.abs(net) / 1.2), busn: iN, ngnd: iN };
    qa("[data-strap]").forEach((el) => {
      const i = straps[el.dataset.strap!] ?? 0;
      el.setAttribute("data-on", i > 0.03 ? "1" : "0");
      el.style.setProperty("--i", Math.min(1, 0.45 + i).toFixed(3));
      if (el.dataset.strap === "bus") el.setAttribute("data-dir", net >= 0 ? "fwd" : "rev");
    });
    op(q("[data-through]"), s.through);
    // Lever and its 0/1 marks (the current input lit).
    setD("[data-lever-rod]", leverRod(s.lever));
    q("[data-lever-knob]")?.setAttribute("transform", knobAt(s.lever));
    root.setAttribute("data-vin", s.lever > 0.5 ? "1" : "0");

    // Packets of charge: waiting on the VDD rail, then through the PMOS, along the strap, into the tank.
    let drops = "";
    s.packets.forEach((d, i) => {
      if (d.a < 0.02) return;
      const h = PACKET_HOMES[i];
      const home: Vec3 = [h[0], h[1], h[2] + d.dz];
      drops += dropSvg(d.u > 0 ? packetAt(home, d.u) : home, DROP_K, d.a, d.pulse);
    });
    const dropsEl = q("[data-drops]");
    if (dropsEl) dropsEl.innerHTML = drops;

    // Puffs: Sam's effort puffs above his head.
    let puffs = "";
    for (const e of PUFFS) {
      const age = (t - e.t) / 0.55;
      if (age < 0 || age > 1) continue;
      const lp = landingPoint(e.floor);
      puffs += puffSvg([lp[0], lp[1], lp[2] + SAM.sStairs * 21], age, "sam");
    }
    const pf = q("[data-puffs]");
    if (pf) pf.innerHTML = puffs;

    // Vout graph (circuit): trace, VDD line, tick flashes, the ghost building, the half-voltage step pulse.
    const below = fig.querySelector<HTMLElement>(".bs-below");
    if (below) below.dataset.mode = s.rec.mode;
    const graph = fig.querySelector<HTMLElement>("[data-graph]");
    if (graph) {
      graph.style.display = s.graphA > 0.001 ? "" : "none";
      graph.style.opacity = s.graphA.toFixed(3);
      if (s.graphA > 0.001) {
        const tr = graphTrace(t);
        const trace = graph.querySelector<SVGPathElement>("[data-graph-trace]");
        if (trace) {
          if (trace.getAttribute("d") !== tr) trace.setAttribute("d", tr);
          trace.dataset.active = Math.abs(s.iP - s.iN) > 0.03 || s.packets.some((p) => p.u > 0 && p.u < 1) ? "1" : "0";
        }
        const vy = GRAPH.yOf(V).toFixed(1);
        graph.querySelector("[data-graph-vdd]")?.setAttribute("d", `M${GRAPH.left},${vy}H${GRAPH.right}`);
        graph.querySelector("[data-graph-vddname]")?.setAttribute("y", (GRAPH.yOf(V) - 5).toFixed(1));
        graph.querySelector<SVGElement>("[data-graph-vdd]")?.style.setProperty("stroke-width", (2 + 3 * s.vddLinePulse).toFixed(2));
        graph.querySelectorAll<SVGElement>("[data-gtick]").forEach((el) => {
          const f = s.tickFlash[Number(el.dataset.gtick)] + s.vddLinePulse;
          el.dataset.on = f > 0.05 ? "1" : "0";
        });
        const gg = graph.querySelector<SVGElement>("[data-gghost]");
        if (gg) {
          gg.style.display = s.buildingGhost > 0.01 ? "" : "none";
          gg.style.opacity = (s.buildingGhost * (0.75 + 0.25 * Math.sin(t * 40))).toFixed(3);
        }
        const step = graph.querySelector<SVGPathElement>("[data-graph-step]");
        if (step) {
          step.style.display = s.stepPulse > 0.01 ? "" : "none";
          if (s.stepPulse > 0.01) {
            if (!step.getAttribute("d")) step.setAttribute("d", graphStep());
            step.style.opacity = s.stepPulse.toFixed(3);
          }
        }
        const val = graph.querySelector<HTMLElement>("[data-graph-value]");
        if (val) {
          const txt = `${(voutAt(t) / V_FULL).toFixed(2)} V`;
          if (val.textContent !== txt) val.textContent = txt;
          val.dataset.active = trace?.dataset.active ?? "0";
        }
      }
    }

    // Readout.
    const r = s.rec;
    const title = fig.querySelector<HTMLElement>("[data-title]");
    const tt = `${r.title[0]}<br>${r.title[1]}`;
    if (title && title.innerHTML !== tt) title.innerHTML = tt;
    const cols = fig.querySelectorAll<HTMLElement>("[data-col]");
    const vals = [r.c1, r.c2];
    const lines = [r.line1, r.line2];
    cols.forEach((col, i) => {
      const v = vals[i];
      col.style.display = v === null ? "none" : "";
      const head = col.querySelector<HTMLElement>("[data-head]");
      if (head) {
        head.textContent = r.heads[i];
        head.style.visibility = r.showHead ? "visible" : "hidden";
      }
      const val = col.querySelector<HTMLElement>("[data-val]");
      if (val) {
        const txt = String(v ?? 0);
        if (val.textContent !== txt) val.textContent = txt;
        const active = i === 0 ? r.act1 : r.act2;
        const dim = i === 0 && r.dim1;
        val.dataset.state = dim ? "dim" : active ? "on" : "off";
        const pulse = i === 0 ? r.pulse1 : r.pulse2;
        val.style.transform = pulse > 0.01 ? `scale(${(1 + 0.12 * pulse).toFixed(3)})` : "";
      }
      const line = col.querySelector<HTMLElement>("[data-line]");
      if (line) {
        line.textContent = lines[i] || " ";
        line.dataset.dim = i === 0 && r.dim1 ? "1" : "0";
      }
    });
  };

  useFrameLoop((dt, reduced) => {
    state.current.t = reduced ? 3 : state.current.t + dt;
    paint();
    return !reduced;
  }, inView);
  useEffect(() => paint(), []);

  return (
    <div ref={ref} className="bs-stage">
      <Stage
        width={STAGE_W}
        height={STAGE_H}
        label="Sam fills a glass tank as tall as a four-floor building, one bucket per floor, each carried up the outside stairs: four buckets, four floors each, sixteen floors climbed. A two-floor building needs two buckets, two floors each: four floors climbed, a quarter. The board then stretches into a CMOS inverter: a VDD rail at the back, a GND rail at the front, a PMOS between VDD and the output node, an NMOS between the node and GND, an input lever on both gates and a glass output tank C on the node. At 1.0 V four packets of charge run from VDD through the PMOS into the tank, each delivering four steps of energy: sixteen. At 0.5 V the tank fills only to mark two: two packets, two steps each, four, one quarter. A Vout graph draws each fill. Finally the PMOS fills the tank, the NMOS empties it, and with both half open current runs straight from VDD to GND."
      >
        {children}
      </Stage>
    </div>
  );
}
