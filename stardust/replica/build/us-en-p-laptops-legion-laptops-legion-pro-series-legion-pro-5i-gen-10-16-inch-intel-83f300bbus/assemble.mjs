// One-shot assembler: canon chrome (sliced from the gated campaign prototype — the live PDP header shows the same
// "Artificial Intelligence" active item + AI tier-2 row) + hand-authored product-detail main.
// Verbatim copy, hrefs, image URLs/alts come from extract.json (extract.mjs over the hydrated live dump).
// Section / blade heights per breakpoint come from geo.json (live rects) and are pinned (capture-state policy).
import fs from 'node:fs';
const S = 'us-en-p-laptops-legion-laptops-legion-pro-series-legion-pro-5i-gen-10-16-inch-intel-83f300bbus';
const root = new URL('../../../', import.meta.url).pathname;
const camp = fs.readFileSync(root + 'prototypes/us-en-ai-pcs-proposed.html', 'utf8').split('\n');
const ex = JSON.parse(fs.readFileSync(new URL('./extract.json', import.meta.url), 'utf8'));
const geo = JSON.parse(fs.readFileSync(new URL('./geo.json', import.meta.url), 'utf8'));
const rec = JSON.parse(fs.readFileSync(root + `current/pages/${S}.json`, 'utf8'));
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const abs = (u) => (u && u.startsWith('//') ? 'https:' + u : u);
const im = (o, w, h, extra = '') => (o ? `<img src="${esc(abs(o.src))}" alt="${esc(o.alt)}"${w ? ` width="${w}" height="${h}"` : ''}${extra}>` : '');

// ---- chrome: header / footer from the campaign prototype; live segment order Gaming|Business|Student|Creator ----
const bodyAt = camp.findIndex((l) => l.startsWith('<body'));
const mainAt = camp.findIndex((l) => l.startsWith('<main'));
const mainEnd = camp.findIndex((l) => l.startsWith('</main>'));
const footEnd = camp.findIndex((l) => l.startsWith('</footer>'));
let header = camp.slice(bodyAt + 1, mainAt).join('\n').trimEnd();
const seg = [...header.matchAll(/ {10}<li class="nav_item segmentItem">.*<\/li>\n/g)].map((m) => m[0]);
if (seg.length === 4) {
  const order = ['Gaming', 'Business', 'Student', 'Creator'].map((n) => seg.find((s) => s.includes(`<span>${n}</span>`)));
  const start = header.indexOf(seg[0]); const end = header.indexOf(seg[3]) + seg[3].length;
  header = header.slice(0, start) + order.join('') + header.slice(end);
}
const footer = camp.slice(mainEnd + 1, footEnd + 1).join('\n').trim();

// ---- pinned heights: --hd/--md (1440) and --hm/--mm (360): height + margin-top vs the previous block's bottom ----
const pin = (sel, i = 0, prevEnd = null) => {
  const v = {};
  for (const w of [1440, 360]) {
    const r = geo[sel][w][i]; const pe = prevEnd ? prevEnd(w) : r[1];
    v[w] = [r[3], r[1] - pe];
  }
  return `--hd:${v[1440][0]}px;--md:${v[1440][1]}px;--hm:${v[360][0]}px;--mm:${v[360][1]}px`;
};
const hv = (d, m) => `--hd:${d}px;--md:0px;--hm:${m}px;--mm:0px`;
const endOf = (sel, i = 0) => (w) => { const r = geo[sel][w][i]; return r[1] + r[3]; };
const topOf = (sel, i = 0) => (w) => geo[sel][w][i][1];

