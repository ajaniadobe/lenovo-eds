/**
 * pdp-models — "Models" list of a series PDP: filter facets, result bar, model cards and the
 * optional "Recommended for you" row (static snapshot of the live listing).
 * Authoring: one row per part, two cells — key | content. Keys (left cell, plain word):
 *   heading       <h2> + optional rewards note <p>
 *   filters       title <p>, action <p>, then per facet <h3> + <ul> of options [+ "See More" <p>]
 *   results       count <p>, sort <p>
 *   model         one row per card: [flag <p><strong>], <h3> name, [<p><em>badge</em></p>], <img>,
 *                 est <p> with <del>, price <p><strong>now</strong> <em>saving</em></p>, lease <p>,
 *                 rewards <p>, <ul> spec lines (<li><img> text</li>), "Additional Specs" <p>,
 *                 cart <p><strong>…</strong></p>, [stock <p><em>], [<p><u>box</u></p>],
 *                 delivery <p>,
 *                 [<p><u>Price Match Guarantee</u></p>], [<h4> + <ul> add-ons], part <p>,
 *                 less <p>
 *   recs-heading  <h2>
 *   rec           one row per recommendation: link <p>, rating <p>, bullet <p>, <img>, label <p>,
 *                 price <p><strong>
 *
 * @ew-exempt metadata — the key cell (cell 1) of every row is a part name, never displayed
 */
function el(tag, className, attrs = {}) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
  return e;
}
function wrap(nodes, className, tag = 'div') {
  const w = el(tag, className);
  w.append(...nodes);
  return w;
}
const keyOf = (cell) => (cell ? cell.textContent.trim().toLowerCase().replace(/\s+/g, '-') : '');
const kids = (cell) => (cell ? [...cell.children] : []);

function buildStars(value) {
  const stars = el('span', 'stars', { 'aria-hidden': 'true' });
  for (let i = 0; i < 5; i += 1) {
    const fill = Math.max(0, Math.min(1, value - i));
    const s = el('span', 'star');
    s.style.setProperty('--fill', `${Math.round(fill * 100)}%`);
    stars.append(s);
  }
  return stars;
}

function buildFilters(cell) {
  const box = el('aside', 'models-facets');
  const nodes = kids(cell);
  const top = el('div', 'facets-top');
  let group = null;
  nodes.forEach((n) => {
    if (/^H[1-6]$/.test(n.tagName)) {
      group = el('div', 'facet');
      group.append(wrap([n], 'facet-name'));
      box.append(group);
    } else if (n.tagName === 'UL') {
      n.querySelectorAll('li').forEach((li) => {
        li.prepend(el('span', 'box', { 'aria-hidden': 'true' }));
        const m = li.textContent.match(/(\d) stars?/);
        if (m) {
          const t = [...li.childNodes].find((c) => c.nodeType === 3 && /stars?/.test(c.textContent));
          if (t) t.textContent = t.textContent.replace(/\d stars?\s*/, '');
          li.insertBefore(buildStars(Number(m[1])), li.children[1] || null);
        }
      });
      (group || box).append(n);
    } else if (group) group.append(wrap([n], 'facet-more'));
    else top.append(n);
  });
  box.prepend(top);
  return box;
}

function classify(n, card, inAddons) {
  const t = n.textContent.trim();
  const named = !!card.querySelector('.model-name');
  const strongOnly = n.querySelector(':scope > strong:only-child')
    && t === n.querySelector('strong').textContent.trim();
  if (n.tagName === 'H3') return 'model-name';
  if (n.tagName === 'H4') return 'model-addons-title';
  if (n.tagName === 'UL') return inAddons ? 'model-addons' : 'model-specs';
  if (n.querySelector('img, picture')) return 'model-img';
  if (n.querySelector('del')) return 'model-est';
  if (/^Lease/.test(t)) return 'model-lease';
  if (n.querySelector(':scope > strong') && /Rewards/.test(t)) return 'model-rewards';
  if (n.querySelector(':scope > strong') && /^\$/.test(t)) return 'model-price';
  if (strongOnly) return named ? 'model-cart' : 'model-flag';
  if (n.querySelector(':scope > em:only-child')) {
    return named && !card.querySelector('.model-img') ? 'model-badge' : 'model-stock';
  }
  if (n.querySelector('u')) return 'model-link';
  if (n.querySelector('strong')?.textContent === 'Delivery') return 'model-delivery';
  if (/^Part Number/.test(t)) return 'model-part';
  if (t === 'Additional Specs') return 'model-more';
  if (t === 'See Less') return 'model-less';
  return 'model-line';
}

function buildCard(cell) {
  const card = el('li', 'model-card');
  const head = el('div', 'model-head');
  head.append(el('span', 'cmp'), el('span', 'heart'));
  head.setAttribute('aria-hidden', 'true');
  card.append(head);
  let inAddons = false;
  kids(cell).forEach((n) => {
    if (n.tagName === 'H4') inAddons = true;
    card.append(wrap([n], classify(n, card, inAddons)));
  });
  const deco = (cls) => el('span', cls, { 'aria-hidden': 'true' });
  card.querySelectorAll('.model-addons li').forEach((li) => li.prepend(deco('box')));
  card.querySelectorAll('.model-lease').forEach((l) => l.prepend(deco('k-logo')));
  return card;
}

function buildRec(cell) {
  const li = el('li', 'rec-card');
  const link = cell.querySelector('a');
  kids(cell).forEach((n, i) => {
    let cls = 'rec-line';
    if (i === 0) cls = 'rec-name';
    else if (n.querySelector('img, picture')) cls = 'rec-img';
    else if (n.querySelector('strong') && /^\d/.test(n.textContent.trim())) {
      cls = 'rec-rating';
      n.prepend(buildStars(parseFloat(n.textContent)));
    } else if (n.querySelector('strong')) cls = 'rec-price';
    li.append(wrap([n], cls));
  });
  if (link) {
    // the whole recommendation card is one link to the product (live behaviour)
    const a = el('a', 'rec-link', { href: link.getAttribute('href') });
    a.append(...li.childNodes);
    li.append(a);
  }
  return li;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .models-in')) return;
  const rows = [...block.children].map((r) => [...r.children]).filter((c) => c.length >= 2);
  const inner = el('div', 'models-in');
  const content = el('div', 'models-content');
  const list = el('div', 'models-list');
  const cards = el('ul', 'models-cards');
  const recs = el('ul', 'recs-cards');
  let recsHead = null;
  rows.forEach(([k, cell]) => {
    const key = keyOf(k);
    if (key === 'heading') inner.prepend(wrap(kids(cell), 'models-title'));
    else if (key === 'filters') content.prepend(buildFilters(cell));
    else if (key === 'results') list.prepend(wrap(kids(cell), 'models-bar'));
    else if (key === 'model') cards.append(buildCard(cell));
    else if (key === 'recs-heading') recsHead = wrap(kids(cell), 'recs-title');
    else if (key === 'rec') recs.append(buildRec(cell));
    else list.append(...kids(cell));
  });
  list.append(cards);
  content.append(list);
  inner.append(content);
  if (recsHead || recs.children.length) {
    const r = el('div', 'models-recs');
    if (recsHead) r.append(recsHead);
    r.append(recs);
    inner.append(r);
  }
  block.replaceChildren(inner);
  const section = block.closest('.section');
  if (section && !document.getElementById('models')) section.id = 'models';
}
