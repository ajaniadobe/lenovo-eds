/**
 * ai-hero — full-bleed campaign hero (live heroTypeOne): background image, breadcrumb trail
 * top-left, headline + description over the image. Template-slotted.
 * Schema: stardust/eds-schema/us-en-ai-pcs.json section 0.
 *
 * Authoring (any row/cell shape — classified by content, never by index):
 *   - <picture>/<img>            background image (editorial; alt describes the scene)
 *   - <p> or <ul> BEFORE the h1  breadcrumb trail (one paragraph, links + separators as text)
 *   - <h1>                       headline (the page's single h1)
 *   - <p> AFTER the h1           description
 *   - <p><strong><a>             optional CTA(s) after the description
 */

function wrapNode(node, className, tag = 'div') {
  const w = document.createElement(tag);
  w.className = className;
  w.append(node);
  return w;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .hero-type-one')) return;
  const media = block.querySelector('picture') || block.querySelector('img');
  const heading = block.querySelector('h1, h2, h3');
  const flows = [...block.querySelectorAll('p, ul, ol')]
    .filter((el) => !el.querySelector('picture, img') && !el.closest('li'));

  const order = [...block.querySelectorAll('*')];
  const crumbs = heading
    ? flows.filter((el) => order.indexOf(el) < order.indexOf(heading)) : [];
  const after = flows.filter((el) => !crumbs.includes(el));
  const ctas = after.filter((el) => el.tagName === 'P' && el.querySelector('a')
    && el.textContent.trim() === el.querySelector('a').textContent.trim());
  const descs = after.filter((el) => !ctas.includes(el));

  const article = document.createElement('article');
  article.className = 'hero-type-one';

  if (media) article.append(wrapNode(media, 'hero-bg'));

  if (crumbs.length) {
    const nav = document.createElement('nav');
    nav.className = 'hero-breadcrumbs';
    nav.setAttribute('aria-label', 'Breadcrumb');
    nav.append(...crumbs);
    article.append(nav);
  }

  const content = document.createElement('div');
  content.className = 'hero-content';
  const text = document.createElement('div');
  text.className = 'hero-text-content';
  if (heading) text.append(wrapNode(heading, 'headline'));
  if (descs.length) {
    const d = document.createElement('div');
    d.className = 'hero-desc';
    d.append(...descs);
    text.append(d);
  }
  if (ctas.length) {
    const a = document.createElement('div');
    a.className = 'hero-actions';
    a.append(...ctas);
    text.append(a);
  }
  content.append(text);
  article.append(content);

  block.replaceChildren(article);
}
