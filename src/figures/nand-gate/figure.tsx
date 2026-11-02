import "./nand-gate.css";
import { ReelScreen } from "../../iso/react/reel";
import { NandArt } from "./art";
import { TruthTable } from "./live";

export default function NandGateFigure() {
  return (
    <ReelScreen className="gate" readout={<TruthTable />}>
      <NandArt />
    </ReelScreen>
  );
}
