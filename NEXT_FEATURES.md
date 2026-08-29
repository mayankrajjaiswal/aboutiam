# AboutIAM — Phase 3 Feature Roadmap (Navigation/UX + One-Stop IAM Expansion)

This is the sibling document to `NEXT_FEATURES.md` (the in-progress Phase 1+2 backlog). Phase 3 responds to two explicit asks: (1) more genuinely unique IAM content that isn't a duplicate of anything already shipped or planned, and (2) **smoother site navigation, onboarding, and overall user experience** — since the site has grown past 100 pages, the days of a single flat sidebar and a one-time tour are numbered.

Research for this phase included a crawl of `pqctoday.com` (a comparable niche-education site) — first via `WebFetch`, then via a live Playwright browse of its Home, Command Center, Report, and Playground pages once the browser tool freed up. Most of its persona onboarding, modular learning, timeline, compliance tracker, and playground concepts are already present on AboutIAM in some form. The live crawl surfaced several genuinely new, concrete ideas beyond the first pass: a unified local progress export/import (D1), a persistent site-wide floating AI-assistant launcher (D10), task-based "I want to…" filtering for large tool/playground catalogs (D11), a guided cross-page workflow breadcrumb for the GRC journey (D12), and — most notably — its "Command Center" is a full executive hub built around four board-level questions (risk, deadline, cost, ownership) with dedicated RACI (E9) and Risk Register (E10) builder tools feeding into it, which meaningfully upgrades this document's original, thinner E5 concept.

**Shared conventions:** Every rule in `NEXT_FEATURES.md` §0 ("Cross-Cutting Rules") applies here verbatim — the 7-step new-page checklist (App.tsx / routeMeta.ts / postbuild-ssg.mjs / Sidebar.tsx / sitemap.xml / llms.txt / searchService.ts), the registry+colocated-test pattern for new data arrays, `usePlayground`/`PlaygroundShell`/`TraceTerminal` SDK reuse for simulators, and the README.md/GEMINI.md doc-update obligation per feature. Do not duplicate those rules here.

**Convention for this doc:** same as Phase 1/2 — work top-to-bottom, delete a feature's section once shipped, fold its final description into `README.md`/`GEMINI.md`.

**Duplication check:** every feature below was checked against `README.md`, `GEMINI.md`, and the currently-active items in `NEXT_FEATURES.md` (A1-A8/A10, B3/B4/B11, C3/C4/C5) before inclusion. None overlap.

---

## Group E — New Unique IAM Content Domains

### Deployed & Shipped from Group E

