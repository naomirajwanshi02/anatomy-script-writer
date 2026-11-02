import "./trip-overflow.css";
import { ReelScreen } from "../../iso/react/reel";
import { TovArt } from "./art";
import { TovTable } from "./live";

// Fonts from the local fonts folder (kept out of the CSS bundle so esbuild does not try to inline them).
const FONTS = `@font-face{font-family:"JetBrains Mono";src:url("__ANATOMY_ROOT__/fonts/JetBrainsMono%5Bwght%5D.ttf") format("truetype");font-weight:100 800}
@font-face{font-family:"Oxanium";src:url("__ANATOMY_ROOT__/fonts/oxanium/Oxanium-Medium.ttf") format("truetype");font-weight:500}
@font-face{font-family:"Oxanium";src:url("__ANATOMY_ROOT__/fonts/oxanium/Oxanium-SemiBold.ttf") format("truetype");font-weight:600}
@font-face{font-family:"Merriweather";src:url("__ANATOMY_ROOT__/fonts/merriweather/Merriweather_24pt-Bold.ttf") format("truetype");font-weight:700}
@font-face{font-family:"Type Machine";src:url("__ANATOMY_ROOT__/fonts/type_machine/Type%20Machine.ttf") format("truetype")}`;

export default function TripOverflowFigure() {
  return (
    <ReelScreen className="tov" readout={
        <>
          <style>{FONTS}</style>
          <TovTable />
        </>
      }>
      <TovArt />
    </ReelScreen>
  );
}