// ---- hidden popovers / dialogs (rendered on interaction live) ----
const popHtml = (parts) => parts.map(([k, t, h]) => (k === 'a' ? `<a href="${esc(h && !h.startsWith('javascript') ? h : '#')}">${esc(t)}</a>` : k === 'input' ? `<input type="text" aria-label="Label" placeholder="${esc(t)}">` : `<p>${esc(t)}</p>`)).join('');
// ---- hero: gallery + buy box ----
const stars = (partial, cls = '') => (cls ? starsBV(partial, cls) : `<span class="stars" aria-hidden="true">${[0, 1, 2, 3, 4].map((i) => (partial[i] ? `<span class="star-box"><span class="star-icon gray-icon"></span><span class="star-icon yellow-icon" style="${esc(partial[i])}"></span></span>` : '<span class="star-box"><span class="star-icon yellow-icon"></span></span>')).join('')}</span>`);
const starsBV = (partial, cls = '') => `<span class="stars${cls}" aria-hidden="true">${[0, 1, 2, 3, 4].map((i) => `<span class="star${partial[i] ? ' is-partial' : ''}"${partial[i] ? ` style="--fill:${partial[i].match(/[\d.]+%/)?.[0] || '50%'}"` : ''}></span>`).join('')}</span>`;
const crumbs = ex.crumbs.map(([h, t], i) => `<li>${i ? '<span class="sep" aria-hidden="true">&gt;</span>' : ''}${h ? `<a href="${esc(h)}">${esc(t)}</a>` : `<span aria-current="page">${esc(t)}</span>`}</li>`).join('');
const act = Math.max(0, ex.thumbs.findIndex((t) => t.active));
const thumbs = [...ex.thumbs.slice(act), ...ex.thumbs.slice(0, act)].map((t, i) => (t.video
  ? `<li class="thumb thumb--video"><span class="play" aria-hidden="true"></span></li>`
  : `<li class="thumb${i === 0 ? ' is-active' : ''}" data-src="${esc(abs(t.src).replace(/\?.*$/, ''))}">${im(t, 58, 58, ' loading="lazy"')}</li>`)).join('\n            ');
const specGroups = ex.specGroups.map((g) => `<div class="spec-group">
              <h3 class="spec-group__name">${esc(g.name)}</h3>
              <dl>${g.items.map((it) => `<div class="spec-row"><dt>${esc(it.n)}${it.tip ? `<button class="tip" type="button" aria-label="tool tip"></button>` : ''}</dt><dd>${esc(it.v)}</dd></div>`).join('')}</dl>
            </div>`).join('\n            ');
