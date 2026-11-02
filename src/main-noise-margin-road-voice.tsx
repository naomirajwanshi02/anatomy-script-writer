import { createRoot } from "react-dom/client";
import Figure from "./figures/noise-margin-road/figure";
import { setTimeMap } from "./figures/noise-margin-road/live";
import { voiceToFigure } from "./figures/noise-margin-road/voice";
import "./iso/iso.css";

// Voice-synced build: video t = audio t of chip-design episode 10.
setTimeMap(voiceToFigure);
createRoot(document.getElementById("root")!).render(<Figure />);
