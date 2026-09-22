// Animated display pictures for Rights Profiles. Motion lives in custom.css (.emb-*).
const palettes = {
  stock: ["#7c3aed", "#312e81"],
  yield: ["#0ea5e9", "#1e3a8a"],
  access: ["#f59e0b", "#c2410c"],
  index: ["#64748b", "#1e293b"],
};

const shapes = {
  stock: `
    <path class="emb-grid" d="M14 44h36M14 36h36M14 28h36" />
    <g class="emb-bars">
      <rect x="16" y="34" width="5" height="12" rx="1.5" style="--d:0s" />
      <rect x="25" y="28" width="5" height="18" rx="1.5" style="--d:.15s" />
      <rect x="34" y="31" width="5" height="15" rx="1.5" style="--d:.3s" />
      <rect x="43" y="20" width="5" height="26" rx="1.5" style="--d:.45s" />
    </g>
    <path class="emb-trend" d="M15 36 L27 26 L36 30 L49 16" pathLength="100" />
    <circle class="emb-spark" cx="49" cy="16" r="2.6" />`,
  yield: `
    <g class="emb-waves">
      <path class="emb-wave emb-wave-a" d="M-32 42 q8 -6 16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0" />
      <path class="emb-wave emb-wave-b" d="M-32 48 q8 -5 16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0" />
    </g>
    <g class="emb-coin">
      <circle cx="32" cy="25" r="11" />
      <path d="M32 19v12M28.5 22.5h5a2.5 2.5 0 0 1 0 5h-3a2.5 2.5 0 0 0 0 5h5" transform="translate(0 -2.5)" />
    </g>`,
  access: `
    <g class="emb-orbit emb-orbit-a"><ellipse cx="32" cy="32" rx="21" ry="9" /><circle cx="53" cy="32" r="2.4" /></g>
    <g class="emb-orbit emb-orbit-b"><ellipse cx="32" cy="32" rx="21" ry="9" /><circle cx="11" cy="32" r="2" /></g>
    <g class="emb-lock">
      <circle cx="32" cy="29" r="6.5" />
      <path d="M29 34h6l1.5 9h-9z" />
    </g>`,
  index: `
    <circle class="emb-ring" cx="32" cy="32" r="21" pathLength="100" />
    <g class="emb-dots">
      <circle cx="24" cy="24" r="3" style="--d:0s" /><circle cx="32" cy="24" r="3" style="--d:.2s" /><circle cx="40" cy="24" r="3" style="--d:.4s" />
      <circle cx="24" cy="32" r="3" style="--d:.6s" /><circle cx="32" cy="32" r="3" style="--d:.8s" /><circle cx="40" cy="32" r="3" style="--d:1s" />
      <circle cx="24" cy="40" r="3" style="--d:1.2s" /><circle cx="32" cy="40" r="3" style="--d:1.4s" /><circle cx="40" cy="40" r="3" style="--d:1.6s" />
    </g>`,
};

export function emblemSvg(kind, idSuffix = kind) {
  const [from, to] = palettes[kind] || palettes.index;
  const id = `emb-bg-${idSuffix}`;
  return `<svg class="emb emb-${kind}" viewBox="0 0 64 64" role="img" aria-hidden="true" focusable="false">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>
    <rect width="64" height="64" fill="url(#${id})" />
    <circle class="emb-glow" cx="46" cy="14" r="18" />
    ${shapes[kind] || shapes.index}
  </svg>`;
}
