import { BrowserProvider, Contract, JsonRpcProvider, getAddress, isAddress, keccak256, toUtf8Bytes } from "ethers";
import { CONTRACT_CONFIG } from "./config.js";
import { REGISTRY_ABI } from "./registry-abi.js";
import { emblemSvg } from "./emblems.js";
import { findProfile, rightsProfiles, toRightsProfileJson, verificationStates } from "./profiles-data.js";

const verificationLabels = ["Unverified", "Partially Verified", "Verified", "Conflict"];
const verificationClasses = ["status-unverified", "status-partial", "status-verified", "status-conflict"];
const publicProvider = new JsonRpcProvider(
  CONTRACT_CONFIG.rpcUrl,
  { chainId: CONTRACT_CONFIG.chainId, name: "robinhood" },
  { staticNetwork: true },
);
const readRegistry = new Contract(CONTRACT_CONFIG.rightsRegistryAddress, REGISTRY_ABI, publicProvider);

let eip1193Provider = null;
let walletConnectProvider = null;
let browserProvider = null;
let signer = null;
let connectedAccount = null;
let isAdmin = false;
let isPublisher = false;

const profileView = document.querySelector('[data-view="profile"]');
const searchForm = document.querySelector("#token-search");
const addressInput = document.querySelector("#token-address");
const versionInput = document.querySelector("#profile-version");
const searchMessage = document.querySelector("#search-message");
const lookupButton = document.querySelector("#lookup-button");
const connectBrowserButton = document.querySelector("#connect-browser");
const connectWalletConnectButton = document.querySelector("#connect-walletconnect");
const accountButton = document.querySelector("#wallet-account");
const disconnectButton = document.querySelector("#disconnect-wallet");
const transactionPanel = document.querySelector("#transaction-panel");
const transactionMessage = document.querySelector("#transaction-message");
const transactionLink = document.querySelector("#transaction-link");
const publisherPermission = document.querySelector("#publisher-permission");
const adminPermission = document.querySelector("#admin-permission");
const registerForm = document.querySelector("#register-form");
const publishForm = document.querySelector("#publish-form");
const grantForm = document.querySelector("#grant-form");
const profileJsonInput = document.querySelector("#profile-json");
const profileHashInput = document.querySelector("#profile-hash");

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const shortenAddress = (value, leading = 6, trailing = 5) =>
  `${value.slice(0, leading)}…${value.slice(-trailing)}`;

const explorerAddressUrl = (address) => `${CONTRACT_CONFIG.explorerUrl}/address/${address}`;
const explorerTransactionUrl = (hash) => `${CONTRACT_CONFIG.explorerUrl}/tx/${hash}`;

function formatError(error) {
  if (error?.code === 4001 || error?.code === "ACTION_REJECTED") return "The wallet request was rejected.";
  const message = error?.shortMessage || error?.info?.error?.message || error?.reason || error?.message || String(error);
  return message.replace(/^execution reverted:\s*/i, "Transaction reverted: ");
}

function setSearchMessage(message, type = "") {
  searchMessage.textContent = message;
  searchMessage.dataset.type = type;
}

function showTransaction(message, hash = "", type = "pending") {
  transactionPanel.hidden = false;
  transactionPanel.dataset.type = type;
  transactionMessage.textContent = message;
  transactionLink.hidden = !hash;
  if (hash) transactionLink.href = explorerTransactionUrl(hash);
}

function activateTab(name, updateHash = true) {
  const validName = ["profile", "library", "diff", "publisher", "admin"].includes(name) ? name : "profile";
  document.querySelectorAll("[data-tab]").forEach((tab) => {
    const active = tab.dataset.tab === validName;
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  document.querySelectorAll("[data-view]").forEach((view) => {
    view.hidden = view.dataset.view !== validName;
  });
  if (updateHash) history.replaceState(null, "", `#${validName}`);
}

document.querySelectorAll("[data-tab]").forEach((tab) => {
  tab.addEventListener("click", () => activateTab(tab.dataset.tab));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    const tabs = [...document.querySelectorAll("[data-tab]")];
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const next = tabs[(tabs.indexOf(tab) + direction + tabs.length) % tabs.length];
    next.focus();
    activateTab(next.dataset.tab);
  });
});

