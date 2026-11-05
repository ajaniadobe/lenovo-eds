/**
 * persona-cards — paired image cards with a white copy panel (live mobile-compare-cards):
 * two cards per row, the panel sits right on the first card of a pair and left on the second.
 * Reconstructive: one authored row per card — picture cell | copy cell (heading, <p>s, last
 * <p> = action: a link, or an emphasised label when the source action has no target).
 */

function wrap(className, ...nodes) {
  const d = document.createElement('div');
  d.className = className;
  d.append(...nodes);
  return d;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .persona-cards-pair')) return;
  const cards = [...block.children].map((r) => {
    const media = r.querySelector('picture') || r.querySelector('img');
    const heading = r.querySelector('h1, h2, h3, h4');
    const ps = [...r.querySelectorAll('p')].filter((p) => p.textContent.trim()
      && !p.querySelector('picture, img'));
    const last = ps[ps.length - 1];
    const action = last && (last.querySelector('a') || last.querySelector('em'))
      && last.textContent.trim() === (last.querySelector('a, em')?.textContent.trim()) ? last : null;
    const body = ps.filter((p) => p !== action);
    const card = wrap('persona-cards-card');
    if (media) card.append(wrap('persona-cards-bg', media));
    const inner = wrap('persona-cards-panel-inner');
    if (heading) inner.append(wrap('persona-cards-title', heading));
    inner.append(wrap('persona-cards-body', ...body));
    if (action) inner.append(wrap('persona-cards-action', action));
    card.append(wrap('persona-cards-panel', inner));
    return card;
  }).filter((c) => c.children.length);

  const pairs = [];
  for (let i = 0; i < cards.length; i += 2) {
    pairs.push(wrap('persona-cards-pair', ...cards.slice(i, i + 2)));
  }
  block.replaceChildren(...pairs);
}
