"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { solidSvg } from "../../iso/iso-kit";
import { paintEntry } from "../../iso/react/reel";
import { useFrameLoop, useInView } from "../../iso/react/live";
import { Stage } from "../../iso/react/draw";
import {
  boardEngrave,
  boardSvg,
  contacts,
  dialPointer,
  doorSvg,
  dotAt,
  drumSvg,
  shakeTransform,
  sinkTransform,
  sockArc,
  SOCK_TONES,
  sockDrop,
  sockFlight,
  sparkSvg,
  STAGE_H,
  STAGE_W,
  TABLE_TOP,
  tileArc,
  tileOutline,
  tileSolid,
  zoomTransform,
} from "./geometry";
import { DEMO, KEY_TIME, stateAt } from "./model";

// Voice-synced builds map video time to figure time (voice.ts); the plain build plays the figure as is.
let timeMap: ((t: number) => number) | null = null;
export const setTimeMap = (fn: (t: number) => number) => void (timeMap = fn);

// Readout: one live line, the count of 1s of the row being checked and its verdict.
export function WashTable() {
  return (
    <table className="pw-table" aria-label="Count of ones, odd or even, and the parity check's verdict">
      <tbody>
        <tr>
          <td data-readout="">{"\u00a0"}</td>
        </tr>
      </tbody>
    </table>
  );
}

