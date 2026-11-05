/**
 * header — Lenovo commonHeader (utility bar / logo-search-account row / nav row /
 * tier-2 row / promo strip), template-slotted from stardust/prototypes (nav.commonHeader)
 * with the authored /nav document slotted by role.
 *
 * /nav document (sections are classified by content, not position):
 *   utility  — sections BEFORE the logo section: one list; an item with a link + sub-list is
 *              the store entry (sub-list = popover), a text item is an icon button (Accessibility,
 *              Contact Us) whose sub-list is its popover.
 *   masthead — the section holding the logo link (:lenovo-logo: icon): the search link (its href
 *              is the search target, its text the input label), the category list (text items),
 *              and the account / rewards / cart list (sub-lists = hover popovers).
 *   nav      — the next section: first list = top nav (a sub-list = that item's tier-2 row),
 *              second list = segment links.
 *   promo    — the remaining section: one paragraph per merchandizing-banner slide.
 *
 * Variant: body.tpl-site (template metadata) or a `nav-section` metadata value renders
 * .common-header-site — the active top item is bold and its tier-2 row sits in flow.
 * Hovering (or focusing) a top item shows its tier-2 row (home: overlaid under the nav row).
 *
 * @ew-exempt search link — config (target + input label), not displayed
 * @ew-exempt category <li> text — the selected category is mirrored into the select box
 */
import { getMetadata, toClassName } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const PHONE = window.matchMedia('(max-width: 749px)');

function el(tag, className = '', attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  return node;
}

const text = (node) => (node ? node.textContent.replace(/\s+/g, ' ').trim() : '');

/** the item's own link (delivered shape may wrap it in a <p> — #98) */
const ownLink = (li) => li.querySelector(':scope > a, :scope > p > a');
const subList = (li) => li.querySelector(':scope > ul');

/** move every child of `li` except its sub-list into `target` */
function moveLabel(li, target) {
  const sub = subList(li);
  [...li.childNodes].filter((n) => n !== sub).forEach((n) => target.append(n));
  return target;
}

/** wrap the link's children in generated wrappers (moving them, never copying) */
function wrapLinkContent(a, classes, innerTag = '') {
  const outer = el('div', classes[0]);
  let inner = outer;
  classes.slice(1).forEach((c) => {
    const n = el('div', c);
    inner.append(n);
    inner = n;
  });
  if (innerTag) {
    const n = el(innerTag);
    inner.append(n);
    inner = n;
  }
  inner.append(...a.childNodes);
  a.append(outer);
  return a;
}

function popover(sub, extra = '') {
  const pop = el('div', `popover ${extra}`.trim());
  const content = el('div', 'popover-content');
  sub.classList.add('popover-list');
  content.append(sub);
  pop.append(content);
  return pop;
}

function iconPicker(name, size) {
  const wrap = el('div', 'utility-content');
  const pick = el('span', `icon-picker-container font-${size}`);
  pick.append(el('span', `iconfont-${name}`, { 'aria-hidden': 'true' }));
  wrap.append(pick);
  return wrap;
}

function expandButton(label, className = 'accessibility-icon', glyph = true) {
  const btn = el('button', className, { type: 'button', 'aria-label': label, 'aria-expanded': 'false' });
  if (glyph) btn.append(el('span', 'iconfont-arrow-down', { 'aria-hidden': 'true' }));
  return btn;
}

/** utility bar items (store / accessibility / contact) */
function buildUtilityItem(li) {
  const link = ownLink(li);
  const sub = subList(li);
  const item = el('li', 'utility-nav-item relative');
  if (link && sub) {
    item.classList.add('utility-nav-item-store');
    const icon = el('div', 'utility-nav-item-icon utility-nav-item-store-icon relative');
    const label = `Use Enter key to expand ${text(link)}`;
    wrapLinkContent(link, ['store-label']);
    icon.append(link, expandButton(label, 'store-arrow iconfont-arrow-down', false));
    item.append(icon, popover(sub));
    return item;
  }
  const label = text(li);
  const name = /access/i.test(label) ? 'accessibility' : 'contact-us-pc';
  const icon = el('div', 'utility-nav-item-icon relative', { role: 'button', tabindex: '0', 'aria-label': label });
  icon.append(iconPicker(name, 16));
  item.append(icon);
  if (sub) {
    icon.append(moveLabel(li, el('span', 'label-hidden')));
    item.append(expandButton('Use Enter key to expand'), popover(sub));
  } else {
    item.append(moveLabel(li, el('div', 'popover popover-title')));
  }
  return item;
}

