#!/usr/bin/env node
/**
 * Re-authors the Lenovo US home page (landing archetype) prototype from a
 * runtime DOM snapshot of the live page: every text node, link, image and
 * accessible-name attribute is lifted from the snapshot; the MARKUP and class
 * vocabulary are ours (see stardust/prototypes/canon.css + index.css).
 * Hidden runtime content (prompt results, inactive tab panels, popovers,
 * modals, mobile duplicates) is mirrored hidden — content-diff counts it.
 *
 * Usage: node stardust/replica/build/index/gen.mjs <live-dom.html> <out.html>
 */
import fs from 'node:fs';
import * as cheerio from 'cheerio';

const [domFile, outFile] = process.argv.slice(2);
const $ = cheerio.load(fs.readFileSync(domFile, 'utf8'));

// ---------- helpers ----------
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = (s = '') => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const txt = (el) => $(el).clone().find('style,script').remove().end().text().replace(/\s+/g, ' ').trim();
const abs = (u) => (u && u.startsWith('//') ? `https:${u}` : u);
const A = (name, v) => (v === undefined || v === null ? '' : ` ${name}="${attr(v)}"`);
const linkAttrs = (a) => {
  const $a = $(a);
  return A('href', $a.attr('href')) + A('target', $a.attr('target') === '_blank' ? '_blank' : undefined)
    + ($a.attr('target') === '_blank' ? ' rel="noopener"' : '') + A('aria-label', $a.attr('aria-label')) + A('title', $a.attr('title'));
};
// icon id -> rehosted svg name, from the page's own inline mask rules
const ICON = {};
$('style').each((i, s) => {
  const re = /\.len-icon__([0-9A-Za-z-]+)\s*\{\s*mask-image:\s*url\("([^"]+)"\)/g; let m;
  while ((m = re.exec($(s).text()))) ICON[m[1]] = m[2].split('/').pop().replace('.svg', '').replace('lenovo-icon-', '');
});
const iconOf = (el) => {
  const c = ($(el).find('.len-icon-image').addBack('.len-icon-image').first().attr('class') || '').match(/len-icon__([0-9A-Za-z-]+)/);
  return c ? (ICON[c[1]] || 'arrow-right') : null;
};
const ico = (name, extra = '') => (name ? `<span class="len-icon-image ic-${name}${extra ? ` ${extra}` : ''}" aria-hidden="true"></span>` : '');
// <picture> with the live rendition sources (srcset/media are lifted values)
function pic(pictureOrImg, cls = '', { lazy = false, io = false } = {}) {
  const $p = $(pictureOrImg).is('picture') ? $(pictureOrImg) : $(pictureOrImg).closest('picture');
  const $img = $(pictureOrImg).is('img') ? $(pictureOrImg) : $p.find('img').first();
  const srcs = $p.find('source').toArray().map((s) => `<source media="${attr($(s).attr('media'))}" ${io ? 'data-srcset' : 'srcset'}="${attr(abs($(s).attr('srcset') || $(s).attr('data-srcset') || ''))}">`).filter((s) => !/srcset=""/.test(s)).join('');
  const src = abs($img.attr('src') || $img.attr('data-src') || '');
  const w = $img.attr('width'), h = $img.attr('height');
  const img = `<img${A('class', (io ? `${cls} lazy-io` : cls).trim() || undefined)}${src ? A(io ? 'data-src' : 'src', src) : ''}${A('alt', $img.attr('alt') ?? '')}${A('width', w)}${A('height', h)}${lazy ? ' loading="lazy"' : ''}>`;
  return srcs ? `<picture>${srcs}${img}</picture>` : img;
}
// sanitized transplant for HIDDEN subtrees (popovers, modals): semantic tags + accessible attrs only
const KEEP = new Set(['role', 'href', 'target', 'aria-label', 'title', 'alt', 'src', 'type', 'placeholder', 'viewbox', 'width', 'height', 'd', 'fill', 'xmlns', 'transform', 'opacity', 'stroke', 'stroke-width', 'aria-hidden', 'for', 'value']);
function clean(el) {
  return $(el).contents().toArray().map((n) => {
    if (n.type === 'text') return esc(n.data.replace(/\s+/g, ' '));
    if (n.type !== 'tag') return '';
    const tag = n.name.toLowerCase();
    if (['script', 'style', 'link', 'noscript', 'template'].includes(tag)) return '';
    if (tag === 'input' && ($(n).attr('type') || '') === 'hidden') return '';
    let at = '';
    for (const [k, v] of Object.entries(n.attribs || {})) if (KEEP.has(k.toLowerCase())) at += A(k === 'viewbox' ? 'viewBox' : k, k === 'src' ? abs(v) : v);
    if (tag === 'a' && n.attribs && n.attribs.target === '_blank') at += ' rel="noopener"';
    if (['img', 'br', 'input', 'source', 'path', 'rect', 'circle'].includes(tag)) return `<${tag}${at}>${['path', 'rect', 'circle'].includes(tag) ? `</${tag}>` : ''}`;
    return `<${tag}${at}>${clean(n)}</${tag}>`;
  }).join('');
}

