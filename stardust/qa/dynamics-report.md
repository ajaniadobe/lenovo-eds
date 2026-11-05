# Dynamics parity check — https://main--b3b47bf7--aemcoder.aem.live — 2026-11-03T14:01:17.176Z

Replayed 16 checks over 17 features · pass 16 · fail 0. Flows, not presence.

| feature | class | status | check | result | detail | third-party requests |
|---|---|---|---|---|---|---|
| header mega-menu, utility bar, mobile drawer | M | done | dom-count | PASS | 53 × header nav a (min 50) |  |
| header mega-menu, utility bar, mobile drawer | M | done | dom-count | PASS | 21 × .header [aria-expanded] (min 20) | www.youtube-nocookie.com:200×7 fonts.gstatic.com:200×1 www.google.com:200×1 |
| loyalty / price popovers (source aria-haspopup triggers) | M | interim | dom-count | PASS | 2 × [aria-haspopup="dialog"] (min 1) | p2-ofp.static.pub:200×1 p4-ofp.static.pub:200×2 www.katapult.com:200×1 |
| header search box | S | interim | dom-count | PASS | 1 × #common-header-search (min 1) |  |
| home hero rotation, Legion sliders | CR | done | dom-count | PASS | 1 × .home-hero .is-active (min 1) |  |
| home hero rotation, Legion sliders | CR | done | dom-count | PASS | 5 × .legion-carousel (min 1) | www.youtube-nocookie.com:200×7 fonts.gstatic.com:200×1 www.google.com:200×1 |
| Legion hero muted YouTube loop (restoreAtDelivery) | V | done | video-plays | PASS | iframe/video: true · no <video> · playback requests 15 (ok) | www.youtube-nocookie.com:200×9 fonts.gstatic.com:200×4 www.google.com:200×1 i.ytimg.com:200×1 www.youtube-nocookie.com:204×4 rr5---sn-2on4v5-5b.googlevideo.com:200×1 www.gstatic.com:200×1 jnn-pa.googleapis.com:200×1 |
| live prices, model lists, delivery dates, spec APIs | A | interim | dom-count | PASS | 1 × .product-listing (min 1) | p2-ofp.static.pub:200×1 p4-ofp.static.pub:200×2 www.katapult.com:200×1 |
| category facets + product card controls | F | interim | dom-count | PASS | 13 × .product-listing .card-see-more, .product-listing [aria-expanded] (min 1) | p2-ofp.static.pub:200×1 p4-ofp.static.pub:200×2 www.katapult.com:200×1 |
| footer newsletter sign-up | F | interim | dom-count | PASS | 1 × footer input[type="email"] (min 1) |  |
| country/locale selector | I18N | interim | dom-count | PASS | 3 × [class*="locale"], [class*="country"] (min 1) |  |
| Adobe Launch, Analytics/ECID, mPulse, ad pixels | T/A | scaffolded-awaiting-owner | martech | PASS | no tag host requested (3 gated · 0 cross-site host(s) blocked) |  |
| Adobe Launch, Analytics/ECID, mPulse, ad pixels | T/A | scaffolded-awaiting-owner | martech | PASS | no tag host requested (1 gated · 1 cross-site host(s) blocked) |  |
| header/footer fragments | A | done | dom-count | PASS | 90 × footer a (min 20) |  |
| no uncaught exceptions | - | done | no-page-errors | PASS | none on 10 page(s) |  |
| martech: consent + tag routing | T | scaffolded-off | martech | PASS | no tag host requested (2 gated · 0 cross-site host(s) blocked) |  |

## Features without checks

- cart, sign-in/account, payments, Lenovo Pro store (X) — interim · owner: auth + commerce on the new host
- runtime-injected iframe (no src at capture) (V) — interim · owner: confirm the embed
- dataLayer, utag_data, adobeDataLayer (A) — interim
- assign_cookie, identity, getOneId, Web SDK interact (A) — scaffolded-awaiting-owner · owner: identity endpoints on the new host
