# Journal — Lenovo US replica

## Extract — 10 planned pages captured live, design snapshot written (2026-11-02)

- `crawl.mjs --pages <10 plan URLs> --dynamics` → 10/10 live (HTTP 200, playwright, medium wait); no bot wall. `https://www.lenovo.com/` redirects to `/us/en/`.
- Vision check (thumbnails): 5 suspects (cookie strip, email modal on Yoga 7x, lazy media) → recaptured at `--wait slow`; modal gone.
- Style census at 1440 + 360 → `_computed-styles.json`; fonts are OFL (Noto Sans files served as "Lato", Montserrat) + icomoon icon font, saved under `assets/fonts/`; 52 source stylesheets under `assets/css/`.
- Page types: landing (home), campaign (legion, ai-pcs, futureyou), listing (/c/ yoga slim, /c/ legion T, /d/ gaming accessories), product (3 × /p/).
- Home runs on the AEM clientlib stack; every other page on Lenovo's static.pub CMS — two component families.
- cap-probe: contentMaxWidth differs per archetype (1440 home, fluid campaign/product, 640 listing) — recorded in DESIGN.json extensions.breakpoints.
- Linear flow chosen over first-page-first tracks: 10-page scoped run, the runner sequences phases.

## Preserve-direction — captured spec promoted verbatim, empty register, dynamics triaged (2026-11-02)

- PRODUCT.md / DESIGN.md / DESIGN.json promoted byte-for-byte from `stardust/current/`; `stardust/direction.md` records preserve mode.
- Inconsistency register: empty — pure replica (no audit, no user items).
- Dynamics: detect on home + 3 archetype reps → 158 findings; curated to 14 rows in `stardust/dynamic-features.md` (+ plan). Commerce (prices, cart, account, checkout) ships interim: captured prices, link-outs to www.lenovo.com. All 34 first-party APIs host-bound on the EDS host.
- Martech (owner asked to keep tags): spec-martech → Adobe Launch (478 rules, 866 data elements), no OneTrust (Evidon handled inside Launch) → `stardust/martech-contract.json` + `martech-handoff.md`, every part disabled; consent model owner-decision.

## Source-fidelity-gate — landing archetype (index) gated with residuals (2026-11-02)

- 1440: pixel 0.33 % · Δh −2 px · 1 🔴 (Neptune card icon: computed style vs painted glyph — painted mirrored) · clip 0 · overflow ok · 3 iterations.
- 360: pixel 2.39 % · Δh −4 px · same 🔴 · clip 0 · overflow ok · 3 iterations. Hot band 750–1000 = third-party Chat/Feedback tabs (not replicated).
- cap-probe PASS (content 1440, promo 1424). Motion 8 observed / 7 implemented; mega-menu content loads on hover (not captured).
- Canon: `stardust/prototypes/canon.css` + `canon.js` (header, promo strip, footer). Home header 160+68 px sits inside `<main>`; other templates use a 216 px header variant outside `main.main_content`.
- Cost note: this archetype consumed ~44 % of the run budget; remaining archetypes run with a reduced iteration budget (1 fix round per width).

## Source-fidelity-gate — campaign archetype (us-en-ai-pcs) gated, lean budget (2026-11-02)

- 1440: pixel 2.58 % · Δh −4 px · 3 🔴 (live triplicates hero heading/description/breadcrumb for desktop/tablet/mobile; one responsive copy authored) · clip 0 · 2 iterations.
- 360: pixel 6.82 % · Δh −118 px (RESIDUAL: Copilot block + Premier Support banner bands 16000–17500, narrow-column wraps) · clip 1 (SEO read-more box, mirrors live) · 2 iterations.
- Canon: `.commonHeader--site` (216 px, before `main.main_content`) + `body.tpl-site` (Lato 400 chrome) added; home not re-gated. cap-probe and motion deferred.

## Source-fidelity-gate — listing archetype (us-en-c-desktops-legion-desktops-legion-t-series-towers) gated (2026-11-02)

