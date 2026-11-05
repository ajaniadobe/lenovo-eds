/**
 * rewards — "My Lenovo Rewards" banner (live content-package-banner).
 * Schema: stardust/eds-schema/index.json, section `rewards`.
 * Decode tier: template-slotted.
 *
 * Authoring:
 *   row: background image (a row holding only an image)
 *   row: copy cell — title (heading or first paragraph, live paints a <p>), body paragraph,
 *        CTA paragraphs (**bold** link = button,
 *        *italic* link = text link) | list cell — the benefit list (ul)
 * Classified by content: the first image is the background, the heading opens the copy,
 * link paragraphs are actions, lists (or text after the actions) are benefits.
 * The two alpha-letter textures are decorative CSS (blocks/rewards/*.svg).
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

function collectNodes(block) {
  const out = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
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

export default function decorate(block) {
  const nodes = collectNodes(block);
  if (!nodes.length) return;
  const box = document.createElement('div');
  box.className = 'rewards-box';
  box.innerHTML = `<div class="rewards-bg" aria-hidden="true">
      <div class="rewards-alpha"><span class="alpha-e"></span><span class="alpha-n"></span></div>
    </div>
    <div class="rewards-left"><div class="rewards-content">
      <div class="rewards-copy"></div><div class="rewards-actions"></div>
    </div></div>
    <div class="rewards-list"></div>`;
  const bg = box.querySelector('.rewards-bg');
  const copy = box.querySelector('.rewards-copy');
  const actions = box.querySelector('.rewards-actions');
  const list = box.querySelector('.rewards-list');
  nodes.forEach((n) => {
    if (isMedia(n) && !bg.querySelector('picture, img')) {
      bg.prepend(wrapNode(n, 'rewards-bg-main'));
    } else if (/^H[1-6]$/.test(n.tagName)
      || (n.tagName === 'P' && !copy.children.length && !n.querySelector('a'))) {
      copy.append(wrapNode(n, 'rewards-title'));
    } else if (n.querySelector('a')) {
      actions.append(n);
    } else if (n.tagName === 'UL' || n.tagName === 'OL' || actions.children.length) {
      list.append(n);
    } else {
      copy.append(wrapNode(n, 'rewards-body'));
    }
  });
  if (!actions.children.length) actions.remove();
  block.replaceChildren(box);
}
