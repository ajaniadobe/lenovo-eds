/**
 * legion-feature — featured product spotlight inside the Legion showcase (live
 * .blade-3-ft-pdt-le-go-gen-2 / .blade-3-ft-pdt-le-9i-gen-10): large product art and a copy
 * column (name, tagline, description, status). Variant `reverse`: copy left, art right, with
 * an optional accent figure overlapping the top-left corner.
 * Template-slotted, classified by content: the cell with a heading = copy; the first picture-
 * only cell = product art; a further picture-only cell = accent figure. In the copy,
 * p>strong = tagline, p>em = status pill.
 */

function wrap(className, ...nodes) {
  const d = document.createElement('div');
  d.className = className;
  d.append(...nodes);
  return d;
}

const pic = (el) => el.querySelector('picture') || el.querySelector('img');

export default function decorate(block) {
  if (block.querySelector(':scope > .legion-feature-inner')) return;
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const copyCell = cells.find((c) => c.querySelector('h1, h2, h3, h4'));
  const arts = cells.filter((c) => c !== copyCell && pic(c));
  const inner = wrap('legion-feature-inner');
  if (arts[1]) inner.append(wrap('legion-feature-accent', pic(arts[1])));
  if (arts[0]) inner.append(wrap('legion-feature-art', pic(arts[0])));
  if (copyCell) {
    [...copyCell.children].forEach((el) => {
      const only = (sel) => el.querySelector(sel)
        && el.textContent.trim() === el.querySelector(sel).textContent.trim();
      if (el.matches('h1, h2, h3, h4')) el.classList.add('legion-feature-title');
      else if (only('strong')) el.classList.add('legion-feature-tagline');
      else if (only('em')) el.classList.add('legion-feature-status');
      else el.classList.add('legion-feature-desc');
    });
    inner.append(wrap('legion-feature-copy', ...copyCell.children));
  }
  block.replaceChildren(inner);
}