/** account / rewards / cart */
function buildToolItem(li) {
  const link = ownLink(li);
  const sub = subList(li);
  const item = el('li', 'utility-nav-item relative');
  const label = text(link || li);
  let name = 'account-white';
  if (link && /cart/i.test(link.href)) name = 'cart';
  else if (link && /reward/i.test(link.href + label)) name = 'rewards';
  if (link) {
    link.className = 'utility-nav-item-icon relative';
    link.setAttribute('aria-label', label);
    const sr = el('span', 'label-hidden');
    sr.append(...link.childNodes);
    link.append(iconPicker(name, 24), sr);
    item.append(link);
  } else {
    const icon = el('div', 'utility-nav-item-icon relative');
    const content = iconPicker(name, 24);
    content.append(moveLabel(li, el('span', 'account-label')));
    icon.append(content);
    item.append(icon);
  }
  if (sub) {
    item.append(expandButton('Use Enter key to expand'), popover(sub, 'popover-rich'));
  }
  return item;
}

const ARROW_SVG = '<svg width="16" height="9.631" viewBox="0 0 16 9.631" aria-hidden="true">'
  + '<g transform="translate(16 0) rotate(90)"><g transform="translate(0.437 0)">'
  + '<path d="M8.539,7.381,1.364.227a.765.765,0,0,0-1.087,0,.753.753,0,0,0,0,1.077L6.969,7.975'
  + '.227,14.7a.753.753,0,0,0,0,1.077.753.753,0,0,0,1.077,0L8.458,8.639a.769.769,0,0,0,.2-.363'
  + '.75.75,0,0,0-.121-.9Z" fill="#171717"></path></g></g></svg>';

/** live types rotating search suggestions into the placeholder */
function typePlaceholder(target, phrases) {
  if (!phrases.length) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let i = 0;
  let n = 0;
  let dir = 1;
  const tick = () => {
    const phrase = phrases[i];
    n += dir;
    target.textContent = phrase.slice(0, n);
    let delay = 60;
    if (n >= phrase.length) {
      dir = -1;
      delay = 2500;
    } else if (n <= 0) {
      dir = 1;
      i = (i + 1) % phrases.length;
      delay = 400;
    } else if (dir < 0) delay = 25;
    setTimeout(tick, delay);
  };
  if (reduce) {
    [target.textContent] = phrases;
    return;
  }
  // live starts typing late (its search widget loads after the page): the placeholder stays
  // empty through first paint, then types
  const start = () => setTimeout(tick, 3000);
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });
}

