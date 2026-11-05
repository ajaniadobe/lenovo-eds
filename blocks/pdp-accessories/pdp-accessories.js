/**
 * pdp-accessories — "Compatible Accessories" product row of a series PDP (static snapshot).
 * Authoring: head row — eyebrow <p> + <h2>; one row per product — name <p><a>, rating
 * <p><strong>4.5</strong> (78)</p>, <img>, [was <p><del>], price <p><strong>, [saving <p><em>],
 * cart <p>; last row — the "see all" link <p><a>.
 */
function el(tag, className) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  return e;
}
function wrap(node, className) {
  const w = el('div', className);
  w.append(node);
  return w;
}

function buildStars(value) {
  const stars = el('span', 'stars');
  stars.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 5; i += 1) {
    const s = el('span', 'star');
    s.style.setProperty('--fill', `${Math.round(Math.max(0, Math.min(1, value - i)) * 100)}%`);
    stars.append(s);
  }
  return stars;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .acc-head')) return;
  const rows = [...block.children].map((r) => [...r.querySelectorAll(':scope > div > *')]);
  const out = [];
  const list = el('ul', 'acc-list');
  rows.forEach((nodes) => {
    if (nodes.some((n) => /^H[1-6]$/.test(n.tagName))) {
      const head = el('div', 'acc-head');
      nodes.forEach((n) => head.append(wrap(n, /^H/.test(n.tagName) ? 'acc-title' : 'acc-eyebrow')));
      out.push(head);
      return;
    }
    if (nodes.length === 1) {
      out.push(wrap(nodes[0], 'acc-all'));
      return;
    }
    const li = el('li', 'acc-item');
    nodes.forEach((n, i) => {
      let cls = 'acc-cart';
      if (i === 0) cls = 'acc-name';
      else if (n.querySelector('img, picture')) cls = 'acc-img';
      else if (n.querySelector('del')) cls = 'acc-was';
      else if (n.querySelector('em')) cls = 'acc-save';
      else if (n.querySelector('strong') && /^\d/.test(n.textContent.trim())) {
        cls = 'acc-rating';
        // the review count is its own inline box (live: a separate span after the score)
        const host = n.querySelector('a') || n;
        const texts = [...host.childNodes].filter((c) => c.nodeType === 3 && c.textContent.trim());
        texts.forEach((c) => {
          const count = el('span', 'acc-count');
          c.replaceWith(count);
          count.append(c);
        });
        n.prepend(buildStars(parseFloat(n.textContent)));
      } else if (n.querySelector('strong')) cls = 'acc-price';
      li.append(wrap(n, cls));
    });
    list.append(li);
  });
  out.splice(1, 0, list);
  block.replaceChildren(...out);
  const section = block.closest('.section');
  if (section && !document.getElementById('compatible_acc')) section.id = 'compatible_acc';
}
