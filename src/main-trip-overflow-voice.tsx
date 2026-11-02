import { createRoot } from "react-dom/client";
import Figure from "./figures/trip-overflow/figure";
import { setTimeMap } from "./figures/trip-overflow/live";
import { voiceToFigure } from "./figures/trip-overflow/voice";
import "./iso/iso.css";

// Voice-synced build: video t = audio t of chip-design episode 03.
setTimeMap(voiceToFigure);
createRoot(document.getElementById("root")!).render(<Figure />);
