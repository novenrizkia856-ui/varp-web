// Hero mark rendered as a real 3D object: the traced VARP burst as one thin sheet
// with a satin finish, wrapped around its heart like a flower. A tight wrap reads
// as a closed bud and a gentle one as an open, cupped bloom. Loaded lazily by
// hero-effects.js.
import {
  AmbientLight,
  BufferGeometry,
  Color,
  DirectionalLight,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  NeutralToneMapping,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  ShapeUtils,
  SRGBColorSpace,
  Vector2,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { MARK_HEART, MARK_PIECES, markBounds } from "./varp-mark-geometry.js";

// Sheet thickness in mark units.
const THICKNESS = 0.16;
// Longest triangle edge after subdivision, so the wrap bends smoothly.
const MAX_EDGE = 0.9;
// Wrap curvature (1 / sphere radius) for the open bloom and the closed bud.
const OPEN = 0.026;
const BUD = 0.15;
const FOV = 26;
// Share of the canvas half width the resting mark should fill.
const FILL = 0.68;

const easeOutBack = (t) => {
  const c = 1.2;
  return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2;
};
const easeOutCubic = (t) => 1 - (1 - t) ** 3;
const clamp01 = (value) => Math.min(1, Math.max(0, value));

// Outline points relative to the heart, y up, wound counter clockwise.
const PIECES = MARK_PIECES.map((piece) => {
  const points = piece.map(([x, y]) => [x - MARK_HEART[0], MARK_HEART[1] - y]);
  return ShapeUtils.area(points.map(([x, y]) => new Vector2(x, y))) < 0 ? points.reverse() : points;
});

const midpoint = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

// Flat sheet: subdivided front and back faces plus a rim. Uniform midpoint
// subdivision keeps every shared edge conforming, and the rim is split to match,
// so nothing cracks once the shader bends it.
function sheetGeometry() {
  const positions = [];
  const normals = [];
  const colors = [];
  const warm = new Color("#ff5a0a");
  const deep = new Color("#ef2a0a");
  const shade = new Color();
  const push = ([x, y], z, normal) => {
    positions.push(x, y, z);
    normals.push(...normal);
    // Upper right runs orange, the heavy lower left blades a deeper red.
    shade.copy(warm).lerp(deep, clamp01(0.45 - (x + y) / 28));
    colors.push(shade.r, shade.g, shade.b);
  };

  for (const piece of PIECES) {
    const faces = ShapeUtils.triangulateShape(piece.map(([x, y]) => new Vector2(x, y)), []);
    let triangles = faces.map((face) => face.map((index) => piece[index]));
    const longest = Math.max(...triangles.flatMap(([a, b, c]) => [distance(a, b), distance(b, c), distance(c, a)]));
    const levels = Math.max(0, Math.ceil(Math.log2(longest / MAX_EDGE)));
    for (let level = 0; level < levels; level += 1) {
      triangles = triangles.flatMap(([a, b, c]) => {
        const ab = midpoint(a, b);
        const bc = midpoint(b, c);
        const ca = midpoint(c, a);
        return [[a, ab, ca], [ab, b, bc], [ca, bc, c], [ab, bc, ca]];
      });
    }
    const half = THICKNESS / 2;
    for (let [a, b, c] of triangles) {
      if ((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]) < 0) [b, c] = [c, b];
      [a, b, c].forEach((point) => push(point, half, [0, 0, 1]));
      [a, c, b].forEach((point) => push(point, -half, [0, 0, -1]));
    }

    const splits = 2 ** levels;
    const rim = piece.flatMap((point, index) => {
      const next = piece[(index + 1) % piece.length];
      return Array.from({ length: splits }, (_, step) => [
        point[0] + ((next[0] - point[0]) * step) / splits,
        point[1] + ((next[1] - point[1]) * step) / splits,
      ]);
    });
    rim.forEach((point, index) => {
      const next = rim[(index + 1) % rim.length];
      const length = distance(point, next) || 1;
      const outward = [(next[1] - point[1]) / length, (point[0] - next[0]) / length, 0];
      push(point, half, outward);
      push(point, -half, outward);
      push(next, half, outward);
      push(next, half, outward);
      push(point, -half, outward);
      push(next, -half, outward);
    });
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new Float32BufferAttribute(normals, 3));
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  return geometry;
}