- 1440: pixel 1.16 % · Δh −2 px (canon footer) · content-diff 0 🔴 / 0 nothing-lost 🟡 · clip 0 · overflow ok · 2 rounds. cap-probe PASS (content cap 640 = 640).
- 360: pixel 2.97 % · Δh −1 px · content-diff 0 🔴 / 0 nothing-lost 🟡 · clip 0 counted · overflow ok · 3 rounds. Live serves the desktop DLP at 360 (document 706 px wide); mirrored as captured inside a hidden-scrollbar overflow-x:auto wrapper. Card row heights frozen per breakpoint (live row 2 at 360 equalised short, loyalty overlaps features — nondeterministic, permanent residual).
- Residuals: third-party Feedback/Call/Chat bar (360 band 500–1000 ≈14 %), hidden facetName/facetId data nodes, product titles authored h3 > a (live a[role=heading]). Gate instrument needs `--consent "#_evh-ric-c" --dismiss ".bluecoreCloseButton"` on this template (Evidon banner + Bluecore email popup), else live captures read 35–42 %.
- Canon: unchanged. Header assembled from the home slice with `.commonHeader--site`, Products active, Products tier-2 row, live segment order Gaming|Business|Student|Creator. Motion deferred (implemented: hero CTA scroll, sort toggle, See More, canon header).

## Source-fidelity-gate — product archetype (legion-pro-5i) gated (2026-11-03)

- 1440: pixel 5.13 % · Δh −2 px · content-diff 10 🔴 / 85 🟡 (residual classes: icon-font / inline-svg glyphs redrawn in CSS, role upgrades, swiper loop clones, `<sup>`-split fragments) · clip 0 · overflow ok · 3 rounds (first live capture was truncated at 29028 px — retaken, live 29208 vs build 29206).
- 360: pixel 12.89 % · Δh −53 px · content-diff 33 🔴 (24 role upgrades: authored h3 for live body-text column titles) / 83 🟡 · clip 0 · overflow ok (live itself overflows to 746 px) · 3 rounds + 1 live re-measure → FAIL, lean cap reached. RESIDUAL: the gate's live capture renders the 360 buy box 51 px taller than its own DOM measure (reproduced twice), shifting every band below; the live serves its desktop components squeezed at 360 (82 px accessory cards, 4-up columns) — mirrored approximately with block heights pinned per breakpoint.
- Content source: a hydrated live dump (`build/<slug>/live-dump.mjs` → live-1440/360.html with data-r/data-t) because the captured HTML leaves 8 `comp_lazyload` sections empty; extract.mjs + assemble.mjs re-author it. Bazaarvoice reviews, compare-similar and the buy box replicated as captured; PayPal iframe and Katapult logo are placeholders.
- Canon: unchanged. Header sliced from the campaign prototype (live PDP header shows "Artificial Intelligence" active + AI tier-2 row) with segments reordered Gaming|Business|Student|Creator. Gate flags `--consent "#_evh-ric-c" --dismiss ".bluecoreCloseButton"` still required. cap-probe and motion deferred (implemented: gallery thumbs, jump tabs, reviews tabs, offer dialogs, legal accordion).

## Recreate — four archetypes recreated and gated, product 360 carried as residual (2026-11-03)

- landing (index), campaign (ai-pcs), listing (legion-t-series-towers) pass at 1440 and 360; product (legion-pro-5i) passes 1440 (5.13 %) and is RESIDUAL at 360 (12.89 %, Δh −53) after the iteration cap.
- Product 360 cause known: the hero/buy-box block is pinned to 4691 px, but live's stitched capture draws it ~51 px taller; re-pin at the C-archetype preview gate.
- Live gate flags for non-home templates: `--consent "#_evh-ric-c" --dismiss ".bluecoreCloseButton"`.
- Gate probes ran one at a time (RUN_BG_SLOTS=1, no `--full`) to stay within three browsers.

## Plan — migrate plan recorded, four archetypes rendered (2026-11-03)

