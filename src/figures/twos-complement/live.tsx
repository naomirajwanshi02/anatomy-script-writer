"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { solidSvg } from "../../iso/iso-kit";
import { paintEntry } from "../../iso/react/reel";
import { useFrameLoop, useInView } from "../../iso/react/live";
import { Stage } from "../../iso/react/draw";
import {
  boardEngrave,
  boardSvg,
  CHAR_SIZE,
  colX,
  contacts,
  CW,
  drumLeft,
  drumMid,
  liftTransform,
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
import { KEY_TIME, stateAt } from "./model";

// Readout: the counter's reading and its signed value, a small step tag, then the 5 - 3 line and the path strip
// (fixed lines that fade in, so the block never shifts).
export function TcTable() {
  return (
    <div className="tc-read" role="table" aria-label="The 4-bit counter's reading and its value">
      <div className="tc-main" role="row">
        <span className="tc-rbits">0000</span>
        <span className="tc-req">=</span>
        <span className="tc-rval">0</span>
      </div>
      <div className="tc-rtag">{" "}</div>
      <div className="tc-sub" data-problem="" style={{ opacity: 0 }}>
        {" "}
      </div>
      <div className="tc-sub" data-path="" style={{ opacity: 0 }}>
        {" "}
      </div>
    </div>
  );
}

const DROP_Z = 30; // tile drop height (board units)
const COUNTER_DROP = 46; // counter drop height
const DRUM_R = 9; // cluster drum radius in face units: neighbours show as slivers curving away
const BDRUM_R = 17; // binary drum radius in counter-face units: only slivers of the neighbouring slots show

// Place a drum's slot texts (and optional teeth) round its axle: slot k at 36 degrees per step from position p.
function placeDrum(g: Element, p: number, cu: number, mid: number, r: number, teeth?: { left: number; right: number }) {
  g.querySelectorAll<SVGTextElement>("text").forEach((t, k) => {
    const steps = ((((k - p) % 10) + 15) % 10) - 5; // -5..5
    const th = (steps * 36 * Math.PI) / 180;
    const show = Math.abs(th) < (80 * Math.PI) / 180;
    t.style.display = show ? "" : "none";
    if (show) t.setAttribute("transform", `translate(${cu.toFixed(2)} ${(mid - r * Math.sin(th)).toFixed(2)}) scale(1 ${Math.cos(th).toFixed(3)})`);
  });
  if (!teeth) return;
  // 20 teeth round the rim (two per slot), short marks at both side edges.
  g.querySelectorAll<SVGPathElement>(".tc-tooth").forEach((el, k) => {
    const steps = ((((k / 2 - p) % 10) + 15) % 10) - 5;
    const th = (steps * 36 * Math.PI) / 180;
    if (Math.abs(th) >= (80 * Math.PI) / 180) return el.setAttribute("d", "");
    const y = (mid - r * Math.sin(th)).toFixed(2);
    el.setAttribute("d", `M${teeth.left} ${y}h1.6M${teeth.right - 1.6} ${y}h1.6`);
    el.style.opacity = Math.cos(th).toFixed(3);
  });
}

// Voice-synced builds map video time to figure time (voice.ts); the plain build plays the figure as is.
let timeMap: ((t: number) => number) | null = null;
export const setTimeMap = (fn: (t: number) => number) => void (timeMap = fn);

// The one loop: writes needles, lights, drums, callout, board stretch, the binary counter, tiles and the readout.
export function TcLive({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const state = useRef({ t: 0, keys: [] as string[], board: "" });

  const paint = () => {
    const root = ref.current;
    if (!root) return;
    const s = state.current;
    const ft = timeMap ? timeMap(s.t) : s.t;
    paintEntry(root, ft, contacts);
    const m = stateAt(ft);

    // Board: square for the analogy, stretched long for the circuit; the engraving follows its front face.
    const boardKey = m.stretch.toFixed(4);
    if (boardKey !== s.board) {
      s.board = boardKey;
      const b = root.querySelector("[data-board]");
      if (b) b.innerHTML = boardSvg(m.stretch);
      root.querySelector("[data-engrave] text")?.setAttribute("transform", boardEngrave(m.stretch));
      root.querySelector("[data-zoom]")?.setAttribute("transform", zoomTransform(m.stretch));
    }
    (root.querySelector(".tc-pool") as SVGPathElement | null)?.style.setProperty("opacity", m.pool.toFixed(3));

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

    // Cluster drums: every digit sits on the drum at 36 degrees per step; the window shows the ones facing the viewer.
    if (m.phone < 1) {
      root.querySelectorAll<SVGGElement>("[data-drum]").forEach((g, i) => {
        placeDrum(g, m.drums[i], odoLeft + i * (ODO.drumW + ODO.gap) + ODO.drumW / 2, ODO.top + ODO.h / 2, DRUM_R);
      });
    }

    // Callout mirrors the drums; red dashed box while it reads 9999.
    root.querySelectorAll<SVGTextElement>("[data-call]").forEach((t, i) => {
      if (t.textContent !== m.reading[i]) t.textContent = m.reading[i];
    });
    (root.querySelector(".tc-warn") as SVGPathElement | null)?.style.setProperty("opacity", m.warn.toFixed(3));

    // Binary counter: drops in at the fold (gravity), sinks into the board at the fold back.
    const cg = root.querySelector("[data-counter]") as SVGGElement | null;
    const cOn = m.counter < 0.999 && m.counter > -0.999;
    if (cg) cg.style.display = cOn ? "" : "none";
    if (cg && cOn) {
      const z = m.counter > 0 ? COUNTER_DROP * m.counter ** 2 : 40 * m.counter;
      root.querySelector("[data-counter-lift]")?.setAttribute("transform", liftTransform(z));
      const mid = (CW.v0 + CW.v1) / 2;
      root.querySelectorAll<SVGGElement>("[data-bdrum]").forEach((g, i) => {
        placeDrum(g, m.bpos[i], drumMid(i), mid, BDRUM_R, { left: drumLeft(i), right: drumLeft(i) + CW.drumW });
      });
      root.querySelectorAll<SVGRectElement>("[data-broll]").forEach((r, i) => (r.style.opacity = m.turning[i] ? "1" : "0"));
      root.querySelectorAll<SVGPathElement>("[data-pin]").forEach((p, j) => {
        p.setAttribute("transform", `rotate(${(m.pins[j] * 45).toFixed(2)})`);
        p.classList.toggle("tc-pin-on", m.pinOn[j]);
      });
      const fl = root.querySelector("[data-flash]") as SVGGElement | null;
      if (fl) {
        fl.style.opacity = m.flash > 0 ? (1 - m.flash).toFixed(3) : "0";
        fl.querySelectorAll("*").forEach((e) => e.setAttribute("transform", `scale(${(0.6 + 0.8 * m.flash).toFixed(3)})`));
      }
    }

    // Shortcut row: drops in as 0011 in front of the counter, flips, +1, then sinks into the board.
    (root.querySelector("[data-labels]") as SVGGElement | null)?.style.setProperty("opacity", (1 - Math.abs(m.rowIn)).toFixed(3));
    (root.querySelector("[data-link]") as SVGGElement | null)?.style.setProperty("opacity", m.link.toFixed(3));
    root.querySelectorAll<SVGGElement>("[data-tile]").forEach((g, k) => {
      const st = m.shortcut[k];
      const grow = m.rowIn < 0 ? 1 + m.rowIn : 1;
      const up = m.rowIn > 0 ? Math.min(1, m.rowIn + 0.08 * k) : 0;
      const gone = m.rowIn >= 0.999 || grow < 0.01;
      g.style.display = gone ? "none" : "";
      if (gone) return;
      const x = colX(k);
      const z = up * up * DROP_Z;
      const { paths, h } = tileSolid(x, ROW_Y, z, 1, grow);
      const key = `${z.toFixed(2)}|${grow.toFixed(3)}|${st.active}`;
      if (s.keys[k] !== key) {
        s.keys[k] = key;
        const accent = st.active ? `<path class="tc-accent" d="${paths.top}"/>` : "";
        g.querySelector("[data-slot]")!.innerHTML = solidSvg(paths, { tone: "mid", crease: "lo" }) + accent;
      }
      const text = g.querySelector("text")!;
      text.setAttribute("transform", tileText(x, ROW_Y, h, CHAR_SIZE));
      text.setAttribute("data-tone", st.ch === "1" ? "hi" : "mid");
      if (text.textContent !== st.ch) text.textContent = st.ch;
      text.style.opacity = (st.textOpacity * grow).toFixed(3);
    });

    // Readout: hidden in the analogy, in at the fold; the value is rust in the key hold.
    const fig = root.closest("[data-figure]") as HTMLElement | null;
    fig?.style.setProperty("--tc-table-in", m.table.toFixed(3));
    fig?.style.setProperty("--tc-table-top", `${(TABLE_TOP * 100).toFixed(2)}%`);
    if (fig) {
      const set = (sel: string, txt: string) => {
        const el = fig.querySelector(sel);
        if (el && el.textContent !== txt) el.textContent = txt;
      };
      set(".tc-rbits", m.valueBits);
      set(".tc-rval", m.valueText);
      set(".tc-rtag", m.ghost || m.stepTag || " ");
      set("[data-problem]", m.problemText);
      set("[data-path]", m.pathText);
      fig.querySelector(".tc-main")?.toggleAttribute("data-key", m.inKey);
      (fig.querySelector("[data-problem]") as HTMLElement | null)?.style.setProperty("opacity", m.problem.toFixed(3));
      (fig.querySelector("[data-path]") as HTMLElement | null)?.style.setProperty("opacity", m.path.toFixed(3));
    }
  };

  useFrameLoop((dt, reduced) => {
    state.current.t = reduced ? KEY_TIME : state.current.t + dt;
    paint();
    return !reduced;
  }, inView);
  useEffect(() => paint(), []);

  return (
    <div ref={ref} className="tc-stage">
      <Stage
        width={STAGE_W}
        height={STAGE_H}
        label="A car instrument cluster on a square board reads 0003; in reverse the odometer rolls back 2, 1, 0 and then to 9999. The board stretches long and an exposed 4-drum binary counter drops onto it at 0000. One step back rolls every drum to 1111, which is minus one; two more steps back give 1110 and 1101, minus three. In front, 0011 flips one tile at a time to 1100 and plus 1 makes 1101, the same reading. Then 5 minus 3 is 5 plus minus 3: the counter rolls forward five steps, past 0000 with a rust flash where the carry leaves the left drum, and stops at 0010, which is 2. The board folds back to the odometer."
      >
        <defs>
          <radialGradient id="tc-warm-pool">
            <stop offset="0" stopColor="#fff6c8" stopOpacity="0.45" />
            <stop offset="0.5" stopColor="#ffc21a" stopOpacity="0.1" />
            <stop offset="1" stopColor="#ffc21a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="tc-lcd-glass" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0" stopColor="#d6e5f3" />
            <stop offset="1" stopColor="#bcd3ec" />
          </linearGradient>
          <linearGradient id="tc-drum" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d9c5a0" />
            <stop offset="0.5" stopColor="#fff8ea" />
            <stop offset="1" stopColor="#d9c5a0" />
          </linearGradient>
          <linearGradient id="tc-bdrum" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1e140a" />
            <stop offset="0.5" stopColor="#3b2a1a" />
            <stop offset="1" stopColor="#1e140a" />
          </linearGradient>
          <linearGradient id="tc-drum-shade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3b2a1a" stopOpacity="0.75" />
            <stop offset="0.3" stopColor="#3b2a1a" stopOpacity="0" />
            <stop offset="0.7" stopColor="#3b2a1a" stopOpacity="0" />
            <stop offset="1" stopColor="#3b2a1a" stopOpacity="0.75" />
          </linearGradient>
          <linearGradient id="tc-chrome" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff8ea" />
            <stop offset="0.3" stopColor="#b9a47f" />
            <stop offset="0.5" stopColor="#fbf3e2" />
            <stop offset="0.75" stopColor="#8a7356" />
            <stop offset="1" stopColor="#d9c5a0" />
          </linearGradient>
          {[
            ["tc-glow-y", "#ffc21a"],
            ["tc-glow-r", "#c2402f"],
            ["tc-glow-b", "#2f6fb8"],
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