// Wraps the flat sheet onto a sphere of curvature uCurve that touches it at the
// heart, bowing toward the viewer. Distances from the heart are preserved, so the
// petals fold rather than stretch.
function wrapMaterial(material, curve) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uCurve = curve;
    shader.vertexShader = `uniform float uCurve;\n${shader.vertexShader}`
      .replace(
        "#include <beginnormal_vertex>",
        `#include <beginnormal_vertex>
        {
          float r = length(position.xy);
          vec2 dir = r > 1e-5 ? position.xy / r : vec2(1.0, 0.0);
          float a = r * uCurve;
          float nr = dot(objectNormal.xy, dir);
          vec2 nt = objectNormal.xy - nr * dir;
          objectNormal = vec3(nt + (nr * cos(a) - objectNormal.z * sin(a)) * dir, nr * sin(a) + objectNormal.z * cos(a));
        }`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        {
          float r = length(position.xy);
          vec2 dir = r > 1e-5 ? position.xy / r : vec2(1.0, 0.0);
          float a = r * uCurve;
          float sinc = a > 1e-4 ? sin(a) / a : 1.0;
          float lift = a > 1e-4 ? (1.0 - cos(a)) / a : 0.0;
          transformed = vec3(dir * (r * sinc - position.z * sin(a)), r * lift + position.z * cos(a));
        }`,
      );
  };
  return material;
}

function buildMark() {
  const curve = { value: BUD };
  const material = wrapMaterial(
    new MeshPhysicalMaterial({
      vertexColors: true,
      emissive: new Color("#ff3300"),
      emissiveIntensity: 0.08,
      roughness: 0.5,
      metalness: 0,
      clearcoat: 0.35,
      clearcoatRoughness: 0.3,
      sheen: 0.35,
      sheenRoughness: 0.4,
      sheenColor: new Color("#ff7a45"),
    }),
    curve,
  );
  const mesh = new Mesh(sheetGeometry(), material);
  // The shader moves vertices, so the flat bounding sphere cannot be trusted.
  mesh.frustumCulled = false;

  // Centre the burst on its bounding box instead of the off centre heart.
  const bounds = markBounds();
  const mark = new Group();
  mark.add(mesh);
  mark.position.set(MARK_HEART[0] - (bounds.minX + bounds.maxX) / 2, (bounds.minY + bounds.maxY) / 2 - MARK_HEART[1], 0);
  const radius = Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY) / 2;

  const pivot = new Group();
  pivot.add(mark);
  return { pivot, mesh, curve, radius };
}

export function mountHeroMark(host, { reduceMotion }) {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.className = "varp-hero-mark-canvas";
  canvas.setAttribute("aria-hidden", "true");

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.035).texture;
  // A dim studio keeps reflections on the sheet without bleaching the red.
  scene.environmentIntensity = 0.3;
  pmrem.dispose();

  // Warm key from the upper left, matching the hero glow, and a cool rim from the right.
  const key = new DirectionalLight("#fff1e6", 2.2);
  key.position.set(-18, 26, 30);
  const rim = new DirectionalLight("#dff6ff", 1.6);
  rim.position.set(30, 6, -12);
  const fill = new DirectionalLight("#ff9b6b", 0.7);
  fill.position.set(0, -24, 18);
  scene.add(key, rim, fill, new AmbientLight("#ffffff", 0.1));

  const { pivot, mesh, curve, radius } = buildMark();
  scene.add(pivot);

  const camera = new PerspectiveCamera(FOV, 1, 1, 400);
  camera.position.set(0, 0, radius / (FILL * Math.tan((FOV * Math.PI) / 360)));
  camera.lookAt(0, 0, 0);

  function resize() {
    const bounds = host.getBoundingClientRect();
    const side = Math.max(1, Math.round(Math.min(bounds.width, bounds.height) * 0.86));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(side, side);
  }

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  function onPointerMove(event) {
    pointer.tx = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = (event.clientY / window.innerHeight) * 2 - 1;
  }

  const start = performance.now();
  function pose(now) {
    const still = reduceMotion.matches;
    const t = still ? 6 : (now - start) / 1000;

    // Bloom: the bud relaxes into the open cup, then the petals breathe gently.
    const bloom = still ? 1 : easeOutBack(clamp01((t - 0.1) / 1.6));
    const breathe = still ? 0 : Math.sin(t * 1.05) * 0.06;
    curve.value = BUD + (OPEN * (1 + breathe) - BUD) * bloom;
    mesh.scale.setScalar(still ? 1 : 0.55 + 0.45 * easeOutCubic(clamp01(t / 1.2)));

    if (!still) {
      pointer.x += (pointer.tx - pointer.x) * 0.045;
      pointer.y += (pointer.ty - pointer.y) * 0.045;
    }
    const intro = still ? 1 : easeOutCubic(clamp01(t / 1.6));
    pivot.rotation.set(
      0.14 + Math.sin(t * 0.37 + 1) * 0.06 + pointer.y * 0.22,
      -0.22 + Math.sin(t * 0.45) * 0.16 + pointer.x * 0.34,
      (1 - intro) * -0.7 + Math.sin(t * 0.21) * 0.04,
    );
    pivot.position.y = still ? 0 : Math.sin(t * 0.8) * 0.45;
  }

  let frame = 0;
  let visible = true;
  function render(now = performance.now()) {
    frame = 0;
    pose(now);
    renderer.render(scene, camera);
    if (visible && !reduceMotion.matches && !document.hidden) frame = window.requestAnimationFrame(render);
  }
  const wake = () => {
    if (!frame) frame = window.requestAnimationFrame(render);
  };

  resize();
  host.append(canvas);
  render();

  new ResizeObserver(() => {
    resize();
    if (!frame) render();
  }).observe(host);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) wake();
  }).observe(host);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) wake();
  });
  reduceMotion.addEventListener?.("change", wake);
  window.addEventListener("pointermove", onPointerMove, { passive: true });
}
