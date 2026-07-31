# AboutIAM — Phase 3 Feature Roadmap (Navigation/UX + One-Stop IAM Expansion)

This is the sibling document to `NEXT_FEATURES.md` (the in-progress Phase 1+2 backlog). Phase 3 responds to two explicit asks: (1) more genuinely unique IAM content that isn't a duplicate of anything already shipped or planned, and (2) **smoother site navigation, onboarding, and overall user experience** — since the site has grown past 100 pages, the days of a single flat sidebar and a one-time tour are numbered.

Research for this phase included a crawl of `pqctoday.com` (a comparable niche-education site) — first via `WebFetch`, then via a live Playwright browse of its Home, Command Center, Report, and Playground pages once the browser tool freed up. Most of its persona onboarding, modular learning, timeline, compliance tracker, and playground concepts are already present on AboutIAM in some form. The live crawl surfaced several genuinely new, concrete ideas beyond the first pass: a unified local progress export/import (D1), a persistent site-wide floating AI-assistant launcher (D10), task-based "I want to…" filtering for large tool/playground catalogs (D11), a guided cross-page workflow breadcrumb for the GRC journey (D12), and — most notably — its "Command Center" is a full executive hub built around four board-level questions (risk, deadline, cost, ownership) with dedicated RACI (E9) and Risk Register (E10) builder tools feeding into it, which meaningfully upgrades this document's original, thinner E5 concept.

**Shared conventions:** Every rule in `NEXT_FEATURES.md` §0 ("Cross-Cutting Rules") applies here verbatim — the 7-step new-page checklist (App.tsx / routeMeta.ts / postbuild-ssg.mjs / Sidebar.tsx / sitemap.xml / llms.txt / searchService.ts), the registry+colocated-test pattern for new data arrays, `usePlayground`/`PlaygroundShell`/`TraceTerminal` SDK reuse for simulators, and the README.md/GEMINI.md doc-update obligation per feature. Do not duplicate those rules here.

**Convention for this doc:** same as Phase 1/2 — work top-to-bottom, delete a feature's section once shipped, fold its final description into `README.md`/`GEMINI.md`.

**Duplication check:** every feature below was checked against `README.md`, `GEMINI.md`, and the currently-active items in `NEXT_FEATURES.md` (A1-A8/A10, B3/B4/B11, C3/C4/C5) before inclusion. None overlap.

---

## Group E — New Unique IAM Content Domains

### Explicitly Rejected from Group E

