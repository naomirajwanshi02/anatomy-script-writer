// Volume knob still sample: a square board (always on screen) with a hi-fi amplifier and a bookshelf speaker
// standing on it, and a callout plate on the board's front left.
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
  type Vec2,
  type Vec3,
} from "../../iso/iso-kit";
import { POINTER, STEPS } from "./model";

export const STAGE_W = 600;
const AZIMUTH = 62;
const PAD = 12;
const A = (AZIMUTH * Math.PI) / 180;
const E = (30 * Math.PI) / 180;

// Board.
const BOARD: Rect = { x: -63, y: -63, w: 126, d: 126, r: 7 };
const SLAB_H = 8;
const FOOT_H = 4;

// Amplifier: low wide box on short feet; its front face is the plane y = AMP_FY.
const FEET_H = 2.4;
const AMP: Rect = { x: -60, y: -44, w: 84, d: 38, r: 2 };
const AMP_H = 34;
const AMP_TOP = FEET_H + AMP_H;
const AMP_FY = AMP.y + AMP.d;

// Volume knob on the front face, scale 0..7 over a 270 degree sweep (0 at 7 o'clock, 7 at 5 o'clock).
const KX = 6;
const KZ = 19;
const KR = 9;
const KNOB_D = 7;
const angle = (v: number) => ((225 - (v * 270) / (STEPS - 1)) * Math.PI) / 180;

// Display window on the front face.
const WIN = { x0: -54, x1: -16, z0: 18, z1: 31 };
export const LCD_CHAR = 7;

// Bookshelf speaker beside the amp, front face y = SPK_FY.
const SPK: Rect = { x: 32, y: -54, w: 26, d: 26, r: 2 };
const SPK_H = 50;
const SPK_FY = SPK.y + SPK.d;
const WOOF = { x: SPK.x + SPK.w / 2, z: 17, r: 9 };
const TWEET = { x: SPK.x + SPK.w / 2, z: 38, r: 3.5 };

// Callout plate on the board's front left, with a blue LCD strip.
const PLATE: Rect = { x: -54, y: 14, w: 56, d: 30, r: 3 };
const PLATE_H = 3.5;
const LCD: Rect = inset(PLATE, 3);
const LCD_Z = PLATE_H + 0.1;
export const CALL_CHAR = 15;

// Stage: fit the board, amp and speaker to the width, then size the height to match.
const PTS: Vec3[] = [...boxCorners(BOARD, -SLAB_H - FOOT_H, 0), ...boxCorners(AMP, 0, AMP_TOP + 2), ...boxCorners(SPK, 0, SPK_H + 2)];
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
// Polygon (x, z) on a front plane y.
const frontPoly = (pts: Vec2[], y: number) => pathD(pts.map(([x, z]) => at([x, y, z])), true);
const ringPts = (cx: number, cz: number, r: number, seg = 36): Vec2[] =>
  Array.from({ length: seg }, (_, i) => [cx + r * Math.cos((i / seg) * Math.PI * 2), cz + r * Math.sin((i / seg) * Math.PI * 2)]);
const rectPts = (x0: number, z0: number, x1: number, z1: number): Vec2[] => [
  [x0, z0],
  [x1, z0],
  [x1, z1],
  [x0, z1],
];

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

// 2D convex hull (screen points), for the knob's side band.
function hull(points: Vec2[]): Vec2[] {
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: Vec2, a: Vec2, b: Vec2) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list: Vec2[]) => {
    const h: Vec2[] = [];
    for (const p of list) {
      while (h.length >= 2 && cross(h[h.length - 2], h[h.length - 1], p) <= 0) h.pop();
      h.push(p);
    }
    return h;
  };
  const lower = half(pts);
  const upper = half([...pts].reverse());
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

const F = AMP_FY + 0.05; // just proud of the amp's front face
const knobBack = ringPts(KX, KZ, KR, 40).map(([x, z]) => at([x, AMP_FY + 0.8, z]));
const knobFront = ringPts(KX, KZ, KR, 40).map(([x, z]) => at([x, AMP_FY + KNOB_D, z]));
const onCap = (r: number, th: number): Vec3 => [KX + r * Math.cos(th), AMP_FY + KNOB_D + 0.05, KZ + r * Math.sin(th)];
export const TICK_SIZE = 3.4;
export const BRAND_SIZE = 3.2;

