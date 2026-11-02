import { createRoot } from "react-dom/client";
import Figure from "./figures/regen-convoy/figure";
import { setTimeMap } from "./figures/regen-convoy/live";
import { voiceToFigure } from "./figures/regen-convoy/voice";
import "./iso/iso.css";

// Voice-synced build: video t = audio t of chip-design episode 11.
setTimeMap(voiceToFigure);
createRoot(document.getElementById("root")!).render(<Figure />);
