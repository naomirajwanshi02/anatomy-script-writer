// Parity wash still sample: a square board (always on screen) with a front-loading washing machine standing on it,
// a laundry tray of socks in front, and a callout plate on the board's front right.
import {
  boxCorners,
  cylinder,
  faceMatrix,
  fitView,
  flatCircle,
  flatRect,
  inset,
  pathD,
  prism,
  prismFill,
  project,
  rectCorners,
  solidSvg,
  type Rect,
  type SolidPaths,
  type Vec2,
  type Vec3,
} from "../../iso/iso-kit";
import { SLOTS, SOCKS_OUT } from "./model";

export const STAGE_W = 600;
const AZIMUTH = 62;
const PAD = 12;
const A = (AZIMUTH * Math.PI) / 180;
const E = (30 * Math.PI) / 180;

// Board.
const BOARD: Rect = { x: -63, y: -63, w: 126, d: 126, r: 7 };
const SLAB_H = 8;
const FOOT_H = 4;

// Washing machine (board units): cabinet on four short feet, front face at y = FRONT_Y.
const FEET_H = 2.4;
const CAB: Rect = { x: -34, y: -50, w: 68, d: 42, r: 4 };
const CAB_H = 78;
const FRONT_Y = CAB.y + CAB.d;
const TOP_Z = FEET_H + CAB_H;
// Control panel strip across the top of the front face.
const PANEL = { x0: -31, x1: 31, z0: TOP_Z - 15, z1: TOP_Z - 3 };
const DIAL = { x: -21, z: (PANEL.z0 + PANEL.z1) / 2, r: 4.4 };
const LAMP_Z = PANEL.z1 - 4;
const SPIN_X = 13;
const CHECK_X = 24;
// Door: chrome ring around a glass porthole.
const DOOR = { x: 0, z: FEET_H + 31, r: 25 };
const GLASS_R = 17.5;
const WATER_Z = DOOR.z + 1.5;

// Laundry tray in front of the machine, one slot per sock that went in.
const TRAY: Rect = { x: -58, y: -2, w: 72, d: 26, r: 2.5 };
const TRAY_H = 3;
const SLOT_W = (TRAY.w - 4) / SLOTS;

// Callout plate on the board's front right, with a blue LCD strip.
const PLATE: Rect = { x: 4, y: 29, w: 56, d: 29, r: 3 };
const PLATE_H = 3.5;
const LCD: Rect = { x: 7, y: 32, w: 50, d: 23, r: 2 };
const LCD_Z = PLATE_H + 0.1;
export const LINE1_SIZE = 6.2;
export const LINE2_SIZE = 7.4;

// Stage: fit the board and machine to the width, then size the height to match.
const PTS: Vec3[] = [...boxCorners(BOARD, -SLAB_H - FOOT_H, 0), ...boxCorners(CAB, 0, TOP_Z + 2)];
const tall = fitView(PTS, STAGE_W, 4000, { pad: PAD, azimuth: AZIMUTH });
const ys = PTS.map((p) => project(p, tall)[1]);
export const STAGE_H = Math.ceil(Math.max(...ys) - Math.min(...ys) + PAD * 2);
export const view = fitView(PTS, STAGE_W, STAGE_H, { pad: PAD, azimuth: AZIMUTH });

const at = (p: Vec3) => project(p, view);
const r3 = (v: number) => Math.round(v * 1e3) / 1e3;

// Text on a front face (+y), reading along +x, upright along +z.
const frontMatrix = (p: Vec3) => {
  const o = at(p);
  const ax = at([p[0] + 1, p[1], p[2]]);
  const az = at([p[0], p[1], p[2] - 1]);
  return `matrix(${r3(ax[0] - o[0])} ${r3(ax[1] - o[1])} ${r3(az[0] - o[0])} ${r3(az[1] - o[1])} ${r3(o[0])} ${r3(o[1])})`;
};
// Point and polygon on the machine's front face: (x, z), lifted toward the viewer by `lift`.
const F = (x: number, z: number, lift = 0): Vec3 => [x, FRONT_Y + lift, z];
const frontPoly = (pts: Vec2[], lift = 0, close = true) => pathD(pts.map(([x, z]) => at(F(x, z, lift))), close);
const circle = (cx: number, cz: number, r: number, seg = 48): Vec2[] =>
  Array.from({ length: seg }, (_, i) => [cx + r * Math.cos((i / seg) * Math.PI * 2), cz + r * Math.sin((i / seg) * Math.PI * 2)]);

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