// ======================================================================
// HEADER (canon chrome)
// ======================================================================
const H = $('nav.commonHeader').first();
const storeLi = H.find('.utility_nav_item_store').first();
const storePop = clean(storeLi.find('.popoverContent').first());
const utilLis = H.find('.top_masthead .utility_nav > li').toArray();
const a11yPop = txt($(utilLis[1]).find('.popover').first());
const contactPop = clean($(utilLis[2]).find('.popoverContent').first());
const secondLis = H.find('.second_utility_list > li').toArray();
const accountPop = clean($(secondLis[0]).find('.popoverContent').first());
const rewardsPop = clean($(secondLis[1]).find('.popoverContent').first());
const cartPop = clean($(secondLis[2]).find('.popoverContent').first());
const catItems = H.find('.category_dialog li').toArray().map((li) => `<li${A('aria-label', $(li).attr('aria-label'))}>${esc(txt(li))}</li>`).join('');
const clearSvg = H.find('svg.clear-icon').first();
const clearIcon = clearSvg.length ? `<svg class="clear-icon" role="button" tabindex="0" aria-label="Clear Search" width="16" height="16" viewBox="0 0 16 16">${clean(clearSvg)}</svg>` : '';
const catArrow = H.find('.arrow_container svg').first();
const supNav = H.find('.sup_nav > li.normal_nav_item').toArray().map((li) => {
  const a = $(li).find('a').first(); const p = a.find('p').length;
  return `<li class="nav_item"><a${linkAttrs(a)}><div class="nav_item_title"><div class="text"><span>${p ? `<p>${esc(txt(a))}</p>` : esc(txt(a))}</span></div></div></a></li>`;
}).join('\n          ');
const segNav = H.find('.segment_nav_container > li.segmentItem').toArray().map((li) => {
  const a = $(li).find('a').first(); const b = $(li).find('button').first();
  return `<li class="nav_item segmentItem"><a class="segmentItemLink"${linkAttrs(a)}><div class="nav_item_title"><div class="text"><span>${esc(txt(a))}</span></div></div></a><div class="accessibilityIconSegment"><button class="iconfont-arrowDown segmentArrowIcon" type="button"${A('aria-label', b.attr('aria-label'))}></button></div></li>`;
}).join('\n          ');
const navLabels = {};
H.find('[aria-label]').each((i, e) => { const l = $(e).attr('aria-label'); if (/navigation$/.test(l)) navLabels[l] = true; });

// promo strip
const promo = $('.merchandizingBanner').first();
const promoSlides = promo.find('article.merchandizingItem').toArray();
const promoHtml = promoSlides.map((art, i) => {
  const ft = $(art).find('.filterText').first();
  const link = $(art).find('a.carsouelLink').first();
  const body = clean(ft).replace(/<strong><\/strong>/g, '').replace(/(<em>)+/g, '<em>').replace(/(<\/em>)+/g, '</em>');
  return `<article class="merchandizingItem"${A('aria-label', $(art).attr('aria-label'))}${i ? ' inert' : ''}><a class="carsouelLink"${A('href', link.attr('href'))} tabindex="-1" aria-hidden="true"${A('aria-label', link.attr('aria-label'))}></a><div class="filterText">${body.trim()}</div></article>`;
}).join('\n          ');
const promoPrevLabel = (promo.find('.preInfoBtn').attr('aria-label') || '').replace(/item \d+ of/, 'item 1 of');
const promoNextLabel = (promo.find('.nextInfoBtn').attr('aria-label') || '').replace(/item \d+ of/, 'item 1 of');
const promoStatus = (txt(promo.find('p.sr-only').first()) || '').replace(/item \d+ of/, 'item 1 of');

