import { createRoot } from "react-dom/client";
import Figure from "./figures/volume-gray/figure";
import { setTimeMap } from "./figures/volume-gray/live";
import { voiceToFigure } from "./figures/volume-gray/voice";
import "./iso/iso.css";

// Voice-synced build: video t = audio t of chip-design episode 06.
setTimeMap(voiceToFigure);
createRoot(document.getElementById("root")!).render(<Figure />);
