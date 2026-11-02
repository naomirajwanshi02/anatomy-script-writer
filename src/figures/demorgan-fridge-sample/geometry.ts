// De Morgan fridge still sample: a square board (always on screen) with a French-door fridge standing on it,
// left door swung open (hinged on its left edge), right door closed, the inside light lit.
import { boxCorners, cylinder, fitView, flatCircle, flatRect, heightPx, inset, pathD, prism, prismFill, project, rectCorners, solidSvg, type Rect, type Vec2, type Vec3 } from "../../iso/iso-kit";
import { SWING } from "./model";

export const STAGE_W = 600;
const AZIMUTH = 62;
const PAD = 12;
const A = (AZIMUTH * Math.PI) / 180;
const E = (30 * Math.PI) / 180;

// Board.
const BOARD: Rect = { x: -63, y: -63, w: 126, d: 126, r: 7 };
const SLAB_H = 8;
const FOOT_H = 4;

// Fridge body: tall box on short feet, set toward the back so the open door has room on the board.
const FEET_H = 2;
const FX0 = -40;
const FX1 = 40;
const FB = -58;
const FY = -18; // body front plane
const BODY: Rect = { x: FX0, y: FB, w: FX1 - FX0, d: FY - FB, r: 2 };
const BODY_TOP = 122;
const T = 4; // door / drawer thickness, in front of the body
const DW = 40; // each French door's width
const DZ0 = 40;
const DZ1 = 121;
const DRAWER_Z0 = 4;
const DRAWER_Z1 = 38;

// Cavity behind the left door.
const WALL = 3;
const CX0 = FX0 + WALL;
const CX1 = FX1 - WALL;
const CY0 = FB + WALL;
const CZ0 = 42;
const CZ1 = BODY_TOP - WALL;
const SHELF_Z = [68, 94];
const SHELF_H = 1.2;

// Door hinge and swing.
const th = (SWING * Math.PI) / 180;
const c = Math.cos(th);
const s = Math.sin(th);
const H: Vec2 = [FX0, FY + T]; // hinge: front-left corner of the closed door
// Door point: u along the door width (0 hinge .. DW free edge), v across its thickness (-T inner .. 0 outer).
const dp = (u: number, v: number, z: number): Vec3 => [H[0] + u * c - v * s, H[1] + u * s + v * c, z];

// Stage: fit the board, fridge and open door to the width, then size the height to match.
const PTS: Vec3[] = [...boxCorners(BOARD, -SLAB_H - FOOT_H, 0), ...boxCorners(BODY, 0, BODY_TOP + 2), dp(DW, 0, DZ1), dp(DW, -T, DZ0), dp(DW + 2, 6, DZ0)];
const tall = fitView(PTS, STAGE_W, 4000, { pad: PAD, azimuth: AZIMUTH });
const ys = PTS.map((p) => project(p, tall)[1]);
export const STAGE_H = Math.ceil(Math.max(...ys) - Math.min(...ys) + PAD * 2);
export const view = fitView(PTS, STAGE_W, STAGE_H, { pad: PAD, azimuth: AZIMUTH });

const at = (p: Vec3) => project(p, view);
const r3 = (v: number) => Math.round(v * 1e3) / 1e3;
const poly = (pts: Vec3[]) => pathD(pts.map(at), true);
const line = (a: Vec3, b: Vec3) => pathD([at(a), at(b)]);

// Text on a front face (+y), reading along +x, upright along +z.
const frontMatrix = (p: Vec3) => {
  const o = at(p);
  const ax = at([p[0] + 1, p[1], p[2]]);
  const az = at([p[0], p[1], p[2] - 1]);
  return `matrix(${r3(ax[0] - o[0])} ${r3(ax[1] - o[1])} ${r3(az[0] - o[0])} ${r3(az[1] - o[1])} ${r3(o[0])} ${r3(o[1])})`;
};
const frontRect = (x0: number, z0: number, x1: number, z1: number, y: number) =>
  poly([
    [x0, y, z0],
    [x1, y, z0],
    [x1, y, z1],
    [x0, y, z1],
  ]);

// Engraving on the board's front face (+y), centred, upright.
export const ENGRAVE = "ROLLIN-रोलिन-ROLLIN-रोलिन";
export const ENGRAVE_SIZE = 3.6;
export const boardEngrave = frontMatrix([BOARD.x + BOARD.w / 2, BOARD.y + BOARD.d, -SLAB_H / 2 - ENGRAVE_SIZE * 0.36]);