const header = `<div class="site-header">
  <nav class="commonHeader" aria-label="head navigation">
    <div class="masthead top_masthead">
      <div class="top_masthead_container">
        <div class="header_right" aria-label="stores and utility navigation">
          <ul class="utility_nav">
            <li class="utility_nav_item utility_nav_item_store relative">
              <div class="utility_nav_item_icon utility_nav_item_store_icon relative">
                <a${linkAttrs(storeLi.find('a').first())}><p><strong>${esc(txt(storeLi.find('strong').first()))}</strong>&nbsp; ${esc(txt(storeLi.find('a p').first()).replace(/^\S+\s+/, ''))}</p></a>
                <button class="store_arrow iconfont-arrowDown" type="button"${A('aria-label', storeLi.find('button.store_arrow').attr('aria-label'))} aria-expanded="false"></button>
              </div>
              <div class="popover"><div class="popoverContent">${storePop}</div></div>
            </li>
            <li class="utility_nav_item relative">
              <div class="utility_nav_item_icon relative" tabindex="0" role="button" aria-haspopup="true" aria-expanded="false" aria-label="Accessibility"><div class="utility-content"><span class="icon-picker-container font-16"><span class="iconfont-accessibility"></span></span><span class="icon-picker-container font-16 active_icon"><span class="iconfont-accessibility"></span></span></div></div>
              <div class="popover popover_title">${esc(a11yPop)}</div>
            </li>
            <li class="utility_nav_item relative">
              <div class="utility_nav_item_icon relative" tabindex="0" role="button" aria-haspopup="true" aria-expanded="false" aria-label="Contact Us"><div class="utility-content"><span class="icon-picker-container font-16"><span class="iconfont-contact-us-pc"></span></span><span class="icon-picker-container font-16 active_icon"><span class="iconfont-contact-us-pc"></span></span></div></div>
              <div class="accessibilityIcon" role="button" tabindex="0" aria-label="Use Enter key to expand" aria-expanded="false"><span class="iconfont-arrowDown"></span></div>
              <div class="popover"><div class="popoverContent">${contactPop}</div></div>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="masthead main_masthead">
      <div class="header_left">
        <a class="logo" href="https://www.lenovo.com/us/en/?Redirect=False" aria-label="Go to Home"><img src="https://p3-ofp.static.pub/fes/cms/2023/03/22/8hjmcte754uauw07ypikjkjtx0m5ib450914.svg" alt="homepage" width="124" height="40"></a>
        <button class="header_skip_main" type="button">skip to main content</button>
      </div>
      <div class="search-box" aria-label="search">
        <div class="searchbox_container">
          <div class="search">
            <form class="search_view" role="search" action="https://www.lenovo.com/us/en/search" autocomplete="off">
              <div class="category_container" aria-label="Category" aria-expanded="false">
                <div class="category_selected" title="All">All</div>
                <div class="arrow_container"><svg width="16" height="9.631" viewBox="0 0 16 9.631" aria-hidden="true">${clean(catArrow)}</svg></div>
              </div>
              <div class="category_dialog"><ul aria-label="Category">${catItems}</ul></div>
              <div class="input-wrapper">
                <input id="commonHeaderSearch" type="text" name="commonHeaderSearch" placeholder="What are you looking for today ?" autocomplete="off">
                <span class="search-placeholder" aria-hidden="true"><span class="cursor"></span></span>
              </div>
              ${clearIcon}
              <div class="searchIcon" role="button" aria-label="search"></div>
            </form>
          </div>
        </div>
      </div>
      <div class="header_right" aria-label="account and cart navigation">
        <ul class="utility_nav second_utility_list">
          <li class="utility_nav_item relative">
            <div class="utility_nav_item_icon relative">
              <div class="utility-content"><span class="icon-picker-container font-24"><span class="iconfont-account-white"></span></span><span class="icon-picker-container font-24 active_icon"><span class="iconfont-account-white"></span></span><span class="account-label">Sign In / Create Account</span></div>
            </div>
            <button class="accessibilityIcon" type="button" aria-label="Use Enter key to expand"><span class="iconfont-arrowDown"></span></button>
            <div class="popover"><div class="popoverContent">${accountPop}</div></div>
          </li>
          <li class="utility_nav_item relative">
            <a class="utility_nav_item_icon relative" href="https://www.lenovo.com/us/en/rewards/" aria-label="My Lenovo Rewards"><div class="utility-content"><span class="icon-picker-container font-24"><span class="iconfont-rewards"></span></span><span class="icon-picker-container font-24 active_icon"><span class="iconfont-rewards"></span></span></div></a>
            <button class="accessibilityIcon" type="button" aria-label="Use Enter key to expand"><span class="iconfont-arrowDown"></span></button>
            <div class="popover"><div class="popoverContent">${rewardsPop}</div></div>
          </li>
          <li class="utility_nav_item relative">
            <a class="utility_nav_item_icon relative" href="https://www.lenovo.com/us/en/cart" aria-label="Cart"><div class="utility-content"><span class="icon-picker-container font-24"><span class="iconfont-cart"></span></span><span class="icon-picker-container font-24 active_icon"><span class="iconfont-cart"></span></span></div></a>
            <div class="popover"><div class="popoverContent">${cartPop}</div></div>
          </li>
        </ul>
      </div>
    </div>
    <div class="nav_view">
      <div aria-label="main navigation">
        <ul class="sup_nav">
          ${supNav}
        </ul>
      </div>
      <div class="segment_nav_wrapper" aria-label="special interests navigation">
        <ul class="segment_nav_container">
          ${segNav}
        </ul>
      </div>
    </div>
  </nav>
  <section class="merchandizingBanner" aria-label="Merchandise banner">
    <div class="content">
      <div class="banner-carousel" data-carousel="promo">
        <button type="button" class="slideBtn preInfoBtn"${A('aria-label', promoPrevLabel)}><span class="iconfont-homehero-left-arrow"></span></button>
        <button type="button" class="slideBtn nextInfoBtn"${A('aria-label', promoNextLabel)}><span class="iconfont-homehero-right-arrow"></span></button>
        <div class="swiper-wrapper">
          ${promoHtml}
        </div>
        <p class="sr-only" aria-live="polite">${esc(promoStatus)}</p>
      </div>
    </div>
  </section>
</div>`;

