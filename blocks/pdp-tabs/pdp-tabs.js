/**
 * pdp-tabs — jump links to the product page sections.
 * Authoring: one cell — an optional (visually hidden) <h2> and a <ul> of in-page links
 * (<a href="#features">…). The captured active item is authored in <strong>.
 */
export default function decorate(block) {
  if (block.querySelector(':scope > .pdp-tabs-inner')) return;
  const inner = document.createElement('div');
  inner.className = 'pdp-tabs-inner';
  const heading = block.querySelector('h1, h2, h3, h4, h5, h6');
  const list = block.querySelector('ul, ol');
  if (heading) inner.append(heading);
  if (list) {
    inner.append(list);
    list.querySelectorAll(':scope > li').forEach((li) => {
      if (li.querySelector('strong')) {
        li.classList.add('is-active');
        li.querySelector('a')?.setAttribute('aria-current', 'true');
      }
      li.querySelector('a')?.addEventListener('click', () => {
        list.querySelectorAll(':scope > li').forEach((x) => {
          x.classList.remove('is-active');
          x.querySelector('a')?.removeAttribute('aria-current');
        });
        li.classList.add('is-active');
        li.querySelector('a')?.setAttribute('aria-current', 'true');
      });
    });
  }
  block.closest('.section')?.setAttribute('aria-label', 'Jump links');
  block.replaceChildren(inner);
}