function roundRect(x0: number, z0: number, x1: number, z1: number, r: number): Vec2[] {
  const pts: Vec2[] = [];
  const corners: [number, number, number][] = [
    [x1 - r, z1 - r, 0],
    [x0 + r, z1 - r, Math.PI / 2],
    [x0 + r, z0 + r, Math.PI],
    [x1 - r, z0 + r, Math.PI * 1.5],
  ];
  for (const [cx, cz, a0] of corners)
    for (let k = 0; k <= 5; k++) pts.push([cx + r * Math.cos(a0 + (k / 5) * (Math.PI / 2)), cz + r * Math.sin(a0 + (k / 5) * (Math.PI / 2))]);
  return pts;
}

// Water surface in the porthole: wavy line z(x) across the glass, frozen at one instant (water kit formula).
const surf = (x: number, base: number, amp: number, ph: number) => base + amp * (0.7 * Math.sin(0.55 * x + ph) + 0.3 * Math.sin(1.3 * x + 2 * ph));
const wavy = (base: number, amp: number, ph: number, x0 = -GLASS_R, x1 = GLASS_R, n = 40): Vec2[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const x = x0 + ((x1 - x0) * i) / n;
    return [DOOR.x + x, surf(x, base, amp, ph)];
  });

// Sock in the front-face plane (x, z): leg tube from cuff down to the heel, foot turning sideways to a rounded toe.
function sockFront(cx: number, cz: number, ang: number, s: number) {
  const rot = ([u, w]: Vec2): Vec2 => [cx + s * (u * Math.cos(ang) - w * Math.sin(ang)), cz + s * (u * Math.sin(ang) + w * Math.cos(ang))];
  const leg: Vec2[] = [[-1.6, 5], [1.6, 5], [1.6, -0.6], [-1.6, -0.6]];
  const foot = roundRect(-1.6, -3.2, 5.6, 0.2, 1.6);
  const cuff: Vec2[] = [[-1.75, 5.3], [1.75, 5.3], [1.75, 3.7], [-1.75, 3.7]];
  return {
    leg: frontPoly(leg.map(rot), 0.12),
    foot: frontPoly(foot.map(rot), 0.12),
    cuff: frontPoly(cuff.map(rot), 0.14),
  };
}

// Engraved tick marks around the program dial.
const dialTicks = Array.from({ length: 11 }, (_, i) => {
  const th = Math.PI * (1.25 - (1.5 * i) / 10);
  const r0 = DIAL.r + 1;
  const r1 = DIAL.r + (i % 5 === 0 ? 2.6 : 1.9);
  return frontPoly(
    [
      [DIAL.x + r0 * Math.cos(th), DIAL.z + r0 * Math.sin(th)],
      [DIAL.x + r1 * Math.cos(th), DIAL.z + r1 * Math.sin(th)],
    ],
    0.2,
    false,
  );
}).join("");
const POINTER = Math.PI * 0.35;