function normalizeMetadataUri(uri) {
  if (!uri) return null;
  if (uri.startsWith("ipfs://")) return `https://ipfs.io/ipfs/${uri.slice(7)}`;
  if (uri.startsWith("ar://")) return `https://arweave.net/${uri.slice(5)}`;
  try {
    const url = new URL(uri);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

async function loadMetadata(uri) {
  const url = normalizeMetadataUri(uri);
  if (!url) return { url: null, data: null, error: uri ? "Unsupported metadata URI" : "No metadata URI" };
  try {
    const response = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(10_000) });
    if (!response.ok) throw new Error(`Metadata server returned ${response.status}`);
    return { url, data: await response.json(), error: null };
  } catch (error) {
    return { url, data: null, error: formatError(error) };
  }
}

function renderMetadata(metadataResult) {
  const { data, error, url } = metadataResult;
  if (!data) {
    return `<article class="panel metadata-panel">
      <p class="panel-kicker">Offchain metadata</p>
      <h3 class="panel-heading">${error === "No metadata URI" ? "Not supplied" : "Unavailable"}</h3>
      <p class="metadata-note">${escapeHtml(error)}${url ? `. The onchain anchor remains available.` : "."}</p>
      ${url ? `<a class="inline-link" href="${escapeHtml(url)}" target="_blank" rel="noreferrer">Open metadata URI ↗</a>` : ""}
    </article>`;
  }

  const title = data.asset || data.name || data.title || "Rights Profile metadata";
  const summary = data.summary || data.description || "Published metadata linked to this onchain profile.";
  return `<article class="panel metadata-panel">
    <div class="metadata-heading">
      <div><p class="panel-kicker">Offchain metadata</p><h3 class="panel-heading">${escapeHtml(title)}</h3></div>
      <a class="inline-link" href="${escapeHtml(url)}" target="_blank" rel="noreferrer">Source ↗</a>
    </div>
    <p class="metadata-note">${escapeHtml(summary)}</p>
    <details class="json-details"><summary>View JSON</summary><pre>${escapeHtml(JSON.stringify(data, null, 2))}</pre></details>
  </article>`;
}

function renderNotRegistered(assetAddress) {
  profileView.innerHTML = `<div class="empty-state not-found-state">
    <span class="empty-icon" aria-hidden="true">!</span>
    <h2>No registered profile</h2>
    <p><a class="inline-link" href="${explorerAddressUrl(assetAddress)}" target="_blank" rel="noreferrer">${escapeHtml(assetAddress)}</a> is not registered in the Varp registry.</p>
    <button class="secondary-button" type="button" data-open-publisher>Open Publisher Console</button>
  </div>`;
  profileView.querySelector("[data-open-publisher]").addEventListener("click", () => {
    document.querySelector("#register-address").value = assetAddress;
    activateTab("publisher");
  });
}

function renderRegisteredWithoutProfile(assetAddress) {
  profileView.innerHTML = `<div class="empty-state">
    <span class="empty-icon success-icon" aria-hidden="true">✓</span>
    <h2>Asset registered</h2>
    <p>This asset is in the registry, but no Rights Profile has been published yet.</p>
    <a class="inline-link" href="${explorerAddressUrl(assetAddress)}" target="_blank" rel="noreferrer">View asset on explorer ↗</a>
  </div>`;
}

