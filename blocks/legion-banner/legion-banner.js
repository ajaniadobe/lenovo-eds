/**
 * legion-banner — full-width promo banner (live #blade-6 Lenovo LOQ): background art with the
 * copy column on the right (logo, headline, body, primary CTA); ≤1299px the copy stacks above
 * the mobile art on black.
 * Template-slotted, classified by content: the picture-only row = background (1st picture
 * desktop, 2nd mobile); the row with a heading = copy (picture = logo, link = CTA).
 */

function wrap(className, ...nodes) {
  const d = document.createElement('div');
  d.className = className;
  d.append(...nodes);
  return d;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .legion-banner-content')) return;
  const rows = [...block.children];
  const bgRow = rows.find((r) => !r.textContent.trim() && r.querySelector('picture, img'));
  const copyRow = rows.find((r) => r !== bgRow && r.querySelector('h1, h2, h3'));
  const parts = [];
  if (bgRow) {
    const pics = [...bgRow.querySelectorAll('picture')].length
      ? [...bgRow.querySelectorAll('picture')] : [...bgRow.querySelectorAll('img')];
    parts.push(wrap('legion-banner-bg', pics[0]));
    if (pics[1]) parts.push(wrap('legion-banner-mobile', pics[1]));
  }
  const content = wrap('legion-banner-content');
  if (copyRow) {
    [...copyRow.querySelectorAll(':scope > div > *')].forEach((el) => {
      if (el.matches('h1, h2, h3')) el.classList.add('legion-banner-title');
      else if (el.querySelector('a')) {
        el.classList.add('legion-banner-actions');
        el.querySelector('a').className = 'legion-banner-cta';
      } else if (el.querySelector('picture, img') || el.matches('picture, img')) {
        el.classList.add('legion-banner-logo');
      } else el.classList.add('legion-banner-text');
      content.append(el);
    });
  }
  parts.push(content);
  block.replaceChildren(...parts);
}
