import "./cmos-inverter-taps.css";
import { ReelScreen } from "../../iso/react/reel";
import { InverterReadout, InverterTapsArt } from "./art";

export default function CmosInverterTapsFigure() {
  return (
    <ReelScreen className="cmos inv" readout={<InverterReadout />}>
      <InverterTapsArt />
    </ReelScreen>
  );
}
