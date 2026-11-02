import "./taps.css";
import "../analogy/water.css";
import { ReelScreen } from "../react/reel";
import { TapsArt, TapsReadout } from "./art";
import type { TapsConfig } from "./config";

// Chip-design fonts, loaded from the local fonts folder (kept out of the CSS bundle so esbuild does not try to inline them).
// Merriweather only for the meter's rolling cup drums.
const FONTS = `@font-face{font-family:"JetBrains Mono";src:url("file:///D:/Anatomy/fonts/JetBrainsMono%5Bwght%5D.ttf") format("truetype");font-weight:100 800}
@font-face{font-family:"Oxanium";src:url("file:///D:/Anatomy/fonts/oxanium/Oxanium-Medium.ttf") format("truetype");font-weight:500}
@font-face{font-family:"Oxanium";src:url("file:///D:/Anatomy/fonts/oxanium/Oxanium-SemiBold.ttf") format("truetype");font-weight:600}
@font-face{font-family:"Type Machine";src:url("file:///D:/Anatomy/fonts/type_machine/Type%20Machine.ttf") format("truetype")}
@font-face{font-family:"Merriweather";src:url("file:///D:/Anatomy/fonts/merriweather/Merriweather_24pt-Bold.ttf") format("truetype");font-weight:700}`;

// The reel frame for one taps-world episode: the stage with the art, the readout under the circuit board.
export function TapsFigure({ cfg }: { cfg: TapsConfig }) {
  const below = cfg.readout?.below;
  return (
    <ReelScreen
      className="tw"
      readout={
        <>
          <style>{FONTS + (below !== undefined ? `.tw .reel-below{--tw-below:${below}}` : "")}</style>
          <TapsReadout cfg={cfg} />
        </>
      }
    >
      <TapsArt cfg={cfg} />
    </ReelScreen>
  );
}
