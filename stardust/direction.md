---
_provenance:
  writtenBy: stardust:replica
  writtenAt: 2026-11-02T22:01:55Z
  againstInput: https://www.lenovo.com/
  readArtifacts:
    - stardust/current/PRODUCT.md
    - stardust/current/DESIGN.md
    - stardust/current/DESIGN.json
---

# Direction — preserve mode (same-design migration)

Mode: PRESERVE. The target spec is the captured current state of https://www.lenovo.com/,
promoted verbatim (no direct invocation, no creative decisions).

Promoted: current/PRODUCT.md → PRODUCT.md · current/DESIGN.md → DESIGN.md ·
current/DESIGN.json → DESIGN.json (at 2026-11-02T22:01:55Z).

Permitted deltas: ONLY the entries of stardust/replica/inconsistency-register.md
(empty — pure replica).

Fidelity: ia verbatim · design verbatim · content verbatim.

Scope: the 10 pages of stardust/.labs/site-plan.json; gate breakpoints 1440 (desktop) and 360 (mobile).

## Link-audit decision — out-of-scope targets stay on the source site (2026-11-03, rollout E2)

The run's page scope is fixed at 10 pages (`stardust/.labs/site-plan.json`). Every internal target outside it is
SCOPE EXTENSION and stays an absolute link to https://www.lenovo.com (252 kept links, 241 distinct targets, e.g.
/us/en/rewards ×65, /us/en/landingpage/lenovo-financing-options ×36, /us/en/business/benefits ×12, /us/en/laptops ×9).
No capture gaps: every in-scope target is delivered and linked root-relative (20 links localized). No captured page
was repointed.