- Path A: index, us-en-ai-pcs, legion-t-series-towers, legion-pro-5i rendered to `stardust/migrated/` (rendered 4, refused 0); modules[] recorded per archetype.
- Path A' siblings (campaign 2, listing 2, product 2) wait for their template's C-archetype unit; units tracked in `stardust/migrate/progress.json`.
- "broken" link counts are out-of-scope Lenovo pages; E2 repoints them to the source host.

## A-inventory — 4 archetype rows; siblings join as they render (2026-11-03)

- `inventory.mjs --state` doubled the trailing-slash archetypes (`/us/en/ai-pcs` vs `/us/en/ai-pcs/`) and grouped siblings by page type, not archetype; re-ran without `--state`. Siblings enter coverage when their render unit writes them with `template` = archetype slug.
- rollout.json site: DA aemcoder/b3b47bf7 ref main, liveHost main--b3b47bf7--aemcoder.aem.live.

## B-block — 27 distinct blocks, each converted once (2026-11-03)

- `merch-banner` is on all four archetypes (reuse ×3); every other block belongs to one template. Plan is representative-first: index, ai-pcs, legion-t-series, legion-pro-5i.

## B2-dynamic — dynamic surface re-verified, 14 rows stand (2026-11-03)

- Fresh `dynamics-detect` (161 findings vs 158) and `dynamics-plan --target-origin --migrated --martech`: no new class; 35/35 first-party APIs host-bound; martech contract rebuilt, all parts disabled.

## C-deliver (in progress) — foundation and campaign archetype done (2026-11-03)

- Foundation live and frozen (18 files): header crop 1440 1.08 %, 360 1.88 % above the rotating promo strip; footer 2.57/3.32 % inherited from the gated prototype. chrome-explore on the live header ran past its deadline twice (150 and 50 states); header-contract.json holds only an empty run — re-record at C-final with a small budget (1440 only).
- archetype-campaign done: /us/en/ai-pcs live, 1440 7.39 % / 360 7.42 %, clip 0, missing 0. Legion and futureyou need new modules (legion-hero, headline, product-card lists; video-panel carousel, product carousel).
- Session ended at the runner's context limit with archetype-landing and archetype-product in flight (see progress.json notes); their agents and servers were stopped.
- gate-all has no consent flags: pre-capture origin.png with stitch-shot (`--consent "#_evh-ric-c" --dismiss ".bluecoreCloseButton"`), then `gate-all --skip-existing`; brief at stardust/rollout/briefs/archetype-unit.md.
- Session 4: archetype-landing confirmed after the stories/prompt fix — / 1440 1.62 % Δh 0, 360 1.70 % Δh 2, clip 0, missing 0 → done. Product's stale 1440 row (19 %) traced to an origin capture taken without the consent/dismiss flags (email modal + cookie bar in the shot); recapturing.
- archetype-listing done: /us/en/c/desktops/legion-desktops/legion-t-series-towers live, 1440 1.31 % Δh 2, 360 2.93 % Δh 1, clip 0, missing 0, no fix rounds; 2 foundation requests queued (header promo-strip band; localize-links touches frozen nav/footer ai-pcs link). Sibling encoder notes in stardust/.work/rollout/listing/encode.py.
- Session 4 ended at the runner's context limit with archetype-product (fix rounds) and cluster-campaign (futureyou started, legion not) in flight; their agents and the port-8796 server were stopped. Next: resume both, then cluster-listing and cluster-product, gate-all, final. Shared cluster brief: stardust/rollout/briefs/cluster-unit.md.

## C-deliver (in progress, session 5) — campaign cluster recorded, product and listing in fix rounds (2026-11-03)