const depth = ([x, y, z]: Vec3) => (x * Math.cos(A) + y * Math.sin(A)) * Math.cos(E) + z * Math.sin(E);
const backToFront = (pts: Vec2[]) => [...pts].sort((p, q) => depth([p[0], p[1], 0]) - depth([q[0], q[1], 0]));

export const boardSvg = (() => {
  const b = BOARD;
  const feet = backToFront(rectCorners(b, 14))
    .map(([x, y]) => solidSvg(cylinder(x, y, 5, -SLAB_H - FOOT_H, FOOT_H, view, 24, 0.4), { tone: "lo" }))
    .join("");
  const rings = rectCorners(b, 7)
    .map(([x, y]) => flatCircle(x, y, 1.8, 0, view, 14))
    .join("");
  const screws = rectCorners(b, 7)
    .map(([x, y]) => {
      const [sx, sy] = at([x, y, 0]);
      return `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="0.5"/>`;
    })
    .join("");
  return (
    `<path class="iso-halo" d="${prismFill(b, -SLAB_H - FOOT_H, SLAB_H, view)}"/>` +
    feet +
    solidSvg(prism(b, -SLAB_H, SLAB_H, view, 6, 1.2), { tone: "mid" }) +
    `<path class="iso-line" data-tone="lo" d="${flatRect(inset(b, 3.5), 0, view)}"/>` +
    `<path class="iso-line" data-tone="lo" d="${rings}"/>` +
    `<g class="iso-dots" data-tone="mid">${screws}</g>`
  );
})();

// Board top outline (clip for the shade vignette and the light fan).
export const boardTop = flatRect(BOARD, 0, view);
// Warm shade vignette on the board around the fridge, fading out over about a fridge width.
const shadeC = at([0, (FB + FY) / 2, 0]);
export const shade = { cx: shadeC[0], cy: shadeC[1], r: Math.hypot(...([0, 1].map((i) => at([FX1 + 50, FY + 50, 0])[i] - shadeC[i]) as [number, number])) };
// White light fanning out of the door opening across the board: narrow at the opening, wide at the board front.
export const fan = poly([
  [CX0, FY, 0.05],
  [0, FY, 0.05],
  [24, BOARD.y + BOARD.d, 0.05],
  [-60, BOARD.y + BOARD.d, 0.05],
  [-48, FY + 30, 0.05],
]);
const fanC = at([CX0 / 2, FY, 0]);
export const fanGlow = { cx: fanC[0], cy: fanC[1], r: Math.hypot(...([0, 1].map((i) => at([-20, BOARD.y + BOARD.d + 6, 0])[i] - fanC[i]) as [number, number])) };

// Inside light: LED strips (a bar under the ceiling at the front, a vertical strip on each side wall near the front).
// The right wall's strip sits behind the closed right door, so only the left one shows.
const LED = 2.2;
const CEIL = LED * 2; // ceiling bar, on the front lip of the ceiling
export const leds = {
  ceiling: frontRect(CX0, CZ1 - CEIL, CX1, CZ1, FY - 0.3),
  left: poly([
    [CX0 + 0.05, FY - 4, CZ0 + 4],
    [CX0 + 0.05, FY - 4 + LED, CZ0 + 4],
    [CX0 + 0.05, FY - 4 + LED, CZ1 - 4],
    [CX0 + 0.05, FY - 4, CZ1 - 4],
  ]),
  right: poly([
    [CX1 - 0.05, FY - 4, CZ0 + 4],
    [CX1 - 0.05, FY - 4 + LED, CZ0 + 4],
    [CX1 - 0.05, FY - 4 + LED, CZ1 - 4],
    [CX1 - 0.05, FY - 4, CZ1 - 4],
  ]),
};
// Soft white glow filling the cavity from the front top (where the LEDs are).
const glowC = at([(CX0 + 0) / 2, FY - 4, CZ1 - 10]);
// Bright front edge on each shelf where the light hits.
export const shelfEdges = SHELF_Z.map((z) => line([CX0, FY - 1, z + SHELF_H], [CX1, FY - 1, z + SHELF_H])).join("");
export const innerGlow = { cx: glowC[0], cy: glowC[1], r: heightPx(60, view) };

const RD = FY + T + 0.05; // right door / drawer front plane
export const BRAND_SIZE = 3.6;

