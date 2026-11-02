import { createRoot } from "react-dom/client";
import Figure from "./figures/hex-grouping/figure";
import { setTimeMap } from "./figures/hex-grouping/live";
import { voiceToFigure } from "./figures/hex-grouping/voice";
import "./iso/iso.css";

// Voice-synced build: video t = audio t of chip-design episode 01 (1.mp3).
setTimeMap(voiceToFigure);
createRoot(document.getElementById("root")!).render(<Figure />);
