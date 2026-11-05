/**
 * ai-copilot — image + text row on the Copilot gradient band with a white pill CTA
 * (live horizontal-default-pc, Copilot+ PC promo). Template-slotted.
 * Schema: stardust/eds-schema/us-en-ai-pcs.json section 8.
 *
 * Authoring (classified by content, any row/cell shape):
 *   - <picture>/<img>   the image (editorial)
 *   - <h2>/<h3>         title
 *   - <p>/<ul>          body copy (no subtitle tier in this band)
 *   - <p><strong><a>    CTA(s) — rendered as white pills
 *
 * @variants block: reverse (image right; default image left)
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
  if (block.querySelector(':scope > .copilot-pc')) return;
  const media = block.querySelector('picture') || block.querySelector('img');
  const heading = block.querySelector('h1, h2, h3, h4');
  const flows = [...block.querySelectorAll('p, ul, ol')]
    .filter((el) => !el.querySelector('picture, img') && !el.closest('li'));
  const ctas = flows.filter(isCta);
  const body = flows.filter((el) => !isCta(el));

  const pc = document.createElement('div');
  pc.className = 'copilot-pc';
  const image = document.createElement('div');
  image.className = 'copilot-image';
  if (media) image.append(media);

  const content = document.createElement('div');
  content.className = 'copilot-content';
  if (heading) content.append(wrapNode(heading, 'copilot-title'));
  if (body.length) {
    const b = document.createElement('div');
    b.className = 'copilot-body';
    b.append(...body);
    content.append(b);
  }
  if (ctas.length) {
    const a = document.createElement('div');
    a.className = 'copilot-actions';
    a.append(...ctas);
    content.append(a);
  }
  pc.append(image, content);
  block.replaceChildren(pc);
}
