import { FaceText, Solid } from "../../iso/react/draw";
import { Sparks } from "../../iso/react/reel";
import { boardEngrave, boardSvg, cars, centreDash, contacts, dogMatrix, dogShadow, ENGRAVE, ENGRAVE_SIZE, road, sign, SIGN_SIZE } from "./geometry";
import { BRAND } from "./model";
import { CsLive } from "./live";

// The dog in its own 2D profile frame (u forward = +x here, y down, board units); strokes stay frame-weight.
function Dog() {
  return (
    <g className="cs-dog">
      <path className="cs-dog-shadow" d={dogShadow} />
      <g transform={dogMatrix}>
        {/* Legs mid-trot, straight down to the road: front pair spread, hind pair spread. */}
        <path className="cs-dog-leg" d="M7.6 -5.4L9.6 -0.3M6.6 -5.4L5 -0.3M-7.2 -5.4L-5.6 -0.3M-8.2 -5.4L-10 -0.3" />
        {/* Tail up. */}
        <path className="cs-dog-tail" d="M-10.6 -8C-12.6 -9.4 -13 -12 -12 -14.4" />
        {/* Horizontal body; head forward at shoulder height, snout. */}
        <ellipse className="cs-dog-fur" cx="0" cy="-7.4" rx="11" ry="3.4" />
        <ellipse className="cs-dog-fur" cx="16.2" cy="-9.4" rx="2.4" ry="1.4" />
        <circle className="cs-dog-fur" cx="13" cy="-10.2" r="3.1" />
        <path className="cs-dog-fill" d="M14.4 -9C15.4 -8.2 16.6 -8 18 -8.4" />
        {/* Ear, eye, nose. */}
        <path className="cs-dog-ear" d="M12.2 -13.1C10.2 -13.2 9.4 -11 10.2 -9C11.4 -9.4 12.4 -11 12.6 -12.8Z" />
        <circle className="cs-dog-dark" cx="14" cy="-11.2" r="0.6" />
        <circle className="cs-dog-dark" cx="18.4" cy="-9.6" r="0.8" />
      </g>
    </g>
  );
}

// Static art: the board (rises) with the road and engraving; the parts (fall): dog, five cars, roadside sign.
export function CsArt() {
  return (
    <CsLive>
      <g data-entry="">
        <g data-base="">
          <g data-board="" dangerouslySetInnerHTML={{ __html: boardSvg }} />
          <g className="cs-engrave">
            <FaceText transform={boardEngrave} size={ENGRAVE_SIZE} tone="mid" anchor="middle">
              {ENGRAVE}
            </FaceText>
          </g>
          <path className="cs-tar" d={road.base} />
          <path className="cs-edge" d={road.edges} />
          <path className="cs-centre" d={road.centre} strokeDasharray={centreDash} />
        </g>
        <g data-parts="">
          {cars.map((c) => (
            <g key={c.id} className={`cs-car cs-${c.id}`} dangerouslySetInnerHTML={{ __html: c.svg }} />
          ))}
          <Dog />
          <g className="cs-sign">
            {sign.posts.map((p, i) => (
              <Solid key={i} paths={p} tone="mid" crease="none" className="cs-post" />
            ))}
            <Solid paths={sign.plate} tone="hi" crease="lo" className="cs-plate" />
            <FaceText transform={sign.textAt} size={SIGN_SIZE} tone="hi" anchor="middle">
              {BRAND}
            </FaceText>
          </g>
        </g>
        <Sparks points={contacts.length} />
      </g>
    </CsLive>
  );
}
