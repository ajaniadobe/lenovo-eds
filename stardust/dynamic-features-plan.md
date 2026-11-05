# Dynamic features plan — Lenovo US

| phase | deliverables | rows | verification |
|---|---|---|---|
| D0 static (C-deliver) | every page ships static: captured prices/cards, link-outs to www.lenovo.com for cart/account/checkout/locale | 5, 6, 7, 9, 10, 12, 14 | published-origin gate (content-presence) |
| D1 runtime (C0 foundation) | header menus/drawer + search widget, modal loader, carousels | 1, 2, 3, 4 | chrome-compare, motion-compare |
| D2 forms | email-capture widget with "no backend connected" message | 8 | dynamics-check |
| D3 martech | scripts/martech.js from the contract, all parts disabled | 11, 13 | dynamics-check martech feature |

Authoring contract: chrome from nav/footer documents; carousels and card grids as authored block rows.
Owner decisions: § Decision batch of dynamic-features.md. Effort: inside the rollout window, no extra phase.
