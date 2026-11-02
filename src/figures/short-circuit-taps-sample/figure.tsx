import "./short-circuit-taps-sample.css";
import { ReelScreen } from "../../iso/react/reel";
import { ScArt1, ScArt2, ScReadout } from "./art";

// Chip-design fonts, loaded from the local fonts folder (kept out of the CSS bundle so esbuild does not try to inline them).
// Merriweather only for the meter's rolling cup drums.
const FONTS = `@font-face{font-family:"JetBrains Mono";src:url("file:///D:/Anatomy/fonts/JetBrainsMono%5Bwght%5D.ttf") format("truetype");font-weight:100 800}
@font-face{font-family:"Oxanium";src:url("file:///D:/Anatomy/fonts/oxanium/Oxanium-Medium.ttf") format("truetype");font-weight:500}
@font-face{font-family:"Oxanium";src:url("file:///D:/Anatomy/fonts/oxanium/Oxanium-SemiBold.ttf") format("truetype");font-weight:600}
@font-face{font-family:"Type Machine";src:url("file:///D:/Anatomy/fonts/type_machine/Type%20Machine.ttf") format("truetype")}
@font-face{font-family:"Merriweather";src:url("file:///D:/Anatomy/fonts/merriweather/Merriweather_24pt-Bold.ttf") format("truetype");font-weight:700}`;

// Two frozen panels: ?panel=2 (or <html data-panel="2">) shows the circuit; otherwise the water analogy.
const panel = (): 1 | 2 => {
  if (typeof window === "undefined") return 1;
  const q = new URLSearchParams(window.location.search).get("panel");
  return q === "2" || document.documentElement.dataset.panel === "2" ? 2 : 1;
};

export default function ShortCircuitTapsSampleFigure() {
  const p = panel();
  return (
    <ReelScreen
      className="sc"
      readout={
        <>
          <style>{FONTS}</style>
          {p === 2 ? <ScReadout /> : null}
        </>
      }
    >
      {p === 2 ? <ScArt2 /> : <ScArt1 />}
    </ReelScreen>
  );
}
