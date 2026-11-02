// Evaluate a JS expression in a page at a given video time (capture clock) and print the JSON result.
// Handy for measuring parts instead of reading pixels.
//   node builds/notes/probe.mjs "<page.html>" <seconds> "<expression>"
// e.g. how many boards: "document.querySelectorAll('svg.iso-svg [data-base]').length"
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";

const [page, at, expr] = process.argv.slice(2);
if (!page || at === undefined || !expr) {
  console.error('usage: node builds/notes/probe.mjs "<page.html>" <seconds> "<expression>"');
  process.exit(2);
}
const chrome = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe`,
].find((p) => existsSync(p));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const profile = join(tmpdir(), `notes-probe-${process.pid}-${Date.now()}`);
const browser = spawn(chrome, ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "--window-size=1080,1920", "--hide-scrollbars", "--disable-gpu", "about:blank"]);
try {
  let target, port = 0;
  for (let i = 0; i < 100 && !target; i++) {
    await sleep(100);
    if (!port) {
      try { port = Number(readFileSync(join(profile, "DevToolsActivePort"), "utf8").split("\n")[0]) || 0; } catch {}
      if (!port) continue;
    }
    target = await fetch(`http://127.0.0.1:${port}/json/list`).then((r) => r.json()).then((l) => l.find((t) => t.type === "page")).catch(() => null);
  }
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((ok, fail) => ((ws.onopen = ok), (ws.onerror = fail)));
  let id = 0;
  const pending = new Map();
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { const { ok, fail } = pending.get(m.id); pending.delete(m.id); m.error ? fail(new Error(m.error.message)) : ok(m.result); }
  };
  const send = (method, params = {}) => new Promise((ok, fail) => { pending.set(++id, { ok, fail }); ws.send(JSON.stringify({ id, method, params })); });
  const ev = async (expression) => {
    const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? "evaluation failed");
    return r.result.value;
  };
  await send("Emulation.setDeviceMetricsOverride", { width: 1080, height: 1920, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url: `${pathToFileURL(resolve(page)).href}?capture` });
  for (let i = 0; i < 100; i++) {
    await sleep(100);
    if (await ev("document.readyState === 'complete' && typeof window.__isoStep === 'function'")) break;
  }
  await sleep(300);
  for (let t = 0; t < +at - 1e-6; t += 0.1) await ev(`window.__isoStep(${t === 0 ? 0 : 0.1}, ${t.toFixed(2)})`);
  await ev(`window.__isoStep(0.1, ${(+at).toFixed(2)})`);
  console.log(JSON.stringify(await ev(expr), null, 1));
  ws.close();
} finally {
  browser.kill();
  await sleep(300);
  try { rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch {}
}
