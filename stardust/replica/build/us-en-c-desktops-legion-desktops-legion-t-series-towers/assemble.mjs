// One-shot assembler: canon chrome (sliced from the gated home prototype) + hand-authored listing main.
// Verbatim copy, hrefs, image URLs/alts come from extract.json (extract.mjs over the captured rendered HTML).
import fs from 'node:fs';
const S = 'us-en-c-desktops-legion-desktops-legion-t-series-towers';
const root = new URL('../../../', import.meta.url).pathname;
const idx = fs.readFileSync(root + 'prototypes/index-proposed.html', 'utf8').split('\n');
const ex = JSON.parse(fs.readFileSync(new URL('./extract.json', import.meta.url), 'utf8'));
const rec = JSON.parse(fs.readFileSync(root + `current/pages/${S}.json`, 'utf8'));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const abs = (u) => (u.startsWith('//') ? 'https:' + u : u);

// ---- header: site variant, "Products" active, live segment order, Products tier-2 row ----
let header = idx.slice(20, 129).join('\n')
  .replace('<nav class="commonHeader"', '<nav class="commonHeader commonHeader--site"')
  .replace('<li class="nav_item"><a href="https://www.lenovo.com/us/en/pc/">', '<li class="nav_item sup_nav_active"><a href="https://www.lenovo.com/us/en/pc/" aria-current="true">');
const seg = [...header.matchAll(/ {10}<li class="nav_item segmentItem">.*<\/li>\n/g)].map((m) => m[0]);
if (seg.length === 4) {
  const order = ['Gaming', 'Business', 'Student', 'Creator'].map((n) => seg.find((s) => s.includes(`<span>${n}</span>`)));
  const start = header.indexOf(seg[0]); const end = header.indexOf(seg[3]) + seg[3].length;
  header = header.slice(0, start) + order.join('') + header.slice(end);
}
const tier2 = [['https://www.lenovo.com/us/en/laptops/', 'Laptops'], ['https://www.lenovo.com/us/en/desktops/', 'Desktops'], ['https://www.lenovo.com/us/en/workstations/', 'Workstations'], ['https://www.lenovo.com/us/en/accessories-and-software/', 'Accessories'], ['https://www.lenovo.com/us/en/software-standalone/', 'Software'], ['https://www.lenovo.com/us/en/d/accessories-and-monitors/monitors/monitor-buying-guide/', 'Monitors'], ['https://www.lenovo.com/us/en/tablets/', 'Tablets &amp; Phones'], ['https://www.lenovo.com/us/en/servers-storage/', 'Servers &amp; Storage'], ['https://www.lenovo.com/us/en/smart-devices/', 'Home &amp; Office'], ['https://www.lenovo.com/us/en/d/deals/laptops/?sortBy=Recommended&amp;visibleDatas=13084%3ACopilot%252B%2520PC%2CAI%2520PC%2CAI-Powered%2520Gaming%2520PCs%2CAI-Ready%2520Workstations', 'AI'], ['https://www.lenovo.com/us/en/d/deals/doorbusters/', 'Deals'], ['https://www.lenovo.com/us/outletus/en/?IPromoID=LEN385145', 'Outlet', true]]
  .map(([h, t, flat]) => `        <li class="second_list_item"><a href="${h}"><span class="text">${t}</span></a>${flat ? '' : `<button class="iconfont-arrowDown tierThreeArrowIcon" type="button" aria-label="${t}"></button>`}</li>`).join('\n');
header = header.replace('\n  </nav>', `\n    <div class="second_view" aria-label="Products navigation">\n      <ul class="second_list_ul">\n${tier2}\n      </ul>\n    </div>\n  </nav>`);
const footer = idx.slice(737, 882).join('\n');