function renderProfile(assetAddress, version, currentVersion, profile, metadataResult) {
  const statusIndex = Number(profile.status);
  const statusLabel = verificationLabels[statusIndex] || "Unknown";
  const statusClass = verificationClasses[statusIndex] || "status-unverified";
  const updatedAt = new Date(Number(profile.updatedAt) * 1000);
  const metadataUrl = normalizeMetadataUri(profile.metadataURI);

  profileView.innerHTML = `
    <div class="panel profile-header live-profile-header">
      <div>
        <p class="panel-kicker">Rights Profile · Version ${version.toString()} of ${currentVersion.toString()}</p>
        <h2 class="asset-name">${escapeHtml(shortenAddress(assetAddress, 10, 8))}</h2>
        <a class="inline-link mono-link" href="${explorerAddressUrl(assetAddress)}" target="_blank" rel="noreferrer">${escapeHtml(assetAddress)} ↗</a>
      </div>
      <span class="status-badge ${statusClass}">${escapeHtml(statusLabel)}</span>
    </div>

    <div class="stat-grid onchain-stat-grid">
      <article class="stat-card"><p class="stat-label">Profile version</p><p class="stat-value">${version.toString()}</p></article>
      <article class="stat-card"><p class="stat-label">Updated</p><p class="stat-value small-stat">${escapeHtml(updatedAt.toLocaleString())}</p></article>
      <article class="stat-card"><p class="stat-label">Publisher</p><p class="stat-value small-stat"><a href="${explorerAddressUrl(profile.publisher)}" target="_blank" rel="noreferrer">${escapeHtml(shortenAddress(profile.publisher))} ↗</a></p></article>
    </div>

    <div class="rights-grid onchain-grid">
      <article class="panel anchor-panel">
        <p class="panel-kicker">Onchain anchor</p>
        <h3 class="panel-heading">Profile integrity</h3>
        <dl class="rights-list">
          <div class="rights-row"><dt>Registry</dt><dd><a href="${explorerAddressUrl(CONTRACT_CONFIG.rightsRegistryAddress)}" target="_blank" rel="noreferrer">${escapeHtml(shortenAddress(CONTRACT_CONFIG.rightsRegistryAddress))}</a></dd></div>
          <div class="rights-row"><dt>Profile hash</dt><dd class="hash-value" title="${escapeHtml(profile.profileHash)}">${escapeHtml(shortenAddress(profile.profileHash, 12, 10))}</dd></div>
          <div class="rights-row"><dt>Metadata URI</dt><dd>${metadataUrl ? `<a href="${escapeHtml(metadataUrl)}" target="_blank" rel="noreferrer">Open source ↗</a>` : escapeHtml(profile.metadataURI || "Not supplied")}</dd></div>
          <div class="rights-row"><dt>Network</dt><dd>Robinhood Mainnet · 4663</dd></div>
        </dl>
      </article>
      ${renderMetadata(metadataResult)}
    </div>`;
}

const valueTone = (value) => {
  const text = String(value).toLowerCase();
  if (text === "verified") return "tone-yes";
  if (text === "conflict") return "tone-conflict";
  if (/unknown|unresolved|not observed|unverified/.test(text)) return "tone-unknown";
  if (/documented as/.test(text)) return "tone-conflict";
  if (/^(yes|supported|active)$/.test(text)) return "tone-yes";
  if (/^no$/.test(text)) return "tone-no";
  return "tone-limited";
};

const rightsSections = [
  ["Ownership", "ownership", [["Ownership type", "type"], ["Beneficial interest", "beneficialInterest"]]],
  ["Economic rights", "economicRights", [["Dividends", "dividends"], ["Interest", "interest"], ["Yield", "yield"], ["Redemption", "redemption"], ["Distribution rights", "distributionRights"]]],
  ["Governance", "governanceRights", [["Voting", "voting"], ["Governance participation", "governanceParticipation"], ["Corporate actions", "corporateActionParticipation"]]],
  ["Transfer and restrictions", "transfer", [["Transfer mode", "mode"], ["KYC", "kyc"], ["Whitelist", "whitelist"], ["Geographic restrictions", "geographicRestrictions"], ["Investor eligibility", "investorEligibility"]]],
  ["DeFi compatibility", "defi", [["Smart contract transfer", "smartContractTransfer"], ["Collateral", "collateral"], ["Lending", "lending"], ["DEX", "dex"], ["Permissionless DeFi", "permissionlessCompatibility"]]],
  ["Lifecycle", "lifecycle", [["Status", "status"], ["Corporate actions", "corporateActions"]]],
];

function profileAnchor(profile) {
  const json = toRightsProfileJson(profile);
  const serialized = JSON.stringify(canonicalJson(json));
  return { json, serialized, hash: keccak256(toUtf8Bytes(serialized)) };
}

function renderLibraries() {
  document.querySelectorAll("[data-profile-library]").forEach((container, containerIndex) => {
    container.innerHTML = rightsProfiles
      .map((profile) => {
        const state = verificationStates[profile.verification.status];
        return `<button class="library-card" type="button" data-open-profile="${profile.id}">
          <span class="profile-emblem library-emblem">${emblemSvg(profile.emblem, `lib${containerIndex}-${profile.id}`)}</span>
          <span class="library-card-body">
            <span class="library-card-top"><strong>${escapeHtml(profile.asset)}</strong><span class="profile-symbol">${escapeHtml(profile.symbol)}</span></span>
            <span class="library-card-summary">${escapeHtml(profile.summary)}</span>
            <span class="status-badge ${state.className}">${escapeHtml(state.label)}</span>
          </span>
        </button>`;
      })
      .join("");
  });
}

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-open-profile]");
  if (trigger) openProfile(trigger.dataset.openProfile);
});

