// Lossless frame-by-frame render of figure HTML pages to .mov files, each next to its .html.
//
//   node capture.mjs "<html file or folder>" [--seconds N] [--fps 60] [--scale 2] [--size 1080x1920] [--transparent] [--force] [--chrome <path>]
//
// One file: renders it. A folder (e.g. "shorts"): walks every subfolder and renders each .html it finds,
// skipping pages whose .mov is already newer than the .html (pass --force to redo them all).
// Length: the 3 s entrance plus exactly one loop, read from the page (<meta name="iso-loop">) or, for older builds,
// from the LOOPS table below; --seconds overrides it. Pages with no known loop get DEFAULT_SECONDS.
// Opens each page in headless Chrome laid out at --size (CSS pixels) and rendered at --scale (default 2, so 2160x3840)
// with ?capture, steps the animation by 1/fps per frame (window.__isoStep, see src/iso/react/live.tsx) and streams
// every frame straight into ffmpeg (no frames on disk).
// Output: "<name>.mov" in the same folder as "<name>.html", so sorted by name each HTML has its video right below it.
//   default        ProRes 4444 (visually lossless, 10-bit), Premiere's native format; decodes every frame reliably
//   --transparent  ProRes 4444 with alpha: no page background, drops onto a Premiere timeline over anything.
//   --qtrle        QuickTime Animation instead (truly lossless, but Premiere often fails on its "unchanged" frames)
//                  (Players like VLC show the transparent areas as black; Premiere shows them correctly.)
//   --scale 3      even sharper (3240x5760); the layout is the same at any scale, only the pixel count changes.
//   --frames <dir> also keep the PNG frames in <dir> (single file only; for checking)
// Standalone: needs Node 22+, Chrome (or Edge) and ffmpeg, so it can be copied to any machine on its own.

import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const ENTRANCE = 3; // seconds before each figure's loop starts
const DEFAULT_SECONDS = 20;

// Loop lengths (s) of pages built before the loop was written into the page itself.
const LOOPS = {
  "Why do computers use binary.html": 8,
  "Why do computers use binary (bulb meter).html": 30,
  "How does a transistor work as a switch.html": 10,
  "How does a transistor work as a switch (water tap).html": 30,
  "What are the basic logic gates.html": 12,
  "What are the basic logic gates (taps).html": 30,
  "Why is NAND called a universal gate.html": 10.4,
  "How does a CMOS inverter work.html": 10,
  "How does a CMOS inverter work (two taps).html": 30,
  "How do you build a NAND gate in CMOS.html": 14,
  "How do you build a NAND gate in CMOS (taps).html": 30,
  "NAND vs NOR in CMOS which is better, and why.html": 11.6,
  "NAND vs NOR in CMOS which is better, and why (pipes).html": 30,
  "Why does CMOS use almost no power when idle.html": 40,
  "Why does CMOS use almost no power when idle (dripping taps).html": 30,
  "What decides the delay of a logic gate.html": 22,
  "What decides the delay of a logic gate (pipes).html": 30,
  "What is a glitch (hazard) and how do you fix it.html": 27,
  "What is a glitch (hazard) and how do you fix it (runners).html": 30,
  "How does an SR latch store a bit.html": 20,
  "How does an SR latch store a bit (seesaw).html": 30,
  "Why is S = R = 0 invalid in a NAND SR latch.html": 10,
  "Why is S = R = 0 invalid in a NAND SR latch (seesaw).html": 30,
  "What is a D latch and why is it called transparent.html": 48,
  "What is a D latch and why is it called transparent (canal lock).html": 30,
  "What is latch race-through.html": 14,
  "What is latch race-through (water locks).html": 30,
};

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const FLAGS = new Set(["--transparent", "--force", "--qtrle"]);
const input = args.find((a, i) => !a.startsWith("--") && !(i > 0 && args[i - 1].startsWith("--") && !FLAGS.has(args[i - 1])));
const transparent = args.includes("--transparent");
const force = args.includes("--force");

if (!input) {
  console.error('usage: node capture.mjs "<html file or folder>" [--seconds N] [--fps 60] [--scale 2] [--transparent] [--force]');
  process.exit(1);
}
const target = resolve(input);
if (!existsSync(target)) {
  console.error(`Not found: ${target}\nUse the real file or folder name (in quotes), e.g. node capture.mjs "shorts" --transparent`);
  process.exit(1);
}

const secondsOpt = opt("seconds") ? Number(opt("seconds")) : null;
const fps = Number(opt("fps", 60));
const [width, height] = opt("size", "1080x1920").split("x").map(Number);
const scale = Number(opt("scale", 2));
const framesDir = opt("frames") ? resolve(opt("frames")) : null;

