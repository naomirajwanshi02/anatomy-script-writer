import { createRoot } from "react-dom/client";
import Figure from "./figures/bcd-clock/figure";
import { setTimeMap } from "./figures/bcd-clock/live";
import { voiceToFigure } from "./figures/bcd-clock/voice";
import "./iso/iso.css";

// Voice-synced build: video t = audio t of chip-design episode 04.
setTimeMap(voiceToFigure);
createRoot(document.getElementById("root")!).render(<Figure />);
