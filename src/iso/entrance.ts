// Shared entrance (seconds): the board rises from below, the parts fall onto it under gravity,
// land at ENTRY.contact with sparks and a short damped shake, readouts slide in, the loop starts at ENTRY.loopFrom.

export const ENTRY = { contact: 1.35, loopFrom: 3 };

const TRAVEL = 1000; // stage units
const RISE_FROM = 0.6;
const FALL_FROM = 0.8;
const GRAVITY = (2 * TRAVEL) / (ENTRY.contact - FALL_FROM) ** 2;
const RESTITUTION = 0.09;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function entryState(t: number) {
  const base = TRAVEL * (1 - clamp01((t - RISE_FROM) / (ENTRY.contact - RISE_FROM))) ** 5;
  let parts = -TRAVEL;
  if (t >= FALL_FROM) {
    const s = t - FALL_FROM;
    const fall = ENTRY.contact - FALL_FROM;
    if (s < fall) parts = -TRAVEL + 0.5 * GRAVITY * s * s;
    else {
      const b = s - fall;
      const up = GRAVITY * fall * RESTITUTION * b - 0.5 * GRAVITY * b * b;
      parts = up > 0 ? -up : 0;
    }
  }
  const since = t - ENTRY.contact;
  const decay = since > 0 && since < 0.6 ? Math.exp(-9 * since) : 0;
  const shake = { x: 3.5 * decay * Math.sin(2 * Math.PI * 13 * since), y: 6 * decay * Math.sin(2 * Math.PI * 8 * since + 0.4) };
  const r = clamp01((t - 1.7) / 0.6);
  return { base, parts, shake, readout: 1 - (1 - r) ** 4 };
}

export const loopTime = (t: number, loop: number) => (t < ENTRY.loopFrom ? 0 : (t - ENTRY.loopFrom) % loop);

export const SPARKS_PER_POINT = 3;
const SPARK_GRAVITY = 220;

// Park–Miller, seed 11: the same sparks on every page and every render.
let seed = 11;
const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const SPARKS = Array.from({ length: 64 }, () => ({
  angle: -Math.PI / 2 + (rand() - 0.5) * 2.6,
  speed: 40 + rand() * 70,
  life: 0.45 * (0.6 + rand() * 0.4),
  hot: rand() < 0.45,
}));

export function sparkAt(t: number, at: [number, number], i: number) {
  const s = SPARKS[i % SPARKS.length];
  const age = t - ENTRY.contact;
  if (age < 0 || age > s.life) return null;
  const pos = (a: number): [number, number] => [at[0] + Math.cos(s.angle) * s.speed * a, at[1] + Math.sin(s.angle) * s.speed * a + 0.5 * SPARK_GRAVITY * a * a];
  return { head: pos(age), tail: pos(Math.max(0, age - 0.03)), opacity: 1 - age / s.life, hot: s.hot };
}
