# Rollout report — https://www.lenovo.com/ → aem-eds (2026-11-03)

```
rollout — www.lenovo.com → aem-eds (main--b3b47bf7--aemcoder.aem.live)
==================================================
Pages       10 total · 10 verified · 0 deployed · 0 pending · 0 content-pending · 0 stale
Templates   4 (landing 1/1 · campaign 3/3 · listing 3/3 · product 3/3 delivered)
Blocks      27 total · 27 converted (verified live) · 0 pending
Quality     health 100/100 · open P1 0 / P2 0 / P3 0 (3 P3 accepted: source-parity titles; 4 parity informational)
Pixel table prototypes 1440 4/4 PASS · 360 2/4 PASS (pixel-only 3/4) · deployed 1440 10/10 PASS · 360 10/10 PASS
            (9 full PASS + 1 documented source-drift override each; pixel-only 10/10) — gates/{prototypes,all}-<w>/summary.md
To deliver  none
Content     0 pages awaiting content track
```

- Prototype residuals at 360 were recorded at Phase 4 (product 12.89% Δh 53 — the known 51 px pin; campaign 1 clipped
  node on hidden duplicates) and closed at delivery: the published pages pass their gate rows at both widths.
- Override (both widths): `/us/en/d/accessories-and-software/gaming-accessories` — `source-drift`: the live page replaced
  its SEO copy after capture (3 MISSING strings); pixel 1440/360 within bar.
- Site assembly: served sitemap 10 = assembled 10; redirects sheet live (12 rows: `/us/en/` → `/`, trailing-slash
  source paths → delivered paths); `/` 200 on aem.page and aem.live; `/nav`, `/footer` noindex.
- Links: 20 in-scope links localized; internal hrefs 33/33 resolve; 252 links to out-of-scope pages stay on the source
  site (decision in `stardust/direction.md`).
- Structured data: the source JSON-LD (BreadcrumbList, Product) is carried verbatim on the 9 pages that had it.
- Publish: every page, the redirects sheet and nav/footer are live on aem.live (decision in `stardust/eds-conversion-log.md`).

## What's missing

Nothing pending, stale or failed. Owner decisions (the site runs on the interim tier until taken):

## Dynamic parity (stardust/qa/dynamics-report.md — 16/16 replayed checks PASS)

| feature | class | reach | status | owner decision | replayed check |
|---|---|---|---|---|---|
| header mega-menu, utility bar, mobile drawer | M | 10/10 | done | — | dom-count ×2 PASS |
| loyalty / price popovers | M | 4 | interim | Lenovo Pro store popup wanted on the new host? | dom-count PASS |
| header search | S | 10/10 | interim | search datasource (suggest API host-bound); submits to www.lenovo.com search | dom-count PASS |
| home hero rotation, Legion sliders | CR | 10/10 | done | — | dom-count ×2 PASS; rotation arms on first input, as live |
| Legion hero video | V | 1 | done | — | video-plays PASS (15 playback requests < 400) |
| prices, models, spec APIs | A | 6/10 | interim | product/price feed (snapshot 2026-11-02) | dom-count PASS |
| cart, account, payments, Pro store | X | 10/10 | interim | auth + commerce on the new host (links to www.lenovo.com) | — |
| listing facets + card controls | F | 3/10 | interim | product feed | dom-count PASS |
| footer email sign-up | F | 10/10 | interim | ESP endpoint (Bluecore) | dom-count PASS |
| locale selector | I18N | 10/10 | interim | locale scope | dom-count PASS |
| runtime-injected embed | V | 4 | interim | confirm the embed | — |
| martech (Launch, Analytics/ECID, mPulse, pixels) | T/A | 10/10 | scaffolded-awaiting-owner | enable routes + consent model (`stardust/martech-handoff.md`) | martech gate ×3 PASS (no tag host while disabled) |
| data layers | A | 10/10 | interim | rides on martech | — |
| identity APIs | A | 10/10 | scaffolded-awaiting-owner | identity endpoints on the new host | — |
| header/footer fragments | A | 10/10 | done | — | dom-count PASS |
| page errors | — | 10/10 | done | — | no-page-errors PASS |
