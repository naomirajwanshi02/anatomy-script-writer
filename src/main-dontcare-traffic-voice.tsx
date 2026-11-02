import { createRoot } from "react-dom/client";
import Figure from "./figures/dontcare-traffic/figure";
import { setTimeMap } from "./figures/dontcare-traffic/live";
import { voiceToFigure } from "./figures/dontcare-traffic/voice";
import "./iso/iso.css";

// Voice-synced build: video t = audio t of chip-design episode 09.
setTimeMap(voiceToFigure);
createRoot(document.getElementById("root")!).render(<Figure />);