// ======================================================================
// HERO CAROUSEL
// ======================================================================
const car = $('.cmp-carousel').first();
const heroSlides = car.find('.cmp-carousel__item').toArray().map((it, i) => {
  const $it = $(it);
  const logo = $it.find('.len-hero-banner__wrapper-bg-inner-content-logo img, .len-hero-banner__wrapper-bg-inner-content-wrap picture img').first();
  const h1 = $it.find('h1').first();
  const h1Html = h1.html().replace(/<br\s*\/?>/g, '<br>').replace(/\s+/g, ' ').trim();
  const body = txt($it.find('p.body-large').first());
  const ctas = $it.find('.action a.cta').toArray().map((a) => {
    const isLink = /cta-button__link/.test($(a).attr('class') || '') || /link/.test($(a).attr('class') || '');
    return `<a class="${isLink ? 'cta-link cta-link--hero' : 'cta-btn cta-btn--lg'}"${linkAttrs(a)}><span>${esc(txt(a))}</span></a>`;
  }).join('\n            ');
  const media = $it.find('.landing-hero-media img').first();
  const wmClass = logo.length && /copilot/.test(logo.attr('src') || '') ? 'wm-copilot' : 'wm-iw';
  return `<div class="home-hero__slide${i ? '' : ' is-active'}" role="group" aria-roledescription="slide"${A('aria-label', $it.attr('aria-label'))}${i ? ' inert' : ''}>
      <div class="home-hero__inner">
        <div class="home-hero__copy">
          <div class="home-hero__wordmark">${logo.length ? pic(logo, wmClass) : ''}</div>
          <div class="home-hero__titles">
            <h1>${h1Html}</h1>
            <p class="home-hero__body">${esc(body)}</p>
          </div>
          <div class="home-hero__actions">
            ${ctas}
          </div>
        </div>
        <div class="home-hero__media">${pic(media, '')}</div>
      </div>
    </div>`;
}).join('\n    ');
const ctrl = (bar, { pause = false } = {}) => {
  const btns = $(bar).find('button').toArray();
  const lab = (re) => { const b = btns.find((x) => re.test($(x).attr('aria-label') || '')); return b ? $(b).attr('aria-label') : undefined; };
  const prev = lab(/previous/i), next = lab(/next/i), play = lab(/autoplay the/i), paus = lab(/pause/i);
  return `<div class="carousel-controls${pause ? ' carousel-controls--hero' : ''}">
      <div class="carousel-controls__arrows">
        <button class="icon-btn" type="button"${A('aria-label', prev)} data-dir="-1">${ico('arrow-left')}</button>
        <button class="icon-btn" type="button"${A('aria-label', next)} data-dir="1">${ico('arrow-right')}</button>
      </div>
      <div class="carousel-controls__bar"><div class="carousel-controls__track"></div></div>${pause ? `
      <button class="icon-btn carousel-controls__play" type="button"${A('aria-label', play)} hidden>${ico('play')}</button>
      <button class="icon-btn carousel-controls__pause" type="button"${A('aria-label', paus)}>${ico('pause')}</button>` : ''}
    </div>`;
};
const hero = `<section class="home-hero" aria-roledescription="carousel" data-carousel="hero">
  <div class="home-hero__track">
    ${heroSlides}
  </div>
  ${ctrl(car.find('.motion-carousel-controls-bar').first(), { pause: true })}
</section>`;

// ======================================================================
// CARD GRIDS
// ======================================================================
const grids = $('.custom-container .card-grid').toArray();
const sectionTitle = (g, id) => {
  const t = $(g).find('.cmp-title__text').first();
  if (!t.length) return '';
  const tag = t[0].name;
  const d = $(g).find('.cmp-title__description').first();
  return `<div class="section-title">
      <${tag} id="${id}" class="section-title__text">${esc(txt(t))}</${tag}>${d.length ? `\n      <p class="section-title__desc">${esc(txt(d))}</p>` : ''}
    </div>`;
};
const gridCtrl = (g) => { const bar = $(g).find('.motion-carousel-controls-bar').first(); return bar.length ? ctrl(bar) : ''; };

