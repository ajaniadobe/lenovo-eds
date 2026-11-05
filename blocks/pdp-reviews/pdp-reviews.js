/**
 * pdp-reviews — ratings & reviews panel (static snapshot of the captured Bazaarvoice widget).
 * Authoring: one row per part, two cells — key | content. Keys (left cell, plain word):
 *   tabs       <ul> of panel tabs (active one in <strong>)
 *   heading    <h2>
 *   trustmark  <img>
 *   snapshot   <h3>, <p>, <ul> of "5 stars <strong>334</strong>" lines (bars drawn from counts)
 *   overall    <h3>, <p><strong>4.6</strong> <a>422 Reviews</a></p> (stars drawn from 4.6)
 *   summary    <h3>, note <p>, summary <p>, link <p>
 *   averages   <h3>, <ul> of "Performance <strong>4.7</strong>" lines
 *   media      <h3>, <ul> of media tabs (active in <strong>), one <img> per customer image
 *   filter     <h3>, search hint <p>, <ul> of topic chips, <p>, <ul> of filter menus
 *   sort       count <p>, sort <p><strong>Sort by</strong> order</p>
 *   review     one row per review: <h3> title, author <p>, badge <p>s, date <p>, body <p>
 *              (the longest), detail <p>s, <ul> of sub-ratings ("Value <strong>5.0</strong>")
 *              [<h4> reply heading, then reply <p>s — the brand's response box]
 *   more       load-more <p>
 *
 * @ew-exempt metadata — the key cell (cell 1) of every row is a part name, never displayed
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
        const half = el('span', 'star-icon yellow-icon');
        half.style.width = `${Math.round(fill * 100)}%`;
        box.append(half);
      }
    }
    stars.append(box);
  }
  return stars;
}
const num = (n) => parseFloat((n?.textContent || '').replace(/[^\d.]/g, ''));
const kids = (cell) => (cell ? [...cell.children] : []);
const isHeading = (n) => /^H[1-6]$/.test(n.tagName);
const isList = (n) => n.tagName === 'UL' || n.tagName === 'OL';
const markActive = (ul) => ul.querySelectorAll(':scope > li').forEach((li) => {
  if (li.querySelector('strong')) li.classList.add('is-active');
});
function segbar() {
  const s = el('span', 'segbar', { 'aria-hidden': 'true' });
  for (let i = 0; i < 5; i += 1) s.append(el('i'));
  return s;
}
function ratingList(ul) {
  ul.querySelectorAll(':scope > li').forEach((li) => {
    const v = li.querySelector('strong');
    if (v) v.before(segbar());
  });
  return ul;
}
function part(nodes, className, map = {}) {
  const box = el('div', className);
  nodes.forEach((n) => {
    if (isHeading(n)) box.append(wrapNode(n, map.heading || 'rv-sub-h'));
    else box.append(n);
  });
  return box;
}

function buildReview(cell) {
  const all = kids(cell);
  // an <h4> opens the brand's reply ("Response from Lenovo:"); it and what follows render as
  // a reply box under the review
  const at = all.findIndex((n) => n.tagName === 'H4');
  const nodes = at < 0 ? all : all.slice(0, at);
  const reply = at < 0 ? [] : all.slice(at);
  const item = el('li', 'rv-item');
  const main = el('div', 'rv-item-main');
  const subs = nodes.filter(isList);
  const values = subs.flatMap((u) => [...u.querySelectorAll('strong')].map(num))
    .filter((v) => !Number.isNaN(v));
  const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 5;
  main.append(buildStars(avg));
  const paras = nodes.filter((n) => !isList(n) && !isHeading(n));
  const body = paras.reduce((a, b) => (
    b.textContent.length > (a?.textContent.length || 0) ? b : a), null);
  const bodyAt = paras.indexOf(body);
  nodes.forEach((n) => {
    if (isHeading(n)) main.append(wrapNode(n, 'rv-title'));
    else if (!isList(n)) {
      const i = paras.indexOf(n);
      let cls = 'rv-detail';
      if (i === 0) cls = 'rv-who';
      else if (i === bodyAt) cls = 'rv-body';
      else if (i < bodyAt - 1) cls = 'rv-badge';
      else if (i === bodyAt - 1) cls = 'rv-date';
      main.append(wrapNode(n, cls));
    }
  });
  item.append(main);
  subs.forEach((u) => item.append(wrapNode(ratingList(u), 'rv-item-sub')));
  if (reply.length) {
    const box = el('div', 'rv-reply');
    box.append(...reply);
    item.append(box);
  }
  return item;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .rv-panel')) return;
  const fields = {};
  const reviews = [];
  const leftovers = [];
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) {
      leftovers.push(...kids(cells[0]));
      return;
    }
    const key = cells[0].textContent.trim().toLowerCase();
    if (key === 'review') reviews.push(cells[1]);
    else [, fields[key]] = cells;
  });
  const out = [];
  const tabs = kids(fields.tabs).find(isList);
  if (tabs) {
    markActive(tabs);
    tabs.querySelectorAll(':scope > li').forEach((li) => li.addEventListener('click', () => {
      tabs.querySelectorAll(':scope > li').forEach((x) => x.classList.toggle('is-active', x === li));
    }));
    out.push(wrapNode(tabs, 'rv-tabs'));
  }
  const panel = el('div', 'rv-panel');
  out.push(panel);
  if (fields.heading) panel.append(part(kids(fields.heading), 'rv-head', { heading: 'rv-h' }));

  const sum = el('div', 'rv-sum');
  if (fields.trustmark) sum.append(part(kids(fields.trustmark), 'rv-trust'));
  if (fields.snapshot || fields.overall) {
    const box = el('div', 'rv-box');
    if (fields.snapshot) {
      const snapNodes = kids(fields.snapshot);
      snapNodes.filter(isList).forEach((ul) => {
        const counts = [...ul.querySelectorAll(':scope > li strong')].map(num);
        const total = counts.reduce((a, b) => a + (Number.isNaN(b) ? 0 : b), 0) || 1;
        ul.querySelectorAll(':scope > li').forEach((li) => {
          const n = li.querySelector('strong');
          const bar = el('span', 'bar', { 'aria-hidden': 'true' });
          const fill = el('span');
          fill.style.width = `${Math.round((num(n) / total) * 100) || 0}%`;
          bar.append(fill);
          if (n) n.before(bar);
        });
      });
      box.append(part(snapNodes, 'rv-snap'));
    }
    if (fields.overall) {
      const ov = part(kids(fields.overall), 'rv-overall');
      const big = ov.querySelector('p strong');
      const value = num(big);
      if (!Number.isNaN(value)) {
        const link = ov.querySelector('p a');
        const stack = el('span', 'ov-r');
        if (link) {
          link.before(stack);
          stack.append(buildStars(value), link);
        }
      }
      box.append(ov);
    }
    sum.append(box);
  }
  if (fields.summary) sum.append(part(kids(fields.summary), 'rv-ai'));
  if (fields.averages) {
    const avg = part(kids(fields.averages), 'rv-avg');
    avg.querySelectorAll('ul, ol').forEach(ratingList);
    sum.append(avg);
  }
  if (sum.children.length) panel.append(sum);

  if (fields.media) {
    const media = el('div', 'rv-media');
    const strip = el('div', 'rv-strip');
    let tabsDone = false;
    kids(fields.media).forEach((n) => {
      if (isHeading(n)) media.append(wrapNode(n, 'rv-bandh'));
      else if (isList(n) && !tabsDone) {
        markActive(n);
        media.append(wrapNode(n, 'rv-mtabs'));
        tabsDone = true;
      } else strip.append(n);
    });
    media.append(strip);
    panel.append(media);
  }
  if (fields.filter) {
    const filter = el('div', 'rv-filter');
    let lists = 0;
    let seenList = false;
    kids(fields.filter).forEach((n) => {
      if (isHeading(n)) filter.append(wrapNode(n, 'rv-sub-h'));
      else if (isList(n)) {
        filter.append(wrapNode(n, lists === 0 ? 'rv-chips' : 'rv-drops'));
        lists += 1;
        seenList = true;
      } else filter.append(wrapNode(n, seenList ? 'rv-more' : 'rv-search'));
    });
    panel.append(filter);
  }
  if (fields.sort) {
    const sort = el('div', 'rv-sortbar');
    kids(fields.sort).forEach((n) => sort.append(wrapNode(n, n.querySelector('strong') ? 'rv-sort' : 'rv-count')));
    panel.append(sort);
  }
  if (reviews.length) {
    const list = el('ol', 'rv-list');
    reviews.forEach((cell) => list.append(buildReview(cell)));
    panel.append(list);
  }
  if (fields.more) panel.append(part(kids(fields.more), 'rv-load'));
  Object.entries(fields).forEach(([k, cell]) => {
    if (!['tabs', 'heading', 'trustmark', 'snapshot', 'overall', 'summary', 'averages', 'media',
      'filter', 'sort', 'more'].includes(k)) leftovers.push(...kids(cell));
  });
  if (leftovers.length) panel.append(part(leftovers, 'rv-rest'));
  block.replaceChildren(...out);
  const section = block.closest('.section');
  if (section && !document.getElementById('reviews')) section.id = 'reviews';
}
