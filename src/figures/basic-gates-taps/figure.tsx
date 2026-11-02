import "./basic-gates-taps.css";
import "../../iso/reel.css";
import { TapsArt } from "./art";

// Three stacked rows fill the 9:16 frame, so this figure uses its own column instead of ReelScreen's single board.
export default function BasicGatesTapsFigure() {
  return (
    <div className="iso bg reel" data-theme="sepia" data-figure="">
      <TapsArt />
    </div>
  );
}