// The one loop: writes the machine (door, drum, water, socks, lamps, shake), the fold, tiles, sparks, lamp and table.
export function WashLive({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const state = useRef({ t: 0, keys: {} as Record<string, string>, board: "", door: -1, drum: "", rows: "" });

  const paint = () => {
    const root = ref.current;
    if (!root) return;
    const s = state.current;
    const ft = timeMap ? timeMap(s.t) : s.t;
    paintEntry(root, ft, contacts);
    const m = stateAt(ft);
    const fig = root.closest("[data-figure]") as HTMLElement | null;

    // Board: square for the analogy, stretched long for the circuit; camera zoom eases out with it.
    const boardKey = m.stretch.toFixed(4);
    if (boardKey !== s.board) {
      s.board = boardKey;
      const b = root.querySelector("[data-board]");
      if (b) b.innerHTML = boardSvg(m.stretch);
      root.querySelector("[data-engrave] text")?.setAttribute("transform", boardEngrave(m.stretch));
      root.querySelector("[data-zoom]")?.setAttribute("transform", zoomTransform(m.stretch));
    }

    // Machine, tray and callout: sink into the board at the fold, rise back at the end; the machine shakes and creeps.
    root.querySelectorAll<SVGGElement>("[data-sink]").forEach((g) => {
      g.style.display = m.sink >= 1 ? "none" : "";
      g.setAttribute("transform", sinkTransform(m.sink));
    });
    // Column clips only while sinking, so the open door can swing out past the cabinet's footprint.
    root.querySelectorAll<SVGGElement>("[data-clip]").forEach((g) => {
      if (m.sink > 0) g.setAttribute("clip-path", g.dataset.clip!);
      else g.removeAttribute("clip-path");
    });
    const shake = shakeTransform(m.creep, m.shake);
    root.querySelectorAll<SVGGElement>("[data-shake]").forEach((g) => g.setAttribute("transform", shake));
    root.querySelectorAll<SVGGElement>("[data-leader]").forEach((g) => (g.style.opacity = Math.max(0, 1 - m.sink * 4).toFixed(3)));
    const pool = root.querySelector(".pw-pool") as SVGPathElement | null;
    if (pool) pool.style.opacity = ((0.35 + 0.65 * m.water) * (1 - m.sink)).toFixed(3);

    if (m.sink < 1) {
      // Door swing, drum interior (rebuilt while anything in it moves), dial pointer, lamps.
      if (Math.abs(m.door - s.door) > 1e-4) {
        s.door = m.door;
        const d = root.querySelector("[data-door]");
        if (d) d.innerHTML = doorSvg(m.door);
      }
      const drum = drumSvg({ turns: m.turns, speed: m.speed, water: m.water, slosh: m.slosh, lt: m.lt, inDrum: m.socks.map((k) => k.inDrum), tones: SOCK_TONES, lostK: m.eatK, lost: m.eat });
      if (drum !== s.drum) {
        s.drum = drum;
        const d = root.querySelector("[data-drum]");
        if (d) d.innerHTML = drum;
      }
      root.querySelector(".pw-pointer")?.setAttribute("d", dialPointer(m.dial));
      const spin = root.querySelector(".pw-spin.pw-on") as SVGPathElement | null;
      if (spin) spin.style.opacity = m.spin.toFixed(3);
      const check = root.querySelector(".pw-check.pw-on") as SVGPathElement | null;
      if (check) check.style.opacity = m.check.toFixed(3);

      // Socks: resting copies on the tray (the spare drops in), flying copies hop between slot and drum.
      root.querySelectorAll<SVGGElement>("[data-rest]").forEach((g) => {
        const k = Number(g.dataset.rest);
        const sk = m.socks[k];
        g.style.display = sk.onTray ? "" : "none";
        if (sk.onTray) g.setAttribute("transform", sockDrop(sk.up));
      });
      root.querySelectorAll<SVGGElement>("[data-fly]").forEach((g) => {
        const k = Number(g.dataset.fly);
        const hop = m.socks[k].hop;
        g.style.display = hop >= 0 ? "" : "none";
        if (hop < 0) return;
        g.setAttribute("transform", sockFlight(k, hop));
        g.style.opacity = (hop > 0.8 ? 1 - (hop - 0.8) / 0.2 : 1).toFixed(3);
      });

      // Pairs: an arc over each two counted socks; the sock left alone in rust; the empty slot in red dashes.
      const arcs = root.querySelector("[data-sock-arcs]") as SVGPathElement | null;
      if (arcs) {
        const d = m.sockPairs.map(([i, j]) => sockArc(i, j)).join("");
        if (arcs.getAttribute("d") !== d) arcs.setAttribute("d", d);
        arcs.style.opacity = m.pairsShow.toFixed(3);
      }
      root.querySelectorAll<SVGPathElement>("[data-slot-mark]").forEach((p) => {
        const k = Number(p.dataset.slotMark);
        const st = k === m.emptySlot ? "empty" : k === m.sockAlone && m.pairsShow > 0.5 ? "alone" : "";
        if (p.dataset.state !== st) p.dataset.state = st;
      });

      // Callout: the live count, then the verdict; red dashed box round the verdict after the wash.
      root.querySelectorAll<SVGTextElement>("[data-call]").forEach((t, i) => {
        if (t.textContent !== m.callout[i]) t.textContent = m.callout[i];
      });
      (root.querySelector("[data-call-warn]") as SVGPathElement | null)?.style.setProperty("opacity", m.calloutWarn ? "1" : "0");
    }

    // Circuit: panel, labels and parity outline fade in; tiles drop, flip on a noise hit and sink at the end.
    const circuit = root.querySelector("[data-circuit]") as SVGGElement | null;
    if (circuit) circuit.style.opacity = m.circuit.toFixed(3);
    // Tiles: the sent row drops in (one tile shows a flip), the received row fills when its bits arrive; counted 1s
    // rust, flipped bits rust on the received row.
    root.querySelectorAll<SVGGElement>("[data-tile]").forEach((g) => {
      const [row, i] = g.dataset.tile!.split("-").map(Number);
      const recv = row === 1;
      const up = recv ? (m.recv ? 0 : 1) : m.sentUp[i];
      const grow = recv ? m.tileGrow * m.recvGrow : m.tileGrow;
      const gone = up >= 1 || grow < 0.01;
      g.style.display = gone ? "none" : "";
      if (gone) return;
      const key = `${up.toFixed(3)}|${grow.toFixed(3)}`;
      const t = tileSolid(row, i, up, grow);
      if (s.keys[g.dataset.tile!] !== key) {
        s.keys[g.dataset.tile!] = key;
        g.querySelector("[data-slot]")!.innerHTML = solidSvg(t.paths, { tone: "mid", crease: "lo" });
      }
      const text = g.querySelector("text")!;
      const ch = String(recv ? m.recv![i] : m.sentBits[i]);
      if (text.textContent !== ch) text.textContent = ch;
      text.setAttribute("transform", t.text);
      text.setAttribute("data-tone", ch === "0" ? "lo" : "hi");
      text.classList.toggle("pw-hot", recv ? m.recvHot[i] || m.flipped.includes(i) : m.sentHot[i] || (i === DEMO && m.demoOn));
      const fade = !recv && i === DEMO ? m.demoFade : 1;
      text.style.opacity = (fade * Math.min(1, grow * 2)).toFixed(3);
    });
    // Bits on the wires: rust dot for a 1, hollow ring for a 0.
    const dots = root.querySelector("[data-dots]");
    if (dots)
      dots.innerHTML = m.dots
        .map(({ i, u, bit }) => {
          const [x, y] = dotAt(i, u);
          return `<circle class="pw-bit${bit ? " pw-one" : ""}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.4"/>`;
        })
        .join("");
    // Pairs over the counted 1s and the 1 left alone, on whichever row is being counted.
    const tArcs = [...m.sentPairs.map(([i, j]) => tileArc(0, i, j)), ...m.recvPairs.map(([i, j]) => tileArc(1, i, j))].join("");
    const ta = root.querySelector("[data-tile-arcs]");
    if (ta && ta.getAttribute("d") !== tArcs) ta.setAttribute("d", tArcs);
    const alone = m.sentAlone >= 0 ? tileOutline(0, m.sentAlone) : m.recvAlone >= 0 ? tileOutline(1, m.recvAlone) : "";
    const tl = root.querySelector("[data-tile-alone]");
    if (tl && tl.getAttribute("d") !== alone) tl.setAttribute("d", alone);
    (root.querySelector("[data-wrong]") as SVGPathElement | null)?.style.setProperty("opacity", m.wrong.toFixed(3));
    const unknown = root.querySelector("[data-unknown]") as SVGGElement | null;
    if (unknown) unknown.style.opacity = m.unknown.toFixed(3);
    root.querySelector("[data-lamp]")?.toggleAttribute("data-on", m.errorLamp);
    const spark = root.querySelector("[data-spark]");
    if (spark) spark.innerHTML = m.sparks.map((k) => sparkSvg(k.i, k.travel, k.burst)).join("");

    // Table: in at the fold; rows appear in turn, the newest rust; rows not yet reached stay dim.
    fig?.style.setProperty("--pw-table-in", m.table.toFixed(3));
    fig?.style.setProperty("--pw-table-top", `${(TABLE_TOP * 100).toFixed(2)}%`);
    if (m.readout !== s.rows) {
      s.rows = m.readout;
      const td = fig?.querySelector("[data-readout]");
      if (td) td.textContent = m.readout || "\u00a0";
      td?.closest("tr")?.toggleAttribute("data-active", m.readout.includes("→"));
    }
  };

  useFrameLoop((dt, reduced) => {
    state.current.t = reduced ? KEY_TIME : state.current.t + dt;
    paint();
    return !reduced;
  }, inView);
  useEffect(() => paint(), []);

  return (
    <div ref={ref} className="pw-stage">
      <Stage
        width={STAGE_W}
        height={STAGE_H}
        label="Seven socks on a tray are counted and paired: three pairs and one left alone, odd. A spare drops in: four pairs, even. The washing machine eats the spare and seven come out: odd again, the empty slot is outlined and the CHECK lamp lights. The board stretches long: seven data bits 1011000, one flips and back to show a flip; their 1s are counted and paired, three, odd; a parity bit 1 makes four, even. The word goes down the wires to a received row; a noise spark flips one bit on its wire; the receiver counts five, odd, and its CHECK lamp lights. Sent again, two sparks flip two bits; six, even, the wrong word passes. Question marks over every bit: parity cannot say which one flipped."
      >
        <defs>
          <radialGradient id="pw-blue-pool">
            <stop offset="0" stopColor="#2f6fb8" stopOpacity="0.3" />
            <stop offset="0.55" stopColor="#2f6fb8" stopOpacity="0.13" />
            <stop offset="1" stopColor="#2f6fb8" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="pw-red-pool">
            <stop offset="0" stopColor="#c2402f" stopOpacity="0.3" />
            <stop offset="1" stopColor="#c2402f" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="pw-lcd-glass" x1="0" y1="0" x2="0.3" y2="1">
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
