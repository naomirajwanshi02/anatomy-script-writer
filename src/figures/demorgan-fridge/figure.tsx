import "./demorgan-fridge.css";
import { ReelScreen } from "../../iso/react/reel";
import { DfArt } from "./art";
import { DfTable } from "./live";

// Chip-design fonts, loaded from the local fonts folder (kept out of the CSS bundle so esbuild does not try to inline them).
const FONTS = `@font-face{font-family:"JetBrains Mono";src:url("__ANATOMY_ROOT__/fonts/JetBrainsMono%5Bwght%5D.ttf") format("truetype");font-weight:100 800}
@font-face{font-family:"Oxanium";src:url("__ANATOMY_ROOT__/fonts/oxanium/Oxanium-Medium.ttf") format("truetype");font-weight:500}
@font-face{font-family:"Oxanium";src:url("__ANATOMY_ROOT__/fonts/oxanium/Oxanium-SemiBold.ttf") format("truetype");font-weight:600}
@font-face{font-family:"Type Machine";src:url("__ANATOMY_ROOT__/fonts/type_machine/Type%20Machine.ttf") format("truetype")}`;

export default function DemorganFridgeFigure() {
  return (
    <ReelScreen className="df" readout={
        <>
          <style>{FONTS}</style>
          <div className="df-readouts">
            <DfTable />
          </div>
        </>
      }>
      <DfArt />
    </ReelScreen>
  );
}