function catGrid(g) {
  const cards = $(g).find('.len-card').toArray().map((c) => {
    const a = $(c).find('a').first();
    return `<div class="cat-card"><div class="cat-card__box"><a${linkAttrs(a)}><span class="cat-card__asset">${pic($(c).find('img').first(), '', { io: true })}</span><p class="cat-card__title">${esc(txt($(c).find('.len-card__content-title').first()))}</p></a></div></div>`;
  }).join('\n      ');
  return `<section class="card-grid card-grid--categories">
    <div class="card-rail card-rail--rows">
      <div class="card-grid__cards cat-cards">
      ${cards}
      </div>
      ${gridCtrl(g)}
    </div>
  </section>`;
}
// Neptune card: live computed mask-image reads lenovo-icon-community (content-diff, measure.mjs) while the
// stitched live capture paints the arrow-right chevron — the painted state is mirrored; logged as a residual.
function imgCard(c, lazy) {
  const a = $(c).find('a.cta-anchor-query-param').first();
  const img = $(c).find('.len-card__bg-image img').first();
  return `<div class="img-card"><a${linkAttrs(a)}${a.attr('href') ? '' : ' role="link"'}>${pic(img, 'img-card__bg', { io: true })}<div class="img-card__content"><div class="img-card__title-row"><h3 class="img-card__title">${esc(txt($(c).find('.len-card__content-title').first()))}</h3>${ico('arrow-right')}</div><div class="img-card__text"><p>${esc(txt($(c).find('.len-card__content-text').first()))}</p></div></div></a></div>`;
}
function imgGrid(g, id, rail) {
  const cards = $(g).find('.len-card').toArray().map((c) => imgCard(c, false)).join('\n        ');
  return `<section class="card-grid" aria-labelledby="${id}"${rail ? ' data-carousel="cards"' : ''}>
    ${sectionTitle(g, id)}
    <div class="card-rail${rail ? '' : ' card-rail--rows'}">
      <div class="card-grid__cards img-cards ${rail ? 'img-cards--rail' : 'img-cards--3'}">
        ${cards}
      </div>
      ${gridCtrl(g)}
    </div>
  </section>`;
}
function iconGrid(g, id) {
  const cards = $(g).find('.len-card').toArray().map((c) => {
    const a = $(c).find('.len-card__content-cta a').first();
    return `<div class="icon-card"><div class="icon-card__inner">${ico(iconOf($(c).find('.icon-container')), 'icon-card__icon')}<h3 class="icon-card__title">${esc(txt($(c).find('.len-card__content-title').first()))}</h3><p class="icon-card__text">${esc(txt($(c).find('.len-card__content-text').first()))}</p><a class="icon-card__link"${linkAttrs(a)}><span>${esc(txt(a))}</span></a></div></div>`;
  }).join('\n      ');
  return `<section class="card-grid" aria-labelledby="${id}">
    ${sectionTitle(g, id)}
    <div class="card-rail card-rail--rows">
      <div class="card-grid__cards icon-cards">
      ${cards}
      </div>
      ${gridCtrl(g)}
    </div>
  </section>`;
}

