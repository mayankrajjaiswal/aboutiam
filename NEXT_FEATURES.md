# AboutIAM — Phase 3 Feature Roadmap (Navigation/UX + One-Stop IAM Expansion)

This is the sibling document to `NEXT_FEATURES.md` (the in-progress Phase 1+2 backlog). Phase 3 responds to two explicit asks: (1) more genuinely unique IAM content that isn't a duplicate of anything already shipped or planned, and (2) **smoother site navigation, onboarding, and overall user experience** — since the site has grown past 100 pages, the days of a single flat sidebar and a one-time tour are numbered.

Research for this phase included a crawl of `pqctoday.com` (a comparable niche-education site) — first via `WebFetch`, then via a live Playwright browse of its Home, Command Center, Report, and Playground pages once the browser tool freed up. Most of its persona onboarding, modular learning, timeline, compliance tracker, and playground concepts are already present on AboutIAM in some form. The live crawl surfaced several genuinely new, concrete ideas beyond the first pass: a unified local progress export/import (D1), a persistent site-wide floating AI-assistant launcher (D10), task-based "I want to…" filtering for large tool/playground catalogs (D11), a guided cross-page workflow breadcrumb for the GRC journey (D12), and — most notably — its "Command Center" is a full executive hub built around four board-level questions (risk, deadline, cost, ownership) with dedicated RACI (E9) and Risk Register (E10) builder tools feeding into it, which meaningfully upgrades this document's original, thinner E5 concept.

**Shared conventions:** Every rule in `NEXT_FEATURES.md` §0 ("Cross-Cutting Rules") applies here verbatim — the 7-step new-page checklist (App.tsx / routeMeta.ts / postbuild-ssg.mjs / Sidebar.tsx / sitemap.xml / llms.txt / searchService.ts), the registry+colocated-test pattern for new data arrays, `usePlayground`/`PlaygroundShell`/`TraceTerminal` SDK reuse for simulators, and the README.md/GEMINI.md doc-update obligation per feature. Do not duplicate those rules here.

**Convention for this doc:** same as Phase 1/2 — work top-to-bottom, delete a feature's section once shipped, fold its final description into `README.md`/`GEMINI.md`.

**Duplication check:** every feature below was checked against `README.md`, `GEMINI.md`, and the currently-active items in `NEXT_FEATURES.md` (A1-A8/A10, B3/B4/B11, C3/C4/C5) before inclusion. None overlap.

---

## Group E — New Unique IAM Content Domains

### E4. Cyber-Insurance Identity Readiness Calculator

**One-liner:** An interactive scorer mapping identity controls (phishing-resistant MFA coverage, PAM deployment, Zero Trust/conditional-access posture) to real insurer underwriting criteria, outputting a directional "this posture typically swings premium ±X%" estimate with citations and real denial case studies.

**Why unique:** A dollar-exposure/insurance framing for identity investment doesn't exist anywhere on the site — distinct from the GRC Maturity Wizard (process maturity scoring) and the TCO Calculator (build-vs-buy cost), this is specifically about how identity posture affects a real, external financial outcome (insurance premiums/claim eligibility).

**Where it fits:** New tool at `/tools/cyber-insurance-readiness`, page `Tools/CyberInsuranceReadiness.tsx`, §4E convention. Sidebar: `tools` group, next to the existing TCO Calculator.

**Design:**
- Questionnaire on the specific controls insurers explicitly underwrite against in 2026 (universal phishing-resistant MFA on privileged/remote/email/cloud-admin paths, documented PAM governance, Zero Trust posture) — `src/lib/tools/insuranceReadiness.ts` maps answers to a directional premium-impact estimate and a checklist of gaps.
- Include 2-3 real, citable denial case studies (e.g. well-documented public insurance-denial disputes tied to inadequate MFA/PAM) as cautionary context, clearly sourced.
- Same "directional estimate, not a quote" disclaimer discipline already established for the Salary Compass and TCO Calculator.

**Tests:** `src/lib/tools/insuranceReadiness.test.ts` — the scorer is monotonic (adding a missing control never decreases the readiness score); every cited case study has a real source link.

**Docs to update:** `src/data/toolsRegistry.ts` new entry; `README.md` §C — new bullet in the existing "Program & Vendor Management" grouping; `GEMINI.md` §2 new row.

