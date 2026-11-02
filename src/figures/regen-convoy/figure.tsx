import "./regen-convoy.css";
import { ReelScreen } from "../../iso/react/reel";
import { RcArt } from "./art";

// Chip-design fonts, loaded from the local fonts folder (kept out of the CSS bundle so esbuild does not try to inline them).
const FONTS = `@font-face{font-family:"JetBrains Mono";src:url("file:///D:/Anatomy/fonts/JetBrainsMono%5Bwght%5D.ttf") format("truetype");font-weight:100 800}
@font-face{font-family:"Oxanium";src:url("file:///D:/Anatomy/fonts/oxanium/Oxanium-Medium.ttf") format("truetype");font-weight:500}
@font-face{font-family:"Oxanium";src:url("file:///D:/Anatomy/fonts/oxanium/Oxanium-SemiBold.ttf") format("truetype");font-weight:600}
@font-face{font-family:"Type Machine";src:url("file:///D:/Anatomy/fonts/type_machine/Type%20Machine.ttf") format("truetype")}`;

// No readout row below the board: the curve card and the voltage tags live inside the (tall) stage. The font style tag
// sits after the stage so the stage stays the first (sized) child of the reel centre.
export default function RegenConvoyFigure() {
  return (
    <ReelScreen className="rc">
      <RcArt />
      <style>{FONTS}</style>
    </ReelScreen>
  );
}
