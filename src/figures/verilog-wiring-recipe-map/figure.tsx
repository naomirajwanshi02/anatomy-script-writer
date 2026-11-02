import "./verilog-wiring-recipe-map.css";
import { ReelScreen } from "../../iso/react/reel";
import { RecipeMapArt, RecipeMapReadout } from "./art";

export default function VerilogWiringRecipeMapFigure() {
  return (
    <ReelScreen className="rm" readout={<RecipeMapReadout />}>
      <RecipeMapArt />
    </ReelScreen>
  );
}