// ---- hero ----
const H = ex.hero;
const crumbs = H.crumbs.map(([h, t]) => (h ? `<li><a class="breadcrumb" href="${h}">${t}</a></li>` : `<li><span class="breadcrumb-current-page" aria-current="page">${t}</span></li>`)).join('');
const strip = (s) => s.replace(/^<p>|<\/p>$/g, '');
const hero = `<section class="series-hero">
  <div class="al_unavailable_tip" hidden><p class="unavailable_text"><span>We're sorry,</span> <span class="group_name"></span> <span class="category_name"></span> <span>Products are temporarily unavailable.</span></p><button class="unavailable_link" type="button">Continue Shopping</button></div>
  <div class="banner-container">
    <div class="series-hero__background"><img src="${abs(H.bg.src)}" alt="${esc(H.bg.alt)}" width="1920" height="546"></div>
    <div class="wrap-left">
      <nav class="breadcrumbs" aria-label="breadcrumbs"><ol>${crumbs}</ol></nav>
      <div class="product-logo"><img src="${abs(H.logo.src)}" alt="${esc(H.logo.alt)}" width="350" height="125"></div>
      <div class="product-name"><h3 class="h-name">${strip(H.name)}</h3></div>
      <div class="product-title"><h3 class="h-title">${strip(H.title)}</h3></div>
      <div class="product-desc">${H.desc}</div>
      <div class="hero-bottom-group"><div class="product-btn"><button class="series-hero__cta" type="button" data-scroll-to="dlp"><span>${H.cta}</span></button></div></div>
    </div>
  </div>
</section>`;

// ---- three alternating feature blades ----
const tones = ['navy', 'plum', 'wine'];
const blades = ex.blades.map((b, i) => `<section class="series-blade2 ${/position-left/.test(b.cls) ? 'is-left' : 'is-right'} tone-${tones[i]}">
  <div class="blade-background"><img class="bg-image" src="${abs(b.bg.src)}" alt="${esc(b.bg.alt)}" width="1152" height="547" loading="lazy"></div>
  <article class="blade-panel">
    ${b.logo ? `<div class="product-logo"><img src="${abs(b.logo.src)}" alt="${esc(b.logo.alt)}" width="354" height="80"></div>\n    ` : ''}<div class="product-headline"><h2 class="h-title">${b.h}</h2></div>
    <div class="product-desc">${b.desc}</div>
    <span class="sr-only">${b.sr}</span>${b.cta ? `\n    <div class="product-btn"><a class="blade-cta" href="${b.cta[0]}">${b.cta[1]}</a></div>` : ''}
  </article>
</section>`).join('\n');

// ---- listing: facets ----
const facets = ex.facets.map((f) => `        <div class="facets-list" role="group" aria-label="${f.name}">
          <div class="facets-name" role="button" tabindex="0" aria-label="${f.name}" aria-expanded="true"><div class="flex" role="heading" aria-level="3"><b>${f.name}</b></div><span class="upArrow" aria-hidden="true"></span></div>
          <div class="positioned-tooltip"><span class="anchor-facet-name" aria-hidden="true">${f.name}</span><button class="facets-tooltip" type="button" aria-label="${f.tip}"><span class="iconfont-tooltipIcon" aria-hidden="true"></span></button></div>
          <div class="item-list" role="group" aria-label="${f.name}">
${f.items.map((it) => `            <div class="item-lists-group"${it.hidden ? ' hidden' : ''}><label><input type="checkbox" aria-label="${esc(it.t.trim().replace(/ \((\d+)\)$/, '$1'))}"><span class="items">${it.t.trim()}</span></label></div>`).join('\n')}${f.more ? `\n            <div class="learn-more" role="button" tabindex="0" aria-label="${f.more} ${f.name}">${f.more}</div>` : ''}
          </div>
        </div>`).join('\n');

