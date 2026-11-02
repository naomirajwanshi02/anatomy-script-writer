// Banner-plane badge in the full 1080x1920 frame, drawn with the board kit: isometric solids at azimuth 62,
// four-tone sepia shading. Board units: x along the flight (nose at x = 0), +y toward the viewer, z up.
// The plane is a wooden toy taildragger built from boxes; the banner is a vertical cloth trailing along -x.
import { pathD, prism, project, type Rect, type Vec2, type Vec3, type View } from "../../iso/iso-kit";

export const FRAME_W = 1080;
export const FRAME_H = 1920;

// Camera: no fitView; the rig is placed by translating its origin (the nose) to PARK.
export const view: View = { origin: [0, 0], scale: 1.9, azimuth: 62, elevation: 30 };
export const PARK: Vec2 = [1030, 490]; // nose when parked: top-right edge, below Instagram's top bar
export const OFF_LEFT = 540; // board units back along -x where the fly-in starts (rig fully off-frame)
export const OFF_RIGHT = 400; // board units along +x where the fly-off ends (banner off the right edge)

export const at = (p: Vec3) => project(p, view);
const box = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, r = 0.8) =>
  prism({ x: x0, y: y0, w: x1 - x0, d: y1 - y0, r } as Rect, z0, z1 - z0, view, 4, 0.3);

// A circle in a vertical plane: "xz" (wheel, facing +y) or "yz" (propeller disc, facing +x).
const ring = (c: Vec3, r: number, plane: "xz" | "yz", n = 28) =>
  pathD(
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      return at(plane === "xz" ? [c[0] + r * Math.cos(a), c[1], c[2] + r * Math.sin(a)] : [c[0], c[1] + r * Math.cos(a), c[2] + r * Math.sin(a)]);
    }),
    true,
  );
const seg = (a: Vec3, b: Vec3) => pathD([at(a), at(b)]);

// Plane parts, listed in paint order (far to near).
export const plane = {
  farGear: seg([-14, -5.6, 0], [-12, -9, -7]),
  farWheel: ring([-12, -9.6, -8], 3.6, "xz"),
  tailWheel: ring([-74, 0, 2.2], 1.5, "xz"),
  tailStrut: seg([-73, 0, 4.4], [-74, 0, 2.2]),
  rear2: box(-78, -52, -2.4, 2.4, 4, 8.4, 0.6),
  stab: box(-82, -70, -13, 13, 8.4, 9.3, 0.8),
  fin: box(-82, -73, -0.7, 0.7, 9.3, 21, 0.3),
  rear1: box(-52, -26, -4.2, 4.2, 2, 10.5, 0.9),
  cabin: box(-26, 0, -6, 6, 0, 12, 1.4),
  window: pathD([at([-22, 6.05, 6]), at([-7, 6.05, 6]), at([-5, 6.05, 10.6]), at([-22, 6.05, 10.6])], true),
  windowBar: seg([-14, 6.06, 6], [-14, 6.06, 10.6]),
  stripe: pathD([at([-76, 2.45, 6.4]), at([-52, 4.25, 6.4]), at([-26, 6.05, 7.2]), at([-1, 6.05, 7.2])]),
  wing: box(-25, -6, -27, 27, 12, 13.6, 1),
  cowl: box(0, 5, -5.4, 5.4, 1, 11, 2.2),
  spinner: box(5, 8.4, -1.8, 1.8, 4.2, 7.8, 1.3),
  nearGear: seg([-14, 5.6, 0], [-12, 9, -7]),
  nearWheel: ring([-12, 9.6, -8], 3.6, "xz"),
  nearHub: ring([-12, 9.65, -8], 1.2, "xz"),
  disc: ring([9, 0, 6], 11, "yz", 36),
  hub: [9, 0, 6] as Vec3,
  propR: 11,
  towHook: [-80, 0, 6] as Vec3,
};

// Banner: a vertical cloth in the xz plane, flapping in y, trailing behind a rope.
export const BANNER = { front: -112, len: 210, z0: -7, z1: 19, step: 6, amp: 3.2, k: 0.055, speed: 5.5 };
export const TEXT = { size: 11.5, advance: 0.62, title: "DIGITAL ELECTRONICS", sep: " · EP " };
