// Renders the Rights Profile cards and the Docs section into index.html. Safe to run repeatedly.
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { emblemSvg } from "../assets/js/emblems.js";
import { rightsProfiles, verificationStates } from "../assets/js/profiles-data.js";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const target = resolve(projectRoot, "index.html");
let html = await readFile(target, "utf8");

const arrowUpRight =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3" aria-hidden="true"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>';

const profileCards = rightsProfiles
  .map((profile, index) => {
    const state = verificationStates[profile.verification.status];
    return `<div class="flex-shrink-0 w-72 sm:w-80 reveal" style="--reveal-delay:${index * 90}ms"><a class="profile-card group block h-full rounded-2xl border border-surface-dark/60 bg-surface/40 p-5 transition-all hover:-translate-y-0.5 hover:border-accent/50 hover:bg-surface/70 cursor-pointer" href="app.html?profile=${profile.id}" aria-label="Open the ${profile.asset} Rights Profile"><div class="flex items-start gap-4"><div class="profile-emblem shrink-0 h-14 w-14 rounded-full overflow-hidden border border-white/10">${emblemSvg(profile.emblem, `card-${profile.id}`)}</div><div class="min-w-0 flex-1"><div class="flex items-center justify-between gap-2"><h3 class="font-coolvetica text-xl text-foreground truncate">${profile.asset}</h3><span class="profile-symbol">${profile.symbol}</span></div><p class="mt-1 text-xs text-muted-foreground line-clamp-2">${profile.summary}</p><p class="mt-2 font-mono text-[11px] text-muted-foreground/80 truncate">${profile.highlight}</p></div></div><div class="mt-4 flex items-center justify-between"><div class="flex items-center gap-3 text-xs text-muted-foreground"><span class="profile-status ${state.className}">${state.label}</span><span>${state.short}</span></div><span class="inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background opacity-90 group-hover:opacity-100">View${arrowUpRight}</span></div></a></div>`;
  })
  .join("");

const profilesSection = `<section id=profiles class="py-24 sm:py-32"><div class="max-w-7xl mx-auto px-6"><div class="mb-12 reveal"><h2 class="font-coolvetica text-4xl sm:text-5xl text-foreground">Featured Rights Profiles</h2><p class="text-muted-foreground mt-3 text-lg">Open any profile to read its rights, sources, and verification.</p></div></div><div class="overflow-x-auto overflow-y-visible pb-4 scrollbar-hide"><div class="flex gap-4 px-6 max-w-7xl mx-auto py-2">${profileCards}</div></div></section>`;

const docGroups = [
  {
    title: "Concepts",
    href: "docs.html#/concepts/rights-model",
    copy: "The rights model, verification states, and Rights Diff.",
    icon: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  },
  {
    title: "System",
    href: "docs.html#/system/how-varp-works",
    copy: "How evidence becomes a profile and gets anchored.",
    icon: '<rect x="2" y="3" width="20" height="6" rx="2"/><rect x="2" y="15" width="20" height="6" rx="2"/><path d="M6 6h.01M6 18h.01M12 9v6"/>',
  },
  {
    title: "Product",
    href: "docs.html#/product/api",
    copy: "Dashboard, API endpoints, and the teams using them.",
    icon: '<path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/>',
  },
  {
    title: "Reference",
    href: "docs.html#/reference/status-reference",
    copy: "Status vocabulary, an example profile, and the glossary.",
    icon: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
  },
];

const docCards = docGroups
  .map(
    (group, index) =>
      `<a class="docs-card reveal" style="--reveal-delay:${index * 90}ms" href="${group.href}"><span class="docs-card-icon"><svg viewBox="0 0 24 24" aria-hidden="true">${group.icon}</svg></span><span class="docs-card-title">${group.title}</span><span class="docs-card-copy">${group.copy}</span><span class="docs-card-link">Read ${group.title.toLowerCase()}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span></a>`,
  )
  .join("");

const sidebarItems = ["Introduction", "Rights Model", "Verification Model", "How Varp Works", "Onchain Registry", "API"];

const docsSection = `<section id=docs class="varp-docs-section py-24 sm:py-32"><div class="max-w-7xl mx-auto px-6"><div class="docs-landing-grid"><div class="docs-landing-copy reveal"><span class="inline-block text-xs font-mono tracking-widest uppercase text-accent mb-4">02 / Documentation</span><h2 class="font-coolvetica text-4xl sm:text-5xl text-foreground">Read the docs.</h2><p class="text-muted-foreground mt-4 text-lg">Everything behind Varp, from the rights model to the onchain registry.</p><p class="text-muted-foreground mt-3">Eighteen short pages. Start anywhere, search everything.</p><a class="docs-landing-button" href="docs.html">Open the docs<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a></div><div class="docs-window reveal" style="--reveal-delay:120ms" aria-hidden="true"><div class="docs-window-bar"><i></i><i></i><i></i><span>varp / docs / rights model</span></div><div class="docs-window-body"><div class="docs-window-nav"><span class="docs-window-cursor"></span>${sidebarItems
  .map((item) => `<span>${item}</span>`)
  .join("")}</div><div class="docs-window-main"><span class="dw-kicker"></span><span class="dw-title"></span><span class="dw-line" style="--w:92%;--d:.2s"></span><span class="dw-line" style="--w:78%;--d:.35s"></span><span class="dw-line" style="--w:85%;--d:.5s"></span><div class="dw-code"><span class="dw-code-line" style="--d:0s"><b>"ownership"</b>: <em>"indirect"</em>,</span><span class="dw-code-line" style="--d:.5s"><b>"dividends"</b>: <em>"yes"</em>,</span><span class="dw-code-line" style="--d:1s"><b>"transfer"</b>: <em>"permissioned"</em>,</span><span class="dw-code-line" style="--d:1.5s"><b>"status"</b>: <strong class="dw-status">"verified"</strong></span></div></div></div></div></div><div class="docs-card-grid">${docCards}</div></div></section>`;

const replaceSection = (source, id, replacement) => {
  const start = source.indexOf(`<section id=${id} `);
  if (start === -1) return null;
  const end = source.indexOf("</section>", start) + "</section>".length;
  return `${source.slice(0, start)}${replacement}${source.slice(end)}`;
};

html = replaceSection(html, "profiles", profilesSection) ?? (() => {
  throw new Error("Profiles section was not found");
})();

const withDocs = replaceSection(html, "docs", docsSection);
if (withDocs) {
  html = withDocs;
} else {
  const ctaStart = html.indexOf("<section id=cta ");
  if (ctaStart === -1) throw new Error("CTA section was not found");
  html = `${html.slice(0, ctaStart)}${docsSection}${html.slice(ctaStart)}`;
}

const navVerification =
  '<a class="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block" href=#verification>Verification</a>';
const navDocs = '<a class="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block" href=docs.html>Docs</a>';
if (!html.includes(navDocs)) {
  if (!html.includes(navVerification)) throw new Error("Nav link was not found");
  html = html.replace(navVerification, `${navVerification}${navDocs}`);
}

const footerVerification = '<a class="hover:text-foreground transition-colors" href=#verification>Verification</a>';
const footerDocs = '<a class="hover:text-foreground transition-colors" href=docs.html>Docs</a>';
if (!html.includes(footerDocs)) {
  if (!html.includes(footerVerification)) throw new Error("Footer link was not found");
  html = html.replace(footerVerification, `${footerVerification}${footerDocs}`);
}

await writeFile(target, html);
console.log("Landing profiles and docs sections rendered");
