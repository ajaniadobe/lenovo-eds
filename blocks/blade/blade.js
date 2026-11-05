/**
 * blade — product-detail feature band (PDP "features" area). One block per band.
 * Schema: stardust/eds-schema/us-en-p-laptops-legion-laptops-legion-pro-series-
 *   legion-pro-5i-gen-10-16-inch-intel-83f300bbus.json (sections "blade").
 *
 * Authoring (flat, order-driven; one or more rows, cells are read as one stream):
 *   stack / split: [eyebrow <p>|<h3>] <h2> [desc <p>…] [CTA <p><a>] [<picture>] [caption <p>]
 *   cols:   optional head row (eyebrow <p> + <h2>), then one row per column:
 *           <picture> [caption <p>] <h3> desc <p>…
 *   slider: one row per slide: <h3> desc <p>… <picture>
 *   cards:  one row per card: <picture> eyebrow <p> <h3> desc <p> CTA <p><strong><a>
 *   Disclaimers inside a description are authored as <p><em>…</em></p>.
 *
 *   cols/slider units may open with a kicker heading (<h4>) right before the unit <h3>; text
 *   authored after the band <h2> and before the first unit's media stays in the head.
 *
 * @variants block: stack | text | full | cards | cols | split | slider | is-media-left |
 *   is-media-right | is-offset | has-cap | cols-3 | video | light | is-wide (default stack)
 */

// ── Experience Workspace helpers (EW1–EW4) — copied per block, no shared import ──
function wrapNode(node, className, tag = 'div') {
  const w = document.createElement(tag);
  w.className = className;
  w.append(node);
  return w;
}
const isMedia = (el) => el.matches('picture, img') || !!el.querySelector('picture, img');
const isHeading = (el) => /^H[1-6]$/.test(el.tagName);
const isLinkPara = (el) => el.tagName === 'P' && !!el.querySelector('a')
  && el.textContent.trim() === el.querySelector('a').textContent.trim();

function collectNodes(block) {
  const out = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    let kids = [...cell.children];
    if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].children.length
      && kids[0].querySelector('picture, img') && kids[0].childNodes.length > 1) {
      // HARNESS-ONLY (EW5): wrapTextNodes folded a media-led cell into one <p>
      kids = [...kids[0].childNodes].map((n) => {
        if (n.nodeType === 1) return n;
        if (n.textContent.trim()) {
          const p = document.createElement('p');
          p.append(n);
          return p;
        }
        return null;
      }).filter(Boolean);
    }
    if (kids.length) out.push(...kids);
    else if (cell.textContent.trim()) {
      // HARNESS-ONLY (EW5): bare text cell
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      out.push(p);
    }
  });
  return out;
}

const VARIANTS = ['cards', 'cols', 'split', 'slider'];

function buildText(nodes, { titleClass = 'blade-title' } = {}) {
  const text = document.createElement('div');
  text.className = 'blade-text';
  let seenHeading = false;
  let desc = null;
  nodes.forEach((n, i) => {
    // a heading directly followed by the band heading is its eyebrow (kicker heading)
    const kicker = !seenHeading && isHeading(n) && nodes[i + 1] && isHeading(nodes[i + 1]);
    if (isHeading(n) && isMedia(n) && !n.textContent.trim()) {
      text.append(wrapNode(n, 'blade-badge'));
    } else if (isHeading(n) && !kicker) {
      text.append(wrapNode(n, titleClass));
      seenHeading = true;
    } else if (!seenHeading) {
      text.append(wrapNode(n, 'eyebrow'));
    } else if (isLinkPara(n)) {
      text.append(wrapNode(n, 'blade-cta'));
    } else if (isMedia(n) && !n.textContent.trim() && text.querySelector('.blade-cta')) {
      // an image-only row after the CTA is a logo strip (certification badges)
      text.append(wrapNode(n, 'blade-logos'));
    } else {
      if (!desc) {
        desc = document.createElement('div');
        desc.className = 'blade-desc';
        text.append(desc);
      }
      desc.append(n);
    }
  });
  return text;
}

function buildMedia(media, caption, className) {
  const fig = document.createElement('figure');
  fig.className = className;
  fig.append(media);
  if (caption) fig.append(wrapNode(caption, 'blade-caption', 'figcaption'));
  return fig;
}

/** stack / split: text first, then media + caption */
function decorateBand(block, nodes) {
  const textNodes = [];
  let media = null;
  let caption = null;
  // the band picture is the last standalone media; earlier media (inline logo rows, a heading
  // holding only a badge image) stay with the text
  const bandMedia = [...nodes].reverse().find((n) => isMedia(n) && !isHeading(n));
  nodes.forEach((n) => {
    if (n === bandMedia) media = n;
    else if (media && !caption && n.tagName === 'P' && !isLinkPara(n)) caption = n;
    else textNodes.push(n);
  });
  const parts = [];
  if (textNodes.length) parts.push(buildText(textNodes));
  if (media) parts.push(buildMedia(media, caption, 'blade-media'));
  if (!textNodes.length && media) block.classList.add('full');
  block.replaceChildren(...parts);
}

