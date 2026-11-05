/* listing archetype — hero CTA scrolls to the product list; sort select + facet toggles (initial state = as captured) */
(function () {
  document.querySelectorAll('[data-scroll-to]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var t = document.getElementById(btn.getAttribute('data-scroll-to'));
      if (t) t.scrollIntoView({ behavior: 'smooth' });
    });
  });
  var sel = document.querySelector('.dlp .default_select');
  if (sel) sel.addEventListener('click', function () {
    var open = sel.getAttribute('aria-expanded') === 'true';
    sel.setAttribute('aria-expanded', String(!open));
    sel.setAttribute('aria-label', 'Sort by Newest Dropdown ' + (open ? 'Collapsed' : 'Expanded'));
    sel.nextElementSibling.hidden = open;
  });
  document.querySelectorAll('.dlp .normal_image[data-href]').forEach(function (b) { b.addEventListener('click', function () { window.location.href = b.getAttribute('data-href'); }); });
  document.querySelectorAll('.dlp .learn-more').forEach(function (more) {
    more.addEventListener('click', function () {
      var list = more.parentElement;
      var hidden = list.querySelectorAll('.item-lists-group[hidden]');
      if (hidden.length) { hidden.forEach(function (li) { li.hidden = false; li.dataset.more = '1'; }); more.textContent = 'See Less'; }
      else { list.querySelectorAll('[data-more]').forEach(function (li) { li.hidden = true; }); more.textContent = 'See More'; }
    });
  });
})();
