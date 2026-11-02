// Build the notes pages of one episode from its cue file.
//   node builds/notes/build-notes.mjs 01            all variants in episodes/01.mjs
//   node builds/notes/build-notes.mjs 01 notes-2    one variant
import { buildNotes } from "./notes-kit.mjs";

const [ep, only] = process.argv.slice(2);
if (!ep) {
  console.error("usage: node builds/notes/build-notes.mjs <episode, e.g. 01> [variant]");
  process.exit(1);
}
const { default: variants } = await import(new URL(`./episodes/${ep}.mjs`, import.meta.url));
const pick = variants.filter((v) => !only || v.name === only);
if (!pick.length) throw new Error(`no variant "${only}" in episodes/${ep}.mjs (have: ${variants.map((v) => v.name).join(", ")})`);
for (const v of pick) console.log(`${v.name}: wrote ${buildNotes(v)}`);