function buildSearch(searchLink, categories, suggestions) {
  const box = el('div', 'search-box', { 'aria-label': 'search' });
  const container = el('div', 'searchbox-container');
  const search = el('div', 'search');
  const form = el('form', 'search-view', { role: 'search' });
  const action = searchLink ? searchLink.href : 'https://www.lenovo.com/us/en/search';
  const label = text(searchLink) || 'Search Lenovo products';
  if (searchLink) (searchLink.closest('p') || searchLink).remove();

  const cat = el('div', 'category-container', {
    role: 'button', tabindex: '0', 'aria-label': 'Category', 'aria-expanded': 'false',
  });
  const selected = el('div', 'category-selected');
  const first = categories && categories.querySelector('li');
  selected.textContent = text(first) || 'All';
  const arrow = el('div', 'arrow-container');
  arrow.innerHTML = ARROW_SVG;
  cat.append(selected, arrow);
  const dialog = el('div', 'category-dialog');
  if (categories) {
    categories.setAttribute('role', 'listbox');
    categories.setAttribute('aria-label', 'Category');
    categories.querySelectorAll('li').forEach((li) => {
      li.setAttribute('role', 'option');
      li.tabIndex = -1;
    });
    dialog.append(categories);
  }
  const toggleDialog = (open) => {
    cat.setAttribute('aria-expanded', open ? 'true' : 'false');
    dialog.classList.toggle('is-open', open);
  };
  cat.addEventListener('click', () => toggleDialog(cat.getAttribute('aria-expanded') !== 'true'));
  cat.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleDialog(cat.getAttribute('aria-expanded') !== 'true');
    }
  });
  dialog.addEventListener('click', (e) => {
    const opt = e.target.closest('li');
    if (!opt) return;
    selected.textContent = text(opt);
    toggleDialog(false);
  });

  const inputWrap = el('div', 'input-wrapper');
  const input = el('input', '', {
    id: 'common-header-search', type: 'text', name: 'text', autocomplete: 'off', 'aria-label': label,
  });
  const placeholder = el('span', 'search-placeholder', { 'aria-hidden': 'true' });
  const typed = el('span', 'typed');
  const cursor = el('span', 'cursor');
  cursor.textContent = '|';
  placeholder.append(typed, cursor);
  const phrases = [];
  if (suggestions) {
    suggestions.classList.add('search-suggestions');
    suggestions.querySelectorAll('li').forEach((li) => phrases.push(text(li)));
    inputWrap.append(suggestions);
  }
  typePlaceholder(typed, phrases);
  input.addEventListener('input', () => {
    placeholder.hidden = !!input.value;
  });
  inputWrap.append(input, placeholder);
  const go = el('div', 'search-icon', { role: 'button', tabindex: '0', 'aria-label': 'search' });
  const submit = () => {
    const q = input.value.trim();
    if (!q) {
      input.focus();
      return;
    }
    const url = new URL(action);
    url.searchParams.set('fq', '');
    url.searchParams.set('text', q);
    window.location.href = url.href;
  };
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    submit();
  });
  go.addEventListener('click', submit);
  go.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submit();
  });
  document.addEventListener('click', (e) => {
    if (!cat.contains(e.target) && !dialog.contains(e.target)) toggleDialog(false);
  });
  form.append(cat, dialog, inputWrap, go);
  search.append(form);
  container.append(search);
  box.append(container);
  return box;
}

