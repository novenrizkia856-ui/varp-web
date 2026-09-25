// Writes the flat hero burst from the same traced outline the 3D mark uses. The SVG is
// the fallback shown while three.js loads, or when WebGL is unavailable.
import { writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { MARK_PIECES, markBounds } from "../assets/js/varp-mark-geometry.js";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const target = resolve(projectRoot, "assets/images/varp-hero-burst.svg");

// The mark spans 80% of an 800 unit square, centred on its bounding box.
const bounds = markBounds();
const span = Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY);
const scale = 640 / span;
const offsetX = 400 - ((bounds.minX + bounds.maxX) / 2) * scale;
const offsetY = 400 - ((bounds.minY + bounds.maxY) / 2) * scale;
const round = (value) => Math.round(value * 10) / 10;

const paths = MARK_PIECES
  .map((points) => {
    const [first, ...rest] = points.map(([x, y]) => `${round(x * scale + offsetX)} ${round(y * scale + offsetY)}`);
    return `    <path d="M${first}L${rest.join("L")}Z"/>`;
  })
  .join("\n");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" fill="none">
  <defs>
    <linearGradient id="petal" x1="260" y1="80" x2="520" y2="720" gradientUnits="userSpaceOnUse">
      <stop stop-color="#ff6326"/>
      <stop offset=".55" stop-color="#ff431c"/>
      <stop offset="1" stop-color="#e02b16"/>
    </linearGradient>
  </defs>
  <g fill="url(#petal)">
${paths}
  </g>
</svg>
`;

await writeFile(target, svg);
console.log(`Hero mark written to ${target}`);
