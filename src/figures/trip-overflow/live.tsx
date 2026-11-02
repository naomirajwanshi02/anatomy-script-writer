"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { solidSvg } from "../../iso/iso-kit";
import { paintEntry } from "../../iso/react/reel";
import { useFrameLoop, useInView } from "../../iso/react/live";
import { Stage } from "../../iso/react/draw";
import { BulbGlowDef } from "../../iso/react/bulb";
import {
  boardEngrave,
  boardSvg,
  CHAR_SIZE,
  CHIP_SCALE,
  CHIP_Y,
  chipX,
  colX,
  contacts,
  DRUM_COL0,
  drumFlight,
  GHOST,
  ODO,
  odoLeft,
  ROW_Y,
  sinkTransform,
  SPEEDO,
  STAGE_H,
  STAGE_W,
  TABLE_TOP,
  TACHO,
  tileSolid,
  tileText,
  zoomTransform,
} from "./geometry";
import { KEY_TIME, stateAt, TABLE, type TileState } from "./model";

export function TovTable() {
  return (
    <table className="tov-table" aria-label="Overflow when adding 100 + 100 in 8 bits">
      <tbody>
        {TABLE.map((row, r) => (
          <tr key={r}>
            <td>{row}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Voice-synced builds map video time to figure time (voice.ts); the plain build plays the figure as is.
let timeMap: ((t: number) => number) | null = null;
export const setTimeMap = (fn: (t: number) => number) => void (timeMap = fn);

const DROP_Z = 30; // tile drop height (board units)
const DRUM_R = 8.1; // drum radius in face units: neighbours show as slivers curving away

// The one loop: writes needles, lights, drums, callout, board stretch, tiles and table rows into the static art.
export function TovLive({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const state = useRef({ t: 0, keys: [] as string[], stretch: -1, rows: "", top: "" });

  const paint = () => {
    const root = ref.current;
    if (!root) return;
    const s = state.current;
    const ft = timeMap ? timeMap(s.t) : s.t;
    paintEntry(root, ft, contacts);
    const m = stateAt(ft);

    // Board: square for the analogy, stretched long for the circuit; the engraving and the camera follow it.
    if (Math.abs(m.stretch - s.stretch) > 1e-4) {
      s.stretch = m.stretch;
      const b = root.querySelector("[data-board]");
      if (b) b.innerHTML = boardSvg(m.stretch);
      root.querySelector("[data-engrave] text")?.setAttribute("transform", boardEngrave(m.stretch));
      root.querySelector("[data-zoom]")?.setAttribute("transform", zoomTransform(m.stretch));
    }

    (root.querySelector("[data-labels]") as SVGGElement | null)?.style.setProperty("opacity", m.labels.toFixed(3));
    (root.querySelector(".tov-pool") as SVGPathElement | null)?.style.setProperty("opacity", m.pool.toFixed(3));
    // XOR gate, its wires and the overflow lamp V: shown with the circuit; flow dots only on wires carrying a 1; the
    // bulb's glass, halo and light pool follow the computed lamp level.
    const shown = (m.wires * m.labels).toFixed(3);
    for (const sel of ["[data-gate]", "[data-xor]", "[data-vlamp]", "[data-labels-v]"]) (root.querySelector(sel) as SVGGElement | null)?.style.setProperty("opacity", shown);
    (root.querySelector("[data-sign]") as SVGGElement | null)?.style.setProperty("opacity", (m.sign * m.labels).toFixed(3));
    const flows: Record<string, boolean> = { in: m.flowIn, out: m.flowOut, y: m.flowY };
    root.querySelectorAll<SVGGElement>("[data-wire]").forEach((w) => w.setAttribute("data-on", flows[w.dataset.wire!] ? "1" : "0"));
    (root.querySelector("[data-vlamp]") as SVGGElement | null)?.style.setProperty("--lamp", m.vlamp.toFixed(3));
    (root.querySelector("[data-vglow]") as SVGCircleElement | null)?.style.setProperty("opacity", m.vlamp.toFixed(3));
    // Ghost sixth drum: in as the drums roll over, then it drops down the face and fades.
    const gh = root.querySelector("[data-ghost]") as SVGGElement | null;
    if (gh) {
      gh.style.opacity = (m.ghost * (1 - m.ghostFall)).toFixed(3);
      gh.setAttribute("transform", `translate(0 ${(GHOST.fall * m.ghostFall * m.ghostFall).toFixed(2)})`);
    }
    (root.querySelector("[data-trip-active]") as SVGRectElement | null)?.style.setProperty("opacity", m.warn.toFixed(3));

    // Cluster and callout: sink into the board at the fold, rise back at the end.
    root.querySelectorAll<SVGGElement>("[data-phone]").forEach((g) => {
      g.style.display = m.phone >= 1 ? "none" : "";
      g.style.opacity = (1 - m.phone ** 2).toFixed(3);
      g.setAttribute("transform", sinkTransform(m.phone));
    });
    (root.querySelector("[data-leader]") as SVGGElement | null)?.style.setProperty("opacity", Math.max(0, 1 - m.phone * 4).toFixed(3));

    // Needles rotate about their hubs (face units; clockwise = positive).
    root.querySelector("[data-needle=tach]")?.setAttribute("transform", `rotate(${((TACHO.sweep * m.tach) / TACHO.max).toFixed(2)} ${TACHO.u} ${TACHO.v})`);
    root.querySelector("[data-needle=speed]")?.setAttribute("transform", `rotate(${((SPEEDO.sweep * m.speed) / SPEEDO.max).toFixed(2)} ${SPEEDO.u} ${SPEEDO.v})`);

    // Tell-tales: dim when off, full with a halo when lit.
    root.querySelectorAll<SVGGElement>("[data-light]").forEach((g, k) => (g.style.opacity = (0.12 + 0.88 * m.lights[k]).toFixed(3)));
    root.querySelectorAll<SVGCircleElement>("[data-halo]").forEach((c, k) => (c.style.opacity = m.lights[k].toFixed(3)));

    // Drums: every digit sits on the drum at 36 degrees per step; the window shows the ones facing the viewer.
    root.querySelectorAll<SVGGElement>("[data-drum]").forEach((g, i) => {
      g.style.display = m.drumsOut ? "none" : "";
      if (m.drumsOut) return;
      const p = m.drums[i];
      const cu = odoLeft + i * (ODO.drumW + ODO.gap) + ODO.drumW / 2;
      const mid = ODO.top + ODO.h / 2;
      g.querySelectorAll<SVGTextElement>("text").forEach((t, k) => {
        const steps = ((((k - p) % 10) + 15) % 10) - 5; // -5..5
        const th = (steps * 36 * Math.PI) / 180;
        const show = Math.abs(th) < (80 * Math.PI) / 180;
        t.style.display = show ? "" : "none";
        if (show) t.setAttribute("transform", `translate(${cu.toFixed(2)} ${(mid - DRUM_R * Math.sin(th)).toFixed(2)}) scale(1 ${Math.cos(th).toFixed(3)})`);
      });
    });

    // Callout mirrors the trip; red dashed box round 00000 after the rollover.
    root.querySelectorAll<SVGTextElement>("[data-call]").forEach((t, i) => {
      const ch = m.callout[i] ?? " ";
      if (t.textContent !== ch) t.textContent = ch;
    });
    (root.querySelector(".tov-warn") as SVGPathElement | null)?.style.setProperty("opacity", m.warn.toFixed(3));

    // Bit tiles: row A (0-7; columns 3-7 lift out of the drums), row B (8-15) drops in, sum (16-23) fills right to left,
    // carry chips (24-31) behind row A.
    const tiles: { st: TileState; x: number; y: number; z: number; sc: number; opacity: number }[] = [
      ...m.rowA.map((st, i) => {
        const f = i >= DRUM_COL0 && m.lift < 1 ? drumFlight(i - DRUM_COL0, m.lift) : { x: colX(i), y: ROW_Y[0], z: st.up * DROP_Z, sc: 1 };
        return { st, ...f, opacity: 1 };
      }),
      ...m.rowB.map((st, i) => ({ st, x: colX(i), y: ROW_Y[1], z: st.up * DROP_Z, sc: 1, opacity: 1 })),
      ...m.sum.map((st, i) => ({ st, x: colX(i), y: ROW_Y[2], z: st.up * DROP_Z, sc: 1, opacity: 1 })),
      ...m.chips.map((st, k) => ({ st, x: chipX(k), y: CHIP_Y, z: 0, sc: CHIP_SCALE, opacity: m.labels })),
    ];
    root.querySelectorAll<SVGGElement>("[data-tile]").forEach((g, k) => {
      const { st, x, y, z, sc, opacity } = tiles[k];
      const grow = 1 - m.sink;
      const gone = !st.show || grow < 0.01;
      g.style.display = gone ? "none" : "";
      if (gone) return;
      g.style.opacity = opacity.toFixed(3);
      const { paths, h } = tileSolid(x, y, z, sc, grow);
      const warn = st.warn ?? 0;
      const key = `${x.toFixed(2)}|${y.toFixed(2)}|${z.toFixed(2)}|${sc.toFixed(3)}|${grow.toFixed(3)}|${st.active}|${warn.toFixed(2)}`;
      if (s.keys[k] !== key) {
        s.keys[k] = key;
        const accent = st.active ? `<path class="tov-accent" d="${paths.top}"/>` : "";
        const warnBox = warn > 0 ? `<path class="tov-warn" style="opacity:${warn.toFixed(2)}" d="${paths.top}"/>` : "";
        g.querySelector("[data-slot]")!.innerHTML = solidSvg(paths, { tone: "mid", crease: "lo" }) + accent + warnBox;
      }
      const text = g.querySelector("text")!;
      text.setAttribute("transform", tileText(x, y, h, CHAR_SIZE * sc));
      text.setAttribute("font-size", (CHAR_SIZE * sc).toFixed(2));
      text.setAttribute("data-tone", st.dim ? "lo" : st.ch === "1" ? "hi" : "mid");
      text.classList.toggle("tov-rust", !!st.rust && st.active);
      if (text.textContent !== st.ch) text.textContent = st.ch;
      text.style.opacity = (st.textOpacity * grow).toFixed(3);
    });

    // Readout table: hidden in the analogy, in at the fold; the current row in rust.
    const fig = root.closest("[data-figure]") as HTMLElement | null;
    fig?.style.setProperty("--tov-table-in", m.table.toFixed(3));
    fig?.style.setProperty("--tov-table-top", `${(TABLE_TOP * 100).toFixed(2)}%`);
    if (m.topRow !== s.top) {
      s.top = m.topRow;
      const td = fig?.querySelector(".tov-table tr td");
      if (td) td.textContent = m.topRow;
    }
    const rowsKey = m.rows.join(",");
    if (rowsKey !== s.rows) {
      s.rows = rowsKey;
      fig?.querySelectorAll(".tov-table tr").forEach((tr, r) => tr.toggleAttribute("data-on", m.rows.includes(r)));
    }
  };

  useFrameLoop((dt, reduced) => {
    state.current.t = reduced ? KEY_TIME : state.current.t + dt;
    paint();
    return !reduced;
  }, inView);
  useEffect(() => paint(), []);

  return (
    <div ref={ref} className="tov-stage">
      <Stage
        width={STAGE_W}
        height={STAGE_H}
        label="A car instrument cluster on a square board: the trip meter ticks 99998, 99999 and rolls over to 00000; a sixth drum showing the lost 1 drops away and a red warning light comes on. The board stretches long: the leftmost bit is the sign and positives stop at 01111111 = 127. 100 in 8 bits is 01100100; adding 01100100 + 01100100 ripples carries into bits 3, 6 and 7 and gives 11001000, which reads as minus 56. The carry into the sign bit is 1 and the carry out is 0; an XOR gate sees they differ and lights the overflow lamp V."
      >
        <defs>
          <radialGradient id="tov-warm-pool">
            <stop offset="0" stopColor="#fff6c8" stopOpacity="0.45" />
            <stop offset="0.5" stopColor="#ffc21a" stopOpacity="0.1" />
            <stop offset="1" stopColor="#ffc21a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="tov-lcd-glass" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0" stopColor="#d6e5f3" />
            <stop offset="1" stopColor="#bcd3ec" />
          </linearGradient>
          <BulbGlowDef id="tov-bulb-glow" />
          <linearGradient id="tov-drum" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d9c5a0" />
            <stop offset="0.5" stopColor="#fff8ea" />
            <stop offset="1" stopColor="#d9c5a0" />
          </linearGradient>
          <linearGradient id="tov-drum-shade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3b2a1a" stopOpacity="0.75" />
            <stop offset="0.3" stopColor="#3b2a1a" stopOpacity="0" />
            <stop offset="0.7" stopColor="#3b2a1a" stopOpacity="0" />
            <stop offset="1" stopColor="#3b2a1a" stopOpacity="0.75" />
          </linearGradient>
          <linearGradient id="tov-chrome" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff8ea" />
            <stop offset="0.3" stopColor="#b9a47f" />
            <stop offset="0.5" stopColor="#fbf3e2" />
            <stop offset="0.75" stopColor="#8a7356" />
            <stop offset="1" stopColor="#d9c5a0" />
          </linearGradient>
          {[
            ["tov-glow-y", "#ffc21a"],
            ["tov-glow-r", "#c2402f"],
            ["tov-glow-b", "#2f6fb8"],
          ].map(([id, c]) => (
            <radialGradient key={id} id={id}>
              <stop offset="0" stopColor={c} stopOpacity="0.7" />
              <stop offset="0.5" stopColor={c} stopOpacity="0.25" />
              <stop offset="1" stopColor={c} stopOpacity="0" />
            </radialGradient>
          ))}
        </defs>
        <g data-zoom="" transform={zoomTransform(0)}>
          {children}
        </g>
      </Stage>
    </div>
  );
}
