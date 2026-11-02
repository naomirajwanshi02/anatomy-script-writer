// Pen shapes for the notes overlay: hand-drawn marks as SVG path data, in frame px (1080 x 1920).
// Every helper returns a path string; a cue file passes it as `p` in a pen entry.
// The overlay strokes every path in olive #4f5d24, 4 px, round caps, drawn on over its duration.

const f1 = (v) => +v.toFixed(1);

// Open V arrowhead at (x, y) pointing along angle a (radians).
const vhead = (x, y, a, h = 17, spread = 0.5) =>
  ` M${f1(x - h * Math.cos(a - spread))} ${f1(y - h * Math.sin(a - spread))} L${x} ${y} L${f1(x - h * Math.cos(a + spread))} ${f1(y - h * Math.sin(a + spread))}`;

// Curved pen arrow from (x1, y1) to (x2, y2). bend bows the curve sideways in px (+ = left of travel,
// - = right). Start it just beside its note, stop it a few px short of the part it points at.
export const arrow = (x1, y1, x2, y2, bend = 18) => {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, l = Math.hypot(x2 - x1, y2 - y1);
  const cx = f1(mx - ((y2 - y1) / l) * bend), cy = f1(my + ((x2 - x1) / l) * bend);
  return `M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}` + vhead(x2, y2, Math.atan2(y2 - cy, x2 - cx));
};

// Straight two-headed arrow (a dimension line, e.g. "wide gap" between two levels).
export const both = (x1, y1, x2, y2) => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  return `M${x1} ${y1} L${x2} ${y2}` + vhead(x2, y2, a, 15) + vhead(x1, y1, a + Math.PI, 15);
};

// Gentle wavy underline from x0 to x1 at height y (a = amplitude, n = half-waves).
export const wave = (x0, x1, y, a = 5, n = 6) => {
  let d = `M${x0} ${y}`;
  const s = (x1 - x0) / n;
  for (let i = 0; i < n; i++) d += ` Q${f1(x0 + s * (i + 0.5))} ${y + (i % 2 ? a : -a)} ${f1(x0 + s * (i + 1))} ${y}`;
  return d;
};

// Noise squiggle: a tighter, taller wave (n = full waves).
export const squiggle = (x0, x1, y, a = 10, n = 3) => {
  let d = `M${x0} ${y}`;
  const q = (x1 - x0) / (n * 2);
  for (let i = 0; i < n * 2; i++) d += ` q${f1(q / 2)} ${i % 2 ? a * 1.4 : -a * 1.4} ${f1(q)} 0`;
  return d;
};

// Curved tick centred near (x, y); s scales it.
export const tick = (x, y, s = 1) =>
  `M${x - 13 * s} ${y - 1 * s} Q${x - 7 * s} ${y + 4 * s} ${x - 3 * s} ${y + 10 * s} Q${x + 5 * s} ${y - 8 * s} ${x + 17 * s} ${y - 18 * s}`;

// Cross mark centred at (x, y) with half-size r.
export const cross = (x, y, r = 12) => `M${x - r} ${y - r} L${x + r} ${y + r} M${x + r} ${y - r} L${x - r} ${y + r}`;

// Light-bulb doodle; (x, y) is the centre of the glass. About 52 x 70 px.
export const bulb = (x, y) =>
  `M${x - 11} ${y + 26} C${x - 13} ${y + 12} ${x - 26} ${y + 6} ${x - 26} ${y - 10} A26 26 0 1 1 ${x + 26} ${y - 10} C${x + 26} ${y + 6} ${x + 13} ${y + 12} ${x + 11} ${y + 26} Z M${x - 11} ${y + 35} L${x + 11} ${y + 35} M${x - 8} ${y + 44} L${x + 8} ${y + 44} M${x - 7} ${y + 4} L${x - 7} ${y - 6} Q${x} ${y - 16} ${x + 7} ${y - 6} L${x + 7} ${y + 4}`;

// Pen ring: a smooth ellipse tilted with the board (15 deg at azimuth 62) that closes with a small
// overlap, like one quick loop. Draw it only once the part is settled on screen (never mid-fold).
export const ring = (cx, cy, rx, ry, tilt = 15) => {
  const r = (tilt * Math.PI) / 180, pts = [];
  for (let i = 0; i <= 56; i++) {
    const a = (-150 + (i / 56) * 385) * (Math.PI / 180), g = 1 + 0.035 * (i / 56);
    const x = rx * g * Math.cos(a), y = ry * g * Math.sin(a);
    pts.push(`${f1(cx + x * Math.cos(r) - y * Math.sin(r))} ${f1(cy + x * Math.sin(r) + y * Math.cos(r))}`);
  }
  return "M" + pts.join(" L");
};

// Glass-of-water doodle (the water analogy's doodle; use it instead of a drop); (x, y) is the centre of
// the glass. About 48 x 66 px: open rim, tapered sides, wavy water line, a shine stroke.
export const glass = (x, y) =>
  `M${x - 22} ${y - 30} Q${x} ${y - 37} ${x + 22} ${y - 30} Q${x} ${y - 23} ${x - 22} ${y - 30} ` +
  `L${x - 16} ${y + 30} Q${x} ${y + 35} ${x + 16} ${y + 30} L${x + 22} ${y - 30} ` +
  `M${x - 20} ${y - 8} q5 -5 10 0 t10 0 t10 0 t10 0 M${x + 11} ${y - 18} L${x + 9} ${y + 18}`;

// Pen box with slightly crossed corners (end cards, a box around a sketch).
export const box = (x0, y0, x1, y1) =>
  `M${x0 - 10} ${y0 + 2} L${x1 + 4} ${y0 - 2} M${x1} ${y0 - 8} L${x1 + 2} ${y1 + 4} M${x1 + 8} ${y1} L${x0 - 2} ${y1 + 2} M${x0} ${y1 + 8} L${x0 + 2} ${y0 - 6}`;

// Slightly bowed hand line between two points (level lines in a sketch).
export const line = (x0, y0, x1, y1, sag = 3) =>
  `M${x0} ${y0} Q${f1((x0 + x1) / 2)} ${f1((y0 + y1) / 2 - sag)} ${x1} ${y1}`;
