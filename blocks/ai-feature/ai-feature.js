/**
 * ai-feature — image + text row on a tinted band (live horizontal-default-pc). Template-slotted.
 * Schema: stardust/eds-schema/us-en-ai-pcs.json sections 2–5.
 *
 * Authoring (classified by content, any row/cell shape):
 *   - <picture>/<img>   the image (editorial)
 *   - <h2>/<h3>         title
 *   - first <p> after the title   subtitle (24px)
 *   - further <p>/<ul>  body copy
 *   - <p><strong><a>    optional CTA(s) (a paragraph that is only a link)
 *
 * @variants block: blue | pink (default none — white band); reverse (image right)
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
  if (block.querySelector(':scope > .feature-pc')) return;
  const media = block.querySelector('picture') || block.querySelector('img');
  const heading = block.querySelector('h1, h2, h3, h4');
  const flows = [...block.querySelectorAll('p, ul, ol')]
    .filter((el) => !el.querySelector('picture, img') && !el.closest('li'));
  const ctas = flows.filter(isCta);
  const texts = flows.filter((el) => !isCta(el));
  const subtitle = texts.find((el) => el.tagName === 'P');
  const body = texts.filter((el) => el !== subtitle);

  const pc = document.createElement('div');
  pc.className = 'feature-pc';
  const image = document.createElement('div');
  image.className = 'feature-image';
  if (media) image.append(media);

  const content = document.createElement('div');
  content.className = 'feature-content';
  if (heading) content.append(wrapNode(heading, 'feature-title'));
  if (subtitle) content.append(wrapNode(subtitle, 'feature-subtitle'));
  if (body.length) {
    const b = document.createElement('div');
    b.className = 'feature-body';
    b.append(...body);
    content.append(b);
  }
  if (ctas.length) {
    const a = document.createElement('div');
    a.className = 'feature-actions';
    a.append(...ctas);
    content.append(a);
  }
  pc.append(image, content);
  block.replaceChildren(pc);
}