const offers = ex.offers.map((ps, i) => `<div class="offer offer--${i ? 'deal' : 'finance'}">${ps.map((p) => `<p>${p.html.replace(/<\/strong>/, `</strong>${p.imgs.map((x) => ` <img src="${esc(x.src)}" alt="${esc(x.alt)}" width="16" height="16">`).join('')}`)}</p>`).join('')}</div>`).join('');
const addons = ex.addons.map((a, i) => `<li class="addon"><input type="checkbox" id="addon-${i}" aria-label="${esc(a.name)}"><label for="addon-${i}">${a.html.replace(esc(a.name), `<b class="addon__name">${esc(a.name)}</b>`).replace(esc(a.price), `<b>${esc(a.price)}</b>`)}</label></li>`).join('');
const hero = `<section class="pdp-hero" style="${pin('.product-singlePdpHero', 0, topOf('main.main_content'))}">
  <nav class="pdp-crumbs" aria-label="breadcrumb"><ol>${crumbs}</ol></nav>
  <div class="pdp-hero__box">
    <div class="pdp-hero__main">
      <div class="pdp-gallery" data-gallery>
        <figure class="pdp-gallery__stage">${im(ex.mainImg, 576, 576, ' class="pdp-gallery__img"')}<button class="expand" type="button" aria-label="expand image"></button></figure>
        <div class="pdp-gallery__rail">
          <button class="rail-btn rail-btn--prev" type="button" aria-label="previous slide"></button>
          <div class="rail-view"><ul class="rail">
            ${thumbs}
          </ul></div>
          <button class="rail-btn rail-btn--next" type="button" aria-label="next slide"></button>
        </div>
      </div>
      <div class="pdp-buy">
        <div class="pdp-buy__partner">${im(ex.partner, 76, 64)}</div>
        <div class="pdp-buy__body">
          <p class="flag">${esc(ex.flag)}</p>
          <h1 class="pdp-title">${esc(ex.h1)}</h1>
          <div class="pdp-rating"><a href="${esc(ex.ratingHref)}" aria-label="${esc(ex.ratingLabel)}">${stars(ex.stars)}<span class="avg">${esc(ex.rating[0])}</span> <span class="cnt">${esc(ex.rating[1])}</span></a></div>
          <p class="switch-msg"><span class="bag" aria-hidden="true"></span>${esc(ex.switchMsg)}</p>
          <div class="pdp-price">
            <p class="est"><span>${esc(ex.est.label)}</span><button class="tip" type="button" aria-label="more information about est value" aria-describedby="est-tip"></button><span class="tip-pop" id="est-tip" role="tooltip" hidden><span class="t">${esc(ex.est.tipT)}</span> <span>${esc(ex.est.tipD)}</span></span><del>${esc(ex.est.price)}</del></p>
            <p class="now"><span class="price">${esc(ex.price)}</span> <span class="save">${esc(ex.save)}</span></p>
            <p class="katapult"><span class="k-logo" aria-hidden="true"></span><span>${esc(ex.kat[0])}</span> <b>${esc(ex.kat[1])}</b> <b>${esc(ex.kat[2])}</b> <a href="#">${esc(ex.kat[3])}</a></p>
            <div class="paypal" aria-hidden="true"><span class="pp-logo"></span></div>
            <div class="loyalty"><p><b>${esc(ex.loyalty.title)}</b> <span>${esc(ex.loyalty.earn)}</span><span class="sr-only">${esc(ex.pops.earnSr)}</span><button class="amt" type="button" aria-haspopup="dialog" aria-controls="rw-pop">${esc(ex.loyalty.amt)}</button> <span>${esc(ex.loyalty.msg)}</span></p><div class="le-popover" id="rw-pop" role="tooltip" hidden>${ex.loyalty.pop.map((t) => (/Join for free/.test(t) ? `<p>${esc(t.replace(/\s*Join for free$/, ''))} <a href="#">Join for free</a></p>` : `<p>${esc(t)}</p>`)).join('')}</div><a class="join" href="#">${esc(ex.loyalty.join)}</a></div>
          </div>
          <div class="pdp-ctas">
            <button class="add-to-cart" type="button">${esc(ex.cta)}</button>
            <div class="pdp-ctas__row"><button class="wish" type="button" aria-label="${esc(ex.wish)}: ${esc(ex.h1)}" aria-haspopup="dialog" aria-controls="wish-pop"><span class="sr-only">${esc(ex.wish)}</span></button><div class="wish-pop" id="wish-pop" hidden>${popHtml(ex.pops.wish)}</div><label class="compare"><input type="checkbox"><span>${esc(ex.compare)}</span></label></div>
          </div>
          <p class="delivery"><span>${esc(ex.delivery[0])}</span> <b>${esc(ex.delivery[1])}</b> <span>${esc(ex.delivery[2])}</span></p>
          <div class="sys-specs">
            ${ex.win.map((t) => `<p class="win">${esc(t)}</p>`).join('')}
            <div class="sys-specs__top"><h2>${esc(ex.specsTitle)}</h2><a href="${esc(ex.viewAll[0])}">${esc(ex.viewAll[1])}</a></div>
            ${specGroups}
            <p class="part"><span>${esc(ex.part[0])}</span>${esc(ex.part[1])}</p><div class="expert-pop" role="tooltip" hidden>${popHtml(ex.pops.expert)}</div>
          </div>
          <div class="offers"><h2>${esc(ex.offersTitle)}</h2>${offers}</div>
          <div class="addons"><h2>${esc(ex.addonsTitle)}</h2><ul>${addons}</ul></div>
        </div>
      </div>
    </div>
  </div>
</section>`;

// ---- jump tabs ----
const tabs = `<nav class="pdp-tabs" aria-labelledby="jump-h" style="${pin('nav.nav_container', 0, endOf('.product-singlePdpHero'))}"><h2 class="sr-only" id="jump-h">Jump links to product sections on this page</h2><ul>${ex.tabs.map(([h, t, a]) => `<li${a ? ' class="is-active"' : ''}><a href="${esc(h)}"${a ? ' aria-current="true"' : ''}>${esc(t)}</a></li>`).join('')}</ul></nav>`;

