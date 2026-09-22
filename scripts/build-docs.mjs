// Builds docs.html from content/docs (GitBook layout: README.md, SUMMARY.md, one file per page).
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const docsRoot = resolve(projectRoot, "content/docs");
const outputFile = resolve(projectRoot, "docs.html");
const lastUpdated = "September 21, 2026";

const groupLabels = {
  "": "Introduction",
  concepts: "Concepts",
  system: "System",
  product: "Product",
  trust: "Trust",
  reference: "Reference",
};
const groupOverrides = { "glossary.md": "reference" };
const titleOverrides = { "README.md": "Introduction" };

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const slugify = (value) =>
  String(value)
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z]+;/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const pageSlug = (path) => (path === "README.md" ? "introduction" : path.replace(/\.md$/, ""));

function renderInline(text) {
  const codeSpans = [];
  let html = escapeHtml(text).replace(/`([^`]+)`/g, (_, code) => {
    codeSpans.push(`<code>${code}</code>`);
    return `\u0000${codeSpans.length - 1}\u0000`;
  });
  html = html
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
      if (/\.md$/.test(href)) return `<a href="#/${pageSlug(href.replace(/^\.\//, ""))}">${label}</a>`;
      return `<a href="${href}" target="_blank" rel="noreferrer">${label}</a>`;
    });
  return html.replace(/\u0000(\d+)\u0000/g, (_, index) => codeSpans[Number(index)]);
}

function highlight(code, language) {
  const escaped = escapeHtml(code);
  if (language === "json") {
    return escaped
      .replace(/(&quot;[^&]*?&quot;)(\s*:)/g, '<span class="tok-key">$1</span>$2')
      .replace(/(:\s*)(&quot;[^&]*?&quot;)/g, '$1<span class="tok-str">$2</span>')
      .replace(/(\[\s*|,\s*\n\s*|^\s*)(&quot;[^&]*?&quot;)(?=\s*[,\]\n])/gm, '$1<span class="tok-str">$2</span>')
      .replace(/\b(true|false|null)\b/g, '<span class="tok-bool">$1</span>');
  }
  if (language === "http") {
    return escaped.replace(/^(GET|POST|PUT|DELETE)\b/gm, '<span class="tok-method">$1</span>');
  }
  return escaped;
}

function renderMarkdown(source, idPrefix) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  const headings = [];
  let title = "";
  let index = 0;

  const isBlockStart = (line) =>
    /^```/.test(line) || /^#{1,6}\s/.test(line) || /^>/.test(line) || /^\s*([-*]|\d+\.)\s+/.test(line) || /^\|/.test(line);

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    const fence = line.match(/^```(\w*)/);
    if (fence) {
      const language = fence[1] || "text";
      const body = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith("```")) body.push(lines[(index += 1) - 1]);
      index += 1;
      blocks.push(
        `<div class="doc-code" data-lang="${language}"><div class="doc-code-bar"><span>${language}</span><button type="button" class="doc-copy" data-copy-code>Copy</button></div><pre><code>${highlight(body.join("\n"), language)}</code></pre></div>`,
      );
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      const text = renderInline(heading[2].trim());
      if (level === 1 && !title) {
        title = heading[2].trim();
      } else {
        const id = `${idPrefix}--${slugify(text)}`;
        if (level <= 3) headings.push({ level, id, text });
        blocks.push(`<h${level} id="${id}"><a class="doc-anchor" href="#${id}" aria-hidden="true" tabindex="-1">#</a>${text}</h${level}>`);
      }
      index += 1;
      continue;
    }

    if (/^\|/.test(line)) {
      const rows = [];
      while (index < lines.length && /^\|/.test(lines[index])) rows.push(lines[(index += 1) - 1]);
      const cells = (row) => row.replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());
      const [head, , ...body] = rows;
      blocks.push(
        `<div class="doc-table"><table><thead><tr>${cells(head).map((cell) => `<th>${renderInline(cell)}</th>`).join("")}</tr></thead><tbody>${body
          .map((row) => `<tr>${cells(row).map((cell) => `<td>${renderInline(cell)}</td>`).join("")}</tr>`)
          .join("")}</tbody></table></div>`,
      );
      continue;
    }

    if (/^>/.test(line)) {
      const quote = [];
      while (index < lines.length && /^>/.test(lines[index])) quote.push(lines[(index += 1) - 1].replace(/^>\s?/, ""));
      blocks.push(`<blockquote class="doc-callout">${renderInline(quote.join(" "))}</blockquote>`);
      continue;
    }

    const listMatch = line.match(/^\s*([-*]|\d+\.)\s+/);
    if (listMatch) {
      const ordered = /\d/.test(listMatch[1]);
      const items = [];
      while (index < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*([-*]|\d+\.)\s+/, ""));
        index += 1;
      }
      const tag = ordered ? "ol" : "ul";
      blocks.push(`<${tag}>${items.map((item) => `<li>${renderInline(item)}</li>`).join("")}</${tag}>`);
      continue;
    }

    const paragraph = [];
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines[index])) paragraph.push(lines[(index += 1) - 1].trim());
    blocks.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
  }

  return { title, headings, html: blocks.join("\n") };
}

