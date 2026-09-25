const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function createGradientCanvas(host) {
  const canvas = document.createElement("canvas");
  canvas.className = "varp-hero-canvas";
  canvas.setAttribute("aria-hidden", "true");
  host.prepend(canvas);

  const context = canvas.getContext("2d", { alpha: false });
  if (!context) return;

  const noiseCanvas = document.createElement("canvas");
  const noiseContext = noiseCanvas.getContext("2d", { alpha: true });
  let width = 0;
  let height = 0;
  let lastNoise = -1;
  let frame = 0;

  function resize() {
    const bounds = host.getBoundingClientRect();
    const scale = Math.min(window.devicePixelRatio || 1, 1.35);
    width = Math.max(640, Math.round(bounds.width * scale * 0.78));
    height = Math.max(420, Math.round(bounds.height * scale * 0.78));
    canvas.width = width;
    canvas.height = height;
    noiseCanvas.width = Math.max(320, Math.round(width / 2));
    noiseCanvas.height = Math.max(210, Math.round(height / 2));
  }

  function drawNoise(seed) {
    if (!noiseContext || seed === lastNoise) return;
    lastNoise = seed;
    const image = noiseContext.createImageData(noiseCanvas.width, noiseCanvas.height);
    let state = (seed * 1103515245 + 12345) >>> 0;
    for (let index = 0; index < image.data.length; index += 4) {
      state = (state * 1664525 + 1013904223) >>> 0;
      const value = (state >>> 24) & 255;
      image.data[index] = value;
      image.data[index + 1] = value;
      image.data[index + 2] = value;
      image.data[index + 3] = 42;
    }
    noiseContext.putImageData(image, 0, 0);
  }

  function radial(x, y, radius, inner, outer = "rgba(0,0,0,0)") {
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, inner);
    gradient.addColorStop(1, outer);
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
  }

  function render(timestamp = 0) {
    const time = reduceMotion.matches ? 1.8 : timestamp * 0.001;
    const wave = Math.sin(time * 0.34);
    const drift = Math.sin(time * 0.19 + 1.2);
    const light = 0.78 + 0.22 * Math.sin(time * 0.42 - 0.7);

    const base = context.createLinearGradient(0, 0, 0, height);
    base.addColorStop(0, `rgb(${Math.round(20 + light * 24)} ${Math.round(20 + light * 18)} ${Math.round(18 + light * 14)})`);
    base.addColorStop(0.43, `rgb(${Math.round(104 + light * 46)} ${Math.round(103 + light * 40)} ${Math.round(98 + light * 34)})`);
    base.addColorStop(0.78, "rgb(224 223 219)");
    base.addColorStop(1, "rgb(251 251 250)");
    context.globalCompositeOperation = "source-over";
    context.globalAlpha = 1;
    context.fillStyle = base;
    context.fillRect(0, 0, width, height);

    context.globalCompositeOperation = "screen";
    context.globalAlpha = 1;
    radial(width * (0.06 + drift * 0.025), height * (-0.04 + wave * 0.025), width * 0.64, `rgba(255,67,5,${0.84 + light * 0.16})`);
    context.globalAlpha = 0.6;
    radial(width * (1.03 - drift * 0.035), height * 0.23, width * 0.42, "rgba(115,191,196,.82)");

    context.globalCompositeOperation = "multiply";
    context.globalAlpha = 0.86;
    radial(width * (0.64 + wave * 0.035), height * -0.05, width * 0.48, "rgba(20,19,17,.94)");

    context.globalCompositeOperation = "screen";
    context.globalAlpha = 0.88;
    radial(width * (0.02 + drift * 0.02), height * -0.08, width * 0.48, "rgba(255,58,0,.92)");

    context.globalCompositeOperation = "screen";
    context.globalAlpha = 0.72 + light * 0.22;
    const beamX = width * (0.79 + wave * 0.045);
    const beam = context.createLinearGradient(beamX - width * 0.18, 0, beamX + width * 0.2, height);
    beam.addColorStop(0, "rgba(255,255,255,0)");
    beam.addColorStop(0.42, "rgba(255,244,230,.14)");
    beam.addColorStop(0.57, "rgba(255,248,236,.92)");
    beam.addColorStop(0.72, "rgba(255,255,255,.18)");
    beam.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = beam;
    context.fillRect(0, 0, width, height);

    context.globalCompositeOperation = "screen";
    context.globalAlpha = 0.76;
    const bottomFade = context.createLinearGradient(0, height * 0.43, 0, height);
    bottomFade.addColorStop(0, "rgba(255,255,255,0)");
    bottomFade.addColorStop(1, "rgba(255,255,255,.96)");
    context.fillStyle = bottomFade;
    context.fillRect(0, 0, width, height);

    drawNoise(Math.floor(time * 9));
    context.globalCompositeOperation = "overlay";
    context.globalAlpha = 0.22;
    context.imageSmoothingEnabled = true;
    context.drawImage(noiseCanvas, 0, 0, width, height);
    context.globalAlpha = 1;
    context.globalCompositeOperation = "source-over";

    if (!reduceMotion.matches) frame = window.requestAnimationFrame(render);
  }

  resize();
  host.classList.add("is-canvas-ready");
  render();
  window.addEventListener("resize", resize, { passive: true });
  reduceMotion.addEventListener?.("change", () => {
    window.cancelAnimationFrame(frame);
    render();
  });
}

// The burst is a three.js model, loaded only at desktop widths where the hero shows it.
// The flat SVG stays in place if WebGL or the chunk fails.
function mountMark(host) {
  const desktop = window.matchMedia("(min-width: 1024px)");
  let started = false;

  function start() {
    if (started || !desktop.matches) return;
    started = true;
    host.classList.add("is-mark-loading");
    const giveUp = window.setTimeout(() => host.classList.remove("is-mark-loading"), 4000);
    import("./hero-mark-3d.js")
      .then(({ mountHeroMark }) => {
        mountHeroMark(host, { reduceMotion });
        host.classList.add("is-mark-ready");
      })
      .catch((error) => console.warn("3D mark unavailable", error))
      .finally(() => {
        window.clearTimeout(giveUp);
        host.classList.remove("is-mark-loading");
      });
  }

  start();
  desktop.addEventListener?.("change", start);
}

export function initHeroEffects() {
  const atmosphere = document.querySelector(".varp-hero-atmosphere");
  const burst = document.querySelector(".varp-hero-burst");
  if (atmosphere) createGradientCanvas(atmosphere);
  if (burst) mountMark(burst);
}
