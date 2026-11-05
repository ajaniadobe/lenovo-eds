// Verbatim content extract → extract.json. Source: the hydrated live dump (live-1440.html, written by live-dump.mjs —
// a capture of the same URL as stardust/current/pages/<S>.html, with the lazy sections and hydrated commerce widgets
// loaded; capture-state policy). JS off, no network.
import fs from 'node:fs';
import { chromium } from '/app/node_modules/playwright/index.mjs';
const dir = new URL('./', import.meta.url).pathname;
const b = await chromium.launch(); const p = await (await b.newContext({ javaScriptEnabled: false })).newPage();
await p.route('**/*', r => r.abort());
await p.setContent('<body>' + fs.readFileSync(dir + 'live-1440.html', 'utf8') + '</body>', { waitUntil: 'domcontentloaded' });
const ex = await p.evaluate(() => {
  const q = (s, r = document) => r && r.querySelector(s); const qa = (s, r = document) => (r ? [...r.querySelectorAll(s)] : []);
  const fsz = (el) => +((el.getAttribute('data-t') || '').split('/')[0]);
  const R = (el) => (el.getAttribute('data-r') || '0,0,0,0').split(',').map(Number);
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // clean inline HTML: keep sup/sub/strong/b/em/br/a[href]; a span whose font-size is smaller than its block → <small>
  const clean = (el, base) => {
    if (!el) return '';
    base = base || fsz(el);
    let out = '';
    for (const n of el.childNodes) {
      if (n.nodeType === 3) { out += esc(n.textContent); continue; }
      if (n.nodeType !== 1) continue;
      const t = n.tagName.toLowerCase();
      if (['sup', 'sub', 'strong', 'b', 'em'].includes(t)) out += `<${t === 'b' ? 'strong' : t}>${clean(n, base)}</${t === 'b' ? 'strong' : t}>`;
      else if (t === 'br') out += '<br>';
      else if (t === 'a') out += `<a href="${(n.getAttribute('href') || '#').replace(/"/g, '&quot;')}">${clean(n, base)}</a>`;
      else if (t === 'ul') out += `<ul>${clean(n, base)}</ul>`;
      else if (t === 'li') out += `<li>${clean(n, fsz(n) || base).replace(/^<p>(.*)<\/p>$/, '$1').trim()}</li>`;
      else if (t === 'p' || t === 'div') { const inner = clean(n, fsz(n) || base).trim(); out += inner ? `<p>${inner}</p>` : (t === 'p' ? '<p><br></p>' : ''); }
      else if (t === 'span' && fsz(n) && fsz(n) < base - 1) out += `<small>${clean(n, fsz(n))}</small>`;
      else if (t === 'img' && +(n.getAttribute('data-r') || '0,0,0,0').split(',')[2] <= 60 && +(n.getAttribute('data-r') || '0,0,0,0').split(',')[2] > 0) out += ` <img class="inline-icon" src="${n.getAttribute('src')}" alt="${(n.getAttribute('alt') || '').replace(/"/g, '&quot;')}">`;
      else if (t === 'img' || t === 'svg' || t === 'style' || t === 'button' || t === 'i') continue;
      else out += clean(n, base);
    }
    return out.replace(/\s+/g, ' ');
  };
  const inl = (el) => clean(el).replace(/^<p>|<\/p>$/g, '').trim();
  const img = (el) => el && { src: el.getAttribute('src'), alt: el.getAttribute('alt') || '' };
  const txt = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
  const out = {};
  // ---- hero
  const H = q('.product-singlePdpHero');
  out.crumbs = qa('.breadcrumb_item', H).map(li => { const a = q('a', li); return a ? [a.getAttribute('href'), txt(a)] : [null, txt(li).replace(/^>\s*/, '')]; });
  out.mainImg = img(q('.gallery-canvas img', H));
  out.thumbs = qa('.gallery-bottom .swiper-slide:not(.swiper-slide-duplicate)', H).map(s => (q('.gallery-video', s) ? { video: true } : { ...img(q('img', s)), active: s.classList.contains('active') }));
  out.partner = img(q('.single_model_PDP_container_main_right .partner-icon-wrapper img', H));
  const M = q('.mainContent', H);
  out.flag = txt(q('.merchandising_flag_normal', M)); out.h1 = txt(q('h1', M));
  out.rating = qa('.hero-rating .bv_text, .fps_review_container .bv_text', M).map(txt).slice(0, 2);
  out.ratingHref = (q('.fps_review_container a.bv_main_container', M) || { getAttribute: () => '#reviews' }).getAttribute('href');
  out.ratingLabel = (q('.fps_review_container a.bv_main_container', M) || { getAttribute: () => '' }).getAttribute('aria-label');
  out.stars = qa('.fps_review_container .star-icon-box', M).map(s => (q('[style]', s) || { getAttribute: () => '' }).getAttribute('style'));
  out.switchMsg = txt(q('.q25614SVC', M));
  out.est = { label: txt(q('.web-price-label', M)), price: txt(q('del.price', M)), tipT: txt(q('.stp-title', M)), tipD: txt(q('.stp-des', M)) };
  out.price = txt(q('.price-title', M)); out.save = txt(q('.price-save-mt', M));
  out.kat = ['lease', 'pay', 'price', 'learn-more'].map(k => txt(q('.katapult-price-calculator-' + k, M)));
  out.loyalty = { title: txt(q('.rewards-text', M)), earn: txt(q('.loyalty-container section section > span', M)), amt: txt(q('.popup-activation', M)), msg: txt(q('.loyaltys-message', M)), join: txt(q('.join-now a', M)), pop: qa('.le-popover_body p', M).map(txt) };
  out.cta = txt(q('.cta_container .text, .cta_container button', M)); out.compare = txt(q('.compare-text', M));
  out.wish = txt(q('.card-heart-content > span', M));
  out.delivery = qa('.delivery-container > span', M).map(txt);
  out.win = qa('.Q26893-copy', M).map(txt);
  out.specsTitle = txt(q('.specs_title', M)); const va = q('.view_all_link', M); out.viewAll = [va.getAttribute('href'), txt(va)];
  out.specGroups = qa('.specs_list .group_wrapper', M).map(g => ({ name: txt(q('.specs_group', g)), items: qa('.specs_item', g).map(it => ({ n: txt(q('.item_name', it)), v: txt(q('.item_content', it)), tip: !!q('.tool-tip', it) })) }));
  out.part = [txt(q('.part_number_title', M)), txt(q('.part_number_content', M))];
  out.offersTitle = txt(q('.product_offers_headline', M));
  out.offers = qa('.product-offers-content .item', M).map(it => qa('p', it).filter(p0 => !p0.parentElement.closest('p')).map(p0 => ({ html: inl(p0), imgs: qa('img', p0).map(img) })));
  out.offerIcons = qa('.product-offers-content img', M).map(img);
  out.addonsTitle = txt(q('.promotedOption_title', M));
  out.addons = qa('.promotedOption_list', M).map(l => ({ name: txt(q('.promotedOption_summary', l)), price: txt(q('.promotedOption_purchasePrice', l)), html: inl(q('.promotedOption_price', l)) }));
  // ---- tabs
  out.tabs = qa('nav.nav_container li a').map(a => [a.getAttribute('href'), txt(a), a.closest('li').classList.contains('active')]);
  // ---- services
  const SV = q('section.services_support_container');
  out.services = { pre: txt(q('.pre-headline', SV)), h: txt(q('.headline', SV)), items: qa('.item_content', SV).map(it => ({ icon: img(q('.icon_box img', it)), name: txt(q('.name', it)), desc: inl(q('.desc', it)), link: [q('.link_box a', it).getAttribute('href'), txt(q('.link_box a', it)), q('.link_box a', it).getAttribute('aria-label')] })) };
  // ---- feature blades
  out.blades = qa('section.features_container > .feature-blade').map(bl => {
    const kind = (bl.className.match(/blade_(\d+)/) || [])[1];
    const align = (bl.className.match(/feature-align-(\w+)/) || [])[1];
    const gal = q('.feature-gallery', bl);
    const side = gal ? ((gal.className.match(/content-(left|right|top|bottom)/) || [])[1]) : null;
    const top = gal || bl;
    const o = { kind, align, side };
    if (kind === '2' || kind === '1') {
      o.pre = inl(q('.gallery-content > .headline', top)); o.h = inl(q('.gallery-content > .subHeadline', top)); o.desc = clean(q('.gallery-content > .description', top));
      o.img = img(q('.blade-media img', top)); o.caption = txt(q('.media_caption_wrapper', top));
      const c = q('.gallery-content-cta', top); o.cta = c && [c.getAttribute('href'), txt(c)];
      o.imgR = q('.blade-media img', top) ? R(q('.blade-media img', top)) : null;
    } else {
      o.pre = inl(q(':scope > .headline', bl)); o.h = inl(q(':scope > .subHeadline', bl)); o.desc = clean(q(':scope > .description', bl));
      const slides = qa('.swiper-slide', bl);
      const uniq = slides.map(s => ({ s, x: R(s)[0], w: R(s)[2] })).filter(o => o.x + o.w > 0 && o.x < 1440).sort((a, b) => a.x - b.x);
      const seenKeys = new Set(uniq.map(o => (q('img', o.s) || { getAttribute: () => '' }).getAttribute('src') + txt(o.s).slice(0, 30)));
      slides.forEach(sl => { const k = (q('img', sl) || { getAttribute: () => '' }).getAttribute('src') + txt(sl).slice(0, 30); if (!seenKeys.has(k)) { seenKeys.add(k); uniq.push({ s: sl, x: 99999, w: 0 }); } });
      o.total = new Set(slides.map(s => (q('img', s) || { getAttribute: () => '' }).getAttribute('src') + txt(s).slice(0, 30))).size;
      o.items = uniq.map(({ s, x }) => ({ x, hfs: Math.max(0, ...qa('.headline span, .headline p', s).map(fsz)), img: img(q('img', s)), caption: txt(q('.media_caption_wrapper', s)), h: inl(q('.headline', s)) || inl(q('.small_content_container_text_title', s)), sub: inl(q('.small_content_container_text_sub_heading', s)), desc: clean(q('.description', s) || q('.small_content_container_text_desc', s)), bg: ((q('.background-image-container', s) || { getAttribute: () => '' }).getAttribute('style') || '').match(/url\(["']?([^"')]+)/)?.[1], cta: q('.small_content_container-cta-btn a', s) && [q('.small_content_container-cta-btn a', s).getAttribute('href'), txt(q('.small_content_container-cta-btn a', s))] }));
      o.dots = qa('.swiper-pagination-bullet', bl).length;
      o.dotLabels = qa('.swiper-pagination-bullet', bl).map(d => [d.getAttribute('aria-label'), d.className.includes('active')]);
    }
    o.r = R(bl);
    return o;
  });
  // ---- tech specs
  const TS = q('section.tech_specs_container');
  out.specs = { h: txt(q('.title .headline', TS)), groups: qa('.specs-wrapper', TS).map(w => ({ name: txt(q('.group-headline', w)), rows: qa('.specs-table > .item', w).map(it => ({ t: txt(q('.spec-title', it)), v: clean(q('.specs-table-td', it)).trim() })) })), disc: clean(q('.disclaimer', TS)) };
  // ---- merch banner, ports, similar, bottom
  const MB = q('section.merch-banner'); out.merch = { text: txt(MB), img: img(q('img', MB)), href: (q('a', MB) || { getAttribute: () => null }).getAttribute('href') };
  const PS = q('section.ports_slots_container'); out.ports = { h: txt(q('.headline', PS)), img: img(q('img', PS)), items: qa('.num', PS).map(n => [txt(n), txt(n.nextElementSibling)]) };
  const SP = q('section.similar_products_container');
  out.similar = { pre: txt(q('.pre-headline', SP)), h: txt(q('.headline', SP)), sub: txt(q('.sub-headline', SP)), chips: qa('.chip', SP).map(c => [txt(c), c.classList.contains('selected')]), selectAll: txt(q('.select-all', SP)),
    items: qa('.similar_product_item', SP).map(it => ({ current: it.classList.contains('current_bg'), top: txt(q('.similar_top', it)), title: txt(q('.title_box, a.bold', it)), href: (q('.title_box, a.bold', it) || { getAttribute: () => '' }).getAttribute('href'), rating: qa('.bv_text', it).map(txt), img: img(q('.img_box img', it)), price: txt(q('.final-price', it)), specs: qa('.specs li', it).map(li => [txt(q('.title', li)), txt(q('.desc', li)), R(li)[2] > 0]), shop: q('.similar-shop-container a', it) && [q('.similar-shop-container a', it).getAttribute('href'), txt(q('.similar-shop-container a', it))], compare: txt(q('.compare-text', it)) })),
    add: txt(q('.similar-compare-text', SP)), explore: [q('a.noline[href="/us/en/laptops/"]', SP)?.getAttribute('href'), txt(q('a.noline[href="/us/en/laptops/"]', SP))] };
  const RV = q('section.reviews_container');
  const cq = (part, r = RV) => qa(`[class*="${part}"]`, r);
  out.reviews = { tabs: qa('.reviews_title button', RV).map(txt), h: txt(q('h2', RV)), trust: img(q('img[src*=trustmark]', RV)),
    snapH: txt(cq('sc-16j1lpy-2')[0]), snapSub: txt(cq('sc-16dr7i1-5')[0]),
    hist: qa('[role=button][aria-label*="stars"], li', cq('sc-16j1lpy-2')[0]?.parentElement).length,
    overallH: txt(cq('sc-16j1lpy-2')[1]), overall: txt(cq('sc-157rd1w-1')[0]), count: txt(cq('sc-157rd1w-2')[0]),
    sumH: txt(q('.swat-hosted-summaries-heading', RV)), sumNote: txt(q('span.swat-hosted-summary-text', RV)), sum: txt(q('div.swat-hosted-summary-text', RV)), more: txt(q('.swat-hosted-show-more-link', RV)),
    avgH: txt(cq('sc-16j1lpy-2')[2]), avg: cq('di1qf-3').slice(0, 4).map(d => [txt(d), txt(d.parentElement.querySelector('[class*="di1qf-6"]'))]),
    mediaH: txt(cq('sc-16j1lpy-2')[3]), mediaTabs: qa('button.tab-button', RV).map(txt), media: cq('sc-1qec6v5-3').filter(i => i.tagName === 'IMG').map(img),
    filterH: txt(cq('sc-16j1lpy-2')[4]), search: (q('input', RV) || { getAttribute: () => '' }).getAttribute('placeholder'), chips: cq('u5e6fs-1').map(txt), moreFilters: txt(cq('sc-1kdk2cf-1')[0]), drops: cq('sc-1wzl89g-0').map(txt),
    range: txt(cq('sc-11r39gb-2')[0]), sortL: txt(cq('sc-13ijx62-4')[0]), sortV: txt(cq('sc-13ijx62-8')[0]), load: txt(cq('sc-16j1lpy-3')[0]),
    hist5: [] , items: cq('sc-16dr7i1-17').map(h => { let c = h; while (c && !(c.querySelector('.reportbutton') && c.querySelector('[class*="di1qf-3"]'))) c = c.parentElement; c = c || h.parentElement;
      return { title: txt(h), author: txt(cq('sc-16dr7i1-6', c)[0]), badges: cq('sc-1y8lyw5-2', c).map(txt), date: txt(cq('g3jej5-1', c)[0]), body: txt(qa('[class]', c).find(e => String(e.getAttribute('class')).split(/\s+/).some(k => /sc-16dr7i1-3$/.test(k)))),
        qa: cq('sc-1y8lyw5-3', c).map(k => [txt(k), txt(k.nextElementSibling)]), rec: txt(cq('sc-1i2zvgg-1', c)[0]), posted: txt(cq('sc-1grr47e-3', c)[0]), sub: cq('di1qf-3', c).map(d => [txt(d), txt(d.parentElement.querySelector('[class*="di1qf-6"]'))]), h: R(c)[3] }; }) };
  out.reviews.histRows = qa('span', RV).map(txt).map(t => t.match(/^(\d+) reviews? with (\d) stars?\.$/)).filter(Boolean).map(m => [m[2] === '1' ? '1 star' : m[2] + ' stars', m[1]]);
  // hidden popovers / dialogs present in the live DOM (rendered on interaction)
  const parts = (el) => { if (!el) return []; const out = []; const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT); let n; while ((n = w.nextNode())) { if (n.nodeType === 3) { const t = n.textContent.replace(/\s+/g, ' ').trim(); if (t && !(n.parentElement.closest('a'))) out.push(['t', t]); } else if (n.tagName === 'A') out.push(['a', txt(n), n.getAttribute('href') || '#']); else if (n.tagName === 'INPUT') out.push(['input', n.getAttribute('placeholder') || '']); } return out; };
  out.pops = { wish: parts(q('.card-wish_popover .tooltipV2-content')), expert: parts(q('.highlight-part-number .bubble')), earnSr: txt(q('[id^="loyalty-price_"]')),
    pro: parts(q('[class*=cms_background_layout_color_ca8863ad]')), edu: parts(q('[class*=cms_background_layout_color_b86130dc]')) };
  const BT = q('div.AccessoryPageBottom'); out.bottom = { title: txt(q('.title_headline', BT)), html: clean(q('.describe', BT)) };
  return out;
});
fs.writeFileSync(dir + 'extract.json', JSON.stringify(ex, null, 1));
await b.close();
console.log('ok blades', ex.blades.length, 'specs groups', ex.specs.groups.length, 'similar', ex.similar.items.length);