export const machine = {
  halo: prismFill(inset(CAB, -2), 0, 0.1, view),
  feet: backToFront(rectCorners(CAB, 6)).map(([x, y]) => cylinder(x, y, 2.6, 0, FEET_H, view, 16, 0.4)),
  body: prism(CAB, FEET_H, CAB_H, view, 6, 1.4),
  // Control panel: raised strip with dial, lamps, labels and the maker's name.
  panel: frontPoly(roundRect(PANEL.x0, PANEL.z0, PANEL.x1, PANEL.z1, 2), 0.15),
  panelLine: frontPoly([[CAB.x + 2, PANEL.z0 - 2.5], [CAB.x + CAB.w - 2, PANEL.z0 - 2.5]], 0.05, false),
  dialShadow: frontPoly(circle(DIAL.x + 0.5, DIAL.z - 0.6, DIAL.r, 32), 0.2),
  dial: frontPoly(circle(DIAL.x, DIAL.z, DIAL.r, 32), 0.6),
  dialCap: frontPoly(circle(DIAL.x, DIAL.z, DIAL.r - 1.4, 28), 0.7),
  dialPointer: frontPoly([[DIAL.x, DIAL.z], [DIAL.x + (DIAL.r - 0.6) * Math.cos(POINTER), DIAL.z + (DIAL.r - 0.6) * Math.sin(POINTER)]], 0.75, false),
  dialTicks,
  spin: frontPoly(circle(SPIN_X, LAMP_Z, 1.7, 20), 0.3),
  check: frontPoly(circle(CHECK_X, LAMP_Z, 1.7, 20), 0.3),
  spinText: frontMatrix(F(SPIN_X, LAMP_Z - 3.8, 0.25)),
  checkText: frontMatrix(F(CHECK_X, LAMP_Z - 3.8, 0.25)),
  brand: frontMatrix(F(-3, DIAL.z - 1.6, 0.25)),
  // Door: shadow, chrome bands, glass, water, bubbles, socks, shine and handle.
  doorShadow: frontPoly(circle(DOOR.x + 0.8, DOOR.z - 1, DOOR.r, 64), 0.1),
  ring0: frontPoly(circle(DOOR.x, DOOR.z, DOOR.r, 64), 0.5),
  ring1: frontPoly(circle(DOOR.x, DOOR.z, DOOR.r - 2.2, 64), 0.6),
  ring2: frontPoly(circle(DOOR.x, DOOR.z, DOOR.r - 4.6, 64), 0.7),
  glass: frontPoly(circle(DOOR.x, DOOR.z, GLASS_R, 64), 0.4),
  water: frontPoly([...wavy(WATER_Z, 1.1, 0.8), [DOOR.x + GLASS_R, DOOR.z - GLASS_R - 2], [DOOR.x - GLASS_R, DOOR.z - GLASS_R - 2]], 0.42),
  surface: frontPoly(wavy(WATER_Z, 1.1, 0.8), 0.44, false),
  ripples: [frontPoly(wavy(WATER_Z - 5, 0.6, 2.1, -12, 12, 24), 0.44, false), frontPoly(wavy(WATER_Z - 10.5, 0.5, 3.4, -9, 9, 20), 0.44, false)].join(""),
  bubbles: [
    [-6, WATER_Z + 4, 0.9],
    [-3.5, WATER_Z + 7.5, 0.6],
    [7, WATER_Z - 3, 1.1],
    [9.5, WATER_Z + 2.5, 0.7],
    [-10, WATER_Z - 8, 0.8],
    [3, WATER_Z - 13, 0.6],
  ]
    .map(([x, z, r]) => frontPoly(circle(DOOR.x + x, z, r, 12), 0.46))
    .join(""),
  socks: [sockFront(DOOR.x - 7, DOOR.z - 2, -0.5, 1.9), sockFront(DOOR.x + 4, DOOR.z - 10, 1.9, 1.7)],
  shine: frontPoly(
    Array.from({ length: 14 }, (_, i): Vec2 => {
      const th = Math.PI * (0.62 + (0.32 * i) / 13);
      return [DOOR.x + (GLASS_R - 2.6) * Math.cos(th), DOOR.z + (GLASS_R - 2.6) * Math.sin(th)];
    }),
    0.5,
    false,
  ),
  handle: frontPoly(roundRect(DOOR.x + DOOR.r - 3, DOOR.z - 6, DOOR.x + DOOR.r + 1.5, DOOR.z + 6, 1.6), 0.9),
  // Soft blue glow pool on the board around the machine.
  pool: flatCircle(0, -14, 66, 0.05, view, 64),
};
export const PANEL_TEXT = 2.3;
export const BRAND_SIZE = 4.4;

