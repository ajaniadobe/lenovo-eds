/**
 * category-carousel — live dx-brands-carousel (deals DLP category strip): a background image
 * behind a paged row of category tiles (icon, title, one-line description, "View all" link that
 * covers the tile). Reconstructive (repeat group), prev / next paging.
 *
 * Authoring (classified by content, never by index):
 *   - row with an image and no heading             strip background; a second such row is the
 *                                                  ≤767px background (optional)
 *   - row with a heading                           tile: <picture>/<img> icon, <h2>/<h3> title,
 *                                                  <p> description, <p> holding only a link
 *
 * @ew-exempt widget chrome — "Previous page" / "Next page" control labels are fixed UI strings
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

function button(className, labelText) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = className;
  b.setAttribute('aria-label', labelText);
  return b;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .category-carousel-track')) return;
  const rows = [...block.children];
  const tileRows = rows.filter((r) => r.querySelector('h1, h2, h3, h4'));
  const bgRows = rows.filter((r) => !tileRows.includes(r) && r.querySelector('picture, img'));

  const media = wrap('category-carousel-bg');
  bgRows.forEach((r, i) => {
    const m = r.querySelector('picture') || r.querySelector('img');
    media.append(wrap(i ? 'bg-mobile' : 'bg-desktop', m));
  });
  if (bgRows.length > 1) media.classList.add('has-mobile');

  const list = document.createElement('ul');
  list.className = 'category-carousel-list';
  tileRows.forEach((r) => {
    const li = document.createElement('li');
    li.className = 'category-tile';
    const icon = r.querySelector('picture') || r.querySelector('img');
    const title = r.querySelector('h1, h2, h3, h4');
    const paras = [...r.querySelectorAll('p')].filter((p) => !p.querySelector('picture, img'));
    const link = paras.find(isCta);
    const descs = paras.filter((p) => p !== link);
    if (icon) li.append(wrap('category-tile-icon', icon));
    const body = wrap('category-tile-body', title, ...descs);
    if (link) {
      const a = link.querySelector('a');
      a.className = 'category-tile-link';
      body.append(a);
      link.remove();
    }
    li.append(body);
    list.append(li);
  });

  const viewport = wrap('category-carousel-viewport', list);
  const prev = button('category-carousel-prev', 'Previous page');
  const next = button('category-carousel-next', 'Next page');
  const page = (dir) => {
    viewport.scrollBy({ left: dir * viewport.clientWidth, behavior: 'smooth' });
  };
  prev.addEventListener('click', () => page(-1));
  next.addEventListener('click', () => page(1));
  block.replaceChildren(media, wrap('category-carousel-track', viewport, prev, next));
}
