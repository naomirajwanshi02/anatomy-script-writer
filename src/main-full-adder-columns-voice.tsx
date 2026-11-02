import { createRoot } from "react-dom/client";
import Figure from "./figures/full-adder-columns/figure";
import { setTimeMap } from "./figures/full-adder-columns/live";
import { voiceToFigure } from "./figures/full-adder-columns/voice";
import "./iso/iso.css";

// Voice-synced build: video t = audio t of chip-design episode 12.
setTimeMap(voiceToFigure);
createRoot(document.getElementById("root")!).render(<Figure />);
