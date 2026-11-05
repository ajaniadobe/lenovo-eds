/**
 * ai-intro — centred section title + lede over a full-width image (live layout-title +
 * vertical-default-pc). Template-slotted.
 * Schema: stardust/eds-schema/us-en-ai-pcs.json section 1.
 *
 * Authoring (classified by content): <h2> title, <p> lede(s), <picture>/<img> image,
 * optional <p> CTAs (a paragraph that is only a link) — rendered under the image.
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .layout-title')) return;
  const heading = block.querySelector('h1, h2, h3, h4');
  const media = block.querySelector('picture') || block.querySelector('img');
  const flows = [...block.querySelectorAll('p, ul, ol')]
    .filter((el) => !el.querySelector('picture, img') && !el.closest('li'));
  const isCta = (el) => el.tagName === 'P' && el.querySelector('a')
    && el.textContent.trim() === el.querySelector('a').textContent.trim();

  const title = document.createElement('div');
  title.className = 'layout-title';
  if (heading) title.append(wrapNode(heading, 'headline'));
  const lede = document.createElement('div');
  lede.className = 'lede';
  lede.append(...flows.filter((el) => !isCta(el)));
  if (lede.children.length) title.append(lede);

  const pc = document.createElement('div');
  pc.className = 'vertical-default-pc';
  const img = document.createElement('div');
  img.className = 'vertical-default-image';
  if (media) img.append(media);
  const content = document.createElement('div');
  content.className = 'vertical-default-content';
  content.append(...flows.filter(isCta));
  pc.append(img, content);

  block.replaceChildren(title, pc);
}