function buildNav(topList, segList, site) {
  const view = el('div', 'nav-view');
  const views = el('div', 'second-views');
  const mainNav = el('div', '', { 'aria-label': 'main navigation' });
  const items = [];
  if (topList) {
    topList.className = 'sup-nav';
    [...topList.querySelectorAll(':scope > li')].forEach((li) => {
      li.className = 'nav-item normal-nav-item';
      const a = ownLink(li);
      if (a) {
        // an emphasised label (decorateButtons turned it into a.button) marks the live item
        // whose label sits in a <p> (Lato 400, normal leading, 12.8px on phones)
        if (a.classList.contains('button') || a.querySelector('em')) {
          li.classList.add('nav-item-plain');
          a.removeAttribute('class');
          const em = a.querySelector('em');
          if (em) em.replaceWith(...em.childNodes);
        }
        const p = a.parentElement !== li ? a.parentElement : null;
        li.prepend(a);
        if (p && !p.textContent.trim()) p.remove();
        wrapLinkContent(a, ['nav-item-title', 'text'], 'span');
      }
      const sub = subList(li);
      let row = null;
      if (sub) {
        row = el('div', 'second-view', { 'aria-label': `${text(a)} navigation` });
        sub.className = 'second-list-ul';
        sub.querySelectorAll(':scope > li').forEach((s) => {
          s.className = 'second-list-item';
          const sa = ownLink(s);
          if (!sa) return;
          if (sa.parentElement !== s) s.prepend(sa);
          const span = el('span', 'text');
          span.append(...sa.childNodes);
          sa.append(span);
          s.append(expandButton(text(sa), 'iconfont-arrow-down tier-three-arrow-icon', false));
        });
        row.append(sub);
        row.hidden = true;
        views.append(row);
      }
      items.push({ li, a, row });
    });
    mainNav.append(topList);
  }
  view.append(mainNav);

  const segWrap = el('div', 'segment-nav-wrapper', { 'aria-label': 'special interests navigation' });
  if (segList) {
    segList.className = 'segment-nav-container';
    segList.querySelectorAll(':scope > li').forEach((li) => {
      li.className = 'nav-item segment-item';
      const a = ownLink(li);
      if (!a) return;
      if (a.parentElement !== li) li.prepend(a);
      a.className = 'segment-item-link';
      wrapLinkContent(a, ['nav-item-title', 'text'], 'span');
      const acc = el('div', 'accessibility-icon-segment');
      const btn = el('button', 'iconfont-arrow-down segment-arrow-icon', { type: 'button', 'aria-label': text(a) });
      acc.append(btn);
      li.append(acc);
    });
    segWrap.append(segList);
  }
  view.append(segWrap);

  // active top item (site variant): nav-section metadata, else the current path
  let active = null;
  if (site) {
    const key = toClassName(getMetadata('nav-section') || '');
    const here = window.location.pathname.replace(/\/$/, '');
    active = items.find(({ a }) => a && key && (toClassName(text(a)) === key
      || new URL(a.href).pathname.replace(/\/$/, '').endsWith(`/${key}`)));
    if (!active && !key) {
      active = items.find(({ row }) => row && [...row.querySelectorAll('a')]
        .some((x) => here && new URL(x.href).pathname.replace(/\/$/, '') === here));
    }
  }
  if (active) {
    active.li.classList.add('sup-nav-active');
    if (active.row) {
      active.row.hidden = false;
      active.row.classList.add('is-active');
      views.classList.add('has-active');
    }
  }

  // hover / focus shows the item's tier-2 row; leaving the nav region restores the active one
  let shown = active ? active.row : null;
  const show = (row) => {
    items.forEach((it) => {
      if (it.row) it.row.hidden = it.row !== row;
    });
    views.classList.toggle('is-hover', !!row && row !== (active && active.row));
    shown = row;
  };
  const reset = () => show(active ? active.row : null);
  items.forEach((it) => {
    it.li.addEventListener('mouseenter', () => show(it.row || (active && active.row)));
    it.li.addEventListener('focusin', () => show(it.row || (active && active.row)));
  });
  return {
    view,
    views,
    reset,
    current: () => shown,
  };
}

function buildPromo(section) {
  const slides = section ? [...section.querySelectorAll('p')].filter((p) => text(p)) : [];
  if (!slides.length) return null;
  const banner = el('section', 'merchandizing-banner', { 'aria-label': 'Merchandise banner' });
  const content = el('div', 'content');
  const carousel = el('div', 'banner-carousel');
  const status = el('p', 'sr-only');
  const prev = el('button', 'slide-btn pre-info-btn', { type: 'button' });
  prev.append(el('span', 'iconfont-homehero-left-arrow', { 'aria-hidden': 'true' }));
  const next = el('button', 'slide-btn next-info-btn', { type: 'button' });
  next.append(el('span', 'iconfont-homehero-right-arrow', { 'aria-hidden': 'true' }));
  const track = el('div', 'swiper-wrapper');
  const items = slides.map((p) => {
    const item = el('article', 'merchandizing-item', { 'aria-label': 'Merchandize banner item' });
    const link = p.querySelector('a');
    if (link) {
      item.append(el('a', 'carsouel-link', {
        href: link.href, 'aria-label': text(link), tabindex: '-1', 'aria-hidden': 'true',
      }));
    }
    const filter = el('div', 'filter-text');
    filter.append(p);
    item.append(filter);
    track.append(item);
    return item;
  });
  let index = 0;
  const go = (n) => {
    index = (n + items.length) % items.length;
    track.style.transform = `translateX(${-100 * index}%)`;
    items.forEach((item, k) => {
      item.classList.toggle('is-active', k === index);
      item.inert = k !== index;
    });
    const msg = `currently displaying item ${index + 1} of ${items.length}`;
    status.textContent = `Currently displaying item ${index + 1} of ${items.length}`;
    prev.setAttribute('aria-label', `Previous information, ${msg}`);
    next.setAttribute('aria-label', `Next information, ${msg}`);
  };
  let timer = null;
  const stop = () => {
    clearInterval(timer);
    timer = null;
  };
  const run = () => {
    stop();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || items.length < 2) return;
    timer = setInterval(() => go(index + 1), 5000);
  };
  prev.addEventListener('click', () => {
    go(index - 1);
    run();
  });
  next.addEventListener('click', () => {
    go(index + 1);
    run();
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? run() : stop()));
    }, { threshold: 0.5 }).observe(banner);
  }
  go(0);
  carousel.append(prev, next, track, status);
  content.append(carousel);
  banner.append(content);
  return banner;
}