function openProfile(id) {
  const profile = findProfile(id);
  if (!profile) return false;
  renderRightsProfile(profile);
  history.replaceState(null, "", `${window.location.pathname}?profile=${profile.id}#profile`);
  activateTab("profile", false);
  setSearchMessage(`Opened the ${profile.asset} Rights Profile.`, "success");
  return true;
}

function renderRightsProfile(profile) {
  const state = verificationStates[profile.verification.status];
  const anchor = profileAnchor(profile);
  const currentVersion = profile.history[0].version;

  const sections = rightsSections
    .map(([title, key, rows]) => `<article class="panel rights-panel">
        <p class="panel-kicker">${escapeHtml(title)}</p>
        <dl class="rights-list">${rows
          .map(([label, field]) => {
            const value = profile[key][field];
            return `<div class="rights-row"><dt>${escapeHtml(label)}</dt><dd><span class="value-chip ${valueTone(value)}">${escapeHtml(value)}</span></dd></div>`;
          })
          .join("")}</dl>
      </article>`)
    .join("");

  const conflicts = profile.conflicts
    .map((conflict) => `<article class="panel conflict-panel">
        <p class="panel-kicker">Conflict detected</p>
        <h3 class="panel-heading">${escapeHtml(conflict.field)}</h3>
        <div class="conflict-columns">
          <div class="conflict-column"><span class="field-label">Documentation says</span><p>${escapeHtml(conflict.documented)}</p></div>
          <div class="conflict-column"><span class="field-label">Observed onchain</span><p>${escapeHtml(conflict.observed)}</p></div>
        </div>
        <p class="metadata-note conflict-checked">Both sources last checked ${escapeHtml(conflict.checked)}.</p>
      </article>`)
    .join("");

  const sources = profile.sources
    .map((source) => `<article class="source-card">
        <div class="source-topline"><div><p class="panel-kicker">Evidence source</p><h4 class="source-name">${escapeHtml(source.name)}</h4></div><span class="source-tag">${escapeHtml(source.type)}</span></div>
        <p class="source-description">${escapeHtml(source.description)}</p>
        <dl class="rights-list">
          <div class="source-meta-row"><dt>Supports</dt><dd>${escapeHtml(source.supports)}</dd></div>
          <div class="source-meta-row"><dt>Checked</dt><dd>${escapeHtml(source.checked)}</dd></div>
        </dl>
      </article>`)
    .join("");

  const versions = profile.history
    .map((entry) => `<li class="history-item"><span class="history-version">v${entry.version}</span><div><p>${escapeHtml(entry.change)}</p><span>${escapeHtml(entry.date)}</span></div></li>`)
    .join("");

  profileView.innerHTML = `
    <button class="back-link" type="button" data-back-library>← All profiles</button>
    <div class="panel profile-header library-profile-header">
      <div class="profile-identity">
        <span class="profile-emblem profile-emblem-lg">${emblemSvg(profile.emblem, `view-${profile.id}`)}</span>
        <div>
          <p class="panel-kicker">Rights Profile · ${escapeHtml(profile.symbol)} · Version ${currentVersion}</p>
          <h2 class="asset-name">${escapeHtml(profile.asset)}</h2>
          <p class="asset-underlying">${escapeHtml(profile.underlying)} · ${escapeHtml(profile.tokenType)}</p>
          <p class="query-value">${escapeHtml(profile.summary)}</p>
        </div>
      </div>
      <div class="profile-header-side">
        <span class="status-badge ${state.className}">${escapeHtml(state.label)}</span>
        <p class="stat-label">Last checked ${escapeHtml(profile.verification.lastChecked)}</p>
      </div>
    </div>

    <div class="panel verification-note ${state.className}-note">
      <strong>${escapeHtml(profile.verification.summary)}</strong>
      <span>${escapeHtml(state.description)}</span>
    </div>

    <div class="stat-grid">
      <article class="stat-card"><p class="stat-label">Ownership</p><p class="stat-value">${escapeHtml(profile.ownership.type)}</p></article>
      <article class="stat-card"><p class="stat-label">Transfer</p><p class="stat-value">${escapeHtml(profile.transfer.mode)}</p></article>
      <article class="stat-card"><p class="stat-label">Lifecycle</p><p class="stat-value">${escapeHtml(profile.lifecycle.status)}</p></article>
    </div>

    ${conflicts ? `<div class="conflict-stack">${conflicts}</div>` : ""}

    <div class="rights-grid">${sections}</div>

    <div class="view-header section-gap"><div><p class="panel-kicker">Evidence</p><h3 class="view-title">Sources</h3></div><p class="view-description">Where each claim comes from, and when it was last checked.</p></div>
    <div class="source-grid">${sources}</div>

    <div class="rights-grid onchain-grid section-gap">
      <article class="panel">
        <p class="panel-kicker">Change history</p>
        <h3 class="panel-heading">Versions</h3>
        <ol class="history-list">${versions}</ol>
      </article>
      <article class="panel anchor-panel">
        <p class="panel-kicker">Onchain anchor</p>
        <h3 class="panel-heading">Profile hash</h3>
        <dl class="rights-list">
          <div class="rights-row"><dt>keccak256</dt><dd class="hash-value" title="${anchor.hash}">${escapeHtml(shortenAddress(anchor.hash, 12, 10))}</dd></div>
          <div class="rights-row"><dt>Status code</dt><dd>${state.index} · ${escapeHtml(verificationLabels[state.index])}</dd></div>
          <div class="rights-row"><dt>Registry</dt><dd><a href="${explorerAddressUrl(CONTRACT_CONFIG.rightsRegistryAddress)}" target="_blank" rel="noreferrer">${escapeHtml(shortenAddress(CONTRACT_CONFIG.rightsRegistryAddress))} ↗</a></dd></div>
        </dl>
        <p class="metadata-note">A publisher wallet can anchor this exact hash on Robinhood Chain.</p>
        <div class="anchor-actions">
          <button class="primary-button" type="button" data-load-publisher>Load into Publisher Console</button>
          <button class="secondary-button" type="button" data-download-json>Download JSON</button>
        </div>
        <details class="json-details"><summary>View profile JSON</summary><pre>${escapeHtml(JSON.stringify(anchor.json, null, 2))}</pre></details>
      </article>
    </div>`;

  profileView.querySelector("[data-back-library]").addEventListener("click", () => activateTab("library"));
  profileView.querySelector("[data-load-publisher]").addEventListener("click", () => {
    profileJsonInput.value = JSON.stringify(anchor.json, null, 2);
    document.querySelector("#profile-status").value = String(state.index);
    calculateProfileHash();
    activateTab("publisher");
    document.querySelector("#publish-address").focus();
  });
  profileView.querySelector("[data-download-json]").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(anchor.json, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${profile.id}-rights-profile-v${currentVersion}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  });
}

