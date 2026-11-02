import { createRoot } from "react-dom/client";
import Figure from "./figures/nand-gate/figure";
import "./iso/iso.css";

createRoot(document.getElementById("root")!).render(<Figure />);