/** phone (<= 749): the live site injects expand toggles and drops the account label */
function applyPhone(nav) {
  if (!PHONE.matches) return;
  // store label "<b>Join</b>  Lenovo Pro Business Store" → "<b>Lenovo Pro</b> Business Store":
  // the authored nodes are split and re-wrapped (moved), never rebuilt from text
  const label = nav.querySelector('.store-label');
  const join = label && label.querySelector('strong');
  const rest = join && join.nextSibling;
  if (rest && rest.nodeType === Node.TEXT_NODE && rest.data.includes('Lenovo Pro')) {
    const at = rest.data.indexOf('Lenovo Pro');
    const brand = rest.splitText(at);
    const tail = brand.splitText('Lenovo Pro'.length);
    const lead = el('span', 'store-desktop');
    join.before(lead);
    lead.append(join, rest);
    const bold = el('strong');
    tail.before(bold);
    bold.append(brand);
  }
  const sup = nav.querySelector('.sup-nav');
  if (sup && !sup.querySelector('.expand-icon')) {
    const li = el('li', 'nav-item nav-expand-item');
    li.append(el('button', 'expand-icon iconfont-arrow-down', {
      type: 'button', 'aria-label': 'nav expand menu', 'aria-expanded': 'true',
    }));
    sup.prepend(li);
  }
  const seg = nav.querySelector('.segment-nav-container');
  if (seg && !seg.querySelector('.expand-icon')) {
    const li = el('li', 'nav-item segment-item segment-toggle');
    const btn = el('button', 'expand-icon iconfont-arrow-down', {
      type: 'button', 'aria-label': 'nav collapse segment', 'aria-expanded': 'false',
    });
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      seg.classList.toggle('is-open', open);
    });
    li.append(btn);
    seg.prepend(li);
  }
}

