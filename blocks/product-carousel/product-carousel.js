/**
 * product-carousel — highlighted-product slider (live segment_highlighted_product): per slide a
 * product image and a copy panel (eyebrow, name, description, price line, feature icons list,
 * CTA), prev/next arrows and pagination dots.
 * Reconstructive: one authored row per slide — picture cell | copy cell, classified by content:
 *   - first <p>                    eyebrow ("For 3D, VFX, Animation")
 *   - <p><strong>                  product name
 *   - <p><em>                      price line ("Starting at $…")
 *   - <ul>                         feature list (each <li>: optional icon + label)
 *   - <p> that is only a link      CTA
 *   - other <p>s                   description
 * Arrow / dot labels are runtime control labels generated here.
 */

function el(tag, className, ...nodes) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  e.append(...nodes);
  return e;
}

const onlyChild = (p, sel) => {
  const c = p.querySelector(sel);
  return c && p.textContent.trim() === c.textContent.trim();
};

function buildSlide(r) {
  const media = r.querySelector('picture') || r.querySelector('img');
  const ps = [...r.querySelectorAll(':scope > div > p')].filter((p) => p.textContent.trim());
  const name = ps.find((p) => onlyChild(p, 'strong'));
  const price = ps.find((p) => onlyChild(p, 'em'));
  const cta = ps.find((p) => onlyChild(p, 'a'));
  const rest = ps.filter((p) => ![name, price, cta].includes(p));
  const eyebrow = rest.shift();
  const list = r.querySelector('ul');

  const slide = el('div', 'product-carousel-slide');
  slide.setAttribute('role', 'group');
  slide.setAttribute('aria-roledescription', 'slide');
  slide.append(el('div', 'product-carousel-circle'));
  if (media) slide.append(el('div', 'product-carousel-image', media));
  const panel = el('div', 'product-carousel-panel');
  const info = el('div', 'product-carousel-info');
  if (eyebrow) info.append(el('div', 'product-carousel-eyebrow', eyebrow));
  if (name) info.append(el('div', 'product-carousel-name', name));
  if (rest.length) info.append(el('div', 'product-carousel-desc', ...rest));
  panel.append(info);
  panel.append(el('div', 'product-carousel-price', ...(price ? [price] : [])));
  if (list) {
    list.classList.add('product-carousel-features');
    [...list.children].forEach((li) => {
      const icon = li.querySelector('picture, img');
      const label = el('span', 'product-carousel-feature-label', ...[...li.childNodes]
        .filter((n) => !(n.nodeType === 1 && n.matches('picture, img'))));
      li.replaceChildren(el('span', 'product-carousel-feature-icon', ...(icon ? [icon] : [])), label);
    });
    const scroller = el('div', 'product-carousel-options', list);
    const more = el('button', 'product-carousel-options-next');
    more.type = 'button';
    more.setAttribute('aria-label', 'More features');
    more.addEventListener('click', () => list.scrollBy({ left: 145, behavior: 'smooth' }));
    scroller.append(more);
    panel.append(scroller);
  }
  if (cta) {
    cta.querySelector('a').classList.add('product-carousel-cta');
    cta.classList.add('product-carousel-action');
    panel.append(cta);
  }
  slide.append(panel);
  return slide;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .product-carousel-viewport')) return;
  const slides = [...block.children].map(buildSlide);
  const track = el('div', 'product-carousel-track', ...slides);
  const viewport = el('div', 'product-carousel-viewport', track);
  const prev = el('button', 'product-carousel-prev');
  const next = el('button', 'product-carousel-next');
  prev.type = 'button';
  next.type = 'button';
  prev.setAttribute('aria-label', 'Previous slide');
  next.setAttribute('aria-label', 'Next slide');
  const dots = el('div', 'product-carousel-dots');
  let index = 0;
  const go = (i) => {
    index = Math.max(0, Math.min(slides.length - 1, i));
    track.style.transform = `translateX(-${index * 100}%)`;
    slides.forEach((s, n) => s.setAttribute('aria-hidden', String(n !== index)));
    [...dots.children].forEach((d, n) => d.classList.toggle('active', n === index));
    prev.disabled = index === 0;
    next.disabled = index === slides.length - 1;
  };
  slides.forEach((s, n) => {
    const d = el('button', 'product-carousel-dot');
    d.type = 'button';
    d.setAttribute('aria-label', `Go to slide ${n + 1}`);
    d.addEventListener('click', () => go(n));
    dots.append(d);
  });
  prev.addEventListener('click', () => go(index - 1));
  next.addEventListener('click', () => go(index + 1));
  block.replaceChildren(viewport, prev, next, dots);
  go(0);
}