- cluster-campaign done: /us/en/education/futureyou PASS 1440 6.06 % / 360 6.19 % (3 clipped at 360 = origin parity, allowance logged); /us/en/legion RESIDUAL 23.67 % / 16.87 % after 3 rounds (YouTube hero loop as poster, textured backgrounds, live product order shuffles; round 3 price offset made 1440 worse — revert first). 13 new blocks (legion-*, video-panel, persona-cards, product-carousel, merch-banner). migrate render refused siblings (no source HTML): encoded from live snapshots.
- archetype-product still open: 1440 PASS 7.18 %, 360 FAIL 11.83 % Δh −323 (round 2 was 10.87 %); revert round 3's pdp-specs label column, re-gate 360 with `--state stardust/.work/rollout/product/state-gate.json`.
- cluster-listing in flight: yoga-slim-series 3.1 %/6.16 % fails only on the breadcrumb (fixed in 175dbbc, needs re-PUT --force); gaming-accessories 8.77 %/14.84 % (live catalogue drift — fresh snapshot + re-encode the grid, listing-seo clip fixed). Round script: stardust/.work/rollout/listing-cluster/tools/round.sh.
- Coverage has no rows for the 6 siblings: run `rollout/inventory.mjs` (keeps rows) before update-coverage / gate-all. localize-links pass over nav/footer/index/ai-pcs/PDP for the new in-scope sibling links is queued for C-final (chrome frozen).
- Machine out of inotify watchers (aem up crashed); three orphan `aem up` servers from earlier sessions (no recorded PIDs) left untouched.

## C-deliver (in progress, session 6) — product archetype and listing cluster done, product cluster in fix rounds (2026-11-03)

- archetype-product done: 1440 7.18 % Δh −13, 360 8.67 % (round 4: hidden 52 px PayPal row in pdp-hero 360, pdp-specs label column back to round 2); 1 foundation request (360 header nav weight/scroller/search placeholder).
- cluster-listing done: yoga-slim-series 3.12 %/6.15 %, gaming-accessories 8.77 %/6.44 %, clip 0, missing 0 (360 cards drop business-price row as live). Coverage rows for siblings fixed to sibling tier.
- Legion fix pass (rounds 1–4, last 00df558): 1440 PASS 8.36 % Δh −38; 360 11.06 % Δh −44, missing 0, clip 1 (matched on live) — remaining: accessories/monitors rows +23 px each.
- cluster-product running: both PDP siblings encoded, deployed, round 1 committed (6236055); agent stopped mid round 2 for budget. Next session: gate both PDPs at both widths, fix, verify; then legion 360 one more round, gate-all, final.
- Post-round-1 re-gate (pc-regate): Tower 5i 1440 12.8 %/360 15.79 % (missing 1/2); Yoga Slim 7x 1440 15.06 % clip 2 / 360 12.91 % Δh +2166 missing 7. Two fix rounds left per page.

## C-deliver (in progress, session 7) — product cluster closed at round cap with residuals (2026-11-03)

- cluster-product done after rounds 2 (42e0bbb) and 3 (4fad420), records ddbf828: Yoga Slim 7x 1440 10.85 % Δh −117 clip 1 / 360 11.77 % Δh +238 missing 1; Tower 5i 1440 16.71 % Δh −126 missing 1 / 360 10.45 % Δh +48 missing 1.
- Residuals: Tower 1440 model cards ~49 px short of live and the is-wide Xbox band ~40 px short (offset cascades); Tower 5a rec link at 1440, hero rating link off-canvas at 360; one Yoga FAQ teaser line clipped by 5 px.
- Next: gate-all (roster, --skip-existing), then final; failing pages (legion 360, both PDP siblings) need closing before done-check.
- gate-all done (roster state stardust/.work/rollout/state-gate-roster.json, preview origin, origin captures reused, EDS re-shot): 1440 8/10 PASS, 360 7/10 PASS. Failing: Tower 5i 16.71 %/10.45 % (missing 1 each), Yoga 7x 10.85 %/11.77 %, Legion 360 11.06 % clip 1. Coverage rows added for the 4 sibling-encoded pages; core state advanced to migrated (10/10).

## C-deliver — final unit closed, roster 10/10 delivered at both widths (2026-11-03)

