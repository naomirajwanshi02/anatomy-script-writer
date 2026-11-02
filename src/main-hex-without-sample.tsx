import { createRoot } from "react-dom/client";
import Figure from "./figures/hex-without-sample/figure";
import "./iso/iso.css";

createRoot(document.getElementById("root")!).render(<Figure />);