const diffA = document.querySelector("#diff-a");
const diffB = document.querySelector("#diff-b");

function renderDiff() {
  const a = findProfile(diffA.value);
  const b = findProfile(diffB.value);
  if (!a || !b) return;
  const rows = [
    ["Verification", verificationStates[a.verification.status].label, verificationStates[b.verification.status].label],
    ...rightsSections.flatMap(([, key, fields]) => fields.map(([label, field]) => [label, a[key][field], b[key][field]])),
  ];
  const differences = rows.filter(([, left, right]) => left !== right).length;
  document.querySelector("#diff-result").innerHTML = `
    <div class="compare-head"><span>${differences} of ${rows.length} fields differ</span><span>${escapeHtml(a.asset)}</span><span>${escapeHtml(b.asset)}</span></div>
    ${rows
      .map(([label, left, right]) => {
        const different = left !== right;
        const chip = different ? `<span class="difference-chip">Differs</span>` : "";
        return `<div class="compare-row${different ? " is-different" : ""}"><span class="compare-label">${escapeHtml(label)}${chip}</span><span class="compare-value"><span class="value-chip ${valueTone(left)}">${escapeHtml(left)}</span></span><span class="compare-value"><span class="value-chip ${valueTone(right)}">${escapeHtml(right)}</span></span></div>`;
      })
      .join("")}`;
}

function initDiff() {
  const options = rightsProfiles.map((profile) => `<option value="${profile.id}">${escapeHtml(profile.asset)}</option>`).join("");
  diffA.innerHTML = options;
  diffB.innerHTML = options;
  diffA.value = rightsProfiles[0].id;
  diffB.value = rightsProfiles[2].id;
  diffA.addEventListener("change", renderDiff);
  diffB.addEventListener("change", renderDiff);
  renderDiff();
}