- Foundation requests applied once: R1 nav ai-pcs link localized and /nav republished; R3 legion hero plays the live muted YouTube loop from an authored link (poster first paint); R4 partial (360 segment scroller, empty first-paint search placeholder); R2 and R4 bold L1 labels residual (live varies per page — needs a per-page flag). Foundation re-frozen.
- Fix rounds past the cap (hands-off re-prototype decision: targeted sibling fixes, no re-authoring): legion 360 11.06% → 8.63% clip 0; Yoga 7x 5.8% / 9.67%; Tower 5i 8.2% / 8.48%; variant classes on sibling content only, archetype re-checked 7.18% / 8.67%.
- Roster gate (compare re-run): 1440 and 360 each 9 PASS + 1 documented override = 10 delivered; pixel-only 10/10. Override: gaming-accessories `source-drift` — live replaced its SEO copy after capture (3 MISSING). The home page live serves rotating variants (one probe read MISSING 54); an override row documents it, the final probe read 0.
- Coverage updated from both tables; done-check gaps left: rollout_incomplete, scorecard_missing → D-site … I-dashboard next.

## D-site — sitemap served 10 = assembled 10, redirects sheet live, root 200 (2026-11-03)

- Source root 301s to `/us/en/`; the home page is delivered as the root `index`, so the sheet maps `/us/en/`, `/us/en` and `/index.html` → `/` (no `/` row).
- No spec knowledge folder, so `seed-redirects.mjs` had nothing to read: `stardust/redirects.tsv` was written from coverage — the six source paths whose trailing slash EDS would 404 → their delivered paths. 9 rows; PUT to DA `/redirects.json`, previewed and published; `/us/en/legion/` → 301 `/us/en/legion`, `/us/en/` → 301 `/`.
- `/nav` and `/footer` already carry `robots: noindex`; `assemble.mjs --verify-origin` exit 0 (served 10 = assembled 10, extra 0, missing 0); `curl -sIL` aem.page `/` ends 200.

## D2-dynamic — 16 parity checks PASS on the published origin (2026-11-03)

- `stardust/dynamics/parity.json` written from the 14 curated rows plus the Legion hero video (restoreAtDelivery) and a no-page-errors sweep over all 10 paths; `dynamics-check.mjs --origin https://main--b3b47bf7--aemcoder.aem.live` exit 0, 16/16 PASS → `stardust/qa/dynamics-report.md`.
- Martech gate: no Launch / mPulse host requested on `/` and `/us/en/legion` — every contract route ships disabled, as decided.
- Legion hero: YouTube iframe issued 15 playback requests, all < 400.
- No `/query-index.json` (404): nothing on the site reads it — search links out to the source search (interim, owner: search datasource), listings are document-first. Decision named; no index configured.
- Interim rows (owner decisions by name in parity.json): search datasource, price/product feed, commerce/auth, ESP endpoint, locale scope, runtime embed, Pro store popup.

## E-full-site — 10/10 verified on aem.live, render check 8/8 (2026-11-03)

- Gate tables 1440 + 360 fed to coverage (10/10 rows matched, 0 flips). `verify.mjs --base` aem.live: first pass 9/10 — verify requests the Legion Pro 5i page with a trailing slash (its migrated file is an `index.html`), which EDS 404s; the page itself serves 200. Added trailing-slash redirect rows for the three product pages (sheet now 12 rows, republished) → 10/10 verified.
- Headless render check, first page of each template at 1440 and 360: `body.appear`, sections 7–13, 0 page errors, 0 broken images — 8/8.
- Home hero restoreAtDelivery rotation: idle in a headless browser it holds slide 0 — as the live site does (probed: live idle 16 s static); after one input ours advances every 5 s (the C-archetype "arms on first interaction" source parity). Recorded as delivered.

## E2-link-audit — 20 links localized, internal 33/33 resolve (2026-11-03)

- `localize-links.mjs` turned 20 absolute www.lenovo.com links into root-relative ones across 9 documents (nav, footer, 7 pages); redeployed 9/9 live; `--check` now clean.
- Live href GET over nav, footer and the 10 pages: internal 33 · 0 bad; external 330 · 7 non-2xx — techtoday/gaming/education.lenovo.com answer 403 to a scripted fetch, and www.lenovo.com/copilot-plus-pc/ 503: source links carried verbatim, not migration defects.
- Scope decision recorded in `direction.md`: 252 links to out-of-scope pages stay absolute to the source site.

