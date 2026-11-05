/**
 * legion-cards — Legion product-family cards (live .blade-3-pdt-list .lg-card, and the
 * ≤576px h-carousel-3 slider of the same cards) plus the "View all" call to action.
 * Reconstructive, classified by content:
 *   - row with a heading                card: picture cell (1st picture = top art, 2nd =
 *                                       product cut-out) | copy (h3 title, p>strong tagline,
 *                                       other <p> = description, <p> holding a link = CTA)
 *   - row holding only a link           section CTA (View all …)
 * @ew-exempt control labels: slider arrows and dots (≤576px) are runtime chrome
 */

function wrap(className, ...nodes) {
  const d = document.createElement('div');
  d.className = className;
  d.append(...nodes);
  return d;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .legion-cards-viewport')) return;
  const cards = [];
  let cta = null;
  [...block.children].forEach((r) => {
    if (!r.querySelector('h1, h2, h3, h4')) {
      const a = r.querySelector('a');
      if (a) {
        a.className = 'legion-cards-cta';
        cta = wrap('legion-cards-actions', a.closest('p') || a);
      }
      return;
    }
    const pics = [...r.querySelectorAll('picture')].length
      ? [...r.querySelectorAll('picture')] : [...r.querySelectorAll('img')];
    const copyCell = [...r.children].find((c) => c.querySelector('h1, h2, h3, h4'));
    const card = wrap('legion-cards-card');
    card.append(wrap('legion-cards-top', ...(pics[0] ? [pics[0]] : [])));
    const body = wrap('legion-cards-body');
    if (pics[1]) body.append(wrap('legion-cards-product', pics[1]));
    const copy = wrap('legion-cards-copy');
    [...copyCell.children].forEach((el) => {
      const s = el.querySelector('strong');
      if (el.matches('h1, h2, h3, h4')) el.classList.add('legion-cards-title');
      else if (el.querySelector('a')) {
        el.classList.add('legion-cards-link');
        el.querySelector('a').className = '';
      } else if (s && s.textContent.trim() === el.textContent.trim()) el.classList.add('legion-cards-tag');
      else el.classList.add('legion-cards-desc');
      copy.append(el);
    });
    body.append(copy);
    card.append(body);
    cards.push(card);
  });

  const track = wrap('legion-cards-track', ...cards);
  const viewport = wrap('legion-cards-viewport', track);
  const parts = [viewport];
  if (cards.length > 1) {
    const prev = document.createElement('button');
    const next = document.createElement('button');
    prev.type = 'button';
    next.type = 'button';
    prev.className = 'legion-cards-prev';
    next.className = 'legion-cards-next';
    prev.setAttribute('aria-label', 'Previous slide: Legion Products carousel');
    next.setAttribute('aria-label', 'Next slide: Legion Products carousel');
    const dots = wrap('legion-cards-dots');
    let index = 0;
    const go = (i) => {
      index = Math.max(0, Math.min(cards.length - 1, i));
      track.style.setProperty('--legion-cards-index', index);
      [...dots.children].forEach((d, n) => d.classList.toggle('active', n === index));
      prev.classList.toggle('hidden', index === 0);
      next.classList.toggle('hidden', index === cards.length - 1);
    };
    cards.forEach((c, n) => {
      const d = document.createElement('button');
      d.type = 'button';
      d.className = 'legion-cards-dot';
      d.setAttribute('aria-label', `Slide ${n + 1} on Legion Products carousel`);
      d.addEventListener('click', () => go(n));
      dots.append(d);
    });
    prev.addEventListener('click', () => go(index - 1));
    next.addEventListener('click', () => go(index + 1));
    parts.push(prev, next, dots);
    go(0);
  }
  if (cta) parts.push(cta);
  block.replaceChildren(...parts);
}
