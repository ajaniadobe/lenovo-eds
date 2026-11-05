/**
 * prompt — "Discover How Lenovo Can Help You" prompt group (live len-prompt).
 * Schema: stardust/eds-schema/index.json, section `prompt`.
 * Decode tier: template-slotted shell, reconstructive prompt rows.
 *
 * Authoring:
 *   row: background image (a row holding only an image)
 *   row: heading (h2) + the results title paragraph ("Users like you started their path here:")
 *   one row per prompt, four cells —
 *     1. prompt label paragraph
 *     2. visibility word
 *     3. result media image, description paragraph, then either a **bold** CTA link
 *        or a plain control label paragraph (e.g. "Play Video")
 *     4. result links: per item a linked heading (h5) followed by its description paragraph
 *
 * @variants cell 2: all | desktop (default all) — `desktop` hides the prompt on phones
 * @ew-exempt metadata — the visibility word (cell 2) is never displayed
 *
 * Behaviour (captureState restoreAtDelivery): choosing a prompt reveals its results panel;
 * "Start Over" returns to the prompt list.
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

// presentational clones must not keep the editor's indices (EW4)
function stripInstrumentation(el) {
  el.querySelectorAll('[data-prose-index], [data-image-index]').forEach((n) => {
    n.removeAttribute('data-prose-index');
    n.removeAttribute('data-image-index');
  });
  el.removeAttribute('data-prose-index');
  return el;
}

function cellNodes(cell) {
  if (!cell) return [];
  let kids = [...cell.children];
  if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].querySelector('picture, img')
    && kids[0].children.length > 1) {
    kids = [...kids[0].children];
  }
  if (!kids.length && cell.textContent.trim()) {
    // HARNESS-ONLY fallback (EW5): bare text in a cell; DA always wraps text in <p>.
    const p = document.createElement('p');
    p.append(...cell.childNodes);
    kids = [p];
  }
  return kids;
}

const isMedia = (n) => n.matches('picture, img') || (!!n.querySelector('picture, img') && !n.querySelector('a'));
const isHeading = (n) => /^H[1-6]$/.test(n.tagName);
const VARIANTS = ['all', 'desktop'];

function icon(name) {
  const s = document.createElement('span');
  s.className = `len-icon-image ic-${name}`;
  s.setAttribute('aria-hidden', 'true');
  return s;
}

function buildResult(mediaCell, itemsCell) {
  const result = div('prompt-result');
  result.hidden = true;
  const row = div('result-row');
  const media = div('result-media');
  const desc = div('result-desc');
  const controls = div('result-controls');
  cellNodes(mediaCell).forEach((n) => {
    if (isMedia(n)) {
      media.prepend(wrapNode(n, 'result-img'));
    } else if (n.querySelector('a')) {
      controls.append(n);
    } else if (!desc.children.length) {
      desc.append(wrapNode(n, 'result-desc-text'));
    } else {
      // control label without a link (e.g. "Play Video") — outlined control look
      const ctl = wrapNode(n, 'cta-outline');
      ctl.prepend(icon('play'));
      controls.append(ctl);
    }
  });
  if (controls.children.length) desc.append(controls);
  let mobileDesc = null;
  if (desc.children.length) {
    media.append(desc);
    // live renders the description twice (inside the media on desktop, below it on phones);
    // the phone copy is presentational (EW4)
    mobileDesc = stripInstrumentation(desc.cloneNode(true));
    desc.classList.add('desktop-only');
    mobileDesc.classList.add('mobile-only');
  }
  const items = div('result-items');
  let item = null;
  cellNodes(itemsCell).forEach((n) => {
    if (isHeading(n) || !item) {
      item = div('prompt-item');
      const link = document.createElement('a');
      link.className = 'item-link';
      item.append(link);
      items.append(item);
    }
    const link = item.querySelector('.item-link');
    const a = n.querySelector('a');
    if (a) {
      if (!link.hasAttribute('href')) link.href = a.href;
      a.replaceWith(...a.childNodes);
    }
    link.append(wrapNode(n, isHeading(n) ? 'item-title' : 'item-desc'));
  });
  items.querySelectorAll('.item-link[href]').forEach((link) => {
    const arrow = document.createElement('a');
    arrow.className = 'item-arrow';
    arrow.href = link.href;
    arrow.tabIndex = -1;
    arrow.setAttribute('aria-hidden', 'true');
    arrow.append(icon('arrow-right'));
    link.after(arrow);
  });
  row.append(media);
  if (mobileDesc) row.append(mobileDesc);
  row.append(items);
  result.append(row);
  return result;
}

export default function decorate(block) {
  const box = div('prompt-box');
  const bg = div('prompt-bg');
  bg.setAttribute('aria-hidden', 'true');
  const actions = div('prompt-actions');
  const list = div('prompt-list');
  const results = div('prompt-results');
  const inner = div('results-inner');
  const resultsActions = div('results-actions');
  const resultsPrompts = div('results-prompts');
  const resultsTitle = div('results-title');
  const render = div('results-render');
  const leftovers = [];
  let heading = null;
  const prompts = [];

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const promptRow = cells.length >= 3
      || !!row.querySelector('h5, h6')
      || cells.some((c) => VARIANTS.includes(c.textContent.trim().toLowerCase()));
    if (!promptRow) {
      cellNodes(cells[0]).concat(...cells.slice(1).map(cellNodes)).forEach((n) => {
        if (isMedia(n) && !bg.children.length && !heading) bg.append(n);
        else if (isHeading(n) && !heading) heading = n;
        else if (heading && !resultsTitle.children.length) resultsTitle.append(n);
        else leftovers.push(n);
      });
      return;
    }
    // classify cells by content: label | variant word | media | items
    let label = null;
    let variant = 'all';
    let mediaCell = null;
    let itemsCell = null;
    cells.forEach((c) => {
      const word = c.textContent.trim().toLowerCase();
      // wrapTextNodes may have put the word in a <p>: test the text, not the markup
      if (VARIANTS.includes(word) && !c.querySelector('a, picture, img')) variant = word;
      else if (c.querySelector('h1, h2, h3, h4, h5, h6')) itemsCell = c;
      else if (c.querySelector('picture, img')) mediaCell = c;
      else if (!label) [label] = cellNodes(c);
    });
    if (!label) return;
    prompts.push({
      label, variant, mediaCell, itemsCell,
    });
  });

  prompts.forEach((p, i) => {
    const btn = div('prompt-btn');
    btn.setAttribute('role', 'button');
    btn.tabIndex = 0;
    btn.dataset.index = i;
    btn.append(p.label);
    list.append(btn);
    if (p.variant !== 'desktop') {
      // phone list (live renders a separate mobile button per prompt) — presentational (EW4)
      const mob = div('prompt-btn mobile-only');
      mob.setAttribute('role', 'button');
      mob.tabIndex = 0;
      mob.dataset.index = i;
      mob.append(stripInstrumentation(p.label.cloneNode(true)));
      list.append(mob);
    }
    btn.classList.add('desktop-only');
    const clone = document.createElement('button');
    clone.type = 'button';
    clone.className = 'prompt-btn';
    clone.tabIndex = -1;
    clone.dataset.index = i;
    clone.append(stripInstrumentation(p.label.cloneNode(true)));
    resultsPrompts.append(clone);
    render.append(buildResult(p.mediaCell, p.itemsCell));
  });

  const restart = document.createElement('button');
  restart.type = 'button';
  restart.className = 'button primary restart';
  restart.tabIndex = -1;
  restart.innerHTML = '<span>Start Over</span><span class="len-icon-image ic-refresh" aria-hidden="true"></span>';
  resultsActions.append(resultsPrompts, restart);
  inner.append(resultsActions);
  if (resultsTitle.children.length) inner.append(resultsTitle);
  inner.append(render);
  results.append(inner);

  if (heading) {
    heading.id = heading.id || 'prompt-h';
    actions.append(wrapNode(heading, 'prompt-heading'));
  }
  actions.append(list);
  box.append(bg, actions, results);
  if (leftovers.length) {
    const extra = div('prompt-extra');
    extra.append(...leftovers);
    box.append(extra);
  }
  block.replaceChildren(box);

  const show = (i) => {
    box.classList.add('is-selected');
    [...render.children].forEach((r, k) => { r.hidden = k !== i; });
    [...resultsPrompts.children].forEach((b, k) => {
      b.classList.toggle('is-active', k === i);
      b.tabIndex = 0;
    });
    restart.tabIndex = 0;
  };
  block.querySelectorAll('.prompt-btn').forEach((b) => {
    b.addEventListener('click', () => show(Number(b.dataset.index)));
    b.addEventListener('keydown', (e) => {
      if (b.tagName !== 'BUTTON' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        show(Number(b.dataset.index));
      }
    });
  });
  restart.addEventListener('click', () => {
    box.classList.remove('is-selected');
    [...render.children].forEach((r) => { r.hidden = true; });
    [...resultsPrompts.children].forEach((b) => { b.tabIndex = -1; });
    restart.tabIndex = -1;
  });
}