// ---- services ----
const sv = ex.services;
const services = `<section class="pdp-services" style="${pin('section.services_support_container', 0, endOf('nav.nav_container'))}">
  <p class="eyebrow">${esc(sv.pre)}</p>
  <h2 class="sec-title">${esc(sv.h)}</h2>
  <ul class="svc-list">${sv.items.map((it) => `
    <li class="svc"><div class="svc__icon">${im(it.icon, 60, 60)}</div><h3>${esc(it.name)}</h3><div class="svc__desc">${it.desc}</div><a href="${esc(it.link[0])}" aria-label="${esc(it.link[2])}">${esc(it.link[1])}</a></li>`).join('')}
  </ul>
</section>`;

// ---- feature blades ----
const B = 'section.features_container > .feature-blade';
const head = (b, tag = 'h2') => `${b.pre ? `<p class="eyebrow">${b.pre}</p>` : ''}${b.h ? `<${tag} class="blade-title">${b.h}</${tag}>` : ''}${b.desc ? `<div class="blade-desc">${b.desc}</div>` : ''}`;
const blade = (b, i) => {
  const st = pin(B, i, i ? endOf(B, i - 1) : topOf('section.features_container'));
  if (b.kind === '2') {
    return `<section class="blade blade--stack${b.img ? '' : ' blade--text'}" style="${st}">
  <div class="blade__text">${head(b)}</div>
  ${b.img ? `<figure class="blade__media${b.imgR && b.imgR[2] === 1440 ? ' is-full' : ''}">${im(b.img, b.imgR[2], b.imgR[3], ' loading="lazy"')}${b.caption ? `<figcaption>${esc(b.caption)}</figcaption>` : ''}</figure>` : ''}
</section>`;
  }
  if (b.kind === '1') {
    return `<section class="blade blade--split is-${b.side === 'right' ? 'media-left' : 'media-right'}" style="${st}">
  <div class="blade__text">${head(b)}${b.cta ? `<a class="blade-cta" href="${esc(b.cta[0])}">${esc(b.cta[1])}</a>` : ''}</div>
  <figure class="blade__media">${im(b.img, b.imgR[2], b.imgR[3], ' loading="lazy"')}${b.caption ? `<figcaption>${esc(b.caption)}</figcaption>` : ''}</figure>
</section>`;
  }
  if (b.kind === '8') {
    return `<section class="blade blade--cards" style="${st}" aria-label="Accessories">
  <ul class="acc-cards">${b.items.map((c) => `
    <li class="acc-card" style="background-image:url('${esc(abs(c.bg))}')"><div class="acc-card__text"><p class="acc-card__eyebrow">${c.sub}</p><h3>${c.h}</h3><div class="acc-card__desc">${c.desc}</div></div>${c.cta ? `<a class="acc-card__cta" href="${esc(c.cta[0])}" target="_blank" rel="noopener">${esc(c.cta[1])}</a>` : ''}</li>`).join('')}
  </ul>
  <button class="acc-next" type="button" aria-label="next"></button>
</section>`;
  }
  // blade_6 (multi-column / carousel) and blade_5 (wide slider)
  const wide = b.kind === '5';
  const off = b.items.length ? b.items[0].x : 0;
  return `<section class="blade blade--${wide ? 'slider' : 'cols'}${b.items.length === 3 && !wide ? ' cols-3' : ''}${b.items.some((c) => c.caption) ? ' has-cap' : ''}${off < 0 ? ' is-offset' : ''}" style="${st}">
  ${b.pre || b.h ? `<div class="blade__text">${head(b)}</div>` : ''}
  <div class="cols-view"><ul class="cols-track">${b.items.map((c) => `
    <li class="col">${wide ? `<div class="col__text"><h3 class="blade-title">${c.h}</h3><div class="blade-desc">${c.desc}</div></div>` : ''}<figure class="col__media">${im(c.img, 348, 272, ' loading="lazy"')}${c.caption ? `<figcaption>${esc(c.caption)}</figcaption>` : ''}</figure>${wide ? '' : `<h3 class="col__title${c.hfs && c.hfs < 24 ? ' is-sm' : ''}">${c.h}</h3><div class="col__desc">${c.desc}</div>`}</li>`).join('')}
  </ul></div>
  ${b.dots ? `<div class="dots" role="tablist">${b.dotLabels.map(([l, on]) => `<button type="button" role="tab" aria-label="${esc(l)}"${on ? ' aria-selected="true" class="is-active"' : ''}></button>`).join('')}</div>` : ''}
</section>`;
};
const features = `<div class="pdp-features" id="features" style="${pin('section.features_container', 0, endOf('section.services_support_container'))}">
${ex.blades.map(blade).join('\n')}
</div>`;

