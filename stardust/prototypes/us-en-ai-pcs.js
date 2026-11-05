/* us-en-ai-pcs — FAQ accordion + SEO "Read More" toggle (initial state = collapsed, as captured) */
(function () {
  document.querySelectorAll('.x-cms-ai-ofp-fe-2c-accordion__tab-label').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (panel) panel.hidden = open;
    });
  });
  var more = document.querySelector('.ai-seo .readMore');
  if (more) more.addEventListener('click', function () {
    var open = more.getAttribute('aria-expanded') === 'true';
    more.setAttribute('aria-expanded', String(!open));
    document.getElementById('ai-seo-copy').style.height = open ? '' : 'auto';
    more.querySelector('.readTab').textContent = open ? 'Read More' : 'Read Less';
  });
})();
