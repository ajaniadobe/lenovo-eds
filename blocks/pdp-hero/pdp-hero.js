/**
 * pdp-hero — product detail lead: breadcrumb, image gallery and the buy box.
 * Schema: stardust/eds-schema/us-en-p-laptops-legion-laptops-legion-pro-series-
 *   legion-pro-5i-gen-10-16-inch-intel-83f300bbus.json (section "pdp-hero").
 * Decode tier: template-slotted — the buy box is a fixed composition; authored nodes are
 * MOVED into empty slots by key.
 *
 * Authoring: one row per field, two cells — key | content. Every key is optional; a sibling
 * page authors only what it has. Keys (left cell, plain word):
 *   breadcrumb  <ul> of links, last item plain text (current page)
 *   gallery     one <img> per gallery slide (first = stage image)
 *   badge       processor/partner badge <img>
 *   flag        deal flag <p>
 *   title       the page <h1>
 *   rating      <p><a href="#reviews"><strong>4.5</strong> (573)</a></p> (stars drawn from 4.5)
 *   message     social-proof <p>
 *   price       <p>Est Value <del>was</del></p><p><strong>now</strong> <em>saving</em></p>
 *   financing   lease line <p> (<strong> for the bold runs, a link)
 *   rewards     <p><strong>program</strong> text <em>amount</em> text <a>join</a></p> and an
 *               optional <ul> = the program popover opened from the amount
 *   cart        <p><strong><a>Add To Cart</a></strong></p> and an optional <p>Compare</p>
 *   delivery    <p>FREE <strong>Delivery</strong> date text</p>
 *   specs       intro <p>s, <h2> + "view all" link <p>, then per group <h3> + <ul> of
 *               <li><strong>label</strong> value</li>, a trailing part-number <p>
 *   offers      <h2> then one <ul> per offer panel
 *   addons      <h2> then <ul> of add-on lines (<em> = product name, <strong> = price)
 *
 * Variant `subseries` (series PDP — "Starting at" + View Models): breadcrumb, gallery, badge
 * (one or more partner <img>s), flag, headline (eyebrow <p>), title, subtitle <p>, rating,
 * message, price (<p>Starting at</p><p><strong>price</strong></p>), cta (<p><a>View Models</a>),
 * intro (<p>s), overview (<p>s + <ul> bullets), features (<ul> of <li><img> label</li>), offers.
 * Variant `light`: the white-page palette of the same composition.
 *
 * @ew-exempt metadata — the key cell (cell 1) of every row is a field name, never displayed
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
function stripInstrumentation(node) {
  node.querySelectorAll('[data-prose-index], [data-image-index]').forEach((n) => {
    n.removeAttribute('data-prose-index');
    n.removeAttribute('data-image-index');
  });
  node.removeAttribute('data-prose-index');
  node.removeAttribute('data-image-index');
  return node;
}
const keyOf = (cell) => (cell ? cell.textContent.trim().toLowerCase().replace(/\s+/g, '-') : '');
const kids = (cell) => (cell ? [...cell.children] : []);
const mediaOf = (n) => (n.matches('picture, img') ? n : n.querySelector('picture, img'));

/** star row for a 0–5 rating — decorative, aria-hidden, no text */
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

function buildGallery(cell) {
  const media = kids(cell).map(mediaOf).filter(Boolean).map((m) => m.closest('p') || m);
  if (!media.length) return null;
  const gallery = el('div', 'pdp-gallery');
  const stage = el('figure', 'pdp-gallery-stage');
  const rail = el('ul', 'rail');
  media.forEach((m, i) => {
    const thumb = el('li', i === 0 ? 'thumb is-active' : 'thumb');
    if (i === 0) {
      thumb.append(stripInstrumentation(m.cloneNode(true)));
      stage.append(m);
      const img = m.querySelector('img') || m;
      img.loading = 'eager';
      img.fetchPriority = 'high';
    } else thumb.append(m);
    thumb.addEventListener('click', () => {
      rail.querySelectorAll('.thumb').forEach((t) => t.classList.remove('is-active'));
      thumb.classList.add('is-active');
      const clone = stripInstrumentation(thumb.firstElementChild.cloneNode(true));
      clone.querySelectorAll('img').forEach((im) => { im.loading = 'eager'; });
      stage.replaceChildren(clone);
    });
    rail.append(thumb);
  });
  const view = el('div', 'rail-view');
  view.append(rail);
  const prev = el('button', 'rail-btn rail-btn-prev', { type: 'button', 'aria-label': 'previous slide' });
  const next = el('button', 'rail-btn rail-btn-next', { type: 'button', 'aria-label': 'next slide' });
  prev.addEventListener('click', () => view.scrollBy({ left: -94, behavior: 'smooth' }));
  next.addEventListener('click', () => view.scrollBy({ left: 94, behavior: 'smooth' }));
  const railWrap = el('div', 'pdp-gallery-rail');
  railWrap.append(prev, view, next);
  gallery.append(stage, railWrap);
  return gallery;
}

