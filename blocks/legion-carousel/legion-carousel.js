/**
 * legion-carousel — the Legion landing sliders (live h-carousel-2 / h-carousel-5 /
 * le-go- and le-lp-carousel / h-carousel-4): one slide per row, prev/next arrows, dots.
 * Variants: (default) full-bleed product banner, `partner` (partner banner: copy + logos left,
 * product art right), `showcase` (product image left, copy right, transparent), `tall`,
 * `space` (Legion Space: centred card with the neighbours peeking, title row first).
 * Reconstructive, classified by content:
 *   - single cell with a heading and no picture   block title (space)
 *   - cell with a heading                         slide copy (h2/h3, p>strong tagline,
 *                                                 p>em pill, other <p>s, <p> of links = CTAs)
 *   - first other cell with pictures              slide media (2nd picture = mobile art)
 *   - any further cell                            extra art (partner: right column)
 * @ew-exempt control labels: arrow and dot aria-labels are runtime chrome
 */

function wrap(className, ...nodes) {
  const d = document.createElement('div');
  d.className = className;
  d.append(...nodes);
  return d;
}

function pictures(c) {
  const ps = [...c.querySelectorAll('picture')];
  return ps.length ? ps : [...c.querySelectorAll('img')];
}

function buildCopy(cell) {
  const copy = wrap('legion-carousel-copy');
  [...cell.children].forEach((el) => {
    if (el.matches('h1, h2, h3, h4')) el.classList.add('legion-carousel-title');
    else if (el.querySelector('picture, img') && !el.textContent.trim()) el.classList.add('legion-carousel-logo');
    else if (el.querySelector('a')) {
      el.classList.add('legion-carousel-links');
      el.querySelectorAll('a').forEach((a) => { a.className = 'legion-carousel-link'; });
    } else if (el.querySelector('strong')
      && el.textContent.trim() === el.querySelector('strong').textContent.trim()) {
      el.classList.add('legion-carousel-tagline');
    } else if (el.querySelector('em') && el.textContent.trim() === el.querySelector('em').textContent.trim()) {
      el.classList.add('legion-carousel-pill');
    } else if (el.matches('picture, img')) {
      el.classList.add('legion-carousel-logo');
    }
    copy.append(el);
  });
  return copy;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .legion-carousel-viewport')) return;
  const rows = [...block.children];
  const header = [];
  const slides = [];
  rows.forEach((r) => {
    const cells = [...r.children];
    if (cells.length === 1 && cells[0].querySelector('h1, h2, h3') && !cells[0].querySelector('picture, img')) {
      header.push(...cells[0].children);
      return;
    }
    const textCell = cells.find((c) => c.querySelector('h1, h2, h3, h4'));
    const mediaCell = cells.find((c) => c !== textCell && c.querySelector('picture, img'));
    const extra = cells.filter((c) => c !== textCell && c !== mediaCell && c.querySelector('picture, img'));
    const slide = wrap('legion-carousel-slide');
    if (mediaCell) {
      const pics = pictures(mediaCell);
      const media = wrap('legion-carousel-media', ...pics);
      if (pics.length > 1) {
        pics[0].classList.add('legion-carousel-desktop');
        pics[1].classList.add('legion-carousel-mobile');
      }
      slide.append(media);
    }
    if (textCell) slide.append(buildCopy(textCell));
    extra.forEach((c) => slide.append(wrap('legion-carousel-extra', ...pictures(c))));
    slides.push(slide);
  });

  const isSpace = block.classList.contains('space');
  const NAMES = [['space', 'Legion Space'], ['tall', 'Legion Laptops'], ['showcase', 'Legion Go'],
    ['partner', 'Legion Partners']];
  const name = `${(NAMES.find(([c]) => block.classList.contains(c)) || [0, 'Legion announcements'])[1]} carousel`;
  block.setAttribute('aria-roledescription', 'carousel');
  block.setAttribute('aria-label', name);
  const track = wrap('legion-carousel-track', ...slides);
  const viewport = wrap('legion-carousel-viewport', track);
  const prev = document.createElement('button');
  const next = document.createElement('button');
  prev.type = 'button';
  next.type = 'button';
  prev.className = 'legion-carousel-prev';
  next.className = 'legion-carousel-next';
  prev.setAttribute('aria-label', `Previous slide: ${name}`);
  next.setAttribute('aria-label', `Next slide: ${name}`);
  const dots = wrap('legion-carousel-dots');
  let index = isSpace && slides.length > 2 ? 1 : 0;
  const go = (i) => {
    index = isSpace
      ? (i + slides.length) % slides.length
      : Math.max(0, Math.min(slides.length - 1, i));
    track.style.setProperty('--legion-carousel-index', index);
    slides.forEach((s, n) => {
      s.classList.toggle('active', n === index);
      s.setAttribute('aria-hidden', String(n !== index));
      s.toggleAttribute('inert', n !== index);
    });
    [...dots.children].forEach((d, n) => d.classList.toggle('active', n === index));
    if (!isSpace) {
      prev.classList.toggle('hidden', index === 0);
      next.classList.toggle('hidden', index === slides.length - 1);
    }
  };
  slides.forEach((s, n) => {
    s.setAttribute('role', 'group');
    s.setAttribute('aria-roledescription', 'slide');
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'legion-carousel-dot';
    dot.setAttribute('aria-label', `Slide ${n + 1} on ${name}`);
    dot.addEventListener('click', () => go(n));
    dots.append(dot);
  });
  prev.addEventListener('click', () => go(index - 1));
  next.addEventListener('click', () => go(index + 1));
  const parts = [];
  if (header.length) parts.push(wrap('legion-carousel-header', ...header));
  parts.push(viewport);
  if (slides.length > 1) parts.push(prev, next, dots);
  block.replaceChildren(...parts);
  go(index);
}
