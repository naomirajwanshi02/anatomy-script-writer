import { createRoot } from "react-dom/client";
import Figure from "./figures/tristate-tank/figure";
import "./iso/iso.css";

// Voice-synced figure: video t = audio t of chip-design episode 15 (the model's timeline is in voice seconds).
createRoot(document.getElementById("root")!).render(<Figure />);