const summary = await readFile(resolve(docsRoot, "SUMMARY.md"), "utf8");
const entries = [...summary.matchAll(/^\s*\*\s+\[([^\]]+)\]\(([^)]+)\)/gm)].map((match) => ({
  navTitle: titleOverrides[match[2]] || match[1],
  path: match[2],
}));

const pages = [];
for (const entry of entries) {
  const source = await readFile(resolve(docsRoot, entry.path), "utf8");
  const rendered = renderMarkdown(source, slugify(pageSlug(entry.path)));
  const folder = groupOverrides[entry.path] || (entry.path.includes("/") ? entry.path.split("/")[0] : "");
  pages.push({ ...entry, ...rendered, slug: pageSlug(entry.path), group: groupLabels[folder] || "Reference" });
}

const groups = [];
for (const page of pages) {
  let group = groups.find((item) => item.label === page.group);
  if (!group) groups.push((group = { label: page.group, pages: [] }));
  group.pages.push(page);
}
const ordered = groups.flatMap((group) => group.pages);

const arrowRight = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
const arrowLeft = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>';

const sidebar = groups
  .map(
    (group, groupIndex) => `<div class="docs-nav-group" data-nav-group>
        <button class="docs-nav-heading" type="button" aria-expanded="true" aria-controls="nav-group-${groupIndex}">${group.label}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>
        <ul id="nav-group-${groupIndex}">${group.pages
          .map((page) => `<li><a class="docs-nav-link" href="#/${page.slug}" data-nav-link="${page.slug}">${escapeHtml(page.navTitle)}</a></li>`)
          .join("")}</ul>
      </div>`,
  )
  .join("\n");

const articles = ordered
  .map((page, pageIndex) => {
    const previous = ordered[pageIndex - 1];
    const next = ordered[pageIndex + 1];
    const toc = page.headings.length
      ? `<aside class="docs-toc" aria-label="On this page"><p class="docs-toc-title">On this page</p><ul>${page.headings
          .map((heading) => `<li class="toc-level-${heading.level}"><a href="#${heading.id}" data-toc-link="${heading.id}">${heading.text}</a></li>`)
          .join("")}</ul></aside>`
      : "";
    return `<article class="docs-page" id="page-${page.slug}" data-page="${page.slug}" data-title="${escapeHtml(page.title)}" data-group="${escapeHtml(page.group)}">
      <div class="docs-page-body">
        <nav class="docs-breadcrumb" aria-label="Breadcrumb"><a href="#/introduction">Docs</a><span>/</span><span>${page.group}</span><span>/</span><span aria-current="page">${escapeHtml(page.navTitle)}</span></nav>
        <h1 class="docs-title">${escapeHtml(page.title)}</h1>
        <p class="docs-updated">Page last updated: ${lastUpdated}</p>
        <div class="docs-prose">${page.html}</div>
        <nav class="docs-pager" aria-label="Pagination">
          ${previous ? `<a class="docs-pager-link" href="#/${previous.slug}">${arrowLeft}<span><small>Previous</small>${escapeHtml(previous.navTitle)}</span></a>` : "<span></span>"}
          ${next ? `<a class="docs-pager-link is-next" href="#/${next.slug}"><span><small>Next</small>${escapeHtml(next.navTitle)}</span>${arrowRight}</a>` : "<span></span>"}
        </nav>
      </div>
      ${toc}
    </article>`;
  })
  .join("\n");

