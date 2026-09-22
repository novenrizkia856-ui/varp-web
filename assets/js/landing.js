import { initHeroEffects } from "./hero-effects.js";

initHeroEffects();

const contractButton = document.querySelector("[data-copy-contract]");
const contractValue = document.querySelector("[data-contract-value]");

async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch {
      // Fall through for browser contexts where the async clipboard API is unavailable.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

contractButton?.addEventListener("click", async () => {
  const value = contractValue?.textContent?.trim() || "Coming soon";
  const label = contractButton.querySelector(".font-sans");

  try {
    await copyText(value);
    if (label) label.textContent = "Copied";
  } catch {
    if (label) label.textContent = "Try again";
  }

  window.setTimeout(() => {
    if (label) label.textContent = "Copy";
  }, 4000);
});

document.querySelectorAll("button").forEach((button) => {
  const label = button.textContent.replace(/\s+/g, " ").trim();

  if (label === "Open App" || label === "Open Varp") {
    button.addEventListener("click", () => {
      window.location.href = "app.html";
    });
  }

  if (label === "Explore Rights Profiles") {
    button.addEventListener("click", () => {
      document.querySelector("#profiles")?.scrollIntoView({ behavior: "smooth" });
    });
  }
});

// Scroll reveal for profile cards and the docs section.
const revealTargets = document.querySelectorAll(".reveal");
if (revealTargets.length && "IntersectionObserver" in window) {
  document.documentElement.classList.add("reveal-ready");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
  );
  revealTargets.forEach((target) => observer.observe(target));
}
