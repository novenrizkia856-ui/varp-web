import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const target = path.join(root, 'index.html');
let html = fs.readFileSync(target, 'utf8');
const burstSvg = fs.readFileSync(path.join(root, 'assets', 'images', 'varp-hero-burst.svg'), 'utf8');

const sectionStart = '<section class="relative min-h-[90vh] flex items-end pt-32 sm:pt-40 overflow-hidden">';
const heroLayers = `${sectionStart}<div class="varp-hero-atmosphere" aria-hidden="true"></div><div class="varp-hero-burst" aria-hidden="true">${burstSvg}</div>`;

if (!html.includes('varp-hero-atmosphere')) {
  if (!html.includes(sectionStart)) throw new Error('Hero section was not found');
  html = html.replace(sectionStart, heroLayers);
  fs.writeFileSync(target, html);
}

const externalBurst = '<div class="varp-hero-burst" aria-hidden="true"><img src="assets/images/varp-hero-burst.svg" alt=""></div>';
if (html.includes(externalBurst)) {
  html = html.replace(externalBurst, `<div class="varp-hero-burst" aria-hidden="true">${burstSvg}</div>`);
  fs.writeFileSync(target, html);
}

html = html.replace('<circle cx="422" cy="392" r="77" fill="url(#hub)"/>', '<circle cx="422" cy="392" r="46" fill="url(#hub)"/>');

const intelligenceCard = '<div class="varp-hero-intel" aria-hidden="true"><div class="varp-intel-top"><span><i></i>Rights signal</span><b>Live</b></div><div class="varp-intel-score"><strong>96</strong><span><em>%</em> evidence<br>confidence</span></div><div class="varp-intel-track"><i></i></div><div class="varp-intel-tags"><span>Ownership</span><span>Transfer</span><span>Evidence</span></div></div>';
if (!html.includes('varp-hero-intel')) {
  const burstStart = html.indexOf('<div class="varp-hero-burst"');
  const burstEnd = html.indexOf('</svg></div>', burstStart);
  if (burstStart === -1 || burstEnd === -1) throw new Error('Hero burst was not found');
  const insertionPoint = burstEnd + '</svg></div>'.length;
  html = `${html.slice(0, insertionPoint)}${intelligenceCard}${html.slice(insertionPoint)}`;
}
fs.writeFileSync(target, html);
