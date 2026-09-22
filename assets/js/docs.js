const pages = [...document.querySelectorAll("[data-page]")];
const navLinks = [...document.querySelectorAll("[data-nav-link]")];
const sidebar = document.querySelector("#docs-sidebar");
const menuButton = document.querySelector("[data-docs-menu]");
const scrim = document.querySelector("[data-docs-scrim]");
const searchInput = document.querySelector("[data-docs-search]");
const searchResults = document.querySelector("[data-docs-results]");
const searchIndex = JSON.parse(document.querySelector("#docs-search-index")?.textContent || "[]");
const defaultSlug = pages[0]?.dataset.page || "introduction";
const baseTitle = "Varp Docs";

let tocObserver = null;

document.documentElement.classList.add("docs-js");

const escapeHtml = (value) =>
  String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

// Routes look like #/concepts/rights-model or #/concepts/rights-model~concepts-rights-model--ownership.
function parseHash() {
  const hash = decodeURIComponent(window.location.hash.slice(1));
  if (hash.startsWith("/")) {
    const [slug, section] = hash.slice(1).split("~");
    return { slug, section };
  }
  // Plain heading anchors from a no script visit still resolve to their page.
  const target = hash && document.getElementById(hash);
  const page = target?.closest("[data-page]");
  if (page) return { slug: page.dataset.page, section: hash };
  return { slug: defaultSlug, section: "" };
}

function setMenu(open) {
  document.body.classList.toggle("docs-menu-open", open);
  menuButton?.setAttribute("aria-expanded", String(open));
  if (scrim) scrim.hidden = !open;
}

function watchToc(page) {
  tocObserver?.disconnect();
  const links = [...page.querySelectorAll("[data-toc-link]")];
  if (!links.length) return;
  const headings = links.map((link) => document.getElementById(link.dataset.tocLink)).filter(Boolean);
  const setActive = (id) => links.forEach((link) => link.classList.toggle("is-active", link.dataset.tocLink === id));
  setActive(headings[0]?.id);
  tocObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActive(visible[0].target.id);
    },
    { rootMargin: "-90px 0px -65% 0px" },
  );
  headings.forEach((heading) => tocObserver.observe(heading));
}

function render({ slug, section }, { focus = false } = {}) {
  const page = pages.find((item) => item.dataset.page === slug) || pages.find((item) => item.dataset.page === defaultSlug);
  if (!page) return;
  pages.forEach((item) => {
    item.hidden = item !== page;
  });
  navLinks.forEach((link) => {
    const active = link.dataset.navLink === page.dataset.page;
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
    if (active) {
      const group = link.closest("[data-nav-group]");
      group?.classList.remove("is-collapsed");
      group?.querySelector(".docs-nav-heading")?.setAttribute("aria-expanded", "true");
    }
  });
  document.title = `${page.dataset.title} | ${baseTitle}`;
  setMenu(false);
  watchToc(page);

  const target = section && document.getElementById(section);
  if (target) {
    target.scrollIntoView({ block: "start" });
  } else {
    window.scrollTo({ top: 0 });
  }
  if (focus) document.querySelector("#docs-main")?.focus({ preventScroll: true });
}

window.addEventListener("hashchange", () => render(parseHash(), { focus: true }));

// Heading and table of contents anchors keep the page in the route.
document.addEventListener("click", (event) => {
  const anchor = event.target.closest('a[href^="#"]');
  if (!anchor || anchor.getAttribute("href").startsWith("#/")) return;
  const id = anchor.getAttribute("href").slice(1);
  const target = document.getElementById(id);
  const page = target?.closest("[data-page]");
  if (!page) return;
  event.preventDefault();
  history.replaceState(null, "", `#/${page.dataset.page}~${id}`);
  target.scrollIntoView({ behavior: "smooth", block: "start" });
});