// ---- listing: product cards (hydrated commerce widget, replicated as captured) ----
const star = (partial) => [0, 1, 2, 3, 4].map((i) => (i < 4 ? '<div class="star-icon-box"><div class="star-icon yellow-icon"></div></div>' : `<div class="star-icon-box"><div class="star-icon gray-icon"></div><div class="star-icon yellow-icon" style="${partial}"></div></div>`)).join('');
const cards = ex.cards.map((c) => `          <li class="product_item">
            <div class="card-merch"><label class="common-compare"><input type="checkbox" aria-label="Compare ${esc(c.title)} Product Information Button"><span class="compare-text">Compare</span></label></div>
            <div class="card-title"><h3 class="product_title"><a href="${esc(c.href)}">${c.title}</a></h3></div>
            <div class="card-rating"><a class="rating" href="${esc(c.ratingHref)}" tabindex="-1" aria-label="${esc(c.ratingLabel)}"><div class="stars">${star(c.partial)}</div><div class="number_box"><div class="bv_text">${c.rating[0]}</div><div class="bv_text">${c.rating[1]}</div></div></a></div>
            <div class="card-image"><button class="normal_image" type="button" data-href="${esc(c.href)}" aria-label="${esc(c.imgBtn)}"><img src="${c.img.src}" alt="${esc(c.img.alt)}" width="584" height="438" loading="lazy"></button>
              <div class="hover_image" hidden><a href="${esc(c.href)}" tabindex="-1"><img src="${c.hover.src}" alt="${esc(c.hover.alt)}" width="584" height="438" loading="lazy"></a><div class="mask"><button class="iconfont-cameras" type="button" aria-label="picture"></button><button class="iconfont-playVideo" type="button" aria-label="video"></button></div></div></div>
            <div class="price-stack">
              <p class="starting-at">${c.starting}</p>
              <p class="price-title">${c.price}</p>
              <p class="katapult"><span class="katapult-logo"></span><span class="k-lease">Lease to own.</span> <b class="k-pay">As low as</b> <b class="k-price">${c.kp}</b><a class="k-learn" href="#">Learn More</a></p>
              <div class="loyalty"><p><b class="rewards-text">My Lenovo Rewards</b><span>Earn</span> <span class="sr-only">${c.earnSr}</span><button class="popup-activation" type="button" aria-label="${c.earn}" aria-haspopup="dialog">${c.earn}</button> <span>in Rewards</span></p>
                <div class="le-popover" role="tooltip" hidden><div class="bubble">${c.pop.map(([cls, t, h]) => (h ? `<p class="${cls}">${t.replace(/\s*Join for free$/, '')}<a href="${h}">Join for free</a></p>` : `<p class="${cls}"><span>${t}</span></p>`)).join('')}</div></div>
                <p class="join-now"><a href="#" aria-label="${esc(c.joinLabel)}">Join Now!</a></p></div>
            </div>
            <div class="card-details"><ul class="features">${c.features.map((f) => `<li><p>${f}</p></li>`).join('')}</ul></div>
            <div class="card-cta"><a class="cta-button" href="${esc(c.cta[0])}">${c.cta[1]}</a></div>
          </li>`).join('\n');

const sortList = ex.sortOpts.map((o) => `<li role="option"${o === 'Recommended' ? ' class="active"' : ''}>${o}</li>`).join('');
const dlp = `<section class="dlp" id="dlp" aria-labelledby="dlp-title">
  <h2 class="sub_header" id="dlp-title"><span class="group_name">${ex.sub[0]}</span> <span class="category_name">${ex.sub[1]}</span></h2>
  <div class="dlp_scroll">
    <div class="pc_content">
      <section class="pc_left_facets">
        <button class="skip-link" type="button" data-scroll-to="dlp-products">skip to product list</button>
        <div class="facet_filter" role="region" aria-label="Filters">
        <div class="filter_action_top"><p class="filter_action_title">Filters</p><div class="filter_action collapse_filters" role="button" tabindex="0" aria-label="Collapse Filters list">Collapse All</div></div>
${facets}
        </div>
      </section>
      <div class="pc_product_list" id="dlp-products">
        <div class="query_view">
          <div class="matching_header"><p class="results"><b class="total">4</b> <i>Matching results</i></p><button class="clearAll" type="button" aria-label="clear all filter button" hidden>Clear All</button><button class="sort" type="button" aria-label="Sort" hidden><span class="text">Sort</span><span class="iconfont-arrows" aria-hidden="true"></span></button></div>
          <div class="price_sort"><div class="price_sort_select"><div class="default_select" role="combobox" tabindex="0" aria-label="Sort by Newest Dropdown Collapsed" aria-expanded="false" aria-controls="dlp-sort"><span class="default_select_sortby"><i>Sort by :</i><span>Newest</span></span><span class="arrow" aria-hidden="true"></span></div><ul class="select_list" id="dlp-sort" role="listbox" hidden>${sortList}</ul></div></div>
        </div>
        <section class="productCard_container" role="region" aria-label="Product Results List">
        <ul class="product-group-list">
${cards}
        </ul>
        </section>
        <div class="pc_footer_page"><p class="show"><span>Showing</span> <span>1 - <span class="page_size">4</span> <span>of</span> <span class="total">4</span> <span>Results</span></span></p></div>
        <div class="pc_loading" hidden><p class="txt">One moment please...</p></div>
      </div>
    </div>
  </div>
</section>`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${rec.title}</title>
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

<main class="main_content tpl-listing">
${hero}
${blades}
${dlp}
</main>

${footer}
<script src="canon.js" defer></script>
<script src="${S}.js" defer></script>
</body>
</html>
`;
fs.writeFileSync(root + `prototypes/${S}-proposed.html`, html);
console.log('ok', html.length, 'undefined?', /undefined|null/.test(html.replace(/nullable/g, '')));
