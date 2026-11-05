# Dynamic features — Lenovo US (10-page replica scope)

Curated from `stardust/dynamics/dynamic-features.generated-plan.{md,json}` (158 draft rows, detect on
home + the three archetype pages, reach from the crawl). Hands-off run: every owner decision ships its
interim tier and is named in § Decision batch; nothing is `decided-out` without an owner statement.
Target host for the probe: main--b3b47bf7--aemcoder.aem.page — all 34 first-party API paths are host-bound.

## Listings contract

none — the four `L` candidates (home card grid, home carousel, home prompt results, aem-Grid tiles) are
editorially curated cards on the source; they ship as authored block rows (static-snapshot of the captured
cards). No query-index listing block in scope.

## Features
| # | id | feature | class | reach | disposition | target | reproducibility | status | pattern | decision / owner | evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | chrome-menus | header mega-menu, utility bar, mobile drawer | M | 10/10 | rebuild-native | runtime | self | pending | chrome | none | header DOM, motion-observe |
| 2 | modals | modal triggers (aria-haspopup, INDpopupConfirm, pro-store popup, popup-activation) | M | 4/4 probed | rebuild-native | runtime | self | pending | modal-loader | none | m-modal-trigger-* rows |
| 3 | site-search | header search box (JS-submitted, suggest API) | S | 10/10 | index-backed | widget | self | interim | search-index-backed | interim: submits to the migrated-corpus results page; suggest API (/us/en/ofp/search/*) host-bound → owner: datasource ownership | s-* rows |
| 4 | carousels | hero carousel, card carousels (embla/swiper) | CR | 10/10 | client-only | block | self | pending | carousel | none | swiper-icons font, embla containers |
| 5 | product-prices | live prices, model lists, delivery dates, tech-spec/ports/compare APIs on listing + product pages | A | 6/10 | static-snapshot | content | needs-backend | interim | host-bound API | interim: prices/models as captured 2026-11-02, CTAs link to www.lenovo.com product pages; owner: commerce backend on the new host | a-first-party-api-* (product, detail/price, ups, getTechSpecs…) |
| 6 | commerce-cart-account | cart, sign-in/account, payments, Lenovo Pro store | X | 10/10 | static-snapshot | content | needs-backend | interim | link-out | interim: links point to the www.lenovo.com cart/account/checkout; owner: auth + commerce on the new host | x-* rows |
| 7 | listing-facets | category facets + product card controls (pc_left_facets, productCard_container) | F | 3/10 | client-only | block | needs-backend | interim | filter | interim: facet UI rendered as captured, product set static; owner: product feed | f-form-less-* rows |
| 8 | email-capture | newsletter/email capture (email_style, Bluecore capture form) | F | 10/10 | rebuild-native | widget | needs-backend | interim | form | interim: UI rebuilt, "no backend connected" message on submit; owner: ESP endpoint (Bluecore) | f-form-email-*, bluecore rows |
| 9 | locale-switcher | country/locale selector (en-US, en-CA, fr-CA, …) | I18N | 10/10 | rebuild-native | runtime | needs-business-decision | interim | locale-tree | interim: links to the source locale sites; owner: locale scope | i18n-* rows |
| 10 | runtime-embed | runtime-injected iframe (no src at capture) | V | 4/4 | embed-passthrough | embed | needs-human-capture | interim | embed | interim: omitted (not visible in the captured page); owner: confirm the embed | v-iframe-without-src |
| 11 | martech | Adobe Launch (478 rules), Adobe Analytics/ECID, Akamai mPulse, ad/retargeting pixels (Amazon, LinkedIn, Reddit, 6sense, Bluecore, Confirmit, inside-graph chat) | T/A | 10/10 | embed-passthrough | runtime | needs-credential | scaffolded-awaiting-owner | martech | owner turns each part on — stardust/martech-contract.json, martech-handoff.md | t-* rows, a-unknown-third-party-host-* rows |
| 12 | data-layers | dataLayer, utag_data, adobeDataLayer, CQ settings objects | A | 10/10 | static-snapshot | runtime | self | interim | data-layer | consumed by Launch only; carried with the martech contract | a-cms-app-settings-object-* |
| 13 | identity-apis | /us/en/auth/assign_cookie, /identity, getOneId, Web SDK /ee/or2 interact | A | 10/10 | embed-passthrough | runtime | needs-credential | scaffolded-awaiting-owner | martech | rides on the martech contract (disabled) | a-first-party-api-* identity rows |
| 14 | cms-fragments | /us/en/api/sscmssite/{utility,fragment} (header/footer fragments, utility links) | A | 10/10 | static-snapshot | content | self | pending | chrome-fragment | header/footer rebuilt as nav/footer documents from the captured DOM | a-first-party-api-get-us-en-api-sscmssite-* |

## Decision batch

One message to the owner (hands-off: each is a named assumption, interim tier ships):
- **Commerce backend** (rows 5, 6, 7): prices, models, cart, account and checkout stay on www.lenovo.com; migrated pages show the captured prices and link out. Decide whether EDS pages call the commerce APIs same-origin in production.
- **Search datasource** (row 3): the suggest/product-search APIs are host-bound; interim search covers the migrated pages only.
- **Email service** (row 8): which endpoint receives newsletter sign-ups.
- **Locale scope** (row 9): the 10-page scope is en-US only; locale links point at the source.
- **Tags and consent** (rows 11, 13): every part ships disabled; see `stardust/martech-handoff.md`.
- **Runtime embed** (row 10): confirm what the runtime-injected iframe carries.

## Register (decided-out)
| feature | reason | production statement |
|---|---|---|
| — | none: no owner statement yet | — |

## Re-verification (rollout B2, 2026-11-03)

Fresh detect on home + the three archetypes: 161 findings (158 at curation), the same classes; host-bound
35/35 first-party API paths on main--b3b47bf7--aemcoder.aem.page; martech contract rebuilt, every part
still disabled. No new feature class; the 14 curated rows stand.
