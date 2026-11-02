import "./bucket-stairs.css";
import "../../iso/analogy/water.css";
import { ReelScreen } from "../../iso/react/reel";
import { BsArt, BsReadout } from "./art";

// Chip-design fonts, loaded from the local fonts folder (kept out of the CSS bundle so esbuild does not try to inline them).
const FONTS = `@font-face{font-family:"JetBrains Mono";src:url("file:///D:/Anatomy/fonts/JetBrainsMono%5Bwght%5D.ttf") format("truetype");font-weight:100 800}
@font-face{font-family:"Oxanium";src:url("file:///D:/Anatomy/fonts/oxanium/Oxanium-Medium.ttf") format("truetype");font-weight:500}
@font-face{font-family:"Oxanium";src:url("file:///D:/Anatomy/fonts/oxanium/Oxanium-SemiBold.ttf") format("truetype");font-weight:600}
@font-face{font-family:"Type Machine";src:url("file:///D:/Anatomy/fonts/type_machine/Type%20Machine.ttf") format("truetype")}`;

export default function BucketStairsFigure() {
  return (
    <ReelScreen
      className="bs"
      readout={
        <>
          <style>{FONTS}</style>
          <BsReadout />
        </>
      }
    >
      <BsArt />
    </ReelScreen>
  );
}
