/**
 * legion-headline — centred section headline (live .blade-3-title "Choose Your Weapon").
 * Variant `backdrop`: a row holding only a picture becomes the background of the whole
 * section (live #blade-3 paints one texture behind the headline, features, carousels and
 * cards that follow), so the following blocks of the section sit on it.
 * Classified by content: picture-only row = backdrop; heading row = title + subtitle.
 */

function wrap(className, ...nodes) {
  const d = document.createElement('div');
  d.className = className;
  d.append(...nodes);
  return d;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .legion-headline-title')) return;
  const rows = [...block.children];
  const title = wrap('legion-headline-title');
  rows.forEach((r) => {
    const p = r.querySelector('picture') || r.querySelector('img');
    if (p && !r.textContent.trim()) {
      const section = block.closest('.section');
      // the texture covers a ~5000px-tall section: always take the full-width rendition
      // (the phone 750px one upscales into a visibly blurred grain)
      p.querySelectorAll('source[media]').forEach((s) => s.removeAttribute('media'));
      const bg = wrap('legion-headline-backdrop', p);
      if (section && block.classList.contains('backdrop')) {
        section.classList.add('legion-headline-backdrop-section');
        section.prepend(bg);
      } else block.before(bg);
      return;
    }
    title.append(...r.querySelectorAll(':scope > div > *'));
  });
  block.replaceChildren(title);
}
