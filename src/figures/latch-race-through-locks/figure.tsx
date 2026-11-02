import "./latch-race-through-locks.css";
import { ReelScreen } from "../../iso/react/reel";
import { LocksArt } from "./art";

export default function LatchRaceThroughLocksFigure() {
  return (
    <ReelScreen className="lk">
      <LocksArt />
    </ReelScreen>
  );
}
