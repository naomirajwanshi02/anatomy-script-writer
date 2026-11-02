"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { solidSvg } from "../../iso/iso-kit";
import { paintEntry } from "../../iso/react/reel";
import { useFrameLoop, useInView } from "../../iso/react/live";
import { Stage } from "../../iso/react/draw";
import { binSolid, boardEngrave, boardSvg, clock, contacts, gearPaths, gearSinkTransform, labelFlight, screenLit, sinkTransform, STAGE_H, STAGE_W, TABLE_TOP, tileSolid, zoomTransform } from "./geometry";
import { CODES, DIGITS, KEY_TIME, stateAt, TABLE } from "./model";

// Voice-synced builds map video time to figure time (voice.ts); the plain build plays the figure as is.
let timeMap: ((t: number) => number) | null = null;
export const setTimeMap = (fn: (t: number) => number) => void (timeMap = fn);

export function BcdTable() {
  const rows = [TABLE.slice(0, 8), TABLE.slice(8, 16)];
  return (
    <table className="bcd-table" aria-label="The 16 four-bit codes; only 0000 to 1001 are decimal digits">
      <tbody>
        {rows.map((row, r) => (
          <tr key={r}>
            {row.map((c) => (
              <td key={c.i} data-unused-cell={c.unused ? "" : undefined}>
                <b>{c.unused ? "–" : c.i}</b>
                <small>{c.bits}</small>
              </td>
            ))}
          </tr>
        ))}
        <tr>
          <td colSpan={2} className="bcd-spacer" />
          <td colSpan={6} className="bcd-unused-label">
            unused
          </td>
        </tr>
      </tbody>
    </table>
  );
}

