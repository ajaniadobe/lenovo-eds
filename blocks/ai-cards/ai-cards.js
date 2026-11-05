/**
 * ai-cards — audience cards, two per row (live layouts_special_content of
 * vertical-default-pc articles): image, title, description, text-link CTAs. Reconstructive.
 * Schema: stardust/eds-schema/us-en-ai-pcs.json section 7 (4 units).
 *
 * Authoring: one row per card — image cell | text cell (<h3> title, <p> description,
 * one <p><a> per link). Also decodes the DA-flattened single-cell shape: cards are
 * segmented on the most frequent heading tag; an image before a heading belongs to it.
 * Links stay plain text links (no <strong>/<em>) — they are not buttons on the source.
 * Cards are laid out in rows of two, as authored order.
 */

const isMedia = (el) => el.matches('picture, img')
  || (el.matches('p') && el.querySelector('picture, img') && !el.textContent.trim());
const isHeading = (el) => /^H[1-6]$/.test(el.tagName);
const isCta = (el) => el.tagName === 'P' && el.querySelector('a')
  && el.textContent.trim() === el.querySelector('a').textContent.trim();

function collectNodes(scope) {
  const out = [];
  scope.querySelectorAll(':scope > div').forEach((cell) => {
    const kids = [...cell.children];
    if (kids.length) out.push(...kids);
  });
  return out;
}

function newCard() {
  return {
    media: null, heading: null, desc: [], ctas: [],
  };
}

function segment(block) {
  const rows = [...block.children];
  const headRows = rows.filter((r) => r.querySelector('h1, h2, h3, h4, h5, h6'));
  const cards = [];
  if (headRows.length >= 2 && headRows.length === rows.length) {
    rows.forEach((r) => {
      const c = newCard();
      collectNodes(r).forEach((n) => {
        if (!c.media && isMedia(n)) c.media = n;
        else if (!c.heading && isHeading(n)) c.heading = n;
        else if (isCta(n)) c.ctas.push(n);
        else c.desc.push(n);
      });
      cards.push(c);
    });
    return cards;
  }
  const nodes = rows.flatMap((r) => collectNodes(r));
  const tags = nodes.filter(isHeading).map((h) => h.tagName);
  const unit = tags.sort((a, b) => tags.filter((t) => t === b).length
    - tags.filter((t) => t === a).length)[0];
  let pendingMedia = null;
  let cur = null;
  nodes.forEach((n) => {
    if (isMedia(n)) {
      if (cur && !cur.media && cur.desc.length === 0 && cur.ctas.length === 0) cur.media = n;
      else pendingMedia = n;
    } else if (isHeading(n) && n.tagName === unit) {
      cur = newCard();
      cur.heading = n;
      cur.media = pendingMedia;
      pendingMedia = null;
      cards.push(cur);
    } else {
      if (!cur) {
        cur = newCard();
        cards.push(cur);
      }
      if (isCta(n)) cur.ctas.push(n);
      else cur.desc.push(n);
    }
  });
  if (pendingMedia && cur && !cur.media) cur.media = pendingMedia;
  return cards;
}

function render(c) {
  const art = document.createElement('article');
  art.className = 'card';
  const image = document.createElement('div');
  image.className = 'card-image';
  if (c.media) image.append(c.media.querySelector('picture') || c.media);
  const content = document.createElement('div');
  content.className = 'card-content';
  if (c.heading) {
    const t = document.createElement('div');
    t.className = 'card-title';
    t.append(c.heading);
    content.append(t);
  }
  if (c.desc.length) {
    const d = document.createElement('div');
    d.className = 'card-desc';
    d.append(...c.desc);
    content.append(d);
  }
  if (c.ctas.length) {
    const a = document.createElement('div');
    a.className = 'card-actions';
    a.append(...c.ctas);
    content.append(a);
  }
  art.append(image, content);
  return art;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .card-row')) return;
  const cards = segment(block).map(render);
  const out = [];
  for (let i = 0; i < cards.length; i += 2) {
    const row = document.createElement('div');
    row.className = 'card-row';
    row.append(...cards.slice(i, i + 2));
    out.push(row);
  }
  block.replaceChildren(...out);
}
