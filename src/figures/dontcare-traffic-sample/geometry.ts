// Traffic light still sample: a square board (always on screen) with a traffic light on a short pole, standing on the
// left half; the right half stays open (the ghost light appears there later). x runs right, y toward the viewer
// (front face +y), z up. Lamps top to bottom: red, yellow, green, round lenses on the housing's front face, each
// under a visor.
import { boxCorners, cylinder, fitView, flatCircle, flatRect, inset, pathD, prism, prismFill, project, rectCorners, solidSvg, type Rect, type Vec2, type Vec3 } from "../../iso/iso-kit";
import { LAMPS } from "./model";

export const STAGE_W = 600;
const AZIMUTH = 62;
const PAD = 12;

// Board.
const BOARD: Rect = { x: -63, y: -63, w: 126, d: 126, r: 7 };
const SLAB_H = 8;
const FOOT_H = 4;

// Traffic light: plinth, pole, backplate and housing, centred at (LX, LY).
const LX = -27;
const LY = -12;
const BASE: Rect = { x: LX - 13, y: LY - 13, w: 26, d: 26, r: 2.5 };
const BASE_H = 13;
const POLE_R = 4.2;
const HOUSE_Z = 40; // housing bottom = pole top
const HOUSE: Rect = { x: LX - 15, y: LY - 9, w: 30, d: 18, r: 3 };
const HOUSE_H = 74;
const BACK: Rect = { x: LX - 20, y: LY - 11.5, w: 40, d: 2.5, r: 1.2 };
const BACK_Z = HOUSE_Z - 4;
const BACK_H = HOUSE_H + 8;
const FRONT_Y = HOUSE.y + HOUSE.d;

// Lenses on the front face: radius, centre heights (top to bottom), visor size.
const LENS_R = 9.5;
const LENS_Z = LAMPS.map((_, i) => HOUSE_Z + HOUSE_H - 13 - i * 24);
const VISOR_R = 11;
const VISOR_L = 4.5;

// Stage: fit the board and the light to the width, then size the height to match.
const PTS: Vec3[] = [...boxCorners(BOARD, -SLAB_H - FOOT_H, 0), ...boxCorners(BACK, BACK_Z, BACK_Z + BACK_H), [LX, FRONT_Y + VISOR_L, LENS_Z[0] + VISOR_R]];
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

// Engraving on the board's front face (+y), centred, upright.
export const ENGRAVE = "ROLLIN-रोलिन-ROLLIN-रोलिन";
export const ENGRAVE_SIZE = 3.6;
export const boardEngrave = frontMatrix([BOARD.x + BOARD.w / 2, BOARD.y + BOARD.d, -SLAB_H / 2 - ENGRAVE_SIZE * 0.36]);

export const boardSvg = (() => {
  const b = BOARD;
  const feet = rectCorners(b, 14)
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

// Circle in the front plane (x-z) at depth y.
const ring = (cx: number, y: number, cz: number, r: number, a0 = 0, a1 = Math.PI * 2, seg = 40): Vec2[] =>
  Array.from({ length: seg + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / seg;
    return at([cx + Math.cos(a) * r, y, cz + Math.sin(a) * r]);
  });

// Visor: a hood over the upper half of the lens, longest at the top, cut back to nothing at the sides.
const visorArc = (cz: number, k: number): Vec2[] =>
  Array.from({ length: 41 }, (_, i) => {
    const a = (Math.PI * i) / 40;
    return at([LX + Math.cos(a) * VISOR_R, FRONT_Y + VISOR_L * Math.sin(a) * k, cz + Math.sin(a) * VISOR_R]);
  });

export const lamps = LAMPS.map((lamp, i) => {
  const cz = LENS_Z[i];
  return {
    lamp,
    bezel: pathD(ring(LX, FRONT_Y + 0.05, cz, LENS_R + 1.4), true),
    lens: pathD(ring(LX, FRONT_Y + 0.1, cz, LENS_R), true),
    shine: pathD(ring(LX, FRONT_Y + 0.15, cz, LENS_R * 0.68, Math.PI * 0.58, Math.PI * 0.9, 10)),
    halo: pathD(ring(LX, FRONT_Y + 0.2, cz, LENS_R * 1.45), true),
    visor: pathD([...visorArc(cz, 1), ...visorArc(cz, 0).reverse()], true),
    visorRim: pathD(visorArc(cz, 1)),
  };
});

// Light pool on the board in front of the light (tinted by the lit lamp).
export const pool = flatCircle(LX + 1, FRONT_Y + 15, 21, 0.05, view, 48);

export const light = {
  base: prism(BASE, 0, BASE_H, view, 6, 0.8),
  collar: cylinder(LX, LY, POLE_R + 1.6, BASE_H, 2.5, view, 28, 0.3),
  pole: cylinder(LX, LY, POLE_R, BASE_H + 2.5, HOUSE_Z - BASE_H - 2.5, view, 28),
  back: prism(BACK, BACK_Z, BACK_H, view, 6, 0.4),
  house: prism(HOUSE, HOUSE_Z, HOUSE_H, view, 8, 0.8),
};

// Maker's plate on the plinth's front face, with four rivets and the ROLLIN print.
const PLATE = { x0: LX - 11, x1: LX + 11, z0: 2.8, z1: BASE_H - 2.8 };
const PY = BASE.y + BASE.d + 0.1;
export const plate = {
  d: pathD([at([PLATE.x0, PY, PLATE.z0]), at([PLATE.x1, PY, PLATE.z0]), at([PLATE.x1, PY, PLATE.z1]), at([PLATE.x0, PY, PLATE.z1])], true),
  rivets: [
    [PLATE.x0 + 1.4, PLATE.z0 + 1.2],
    [PLATE.x1 - 1.4, PLATE.z0 + 1.2],
    [PLATE.x0 + 1.4, PLATE.z1 - 1.2],
    [PLATE.x1 - 1.4, PLATE.z1 - 1.2],
  ].map(([x, z]) => at([x, PY + 0.05, z])),
};
export const BRAND_SIZE = 4.6;
export const brand = frontMatrix([LX, PY + 0.1, (PLATE.z0 + PLATE.z1) / 2 - BRAND_SIZE * 0.36]);

// Entrance spark points: the plinth corners.
export const contacts = rectCorners(BASE, 1).map(([x, y]) => at([x, y, 0]));
