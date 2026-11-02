"use client";

import "./badge-sketch.css";
import { useEffect, useRef } from "react";
import { useFrameLoop } from "../../iso/react/live";
import type { Vec2 } from "../../iso/iso-kit";
import { FRAME_H, FRAME_W, lampRays, lampScribble, lever, lines, flow, text } from "./geometry";
import { BOIL_FPS, DURATION, ease, progress, SHAKE, T, WOBBLE } from "./model";
import { noise, partial, squiggle } from "./sketch";

// The episode number comes from the page title ("Series badge sketch 14"), so one source builds every episode.
const episode = () => {
  const m = typeof document !== "undefined" ? document.title.match(/(\d+)\s*$/) : null;
  return (m ? m[1] : "1").padStart(2, "0");
};

const TITLE_W = 62; // board units covered by "DIGITAL ELECTRONICS" at size 5.2

function draw(group: Vec2[][], p: number, boil: number, id: number) {
  return group.map((pts, i) => squiggle(partial(pts, p), boil, id * 100 + i, WOBBLE)).join("");
}

export default function BadgeSketch() {
  const svg = useRef<SVGSVGElement>(null);
  const clock = useRef(0);

  const paint = (t: number) => {
    const root = svg.current;
    if (!root) return;
    const boil = Math.floor(t * BOIL_FPS);
    const set = (sel: string, d: string) => root.querySelector(sel)?.setAttribute("d", d);
    set("[data-board]", draw(lines.board, progress(t, T.board), boil, 1));
    set("[data-parts]", draw(lines.parts, progress(t, T.parts), boil, 2));
    set("[data-wires]", draw(lines.wires, progress(t, T.wires), boil, 3));
    const flip = ease((t - T.lever[0]) / (T.lever[1] - T.lever[0]));
    set("[data-lever]", draw(lever(-0.6 + 1.2 * flip), progress(t, [T.parts[1] - 0.2, T.parts[1]]), boil, 4));
    set("[data-flow]", draw(flow, progress(t, T.flow), boil, 5));
    const lit = progress(t, T.lamp);
    set("[data-lamp]", draw([lampScribble], lit, boil, 6));
    set("[data-rays]", draw(lampRays, progress(t, [T.lamp[1] - 0.1, T.lamp[1] + 0.15]), boil, 7));
    // Text: revealed left to right by a clip, wobbling with the boil.
    const wob = (k: number) => `translate(${(noise(boil, k, 1) * 0.35).toFixed(2)} ${(noise(boil, k, 2) * 0.35).toFixed(2)})`;
    root.querySelector("[data-title-clip]")?.setAttribute("width", (TITLE_W * progress(t, T.title)).toFixed(2));
    root.querySelector("[data-num-clip]")?.setAttribute("width", (16 * progress(t, T.number)).toFixed(2));
    root.querySelector("[data-ep-clip]")?.setAttribute("width", (16 * progress(t, T.parts)).toFixed(2));
    root.querySelector("[data-title-wob]")?.setAttribute("transform", wob(8));
    root.querySelector("[data-num-wob]")?.setAttribute("transform", wob(9));
    root.querySelector("[data-shake]")?.setAttribute("transform", `translate(${(noise(boil, 0, 3) * SHAKE).toFixed(2)} ${(noise(boil, 0, 4) * SHAKE).toFixed(2)})`);
  };

  useFrameLoop((dt) => {
    clock.current = Math.min(DURATION, clock.current + dt);
    paint(clock.current);
    return clock.current < DURATION;
  }, true);
  useEffect(() => paint(0), []);

  const ep = episode();
  return (
    <div className="bs-frame">
      <svg ref={svg} className="bs-svg" viewBox={`0 0 ${FRAME_W} ${FRAME_H}`} role="img" aria-label={`Digital Electronics, part ${Number(ep)}`}>
        <g data-shake="">
          <path className="bs-pen" data-board="" />
          <path className="bs-pen" data-parts="" />
          <path className="bs-pen bs-thin" data-wires="" />
          <path className="bs-pen" data-lever="" />
          <path className="bs-ink" data-flow="" />
          <path className="bs-ink bs-scribble" data-lamp="" />
          <path className="bs-ink" data-rays="" />
          <g transform={text.title}>
            <clipPath id="bs-title-clip">
              <rect data-title-clip="" x="-1" y="-6" width="0" height="8" />
            </clipPath>
            <g data-title-wob="">
              <text className="bs-text" fontSize="5.2" clipPath="url(#bs-title-clip)">
                DIGITAL ELECTRONICS
              </text>
            </g>
          </g>
          <g transform={text.episode}>
            <clipPath id="bs-ep-clip">
              <rect data-ep-clip="" x="-1" y="-3" width="0" height="4" />
            </clipPath>
            <text className="bs-text bs-small" fontSize="2.6" clipPath="url(#bs-ep-clip)">
              EPISODE
            </text>
          </g>
          <g transform={text.number}>
            <clipPath id="bs-num-clip">
              <rect data-num-clip="" x="-1" y="-9" width="0" height="11" />
            </clipPath>
            <g data-num-wob="">
              <text className="bs-text bs-number" fontSize="10" clipPath="url(#bs-num-clip)">
                {ep}
              </text>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
