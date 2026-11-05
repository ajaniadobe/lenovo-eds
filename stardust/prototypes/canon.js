/* Lenovo US replica — minimal behaviour for canon chrome + shared widgets.
   Initial state is static in the markup; this only wires the controls the
   live page exposes (promo strip arrows, hero carousel, card rails, tabs). */
(function () {
  'use strict';

  // Phone variant of the commonHeader: the live site swaps these nodes in JS
  // at load on narrow viewports (observed at 360: expand toggles + short store label).
  if (window.matchMedia && window.matchMedia('(max-width: 749px)').matches) {
    var sup = document.querySelector('.commonHeader .sup_nav');
    if (sup && !sup.querySelector('.expand-icon')) {
      sup.insertAdjacentHTML('afterbegin', '<li class="nav_item nav_expand_item"><button class="expand-icon iconfont-arrowDown" type="button" aria-label="nav expand menu" aria-expanded="true"></button></li>');
    }
    var seg = document.querySelector('.commonHeader .segment_nav_container');
    if (seg && !seg.querySelector('.expand-icon')) {
      seg.insertAdjacentHTML('afterbegin', '<li class="nav_item segmentItem segment-toggle"><button class="expand-icon iconfont-arrowDown" type="button" aria-label="nav collapse segment" aria-expanded="false"></button></li>');
    }
    var store = document.querySelector('.commonHeader .utility_nav_item_store_icon a p');
    if (store) store.innerHTML = '<strong>Lenovo Pro</strong>&nbsp;Business Store';
    var acct = document.querySelector('.commonHeader .account-label');
    if (acct) acct.remove();
  }

  // lazy images (mirrors the live lazyload: src is set once the image intersects the viewport,
  // so carousel items clipped off-canvas stay unloaded exactly as on the source)
  var lazy = document.querySelectorAll('img.lazy-io');
  function load(img) {
    var pic = img.parentElement && img.parentElement.tagName === 'PICTURE' ? img.parentElement : null;
    if (pic) pic.querySelectorAll('source[data-srcset]').forEach(function (s) { s.srcset = s.getAttribute('data-srcset'); s.removeAttribute('data-srcset'); });
    if (img.dataset.src) { img.src = img.dataset.src; img.removeAttribute('data-src'); }
    img.classList.remove('lazy-io');
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { load(e.target); io.unobserve(e.target); } });
    }, { rootMargin: '0px' });
    lazy.forEach(function (img) { io.observe(img); });
  } else { lazy.forEach(load); }

  // slider: translate a track by whole slides (promo strip, hero)
  function slider(root, trackSel, slideSel, prevSel, nextSel) {
    var track = root.querySelector(trackSel);
    if (!track) return null;
    var slides = Array.prototype.slice.call(track.querySelectorAll(slideSel));
    var i = 0;
    function go(n) {
      i = (n + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-100 * i) + '%)';
      slides.forEach(function (s, k) {
        if (k === i) { s.removeAttribute('inert'); s.classList.add('is-active'); } else { s.setAttribute('inert', ''); s.classList.remove('is-active'); }
      });
    }
    var prev = prevSel && root.querySelector(prevSel);
    var next = nextSel && root.querySelector(nextSel);
    if (prev) prev.addEventListener('click', function () { go(i - 1); });
    if (next) next.addEventListener('click', function () { go(i + 1); });
    return { go: go, index: function () { return i; }, count: slides.length };
  }

  // autoplay only while the carousel is on screen (timer restarts on re-entry), as observed live
  function autoplay(el, delay, tick, onProgress) {
    var timer = null; var prog = null; var start = 0; var paused = false;
    function stop() { clearInterval(timer); clearInterval(prog); timer = prog = null; if (onProgress) onProgress(0); }
    function run() {
      stop(); if (paused) return;
      start = Date.now();
      timer = setInterval(function () { tick(); start = Date.now(); }, delay);
      if (onProgress) prog = setInterval(function () { onProgress(Math.min(1, (Date.now() - start) / delay)); }, 100);
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) run(); else stop(); }); }, { threshold: 0.5 }).observe(el);
    } else run();
    return { pause: function (p) { paused = p; if (p) stop(); else run(); }, restart: run };
  }

  document.querySelectorAll('[data-carousel="promo"]').forEach(function (el) {
    var s = slider(el, '.swiper-wrapper', '.merchandizingItem', '.preInfoBtn', '.nextInfoBtn');
    var status = el.querySelector('.sr-only');
    var prev = el.querySelector('.preInfoBtn'); var next = el.querySelector('.nextInfoBtn');
    function label() {
      var n = s.index() + 1;
      if (status) status.textContent = ' Currently displaying item ' + n + ' of ' + s.count;
      if (prev) prev.setAttribute('aria-label', 'Previous information, currently displaying item ' + n + ' of ' + s.count);
      if (next) next.setAttribute('aria-label', 'Next information, currently displaying item ' + n + ' of ' + s.count);
    }
    [prev, next].forEach(function (b) { if (b) b.addEventListener('click', label); });
    // live rotates the strip on a timer (idle class mutations observed); data-cmp-delay 5000 is the page's carousel delay
    autoplay(el, 5000, function () { s.go(s.index() + 1); label(); });
  });

  document.querySelectorAll('[data-carousel="hero"]').forEach(function (el) {
    var s = slider(el, '.home-hero__track', '.home-hero__slide', '[data-dir="-1"]', '[data-dir="1"]');
    var bar = el.querySelector('.carousel-controls__track');
    var ap = autoplay(el, 5000, function () { s.go(s.index() + 1); }, function (p) { if (bar) bar.style.width = (p * 100) + '%'; });
    el.querySelectorAll('[data-dir]').forEach(function (b) { b.addEventListener('click', function () { ap.restart(); }); });
    var pause = el.querySelector('.carousel-controls__pause'); var play = el.querySelector('.carousel-controls__play');
    if (pause && play) {
      pause.addEventListener('click', function () { ap.pause(true); pause.hidden = true; play.hidden = false; play.focus(); });
      play.addEventListener('click', function () { ap.pause(false); play.hidden = true; pause.hidden = false; pause.focus(); });
    }
  });

  // prompt group: a prompt reveals its results panel; Start Over returns to the prompt list
  document.querySelectorAll('.prompt').forEach(function (el) {
    var results = el.querySelectorAll('.prompt-result');
    var labels = Array.prototype.map.call(el.querySelectorAll('.prompt__list .prompt__btn.visible-desktop'), function (b) { return b.getAttribute('title'); });
    function show(title) {
      var i = labels.indexOf(title); if (i < 0) return;
      el.classList.add('is-selected');
      results.forEach(function (r, k) { r.hidden = k !== i; });
      el.querySelectorAll('.prompt__results-prompts .prompt__btn').forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('title') === title); b.tabIndex = 0; });
      var img = results[i] && results[i].querySelector('img[data-src]');
      if (img) { img.src = img.getAttribute('data-src'); img.removeAttribute('data-src'); }
    }
    el.querySelectorAll('.prompt__btn').forEach(function (b) { b.addEventListener('click', function () { show(b.getAttribute('title')); }); });
    var restart = el.querySelector('.prompt__restart');
    if (restart) restart.addEventListener('click', function () { el.classList.remove('is-selected'); results.forEach(function (r) { r.hidden = true; }); });
  });

  // card rails: step one card per click
  document.querySelectorAll('[data-carousel="cards"]').forEach(function (el) {
    var track = el.querySelector('.img-cards--rail');
    if (!track) return;
    var cards = track.children;
    var i = 0;
    function maxIndex() {
      var vis = Math.floor(el.querySelector('.card-rail').clientWidth / cards[0].getBoundingClientRect().width);
      return Math.max(0, cards.length - Math.max(1, vis));
    }
    function go(n) {
      i = Math.max(0, Math.min(n, maxIndex()));
      track.style.transform = 'translateX(' + (-cards[0].getBoundingClientRect().width * i) + 'px)';
      var bar = el.querySelector('.carousel-controls__track');
      if (bar) bar.style.width = (maxIndex() ? (100 * i / maxIndex()) : 0) + '%';
    }
    el.querySelector('[data-dir="-1"]').addEventListener('click', function () { go(i - 1); });
    el.querySelector('[data-dir="1"]').addEventListener('click', function () { go(i + 1); });
  });

  // tabs
  document.querySelectorAll('[data-tabs]').forEach(function (el) {
    var tabs = Array.prototype.slice.call(el.querySelectorAll('[role="tab"]'));
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        tabs.forEach(function (o) {
          var on = o === t;
          o.classList.toggle('is-active', on);
          o.setAttribute('aria-selected', on ? 'true' : 'false');
          o.tabIndex = on ? 0 : -1;
          var p = document.getElementById(o.getAttribute('aria-controls'));
          if (p) { p.hidden = !on; p.classList.toggle('is-active', on); }
        });
      });
    });
  });
}());