document.querySelectorAll(".docs-nav-heading").forEach((button) => {
  button.addEventListener("click", () => {
    const group = button.closest("[data-nav-group]");
    const collapsed = group.classList.toggle("is-collapsed");
    button.setAttribute("aria-expanded", String(!collapsed));
  });
});

menuButton?.addEventListener("click", () => setMenu(!document.body.classList.contains("docs-menu-open")));
scrim?.addEventListener("click", () => setMenu(false));
sidebar?.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

document.querySelectorAll("[data-copy-code]").forEach((button) => {
  button.addEventListener("click", async () => {
    const code = button.closest(".doc-code")?.querySelector("code")?.textContent || "";
    try {
      await navigator.clipboard.writeText(code);
      button.textContent = "Copied";
    } catch {
      button.textContent = "Select text";
    }
    window.setTimeout(() => {
      button.textContent = "Copy";
    }, 2000);
  });
});

// Search across titles, headings, and body text.
let activeResult = -1;

function snippet(text, query) {
  const position = text.toLowerCase().indexOf(query);
  if (position === -1) return "";
  const start = Math.max(0, position - 40);
  const raw = text.slice(start, position + query.length + 60);
  const escaped = escapeHtml(raw);
  const matcher = new RegExp(escapeHtml(query).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig");
  return `${start > 0 ? "…" : ""}${escaped.replace(matcher, (match) => `<mark>${match}</mark>`)}…`;
}

function runSearch() {
  const query = searchInput.value.trim().toLowerCase();
  activeResult = -1;
  if (query.length < 2) {
    searchResults.hidden = true;
    searchResults.innerHTML = "";
    return;
  }
  const results = searchIndex
    .map((entry) => {
      const inTitle = entry.title.toLowerCase().includes(query);
      const heading = entry.headings.find((item) => item.toLowerCase().includes(query));
      const inText = entry.text.toLowerCase().includes(query);
      const score = (inTitle ? 3 : 0) + (heading ? 2 : 0) + (inText ? 1 : 0);
      return { entry, score, heading };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  searchResults.hidden = false;
  searchResults.innerHTML = results.length
    ? results
        .map(
          ({ entry, heading }) => `<a class="docs-result" role="option" href="#/${entry.slug}">
            <span class="docs-result-group">${escapeHtml(entry.group)}${heading ? ` / ${escapeHtml(heading)}` : ""}</span>
            <strong>${escapeHtml(entry.title)}</strong>
            <span class="docs-result-snippet">${snippet(entry.text, query)}</span>
          </a>`,
        )
        .join("")
    : `<p class="docs-result-empty">No pages match “${escapeHtml(searchInput.value.trim())}”.</p>`;
}

function closeSearch() {
  searchResults.hidden = true;
}

searchInput?.addEventListener("input", runSearch);
searchInput?.addEventListener("focus", runSearch);
searchInput?.addEventListener("keydown", (event) => {
  const items = [...searchResults.querySelectorAll(".docs-result")];
  if (event.key === "Escape") {
    closeSearch();
    searchInput.blur();
    return;
  }
  if (!items.length || !["ArrowDown", "ArrowUp", "Enter"].includes(event.key)) return;
  event.preventDefault();
  if (event.key === "Enter") {
    (items[activeResult] || items[0]).click();
    return;
  }
  activeResult = (activeResult + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
  items.forEach((item, index) => item.classList.toggle("is-active", index === activeResult));
  items[activeResult].scrollIntoView({ block: "nearest" });
});
searchResults?.addEventListener("click", (event) => {
  if (event.target.closest(".docs-result")) {
    closeSearch();
    searchInput.value = "";
  }
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".docs-search")) closeSearch();
});
document.addEventListener("keydown", (event) => {
  const typing = /input|textarea|select/i.test(document.activeElement?.tagName || "");
  if (event.key === "/" && !typing) {
    event.preventDefault();
    searchInput?.focus();
  }
});

render(parseHash());
