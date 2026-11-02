"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ENTRY, loopTime, sparkAt, SPARKS_PER_POINT } from "../../iso/entrance";
import { paintEntry } from "../../iso/react/reel";
import { approach, useFrameLoop, useInView } from "../../iso/react/live";
import { BulbGlowDef } from "../../iso/react/bulb";
import { Stage } from "../../iso/react/draw";
import { contacts, knobAt, knobTransform, landPoints, LEVERS, rodPath, STAGE_H, STAGE_W, WIRES, type LeverId } from "./geometry";
import { B, clkLever, KEY_TIME, landAt, LOOP, PARTS, partsAt, readoutAt, stateAt, wireShown } from "./model";


// The one loop: writes levers, flip-flop and AND drops and lifts, landing sparks, wires, lamp q and the code readout.
export function RtlLive({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const state = useRef({ t: 0, a: 1, lamp: 0 });

  const paint = (dt: number, reduced: boolean) => {
    const root = ref.current;
    if (!root) return;
    const s = state.current;
    paintEntry(root, s.t, contacts);
    const lt = loopTime(s.t, LOOP);
    const p = stateAt(lt);
    const fig = (root.closest("[data-figure]") ?? root) as HTMLElement;

    const offsets = partsAt(lt);
    for (const k of PARTS) {
      const el = root.querySelector(`[data-part="${k}"]`) as SVGGElement | null;
      const y = offsets[k];
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
    fig.querySelectorAll<HTMLElement>("[data-line]").forEach((el, i) => {
      el.querySelectorAll<HTMLElement>("[data-seg]").forEach((seg, j) => {
        const v = ro.segs[i][j];
        if (seg.textContent !== v.text) seg.textContent = v.text;
        seg.setAttribute("data-rust", v.rust ? "1" : "0");
      });
      el.querySelector("[data-cursor]")?.setAttribute("data-on", ro.cursorLine === i && ro.cursorOn ? "1" : "0");
    });

    // A eases toward its value; B is fixed; clk follows its own clock from the model.
    s.a = approach(s.a, p.a ? -1 : 1, dt, 0.07, reduced);
    const pos: Record<LeverId, number> = { a: s.a, b: B ? -1 : 1, clk: clkLever(lt) };
    for (const k of Object.keys(LEVERS) as LeverId[]) {
      const el = root.querySelector(`[data-lever="${k}"]`);
      el?.querySelector("[data-rod]")?.setAttribute("d", rodPath(LEVERS[k], pos[k]));
      el?.querySelector("[data-knob]")?.setAttribute("transform", knobTransform(knobAt(LEVERS[k], pos[k])));
    }

    root.querySelectorAll<SVGGElement>("[data-wire]").forEach((el) => {
      const w = WIRES.find((x) => x.id === el.dataset.wire)!;
      const shown = wireShown(lt, w.part);
      el.setAttribute("data-show", shown ? "1" : "0");
      el.setAttribute("data-on", shown && p[w.net] ? "1" : "0");
    });
    s.lamp = approach(s.lamp, p.q, dt, 0.08, reduced);
    (root.querySelector('[data-lamp="q"]') as HTMLElement | null)?.style.setProperty("--lamp", s.lamp.toFixed(3));
  };

  useFrameLoop((dt, reduced) => {
    state.current.t = reduced ? KEY_TIME : state.current.t + dt;
    paint(dt, reduced);
    return !reduced;
  }, inView);
  useEffect(() => paint(0, true), []);

  return (
    <div ref={ref} className="rt-stage">
      <Stage
        width={STAGE_W}
        height={STAGE_H}
        label="RTL and logic synthesis. An always block with two registers is typed: on each rising clock edge r1 takes a, and q takes r1 AND b. Synthesis builds it as flip-flop r1, an AND gate and flip-flop q. When lever A goes to 1, r1 picks it up at the next rising edge, the AND passes it one gate delay later, and q and its lamp take it only at the edge after that, so the value hops one register per clock edge. Going back to 0 hops the same way."
      >
        <defs>
          <BulbGlowDef id="rt-glow" />
        </defs>
        {children}
      </Stage>
    </div>
  );
}
