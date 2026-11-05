/**
 * legion-products — the Legion brand page's grouped product listing (live DLP .pc_new_dlp,
 * gaming-theme-black): facet column, results header with sort, then product groups (banner,
 * cards, "Shop All" footer). The hero "Shop Now" anchors here (#dlp_anchor).
 * Reconstructive (repeat groups), classified by content — never by row index:
 *   - two-cell row, first cell has no picture     facet: <p> name (+ <p><em> = search box
 *                                                 placeholder) | <ul> options shown, 2nd <ul>
 *                                                 = options behind "See More"; a <p> instead of
 *                                                 a list = price range ("$9 – $6806")
 *   - row with an <h2>                            results header: h2 count, <p> sort label
 *   - single-cell row with an <h3>               group: h3 name, <p> link = "Shop All (n)",
 *                                                 <p><em> link = group footer button
 *   - row with a picture cell                     product card: picture | copy —
 *       p>strong (before the title)               merchandising flag
 *       h3 > a                                    product name (PDP link)
 *       p>em "Copilot+ PC"                        badge
 *       "4.2 (8)"                                 rating (drives the stars)
 *       "Est Value $…"                            strike-through estimated value
 *       "$…"                                      price;  "25% off" = saving chip
 *       "Lease to own. As low as $…/week"         Katapult line
 *       "My Lenovo Rewards … <em>$135</em> …"     rewards line
 *       <p> holding only a link                   card CTA (Build Your PC / Add To Cart)
 *       other <p>s                                notes (stock, what's in the box)
 * @ew-exempt widget chrome — Filters / Collapse All / See More / Compare / Education Price /
 *   Verified Only / Verify now / Learn More / Join Now! / Sort by labels are fixed commerce-UI
 *   strings, not content
 */

const RATING = /^(\d(?:\.\d)?)\s*\((\d+)\)$/;
const PRICE = /^\$[\d,]+(?:\.\d+)?$/;
const FINANCING = 'https://www.lenovo.com/us/en/landingpage/lenovo-financing-options/';
const REWARDS = 'https://www.lenovo.com/us/en/rewards/';

function el(tag, className, ...nodes) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  e.append(...nodes);
  return e;
}

const wrap = (className, ...nodes) => el('div', className, ...nodes);
const txt = (n) => n.textContent.replace(/\s+/g, ' ').trim();
const only = (p, sel) => {
  const c = p.querySelector(sel);
  return c && txt(c) === txt(p);
};

function stars(value) {
  const box = wrap('legion-products-stars');
  box.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 5; i += 1) {
    const fill = Math.max(0, Math.min(1, value - i));
    const s = el('span', 'legion-products-star');
    s.style.setProperty('--fill', `${Math.round(fill * 100)}%`);
    box.append(s);
  }
  return box;
}

function buildFacet(cells) {
  const facet = wrap('legion-products-facet');
  const [meta, opts] = cells;
  const ps = [...meta.querySelectorAll('p')];
  const name = ps.find((p) => !p.querySelector('em')) || ps[0];
  const search = ps.find((p) => p !== name && p.querySelector('em'));
  const head = wrap('legion-products-facet-name', name);
  const arrow = el('span', 'legion-products-facet-arrow');
  head.append(arrow);
  facet.append(head);
  const body = wrap('legion-products-facet-body');
  if (search) {
    search.classList.add('legion-products-search');
    body.append(search);
  }
  const lists = [...opts.querySelectorAll('ul')];
  lists.forEach((ul, i) => {
    ul.classList.add('legion-products-options');
    [...ul.children].forEach((li) => li.prepend(el('span', 'legion-products-check')));
    if (i > 0) ul.hidden = true;
    body.append(ul);
  });
  if (lists.length > 1) {
    const more = el('button', 'legion-products-more');
    more.type = 'button';
    more.textContent = 'See More';
    more.addEventListener('click', () => {
      const open = lists[1].hidden;
      lists.slice(1).forEach((u) => { u.hidden = !open; });
      more.textContent = open ? 'See Less' : 'See More';
    });
    body.append(more);
  }
  if (!lists.length) {
    const range = opts.querySelector('p');
    if (range) {
      range.classList.add('legion-products-range');
      body.append(range, wrap('legion-products-slider'));
    }
  }
  head.addEventListener('click', () => facet.classList.toggle('collapsed'));
  facet.append(body);
  return facet;
}

