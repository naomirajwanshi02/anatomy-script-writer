import { createRoot } from "react-dom/client";
import Figure from "./figures/voltage-tower/figure";
import { setTimeMap } from "./figures/voltage-tower/live";
import { voiceToFigure } from "./figures/voltage-tower/voice";
import "./iso/iso.css";

// Voice-synced build: video t = audio t of chip-design episode 17.
setTimeMap(voiceToFigure);
createRoot(document.getElementById("root")!).render(<Figure />);
