# C-cluster unit brief (siblings of a template whose archetype is live and gated)

You are a cluster subagent of a stardust replica run (same-design migration of www.lenovo.com to AEM Edge
Delivery Services). Project root /workspace/b3b47bf7. Read AGENTS.md first. Work unattended; never ask.

GOAL: render, deploy (PUBLISH), and gate at 1440 and 360 on the preview origin every SIBLING page listed in
your prompt — and only those. Your template's archetype is already live; its blocks are the proven encoder.

Read first, by section only (`node stardust/scripts/replica/section.mjs <doc> --list`, then one heading):
- stardust/rollout/briefs/archetype-unit.md — the per-page chain steps 2–9 (blocks, content, local
  asserts, link/lint/media passes, commit+push, deploy-batch PUBLISH, gate row on the preview origin with
  the origin pre-capture flags), the FOUNDATION IS FROZEN rule and the HARD RULES. All of it applies to you.
- /home/node/adobe-skills/plugins/stardust/skills/replica/reference/handoff-contract.md § 1 (sibling tier
  rows 1–9) and § 3 bullets on change requests / capture state.

Sibling chain, per template, before the per-page chain:
1. Variance probe once: `node stardust/scripts/replica/sibling-variance.mjs <archetype-live-url>
   <sibling-url>… --probe <block>=<sel> … --width 1440` through run-bg (RUN_BG_SLOTS=1). Exit 0 = clone
   as-is; exit 2 = budget each delta as a block VARIANT class on the sibling's content, never a block fork.
   Keep the JSON in your scratch dir.
2. Render: `node stardust/scripts/migrate/migrate.mjs render <slug…> --archetype <slug>=<archetype-slug>`
   (structural clone, Path A′) → stardust/migrated/…; content-count acceptance against
   stardust/current/pages/<slug>.json (headings, body/list nodes, CTAs+hrefs, images) — any drop is fixed
   or logged, never silent.
3. Encode each sibling as content/<da-path>.html using the archetype's blocks. A section the archetype
   has no block for gets a NEW block (kebab-case, scoped CSS, EW1–EW10), with its fidelity values lifted
   from the live site's CSS (`node stardust/scripts/replica/css-rules.mjs`, `measure.mjs <live> --against
   <preview>`) and the captured page JSON/screenshot under stardust/current/ — clean re-authoring, never
   DOM copies or page-level CSS ports. Never edit another template's blocks except additively behind a
   variant class you own; never edit the archetype's content file.
4. Then steps 3–9 of archetype-unit.md per page (paths file `stardust/rollout/units/<type>-cluster.paths`,
   ledger `stardust/deploy/ledger-<type>.json`). Bar per page: pixel ≤ 10 %, |Δh| ≤ 5 %, clipped 0,
   content MISSING+HIDDEN 0; cap 3 fix rounds per page, then report the residual honestly.
5. `node stardust/scripts/stardust/state.mjs` is NOT yours; the main agent advances state.

REPORT (final message, ≤ 14 lines): line 1 exactly
`<type>-cluster: pages n/n live, blocks k (new j), gate 1440 x% / 360 y% (worst), clip c, missing m, rounds r, requests n`
then one line per page (path, 1440 %/Δh, 360 %/Δh, verdict), new blocks, residuals.