async function inspectAsset(assetAddress, requestedVersion = "") {
  const checksumAddress = getAddress(assetAddress);
  lookupButton.disabled = true;
  setSearchMessage("Reading Robinhood Chain…", "pending");
  try {
    const registered = await readRegistry.isAssetRegistered(checksumAddress);
    if (!registered) {
      renderNotRegistered(checksumAddress);
      setSearchMessage("Asset is not registered.", "warning");
      return;
    }

    const currentVersion = await readRegistry.getCurrentVersion(checksumAddress);
    if (currentVersion === 0n) {
      renderRegisteredWithoutProfile(checksumAddress);
      setSearchMessage("Asset registered; no profile published yet.", "success");
      return;
    }

    const version = requestedVersion ? BigInt(requestedVersion) : currentVersion;
    if (version < 1n || version > currentVersion) throw new Error(`Version must be between 1 and ${currentVersion}.`);
    const profile = await readRegistry.getProfile(checksumAddress, version);
    const metadata = await loadMetadata(profile.metadataURI);
    renderProfile(checksumAddress, version, currentVersion, profile, metadata);
    setSearchMessage(`Loaded profile version ${version} from Robinhood Chain.`, "success");
    history.replaceState(null, "", `${window.location.pathname}#profile`);
    addressInput.value = checksumAddress;
    document.querySelector("#publish-address").value = checksumAddress;
    activateTab("profile");
  } finally {
    lookupButton.disabled = false;
  }
}

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = addressInput.value.trim();
  if (!isAddress(query)) {
    setSearchMessage("Enter a valid EVM contract address.", "error");
    addressInput.focus();
    return;
  }
  try {
    await inspectAsset(query, versionInput.value.trim());
  } catch (error) {
    setSearchMessage(formatError(error), "error");
  }
});

async function ensureRobinhoodNetwork(provider) {
  const currentChain = await provider.request({ method: "eth_chainId" });
  if (currentChain.toLowerCase() === CONTRACT_CONFIG.chainIdHex) return;
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: CONTRACT_CONFIG.chainIdHex }],
    });
  } catch (error) {
    if (error?.code !== 4902 && error?.code !== -32603) throw error;
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [{
        chainId: CONTRACT_CONFIG.chainIdHex,
        chainName: CONTRACT_CONFIG.chainName,
        nativeCurrency: CONTRACT_CONFIG.nativeCurrency,
        rpcUrls: [CONTRACT_CONFIG.rpcUrl],
        blockExplorerUrls: [CONTRACT_CONFIG.explorerUrl],
      }],
    });
  }
}

function setFormEnabled(form, enabled) {
  form.querySelectorAll("input, textarea, select, button").forEach((control) => {
    control.disabled = !enabled;
  });
}

function resetWalletUi() {
  connectedAccount = null;
  signer = null;
  browserProvider = null;
  eip1193Provider = null;
  isAdmin = false;
  isPublisher = false;
  connectBrowserButton.hidden = false;
  connectWalletConnectButton.hidden = false;
  accountButton.hidden = true;
  disconnectButton.hidden = true;
  publisherPermission.textContent = "Connect a publisher wallet to register assets and publish profiles.";
  publisherPermission.dataset.allowed = "false";
  adminPermission.textContent = "Connect an admin wallet to manage publisher access.";
  adminPermission.dataset.allowed = "false";
  setFormEnabled(registerForm, false);
  setFormEnabled(publishForm, false);
  setFormEnabled(grantForm, false);
}

async function updateWalletRoles() {
  if (!connectedAccount) return resetWalletUi();
  const [adminRole, publisherRole] = await Promise.all([
    readRegistry.DEFAULT_ADMIN_ROLE(),
    readRegistry.PUBLISHER_ROLE(),
  ]);
  [isAdmin, isPublisher] = await Promise.all([
    readRegistry.hasRole(adminRole, connectedAccount),
    readRegistry.hasRole(publisherRole, connectedAccount),
  ]);

  publisherPermission.textContent = isPublisher
    ? `Publisher access confirmed for ${shortenAddress(connectedAccount)}.`
    : "This wallet does not have the Publisher role.";
  publisherPermission.dataset.allowed = String(isPublisher);
  adminPermission.textContent = isAdmin
    ? `Admin access confirmed for ${shortenAddress(connectedAccount)}.`
    : "This wallet does not have the Admin role.";
  adminPermission.dataset.allowed = String(isAdmin);
  setFormEnabled(registerForm, isPublisher);
  setFormEnabled(publishForm, isPublisher);
  setFormEnabled(grantForm, isAdmin);
}

