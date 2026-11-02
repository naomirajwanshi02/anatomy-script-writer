// Shared figure build: bundles src/main-<slug>.tsx into one self-contained HTML preview.
// buildFigure({ entry, out, title, model? }): model defaults to src/figures/<slug>/model.ts; its exported LOOP
// is written into <meta name="iso-loop"> so builds/capture.mjs knows the video length.
// Any build-<slug>.mjs accepts --out <file> to write somewhere else (for checks; never into shorts/ by accident).
import { build } from "esbuild";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

async function readLoop(model) {
  const res = await build({ entryPoints: [model], bundle: true, format: "esm", platform: "neutral", write: false, loader: { ".css": "empty" }, logLevel: "silent" });
  const tmp = join(tmpdir(), `iso-model-${process.pid}-${Date.now()}.mjs`);
  writeFileSync(tmp, res.outputFiles[0].text);
  let mod;
  try {
    mod = await import(pathToFileURL(tmp).href);
  } finally {
    rmSync(tmp, { force: true });
  }
  if (typeof mod.LOOP !== "number") throw new Error(`${model} does not export a numeric LOOP`);
  return mod.LOOP;
}

export async function buildFigure({ entry, out, title, model }) {
  const args = process.argv.slice(2);
  const i = args.indexOf("--out");
  const target = resolve(root, i >= 0 ? args[i + 1] : out);
  const entryPath = resolve(root, entry);
  const slug = basename(entryPath).replace(/^main-/, "").replace(/\.tsx?$/, "");
  const loop = await readLoop(resolve(root, model ?? `src/figures/${slug}/model.ts`));

  const res = await build({
    entryPoints: [entryPath],
    bundle: true,
    format: "iife",
    minify: true,
    jsx: "automatic",
    target: "es2022",
    define: { "process.env.NODE_ENV": '"production"' },
    nodePaths: [resolve(root, "node_modules")],
    outdir: "out",
    write: false,
    logLevel: "warning",
  });
  const js = res.outputFiles.find((f) => f.path.endsWith(".js")).text;
  const css = res.outputFiles.find((f) => f.path.endsWith(".css"))?.text ?? "";
  const page = readFileSync(resolve(root, "src/page.css"), "utf8");
  const fit = readFileSync(resolve(root, "src/iso/fit-plate.js"), "utf8");

  const html =
    `<!doctype html><html lang="en"><head><meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">` +
    `<title>${esc(title)}</title><meta name="iso-loop" content="${loop}">` +
    `<style>${css}\n\n${page}</style></head><body><main class="page"><div id="root"></div></main>` +
    `<script>${js}</script><script id="iso-fit">${fit}</script></body></html>`;

  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, html);
  console.log(`built ${target} (${(html.length / 1024).toFixed(0)} KB, loop ${loop} s)`);
}
