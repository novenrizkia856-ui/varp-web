# Varp Web

Production frontend for the Varp Rights Registry on Robinhood Chain mainnet.

## Production configuration

- Chain ID: `4663`
- Registry: `0xef14172D0258dB63974bEcDD41e4803e6D8A81C3`
- Explorer: `https://robinhoodchain.blockscout.com`
- Wallet support: injected EIP-1193 wallets and WalletConnect

The public chain, contract, explorer, and WalletConnect settings live in `assets/js/config.js`. WalletConnect project IDs are public client identifiers; no private key is included in the frontend.

## Local production preview

```powershell
npm install
npm run build
$env:PORT = "4174"
node scripts/serve.mjs dist
```

Open `http://127.0.0.1:4174/app.html`.

## Features

- Public profile lookup directly from Robinhood Chain RPC
- Historical profile version lookup
- Safe IPFS, Arweave, and HTTPS metadata loading
- Browser-wallet and WalletConnect sessions
- Automatic Robinhood Chain switch/add request
- Publisher-only asset registration and profile publication
- Admin-only Publisher role grants
- Explorer links and transaction confirmation states
- Lazy-loaded wallet bundle and production security headers for Vercel
- Featured Rights Profiles (`assets/js/profiles-data.js`) open at `app.html?profile=<id>` with rights, sources, history, Rights Diff, and a one-click handoff to the Publisher Console
- Documentation at `docs.html`, generated from `content/docs/` by `scripts/build-docs.mjs`
- 3D hero mark (`assets/js/hero-mark-3d.js`, three.js) drawn as thin, curled petal sheets from the petal geometry in `assets/js/varp-mark-geometry.js`; it loads lazily on desktop, and `scripts/build-mark.mjs` writes the flat SVG fallback from the same geometry

## Content scripts

`npm run build` regenerates `docs.html` from `content/docs/` and re-renders the landing profile cards and Docs section (`scripts/render-landing.mjs`) before bundling. Edit the Markdown or `profiles-data.js`, not the generated HTML.

The publisher console canonicalizes JSON by recursively sorting object keys, serializes it, and anchors `keccak256(UTF-8 JSON)` as the profile hash.
