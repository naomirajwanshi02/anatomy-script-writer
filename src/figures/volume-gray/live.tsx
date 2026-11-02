"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { paintEntry } from "../../iso/react/reel";
import { useFrameLoop, useInView } from "../../iso/react/live";
import { Stage } from "../../iso/react/draw";
import { amp, ampLift, contacts, discDividers, discInk, pinsFor, STAGE_H, STAGE_W } from "./geometry";
import { binary, gray, KEY_TIME, ROWS, stateAt } from "./model";

// Voice-synced builds map video time to figure time (voice.ts); the plain build plays the figure as is.
let timeMap: ((t: number) => number) | null = null;
export const setTimeMap = (fn: (t: number) => number) => void (timeMap = fn);

// Readout (Oxanium): VOL | b2 b1 b0, up to four rows; the loop fills them in per code phase.
export function VgTable() {
  const n = Math.max(ROWS.bin.length, ROWS.gray.length);
  return (
    <table className="vg-table" aria-label="Volume and the three sensor bits b2 b1 b0">
      <thead>
        <tr>
          <th>VOL</th>
          <th>b2</th>
          <th>b1</th>
          <th>b0</th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: n }, (_, i) => (
          <tr key={i} data-row={i} data-hide={i > 0 ? "" : undefined}>
            <td>{i === 0 ? 3 : " "}</td>
            <td>{i === 0 ? 0 : " "}</td>
            <td>{i === 0 ? 1 : " "}</td>
            <td>{i === 0 ? 1 : " "}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// The one loop: entrance, then the disc angle drives the reading, display, arcs, warning, disc and readout.
export function VgLive({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const state = useRef({ t: 0, pos: NaN, mix: NaN, rows: "", lead: "" });

  const paint = () => {
    const root = ref.current;
    if (!root) return;
    const s = state.current;
    const ft = timeMap ? timeMap(s.t) : s.t;
    paintEntry(root, ft, contacts);
    const m = stateAt(ft);
    const fig = root.closest("[data-figure]") as HTMLElement | null;

    // Amp: lifts and fades at the fold, lowers back at the unfold; the leader goes with it.
    const ampG = root.querySelector("[data-amp]") as SVGGElement | null;
    if (ampG) {
      ampG.setAttribute("transform", ampLift(m.fold));
      ampG.style.opacity = (1 - m.fold).toFixed(3);
      ampG.style.display = m.fold >= 1 ? "none" : "";
    }
    const leader = root.querySelector("[data-leader]") as SVGGElement | null;
    if (leader) leader.style.opacity = (1 - m.fold).toFixed(3);
    const pool = root.querySelector(".vg-pool") as SVGPathElement | null;
    if (pool) pool.style.opacity = (1 - m.fold).toFixed(3);

    // Disc: revealed as the amp leaves; sectors turn with the knob; tracks crossfade binary <-> Gray.
    const discG = root.querySelector("[data-disc]") as SVGGElement | null;
    if (discG) discG.style.opacity = m.fold.toFixed(3);
    const leadKey = m.lead.join();
    if (m.pos !== s.pos || m.codeMix !== s.mix || leadKey !== s.lead) {
      s.pos = m.pos;
      s.mix = m.codeMix;
      root.querySelector(".vg-pointer")?.setAttribute("d", amp.pointer(m.pos));
      const bin = discInk(binary, m.pos, m.lead);
      const gry = discInk(gray, m.pos, m.lead);
      const cur = m.isGray ? gry : bin;
      root.querySelector("[data-disc-bin] path")?.setAttribute("d", bin.ink + (m.isGray ? bin.active : ""));
      root.querySelector("[data-disc-gray] path")?.setAttribute("d", gry.ink + (m.isGray ? "" : gry.active));
      root.querySelector("[data-disc-active]")?.setAttribute("d", cur.active);
      root.querySelector("[data-disc-div]")?.setAttribute("d", discDividers(m.pos));
      (root.querySelector("[data-disc-bin]") as SVGGElement | null)?.style.setProperty("opacity", (1 - m.codeMix).toFixed(3));
      (root.querySelector("[data-disc-gray]") as SVGGElement | null)?.style.setProperty("opacity", m.codeMix.toFixed(3));
    }
    // Brush pins: the left brush a hair ahead, or a hair behind in the late replay.
    if (leadKey !== s.lead) {
      s.lead = leadKey;
      const p = pinsFor(m.lead);
      root.querySelector("[data-pins]")?.setAttribute("d", p.pins);
      root.querySelectorAll("[data-pin-tips] circle").forEach((c, k) => {
        c.setAttribute("cx", p.tips[k][0].toFixed(1));
        c.setAttribute("cy", p.tips[k][1].toFixed(1));
      });
    }

    // Display and callout: decoded volume, level bar; warning outline only while the reading is a glitch.
    const text = `VOL ${m.vol}`;
    root.querySelectorAll("[data-lcd]").forEach((el) => {
      if (el.textContent !== text) el.textContent = text;
    });
    root.querySelectorAll("[data-bar]").forEach((el, i) => el.classList.toggle("vg-seg-off", !m.bar[i]));
    const warn = root.querySelector(".vg-warn") as SVGPathElement | null;
    if (warn) warn.style.display = m.glitch ? "" : "none";
    root.querySelectorAll<SVGPathElement>("[data-arc]").forEach((p) => (p.style.opacity = m.arcs[Number(p.dataset.arc)].toFixed(3)));

    // Readout rows.
    const key = JSON.stringify(m.rows);
    if (key !== s.rows && fig) {
      s.rows = key;
      fig.querySelectorAll(".vg-table tbody tr").forEach((tr, i) => {
        const r = m.rows[i];
        tr.toggleAttribute("data-hide", !r || !r.shown);
        tr.toggleAttribute("data-on", Boolean(r && r.on));
        tr.toggleAttribute("data-warn", Boolean(r && r.warn));
        tr.toggleAttribute("data-dim", Boolean(r && r.dim));
        const tds = tr.querySelectorAll("td");
        tds[0].textContent = r ? String(r.v) : " ";
        for (let k = 0; k < 3; k++) {
          tds[k + 1].textContent = r ? r.bits[k] : " ";
          tds[k + 1].toggleAttribute("data-changed", Boolean(r && r.changed[k]));
        }
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
    <div ref={ref} className="vg-stage">
      <Stage
        width={STAGE_W}
        height={STAGE_H}
        label="A hi-fi amplifier on a square board at VOL 3. Its knob turns to 4; in binary the three sensor bits do not flip at once, it briefly reads 111 and the display and callout jump to VOL 7 while the speaker blasts. The amp lifts away to show the coded disc and its three brushes, one per bit. In slow motion the left brush, a hair ahead, crosses first: 011 becomes 111, seven, then 100. The disc is redrawn in Gray code; the same turn from 3 (010) to 4 (110) changes only the left bit, and replayed with that brush late, the reading holds 3 a moment longer, then 4, never 7. The Gray rows 2 to 5 flash in turn, each changing one bit. Then the amp returns."
      >
        <defs>
          <radialGradient id="vg-blue-pool">
            <stop offset="0" stopColor="#2f6fb8" stopOpacity="0.35" />
            <stop offset="0.55" stopColor="#2f6fb8" stopOpacity="0.16" />
            <stop offset="1" stopColor="#2f6fb8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="vg-lcd-glass" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0" stopColor="#d6e5f3" />
            <stop offset="1" stopColor="#bcd3ec" />
          </linearGradient>
        </defs>
        {children}
      </Stage>
    </div>
  );
}
