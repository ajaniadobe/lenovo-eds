/**
 * listing-faq — deals DLP FAQ (live x-cms-ai-ofp-fe-2c-accordion on the black gaming page):
 * question rows that open and close their answer, all collapsed at load (capture state).
 * Reconstructive (repeat group).
 *
 * Authoring: one row per item — question cell (<p> or heading) | answer cell (<p>/<ul>…).
 * A single-cell row reads its first element as the question and the rest as the answer.
 * The question stays outside the toggle button (EW7): the whole row takes the click, the
 * button is the +/− glyph only, labelled by the question.
 */

let seq = 0;

function buildItem(qNodes, aNodes) {
  seq += 1;
  const id = `listing-faq-${seq}`;
  const item = document.createElement('article');
  item.className = 'listing-faq-item';

  const row = document.createElement('div');
  row.className = 'listing-faq-row';
  const label = document.createElement('div');
  label.className = 'listing-faq-question';
  label.id = `${id}-q`;
  label.append(...qNodes);
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'listing-faq-toggle';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', `${id}-a`);
  btn.setAttribute('aria-labelledby', label.id);
  row.append(label, btn);

  const panel = document.createElement('div');
  panel.className = 'listing-faq-answer';
  panel.id = `${id}-a`;
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-labelledby', label.id);
  panel.hidden = true;
  panel.append(...aNodes);

  row.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    item.classList.toggle('open', !open);
    panel.hidden = open;
  });
  item.append(row, panel);
  return item;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .listing-faq-list')) return;
  const items = [];
  [...block.children].forEach((r) => {
    const cells = [...r.children];
    if (!cells.length || !cells[0].textContent.trim()) return;
    if (cells.length >= 2) {
      const answer = cells.slice(1).flatMap((c) => [...c.childNodes]);
      items.push(buildItem([...cells[0].childNodes], answer));
      return;
    }
    const kids = [...cells[0].children];
    if (kids.length) items.push(buildItem([kids[0]], kids.slice(1)));
  });
  const list = document.createElement('div');
  list.className = 'listing-faq-list';
  list.append(...items);
  block.replaceChildren(list);
}
