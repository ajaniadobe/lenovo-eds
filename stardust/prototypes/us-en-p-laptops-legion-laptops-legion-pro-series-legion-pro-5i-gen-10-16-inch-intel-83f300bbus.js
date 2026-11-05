// PDP page behaviours observed live: gallery thumbnails swap the stage image; jump tabs mark the active item;
// reviews tabs toggle. Header behaviours come from canon.js.
(() => {
  const g = document.querySelector('[data-gallery]');
  if (g) {
    const stage = g.querySelector('.pdp-gallery__img');
    g.querySelectorAll('.thumb[data-src]').forEach((t) => t.addEventListener('click', () => {
      g.querySelectorAll('.thumb').forEach((x) => x.classList.remove('is-active'));
      t.classList.add('is-active');
      stage.src = t.dataset.src; stage.alt = t.querySelector('img')?.alt || '';
    }));
  }
  document.querySelectorAll('.pdp-tabs a').forEach((a) => a.addEventListener('click', () => {
    document.querySelectorAll('.pdp-tabs li').forEach((li) => { li.classList.remove('is-active'); li.querySelector('a').removeAttribute('aria-current'); });
    a.parentElement.classList.add('is-active'); a.setAttribute('aria-current', 'true');
  }));
  document.querySelectorAll('.rv-tabs button').forEach((b, i, all) => b.addEventListener('click', () => {
    all.forEach((x) => { x.classList.toggle('is-active', x === b); x.setAttribute('aria-selected', String(x === b)); });
  }));
})();
// Offer links open the Lenovo Pro / Education dialogs (live: modal popups).
document.querySelectorAll('[data-dialog]').forEach((a) => a.addEventListener('click', (e) => {
  const d = document.getElementById(a.dataset.dialog); if (!d) return; e.preventDefault(); d.showModal();
}));
document.querySelectorAll('.pdp-dialog [data-close]').forEach((b) => b.addEventListener('click', () => b.closest('dialog').close()));
// Legal disclosure accordion (live: readView toggle).
document.querySelectorAll('.pdp-legal__toggle').forEach((b) => b.addEventListener('click', () => {
  const open = b.getAttribute('aria-expanded') === 'true'; b.setAttribute('aria-expanded', String(!open));
  document.getElementById(b.getAttribute('aria-controls')).hidden = open;
}));