/** cols / slider / cards: optional head, then units opened by their heading */
function segmentUnits(nodes, kind) {
  const head = [];
  const units = [];
  let pending = [];
  let cur = null;
  const headTag = nodes.some((n) => n.tagName === 'H2') ? 'H2' : null;
  let kicker = null;
  nodes.forEach((n, i) => {
    if (headTag && n.tagName === headTag) {
      head.push(...pending, n);
      pending = [];
      return;
    }
    // a heading directly followed by the unit heading is that unit's eyebrow (kicker)
    if (kind !== 'cards' && isHeading(n) && nodes[i + 1] && isHeading(nodes[i + 1])
      && nodes[i + 1].tagName !== headTag) {
      kicker = n;
      return;
    }
    if (isHeading(n)) {
      // text authored between the band heading and the first unit's media belongs to the head
      if (head.length && !units.length) {
        const firstMedia = pending.findIndex((p) => isMedia(p));
        if (firstMedia > 0) head.push(...pending.splice(0, firstMedia));
      }
      cur = {
        heading: n, media: null, caption: null, eyebrow: kicker ? [kicker] : [], desc: [], cta: [],
      };
      kicker = null;
      pending.forEach((p) => {
        if (isMedia(p) && !cur.media) cur.media = p;
        else if (kind === 'cards') cur.eyebrow.push(p);
        else if (cur.media && !cur.caption) cur.caption = p;
        else cur.desc.push(p);
      });
      pending = [];
      units.push(cur);
      return;
    }
    if (isMedia(n)) {
      if (cur && !cur.media && kind === 'slider') cur.media = n;
      else pending.push(n);
      return;
    }
    if (pending.length || !cur) {
      pending.push(n);
      return;
    }
    if (isLinkPara(n)) cur.cta.push(n);
    else cur.desc.push(n);
  });
  return { head, units, leftovers: pending };
}

function buildDots(count) {
  const dots = document.createElement('div');
  dots.className = 'dots';
  dots.setAttribute('role', 'tablist');
  for (let i = 0; i < count; i += 1) {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', `Slide ${i + 1} of ${count}`);
    b.setAttribute('aria-selected', String(i === 0));
    if (i === 0) b.classList.add('is-active');
    dots.append(b);
  }
  return dots;
}

function decorateUnits(block, nodes, kind) {
  const { head, units, leftovers } = segmentUnits(nodes, kind);
  const parts = [];
  if (head.length) parts.push(buildText(head));
  const track = document.createElement('ul');
  track.className = kind === 'cards' ? 'acc-cards' : 'cols-track';
  units.forEach((u) => {
    const li = document.createElement('li');
    if (kind === 'cards') {
      li.className = 'acc-card';
      if (u.media) li.append(wrapNode(u.media, 'acc-card-bg'));
      const text = document.createElement('div');
      text.className = 'acc-card-text';
      u.eyebrow.forEach((e) => text.append(wrapNode(e, 'acc-card-eyebrow')));
      text.append(wrapNode(u.heading, 'acc-card-title'));
      if (u.desc.length) {
        const d = document.createElement('div');
        d.className = 'acc-card-desc';
        d.append(...u.desc);
        text.append(d);
      }
      li.append(text);
      u.cta.forEach((c) => li.append(wrapNode(c, 'acc-card-cta')));
    } else {
      li.className = 'col';
      const kick = u.eyebrow.map((e) => wrapNode(e, 'col-eyebrow'));
      const title = wrapNode(u.heading, kind === 'slider' ? 'blade-title' : 'col-title');
      if (u.heading.textContent.length > 26 && kind !== 'slider') title.classList.add('is-sm');
      const desc = document.createElement('div');
      desc.className = kind === 'slider' ? 'blade-desc' : 'col-desc';
      desc.append(...u.desc, ...u.cta);
      const media = u.media ? buildMedia(u.media, u.caption, 'col-media') : null;
      if (kind === 'slider') {
        const text = document.createElement('div');
        text.className = 'col-text';
        text.append(...kick, title, desc);
        li.append(text);
        if (media) li.append(media);
      } else {
        if (media) li.append(media);
        li.append(...kick, title, desc);
      }
    }
    track.append(li);
  });
  // slider is frozen at its captured offset: the second slide is centred and shows its text
  if (kind === 'slider') {
    const lis = [...track.children];
    (lis[1] || lis[0])?.classList.add('is-current');
  }
  if (kind === 'cards') {
    parts.push(track);
    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'acc-next';
    next.setAttribute('aria-label', 'next');
    next.addEventListener('click', () => track.scrollBy({ left: 398, behavior: 'smooth' }));
    parts.push(next);
  } else {
    const view = document.createElement('div');
    view.className = 'cols-view';
    view.append(track);
    parts.push(view);
    if (kind === 'slider' || units.length > 4) parts.push(buildDots(units.length));
  }
  // leftovers pass: anything no slot consumed stays visible
  if (leftovers.length) {
    const rest = document.createElement('div');
    rest.className = 'blade-rest';
    rest.append(...leftovers);
    parts.push(rest);
  }
  block.replaceChildren(...parts);
}

export default function decorate(block) {
  if (block.dataset.bladeDecorated) return;
  const nodes = collectNodes(block);
  if (!nodes.length) return;
  const kind = VARIANTS.find((v) => block.classList.contains(v)) || 'stack';
  if (kind === 'stack') block.classList.add('stack');
  if (kind === 'stack' || kind === 'split') decorateBand(block, nodes);
  else decorateUnits(block, nodes, kind);
  if (block.classList.contains('video')) {
    // video band: the authored strong-only line after the caption is the play label
    const fig = block.querySelector('.blade-media');
    const label = [...block.querySelectorAll('.blade-desc > p')]
      .find((p) => p.children.length === 1 && p.firstElementChild.tagName === 'STRONG'
        && p.textContent.trim() === p.firstElementChild.textContent.trim());
    if (fig && label) {
      label.className = 'blade-play';
      fig.prepend(label);
    }
  }
  block.dataset.bladeDecorated = 'true';
  // first feature band anchors the "Features" jump link
  const section = block.closest('.section');
  if (section && !document.getElementById('features')) section.id = 'features';
}
