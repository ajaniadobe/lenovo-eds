/**
 * hero-banner — live x-cms-ofp-fe-common-hero-v2 `heroType1`: a full-bleed 500px image banner
 * with an overlaid text column (optional logo, title, description, one CTA). Template-slotted.
 * Variants: default = left column, pill CTA (deals hero); `is-center` = centred column, square
 * CTA (series brand banner).
 *
 * Authoring (classified by content, never by index):
 *   - <picture>/<img> in a cell WITHOUT a heading   background image; a second such image is the
 *                                                   ≤767px background (optional)
 *   - <picture>/<img> in the cell with the heading  logo (optional)
 *   - <h1>/<h2>                                     title
 *   - <p> without a lone link                       description
 *   - <p> holding only a link                       CTA
 */

function wrap(className, ...nodes) {
  const w = document.createElement('div');
  w.className = className;
  w.append(...nodes);
  return w;
}

function isCta(p) {
  const a = p.querySelector('a');
  return !!a && p.textContent.trim() === a.textContent.trim();
}

export default function decorate(block) {
  if (block.querySelector(':scope > .hero-banner-media')) return;
  const heading = block.querySelector('h1, h2, h3');
  const textCell = heading ? heading.closest('div') : null;
  const media = [...block.querySelectorAll('picture, img')]
    .filter((m) => m.tagName === 'PICTURE' || !m.closest('picture'));
  const logo = media.find((m) => textCell && textCell.contains(m));
  const [bg, bgMobile] = media.filter((m) => m !== logo);
  const paras = [...block.querySelectorAll('p')]
    .filter((p) => !p.querySelector('picture, img'));
  const ctas = paras.filter(isCta);
  const descs = paras.filter((p) => !ctas.includes(p));

  const mediaBox = wrap('hero-banner-media');
  if (bg) mediaBox.append(wrap('hero-banner-bg', bg));
  if (bgMobile) {
    mediaBox.classList.add('has-mobile');
    mediaBox.append(wrap('hero-banner-bg-mobile', bgMobile));
  }
  const content = wrap('hero-banner-content');
  if (logo) content.append(wrap('hero-banner-logo', logo));
  if (heading) content.append(wrap('hero-banner-title', heading));
  if (descs.length) content.append(wrap('hero-banner-desc', ...descs));
  if (ctas.length) content.append(wrap('hero-banner-cta', ...ctas));
  block.replaceChildren(mediaBox, content);
}
