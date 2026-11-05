/**
 * ai-seo — long-form SEO copy collapsed behind "Read More" (live infoList /
 * wpc-seo-bottom-content). Reconstructive for the copy (any mix of p / h3 / ul / ol).
 * Schema: stardust/eds-schema/us-en-ai-pcs.json section 10.
 *
 * Authoring: the first heading is the section title (<h2>); every other element is the
 * copy, in authored order. Initial state is collapsed (capture state); the toggle opens it.
 * The toggle label ("Read More" / "Read Less") is a runtime control label generated here.
 */

let seq = 0;

export default function decorate(block) {
  if (block.querySelector(':scope > .info-list')) return;
  const title = block.querySelector('h1, h2, h3');
  const copy = [...block.querySelectorAll(':scope > div > div > *')]
    .filter((el) => el !== title);

  const list = document.createElement('div');
  list.className = 'info-list';
  if (title) {
    const t = document.createElement('div');
    t.className = 'info-title';
    t.append(title);
    list.append(t);
  }
  seq += 1;
  const less = document.createElement('div');
  less.className = 'less';
  less.id = `ai-seo-copy-${seq}`;
  const content = document.createElement('div');
  content.className = 'seo-content';
  content.append(...copy);
  less.append(content);
  list.append(less);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'read-more';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', less.id);
  const label = document.createElement('span');
  label.className = 'read-tab';
  label.textContent = 'Read More';
  const arrow = document.createElement('span');
  arrow.className = 'read-arrow';
  arrow.setAttribute('aria-hidden', 'true');
  btn.append(label, arrow);
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    less.classList.toggle('open', !open);
    label.textContent = open ? 'Read More' : 'Read Less';
  });
  list.append(btn);

  block.replaceChildren(list);
}