async function bindWallet(provider) {
  eip1193Provider = provider;
  await ensureRobinhoodNetwork(provider);
  browserProvider = new BrowserProvider(provider);
  signer = await browserProvider.getSigner();
  connectedAccount = await signer.getAddress();

  connectBrowserButton.hidden = true;
  connectWalletConnectButton.hidden = true;
  accountButton.hidden = false;
  disconnectButton.hidden = false;
  accountButton.textContent = shortenAddress(connectedAccount);
  accountButton.title = connectedAccount;
  showTransaction(`Wallet connected: ${connectedAccount}`, "", "success");
  await updateWalletRoles();

  if (typeof provider.on === "function") {
    provider.on("accountsChanged", async (accounts) => {
      if (!accounts.length) return resetWalletUi();
      connectedAccount = getAddress(accounts[0]);
      accountButton.textContent = shortenAddress(connectedAccount);
      await updateWalletRoles();
    });
    provider.on("chainChanged", async (chainId) => {
      if (String(chainId).toLowerCase() !== CONTRACT_CONFIG.chainIdHex) {
        showTransaction("Switch back to Robinhood Mainnet to continue.", "", "error");
      }
    });
  }
}

connectBrowserButton.addEventListener("click", async () => {
  if (!window.ethereum) {
    showTransaction("No browser wallet detected. Install a wallet extension or use WalletConnect.", "", "error");
    return;
  }
  try {
    connectBrowserButton.disabled = true;
    await window.ethereum.request({ method: "eth_requestAccounts" });
    await bindWallet(window.ethereum);
  } catch (error) {
    showTransaction(formatError(error), "", "error");
  } finally {
    connectBrowserButton.disabled = false;
  }
});

connectWalletConnectButton.addEventListener("click", async () => {
  try {
    connectWalletConnectButton.disabled = true;
    const { EthereumProvider } = await import("@walletconnect/ethereum-provider");
    walletConnectProvider = await EthereumProvider.init({
      projectId: CONTRACT_CONFIG.walletConnectProjectId,
      chains: [CONTRACT_CONFIG.chainId],
      optionalChains: [CONTRACT_CONFIG.chainId],
      showQrModal: true,
      rpcMap: { [CONTRACT_CONFIG.chainId]: CONTRACT_CONFIG.rpcUrl },
      metadata: {
        name: "Varp",
        description: "Rights intelligence for tokenized assets",
        url: window.location.origin,
        icons: [`${window.location.origin}/assets/images/varp-mark.webp`],
      },
    });
    await walletConnectProvider.connect();
    await bindWallet(walletConnectProvider);
  } catch (error) {
    showTransaction(formatError(error), "", "error");
  } finally {
    connectWalletConnectButton.disabled = false;
  }
});

accountButton.addEventListener("click", () => {
  window.open(explorerAddressUrl(connectedAccount), "_blank", "noopener,noreferrer");
});

disconnectButton.addEventListener("click", async () => {
  try {
    if (walletConnectProvider?.disconnect) await walletConnectProvider.disconnect();
  } catch {
    // Wallet session may already be closed.
  }
  walletConnectProvider = null;
  resetWalletUi();
  showTransaction("Wallet disconnected from this page.", "", "success");
});

function canonicalJson(value) {
  if (Array.isArray(value)) return value.map(canonicalJson);
  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((result, key) => {
        result[key] = canonicalJson(value[key]);
        return result;
      }, {});
  }
  return value;
}

function calculateProfileHash() {
  try {
    const parsed = JSON.parse(profileJsonInput.value);
    const serialized = JSON.stringify(canonicalJson(parsed));
    const hash = keccak256(toUtf8Bytes(serialized));
    profileHashInput.value = hash;
    profileHashInput.dataset.hash = hash;
    return { hash, serialized };
  } catch {
    profileHashInput.value = "Enter valid JSON";
    delete profileHashInput.dataset.hash;
    return null;
  }
}

profileJsonInput.addEventListener("input", calculateProfileHash);

