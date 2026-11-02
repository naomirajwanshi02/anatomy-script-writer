"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ENTRY, loopTime, sparkAt, SPARKS_PER_POINT } from "../../iso/entrance";
import { paintEntry } from "../../iso/react/reel";
import { approach, useFrameLoop, useInView } from "../../iso/react/live";
import { BulbGlowDef } from "../../iso/react/bulb";
import { Stage } from "../../iso/react/draw";
import { contacts, knobAt, knobTransform, landPoints, LEVER_A, rodPath, STAGE_H, STAGE_W, WIRES } from "./geometry";
import { KEY_TIME, landAt, LOOP, partsAt, readoutAt, stateAt, wireShown } from "./model";

const LAMPS = ["y", "z"] as const;
const PARTS = ["cpu", "and", "not"] as const;

// The one loop: writes the lever, CPU and gate drops, landing sparks, wires, lamps and the code readout from the model.
export function RecipeMapLive({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const state = useRef({ t: 0, lever: 1, lamp: { y: 0, z: 0 } });

  const paint = (dt: number, reduced: boolean) => {
    const root = ref.current;
    if (!root) return;
    const s = state.current;
    paintEntry(root, s.t, contacts);
    const lt = loopTime(s.t, LOOP);
    const p = stateAt(lt);
    const fig = (root.closest("[data-figure]") ?? root) as HTMLElement;

    const parts = partsAt(lt);
    for (const k of PARTS) {
      const el = root.querySelector(`[data-part="${k}"]`) as SVGGElement | null;
      const y = parts[k];
      if (el) {
        el.style.display = y === null ? "none" : "";
        el.setAttribute("transform", `translate(0 ${(y ?? 0).toFixed(2)})`);
      }
      // Landing sparks, timed like the entrance sparks but from this part's landing.
      const pts = landPoints[k];
      root.querySelectorAll(`[data-land="${k}"] [data-lspark]`).forEach((line, i) => {
        const sp = sparkAt(lt - landAt[k] + ENTRY.contact, pts[Math.floor(i / SPARKS_PER_POINT) % pts.length], i);
        if (!sp) return void line.setAttribute("opacity", "0");
        line.setAttribute("x1", sp.tail[0].toFixed(1));
        line.setAttribute("y1", sp.tail[1].toFixed(1));
        line.setAttribute("x2", sp.head[0].toFixed(1));
        line.setAttribute("y2", sp.head[1].toFixed(1));
        line.setAttribute("opacity", sp.opacity.toFixed(2));
        line.setAttribute("data-hot", sp.hot ? "1" : "0");
      });
    }

    const ro = readoutAt(lt);
    const head = fig.querySelector("[data-head]");
    if (head && head.textContent !== ro.header) head.textContent = ro.header;
    fig.querySelectorAll<HTMLElement>("[data-line]").forEach((el, i) => {
      el.setAttribute("data-rust", ro.rust[i] ? "1" : "0");
      const ptr = el.querySelector("[data-ptr]");
      if (ptr) ptr.textContent = ro.pointer === i ? "▶" : "";
      const text = el.querySelector("[data-text]");
      if (text && text.textContent !== ro.lines[i]) text.textContent = ro.lines[i];
      el.querySelector("[data-cursor]")?.setAttribute("data-on", ro.cursorLine === i && ro.cursorOn ? "1" : "0");
    });

    s.lever = approach(s.lever, p.a ? -1 : 1, dt, 0.07, reduced);
    const lever = root.querySelector('[data-lever="a"]');
    lever?.querySelector("[data-rod]")?.setAttribute("d", rodPath(LEVER_A, s.lever));
    lever?.querySelector("[data-knob]")?.setAttribute("transform", knobTransform(knobAt(LEVER_A, s.lever)));

    root.querySelectorAll<SVGGElement>("[data-wire]").forEach((el) => {
      const w = WIRES.find((x) => x.id === el.dataset.wire)!;
      const shown = wireShown(lt, w.group);
      el.setAttribute("data-show", shown ? "1" : "0");
      el.setAttribute("data-on", shown && p[w.net] ? "1" : "0");
    });
    for (const k of LAMPS) {
      s.lamp[k] = approach(s.lamp[k], p[k], dt, 0.08, reduced);
      (root.querySelector(`[data-lamp="${k}"]`) as HTMLElement | null)?.style.setProperty("--lamp", s.lamp[k].toFixed(3));
    }
  };

  useFrameLoop((dt, reduced) => {
    state.current.t = reduced ? KEY_TIME : state.current.t + dt;
    paint(dt, reduced);
    return !reduced;
  }, inView);
  useEffect(() => paint(0, true), []);

  return (
    <div ref={ref} className="rm-stage">
      <Stage
        width={STAGE_W}
        height={STAGE_H}
        label="Verilog versus a programming language. First C code runs on a CPU one line at a time: lamp Y changes when line 1 runs and lamp Z only when line 2 runs. Then the same logic is written in Verilog: each assign line becomes its own gate, an AND gate for Y and a NOT gate for Z, and both work at once, so when lever A flips, Y and Z change together one gate delay later."
      >
        <defs>
          <BulbGlowDef id="rm-glow" />
        </defs>
        {children}
      </Stage>
    </div>
  );
}