function buildSpecs(cell) {
  const box = el('div', 'sys-specs');
  let top = null;
  let group = null;
  kids(cell).forEach((n) => {
    if (n.tagName === 'H2') {
      top = el('div', 'sys-specs-top');
      top.append(wrapNode(n, 'sys-specs-title'));
      box.append(top);
      group = null;
    } else if (/^H[3-6]$/.test(n.tagName)) {
      group = el('div', 'spec-group');
      group.append(wrapNode(n, 'spec-group-name'));
      box.append(group);
    } else if (n.tagName === 'UL' || n.tagName === 'OL') {
      (group || box).append(n);
    } else if (top && !group && n.querySelector('a')) {
      top.append(wrapNode(n, 'sys-specs-all'));
    } else if (!top) {
      box.append(wrapNode(n, 'win'));
    } else {
      box.append(wrapNode(n, 'part'));
    }
  });
  return box;
}

function buildPanels(cell, className) {
  const box = el('div', className);
  let first = true;
  kids(cell).forEach((n) => {
    if (/^H[1-6]$/.test(n.tagName)) box.append(wrapNode(n, `${className}-title`));
    else if (n.tagName === 'UL' || n.tagName === 'OL') {
      if (className === 'addons') {
        n.querySelectorAll(':scope > li').forEach((li, i) => {
          const input = el('input', '', { type: 'checkbox', 'aria-label': `add-on ${i + 1}` });
          li.prepend(input);
        });
        box.append(wrapNode(n, 'addon-list'));
      } else {
        box.append(wrapNode(n, first ? 'offer offer-finance' : 'offer offer-deal'));
        first = false;
      }
    } else box.append(n);
  });
  return box;
}

/** series PDP: badges row, gallery, then a details column of optional fields */
function decorateSubseries(block, fields) {
  const put = (key, className, parent) => {
    const nodes = kids(fields[key]);
    if (!nodes.length) return null;
    const w = el('div', className);
    w.append(...nodes);
    parent.append(w);
    return w;
  };
  const out = [];
  const crumbs = kids(fields.breadcrumb).find((n) => n.tagName === 'UL' || n.tagName === 'OL');
  if (crumbs) {
    const nav = wrapNode(crumbs, 'pdp-crumbs', 'nav');
    nav.setAttribute('aria-label', 'breadcrumb');
    out.push(nav);
  }
  const badges = el('div', 'pdp-badges');
  kids(fields.badge).forEach((n) => badges.append(n));
  out.push(badges);
  const boxEl = el('div', 'pdp-hero-box');
  const main = el('div', 'pdp-hero-main');
  boxEl.append(main);
  out.push(boxEl);
  const gallery = buildGallery(fields.gallery);
  if (gallery) main.append(gallery);
  const body = el('div', 'pdp-buy-body');
  main.append(body);
  put('flag', 'flag', body);
  put('headline', 'pdp-headline', body);
  put('title', 'pdp-title', body);
  put('subtitle', 'pdp-subtitle', body);
  const rating = put('rating', 'pdp-rating', body);
  if (rating) {
    const value = parseFloat(rating.querySelector('strong')?.textContent || rating.textContent);
    if (!Number.isNaN(value)) (rating.querySelector('a') || rating).prepend(buildStars(value));
  }
  const msg = put('message', 'switch-msg', body);
  if (msg) msg.prepend(el('span', 'bag', { 'aria-hidden': 'true' }));
  put('price', 'pdp-from', body);
  const cta = put('cta', 'pdp-view', body);
  if (cta) cta.querySelector('a')?.classList.add('view-models');
  put('intro', 'pdp-intro', body);
  put('overview', 'pdp-overview', body);
  const feats = put('features', 'pdp-feats', body);
  if (feats) {
    feats.querySelectorAll('li').forEach((li) => {
      const media = li.querySelector('picture, img');
      if (!media) return;
      const label = el('span', 'feat-text');
      [...li.childNodes].filter((c) => c !== media && !c.contains?.(media))
        .forEach((c) => label.append(c));
      const icon = wrapNode(media.closest('picture') || media, 'feat-icon', 'span');
      li.replaceChildren(icon, label);
    });
  }
  if (fields.offers) body.append(buildPanels(fields.offers, 'offers'));
  const known = ['breadcrumb', 'gallery', 'badge', 'flag', 'headline', 'title', 'subtitle', 'rating',
    'message', 'price', 'cta', 'intro', 'overview', 'features', 'offers'];
  const rest = [];
  Object.entries(fields).forEach(([k, cell]) => {
    if (!known.includes(k)) rest.push(...kids(cell));
  });
  if (rest.length) {
    const r = el('div', 'pdp-buy-rest');
    r.append(...rest);
    body.append(r);
  }
  block.replaceChildren(...out);
}

