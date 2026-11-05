/**
 * stories — "Lenovo Innovation in Action" section header + customer-story tabs
 * (live section-header + tabs; an accordion on phones).
 * Schema: stardust/eds-schema/index.json, section `stories`.
 * Decode tier: template-slotted head, reconstructive tabs (one row per story).
 *
 * Authoring:
 *   row 1 (single cell): section heading + an *italic* "read more" link paragraph
 *   one row per story, cells classified by content —
 *     tab label paragraph (the cell with no heading, list or link)
 *     story head: title heading, description, **bold** CTA link
 *     quote: eyebrow heading (h3), quote paragraph, name heading (h4), role paragraph
 *     list: eyebrow paragraph + list; each item starts with `:lenovo-icon-<name>:`
 *     stats: per stat a value heading (h5) followed by its label paragraph
 *
 * @ew-exempt <li> `:lenovo-icon-<name>:` icon token prefix — rendered as the icon glyph
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

function cellNodes(cell) {
  if (!cell) return [];
  const kids = [...cell.children];
  if (!kids.length && cell.textContent.trim()) {
    // HARNESS-ONLY fallback (EW5): bare text in a cell; DA always wraps text in <p>.
    const p = document.createElement('p');
    p.append(...cell.childNodes);
    return [p];
  }
  return kids;
}

const isHeading = (n) => /^H[1-6]$/.test(n.tagName);
const ICON_PREFIX = /^\s*:([a-z0-9-]+):\s*/;

function maskIcon(span, name) {
  span.className = 'len-icon-image list-icon';
  span.setAttribute('aria-hidden', 'true');
  span.style.setProperty('--icon', `url("${window.hlx?.codeBasePath || ''}/icons/${name}.svg")`);
  span.replaceChildren();
}

// list item icons: EDS icon spans, or (harness, no pipeline) the raw `:name:` token
function decorateListIcons(list) {
  list.querySelectorAll('li').forEach((li) => {
    const span = li.querySelector('span.icon');
    if (span) {
      const cls = [...span.classList].find((c) => c.startsWith('icon-'));
      if (cls) maskIcon(span, cls.slice(5));
      return;
    }
    const first = li.firstChild;
    const m = first && first.nodeType === 3 ? first.textContent.match(ICON_PREFIX) : null;
    if (!m) return;
    // HARNESS-ONLY (EW5): the delivery pipeline turns the token into span.icon itself
    const rest = first.splitText(m[0].length);
    const s = document.createElement('span');
    maskIcon(s, m[1]);
    first.replaceWith(s);
    rest.before(' ');
  });
}

function classify(cell) {
  if (cell.querySelector('ul, ol')) return 'list';
  if (cell.querySelector('h5, h6')) return 'stats';
  const hs = cell.querySelectorAll('h1, h2, h3, h4');
  if (hs.length >= 2) return 'quote';
  if (hs.length === 1) return 'head';
  if (cell.querySelector('a')) return 'head';
  return cell.textContent.trim() ? 'label' : 'empty';
}

function buildStory(cells) {
  const story = div('story');
  story.innerHTML = `<div class="story-head"><div class="story-head-copy"></div>
    <div class="story-head-cta"></div></div><div class="story-cards"></div>`;
  const copy = story.querySelector('.story-head-copy');
  const cta = story.querySelector('.story-head-cta');
  const cardsEl = story.querySelector('.story-cards');
  let label = null;
  const parts = {};
  cells.forEach((c) => {
    const kind = classify(c);
    if (kind === 'label' && !label) [label] = cellNodes(c);
    else if (kind !== 'empty' && kind !== 'label') parts[kind] = cellNodes(c);
  });
  (parts.head || []).forEach((n) => {
    if (n.querySelector('a')) cta.append(n);
    else copy.append(wrapNode(n, isHeading(n) ? 'story-title' : 'story-desc'));
  });
  if (parts.quote) {
    const q = div('quote-card');
    const top = div('quote-top');
    const author = div('quote-author');
    let headings = 0;
    parts.quote.forEach((n) => {
      if (isHeading(n)) {
        headings += 1;
        if (headings === 1) top.append(wrapNode(n, 'eyebrow'));
        else author.append(wrapNode(n, 'quote-name'));
      } else if (headings >= 2) {
        author.append(wrapNode(n, 'quote-role'));
      } else {
        top.append(wrapNode(n, 'quote-text'));
      }
    });
    q.append(top, author);
    cardsEl.append(q);
  }
  if (parts.list) {
    const l = div('list-card');
    parts.list.forEach((n) => {
      if (n.tagName === 'UL' || n.tagName === 'OL') {
        decorateListIcons(n);
        l.append(wrapNode(n, 'list-items'));
      } else {
        l.append(wrapNode(n, 'eyebrow'));
      }
    });
    cardsEl.append(l);
  }
  if (parts.stats) {
    const s = div('stat-cards');
    let card = null;
    parts.stats.forEach((n) => {
      if (isHeading(n) || !card) {
        card = div('stat-card');
        s.append(card);
      }
      card.append(wrapNode(n, isHeading(n) ? 'stat-value' : 'stat-label'));
    });
    cardsEl.append(s);
  }
  if (!cta.children.length) cta.remove();
  return { label, story };
}

export default function decorate(block) {
  const rows = [...block.children];
  const head = div('stories-head');
  const headTitle = div('head-title');
  const headLink = div('head-link');
  const tabs = div('tabs');
  const list = document.createElement('ol');
  list.className = 'tab-list';
  list.setAttribute('role', 'tablist');
  tabs.append(list);
  const uid = `stories-${Math.random().toString(36).slice(2, 7)}`;
  const items = [];

  rows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2 && !items.length) {
      cellNodes(cells[0]).forEach((n) => {
        if (n.querySelector('a')) headLink.append(n);
        else headTitle.append(n);
      });
      return;
    }
    const { label, story } = buildStory(cells);
    const i = items.length;
    const tab = document.createElement('li');
    tab.className = 'tab';
    tab.id = `${uid}-tab-${i}`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', `${uid}-panel-${i}`);
    const title = div('tab-title');
    if (label) title.append(label);
    const icon = document.createElement('span');
    icon.className = 'len-icon-image ic-arrow-down tab-icon';
    icon.setAttribute('aria-hidden', 'true');
    tab.append(title, icon);
    const panel = div('tab-panel');
    panel.id = `${uid}-panel-${i}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.append(story);
    list.append(tab);
    tabs.append(panel);
    items.push({ tab, panel });
  });

  const select = (k) => {
    items.forEach(({ tab, panel }, j) => {
      const on = j === k;
      tab.classList.toggle('is-active', on);
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.tabIndex = on ? 0 : -1;
      panel.hidden = !on;
      panel.classList.toggle('is-active', on);
    });
  };
  items.forEach(({ tab }, k) => {
    tab.addEventListener('click', () => select(k));
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        select(k);
      }
    });
  });
  select(0);

  const out = [];
  if (headTitle.children.length || headLink.children.length) {
    head.append(headTitle, headLink);
    out.push(head);
  }
  if (items.length) out.push(tabs);
  block.replaceChildren(...out);
}