**Feasibility:** Medium.

---

### E5. Executive Command Center (upgraded from Board Report Generator)

**One-liner:** A dedicated executive hub page organizing the site's existing GRC/program-management tools around four board-level questions — "What's at risk?" (Assess), "What's the deadline?" (Compliance Deadlines), "What will it cost?" (TCO Calculator), "Who owns it?" (the new E9 RACI Builder) — plus a "Generate Board Summary" one-page export using dollar-exposure framing, explicitly surfacing non-human-identity governance as a named 2026 boardroom gap.

**Why unique / revision note:** This supersedes this document's original, thinner concept (a single export mode bolted onto `Assess.tsx`). Live-crawling `pqctoday.com`'s own "Command Center" showed a materially better version of the same idea: a standalone hub page that *reframes and links to* existing tools around the questions an executive actually asks, rather than just reformatting one tool's output. Every existing exec-adjacent artifact (Assess, RFP Generator, TCO Calculator, E4's Insurance Calculator) is technical-buyer-oriented; this is the first genuinely CISO/board-specific *destination* on the site.

**Where it fits:** New route `/command-center`, page `CommandCenter.tsx`. Sidebar: a new top-level entry (not nested under `tools` or `ecosystem`, given its cross-cutting executive-audience purpose — consider a distinct sidebar treatment, e.g. near the top alongside `Home`/`Assess`). Uses the D12 Journey Breadcrumb component to link out to Assess, Compliance Deadlines, TCO Calculator, and (once built) the RACI Builder and Modernization Backlog Game.

**Design:**
- Four large "start here" cards, one per board-level question, each linking directly to the relevant existing page (`/assess`, `/standards?view=deadlines`, `/tools/iam-tco-calculator`, `/tools/raci-builder`) — this page adds no new data collection of its own for those four; it's a curated front door.
- `src/lib/assess/boardSummary.ts` — a "Generate Board Summary" export reusing the existing Assess score/pillar breakdown, reformatted into a one-page narrative (dollar-exposure-style framing per current Gartner board-reporting guidance: risk reduction in relatable financial terms, not raw maturity-level jargon), explicitly calling out NHI/non-human-identity governance as a fixed addendum section regardless of the underlying GRC pillar structure, since it's a named 2026 gap worth surfacing even if no existing pillar maps to it directly.
- Exportable as the same Markdown/print-to-PDF pattern already used by the Dynamic Portfolio Builder.
- A "Density" toggle (inspired by the observed persona-driven density control) tied to the existing `preferenceStore.ts` depth mode (§4P) rather than inventing a second, separate density preference — reuse, don't duplicate.

**Tests:** `src/lib/assess/boardSummary.test.ts` — a low-scoring input produces a summary that names the weakest pillar(s); output is well-formed regardless of score distribution (no divide-by-zero/undefined-pillar edge cases). `CommandCenter.test.tsx` — all four question cards link to real, currently-registered routes.

**Docs to update:** `README.md` — new §A bullet for the Command Center hub, plus amend the GRC Maturity Wizard bullet in §D to mention it now feeds into the hub; `GEMINI.md` §2 — new row for `/command-center`.

**Feasibility:** Medium — mostly composition/linking of existing and E9/E10's new tools, plus the board-summary export logic carried over from the original concept.

---

### E6. Gaming & Esports Identity Playground

**One-liner:** Models account-linking across platforms, smurf/ban-evasion detection via device+behavioral fingerprinting, anti-cheat identity binding ("ban the person, not just the account"), and continuous KYC for real-money wagering platforms.

**Why unique:** A genuinely untouched vertical — every existing lab targets enterprise/workforce/consumer-web identity; gaming/esports identity (cross-platform account linking, anti-cheat identity binding, wagering KYC) is a distinct, real discipline with its own IAM challenges nothing on the site addresses.

**Where it fits:** New playground at `/playground/gaming-identity`, component `GamingIdentityLab.tsx` in `src/pages/Playgrounds/`. Sidebar: `ecosystem` group.

