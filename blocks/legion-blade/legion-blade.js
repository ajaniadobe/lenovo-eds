/**
 * legion-blade — live #blade-2 "Reach Your Impossible": a textured background, a two-line
 * stacked headline, an art image anchored left and the manifesto copy on the right.
 * Template-slotted, classified by content:
 *   - row holding only a picture             background
 *   - row holding only headings              title (first heading = small line, then large)
 *   - row with a picture cell + a text cell  art | copy (p>strong = intro, other <p> = body)
 */

function wrap(className, ...nodes) {
  const d = document.createElement('div');
  d.className = className;
  d.append(...nodes);
  return d;
}

const pic = (el) => el.querySelector('picture') || el.querySelector('img');

export default function decorate(block) {
  if (block.querySelector(':scope > .legion-blade-inner')) return;
  const rows = [...block.children];
  const inner = wrap('legion-blade-inner');
  const parts = [];
  rows.forEach((r) => {
    const cells = [...r.children];
    const hasText = r.textContent.trim().length > 0;
    if (!hasText && pic(r)) {
      parts.unshift(wrap('legion-blade-bg', pic(r)));
    } else if (r.querySelector('h1, h2, h3') && !pic(r)) {
      const hs = [...r.querySelectorAll('h1, h2, h3')];
      hs.forEach((h, i) => h.classList.add(i === 0 ? 'legion-blade-title-1' : 'legion-blade-title-2'));
      inner.append(wrap('legion-blade-title', ...hs));
    } else {
      const artCell = cells.find((c) => pic(c) && !c.textContent.trim());
      const copyCell = cells.find((c) => c !== artCell);
      const content = wrap('legion-blade-content');
      if (copyCell) {
        const ps = [...copyCell.querySelectorAll('p')];
        ps.forEach((p) => {
          const s = p.querySelector('strong');
          p.classList.add(s && s.textContent.trim() === p.textContent.trim() ? 'legion-blade-intro' : 'legion-blade-desc');
        });
        content.append(wrap('legion-blade-text', ...ps));
      }
      if (artCell) content.append(wrap('legion-blade-art', pic(artCell)));
      inner.append(content);
    }
  });
  block.replaceChildren(...parts, inner);
}