## F-optimize — 0 open P1; 9 P2 JSON-LD, 3 P3 title-length (2026-11-03)

- `optimize.mjs --base` aem.live over 10 pages: health 49/100 (seo 88 · ai 10; a11y and cross-page not assessed by the automated layers), open P1 0 · P2 9 · P3 3; GATE pass.
- Open P2: no JSON-LD on 9 pages whose source carries it; P3: 3 titles over length where the source title differs. Source parity (informational): 4 (home JSON-LD, 3 titles identical to source).
- Fixable findings routed to G-aem.

## G-aem — source JSON-LD carried to 9 pages; health 49 → 100 (2026-11-03)

- `autofix-aem.mjs --dry-run` proposed 3 title drafts (from `<h1>`) and marked 9 JSON-LD findings manual. Titles NOT applied: they are identical to the source capture (optimize's parity compare misses `&amp;` vs EDS's `&#x26;`) — resolved `accepted` as source parity; replica keeps content verbatim.
- JSON-LD: each page's source `application/ld+json` carried verbatim into a `json-ld` metadata row (two blobs flattened into one `@graph`), which the EDS pipeline renders as a head `<script type="application/ld+json">`. 9 documents redeployed live; served JSON parses (Legion: 44 Product + BreadcrumbList; PDPs: Product + BreadcrumbList). The home page has no source JSON-LD (parity, informational).
- Re-verify 10/10; re-optimize: open P1 0 · P2 0 · P3 0 (after the 3 accepts), health 100/100, 9 P2 fixed.

## H-report — report and learnings written; 10/10 verified, 27/27 blocks (2026-11-03)

- `stardust/rollout/report.md`: pages 10/10 verified, 4 templates delivered, 27/27 blocks (block rows flipped to verified — they had never been recorded after delivery), health 100, open P1/P2/P3 0, the dynamic parity table with owner decisions.
- Prototype gate tables written now (`gate-all --stage prototype`, cached live captures): 1440 4/4 PASS, 360 2/4 (the Phase 4 residuals; closed at delivery). Server on 8791 stopped by PID.
- `stardust/learnings.md`: 5 pending entries (entity-encoded parity, trailing-slash publicUrl, JSON-LD autofix gap, redirects seed without spec, prototype table at Phase 4).

## I-dashboard — dashboard written, header parity 0 errors on the live host (2026-11-03)

- `dashboard.mjs` → `stardust/rollout/dashboard/index.html` + `data.json`: 10 identified · 10 prototyped · 10 deployed · 7 optimised (3 carry accepted source-parity title findings).
- Header contract: `chrome-explore` on the aem.live home (1440: 16 controls, 22 states; 390: 7 controls, 12 states) → `chrome-compare --profile replica` 0 errors, 0 warnings → `stardust/chrome/header-parity.json`.
- Local `done-check.mjs` still lists `pages_not_live:5`: it HEADs the trailing-slash form `publicUrl()` derives from `…/index.html` migrated files, with redirects off; those paths 301 to the delivered slashless pages, which answer 200 (verify 10/10). Same root cause as the learnings entry on `publicUrl()`. Its scope line (6 of 10) is the A-inventory snapshot; an `inventory.mjs` re-run to refresh it added 4 duplicate content-pending rows and was reverted from git. The runner's done-check is the gate of record.

## Handoff — complete: 10/10 pages live and gated on aem.live (2026-11-03)

- Phase 5 closed: migrate (4 archetypes + 6 siblings), rollout A → I. Every page, the redirects sheet, nav and footer are published on aem.live (publish decision in `stardust/eds-conversion-log.md`).
- Delivery gate of record: all-1440 and all-360 each 9 PASS + 1 documented source-drift override; verify 10/10; parity 16/16; header parity 0 errors; optimize health 100, open P1 0.
- Martech carried with every contract route disabled (`stardust/martech-contract.json`, `stardust/martech-handoff.md`, `scripts/martech.js`); enabling stays with the owner.
- Runner done-check: `{"complete": true, "gaps": []}`.
