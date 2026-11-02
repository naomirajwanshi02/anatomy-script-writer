// Export an uploadable reel MP4: the page rendered with alpha, laid on the sepia paper, with the voiceover.
//   node builds/notes/export-reel.mjs "<page.html>" [--audio <mp3>] [--paper <png>] [--skip-render]
// 0. check.mjs plays the page and refuses (exit 1) on any overlap of notes, pen marks, labels and parts;
//    nothing is rendered until it passes.
// 1. capture.mjs renders <page>.mov (ProRes 4444, transparent, 1080x1920, 30 fps; length from the
//    page's iso-loop meta). --skip-render reuses an existing .mov.
// 2. ffmpeg lays it over shorts/backdrops/Sepia paper.png, adds the audio (padded with silence to the
//    video length) and writes "<question> (reel).mp4" in the episode folder:
//    H.264 High, yuv420p, CRF 17, AAC 192k 48 kHz, +faststart (Instagram / LinkedIn ready).
// Default audio: <N>.mp3 in the page's folder, N = the episode number without its leading zero.
import { existsSync } from "node:fs";
import { resolve, dirname, basename, join } from "node:path";
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
const skip = args.includes("--skip-render");
const audioOpt = opt("audio", null), paper = resolve(opt("paper", join(ROOT, "shorts/backdrops/Sepia paper.png")));
const page = args.find((a) => !a.startsWith("--"));
if (!page) {
  console.error('usage: node builds/notes/export-reel.mjs "<page.html>" [--audio <mp3>] [--paper <png>] [--skip-render]');
  process.exit(1);
}
const html = resolve(page), dir = dirname(html), folder = basename(dir);
const m = folder.match(/^(\d+)\s+(.*)$/);
if (!m) throw new Error("page must sit in a numbered episode folder (shorts/<series>/NN <question>/)");
const audio = resolve(audioOpt ?? join(dir, `${+m[1]}.mp3`));
if (!existsSync(audio)) throw new Error("audio not found: " + audio);
const mov = html.replace(/\.html$/, ".mov");
const out = join(dir, `${m[2]} (reel).mp4`);

try {
  execFileSync("node", [join(ROOT, "builds/notes/check.mjs"), html], { stdio: "inherit" });
} catch {
  console.error("\nexport stopped: fix the overlaps above in the cue file, rebuild (npm run notes -- NN), then export again.");
  process.exit(1);
}
if (!skip) execFileSync("node", [join(ROOT, "builds/capture.mjs"), html, "--transparent", "--scale", "1", "--fps", "30", "--force"], { stdio: "inherit" });
if (!existsSync(mov)) throw new Error("render missing: " + mov);
const dur = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", mov]).toString().trim();

execFileSync("ffmpeg", ["-v", "error", "-stats", "-y", "-loop", "1", "-framerate", "30", "-i", paper, "-i", mov, "-i", audio,
  "-filter_complex", "[0:v][1:v]overlay=0:0:shortest=1,format=yuv420p[v];[2:a]apad[a]",
  "-map", "[v]", "-map", "[a]", "-t", dur, "-r", "30",
  "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-profile:v", "high", "-level", "4.1",
  "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", out], { stdio: "inherit" });
console.log("\nreel: " + out);
