// Badge board in the full 1080x1920 frame: lever, lamp and an episode display on a small board.
import { boxCorners, cylinder, faceMatrix, fitView, flatCircle, flatPath, flatRect, inset, prism, project, type Rect, type Vec2, type Vec3 } from "../../iso/iso-kit";
import { parseD, resample, type Poly } from "./sketch";

export const FRAME_W = 1080;
export const FRAME_H = 1920;

const BOARD: Rect = { x: -60, y: -20, w: 120, d: 40, r: 3 };
const LEVER_BASE: Rect = { x: -52, y: -6, w: 12, d: 12, r: 1.5 };
export const PIVOT: Vec3 = [-46, 0, 3];
const LAMP = { x: -14, y: 0, r: 4.5, h: 5 };
const DISPLAY: Rect = { x: 14, y: -10, w: 36, d: 20, r: 2 };
const DISPLAY_H = 2.5;

export const view = fitView(boxCorners(BOARD, -4, 14), FRAME_W, FRAME_H, { pad: 90, azimuth: 62 });

const strokes = (d: string): Vec2[][] => parseD(d).map((p: Poly) => resample(p));

const slab = prism(BOARD, -4, 4, view, 6);
const leverBase = prism(LEVER_BASE, 0, 3, view, 4);
const lamp = cylinder(LAMP.x, LAMP.y, LAMP.r, 0, LAMP.h, view, 28);
const display = prism(DISPLAY, 0, DISPLAY_H, view, 4);

// Each group is a list of polylines drawn together with one progress value.
export const lines = {
  board: [...strokes(slab.outline), ...strokes(slab.crease), ...strokes(flatRect(inset(BOARD, 3), 0, view, 6))],
  parts: [
    ...strokes(leverBase.outline),
    ...strokes(leverBase.crease),
    ...strokes(lamp.outline),
    ...strokes(lamp.crease),
    ...strokes(display.outline),
    ...strokes(display.crease),
    ...strokes(flatRect(inset(DISPLAY, 2), DISPLAY_H, view, 4)),
  ],
  wires: [
    ...strokes(
      flatPath(
        [
          [-40, 0],
          [LAMP.x - LAMP.r, 0],
        ],
        0,
        view,
      ),
    ),
    ...strokes(
      flatPath(
        [
          [LAMP.x + LAMP.r, 0],
          [DISPLAY.x, 0],
        ],
        0,
        view,
      ),
    ),
  ],
};

// Lever rod from the pivot to the knob; a = -0.6 (up, 0) to +0.6 (pulled, 1).
export function lever(a: number) {
  const knob: Vec3 = [PIVOT[0], PIVOT[1] + Math.sin(a) * 12, PIVOT[2] + Math.cos(a) * 12];
  return [
    resample({ pts: [project(PIVOT, view), project(knob, view)], closed: false }),
    ...strokes(flatCircle(knob[0], knob[1], 2.4, knob[2], view, 16)),
  ];
}

// Hand scribble that fills the lamp top, plus four short rays once it is lit.
const top = LAMP.h;
export const lampScribble: Vec2[] = (() => {
  const pts: Vec2[] = [];
  const n = 11;
  for (let j = 0; j <= n; j++) {
    const x = LAMP.x - LAMP.r * 0.8 + (1.6 * LAMP.r * j) / n;
    const half = Math.sqrt(Math.max(0, LAMP.r ** 2 - (x - LAMP.x) ** 2)) * 0.8;
    pts.push(project([x, LAMP.y + (j % 2 ? half : -half), top], view));
  }
  return resample({ pts, closed: false }, 5);
})();

export const lampRays: Vec2[][] = [-1.9, -1.2, -0.5, 0.2].map((a) => {
  const [cx, cy] = project([LAMP.x, LAMP.y, top + 2], view);
  const k = view.scale;
  const r0 = 7 * k;
  const r1 = 11 * k;
  return resample(
    {
      pts: [
        [cx + Math.cos(a) * r0, cy + Math.sin(a) * r0],
        [cx + Math.cos(a) * r1, cy + Math.sin(a) * r1],
      ],
      closed: false,
    },
    5,
  );
});

export const flow = lines.wires;

export const text = {
  title: faceMatrix([-56, 15], 0, view, "x"),
  episode: faceMatrix([18, -4.5], DISPLAY_H, view, "x"),
  number: faceMatrix([19, 7], DISPLAY_H, view, "x"),
};
