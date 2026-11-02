import "./rtl-synthesis.css";
import { ReelScreen } from "../../iso/react/reel";
import { RtlArt, RtlReadout } from "./art";

export default function RtlSynthesisFigure() {
  return (
    <ReelScreen className="rt" readout={<RtlReadout />}>
      <RtlArt />
    </ReelScreen>
  );
}
