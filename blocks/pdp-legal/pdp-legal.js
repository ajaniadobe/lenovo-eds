/**
 * pdp-legal — "pricing, restrictions, warranties" disclosure (open by default, as captured).
 * Authoring: first row — the disclosure title <p>; following rows — the legal <p>s
 * (lead term in <strong>). The title row is the toggle (EW7: a div, not a <button>).
 */
function el(tag, className) {
  const e = document.createElement(tag);
  e.className = className;
  return e;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .pdp-legal-in')) return;
  let rows = [...block.children];
  if (!rows.length) return;
  const inner = el('div', 'pdp-legal-in');
  // optional lead rows (series pages): a page-title <h2> row and an <h3> Q&A row whose last
  // <p><em> is the "read more" label; both render above the disclosure toggle
  const lead = [];
  rows = rows.filter((row) => {
    const h = row.querySelector('h2, h3');
    if (!h || rows.indexOf(row) > 1) return true;
    const nodes = [];
    row.querySelectorAll(':scope > div').forEach((cell) => nodes.push(...cell.children));
    const box = el('div', h.tagName === 'H2' ? 'pdp-legal-title' : 'pdp-legal-seo');
    box.append(...nodes);
    const more = box.querySelector(':scope > p:last-child > em:only-child');
    if (more && box.classList.contains('pdp-legal-seo')) more.parentElement.className = 'read-more';
    lead.push(box);
    return false;
  });
  const toggle = el('div', 'pdp-legal-toggle');
  const body = el('div', 'pdp-legal-body');
  body.id = 'pdp-legal-body';
  rows.forEach((row, i) => {
    const nodes = [];
    row.querySelectorAll(':scope > div').forEach((cell) => nodes.push(...cell.children));
    if (i === 0 && rows.length > 1) toggle.append(...nodes);
    else body.append(...nodes);
  });
  toggle.setAttribute('role', 'button');
  toggle.setAttribute('tabindex', '0');
  toggle.setAttribute('aria-expanded', 'true');
  toggle.setAttribute('aria-controls', body.id);
  const flip = () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    body.hidden = open;
  };
  toggle.addEventListener('click', flip);
  toggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      flip();
    }
  });
  inner.append(...lead, toggle, body);
  block.replaceChildren(inner);
}
