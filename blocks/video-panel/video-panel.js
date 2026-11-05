/**
 * video-panel — full-width campaign panel (live video-panel-carousel, single slide): background
 * image, a processor badge (logo + caption) top-right, centred headline / description / body /
 * pill CTA. Template-slotted, classified by content (never by row index):
 *   - cell holding a heading                 text cell: heading, then <p>s (first = description,
 *                                            others = body), a <p> that is only a link = CTA
 *   - cell holding a picture AND a <p>       badge (logo + caption)
 *   - first other picture                    background image
 */

function wrap(className, ...nodes) {
  const d = document.createElement('div');
  d.className = className;
  d.append(...nodes);
  return d;
}

const isCta = (p) => {
  const a = p.querySelector('a');
  return a && p.textContent.trim() === a.textContent.trim();
};

export default function decorate(block) {
  if (block.querySelector(':scope > .video-panel-slide')) return;
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const textCell = cells.find((c) => c.querySelector('h1, h2, h3'));
  const badgeCell = cells.find((c) => c !== textCell && c.querySelector('picture, img')
    && [...c.querySelectorAll('p')].some((p) => p.textContent.trim()));
  const bgCell = cells.find((c) => c !== textCell && c !== badgeCell && c.querySelector('picture, img'));

  const slide = wrap('video-panel-slide');
  if (bgCell) slide.append(wrap('video-panel-bg', bgCell.querySelector('picture') || bgCell.querySelector('img')));

  if (badgeCell) {
    const media = badgeCell.querySelector('picture') || badgeCell.querySelector('img');
    const caps = [...badgeCell.querySelectorAll('p')].filter((p) => p.textContent.trim());
    slide.append(wrap('video-panel-badge', wrap('video-panel-badge-img', media), wrap('video-panel-badge-text', ...caps)));
  }

  if (textCell) {
    const heading = textCell.querySelector('h1, h2, h3');
    const ps = [...textCell.querySelectorAll('p')].filter((p) => !p.closest('h1, h2, h3'));
    const ctas = ps.filter(isCta);
    const copy = ps.filter((p) => !ctas.includes(p));
    const content = wrap('video-panel-content', wrap('video-panel-headline', heading));
    if (copy[0]) content.append(wrap('video-panel-description', copy[0]));
    if (copy.length > 1) content.append(wrap('video-panel-text', ...copy.slice(1)));
    if (ctas.length) {
      ctas.forEach((p) => p.querySelector('a').classList.add('video-panel-cta'));
      content.append(wrap('video-panel-actions', ...ctas));
    }
    slide.append(content);
  }
  block.replaceChildren(slide);
}
