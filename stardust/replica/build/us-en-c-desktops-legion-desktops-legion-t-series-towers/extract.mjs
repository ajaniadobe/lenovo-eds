// Verbatim content extract from the captured rendered HTML (JS off, no network) → extract.json
import fs from 'node:fs';
import { chromium } from '/app/node_modules/playwright/index.mjs';
const S = 'us-en-c-desktops-legion-desktops-legion-t-series-towers';
const root = new URL('../../../', import.meta.url).pathname;
const html = fs.readFileSync(root + `current/pages/${S}.html`, 'utf8').replace(/<script[\s\S]*?<\/script>/gi, '');
const b = await chromium.launch(); const ctx = await b.newContext({ javaScriptEnabled: false }); const p = await ctx.newPage();
await p.route('**/*', r => r.abort());
await p.setContent(html, { waitUntil: 'domcontentloaded' });
const ex = await p.evaluate(() => {
  const q = (s, r = document) => r.querySelector(s); const qa = (s, r = document) => [...r.querySelectorAll(s)];
  const img = (el) => el && { src: el.getAttribute('src') || el.getAttribute('data-src'), alt: el.getAttribute('alt') };
  const hero = q('.series-hero');
  const out = {
    hero: {
      bg: img(q('.series-hero__background img', hero)),
      crumbs: qa('.breadcrumbs li', hero).map(li => { const a = q('a', li); return a ? [a.getAttribute('href'), a.textContent.trim()] : [null, li.textContent.trim()]; }),
      logo: img(q('.product-logo img', hero)),
      name: q('.h-name', hero).innerHTML.trim(), title: q('.h-title', hero).innerHTML.trim(),
      desc: q('.product-desc', hero).innerHTML.trim(), cta: q('.series-hero__cta', hero).textContent.trim(),
    },
    blades: qa('.series-blade2').map(s => ({ cls: s.className, bg: img(q('.bg-image', s)), logo: img(q('.product-logo img', s)), h: q('.h-title', s).innerHTML.trim(), desc: q('.product-desc', s).innerHTML.trim(), sr: (q('.sr-only', s) || {}).textContent, cta: q('.cta-link', s) && [q('.cta-link', s).getAttribute('href'), q('.cta-link', s).innerHTML.trim(), q('.cta-link', s).getAttribute('target'), q('.cta-link', s).getAttribute('aria-label')] })),
    sub: [q('h2.sub_header .group_name').innerHTML, q('h2.sub_header .category_name').innerHTML],
    facets: qa('.facets-list').map(f => ({ name: q('.facets-name b', f).textContent.trim(), tip: (q('.facets-tooltip-container', f) || {}).getAttribute?.('aria-label'), items: qa('.item-lists-group', f).map(g => ({ t: q('.items span', g).textContent, hidden: getComputedStyle(g).display === 'none' || g.getAttribute('style') })), more: (q('.learn-more', f) || {}).textContent })),
    cards: qa('li.product_item').map(li => {
      const a = q('.product_title a', li);
      return {
        code: [...li.classList].find(c => c.startsWith('productCode_')).slice(12),
        title: a.textContent.trim(), href: a.getAttribute('href'),
        rating: qa('.bv_text', li).map(x => x.textContent.trim()), partial: (q('.star-icon-box:last-child .yellow-icon', li) || { getAttribute: () => null }).getAttribute('style'),
        img: img(q('img.image_focus', li)), hover: img(q('img.image_blur', li)),
        starting: q('.starting-at-container', li).textContent.trim(), price: q('.price-title', li).textContent.trim(),
        kp: q('.katapult-price-calculator-price', li).textContent.trim(),
        earnSr: q('.loyalty-price-color span', li).textContent.trim(), earn: q('.popup-activation', li).textContent.trim(),
        features: qa('.features li p', li).map(x => x.innerHTML.trim()),
        imgBtn: q('button.normal_image', li).getAttribute('aria-label'), joinLabel: q('.join-now a', li).getAttribute('aria-label'), ratingLabel: q('.bv_main_container', li).getAttribute('aria-label'), ratingHref: q('.bv_main_container', li).getAttribute('href'), pop: qa('.le-popover .bubble p', li).map(x => [x.className, x.textContent.trim(), (q('a', x) || { getAttribute: () => null }).getAttribute('href')]),
        imgBtn: q('button.normal_image', li).getAttribute('aria-label'), joinLabel: q('.join-now a', li).getAttribute('aria-label'), ratingLabel: q('.bv_main_container', li).getAttribute('aria-label'), ratingHref: q('.bv_main_container', li).getAttribute('href'), pop: qa('.le-popover .bubble p', li).map(x => [x.className, x.textContent.trim(), (q('a', x) || { getAttribute: () => null }).getAttribute('href')]),
        cta: [q('.cta-button_subseries', li).getAttribute('href'), q('.cta-button_subseries .text', li).textContent.trim(), q('.cta-button_subseries', li).getAttribute('aria-label')],
      };
    }),
    footer: q('.pc_footer_page p.show').textContent.replace(/\s+/g, ' ').trim(),
    sortOpts: qa('.price_sort_select .item span').map(x => x.textContent.trim()),
    attrs: { compareInput: q('.common-compare-container input').outerHTML, itemInput: q('.item-lists-left input').outerHTML, tip: q('.facets-tooltip-container').outerHTML, skip: q('.facet_filter_skip_product_list').outerHTML, popup: q('.popup-activation').outerHTML, kLearn: q('.katapult-price-calculator-learn-more').outerHTML, upArrow: q('.upArrow').outerHTML, collapse: q('.collapse_filters').outerHTML },
  };
  return out;
});
fs.writeFileSync(new URL('./extract.json', import.meta.url), JSON.stringify(ex, null, 1));
await b.close();
console.log('ok cards', ex.cards.length, 'facets', ex.facets.length);
