/**
 * pdp-services — "Lenovo Services" promise cards.
 * Section head (eyebrow <p> + <h2>) is DEFAULT CONTENT before the block, styled in place.
 * Authoring: one row per service — icon <img>, <h3>, description <p>, link <p><a>.
 * Decode tier: reconstructive (segments on the card heading; one-row-per-card preferred).
 */
function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .svc-list')) return;
  const nodes = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => nodes.push(...cell.children));
  const units = [];
  let pending = [];
  let cur = null;
  nodes.forEach((n) => {
    if (/^H[2-6]$/.test(n.tagName)) {
      cur = { heading: n, pre: pending, post: [] };
      pending = [];
      units.push(cur);
    } else if (n.querySelector('picture, img') || n.matches('picture, img')) {
      pending.push(n);
    } else if (cur) cur.post.push(n);
    else pending.push(n);
  });
  const list = document.createElement('ul');
  list.className = 'svc-list';
  units.forEach((u) => {
    const li = document.createElement('li');
    li.className = 'svc';
    u.pre.forEach((p) => li.append(wrapNode(p, p.querySelector('picture, img') ? 'svc-icon' : 'svc-pre')));
    li.append(wrapNode(u.heading, 'svc-title'));
    const desc = document.createElement('div');
    desc.className = 'svc-desc';
    u.post.forEach((p) => {
      const a = p.querySelector('a');
      if (a && p.textContent.trim() === a.textContent.trim()) li.append(wrapNode(p, 'svc-link'));
      else desc.append(p);
    });
    if (desc.children.length) li.querySelector('.svc-title').after(desc);
    list.append(li);
  });
  if (pending.length) {
    const rest = document.createElement('div');
    rest.className = 'svc-rest';
    rest.append(...pending);
    block.replaceChildren(list, rest);
  } else block.replaceChildren(list);
}
