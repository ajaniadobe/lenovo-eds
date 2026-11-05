/**
 * series-blade — live `series-blade2`: a full-height image beside a solid colour panel
 * holding an optional logo, a headline, a description and an optional link CTA.
 * Template-slotted. Variants (block classes): `is-right` (panel right, default) |
 * `is-left` (panel left); panel tone `tone-navy` | `tone-plum` | `tone-wine`.
 * Schema: stardust/eds-schema/us-en-c-desktops-legion-desktops-legion-t-series-towers.json
 * sections 1–3 (series-blade2).
 *
 * Authoring (classified by content, never by index):
 *   - <picture>/<img> in a cell WITHOUT a heading   background image (editorial)
 *   - <picture>/<img> in the cell holding the heading  panel logo (optional)
 *   - <h2>/<h3>                                     headline
 *   - <p> without a lone link                       description
 *   - <p> holding only a link                       CTA (optional)
 *
 * @ew-exempt presentational — the "open in new tab" screen-reader hint is a fixed UI string
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
  if (block.querySelector(':scope > .blade-panel')) return;
  if (!block.classList.contains('is-left')) block.classList.add('is-right');
  const heading = block.querySelector('h1, h2, h3, h4');
  const panelCell = heading ? heading.closest('div') : null;
  const media = [...block.querySelectorAll('picture, img')]
    .filter((m) => m.tagName === 'PICTURE' || !m.closest('picture'));
  const logo = media.find((m) => panelCell && panelCell.contains(m));
  const bg = media.find((m) => m !== logo);
  const paras = [...block.querySelectorAll('p')]
    .filter((p) => !p.querySelector('picture, img'));
  const ctas = paras.filter(isCta);
  const descs = paras.filter((p) => !ctas.includes(p));

  const background = wrap('blade-background');
  if (bg) background.append(bg);

  const panel = document.createElement('article');
  panel.className = 'blade-panel';
  if (logo) panel.append(wrap('product-logo', logo));
  if (heading) panel.append(wrap('product-headline', heading));
  if (descs.length) panel.append(wrap('product-desc', ...descs));
  const hint = document.createElement('span');
  hint.className = 'sr-only';
  hint.textContent = 'open in new tab';
  panel.append(hint);
  if (ctas.length) panel.append(wrap('product-btn', ...ctas));

  block.replaceChildren(background, panel);
}
