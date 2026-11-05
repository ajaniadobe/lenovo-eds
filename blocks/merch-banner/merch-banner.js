/**
 * merch-banner — offer strip (live ofp-merch-banner): logo, offer copy, one action.
 * Classified by content: the cell with a picture = logo, a <p> that is only a link = action,
 * every other <p> = copy.
 */

function wrap(className, ...nodes) {
  const d = document.createElement('div');
  d.className = className;
  d.append(...nodes);
  return d;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .merch-banner-content')) return;
  const media = block.querySelector('picture') || block.querySelector('img');
  const ps = [...block.querySelectorAll('p')].filter((p) => p.textContent.trim());
  const action = ps.find((p) => {
    const a = p.querySelector('a');
    return a && p.textContent.trim() === a.textContent.trim();
  });
  const copy = ps.filter((p) => p !== action);
  const rowEl = wrap('merch-banner-row');
  if (media) rowEl.append(wrap('merch-banner-logo', media));
  rowEl.append(wrap('merch-banner-text', ...copy));
  if (action) {
    action.querySelector('a').classList.add('merch-banner-button');
    rowEl.append(wrap('merch-banner-action', action));
  }
  block.replaceChildren(wrap('merch-banner-content', rowEl));
}
