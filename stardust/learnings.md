# Learnings — www.lenovo.com replica run (2026-11-03)

### Optimize source-parity compare misses entity-encoded titles
- failure class: false-finding (parity compare on raw entities)
- evidence: F-optimize flagged 3 `seo/title-length` P3 as platform-migration on pages whose `<title>` is identical to the source — the capture encodes `&` as `&amp;`, EDS serves `&#x26;`; autofix-aem then drafted replacement titles from `<h1>` (a content rewrite in a replica run). Resolved `accepted` by hand.
- proposed change: `skills/rollout/scripts/optimize.mjs` `norm()` — decode HTML entities on both sides before the parity compare; `autofix-aem.mjs` — never draft titles in `flow: replica`.
- status: pending

### verify.mjs requests a trailing-slash URL EDS does not serve
- failure class: false-404 (public URL derivation)
- evidence: E-full-site 9/10 — `publicUrl()` appends `/` when the migrated file is `…/index.html`; the Legion Pro 5i document serves at the slashless path (200) and the slash form 404s. Closed by adding trailing-slash redirect rows; `done-check.mjs` (HEAD, redirect manual) still reports those 5 paths `pages_not_live`, and an `inventory.mjs` re-run on a replica roster added 4 duplicate content-pending rows (reverted).
- proposed change: `skills/rollout/scripts/lib.mjs` `publicUrl()` — return the coverage `path` as served by EDS (no trailing slash except `/`), or `skills/rollout/SKILL.md` § D-site — seed slash-variant redirect rows for every delivered page.
- status: pending

### JSON-LD left "manual" although the EDS pipeline renders it from metadata
- failure class: autofix-gap
- evidence: G-aem — 9 P2 `ai-search/jsonld` marked manual; a `json-ld` metadata row carrying the source's `application/ld+json` (blobs flattened into one `@graph`) is rendered by the pipeline as a head `<script type="application/ld+json">`; health 49 → 100 after redeploy.
- proposed change: `skills/rollout/scripts/autofix-aem.mjs` — an `eds-jsonld` fixer that copies the source capture's JSON-LD verbatim into the metadata block when `stardust/current/pages/<slug>.html` carries one.
- status: pending

### No redirects seed without a spec knowledge folder
- failure class: redirect-gap
- evidence: D-site — `seed-redirects.mjs` needs `stardust/spec/knowledge/`; a replica run without a spec has none, and the source's trailing-slash paths plus the root's 301 to `/us/en/` would have 404'd on EDS. The sheet was built from coverage `source.sourceUrl` vs `path`.
- proposed change: `skills/rollout/scripts/seed-redirects.mjs` — fall back to coverage (source URL path → delivered path, plus the source root's Location chain) when the knowledge folder is absent.
- status: pending

### Prototype gate table not written at Phase 4
- failure class: evidence-gap
- evidence: `stardust/replica/gates/prototypes-<w>/` was missing at H-report; written then with `gate-all.mjs --stage prototype` (1440 4/4, 360 2/4 — the residuals recorded at Phase 4).
- proposed change: `skills/replica/SKILL.md` § Phase 4 — make the `recreate end` ledger line refuse (under `--strict`) without both prototype tables.
- status: pending