// ---- tech specs ----
const sp = ex.specs;
const specs = `<section class="pdp-specs" id="tech_specs" style="${pin('.product_techSpecs', 0, endOf('section.features_container'))}">
  <div class="pdp-specs__inner">
    <div class="pdp-specs__head"><h2>${esc(sp.h)}</h2><button class="collapse" type="button" aria-expanded="true" aria-label="${esc(sp.h)}"></button></div>
    ${sp.groups.map((g) => `<div class="spec-block"><h3>${esc(g.name)}</h3><dl>${g.rows.map((r) => `<div class="spec-line"><dt>${esc(r.t)}</dt><dd>${r.v}</dd></div>`).join('')}</dl></div>`).join('\n    ')}
    <div class="pdp-specs__disc">${sp.disc}</div>
  </div>
</section>`;
const merch = `<aside class="pdp-merch" style="${pin('section.merch-banner', 0, endOf('.product_techSpecs'))}"><p><span>${esc(ex.merch.text.slice(0, ex.merch.text.length / 2).trim() === ex.merch.text.slice(ex.merch.text.length / 2).trim() ? ex.merch.text.slice(0, ex.merch.text.length / 2).trim() : ex.merch.text)}</span>${im(ex.merch.img, 44, 50)}</p></aside>`;
const ports = `<section class="pdp-ports" id="ports_slots" style="${pin('div.ports_slots_container', 0, endOf('section.merch-banner'))}">
  <div class="pdp-ports__inner">
    <h2 class="sec-title">${esc(ex.ports.h)}</h2>
    ${im(ex.ports.img, 1216, 734, ' loading="lazy"')}
    <ol class="ports-list">${ex.ports.items.map(([n, t]) => `<li><span class="num">${esc(n)}</span>${esc(t)}</li>`).join('')}</ol>
  </div>
</section>`;

// ---- compare similar products (hydrated widget, replicated as captured) ----
const si = ex.similar;
const simCards = si.items.filter((it) => it.img).map((it) => `
      <li class="sim${it.current ? ' is-current' : ''}" style="${hv(953, 1366)}">
        <div class="sim__top">${it.current ? `<span class="badge">${esc(it.top)}</span>` : `${it.top ? `<span class="badge">${esc(it.top)}</span>` : ''}<button class="remove" type="button" aria-label="Remove ${esc(it.title)} from comparison list"></button>`}</div>
        <a class="sim__title" href="${esc(it.href === 'javascript:;' ? '#' : it.href)}">${esc(it.title)}</a>
        <a class="sim__rating" href="${esc(it.href === 'javascript:;' ? '#reviews' : it.href + '#reviews')}">${stars(['', '', '', '', 'width: 50%;'])}<span>${esc(it.rating[0])}</span> <span>${esc(it.rating[1])}</span></a>
        <a class="sim__img" href="${esc(it.href === 'javascript:;' ? '#' : it.href)}" tabindex="-1">${im({ src: it.img.src, alt: it.title }, 125, 125, ' loading="lazy"')}</a>
        <p class="sim__price">${esc(it.price)}</p>
        <ul class="sim__specs">${it.specs.map(([t, d, v]) => `<li${v ? '' : ' hidden'}><p class="t">${esc(t)}</p><p class="d">${esc(d)}</p></li>`).join('')}</ul>
        <div class="sim__shop">${it.shop ? `<a href="${esc(it.shop[0])}">${esc(it.shop[1])}</a>` : ''}</div>
        <label class="sim__compare"><input type="checkbox"><span>${esc(it.compare)}</span></label>
      </li>`).join('');
