/**
 * home-hero — home page hero carousel (live cmp-carousel.motion-carousel).
 * Schema: stardust/eds-schema/index.json, section `home-hero`.
 * Decode tier: reconstructive per slide (repeat group), template-slotted inside a slide.
 *
 * Authoring: one row per slide, three cells —
 *   1. wordmark image (optional; leave the cell empty when the slide has none)
 *   2. copy: heading (the FIRST slide authors the page <h1>, later slides <h2>), body <p>,
 *      CTA paragraphs — **bold** link = filled button, *italic* link = text link
 *   3. media image
 * Cells are classified by content, not by index: images before the heading fill the
 * wordmark slot, images after it fill the media slot.
 *
 * Behaviour (captureState restoreAtDelivery): autoplay every 5000 ms with a progress-track
 * fill, prev/next arrows, pause/play toggle; autoplay pauses while the hero is off-screen.
 * Autoplay arms on the visitor's first interaction (wheel, pointer, touch, key), as measured
 * on the source: a headless load with no interaction stays on slide 1 for 23 s+.
 */

const DELAY = 5000;

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

function div(className) {
  const d = document.createElement('div');
  d.className = className;
  return d;
}

// Every authored element of a row, cell by cell (DA keeps a <p> per text run).
function collectNodes(row) {
  const out = [];
  [...row.children].forEach((cell) => {
    let kids = [...cell.children];
    if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].querySelector('picture, img')
      && kids[0].children.length > 1) {
      kids = [...kids[0].children];
    }
    if (kids.length) out.push(...kids);
    else if (cell.textContent.trim()) {
      // HARNESS-ONLY fallback (EW5): bare text in a cell; DA always wraps text in <p>.
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      out.push(p);
    }
  });
  return out;
}

const isMedia = (n) => n.matches('picture, img') || (!!n.querySelector('picture, img') && !n.querySelector('a'));

function buildSlide(row) {
  const nodes = collectNodes(row);
  if (!nodes.length) return null;
  const slide = div('hero-slide');
  slide.innerHTML = `<div class="hero-inner"><div class="hero-copy"><div class="wordmark"></div>
    <div class="titles"></div><div class="actions"></div></div><div class="media"></div></div>`;
  const wordmark = slide.querySelector('.wordmark');
  const titles = slide.querySelector('.titles');
  const actions = slide.querySelector('.actions');
  const media = slide.querySelector('.media');
  const heading = nodes.find((n) => /^H[1-6]$/.test(n.tagName));
  let afterHeading = !heading;
  nodes.forEach((n) => {
    if (n === heading) {
      titles.append(wrapNode(n, 'headline'));
      afterHeading = true;
    } else if (isMedia(n)) {
      (afterHeading ? media : wordmark).append(n);
    } else if (n.querySelector('a')) {
      actions.append(n);
    } else {
      titles.append(wrapNode(n, 'body'));
    }
  });
  // a lone image authored before the heading with no media after it is the media
  if (!media.children.length && wordmark.children.length === 1) {
    media.append(...wordmark.childNodes);
  }
  const wm = wordmark.querySelector('img');
  if (wm) {
    const w = Number(wm.getAttribute('width')) || wm.naturalWidth;
    const h = Number(wm.getAttribute('height')) || wm.naturalHeight;
    if (w && h && h / w > 0.5) wordmark.classList.add('wordmark-tall');
  } else {
    wordmark.classList.add('wordmark-empty');
  }
  if (!actions.children.length) actions.remove();
  return slide;
}

const CONTROLS = `
  <div class="arrows">
    <button class="icon-btn" type="button" aria-label="Go to Previous Slide" data-dir="-1">
      <span class="len-icon-image ic-arrow-left" aria-hidden="true"></span></button>
    <button class="icon-btn" type="button" aria-label="Go to Next Slide" data-dir="1">
      <span class="len-icon-image ic-arrow-right" aria-hidden="true"></span></button>
  </div>
  <div class="bar"><div class="bar-fill"></div></div>
  <button class="icon-btn play" type="button" aria-label="Autoplay the Carousel" hidden>
    <span class="len-icon-image ic-play" aria-hidden="true"></span></button>
  <button class="icon-btn pause" type="button" aria-label="Pause autoplay on the Carousel">
    <span class="len-icon-image ic-pause" aria-hidden="true"></span></button>`;

function wire(block, track, slides) {
  const controls = div('hero-controls');
  controls.innerHTML = CONTROLS;
  block.append(controls);
  const fill = controls.querySelector('.bar-fill');
  let index = 0;
  let timer = null;
  let progress = null;
  let started = 0;
  let paused = false;
  let visible = false;
  let armed = false;

  const go = (n) => {
    index = (n + slides.length) % slides.length;
    track.style.transform = `translateX(${-100 * index}%)`;
    slides.forEach((s, k) => {
      s.classList.toggle('is-active', k === index);
      if (k === index) s.removeAttribute('inert');
      else s.setAttribute('inert', '');
    });
  };
  const stop = () => {
    clearInterval(timer);
    clearInterval(progress);
    timer = null;
    progress = null;
    fill.style.width = '0';
  };
  const run = () => {
    stop();
    if (paused || !visible || !armed || slides.length < 2) return;
    started = Date.now();
    timer = setInterval(() => {
      go(index + 1);
      started = Date.now();
    }, DELAY);
    progress = setInterval(() => {
      fill.style.width = `${Math.min(1, (Date.now() - started) / DELAY) * 100}%`;
    }, 100);
  };

  controls.querySelectorAll('[data-dir]').forEach((btn) => {
    btn.addEventListener('click', () => {
      go(index + Number(btn.dataset.dir));
      run();
    });
  });
  const pause = controls.querySelector('.pause');
  const play = controls.querySelector('.play');
  pause.addEventListener('click', () => {
    paused = true;
    stop();
    pause.hidden = true;
    play.hidden = false;
    play.focus();
  });
  play.addEventListener('click', () => {
    paused = false;
    run();
    play.hidden = true;
    pause.hidden = false;
    pause.focus();
  });

  go(0);
  const arm = () => {
    if (armed) return;
    armed = true;
    run();
  };
  ['wheel', 'pointerdown', 'touchstart', 'keydown'].forEach((type) => {
    window.addEventListener(type, arm, { once: true, passive: true });
  });
  controls.querySelectorAll('button').forEach((b) => b.addEventListener('click', arm));
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        visible = e.isIntersecting;
        if (visible) run();
        else stop();
      });
    }, { threshold: 0.5 }).observe(block);
  } else {
    visible = true;
    run();
  }
}

export default function decorate(block) {
  const rows = [...block.children];
  const slides = rows.map(buildSlide).filter(Boolean);
  if (!slides.length) return;
  const track = div('hero-track');
  slides.forEach((s, i) => {
    s.setAttribute('role', 'group');
    s.setAttribute('aria-roledescription', 'slide');
    s.setAttribute('aria-label', `Slide ${i + 1} of ${slides.length}`);
    track.append(s);
  });
  block.setAttribute('aria-roledescription', 'carousel');
  block.replaceChildren(track);
  wire(block, track, slides);
}
