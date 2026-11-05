/**
 * faq-accordion — FAQ list (live x-cms-ai-ofp-fe-2c-accordion): question rows that open
 * and close their answer, all collapsed at load (capture state). Reconstructive.
 * Schema: stardust/eds-schema/us-en-ai-pcs.json section 11 (18 units).
 *
 * Authoring: one row per item — question cell (<p> or heading) | answer cell (<p>/<ul>…).
 * A single-cell row reads its first element as the question and the rest as the answer;
 * a single-cell row holding only an <h2> is a group title (variant `dark`, Legion FAQ groups).
 * The question stays outside the toggle button (EW7): the whole row takes the click,
 * the button is the +/− glyph only, labelled by the question.
 */

let seq = 0;

function toggle(row, btn, panel) {
  const open = btn.getAttribute('aria-expanded') === 'true';
  btn.setAttribute('aria-expanded', String(!open));
  row.classList.toggle('open', !open);
  panel.hidden = open;
}

function buildItem(qNodes, aNodes) {
  seq += 1;
  const id = `faq-accordion-${seq}`;
  const item = document.createElement('article');
  item.className = 'faq-item';

  const row = document.createElement('div');
  row.className = 'faq-tab-label';
  const label = document.createElement('div');
  label.className = 'faq-label-text';
  label.id = `${id}-label`;
  label.append(...qNodes);
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'faq-icon';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', `${id}-panel`);
  btn.setAttribute('aria-labelledby', label.id);
  row.append(label, btn);

  const panel = document.createElement('div');
  panel.className = 'faq-content';
  panel.id = `${id}-panel`;
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-labelledby', label.id);
  panel.hidden = true;
  panel.append(...aNodes);

  row.addEventListener('click', () => toggle(row, btn, panel));

  const sep = document.createElement('div');
  sep.className = 'faq-separator';
  item.append(row, panel, sep);
  return item;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .faq-container')) return;
  const items = [];
  [...block.children].forEach((r) => {
    const cells = [...r.children];
    if (!cells.length) return;
    if (cells.length >= 2) {
      const q = [...cells[0].childNodes];
      const a = cells.slice(1).flatMap((c) => [...c.childNodes]);
      if (cells[0].textContent.trim()) items.push(buildItem(q, a));
      return;
    }
    const kids = [...cells[0].children];
    if (!kids.length) return;
    if (kids.length === 1 && kids[0].matches('h2')) {
      // group title row (variant dark, live widgets-title above each type1-accordion)
      const title = document.createElement('div');
      title.className = 'faq-group-title';
      title.append(kids[0]);
      items.push(title);
      return;
    }
    items.push(buildItem([kids[0]], kids.slice(1)));
  });

  const container = document.createElement('div');
  container.className = 'faq-container';
  const mobileSep = document.createElement('div');
  mobileSep.className = 'faq-mobile-separator';
  const list = document.createElement('div');
  list.className = 'faq-list';
  list.append(...items);
  container.append(mobileSep, list);
  block.replaceChildren(container);
}
