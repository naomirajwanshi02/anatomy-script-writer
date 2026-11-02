// Contact sheet of a page at chosen seconds, for checking notes placement without a video render.
//   node builds/notes/sheet.mjs "<page.html>" 5 14 22 46 [--scale 0.5] [--cols 5] [--crop y0:h]
// Renders a copy of the page (so no .mov lands next to the real one) with capture.mjs at 1 fps,
// then tiles the chosen seconds into builds/notes/.check/sheet.png and prints its path.
// --crop keeps only frame rows y0..y0+h (frame px at scale 1) to make the sheet smaller to look at.
import { copyFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { execFileSync } from "node:child_process";
import { ROOT } from "./notes-kit.mjs";

const args = process.argv.slice(2);
const opt = (n, d) => {
  const i = args.indexOf(`--${n}`);
  if (i < 0) return d;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
};
const scale = +opt("scale", "0.5"), cols = +opt("cols", "5"), crop = opt("crop", null);
const [page, ...times] = args;
if (!page || !times.length) {
  console.error('usage: node builds/notes/sheet.mjs "<page.html>" <sec> [sec ...] [--scale 0.5] [--cols 5] [--crop y0:h]');
  process.exit(1);
}
const secs = times.map((t) => Math.round(+t));
const work = join(ROOT, "builds/notes/.check");
const frames = join(work, "frames");
rmSync(work, { recursive: true, force: true });
mkdirSync(frames, { recursive: true });
const copy = join(work, "page.html");
copyFileSync(resolve(page), copy);

execFileSync("node", [join(ROOT, "builds/capture.mjs"), copy, "--fps", "1", "--scale", String(scale), "--seconds", String(Math.max(...secs) + 1), "--frames", frames], { stdio: "ignore" });

const inputs = secs.flatMap((t) => {
  const f = join(frames, String(t).padStart(5, "0") + ".png");
  if (!existsSync(f)) throw new Error("no frame at " + t + " s");
  return ["-i", f];
});
const [y0, h] = crop ? crop.split(":").map((v) => Math.round(+v * scale)) : [0, Math.round(1920 * scale)];
const w = Math.round(1080 * scale);
const label = secs.map((t, i) => `[${i}]crop=${w}:${h}:0:${y0},drawtext=fontfile='C\\:/Windows/Fonts/consola.ttf':text='${t}s':x=8:y=8:fontsize=${Math.round(28 * scale)}:fontcolor=0x3b2a1a[v${i}]`).join(";");
const out = join(work, "sheet.png");
const refs = secs.map((_, i) => `[v${i}]`).join("");
const layout = secs.map((_, i) => `${(i % cols) * w}_${Math.floor(i / cols) * h}`).join("|");
const stack = secs.length > 1 ? `;${refs}xstack=inputs=${secs.length}:layout=${layout}:fill=0xefe3c8` : ";[v0]null";
execFileSync("ffmpeg", ["-v", "error", "-y", ...inputs, "-filter_complex", label + stack, "-frames:v", "1", out]);
console.log(out);