**Design:**
- Scenario 1 — Account linking: a player links a console account, a PC launcher account, and a mobile account into one persistent identity; trace log shows how a ban decision on the underlying identity propagates across all three linked platform accounts (the "ban the person, not the account" pattern).
- Scenario 2 — Smurf/ban-evasion detection: toggle device-fingerprint and behavioral-pattern signals (mouse/input cadence, hardware ID) on a fresh account created shortly after a ban; show the detection system flagging it as a likely evasion attempt with a confidence score.
- Scenario 3 — Wagering KYC: model a continuous (not one-time) identity-verification requirement for a real-money platform, re-triggering verification on risk signals (large withdrawal, new device, geolocation change).

**Data model:** `src/data/gamingIdentityScenarios.ts` — the three scenario definitions with their signal sets and expected outcomes.

**Tests:** `src/data/gamingIdentityScenarios.test.ts` — every scenario's planted signal set produces its documented expected outcome deterministically.

**Docs to update:** `README.md` §B new bullet; `GEMINI.md` §2 new row.

**Feasibility:** Medium.

---

### E7. STIX/TAXII Identity-IOC Fan-Out Simulator

**One-liner:** Models STIX 2.1 object relationships (Indicator → Malware/Identity/Threat-Actor SDOs) and a mock TAXII 2.1 collection/subscription exchange specifically for identity-relevant indicators of compromise (leaked-credential hashes, compromised-token indicators) — teaching the exchange *format and protocol*, not detection logic.

**Why unique:** Distinct from the already-shipped CAEP Event Storm Visualizer (Shared Signals Framework session-state propagation) and the ITDR Lab (SIEM log monitoring/mitigation) — this is specifically about how identity threat intelligence is *structured and exchanged between organizations* (STIX object model, TAXII collections/subscriptions), a format nothing else on the site touches.

**Where it fits:** New playground at `/playground/stix-taxii-ioc`, component `StixTaxiiIocLab.tsx` in `src/pages/Playgrounds/`. Sidebar: `ecosystem` group, next to `ItdrLab`.

