"use client";

import "./badge-plane.css";
import { useEffect, useRef } from "react";
import { pathD, type Vec2 } from "../../iso/iso-kit";
import { Solid } from "../../iso/react/draw";
import { useFrameLoop } from "../../iso/react/live";
import { at, BANNER, FRAME_H, FRAME_W, OFF_LEFT, OFF_RIGHT, PARK, plane, TEXT } from "./geometry";
import { BOB, DURATION, flyOffset, PROP_HZ } from "./model";

// The episode number comes from the page title ("Series badge plane 14"), so one source builds every episode.
const episode = () => {
  const m = typeof document !== "undefined" ? document.title.match(/(\d+)\s*$/) : null;
  return (m ? m[1] : "1").padStart(2, "0");
};

const f1 = (v: number) => v.toFixed(1);
const origin = at([0, 0, 0]);

// Cloth flap (board units along y): grows toward the trailing end and travels back from the rope.
const flap = (x: number, t: number) => {
  const d = BANNER.front - x;
  return BANNER.amp * (0.25 + (0.75 * d) / BANNER.len) * Math.sin(BANNER.k * d - BANNER.speed * t);
};

// Shade of a cloth strip from its slope: turned toward the light reads lighter, away darker.
const shadeOf = (slope: number) => (slope > 0.12 ? "top" : slope > 0 ? "face" : slope > -0.12 ? "s2" : "s1");