- **IAM Patent Timeline (à la PQC Today's "Patents" section)** — research found no landmark OAuth/SAML/Kerberos patent *disputes* comparable to PQC's genuinely active, contentious patent landscape; OAuth's real patent story is deliberate *avoidance* (Open Web Foundation non-assert agreements), which is thin, single-fact content better suited to one Encyclopedia glossary entry than a dedicated section or page. **Skip the dedicated section; consider one Encyclopedia entry only.**
- **Full internationalization (i18n)/multi-language support** — real value for global reach, but an open-ended, ongoing translation-maintenance burden (every one of 182 glossary terms, 24 cheat sheets, dozens of playgrounds, etc. would need translation and re-translation on every content update) disproportionate to what a small team can sustain today. **Defer indefinitely; revisit only if content-volume growth meaningfully slows.**

---

## Group F — Interactive Formats, Accessibility & Zero-Backend Growth

### F7. GitHub Discussions Comments (giscus)

**One-liner:** Adds threaded comments to Encyclopedia terms, Standards Explorer entries, and Security Bulletins via giscus, which stores comments as GitHub Discussions with no AboutIAM-run server involved.

**Gray-zone flag (values decision, not just a technical one — surface this explicitly to the user before building, do not just implement it):** This is architecturally consistent with the already-accepted Google Drive Backup precedent (the browser talks directly to a third party — GitHub, in this case — with no AboutIAM server ever in the loop, exactly as README §29 already describes for Drive sync). However, unlike Drive sync, this is **user-facing and visible to every visitor**, requires commenters to have a GitHub account (a real access barrier some visitors won't clear), and makes AboutIAM's comment sections dependent on GitHub's uptime/ToS in a way that's more consequential than an optional personal backup feature. **Recommend confirming with the user that this level of third-party dependency for a core, visible feature (not an opt-in personal utility like Drive Backup) is acceptable before implementing** — this plan documents it as researched and ready, not as a decided/approved build.

**Where it fits:** If approved, a shared `src/components/GiscusComments.tsx` wrapper around the giscus embed script, wired into `Encyclopedia.tsx` term detail views, `StandardsExplorer.tsx` entries, and `SecurityBulletins.tsx` entries — following the same "opt-in, clearly disclosed, inert until configured" pattern already established for Google Drive Backup (giscus requires its own GitHub App installation/repo configuration, analogous to `VITE_GOOGLE_CLIENT_ID`).

**Tests:** Minimal — mostly a third-party embed; a smoke test confirming the wrapper renders its container div and doesn't crash when the giscus script fails to load (network-blocked environments, CI, etc.) is the main thing worth testing.

**Docs to update:** If built: `README.md` new bullet with the same privacy-disclosure rigor as the Google Drive Backup bullet; a new `.env.example` entry for the giscus repo/category configuration, following the existing `VITE_GOOGLE_CLIENT_ID` pattern exactly.

**Feasibility:** Easy technically — **pending an explicit product decision from the user first**, since it's the first *visible, default-facing* feature (not an opt-in personal utility) that depends on a third-party service.

---

### F8. Newsletter/Community Links (RSS-to-Email + Existing Channels)

**One-liner:** Points the already-shipped `/rss.xml` at a free RSS-to-email bridge (e.g. Buttondown's free tier) so visitors can subscribe to new tools/CVEs/architectures by email, paired with a static GitHub Sponsors button and a Discord/Slack community link.

**Gray-zone flag:** Same category as F7 — relies on a free third-party service (an RSS-to-email provider) rather than AboutIAM running any mail infrastructure, which is consistent with the site's zero-backend ethos but is worth a one-line disclosure on whichever page hosts the signup link, same transparency standard as everywhere else third-party services are used.

**Where it fits:** A small "Stay Updated" section, likely on `Contributors.tsx` (which already hosts contact/community-adjacent content) or the Header's existing RSS button area — a link out to the chosen RSS-to-email provider's subscribe page, plus static GitHub Sponsors and Discord/Slack links if the maintainer wants to set those up (this plan does not assume those community channels already exist — confirm with the user before adding dead links for channels that don't exist yet).

**Design:** Purely a set of outbound links and a short explanatory paragraph — no new component logic beyond a static content block.

**Tests:** None needed beyond the existing page-smoke-test coverage (§4AA) that already asserts every page renders without crashing.

**Docs to update:** `README.md` §A — new bullet describing the update channels available, with the gray-zone disclosure; `GEMINI.md` — a one-line note near the RSS Feed Engine description (§H) pointing to the new email-subscribe option.

**Feasibility:** Easy — confirm actual community channel URLs (Discord/Slack/Sponsors) exist or are wanted before implementation, since this plan can't invent them.

---

### Explicitly Rejected from Group F

- **Service-Worker "real inbound webhook/SCIM callback receiver"** (accepting live traffic from an external, real SCIM client or OAuth app pointed at a locally-generated URL) — as literally described, this structurally requires a backend: a Service Worker can only intercept requests originating from pages under its own registered scope/origin, it cannot receive traffic an external server sends to a public URL without something else forwarding that traffic in, which is real server infrastructure. **Skip entirely as described.** The legitimately client-side-only version of this idea is exactly what the existing `SCIMLab.tsx` already does (simulate the receiver side with mock data) — no new feature needed here, just confirmation that the existing lab already covers the honest version of this idea.

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
- Before F7/F8 ship, confirm with the user: (a) whether visible, default-facing third-party dependencies are acceptable for a platform whose core pitch is "Zero Backend, Complete Privacy," and (b) whether real Discord/Slack/Sponsors channels exist to link to.
- Re-run the accessibility hardening sweep (`NEXT_FEATURES.md`'s B11) against any new interactive components this phase adds (D3's wizard, D6's bottom nav, D8's sidebar filter) — they're exactly the kind of new interactive surface that sweep exists to catch.
