// Hero mark rendered as a real 3D object. Each petal of the VARP burst is a thin,
// paper like sheet with a satin finish. Loaded lazily by hero-effects.js.
import {
  AmbientLight,
  Color,
  DirectionalLight,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  NeutralToneMapping,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  Shape,
  SRGBColorSpace,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { MARK_PETALS, markBounds, petalOutline } from "./varp-mark-geometry.js";

// Sheet thickness in mark units, with a hairline bevel so the edges catch light.
const THICKNESS = 0.16;
const BEVEL = 0.05;
const FOV = 26;
// Share of the canvas half width the resting mark should fill.
const FILL = 0.68;
// Outer ends lift toward the viewer so the burst sits like an opening flower.
const CUP = 0.26;

const easeOutBack = (t) => {
  const c = 1.45;
  return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2;
};
const easeOutCubic = (t) => 1 - (1 - t) ** 3;
const clamp01 = (value) => Math.min(1, Math.max(0, value));

// Each petal is the flat mark outline extruded into a thin sheet.
function petalGeometry(petal) {
  const shape = new Shape();
  petalOutline(petal, BEVEL, 40).forEach(([x, y], index) => (index ? shape.lineTo(x, y) : shape.moveTo(x, y)));
  shape.closePath();
  const geometry = new ExtrudeGeometry(shape, {
    depth: THICKNESS,
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: BEVEL,
    bevelSegments: 2,
    curveSegments: 1,
  });
  // Pivot each petal on its root so the bloom and cup rotate from the hub.
  geometry.translate(-petal.r0, 0, -THICKNESS / 2);
  geometry.computeVertexNormals();
  return geometry;
}

function buildMark() {
  const warm = new Color("#ff5a0a");
  const deep = new Color("#f02a08");
  const mark = new Group();
  const petals = MARK_PETALS.map((petal, index) => {
    // Upper petals catch more orange, the heavy lower left blades run deeper red.
    const lean = clamp01((Math.sin((petal.angle * Math.PI) / 180) + 1) / 2);
    const material = new MeshPhysicalMaterial({
      color: warm.clone().lerp(deep, lean * 0.85),
      emissive: new Color("#ff3300"),
      emissiveIntensity: 0.08,
      roughness: 0.5,
      metalness: 0,
      clearcoat: 0.35,
      clearcoatRoughness: 0.3,
      sheen: 0.35,
      sheenRoughness: 0.4,
      sheenColor: new Color("#ff7a45"),
    });
    const mesh = new Mesh(petalGeometry(petal), material);
    const spin = new Group();
    // Mark space is y down; world space is y up.
    spin.rotation.z = (-petal.angle * Math.PI) / 180;
    const hinge = new Group();
    hinge.position.x = petal.r0;
    hinge.add(mesh);
    spin.add(hinge);
    mark.add(spin);
    return { hinge, mesh, index, phase: index * 0.83 };
  });

  // Centre the burst on its bounding box instead of the off centre hub.
  const bounds = markBounds();
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;
  mark.position.set(-centerX, centerY, 0);
  const radius = Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY) / 2;

  const pivot = new Group();
  pivot.add(mark);
  return { pivot, petals, radius };
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
  // A dim studio keeps reflections on the lacquer without bleaching the red.
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

  const { pivot, petals, radius } = buildMark();
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

    petals.forEach(({ hinge, mesh, index, phase }) => {
      // Staggered bloom: petals unfold from closed buds to an open, cupped burst.
      const local = still ? 1 : clamp01((t - 0.12 - index * 0.075) / 1.25);
      const open = easeOutBack(local);
      const breathe = still ? 0 : Math.sin(t * 1.05 + phase) * 0.035;
      hinge.rotation.y = -(CUP + breathe) - (1 - open) * 1.35;
      const scale = 0.35 + 0.65 * easeOutCubic(local);
      mesh.scale.setScalar(scale);
    });

    if (!still) {
      pointer.x += (pointer.tx - pointer.x) * 0.045;
      pointer.y += (pointer.ty - pointer.y) * 0.045;
    }
    const intro = still ? 1 : easeOutCubic(clamp01(t / 1.6));
    pivot.rotation.set(
      0.16 + Math.sin(t * 0.37 + 1) * 0.07 + pointer.y * 0.22,
      -0.3 + Math.sin(t * 0.45) * 0.2 + pointer.x * 0.34,
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
