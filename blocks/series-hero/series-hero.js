/**
 * series-hero — listing (series) page hero, live `series-hero hero-rectangle-content`:
 * full-bleed background image, breadcrumb trail, series logo, series name, tagline,
 * description and a CTA that scrolls to the product listing. Template-slotted.
 * Schema: stardust/eds-schema/us-en-c-desktops-legion-desktops-legion-t-series-towers.json
 * section 0 (series-hero).
 *
 * Authoring (any row/cell shape — classified by content, never by index):
 *   - <picture>/<img> in a cell WITHOUT a heading   background image (editorial)
 *   - <picture>/<img> in the cell holding the h1    series logo
 *   - <ul>/<ol>                                     breadcrumb trail (links; last item plain text)
 *   - <h1>                                          series name (the page's single h1)
 *   - <h2>/<h3>                                     tagline
 *   - <p> without a lone link                       description
 *   - <p> holding only a link                       CTA link
 *   - <p> holding only <strong> text                CTA button that scrolls to the product listing
 *                                                   (#dlp — the product-listing block id)
 *   - a further <picture>/<img> in its own cell     foreground product image (optional, `is-split`)
 *
 * Variant `is-split` (live new-series-hero-banner): breadcrumb row on top, text column left,
 * product image right, pill CTA.
 */

function wrap(className, ...nodes) {
  const w = document.createElement('div');
  w.className = className;
  w.append(...nodes);
  return w;
}

function isCta(p) {
  const a = p.querySelector('a, strong');
  return !!a && p.textContent.trim() === a.textContent.trim();
}

export default function decorate(block) {
  if (block.querySelector(':scope > .banner-container')) return;
  const h1 = block.querySelector('h1');
  const titleCell = h1 ? h1.closest('div') : null;
  const media = [...block.querySelectorAll('picture, img')]
    .filter((m) => m.tagName === 'PICTURE' || !m.closest('picture'));
  const logo = media.find((m) => titleCell && titleCell.contains(m));
  const [bg, product] = media.filter((m) => m !== logo);
  const crumbs = block.querySelector('ul, ol');
  const tagline = block.querySelector('h2, h3');
  const paras = [...block.querySelectorAll('p')]
    .filter((p) => !p.querySelector('picture, img') && !p.closest('li'));
  const ctas = paras.filter(isCta);
  const descs = paras.filter((p) => !ctas.includes(p));

  const container = wrap('banner-container');
  if (bg) container.append(wrap('series-hero-background', bg));
  const left = wrap('wrap-left');
  if (crumbs) {
    const nav = document.createElement('nav');
    nav.className = 'breadcrumbs';
    nav.setAttribute('aria-label', 'breadcrumbs');
    nav.append(crumbs);
    left.append(nav);
  }
  if (logo) left.append(wrap('product-logo', logo));
  if (h1) left.append(wrap('product-name', h1));
  if (tagline) left.append(wrap('product-title', tagline));
  if (descs.length) left.append(wrap('product-desc', ...descs));
  const actions = ctas.map((p) => {
    const box = wrap('series-hero-cta', p);
    if (!p.querySelector('a')) {
      box.setAttribute('role', 'button');
      box.setAttribute('tabindex', '0');
      const go = () => document.getElementById('dlp')?.scrollIntoView({ behavior: 'smooth' });
      box.addEventListener('click', go);
      box.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          go();
        }
      });
    }
    return box;
  });
  if (actions.length) left.append(wrap('hero-bottom-group', wrap('product-btn', ...actions)));
  container.append(left);
  if (product) container.append(wrap('series-hero-product', product));
  block.replaceChildren(container);
}