// The one loop: writes display segments, lamps, sink, board stretch, labels, tiles, boxes and table cells into the art.
export function BcdLive({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const state = useRef({ t: 0, keys: {} as Record<string, string>, stretch: -1, gear: -1, lit: "", segs: "", cells: "" });

  const paint = () => {
    const root = ref.current;
    if (!root) return;
    const s = state.current;
    const ft = timeMap ? timeMap(s.t) : s.t;
    paintEntry(root, ft, contacts);
    const m = stateAt(ft);
    const fig = root.closest("[data-figure]") as HTMLElement | null;

    // Board: square for the analogy, stretched long for the circuit; camera zoom eases out with it.
    if (Math.abs(m.stretch - s.stretch) > 1e-4) {
      s.stretch = m.stretch;
      const b = root.querySelector("[data-board]");
      if (b) b.innerHTML = boardSvg(m.stretch);
      root.querySelector("[data-engrave] text")?.setAttribute("transform", boardEngrave(m.stretch));
      root.querySelector("[data-zoom]")?.setAttribute("transform", zoomTransform(m.stretch));
    }

    // Clock and callout: sink into the board at the fold, rise back at the end.
    root.querySelectorAll<SVGGElement>("[data-sink]").forEach((g) => {
      const u = g.dataset.sink === "clock" ? m.clockSink : m.calloutSink;
      g.style.display = u >= 1 ? "none" : "";
      g.setAttribute("transform", sinkTransform(u));
    });
    root.querySelectorAll<SVGGElement>("[data-leader]").forEach((g) => (g.style.opacity = Math.max(0, 1 - m.calloutSink * 4).toFixed(3)));

    // Plain binary: the 5-tile row drops in, feeds the gear block (flow dots while it converts), the gears clunk once
    // per subtraction of ten and the counter counts the tens; then both drop away.
    root.querySelectorAll<SVGGElement>("[data-bin]").forEach((g) => {
      const i = Number(g.dataset.bin);
      const show = m.binShow && m.binGrow > 0.01;
      g.style.display = show ? "" : "none";
      if (!show) return;
      const t = binSolid(i, m.binUp[i], m.binGrow);
      const key = `${m.binUp[i].toFixed(3)}|${m.binGrow.toFixed(3)}`;
      if (s.keys[`bin${i}`] !== key) {
        s.keys[`bin${i}`] = key;
        g.querySelector("[data-slot]")!.innerHTML = solidSvg(t.paths, { tone: "mid", crease: "lo" });
        g.querySelector("text")!.setAttribute("transform", t.text);
      }
    });
    const gw = root.querySelector("[data-gwire]") as SVGGElement | null;
    if (gw) {
      gw.style.display = m.binShow && m.gearSink < 0.5 ? "" : "none";
      (gw.querySelector(".gate-flow") as SVGPathElement).style.display = m.converting ? "" : "none";
    }
    const gs = root.querySelector("[data-gsink]") as SVGGElement | null;
    if (gs) {
      gs.style.display = m.gearSink >= 1 ? "none" : "";
      gs.style.opacity = (1 - m.gearSink).toFixed(3);
      gs.setAttribute("transform", gearSinkTransform(m.gearSink));
    }
    if (m.gearSink < 1 && Math.abs(m.gearAngle - s.gear) > 1e-3) {
      s.gear = m.gearAngle;
      const d = gearPaths(m.gearAngle);
      root.querySelectorAll("[data-gear]").forEach((p, i) => p.setAttribute("d", d[i]));
    }
    root.querySelectorAll("[data-gear]").forEach((p) => p.toggleAttribute("data-on", m.converting));
    const ctr = root.querySelector("[data-counter]");
    if (ctr && ctr.textContent !== m.counter) ctr.textContent = m.counter;

    // Windows: each box wired straight to its own window; the wire flows and the digit lights at the key state.
    const wins = root.querySelector("[data-windows]") as SVGGElement | null;
    if (wins) wins.style.opacity = m.win.toFixed(3);
    root.querySelectorAll("[data-win]").forEach((g) => g.toggleAttribute("data-on", m.winOn));
    (root.querySelector("[data-three]") as SVGPathElement | null)?.style.setProperty("opacity", m.threeWarn.toFixed(3));
    root.querySelector("[data-shake]")?.setAttribute("transform", `translate(${m.shake.toFixed(2)} 0)`);

    // Display: CRT-style power line opening to the full glass; segments from the time shown; colon blinks.
    const lit = screenLit(m.power, m.open);
    if (lit !== s.lit) {
      s.lit = lit;
      root.querySelector(".bcd-lit")?.setAttribute("d", lit);
      root.querySelector(".bcd-flash")?.setAttribute("d", lit);
    }
    const flash = root.querySelector(".bcd-flash") as SVGPathElement | null;
    if (flash) flash.style.opacity = (m.power > 0.01 ? 1 - m.open : 0).toFixed(3);
    const screen = root.querySelector(".bcd-screen") as SVGGElement | null;
    if (screen) screen.style.opacity = (m.on ** 4).toFixed(3);
    const segs = m.segments.map((c) => c.map(Number).join("")).join("|") + (m.colon ? "c" : "");
    if (segs !== s.segs) {
      s.segs = segs;
      root.querySelectorAll("[data-cell]").forEach((g, k) => g.querySelectorAll("path").forEach((p, i) => p.toggleAttribute("data-off", !m.segments[k][i])));
      root.querySelectorAll("[data-colon] path").forEach((p) => p.toggleAttribute("data-off", !m.colon));
    }
    const pool = root.querySelector(".bcd-pool") as SVGPathElement | null;
    if (pool) pool.style.opacity = m.on.toFixed(3);

    // Bell lamp: on with the display, brighter and wiggling while the alarm rings; sound arcs pulse.
    const bellOn = root.querySelector(".bcd-bell-on") as SVGGElement | null;
    if (bellOn) bellOn.style.opacity = m.alm.toFixed(3);
    fig?.style.setProperty("--bell-glow", m.bellGlow.toFixed(3));
    const [bx, by] = clock.bellCentre;
    root.querySelector("[data-bell]")?.setAttribute("transform", `rotate(${m.bellAngle.toFixed(2)} ${bx.toFixed(1)} ${by.toFixed(1)})`);
    root.querySelectorAll<SVGPathElement>("[data-arc]").forEach((p, i) => (p.style.opacity = m.arcs[i].toFixed(3)));

    // Callout: digits of the time shown, changed digits flash rust at the 07:30 tick.
    const ct = root.querySelector("[data-callout-text]") as SVGGElement | null;
    if (ct) ct.style.opacity = m.callout.toFixed(3);
    root.querySelectorAll<SVGTextElement>("[data-callout]").forEach((t, k) => {
      const ch = String(m.shown[k]);
      if (t.textContent !== ch) t.textContent = ch;
      t.toggleAttribute("data-flash", m.flash[k]);
    });
    root.querySelectorAll("[data-box]").forEach((p, k) => p.toggleAttribute("data-flash", m.flash[k]));

    // Fold: callout digits fly to the tray labels; trays fade in; tiles drop, flip digit -> bit, sink at the end.
    root.querySelectorAll<SVGGElement>("[data-label]").forEach((g, k) => {
      const show = m.labelOpacity > 0.001;
      g.style.display = show ? "" : "none";
      if (!show) return;
      g.style.opacity = m.labelOpacity.toFixed(3);
      const f = labelFlight(k, m.land);
      const text = g.querySelector("text")!;
      text.setAttribute("transform", f.transform);
      text.setAttribute("font-size", f.size.toFixed(2));
    });
    const circuit = root.querySelector("[data-circuit]") as SVGGElement | null;
    if (circuit) circuit.style.opacity = m.circuit.toFixed(3);
    root.querySelectorAll<SVGGElement>("[data-tray]").forEach((g, k) => {
      g.toggleAttribute("data-on", m.lit[k]);
      g.style.opacity = m.trayOpacity[k].toFixed(3);
    });
    const showBits = m.flip >= 0.5;
    root.querySelectorAll<SVGGElement>("[data-tile]").forEach((g) => {
      const [k, i] = g.dataset.tile!.split("-").map(Number);
      const up = m.tileUp[k][i];
      const grow = m.tileGrow[k];
      const gone = up >= 1 || grow < 0.01;
      g.style.display = gone ? "none" : "";
      if (gone) return;
      const key = `${up.toFixed(3)}|${grow.toFixed(3)}`;
      const t = tileSolid(k, i, up, grow);
      if (s.keys[g.dataset.tile!] !== key) {
        s.keys[g.dataset.tile!] = key;
        g.querySelector("[data-slot]")!.innerHTML = solidSvg(t.paths, { tone: "mid", crease: "lo" });
      }
      const text = g.querySelector("text")!;
      const ch = showBits ? CODES[k][i] : String(DIGITS[k]);
      if (text.textContent !== ch) text.textContent = ch;
      text.setAttribute("transform", t.text);
      text.setAttribute("data-tone", showBits && ch === "0" ? "lo" : "hi");
      text.style.opacity = (Math.abs(1 - 2 * m.flip) * Math.min(1, grow * 2)).toFixed(3);
    });

    // Table: in at the fold; active digits rust; unused codes dashed and dim.
    fig?.style.setProperty("--bcd-table-in", m.table.toFixed(3));
    fig?.style.setProperty("--bcd-table-top", `${(TABLE_TOP * 100).toFixed(2)}%`);
    fig?.style.setProperty("--bcd-unused-in", m.unusedLabel.toFixed(3));
    const cells = m.cells.map(Number).join("") + m.unused.map(Number).join("");
    if (cells !== s.cells) {
      s.cells = cells;
      fig?.querySelectorAll(".bcd-table tr:not(:last-child) td").forEach((td, i) => {
        td.toggleAttribute("data-on", m.cells[i]);
        td.toggleAttribute("data-unused", m.unused[i]);
      });
    }
  };

  useFrameLoop((dt, reduced) => {
    state.current.t = reduced ? KEY_TIME : state.current.t + dt;
    paint();
    return !reduced;
  }, inView);
  useEffect(() => paint(), []);

  return (
    <div ref={ref} className="bcd-stage">
      <Stage
        width={STAGE_W}
        height={STAGE_H}
        label="A digital alarm clock on a square board powers on at 07:28, ticks to 07:29 and 07:30, each decimal digit in its own display cell, and rings. The board stretches long: the digits 0 7 3 0 become four trays of 4 bit tiles; the 7 first shows only 111 in three tiles with a red dashed outline, then a fourth tile drops in: 0000 0111 0011 0000. Plain binary: the minutes as one row 11110 feed a divide-by-ten gear block that clunks three times, tens 1, 2, 3, remainder 0. Then the gear block drops away and each 4-bit box lights its own small window, 0 7 3 0. A table below shows the 16 four-bit codes; 1010 to 1111 are never used."
      >
        <defs>
          <radialGradient id="bcd-blue-pool">
            <stop offset="0" stopColor="#2f6fb8" stopOpacity="0.35" />
            <stop offset="0.55" stopColor="#2f6fb8" stopOpacity="0.16" />
            <stop offset="1" stopColor="#2f6fb8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="bcd-lcd-glass" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0" stopColor="#d6e5f3" />
            <stop offset="1" stopColor="#bcd3ec" />
          </linearGradient>
        </defs>
        <g data-zoom="" transform={zoomTransform(0)}>
          {children}
        </g>
      </Stage>
    </div>
  );
}
