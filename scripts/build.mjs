import { cp, mkdir, readFile, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, "..");
const outputDirectory = resolve(projectRoot, "dist");

const requiredFiles = [
  "index.html",
  "app.html",
  "docs.html",
  "assets/css/docs.css",
  "assets/css/base.css",
  "assets/css/custom.css",
  "assets/js/config.js",
  "assets/js/registry-abi.js",
  "assets/js/profiles-data.js",
  "assets/js/emblems.js",
  "assets/js/docs.js",
  "assets/js/landing.js",
  "assets/js/hero-effects.js",
  "assets/js/hero-mark-3d.js",
  "assets/js/varp-mark-geometry.js",
  "assets/js/app.js",
];

for (const file of requiredFiles) {
  await readFile(resolve(projectRoot, file));
}

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });
await cp(resolve(projectRoot, "index.html"), resolve(outputDirectory, "index.html"));
await cp(resolve(projectRoot, "app.html"), resolve(outputDirectory, "app.html"));
await cp(resolve(projectRoot, "docs.html"), resolve(outputDirectory, "docs.html"));
await cp(resolve(projectRoot, "assets"), resolve(outputDirectory, "assets"), { recursive: true });

await build({
  entryPoints: {
    app: resolve(projectRoot, "assets/js/app.js"),
    landing: resolve(projectRoot, "assets/js/landing.js"),
  },
  outdir: resolve(outputDirectory, "assets/js"),
  bundle: true,
  format: "esm",
  splitting: true,
  minify: true,
  sourcemap: false,
  target: ["es2020"],
  legalComments: "none",
  entryNames: "[name]",
  chunkNames: "chunks/[name]-[hash]",
});

console.log(`Static build written to ${outputDirectory}`);