export default function BadgePlane() {
  const svg = useRef<SVGSVGElement>(null);
  const clock = useRef(0);
  const ep = episode();
  const chars = [...TEXT.title, ...TEXT.sep, ...ep];
  const adv = TEXT.size * TEXT.advance;
  const zc = (BANNER.z0 + BANNER.z1) / 2;
  const numFrom = TEXT.title.length + TEXT.sep.length;
  const strips = Math.ceil(BANNER.len / BANNER.step);

  const paint = (t: number) => {
    const root = svg.current;
    if (!root) return;
    const set = (sel: string, k: string, v: string) => root.querySelector(sel)?.setAttribute(k, v);

    // Fly along the board x axis (the camera's diagonal), then bob a little in the air.
    const off = flyOffset(t, OFF_LEFT, OFF_RIGHT);
    const o = at([off, 0, 0]);
    set("[data-rig]", "transform", `translate(${f1(PARK[0] + o[0] - origin[0])} ${f1(PARK[1] + o[1] - origin[1])})`);
    const ph = 2 * Math.PI * BOB.hz * t;
    set("[data-plane]", "transform", `translate(0 ${f1(BOB.y * Math.sin(ph))})`);
    const lag = BOB.y * 0.6 * Math.sin(ph - 0.9);
    set("[data-cloth]", "transform", `translate(0 ${f1(lag)})`);

    // Cloth strips and outline.
    const xs = Array.from({ length: strips + 1 }, (_, i) => BANNER.front - (BANNER.len * i) / strips);
    const ys = xs.map((x) => flap(x, t));
    root.querySelectorAll("[data-strip]").forEach((el, i) => {
      const [xa, xb, ya, yb] = [xs[i], xs[i + 1], ys[i], ys[i + 1]];
      el.setAttribute("d", pathD([at([xa, ya, BANNER.z0]), at([xb, yb, BANNER.z0]), at([xb, yb, BANNER.z1]), at([xa, ya, BANNER.z1])], true));
      el.setAttribute("data-shade", shadeOf((yb - ya) / (xa - xb)));
    });
    const top = xs.map((x, i) => at([x, ys[i], BANNER.z1]));
    const bottom = xs.map((x, i) => at([x, ys[i], BANNER.z0])).reverse();
    set("[data-edge]", "d", pathD([...top, ...bottom], true));
    const hem = (z: number) => pathD(xs.map((x, i) => at([x, ys[i] + 0.05, z])));
    set("[data-hem]", "d", hem(BANNER.z1 - 2.2) + hem(BANNER.z0 + 2.2));
    const fy = ys[0];
    set("[data-pole]", "d", pathD([at([BANNER.front, fy, BANNER.z0 - 2.5]), at([BANNER.front, fy, BANNER.z1 + 2.5])]));

    // Letters lie on the cloth: each one gets the local cloth axes as its matrix.
    root.querySelectorAll("[data-ch]").forEach((el, i) => {
      const xi = BANNER.front - BANNER.len / 2 - (chars.length * adv) / 2 + (i + 0.5) * adv;
      const y = flap(xi, t) + 0.1;
      const p = at([xi, y, zc]);
      const u = at([xi + 1, flap(xi + 1, t) + 0.1, zc]);
      const v = at([xi, y, zc - 1]);
      el.setAttribute("transform", `matrix(${(u[0] - p[0]).toFixed(3)} ${(u[1] - p[1]).toFixed(3)} ${(v[0] - p[0]).toFixed(3)} ${(v[1] - p[1]).toFixed(3)} ${f1(p[0])} ${f1(p[1])})`);
    });

    // Tow rope bridle: hook to the top and bottom of the pole, sagging a little.
    const hook = at(plane.towHook);
    const hookY = hook[1] + BOB.y * Math.sin(ph) - lag;
    const pt = at([BANNER.front, fy, BANNER.z1 + 1]);
    const pb = at([BANNER.front, fy, BANNER.z0 - 1]);
    const q = (p: Vec2) => `M${f1(hook[0])} ${f1(hookY)}Q${f1((hook[0] + p[0]) / 2)} ${f1((hookY + p[1]) / 2 + 6)} ${f1(p[0])} ${f1(p[1])}`;
    set("[data-rope]", "d", q(pt) + q(pb));

    // Propeller blade turning in the yz plane over a faint disc.
    const a = 2 * Math.PI * PROP_HZ * t;
    const [hx, hy, hz] = plane.hub;
    const r = plane.propR;
    set("[data-blade]", "d", pathD([at([hx, hy + r * Math.sin(a), hz + r * Math.cos(a)]), at([hx, hy - r * Math.sin(a), hz - r * Math.cos(a)])]));
  };

  useFrameLoop((dt) => {
    clock.current = Math.min(DURATION, clock.current + dt);
    paint(clock.current);
    return clock.current < DURATION;
  }, true);
  useEffect(() => paint(0), []);

  const P = plane;
  return (
    <div className="iso bp bp-frame" data-theme="sepia">
      <svg ref={svg} className="bp-svg" viewBox={`0 0 ${FRAME_W} ${FRAME_H}`} role="img" aria-label={`Digital Electronics, episode ${Number(ep)}`}>
        <g data-rig="" transform={`translate(-2000 0)`}>
          <g data-cloth="">
            {Array.from({ length: strips }, (_, i) => (
              <path key={i} className="bp-strip" data-strip="" />
            ))}
            <path className="iso-line bp-hem" data-hem="" />
            <path className="iso-line bp-edge" data-edge="" />
            {chars.map((ch, i) => (
              <text key={i} data-ch="" className={i >= numFrom ? "bp-ch bp-num" : "bp-ch"} fontSize={TEXT.size} textAnchor="middle" dy={TEXT.size * 0.36}>
                {ch}
              </text>
            ))}
            <path className="iso-line bp-pole" data-pole="" />
          </g>
          <path className="iso-line bp-rope" data-rope="" />
          <g data-plane="">
            <path className="iso-line bp-gear" d={P.farGear} />
            <path className="bp-tire" d={P.farWheel} />
            <path className="iso-line bp-gear" d={P.tailStrut} />
            <path className="bp-tire" d={P.tailWheel} />
            <Solid paths={P.rear2} tone="hi" crease="lo" />
            <Solid paths={P.stab} tone="hi" crease="lo" />
            <Solid paths={P.fin} tone="hi" crease="lo" />
            <Solid paths={P.rear1} tone="hi" crease="lo" />
            <Solid paths={P.cabin} tone="hi" crease="lo" />
            <path className="bp-glass" d={P.window} />
            <path className="iso-line" data-tone="hi" d={P.windowBar} />
            <path className="iso-line bp-stripe" d={P.stripe} />
            <Solid paths={P.wing} tone="hi" crease="lo" />
            <Solid paths={P.cowl} tone="hi" crease="lo" />
            <Solid paths={P.spinner} tone="hi" crease="lo" />
            <path className="iso-line bp-gear" d={P.nearGear} />
            <path className="bp-tire" d={P.nearWheel} />
            <path className="bp-hub" d={P.nearHub} />
            <path className="bp-disc" d={P.disc} />
            <path className="iso-line bp-blade" data-blade="" />
          </g>
        </g>
      </svg>
    </div>
  );
}