function buildCard(cells) {
  const picCell = cells.find((c) => c.querySelector('picture, img'));
  const copy = cells.find((c) => c !== picCell) || picCell;
  const card = el('li', 'legion-products-card');
  const top = wrap('legion-products-card-top');
  const compare = el('span', 'legion-products-compare');
  compare.textContent = 'Compare';
  top.append(compare, el('span', 'legion-products-wish'));
  card.append(top);

  const merch = wrap('legion-products-merch');
  const title = wrap('legion-products-title');
  const rating = wrap('legion-products-rating');
  const image = wrap('legion-products-image');
  const price = wrap('legion-products-price');
  const notes = wrap('legion-products-notes');
  const cta = wrap('legion-products-cta');
  const details = wrap('legion-products-details');
  details.hidden = true;
  const media = picCell.querySelector('picture') || picCell.querySelector('img');
  if (media) image.append(media);

  let seenTitle = false;
  [...copy.children].forEach((n) => {
    const t = txt(n);
    if (n.matches('h1, h2, h3, h4')) {
      seenTitle = true;
      title.append(n);
    } else if (!seenTitle && only(n, 'strong')) {
      n.classList.add('legion-products-flag');
      // live colours the merchandising flag per flag type (READY TO SHIP, FEATURED DEAL, …)
      const kind = t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      if (kind) n.dataset.flag = kind;
      merch.append(n);
    } else if (only(n, 'em') && !n.querySelector('a')) {
      n.classList.add('legion-products-badge');
      title.append(n);
    } else if (RATING.test(t)) {
      const [, v, count] = t.match(RATING);
      const a = n.querySelector('a');
      if (a) {
        // live: the review link wraps the stars and the score; its accessible name is the
        // Bazaarvoice summary (the score drops under the stars when it does not fit beside them)
        const score = el('span', 'legion-products-score', ...a.childNodes);
        a.append(stars(parseFloat(v)), score);
        a.setAttribute('aria-label', `${v} out of 5 stars,${count} reviews.`);
        rating.append(n);
      } else rating.append(stars(parseFloat(v)), n);
    } else if (/^Est Value/i.test(t)) {
      n.classList.add('legion-products-est');
      price.append(n);
    } else if (PRICE.test(t)) {
      n.classList.add('legion-products-amount');
      price.append(n);
    } else if (/% ?off$/i.test(t)) {
      n.classList.add('legion-products-save');
      price.append(n);
    } else if (/^Lease to own/i.test(t)) {
      n.classList.add('legion-products-katapult');
      n.prepend(el('span', 'legion-products-katapult-logo'));
      const more = el('a', 'legion-products-learn');
      more.href = FINANCING;
      more.textContent = 'Learn More';
      n.append(' ', more);
      price.append(n);
    } else if (/Rewards/i.test(t)) {
      n.classList.add('legion-products-rewards');
      const join = el('a', 'legion-products-join');
      join.href = REWARDS;
      join.textContent = 'Join Now!';
      price.append(n, join);
    } else if (n.querySelector('a') && only(n, 'a') && !cta.children.length) {
      const a = n.querySelector('a');
      a.className = 'legion-products-cta-link';
      // configure-to-order models (…cto1wwus… part numbers) get the dark "Build Your PC" button
      if (/cto\d/i.test(a.getAttribute('href') || '')) a.classList.add('cto');
      cta.append(n);
    } else if (n.querySelector('a') && only(n, 'a')) {
      n.classList.add('legion-products-detail');
      details.append(n);
    } else {
      n.classList.add('legion-products-note');
      // live renders the "What's in the box" disclosure as a boxed link row, not a stock note
      if (/^what.s in the box$/i.test(t)) n.classList.add('legion-products-box');
      notes.append(n);
    }
  });
  // education price box: fixed commerce chrome, placed after the price line (live order)
  const edu = wrap('legion-products-edu');
  const eduLabel = el('span', 'legion-products-edu-label');
  eduLabel.textContent = 'Education Price:';
  const eduPrice = wrap('legion-products-edu-price');
  const cur = el('span', 'legion-products-edu-currency');
  cur.textContent = '$';
  const verified = el('span', 'legion-products-edu-verified');
  verified.textContent = 'Verified Only';
  eduPrice.append(cur, verified);
  const save = wrap('legion-products-edu-save');
  save.textContent = 'you could save more ';
  const verify = el('span', 'legion-products-edu-verify');
  verify.textContent = 'Verify now';
  save.append(verify);
  edu.append(eduLabel, eduPrice, save);
  const priceLine = wrap(
    'legion-products-price-line',
    ...price.querySelectorAll('.legion-products-amount, .legion-products-save'),
  );
  // the strike-through value is its own card row: live aligns it per card row (16px under the
  // image) and drops the slot when no card in the row has one
  const est = wrap('legion-products-est-row');
  const estValue = price.querySelector('.legion-products-est');
  if (estValue) est.append(estValue);
  const rest = [...price.children].filter((c) => c !== estValue && c !== priceLine);
  price.replaceChildren(priceLine, edu, ...rest);

  const seeMore = el('button', 'legion-products-seemore');
  seeMore.type = 'button';
  seeMore.textContent = 'See More';
  seeMore.setAttribute('aria-expanded', 'false');
  seeMore.addEventListener('click', () => {
    details.hidden = !details.hidden;
    seeMore.setAttribute('aria-expanded', String(!details.hidden));
    seeMore.textContent = details.hidden ? 'See More' : 'See Less';
  });
  const body = wrap(
    'legion-products-card-body',
    merch,
    title,
    rating,
    image,
    est,
    price,
    cta,
    notes,
    seeMore,
  );
  card.append(body);
  return card;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .legion-products-inner')) return;
  block.id = block.id || 'dlp_anchor';
  const facets = wrap('legion-products-facets');
  const top = wrap('legion-products-filter-top');
  const title = el('span', 'legion-products-filter-title');
  title.textContent = 'Filters';
  const collapse = el('button', 'legion-products-collapse');
  collapse.type = 'button';
  collapse.textContent = 'Collapse All';
  top.append(title, collapse);
  facets.append(top);
  const list = wrap('legion-products-list');
  let group = null;
  let groupList = null;
  const footers = [];

  [...block.children].forEach((r) => {
    const cells = [...r.children];
    if (cells.length >= 2 && !cells.some((c) => c.querySelector('picture, img'))) {
      facets.append(buildFacet(cells));
    } else if (r.querySelector('h2') && !r.querySelector('picture, img')) {
      const header = wrap('legion-products-query');
      const h2 = r.querySelector('h2');
      h2.classList.add('legion-products-count');
      header.append(h2);
      const sort = r.querySelector('p');
      if (sort) {
        sort.classList.add('legion-products-sort');
        header.append(sort);
      }
      list.append(header);
    } else if (cells.length === 1 && r.querySelector('h3') && !r.querySelector('picture, img')) {
      group = wrap('legion-products-group');
      const banner = wrap('legion-products-banner', r.querySelector('h3'));
      [...r.querySelectorAll('p')].forEach((p) => {
        const a = p.querySelector('a');
        if (!a) return;
        if (p.querySelector('em') || a.classList.contains('secondary')) {
          a.className = 'legion-products-footer-btn';
          footers.push([group, p]);
        } else {
          a.className = 'legion-products-shopall';
          banner.append(p);
        }
      });
      groupList = el('ul', 'legion-products-cards');
      group.append(banner, groupList);
      list.append(group);
    } else if (r.querySelector('picture, img')) {
      if (!groupList) {
        groupList = el('ul', 'legion-products-cards');
        list.append(groupList);
      }
      groupList.append(buildCard(cells));
    }
  });
  footers.forEach(([g, p]) => g.append(wrap('legion-products-footer', p)));
  collapse.addEventListener('click', () => {
    facets.querySelectorAll('.legion-products-facet').forEach((f) => f.classList.add('collapsed'));
  });
  block.replaceChildren(wrap('legion-products-inner', facets, list));
}
