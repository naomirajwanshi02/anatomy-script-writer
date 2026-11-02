import { createRoot } from "react-dom/client";
import Figure from "./figures/kmap-eggs/figure";
import { setTimeMap } from "./figures/kmap-eggs/live";
import { voiceToFigure } from "./figures/kmap-eggs/voice";
import "./iso/iso.css";

// Voice-synced build: video t = audio t of chip-design episode 08.
setTimeMap(voiceToFigure);
createRoot(document.getElementById("root")!).render(<Figure />);
