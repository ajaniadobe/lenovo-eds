/**
 * pdp-similar — "Compare Similar Products" chips + product comparison cards (static snapshot).
 * Authoring (reconstructive, classified by row content):
 *   head row (has <h2>): eyebrow <p>, <h2>, sub <p>, <ul> of spec chips (selected chips in
 *     <strong>), "select all" <p>
 *   product row (has <img>): [badge <p><strong>…</strong></p>], title <p><a>, rating
 *     <p><a>4.5 (573)</a></p>, <img>, price <p>, <ul> of <li><strong>label</strong> value</li>,
 *     [shop <p><strong><a>…</a></strong></p>], compare label <p>.
 *     A product row without a shop link is the product currently viewed.
 *   text row without link: the "add similar product" tile; row with a link: the explore CTA.
 * Spec lines whose label matches no selected chip render hidden (live default selection).
 */
function wrapNode(node, className, tag = 'div') {
  const w = document.createElement(tag);
  w.className = className;
  w.append(node);
  return w;
}
function el(tag, className, attrs = {}) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
  return e;
}
function buildStars(value) {
  const stars = el('span', 'stars', { 'aria-hidden': 'true' });
  for (let i = 0; i < 5; i += 1) {
    const box = el('span', 'star-box');
    const fill = Math.max(0, Math.min(1, value - i));
    if (fill >= 1) box.append(el('span', 'star-icon yellow-icon'));
    else {
      box.append(el('span', 'star-icon gray-icon'));
      if (fill > 0) {
        const part = el('span', 'star-icon yellow-icon');
        part.style.width = `${Math.round(fill * 100)}%`;
        box.append(part);
      }
    }
    stars.append(box);
  }
  return stars;
}
const label = (li) => (li.querySelector('strong')?.textContent || '').trim().toLowerCase();
const isLinkPara = (n) => n.tagName === 'P' && !!n.querySelector('a')
  && n.textContent.trim() === n.querySelector('a').textContent.trim();
const isBadge = (n) => n.tagName === 'P' && !n.querySelector('a') && !!n.querySelector('strong')
  && n.textContent.trim() === n.querySelector('strong').textContent.trim();

function buildHead(nodes) {
  const head = el('div', 'pdp-similar-head');
  let seenTitle = false;
  nodes.forEach((n) => {
    if (/^H[1-6]$/.test(n.tagName)) {
      head.append(wrapNode(n, 'sec-title'));
      seenTitle = true;
    } else if (n.tagName === 'UL' || n.tagName === 'OL') {
      n.querySelectorAll(':scope > li').forEach((li) => {
        if (li.querySelector('strong')) li.classList.add('is-on');
      });
      head.append(wrapNode(n, 'chips'));
    } else if (!seenTitle) head.append(wrapNode(n, 'eyebrow'));
    else if (head.querySelector('.chips')) head.querySelector('.chips').append(wrapNode(n, 'select-all'));
    else head.append(wrapNode(n, 'sub'));
  });
  return head;
}

function buildCard(nodes, chipsOn) {
  const li = el('li', 'sim');
  const top = el('div', 'sim-top');
  const parts = {
    title: null, rating: null, media: null, price: null, specs: null, shop: null, compare: null,
  };
  nodes.forEach((n) => {
    const media = n.matches('picture, img') || n.querySelector('picture, img');
    if (media) parts.media = n;
    else if (n.tagName === 'UL' || n.tagName === 'OL') parts.specs = n;
    else if (isBadge(n) && !parts.title) top.append(wrapNode(n, 'badge'));
    else if (isLinkPara(n) && !parts.title) parts.title = n;
    else if (isLinkPara(n) && !parts.rating && !parts.media) parts.rating = n;
    else if (isLinkPara(n)) parts.shop = n;
    else if (!parts.price && parts.media) parts.price = n;
    else parts.compare = n;
  });
  const current = !parts.shop;
  if (current) li.classList.add('is-current');
  else top.append(el('button', 'remove', { type: 'button', 'aria-label': 'Remove from comparison list' }));
  li.append(top);
  if (parts.title) li.append(wrapNode(parts.title, 'sim-title'));
  if (parts.rating) {
    const r = wrapNode(parts.rating, 'sim-rating');
    const value = parseFloat(parts.rating.textContent);
    if (!Number.isNaN(value)) (parts.rating.querySelector('a') || r).prepend(buildStars(value));
    li.append(r);
  }
  if (parts.media) li.append(wrapNode(parts.media, 'sim-img'));
  if (parts.price) li.append(wrapNode(parts.price, 'sim-price'));
  if (parts.specs) {
    parts.specs.querySelectorAll(':scope > li').forEach((s) => {
      if (chipsOn.size && !chipsOn.has(label(s))) s.hidden = true;
    });
    li.append(wrapNode(parts.specs, 'sim-specs'));
  }
  const shop = el('div', 'sim-shop');
  if (parts.shop) shop.append(parts.shop);
  li.append(shop);
  if (parts.compare) {
    const cmp = el('label', 'sim-compare');
    cmp.append(el('input', '', { type: 'checkbox' }), parts.compare);
    li.append(cmp);
  }
  return li;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .sim-list')) return;
  const rows = [...block.children].map((row) => {
    const nodes = [];
    [...row.children].forEach((cell) => nodes.push(...cell.children));
    return nodes;
  });
  const out = [];
  const list = el('ul', 'sim-list');
  let chipsOn = new Set();
  const tail = [];
  rows.forEach((nodes) => {
    if (!nodes.length) return;
    const hasMedia = nodes.some((n) => n.matches('picture, img') || n.querySelector('picture, img'));
    if (nodes.some((n) => /^H[1-6]$/.test(n.tagName)) && !hasMedia) {
      const head = buildHead(nodes);
      chipsOn = new Set([...head.querySelectorAll('.chips li.is-on')]
        .map((c) => c.textContent.trim().toLowerCase()));
      out.push(head);
    } else if (hasMedia) list.append(buildCard(nodes, chipsOn));
    else if (nodes.some((n) => n.querySelector('a'))) nodes.forEach((n) => tail.push(wrapNode(n, 'explore')));
    else {
      const add = el('li', 'sim sim-add');
      const inner = el('div', 'sim-add-inner');
      inner.append(el('span', 'plus', { 'aria-hidden': 'true' }), ...nodes);
      add.append(inner);
      list.append(add);
    }
  });
  out.push(list, ...tail);
  block.replaceChildren(...out);
  const section = block.closest('.section');
  if (section && !document.getElementById('similar_products')) section.id = 'similar_products';
}
