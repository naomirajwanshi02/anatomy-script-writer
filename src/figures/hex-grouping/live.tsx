"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { solidSvg } from "../../iso/iso-kit";
import { paintEntry } from "../../iso/react/reel";
import { useFrameLoop, useInView } from "../../iso/react/live";
import { Stage } from "../../iso/react/draw";
import {
  blockOffset,
  boardEngrave,
  boardSvg,
  calloutText,
  contacts,
  keyDip,
  screenLit,
  sinkTransform,
  STAGE_H,
  STAGE_W,
  TABLE_TOP,
  tileFlight,
  tileSolid,
  tileText,
  tileX,
  weightText,
  zoomTransform,
} from "./geometry";
import { CALLER, KEY_TIME, stateAt, TABLE } from "./model";
import { ENTRY, sparkAt } from "../../iso/entrance";
import { BUBBLE_FROM, bitX, DESK_ENGRAVE_X, DESK_LEG_H, DESK_SINK, DESK_TRAVEL, deskCam, deskContacts, deskLegsSvg, GLYPH_MID, monitorLit, shirtNow, wallRow } from "./without";

export function HexTable() {
  const rows = [TABLE.slice(0, 8), TABLE.slice(8, 16)];
  return (
    <table className="hex-table" aria-label="Hex digits and their 4-bit codes">
      <tbody>
        {rows.map((row, r) => (
          <tr key={r}>
            {row.map((c) => (
              <td key={c.i}>
                <b>{c.hex}</b>
                <small>{c.bits}</small>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

type Model = ReturnType<typeof stateAt>;
type Cache = { legs: number; monLit: string; regroup: number; flip: number; scroll: number };
const backOut = (u: number) => 1 + 2.70158 * (u - 1) ** 3 + 1.70158 * (u - 1) ** 2;

// Without-it scene: desk legs, falling parts, landing sparks, monitor power line, bit wall scroll / regroup / hex
// flip, and the thought bubble (pop, tangle wobble, calm "B2").
function paintDesk(root: HTMLElement, m: Model, s: Cache, t: number) {
  const h = DESK_LEG_H * m.desk;
  if (Math.abs(h - s.legs) > 1e-3) {
    s.legs = h;
    const g = root.querySelector("[data-desk-legs]");
    if (g) g.innerHTML = deskLegsSvg(h);
  }
  const parts = root.querySelector("[data-desk-parts]") as SVGGElement | null;
  if (parts) {
    parts.style.display = m.deskUp >= 1 || m.deskOut >= 1 ? "none" : "";
    parts.style.opacity = (1 - m.deskOut).toFixed(3);
    parts.setAttribute("transform", `translate(0 ${(-m.deskUp * DESK_TRAVEL + m.deskOut * DESK_SINK).toFixed(2)})`);
    // Polo: slow breath and a soft ripple of the loose hem, rebuilt while the desk scene shows.
    if (parts.style.display !== "none") {
      const sh = shirtNow(t);
      parts.querySelector("[data-shirt-torso]")?.setAttribute("d", sh.torso);
      parts.querySelector("[data-shirt-yoke]")?.setAttribute("d", sh.shoulders);
      parts.querySelector("[data-shirt-shade]")?.setAttribute("d", sh.shade);
      parts.querySelector("[data-shirt-hem]")?.setAttribute("d", sh.hem);
      parts.querySelector("[data-shirt-folds]")?.setAttribute("d", sh.folds);
    }
  }
  root.querySelectorAll<SVGLineElement>("[data-dspark]").forEach((el, i) => {
    const p = m.deskSince >= 0 && m.deskSince < 1 ? sparkAt(ENTRY.contact + m.deskSince, deskContacts[Math.floor(i / 3) % deskContacts.length], i) : null;
    if (!p) return void el.setAttribute("opacity", "0");
    el.setAttribute("x1", p.tail[0].toFixed(1));
    el.setAttribute("y1", p.tail[1].toFixed(1));
    el.setAttribute("x2", p.head[0].toFixed(1));
    el.setAttribute("y2", p.head[1].toFixed(1));
    el.setAttribute("opacity", p.opacity.toFixed(2));
    el.setAttribute("data-hot", p.hot ? "1" : "0");
  });
  // Monitor: power line opening to the full blue glass; closing to a line, then a dot.
  const lit = monitorLit(m.monPower, m.monOpen);
  if (lit !== s.monLit) {
    s.monLit = lit;
    root.querySelector(".hex-mon-lit")?.setAttribute("d", lit);
    root.querySelector(".hex-mon-flash")?.setAttribute("d", lit);
  }
  const on = m.monPower * m.monOpen;
  const flash = root.querySelector(".hex-mon-flash") as SVGPathElement | null;
  if (flash) flash.style.opacity = (m.monPower > 0.01 ? 1 - m.monOpen : 0).toFixed(3);
  const wall = root.querySelector(".hex-wall") as SVGGElement | null;
  if (wall) wall.style.opacity = (on ** 4).toFixed(3);
  const pool = root.querySelector(".hex-mon-pool") as SVGPathElement | null;
  if (pool) pool.style.opacity = on.toFixed(3);
  const rows = root.querySelectorAll<SVGGElement>("[data-wall-row]");
  if (Math.abs(m.scroll - s.scroll) > 1e-4) {
    s.scroll = m.scroll;
    rows.forEach((g, r) => g.setAttribute("transform", wallRow(r, m.scroll)));
  }
  if (Math.abs(m.regroup - s.regroup) > 1e-4 || Math.abs(m.hexFlip - s.flip) > 1e-4) {
    s.regroup = m.regroup;
    s.flip = m.hexFlip;
    rows.forEach((g) => {
      g.querySelectorAll<SVGTextElement>("[data-bit]").forEach((t, j) => {
        const f = Math.min(1, Math.max(0, m.hexFlip * 1.5 - Math.floor(j / 4) / 14));
        const k = Math.max(0, 1 - 2 * f);
        t.setAttribute("x", bitX(j, m.regroup).toFixed(2));
        t.style.display = k <= 0 ? "none" : "";
        if (k >= 1) t.removeAttribute("transform");
        else t.setAttribute("transform", `matrix(1 0 0 ${k.toFixed(3)} 0 ${(GLYPH_MID * (1 - k)).toFixed(3)})`);
      });
      g.querySelectorAll<SVGTextElement>("[data-hexd]").forEach((t, gi) => {
        const f = Math.min(1, Math.max(0, m.hexFlip * 1.5 - gi / 14));
        const k = Math.max(0, 2 * f - 1);
        t.style.display = k <= 0 ? "none" : "";
        if (k >= 1) t.removeAttribute("transform");
        else t.setAttribute("transform", `matrix(1 0 0 ${k.toFixed(3)} 0 ${(GLYPH_MID * 1.45 * (1 - k)).toFixed(3)})`);
      });
    });
  }
  // Thought bubble: pops from the head (slight overshoot), tangle wobbles, then calms to "B2" and a tick.
  const bubble = root.querySelector("[data-bubble]") as SVGGElement | null;
  if (bubble) {
    bubble.style.display = m.bubble <= 0.001 ? "none" : "";
    const k = m.bubble >= 1 ? 1 : backOut(m.bubble);
    const [fx, fy] = BUBBLE_FROM;
    bubble.setAttribute("transform", `translate(${fx.toFixed(1)} ${fy.toFixed(1)}) scale(${k.toFixed(3)}) translate(${(-fx).toFixed(1)} ${(-fy).toFixed(1)})`);
    bubble.style.opacity = Math.min(1, m.bubble * 3).toFixed(3);
    const tangle = bubble.querySelector("[data-tangle]") as SVGGElement | null;
    if (tangle) tangle.style.opacity = (1 - m.calm).toFixed(3);
    const calm = bubble.querySelector("[data-calm]") as SVGGElement | null;
    if (calm) calm.style.opacity = m.calm.toFixed(3);
    bubble.querySelectorAll<SVGGElement>("[data-jumble]").forEach((g, i) => {
      const rot = Number(g.dataset.rot) + m.wobble * (i % 2 ? -1 : 1) * (1 - m.calm);
      g.setAttribute("transform", `${g.dataset.at} rotate(${rot.toFixed(2)})`);
    });
  }
}

// Optional time map (voice-synced builds set it before rendering; the plain figure keeps video time).
let timeMap: ((t: number) => number) | null = null;
export const setTimeMap = (fn: (t: number) => number) => void (timeMap = fn);

// The one loop: writes tile positions, characters, block drops and table cells into the static art.
export function HexLive({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const state = useRef({ t: 0, keys: [] as string[], cells: "", stretch: -1, lit: "", legs: -1, monLit: "", regroup: -1, flip: -1, scroll: -1 });

  const paint = () => {
    const root = ref.current;
    if (!root) return;
    const s = state.current;
    const ft = timeMap ? timeMap(s.t) : s.t;
    paintEntry(root, ft, contacts);
    const m = stateAt(ft);
    root.querySelectorAll<SVGGElement>("[data-tile]").forEach((g, i) => {
      const tile = m.tiles[i];
      const sink = i >= 8 ? m.sink : 0;
      const grow = (1 - sink) * (1 - m.tilesOut) * Math.min(1, m.land / 0.2);
      const { x, y, z } = tileFlight(i, m.land, tileX(i, m), m.calloutSplit);
      const on = tile.nibble >= 0 && m.active[tile.nibble];
      const gone = grow < 0.01;
      g.style.display = gone ? "none" : "";
      if (gone) return;
      g.style.opacity = m.tileOpacity.toFixed(3);
      const key = `${x.toFixed(2)}|${y.toFixed(2)}|${z.toFixed(2)}|${grow.toFixed(3)}|${on}`;
      const { paths, h } = tileSolid(x, grow, y, z);
      if (s.keys[i] !== key) {
        s.keys[i] = key;
        const accent = on ? `<path class="hex-accent" d="${paths.top}"/>` : "";
        g.querySelector("[data-slot]")!.innerHTML = solidSvg(paths, { tone: "mid", crease: "lo" }) + accent;
      }
      const text = g.querySelector("text")!;
      text.setAttribute("transform", tileText(x, h, y));
      text.setAttribute("data-tone", tile.tone);
      if (text.textContent !== tile.ch) text.textContent = tile.ch;
      text.style.opacity = (m.textOpacity * (1 - sink)).toFixed(3);
    });
    // Place values over each group in turn (1-bits rust, 0-bits faint).
    root.querySelectorAll<SVGTextElement>("[data-weight]").forEach((t, i) => {
      const k = i < 4 ? 0 : 1;
      t.style.opacity = m.weigh[k].toFixed(3);
      if (m.weigh[k] <= 0) return;
      t.setAttribute("transform", weightText(tileX(i, m)));
      t.toggleAttribute("data-on", m.tiles[i].ch === "1");
    });
    // Board: square for the analogy, stretched long for the circuit; the engraving follows its front face.
    // At the desk fold the feet fade as the desk legs grow, and the engraving slides right of the engineer.
    const boardKey = m.stretch + m.desk * 7 + m.cam * 13;
    if (Math.abs(boardKey - s.stretch) > 1e-4) {
      s.stretch = boardKey;
      const b = root.querySelector("[data-board]");
      if (b) b.innerHTML = boardSvg(m.stretch, 1 - m.desk);
      const e = m.cam * m.cam * (3 - 2 * m.cam);
      root.querySelector("[data-engrave] text")?.setAttribute("transform", boardEngrave(m.stretch, DESK_ENGRAVE_X * e));
    }
    paintDesk(root, m, s, s.t); // the shirt breathes on real time, also through held stretches
    // Phone and callout: sink a little and fade at the fold; keys dip as they are pressed.
    root.querySelectorAll<SVGGElement>("[data-phone]").forEach((g) => {
      g.style.display = m.phone >= 1 ? "none" : "";
      g.style.opacity = (1 - m.phone ** 2).toFixed(3);
      g.setAttribute("transform", sinkTransform(m.phone));
    });
    root.querySelectorAll<SVGGElement>("[data-leader]").forEach((g) => (g.style.opacity = Math.max(0, 1 - m.phone * 4).toFixed(3)));
    root.querySelector("[data-zoom]")?.setAttribute("transform", deskCam(m.cam) + zoomTransform(m.stretch));
    root.querySelectorAll<SVGGElement>("[data-key]").forEach((g) => {
      const dip = m.keys[Number(g.dataset.key)];
      g.setAttribute("transform", keyDip(dip));
      g.toggleAttribute("data-on", dip > 0);
    });
    // Screen: CRT-style power line opening to the full glass, closing to a line and a dot.
    const lit = screenLit(m.power, m.open);
    if (lit !== s.lit) {
      s.lit = lit;
      root.querySelector(".hex-lit")?.setAttribute("d", lit);
      root.querySelector(".hex-flash")?.setAttribute("d", lit);
    }
    const on = m.power * m.open;
    const flash = root.querySelector(".hex-flash") as SVGPathElement | null;
    if (flash) flash.style.opacity = (m.power > 0.01 ? 1 - m.open : 0).toFixed(3);
    const screenText = root.querySelector(".hex-screen-text") as SVGGElement | null;
    if (screenText) screenText.style.opacity = (on ** 4).toFixed(3);
    root.querySelectorAll<SVGTextElement>("[data-screen]").forEach((t, i) => (t.style.display = m.typed[i] ? "" : "none"));
    (root.querySelector("[data-screen-calling]") as SVGTextElement | null)?.style.setProperty("opacity", m.calling.toFixed(3));
    const pool = root.querySelector(".hex-pool") as SVGPathElement | null;
    if (pool) pool.style.opacity = on.toFixed(3);
    // Callout: the dialled number large, then grouped; "Calling ROLLIN..." with animated dots.
    root.querySelectorAll<SVGTextElement>("[data-callout]").forEach((t, i) => {
      t.style.display = m.typed[i] ? "" : "none";
      t.setAttribute("transform", calloutText(i, m.calloutSplit));
    });
    const calling = root.querySelector("[data-calling]") as SVGTextElement | null;
    if (calling) {
      calling.style.opacity = m.calling.toFixed(3);
      const txt = `Calling ${CALLER}${".".repeat(m.dots)}${" ".repeat(3 - m.dots)}`;
      if (calling.textContent !== txt) calling.textContent = txt;
    }
    const fig = root.closest("[data-figure]") as HTMLElement | null;
    fig?.style.setProperty("--hex-table-in", m.table.toFixed(3));
    fig?.style.setProperty("--hex-table-top", `${(TABLE_TOP * 100).toFixed(2)}%`);
    const warn = root.querySelector(".hex-warn") as HTMLElement | null;
    if (warn) warn.style.opacity = m.warn.toFixed(3);
    const gap = root.querySelector(".hex-gap") as HTMLElement | null;
    if (gap) gap.style.opacity = m.gapMark.toFixed(3);
    root.querySelectorAll<SVGGElement>("[data-block]").forEach((g, k) => {
      const up = m.blockUp[k];
      g.style.display = up >= 1 ? "none" : "";
      g.setAttribute("transform", blockOffset(up));
    });
    const cells = m.cells.map(Number).join("");
    if (cells !== s.cells) {
      s.cells = cells;
      root
        .closest("[data-figure]")
        ?.querySelectorAll(".hex-table td")
        .forEach((td, i) => td.toggleAttribute("data-on", m.cells[i]));
    }
  };

  useFrameLoop((dt, reduced) => {
    state.current.t = reduced ? KEY_TIME : state.current.t + dt;
    paint();
    return !reduced;
  }, inView);
  useEffect(() => paint(), []);

  return (
    <div ref={ref} className="hex-stage">
      <Stage
        width={STAGE_W}
        height={STAGE_H}
        label="A desk phone on a square board dials 9812345670; a callout shows the number, which splits into groups of 3, 3 and 4. The board stretches long: the digits drop as tiles and fold into the bits 1011 0010; each group of 4 bits becomes one hex digit, B and 2, as two blocks drop above the groups, matching the hex table below. Without hex: the board becomes a desk where an engineer faces a monitor of scrolling bits, his thought bubble a tangle with a question mark; the bits regroup in fours and flip to hex digits, and the bubble calms to B2 with a tick."
      >
        <defs>
          <radialGradient id="hex-blue-pool">
            <stop offset="0" stopColor="#2f6fb8" stopOpacity="0.35" />
            <stop offset="0.55" stopColor="#2f6fb8" stopOpacity="0.16" />
            <stop offset="1" stopColor="#2f6fb8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hex-lcd-glass" x1="0" y1="0" x2="0.3" y2="1">
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
