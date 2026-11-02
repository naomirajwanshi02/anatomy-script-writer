import { createRoot } from "react-dom/client";
import Figure from "./figures/parity-wash/figure";
import { setTimeMap } from "./figures/parity-wash/live";
import { voiceToFigure } from "./figures/parity-wash/voice";
import "./iso/iso.css";

// Voice-synced build: video t = audio t of chip-design episode 05.
setTimeMap(voiceToFigure);
createRoot(document.getElementById("root")!).render(<Figure />);
