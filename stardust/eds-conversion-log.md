# EDS conversion log — Lenovo US replica

## Publish decision (2026-11-03)

Decision made by the run owner before handoff: **publish**. Every delivered page, the redirects sheet and the
chrome documents (nav, footer and their locale variants) go live on main--b3b47bf7--aemcoder.aem.live
(`deploy-batch.mjs` without `--no-publish`, or POST https://admin.hlx.page/live/…).

## Martech

Owner asked to keep the source analytics, tags and consent: contract carried over with every part disabled
(`stardust/martech-contract.json`, `stardust/martech-handoff.md`); `scripts/martech.js` scaffolded in C0.

## C-archetype product (PDP — Legion Pro 5i Gen 10, 83F300BBUS)

Schema: `stardust/eds-schema/us-en-p-laptops-legion-laptops-legion-pro-series-legion-pro-5i-gen-10-16-inch-intel-83f300bbus.json`.

| block | tier | authoring shape |
|---|---|---|
| pdp-hero | template-slotted | key-value rows (`key | content`), every key optional (breadcrumb, gallery, badge, flag, title, rating, message, price, financing, rewards, cart, delivery, specs, offers, addons) |
| pdp-tabs | template-slotted | one cell: sr-only `<h2>` + `<ul>` of in-page links; active item in `<strong>` |
| pdp-services | reconstructive | section head = default content; one row per service (icon, h3, desc, link) |
| blade | reconstructive (cols/slider/cards) / template-slotted (stack/split) | variant classes `stack text full cards cols split slider is-media-left is-media-right is-offset has-cap cols-3` |
| pdp-specs | reconstructive | h2 row, h3 group rows, `label | value` rows, disclaimer row, warnings-band row (has img) |
| pdp-ports | template-slotted | one cell: h2, diagram img, `<ol>` (numbers drawn by CSS counter) |
| pdp-similar | reconstructive | head row (chips `<ul>`, selected in `<strong>`), one row per product, add tile, explore CTA |
| pdp-reviews | template-slotted | key-value rows (tabs, heading, trustmark, snapshot, overall, summary, averages, media, filter, sort, review×N, more) |
| pdp-legal | template-slotted | title row + body row |

Height pins of the prototype (`--hd/--hm`) are NOT carried per instance: each block's systematic
live-vs-natural delta is a per-variant padding/height in the block CSS, so sibling PDPs size from their content.
Add To Cart is an authored label (no link — the prototype's control is a button); the block sends it to the same
product path on www.lenovo.com (dynamic-features rows 5–6).

## C-archetype landing (home page `/`, slug index)

Schema: `stardust/eds-schema/index.json` (its `merchandizingBanner` section is delivered by the header block).
Encoder (prototype → DA rows): `stardust/.work/rollout/landing/encode.py`; editorial media under DA `media/home/`.

| block | tier | authoring shape |
|---|---|---|
| home-hero | reconstructive per slide, template-slotted inside | one row per slide: wordmark img (cell may be empty) / heading (slide 1 `h1`, later `h2`) + body + CTA paragraphs (bold = button, italic = text link) / media img |
| card-grid | reconstructive | variant class `categories / images / icons / rail`; optional head row (heading + desc), then one row per card: img or `:lenovo-icon-<name>:` / heading (linked text = whole-card link) + text (+ plain link paragraph for icon cards) |
| prompt | template-slotted shell, reconstructive rows | bg img row; heading + results-title row; one row per prompt: label / `all` or `desktop` / result img + desc + CTA or control label / `h5` linked item + desc pairs |
| rewards | template-slotted | bg img row; copy cell (title p, body, CTA paragraphs) / benefit `ul`; alpha textures are block-folder SVGs (decorative CSS) |
| stories | template-slotted head, reconstructive tabs | head row (h2 + italic link); one row per story: tab label / title + desc + CTA / quote (h3 eyebrow, quote, h4 name, role) / eyebrow + `ul` (`:lenovo-icon-<name>:` prefixes) / `h5` value + label pairs |

Hero autoplay (5000 ms, progress fill, pause/play) arms on the first visitor interaction: the source, loaded
headless with no interaction, stays on slide 1 for 23 s+ (`stardust/.work/rollout/landing/probe/hero-live.mjs`).

## C-archetype listing (`/us/en/c/desktops/legion-desktops/legion-t-series-towers`)

Schema: `stardust/eds-schema/us-en-c-desktops-legion-desktops-legion-t-series-towers.json` (its
`merchandizingBanner` is delivered by the header block). Encoder: `stardust/.work/rollout/listing/encode.py`;
editorial media under DA `media/legion-t-series-towers/`.

| block | tier | authoring shape |
|---|---|---|
| series-hero | template-slotted | bg img row; breadcrumb `ul` row; cell: logo img (in `p`), `h1` series name, `h2` tagline, desc `p`, CTA `p` (`<strong>` = scroll-to-listing button, link = link CTA) |
| series-blade | template-slotted | variants `is-left/is-right` + `tone-navy/plum/wine`; bg img row; cell: optional logo img, `h2`, desc `p`, optional link CTA `p` |
| product-listing | reconstructive | title `h2` row; one row per facet (name `p` / options `ul`, >3 → 3 + See More); one row per product (img / `h3>a`, rating `p` "4.6 (100)", "Starting at", price, Katapult `p` with "/week", rewards `p` (`em` amount) + Join `p` link + optional popover `ul`, features `ul` last, CTA link `p`) |

D1 (single-column blocks): hero and blades are bespoke full-bleed compositions (image + coloured panel), not
default content. D3 (mixed cell counts in product-listing): one block = title + facets + cards — the facet column
and grid are one layout (side-by-side flex inside a horizontal-scroll wrapper), splitting would break it.
No `h1` on live: the series name is authored `h1` (live `h3.h-name`, same 36/400 style). Live `javascript:void(0)`
openers (Katapult Learn More, Join Now!, Join for free) authored as links to the pages those modals describe.
qa-gate wide pass: build cap 640 (blade panel module) vs DESIGN.json 1440 — matches the listing's measured
cap (cap-probe 640 = 640, capRegister: contentMaxWidth differs per template); all other 27 asserts ok.
