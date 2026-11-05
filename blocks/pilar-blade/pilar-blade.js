/**
 * pilar-blade — full-bleed background image with an overlay card (live pilar_blade,
 * "Ghost" card style): headline, description paragraphs, pill CTA. Template-slotted.
 * Schema: stardust/eds-schema/us-en-ai-pcs.json section 9.
 *
 * Authoring (classified by content, any row/cell shape):
 *   - <picture>/<img>               background image (editorial)
 *   - first text paragraph (or a heading)  headline
 *   - further <p>/<ul>              description (a <strong> paragraph = bold lead line)
 *   - <p><strong><a>                CTA pill(s) (a paragraph that is only a link)
 * Blank spacer paragraphs of the source are modelled as CSS paragraph gaps.
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

const isCta = (el) => el.tagName === 'P' && el.querySelector('a')
  && el.textContent.trim() === el.querySelector('a').textContent.trim();

export default function decorate(block) {
  if (block.querySelector(':scope > .overlay-card')) return;
  const media = block.querySelector('picture') || block.querySelector('img');
  const heading = block.querySelector('h1, h2, h3, h4');
  const flows = [...block.querySelectorAll('p, ul, ol')]
    .filter((el) => !el.querySelector('picture, img') && !el.closest('li'));
  const ctas = flows.filter(isCta);
  const texts = flows.filter((el) => !isCta(el) && el.textContent.trim());
  const headline = heading || texts.find((el) => el.tagName === 'P');
  const desc = texts.filter((el) => el !== headline);

  const bg = document.createElement('div');
  bg.className = 'background-image';
  if (media) bg.append(media);

  const card = document.createElement('div');
  card.className = 'overlay-card';
  const pre = document.createElement('div');
  pre.className = 'overlay-pre-headline';
  card.append(pre);
  if (headline) card.append(wrapNode(headline, 'overlay-headline'));
  if (desc.length) {
    const d = document.createElement('div');
    d.className = 'overlay-description';
    d.append(...desc);
    card.append(d);
  }
  if (ctas.length) {
    const a = document.createElement('div');
    a.className = 'cta-btns';
    a.setAttribute('role', 'group');
    a.append(...ctas);
    card.append(a);
  }
  block.replaceChildren(bg, card);
}