const searchIndex = ordered.map((page) => ({
  slug: page.slug,
  title: page.navTitle,
  group: page.group,
  headings: page.headings.map((heading) => heading.text.replace(/<[^>]+>/g, "")),
  text: page.html
    .replace(/<a class="doc-anchor"[^>]*>#<\/a>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim(),
}));

const html = `<!doctype html>
<html lang="en" class="__variable_246ccd">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Varp documentation. Rights Profiles, verification states, the onchain registry, and the API.">
    <meta name="theme-color" content="#fff7ed">
    <title>Varp Docs | Rights Intelligence for Tokenized Assets</title>
    <link rel="icon" href="assets/images/varp-mark.webp" type="image/webp">
    <link rel="stylesheet" href="assets/css/base.css">
    <link rel="stylesheet" href="assets/css/custom.css">
    <link rel="stylesheet" href="assets/css/docs.css">
  </head>
  <body class="__variable_f367f3 __variable_ab7abf docs-shell">
    <a class="docs-skip" href="#docs-main">Skip to content</a>
    <header class="docs-header">
      <div class="docs-header-inner">
        <button class="docs-menu-button" type="button" aria-controls="docs-sidebar" aria-expanded="false" data-docs-menu>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg><span class="sr-only">Menu</span>
        </button>
        <a class="brand-link" href="index.html" aria-label="Varp home">
          <img class="rounded-sm" src="assets/images/varp-mark.webp" alt="" width="28" height="28">
          <span class="font-coolvetica text-xl tracking-wide text-foreground">VARP</span>
          <span class="docs-brand-tag">Docs</span>
        </a>
        <div class="docs-search" role="search">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input type="search" placeholder="Search docs" aria-label="Search docs" autocomplete="off" data-docs-search>
          <kbd>/</kbd>
          <div class="docs-search-results" role="listbox" hidden data-docs-results></div>
        </div>
        <nav class="docs-header-links" aria-label="Site">
          <a href="index.html">Home</a>
          <a href="index.html#profiles">Profiles</a>
          <a class="nav-pill nav-pill-accent" href="app.html">Open App</a>
        </nav>
      </div>
    </header>

    <div class="docs-layout">
      <nav class="docs-sidebar" id="docs-sidebar" aria-label="Documentation">
        ${sidebar}
      </nav>
      <main class="docs-main" id="docs-main" tabindex="-1">
        ${articles}
      </main>
    </div>
    <div class="docs-scrim" hidden data-docs-scrim></div>

    <footer class="docs-footer">
      <span>© 2026 Varp. Rights intelligence for tokenized assets.</span>
      <span><a href="index.html">Home</a><a href="app.html">Registry</a><a href="#/glossary">Glossary</a></span>
    </footer>

    <script type="application/json" id="docs-search-index">${JSON.stringify(searchIndex).replaceAll("<", "\\u003c")}</script>
    <script type="module" src="assets/js/docs.js"></script>
  </body>
</html>
`;

await writeFile(outputFile, html);
console.log(`Docs written to ${outputFile} (${ordered.length} pages)`);
