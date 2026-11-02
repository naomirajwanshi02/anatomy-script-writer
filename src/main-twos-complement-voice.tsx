import { createRoot } from "react-dom/client";
import Figure from "./figures/twos-complement/figure";
import { setTimeMap } from "./figures/twos-complement/live";
import { voiceToFigure } from "./figures/twos-complement/voice";
import "./iso/iso.css";

// Voice-synced build: video t = audio t of chip-design episode 02.
setTimeMap(voiceToFigure);
createRoot(document.getElementById("root")!).render(<Figure />);