const similar = `<section class="pdp-similar" id="similar_products" style="${pin('section.similar_products_container', 0, endOf('div.ports_slots_container'))}">
  <p class="eyebrow">${esc(si.pre)}</p>
  <h2 class="sec-title">${esc(si.h)}</h2>
  <p class="sub">${esc(si.sub)}</p>
  <div class="chips">${si.chips.map(([t, s]) => `<button class="chip${s ? ' is-on' : ''}" type="button" aria-pressed="${s}">${esc(t)}</button>`).join('')}<button class="select-all" type="button">${esc(si.selectAll)}</button></div>
  <ul class="sim-list">${simCards}
      <li class="sim sim--add" style="${hv(953, 1366)}"><button type="button"><span class="plus" aria-hidden="true"></span>${esc(si.add)}</button></li>
  </ul>
  <a class="explore" href="${esc(si.explore[0])}">${esc(si.explore[1])}</a>
</section>`;

// ---- ratings & reviews (Bazaarvoice widget, replicated as captured) ----
const rv = ex.reviews;
const bar = (n, max) => `<span class="bar"><span style="width:${Math.round((n / max) * 100)}%"></span></span>`;
const maxH = Math.max(...rv.histRows.map((r) => +r[1]));
const seg5 = (v) => `<span class="segbar" style="--v:${v}">${'<i></i>'.repeat(5)}</span>`;
const rvH = [[432, 739], [527, 1129], [468, 854]];
const reviews = `<section class="pdp-reviews" id="reviews" style="${pin('section.reviews_container', 0, endOf('section.similar_products_container'))}">
  <div class="rv-tabs" role="tablist" style="${hv(75, 192)}"><button class="is-active" type="button" role="tab" aria-selected="true">${esc(rv.tabs[0])}</button><button type="button" role="tab" aria-selected="false">${esc(rv.tabs[1])}</button></div>
  <div class="rv-panel">
    <div class="rv-head" style="${hv(58, 58)}"><h2 class="rv-h">${esc(rv.h)}</h2></div>
    <div class="rv-sum" style="${hv(530, 895)}">
      <p class="rv-trust">${im(rv.trust, 173, 30)}</p>
      <div class="rv-box" style="${hv(217, 330)}">
        <div class="rv-snap"><h3>${esc(rv.snapH)}</h3><p>${esc(rv.snapSub)}</p><ul>${rv.histRows.map(([l, n]) => `<li><span class="l">${esc(l)}</span>${bar(+n, maxH * 1.22)}<span class="n">${esc(n)}</span></li>`).join('')}</ul></div>
        <div class="rv-overall"><h3>${esc(rv.overallH)}</h3><p><span class="big">${esc(rv.overall)}</span><span class="ov-r">${stars(['', '', '', '', 'width: 60%;'])}<a href="#reviews">${esc(rv.count)}</a></span></p></div>
      </div>
      <div class="rv-ai" style="${hv(131, 254)}"><h3>${esc(rv.sumH)}</h3><p class="note">${esc(rv.sumNote)}</p><p>${esc(rv.sum)}</p><a href="#">${esc(rv.more)}</a></div>
      <div class="rv-avg" style="${hv(122, 251)}"><h3>${esc(rv.avgH)}</h3><ul>${rv.avg.map(([t, v]) => `<li><span>${esc(t)}</span>${seg5(v)}<b>${esc(v)}</b></li>`).join('')}</ul></div>
    </div>
    <div class="rv-media" style="${hv(266, 266)}"><h3 class="rv-bandh">${esc(rv.mediaH)}</h3><div class="rv-mtabs">${rv.mediaTabs.map((t, k) => `<button type="button"${k ? '' : ' class="is-active"'}>${esc(t)}</button>`).join('')}</div><ul>${rv.media.map((m) => `<li>${im(m, 171, 171, ' loading="lazy"')}</li>`).join('')}</ul></div>
    <div class="rv-filter" style="${hv(273, 484)}"><h3>${esc(rv.filterH)}</h3><input type="search" aria-label="Search topics and reviews" placeholder="Search topics and reviews"><div class="rv-chips">${rv.chips.map((c) => `<button type="button">${esc(c)}</button>`).join('')}</div><button class="more" type="button">${esc(rv.moreFilters)}</button><div class="rv-drops">${rv.drops.map((d) => `<button type="button">${esc(d)}</button>`).join('')}</div></div>
    <div class="rv-sortbar" style="${hv(91, 93)}"><p>${esc(rv.range)}</p><button type="button"><span>${esc(rv.sortL)}</span> ${esc(rv.sortV)}</button></div>
    <ol class="rv-list">${rv.items.map((it, k) => `
      <li class="rv-item" style="${hv(rvH[k][0], rvH[k][1])}">
        <div class="rv-item__main">${stars(['', '', '', '', ''], ' is-cyan')}<h4>${esc(it.title)}</h4><p class="who">${esc(it.author)}</p><p class="badges"><span class="loyal" aria-hidden="true"></span>${esc(it.badges[0])}</p><p class="badges vp">${esc(it.badges[1])}</p><p class="date">${esc(it.date)}</p><p class="body">${esc(it.body)}</p>${it.qa.map(([q, v]) => `<p class="qa"><b>${esc(q)}</b> ${esc(v)}</p>`).join('')}${it.rec ? `<p class="rec">${esc(it.rec)}</p>` : ''}<p class="posted">${esc(it.posted)}</p><p class="helpful">Helpful? <span>(0)</span> <span>(0)</span> <button type="button">Report</button></p></div>
        <ul class="rv-item__sub">${it.sub.map(([t, v]) => `<li><span>${esc(t)}</span>${seg5(v)}<b>${esc(v)}</b></li>`).join('')}</ul>
      </li>`).join('')}
    </ol>
    <button class="rv-load" type="button">${esc(rv.load)}</button>
  </div>
</section>`;

