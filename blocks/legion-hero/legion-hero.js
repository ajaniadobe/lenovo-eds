/**
 * legion-hero — live section.legion-hero (us/en/legion): full-bleed looping brand video over a
 * poster image with a bottom fade, the Legion wordmark, a visually-hidden H1, a primary CTA, an
 * optional OS badge (top-right) and a pause/play control.
 * Template-slotted, classified by content (never by row index):
 *   - picture-only cell (or one with a    media: the picture = poster/still; an optional
 *     YouTube link)                       YouTube link plays the loop over it (muted)
 *   - cell with a heading                 copy: picture = wordmark, heading (H1), link = CTA
 *   - any other cell with a picture       badge: picture + link (the badge target)
 * @ew-exempt control label: the pause/play button label is runtime chrome
 */

function wrap(className, ...nodes) {
  const d = document.createElement('div');
  d.className = className;
  d.append(...nodes);
  return d;
}

const isVideo = (a) => /youtube(-nocookie)?\.com|youtu\.be/.test(a.href);

function youtubeId(href) {
  const m = href.match(/(?:embed\/|v=|youtu\.be\/)([\w-]{6,})/);
  return m ? m[1] : null;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .legion-hero-media')) return;
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const videoCell = cells.find((c) => [...c.querySelectorAll('a')].some(isVideo))
    || cells.find((c) => c.querySelector('picture, img') && !c.textContent.trim());
  const copyCell = cells.find((c) => c !== videoCell && c.querySelector('h1, h2'));
  const badgeCell = cells.find((c) => c !== videoCell && c !== copyCell && c.querySelector('picture, img'));

  const media = wrap('legion-hero-media');
  let videoLink = null;
  if (videoCell) {
    const poster = videoCell.querySelector('picture') || videoCell.querySelector('img');
    if (poster) media.append(poster);
    videoLink = [...videoCell.querySelectorAll('a')].find(isVideo);
    if (videoLink) media.append(wrap('legion-hero-video-link', videoLink.closest('p') || videoLink));
  }

  const content = wrap('legion-hero-content');
  if (copyCell) {
    const logo = copyCell.querySelector('picture') || copyCell.querySelector('img');
    const heading = copyCell.querySelector('h1, h2');
    const cta = copyCell.querySelector('a');
    if (logo) content.append(wrap('legion-hero-logo', logo));
    heading.classList.add('legion-hero-title');
    content.append(heading);
    if (cta) {
      cta.className = 'legion-hero-cta';
      content.append(wrap('legion-hero-actions', cta.closest('p') || cta));
    }
  }

  const parts = [media, content];
  if (badgeCell) {
    const img = badgeCell.querySelector('picture') || badgeCell.querySelector('img');
    const a = badgeCell.querySelector('a');
    const badge = wrap('legion-hero-badge');
    if (a) {
      a.classList.add('legion-hero-badge-link');
      a.setAttribute('aria-label', a.textContent.trim());
      const label = document.createElement('span');
      label.className = 'legion-hero-badge-label';
      label.append(...a.childNodes);
      a.append(img, label);
      badge.append(a.closest('p') || a);
    } else badge.append(img);
    parts.push(badge);
  }

  const id = videoLink && youtubeId(videoLink.href);
  if (id) {
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'legion-hero-toggle';
    toggle.setAttribute('aria-label', 'Pause video');
    parts.push(toggle);
    const load = () => {
      const iframe = document.createElement('iframe');
      iframe.className = 'legion-hero-iframe';
      iframe.title = videoLink.textContent.trim();
      iframe.allow = 'autoplay; encrypted-media';
      iframe.tabIndex = -1;
      iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&controls=0`
        + `&playsinline=1&playlist=${id}&modestbranding=1&rel=0&iv_load_policy=3&enablejsapi=1`;
      iframe.addEventListener('load', () => iframe.classList.add('is-ready'));
      media.append(iframe);
      let playing = true;
      toggle.addEventListener('click', () => {
        playing = !playing;
        iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: playing ? 'playVideo' : 'pauseVideo', args: [] }), '*');
        toggle.classList.toggle('paused', !playing);
        toggle.setAttribute('aria-label', playing ? 'Pause video' : 'Play video');
      });
    };
    if (document.readyState === 'complete') setTimeout(load, 1500);
    else window.addEventListener('load', () => setTimeout(load, 1500), { once: true });
  }
  block.replaceChildren(...parts);
}