export const amp = {
  halo: prismFill({ x: AMP.x - 2, y: AMP.y - 2, w: AMP.w + 4, d: AMP.d + 4, r: 4 }, 0, 0.1, view),
  feet: backToFront(rectCorners(AMP, 6)).map(([x, y]) => cylinder(x, y, 2.6, 0, FEET_H, view, 16, 0.4)),
  body: prism(AMP, FEET_H, AMP_H, view, 4, 0.8),
  // Vent slots on the top, back left.
  vents: Array.from({ length: 9 }, (_, k) => pathD([at([AMP.x + 6 + k * 3, AMP.y + 5, AMP_TOP]), at([AMP.x + 6 + k * 3, AMP.y + 24, AMP_TOP])])).join(""),
  // Thin rule under the display, across the left half of the face.
  faceRule: pathD([at([AMP.x + 4, F, 15]), at([-14, F, 15])]),
  bezel: frontPoly(rectPts(WIN.x0 - 1.8, WIN.z0 - 1.8, WIN.x1 + 1.8, WIN.z1 + 1.8), F),
  glass: frontPoly(rectPts(WIN.x0, WIN.z0, WIN.x1, WIN.z1), F + 0.02),
  shadow: frontPoly(
    [
      [WIN.x0, WIN.z1],
      [WIN.x1, WIN.z1],
      [WIN.x1 - 1, WIN.z1 - 1],
      [WIN.x0 + 1, WIN.z1 - 1],
      [WIN.x0 + 1, WIN.z0 + 1],
      [WIN.x0, WIN.z0],
    ],
    F + 0.04,
  ),
  lcdText: frontMatrix([WIN.x0 + 3, F + 0.06, 23.4]),
  // Level bar cells under the display text, rising left to right (one per step above 0).
  bar: Array.from({ length: STEPS - 1 }, (_, i) => {
    const x0 = WIN.x0 + 3 + i * 4.6;
    return frontPoly(rectPts(x0, 19.4, x0 + 3.6, 20.4 + i * 0.4), F + 0.06);
  }),
  // Maker's plate under the rule, power button at the left end.
  plate: frontPoly(rectPts(-46, 6.5, -26, 12), F + 0.03),
  brand: frontMatrix([-36, F + 0.06, 9.25 - BRAND_SIZE * 0.36]),
  power: frontPoly(ringPts(AMP.x + 6, 9.25, 1.8, 18), F + 0.03),
  // Scale: a tick per step and a number outside it.
  ticks: Array.from({ length: STEPS }, (_, v) => {
    const th = angle(v);
    return pathD([at([KX + 11.3 * Math.cos(th), F, KZ + 11.3 * Math.sin(th)]), at([KX + 13.4 * Math.cos(th), F, KZ + 13.4 * Math.sin(th)])]);
  }).join(""),
  tickText: Array.from({ length: STEPS }, (_, v) => {
    const th = angle(v);
    return frontMatrix([KX + 16 * Math.cos(th), F + 0.06, KZ + 16 * Math.sin(th) - TICK_SIZE * 0.36]);
  }),
  knobSkirt: frontPoly(ringPts(KX, KZ, KR + 1.6, 40), F + 0.1),
  knobSide: pathD(hull([...knobBack, ...knobFront]), true),
  knobCap: pathD(knobFront, true),
  // Grip ridges on the visible side of the band.
  knobGrip: Array.from({ length: 12 }, (_, k) => {
    const th = ((-30 + k * 15) * Math.PI) / 180;
    const x = KX + KR * Math.cos(th);
    const z = KZ + KR * Math.sin(th);
    return pathD([at([x, AMP_FY + 1.6, z]), at([x, AMP_FY + KNOB_D - 0.6, z])]);
  }).join(""),
  // Pointer groove, halfway between the two steps.
  pointer: pathD([at(onCap(2.2, angle(POINTER))), at(onCap(KR - 1.4, angle(POINTER)))]),
  // Soft blue glow pool on the board in front of the display.
  pool: flatCircle((WIN.x0 + WIN.x1) / 2, AMP_FY + 8, 26, 0.05, view, 48),
};

// Speaker: box, woofer with rim and dust cap, tweeter; rust sound arcs spreading forward from the woofer.
const SF = SPK_FY + 0.05;
export const speaker = {
  halo: prismFill({ x: SPK.x - 2, y: SPK.y - 2, w: SPK.w + 4, d: SPK.d + 4, r: 4 }, 0, 0.1, view),
  body: prism(SPK, 0, SPK_H, view, 4, 0.8),
  wooferRim: frontPoly(ringPts(WOOF.x, WOOF.z, WOOF.r + 1.6, 40), SF),
  woofer: frontPoly(ringPts(WOOF.x, WOOF.z, WOOF.r, 40), SF + 0.02),
  dust: frontPoly(ringPts(WOOF.x, WOOF.z, 3.2, 24), SF + 0.04),
  tweeterRim: frontPoly(ringPts(TWEET.x, TWEET.z, TWEET.r + 1.6, 28), SF),
  tweeter: frontPoly(ringPts(TWEET.x, TWEET.z, TWEET.r, 24), SF + 0.04),
  // "( o )" rings in front of the woofer, each a pair of side arcs a little further out.
  arcs: [0, 1, 2].flatMap((k) => {
    const y = SPK_FY + 2 + k * 3;
    const r = WOOF.r + 4 + k * 5;
    return [0, 180].map((c) => {
      const pts = Array.from({ length: 13 }, (_, i) => {
        const th = ((c - 40 + (i * 80) / 12) * Math.PI) / 180;
        return at([WOOF.x + r * Math.cos(th), y, WOOF.z + r * Math.sin(th)]);
      });
      return pathD(pts);
    });
  }),
};

// Callout: plate, blue LCD strip with the reading, red dashed warning outline around the plate.
const LEAD_A: Vec3 = [-30, PLATE.y + 2, PLATE_H];
const LEAD_B: Vec3 = [-35, F, WIN.z0 - 1.8];
export const callout = {
  warn: flatRect(inset(PLATE, -3), 0.1, view, 4),
  plate: prism(PLATE, 0, PLATE_H, view, 4, 0.8),
  lcd: flatRect(LCD, LCD_Z, view, 4),
  text: faceMatrix([LCD.x + LCD.w / 2, LCD.y + LCD.d / 2 + CALL_CHAR * 0.36], LCD_Z + 0.1, view, "x"),
  leader: pathD([at(LEAD_A), at(LEAD_B)]),
  leaderEnds: [at(LEAD_A), at(LEAD_B)] as [number, number][],
};

// Entrance spark points: the amp and speaker corners and the callout plate corners.
export const contacts = [...rectCorners(AMP, 3), ...rectCorners(SPK, 2), ...rectCorners(PLATE)].map(([x, y]) => at([x, y, 0]));