- **✓ IAM Patent Timeline (à la PQC Today's "Patents" section)** — **COMPLETED & SHIPPED!** Integrated as a high-fidelity interactive timeline tab (`?tab=patents`) inside `src/pages/IdentityTimeline.tsx` backed by `src/data/patentTimelineData.ts` and indexed in the global search index, providing invaluable patent-history lessons on RSA, Kerberos, Samba, and OWF covenants.
- **Full internationalization (i18n)/multi-language support** — real value for global reach, but an open-ended, ongoing translation-maintenance burden (every one of 182 glossary terms, 24 cheat sheets, dozens of playgrounds, etc. would need translation and re-translation on every content update) disproportionate to what a small team can sustain today. **Defer indefinitely; revisit only if content-volume growth meaningfully slows.**

---

## Group F — Interactive Formats, Accessibility & Zero-Backend Growth

### Deployed & Shipped from Group F

- **✓ F8. Newsletter/Community Links (RSS-to-Email + Existing Channels)** — **COMPLETED & SHIPPED!** Integrated a secure, client-side Follow.it RSS-to-email subscription box and prominent, stylish community link badges inside `Home.tsx` and `Contributors.tsx`, leveraging the automated RSS generation.

---

## Suggested Execution Order

Phase 3 has no shipped items yet — suggested order, weighted toward cheapest/highest-value first and toward the user's explicit "smooth navigation" ask:

1. **F4** — Fact/Analogy of the Day (very easy, near-zero marginal cost, reuses shipped Daily Puzzle infrastructure).
2. **D1** — Export/Import My AboutIAM Profile (easy, directly closes the PQC Today-inspired gap).
3. **D2** — Continue Where You Left Off (easy, high retention value).
4. **D7** — Command Palette Recent + Popular (easy, small but real navigation win).
5. **D12** — Executive Journey Workflow Breadcrumb (easy, pure static data — do this early since D12/E5/E9/E10 all reference each other and it's cheapest to land first).
6. **D5** — Contextual Coach Marks (easy, complements the existing Guided Tour without replacing it).
7. **F2** — Dyslexia/Colorblind Toggles (easy, meaningful accessibility win, extends the existing Personalize control).
8. **D9** — Keyboard Shortcuts Cheat Sheet + Chorded Nav (easy-medium).
9. **D4** — Related Content Rail (easy-medium, pure reuse of existing Knowledge Graph data).
10. **D11** — Task-Based "I Want To…" Catalog Filter (easy-medium, tag newest entries first, backfill incrementally).
11. **F1** — Incident Commander Narrative Simulator (easy, reuses existing Bulletins data).
12. **F3** — IAM Field Guide PDF Export (easy-medium, sibling to shipped Offline Study Pack).
13. **E1, E3, E8** — Hall of Fame, Wallet/mDL Tracker, Open Source Pathways Guide (all easy, independent, parallelizable).
14. **E9, E10** — RACI Builder, Risk Register Builder (easy/easy-medium, build before E5 since the Command Center hub links to both).
15. **E2** — FIDO Certification Explainer (easy-medium).
16. **D3** — Goal-Based Start Here Wizard (medium).
17. **D10** — Persistent Floating Assistant Launcher (medium — extract the shared chat component carefully so the full page and floating launcher never drift).
18. **D8** — Sidebar Two-Tier Grouping (medium, do this once several Phase 2/3 pages have landed and the sidebar groups have visibly grown).
19. **D6** — Mobile Bottom Tab Bar (medium).
20. **E4** — Cyber-Insurance Calculator (medium).
21. **E5** — Executive Command Center hub (medium — build last among the E5/E9/E10/D12 cluster since it links to all of them).
22. **E6, E7** — Gaming Identity Playground, STIX/TAXII Simulator (medium, independent, parallelizable).
23. **F5** — Cryptographic Completion Certificate (medium — build the honesty-caveat copy alongside the code, not after).
24. **F6** — Async GitHub Leaderboard, manual-paste only (easy, but sequence after confirming actual community appetite exists).
25. **F7, F8** — Giscus Comments, Newsletter/Community Links (easy technically — **both require an explicit go/no-go conversation with the user first**, since they're the first default-facing features depending on third-party services; do not build without that confirmation).

## Final Wrap-Up (after Phase 3 ships)

- Run `npm run test` and `npm run lint` — zero new warnings.
- Re-verify `routeRegistrySync.test.ts` and `searchService.test.ts` both pass for every new route/registry/tab added in this phase.
- Cross-check that no Phase 3 route/tool/tab slug collided with an existing one across `NEXT_FEATURES.md`'s remaining Phase 1/2 items as those ship concurrently.
- Sweep every new page/component for the mobile-overflow issues called out in `GEMINI.md` §4E step 5 — especially D6's bottom nav and D8's sidebar changes, which touch mobile layout directly.
- F7/F8 go/no-go resolved: F7 (giscus) approved and shipped; F8 (newsletter/community links) declined since no real channels exist yet — see "Explicitly Rejected from Group F".
- Re-run the accessibility hardening sweep (`NEXT_FEATURES.md`'s B11) against any new interactive components this phase adds (D3's wizard, D6's bottom nav, D8's sidebar filter) — they're exactly the kind of new interactive surface that sweep exists to catch.