export default function decorate(block) {
  if (block.querySelector(':scope > .pdp-hero-box')) return;
  if (block.classList.contains('subseries')) {
    const sub = {};
    [...block.children].forEach((row) => {
      const cells = [...row.children];
      if (cells.length >= 2) [, sub[keyOf(cells[0])]] = cells;
    });
    decorateSubseries(block, sub);
    return;
  }
  const fields = {};
  const leftovers = [];
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length >= 2) [, fields[keyOf(cells[0])]] = cells;
    else leftovers.push(...kids(cells[0]));
  });
  const put = (key, className, parent) => {
    const nodes = kids(fields[key]);
    if (!nodes.length) return null;
    const w = el('div', className);
    w.append(...nodes);
    parent.append(w);
    return w;
  };

  const out = [];
  const crumbs = kids(fields.breadcrumb).find((n) => n.tagName === 'UL' || n.tagName === 'OL');
  if (crumbs) out.push(wrapNode(crumbs, 'pdp-crumbs', 'nav'));
  if (crumbs) crumbs.parentElement.setAttribute('aria-label', 'breadcrumb');

  const boxEl = el('div', 'pdp-hero-box');
  const main = el('div', 'pdp-hero-main');
  boxEl.append(main);
  out.push(boxEl);
  const gallery = buildGallery(fields.gallery);
  if (gallery) main.append(gallery);

  const buy = el('div', 'pdp-buy');
  main.append(buy);
  put('badge', 'pdp-buy-partner', buy);
  const body = el('div', 'pdp-buy-body');
  buy.append(body);
  put('flag', 'flag', body);
  put('title', 'pdp-title', body);
  const rating = put('rating', 'pdp-rating', body);
  if (rating) {
    const value = parseFloat(rating.querySelector('strong')?.textContent || rating.textContent);
    if (!Number.isNaN(value)) {
      const link = rating.querySelector('a');
      (link || rating).prepend(buildStars(value));
    }
  }
  const msg = put('message', 'switch-msg', body);
  if (msg) msg.prepend(el('span', 'bag', { 'aria-hidden': 'true' }));

  const price = el('div', 'pdp-price');
  const priceNodes = kids(fields.price);
  priceNodes.forEach((n) => price.append(wrapNode(n, n.querySelector('del, s') ? 'est' : 'now')));
  const fin = put('financing', 'katapult', price);
  if (fin) fin.prepend(el('span', 'k-logo', { 'aria-hidden': 'true' }));
  if (priceNodes.length || fin) price.append(el('div', 'paypal', { 'aria-hidden': 'true' }));
  const loyalty = put('rewards', 'loyalty', price);
  if (loyalty) {
    // a list in the rewards field is the program popover, opened from the amount (<em>)
    const pop = loyalty.querySelector(':scope > ul, :scope > ol');
    const amt = loyalty.querySelector('em');
    if (pop) {
      const layer = wrapNode(pop, 'le-popover');
      layer.hidden = true;
      loyalty.append(layer);
      if (amt) {
        amt.setAttribute('role', 'button');
        amt.tabIndex = 0;
        amt.addEventListener('click', () => { layer.hidden = !layer.hidden; });
      }
    }
  }
  if (price.children.length) body.append(price);

  const cartNodes = kids(fields.cart);
  if (cartNodes.length) {
    const ctas = el('div', 'pdp-ctas');
    const row = el('div', 'pdp-ctas-row');
    row.append(el('button', 'wish', { type: 'button', 'aria-label': 'Add to Wishlist' }));
    cartNodes.forEach((n, i) => {
      if (i === 0 || n.querySelector('a, strong')) {
        // commerce stays on the source store (dynamic-features rows 5-6): the cart action
        // opens this same product path on www.lenovo.com unless the author linked it
        const cart = wrapNode(n, 'add-to-cart');
        if (!n.querySelector('a')) {
          cart.setAttribute('role', 'link');
          cart.tabIndex = 0;
          const go = () => {
            window.location.href = `https://www.lenovo.com${window.location.pathname}`;
          };
          cart.addEventListener('click', go);
          cart.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
        }
        ctas.append(cart);
      } else {
        const cmp = el('label', 'compare');
        cmp.append(el('input', '', { type: 'checkbox' }), n);
        row.append(cmp);
      }
    });
    ctas.append(row);
    body.append(ctas);
  }
  put('delivery', 'delivery', body);
  if (fields.specs) body.append(buildSpecs(fields.specs));
  if (fields.offers) body.append(buildPanels(fields.offers, 'offers'));
  if (fields.addons) body.append(buildPanels(fields.addons, 'addons'));
  // leftovers: unknown keys and single-cell rows stay visible at the end of the buy box
  Object.entries(fields).forEach(([k, cell]) => {
    if (!['breadcrumb', 'gallery', 'badge', 'flag', 'title', 'rating', 'message', 'price',
      'financing', 'rewards', 'cart', 'delivery', 'specs', 'offers', 'addons'].includes(k)) {
      leftovers.push(...kids(cell));
    }
  });
  if (leftovers.length) {
    const rest = el('div', 'pdp-buy-rest');
    rest.append(...leftovers);
    body.append(rest);
  }
  block.replaceChildren(...out);
}