// ======================================================================
// PROMPT GROUP
// ======================================================================
const pr = $('.len-prompt').first();
const promptBtn = (b, extra = '') => `<button type="button" class="prompt__btn${extra}"${A('aria-label', $(b).attr('aria-label'))}${A('title', $(b).attr('title'))}><span>${esc(txt(b))}</span></button>`;
const promptBtns = pr.find('form .len-prompt-container__actions-group-list-btn').toArray().map((w, i) => {
  const mob = /visible-mobile/.test($(w).attr('class'));
  return promptBtn($(w).find('button').first(), mob ? ' visible-mobile' : ' visible-desktop').replace('<button', `<button data-prompt="${mob ? 'm' : 'd'}"`);
}).join('\n        ');
const resultBtns = pr.find('.len-prompt-container__results-content-actions-prompts button').toArray().map((b) => promptBtn(b).replace('<button', '<button tabindex="-1"')).join('\n          ');
const startOver = pr.find('.len-prompt-container__results-content-actions > button, .len-prompt-container__results-content-actions > .cta-button__wrap button').last();
const results = pr.find('.len-prompt-xf-path').toArray().map((x, i) => {
  const $x = $(x);
  const mediaImg = $x.find('.len-prompt-container__results-content--media img').first();
  const descs = $x.find('.len-prompt-container__results-description-container').toArray().map((d) => {
    const mob = /mobile-only/.test($(d).attr('class'));
    const ctl = $(d).find('.len-prompt-container__results-video-controls').first();
    const ctls = ctl.find('button, a').toArray().map((b) => (b.name === 'a'
      ? `<a class="cta-btn cta-btn--sm"${linkAttrs(b)}><span>${esc(txt(b))}</span></a>`
      : `<button class="cta-outline" type="button"${A('aria-label', $(b).attr('aria-label'))}${A('title', $(b).attr('title'))}>${ico(iconOf(b) || 'play')}<span>${esc(txt(b))}</span></button>`)).join('');
    return `<div class="prompt-result__desc ${mob ? 'mobile-only' : 'desktop-only'}"><p class="prompt-result__desc-text">${esc(txt($(d).find('.len-prompt-container__results-content--description').first()))}</p><div class="prompt-result__controls">${ctls}</div></div>`;
  });
  const items = $x.find('.prompt-item').toArray().map((it) => {
    const a = $(it).find('a.prompt-item-action-container').first();
    const b = $(it).find('a.prompt-item-action').first();
    return `<div class="prompt-item"><a class="prompt-item__link"${linkAttrs(a)}><h5 class="prompt-item__title">${esc(txt(a.find('h5')))}</h5><p class="prompt-item__desc">${esc(txt(a.find('p')))}</p></a><a class="prompt-item__arrow"${linkAttrs(b)}><img src="${attr(b.find('img').attr('src') || '')}" alt="${attr(b.find('img').attr('alt') || '')}" width="16" height="16"></a></div>`;
  }).join('');
  const modal = $x.find('.modal').first();
  const mediaSrc = abs(mediaImg.attr('src') || '');
  const mediaData = abs(mediaImg.attr('data-src') || mediaImg.closest('picture').find('source').first().attr('srcset') || '');
  return `<div class="prompt-result" data-result="${i}" hidden>
          <div class="prompt-result__media-row">
            <div class="prompt-result__media"><img class="prompt-result__img"${mediaSrc ? A('src', mediaSrc) : ''}${!mediaSrc && mediaData ? A('data-src', mediaData) : ''}${A('alt', mediaImg.attr('alt') || '')}>${descs[0] || ''}</div>
            ${descs.slice(1).join('')}
            <div class="prompt-result__items">${items}</div>
          </div>
          ${modal.length ? `<div class="modal" hidden><div class="modal__dialog"><div class="modal__header"><button class="modal__close" type="button"${A('aria-label', modal.find('button').attr('aria-label'))}><img src="assets/icons/lenovo-icon-close.svg" alt="" width="16" height="16"></button></div><div class="modal__body"></div></div></div>` : ''}
        </div>`;
}).join('\n        ');
const prompt = `<section class="prompt" aria-labelledby="prompt-h">
    <div class="prompt__bg" aria-hidden="true">${pic(pr.find('.len-prompt-container__bg-image--main picture').first().find('img').first())}<div class="prompt__alpha">${pr.find('.len-prompt-container__bg-image--main picture').slice(1).toArray().map((p) => `<span><img alt="${attr($(p).find('img').attr('alt') || '')}"></span>`).join('')}</div></div>
    <div class="prompt__actions">
      <h2 id="prompt-h" class="prompt__heading">${esc(txt(pr.find('h2').first()))}</h2>
      <input type="hidden" aria-label="column" class="column-counter">
      <form class="prompt__list" onsubmit="return false">
        ${promptBtns}
      </form>
    </div>
    <div class="prompt__results">
      <div class="prompt__results-inner">
        <div class="prompt__results-actions">
          <div class="prompt__results-prompts">
          ${resultBtns}
          </div>
          <button type="button" class="cta-btn prompt__restart" tabindex="-1"${A('aria-label', startOver.attr('aria-label'))}${A('title', startOver.attr('title'))}><span>${esc(txt(startOver))}</span>${ico('refresh')}</button>
        </div>
        <p class="prompt__results-title">${esc(txt(pr.find('.len-prompt-container__results-content--title').first()))}</p>
        <div class="prompt__results-render">
        ${results}
        </div>
      </div>
    </div>
  </section>`;

// ======================================================================
// REWARDS BANNER
// ======================================================================
const cpb = $('.content-package-banner').first();
const cpbBg = cpb.find('.len-content-package-banner-bg-image > .picture-tag picture').first();
const cpbAlpha = cpb.find('.alpha-wrap picture').toArray().map((p) => pic($(p).find('img').first())).join('\n        ');
const cpbActions = cpb.find('.content-package-banner-actions a').toArray().map((a) => (/link/.test($(a).attr('class') || '')
  ? `<a class="cta-link rewards__link"${linkAttrs(a)}><span>${esc(txt(a))}</span></a>`
  : `<a class="cta-btn"${linkAttrs(a)}><span>${esc(txt(a))}</span></a>`)).join('\n          ');
const rewards = `<section class="rewards" aria-labelledby="rewards-h">
    <div class="rewards__bg" aria-hidden="true">
      ${pic(cpbBg.find('img').first(), 'rewards__bg-main')}
      <div class="rewards__alpha">
        ${cpbAlpha}
      </div>
    </div>
    <div class="rewards__left">
      <div class="rewards__content">
        <div class="rewards__copy">
          <p id="rewards-h" class="rewards__title">${esc(txt(cpb.find('.display-headline-4xlg').first()))}</p>
          <p class="rewards__body">${esc(txt(cpb.find('.body-large').first()))}</p>
        </div>
        <div class="rewards__actions">
          ${cpbActions}
        </div>
      </div>
    </div>
    <div class="rewards__list">
      ${cpb.find('.content-package-banner__list p').toArray().map((p) => `<p>${esc(txt(p))}</p>`).join('\n      ')}
    </div>
  </section>`;