const chrome =
  opt("chrome") ??
  [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe`,
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
  ].find((p) => existsSync(p));
if (!chrome) throw new Error("Chrome or Edge not found; pass --chrome <path>");

const hasFfmpeg = spawnSync("ffmpeg", ["-version"]).status === 0;
if (!hasFfmpeg && !framesDir) {
  console.error("ffmpeg not found: install it (winget install Gyan.FFmpeg), then open a new terminal (or restart) and run again.");
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Every .html under a folder (all subfolders), sorted by path.
const findPages = (dir) =>
  readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? findPages(join(dir, e.name)) : e.name.toLowerCase().endsWith(".html") ? [join(dir, e.name)] : []))
    .sort();

// Codec: ProRes 4444 (with alpha when --transparent), Premiere's native format; it decodes every frame reliably.
// --qtrle keeps the old QuickTime Animation output (truly lossless, but ffmpeg writes "unchanged" frames that
// Premiere often fails to read: "Error retrieving frame ... substituting frame").
const qtrle = process.argv.includes("--qtrle");
const codec = qtrle
  ? ["-c:v", "qtrle", "-pix_fmt", transparent ? "argb" : "rgb24"]
  : ["-c:v", "prores_ks", "-profile:v", "4444", "-vendor", "apl0", "-pix_fmt", transparent ? "yuva444p10le" : "yuv444p10le"];

// A frame step that takes longer than this means something is blocked (usually the output .mov held open by
// Premiere, or another program); stop with a clear message instead of hanging forever.
const STALL_MS = 90_000;
const withStall = (promise, what) => {
  let timer;
  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    new Promise((_, fail) => {
      timer = setTimeout(() => fail(new Error(`stalled for ${STALL_MS / 1000} s while ${what}. If the .mov is open in Premiere (or another app), remove it there and run again.`)), STALL_MS);
    }),
  ]);
};

async function render(html) {
  const out = join(dirname(html), `${basename(html, ".html")}.mov`);
  // ffmpeg writes to a .partial file first and it is renamed only when the video is complete, so a stopped or
  // failed render never leaves a broken .mov under the real name (Premiere would import it and complain).
  const partial = join(dirname(html), `${basename(html, ".html")}.partial.mov`);
  if (framesDir) {
    rmSync(framesDir, { recursive: true, force: true });
    mkdirSync(framesDir, { recursive: true });
  }

  // Launch headless Chrome with the DevTools protocol on a free port Chrome picks itself (port 0), so several
  // capture runs can work at the same time without driving each other's page. Chrome writes the port it chose
  // into DevToolsActivePort in its profile folder.
  const profile = join(tmpdir(), `iso-capture-${process.pid}-${Date.now()}`);
  const browser = spawn(chrome, [
    "--headless=new",
    "--remote-debugging-port=0",
    `--user-data-dir=${profile}`,
    `--window-size=${width},${height}`,
    `--force-device-scale-factor=${scale}`,
    "--hide-scrollbars",
    "--disable-gpu",
    "about:blank",
  ]);

  let encoder = null;
  let seconds = 0;
  try {
    // Find the page's DevTools socket.
    let page;
    let port = 0;
    for (let i = 0; i < 100 && !page; i++) {
      await sleep(100);
      if (!port) {
        try {
          port = Number(readFileSync(join(profile, "DevToolsActivePort"), "utf8").split("\n")[0]) || 0;
        } catch {}
        if (!port) continue;
      }
      page = await fetch(`http://127.0.0.1:${port}/json/list`)
        .then((r) => r.json())
        .then((list) => list.find((t) => t.type === "page"))
        .catch(() => null);
    }
    if (!page) throw new Error("could not connect to Chrome");

    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((ok, fail) => ((ws.onopen = ok), (ws.onerror = fail)));
    let id = 0;
    const pending = new Map();
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id && pending.has(msg.id)) {
        const { ok, fail } = pending.get(msg.id);
        pending.delete(msg.id);
        msg.error ? fail(new Error(msg.error.message)) : ok(msg.result);
      }
    };
    const send = (method, params = {}) =>
      new Promise((ok, fail) => {
        pending.set(++id, { ok, fail });
        ws.send(JSON.stringify({ id, method, params }));
      });
    const evaluate = async (expression) => (await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result.value;

    await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: scale, mobile: false });
    if (transparent) await send("Emulation.setDefaultBackgroundColorOverride", { color: { r: 0, g: 0, b: 0, a: 0 } });
    await send("Page.navigate", { url: `${pathToFileURL(html).href}?capture` });
    for (let i = 0; i < 100; i++) {
      await sleep(100);
      if (await evaluate("document.readyState === 'complete' && typeof window.__isoStep === 'function'")) break;
      if (i === 99) throw new Error("this HTML has no capture mode (not a looping figure, or built before capture mode was added)");
    }

    // Length: --seconds, else the page's own loop, else the table, else the default.
    const metaLoop = Number(await evaluate("document.querySelector('meta[name=iso-loop]')?.content ?? ''")) || null;
    const loop = metaLoop ?? LOOPS[basename(html)] ?? null;
    seconds = secondsOpt ?? (loop ? ENTRANCE + loop : DEFAULT_SECONDS);
    if (!secondsOpt && !loop) console.log(`  (loop length unknown, rendering ${DEFAULT_SECONDS} s; pass --seconds to change)`);

    if (transparent) {
      // Clear the page backgrounds (black, dot grid, green) so only the drawn parts remain.
      await evaluate(`(() => {
        const s = document.createElement("style");
        s.textContent = "html,body,:root,main,.page,#root,[data-figure],html body .iso[data-figure],.iso,.iso-figure,.iso-plate,.ov,.r-page,.r-frame-box{background:transparent!important;box-shadow:none!important;outline:none!important}"
          + ".sr-frame rect:first-child,.sb-frame>rect:first-of-type{display:none}"
          // Lamp glows use mix-blend-mode: screen, which over a transparent page turns into a pale beige smudge;
          // normal blending keeps them orange over whatever backdrop they are placed on in Premiere.
          + "*{mix-blend-mode:normal!important}";
        document.head.appendChild(s);
      })()`);
    }
    await sleep(300); // let the first paint settle

    // ffmpeg reads the PNG frames from stdin and writes the .mov next to the HTML.
    encoder = hasFfmpeg
      ? spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(fps), "-i", "-", ...codec, partial], {
          stdio: ["pipe", "inherit", "inherit"],
        })
      : null;

    const total = Math.round(seconds * fps);
    for (let f = 0; f < total; f++) {
      await withStall(evaluate(`window.__isoStep(${f === 0 ? 0 : 1 / fps}, ${f / fps})`), `stepping frame ${f}`);
      const shot = await withStall(send("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width, height, scale: 1 } }), `capturing frame ${f}`);
      const png = Buffer.from(shot.data, "base64");
      if (framesDir) writeFileSync(join(framesDir, `${String(f).padStart(5, "0")}.png`), png);
      if (encoder && !encoder.stdin.write(png)) await withStall(once(encoder.stdin, "drain"), `writing frame ${f} to the .mov`);
      if (f % fps === 0) process.stdout.write(`\r  frame ${f}/${total}`);
    }
    process.stdout.write(`\r  frame ${total}/${total}\n`);
    ws.close();
  } catch (e) {
    // Don't leave a half-fed ffmpeg waiting for frames (and a broken .mov behind) when a render fails.
    if (encoder) {
      encoder.kill();
      encoder = null;
      await sleep(300);
      rmSync(partial, { force: true });
    }
    throw e;
  } finally {
    browser.kill();
    await sleep(800);
    // Chrome can hold its temp profile open briefly after exiting; leftovers in the temp folder are harmless.
    try {
      rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
    } catch {}
  }

  if (encoder) {
    encoder.stdin.end();
    const [code] = await once(encoder, "close");
    if (code !== 0) {
      rmSync(partial, { force: true });
      throw new Error(`ffmpeg failed (exit ${code})`);
    }
    try {
      rmSync(out, { force: true });
      renameSync(partial, out);
    } catch {
      throw new Error(`the finished video is saved as ${partial}, but ${out} could not be replaced: it is probably open in Premiere. Remove it there, then rename the .partial.mov (or run again).`);
    }
    console.log(`  video: ${out} (${seconds} s, ${width * scale}x${height * scale}, ${fps} fps, ${qtrle ? "QuickTime Animation" : "ProRes 4444"}${transparent ? ", transparent" : ""})`);
  }
}

if (statSync(target).isDirectory()) {
  const pages = findPages(target);
  const failed = [];
  let done = 0;
  let skipped = 0;
  for (const [i, html] of pages.entries()) {
    const mov = join(dirname(html), `${basename(html, ".html")}.mov`);
    // Up to date = newer than the page AND readable (a render stopped before this fix could leave a broken .mov).
    const readable = () => spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", mov]).status === 0;
    if (!force && existsSync(mov) && statSync(mov).mtimeMs > statSync(html).mtimeMs && readable()) {
      skipped++;
      continue;
    }
    console.log(`[${i + 1}/${pages.length}] ${html.slice(target.length + 1)}`);
    try {
      await render(html);
      done++;
    } catch (e) {
      console.log(`  skipped: ${e.message}`);
      failed.push(html);
    }
  }
  console.log(`\nrendered ${done}, already up to date ${skipped}, failed ${failed.length}${failed.length ? ":\n  " + failed.join("\n  ") : ""}`);
} else {
  await render(target);
  if (framesDir) console.log(`frames: ${framesDir}`);
}
