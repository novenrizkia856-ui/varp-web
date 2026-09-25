// The VARP burst, fitted to assets/images/varp-mark.webp in 64 px mark units (y down).
// Each petal is a tapered capsule: a circle of radius w0 at distance r0 from the hub,
// joined by its outer tangents to a circle of radius w1 at distance r1.
// Angles are degrees measured from +x, clockwise on screen.
export const MARK_HUB = [37.26, 30.34];

export const MARK_PETALS = [
  { angle: -126.8, r0: 4.79, r1: 12.87, w0: 1.07, w1: 2.14 },
  { angle: -93.0, r0: 3.15, r1: 8.94, w0: 0.65, w1: 1.59 },
  { angle: -49.5, r0: 2.32, r1: 5.66, w0: 1.38, w1: 1.45 },
  { angle: 11.9, r0: 1.83, r1: 5.46, w0: 0.46, w1: 1.59 },
  { angle: 56.6, r0: 3.99, r1: 9.16, w0: 0.89, w1: 1.6 },
  { angle: 91.1, r0: 3.96, r1: 12.93, w0: 0.97, w1: 2.26 },
  { angle: 135.3, r0: 2.64, r1: 14.07, w0: 1.31, w1: 3.55 },
  { angle: -168.8, r0: 3.22, r1: 14.18, w0: 0.96, w1: 3.54 },
];

// Angle of the tangent points on each end circle, measured from the petal axis.
export function tangentAngle({ r0, r1, w0, w1 }) {
  return Math.PI / 2 + Math.asin((w1 - w0) / (r1 - r0));
}

// Outline of one petal in its own frame: x runs out from the hub along the petal.
// `inset` shrinks both end circles, which leaves room for a 3D bevel.
export function petalOutline(petal, inset = 0, steps = 20) {
  const w0 = Math.max(0.1, petal.w0 - inset);
  const w1 = Math.max(0.1, petal.w1 - inset);
  const phi = tangentAngle({ ...petal, w0, w1 });
  const points = [];
  for (let step = 0; step <= steps; step += 1) {
    const angle = -phi + (2 * phi * step) / steps;
    points.push([petal.r1 + w1 * Math.cos(angle), w1 * Math.sin(angle)]);
  }
  for (let step = 0; step <= steps; step += 1) {
    const angle = phi + (2 * (Math.PI - phi) * step) / steps;
    points.push([petal.r0 + w0 * Math.cos(angle), w0 * Math.sin(angle)]);
  }
  return points;
}

// Every petal outline in mark space, relative to the hub, y down.
export function markOutlines(inset = 0, steps = 20) {
  return MARK_PETALS.map((petal) => {
    const radians = (petal.angle * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    return petalOutline(petal, inset, steps).map(([x, y]) => [x * cos - y * sin, x * sin + y * cos]);
  });
}

// Bounding box of the whole mark relative to the hub.
export function markBounds() {
  const points = markOutlines().flat();
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
}
