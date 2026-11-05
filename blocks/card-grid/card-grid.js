/**
 * card-grid — home page card rows and rails (live helix card-grid / display-carousel).
 * Schema: stardust/eds-schema/index.json, the `card-grid` sections.
 * Decode tier: reconstructive (repeat group of cards).
 *
 * Variants (block class): categories | images | icons | rail (default images)
 *   categories — image + linked label tiles
 *   images     — image cards with a white content box (3-up row; stacked on phones)
 *   icons      — icon cards: icon, title, text, underlined link
 *   rail       — image cards in a stepping carousel (3.3 visible)
 *
 * Authoring: an optional first row is the section head (heading + optional description);
 * then one row per card. Card cells: image (or `:lenovo-icon-<name>:` for icon cards) |
 * heading (link the heading text to make the whole card a link) + text paragraph(s) |
 * for icon cards a plain link paragraph. Category tiles: image | linked label paragraph.
 * Rows holding an image or an icon are cards; text-only rows before the first card are the head.
 *
 * @ew-exempt <p> `:lenovo-icon-<name>:` icon token (icon cards) — rendered as the icon glyph
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

function div(className) {
  const d = document.createElement('div');
  d.className = className;
  return d;
}

function collectNodes(row) {
  const out = [];
  [...row.children].forEach((cell) => {
    let kids = [...cell.children];
    if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].querySelector('picture, img')
      && kids[0].children.length > 1) {
      kids = [...kids[0].children];
    }
    if (kids.length) out.push(...kids);
    else if (cell.textContent.trim()) {
      // HARNESS-ONLY fallback (EW5): bare text in a cell; DA always wraps text in <p>.
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      out.push(p);
    }
  });
  return out;
}

const ICON_TOKEN = /^\s*:([a-z0-9-]+):\s*$/;

// Mask-painted icon (styles.css .len-icon-image) from an EDS icon span or, in the
// harness (no pipeline), from the raw `:name:` token paragraph.
function iconFrom(node) {
  const span = node.matches('span.icon') ? node : node.querySelector('span.icon');
  let name = null;
  if (span) {
    const cls = [...span.classList].find((c) => c.startsWith('icon-'));
    name = cls ? cls.slice(5) : null;
  } else {
    const m = node.textContent.match(ICON_TOKEN);
    name = m ? m[1] : null;
  }
  if (!name) return null;
  const icon = document.createElement('span');
  icon.className = 'len-icon-image card-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.style.setProperty('--icon', `url("${window.hlx?.codeBasePath || ''}/icons/${name}.svg")`);
  return icon;
}

const isIconNode = (n) => !!(n.matches('span.icon') || n.querySelector('span.icon')
  || (n.tagName === 'P' && ICON_TOKEN.test(n.textContent) && !n.querySelector('a')));
const isMedia = (n) => n.matches('picture, img') || (!!n.querySelector('picture, img') && !n.querySelector('a'));
const isCardRow = (row) => !!row.querySelector('picture, img, span.icon')
  || [...row.querySelectorAll('p')].some((p) => ICON_TOKEN.test(p.textContent));

function arrow() {
  const s = document.createElement('span');
  s.className = 'len-icon-image ic-arrow-right';
  s.setAttribute('aria-hidden', 'true');
  return s;
}

// image card: the whole card is the link (EW6: href read, inner anchor unwrapped)
function imageCard(nodes) {
  const card = div('img-card');
  const a = document.createElement('a');
  const content = div('card-content');
  const titleRow = div('title-row');
  const text = div('card-text');
  nodes.forEach((n) => {
    if (isMedia(n)) {
      a.prepend(wrapNode(n, 'card-bg'));
    } else if (/^H[1-6]$/.test(n.tagName) && !titleRow.children.length) {
      const link = n.querySelector('a');
      if (link) {
        if (!a.hasAttribute('href')) a.href = link.href;
        link.replaceWith(...link.childNodes);
      }
      titleRow.append(wrapNode(n, 'card-title'), arrow());
    } else {
      const link = n.querySelector('a');
      if (link && !a.hasAttribute('href')) a.href = link.href;
      if (link) link.replaceWith(...link.childNodes);
      text.append(n);
    }
  });
  content.append(titleRow);
  if (text.children.length) content.append(text);
  a.append(content);
  card.append(a);
  return card;
}

function categoryCard(nodes) {
  const card = div('cat-card');
  const box = div('cat-box');
  const a = document.createElement('a');
  const asset = div('cat-asset');
  const label = div('cat-title');
  nodes.forEach((n) => {
    if (isMedia(n)) {
      asset.append(n);
      return;
    }
    const link = n.querySelector('a');
    if (link) {
      if (!a.hasAttribute('href')) a.href = link.href;
      link.replaceWith(...link.childNodes);
    }
    label.append(n);
  });
  a.append(asset, label);
  box.append(a);
  card.append(box);
  return card;
}

function iconCard(nodes) {
  const card = div('icon-card');
  const inner = div('icon-card-inner');
  const body = div('icon-card-text');
  let icon = null;
  let title = null;
  const links = [];
  nodes.forEach((n) => {
    if (!icon && isIconNode(n)) {
      icon = iconFrom(n);
      if (icon) return;
    }
    if (!title && /^H[1-6]$/.test(n.tagName)) {
      title = wrapNode(n, 'icon-card-title');
    } else if (n.querySelector('a')) {
      links.push(n);
    } else {
      body.append(n);
    }
  });
  if (icon) inner.append(icon);
  if (title) inner.append(title);
  if (body.children.length) inner.append(body);
  if (links.length) {
    const l = div('icon-card-link');
    l.append(...links);
    inner.append(l);
  }
  card.append(inner);
  return card;
}

const CONTROLS = `
  <div class="arrows">
    <button class="icon-btn" type="button" aria-label="Previous slide" data-dir="-1">
      <span class="len-icon-image ic-arrow-left" aria-hidden="true"></span></button>
    <button class="icon-btn" type="button" aria-label="Next slide" data-dir="1">
      <span class="len-icon-image ic-arrow-right" aria-hidden="true"></span></button>
  </div>
  <div class="bar"><div class="bar-fill"></div></div>`;

// step one card per arrow click (rails at every width, rows on phones)
function wireRail(rail, cards) {
  const controls = div('rail-controls');
  controls.innerHTML = CONTROLS;
  rail.append(controls);
  const fill = controls.querySelector('.bar-fill');
  let index = 0;
  const step = () => (cards.children[0] ? cards.children[0].getBoundingClientRect().width : 0);
  const maxIndex = () => {
    const w = step();
    if (!w) return 0;
    const vis = Math.max(1, Math.floor((rail.clientWidth + 1) / w));
    return Math.max(0, cards.children.length - vis);
  };
  const go = (n) => {
    const max = maxIndex();
    index = Math.max(0, Math.min(n, max));
    cards.style.transform = index ? `translateX(${-step() * index}px)` : '';
    fill.style.width = max ? `${(100 * index) / max}%` : '0';
  };
  controls.querySelectorAll('[data-dir]').forEach((btn) => {
    btn.addEventListener('click', () => go(index + Number(btn.dataset.dir)));
  });
  if ('ResizeObserver' in window) new ResizeObserver(() => go(index)).observe(rail);
}

export default function decorate(block) {
  const variant = ['categories', 'icons', 'rail', 'images'].find((v) => block.classList.contains(v)) || 'images';
  const head = div('section-title');
  const cards = div('cards');
  cards.classList.add(`cards-${variant}`);
  let leftovers = [];
  [...block.children].forEach((row) => {
    const nodes = collectNodes(row);
    if (!nodes.length) return;
    if (!isCardRow(row)) {
      if (!cards.children.length) {
        nodes.forEach((n) => {
          if (/^H[1-6]$/.test(n.tagName)) head.append(wrapNode(n, 'title-text'));
          else head.append(wrapNode(n, 'title-desc'));
        });
      } else {
        leftovers = leftovers.concat(nodes);
      }
      return;
    }
    let card;
    if (variant === 'categories') card = categoryCard(nodes);
    else if (variant === 'icons') card = iconCard(nodes);
    else card = imageCard(nodes);
    cards.append(card);
  });
  // leftovers pass: authored text after the last card stays visible under the grid
  const rail = div('card-rail');
  if (variant !== 'rail') rail.classList.add('card-rail-rows');
  rail.append(cards);
  const out = [];
  if (head.children.length) out.push(head);
  out.push(rail);
  if (leftovers.length) {
    const extra = div('card-grid-extra');
    extra.append(...leftovers);
    out.push(extra);
  }
  block.replaceChildren(...out);
  // the 3-up image row stacks on phones and has no controls (as live)
  if (variant !== 'images') wireRail(rail, cards);
}
