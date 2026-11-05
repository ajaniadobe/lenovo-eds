/**
 * pdp-ports — "Ports & Slots" diagram with its numbered legend.
 * Authoring: one cell — <h2>, the diagram <img>, an <ol> of port names (numbers are drawn).
 * Decode tier: template-slotted.
 */
function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .pdp-ports-inner')) return;
  const inner = document.createElement('div');
  inner.className = 'pdp-ports-inner';
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    [...cell.children].forEach((n) => {
      if (/^H[1-6]$/.test(n.tagName)) inner.append(wrapNode(n, 'pdp-ports-title'));
      else if (n.matches('picture, img') || n.querySelector('picture, img')) inner.append(wrapNode(n, 'pdp-ports-media'));
      else if (n.tagName === 'OL' || n.tagName === 'UL') inner.append(wrapNode(n, 'ports-list'));
      else inner.append(n);
    });
  });
  block.replaceChildren(inner);
  // the live legend splits into two lists: the first half on the left (column break after it)
  const items = inner.querySelectorAll('.ports-list > :is(ol, ul) > li');
  if (items.length > 1) items[Math.ceil(items.length / 2) - 1].classList.add('col-end');
  // series pages: the legend splits into two columns sized by the item count
  const list = inner.querySelector('.ports-list');
  if (list) list.style.setProperty('--ports-rows', String(Math.max(1, Math.ceil(items.length / 2))));
  const section = block.closest('.section');
  if (section && !document.getElementById('ports_slots')) section.id = 'ports_slots';
}
