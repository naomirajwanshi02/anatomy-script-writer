"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { paintEntry } from "../../iso/react/reel";
import { approach, useFrameLoop, useInView } from "../../iso/react/live";
import { BulbGlowDef } from "../../iso/react/bulb";
import { Stage } from "../../iso/react/draw";
import {
  bandPaths,
  circuitRise,
  contacts,
  cupCentre,
  eggFoot,
  gatesSink,
  knobAt,
  knobTransform,
  leverAt,
  lidLift,
  LIFT_PX,
  rodPath,
  STAGE_H,
  STAGE_W,
} from "./geometry";
import { EMPTY, HEADER, KEY_TIME, stateAt, TABLE } from "./model";

// Voice-synced builds map video time to figure time (voice.ts); the plain build plays the figure as is.
let timeMap: ((t: number) => number) | null = null;
export const setTimeMap = (fn: (t: number) => number) => void (timeMap = fn);

// One readout cell: the egg wording and the circuit wording stacked in place; --w cross-fades between them.
const Words = ({ egg, circuit }: { egg: string; circuit: string }) => (
  <span className="kx-words">
    <span className="kx-egg-words">{egg}</span>
    <span className="kx-circuit-words">{circuit}</span>
  </span>
);

// Readout (Oxanium, NAND-table style), one row per K-map stage: how you pick | picks, turning into terms | gates at
// the fold. All rows dimmed at the start.
export function KxTable() {
  return (
    <table className="kx-table" aria-label="How the eggs are picked and how many picks; after the fold, number of terms and gate cost">
      <thead>
        <tr>
          {HEADER.egg.map((h, j) => (
            <th key={j}>
              <Words egg={h} circuit={HEADER.circuit[j]} />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {TABLE.map((r, i) => (
          <tr key={i} data-row={i} data-dim="">
            {r.egg.map((w, j) => (
              <td key={j}>
                <Words egg={w} circuit={r.circuit[j]} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// The one loop: entrance, then the model drives the rubber bands and egg lifts, the fold, labels, levers, wires, the
// gates block, the lamp and the readout.
export function KxLive({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const state = useRef({ t: 0, bands: "", row: "", wires: "", gates: -1, lamp: 0, lever: { a: 0, b: 1, c: 0 } });

  const paint = (dt: number, snap: boolean) => {
    const root = ref.current;
    if (!root) return;
    const s = state.current;
    const ft = timeMap ? timeMap(s.t) : s.t;
    paintEntry(root, ft, contacts);
    const m = stateAt(ft);
    const fig = root.closest("[data-figure]") as HTMLElement | null;

    // Egg picks: each lifted egg rises out of its cup (squashes on landing); its contact shadow shrinks with height.
    for (const e of m.lifts) {
      const [bx, by] = eggFoot(e.m);
      const dy = -e.h * LIFT_PX;
      root.querySelector(`[data-egg="${e.m}"]`)?.setAttribute("transform", `translate(${bx.toFixed(2)} ${(by + dy).toFixed(2)}) scale(1 ${e.sy.toFixed(3)}) translate(${(-bx).toFixed(2)} ${(-by).toFixed(2)})`);
      const sh = root.querySelector(`[data-shadow="${e.m}"]`) as SVGPathElement | null;
      if (sh) {
        const [cx, cy] = cupCentre(e.m);
        const k = 1 - 0.45 * e.h;
        sh.setAttribute("transform", `translate(${cx.toFixed(2)} ${cy.toFixed(2)}) scale(${k.toFixed(3)}) translate(${(-cx).toFixed(2)} ${(-cy).toFixed(2)})`);
        sh.style.opacity = (Math.min(1, e.h * 4) * (0.55 - 0.25 * e.h)).toFixed(3);
      }
    }
    // Rubber bands: shape round their cups, snap-on wobble and spring-off recoil as a scale about the centre, lifted
    // with their eggs; thinner and lighter as they stretch (--st). Rebuilt only while they change.
    const bk = JSON.stringify(m.bands);
    if (bk !== s.bands) {
      s.bands = bk;
      for (let i = 0; i < 4; i++) {
        const b = m.bands[i];
        const groups = root.querySelectorAll<SVGGElement>(`[data-band="${i}"]`);
        if (!b) {
          groups.forEach((g) => (g.style.display = "none"));
          continue;
        }
        const p = bandPaths(b.shape, { extra: b.teaser > 0 ? EMPTY : undefined, teaser: b.teaser, rise: b.rise, slip: b.slip, flat: b.flat });
        const front = b.flat ? "flat" : `front${p.frontRow}`;
        const dy = -b.lift * 0.4 * LIFT_PX;
        const sc = b.scale * (1 + 0.035 * b.twang);
        const [cx, cy] = p.centre;
        const tf = `translate(${cx.toFixed(2)} ${(cy + dy).toFixed(2)}) scale(${sc.toFixed(3)}) translate(${(-cx).toFixed(2)} ${(-cy).toFixed(2)})`;
        groups.forEach((g) => {
          const part = g.getAttribute("data-part");
          const on = b.show > 0 && (b.flat ? part === "flat" : part === "back" || part === front);
          g.style.display = on ? "" : "none";
          if (!on) return;
          g.style.opacity = b.show.toFixed(3);
          g.style.setProperty("--st", p.stretch.toFixed(3));
          g.setAttribute("transform", tf);
          g.querySelectorAll("path").forEach((el) => el.setAttribute("d", part === "back" || b.flat ? p.all : p.front));
        });
      }
    }
    (root.querySelector("[data-pretend]") as SVGPathElement | null)?.style.setProperty("opacity", (0.4 * m.pretend).toFixed(3));

    // Fold: the carton and its lid lift and fade, leaving the flat map grid; the circuit rises in behind it.
    root.querySelectorAll<SVGGElement>("[data-lid], [data-carton]").forEach((g) => {
      g.setAttribute("transform", lidLift(m.lid));
      g.style.opacity = (1 - m.lid).toFixed(3);
      g.style.display = m.lid >= 1 ? "none" : "";
    });
    (root.querySelector("[data-map]") as SVGGElement | null)?.style.setProperty("opacity", m.map.toFixed(3));
    const cg = root.querySelector("[data-circuit]") as SVGGElement | null;
    if (cg) {
      cg.setAttribute("transform", circuitRise(m.circuit));
      cg.style.opacity = m.circuit.toFixed(3);
      cg.style.display = m.circuit <= 0 ? "none" : "";
    }
    // Map labels: rows (A), columns (BC); BC becomes B when C drops; A fades when it drops; the column labels pulse
    // in Gray order.
    const lab = (k: string, v: number) => (root.querySelector(`[data-labels="${k}"]`) as SVGGElement | null)?.style.setProperty("opacity", v.toFixed(3));
    lab("a", m.rowLabels * (1 - 0.75 * m.dropA));
    lab("bc", m.colLabels * (1 - m.dropC));
    lab("b", m.colLabels * m.dropC);
    lab("cols", m.colLabels);
    root.querySelectorAll("[data-col]").forEach((g, k) => g.toggleAttribute("data-hot", k === m.grayK));

    // Gates block: the live gate count; it sinks away at the last stage, the A and C wires fade with it.
    if (m.gates !== s.gates) {
      s.gates = m.gates;
      const t = root.querySelector("[data-gates-text]");
      if (t) t.textContent = `${m.gates} gates`;
    }
    const gb = root.querySelector("[data-gates]") as SVGGElement | null;
    if (gb) {
      gb.setAttribute("transform", gatesSink(m.noGates));
      gb.style.display = m.noGates >= 1 ? "none" : "";
    }
    (root.querySelector("[data-wire-side]") as SVGGElement | null)?.style.setProperty("opacity", (1 - m.noGates).toFixed(3));

    // Levers follow the inputs (up = 1).
    for (const k of ["a", "b", "c"] as const) {
      s.lever[k] = approach(s.lever[k], m[k] ? 1 : 0, dt, 0.07, snap);
      const lv = root.querySelector(`[data-lever="${k}"]`);
      lv?.querySelector("[data-rod]")?.setAttribute("d", rodPath(leverAt[k], s.lever[k]));
      lv?.querySelector("[data-knob]")?.setAttribute("transform", knobTransform(knobAt(leverAt[k], s.lever[k])));
    }
    // Wires: rust flow only while a wire carries 1.
    const wk = `${+m.a}${+m.b}${+m.c}`;
    if (wk !== s.wires) {
      s.wires = wk;
      for (const k of ["a", "b", "c"] as const) root.querySelector(`[data-wire="${k}"]`)?.setAttribute("data-on", m[k] ? "1" : "0");
    }
    // Lamp follows Y one delay later.
    s.lamp = approach(s.lamp, m.lamp && m.circuit > 0.5 ? 1 : 0, dt, 0.12, snap);
    (root.querySelector("[data-led]") as SVGGElement | null)?.style.setProperty("--lamp", s.lamp.toFixed(3));
    const glow = root.querySelector("[data-glow]") as SVGCircleElement | null;
    if (glow) glow.style.opacity = s.lamp.toFixed(3);

    // Readout wording: egg (0) .. circuit (1).
    (fig?.querySelector(".kx-table") as HTMLElement | null)?.style.setProperty("--w", m.words.toFixed(3));
    // Readout: active row rust, earlier rows normal, later rows dimmed.
    const tk = `${m.now}|${m.seen.join()}`;
    if (tk !== s.row && fig) {
      s.row = tk;
      fig.querySelectorAll(".kx-table tbody tr").forEach((tr, i) => {
        tr.toggleAttribute("data-now", i === m.now);
        tr.toggleAttribute("data-dim", i !== m.now && !m.seen[i]);
      });
    }
  };

  useFrameLoop((dt, reduced) => {
    state.current.t = reduced ? KEY_TIME : state.current.t + dt;
    paint(dt, reduced);
    return !reduced;
  }, inView);
  useEffect(() => paint(0, true), []);

  return (
    <div ref={ref} className="kx-stage">
      <Stage
        width={STAGE_W}
        height={STAGE_H}
        label="A 2 by 4 egg carton on a square board with four eggs in a 2 by 2 block on its right. A brown rubber band picks them one at a time (four picks), two side by side (two picks), then all four together (one pick); stretched round a diagonal pair it rides up over the other eggs and slips off. The lid lifts away: the carton is a map of three inputs, A for the row, B and C for the column (00 01 11 10). Behind it, levers A, B and C feed a gates block, and B runs on to a lamp. One band per egg: 5 gates. One band per side-by-side pair: C drops, 3 gates. One band round all four: A and C drop, the gates block sinks away and B alone is wired to the lamp; flipping A and C leaves the lamp lit. The lid comes back and the band stretches over the empty cup beside the block."
      >
        <defs>
          <BulbGlowDef id="kx-bulb-glow" />
          {/* Brown egg shell: highlight upper left, shade lower right. */}
          <radialGradient id="kx-shell" cx="0.34" cy="0.28" r="0.85">
            <stop offset="0" stopColor="#f1e5cb" />
            <stop offset="0.4" stopColor="#d9c5a0" />
            <stop offset="1" stopColor="#b9a47f" />
          </radialGradient>
          {/* Cone post: lit left flank, shaded right flank. */}
          <linearGradient id="kx-post" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#f1e5cb" />
            <stop offset="0.55" stopColor="#eadbbd" />
            <stop offset="1" stopColor="#d9c5a0" />
          </linearGradient>
          {/* Cup bulge: lit left (front) flank, shaded right flank, a soft round sheen. */}
          <linearGradient id="kx-bump" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#eadbbd" />
            <stop offset="0.3" stopColor="#f1e5cb" />
            <stop offset="0.7" stopColor="#eadbbd" />
            <stop offset="1" stopColor="#d9c5a0" />
          </linearGradient>
          {/* Pulp speckle: tiny low-contrast dots. */}
          <pattern id="kx-speck" width="5" height="5" patternUnits="userSpaceOnUse">
            <circle cx="0.8" cy="1.1" r="0.28" fill="#8a7356" />
            <circle cx="3.4" cy="0.6" r="0.22" fill="#8a7356" />
            <circle cx="2.2" cy="3.1" r="0.3" fill="#8a7356" />
            <circle cx="4.3" cy="4.0" r="0.2" fill="#8a7356" />
          </pattern>
        </defs>
        {children}
      </Stage>
    </div>
  );
}
