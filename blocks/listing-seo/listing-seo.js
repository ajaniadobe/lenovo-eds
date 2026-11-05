/**
 * listing-seo — deals DLP long-form SEO copy (live AccessoryPageBottom infoList /
 * wpc-seo-bottom-content): the title and the copy share one clipped box, faded at the bottom,
 * opened by "Read More". Reconstructive for the copy (any mix of h2 / h3 / p / ul / ol).
 *
 * Authoring: one cell; the first heading is the section title (always shown, never clipped),
 * every other element is copy, in authored order. Initial state is collapsed (capture state).
 *
 * @ew-exempt widget chrome — the "Read More" / "Read Less" toggle label is a fixed UI string
 */

let seq = 0;

export default function decorate(block) {
  if (block.querySelector(':scope > .listing-seo-box')) return;
  const nodes = [...block.querySelectorAll(':scope > div > div > *')];
  const title = nodes.find((n) => /^H[1-6]$/.test(n.tagName));
  seq += 1;
  const box = document.createElement('div');
  box.className = 'listing-seo-box';
  const copy = document.createElement('div');
  copy.className = 'listing-seo-copy';
  copy.id = `listing-seo-${seq}`;
  copy.append(...nodes.filter((n) => n !== title));
  box.append(copy);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'listing-seo-more';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', copy.id);
  const label = document.createElement('span');
  label.textContent = 'Read More';
  btn.append(label);
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    box.classList.toggle('open', !open);
    label.textContent = open ? 'Read More' : 'Read Less';
  });
  const head = document.createElement('div');
  head.className = 'listing-seo-title';
  if (title) head.append(title);
  block.replaceChildren(head, box, btn);
}
