/**
 * product-listing — live DLP (series listing, gaming-theme-black): section title, a facet
 * column (filter groups with option checkboxes) and the product card grid with a results
 * header, sort select and results footer. Reconstructive (repeat groups).
 * Schema: stardust/eds-schema/us-en-c-desktops-legion-desktops-legion-t-series-towers.json
 * section 4 (dlp: 6× facets-list, 4× product_item).
 *
 * Authoring — one row per unit, classified by content, never by row index:
 *   - row with an <h2> (no image)                 listing title
 *   - row with a <ul> and no <h3>/<img>           facet: first <p> = facet name,
 *                                                 <ul> items = options ("Label (count)")
 *   - row with an <h3>                            product card:
 *       <picture>/<img>                           product image
 *       <h3><a href=PDP>                          product title (link = card target)
 *       <p> "4.6 (100)"                           rating + review count (drives the stars)
 *       <p> before the price                      "Starting at" label
 *       <p> "$2,499.99"                           price
 *       <p> with "/week" after the price          Katapult lease line
 *       other <p>s after the price                My Lenovo Rewards lines (<em> = amount, toggles
 *                                                 the rewards popover)
 *       <ul> before the last list (optional)      rewards popover items (hidden until toggled)
 *       last <ul>                                 feature bullets
 *       <p> holding only a link (last)            card CTA
 *
 * Facets with more than 3 options show 3 + "See More". Results count / "Showing" footer are
 * computed from the number of cards.
 *
 * Sibling additions (all optional, classified by content):
 *   - row of <p>s only, one reading "N Matching results"   results total (+ "Sort by : X" <p>
 *                                                          = current sort); total > cards adds
 *                                                          the "Load more results" control
 *   - facet options cell: a <p> = search-box placeholder (all options shown); a second <ul> =
 *     options behind "See More"; a nested <ul> in an <li> = child options
 *   - facet row whose options cell holds two "$N" <p>s     price range (min / max inputs)
 *   - card: <p> before the <h3> = merchandising flag; <p> between <h3> and rating = subtitle;
 *     <p> with <del> before the price = list price; "N% off" = saving; "Business price: …" =
 *     member price line; a CTA in <strong> (primary) wins over a plain link CTA; <p>s after the
 *     CTA = card extras ("What's in the box")
 * Variants: theme-light (white DLP), has-wishlist (heart per card), features-collapsed (card
 * features behind "See More"), has-view-toggle (grid / list switch beside the sort).
 *
 * @ew-exempt widget chrome — Filters / Collapse All / See More / Compare / Sort by labels and
 *   options / computed result counts / skip link are fixed commerce-UI strings, not content
 */

const SORT_OPTIONS = ['Recommended', 'Price Low to High', 'Price High to Low', 'Best-Selling',
  'Highest Saving by %', 'Highest Saving by $', 'Newest'];
const SORT_CURRENT = 'Newest';
const FACET_VISIBLE = 3;
const TOTAL = /^\s*([\d,]+)\s+Matching results\s*$/i;
const SORT_BY = /^\s*Sort by\s*:?\s*(.+?)\s*$/i;
const MONEY = /^\s*\$[\d,]+(?:\.\d{2})?\s*$/;
const SAVING = /^\s*\d+%\s*off\s*$/i;
const BUSINESS = /^\s*Business price/i;

function el(tag, className, attrs = {}) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
  return e;
}

function wrap(className, ...nodes) {
  const w = el('div', className);
  w.append(...nodes);
  return w;
}