const bottom = `<section class="pdp-legal" style="${pin('div.AccessoryPageBottom', 0, endOf('section.reviews_container'))}">
  <div class="pdp-legal__in"><button class="pdp-legal__toggle" type="button" aria-expanded="true" aria-controls="legal-body">${esc(ex.bottom.title)}<img class="read-arrow" src="https://p1-ofp.static.pub/fes/cms/2021/03/19/whntzne4ljm1szoy1zezkz50xy07tn042152.png" alt="" width="18" height="18"></button><div class="pdp-legal__body" id="legal-body">${ex.bottom.html}</div></div>
</section>`;

const dialogs = `<dialog class="pdp-dialog" id="dlg-pro" aria-label="Lenovo Pro">${popHtml(ex.pops.pro)}<button class="close" type="button" aria-label="Close" data-close></button></dialog>
<dialog class="pdp-dialog" id="dlg-edu" aria-label="Lenovo Education">${popHtml(ex.pops.edu.filter(([k, t]) => !(k === 'a' && !t)))}<button class="close" type="button" aria-label="Close" data-close></button></dialog>`;
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(rec.title)}</title>
<meta name="description" content="${esc(rec.description)}">
<link rel="canonical" href="${rec.url}">
<link rel="icon" href="assets/favicon.ico">
<link rel="preload" href="assets/fonts/NotoSans-Latin-Regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/NotoSans-Latin-Bold.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="canon.css">
<link rel="stylesheet" href="${S}.css">
</head>
<body class="tpl-site">
${header}

<main class="main_content tpl-pdp">
${hero}
${tabs}
${services}
${features}
${specs}
${merch}
${ports}
${similar}
${reviews}
${bottom}
${dialogs}
</main>

${footer}
<script src="canon.js" defer></script>
<script src="${S}.js" defer></script>
</body>
</html>
`;
const out = html.replace('<a href="#">Join Lenovo Pro &amp; Save</a>', '<a href="#dlg-pro" data-dialog="dlg-pro">Join Lenovo Pro &amp; Save</a>').replace(/(Verify &amp; Save )<a href="#">Learn More<\/a>/, '$1<a href="#dlg-edu" data-dialog="dlg-edu">Learn More</a>');
fs.writeFileSync(root + `prototypes/${S}-proposed.html`, out);
console.log('ok', out.length, 'undefined?', /undefined|NaN/.test(out), 'dialogs wired', (out.match(/data-dialog=/g) || []).length);
