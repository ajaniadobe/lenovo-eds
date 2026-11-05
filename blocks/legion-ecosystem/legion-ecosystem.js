/**
 * legion-ecosystem — "Welcome to the Legion Ecosystem" (live #blade-4): a set-up photograph
 * with info hotspots; each hotspot opens a tooltip card (name, line, CTA). ≤768px the photo
 * is replaced by the mobile art and the hotspots hide.
 * Reconstructive, classified by content:
 *   - picture-only row               background (1st picture desktop, 2nd mobile)
 *   - row with a heading, one cell   title + subtitle
 *   - two-cell row                   hotspot: position key (<p>, e.g. legion-laptops) |
 *                                    tooltip (h3 name, <p> line, link = CTA)
 * @ew-exempt hotspot keys are position config, rendered only as a class; trigger labels
 *   ("More information") are runtime chrome
 */

function wrap(className, ...nodes) {
  const d = document.createElement('div');
  d.className = className;
  d.append(...nodes);
  return d;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .legion-ecosystem-stage')) return;
  const rows = [...block.children];
  const stage = wrap('legion-ecosystem-stage');
  const head = wrap('legion-ecosystem-head');
  const spots = wrap('legion-ecosystem-spots');
  let mobile = null;
  let seq = 0;
  rows.forEach((r) => {
    const cells = [...r.children];
    if (!r.textContent.trim() && r.querySelector('picture, img')) {
      const pics = [...r.querySelectorAll('picture')].length
        ? [...r.querySelectorAll('picture')] : [...r.querySelectorAll('img')];
      stage.append(wrap('legion-ecosystem-bg', pics[0]));
      if (pics[1]) mobile = wrap('legion-ecosystem-mobile', pics[1]);
      return;
    }
    if (cells.length === 1) {
      head.append(...cells[0].children);
      return;
    }
    const key = cells[0].textContent.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-');
    const tipCell = cells[1];
    seq += 1;
    const id = `legion-ecosystem-tip-${seq}`;
    const spot = wrap(`legion-ecosystem-spot spot-${key}`);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'legion-ecosystem-trigger';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', id);
    const name = tipCell.querySelector('h1, h2, h3, h4, h5');
    btn.setAttribute('aria-label', `More information: ${name ? name.textContent.trim() : ''}`);
    const tip = wrap('legion-ecosystem-tip', ...tipCell.children);
    tip.id = id;
    tip.setAttribute('role', 'tooltip');
    btn.addEventListener('click', () => {
      const open = spot.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
    spot.append(btn, tip);
    spots.append(spot);
  });
  stage.append(head, spots);
  block.replaceChildren(stage, ...(mobile ? [mobile] : []));
}
