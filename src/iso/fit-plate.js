// Fit each card to its board: crop the stage to the drawn parts, shrink the card padding,
// then add back only as much room as the corner readouts need so they never cover a part.
// Plain script, inlined after the bundle by builds/build-figure.mjs (and patched into older previews).
(() => {
  const SKIP = ".iso-halo, [class*='glow'], defs, defs *";
  const MARGIN = 10; // viewBox units around the parts
  const BASE_PAD = 12; // px
  const STEP = 4;
  const MAX_PAD = 260;

  const partsBox = (svg) => {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    svg.querySelectorAll("path, circle, ellipse, line, polygon, polyline, rect, text").forEach((el) => {
      if (el.matches(SKIP)) return;
      const b = el.getBoundingClientRect();
      if (!b.width && !b.height) return;
      x0 = Math.min(x0, b.left);
      y0 = Math.min(y0, b.top);
      x1 = Math.max(x1, b.right);
      y1 = Math.max(y1, b.bottom);
    });
    return isFinite(x0) ? { x0, y0, x1, y1 } : null;
  };

  // True if any sample point inside the overlay rect lands on a drawn part of this stage.
  const coversPart = (svg, r) => {
    for (let y = r.top + 1; y < r.bottom; y += 5)
      for (let x = r.left + 1; x < r.right; x += 5)
        for (const el of document.elementsFromPoint(x, y))
          if (el !== svg && svg.contains(el) && !el.matches(SKIP)) return true;
    return false;
  };

  const fitPlate = (plate) => {
    const svg = plate.querySelector("svg.iso-svg");
    // data-fit="off": the figure sizes its own cards (e.g. a row of cards that must match).
    if (!svg || plate.closest('[data-fit="off"]')) return;
    if (!svg.dataset.vb0) svg.dataset.vb0 = svg.getAttribute("viewBox");
    svg.setAttribute("viewBox", svg.dataset.vb0);
    const [vx, vy, vw] = svg.dataset.vb0.trim().split(/[\s,]+/).map(Number);
    const r = svg.getBoundingClientRect();
    if (!r.width) return;
    const box = partsBox(svg);
    if (!box) return;
    const k = vw / r.width;
    const nx = vx + (box.x0 - r.left) * k - MARGIN;
    const ny = vy + (box.y0 - r.top) * k - MARGIN;
    svg.setAttribute("viewBox", `${nx.toFixed(1)} ${ny.toFixed(1)} ${((box.x1 - box.x0) * k + 2 * MARGIN).toFixed(1)} ${((box.y1 - box.y0) * k + 2 * MARGIN).toFixed(1)}`);

    const pad = { top: BASE_PAD, bottom: BASE_PAD };
    const apply = () => (plate.style.padding = `${pad.top}px ${BASE_PAD}px ${pad.bottom}px`);
    apply();
    const overlays = [...plate.querySelectorAll(".iso-plate-corner, [class$='-counter']")].filter((el) => el.textContent.trim() || el.querySelector("svg, table"));
    for (let guard = 0; guard < 200; guard++) {
      const p = plate.getBoundingClientRect();
      let grew = false;
      for (const el of overlays) {
        const o = el.getBoundingClientRect();
        if (!o.width || !o.height) continue;
        const top = o.top + o.height / 2 < p.top + p.height / 2;
        const side = top ? "top" : "bottom";
        const outside = o.top < p.top + 4 || o.bottom > p.bottom - 4;
        // Overlays that ride on the stage (counters) move with the parts, so only keep them inside the card.
        const fixed = el.classList.contains("iso-plate-corner");
        if ((outside || (fixed && coversPart(svg, o))) && pad[side] < MAX_PAD) {
          pad[side] += STEP;
          grew = true;
        }
      }
      if (!grew) break;
      apply();
    }
  };

  const fitAll = () => document.querySelectorAll(".iso-plate").forEach(fitPlate);
  let tries = 0;
  const start = () => {
    if (!document.querySelector(".iso-plate svg.iso-svg")) {
      if (tries++ < 100) setTimeout(start, 50);
      return;
    }
    requestAnimationFrame(() => requestAnimationFrame(fitAll));
    setTimeout(fitAll, 600);
  };
  let resizeTimer = 0;
  addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(fitAll, 150);
  });
  start();
})();