// ======================================================================
// STORIES (section header + tabs)
// ======================================================================
const sh = $('.section-header .cmp-title').last();
const shLink = sh.find('a').first();
const tabs = $('.len-tabs').first();
const tabLis = tabs.find('.len-tabs__tab').toArray();
const panels = tabs.find('.len-tabs__tabpanel').toArray();
const tabList = tabLis.map((li, i) => `<li class="tabs__tab${i ? '' : ' is-active'}" role="tab" aria-selected="${i ? 'false' : 'true'}" tabindex="${i ? -1 : 0}" id="tab-${i}" aria-controls="tp-${i}"><span class="tabs__tab-title">${esc(txt($(li).find('.len-tabs__tab-title')))}</span>${ico('arrow-down', 'tabs__tab-icon')}</li>`).join('\n        ');
const panelHtml = panels.map((p, i) => {
  const $p = $(p);
  const h = $p.find('.tab-content-header .cmp-title__text').first();
  const d = $p.find('.tab-content-header .cmp-title__description').first();
  const cta = $p.find('.tab-content-header a').first();
  const q = $p.find('.quote-card').first();
  const l = $p.find('.list-card').first();
  const stats = $p.find('.tab-card--stat').toArray().map((s) => `<div class="stat-card"><h5 class="stat-card__value">${esc(txt($(s).find('.len-card__content-title')))}</h5><p class="stat-card__label">${esc(txt($(s).find('.len-card__content-text')))}</p></div>`).join('\n              ');
  return `<div class="tabs__panel${i ? '' : ' is-active'}" role="tabpanel" id="tp-${i}" aria-labelledby="tab-${i}"${i ? ' hidden' : ''}>
        <div class="story">
          <div class="story__head">
            <div class="story__head-copy">
              <${h[0] ? h[0].name : 'h4'} class="section-title__text">${esc(txt(h))}</${h[0] ? h[0].name : 'h4'}>
              <p class="section-title__desc">${esc(txt(d))}</p>
            </div>
            <div class="story__head-cta"><a class="cta-btn cta-btn--sm"${linkAttrs(cta)}><span>${esc(txt(cta))}</span></a></div>
          </div>
          <div class="story__cards">
            <div class="quote-card">
              <div class="quote-card__top">
                <h3 class="eyebrow">${esc(txt(q.find('.quote-card-title')))}</h3>
                <p class="quote-card__quote">${esc(txt(q.find('.quote-card-quote')))}</p>
              </div>
              <div class="quote-card__author">
                <h4 class="quote-card__name">${esc(txt(q.find('.quote-card-author-name')))}</h4>
                <p class="quote-card__role">${esc(txt(q.find('.quote-card-author-subtext')))}</p>
              </div>
            </div>
            <div class="list-card">
              <p class="eyebrow">${esc(txt(l.find('.list-card-content__eyebrow')))}</p>
              <ul class="list-card__list">
                ${l.find('li').toArray().map((li) => `<li>${ico(iconOf(li))} ${esc(txt(li))}</li>`).join('\n                ')}
              </ul>
            </div>
            <div class="stat-cards">
              ${stats}
            </div>
          </div>
        </div>
      </div>`;
}).join('\n      ');
const stories = `<section class="stories" aria-labelledby="stories-h">
    <div class="stories__head">
      <div class="stories__head-title"><h2 id="stories-h" class="section-title__text">${esc(txt(sh.find('h2').first()))}</h2></div>
      <div class="stories__head-link"><a class="cta-link stories__more"${linkAttrs(shLink)}><span>${esc(txt(shLink))}</span></a></div>
    </div>
    <div class="tabs" data-tabs>
      <ol class="tabs__list" role="tablist">
        ${tabList}
      </ol>
      ${panelHtml}
    </div>
  </section>`;

// ======================================================================
// FOOTER (canon chrome)
// ======================================================================
const F = $('footer.commonFooter').first();
const social = F.find('ul.social_icon').first().find('li').toArray().map((li) => {
  const a = $(li).find('a').first(), im = a.find('img').first();
  return `<li><a${linkAttrs(a)}><img src="${attr(abs(im.attr('src')))}" alt="${attr(im.attr('alt') || '')}" width="30" height="30"></a></li>`;
}).join('\n        ');
const navCols = F.find('.pc_footer_nav > .item').toArray().map((col) => `<div class="item">
        <h2>${esc(txt($(col).find('h2').first()))}</h2>
        <ul>
          ${$(col).find('li').toArray().map((li) => { const a = $(li).find('a').first(); const t = txt(li); return a.length && txt(a) ? `<li><a${linkAttrs(a)}>${esc(txt(a))}</a></li>` : `<li><span class="as-link">${esc(t)}${a.length ? `<a${linkAttrs(a)}></a>` : ''}</span></li>`; }).join('\n          ')}
        </ul>
      </div>`).join('\n      ');