// Tray: low prism with a floor line and slot dividers; socks lie flat along y, the foot turning toward +x.
const slotX = (k: number) => TRAY.x + 2 + k * SLOT_W;
const SOCK_Z = TRAY_H;
const SOCK_H = 3.4;
type Sock = { cuff: SolidPaths; leg: SolidPaths; foot: SolidPaths };
export const tray = {
  body: prism(TRAY, 0, TRAY_H, view, 4, 0.6),
  floor: flatRect(inset(TRAY, 1.6), TRAY_H, view, 4),
  dividers: Array.from({ length: SLOTS - 1 }, (_, k) => pathD([at([slotX(k + 1), TRAY.y + 1.6, TRAY_H]), at([slotX(k + 1), TRAY.y + TRAY.d - 1.6, TRAY_H])])).join(""),
  socks: Array.from({ length: SOCKS_OUT }, (_, k): Sock => {
    const x = slotX(k) + 1.4;
    const y0 = TRAY.y + 2.4;
    return {
      cuff: prism({ x, y: y0, w: 3.6, d: 3.2, r: 0.8 }, SOCK_Z, SOCK_H + 0.4, view, 3, 0.3),
      leg: prism({ x, y: y0 + 3.2, w: 3.6, d: 14, r: 0.8 }, SOCK_Z, SOCK_H, view, 3, 0.3),
      foot: prism({ x, y: y0 + 15.2, w: SLOT_W - 2.4, d: 4.6, r: 1.8 }, SOCK_Z, SOCK_H, view, 5, 0.3),
    };
  }),
  // The empty slot at the end of the row: a faint recessed outline.
  empty: flatRect({ x: slotX(SLOTS - 1) + 1, y: TRAY.y + 2.4, w: SLOT_W - 2, d: TRAY.d - 4.8, r: 1 }, TRAY_H + 0.05, view, 3),
};

// Callout: plate, blue LCD strip, two lines, red dashed warning box around line 2.
const L1: Vec2 = [LCD.x + LCD.w / 2, LCD.y + 7.2];
const L2: Vec2 = [LCD.x + LCD.w / 2, LCD.y + 16.4];
export const callout = {
  plate: prism(PLATE, 0, PLATE_H, view, 4, 0.8),
  lcd: flatRect(LCD, LCD_Z, view, 4),
  line1: faceMatrix([L1[0], L1[1] + LINE1_SIZE * 0.36], LCD_Z + 0.1, view, "x"),
  line2: faceMatrix([L2[0], L2[1] + LINE2_SIZE * 0.36], LCD_Z + 0.1, view, "x"),
  warn: flatRect({ x: L2[0] - 14, y: L2[1] - 4.8, w: 28, d: 9.6, r: 1.2 }, LCD_Z + 0.08, view, 3),
  // Leader from the plate's back-left corner, lifted, to the tray's right end (clear of the machine).
  leader: pathD([at([PLATE.x + 3, PLATE.y + 3, PLATE_H]), at([TRAY.x + TRAY.w + 2, TRAY.y + TRAY.d + 2, 9]), at([TRAY.x + TRAY.w - 1, TRAY.y + TRAY.d / 2, TRAY_H + 0.3])]),
  leaderEnds: [at([PLATE.x + 3, PLATE.y + 3, PLATE_H]), at([TRAY.x + TRAY.w - 1, TRAY.y + TRAY.d / 2, TRAY_H + 0.3])] as [number, number][],
};

// Entrance spark points: machine feet, tray and callout plate corners.
export const contacts = [...rectCorners(CAB, 6), ...rectCorners(TRAY), ...rectCorners(PLATE)].map(([x, y]) => at([x, y, 0]));
