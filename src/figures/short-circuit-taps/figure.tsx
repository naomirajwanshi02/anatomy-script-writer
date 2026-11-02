import { TapsFigure } from "../../iso/taps/figure";
import { CONFIG } from "./config";

// Episode 18: the taps-world kit (src/iso/taps) with this episode's config and model.
export default function ShortCircuitTapsFigure() {
  return <TapsFigure cfg={CONFIG} />;
}