function label(tag, className, str, attrs = {}) {
  const e = el(tag, className, attrs);
  e.textContent = str;
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

const RATING = /^\s*(\d(?:\.\d+)?)\s*\(([\d,]+)\)\s*$/;
const PRICE = /^\s*\$[\d,]+(?:\.\d{2})?\s*$/;

function isCta(p) {
  const a = p.querySelector('a');
  return !!a && p.textContent.trim() === a.textContent.trim();
}

function buildStars(rating) {
  const stars = el('div', 'stars');
  for (let i = 0; i < 5; i += 1) {
    const box = el('div', 'star-icon-box');
    const fill = Math.max(0, Math.min(1, rating - i));
    if (fill >= 1) {
      box.append(el('div', 'star-icon yellow-icon'));
    } else {
      box.append(el('div', 'star-icon gray-icon'));
      if (fill > 0) {
        const part = el('div', 'star-icon yellow-icon');
        part.style.width = `${Math.round(fill * 100)}%`;
        box.append(part);
      }
    }
    stars.append(box);
  }
  return stars;
}

function addBox(li, labelText) {
  const box = el('input', 'facet-box', { type: 'checkbox', 'aria-label': labelText });
  li.prepend(box);
  li.addEventListener('click', (e) => {
    e.stopPropagation();
    if (e.target !== box) box.checked = !box.checked;
  });
}

function ownText(li) {
  return [...li.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent).join('').trim() || li.textContent.trim();
}

function buildFacet(rowEl) {
  const name = rowEl.querySelector('p, h3, h4, strong');
  const lists = [...rowEl.querySelectorAll('ul, ol')]
    .filter((u) => !u.parentElement.closest('ul, ol'));
  const list = lists[0];
  const nameText = name ? name.textContent.trim() : '';
  const others = [...rowEl.querySelectorAll('p')].filter((p) => p !== name);
  const prices = others.filter((p) => MONEY.test(p.textContent));
  const search = others.find((p) => !prices.includes(p));
  const facet = el('div', 'facets-list', { role: 'group', 'aria-label': nameText });

  const head = el('div', 'facets-name', {
    role: 'button', tabindex: '0', 'aria-label': nameText, 'aria-expanded': 'true',
  });
  const flex = el('div', 'facet-title', { role: 'heading', 'aria-level': '3' });
  if (name) flex.append(name);
  head.append(flex, el('span', 'up-arrow', { 'aria-hidden': 'true' }));

  const tip = el('div', 'positioned-tooltip');
  const ghost = el('span', 'anchor-facet-name', { 'aria-hidden': 'true' });
  if (name) ghost.append(stripInstrumentation(name.cloneNode(true)));
  const tipBtn = el('button', 'facets-tooltip', { type: 'button', 'aria-label': `more information about ${nameText}` });
  tipBtn.append(el('span', 'iconfont-tooltip-icon', { 'aria-hidden': 'true' }));
  tip.append(ghost, tipBtn);

  const items = el('div', 'item-list', { role: 'group', 'aria-label': nameText });
  if (search) {
    // authored search placeholder: a filter box above the options, which then all show
    const hint = search.textContent.trim();
    const box = el('label', 'facet-search');
    box.append(
      el('span', 'facet-search-icon', { 'aria-hidden': 'true' }),
      el('input', 'facet-search-input', { type: 'text', placeholder: hint, 'aria-label': hint }),
    );
    search.remove();
    items.append(box);
  }
  if (prices.length === 2) {
    const range = el('div', 'facet-price');
    prices.forEach((p, i) => {
      range.append(el('input', 'facet-price-input', {
        type: 'tel', value: p.textContent.trim(), 'aria-label': `${i ? 'Maximum' : 'Minimum'} price`,
      }));
      p.remove();
    });
    const track = el('div', 'facet-price-track', { 'aria-hidden': 'true' });
    track.append(el('span', 'facet-price-knob'), el('span', 'facet-price-knob'));
    items.append(range, track);
  }
  let lis = [];
  let hidden = [];
  if (list) {
    list.querySelectorAll('li li').forEach((li) => addBox(li, li.textContent.trim()));
    lis = [...list.children];
    // a second authored list holds the options behind "See More" (authored split)
    lists.slice(1).forEach((u) => {
      hidden.push(...u.children);
      list.append(...u.children);
      u.remove();
    });
    if (!lists[1] && !search && lis.length > FACET_VISIBLE) hidden = lis.slice(FACET_VISIBLE);
    [...list.children].forEach((li) => {
      addBox(li, ownText(li));
      li.hidden = hidden.includes(li);
    });
    items.append(list);
    if (hidden.length) {
      const more = label('div', 'learn-more', 'See More', {
        role: 'button', tabindex: '0', 'aria-label': `See More ${nameText}`,
      });
      more.addEventListener('click', () => {
        const open = more.textContent === 'See Less';
        hidden.forEach((li) => { li.hidden = open; });
        more.textContent = open ? 'See More' : 'See Less';
      });
      items.append(more);
    }
  }
  head.addEventListener('click', () => {
    const open = head.getAttribute('aria-expanded') === 'true';
    head.setAttribute('aria-expanded', String(!open));
    items.hidden = open;
  });
  facet.append(head, tip, items);
  return facet;
}

function precedes(a, b) {
  // eslint-disable-next-line no-bitwise
  return !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
}

function buildCard(rowEl, index, opts = {}) {
  const item = el('li', 'product-item');
  if (index >= 2) item.classList.add('row-2');
  const media = rowEl.querySelector('picture') || rowEl.querySelector('img');
  const title = rowEl.querySelector('h3');
  const titleLink = title ? title.querySelector('a') : null;
  const href = titleLink ? titleLink.getAttribute('href') : '';
  const titleText = title ? title.textContent.trim() : '';
  const paras = [...rowEl.querySelectorAll('p')]
    .filter((p) => !p.querySelector('picture, img') && !p.closest('li'));
  const lists = [...rowEl.querySelectorAll('ul, ol')].filter((u) => !u.parentElement.closest('ul, ol'));
  const features = lists[lists.length - 1];
  const popovers = lists.slice(0, -1);
  // a primary (strong) CTA wins; else the last paragraph that is only a link
  const cta = paras.find((p) => isCta(p) && p.querySelector('strong a, a.primary'))
    || [...paras].reverse().find(isCta);
  const extras = cta ? paras.filter((p) => precedes(cta, p)) : [];
  const flags = title ? paras.filter((p) => p !== cta && precedes(p, title)) : [];
  const rest = paras.filter((p) => p !== cta && !extras.includes(p) && !flags.includes(p));
  const rating = rest.find((p) => RATING.test(p.textContent));
  const subtitle = rating && title
    ? rest.filter((p) => precedes(title, p) && precedes(p, rating)) : [];
  const price = rest.find((p) => p !== rating && PRICE.test(p.textContent));
  const order = rest.filter((p) => p !== rating && p !== price && !subtitle.includes(p));
  const pi = price ? paras.indexOf(price) : -1;
  const before = order.filter((p) => paras.indexOf(p) < pi);
  const after = order.filter((p) => paras.indexOf(p) > pi);
  const saving = after.find((p) => SAVING.test(p.textContent));
  const business = after.find((p) => BUSINESS.test(p.textContent));
  const lease = after.find((p) => /\/\s*(week|month)/i.test(p.textContent));
  const loyalty = after.filter((p) => p !== lease && p !== saving && p !== business);

  const compare = el('label', 'common-compare');
  compare.append(
    el('input', 'compare-box', { type: 'checkbox', 'aria-label': `Compare ${titleText}` }),
    label('span', 'compare-text', 'Compare'),
  );
  const merch = wrap('card-merch', compare);
  if (opts.wishlist) {
    const heart = el('button', 'card-wish', { type: 'button', 'aria-label': `Add ${titleText} to Wishlist`, 'aria-pressed': 'false' });
    heart.addEventListener('click', () => {
      heart.setAttribute('aria-pressed', String(heart.getAttribute('aria-pressed') !== 'true'));
    });
    merch.append(heart);
  }
  item.append(merch);
  if (opts.flags) item.append(wrap('card-flag', ...flags));
  item.append(wrap('card-title', ...(title ? [title] : []), ...subtitle.map((p) => {
    p.classList.add('card-subtitle');
    return p;
  })));

  const ratingBox = wrap('card-rating');
  if (rating) {
    const [, score, count] = rating.textContent.match(RATING);
    const link = el('a', 'rating', {
      href: `${href}#reviews`, tabindex: '-1', 'aria-label': `${score} out of 5 stars,${count} reviews.`,
    });
    link.append(buildStars(parseFloat(score)), wrap('number-box', rating));
    ratingBox.append(link);
  }
  item.append(ratingBox);

  const imageBox = wrap('card-image');
  if (media) {
    const link = el('a', 'normal-image', {
      href, tabindex: '-1', 'aria-label': `Go to the product details page of ${titleText}`,
    });
    link.append(media);
    imageBox.append(link);
  }
  item.append(imageBox);

  const stack = wrap('price-stack');
  if (before.length) stack.append(wrap('starting-at', ...before));
  if (price) {
    const box = wrap('price-title', price);
    if (saving) box.append(saving);
    stack.append(box);
  }
  if (business) stack.append(wrap('business-price', business));
  if (lease) stack.append(wrap('katapult', el('span', 'katapult-logo', { 'aria-hidden': 'true' }), lease));
  if (loyalty.length || popovers.length) {
    const loy = wrap('loyalty', ...loyalty);
    if (popovers.length) {
      const pop = el('div', 'le-popover', { role: 'tooltip' });
      pop.hidden = true;
      pop.append(wrap('bubble', ...popovers));
      const amount = loyalty.map((p) => p.querySelector('em')).find(Boolean);
      (amount ? amount.closest('p') : loy).after(pop);
      if (amount) {
        amount.setAttribute('role', 'button');
        amount.setAttribute('tabindex', '0');
        amount.setAttribute('aria-haspopup', 'dialog');
        amount.addEventListener('click', () => { pop.hidden = !pop.hidden; });
      }
    }
    stack.append(loy);
  }
  item.append(stack);

  const details = wrap('card-details', ...(features ? [features] : []));
  if (opts.collapsed) details.hidden = true;
  if (!opts.collapsed) item.append(details);
  item.append(wrap('card-cta', ...(cta ? [cta] : [])));
  if (extras.length) item.append(wrap('card-extras', ...extras));
  if (opts.collapsed) {
    const more = label('button', 'card-see-more', 'See More', { type: 'button', 'aria-expanded': 'false' });
    more.addEventListener('click', () => {
      const open = more.getAttribute('aria-expanded') === 'true';
      more.setAttribute('aria-expanded', String(!open));
      more.textContent = open ? 'See More' : 'See Less';
      details.hidden = open;
    });
    item.append(more, details);
  }
  return item;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .dlp-scroll')) return;
  if (!block.id) block.id = 'dlp';
  const rows = [...block.children];
  const titleRow = rows.find((r) => r.querySelector('h1, h2') && !r.querySelector('h3, img'));
  const cardRows = rows.filter((r) => r.querySelector('h3'));
  const queryRow = rows.find((r) => r !== titleRow && !cardRows.includes(r)
    && [...r.querySelectorAll('p')].some((p) => TOTAL.test(p.textContent)));
  const isPriceRow = (r) => [...r.querySelectorAll('p')]
    .filter((p) => MONEY.test(p.textContent)).length === 2;
  const facetRows = rows.filter((r) => r !== titleRow && r !== queryRow && !cardRows.includes(r)
    && (r.querySelector('ul, ol') || isPriceRow(r)) && !r.querySelector('img'));
  const leftovers = rows.filter((r) => r !== titleRow && r !== queryRow && !cardRows.includes(r)
    && !facetRows.includes(r));
  const totalP = queryRow && [...queryRow.querySelectorAll('p')].find((p) => TOTAL.test(p.textContent));
  const sortP = queryRow && [...queryRow.querySelectorAll('p')].find((p) => SORT_BY.test(p.textContent));
  const sortCurrent = sortP ? sortP.textContent.match(SORT_BY)[1] : SORT_CURRENT;
  const opts = {
    wishlist: block.classList.contains('has-wishlist'),
    collapsed: block.classList.contains('features-collapsed'),
    flags: cardRows.some((r) => {
      const h = r.querySelector('h3');
      return [...r.querySelectorAll('p')].some((p) => !p.querySelector('img') && precedes(p, h));
    }),
  };

  const parts = [];
  if (titleRow) {
    const h = titleRow.querySelector('h1, h2');
    h.id = h.id || 'dlp-title';
    block.setAttribute('aria-labelledby', h.id);
    parts.push(wrap('sub-header', h));
  }

  const facets = el('section', 'pc-left-facets');
  const skip = label('button', 'skip-link', 'skip to product list', { type: 'button' });
  skip.addEventListener('click', () => {
    document.getElementById('dlp-products')?.scrollIntoView({ behavior: 'smooth' });
  });
  const filter = el('div', 'facet-filter', { role: 'region', 'aria-label': 'Filters' });
  const top = wrap('filter-action-top', label('p', 'filter-action-title', 'Filters'));
  const collapse = label('div', 'filter-action collapse-filters', 'Collapse All', {
    role: 'button', tabindex: '0', 'aria-label': 'Collapse Filters list',
  });
  top.append(collapse);
  filter.append(top, ...facetRows.map(buildFacet));
  collapse.addEventListener('click', () => {
    const expand = collapse.textContent === 'Expand All';
    filter.querySelectorAll('.facets-name').forEach((h) => {
      h.setAttribute('aria-expanded', String(expand));
      h.nextElementSibling.nextElementSibling.hidden = !expand;
    });
    collapse.textContent = expand ? 'Collapse All' : 'Expand All';
  });
  facets.append(skip, filter);

  const count = cardRows.length;
  const total = totalP ? parseInt(totalP.textContent.match(TOTAL)[1].replace(/,/g, ''), 10) : count;
  const list = el('div', 'pc-product-list', { id: 'dlp-products' });
  let results = el('p', 'results');
  if (totalP) {
    totalP.classList.add('results');
    results = totalP;
  } else {
    results.append(label('b', 'total', String(count)), ' ', label('i', '', 'Matching results'));
  }
  const sortBox = el('div', 'price-sort-select');
  const select = el('div', 'default-select', {
    role: 'combobox',
    tabindex: '0',
    'aria-label': `Sort by ${sortCurrent} Dropdown Collapsed`,
    'aria-expanded': 'false',
    'aria-controls': 'dlp-sort',
  });
  const sortby = el('span', 'default-select-sortby');
  if (sortP) sortby.append(sortP);
  else sortby.append(label('i', '', 'Sort by :'), label('span', '', SORT_CURRENT));
  select.append(sortby, el('span', 'arrow', { 'aria-hidden': 'true' }));
  const options = el('ul', 'select-list', { id: 'dlp-sort', role: 'listbox' });
  options.hidden = true;
  SORT_OPTIONS.forEach((o, i) => {
    options.append(label('li', i === 0 ? 'active' : '', o, { role: 'option' }));
  });
  select.addEventListener('click', () => {
    const open = select.getAttribute('aria-expanded') === 'true';
    select.setAttribute('aria-expanded', String(!open));
    select.setAttribute('aria-label', `Sort by ${sortCurrent} Dropdown ${open ? 'Collapsed' : 'Expanded'}`);
    options.hidden = open;
  });
  sortBox.append(select, options);
  const sortWrap = wrap('price-sort', sortBox);
  if (block.classList.contains('has-view-toggle')) {
    const views = el('div', 'view-toggle', { role: 'group', 'aria-label': 'Product view' });
    const grid = el('button', 'view-grid', { type: 'button', 'aria-label': 'Grid view', 'aria-pressed': 'true' });
    const rowsBtn = el('button', 'view-list', { type: 'button', 'aria-label': 'List view', 'aria-pressed': 'false' });
    [grid, rowsBtn].forEach((b) => b.addEventListener('click', () => {
      grid.setAttribute('aria-pressed', String(b === grid));
      rowsBtn.setAttribute('aria-pressed', String(b !== grid));
    }));
    views.append(grid, rowsBtn);
    sortWrap.append(views);
  }
  const query = wrap('query-view', wrap('matching-header', results), sortWrap);

  const container = el('section', 'product-card-container', { role: 'region', 'aria-label': 'Product Results List' });
  const grid = el('ul', 'product-group-list');
  cardRows.forEach((r, i) => grid.append(buildCard(r, i, opts)));
  container.append(grid);

  const show = el('p', 'show');
  show.append(label('span', '', 'Showing'), ' ', label('span', '', `1 - ${count} of ${total} Results`));
  const footer = wrap('pc-footer-page', show);
  if (total > count) {
    footer.append(label('button', 'load-more', 'Load more results', { type: 'button' }));
  }
  list.append(query, container, footer);

  const content = wrap('pc-content', facets, list);
  parts.push(wrap('dlp-scroll', content));
  // leftovers pass: any unclassified authored row is kept (after the listing), never dropped
  leftovers.forEach((r) => parts.push(wrap('dlp-extra', ...r.children)));
  block.replaceChildren(...parts);
}
