import "./wider-is-faster-pipes.css";
import { ReelScreen } from "../../iso/react/reel";
import { WiderPipesArt, WiderPipesReadout } from "./art";

export default function WiderIsFasterPipesFigure() {
  return (
    <ReelScreen className="cmos wfp" readout={<WiderPipesReadout />}>
      <WiderPipesArt />
    </ReelScreen>
  );
}
