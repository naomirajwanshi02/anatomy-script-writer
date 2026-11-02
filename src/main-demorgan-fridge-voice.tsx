import { createRoot } from "react-dom/client";
import Figure from "./figures/demorgan-fridge/figure";
import { setTimeMap } from "./figures/demorgan-fridge/live";
import { voiceToFigure } from "./figures/demorgan-fridge/voice";
import "./iso/iso.css";

// Voice-synced build: video t = audio t of chip-design episode 07.
setTimeMap(voiceToFigure);
createRoot(document.getElementById("root")!).render(<Figure />);