**Design:**
- A visual STIX object graph builder: user assembles an `Indicator` SDO (e.g. a leaked-credential hash pattern) and links it via STIX relationship objects to a `Malware`/`Threat-Actor`/`Identity` SDO, seeing the resulting bundle as both a graph and the underlying JSON.
- A mock TAXII exchange: the assembled bundle is "published" to a mock TAXII collection; 2-3 mock subscriber organizations with different subscription filters receive (or correctly don't receive) the bundle based on their filter criteria, visualized as a simple fan-out diagram (reuse rendering conventions from the CAEP Event Storm Visualizer where sensible, since the fan-out shape is conceptually similar even though the payload/protocol is entirely different).

**Data model:** `src/data/stixTaxiiScenarios.ts` — sample STIX object sets and subscriber filter definitions.

**Tests:** `src/data/stixTaxiiScenarios.test.ts` — every scenario's bundle is valid against the minimal STIX object shape the simulator supports; fan-out delivery correctly matches each subscriber's filter.

**Docs to update:** `README.md` §B new bullet; `GEMINI.md` §2 new row.

**Feasibility:** Medium.

---

### Explicitly Rejected from Group E

- **IAM Patent Timeline (à la PQC Today's "Patents" section)** — research found no landmark OAuth/SAML/Kerberos patent *disputes* comparable to PQC's genuinely active, contentious patent landscape; OAuth's real patent story is deliberate *avoidance* (Open Web Foundation non-assert agreements), which is thin, single-fact content better suited to one Encyclopedia glossary entry than a dedicated section or page. **Skip the dedicated section; consider one Encyclopedia entry only.**
- **Full internationalization (i18n)/multi-language support** — real value for global reach, but an open-ended, ongoing translation-maintenance burden (every one of 182 glossary terms, 24 cheat sheets, dozens of playgrounds, etc. would need translation and re-translation on every content update) disproportionate to what a small team can sustain today. **Defer indefinitely; revisit only if content-volume growth meaningfully slows.**

---

## Group F — Interactive Formats, Accessibility & Zero-Backend Growth

### F5. Cryptographic Local Completion Certificate

**One-liner:** Extends the already-shipped Dynamic Portfolio Builder's Open Badges SVG export with a Web Crypto-signed certificate and a small "Verify a Certificate" tool that checks the signature locally via `SubtleCrypto.verify()`.

**Why unique:** Adds a second, independent verification mechanic beyond the existing self-contained Open Badges SVG metadata — but **this feature carries a real, disclosed limitation that must be designed in from the start, not glossed over**: a pure client-side application cannot keep a signing private key secret, since all application code (including any embedded key) ships to and is inspectable in the browser. This means the feature cannot honestly claim to be an "unforgeable" proof of completion — it can only prove *internal self-consistency* (the certificate's claimed contents match its own embedded signature), functioning more like a tamper-evidence checksum than a security guarantee.

**Where it fits:** Extends the existing Portfolio Builder export flow in `InterviewCareerCenter.tsx`/`CommunityHub.tsx`, plus a small new "Verify a Certificate" mini-tool (could live at `/tools/certificate-verifier` following §4E convention, since it's a genuinely standalone, pasteable-input utility).

**Design:**
- On badge/certificate generation, sign a payload (claimed completed modules + timestamp) with an Ed25519 or ECDSA keypair generated once and committed to the repo (the *public* key ships in the app bundle and is also printed on the certificate/QR code for independent verification; the private key is used only at generation time within the user's own browser — it is never transmitted, but it is technically present in the shipped client code, which is the crux limitation above).
- The UI copy on both the certificate and the verifier tool must explicitly state: "This confirms the certificate's contents haven't been altered since AboutIAM generated it in your browser — it is not a substitute for third-party-issued professional certification and should not be represented as one." This disclosure is not optional polish — it is the difference between an honest feature and a misleading one, given the key-custody limitation above.

**Tests:** `src/lib/career/certificateVerifier.test.ts` — a certificate generated by the signing logic verifies successfully; a tampered payload (one field changed) fails verification.

**Docs to update:** `README.md` — amend the existing Dynamic Portfolio Builder bullet to mention the new signed-certificate option, **including the same honest-limitation framing** used in the UI copy; `GEMINI.md` §2 — amend the Career Center row.

**Feasibility:** Medium, with a mandatory honesty caveat in both the design and the shipped UI copy.

---

### F6. Async GitHub-Based Opt-In Leaderboard (Manual-Paste Variant)

**One-liner:** Users who complete the GRC Maturity Wizard, CTF Arena, or a cert mock exam can generate a portable share code (same pattern as the Daily Puzzle's result string) and manually paste it into a public GitHub Discussion thread as an informal, crowdsourced leaderboard.

**Why unique:** Approximates a leaderboard mechanic without any AboutIAM-run backend or scheduled compute.

**Gray-zone flag (must be disclosed in the shipped feature, not just this planning doc):** A fully-automated version of this idea — a GitHub Action that periodically aggregates posted issues/discussion comments into a rebuilt static JSON leaderboard — was explicitly considered and is **not** part of this recommendation, because it requires scheduled compute running against AboutIAM's own repository, which is a meaningfully different admission than "zero AboutIAM-run server" (it's zero-*runtime*-server, but not zero-compute-anywhere). **Only the manual-paste version is recommended here**; if an automated aggregator is wanted later, that should be its own explicit decision with the user, not something built by default under this feature's name.

**Where it fits:** A small "Share your score" button on `Assess.tsx`'s results view, `IdentityCTFArena.tsx`'s scoreboard, and relevant `CertificationHub.tsx` mock-exam results, deep-linking to a pre-filled GitHub Discussion post (same `buildIssueUrl`-style pre-fill pattern already used by `ContentFeedback.tsx`, §4L). A "Browse the community leaderboard →" link points to the live Discussion thread on GitHub itself (not embedded/mirrored on AboutIAM, since a static site can't keep a live mirror in sync without exactly the compute question flagged above).

**Design:**
- Reuse the existing `contentFeedback.ts::buildIssueUrl`-style helper, generalized or duplicated as `buildDiscussionUrl`, pre-filling a structured post (score, module/challenge name, date) into a dedicated GitHub Discussions category.

**Tests:** `src/lib/community/shareScoreUrl.test.ts` — the generated URL correctly encodes the score/module/date into the pre-filled post body.

**Docs to update:** `README.md` — amend the relevant existing bullets (Assess, CTF Arena, Certification Hub) to mention the new share-to-community option, **including the gray-zone note** that this links out to GitHub Discussions rather than running any AboutIAM infrastructure; `GEMINI.md` §4L — add a note that this reuses the `ContentFeedback` pre-filled-URL pattern.

**Feasibility:** Easy (manual-paste version only — do not build the Action-based automated aggregator without a separate explicit go-ahead).

---

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