async function writeRegistryTransaction(button, pendingMessage, submit) {
  if (!signer || !connectedAccount) throw new Error("Connect a wallet first.");
  await ensureRobinhoodNetwork(eip1193Provider);
  button.disabled = true;
  try {
    const writeRegistry = new Contract(CONTRACT_CONFIG.rightsRegistryAddress, REGISTRY_ABI, signer);
    showTransaction(pendingMessage, "", "pending");
    const transaction = await submit(writeRegistry);
    showTransaction("Transaction submitted. Waiting for confirmation…", transaction.hash, "pending");
    await transaction.wait();
    showTransaction("Transaction confirmed on Robinhood Chain.", transaction.hash, "success");
    await updateWalletRoles();
    return transaction.hash;
  } catch (error) {
    showTransaction(formatError(error), "", "error");
    throw error;
  } finally {
    button.disabled = false;
  }
}

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!isPublisher) return showTransaction("Publisher role required.", "", "error");
  const asset = document.querySelector("#register-address").value.trim();
  if (!isAddress(asset)) return showTransaction("Enter a valid asset contract address.", "", "error");
  const button = registerForm.querySelector("button[type=submit]");
  try {
    await writeRegistryTransaction(button, "Confirm asset registration in your wallet…", (registry) => registry.registerAsset(getAddress(asset)));
    addressInput.value = getAddress(asset);
    document.querySelector("#publish-address").value = getAddress(asset);
    await inspectAsset(asset);
  } catch {
    // Error is already surfaced in the transaction panel.
  }
});

publishForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!isPublisher) return showTransaction("Publisher role required.", "", "error");
  const asset = document.querySelector("#publish-address").value.trim();
  const metadataUri = document.querySelector("#metadata-uri").value.trim();
  const status = Number(document.querySelector("#profile-status").value);
  const computed = calculateProfileHash();
  if (!isAddress(asset)) return showTransaction("Enter a valid registered asset address.", "", "error");
  if (!metadataUri) return showTransaction("Metadata URI is required.", "", "error");
  if (!computed) return showTransaction("Profile JSON must be valid before publishing.", "", "error");
  const button = publishForm.querySelector("button[type=submit]");
  try {
    await writeRegistryTransaction(button, "Confirm profile publication in your wallet…", (registry) =>
      registry.publishProfile(getAddress(asset), computed.hash, metadataUri, status));
    addressInput.value = getAddress(asset);
    versionInput.value = "";
    await inspectAsset(asset);
  } catch {
    // Error is already surfaced in the transaction panel.
  }
});

grantForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!isAdmin) return showTransaction("Admin role required.", "", "error");
  const publisher = document.querySelector("#publisher-address").value.trim();
  if (!isAddress(publisher)) return showTransaction("Enter a valid publisher wallet address.", "", "error");
  const button = grantForm.querySelector("button[type=submit]");
  try {
    const role = await readRegistry.PUBLISHER_ROLE();
    await writeRegistryTransaction(button, "Confirm Publisher role grant in your wallet…", (registry) =>
      registry.grantRole(role, getAddress(publisher)));
  } catch {
    // Error is already surfaced in the transaction panel.
  }
});

async function initialize() {
  document.querySelector("#registry-link").href = explorerAddressUrl(CONTRACT_CONFIG.rightsRegistryAddress);
  resetWalletUi();
  renderLibraries();
  initDiff();
  activateTab(window.location.hash.slice(1), false);
  const requestedProfile = new URLSearchParams(window.location.search).get("profile");
  if (requestedProfile && !openProfile(requestedProfile)) {
    setSearchMessage("That profile was not found. Pick one from the library.", "warning");
    activateTab("library");
  }
  try {
    const [network, blockNumber, code] = await Promise.all([
      publicProvider.getNetwork(),
      publicProvider.getBlockNumber(),
      publicProvider.getCode(CONTRACT_CONFIG.rightsRegistryAddress),
    ]);
    if (Number(network.chainId) !== CONTRACT_CONFIG.chainId || code === "0x") throw new Error("Registry deployment unavailable");
    document.querySelector("#rpc-status").textContent = `RPC online · Block ${blockNumber.toLocaleString()}`;
  } catch (error) {
    document.querySelector("#rpc-status").textContent = "RPC unavailable";
    showTransaction(formatError(error), "", "error");
  }

  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (accounts.length) await bindWallet(window.ethereum);
    } catch {
      // Silent reconnect is optional; the user can connect explicitly.
    }
  }
}

initialize();