function wirePopovers(nav) {
  const closeAll = (except) => nav.querySelectorAll('.utility-nav-item.is-open').forEach((li) => {
    if (li === except) return;
    li.classList.remove('is-open');
    const b = li.querySelector('[aria-expanded]');
    if (b) b.setAttribute('aria-expanded', 'false');
  });
  nav.querySelectorAll('.utility-nav-item').forEach((li) => {
    const btn = li.querySelector('.accessibility-icon, .store-arrow');
    if (!btn || !li.querySelector('.popover')) return;
    btn.addEventListener('click', () => {
      const open = !li.classList.contains('is-open');
      closeAll(li);
      li.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll();
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.utility-nav-item')) closeAll();
  });
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  if (!fragment) return;
  fragment.querySelectorAll('.metadata, .section-metadata').forEach((m) => m.remove());

  const sections = [...fragment.querySelectorAll(':scope > .section')];
  let mi = sections.findIndex((s) => s.querySelector('a .icon, a img, a picture'));
  if (mi < 0) mi = Math.min(1, sections.length - 1);
  const utility = sections.slice(0, mi);
  const masthead = sections[mi];
  const navSection = sections.slice(mi + 1).find((s) => s.querySelector('ul a'));
  const promoSection = sections.slice(mi + 1).find((s) => s !== navSection && s.querySelector('p'));

  const site = document.body.classList.contains('tpl-site') || !!getMetadata('nav-section');
  const nav = el('nav', `common-header${site ? ' common-header-site' : ''}`, {
    id: 'nav', 'aria-label': 'head navigation',
  });

  // utility bar
  const top = el('div', 'masthead top-masthead');
  const topInner = el('div', 'top-masthead-container');
  const topRight = el('div', 'header-right', { 'aria-label': 'stores and utility navigation' });
  const utilList = el('ul', 'utility-nav');
  utility.forEach((s) => s.querySelectorAll('.default-content-wrapper > ul > li').forEach((li) => {
    utilList.append(buildUtilityItem(li));
  }));
  topRight.append(utilList);
  topInner.append(topRight);
  top.append(topInner);

  // logo / search / account row
  const main = el('div', 'masthead main-masthead');
  const left = el('div', 'header-left');
  const lists = masthead ? [...masthead.querySelectorAll('.default-content-wrapper > ul')] : [];
  const logoLink = masthead ? masthead.querySelector('a .icon, a img, a picture')?.closest('a') : null;
  if (logoLink) {
    logoLink.className = 'logo';
    logoLink.setAttribute('aria-label', 'Go to Home');
    const img = logoLink.querySelector('img');
    if (img) {
      img.alt = 'homepage';
      img.loading = 'eager';
      img.width = 124;
      img.height = 40;
    }
    left.append(logoLink);
  }
  const skip = el('button', 'header-skip-main', { type: 'button' });
  skip.textContent = 'skip to main content';
  skip.addEventListener('click', () => {
    const m = document.querySelector('main');
    if (m) {
      m.tabIndex = -1;
      m.focus();
    }
  });
  left.append(skip);
  const searchLink = masthead
    ? [...masthead.querySelectorAll('a')].find((a) => a !== logoLink && !a.closest('ul'))
    : null;
  const categories = lists.find((ul) => !ul.querySelector(':scope > li > a, :scope > li > p > a'));
  const suggestions = lists.find((ul) => ul !== categories && ul.querySelector('a')
    && [...ul.querySelectorAll('a')].every((a) => /\/search/.test(a.href)));
  const tools = lists.find((ul) => ul !== categories && ul !== suggestions);
  const right = el('div', 'header-right', { 'aria-label': 'account and cart navigation' });
  const toolList = el('ul', 'utility-nav second-utility-list');
  if (tools) tools.querySelectorAll(':scope > li').forEach((li) => toolList.append(buildToolItem(li)));
  right.append(toolList);
  main.append(left, buildSearch(searchLink, categories, suggestions), right);

  // nav row + tier-2 rows
  const navLists = navSection ? [...navSection.querySelectorAll('.default-content-wrapper > ul')] : [];
  const navRow = buildNav(navLists[0], navLists[1], site);

  nav.append(top, main, navRow.view, navRow.views);
  const inNavRegion = (t) => t instanceof Node
    && (navRow.view.contains(t) || navRow.views.contains(t));
  [navRow.view, navRow.views].forEach((region) => {
    region.addEventListener('mouseleave', (e) => {
      if (!inNavRegion(e.relatedTarget)) navRow.reset();
    });
    region.addEventListener('focusout', (e) => {
      if (!inNavRegion(e.relatedTarget)) navRow.reset();
    });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') navRow.reset();
  });

  const root = el('div', 'site-header');
  root.append(nav);
  const promo = buildPromo(promoSection);
  if (promo) root.append(promo);

  wirePopovers(nav);
  applyPhone(nav);
  block.replaceChildren(root);
}