export const fridge = {
  halo: prismFill({ x: FX0 - 2, y: FB - 2, w: FX1 - FX0 + 4, d: FY - FB + T + 4, r: 4 }, 0, 0.1, view),
  feet: backToFront(rectCorners(BODY, 4)).map(([x, y]) => cylinder(x, y, 2.4, 0, FEET_H, view, 16, 0.4)),
  body: prism(BODY, FEET_H, BODY_TOP - FEET_H, view, 4, 0.8),
  // Cavity: opening on the body front, then back wall, left wall and floor (the only inner faces the camera sees).
  opening: frontRect(CX0, CZ0, CX1, CZ1, FY + 0.05),
  back: frontRect(CX0, CZ0, CX1, CZ1, CY0),
  left: poly([
    [CX0, CY0, CZ0],
    [CX0, FY, CZ0],
    [CX0, FY, CZ1],
    [CX0, CY0, CZ1],
  ]),
  floor: poly([
    [CX0, CY0, CZ0],
    [CX1, CY0, CZ0],
    [CX1, FY, CZ0],
    [CX0, FY, CZ0],
  ]),
  shelves: SHELF_Z.map((z) => prism({ x: CX0, y: CY0, w: CX1 - CX0, d: FY - 1 - CY0, r: 0 }, z, SHELF_H, view, 2, 0)),
  // A carton on the floor and a bottle on the lower shelf.
  carton: prism({ x: CX0 + 16, y: FY - 18, w: 10, d: 10, r: 0.6 }, CZ0, 14, view, 2, 0.4),
  bottle: cylinder(CX0 + 7, FY - 12, 3.2, SHELF_Z[0] + SHELF_H, 16, view, 20, 0.4),
  bottleNeck: cylinder(CX0 + 7, FY - 12, 1.3, SHELF_Z[0] + SHELF_H + 16, 4, view, 14, 0.2),
  // Closed right door and the freezer drawer, both in front of the body.
  rightDoor: prism({ x: 0.4, y: FY, w: FX1 - 0.4, d: T, r: 0.8 }, DZ0, DZ1 - DZ0, view, 2, 0.4),
  drawer: prism({ x: FX0, y: FY, w: FX1 - FX0, d: T, r: 0.8 }, DRAWER_Z0, DRAWER_Z1 - DRAWER_Z0, view, 2, 0.4),
  // Handles: bar + two standoffs.
  rightHandle: line([4.5, RD + 3.4, 62], [4.5, RD + 3.4, 100]),
  rightStand: line([4.5, RD, 65], [4.5, RD + 3.4, 65]) + line([4.5, RD, 97], [4.5, RD + 3.4, 97]),
  drawerHandle: line([-26, RD + 3.4, 32], [26, RD + 3.4, 32]),
  drawerStand: line([-23, RD, 32], [-23, RD + 3.4, 32]) + line([23, RD, 32], [23, RD + 3.4, 32]),
  // Maker's badge on the closed right door.
  plate: frontRect(9, 109, 35, 116, RD + 0.02),
  brand: frontMatrix([22, RD + 0.06, 112.5 - BRAND_SIZE * 0.36]),
};

// Open left door: inner face, free edge, top and gasket; handle behind the free edge.
const IN = -T - 0.05;
export const door = {
  inner: poly([dp(0, -T, DZ0), dp(DW, -T, DZ0), dp(DW, -T, DZ1), dp(0, -T, DZ1)]),
  edge: poly([dp(DW, -T, DZ0), dp(DW, 0, DZ0), dp(DW, 0, DZ1), dp(DW, -T, DZ1)]),
  top: poly([dp(0, -T, DZ1), dp(DW, -T, DZ1), dp(DW, 0, DZ1), dp(0, 0, DZ1)]),
  gasket: poly([dp(2.5, IN, DZ0 + 2.5), dp(DW - 2.5, IN, DZ0 + 2.5), dp(DW - 2.5, IN, DZ1 - 2.5), dp(2.5, IN, DZ1 - 2.5)]),
  handle: line(dp(DW - 4.5, 3.4, 62), dp(DW - 4.5, 3.4, 100)),
  stand: line(dp(DW - 4.5, 0, 65), dp(DW - 4.5, 3.4, 65)) + line(dp(DW - 4.5, 0, 97), dp(DW - 4.5, 3.4, 97)),
};

// Entrance spark points: the fridge corners.
export const contacts = rectCorners(BODY, 2).map(([x, y]) => at([x, y, 0]));
