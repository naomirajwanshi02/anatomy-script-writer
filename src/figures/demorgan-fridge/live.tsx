"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { paintEntry } from "../../iso/react/reel";
import { approach, useFrameLoop, useInView } from "../../iso/react/live";
import { BulbGlowDef } from "../../iso/react/bulb";
import { Stage } from "../../iso/react/draw";
import { boardSvg, circuitRise, circuitShrink, contacts, doorSvg, engraveAt, fridgeLift, knobAt, knobTransform, leverAt, rodPath, STAGE_H, STAGE_W } from "./geometry";
import { KEY_TIME, ROWS, stateAt } from "./model";

// Voice-synced builds map video time to figure time (voice.ts); the plain build plays the figure as is.
let timeMap: ((t: number) => number) | null = null;
export const setTimeMap = (fn: (t: number) => number) => void (timeMap = fn);

// Readout (Oxanium, NAND-table style): L shut | R shut | light.
export function DfTable() {
  return (
    <table className="df-table" aria-label="Left door shut, right door shut, light">
      <thead>
        <tr>
          <th>L shut</th>
          <th>R shut</th>
          <th>light</th>
        </tr>
      </thead>
      <tbody>
        {ROWS.map(([l, r], i) => (
          <tr key={i} data-row={i} data-now={i === 0 ? "" : undefined} data-dim={i > 0 ? "" : undefined}>
            <td>{l}</td>
            <td>{r}</td>
            <td>{+!(l && r)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// The one loop: entrance, then the model drives doors, fridge light, fold, levers, wires, lamps and readout.
export function DfLive({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const state = useRef({ t: 0, left: -1, right: -1, board: -1, grid: -1, row: "", wires: "", light: 0, nand: 0, or: 0, lever: { l: 1, r: 1 } });

  const paint = (dt: number, snap: boolean) => {
    const root = ref.current;
    if (!root) return;
    const s = state.current;
    const ft = timeMap ? timeMap(s.t) : s.t;
    paintEntry(root, ft, contacts);
    const m = stateAt(ft);
    const fig = root.closest("[data-figure]") as HTMLElement | null;

    // Doors swing (rebuilt only while they move).
    if (m.left !== s.left) {
      s.left = m.left;
      const g = root.querySelector('[data-door="left"]');
      if (g) g.innerHTML = doorSvg("left", m.left);
    }
    if (m.right !== s.right) {
      s.right = m.right;
      const g = root.querySelector('[data-door="right"]');
      if (g) g.innerHTML = doorSvg("right", m.right);
    }

    // Fridge light: LEDs, washes, blooms and the light fans follow the NAND output.
    s.light = approach(s.light, m.light ? 1 : 0, dt, 0.08, snap);
    root.querySelectorAll<SVGGElement>("[data-light]").forEach((el) => el.style.setProperty("--lamp", s.light.toFixed(3)));
    (root.querySelector('[data-fan="left"]') as SVGPathElement | null)?.style.setProperty("--door", Math.min(1, m.left * 2).toFixed(3));
    (root.querySelector('[data-fan="right"]') as SVGPathElement | null)?.style.setProperty("--door", Math.min(1, m.right * 2).toFixed(3));

    // Fold: fridge lifts and fades, board stretches, circuit rises in.
    const fr = root.querySelector("[data-fridge]") as SVGGElement | null;
    if (fr) {
      fr.setAttribute("transform", fridgeLift(m.fridge));
      fr.style.opacity = (1 - m.fridge).toFixed(3);
      fr.style.display = m.fridge >= 1 ? "none" : "";
    }
    const floor = root.querySelector("[data-floor-light]") as SVGGElement | null;
    if (floor) floor.style.opacity = (1 - m.fridge).toFixed(3);
    if (m.board !== s.board) {
      s.board = m.board;
      const b = root.querySelector("[data-board]");
      if (b) b.innerHTML = boardSvg(m.board);
      root.querySelector("[data-engrave] text")?.setAttribute("transform", engraveAt(m.board));
    }
    const cg = root.querySelector("[data-circuit]") as SVGGElement | null;
    if (cg) {
      cg.setAttribute("transform", circuitRise(m.circuit));
      cg.style.opacity = m.circuit.toFixed(3);
      cg.style.display = m.circuit <= 0 ? "none" : "";
    }

    // Rows build step by step: rule one's input bubbles, then its OR shape (with its lamp); rule two's AND shape, then
    // its output bubble (with its lamp). Row 1 turns into a NAND at the morph.
    const part = (k: string, v: number) => ((root.querySelector(`[data-part="${k}"]`) as SVGGElement | null)?.style.setProperty("opacity", v.toFixed(3)));
    part("or-bubble", m.orBubbles * (1 - m.morph));
    part("or-block", m.orBody);
    part("or-shape", m.orBody * (1 - m.morph));
    part("or-nand", m.orBody * m.morph);
    part("or-out", m.orBody);
    part("or-lamp", m.orBody);
    part("or-label", m.orBody * (1 - m.morph));
    part("or-label-nand", m.orBody * m.morph);
    part("nand-block", m.andBody);
    part("nand-shape", m.andBody);
    part("nand-bubble", m.andBubble);
    part("nand-out", m.andBubble);
    part("nand-lamp", m.andBubble);
    part("nand-label", m.andBubble);
    // De Morgan's three changes pulse rust in turn: input bubbles, gate shapes, output bubble; then the NAND.
    const hot = (k: string, on: boolean) => root.querySelector(`[data-part="${k}"]`)?.toggleAttribute("data-hot", on);
    hot("or-bubble", m.pulseIn > 0.3);
    hot("or-shape", m.pulseGate > 0.3);
    hot("nand-shape", m.pulseGate > 0.3 || m.pulseNand > 0.3);
    hot("nand-bubble", m.pulseOut > 0.3 || m.pulseNand > 0.3);
    // Zoom-out: the circuit shrinks onto the centre tile while the NAND grid fills the board.
    if (m.grid !== s.grid) {
      s.grid = m.grid;
      root.querySelector("[data-shrink]")?.setAttribute("transform", circuitShrink(m.grid));
      const gr = root.querySelector("[data-grid]") as SVGGElement | null;
      if (gr) {
        gr.style.opacity = Math.min(1, Math.max(0, (m.grid - 0.35) / 0.65)).toFixed(3);
        gr.style.display = m.grid <= 0.35 ? "none" : "";
      }
    }
    (fig?.querySelector(".df-table") as HTMLElement | null)?.style.setProperty("opacity", m.table.toFixed(3));

    // Levers follow the inputs (up = 1 = shut).
    for (const k of ["l", "r"] as const) {
      s.lever[k] = approach(s.lever[k], m[k] ? 1 : 0, dt, 0.07, snap);
      const lv = root.querySelector(`[data-lever="${k}"]`);
      lv?.querySelector("[data-rod]")?.setAttribute("d", rodPath(leverAt[k], s.lever[k]));
      lv?.querySelector("[data-knob]")?.setAttribute("transform", knobTransform(knobAt(leverAt[k], s.lever[k])));
    }
    // Wires: rust flow only while a wire carries 1.
    const on = { l: m.l, r: m.r, nand: m.nand, or: m.or };
    const wk = JSON.stringify(on);
    if (wk !== s.wires) {
      s.wires = wk;
      for (const [k, v] of Object.entries(on)) root.querySelector(`[data-wire="${k}"]`)?.setAttribute("data-on", v ? "1" : "0");
    }
    // Lamps follow the outputs.
    for (const k of ["nand", "or"] as const) {
      s[k] = approach(s[k], m[k] ? 1 : 0, dt, 0.12, snap);
      (root.querySelector(`[data-led="${k}"]`) as SVGGElement | null)?.style.setProperty("--lamp", s[k].toFixed(3));
      const glow = root.querySelector(`[data-glow="${k}"]`) as SVGCircleElement | null;
      if (glow) glow.style.opacity = s[k].toFixed(3);
    }

    // Readout: current row rust, rows not yet visited in this phase dimmed.
    const rk = `${m.row}|${m.seen.join()}`;
    if (rk !== s.row && fig) {
      s.row = rk;
      fig.querySelectorAll(".df-table tbody tr").forEach((tr, i) => {
        tr.toggleAttribute("data-now", i === m.row);
        tr.toggleAttribute("data-dim", i !== m.row && !m.seen[i]);
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
    <div ref={ref} className="df-stage">
      <Stage
        width={STAGE_W}
        height={STAGE_H}
        label="A French-door fridge on a square board. Its inside light is on whenever a door is open: open the left, light on; open the right, light on; both shut, light off. The fridge lifts away, the board stretches long: levers L and R are the doors, 1 = shut. The back row builds for rule one: two input bubbles, then an OR gate. The front row builds for rule two: an AND gate, then an output bubble, a NAND. The levers step through 11, 01, 10, 00 and both lamps always match. The input bubbles, the gate shapes and the output bubble pulse in turn; the back row turns into a NAND too. The two rows shrink into one tile of a board full of NAND tiles."
      >
        <defs>
          <BulbGlowDef id="df-bulb-glow" />
          {/* White LED light: inside glow, plus washes on the inner faces (bright end first). */}
          <radialGradient id="df-glow">
            <stop offset="0" stopColor="#fffdf2" stopOpacity="0.7" />
            <stop offset="0.45" stopColor="#fffdf2" stopOpacity="0.38" />
            <stop offset="1" stopColor="#fff8ea" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="df-wash-l" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fffdf2" stopOpacity="0.95" />
            <stop offset="1" stopColor="#fff8ea" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="df-wash-r" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0" stopColor="#fffdf2" stopOpacity="0.9" />
            <stop offset="1" stopColor="#fff8ea" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="df-wash-t" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fffdf2" stopOpacity="0.85" />
            <stop offset="1" stopColor="#fff8ea" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="df-wash-b" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#fffdf2" stopOpacity="0.85" />
            <stop offset="1" stopColor="#fff8ea" stopOpacity="0" />
          </linearGradient>
        </defs>
        {children}
      </Stage>
    </div>
  );
}
