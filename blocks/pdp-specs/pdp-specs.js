/**
 * pdp-specs — "Tech Specs" table of the product family.
 * Authoring (reconstructive, classified by row shape):
 *   single-cell <h2> row      — the table title
 *   single-cell <h3> row      — opens a spec group
 *   two-cell row              — label | value (<p> / <ul> / links / inline badge <img>)
 *   single-cell text <p> row  — disclaimer under the table
 *   single-cell <p> with <img> — the warnings & disclosures band after the table
 */
function wrapNode(node, className, tag = 'div') {
  const w = document.createElement(tag);
  w.className = className;
  w.append(node);
  return w;
}
function el(tag, className) {
  const e = document.createElement(tag);
  e.className = className;
  return e;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .pdp-specs-inner')) return;
  const inner = el('div', 'pdp-specs-inner');
  const head = el('div', 'pdp-specs-head');
  const body = el('div', 'pdp-specs-body');
  const after = [];
  let group = null;
  let lines = null;
  const openGroup = (title) => {
    group = el('div', 'spec-block');
    if (title) group.append(wrapNode(title, 'spec-block-title'));
    lines = el('div', 'spec-lines');
    group.append(lines);
    body.append(group);
  };
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length >= 2) {
      if (!group) openGroup(null);
      const line = el('div', 'spec-line');
      const label = el('div', 'spec-label');
      label.append(...cells[0].childNodes);
      const value = el('div', 'spec-value');
      value.append(...cells[1].childNodes);
      line.append(label, value);
      lines.append(line);
      return;
    }
    [...(cells[0]?.children || [])].forEach((n) => {
      if (n.tagName === 'H2' || (n.tagName === 'H1')) head.prepend(wrapNode(n, 'pdp-specs-title'));
      else if (/^H[3-6]$/.test(n.tagName)) openGroup(n);
      else if (n.querySelector('picture, img')) after.push(wrapNode(n, 'pdp-merch', 'aside'));
      else after.push(wrapNode(n, 'pdp-specs-disc'));
    });
  });
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'collapse';
  toggle.setAttribute('aria-expanded', 'true');
  toggle.setAttribute('aria-label', 'collapse');
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    body.hidden = open;
  });
  head.append(toggle);
  inner.append(head, body);
  after.filter((a) => a.classList.contains('pdp-specs-disc')).forEach((d) => inner.append(d));
  block.replaceChildren(inner, ...after.filter((a) => a.classList.contains('pdp-merch')));
  const section = block.closest('.section');
  if (section && !document.getElementById('tech_specs')) section.id = 'tech_specs';
}
