import "./noise-margin-road.css";
import { ReelScreen } from "../../iso/react/reel";
import { NmArt } from "./art";

// Chip-design fonts, loaded from the local fonts folder (kept out of the CSS bundle so esbuild does not try to inline them).
const FONTS = `@font-face{font-family:"JetBrains Mono";src:url("__ANATOMY_ROOT__/fonts/JetBrainsMono%5Bwght%5D.ttf") format("truetype");font-weight:100 800}
@font-face{font-family:"Oxanium";src:url("__ANATOMY_ROOT__/fonts/oxanium/Oxanium-Medium.ttf") format("truetype");font-weight:500}
@font-face{font-family:"Oxanium";src:url("__ANATOMY_ROOT__/fonts/oxanium/Oxanium-SemiBold.ttf") format("truetype");font-weight:600}
@font-face{font-family:"Type Machine";src:url("__ANATOMY_ROOT__/fonts/type_machine/Type%20Machine.ttf") format("truetype")}`;

// No readout row below the board: the voltage readout rides beside the marker inside the stage. The font style tag
// sits after the stage so the stage stays the first (sized) child of the reel centre.
export default function NoiseMarginRoadFigure() {
  return (
    <ReelScreen className="nm">
      <NmArt />
      <style>{FONTS}</style>
    </ReelScreen>
  );
}