const legal = F.find('.copyright .link a').toArray().map((a) => `<a${linkAttrs(a)}${$(a).attr('href') ? '' : ' role="button"'}>${esc(txt(a))}</a>`).join('');
const footer = `<footer class="commonFooter">
  <div class="common_footer">
    <div class="footer_header">
      <div class="footer_email">
        <div class="title_label email_label">${clean(F.find('.email_label').first()).trim()}</div>
        <div class="select_view email_view">
          <form class="email_style" onsubmit="return false"><label for="footer-email" aria-label="Enter Email address">Email</label><input id="footer-email" type="email" autocomplete="email"></form>
          <button class="toggle_mask_icon iconfont-homehero-right-arrow" type="button" aria-label="Click to go Next/Subscribe"></button>
        </div>
        <div class="err_email_message" hidden>${esc(txt(F.find('.err_email_message').first()))}</div>
        <div class="empty_email_message" hidden>${esc(txt(F.find('.empty_email_message').first()))}</div>
        <div class="footer_mask" hidden>
          <div class="sr-only">Lenovo Email Signup</div>
          <button class="closeIframe" type="button" aria-label="Close subscribe email modal">×</button>
          <iframe title="Footer Mask" aria-hidden="true" src="about:blank"></iframe>
          <div class="sr-only" aria-hidden="true">Lenovo Email Signup</div>
        </div>
      </div>
      <ul class="social_icon desktop-only">
        ${social}
      </ul>
      <div class="select_country">
        <div class="title_label" id="country_headline">Select Country / Region:</div>
        <div class="select_view country_view" aria-labelledby="country_headline">
          <img class="flag" src="https://p2-ofp.static.pub/ShareResource/flag/unitedstates-flag.bbbe4cdb1283dffa.svg" alt="" width="30" height="28">
          <input class="country_input" type="text" value="United States" placeholder="Please select a Country / Region" aria-labelledby="country_headline" readonly>
          <span class="select_arrow" aria-hidden="true"></span>
        </div>
      </div>
    </div>
    <ul class="social_icon mobile-only">
        ${social}
    </ul>
    <div class="software_download">
      ${F.find('.software_download a').toArray().map((a) => `<a${linkAttrs(a)}><img src="${attr(abs($(a).find('img').attr('src')))}" alt="${attr($(a).find('img').attr('alt') || '')}" width="109" height="33"></a>`).join('\n      ')}
    </div>
    <div class="pc_footer_nav">
      ${navCols}
    </div>
    <div class="copyright">
      <div class="all_right">${esc(txt(F.find('.all_right').first()))}</div>
      <div class="link">${legal}</div>
    </div>
  </div>
</footer>`;

// page-level modals (video / xf / form) — mirrored hidden
const pageModals = $('main > .modal').toArray().map((m) => `<div class="modal" hidden><div class="modal__dialog"><div class="modal__header"><button class="modal__close" type="button"${A('aria-label', $(m).find('button').first().attr('aria-label'))}><img src="assets/icons/lenovo-icon-close.svg" alt="" width="16" height="16"></button></div><div class="modal__body"></div></div></div>`).join('\n');

// ======================================================================
// PAGE
// ======================================================================
const g = grids;
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc($('title').first().text().trim())}</title>
<meta name="description" content="${attr($('meta[name="description"]').attr('content') || '')}">
<meta property="og:title" content="${attr($('meta[property="og:title"]').attr('content') || '')}">
<meta property="og:description" content="${attr($('meta[property="og:description"]').attr('content') || '')}">
<meta property="og:image" content="${attr($('meta[property="og:image"]').attr('content') || '')}">
<link rel="canonical" href="https://www.lenovo.com/us/en/">
<link rel="icon" href="assets/favicon.ico">
<link rel="preload" href="assets/fonts/NotoSans-Latin-Regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/Montserrat-Latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="canon.css">
<link rel="stylesheet" href="index.css">
</head>
<body>
<!-- generated by stardust/replica/build/index/gen.mjs from a runtime DOM snapshot of https://www.lenovo.com/us/en/ -->
<main>
${header}

<div class="home-main">
${hero}

<div class="home-body">
  ${catGrid(g[0])}
  <hr class="divider divider--line">
  ${prompt}
  <div class="divider"></div>
  ${imgGrid(g[1], 'events-h', false)}
  <div class="divider"></div>
  ${iconGrid(g[2], 'powerhouse-h')}
  <div class="divider"></div>
  ${imgGrid(g[3], 'fueling-h', true)}
  <div class="divider"></div>
  ${imgGrid(g[4], 'devices-h', true)}
  <div class="divider"></div>
  ${rewards}
  <div class="divider"></div>
  ${iconGrid(g[5], 'promos-h')}
  <div class="divider"></div>
  ${stories}
  <div class="divider"></div>
</div>
</div>

${footer}
${pageModals}
</main>
<script src="canon.js" defer></script>
</body>
</html>
`;
fs.writeFileSync(outFile, html);
console.log(`wrote ${outFile} (${html.length} bytes; grids ${g.length}, prompt results ${pr.find('.len-prompt-xf-path').length}, tab panels ${panels.length}, icons mapped ${Object.keys(ICON).length})`);
