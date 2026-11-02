import { createRoot } from "react-dom/client";
import Figure from "./figures/regen-convoy2/figure";
import { setTimeMap } from "./figures/regen-convoy2/live";
import { voiceToFigure } from "./figures/regen-convoy2/voice";
import "./iso/iso.css";

// Voice-synced build: video t = audio t of chip-design episode 11.
setTimeMap(voiceToFigure);
createRoot(document.getElementById("root")!).render(<Figure />);
